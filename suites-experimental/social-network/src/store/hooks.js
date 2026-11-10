import { useCallback, useSyncExternalStore } from "react";
import { getRecord, subscribe } from "./store.js";
import { queryStatusId } from "./network.js";

function noopSubscribe() {
    return () => {};
}

export function useRecord(id) {
    const subscribeToRecord = useCallback((callback) => id ? subscribe(id, callback) : noopSubscribe(), [id]);
    const read = useCallback(() => id ? getRecord(id) : undefined, [id]);
    return useSyncExternalStore(subscribeToRecord, read);
}

export function useLinkedRecord(ref) {
    return useRecord(ref ? ref.__ref : null);
}

export function useQueryStatus(key) {
    return useRecord(key ? queryStatusId(key) : null);
}
