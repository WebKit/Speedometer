import { BenchmarkStep, BenchmarkSuite } from "speedometer-utils/benchmark.mjs";
import { forceLayout, getElement } from "speedometer-utils/helpers.mjs";

const suites = {
    default: new BenchmarkSuite("default", [
        new BenchmarkStep("Navigate-to-US-page", () => {
            for (let i = 0; i < 25; i++) {
                getElement("#navbar-dropdown-toggle").click();
                forceLayout();
                getElement("#navbar-dropdown-toggle").click();
                forceLayout();
            }

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
    ]),
};

export default suites;
