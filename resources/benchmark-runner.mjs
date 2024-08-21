import { Metric } from "./metric.mjs";
import { params } from "./params.mjs";

const performance = globalThis.performance;

export class BenchmarkTestStep {
    constructor(testName, testFunction) {
        this.name = testName;
        this.run = testFunction;
    }
}

function getParent(lookupStartNode, path) {
    const parent = path.reduce((root, selector) => {
        const node = root.querySelector(selector);
        return node.shadowRoot ?? node;
    }, lookupStartNode);

    return parent;
}

export function loadFrame({ frame, url }) {
    return new Promise((resolve, reject) => {
        frame.onload = () => {
            resolve({ type: "load-frame", status: "success" });
        };
        frame.onerror = () => reject({ type: "load-frame", status: "error" });
        frame.src = url;
    });
}

export function postMessageSent({ type }) {
    return new Promise((resolve) => {
        // eslint-disable-next-line consistent-return
        window.onmessage = (e) => {
            if (e.data.type === type) {
                window.onmessage = null;
                return resolve(e.data);
            }
        };
    });
}

export function startSubscription({ type, callback }) {
    const handleMessage = (e) => {
        if (e.data.type !== type)
            return;

        callback?.(e);
    };

    const stopSubscription = () => {
        window.removeEventListener("message", handleMessage);
    };

    window.addEventListener("message", handleMessage);

    return { stopSubscription };
}

class Page {
    constructor(frame) {
        this._frame = frame;
    }

    getLocalStorage() {
        return this._frame.contentWindow.localStorage;
    }

    layout() {
        const body = this._frame.contentDocument.body.getBoundingClientRect();
        this.layout.e = document.elementFromPoint((body.width / 2) | 0, (body.height / 2) | 0);
    }

    async waitForElement(selector) {
        return new Promise((resolve) => {
            const resolveIfReady = () => {
                const element = this.querySelector(selector);
                let callback = resolveIfReady;
                if (element)
                    callback = () => resolve(element);
                window.requestAnimationFrame(callback);
            };
            resolveIfReady();
        });
    }

    /**
     * Returns the first element within the document that matches the specified selector, or group of selectors.
     * If no matches are found, null is returned.
     *
     * An optional path param is added to be able to target elements within a shadow DOM or nested shadow DOMs.
     *
     * @example
     * // DOM structure: <todo-app> -> #shadow-root -> <todo-list> -> #shadow-root -> <todo-item>
     * // return PageElement(<todo-item>)
     * querySelector("todo-item", ["todo-app", "todo-list"]);
     *
     * @param {string} selector A string containing one or more selectors to match.
     * @param {string[]} [path] An array containing a path to the parent element.
     * @returns PageElement | null
     */
    querySelector(selector, path = []) {
        const lookupStartNode = this._frame.contentDocument;
        const element = getParent(lookupStartNode, path).querySelector(selector);

        if (element === null)
            return null;
        return this._wrapElement(element);
    }

