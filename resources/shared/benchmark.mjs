/* eslint-disable no-case-declarations */
import { TestRunner, AsyncTestRunner } from "./test-runner.mjs";
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

export class AsyncBenchmarkStep extends BenchmarkStep {
    async runAndRecord(params, suite, test, callback) {
        const testRunner = new AsyncTestRunner(null, null, params, suite, test, callback);
        const result = await testRunner.runTest();
        return result;
    }
}

export const BENCHMARK_SUITE_TYPE = Object.freeze({
    __proto__: null,
    sync: "sync",
    async: "async",
});

/**
 * BenchmarkSuite
 *
 * A single test suite that contains one or more test steps.
 */
export class BenchmarkSuite {
    constructor(name, tests, type = BENCHMARK_SUITE_TYPE.sync) {
        this.name = name;
        this.tests = tests;
        this.type = type;
        console.assert(this.type in BENCHMARK_SUITE_TYPE);
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
            prepare: 0,
            total: 0,
        };
        const suiteStartLabel = `suite-${this.name}-start`;
        const suiteEndLabel = `suite-${this.name}-end`;

        performance.mark(suiteStartLabel);

        for (const test of this.tests) {
            const result = await test.runAndRecord(params, this, test, this.record);
            console.assert(result, "Missing test return value", test);
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

export class AsyncBenchmarkSuite extends BenchmarkSuite {
    constructor(name, tests) {
        super(name, tests, BENCHMARK_SUITE_TYPE.async);
    }
}


export const MESSAGE_TYPE = Object.freeze({
    __proto__: null,
    appReady: "app-ready",
    suiteStart: "suite-start",
    stepComplete: "step-complete",
    suiteComplete: "suite-complete",
});

export const MESSAGE_STATUS = Object.freeze({
    __proto__: null,
    success: "success",
    error: "error",
});


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
        const message = event.data;
        if (message.appId !== this.appId || message.key !== "benchmark-connector")
            return;

        switch (message.type) {
            case MESSAGE_TYPE.suiteStart:
                const params = new Params(new URLSearchParams(window.location.search));
                const { name } = message.payload;
                const suite = this.suites[name];
                if (!suite)
                    console.error(`Suite with the name of "${name}" not found!`);
                const onProgress = (test) => this._sendMessage(MESSAGE_TYPE.stepComplete, { name: this.name, test });
                const { result } = await suite.runAndRecord(params, onProgress);
                this._sendMessage(MESSAGE_TYPE.suiteComplete, { result });
                this.disconnect();
                break;
            default:
                console.error(`Message data type not supported: ${message.type}`);
        }
    }

    _sendMessage(type, payload, status = MESSAGE_STATUS.success) {
        const message = {
            appId: this.appId,
            type: type,
            payload: payload,
            status: status,
        };
        window.top.postMessage(message, "*");
    }

    connect() {
        window.addEventListener("message", this.onMessage);
        this._sendMessage({ type: MESSAGE_TYPE.appReady });
    }

    disconnect() {
        window.removeEventListener("message", this.onMessage);
    }
}
