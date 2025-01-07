#! /usr/bin/env node
/* eslint-disable-next-line  no-unused-vars */
import assert from "assert";
import { driver, PORT, stop } from "./helper.mjs";

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
                window.addEventListener("test-complete", returnResults, { once: true });
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

setImmediate(test);
