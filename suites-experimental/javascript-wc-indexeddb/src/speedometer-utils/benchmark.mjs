/* eslint-disable no-case-declarations */
import { StepRunner, AsyncStepRunner } from "./step-runner.mjs";
import { Params } from "/node_modules/speedometer-utils/params.mjs";

/**
 * BenchmarkStep
 *
 * A single test step, with a common interface to interact with.
 */
export class BenchmarkStep {
    constructor(name, run, ignoreResult = false) {
        this.name = name;
        this.run = run;
        this.ignoreResult = ignoreResult;
    }

    async runAndRecord(params, suite, test, callback) {
        const StepRunnerClass = params.useAsyncSteps ? AsyncStepRunner : StepRunner;
        const type = params.useAsyncSteps ? "async" : "sync";
        const stepRunner = new StepRunnerClass(null, null, params, suite, test, callback, type);
        const result = await stepRunner.runStep();
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
            if (!test.ignoreResult) {
                measuredValues.tests[test.name] = result;
                measuredValues.total += result.total;
            }
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

        if (!name || !version) console.warn("No name or version supplied, to create a unique appId");

        this.appId = name && version ? `${name}-${version}` : -1;
        this.onMessage = this.onMessage.bind(this);
    }

    async onMessage(event) {
        const message = event.data;
        if (message.appId !== this.appId || message.key !== "benchmark-connector") {
            console.warn("Invalid message", message);
            return;
        }

        switch (message.type) {
            case MESSAGE_TYPE.suiteStart:
                const params = new Params(new URLSearchParams(window.location.search));
                const { name } = message.payload;
                const suite = this.suites[name];
                if (!suite) console.error(`Suite with the name of "${name}" not found!`);
                const onProgress = (step) => this._sendMessage(MESSAGE_TYPE.stepComplete, { name: this.name, step });
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
            key: "benchmark-connector",
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
