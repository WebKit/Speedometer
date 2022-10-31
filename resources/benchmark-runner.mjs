export class BenchmarkTestStep {
    constructor(testName, testFunction) {
        this.name = testName;
        this.run = testFunction;
    }
}

class BenchmarkState {
    constructor(suites) {
        this._suites = suites;
        this._suiteIndex = -1;
        this._testIndex = 0;
        this.next();
    }

    currentSuite() {
        return this._suites[this._suiteIndex];
    }

    currentTest() {
        const suite = this.currentSuite();
        return suite ? suite.tests[this._testIndex] : null;
    }

    next() {
        this._testIndex++;

        const suite = this._suites[this._suiteIndex];
        if (suite && this._testIndex < suite.tests.length)
            return this;

        this._testIndex = 0;
        do {
            this._suiteIndex++;
        } while (this._suiteIndex < this._suites.length && this._suites[this._suiteIndex].disabled);

        return this;
    }

    isFirstTest() {
        return !this._testIndex;
    }

    async prepareCurrentSuite(frame, page) {
        const suite = this.currentSuite();
        await new Promise((resolve) => {
            frame.onload = async () => {
                await suite.prepare(page);
                resolve();
            }
            frame.src = 'resources/' + suite.url;
        });
    }
}

<<<<<<< HEAD
class Page {
    constructor(frame) {
        this._frame = frame;
=======
export class BenchmarkRunner {
    constructor(suites, client) {
        this._suites = suites;
        this._prepareReturnValue = null;
        this._client = client;
>>>>>>> main
    }

    async waitForElement(selector, measureAsyncOperation) {
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
        return this._frame.contentDocument.querySelector(selector);
    }

    querySelectorAll(selector) {
        return this._frame.contentDocument.querySelectorAll(selector);
    }

    getElementById(id) {
        return this._frame.contentDocument.getElementById(id);
    }
}

export class BenchmarkRunner {
    constructor(suites, client) {
        this._suites = suites;
        this._client = client;
        this._page = null;
    }

    _removeFrame() {
        if (this._frame) {
            this._frame.parentNode.removeChild(this._frame);
            this._frame = null;
        }
    }

    _appendFrame(src) {
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

    _writeMark(name) {
        if (window.performance && window.performance.mark)
            window.performance.mark(name);
    }

    // This function ought be as simple as possible. Don't even use Promise.
    _runTest(suite, test, page, callback)
    {
        const self = this;
        const now = window.performance && window.performance.now ? () => window.performance.now() : Date.now;

        self._writeMark(suite.name + '.' + test.name + '-start');
        let startTime = now();
        test.run(page);
        let endTime = now();
        self._writeMark(suite.name + '.' + test.name + '-sync-end');

        const syncTime = endTime - startTime;

        startTime = now();
        setTimeout(() => {
            // Some browsers don't immediately update the layout for paint.
            // Force the layout here to ensure we're measuring the layout time.
            const height = self._frame.contentDocument.body.getBoundingClientRect().height;
            endTime = now();
            self._frame.contentWindow._unusedHeightValue = height; // Prevent dead code elimination.
            self._writeMark(suite.name + '.' + test.name + '-async-end');
            window.requestAnimationFrame(() => {
                callback(syncTime, endTime - startTime, height);
            });
        }, 0);
    }

    async step(state) {
        if (!state) {
            state = new BenchmarkState(this._suites);
            this._measuredValues = {tests: {}, total: 0, mean: NaN, geomean: NaN, score: NaN};
        }

        const suite = state.currentSuite();
        if (!suite) {
            await this._finalize();
            return;
        }

        if (state.isFirstTest()) {
            this._removeFrame();
            this._appendFrame();
            this._page = new Page(this._frame);
            await state.prepareCurrentSuite(this._frame, this._page);
        }

        return await this._runTestAndRecordResults(state);
    }

    async runAllSteps(startingState) {
        const nextCallee = this.runAllSteps.bind(this);
        const nextState = await this.step(startingState);
        if (nextState)
            await nextCallee(nextState);
    }

    async runMultipleIterations(iterationCount) {
        const self = this;
        let currentIteration = 0;

        this._runNextIteration = async () => {
            currentIteration++;
            if (currentIteration < iterationCount)
                await self.runAllSteps();
            else if (this._client && this._client.didFinishLastIteration)
                this._client.didFinishLastIteration();
        };

        if (this._client && this._client.willStartFirstIteration)
            this._client.willStartFirstIteration(iterationCount);

        await self.runAllSteps();
    }

    async _runTestAndRecordResults(state) {
        return new Promise((resolve) => {
            const suite = state.currentSuite();
            const test = state.currentTest();

            if (this._client && this._client.willRunTest)
                this._client.willRunTest(suite, test);

            setTimeout(() => {
                this._runTest(suite, test, this._page, (syncTime, asyncTime) => {
                    const suiteResults = this._measuredValues.tests[suite.name] || {tests:{}, total: 0};
                    const total = syncTime + asyncTime;
                    this._measuredValues.tests[suite.name] = suiteResults;
                    suiteResults.tests[test.name] = {tests: {'Sync': syncTime, 'Async': asyncTime}, total: total};
                    suiteResults.total += total;

                    if (this._client && this._client.didRunTest)
                        this._client.didRunTest(suite, test);

                    state.next();
                    resolve(state);
                });
            }, 0);
        });
    }

   async _finalize() {
        this._removeFrame();

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

        if (this._runNextIteration)
            await this._runNextIteration();
    }
}
