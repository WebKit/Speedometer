/* eslint-disable no-case-declarations */
<<<<<<< HEAD:suites/todomvc/vanilla-examples/javascript-web-components-complex/dist/speedometer-utils/benchmark.mjs
import { StepRunner } from "./step-runner.mjs";
||||||| 9ea7e71a:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
import { TestRunner } from "./test-runner.mjs";
=======
import { StepRunner, AsyncStepRunner } from "./step-runner.mjs";
>>>>>>> main:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
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

<<<<<<< HEAD:suites/todomvc/vanilla-examples/javascript-web-components-complex/dist/speedometer-utils/benchmark.mjs
    async runAndRecordStep(params, suite, step, callback) {
        const stepRunner = new StepRunner(null, null, params, suite, step, callback);
        const result = await stepRunner.runStep();
||||||| 9ea7e71a:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
    async runAndRecord(params, suite, test, callback) {
        const testRunner = new TestRunner(null, null, params, suite, test, callback);
        const result = await testRunner.runTest();
=======
    async runAndRecordStep(params, suite, step, callback) {
        const stepRunner = new StepRunner(null, null, params, suite, step, callback);
        const result = await stepRunner.runStep();
        return result;
    }
}

export class AsyncBenchmarkStep extends BenchmarkStep {
    async runAndRecord(params, suite, test, callback) {
        const testRunner = new AsyncStepRunner(null, null, params, suite, test, callback);
        const result = await testRunner.runTest();
>>>>>>> main:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
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
<<<<<<< HEAD:suites/todomvc/vanilla-examples/javascript-web-components-complex/dist/speedometer-utils/benchmark.mjs
    constructor(name, steps) {
||||||| 9ea7e71a:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
    constructor(name, tests) {
=======
    constructor(name, steps, type = BENCHMARK_SUITE_TYPE.sync) {
>>>>>>> main:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
        this.name = name;
<<<<<<< HEAD:suites/todomvc/vanilla-examples/javascript-web-components-complex/dist/speedometer-utils/benchmark.mjs
        this.steps = steps;
||||||| 9ea7e71a:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
        this.tests = tests;
=======
        this.steps = steps;
        this.type = type;
        console.assert(this.type in BENCHMARK_SUITE_TYPE, "Invalid Type", this.type);
>>>>>>> main:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
    }

    record(_step, syncTime, asyncTime) {
        const total = syncTime + asyncTime;
        const results = {
            tests: { Sync: syncTime, Async: asyncTime },
            total: total,
        };

        return results;
    }

    async runAndRecordSuite(params, onProgress) {
        const measuredValues = {
            tests: {},
            prepare: 0,
            total: 0,
        };
        const suiteStartLabel = `suite-${this.name}-start`;
        const suiteEndLabel = `suite-${this.name}-end`;

        performance.mark(suiteStartLabel);

<<<<<<< HEAD:suites/todomvc/vanilla-examples/javascript-web-components-complex/dist/speedometer-utils/benchmark.mjs
        for (const step of this.steps) {
            const result = await step.runAndRecordStep(params, this, step, this.record);
            measuredValues.tests[step.name] = result;
||||||| 9ea7e71a:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
        for (const test of this.tests) {
            const result = await test.runAndRecord(params, this, test, this.record);
            measuredValues.tests[test.name] = result;
=======
        for (const step of this.steps) {
            const result = await step.runAndRecordStep(params, this, step, this.record);
            console.assert(result, "Missing test return value", step);
            measuredValues.tests[step.name] = result;
>>>>>>> main:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
            measuredValues.total += result.total;
            onProgress?.(step.name);
        }

        performance.mark(suiteEndLabel);
        performance.measure(`suite-${this.name}`, suiteStartLabel, suiteEndLabel);

        return {
            type: "suite-tests-complete",
            status: "success",
            result: measuredValues,
            suiteName: this.name,
        };
    }
}

export class AsyncBenchmarkSuite extends BenchmarkSuite {
    constructor(name, steps) {
        super(name, steps, BENCHMARK_SUITE_TYPE.async);
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
        if (message.appId !== this.appId || message.key !== "benchmark-connector") {
            console.warning("Invalid message", message);
            return;
        }

        switch (message.type) {
            case MESSAGE_TYPE.suiteStart:
                const params = new Params(new URLSearchParams(window.location.search));
                const { name } = message.payload;
                const suite = this.suites[name];
                if (!suite)
<<<<<<< HEAD:suites/todomvc/vanilla-examples/javascript-web-components-complex/dist/speedometer-utils/benchmark.mjs
                    console.error(`Suite with the name of "${event.data.name}" not found!`);
                const { result } = await suite.runAndRecordSuite(params, (test) => this.sendMessage({ type: "step-complete", status: "success", appId: this.appId, name: this.name, test }));
                this.sendMessage({ type: "suite-complete", status: "success", appId: this.appId, result });
||||||| 9ea7e71a:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
                    console.error(`Suite with the name of "${event.data.name}" not found!`);
                const { result } = await suite.runAndRecord(params, (test) => this.sendMessage({ type: "step-complete", status: "success", appId: this.appId, name: this.name, test }));
                this.sendMessage({ type: "suite-complete", status: "success", appId: this.appId, result });
=======
                    console.error(`Suite with the name of "${name}" not found!`);
                const onProgress = (step) => this._sendMessage(MESSAGE_TYPE.stepComplete, { name: this.name, step });
                const { result } = await suite.runAndRecordSuite(params, onProgress);
                this._sendMessage(MESSAGE_TYPE.suiteComplete, { result });
>>>>>>> main:suites/todomvc/vanilla-examples/javascript-web-components/dist/src/speedometer-utils/benchmark.mjs
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
        this._sendMessage(MESSAGE_TYPE.appReady, { appId: this.appId });
    }

    disconnect() {
        window.removeEventListener("message", this.onMessage);
    }
}
