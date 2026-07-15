#! /usr/bin/env node

import assert from "assert";
import testSetup from "./helper.mjs";

const HELP = `
This script runs the unittests located in tests/unittests/*
through the mocha web interface located at tests/index.html
`.trim();

const { driver, PORT, stop } = await testSetup(HELP);

async function test() {
    try {
        await driver.get(`http://localhost:${PORT}/tests/index.html`);

        const { testResults, stats } = await driver.executeAsyncScript(function (callback) {
            const returnResults = () =>
                callback({
                    stats: globalThis.testRunner.stats,
                    testResults: globalThis.testResults,
                });
            if (window.testResults)
                returnResults();
            else
                globalThis.addEventListener("test-complete", returnResults, { once: true });
        });

        printTree(testResults);

        console.log("\nChecking for passed tests...");
        assert(stats.passes > 0);
        console.log("Checking for failed tests...");
        assert(stats.failures === 0);
    } finally {
        console.log("\nTests complete!");
        stop();
    }
}

function printTree(node) {
    console.log(node.title);

    for (const test of node.tests) {
        console.group();
        if (test.state === "passed") {
            console.log("\x1b[32m✓", `\x1b[0m${test.title}`);
        } else {
            console.log("\x1b[31m✖", `\x1b[0m${test.title}`);
            console.group();
            console.log(`\x1b[31m${test.error.name}: ${test.error.message}`);
            console.groupEnd();
        }
        console.groupEnd();
    }

    for (const suite of node.suites) {
        console.group();
        printTree(suite);
        console.groupEnd();
    }
}

setImmediate(test);
