import { TEST_INVOKER_LOOKUP } from "./test-invoker.mjs";
import { WarmupSuite } from "./benchmark-runner.mjs";

export const runTest = async({ suite, test, params, callback, page, frame }) => {
    const runWarmupSuite = ({ params }) => {
        if (params.warmupBeforeSync) {
            performance.mark("warmup-start");
            const startTime = performance.now();
            // Infinite loop for the specified ms.
            while (performance.now() - startTime < params.warmupBeforeSync)
                continue;
            performance.mark("warmup-end");
        }
    };

    const measureSyncTime = ({ test, syncStartLabel, syncEndLabel, page }) => {
        performance.mark(syncStartLabel);
        const syncStartTime = performance.now();
        test.run(page);
        const syncEndTime = performance.now();
        performance.mark(syncEndLabel);

        const syncTime = syncEndTime - syncStartTime;
        return syncTime;
    };

    const initAsyncTime = ({ asyncStartLabel }) => {
        performance.mark(asyncStartLabel);

        const asyncStartTime = performance.now();
        return asyncStartTime;
    };

    const measureAsyncTime = ({ asyncStartTime, asyncEndLabel }) => {
        const asyncEndTime = performance.now();
        performance.mark(asyncEndLabel);

        const asyncTime = asyncEndTime - asyncStartTime;
        return asyncTime;
    };

    const measureTestPerformance = ({ suiteName, testName, syncStartLabel, syncEndLabel, asyncStartLabel, asyncEndLabel, params }) => {
        if (params.warmupBeforeSync)
            performance.measure("warmup", "warmup-start", "warmup-end");
        performance.measure(`${suiteName}.${testName}-sync`, syncStartLabel, syncEndLabel);
        performance.measure(`${suiteName}.${testName}-async`, asyncStartLabel, asyncEndLabel);
    };

    const forceLayout = ({ frame }) => {
        const bodyReference = frame ? frame.contentDocument.body : document.body;
        const windowReference = frame ? frame.contentWindow : window;
        // Some browsers don't immediately update the layout for paint.
        // Force the layout here to ensure we're measuring the layout time.
        const height = bodyReference.getBoundingClientRect().height;
        windowReference._unusedHeightValue = height; // Prevent dead code elimination.
    };

    // Prepare all mark labels outside the measuring loop.
    const suiteName = suite.name;
    const testName = test.name;
    const syncStartLabel = `${suiteName}.${testName}-start`;
    const syncEndLabel = `${suiteName}.${testName}-sync-end`;
    const asyncStartLabel = `${suiteName}.${testName}-async-start`;
    const asyncEndLabel = `${suiteName}.${testName}-async-end`;

    let syncTime;
    let asyncStartTime;
    let asyncTime;
    const runSync = () => {
        runWarmupSuite({ params });
        syncTime = measureSyncTime({ test, syncStartLabel, syncEndLabel, page });
        asyncStartTime = initAsyncTime({ asyncStartLabel });
    };
    const measureAsync = () => {
        forceLayout({ frame });
        asyncTime = measureAsyncTime({ asyncStartTime, asyncEndLabel });
        measureTestPerformance({ suiteName, testName, syncStartLabel, syncEndLabel, asyncStartLabel, asyncEndLabel, params });
    };

    const report = () => callback(test, syncTime, asyncTime);
    const invokerClass = TEST_INVOKER_LOOKUP[params.measurementMethod];
    const invoker = new invokerClass(runSync, measureAsync, report, params);

    return invoker.start();
};

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
        for (const test of this._suite.tests) {
            if (this._client?.willRunTest)
                await this._client.willRunTest(this._suite, test);

            await runTest({ suite: this._suite, test, params: this._params, callback: this._recordTestResults, page: this._page, frame: this._frame });
        }
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

    _recordTestResults = async(test, syncTime, asyncTime) => {
        // Skip reporting updates for the warmup suite.
        if (this._suite === WarmupSuite)
            return;

        const total = syncTime + asyncTime;
        this._suiteResults.tests[test.name] = { tests: { Sync: syncTime, Async: asyncTime }, total: total };
        this._suiteResults.total += total;

        if (this._client?.didRunTest)
            await this._client.didRunTest(this._suite, test);
    };
}

// FIXME: implement remote steps
class RemoteSuiteRunner extends SuiteRunner {}

export const SUITE_RUNNER_LOOKUP = {
    __proto__: null,
    default: SuiteRunner,
    remote: RemoteSuiteRunner,
};
