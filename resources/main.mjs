import { BenchmarkRunner } from "./benchmark-runner.mjs";
import "./benchmark-report.mjs";
import * as Statistics from "./statistics.mjs";
import { Suites } from "./tests.mjs";
import { renderMetricView } from "./metric-ui.mjs";
import { params } from "./params.mjs";

// FIXME(camillobruni): Add base class
class MainBenchmarkClient {
    developerMode = false;
    stepCount = null;
    suitesCount = null;
    _measuredValuesList = [];
    _finishedTestCount = 0;
    _progressCompleted = null;
    _isRunning = false;
    _hasResults = false;

    constructor() {
        window.addEventListener("DOMContentLoaded", () => this.prepareUI());
        this._showSection(window.location.hash);
    }

    startBenchmark() {
        if (this._isRunning)
            return false;
        if (params.suites.length > 0) {
            if (!Suites.enable(params.suites)) {
                const message = `Suite "${params.suites}" does not exist. No tests to run.`;
                alert(message);
                console.error(
                    message,
                    params.suites,
                    "\nValid values:",
                    Suites.map((each) => each.name)
                );
                return false;
            }
        }
        this._isRunning = true;
        this.developerMode = params.developerMode;

        const enabledSuites = Suites.filter((suite) => !suite.disabled);
        const totalSubtestsCount = enabledSuites.reduce((testsCount, suite) => {
            return testsCount + suite.tests.length;
        }, 0);
        this.stepCount = params.iterationCount * totalSubtestsCount;
        this.suitesCount = enabledSuites.length;
        const runner = new BenchmarkRunner(Suites, this);
        runner.runMultipleIterations(params.iterationCount);
        return true;
    }

    willAddTestFrame(frame) {
        const main = document.querySelector("#running");
        const style = getComputedStyle(main);
        frame.style.left = `${main.offsetLeft + parseInt(style.borderLeftWidth) + parseInt(style.paddingLeft)}px`;
        frame.style.top = `${main.offsetTop + parseInt(style.borderTopWidth) + parseInt(style.paddingTop)}px`;
    }

    willRunTest(suite, test) {
        document.getElementById("info-label").textContent = suite.name;
        document.getElementById("info-progress").textContent = `${this._finishedTestCount} / ${this.stepCount}`;
    }

    didRunTest() {
        this._finishedTestCount++;
        this._progressCompleted.style.width = `${(this._finishedTestCount * 100) / this.stepCount}%`;
    }

    didRunSuites(measuredValues) {
        this._measuredValuesList.push(measuredValues);
    }

    willStartFirstIteration() {
        this._measuredValuesList = [];
        this._finishedTestCount = 0;
        this._progressCompleted = document.getElementById("progress-completed");
    }

    didFinishLastIteration(metrics) {
        console.assert(this._isRunning);
        this._isRunning = false;
        this._hasResults = true;

        const scoreResults = this._computeResults(this._measuredValuesList, "score");
        this._updateGaugeNeedle(scoreResults.mean);
        document.getElementById("result-number").textContent = scoreResults.formattedMean;
        if (scoreResults.formattedDelta)
            document.getElementById("confidence-number").textContent = `\u00b1 ${scoreResults.formattedDelta}`;

        this._populateDetailedResults(metrics);

        if (this.developerMode)
            this.showResultsDetails();
        else
            this.showResultsSummary();
    }

