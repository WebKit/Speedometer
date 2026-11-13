#! /usr/bin/env node

import assert from "assert";
import testSetup, { DEFAULT_RETRIES } from "./helper.mjs";
import { benchmarkConfigurator } from "../resources/benchmark-configurator.mjs";

const HELP = `
This script runs end2end tests by invoking the benchmark via the main
Speedometer page in /index.html.
`.trim();

const { driver, port, stop, retry } = await testSetup(HELP);

const suites = benchmarkConfigurator.suites;

async function testPage(url) {
    console.log(`Testing: ${url}`);
    await driver.get(`http://localhost:${port}/${url}`);

    const initResult = await driver.executeAsyncScript((callback) => {
        if (globalThis.benchmarkClient?.isInitialized) {
            callback({});
            return;
        }
        if (globalThis.benchmarkClient?.hasFinished?.()) {
            callback({
                error: {
                    message: document.getElementById("invalid-score-text")?.textContent || "Benchmark failed during initialization",
                },
            });
            return;
        }
        globalThis.addEventListener("SpeedometerReady", () => callback({}), { once: true });
        globalThis.addEventListener("error", (event) => {
            callback({
                error: {
                    message: event.message || "Unknown Runtime Error",
                    source: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack,
                },
            });
        });
        globalThis.addEventListener("unhandledrejection", (e) => {
            const reason = e.reason;
            const message = reason instanceof Error ? reason.message : typeof reason === "object" && reason !== null ? JSON.stringify(reason) : String(reason);
            callback({
                error: {
                    message: `Unhandled Rejection: ${message}`,
                    stack: reason?.stack,
                },
            });
        });
    });

    if (initResult?.error) {
        const { error } = initResult;
        const stackTrace = error.stack ? `\nBrowser Stack Trace:\n${error.stack}` : "";
        const location = error.source ? ` at ${error.source}:${error.lineno}:${error.colno}` : "";
        throw new Error(`${error.message}${location}${stackTrace}`);
    }

    console.log("    - Awaiting Benchmark");
    const { error, metrics } = await driver.executeAsyncScript((callback) => {
        globalThis.addEventListener(
            "SpeedometerDone",
            () =>
                callback({
                    metrics: globalThis.benchmarkClient.metrics,
                }),
            { once: true }
        );
        // Install error handlers to report page errors back to selenium.
        globalThis.addEventListener("error", (event) => {
            callback({
                error: {
                    message: event.message || "Unknown Runtime Error",
                    source: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack,
                },
            });
        });
        globalThis.addEventListener("unhandledrejection", (e) => {
            const reason = e.reason;
            const message = reason instanceof Error ? reason.message : typeof reason === "object" && reason !== null ? JSON.stringify(reason) : String(reason);
            callback({
                error: {
                    message: `Unhandled Rejection: ${message}`,
                    stack: reason?.stack,
                },
            });
        });
        globalThis.benchmarkClient.start();
    });

    if (error) {
        const stackTrace = error.stack ? `\nBrowser Stack Trace:\n${error.stack}` : "";
        const location = error.source ? ` at ${error.source}:${error.lineno}:${error.colno}` : "";
        throw new Error(`${error.message}${location}${stackTrace}`);
    }

    validateMetrics(metrics);
    return metrics;
}

function validateMetrics(metrics) {
    for (const [name, metric] of Object.entries(metrics))
        validateMetric(name, metric);

    assert(metrics.Geomean.mean > 0);
    assert(metrics.Score.mean > 0);
}

function validateMetric(name, metric) {
    assert(metric.name === name);
    assert(metric.mean >= 0);
}

async function testIterations() {
    const iterationCount = 2;
    const metrics = await testPage(`index.html?iterationCount=${iterationCount}`);
    suites.forEach((suite) => {
        if (suite.enabled) {
            const metric = metrics[suite.name];
            assert(metric, `Missing suite result for ${suite.name}`);
            assert(metric.values.length === iterationCount);
        } else {
            assert(!(suite.name in metrics));
        }
    });
    assert(metrics.Geomean.values.length === iterationCount);
    assert(metrics.Score.values.length === iterationCount);
}

