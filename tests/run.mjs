#! /usr/bin/env node
/* eslint-disable-next-line  no-unused-vars */
import serve from "./server.mjs";
import { Builder, Capabilities } from "selenium-webdriver";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import assert from "assert";

const optionDefinitions = [
    { name: "browser", type: String, description: "Set the browser to test, choices are [safari, firefox, chrome]. By default the $BROWSER env variable is used." },
    { name: "port", type: Number, defaultValue: 8010, description: "Set the test-server port, The default value is 8010." },
    { name: "help", alias: "h", description: "Print this help text." },
];

function printHelp(message = "") {
    const usage = commandLineUsage([
        {
            header: "Run all tests",
        },
        {
            header: "Options",
            optionList: optionDefinitions,
        },
    ]);
    if (!message) {
        console.log(usage);
        process.exit(0);
    } else {
        console.error(message);
        console.error();
        console.error(usage);
        process.exit(1);
    }
}

const options = commandLineArgs(optionDefinitions);

if ("help" in options)
    printHelp();

const BROWSER = options?.browser;
if (!BROWSER)
    printHelp("No browser specified, use $BROWSER or --browser");

let capabilities;
switch (BROWSER) {
    case "safari":
        capabilities = Capabilities.safari();
        break;

    case "firefox": {
        capabilities = Capabilities.firefox();
        break;
    }
    case "chrome": {
        capabilities = Capabilities.chrome();
        break;
    }
    case "edge": {
        capabilities = Capabilities.edge();
        break;
    }
    default: {
        printHelp(`Invalid browser "${BROWSER}", choices are: "safari", "firefox", "chrome", "edge"`);
    }
}

const PORT = options.port;
const server = serve(PORT);

let driver;

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
    driver = await new Builder().withCapabilities(capabilities).build();
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
        driver.quit();
        server.close();
    }
}

process.on("unhandledRejection", (err) => {
    console.error(err);
    process.exit(1);
});
process.once("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
});

setImmediate(test);
