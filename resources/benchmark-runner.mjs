import { Metric, MILLISECONDS_PER_MINUTE } from "./metric.mjs";
import { params } from "./params.mjs";

const performance = globalThis.performance;

export class BenchmarkTestStep {
    constructor(testName, testFunction) {
        this.name = testName;
        this.run = testFunction;
    }
}

class Page {
    constructor(frame) {
        this._frame = frame;
    }

    async waitForElement(selector) {
        return new Promise((resolve) => {
            const resolveIfReady = () => {
                const element = this.querySelector(selector);
                if (element) {
                    window.requestAnimationFrame(() => {
                        return resolve(element);
                    });
                } else {
                    setTimeout(resolveIfReady, 50);
                }
            };
            resolveIfReady();
        });
    }

    querySelector(selector) {
        const element = this._frame.contentDocument.querySelector(selector);
        if (element === null)
            return null;
        return this._wrapElement(element);
    }

    querySelectorAll(selector) {
        const elements = Array.from(this._frame.contentDocument.querySelectorAll(selector));
        for (let i = 0; i < elements.length; i++)
            elements[i] = this._wrapElement(elements[i]);
        return elements;
    }

    getElementById(id) {
        const element = this._frame.contentDocument.getElementById(id);
        if (element === null)
            return null;
        return this._wrapElement(element);
    }

    call(function_name) {
        this._frame.contentWindow[function_name]();
        return null;
    }

    _wrapElement(element) {
        return new PageElement(element);
    }
}

const NATIVE_OPTIONS = {
    bubbles: true,
    cancellable: true,
};

class PageElement {
    #node;

    constructor(node) {
        this.#node = node;
    }

    setValue(value) {
        this.#node.value = value;
    }

    click() {
        this.#node.click();
    }

    focus() {
        this.#node.focus();
    }

    dispatchEvent(eventName, options = NATIVE_OPTIONS, eventType = Event) {
        if (eventName === "submit")
            // FIXME FireFox doesn't like `new Event('submit')
            this._dispatchSubmitEvent();
        else
            this.#node.dispatchEvent(new eventType(eventName, options));
    }

    _dispatchSubmitEvent() {
        const submitEvent = document.createEvent("Event");
        submitEvent.initEvent("submit", true, true);
        this.#node.dispatchEvent(submitEvent);
    }

    enter(type, options = undefined) {
        const ENTER_KEY_CODE = 13;
        let eventOptions = {
            bubbles: true,
            cancelable: true,
            keyCode: ENTER_KEY_CODE,
            which: ENTER_KEY_CODE,
            key: "Enter",
        };
        if (options !== undefined)
            eventOptions = Object.assign(eventOptions, options);
        const event = new KeyboardEvent(type, eventOptions);
        this.#node.dispatchEvent(event);
    }
}

// The WarmupSuite is used to make sure all runner helper functions and
// classes are compiled, to avoid unnecessary pauses due to delayed
// compilation of runner methods in the middle of the measuring cycle.
const WarmupSuite = {
    name: "Warmup",
    url: "warmup/index.html",
    async prepare(page) {
        await page.waitForElement("#testItem");
    },
    tests: [
        // Make sure to run ever page.method once at least
        new BenchmarkTestStep("WarmingUpPageMethods", (page) => {
            let results = [];
            results.push(page.querySelector(".testItem"));
            results.push(page.querySelectorAll(".item"));
            results.push(page.getElementById("testItem"));
        }),
        new BenchmarkTestStep("WarmingUpPageElementMethods", (page) => {
            const item = page.getElementById("testItem");
            item.setValue("value");
            item.click();
            item.focus();
            item.dispatchEvent("change");
            item.enter("keypress");
            item.dispatchEvent("input");
            item.enter("keyup");
        }),
        new BenchmarkTestStep("WarmingUpPageElementMouseMethods", (page) => {
            const item = page.getElementById("testItem");
            const mouseEventOptions = { clientX: 100, clientY: 100, bubbles: true, cancelable: true };
            const wheelEventOptions = {
                clientX: 200,
                clientY: 200,
                deltaMode: 0,
                delta: -10,
                deltaY: -10,
                bubbles: true,
                cancelable: true,
            };
            item.dispatchEvent("mousedown", mouseEventOptions, MouseEvent);
            item.dispatchEvent("mousemove", mouseEventOptions, MouseEvent);
            item.dispatchEvent("mouseup", mouseEventOptions, MouseEvent);
            item.dispatchEvent("wheel", wheelEventOptions, WheelEvent);
        }),
    ],
};