    /**
     * Returns all elements within the document that matches the specified selector, or group of selectors.
     * If no matches are found, null is returned.
     *
     * An optional path param is added to be able to target elements within a shadow DOM or nested shadow DOMs.
     *
     * @example
     * // DOM structure: <todo-app> -> #shadow-root -> <todo-list> -> #shadow-root -> <todo-item>
     * // return [PageElement(<todo-item>), PageElement(<todo-item>)]
     * querySelectorAll("todo-item", ["todo-app", "todo-list"]);
     *
     * @param {string} selector A string containing one or more selectors to match.
     * @param {string[]} [path] An array containing a path to the parent element.
     * @returns array
     */
    querySelectorAll(selector, path = []) {
        const lookupStartNode = this._frame.contentDocument;
        const elements = Array.from(getParent(lookupStartNode, path).querySelectorAll(selector));
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

    call(functionName) {
        this._frame.contentWindow[functionName]();
        return null;
    }

    callAsync(functionName) {
        setTimeout(() => {
            this._frame.contentWindow[functionName]();
        }, 0);
    }

    callToGetElement(functionName) {
        return this._wrapElement(this._frame.contentWindow[functionName]());
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

    getElementByMethod(name) {
        return new PageElement(this.#node[name]());
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
        return this.dispatchKeyEvent(type, ENTER_KEY_CODE, "Enter", options);
    }

    dispatchKeyEvent(type, keyCode, key, options) {
        let eventOptions = { bubbles: true, cancelable: true, keyCode, which: keyCode, key };
        if (options !== undefined)
            eventOptions = Object.assign(eventOptions, options);
        const event = new KeyboardEvent(type, eventOptions);
        this.#node.dispatchEvent(event);
    }

    dispatchMouseEvent(type, offsetX, offsetY, options) {
        const boundingRect = this.#node.getBoundingClientRect();
        const clientX = offsetX + boundingRect.x;
        const clientY = offsetY + boundingRect.y;
        const contentWindow = this.#node.ownerDocument.defaultView;
        const screenX = clientX + contentWindow.screenX;
        const screenY = clientY + contentWindow.screenY;
        let eventOptions = { bubbles: true, cancelable: true, clientX, clientY, screenX, screenY };
        if (options !== undefined)
            eventOptions = Object.assign(eventOptions, options);
        const event = new contentWindow.MouseEvent(type, eventOptions);
        this.#node.dispatchEvent(event);
    }

    /**
     * Returns the first element found in a node of a PageElement that matches the specified selector, or group of selectors. If a shadow DOM is present in the node, the shadow DOM is used to query.
     * If no matches are found, null is returned.
     *
     * @param {string} selector A string containing one or more selectors to match.
     * @param {string[]} [path] An array containing a path to the parent element.
     * @returns PageElement | null
     */
    querySelectorInShadowRoot(selector, path = []) {
        const lookupStartNode = this.#node.shadowRoot ?? this.#node;
        const element = getParent(lookupStartNode, path).querySelector(selector);

        if (element === null)
            return null;
        return new PageElement(element);
    }

    querySelector(selector) {
        const element = this.#node.querySelector(selector);

        if (element === null)
            return null;
        return new PageElement(element);
    }
}

function geomeanToScore(geomean) {
    return 1000 / geomean;
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

class TestInvoker {
    constructor(syncCallback, asyncCallback, reportCallback) {
        this._syncCallback = syncCallback;
        this._asyncCallback = asyncCallback;
        this._reportCallback = reportCallback;
    }
}

class TimerTestInvoker extends TestInvoker {
    start() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._syncCallback();
                setTimeout(() => {
                    this._asyncCallback();
                    requestAnimationFrame(async () => {
                        await this._reportCallback();
                        resolve();
                    });
                }, 0);
            }, params.waitBeforeSync);
        });
    }
}

class BaseRAFTestInvoker extends TestInvoker {
    start() {
        return new Promise((resolve) => {
            if (params.waitBeforeSync)
                setTimeout(() => this._scheduleCallbacks(resolve), params.waitBeforeSync);
            else
                this._scheduleCallbacks(resolve);
        });
    }
}

class RAFTestInvoker extends BaseRAFTestInvoker {
    _scheduleCallbacks(resolve) {
        requestAnimationFrame(() => this._syncCallback());
        requestAnimationFrame(() => {
            setTimeout(() => {
                this._asyncCallback();
                setTimeout(async () => {
                    await this._reportCallback();
                    resolve();
                }, 0);
            }, 0);
        });
    }
}

// https://stackoverflow.com/a/47593316
function seededHashRandomNumberGenerator(a) {
    return function () {
        var t = a += 0x6d2b79f5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return (t ^ (t >>> 14)) >>> 0;
    };
}

export class BenchmarkRunner {
    constructor(suites, client) {
        this._suites = suites;
        if (params.useWarmupSuite)
            this._suites = [WarmupSuite, ...suites];
        this._client = client;
        this._page = null;
        this._metrics = null;
        this._iterationCount = params.iterationCount;
        if (params.shuffleSeed !== "off")
            this._suiteOrderRandomNumberGenerator = seededHashRandomNumberGenerator(params.shuffleSeed);
    }

    async runMultipleIterations(iterationCount) {
        this._iterationCount = iterationCount;
        if (this._client?.willStartFirstIteration)
            await this._client.willStartFirstIteration(iterationCount);

        try {
            await this._runMultipleIterations();
        } catch (error) {
            console.error(error);
            if (this._client?.handleError) {
                await this._client.handleError(error);
                return;
            }
        }

        if (this._client?.didFinishLastIteration)
            await this._client.didFinishLastIteration(this._metrics);
    }

    async _runMultipleIterations() {
        const iterationStartLabel = "iteration-start";
        const iterationEndLabel = "iteration-end";
        for (let i = 0; i < this._iterationCount; i++) {
            performance.mark(iterationStartLabel);
            await this._runAllSuites();
            performance.mark(iterationEndLabel);
            performance.measure(`iteration-${i}`, iterationStartLabel, iterationEndLabel);
        }
    }

    _removeFrame() {
        if (this._frame) {
            this._frame.parentNode.removeChild(this._frame);
            this._frame = null;
        }
    }

