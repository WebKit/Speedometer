import {BenchmarkRunner} from './benchmark-runner.mjs';
import {Suites} from './tests.mjs';

// Expose Suites/BenchmarkRunner for backwards compatibility
window.Suites = Suites;
window.BenchmarkRunner = BenchmarkRunner;

function formatTestName(suiteName, testName)
{
    return suiteName + (testName ? '/' + testName : '');
}

function createUIForSuites(suites, onStep, onRunSuites)
{
    const control = document.createElement('nav');
    const ol = document.createElement('ol');
    const checkboxes = [];
    for (let suiteIndex = 0; suiteIndex < suites.length; suiteIndex++) {
        const suite = suites[suiteIndex];
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.id = suite.name;
        checkbox.type = 'checkbox';
        checkbox.checked = !suite.disabled;
        checkbox.onchange = () => { suite.disabled = !checkbox.checked; };
        checkbox.onchange();
        checkboxes.push(checkbox);

        li.appendChild(checkbox);
        var label = document.createElement('label');
        label.appendChild(document.createTextNode(formatTestName(suite.name)));
        li.appendChild(label);
        label.htmlFor = checkbox.id;

        const testList = document.createElement('ol');
        for (let testIndex = 0; testIndex < suite.tests.length; testIndex++) {
            const testItem = document.createElement('li');
            const test = suite.tests[testIndex];
            const anchor = document.createElement('a');
            anchor.id = suite.name + '-' + test.name;
            test.anchor = anchor;
            anchor.appendChild(document.createTextNode(formatTestName(suite.name, test.name)));
            testItem.appendChild(anchor);
            testList.appendChild(testItem);
        }
        li.appendChild(testList);

        ol.appendChild(li);
    }

    control.appendChild(ol);

    let button = document.createElement('button');
    button.textContent = 'Step';
    button.onclick = onStep;
    control.appendChild(button);

    button = document.createElement('button');
    button.textContent = 'Run';
    button.id = 'runSuites';
    button.onclick = onRunSuites;
    control.appendChild(button);

    button = document.createElement('button');
    button.textContent = 'Select all';
    button.onclick = () => {
        for (var suiteIndex = 0; suiteIndex < suites.length; suiteIndex++) {
            suites[suiteIndex].disabled = false;
            checkboxes[suiteIndex].checked = true;
        }
    };
    control.appendChild(button);

    button = document.createElement('button');
    button.textContent = 'Unselect all';
    button.onclick = () => {
        for (var suiteIndex = 0; suiteIndex < suites.length; suiteIndex++) {
            suites[suiteIndex].disabled = true;
            checkboxes[suiteIndex].checked = false;
        }

    };
    control.appendChild(button);

    return control;
}

const searchParams = new URLSearchParams(window.location.search);

function disableAllSuitesExcept(suiteName)
{
    let foundMatching = false;
    Suites.forEach(element => {
        if (element.name !== suiteName)
            element.disabled = true;
        else
            foundMatching = true;
    });
    if (!foundMatching)
        throw Error(`No matching suite for: "${suiteName}"`)

}

function startTest()
{
    const queryParam = searchParams.get('suite');
    if (queryParam !== undefined)
        disableAllSuitesExcept(queryParam);

    const benchmarkClient = {
        _stepPromise: undefined,
        _stepPromiseResolve: undefined,
        isRunning: false,
        isStepping: false,
        willStartFirstIteration()
        {
            if (this.isRunning)
                throw Error('Runner was not stopped before starting;');
            this.isRunning = true
            if (this.isStepping)
                this._stepPromise = this._newStepPromise();
        },
        step()
        {
            if (!this._stepPromise) {
                // Allow switching to stepping mid-run.
                this._stepPromise = this._newStepPromise();
            } else {
                const resolve = this._stepPromiseResolve;
                this._stepPromise = this._newStepPromise();
                resolve();
            }
        },
        _newStepPromise()
        {
            return new Promise(resolve => {
                this._stepPromiseResolve = resolve;
            })
        },
  
        willRunTest(suite, test)
        {
            test.anchor.classList.add('running');
        },
        async didRunTest(suite, test)
        {
            const classList = test.anchor.classList;
            classList.remove('running');
            classList.add('ran');
            if (this.isStepping)
                await this._stepPromise;
        },
        didRunSuites(measuredValues)
        {
            let results = '';
            for (const suiteName in measuredValues.tests) {
                let suiteResults = measuredValues.tests[suiteName];
                for (const testName in suiteResults.tests) {
                    let testResults = suiteResults.tests[testName];
                    for (const subtestName in testResults.tests) {
                        results += suiteName + ' : ' + testName + ' : ' + subtestName
                            + ': ' + testResults.tests[subtestName] + ' ms\n';
                    }
                }
                results += suiteName + ' : ' + suiteResults.total + ' ms\n';
            }
            results += 'Arithmetic Mean : ' + measuredValues.mean  + ' ms\n';
            results += 'Geometric Mean : ' + measuredValues.geomean  + ' ms\n';
            results += 'Total : ' + measuredValues.total + ' ms\n';
            results += 'Score : ' + measuredValues.score + ' rpm\n';

            if (!results)
                return;

            const pre = document.createElement('pre');
            document.body.appendChild(pre);
            pre.textContent = results;
        },
        didFinishLastIteration()
        {
            this.isRunning = false;
        }
    }
    const runner = new BenchmarkRunner(Suites,benchmarkClient);

    const iterationCount = searchParams.get('iterationCount') || 1;
    const onRunStep = () => {
        benchmarkClient.isStepping = true;
        if (!benchmarkClient.isRunning) {
            runner.runMultipleIterations(iterationCount);
        } else {
            benchmarkClient.step();
        }
    }
    const onRunSuites = () => {
        if (benchmarkClient.isRunning) {
            if (benchmarkClient.isStepping) {
                // Switch to continuous running only if we've been stepping.
                benchmarkClient.isStepping = false
                benchmarkClient.step();
            }
        } else {
            benchmarkClient.isStepping = false
            runner.runMultipleIterations(iterationCount);
        }
    };

    // Don't call step while step is already executing.
    document.body.appendChild(createUIForSuites(Suites, onRunStep, onRunSuites));

    if (searchParams.has('startAutomatically'))
        document.getElementById('runSuites').click();
}

window.addEventListener('load', startTest);
