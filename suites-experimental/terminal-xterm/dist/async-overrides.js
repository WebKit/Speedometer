/**
 * Universal Async API Overrides for Deterministic Benchmark Timing
 *
 * This script runs synchronously before any other scripts or bundles load.
 * It overrides window.setTimeout, clearTimeout, requestAnimationFrame,
 * cancelAnimationFrame, requestIdleCallback, cancelIdleCallback, createImageBitmap,
 * and DOM Observers (ResizeObserver, IntersectionObserver, MutationObserver) to
 * eliminate macro-task delays, HTML5 timer clamping, and framerate dependencies.
 */

// Track active timers, GPU bitmap promises, and DOM observers globally
// so step completion can exhaustively await them.
window.__activeTimers = new Set();
window.__activeBitmaps = new Set();
window.__activeObservers = new Set();

// 1. Asynchronous GPU Texture Generation (createImageBitmap)
// Override createImageBitmap so @xterm/addon-canvas never performs background
// GPU texture generation tasks or IPC. By resolving immediately with the offline
// canvas itself (and attaching a dummy close() method), @xterm/addon-canvas
// draws 100% synchronously from the offline texture atlas canvas without any
// asynchronous delays or deferred callbacks.
window.createImageBitmap = (canvas) => {
    return Promise.resolve(Object.assign(canvas, { close: () => {} }));
};

// 2. DOM Observers (ResizeObserver, IntersectionObserver, MutationObserver)
const trackObserver = (ObserverClass) => {
    if (!ObserverClass)
        return ObserverClass;
    return class extends ObserverClass {
        constructor(callback) {
            super((entries, observer) => {
                window.__activeObservers.add(observer);
                try {
                    callback(entries, observer);
                } finally {
                    window.__activeObservers.delete(observer);
                }
            });
        }
    };
};
window.ResizeObserver = trackObserver(window.ResizeObserver);
window.IntersectionObserver = trackObserver(window.IntersectionObserver);
window.MutationObserver = trackObserver(window.MutationObserver);

const origSetTimeout = window.setTimeout.bind(window);
const origClearTimeout = window.clearTimeout.bind(window);

// 3. Timers (setTimeout, clearTimeout)
// Always compress delays to 0 ms using native origSetTimeout(..., 0) so
// debounced rendering passes and callbacks interleave cleanly with Speedometer's
// -Async measurement scheduler (AsyncRAFStepScheduler).
window.setTimeout = (cb, delay, ...args) => {
    const id = origSetTimeout(() => {
        window.__activeTimers.delete(id);
        if (typeof cb === "function")
            cb(...args);
        else if (typeof cb === "string")
            eval(cb);

    }, 0);
    window.__activeTimers.add(id);
    return id;
};

window.clearTimeout = (id) => {
    window.__activeTimers.delete(id);
    origClearTimeout(id);
};

// 4. Idle Callbacks (requestIdleCallback, cancelIdleCallback)
window.requestIdleCallback = (cb) => {
    const start = Date.now();
    return window.setTimeout(() => {
        cb({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 10000 - (Date.now() - start)),
        });
    }, 0);
};

window.cancelIdleCallback = (id) => {
    window.clearTimeout(id);
};

// 5. Animation Frames (requestAnimationFrame, cancelAnimationFrame)
// Globally override requestAnimationFrame to setTimeout(cb, 0) so all animation
// frame callbacks execute as 0 ms timers, aligning cleanly with Speedometer's
// -Async measurement window.
window.requestAnimationFrame = (cb) => {
    return window.setTimeout(() => cb(performance.now()), 0);
};

window.cancelAnimationFrame = (id) => {
    window.clearTimeout(id);
};