async function testAll() {
    const metrics = await testPage("index.html?iterationCount=1&tags=all");
    suites.forEach((suite) => {
        assert(suite.name in metrics);
        const metric = metrics[suite.name];
        assert(metric.values.length === 1);
    });
    assert(metrics.Geomean.values.length === 1);
    assert(metrics.Score.values.length === 1);
}

async function testPreloadEnabled() {
    const metrics = await testPage("index.html?iterationCount=1&suites=Perf-Dashboard&preload=true");
    assert("Perf-Dashboard" in metrics);
    assert(metrics["Perf-Dashboard"].values.length === 1);
}

async function testPreloadDisabled() {
    const metrics = await testPage("index.html?iterationCount=1&suites=Perf-Dashboard&preload=false");
    assert("Perf-Dashboard" in metrics);
    assert(metrics["Perf-Dashboard"].values.length === 1);
}

async function testDeveloperMode() {
    const params = ["developerMode", "iterationCount=1", "warmupBeforeSync=2", "waitBeforeSync=2", "shuffleSeed=123", "suites=Perf-Dashboard"];
    const metrics = await testPage(`index.html?${params.join("&")}`);
    suites.forEach((suite) => {
        if (suite.name === "Perf-Dashboard") {
            const metric = metrics[suite.name];
            assert(metric.values.length === 1);
        } else {
            assert(!(suite.name in metrics));
        }
    });
}

