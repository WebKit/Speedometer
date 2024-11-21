import { BenchmarkTestStep, BenchmarkTestSuite, BenchmarkSuitesManager, forceLayout, getElement } from "speedometer-utils/workload-testing-utils.mjs";

export function initWorkload() {
    window.benchmarkSuitesManager = new BenchmarkSuitesManager(window.name, [
        new BenchmarkTestSuite("default", [
            new BenchmarkTestStep("Navigate-to-US-page", () => {
                for (let i = 0; i < 25; i++) {
                    getElement("#navbar-dropdown-toggle").click();
                    forceLayout();
                    getElement("#navbar-dropdown-toggle").click();
                    forceLayout();
                }

                getElement("#navbar-navlist-us-link").click();
                forceLayout();
            }),
            new BenchmarkTestStep("Navigate-to-World-page", () => {
                for (let i = 0; i < 25; i++) {
                    getElement("#navbar-dropdown-toggle").click();
                    forceLayout();
                    getElement("#navbar-dropdown-toggle").click();
                    forceLayout();
                }

                getElement("#navbar-navlist-world-link").click();
                forceLayout();
            }),
            new BenchmarkTestStep("Navigate-to-Politics-page", () => {
                for (let i = 0; i < 25; i++) {
                    getElement("#navbar-dropdown-toggle").click();
                    forceLayout();
                    getElement("#navbar-dropdown-toggle").click();
                    forceLayout();
                }

                getElement("#navbar-navlist-politics-link").click();
                forceLayout();
            }),
        ]),
    ]);
}
