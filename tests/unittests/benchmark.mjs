import { AsyncBenchmarkStep, AsyncBenchmarkSuite, BenchmarkStep, BenchmarkSuite } from "../../resources/shared/benchmark.mjs";
import { Params } from "../../resources/shared/params.mjs";
import { skipInShell } from "../../resources/shared/helpers.mjs";

const SLEEP_MS = 200;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("BenchmarkSuite", () => {
    let params;

    before(function () {
        // The step schedulers need requestAnimationFrame and a document.
        skipInShell(this);
        params = new Params();
    });

    it("should measure the work of a sync step", async () => {
        const suite = new BenchmarkSuite("SyncProbe", [
            new BenchmarkStep("BusyStep", () => {
                const start = performance.now();
                while (performance.now() - start < SLEEP_MS)
                    continue;
            }),
        ]);

        const { result } = await suite.runAndRecordSuite(params);

        expect(result.tests.BusyStep.tests.Sync).to.be.greaterThan(SLEEP_MS * 0.9);
        expect(result.total).to.be.greaterThan(SLEEP_MS * 0.9);
    });
});

describe("AsyncBenchmarkSuite", () => {
    let params;

    before(function () {
        skipInShell(this);
        params = new Params();
    });

    // AsyncBenchmarkStep used to construct its AsyncStepRunner without a type, leaving
    // StepRunner on the non-awaiting branch, so this reported ~0ms.
    it("should measure the work of a step that resolves asynchronously", async () => {
        const suite = new AsyncBenchmarkSuite("AsyncProbe", [new AsyncBenchmarkStep("SleepingStep", () => sleep(SLEEP_MS))]);

        const { result } = await suite.runAndRecordSuite(params);

        expect(result.tests.SleepingStep.tests.Sync).to.be.greaterThan(SLEEP_MS * 0.9);
        expect(result.total).to.be.greaterThan(SLEEP_MS * 0.9);
    });
});
