import { TestRunner } from "./test-runner.mjs";
import { Params } from "./params.mjs";

/**
 * BenchmarkTestStep
 *
 * A single test step, with a common interface to interact with.
 */
export class BenchmarkTestStep {
    constructor(name, run) {
        this.name = name;
        this.run = run;
    }

    async runAndRecord(params, suite, test, callback) {
        const testRunner = new TestRunner(null, null, params, suite, test, callback);
        const result = await testRunner.runTest();
        return result;
    }
}

/**
 * BenchmarkTestSuite
 *
 * A single test suite that contains one or more test steps.
 */
export class BenchmarkTestSuite {
    constructor(name, tests) {
        this.name = name;
        this.tests = tests;
    }

    record(_test, syncTime, asyncTime) {
        const total = syncTime + asyncTime;
        const results = {
            tests: { Sync: syncTime, Async: asyncTime },
            total: total,
        };

        return results;
    }

    async runAndRecord(params, onProgress) {
        const measuredValues = {
            tests: {},
            total: 0,
        };
        const suiteStartLabel = `suite-${this.name}-start`;
        const suiteEndLabel = `suite-${this.name}-end`;

        performance.mark(suiteStartLabel);

        for (const test of this.tests) {
            const result = await test.runAndRecord(params, this, test, this.record);
            measuredValues.tests[test.name] = result;
            measuredValues.total += result.total;
            onProgress?.(test.name);
        }

        performance.mark(suiteEndLabel);
        performance.measure(`suite-${this.name}`, suiteStartLabel, suiteEndLabel);

        return {
            type: "suite-tests-complete",
            status: "success",
            result: measuredValues,
            suitename: this.name,
        };
    }
}

/**
 * BenchmarkSuitesManager
 *
 * A collection of test suites for a single workload.
 */
export class BenchmarkSuitesManager {
    constructor(name, suites) {
        this.name = name;
        this.suites = suites;
    }

    getSuiteByName(name) {
        return this.suites.find((suite) => suite.name === name);
    }
}

/**
 * Helper Methods
 *
 * Various methods that are extracted from the Page class.
 */
export function getParent(lookupStartNode, path) {
    lookupStartNode = lookupStartNode.shadowRoot ?? lookupStartNode;
    const parent = path.reduce((root, selector) => {
        const node = root.querySelector(selector);
        return node.shadowRoot ?? node;
    }, lookupStartNode);

    return parent;
}

export function getElement(selector, path = [], lookupStartNode = document) {
    const element = getParent(lookupStartNode, path).querySelector(selector);
    return element;
}

export function getAllElements(selector, path = [], lookupStartNode = document) {
    const elements = Array.from(getParent(lookupStartNode, path).querySelectorAll(selector));
    return elements;
}

export function forceLayout() {
    const rect = document.body.getBoundingClientRect();
    const e = document.elementFromPoint((rect.width / 2) | 0, (rect.height / 2) | 0);
    return e;
}

/** **********************************************************************
 * Benchmark Connector
 *
 * postMessage is used to communicate between app and benchmark.
 * When the app is ready, an 'app-ready' message is sent to signal that the app can receive instructions.
 *
 * A prepare script within the apps appends window.name and window.version from the package.json file.
 * The appId is build by appending name-version
 * It's used as an additional safe-guard to ensure the correct app responds to a message.
 *************************************************************************/

export function connectToBenchmark(benchmarkSuitesManager, name, version) {
    const appId = name && version ? `${name}-${version}` : -1;

    function sendMessage(message) {
        window.top.postMessage(message, "*");
    }

    async function onMessage(event) {
        // ensure we only let legit functions run...
        if (event.data.id !== appId || event.data.key !== "benchmark-connector")
            return;

        switch (event.data.type) {
            case "benchmark-suite":
                // eslint-disable-next-line no-case-declarations
                const params = new Params(new URLSearchParams(window.location.search));
                // eslint-disable-next-line no-case-declarations
                const { result } = await benchmarkSuitesManager.getSuiteByName(event.data.name).runAndRecord(params, (test) => sendMessage({ type: "step-complete", status: "success", appId, name, test }));
                sendMessage({ type: "suite-complete", status: "success", appId, result });
                disconnect();
                break;
        }
    }

    function disconnect() {
        window.removeEventListener("message", onMessage);
    }

    window.addEventListener("message", onMessage);
    sendMessage({ type: "app-ready", status: "success", appId });
    return disconnect;
}
