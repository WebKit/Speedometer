import { STEP_SCHEDULER_LOOKUP } from "./step-scheduler.mjs";
import { forceLayout } from "./helpers.mjs";

export class StepRunner {
    #frame;
    #page;
    #params;
    #suite;
    #step;
    #type;

    constructor(frame, page, params, suite, step, type) {
        this.#suite = suite;
        this.#step = step;
        this.#params = params;
        this.#page = page;
        this.#frame = frame;
        this.#type = type;
    }

    get page() {
        return this.#page;
    }

    get step() {
        return this.#step;
    }

    _runSyncStep(step, page) {
        step.run(page);
    }

    async runStep() {
        // Prepare all mark labels outside the measuring loop.
        const suiteName = this.#suite.name;
        const stepName = this.#step.name;
        const syncStartLabel = `${suiteName}.${stepName}-start`;
        const syncEndLabel = `${suiteName}.${stepName}-sync-end`;
        const asyncEndLabel = `${suiteName}.${stepName}-async-end`;

        let syncTime;
        let asyncStartTime;
        let asyncTime;

        const runSync = async () => {
            if (this.#params.warmupBeforeSync) {
                performance.mark("warmup-start");
                const startTime = performance.now();
                // Infinite loop for the specified ms.
                while (performance.now() - startTime < this.#params.warmupBeforeSync) continue;
                performance.mark("warmup-end");
            }
            performance.mark(syncStartLabel);
            const syncStartTime = performance.now();

            if (this.#type === "async") await this._runSyncStep(this.step, this.page);
            else this._runSyncStep(this.step, this.page);

            const mark = performance.mark(syncEndLabel);
            const syncEndTime = mark.startTime;

            syncTime = syncEndTime - syncStartTime;
            asyncStartTime = syncEndTime;
        };
        const measureAsync = () => {
            // Some browsers don't immediately update the layout for paint.
            // Force the layout here to ensure we're measuring the layout time.
            //
            // Note: This matches the behavior of Page.layout() in benchmark-runner.mjs.
            // Since shared code cannot depend on Page, we duplicate the logic here,
            // falling back to document.body for remote workloads that don't have a frame.
            const body = this.#frame?.contentDocument?.body ?? document.body;
            const value = forceLayout(body, this.#params.layoutMode);
            body._leakedLayoutValue = value; // Prevent dead code elimination.

            const asyncEndTime = performance.now();
            performance.mark(asyncEndLabel);

            asyncTime = asyncEndTime - asyncStartTime;

            if (this.#params.warmupBeforeSync) performance.measure("warmup", "warmup-start", "warmup-end");
            performance.measure(`${suiteName}.${stepName}-sync`, syncStartLabel, syncEndLabel);
            performance.measure(`${suiteName}.${stepName}-async`, syncEndLabel, asyncEndLabel);
        };

        const schedulerType = this.#suite.type === "async" || this.#params.useAsyncSteps ? "async" : this.#params.measurementMethod;
        const schedulerClass = STEP_SCHEDULER_LOOKUP[schedulerType];
        const scheduler = new schedulerClass(runSync, measureAsync, this.#params);
        await scheduler.start();
        return { syncTime, asyncTime };
    }
}

export class AsyncStepRunner extends StepRunner {
    async _runSyncStep(step, page) {
        await step.run(page);
    }
}

export const STEP_RUNNER_LOOKUP = {
    __proto__: null,
    default: StepRunner,
    async: AsyncStepRunner,
    remote: StepRunner,
};