async function testDeveloperModePreload() {
    const url = "index.html?developerMode=true&iterationCount=1&suites=Perf-Dashboard";
    console.log(`Testing: ${url} (enabling preload via Developer Mode checkbox)`);
    await driver.get(`http://localhost:${port}/${url}`);

    const initResult = await driver.executeAsyncScript((callback) => {
        if (globalThis.benchmarkClient?.isInitialized) {
            callback({});
            return;
        }
        globalThis.addEventListener("SpeedometerReady", () => callback({}), { once: true });
        globalThis.addEventListener("error", (event) => {
            callback({ error: { message: event.message || "Unknown Runtime Error", stack: event.error?.stack } });
        });
        globalThis.addEventListener("unhandledrejection", (e) => {
            const reason = e.reason;
            callback({ error: { message: `Unhandled Rejection: ${reason?.message || String(reason)}`, stack: reason?.stack } });
        });
    });

    if (initResult?.error)
        throw new Error(`${initResult.error.message}${initResult.error.stack ? `\n${initResult.error.stack}` : ""}`);

    console.log("    - Toggling preload checkbox and awaiting Benchmark");
    const result = await driver.executeAsyncScript((callback) => {
        const labels = Array.from(document.querySelectorAll(".developer-mode label"));
        const preloadLabel = labels.find((label) => label.textContent.includes("Use service worker for resource preloading"));
        const preloadCheckbox = preloadLabel?.querySelector('input[type="checkbox"]');
        if (!preloadCheckbox || preloadCheckbox.checked) {
            callback({ error: { message: `Unexpected initial preload checkbox state: ${preloadCheckbox?.checked}` } });
            return;
        }

        const preloadProgressEl = document.getElementById("preload-progress");
        const preloadInfoEl = document.getElementById("preload-info");
        const initialProgressHidden = getComputedStyle(preloadProgressEl).display === "none" && getComputedStyle(preloadInfoEl).display === "none";

        preloadCheckbox.click();
        if (!preloadCheckbox.checked || !window.location.search.includes("preload=true")) {
            callback({ error: { message: `Preload checkbox click did not update state or URL: checked=${preloadCheckbox.checked}, search=${window.location.search}` } });
            return;
        }

        const seenStates = [];
        let preloadProgressVisibleDuringPreload = false;
        let startButtonDisabledDuringPreload = false;
        const observer = new MutationObserver(() => {
            const state = document.body.getAttribute("data-benchmark-state");
            seenStates.push(state);
            if (state === "PRELOADING") {
                preloadProgressVisibleDuringPreload = getComputedStyle(preloadProgressEl).display !== "none" && getComputedStyle(preloadInfoEl).display !== "none";
                startButtonDisabledDuringPreload = document.querySelector(".start-tests-button")?.disabled === true;
            }
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ["data-benchmark-state"] });

        let preloadResult = null;
        const preloader = globalThis.benchmarkClient._resourcePreloader;
        const origPreloadSuites = preloader.preloadSuites.bind(preloader);
        preloader.preloadSuites = async (...args) => {
            preloadResult = await origPreloadSuites(...args);
            return preloadResult;
        };

        globalThis.addEventListener(
            "SpeedometerDone",
            () => {
                observer.disconnect();
                const preloadProgressHiddenAfterDone = getComputedStyle(preloadProgressEl).display === "none" && getComputedStyle(preloadInfoEl).display === "none";
                callback({
                    metrics: globalThis.benchmarkClient.metrics,
                    initialProgressHidden,
                    seenStates,
                    preloadProgressVisibleDuringPreload,
                    startButtonDisabledDuringPreload,
                    preloadProgressHiddenAfterDone,
                    preloadResult,
                });
            },
            { once: true }
        );
        globalThis.addEventListener("error", (event) => {
            observer.disconnect();
            callback({ error: { message: event.message || "Unknown Runtime Error", stack: event.error?.stack } });
        });
        globalThis.addEventListener("unhandledrejection", (e) => {
            observer.disconnect();
            const reason = e.reason;
            callback({ error: { message: `Unhandled Rejection: ${reason?.message || String(reason)}`, stack: reason?.stack } });
        });

        globalThis.benchmarkClient.start();
    });

    if (result?.error)
        throw new Error(`${result.error.message}${result.error.stack ? `\n${result.error.stack}` : ""}`);

    assert(result.initialProgressHidden, "Expected #preload-progress and #preload-info to be hidden before preloading");
    assert(result.seenStates.includes("PRELOADING"), `Expected PRELOADING state, saw: ${result.seenStates.join(", ")}`);
    assert(result.preloadProgressVisibleDuringPreload, "Expected #preload-progress and #preload-info to be visible during PRELOADING");
    assert(result.startButtonDisabledDuringPreload, "Expected .start-tests-button to be disabled during PRELOADING");
    assert(result.preloadProgressHiddenAfterDone, "Expected #preload-progress and #preload-info to be hidden after DONE");
    assert(result.preloadResult?.status === "PRELOAD_DONE" && result.preloadResult?.count > 0, "Expected Service Worker preloadSuites to finish with PRELOAD_DONE");

    validateMetrics(result.metrics);
    assert("Perf-Dashboard" in result.metrics);
    assert(result.metrics["Perf-Dashboard"].values.length === 1);
}

async function test() {
    try {
        await testWithRetries(retry);
    } finally {
        stop();
    }
}

const RETRY_DELAY_MS = 3000;
async function testWithRetries(retries = DEFAULT_RETRIES) {
    const maxAttempts = retries + 1;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await tryTests();
            return;
        } catch (e) {
            console.error(`\nTests failed on attempt ${attempt}!`);
            if (attempt === maxAttempts)
                throw e;

            console.log(`Retrying... (${attempt}/${maxAttempts})`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
}

async function tryTests() {
    await driver.manage().setTimeouts({ script: 60000 });
    await testIterations();
    await testAll();
    await testPreloadEnabled();
    await testPreloadDisabled();
    await testDeveloperMode();
    await testDeveloperModePreload();
    console.log("\nTests complete!");
}

setImmediate(test);
