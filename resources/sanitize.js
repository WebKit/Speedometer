// Make sure all workloads run with the same removed APIs.

// This hack allows to capture the work normally happening in a rAF. We
// may be able to remove it if the runner improves.
window.requestAnimationFrame = (cb) => window.setTimeout(cb, 0);
window.cancelAnimationFrame = window.clearTimeout;

// Only allow setTimeout(cn, 0) for consistency and running the risk of
// accidental CPU throttling.
const setTimeout = window.setTimeout;
window.setTimeout = function (handler, timeout) {
    if (timeout)
        console.warn(`Artificially reducing setTimeout from ${timeout}ms to 0ms`);
    setTimeout(handler, 0);
};

// Don't support requestIdleCallback on any browser.
window.requestIdleCallback = () => console.warn("Ignoring requestIdleCallback");
window.cancelIdleCallback = () => console.warn("Ignoring cancelIdleCallback");

// Use a common userAgent string to minimize risk of running unfair
// browser-specific code in workloads.
Object.defineProperty(navigator, "userAgent", {
    get() {
        return "Firefox Safari Chrome";
    }
});

