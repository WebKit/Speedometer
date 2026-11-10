// A normalized client cache. Every response object that carries an id becomes a record,
// nested objects are replaced by { __ref } links, and components subscribe to the
// individual records they read, so an update only re-renders what it touched.

import { log } from "../analytics/logger.js";

const records = new Map();
const subscribers = new Map();
let pendingIds = new Set();

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

export function subscribe(id, callback) {
    let set = subscribers.get(id);
    if (!set) {
        set = new Set();
        subscribers.set(id, set);
    }
    set.add(callback);
    return () => {
        set.delete(callback);
        if (!set.size)
            subscribers.delete(id);
    };
}

export function publish() {
    if (!pendingIds.size)
        return;
    const changed = pendingIds;
    pendingIds = new Set();
    let notified = 0;
    for (const id of changed) {
        const set = subscribers.get(id);
        if (!set)
            continue;
        for (const callback of set) {
            callback();
            notified++;
        }
    }
    log("store_publish", { changed: changed.size, notified });
}

export function storeSize() {
    return records.size;
}
