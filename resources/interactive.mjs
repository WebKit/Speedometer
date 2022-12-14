import {BenchmarkRunner} from "./benchmark-runner.mjs";
import {Suites} from "./tests.mjs";

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

const parseQueryString = (function (pairList)
{
    const pairs = {};
    for (let i = 0; i < pairList.length; ++i) {
        const keyValue = pairList[i].split('=', 2);
        if (keyValue.length == 1)
            pairs[keyValue[0]] = '';
        else
            pairs[keyValue[0]] = decodeURIComponent(keyValue[1].replace(/\+/g, ' '));
    }
    return pairs;
})(window.location.search.substr(1).split('&'));

function disableAllSuitesExcept(suiteName)
{
    Suites.forEach(function(element) {
        if (element.name !== suiteName)
            element.disabled = true;
    });
}

function startTest()
{
    const queryParam = parseQueryString['suite'];
    if (queryParam !== undefined)
        disableAllSuitesExcept(queryParam);

    const benchmarkClient = {
        stepperPromise: undefined,
        stepper: undefined,
        step() {
            this.stepperPromise = new Promise(resolve => {
                this.stepper = () => {
                    this.step()
                    resolve()
                }
            });
        },
        willRunTest(suite, test) {
            test.anchor.classList.add('running');
        },
        async didRunTest(suite, test) {
            const classList = test.anchor.classList;
            classList.remove('running');
            classList.add('ran');
            if (this.stepperPromise)
                await this.stepperPromise;
        },
        didRunSuites(measuredValues) {
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
        }
    }
    const runner = new BenchmarkRunner(Suites,benchmarkClient);

    let currentState = null;
    const iterationCount = parseQueryString["iterationCount"] || 1
    const onRunStep = () => {
        if (benchmarkClient.stepperPromise)
            benchmarkClient.stepper()
        else {
            benchmarkClient.step()
            runner.runMultipleIterations(iterationCount);
        }
    }
    const onRunSuites = () => {
        benchmarkClient.stepperPromise = undefined;
        runner.runMultipleIterations(iterationCount);
    }

    // Don't call step while step is already executing.
    document.body.appendChild(createUIForSuites(Suites, onRunStep, onRunSuites));

    if (parseQueryString['startAutomatically'] !== undefined)
        document.getElementById('runSuites').click();
}

window.addEventListener('load', startTest);