export class BenchmarkRunner {
    constructor(suites, client) {
        this._suites = suites;
        if (params.useWarmupSuite)
            this._suites = [WarmupSuite, ...suites];
        this._client = client;
        this._page = null;
        this._metrics = null;
        this._iterationCount = params.iterationCount;
    }

    async runMultipleIterations(iterationCount) {
        this._iterationCount = iterationCount;
        if (this._client?.willStartFirstIteration)
            await this._client.willStartFirstIteration(iterationCount);
        for (let i = 0; i < iterationCount; i++)
            await this._runAllSuites();
        if (this._client?.didFinishLastIteration)
            await this._client.didFinishLastIteration(this._metrics);
    }

    _removeFrame() {
        if (this._frame) {
            this._frame.parentNode.removeChild(this._frame);
            this._frame = null;
        }
    }

    async _appendFrame(src) {
        const frame = document.createElement("iframe");
        const style = frame.style;
        style.width = `${params.viewport.width}px`;
        style.height = `${params.viewport.height}px`;
        style.border = "0px none";
        style.position = "absolute";
        frame.setAttribute("scrolling", "no");
        frame.className = "test-runner";
        const computedStyle = getComputedStyle(document.body);
        const marginLeft = parseInt(computedStyle.marginLeft);
        const marginTop = parseInt(computedStyle.marginTop);
        if (window.innerWidth > params.viewport.width + marginLeft && window.innerHeight > params.viewport.height + marginTop) {
            style.left = `${marginLeft}px`;
            style.top = `${marginTop}px`;
        } else {
            style.left = "0px";
            style.top = "0px";
        }

        if (this._client?.willAddTestFrame)
            await this._client.willAddTestFrame(frame);

        document.body.insertBefore(frame, document.body.firstChild);
        this._frame = frame;
        return frame;
    }

    async _runAllSuites() {
        this._measuredValues = { tests: {}, total: 0, mean: NaN, geomean: NaN, score: NaN };

        this._removeFrame();
        await this._appendFrame();
        this._page = new Page(this._frame);

        for (const suite of this._suites) {
            if (!suite.disabled)
                await this._runSuite(suite);
        }

        // Remove frame to clear the view for displaying the results.
        this._removeFrame();
        await this._finalize();
    }

    async _runSuite(suite) {
        const suitePrepareLabel = `suite-${suite.name}-prepare`;
        const suiteStartLabel = `suite-${suite.name}-start`;
        const suiteEndLabel = `suite-${suite.name}-end`;

        performance.mark(suitePrepareLabel);
        await this._prepareSuite(suite);
        
        performance.mark(suiteStartLabel);
        for (const test of suite.tests)
            await this._runTestAndRecordResults(suite, test);
        performance.mark(suiteEndLabel);

        performance.measure(`suite-${suite.name}`, suiteStartLabel, suiteEndLabel);
    }

    async _prepareSuite(suite) {
        return new Promise((resolve) => {
            const frame = this._page._frame;
            frame.onload = async () => {
                await suite.prepare(this._page);
                resolve();
            };
            frame.src = `resources/${suite.url}`;
        });
    }

    async _runTestAndRecordResults(suite, test) {
        /* eslint-disable-next-line no-async-promise-executor */
        return new Promise(async (resolve) => {
            if (this._client?.willRunTest)
                await this._client.willRunTest(suite, test);

            setTimeout(() => {
                this._runTest(suite, test, this._page, resolve);
            }, 0);
        });
    }

