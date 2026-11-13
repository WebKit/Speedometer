// Every handler, timer and network callback runs through guard(), which keeps a stack
// of named contexts, so an error or a slow callback can be attributed to the feature
// that ran it.

const contextStack = [];
const SLOW_CALLBACK_MS = 50;
let reporter = null;

export function setGuardReporter(report) {
    reporter = report;
}

export function currentContext() {
    return contextStack.length ? contextStack[contextStack.length - 1] : "root";
}

export function guard(name, callback, ...args) {
    contextStack.push(name);
    const start = performance.now();
    try {
        return callback(...args);
    } catch (error) {
        if (reporter) {
            reporter("js_error", {
                context: contextStack.join(">"),
                message: String(error && error.message),
                stack: String(error && error.stack)
                    .split("\n")
                    .slice(0, 6)
                    .join("\n"),
            });
        }
        throw error;
    } finally {
        const duration = performance.now() - start;
        contextStack.pop();
        if (duration > SLOW_CALLBACK_MS && reporter)
            reporter("slow_callback", { context: name, duration: Math.round(duration) });
    }
}

export function guarded(name, callback) {
    return function guardedCallback(...args) {
        return guard(name, callback, ...args);
    };
}
