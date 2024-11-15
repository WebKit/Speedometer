// Using versions later than @web/dev-server 0.4.3 causes a live reload loop of ~5 iterations.
export default {
    open: true,
    nodeResolve: true,
    watch: false,
    appIndex: "/dist/index.html",
};
