// This hack allows to capture the work normally happening in a rAF. We
// may be able to remove it if the runner improves.
window.requestAnimationFrame = (cb) => window.setTimeout(cb, 0);
window.cancelAnimationFrame = window.clearTimeout;
const setTimeout = window.setTimeout;
window.setTimeout = function (handler, timeout) {
    setTimeout(handler, 0);
};

window.requestIdleCallback = function (callback) {};
window.cancelIdleCallback = function (id) {};
