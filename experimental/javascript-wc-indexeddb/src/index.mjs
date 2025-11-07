import { BenchmarkConnector } from "/node_modules/speedometer-utils/benchmark.mjs";
import suites, { appName, appVersion } from "/src/workload-test.mjs";

window.workloadPromises = {};
window.workloadPromises.addPromise = new Promise((resolve) => {
    window.addEventListener("db-add-completed", () => resolve());
});
window.workloadPromises.togglePromise = new Promise((resolve) => {
    window.addEventListener("db-toggle-completed", () => resolve());
});
window.workloadPromises.deletePromise = new Promise((resolve) => {
    window.addEventListener("db-delete-completed", () => resolve());
});

window.addEventListener("db-ready", () => {
    /*
    Paste below into dev console for manual testing:
    window.addEventListener("message", (event) => console.log(event.data));
    window.postMessage({ id: "todomvc-postmessage-1.0.0", key: "benchmark-connector", type: "benchmark-suite", name: "default" }, "*");
    */
    const benchmarkConnector = new BenchmarkConnector(suites, appName, appVersion);
    benchmarkConnector.connect();
});