    async _appendFrame() {
        const frame = document.createElement("iframe");
        const style = frame.style;
        style.width = `${params.viewport.width}px`;
        style.height = `${params.viewport.height}px`;
        style.border = "0px none";
        style.position = "absolute";
        frame.setAttribute("scrolling", "no");
        frame.className = "test-runner";
        style.left = "50%";
        style.top = "50%";
        style.transform = "translate(-50%, -50%)";

        if (this._client?.willAddTestFrame)
            await this._client.willAddTestFrame(frame);

        document.body.insertBefore(frame, document.body.firstChild);
        this._frame = frame;
        return frame;
    }

    _prepareRunner() {
        const prepareStartLabel = "runner-prepare-start";
        const prepareEndLabel = "runner-prepare-end";

        performance.mark(prepareStartLabel);

        let suites = [...this._suites];
        if (this._suiteOrderRandomNumberGenerator) {
            // We just do a simple Fisher-Yates shuffle based on the repeated hash of the
            // seed. This is not a high quality RNG, but it's plenty good enough.
            for (let i = 0; i < suites.length - 1; i++) {
                let j = i + (this._suiteOrderRandomNumberGenerator() % (suites.length - i));
                let tmp = suites[i];
                suites[i] = suites[j];
                suites[j] = tmp;
            }
        }
        performance.mark(prepareEndLabel);
        performance.measure("runner-prepare", prepareStartLabel, prepareEndLabel);
        return suites;
    }

    async _runAllSuites() {
        this._measuredValues = { tests: {}, total: 0, mean: NaN, geomean: NaN, score: NaN };

        const suites = this._prepareRunner();

        try {
            for (const suite of suites) {
                if (!suite.disabled) {
                    await this._appendFrame();
                    this._page = new Page(this._frame);
                    await this._prepareSuite(suite);
                    // eslint-disable-next-line no-unused-expressions
                    suite.config ? await this._runRemoteSuite(suite) : await this._runSuite(suite);
                    this._validateSuiteTotal(suite.name);
                    this._removeFrame();
                }
            }
        } finally {
            await this._finishRunAllSuites();
        }
    }

    async _finishRunAllSuites() {
        const finalizeStartLabel = "runner-finalize-start";
        const finalizeEndLabel = "runner-finalize-end";

        performance.mark(finalizeStartLabel);
        // Remove frame to clear the view for displaying the results.
        this._removeFrame();
        await this._finalize();
        performance.mark(finalizeEndLabel);
        performance.measure("runner-finalize", finalizeStartLabel, finalizeEndLabel);
    }

    async _runRemoteSuite(suite) {
        const { stopSubscription } = startSubscription({ type: "step-complete", callback: async (e) => {
            if (this._client?.didRunTest)
                await this._client.didRunTest(e.data.name, e.data.test);
        } });
        this._frame.contentWindow.postMessage({ id: this._appId, key: "benchmark-connector", type: "benchmark-suite", name: suite.config.name, params: JSON.stringify(params) }, "*");
        const response = await postMessageSent({ type: "suite-complete" });
        stopSubscription();

        this._measuredValues.tests[suite.name] = response.result;
    }

    async _runSuite(suite) {
        const suiteName = suite.name;
        const suiteStartLabel = `suite-${suiteName}-start`;
        const suiteEndLabel = `suite-${suiteName}-end`;

        const tests = suite.config ? this._page._frame.contentWindow.benchmarkTestManager.getSuiteByName(suite.config.name).tests : suite.tests;

        performance.mark(suiteStartLabel);
        for (const test of tests)
            await this._runTestAndRecordResults(suite, test);
        performance.mark(suiteEndLabel);
        performance.measure(`suite-${suiteName}`, suiteStartLabel, suiteEndLabel);
    }

    _validateSuiteTotal(suiteName) {
        // When the test is fast and the precision is low (for example with Firefox'
        // privacy.resistFingerprinting preference), it's possible that the measured
        // total duration for an entire is 0.
        const suiteTotal = this._measuredValues.tests[suiteName].total;
        if (suiteTotal === 0)
            throw new Error(`Got invalid 0-time total for suite ${suiteName}: ${suiteTotal}`);
    }

