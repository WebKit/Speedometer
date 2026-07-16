import { BenchmarkRunner } from "./benchmark-runner.mjs";
import * as Statistics from "./statistics.mjs";
import { SW_MESSAGES } from "./shared/sw-messages.mjs";
import { renderMetricView } from "./metric-ui.mjs";
import { defaultParams, params } from "./shared/params.mjs";
import { createDeveloperModeContainer } from "./developer-mode.mjs";

const PRELOAD_TIMEOUT_MS = 60_000;

export class ResourcePreloader {
    constructor() {
        this._registration = null;
        this._sw = null;
        this._preloadParams = "";
    }

    isCached() {
        return params.toSearchParams() === this._preloadParams;
    }

    async setup() {
        await this._unregisterOldServiceWorkers();

        if (!params.preload) {
            this._registration = null;
            this._sw = null;
            return false;
        }

        await this._registerServiceWorker();
        this._setupMessageListener();

        return true;
    }

    async _unregisterOldServiceWorkers() {
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const existing of existingRegistrations)
            await existing.unregister();
    }

    async _registerServiceWorker() {
        this._registration = await navigator.serviceWorker.register("./sw.mjs", { type: "module" });
        await navigator.serviceWorker.ready;
        this._sw = navigator.serviceWorker.controller || this._registration.active;
    }

    _setupMessageListener() {
        navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data?.type === SW_MESSAGES.FATAL_ERROR)
                globalThis.benchmarkClient?.handleError(new Error(event.data.message));
        });
    }

    _sendMessageWithReply(messageData, onProgress, timeoutMs = 0) {
        if (!this._sw)
            return Promise.resolve();

        return new Promise((resolve, reject) => {
            const channel = new MessageChannel();
            const port = channel.port1;
            let timeoutId = null;

            const cleanup = () => {
                port.onmessage = null;
                if (timeoutId)
                    clearTimeout(timeoutId);
            };

            if (timeoutMs > 0) {
                timeoutId = setTimeout(() => {
                    cleanup();
                    console.error(`Service worker message timed out: ${messageData.type}`);
                    resolve(); // Resolve to not block execution
                }, timeoutMs);
            }

            port.onmessage = (event) => {
                const data = event.data || {};
                if (data.type === SW_MESSAGES.PRELOAD_PROGRESS) {
                    onProgress?.(data);
                    return;
                }
                cleanup();
                if (data.type === "PRELOAD_ABORTED") {
                    resolve({ type: "PRELOAD_ABORTED" });
                    return;
                }
                if (data.type === "ERROR") {
                    reject(new Error(data.message || "Unknown SW Error"));
                    return;
                }

                resolve(data);
            };

            this._sw.postMessage(messageData, [channel.port2]);
        });
    }

    async clearSw() {
        if (!this._sw)
            return;
        await this._sendMessageWithReply({ type: SW_MESSAGES.CLEAR_CACHE });
    }

    async resetPreloading() {
        if (!this._sw)
            return;
        await this._sendMessageWithReply({ type: SW_MESSAGES.RESET_PRELOADING });
        if (this._activePreloadPromise) {
            await this._activePreloadPromise;
        }
    }

    async preloadSuites(suites, resourceLoadDelay, clearCache = true, onProgress) {
        if (!this._sw || suites.length === 0)
            return;

        const suitesData = suites
            .filter((s) => s.resources)
            .map((s) => ({
                name: s.name,
                url: new URL(s.url, window.location.href).href,
                resources: new URL(s.resources, window.location.href).href,
            }));

        if (suitesData.length === 0)
            return;

        const startTime = performance.now();
        this._activePreloadPromise = this._sendMessageWithReply({ type: SW_MESSAGES.PRELOAD_SUITES, suites: suitesData, delay: resourceLoadDelay, clearCache }, onProgress, PRELOAD_TIMEOUT_MS);
        const response = await this._activePreloadPromise;
        this._activePreloadPromise = null;

        if (response?.type === "PRELOAD_ABORTED") {
            return "ABORTED";
        }

        if (response?.type === SW_MESSAGES.PRELOAD_DONE) {
            const timeTakenMs = performance.now() - startTime;
            const sizeMB = (response.transferredSize / (1024 * 1024)).toFixed(2);
            const timeSec = (timeTakenMs / 1000).toFixed(2);
            console.log(`Preloaded ${response.count} files (${sizeMB} MB transferred) in ${timeSec}s`);
        }
        this._preloadParams = params.toSearchParams();
    }
}

