class BenchmarkClient {
    displayUnit = 'runs/min';
    iterationCount = 10;
    stepCount = null;
    suitesCount = null;
    _measuredValuesList = [];
    _finishedTestCount =  0;
    _progressCompleted = null;
    willAddTestFrame(frame) {
        const main = document.querySelector('main');
        const style = getComputedStyle(main);
        frame.style.left = main.offsetLeft + parseInt(style.borderLeftWidth) + parseInt(style.paddingLeft) + 'px';
        frame.style.top = main.offsetTop + parseInt(style.borderTopWidth) + parseInt(style.paddingTop) + 'px';
    }
    willRunTest(suite, test) {
        document.getElementById('info').textContent = suite.name + ' ( ' + this._finishedTestCount + ' / ' + this.stepCount + ' )';
    }
    didRunTest() {
        this._finishedTestCount++;
        this._progressCompleted.style.width = (this._finishedTestCount * 100 / this.stepCount) + '%';
    }
    didRunSuites(measuredValues) {
        this._measuredValuesList.push(measuredValues);
    }
    willStartFirstIteration() {
        this._measuredValuesList = [];
        this._finishedTestCount = 0;
        this._progressCompleted = document.getElementById('progress-completed');
        document.getElementById('logo-link').onclick = event => { event.preventDefault(); return false; };
    }
    didFinishLastIteration() {
        document.getElementById('logo-link').onclick = null;

        const results = this._computeResults(this._measuredValuesList, this.displayUnit);

        this._updateGaugeNeedle(results.mean);
        document.getElementById('result-number').textContent = results.formattedMean;
        if (results.formattedDelta)
            document.getElementById('confidence-number').textContent = '\u00b1 ' + results.formattedDelta;

        this._populateDetailedResults(results.formattedValues);
        document.getElementById('results-with-statistics').textContent = results.formattedMeanAndDelta;

        if (this.displayUnit == 'ms') {
            document.getElementById('show-summary').style.display = 'none';
            showResultDetails();
        } else
            showResultsSummary();
    }
    _computeResults(measuredValuesList, displayUnit) {
        const suitesCount = this.suitesCount;
        function valueForUnit(measuredValues) {
            if (displayUnit == 'ms')
                return measuredValues.geomean;
            return measuredValues.score;
        }

        function sigFigFromPercentDelta(percentDelta) {
            return Math.ceil(-Math.log(percentDelta)/Math.log(10)) + 3;
        }

        function toSigFigPrecision(number, sigFig) {
            const nonDecimalDigitCount = number < 1 ? 0 : (Math.floor(Math.log(number)/Math.log(10)) + 1);
            return number.toPrecision(Math.max(nonDecimalDigitCount, Math.min(6, sigFig)));
        }

        const values = measuredValuesList.map(valueForUnit);
        const sum = values.reduce((a, b) => { return a + b; }, 0);
        const arithmeticMean = sum / values.length;
        let meanSigFig = 4;
        let formattedDelta;
        let formattedPercentDelta;
        if (window.Statistics) {
            const delta = Statistics.confidenceIntervalDelta(0.95, values.length, sum, Statistics.squareSum(values));
            if (!isNaN(delta)) {
                const percentDelta = delta * 100 / arithmeticMean;
                meanSigFig = sigFigFromPercentDelta(percentDelta);
                formattedDelta = toSigFigPrecision(delta, 2);
                formattedPercentDelta = toSigFigPrecision(percentDelta, 2) + '%';
            }
        }

        const formattedMean = toSigFigPrecision(arithmeticMean, Math.max(meanSigFig, 3));

        return {
            formattedValues: values.map(value =>  {
                return toSigFigPrecision(value, 4) + ' ' + displayUnit;
            }),
            mean: arithmeticMean,
            formattedMean: formattedMean,
            formattedDelta: formattedDelta,
            formattedMeanAndDelta: formattedMean + (formattedDelta ? ' \xb1 ' + formattedDelta + ' (' + formattedPercentDelta + ')' : ''),
        };
    }
    _addDetailedResultsRow(table, iterationNumber, value) {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = 'Iteration ' + (iterationNumber + 1);
        const td = document.createElement('td');
        td.textContent = value;
        row.appendChild(th);
        row.appendChild(td);
        table.appendChild(row);
    }
    _updateGaugeNeedle(rpm) {
        const needleAngle = Math.max(0, Math.min(rpm, 140)) - 70;
        const needleRotationValue = 'rotate(' + needleAngle + 'deg)';

        const gaugeNeedleElement = document.querySelector('#summarized-results > .gauge .needle');
        gaugeNeedleElement.style.setProperty('-webkit-transform', needleRotationValue);
        gaugeNeedleElement.style.setProperty('-moz-transform', needleRotationValue);
        gaugeNeedleElement.style.setProperty('-ms-transform', needleRotationValue);
        gaugeNeedleElement.style.setProperty('transform', needleRotationValue);
    }
    _populateDetailedResults(formattedValues) {
        const resultsTables = document.querySelectorAll('.results-table');
        let i = 0;
        resultsTables[0].innerHTML = '';
        for (; i < Math.ceil(formattedValues.length / 2); i++)
            this._addDetailedResultsRow(resultsTables[0], i, formattedValues[i]);
        resultsTables[1].innerHTML = '';
        for (; i < formattedValues.length; i++)
            this._addDetailedResultsRow(resultsTables[1], i, formattedValues[i]);
    }
    prepareUI() {
        window.addEventListener('popstate', event => {
            if (event.state) {
                const sectionToShow = event.state.section;
                if (sectionToShow) {
                    const sections = document.querySelectorAll('main > section');
                    for (let i = 0; i < sections.length; i++) {
                        if (sections[i].id === sectionToShow)
                            return showSection(sectionToShow, false);
                    }
                }
            }
            return showSection('home', false);
        }, false);

        function updateScreenSize() {
            // FIXME: Detect when the window size changes during the test.
            const screenIsTooSmall = window.innerWidth < 850 || window.innerHeight < 650;
            document.getElementById('screen-size').textContent = window.innerWidth + 'px by ' + window.innerHeight + 'px';
            document.getElementById('screen-size-warning').style.display = screenIsTooSmall ? null : 'none';
        }

        window.addEventListener('resize', updateScreenSize);
        updateScreenSize();
    }
}

