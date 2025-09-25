import { BenchmarkStep, AsyncBenchmarkStep, AsyncBenchmarkSuite } from "speedometer-utils/benchmark.mjs";
import { forceLayout, getElement } from "speedometer-utils/helpers.mjs";

const suites = {
    default: new AsyncBenchmarkSuite("default", [
        new AsyncBenchmarkStep("Navigate-to-US-page", async () => {
            for (let i = 0; i < 25; i++) {
                getElement("#navbar-dropdown-toggle").click();
                forceLayout();
                getElement("#navbar-dropdown-toggle").click();
                forceLayout();
            }
            await new Promise(r => setTimeout(r, 1000));

            getElement("#navbar-navlist-us-link").click();
            forceLayout();
        }),

        new BenchmarkStep("Navigate-to-World-page", () => {
            for (let i = 0; i < 25; i++) {
                getElement("#navbar-dropdown-toggle").click();
                forceLayout();
                getElement("#navbar-dropdown-toggle").click();
                forceLayout();
            }

            getElement("#navbar-navlist-world-link").click();
            forceLayout();
        }),
        new BenchmarkStep("Navigate-to-Politics-page", () => {
            for (let i = 0; i < 25; i++) {
                getElement("#navbar-dropdown-toggle").click();
                forceLayout();
                getElement("#navbar-dropdown-toggle").click();
                forceLayout();
            }

            getElement("#navbar-navlist-politics-link").click();
            forceLayout();
        }),
    ], true),
};

export default suites;
