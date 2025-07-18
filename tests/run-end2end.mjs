#! /usr/bin/env node

import assert from "assert";
import testSetup from "./helper.mjs";
import { benchmarkConfigurator } from "../resources/benchmark-configurator.mjs";

const HELP = `
This script runs end2end tests by invoking the benchmark via the main
Speedometer page in /index.html.
`.trim();

const { driver, PORT, stop } = await testSetup(HELP);

const suites = benchmarkConfigurator.suites;

async function testPage(url) {
    console.log(`Testing: ${url}`);
    await driver.get(`http://localhost:${PORT}/${url}`);

    await driver.executeAsyncScript((callback) => {
        if (globalThis.benchmarkClient)
            callback();
        else
            globalThis.addEventListener("SpeedometerReady", () => callback(), { once: true });
    });

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
        globalThis.addEventListener("error", (message, source, lineno, colno, error) =>
            callback({
                error: { message, source, lineno, colno, error },
            })
        );
        globalThis.addEventListener("unhandledrejection", (e) => {
            callback({
                error: {
                    message: e.reason.toString(),
                    stack: e.reason?.stack,
                },
            });
        });
        globalThis.benchmarkClient.start();
    });

    if (error)
        throw new Error(error.message + (error?.stack ?? ""));

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

async function test() {
    try {
        await driver.manage().setTimeouts({ script: 60000 });
        await testIterations();
        await testAll();
        await testDeveloperMode();
        console.log("\nTests complete!");
    } catch (e) {
        console.error("\nTests failed!");
        throw e;
    } finally {
        stop();
    }
}

setImmediate(test);
