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

<<<<<<< HEAD

=======
>>>>>>> 2023-04-19_raf_async
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

class MeasureStep {
    constructor(runner, suite, test, page, frame) {
        this._runner = runner;
        this.suite = suite;
        this.test = test;
        this._page = page;
        this._frame = frame;

        this._unusedHeight = undefined;

        this._wasRun = false;

        this._asyncMeasurePromise = new Promise((resolve) => {
            this._asyncDoneCallback = resolve;
        });
        this._measureSyncCallback = this._measureSync.bind(this);
        this._measureAsyncTimeoutCallback = this._measureAsyncTimeout.bind(this);
        this._scheduleMeasureAsyncRafCallback = this._scheduleMeasureAsyncRaf.bind(this);
        this._measureAsyncRafCallback = this._measureAsyncRaf.bind(this);

        this.syncTime = 0;
        this.asyncTime = 0;
        this.layoutTime = 0;

        this._asyncStartTime = 0;

        const label = `${suite.name}.${test.name}`;
        this._startLabel = `${label}-start`;
        this._syncEndLabel = `${label}-sync-end`;
        this._asyncStartLabel = `${label}-async-start`;
        this._asyncEndLabel = `${label}-async-end`;
        this._forcedLayoutStartLabel = `${label}-layout-start`;
        this._forcedLayoutEndLabel = `${label}-layout-end`;

        this._asyncMetricMode = params.asyncMetric;
    }

    async run() {
        if (this._wasRun)
            throw Error("MeasureStep can only run once.");
        if (this._asyncMetricMode === "timeout") {
            // 1. Schedule setTimeout measure-and-run sync work
            // 2. setTimeout callback:
            //    - start("sync time")
            //    - run()
            //    - end("sync time")
            //    - Schedule setTimeout(..., 0)
            //    - start("async time")
            // 3. Potential async work
            // 4. setTimeout callback: end("async time")
            setTimeout(this._measureSyncCallback, 0);
        } else if (this._asyncMetricMode === "raf") {
            // 1. Schedule rAF callbacks:
            //    - Schedule rAF 1: measure-and-run sync work
            //    - Schedule rAF 2: measure async work
            // 2. rAF 1 callback:
            //    - start("sync time")
            //    - run()
            //    - end("sync time")
            //    - start("async time")
            // 3. rAF 2 callback: Schedule setTimeout(..., 0) measure task
            // 4. Potential async work
            // 5. setTimeout-callback: end("async time")
            requestAnimationFrame(this._measureSyncCallback);
            requestAnimationFrame(this._measureAsyncRafCallback);
        } else {
            throw new Error(`Unknown async measure mode: ${this._asyncMetricMode}`);
        }
        await this._done();
        this._wasRun = true;
    }

    _measureSync() {
        // This function ought be as simple as possible. Don't even use Promise.
        performance.mark(this._startLabel);
        const syncStartTime = performance.now();
        this.test.run(this._page);
        const syncEndTime = performance.now();
        performance.mark(this._syncEndLabel);

        this.syncTime = syncEndTime - syncStartTime;

        performance.mark(this._asyncStartLabel);
        if (this._asyncMetricMode === "timeout")
            setTimeout(this._measureAsyncTimeoutCallback, 0);
        this._asyncStartTime = performance.now();
    }

    _measureForceLayout() {
        performance.mark(this._forcedLayoutStartLabel);
        const startTime = performance.now();
        this._unusedHeight = this._frame.contentDocument.body.getBoundingClientRect().height;
        const endTime = performance.now();
        performance.mark(this._forcedLayoutEndLabel);
        this.layoutTime = endTime - startTime;
        // Prevent dead code elimination.
        this._frame.contentWindow._unusedHeightValue = this._unusedHeight;
    }

    _measureAsyncTimeout() {
        this._measureForceLayout();
        const endTime = performance.now();
        this.asyncTime = endTime - this._asyncStartTime;
        performance.mark(this._asyncEndLabel);
        this._asyncDoneCallback();
    }

    _scheduleMeasureAsyncRaf() {
        // Delay measuring to capture any additional async tasks.
        setTimeout(this._measureAsyncRafCallback, 0);
    }

    _measureAsyncRaf() {
        const endTime = performance.now();
        this.asyncTime = endTime - this._asyncStartTime;
        performance.mark(this._asyncEndLabel);
        this._asyncDoneCallback();
    }

    async _done() {
        await this._asyncMeasurePromise;
        const label = `${this.suite.name}.${this.test.name}`;
        performance.measure(`${label}-sync`, this._startLabel, this._syncEndLabel);
        performance.measure(`${label}-async`, this._asyncStartLabel, this._asyncEndLabel);
        if (this._asyncMetricMode === "timeout")
            performance.measure(`${label}-layout`, this._forcedLayoutStartLabel, this._forcedLayoutEndLabel);
        await new Promise(requestAnimationFrame);
    }
}

export class BenchmarkRunner {
    constructor(suites, client) {
        this._suites = suites;
        if (params.useWarmupSuite)
            this._suites = [WarmupSuite, ...suites];
        this._client = client;
        this._page = null;
        this._metrics = {
            __proto__: null,
            Total: new Metric("Total"),
            Score: new Metric("Score", "score"),
        };
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

    async runMultipleIterations(iterationCount) {
        if (this._client?.willStartFirstIteration)
            await this._client.willStartFirstIteration(iterationCount);
        for (let i = 0; i < iterationCount; i++)
            await this._runAllSuites();
        if (this._client?.didFinishLastIteration)
            await this._client.didFinishLastIteration(this._metrics);
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
        if (this._client?.willRunTest)
            await this._client.willRunTest(suite, test);
        const task = new MeasureStep(this, suite, test, this._page, this._frame);
        await task.run();
        await this._recordTestResults(task);
    }

    async _recordTestResults(task) {
        const suite = task.suite;
        const test = task.test;
        const suiteResults = this._measuredValues.tests[suite.name] || { tests: {}, total: 0 };
        const total = task.syncTime + task.asyncTime;
        this._measuredValues.tests[suite.name] = suiteResults;
        suiteResults.tests[test.name] = {
            tests: {
                Sync: task.syncTime,
                Layout: task.layoutTime,
                Async: task.asyncTime,
            },
            total: total,
        };
        suiteResults.total += total;

        if (this._client?.didRunTest)
            await this._client.didRunTest(suite, test);
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
    _appendIterationMetrics() {
        const getMetric = (name) => this._metrics[name] || (this._metrics[name] = new Metric(name));

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

        const iterationResults = this._measuredValues.tests;
        const iterationTotal = getMetric(`Iteration-${this._metrics.Total.length}-Total`);
        for (const results of Object.values(iterationResults))
            iterationTotal.add(results.total);
        iterationTotal.computeAggregatedMetrics();

        this._metrics.Total.add(iterationTotal.sum);
        this._metrics.Score.add(MILLISECONDS_PER_MINUTE / iterationTotal.sum);
        collectSubMetrics("", iterationResults);

        for (const metric of Object.values(this._metrics))
            metric.computeAggregatedMetrics();
    }
}
