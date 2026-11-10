// Interaction timing with User Timing marks: a trace begins in the event handler and
// completes when the component that finishes the interaction commits.

import { log } from "./logger.js";

const active = new Map();
let traceId = 0;

export function beginInteraction(name, props = {}) {
    const id = ++traceId;
    const mark = `ix:${name}:${id}`;
    performance.mark(`${mark}:start`);
    active.set(name, { id, mark, props, start: performance.now() });
    log("interaction_start", { interaction: name, trace: id, ...props });
}

export function completeInteraction(name) {
    const trace = active.get(name);
    if (!trace)
        return;
    active.delete(name);
    performance.mark(`${trace.mark}:end`);
    performance.measure(trace.mark, `${trace.mark}:start`, `${trace.mark}:end`);
    const duration = performance.now() - trace.start;
    performance.clearMarks(`${trace.mark}:start`);
    performance.clearMarks(`${trace.mark}:end`);
    performance.clearMeasures(trace.mark);
    log("interaction_complete", { interaction: name, trace: trace.id, duration: Math.round(duration * 10) / 10, ...trace.props });
}