const BENCHMARK_STATE = Object.freeze({
    IDLE: "IDLE",
    PRELOADING: "PRELOADING",
    READY: "READY",
    RUNNING: "RUNNING",
    DONE: "DONE",
    ERROR: "ERROR",
});

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
    _metrics = Object.create(null);
    _resourcePreloader = new ResourcePreloader();
    _steppingPromise = null;
    _steppingResolver = null;
    _benchmarkConfiguratorPromise = null;

    constructor() {
        this._benchmarkConfiguratorPromise = import("./benchmark-configurator.mjs");
        this.prepareUI();
        this.evaluateParams();
        this._showSection(window.location.hash);

        this._benchmarkConfiguratorPromise.then(() => {
            window.dispatchEvent(new Event("SpeedometerReady"));
        });
    }

    async start() {
        if (this._isStepping())
            this._clearStepping();
        else if (await this._startBenchmark())
            this._showSection("#running");
    }

    async step() {
        const currentSteppingResolver = this._steppingResolver;
        this._steppingPromise = new Promise((resolve) => {
            this._steppingResolver = resolve;
        });
        currentSteppingResolver?.();
        if (!this._isRunning) {
            await this._startBenchmark();
            this._showSection("#running");
        }
    }

    _clearStepping() {
        const currentSteppingResolver = this._steppingResolver;
        this._steppingPromise = null;
        this._steppingResolver = null;
        currentSteppingResolver?.();
    }

    async _awaitNextStep(suite, test) {
        console.log(`Next Step: ${suite.name} ${test.name}`, { suite, test });
        await this._steppingPromise;
    }

    _isStepping() {
        return this._steppingResolver !== null;
    }

    async _startBenchmark() {
        if (this._isRunning)
            return false;

        const { benchmarkConfigurator } = await this._benchmarkConfiguratorPromise;

        const enabledSuites = benchmarkConfigurator.suites.filter((suite) => suite.enabled);
        const totalSuitesCount = enabledSuites.length;

        if (totalSuitesCount === 0) {
            const message = `No suites selected - "${params.suites}" does not exist.`;
            alert(message);
            console.error(
                message,
                params.suites,
                "\nValid values:",
                benchmarkConfigurator.suites.map((each) => each.name)
            );
            return false;
        }
        if (!this._isStepping())
            this._developerModeContainer?.remove();

        await this._resourcePreloader.resetPreloading();
        const preloadResult = await this._setupResourcePreloader(benchmarkConfigurator);
        if (preloadResult === "ABORTED") return false;

        try {
            await this._setBenchmarkState(BENCHMARK_STATE.RUNNING);
        } catch (error) {
            alert(error.message);
            return false;
        }

        this._progressCompleted = document.getElementById("progress-completed");
        if (params.iterationCount < 50) {
            const progressNode = document.getElementById("progress");
            for (let i = 1; i < params.iterationCount; i++) {
                const iterationMarker = progressNode.appendChild(document.createElement("div"));
                iterationMarker.className = "iteration-marker";
                iterationMarker.style.left = `${(i / params.iterationCount) * 100}%`;
            }
        }

        this._metrics = Object.create(null);
        this._isRunning = true;

        this.stepCount = params.iterationCount * totalSuitesCount;
        this._progressCompleted.max = this.stepCount;
        this.suitesCount = enabledSuites.length;
        const runner = new BenchmarkRunner(benchmarkConfigurator.suites, this);
        runner.runMultipleIterations(params.iterationCount);
        return true;
    }

    get metrics() {
        return this._metrics;
    }

    willAddTestFrame(frame) {
        frame.style.left = "50%";
        frame.style.top = "50%";
        frame.style.transform = "translate(-50%, -50%)";
    }

    async willRunTest(suite, test) {
        document.getElementById("info-label").textContent = suite.name;
        document.getElementById("info-progress").textContent = `${this._finishedTestCount} / ${this.stepCount}`;
        if (this._steppingPromise)
            await this._awaitNextStep(suite, test);
    }

    async didFinishSuite(suite) {
        this._finishedTestCount++;
        this._progressCompleted.value = this._finishedTestCount;
        if (this._steppingPromise)
            await this._awaitNextStep(suite, { name: "Finished" });
    }

    didRunSuites(measuredValues) {
        this._measuredValuesList.push(measuredValues);
    }

    willStartFirstIteration() {
        this._measuredValuesList = [];
        this._finishedTestCount = 0;
    }

    async didFinishLastIteration(metrics) {
        console.assert(this._isRunning);
        this._isRunning = false;

        const response = await this._resourcePreloader._sendMessageWithReply({ type: SW_MESSAGES.GET_FAILED_REQUESTS });
        if (response?.requests && response.requests.length > 0) {
            console.warn("The following requests failed during the benchmark and bypassed the cache:");
            console.warn(response.requests.join("\n"));
            alert("Warning: The benchmark had missing resources that were not cached. Check the console for details.");
        }

        this._hasResults = true;
        this._metrics = metrics;
        this._setBenchmarkState(BENCHMARK_STATE.DONE);

        const scoreResults = this._computeResults(this._measuredValuesList, "score");
        if (scoreResults.isValid)
            this._populateValidScore(scoreResults);
        else
            this._populateInvalidScore();

        this._populateDetailedResults(metrics);
        if (params.developerMode)
            this.showResultsDetails();
        else
            this.showResultsSummary();
        globalThis.dispatchEvent(new Event("SpeedometerDone"));
    }

    handleError(error) {
        console.assert(this._isRunning);
        this._isRunning = false;
        this._hasResults = true;
        this._metrics = Object.create(null);
        this._setBenchmarkState(BENCHMARK_STATE.ERROR);
        this._populateInvalidScore(error.message);
        this.showResultsSummary();
        throw error;
    }

    _populateValidScore(scoreResults) {
        document.getElementById("summary").className = "valid";

        this._updateGaugeNeedle(scoreResults.mean);
        document.getElementById("result-number").textContent = scoreResults.formattedMean;
        if (scoreResults.formattedDelta)
            document.getElementById("confidence-number").textContent = `\u00b1 ${scoreResults.formattedDelta}`;
    }

    _populateInvalidScore(errorText) {
        document.getElementById("summary").className = "invalid";
        document.getElementById("result-number").textContent = "Error";
        document.getElementById("confidence-number").textContent = "";

        const invalidScoreText = document.getElementById("invalid-score-text");
        if (errorText) {
            invalidScoreText.textContent = errorText;
        } else {
            invalidScoreText.innerHTML = `
                One or more subtests produced no duration.<br />
                Please check your <a href="./instructions.html" target="_blank">browser settings</a> and re-run the benchmark.<br />
            `;
        }
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
        const sum = values.reduce((a, b) => a + b, 0);
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
            isValid: values.length > 0 && isFinite(sum) && sum > 0,
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
        this._populateNonStandardParams();
        const trackHeight = 24;
        document.documentElement.style.setProperty("--metrics-line-height", `${trackHeight}px`);
        const plotWidth = (params.viewport.width - 120) / 2;
        const aggregateMetrics = [metrics.Geomean];
        if (params.measurePrepare)
            aggregateMetrics.push(metrics.Prepare);
        document.getElementById("aggregate-chart").innerHTML = renderMetricView({
            metrics: aggregateMetrics,
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
        const classicJsonData = this._formattedJSONResult({ modern: false });
        const classicJsonLink = document.getElementById("download-classic-json");
        classicJsonLink.href = URL.createObjectURL(new Blob([classicJsonData], { type: "application/json" }));
        classicJsonLink.setAttribute("download", `${filePrefix}.json`);

        const fullJsonLink = document.getElementById("download-full-json");
        const fullJsonData = this._formattedJSONResult({ modern: true });
        fullJsonLink.href = URL.createObjectURL(new Blob([fullJsonData], { type: "application/json" }));
        fullJsonLink.setAttribute("download", `${filePrefix}.json`);

        const csvData = this._formattedCSVResult();
        const csvLink = document.getElementById("download-csv");
        csvLink.href = URL.createObjectURL(new Blob([csvData], { type: "text/csv" }));
        csvLink.setAttribute("download", `${filePrefix}.csv`);
    }

    _populateNonStandardParams() {
        if (params.isDefault())
            return;
        const paramsDiff = [];
        const usedSearchparams = params.toSearchParamsObject();
        const defaultSearchParams = defaultParams.toCompleteSearchParamsObject(false);
        for (const [key, value] of usedSearchparams.entries()) {
            if (key === "developerMode")
                continue;
            const defaultValue = defaultSearchParams.get(key);
            if (value !== defaultValue)
                paramsDiff.push({ key, value, defaultValue });
        }
        if (paramsDiff.length === 0)
            return;
        const body = document.createElement("tbody");
        for (const { key, value, defaultValue } of paramsDiff) {
            const row = body.insertRow();
            row.insertCell().textContent = key;
            row.insertCell().textContent = value;
            row.insertCell().textContent = defaultValue;
        }
        const table = document.getElementById("non-standard-params-table");
        table.replaceChild(body, table.tBodies[0]);
        document.querySelector(".non-standard-params").style.display = "block";
    }

    prepareUI() {
        window.addEventListener("hashchange", this._hashChangeHandler.bind(this));
        window.addEventListener("resize", this._resizeScreeHandler.bind(this));
        this._resizeScreeHandler();

        document.querySelectorAll("logo").forEach((button) => {
            button.onclick = this._logoClickHandler.bind(this);
        });
        document.getElementById("copy-full-json").onclick = this.copyJsonResults.bind(this);
        document.getElementById("copy-csv").onclick = this.copyCSVResults.bind(this);
        document.querySelectorAll(".start-tests-button").forEach((button) => {
            button.onclick = this._startBenchmarkHandler.bind(this);
            button.disabled = true;
        });
    }

    async evaluateParams() {
        const { benchmarkConfigurator } = await this._benchmarkConfiguratorPromise;

        if (params.suites.length > 0 || params.tags.length > 0)
            benchmarkConfigurator.enableSuites(params.suites, params.tags);

        if (params.developerMode) {
            this._developerModeContainer = createDeveloperModeContainer();
            document.body.append(this._developerModeContainer);
        }

        await this._resourcePreloader.resetPreloading();
        const preloadResult = await this._setupResourcePreloader(benchmarkConfigurator);
        if (preloadResult === "ABORTED") return;

        if (params.startAutomatically)
            this.start();
    }

    async _setupResourcePreloader(benchmarkConfigurator) {
        await this._resourcePreloader.setup();
        if (!this._resourcePreloader.isCached())
            return await this._cacheResources(benchmarkConfigurator);
    }

    async _cacheResources(benchmarkConfigurator) {
        const enabledSuites = benchmarkConfigurator.suites.filter((suite) => suite.enabled);
        const clearCache = !params.isDefault();
        
        if (this._state === BENCHMARK_STATE.PRELOADING) {
            this._resetPreloadUI();
        }
        this._setBenchmarkState(BENCHMARK_STATE.PRELOADING);
        
        this._preloadGeneration = (this._preloadGeneration || 0) + 1;
        const currentGeneration = this._preloadGeneration;
        const onProgress = (data) => {
            if (this._preloadGeneration === currentGeneration)
                this._updateCacheProgress(data);
        };

        try {
            const result = await this._resourcePreloader.preloadSuites(enabledSuites, params.resourceLoadDelay, clearCache, onProgress);
            if (result === "ABORTED") return "ABORTED";
            this._enableStartButtons();
        } catch (error) {
            console.error("Service Worker preload failed:", error);
            this._setBenchmarkState(BENCHMARK_STATE.ERROR);
            this._populateInvalidScore(error?.message);
            this.showResultsSummary();
            throw error;
        }
    }

    _resetPreloadUI() {
        document.getElementById("preload-progress-completed").value = 0;
        document.getElementById("preload-info-label").textContent = "";
        document.getElementById("preload-info-progress").textContent = "";
        document.body.style.setProperty("--preload-progress", "0%");
    }

    _updateCacheProgress(progressData) {
        const { loaded, total, url, suiteName } = progressData;
        document.body.style.setProperty("--preload-progress", `${total > 0 ? (loaded / total) * 100 : 100}%`);
        const progress = document.getElementById("preload-progress-completed");
        progress.max = total;
        progress.value = loaded;
        let filename = url ? url.substring(url.lastIndexOf("/") + 1) : "";
        if (!filename && url) filename = url.substring(url.lastIndexOf("/", url.length - 2) + 1);
        const labelText = suiteName ? `${suiteName}: ${filename}` : filename;
        document.getElementById("preload-info-label").textContent = labelText;
        document.getElementById("preload-info-progress").textContent = `${loaded} / ${total}`;
    }

    _enableStartButtons() {
        this._setBenchmarkState(BENCHMARK_STATE.READY);
        document.querySelectorAll(".start-tests-button").forEach((button) => {
            button.disabled = false;
        });
    }

    async _setBenchmarkState(state) {
        document.body.setAttribute("data-benchmark-state", state);

        const startButtons = document.querySelectorAll(".start-tests-button");
        if (state === BENCHMARK_STATE.PRELOADING) {
            this._resetPreloadUI();
            startButtons.forEach((btn) => btn.innerHTML = "<div>Preloading</div>");
        } else if (state !== BENCHMARK_STATE.RUNNING) {
            document.body.style.removeProperty("--preload-progress");
            startButtons.forEach((btn) => btn.innerHTML = "<div>Start Test</div>");
            if (state !== BENCHMARK_STATE.READY)
                await this._resourcePreloader?.clearSw();
        }
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
        this.start();
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

    _formattedJSONResult({ modern = false }) {
        const indent = "    ";
        if (modern)
            return JSON.stringify(this._metrics, undefined, indent);
        return JSON.stringify(this._measuredValuesList, undefined, indent);
    }

    _formattedCSVResult() {
        // The CSV format is similar to the details view table. Each measurement is a row with
        // the name and N columns with the measurement for each iteration:
        // ```
        // Measurement,#1,...,#N
        // TodoMVC-JavaScript-ES5/Total,num,...,num
        // TodoMVC-JavaScript-ES5/Adding100Items,num,...,num
        // ...
        const labels = ["Name"];
        for (let i = 0; i < params.iterationCount; i++)
            labels.push(`#${i + 1}`);
        labels.push("Mean");
        const metrics = Array.from(Object.values(this._metrics)).filter((metric) => !metric.name.startsWith("Iteration-"));
        const metricsValues = metrics.map((metric) => [metric.name, ...metric.values, metric.mean].join(","));
        const csv = [labels.join(","), ...metricsValues];

        return csv.join("\n");
    }

    copyJsonResults() {
        navigator.clipboard.writeText(this._formattedJSONResult({ modern: true }));
    }

    copyCSVResults() {
        navigator.clipboard.writeText(this._formattedCSVResult());
    }

    _showSection(hash) {
        if (this._isRunning) {
            this._setLocationHash("#running");
            return;
        } else if (this._hasResults) {
            if (hash !== "#summary" && hash !== "#details") {
                this._setLocationHash("#summary");
                return;
            }
        } else if (hash !== "#home" && hash !== "") {
            // Redirect invalid views to #home directly.
            this._setLocationHash("#home");
            return;
        }
        this._setLocationHash(hash);
    }

    _setLocationHash(hash) {
        if (hash === "#home" || hash === "") {
            if (window.location.hash !== hash)
                window.location.hash = "#home";
            hash = "#home";
            this._removeLocationHash();
        } else {
            window.location.hash = hash;
        }
        this._updateVisibleSectionAttribute(hash);
        this._updateDocumentTitle(hash);
    }

    _updateVisibleSectionAttribute(hash) {
        const sectionId = hash.substring(1);
        document.documentElement.setAttribute("data-visible-section", sectionId);
    }

    _updateDocumentTitle(hash) {
        const maybeSection = document.querySelector(hash);
        const sectionTitle = maybeSection?.getAttribute("data-title") ?? "";
        document.title = `Speedometer 3 ${sectionTitle}`.trimEnd();
    }

    _removeLocationHash() {
        const location = window.location;
        window.history.pushState("", document.title, location.pathname + location.search);
    }
}

function init() {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--viewport-width", `${params.viewport.width}px`);
    rootStyle.setProperty("--viewport-height", `${params.viewport.height}px`);

    globalThis.benchmarkClient = new MainBenchmarkClient();
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
else
    init();
