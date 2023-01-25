import * as Statistics from "./statistics.mjs";

export class BenchmarkTestStep {
    constructor(testName, testFunction) {
        this.name = testName;
        this.run = testFunction;
    }
}


class Page {
    constructor(frame)
    {
        this._frame = frame;
    }

    async waitForElement(selector)
    {
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

    querySelector(selector)
    {
        const element = this._frame.contentDocument.querySelector(selector);
        if (element === null)
            return null;
        return this._wrapElement(element);
    }

    querySelectorAll(selector)
    {
        const elements = Array.from(this._frame.contentDocument.querySelectorAll(selector));
        for (let i = 0; i < elements.length; i++)
            elements[i] = this._wrapElement(elements[i]);
        return elements;
    }

    getElementById(id)
    {
        const element = this._frame.contentDocument.getElementById(id);
        if (element === null)
            return null;
        return this._wrapElement(element);
    }

    call(function_name)
    {
        this._frame.contentWindow[function_name]();
        return null;
    }

    _wrapElement(element)
    {
        return new PageElement(element);
    }
}

const NATIVE_OPTIONS = {
    bubbles: true,
    cancellable: true,
};

class PageElement {
    #node;

    constructor(node)
    {
        this.#node = node;
    }

    setValue(value)
    {
        this.#node.value = value;
    }

    click()
    {
        this.#node.click();
    }

    focus()
    {
        this.#node.focus();
    }

    dispatchEvent(eventName, options = NATIVE_OPTIONS)
    {
        if (eventName === 'submit')
            // FIXME FireFox doesn't like `new Event('submit')
            this._dispatchSubmitEvent();
        else
            this.#node.dispatchEvent(new Event(eventName, options));
    }

    _dispatchSubmitEvent()
    {
        const submitEvent = document.createEvent('Event');
        submitEvent.initEvent('submit', true, true);
        this.#node.dispatchEvent(submitEvent);
    }

    enter(type, options = undefined)
    {
        const ENTER_KEY_CODE = 13;
        let eventOptions = {
            bubbles: true, 
            cancelable: true,
            keyCode: ENTER_KEY_CODE,
            which: ENTER_KEY_CODE,
            key: 'ENTER'
        };
        if (options !== undefined)
            eventOptions = Object.assign(eventOptions, options);
        const event = new KeyboardEvent(type, eventOptions);
        this.#node.dispatchEvent(event);
    }
}


export class BenchmarkRunner {
    constructor(suites, client)
    {
        this._suites = suites;
        this._client = client;
        this._page = null;
        this._metrics = {
            __proto__:null,
            Total: new Metric('Total'),
            Score: new Metric('Score', 'rpm')
        };
    }

    _removeFrame()
    {
        if (this._frame) {
            this._frame.parentNode.removeChild(this._frame);
            this._frame = null;
        }
    }

    async _appendFrame(src)
    {
        const frame = document.createElement('iframe');
        frame.style.width = '1500px';
        frame.style.height = '800px';
        frame.style.border = '0px none';
        frame.style.position = 'absolute';
        frame.setAttribute('scrolling', 'no');

        const marginLeft = parseInt(getComputedStyle(document.body).marginLeft);
        const marginTop = parseInt(getComputedStyle(document.body).marginTop);
        if (window.innerWidth > 1500 + marginLeft && window.innerHeight > 800 + marginTop) {
            frame.style.left = marginLeft + 'px';
            frame.style.top = marginTop + 'px';
        } else {
            frame.style.left = '0px';
            frame.style.top = '0px';
        }

        if (this._client?.willAddTestFrame)
            await this._client.willAddTestFrame(frame);

        document.body.insertBefore(frame, document.body.firstChild);
        this._frame = frame;
        return frame;
    }

    _writeMark(name)
    {
        if (window.performance && window.performance.mark)
            window.performance.mark(name);
    }

    async runMultipleIterations(iterationCount)
    {
        if (this._client?.willStartFirstIteration)
            await this._client.willStartFirstIteration(iterationCount);
        for (let i = 0; i < iterationCount; i++)
            await this._runAllSuites();
        if (this._client?.didFinishLastIteration)
            await this._client.didFinishLastIteration(this._metrics);
    }

    async _runAllSuites()
    {
        this._measuredValues = {tests: {}, total: 0, mean: NaN, geomean: NaN, score: NaN};

        this._removeFrame();
        await this._appendFrame();
        this._page = new Page(this._frame);

        for (const suite of this._suites)
            if (!suite.disabled)
                await this._runSuite(suite);

        // Remove frame to clear the view for displaying the results.
        this._removeFrame();
        await this._finalize();
    }

    async _runSuite(suite)
    {
        await this._prepareSuite(suite);
        for (const test of suite.tests)
            await this._runTestAndRecordResults(suite, test);
    }

    async _prepareSuite(suite)
    {
        return new Promise((resolve) => {
            const frame = this._page._frame;
            frame.onload = async () => {
                await suite.prepare(this._page);
                resolve();
            }
            frame.src = 'resources/' + suite.url;
        });
    }

