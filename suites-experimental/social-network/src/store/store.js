// A normalized client cache. Every response object that carries an id becomes a record,
// nested objects are replaced by { __ref } links, and components read records through
// fragment subscriptions (see fragment.js), so an update only re-renders what it touched.
// Records live as long as something retains them: retained roots, recently released ones
// kept in a small buffer, and whatever mounted components read. Anything else is
// collected once enough roots have been released.

import { log } from "../analytics/logger.js";

const RELEASE_BUFFER_SIZE = 4;

const records = new Map();
const snapshotSubscriptions = new Set();
const retainCounts = new Map();
const releaseBuffer = [];
let pendingIds = new Set();
let epoch = 0;
let gcScheduled = false;

function isRecordLike(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) && typeof value.id === "string" && typeof value.__typename === "string";
}

function shallowEqual(a, b) {
    if (a === b)
        return true;
    if (!a || !b || typeof a !== "object" || typeof b !== "object")
        return false;
    if (Array.isArray(a) !== Array.isArray(b))
        return false;
    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length)
        return false;
    for (const key of keysA) {
        const left = a[key];
        const right = b[key];
        if (left === right)
            continue;
        if (left && right && left.__ref !== undefined && left.__ref === right.__ref)
            continue;
        return false;
    }
    return true;
}

function normalizeValue(value) {
    if (Array.isArray(value))
        return value.map(normalizeValue);
    if (isRecordLike(value)) {
        writeRecord(value);
        return { __ref: value.id };
    }
    if (value !== null && typeof value === "object") {
        const result = {};
        for (const key in value)
            result[key] = normalizeValue(value[key]);
        return result;
    }
    return value;
}

// Copy-on-write, so a subscriber's snapshot only changes identity when its record does.
function writeRecord(source) {
    const existing = records.get(source.id);
    let next = existing;
    for (const key in source) {
        const value = normalizeValue(source[key]);
        const current = next ? next[key] : undefined;
        if (current === value || shallowEqual(current, value))
            continue;
        if (next === existing)
            next = existing ? { ...existing } : {};
        next[key] = value;
    }
    if (next !== existing) {
        records.set(source.id, next);
        pendingIds.add(source.id);
    }
}

export function normalize(payload) {
    return normalizeValue(payload);
}

export function getRecord(id) {
    return records.get(id);
}

export function setClientRecord(id, fields) {
    const existing = records.get(id);
    const next = existing ? { ...existing, ...fields } : { id, ...fields };
    records.set(id, next);
    pendingIds.add(id);
}

export function updateRecord(id, update) {
    const existing = records.get(id);
    if (!existing)
        return;
    records.set(id, { ...existing, ...update(existing) });
    pendingIds.add(id);
}

// Fragment subscriptions, re-read on publish when they touched a changed record.
export function subscribeSnapshot(subscription) {
    snapshotSubscriptions.add(subscription);
    return () => snapshotSubscriptions.delete(subscription);
}

export function storeEpoch() {
    return epoch;
}

function overlaps(seen, changed) {
    for (const id of changed) {
        if (seen.has(id))
            return true;
    }

    return false;
}

export function publish() {
    if (!pendingIds.size)
        return;
    const changed = pendingIds;
    pendingIds = new Set();
    epoch++;
    let refreshed = 0;
    for (const subscription of snapshotSubscriptions) {
        if (overlaps(subscription.seen, changed)) {
            subscription.refresh();
            refreshed++;
        }
    }
    log("store_publish", { changed: changed.size, refreshed, subscriptions: snapshotSubscriptions.size });
}

/**
 * Keeps the record `id`, and every record reachable from it, out of garbage collection
 * until the returned function is called.
 */
export function retain(id) {
    retainCounts.set(id, (retainCounts.get(id) ?? 0) + 1);
    const buffered = releaseBuffer.indexOf(id);
    if (buffered !== -1)
        releaseBuffer.splice(buffered, 1);
    let disposed = false;
    return () => {
        if (disposed)
            return;
        disposed = true;
        release(id);
    };
}

function release(id) {
    const count = retainCounts.get(id) - 1;
    if (count > 0) {
        retainCounts.set(id, count);
        return;
    }
    retainCounts.delete(id);
    releaseBuffer.push(id);
    if (releaseBuffer.length > RELEASE_BUFFER_SIZE) {
        releaseBuffer.shift();
        scheduleGC();
    }
}

function scheduleGC() {
    if (gcScheduled)
        return;
    gcScheduled = true;
    queueMicrotask(collectGarbage);
}

function markValue(value, stack) {
    if (value === null || typeof value !== "object")
        return;
    if (Array.isArray(value)) {
        for (const item of value)
            markValue(item, stack);
        return;
    }
    if (value.__ref !== undefined) {
        stack.push(value.__ref);
        return;
    }
    for (const key in value)
        markValue(value[key], stack);
}

function collectGarbage() {
    gcScheduled = false;
    const start = performance.now();
    const stack = [...retainCounts.keys(), ...releaseBuffer];
    for (const subscription of snapshotSubscriptions) {
        for (const id of subscription.seen)
            stack.push(id);
    }

    for (const id of records.keys()) {
        if (id.startsWith("client:draft:"))
            stack.push(id);
    }

    const marked = new Set();
    while (stack.length) {
        const id = stack.pop();
        if (marked.has(id))
            continue;
        marked.add(id);
        const record = records.get(id);
        if (record)
            markValue(record, stack);
    }
    let collected = 0;
    for (const id of records.keys()) {
        if (!marked.has(id)) {
            records.delete(id);
            collected++;
        }
    }
    log("store_gc", { marked: marked.size, collected, remaining: records.size, duration: Math.round((performance.now() - start) * 100) / 100 });
}
