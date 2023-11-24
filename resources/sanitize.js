// This hack allows to capture the work normally happening in a rAF. We
// may be able to remove it if the runner improves.
window.requestAnimationFrame = (cb) => window.setTimeout(cb, 0);
window.cancelAnimationFrame = window.clearTimeout;

// Only allow setTimeout(cn, 0) for consistency.
const setTimeout = window.setTimeout;
window.setTimeout = function (handler, timeout) {
    setTimeout(handler, 0);
};

// Don't support requestIdleCallback on any browser.
window.requestIdleCallback = undefined;
window.cancelIdleCallback = undefined;

// Use a common userAgent string to minimize risk of running unfair 
// browser-specific code in workloads.
navigator.userAgent = "Firefox Safari Chrome";

