import { completeInteraction } from "./analytics/perf.js";

// Fired once an interaction's result has committed. The benchmark steps wait on these
// window events, and the interaction trace of the same name completes here too.
export function signal(name) {
    completeInteraction(name);
    window.dispatchEvent(new Event(name));
}