    _computeResults(measuredValuesList, displayUnit) {
        function valueForUnit(measuredValues) {
            if (displayUnit === "ms")
                return measuredValues.geomean;
            return measuredValues.score;
        }

        function sigFigFromPercentDelta(percentDelta) {
            return Math.ceil(-Math.log(percentDelta) / Math.log(10)) + 3;
        }

        function toSigFigPrecision(number, sigFig) {
            const nonDecimalDigitCount = number < 1 ? 0 : Math.floor(Math.log(number) / Math.log(10)) + 1;
            return number.toPrecision(Math.max(nonDecimalDigitCount, Math.min(6, sigFig)));
        }

        const values = measuredValuesList.map(valueForUnit);
        const sum = values.reduce((a, b) => {
            return a + b;
        }, 0);
        const arithmeticMean = sum / values.length;
        let meanSigFig = 4;
        let formattedDelta;
        let formattedPercentDelta;
        const delta = Statistics.confidenceIntervalDelta(0.95, values.length, sum, Statistics.squareSum(values));
        if (!isNaN(delta)) {
            const percentDelta = (delta * 100) / arithmeticMean;
            meanSigFig = sigFigFromPercentDelta(percentDelta);
            formattedDelta = toSigFigPrecision(delta, 2);
            formattedPercentDelta = `${toSigFigPrecision(percentDelta, 2)}%`;
        }

        const formattedMean = toSigFigPrecision(arithmeticMean, Math.max(meanSigFig, 3));

        return {
            formattedValues: values.map((value) => {
                return `${toSigFigPrecision(value, 4)} ${displayUnit}`;
            }),
            mean: arithmeticMean,
            formattedMean: formattedMean,
            formattedDelta: formattedDelta,
            formattedMeanAndDelta: formattedMean + (formattedDelta ? ` \xb1 ${formattedDelta} (${formattedPercentDelta})` : ""),
        };
    }

    _addDetailedResultsRow(table, iterationNumber, value) {
        const row = document.createElement("tr");
        const th = document.createElement("th");
        th.textContent = `Iteration ${iterationNumber + 1}`;
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(th);
        row.appendChild(td);
        table.appendChild(row);
    }

    _updateGaugeNeedle(score) {
        const needleAngle = Math.max(0, Math.min(score, 140)) - 70;
        const needleRotationValue = `rotate(${needleAngle}deg)`;

        const gaugeNeedleElement = document.querySelector("#summary > .gauge .needle");
        gaugeNeedleElement.style.setProperty("-webkit-transform", needleRotationValue);
        gaugeNeedleElement.style.setProperty("-moz-transform", needleRotationValue);
        gaugeNeedleElement.style.setProperty("-ms-transform", needleRotationValue);
        gaugeNeedleElement.style.setProperty("transform", needleRotationValue);
    }

    _populateDetailedResults(metrics) {
        const trackHeight = 24;
        document.documentElement.style.setProperty("--metrics-line-height", `${trackHeight}px`);
        const plotWidth = (params.viewport.width - 120) / 2;
        document.getElementById("total-chart").innerHTML = renderMetricView({
            metrics: [metrics["Total"]],
            width: plotWidth,
            trackHeight,
            renderChildren: false,
            colors: ["white"],
        });

        const toplevelMetrics = Object.values(metrics).filter((each) => !each.parent && each.children.length > 0);
        document.getElementById("tests-chart").innerHTML = renderMetricView({
            metrics: toplevelMetrics,
            width: plotWidth,
            trackHeight,
            renderChildren: false,
        });

        let html = "";
        for (const metric of toplevelMetrics) {
            html += renderMetricView({
                metrics: metric.children,
                width: plotWidth,
                trackHeight,
                title: metric.name,
            });
        }
        document.getElementById("metrics-results").innerHTML = html;

        const filePrefix = `speedometer-3-${new Date().toISOString()}`;
        const jsonData = this._getFormattedJSONResult();
        const jsonLink = document.getElementById("download-json");
        jsonLink.href = URL.createObjectURL(new Blob([jsonData], { type: "application/json" }));
        jsonLink.setAttribute("download", `${filePrefix}.json`);

        const csvData = this._getFormattedCSVResult();
        const csvLink = document.getElementById("download-csv");
        csvLink.href = URL.createObjectURL(new Blob([csvData], { type: "text/csv" }));
        csvLink.setAttribute("download", `${filePrefix}.csv`);
    }

    prepareUI() {
        window.addEventListener("hashchange", this._hashChangeHandler.bind(this));
        window.addEventListener("resize", this._resizeScreeHandler.bind(this));
        this._resizeScreeHandler();

        document.querySelectorAll("logo").forEach((button) => {
            button.onclick = this._logoClickHandler.bind(this);
        });
        document.getElementById("copy-json").onclick = this.copyJsonResults.bind(this);
        document.getElementById("copy-csv").onclick = this.copyCSVResults.bind(this);
        document.querySelectorAll(".start-tests-button").forEach((button) => {
            button.onclick = this._startBenchmarkHandler.bind(this);
        });

        if (params.startAutomatically)
            this._startBenchmarkHandler();
    }

    _hashChangeHandler() {
        this._showSection(window.location.hash);
    }

