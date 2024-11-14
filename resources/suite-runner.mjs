import { TEST_INVOKER_LOOKUP } from "./test-invoker.mjs";
import { WarmupSuite } from "./benchmark-runner.mjs";

// FIXME: Create AsyncSuiteRunner subclass.
// FIXME: Create RemoteSuiteRunner subclass.
class SuiteRunner {
    constructor(measuredValues, frame, page, client, suite, params) {
        // FIXME: Create SuiteRunner-local measuredValues.
        this._suiteResults = measuredValues.tests[suite.name];
        if (!this._suiteResults) {
            this._suiteResults = { tests: {}, total: 0 };
            measuredValues.tests[suite.name] = this._suiteResults;
        }
        this._measuredValues = measuredValues;
        this._frame = frame;
        this._page = page;
        this._client = client;
        this._suite = suite;
        this._params = params;
    }

    async run() {
        await this._prepareSuite();
        await this._runSuite();
    }

    async _prepareSuite() {
        const suiteName = this._suite.name;
        const suitePrepareStartLabel = `suite-${suiteName}-prepare-start`;
        const suitePrepareEndLabel = `suite-${suiteName}-prepare-end`;

        performance.mark(suitePrepareStartLabel);
        await this._loadFrame();
        await this._suite.prepare(this._page);
        performance.mark(suitePrepareEndLabel);

        performance.measure(`suite-${suiteName}-prepare`, suitePrepareStartLabel, suitePrepareEndLabel);
    }

    async _runSuite() {
        const suiteName = this._suite.name;
        const suiteStartLabel = `suite-${suiteName}-start`;
        const suiteEndLabel = `suite-${suiteName}-end`;

        performance.mark(suiteStartLabel);
        for (const test of this._suite.tests)
            await this._runTestAndRecordResults(test);
        performance.mark(suiteEndLabel);

        performance.measure(`suite-${suiteName}`, suiteStartLabel, suiteEndLabel);
        this._validateSuiteTotal();
    }

    _validateSuiteTotal() {
        // When the test is fast and the precision is low (for example with Firefox'
        // privacy.resistFingerprinting preference), it's possible that the measured
        // total duration for an entire is 0.
        const suiteTotal = this._suiteResults.total;
        if (suiteTotal === 0)
            throw new Error(`Got invalid 0-time total for suite ${this._suite.name}: ${suiteTotal}`);
    }

    async _loadFrame() {
        return new Promise((resolve, reject) => {
            const frame = this._frame;
            frame.onload = () => resolve();
            frame.onerror = () => reject();
            frame.src = this._suite.url;
        });
    }

    async _runTestAndRecordResults(test) {
        if (this._client?.willRunTest)
            await this._client.willRunTest(this._suite, test);

        // Prepare all mark labels outside the measuring loop.
        const suiteName = this._suite.name;
        const testName = test.name;
        const startLabel = `${suiteName}.${testName}-start`;
        const syncEndLabel = `${suiteName}.${testName}-sync-end`;
        const asyncStartLabel = `${suiteName}.${testName}-async-start`;
        const asyncEndLabel = `${suiteName}.${testName}-async-end`;

        let syncTime;
        let asyncStartTime;
        let asyncTime;
        const runSync = () => {
            if (this._params.warmupBeforeSync) {
                performance.mark("warmup-start");
                const startTime = performance.now();
                // Infinite loop for the specified ms.
                while (performance.now() - startTime < this._params.warmupBeforeSync)
                    continue;
                performance.mark("warmup-end");
            }
            performance.mark(startLabel);
            const syncStartTime = performance.now();
            test.run(this._page);
            const syncEndTime = performance.now();
            performance.mark(syncEndLabel);

            syncTime = syncEndTime - syncStartTime;

            performance.mark(asyncStartLabel);
            asyncStartTime = performance.now();
        };
        const measureAsync = () => {
            // Some browsers don't immediately update the layout for paint.
            // Force the layout here to ensure we're measuring the layout time.
            const height = this._frame.contentDocument.body.getBoundingClientRect().height;
            const asyncEndTime = performance.now();
            asyncTime = asyncEndTime - asyncStartTime;
            this._frame.contentWindow._unusedHeightValue = height; // Prevent dead code elimination.
            performance.mark(asyncEndLabel);
            if (this._params.warmupBeforeSync)
                performance.measure("warmup", "warmup-start", "warmup-end");
            performance.measure(`${suiteName}.${testName}-sync`, startLabel, syncEndLabel);
            performance.measure(`${suiteName}.${testName}-async`, asyncStartLabel, asyncEndLabel);
        };

        const report = () => this._recordTestResults(test, syncTime, asyncTime);
        const invokerClass = TEST_INVOKER_LOOKUP[this._params.measurementMethod];
        const invoker = new invokerClass(runSync, measureAsync, report, this._params);

        return invoker.start();
    }

    async _recordTestResults(test, syncTime, asyncTime) {
        // Skip reporting updates for the warmup suite.
        if (this._suite === WarmupSuite)
            return;

        const total = syncTime + asyncTime;
        this._suiteResults.tests[test.name] = { tests: { Sync: syncTime, Async: asyncTime }, total: total };
        this._suiteResults.total += total;

        if (this._client?.didRunTest)
            await this._client.didRunTest(this._suite, test);
    }
}

// FIXME: implement remote steps
class RemoteSuiteRunner extends SuiteRunner {}

export const SUITE_RUNNER_LOOKUP = {
    __proto__: null,
    default: SuiteRunner,
    remote: RemoteSuiteRunner,
};