    async _runTestAndRecordResults(suite, test)
    {
        return new Promise(async (resolve) => {
            if (this._client?.willRunTest)
                await this._client.willRunTest(suite, test);

            setTimeout(() => {
                this._runTest(suite, test, this._page, async (syncTime, asyncTime) => {
                    const suiteResults = this._measuredValues.tests[suite.name] || {tests:{}, total: 0};
                    const total = syncTime + asyncTime;
                    this._measuredValues.tests[suite.name] = suiteResults;
                    suiteResults.tests[test.name] = {tests: {'Sync': syncTime, 'Async': asyncTime}, total: total};
                    suiteResults.total += total;

                    if (this._client?.didRunTest)
                        await this._client.didRunTest(suite, test);

                    resolve();
                });
            }, 0);
        });
    }

    // This function ought be as simple as possible. Don't even use Promise.
    _runTest(suite, test, page, callback)
    {
        const now = window.performance && window.performance.now ? () => window.performance.now() : Date.now;

        this._writeMark(suite.name + '.' + test.name + '-start');
        let startTime = now();
        test.run(page);
        let endTime = now();
        this._writeMark(suite.name + '.' + test.name + '-sync-end');

        const syncTime = endTime - startTime;

        startTime = now();
        setTimeout(() => {
            // Some browsers don't immediately update the layout for paint.
            // Force the layout here to ensure we're measuring the layout time.
            const height = this._frame.contentDocument.body.getBoundingClientRect().height;
            endTime = now();
            this._frame.contentWindow._unusedHeightValue = height; // Prevent dead code elimination.
            this._writeMark(suite.name + '.' + test.name + '-async-end');
            window.requestAnimationFrame(() => {
                callback(syncTime, endTime - startTime, height);
            });
        }, 0);
    }

    async _finalize()
    {
       this._appendIterationMetrics() 
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
            this._measuredValues.score = 60 * 1000 / geomean / correctionFactor;
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
                if (metric.parent != parent) parent.addChild(metric);
                if (results.tests)
                    collectSubMetrics(`${metric.name}-`, results.tests, metric);
            }
        };
    
        const iterationData = this._measuredValues.tests;
        const iterationTotal = getMetric(`Iteration-${ this._metrics.Total.length }-Total`);
        for (const results of Object.values(iterationData)) {
            iterationTotal.add(results.total);
        }
        iterationTotal.compute();

        this._metrics.Total.add(iterationTotal.sum);
        this._metrics.Score.add(MILLIS_PER_MIN / iterationTotal.sum);
        collectSubMetrics('', iterationData);

        for (const metric of Object.values(this._metrics))
            metric.compute()
    }
}

/** Number of milliseconds in a single minute. */
const MILLIS_PER_MIN = 60e3;

class Metric {
	/** @param {string} name */
	constructor(name, unit = 'ms')
    {
		if (typeof name !== 'string')
			throw new Error(`Invalid metric.name=${name}, expected string.`);
		this.name = name;
		this.unit = unit;

		this.mean = 0.0;
        this.geomean = 0.0;
		this.delta = 0.0;
		this.percentDelta = 0.0;

		this.sum = 0.0;
		this.min = 0.0;
		this.max = 0.0;

		/** @type {number[]} */
		this.values = [];

		/** @type {Metric} */
		this.parent = undefined;
		/** @type {Metric[]} */
		this.children = [];

		// Mark Metric references as non-enumerable to allow JSON.stringify usage:
		Object.defineProperties(this, {
			parent: {
				writable: true
			},
			children: {
				writable: true
			}
		});
	}

	get shortName() 
    {
		return this.parent ? this.name.replace(this.parent.name + '-', '') : this.name;
	}

	get valueString()
    {
        if (!this.percentDelta || !this.delta)
		    return `${this.mean.toFixed(2)} ${this.unit}`;
		return `${this.mean.toFixed(2)} ± ${this.delta.toFixed(2)} (${this.percentDelta.toFixed(1)}%) ${this.unit}`;
	}
    get length()
    {
        return this.values.length;
    }

	/** @param {Metric} metric */
	addChild(metric)
    {
		if (metric.parent)
            throw new Error('Cannot re-add sub metric');
		metric.parent = this;
		this.children.push(metric);
	}

	/** @param {number} value */
	add(value)
    {
		if (typeof value !== 'number')
			throw new Error(`Adding invalid value=${value} to metric=${this.name}`);
		this.values.push(value);
	}

	/**
	 * Calculate aggregate metrics for collected values.
	 */
	compute()
    {
         // Avoid the loss of significance for the sum.
        this.values.sort((a, b) => a - b);
        const squareSum = Statistics.squareSum(this.values);
		this.sum = Statistics.sum(this.values);
		this.min = Statistics.min(this.values);
		this.max = Statistics.max(this.values);
		this.mean = this.sum / this.values.length;
        const product = Statistics.product(this.values);
        this.geomean = Math.pow(product, 1 / this.values.length);
		this.delta = Statistics.confidenceIntervalDelta(0.95, this.values.length, this.sum, squareSum);
		this.percentDelta = isNaN(this.delta) ? undefined : (this.delta * 100) / this.mean;
	}
}