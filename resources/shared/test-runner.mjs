import { TEST_INVOKER_LOOKUP } from "./test-invoker.mjs";

export class TestRunner {
    #frame;
    #page;
    #params;
    #suite;
    #test;
    #callback;

    constructor(frame, page, params, suite, test, callback) {
        this.#suite = suite;
        this.#test = test;
        this.#params = params;
        this.#callback = callback;

        this.#page = page;
        this.#frame = frame;
    }

    async runTest() {
        // Prepare all mark labels outside the measuring loop.
        const suiteName = this.#suite.name;
        const testName = this.#test.name;
        const syncStartLabel = `${suiteName}.${testName}-start`;
        const syncEndLabel = `${suiteName}.${testName}-sync-end`;
        const asyncEndLabel = `${suiteName}.${testName}-async-end`;

        let syncTime;
        let asyncStartTime;
        let asyncTime;

        const runSync = () => {
            if (this.#params.warmupBeforeSync) {
                performance.mark("warmup-start");
                const startTime = performance.now();
                // Infinite loop for the specified ms.
                while (performance.now() - startTime < this.#params.warmupBeforeSync)
                    continue;
                performance.mark("warmup-end");
            }
            performance.mark(syncStartLabel);
            const syncStartTime = performance.now();
            this.#test.run(this.#page);
            const mark = performance.mark(syncEndLabel);
            const syncEndTime = mark.startTime;

            syncTime = syncEndTime - syncStartTime;
            asyncStartTime = syncEndTime;
        };
        const measureAsync = () => {
            const bodyReference = this.#frame ? this.#frame.contentDocument.body : document.body;
            const windowReference = this.#frame ? this.#frame.contentWindow : window;
            // Some browsers don't immediately update the layout for paint.
            // Force the layout here to ensure we're measuring the layout time.
            const height = bodyReference.getBoundingClientRect().height;
            windowReference._unusedHeightValue = height; // Prevent dead code elimination.

            const asyncEndTime = performance.now();
            performance.mark(asyncEndLabel);

            asyncTime = asyncEndTime - asyncStartTime;

            if (this.#params.warmupBeforeSync)
                performance.measure("warmup", "warmup-start", "warmup-end");
            performance.measure(`${suiteName}.${testName}-sync`, syncStartLabel, syncEndLabel);
            performance.measure(`${suiteName}.${testName}-async`, syncEndLabel, asyncEndLabel);
        };

        const report = () => this.#callback(this.#test, syncTime, asyncTime);
        const invokerClass = TEST_INVOKER_LOOKUP[this.#params.measurementMethod];
        const invoker = new invokerClass(runSync, measureAsync, report, this.#params);

        return invoker.start();
    }
}