    async _prepareSuite(suite) {
        const suiteName = suite.name;
        const suitePrepareStartLabel = `suite-${suiteName}-prepare-start`;
        const suitePrepareEndLabel = `suite-${suiteName}-prepare-end`;

        performance.mark(suitePrepareStartLabel);
        const prepareStartTime = performance.now();

        if (suite.config) {
            // waiting for the additional "app-ready" postMessage of the workload.
            const response = await Promise.all([postMessageSent({ type: "app-ready" }), loadFrame({ frame: this._page._frame, url: `${suite.url}` }), suite.prepare(this._page)]);
            this._appId = response.find(value => value.type === "app-ready")?.appId;
        } else {
            await Promise.all([loadFrame({ frame: this._page._frame, url: `${suite.url}` }), suite.prepare(this._page)]);
        }

        const prepareEndTime = performance.now();
        performance.mark(suitePrepareEndLabel);
        performance.measure(`suite-${suiteName}-prepare`, suitePrepareStartLabel, suitePrepareEndLabel);

        if (params.measurePrepare) {
            const prepareTime = prepareEndTime - prepareStartTime;
            this._recordPrepareMetric(suite, prepareTime);
        }
    }

    async _runTestAndRecordResults(suite, test) {
        if (this._client?.willRunTest)
            await this._client.willRunTest(suite, test);

        // Prepare all mark labels outside the measuring loop.
        const startLabel = `${suite.name}.${test.name}-start`;
        const syncEndLabel = `${suite.name}.${test.name}-sync-end`;
        const asyncStartLabel = `${suite.name}.${test.name}-async-start`;
        const asyncEndLabel = `${suite.name}.${test.name}-async-end`;

        let syncTime;
        let asyncStartTime;
        let asyncTime;
        const runSync = () => {
            if (params.warmupBeforeSync) {
                performance.mark("warmup-start");
                const startTime = performance.now();
                // Infinite loop for the specified ms.
                while (performance.now() - startTime < params.warmupBeforeSync)
                    continue;
                performance.mark("warmup-end");
            }
            performance.mark(startLabel);
            const syncStartTime = performance.now();
            test.run(this._page);
            const syncEndTime = performance.now();
            performance.mark(syncEndLabel);

            syncTime = syncEndTime - syncStartTime;

            performance.mark(asyncStartLabel);
            asyncStartTime = performance.now();
        };
        const measureAsync = () => {
            // Some browsers don't immediately update the layout for paint.
            // Force the layout here to ensure we're measuring the layout time.
            const height = this._frame.contentDocument.body.getBoundingClientRect().height;
            const asyncEndTime = performance.now();
            asyncTime = asyncEndTime - asyncStartTime;
            this._frame.contentWindow._unusedHeightValue = height; // Prevent dead code elimination.
            performance.mark(asyncEndLabel);
            if (params.warmupBeforeSync)
                performance.measure("warmup", "warmup-start", "warmup-end");
            performance.measure(`${suite.name}.${test.name}-sync`, startLabel, syncEndLabel);
            performance.measure(`${suite.name}.${test.name}-async`, asyncStartLabel, asyncEndLabel);
        };
        const report = () => this._recordTestResults(suite, test, syncTime, asyncTime);
        const invokerClass = params.measurementMethod === "raf" ? RAFTestInvoker : TimerTestInvoker;
        const invoker = new invokerClass(runSync, measureAsync, report);

        return invoker.start();
    }

    async _recordTestResults(suite, test, syncTime, asyncTime) {
        // Skip reporting updates for the warmup suite.
        if (suite === WarmupSuite)
            return;

        const suiteResults = this._measuredValues.tests[suite.name] || { tests: {}, total: 0 };
        const total = syncTime + asyncTime;
        this._measuredValues.tests[suite.name] = suiteResults;
        suiteResults.tests[test.name] = { tests: { Sync: syncTime, Async: asyncTime }, total: total };
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

            this._measuredValues.total = total;
            this._measuredValues.mean = total / values.length;
            this._measuredValues.geomean = geomean;
            this._measuredValues.score = geomeanToScore(geomean);
            await this._client.didRunSuites(this._measuredValues);
        }
    }

    _appendIterationMetrics() {
        const getMetric = (name, unit = "ms") => this._metrics[name] || (this._metrics[name] = new Metric(name, unit));
        const iterationTotalMetric = (i) => {
            if (i >= params.iterationCount)
                throw new Error(`Requested iteration=${i} does not exist.`);
            return getMetric(`Iteration-${i}-Total`);
        };

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
                iterationTotalMetric(i).description = `Test totals for iteration ${i}`;
            getMetric("Geomean", "ms").description = "Geomean of test totals";
            getMetric("Score", "score").description = "Scaled inverse of the Geomean";
        }

        const geomean = getMetric("Geomean");
        const iterationTotal = iterationTotalMetric(geomean.length);
        for (const results of Object.values(iterationResults))
            iterationTotal.add(results.total);
        iterationTotal.computeAggregatedMetrics();
        geomean.add(iterationTotal.geomean);
        getMetric("Score").add(geomeanToScore(iterationTotal.geomean));

        for (const metric of Object.values(this._metrics))
            metric.computeAggregatedMetrics();
    }
}