    _resizeScreeHandler() {
        // FIXME: Detect when the window size changes during the test.
        const mainSize = document.querySelector("main").getBoundingClientRect();
        const screenIsTooSmall = window.innerWidth < mainSize.width || window.innerHeight < mainSize.height;
        document.getElementById("min-screen-width").textContent = `${params.viewport.width + 50}px`;
        document.getElementById("min-screen-height").textContent = `${params.viewport.height + 50}px`;
        document.getElementById("screen-size").textContent = `${window.innerWidth}px by ${window.innerHeight}px`;
        document.getElementById("screen-size-warning").style.display = screenIsTooSmall ? null : "none";
    }

    _startBenchmarkHandler() {
        if (this.startBenchmark())
            this._showSection("#running");
    }

    _logoClickHandler(event) {
        // Prevent any accidental UI changes during benchmark runs.
        if (!this._isRunning)
            this._showSection("#home");
        event.preventDefault();
        return false;
    }

    showResultsSummary() {
        this._showSection("#summary");
    }

    showResultsDetails() {
        this._showSection("#details");
    }

    _getFormattedJSONResult() {
        const indent = "    ";
        return JSON.stringify(this._measuredValuesList, undefined, indent);
    }

    _getFormattedCSVResult() {
        let tests = [];
        // The CSV format is similar to the details view table. Each measurement is a row with
        // the name and N columns with the measurement for each iteration:
        // ```
        // Measurement,#1,...,#N
        // TodoMVC-JavaScript-ES5/Total,num,...,num
        // TodoMVC-JavaScript-ES5/Adding100Items,num,...,num
        // TodoMVC-JavaScript-ES5/Adding100Items/Sync,num,...,num
        // TodoMVC-JavaScript-ES5/Adding100Items/Async,num,...,num
        // ...
        // TodoMVC-JavaScript-ES6/Total,num,...,num
        // TodoMVC-JavaScript-ES6/Adding100Items,num,...,num
        // TodoMVC-JavaScript-ES6/Adding100Items/Sync,num,...,num
        // TodoMVC-JavaScript-ES6/Adding100Items/Async,num,...,num
        // ```
        const firstIterationTests = this._measuredValuesList[0].tests;
        for (const suiteName in firstIterationTests) {
            tests.push([`${suiteName}/Total`]);
            for (const testName in firstIterationTests[suiteName].tests) {
                tests.push([`${suiteName}/${testName}`]);
                for (const subtestName in firstIterationTests[suiteName].tests[testName].tests)
                    tests.push([`${suiteName}/${testName}/${subtestName}`]);
            }
        }

        // Now push each iteration onto the end of the array
        for (const measuredValue of this._measuredValuesList) {
            let index = 0;
            for (const suiteName in measuredValue.tests) {
                const suiteResults = measuredValue.tests[suiteName];
                tests[index++].push(suiteResults.total);
                for (const testName in suiteResults.tests) {
                    tests[index++].push(suiteResults.tests[testName].total);
                    for (const subtestName in suiteResults.tests[testName].tests)
                        tests[index++].push(suiteResults.tests[testName].tests[subtestName]);
                }
            }
        }

        const csv = [["Name"].concat(this._measuredValuesList.map((_, i) => `#${i + 1}`)).join(",")];
        for (const test of tests)
            csv.push(test.join(","));

        return csv.join("\n");
    }

    copyJsonResults() {
        navigator.clipboard.writeText(this._getFormattedJSONResult());
    }

    copyCSVResults() {
        navigator.clipboard.writeText(this._getFormattedCSVResult());
    }

    _showSection(hash) {
        if (this._isRunning) {
            window.location.hash = "#running";
            return;
        } else if (this._hasResults) {
            if (hash !== "#summary" && hash !== "#details") {
                window.location.hash = "#summary";
                return;
            }
        } else {
            if (hash !== "#home" && hash !== "#about") {
                window.location.hash = "#home";
                return;
            }
        }
        window.location.hash = hash || "#home";
    }
}

const rootStyle = document.documentElement.style;
rootStyle.setProperty("--viewport-width", `${params.viewport.width}px`);
rootStyle.setProperty("--viewport-height", `${params.viewport.height}px`);

globalThis.benchmarkClient = new MainBenchmarkClient();
