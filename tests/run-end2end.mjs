#! /usr/bin/env node
/* eslint-disable-next-line  no-unused-vars */
import assert from "assert";
import { driver, PORT, stop } from "./helper.mjs";

import { Suites } from "../resources/tests.mjs";

async function testPage(url) {
    console.log(`Testing: ${url}`);
    await driver.get(`http://localhost:${PORT}/${url}`);
    await driver.executeAsyncScript((callback) => {
        if (globalThis.benchmarkClient)
            callback();
        else
            window.addEventListener("SpeedometerReady", () => callback(), { once: true });
    });
    console.log("    - Awaiting Benchmark");
    const metrics = await driver.executeAsyncScript((callback) => {
        window.addEventListener("SpeedometerDone", () => callback(globalThis.benchmarkClient.metrics));
        globalThis.benchmarkClient.start();
    });
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
    const metrics = await testPage("index.html?iterationCount=3");
    Suites.forEach((suite) => {
        if (!suite.disabled) {
            const metric = metrics[suite.name];
            assert(metric.values.length === 3);
        }
    });
    assert(metrics.Geomean.values.length === 3);
    assert(metrics.Score.values.length === 3);
}

async function testAll() {
    const metrics = await testPage("index.html?iterationCount=1&tags=all");
    Suites.forEach((suite) => {
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
    Suites.forEach((suite) => {
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
