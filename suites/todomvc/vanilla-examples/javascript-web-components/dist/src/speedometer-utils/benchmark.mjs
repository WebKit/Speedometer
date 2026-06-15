/* eslint-disable no-case-declarations */
import { TestRunner } from "./test-runner.mjs";
import { Params } from "./params.mjs";

/**
 * BenchmarkStep
 *
 * A single test step, with a common interface to interact with.
 */
export class BenchmarkStep {
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
 * BenchmarkSuite
 *
 * A single test suite that contains one or more test steps.
 */
export class BenchmarkSuite {
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

/** **********************************************************************
 * BenchmarkConnector
 *
 * postMessage is used to communicate between app and benchmark.
 * When the app is ready, an 'app-ready' message is sent to signal that the app can receive instructions.
 *
 * A prepare script within the apps appends window.name and window.version from the package.json file.
 * The appId is build by appending name-version
 * It's used as an additional safe-guard to ensure the correct app responds to a message.
 *************************************************************************/
export class BenchmarkConnector {
    constructor(suites, name, version) {
        this.suites = suites;
        this.name = name;
        this.version = version;

        if (!name || !version)
            console.warn("No name or version supplied, to create a unique appId");

        this.appId = name && version ? `${name}-${version}` : -1;
        this.onMessage = this.onMessage.bind(this);
    }

    async onMessage(event) {
        if (event.data.id !== this.appId || event.data.key !== "benchmark-connector")
            return;

        switch (event.data.type) {
            case "benchmark-suite":
                const params = new Params(new URLSearchParams(window.location.search));
                const suite = this.suites[event.data.name];
                if (!suite)
                    console.error(`Suite with the name of "${event.data.name}" not found!`);
                const { result } = await suite.runAndRecord(params, (test) => this.sendMessage({ type: "step-complete", status: "success", appId: this.appId, name: this.name, test }));
                this.sendMessage({ type: "suite-complete", status: "success", appId: this.appId, result });
                this.disconnect();
                break;
            default:
                console.error(`Message data type not supported: ${event.data.type}`);
        }
    }

    sendMessage(message) {
        window.top.postMessage(message, "*");
    }

    connect() {
        window.addEventListener("message", this.onMessage);
        this.sendMessage({ type: "app-ready", status: "success", appId: this.appId });
    }

    disconnect() {
        window.removeEventListener("message", this.onMessage);
    }
}
