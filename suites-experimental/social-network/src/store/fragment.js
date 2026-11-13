// Fragments: every component declares the fields it reads, and reads them through a
// selection walk over the normalized store. A component only sees its own fields; the
// records it renders children for come back as masked references that the child reads
// with its own fragment. Each read remembers the records it touched, and a publish
// re-reads every subscription that touched a changed record, keeping the identity of
// any part of the result that did not change.

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { getRecord, retain, storeEpoch, subscribeSnapshot } from "./store.js";

const SPREAD = "...";
const fragments = new Map();

/**
 * `selections` maps each field to `true` for a scalar (or an opaque object, such as rich
 * text ranges), or to nested selections for a linked record, a list of them, or an inline
 * object. `spread(...)` masks a record for child fragments.
 */
export function fragment(name, selections) {
    const node = { name, selections };
    fragments.set(name, node);
    return node;
}

export function spread(...fragments) {
    return { [SPREAD]: fragments.map((item) => item.name) };
}

// `scalars("id name")` is `{ id: true, name: true }`.
export function scalars(names) {
    const selections = {};
    for (const name of names.split(" "))
        selections[name] = true;
    return selections;
}

function readObject(source, selections, seen) {
    const data = {};
    for (const key in selections) {
        const selection = selections[key];
        if (key === SPREAD) {
            data.__id = source.id;
            data.__fragments = selection;
            continue;
        }
        const value = source[key];
        if (selection === true || value === null || value === undefined)
            data[key] = value;
        else if (Array.isArray(value))
            data[key] = value.map((item) => readLinked(item, selection, seen));
        else
            data[key] = readLinked(value, selection, seen);
    }
    return data;
}

function readLinked(value, selections, seen) {
    if (value === null || value === undefined)
        return value;
    if (value.__ref !== undefined) {
        seen.add(value.__ref);
        const record = getRecord(value.__ref);
        return record === undefined ? undefined : readObject(record, selections, seen);
    }
    return readObject(value, selections, seen);
}

export function readFragment(fragmentNode, id, seen = new Set()) {
    if (id === null || id === undefined)
        return null;
    seen.add(id);
    const record = getRecord(id);
    return record === undefined ? undefined : readObject(record, fragmentNode.selections, seen);
}

function checkSelections(source, selections, state) {
    for (const key in selections) {
        const selection = selections[key];
        if (key === SPREAD) {
            for (const name of selection)
                checkSelections(source, fragments.get(name).selections, state);
            continue;
        }
        state.fields++;
        const value = source[key];
        if (value === undefined)
            state.missing++;
        else if (selection !== true && value !== null && Array.isArray(value))
            value.forEach((item) => checkLinked(item, selection, state));
        else if (selection !== true && value !== null)
            checkLinked(value, selection, state);
    }
}

function checkLinked(value, selections, state) {
    if (value.__ref === undefined) {
        checkSelections(value, selections, state);
        return;
    }
    const record = getRecord(value.__ref);
    if (record === undefined) {
        state.missing++;
        return;
    }
    state.records++;
    checkSelections(record, selections, state);
}

/**
 * Walks `fragmentNode` over the store from `id`, into every child fragment it spreads,
 * and counts the fields it finds and the ones that are missing.
 */
export function checkFragment(fragmentNode, id) {
    const state = { records: 0, fields: 0, missing: 0 };
    checkLinked({ __ref: id }, fragmentNode.selections, state);
    return state;
}

/**
 * Returns `prev` where `next` is deeply equal to it, and otherwise `next` with every
 * unchanged subtree swapped for the one in `prev`, so memoized children keep bailing out.
 */
export function recycleNodesInto(prev, next) {
    if (prev === next || typeof prev !== "object" || typeof next !== "object" || prev === null || next === null)
        return next;
    const prevArray = Array.isArray(prev);
    if (prevArray !== Array.isArray(next))
        return next;
    let equal = true;
    if (prevArray) {
        const length = next.length;
        equal = prev.length === length;
        for (let i = 0; i < length; i++) {
            const recycled = recycleNodesInto(prev[i], next[i]);
            if (recycled !== next[i])
                next[i] = recycled;
            if (recycled !== prev[i])
                equal = false;
        }
        return equal ? prev : next;
    }
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    equal = prevKeys.length === nextKeys.length;
    for (const key of nextKeys) {
        const recycled = recycleNodesInto(prev[key], next[key]);
        if (recycled !== next[key])
            next[key] = recycled;
        if (recycled !== prev[key])
            equal = false;
    }
    return equal ? prev : next;
}

function refId(ref) {
    if (ref === null || ref === undefined)
        return null;
    if (typeof ref === "string")
        return ref;
    return ref.__id ?? ref.__ref ?? null;
}

class FragmentSubscription {
    constructor(fragmentNode, id) {
        this.fragment = fragmentNode;
        this.id = id;
        this.listener = null;
        this.read();
    }

    read() {
        this.seen = new Set();
        this.epoch = storeEpoch();
        const next = readFragment(this.fragment, this.id, this.seen);
        const recycled = recycleNodesInto(this.data, next);
        const changed = recycled !== this.data;
        this.data = recycled;
        return changed;
    }

    // Called from publish for subscriptions that read a changed record.
    refresh() {
        if (this.read() && this.listener)
            this.listener();
    }

    subscribe = (listener) => {
        this.listener = listener;
        // Anything published between render and subscribe shows up through getData.
        if (this.epoch !== storeEpoch())
            this.read();
        const unsubscribe = subscribeSnapshot(this);
        return () => {
            this.listener = null;
            unsubscribe();
        };
    };

    getData = () => this.data;
}

export function useFragment(fragmentNode, ref) {
    const id = refId(ref);
    const holder = useRef(null);
    let subscription = holder.current;
    if (!subscription || subscription.id !== id || subscription.fragment !== fragmentNode) {
        subscription = new FragmentSubscription(fragmentNode, id);
        holder.current = subscription;
    }
    const subscribe = useCallback((listener) => subscription.subscribe(listener), [subscription]);
    return useSyncExternalStore(subscribe, subscription.getData);
}

// Retains a query's root record for as long as the component that loaded it is mounted.
export function useRetain(id) {
    useEffect(() => id ? retain(id) : undefined, [id]);
}
