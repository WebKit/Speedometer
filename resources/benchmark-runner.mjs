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
    }

    _removeFrame()
    {
        if (this._frame) {
            this._frame.parentNode.removeChild(this._frame);
            this._frame = null;
        }
    }

    _appendFrame(src)
    {
        const frame = document.createElement('iframe');
        frame.style.width = '800px';
        frame.style.height = '600px';
        frame.style.border = '0px none';
        frame.style.position = 'absolute';
        frame.setAttribute('scrolling', 'no');

        const marginLeft = parseInt(getComputedStyle(document.body).marginLeft);
        const marginTop = parseInt(getComputedStyle(document.body).marginTop);
        if (window.innerWidth > 800 + marginLeft && window.innerHeight > 600 + marginTop) {
            frame.style.left = marginLeft + 'px';
            frame.style.top = marginTop + 'px';
        } else {
            frame.style.left = '0px';
            frame.style.top = '0px';
        }

        if (this._client && this._client.willAddTestFrame)
            this._client.willAddTestFrame(frame);

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
        if (this._client && this._client.willStartFirstIteration)
            this._client.willStartFirstIteration(iterationCount);
        for (let i = 0; i < iterationCount; i++)
            await this._runAllSuites();
        if (this._client && this._client.didFinishLastIteration)
            this._client.didFinishLastIteration();
    }

    async _runAllSuites()
    {
        this._measuredValues = {tests: {}, total: 0, mean: NaN, geomean: NaN, score: NaN};

        this._removeFrame();
        this._appendFrame();
        this._page = new Page(this._frame);

        for (const suite of this._suites)
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
            if (this._client && this._client.willRunTest)
                await this._client.willRunTest(suite, test);

            setTimeout(() => {
                this._runTest(suite, test, this._page, async (syncTime, asyncTime) => {
                    const suiteResults = this._measuredValues.tests[suite.name] || {tests:{}, total: 0};
                    const total = syncTime + asyncTime;
                    this._measuredValues.tests[suite.name] = suiteResults;
                    suiteResults.tests[test.name] = {tests: {'Sync': syncTime, 'Async': asyncTime}, total: total};
                    suiteResults.total += total;

                    if (this._client && this._client.didRunTest)
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
        if (this._client && this._client.didRunSuites) {
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
            this._client.didRunSuites(this._measuredValues);
        }
    }
}