    // This function ought be as simple as possible. Don't even use Promise.
    _runTest(suite, test, page, testDoneCallback) {
        // Prepare all mark labels outside the measuring loop.
        const startLabel = `${suite.name}.${test.name}-start`;
        const syncEndLabel = `${suite.name}.${test.name}-sync-end`;
        const asyncStartLabel = `${suite.name}.${test.name}-async-start`;
        const asyncEndLabel = `${suite.name}.${test.name}-async-end`;

        performance.mark(startLabel);
        const syncStartTime = performance.now();
        test.run(page);
        const syncEndTime = performance.now();
        performance.mark(syncEndLabel);

        const syncTime = syncEndTime - syncStartTime;

        performance.mark(asyncStartLabel);
        const asyncStartTime = performance.now();
        setTimeout(() => {
            // Some browsers don't immediately update the layout for paint.
            // Force the layout here to ensure we're measuring the layout time.
            const height = this._frame.contentDocument.body.getBoundingClientRect().height;
            const asyncEndTime = performance.now();
            const asyncTime = asyncEndTime - asyncStartTime;
            this._frame.contentWindow._unusedHeightValue = height; // Prevent dead code elimination.
            performance.mark(asyncEndLabel);
            performance.measure(`${suite.name}.${test.name}-sync`, startLabel, syncEndLabel);
            performance.measure(`${suite.name}.${test.name}-async`, asyncStartLabel, asyncEndLabel);
            window.requestAnimationFrame(() => {
                this._recordTestResults(suite, test, syncTime, asyncTime, height, testDoneCallback);
            });
        }, 0);
    }

    async _recordTestResults(suite, test, syncTime, asyncTime, unused_height, testDoneCallback) {
        // Skip reporting updates for the warmup suite.
        if (suite === WarmupSuite) {
            testDoneCallback();
            return;
        }
        const suiteResults = this._measuredValues.tests[suite.name] || { tests: {}, total: 0 };
        const total = syncTime + asyncTime;
        this._measuredValues.tests[suite.name] = suiteResults;
        suiteResults.tests[test.name] = { tests: { Sync: syncTime, Async: asyncTime }, total: total };
        suiteResults.total += total;

        if (this._client?.didRunTest)
            await this._client.didRunTest(suite, test);

        testDoneCallback();
    }

    async _finalize() {
        this._appendIterationMetrics();
        if (this._client?.didRunSuites) {
            let product = 1;
            const values = [];
            for (const suiteName in this._measuredValues.tests) {
                const suiteTotal = this._measuredValues.tests[suiteName].total;
                product *= suiteTotal;
                values.push(suiteTotal);
            }

            values.sort((a, b) => a - b); // Avoid the loss of significance for the sum.
            const total = values.reduce((a, b) => a + b);
            const geomean = Math.pow(product, 1 / values.length);

            const correctionFactor = 3; // This factor makes the test score look reasonably fit within 0 to 140.
            this._measuredValues.total = total;
            this._measuredValues.mean = total / values.length;
            this._measuredValues.geomean = geomean;
            this._measuredValues.score = (60 * 1000) / geomean / correctionFactor;
            await this._client.didRunSuites(this._measuredValues);
        }
    }

    getIterationTotalMetric(i) {
        if (i >= params.iterationCount)
            throw new Error(`Requested iteration=${i} does not exist.`);
        return this.getMetric(`Iteration-${i}-Total`);
    }

    _appendIterationMetrics() {
        const getMetric = (name) => this._metrics[name] || (this._metrics[name] = new Metric(name));
        const getIterationTotalMetric = (i) => getMetric(`Iteration-${i}-Total`);
        const collectSubMetrics = (prefix, items, parent) => {
            for (let name in items) {
                const results = items[name];
                const metric = getMetric(prefix + name);
                metric.add(results.total ?? results);
                if (metric.parent !== parent)
                    parent.addChild(metric);
                if (results.tests)
                    collectSubMetrics(`${metric.name}${Metric.separator}`, results.tests, metric);
            }
        };
        const initializeMetrics = this._metrics === null;
        if (initializeMetrics)
            this._metrics = { __proto__: null };

        const iterationResults = this._measuredValues.tests;
        collectSubMetrics("", iterationResults);

        if (initializeMetrics) {
            // Prepare all iteration metrics so they are listed at the end of
            // of the _metrics object, before "Total" and "Score".
            for (let i = 0; i < this._iterationCount; i++)
                getIterationTotalMetric(i);
            getMetric("Geomean");
            getMetric("Score");
        }

        const iterationTotal = getIterationTotalMetric(this._metrics.Geomean.length);
        for (const results of Object.values(iterationResults))
            iterationTotal.add(results.total);
        iterationTotal.computeAggregatedMetrics();
        getMetric("Geomean").add(iterationTotal.geomean);
        getMetric("Score").add(MILLISECONDS_PER_MINUTE / iterationTotal.geomean);

        for (const metric of Object.values(this._metrics))
            metric.computeAggregatedMetrics();
    }
}
