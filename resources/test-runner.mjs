import { TEST_INVOKER_LOOKUP } from "./test-invoker.mjs";

export class TestRunner {
    constructor(suite, test, params, callback, page, frame) {
        this._suite = suite;
        this._test = test;
        this._params = params;
        this._callback = callback;

        this._page = page;
        this._frame = frame;
    }

    async runTest() {
        // Prepare all mark labels outside the measuring loop.
        const suiteName = this._suite.name;
        const testName = this._test.name;
        const syncStartLabel = `${suiteName}.${testName}-start`;
        const syncEndLabel = `${suiteName}.${testName}-sync-end`;
        const asyncStartLabel = `${suiteName}.${testName}-async-start`;
        const asyncEndLabel = `${suiteName}.${testName}-async-end`;

        let syncTime;
        let asyncStartTime;
        let asyncTime;
        const runSync = () => {
            this._runWarmupSuite();
            syncTime = this._measureSyncTime(syncStartLabel, syncEndLabel);
            asyncStartTime = this._initAsyncTime(asyncStartLabel);
        };
        const measureAsync = () => {
            this._forceLayout();
            asyncTime = this._measureAsyncTime(asyncStartTime, asyncEndLabel);
            this._measureTestPerformance(suiteName, testName, syncStartLabel, syncEndLabel, asyncStartLabel, asyncEndLabel);
        };

        const report = () => this._callback(this._test, syncTime, asyncTime);
        const invokerClass = TEST_INVOKER_LOOKUP[this._params.measurementMethod];
        const invoker = new invokerClass(runSync, measureAsync, report, this._params);

        return invoker.start();
    }

    _runWarmupSuite() {
        if (this._params.warmupBeforeSync) {
            performance.mark("warmup-start");
            const startTime = performance.now();
            // Infinite loop for the specified ms.
            while (performance.now() - startTime < this._params.warmupBeforeSync)
                continue;
            performance.mark("warmup-end");
        }
    }

    _measureSyncTime(syncStartLabel, syncEndLabel) {
        performance.mark(syncStartLabel);
        const syncStartTime = performance.now();
        this._test.run(this._page);
        const syncEndTime = performance.now();
        performance.mark(syncEndLabel);

        const syncTime = syncEndTime - syncStartTime;
        return syncTime;
    }

    _initAsyncTime(asyncStartLabel) {
        performance.mark(asyncStartLabel);

        const asyncStartTime = performance.now();
        return asyncStartTime;
    }

    _measureAsyncTime(asyncStartTime, asyncEndLabel) {
        const asyncEndTime = performance.now();
        performance.mark(asyncEndLabel);

        const asyncTime = asyncEndTime - asyncStartTime;
        return asyncTime;
    }

    _measureTestPerformance(suiteName, testName, syncStartLabel, syncEndLabel, asyncStartLabel, asyncEndLabel, params) {
        if (this._params.warmupBeforeSync)
            performance.measure("warmup", "warmup-start", "warmup-end");
        performance.measure(`${suiteName}.${testName}-sync`, syncStartLabel, syncEndLabel);
        performance.measure(`${suiteName}.${testName}-async`, asyncStartLabel, asyncEndLabel);
    }

    _forceLayout() {
        const bodyReference = this._frame ? this._frame.contentDocument.body : document.body;
        const windowReference = this._frame ? this._frame.contentWindow : window;
        // Some browsers don't immediately update the layout for paint.
        // Force the layout here to ensure we're measuring the layout time.
        const height = bodyReference.getBoundingClientRect().height;
        windowReference._unusedHeightValue = height; // Prevent dead code elimination.
    }
}
