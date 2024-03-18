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

class Page {
    constructor(frame) {
        this._frame = frame;
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

class RAFTestInvoker extends TestInvoker {
    start() {
        return new Promise((resolve) => {
            if (params.waitBeforeSync)
                setTimeout(() => this._scheduleCallbacks(resolve), params.waitBeforeSync);
            else
                this._scheduleCallbacks(resolve);
        });
    }

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
            this._suites = [...suites];
        this._client = client;
        this._page = null;
        this._metrics = null;
        this._iterationCount = params.iterationCount;
        this._currentIteration = 0;
        if (params.shuffleSeed !== "off")
            this._suiteOrderRandomNumberGenerator = seededHashRandomNumberGenerator(params.shuffleSeed);
    }
    get currentIteration() {
        return this._currentIteration;
    }

    async runMultipleIterations(iterationCount) {
        this._iterationCount = iterationCount;
        this._currentIteration = 0;
        if (this._client?.willStartFirstIteration)
            await this._client.willStartFirstIteration( this._iterationCount);

        const iterationStartLabel = "iteration-start";
        const iterationEndLabel = "iteration-end";
        for (; this._currentIteration < this._iterationCount; this._currentIteration++) {
            performance.mark(iterationStartLabel);
            await this._runAllSuites();
            performance.mark(iterationEndLabel);
            performance.measure(`iteration-${this._currentIteration}`, iterationStartLabel, iterationEndLabel);
        }
        if (this._client?.didFinishLastIteration)
            await this._client.didFinishLastIteration(this._metrics);
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
        if (params.embedded) {
            style.left = "0px";
            style.top = "0px";
        } else {
            style.left = "50%";
            style.top = "50%";
            style.transform = "translate(-50%, -50%)";
        }

        if (this._client?.willAddTestFrame)
            await this._client.willAddTestFrame(frame);

        document.body.insertBefore(frame, document.body.firstChild);
        this._frame = frame;
        return frame;
    }

    async _runAllSuites() {
        this._measuredValues = { tests: {}, total: 0, mean: NaN, geomean: NaN, score: NaN };

        const prepareStartLabel = "runner-prepare-start";
        const prepareEndLabel = "runner-prepare-end";

        performance.mark(prepareStartLabel);
        this._removeFrame();
        await this._appendFrame();
        this._page = new Page(this._frame);

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

        for (const suite of suites) {
            if (!suite.disabled)
                await this._runSuite(suite);
        }

        const finalizeStartLabel = "runner-finalize-start";
        const finalizeEndLabel = "runner-finalize-end";

        performance.mark(finalizeStartLabel);
        // Remove frame to clear the view for displaying the results.
        this._removeFrame();
        await this._finalize();
        performance.mark(finalizeEndLabel);
        performance.measure("runner-finalize", finalizeStartLabel, finalizeEndLabel);
    }

    async _runSuite(suite) {
        this._prepareMetrics(suite);
        const suitePrepareStartLabel = `suite-${suite.name}-prepare-start`;
        const suitePrepareEndLabel = `suite-${suite.name}-prepare-end`;
        const suiteStartLabel = `suite-${suite.name}-start`;
        const suiteEndLabel = `suite-${suite.name}-end`;

        performance.mark(suitePrepareStartLabel);
        const prepareStartTime = performance.now();
        await this._prepareSuite(suite);
        const prepareEndTime = performance.now();
        performance.mark(suitePrepareEndLabel);
        performance.measure(`suite-${suite.name}-prepare`, suitePrepareStartLabel, suitePrepareEndLabel);
        if (params.measurePrepare) {
            const prepareTime = prepareEndTime - prepareStartTime;
            this._recordPrepareMetric(suite, prepareTime);
        }

        performance.mark(suiteStartLabel);
        for (const test of suite.tests)
            await this._runTestAndRecordResults(suite, test);
        performance.mark(suiteEndLabel);
        performance.measure(`suite-${suite.name}`, suiteStartLabel, suiteEndLabel);
    }

    _prepareMetrics(suite) {
        this._measuredValues.tests[suite.name] = {
            tests: {},
            total: 0,
        };
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

    _recordPrepareMetric(suite, prepareTime) {
        const suiteResults = this._measuredValues.tests[suite.name];
        suiteResults.tests.Prepare = prepareTime;
        suiteResults.total += prepareTime;
    }

    async _runTestAndRecordResults(suite, test) {
        /* eslint-disable-next-line no-async-promise-executor */
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
        if (suite.name === "Warmup")
            return;

        const suiteResults = this._measuredValues.tests[suite.name];
        const total = syncTime + asyncTime;
        suiteResults.tests[test.name] = {
            tests: {
                Sync: syncTime,
                Async: asyncTime,
            },
            total: total
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
        const aggregates = Object.create(null);

        const collectSubMetrics = (prefix, items, parent) => {
            for (let name in items) {
                const results = items[name];
                const metric = getMetric(prefix + name);
                const value = results.total ?? results;
                metric.add(value);
                if (metric.parent !== parent)
                    parent.addChild(metric);
                if (results.tests) {
                    collectSubMetrics(`${metric.name}${Metric.separator}`, results.tests, metric);
                } else {
                    let aggregate = aggregates[name];
                    if (!aggregate)
                        aggregate = aggregates[name] = new Metric(name);
                    aggregate.add(value);
                }
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
                iterationTotalMetric(i);
            getMetric("Geomean");
            getMetric("Score", "score");
        }

        const geomean = getMetric("Geomean");
        const iterationTotal = iterationTotalMetric(geomean.length);
        for (const results of Object.values(iterationResults))
            iterationTotal.add(results.total);
        for (let aggregate of Object.values(aggregates)) {
            aggregate.computeAggregatedMetrics();
            getMetric(aggregate.name).add(aggregate.geomean);
        }
        iterationTotal.computeAggregatedMetrics();
        geomean.add(iterationTotal.geomean);
        getMetric("Score").add(geomeanToScore(iterationTotal.geomean));

        for (const metric of Object.values(this._metrics))
            metric.computeAggregatedMetrics();
    }
}

class PingBackDone {}
const DONE = new PingBackDone();

class PostMessageRunner extends BenchmarkRunner {
    _postMessageHandlers = { __proto__: null };

    constructor(suites, client) {
        super(suites, client);
        globalThis.addEventListener("message", this.onMessage.bind(this));
    }

    onMessage(event) {
        const { cmd, data = undefined } = event.data;
        const resolver = this._postMessageHandlers[cmd];
        if (!resolver)
            throw Error(`Unknown onMessage: ${cmd}`);
        if (resolver === DONE)
            throw Error(`Cannot evaluate ping back resolver twice: ${cmd}`);
        this._postMessageHandlers[cmd] = DONE;
        resolver(data);
    }

    async pingBackMessage(name) {
        if (this._postMessageHandlers[name] !== DONE)
            throw Error(`Unknown ping back message: ${name}`);
        return new Promise(resolver => {
            this._postMessageHandlers[name] = resolver;
        });
    }
}

export class SubdomainBenchmarkRunner extends PostMessageRunner {

    _finishPromise;
    _postMessageHandlers = {
        __proto__: null,
        prepareDone: DONE,
        recordPrepareMetric: DONE,
        recordTestResults: DONE,
    };

    // Assume all workloads report the metrics back via postMessage.
    async _runSuite(suite) {
        this._prepareMetrics(suite);
        await this._prepareSuite(suite);
        if (params.measurePrepare) {
            const { prepareTime } = await this.pingBackMessage("recordPrepareMetric");
            this._recordPrepareMetric(suite, prepareTime);
        }
        for (const test of suite.tests)
            await this._runTestAndRecordResults(suite, test);
    }

    async _runTestAndRecordResults(suite, test) {
        this.postMessage("runTestAndRecordResults");
        const { syncTime, asyncTime } = await this.pingBackMessage("recordTestResults");
        await this._recordTestResults(suite, test, syncTime, asyncTime);
    }

    postMessage(cmd, data) {
        this._frame.contentWindow.postMessage({ cmd, data }, "*");
    }

    async _prepareSuite(suite) {
        await new Promise((resolve) => {
            const frame = this._page._frame;
            frame.onload = async () => resolve();
            const url = new URL(window.location.href);
            const customParams = params.copy();
            customParams.embedded = true;
            customParams.suites = [suite.name];
            customParams.tags = [];
            customParams.startAutomatically = true;
            customParams.developerMode = false;
            customParams.iterationCount = 1;
            // TODO: handle local test URLs better
            if (this._isLocalUrl(url)) {
                url.port = parseInt(url.port) + this._currentIteration;
            } else {
                // Input:  foo-bar.custom.domain.com,   foo-bar-0.custom.domain.com
                // Output: foo-bar-1.custom.domain.com, foo-bar-1.custom.domain.com
                const hostParts = url.hostname.split(".");
                const domainWithoutIndex = hostParts[0].match(DOMAIN_WITHOUT_INDEX_RE).groups.nonIndexed;
                hostParts[0] = `${domainWithoutIndex}-${this.currentIteration}`;
                url.host = hostParts.join(".");
            }
            url.search = customParams.toSearchParams();
            frame.src = url.toString();
        });
        await this.pingBackMessage("prepareDone");
        this.postMessage("startSuite");
    }

    _isLocalUrl(url) {
        return url.hostname === "127.0.0.1" || url.hostname === "localhost";
    }
}

const DOMAIN_WITHOUT_INDEX_RE = /(?<nonIndexed>([^-]+(-[^0-9])?)+)(-[0-9]+)?/;

export class EmbeddedBenchmarkRunner extends PostMessageRunner {

    _postMessageHandlers = {
        __proto__: null,
        startSuite: DONE,
        runTestAndRecordResults: DONE,
    };

    constructor(suites, client) {
        super(suites, client);
        if (globalThis === globalThis.parent) {
            const msg = "Cannot use embedded runner in toplevel iframe";
            alert(msg);
            throw Error(msg);
        }
    }

    postMessage(cmd, data) {
        globalThis.parent.postMessage({ cmd, data }, "*");
    }

    async _prepareSuite(suite) {
        await super._prepareSuite(suite);
        this.postMessage("prepareDone", { prepareTime: 0 });
        await this.pingBackMessage("startSuite");
    }

    async _runTestAndRecordResults(suite, test) {
        await this.pingBackMessage("runTestAndRecordResults");
        return super._runTestAndRecordResults(suite, test);
    }

    _recordPrepareMetric(suite, prepareTime) {
        super._recordPrepareMetric(suite, prepareTime);
        this.postMessage("recordPrepareMetric", { prepareTime });
    }

    async _recordTestResults(suite, test, syncTime, asyncTime) {
        this.postMessage("recordTestResults", { syncTime, asyncTime });
    }
}
