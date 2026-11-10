// First-party event logging. Events are enriched with session context, queued, ordered,
// and flushed in batches: serialized, compressed, checksummed and handed to a transport
// that would normally beacon them to a collector.

import { compressToString, crc32 } from "./compress.js";
import { currentContext, guard, setGuardReporter } from "./guard.js";

const BATCH_SIZE = 24;
const OUTBOX_LIMIT = 40;
const SCHEMA_VERSION = 3;

// Chatty events are sampled deterministically by count, so runs stay reproducible.
const SAMPLE_EVERY = {
    key_activity: 4,
    scroll_depth: 2,
    store_publish: 8,
};

const state = {
    seq: 0,
    queue: [],
    outbox: [],
    pendingAcks: new Map(),
    sampleCounters: new Map(),
    flushScheduled: false,
    context: null,
    route: "unknown",
    bytesSent: 0,
    batches: 0,
};

const encoder = new TextEncoder();
const ackChannel = new MessageChannel();
ackChannel.port1.onmessage = (event) => guard("logger.ack", acknowledge, event.data);

export function initLogger({ userId, sessionSeed }) {
    const zone = Intl.DateTimeFormat().resolvedOptions();
    state.context = {
        app: "commons-web",
        build: "2026.04.18-r812",
        user_id: userId,
        session_id: `s${sessionSeed.toString(36)}`,
        locale: navigator.language,
        time_zone: zone.timeZone,
        platform: navigator.platform,
        user_agent: navigator.userAgent,
        device_pixel_ratio: window.devicePixelRatio,
        connection: navigator.connection ? navigator.connection.effectiveType : "unknown",
    };
    setGuardReporter(log);
    log("session_start", { referrer: document.referrer ? new URL(document.referrer).origin : "" });
}

export function setLoggerRoute(route) {
    state.route = route;
}

function sampled(name) {
    const every = SAMPLE_EVERY[name];
    if (!every)
        return true;
    const count = (state.sampleCounters.get(name) ?? 0) + 1;
    state.sampleCounters.set(name, count);
    return count % every === 0;
}

export function log(name, props = {}) {
    if (!sampled(name))
        return;
    state.queue.push({ name, seq: ++state.seq, time: Math.round(performance.now() * 100) / 100, route: state.route, context: currentContext(), props });
    if (state.queue.length >= BATCH_SIZE)
        scheduleFlush();
}

function scheduleFlush() {
    if (state.flushScheduled)
        return;
    state.flushScheduled = true;
    queueMicrotask(() => guard("logger.flush", flush, "batch"));
}

function onOrBefore(a, b) {
    return a.time - b.time || a.seq - b.seq;
}

export function flush(reason) {
    state.flushScheduled = false;
    if (!state.queue.length)
        return;
    const events = state.queue;
    state.queue = [];
    events.sort(onOrBefore);
    const envelope = {
        schema: SCHEMA_VERSION,
        reason,
        sent_at: Math.round(performance.now()),
        context: {
            ...state.context,
            viewport: [window.innerWidth, window.innerHeight],
            visibility: document.visibilityState,
            route: state.route,
        },
        counts: summarize(events),
        events,
    };
    const json = JSON.stringify(envelope);
    const body = compressToString(json);
    send({
        url: "/ajax/log/batch",
        method: "POST",
        headers: {
            "content-type": "text/plain;charset=UTF-8",
            "x-log-checksum": crc32(body).toString(16),
            "x-log-range": `${events[0].seq}-${events[events.length - 1].seq}`,
            "x-log-raw-length": String(json.length),
        },
        body,
    });
}

function summarize(events) {
    const counts = {};
    for (const event of events)
        counts[event.name] = (counts[event.name] ?? 0) + 1;
    return counts;
}

function send(request) {
    const bytes = encoder.encode(request.body);
    const id = ++state.batches;
    state.bytesSent += bytes.byteLength;
    state.outbox.push({ id, request, bytes: bytes.byteLength });
    if (state.outbox.length > OUTBOX_LIMIT)
        state.outbox.shift();
    state.pendingAcks.set(id, request.headers["x-log-checksum"]);
    ackChannel.port2.postMessage({ id, checksum: request.headers["x-log-checksum"] });
}

function acknowledge({ id, checksum }) {
    if (state.pendingAcks.get(id) === checksum)
        state.pendingAcks.delete(id);
}

export function loggerStats() {
    return { batches: state.batches, bytesSent: state.bytesSent, queued: state.queue.length, pending: state.pendingAcks.size };
}