window.benchmarkClient = new BenchmarkClient();

function enableOneSuite(suites, suiteToEnable)
{
    suiteToEnable = suiteToEnable.toLowerCase();
    let found = false;
    for (let i = 0; i < suites.length; i++) {
        const currentSuite = suites[i];
        if (currentSuite.name.toLowerCase() == suiteToEnable) {
            currentSuite.disabled = false;
            found = true;
        } else
            currentSuite.disabled = true;
    }
    return found;
}

function startBenchmark() {
    if (location.search.length > 1) {
        let parts = location.search.substring(1).split('&');
        for (let i = 0; i < parts.length; i++) {
            const keyValue = parts[i].split('=');
            const key = keyValue[0];
            const value = keyValue[1];
            switch (key) {
            case 'unit':
                if (value == 'ms')
                    benchmarkClient.displayUnit = 'ms';
                else
                    console.error('Invalid unit: ' + value);
                break;
            case 'iterationCount':
                const parsedValue = parseInt(value);
                if (!isNaN(parsedValue))
                    benchmarkClient.iterationCount = parsedValue;
                else
                    console.error('Invalid iteration count: ' + value);
                break;
            case 'suite':
                if (!enableOneSuite(Suites, value)) {
                    alert('Suite "' + value + '" does not exist. No tests to run.');
                    return false;
                }
                break;
            }
        }
    }

    const enabledSuites = Suites.filter(suite => !suite.disabled);
    const totalSubtestsCount = enabledSuites.reduce((testsCount, suite) => { return testsCount + suite.tests.length; }, 0);
    benchmarkClient.stepCount = benchmarkClient.iterationCount * totalSubtestsCount;
    benchmarkClient.suitesCount = enabledSuites.length;
    const runner = new BenchmarkRunner(Suites, benchmarkClient);
    runner.runMultipleIterations(benchmarkClient.iterationCount);

    return true;
}

function showSection(sectionIdentifier, pushState) {
    const currentSectionElement = document.querySelector('section.selected');
    console.assert(currentSectionElement);

    const newSectionElement = document.getElementById(sectionIdentifier);
    console.assert(newSectionElement);

    currentSectionElement.classList.remove('selected');
    newSectionElement.classList.add('selected');

    if (pushState)
        history.pushState({section: sectionIdentifier}, document.title);
}

function showHome() {
    showSection('home', true);
}

function startTest() {
    if (startBenchmark())
        showSection('running');
}

function showResultsSummary() {
    showSection('summarized-results', true);
}

function showResultDetails() {
    showSection('detailed-results', true);
}

function showAbout() {
    showSection('about', true);
}

window.addEventListener('DOMContentLoaded', () => {
    if (benchmarkClient.prepareUI)
        benchmarkClient.prepareUI();
});
