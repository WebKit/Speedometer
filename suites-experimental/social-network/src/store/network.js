// Query execution. Each response arrives as a stream of JSON chunks, one task apiece,
// and every chunk is parsed, normalized into the store and published before the next.

import { respond } from "../data/server.js";
import { guard } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { normalize, publish, setClientRecord, getRecord } from "./store.js";

const wire = new MessageChannel();
const deliveries = [];
wire.port1.onmessage = () => {
    const delivery = deliveries.shift();
    delivery();
};

function deliver(callback) {
    deliveries.push(callback);
    wire.port2.postMessage(0);
}

let requestId = 0;

export function queryKey(name, variables) {
    return `${name}(${variables ? JSON.stringify(variables) : ""})`;
}

export function queryStatusId(key) {
    return `client:query:${key}`;
}

/**
 * Runs a query and resolves once every chunk is in the store.
 * `apply(root, last)` runs after each chunk is normalized, for queries whose results land
 * on a client-side record, such as a connection being paginated.
 */
export function fetchQuery(name, variables, { apply, key = queryKey(name, variables) } = {}) {
    const id = ++requestId;
    const statusId = queryStatusId(key);
    const markName = `q:${name}:${id}`;
    performance.mark(`${markName}:start`);
    setClientRecord(statusId, { status: "loading", requestId: id, root: null });
    publish();
    log("query_start", { query: name, request: id });

    const chunks = respond(name, variables);
    let cancelled = false;
    let bytes = 0;
    let firstRoot = null;

    const promise = new Promise((resolve) => {
        chunks.forEach((text, index) => {
            deliver(() =>
                guard(`network.${name}`, () => {
                    if (cancelled)
                        return;
                    bytes += text.length;
                    const payload = JSON.parse(text);
                    const root = payload.data ? normalize(payload.data) : null;
                    if (root && !firstRoot)
                        firstRoot = root;
                    if (payload.incremental) {
                        for (const part of payload.incremental)
                            normalize(part.data);
                    }

                    const last = index === chunks.length - 1;
                    if (apply)
                        apply(root, last);
                    setClientRecord(statusId, { status: last ? "ready" : "loading", requestId: id, root: firstRoot });
                    publish();
                    if (last) {
                        performance.mark(`${markName}:end`);
                        performance.measure(markName, `${markName}:start`, `${markName}:end`);
                        const entries = performance.getEntriesByName(markName, "measure");
                        const duration = entries.length ? entries[entries.length - 1].duration : 0;
                        performance.clearMarks(`${markName}:start`);
                        performance.clearMarks(`${markName}:end`);
                        performance.clearMeasures(markName);
                        log("query_complete", { query: name, request: id, chunks: chunks.length, bytes, duration: Math.round(duration * 10) / 10 });
                        resolve(root);
                    }
                })
            );
        });
    });
    return {
        promise,
        cancel() {
            cancelled = true;
            log("query_cancelled", { query: name, request: id });
        },
    };
}

const inflight = new Map();

// Shares one request between every caller that asks for the same query.
export function loadQuery(name, variables, options) {
    const key = options?.key ?? queryKey(name, variables);
    const status = getRecord(queryStatusId(key));
    if (status && status.status === "ready" && !options?.force)
        return Promise.resolve(status.root);
    let request = inflight.get(key);
    if (!request) {
        request = fetchQuery(name, variables, { ...options, key });
        inflight.set(key, request);
        request.promise.then(() => inflight.delete(key));
    }
    return request.promise;
}
