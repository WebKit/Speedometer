import {BenchmarkRunner} from "./benchmark-runner.mjs";
import "./benchmark-report.mjs";
import * as Statistics from "./statistics.mjs";
import {Suites} from "./tests.mjs";

// FIXME(camillobruni): Add base class
class MainBenchmarkClient {
    displayUnit = 'runs/min';
    iterationCount = 10;
    stepCount = null;
    suitesCount = null;
    _measuredValuesList = [];
    _finishedTestCount =  0;
    _progressCompleted = null;
    _isRunning = false;

    constructor() {
        window.addEventListener('DOMContentLoaded', () => this.prepareUI());
    }

    // FIXME: Move this method to the tests/suites module.
    enableOneSuite(suites, suiteToEnable) {
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

    startBenchmark() {
        if (location.search.length > 1) {
            // FIXME: Use URLSearchParams
            let parts = location.search.substring(1).split('&');
            for (let i = 0; i < parts.length; i++) {
                const keyValue = parts[i].split('=');
                const key = keyValue[0];
                const value = keyValue[1];
                switch (key) {
                case 'unit':
                    if (value == 'ms')
                        this.displayUnit = 'ms';
                    else
                        console.error('Invalid unit: ' + value);
                    break;
                case 'iterationCount':
                    const parsedValue = parseInt(value);
                    if (!isNaN(parsedValue))
                        this.iterationCount = parsedValue;
                    else
                        console.error('Invalid iteration count: ' + value);
                    break;
                case 'suite':
                    if (!this.enableOneSuite(Suites, value)) {
                        alert('Suite "' + value + '" does not exist. No tests to run.');
                        return false;
                    }
                    break;
                }
            }
        }

        const enabledSuites = Suites.filter(suite => !suite.disabled);
        const totalSubtestsCount = enabledSuites.reduce((testsCount, suite) => { return testsCount + suite.tests.length; }, 0);
        this.stepCount = this.iterationCount * totalSubtestsCount;
        this.suitesCount = enabledSuites.length;
        const runner = new BenchmarkRunner(Suites, this);
        runner.runMultipleIterations(this.iterationCount);
        return true;
    }

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
        this._isRunning = true;
        this._measuredValuesList = [];
        this._finishedTestCount = 0;
        this._progressCompleted = document.getElementById('progress-completed');
    }

    didFinishLastIteration(metrics) {
        console.assert(this._isRunning);
        this._isRunning = false;
        const results = this._computeResults(this._measuredValuesList, this.displayUnit);

        this._updateGaugeNeedle(results.mean);
        document.getElementById('result-number').textContent = results.formattedMean;
        if (results.formattedDelta)
            document.getElementById('confidence-number').textContent = '\u00b1 ' + results.formattedDelta;

        this._populateDetailedResults(metrics);
        document.getElementById('results-with-statistics').textContent = results.formattedMeanAndDelta;

        if (this.displayUnit == 'ms') {
            document.getElementById('show-summary').style.display = 'none';
            this.showResultDetails();
        } else
            this.showResultsSummary();
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
        const delta = Statistics.confidenceIntervalDelta(0.95, values.length, sum, Statistics.squareSum(values));
        if (!isNaN(delta)) {
            const percentDelta = delta * 100 / arithmeticMean;
            meanSigFig = sigFigFromPercentDelta(percentDelta);
            formattedDelta = toSigFigPrecision(delta, 2);
            formattedPercentDelta = toSigFigPrecision(percentDelta, 2) + '%';
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

    _populateDetailedResults(metrics) {
        const scoreMetric = metrics['Score'];
        document.getElementById('score-chart').innerHTML = renderBarChart({metric: scoreMetric});
        document.getElementById('score-results-with-statistics').innerHTML = scoreMetric.valueString;

        const totalMetric = metrics['Total'];
        document.getElementById('total-chart').innerHTML = renderBarChart({metric: totalMetric});
        document.getElementById('total-results-with-statistics').innerHTML = totalMetric.valueString;

        const toplevelMetrics = Object.values(metrics).filter(
            (each) => !each.parent && each.children.length > 0
        );
        let html = "";
        for (const metric of toplevelMetrics) {
            html += renderMetricView(metric);
        }
        document.getElementById('metrics-results').innerHTML = html
    }

    prepareUI() {
        window.addEventListener('popstate', this._popStateHandler.bind(this), false);
        window.addEventListener('resize', this._resizeScreeHandler.bind(this));
        this._resizeScreeHandler();

        document.getElementById("logo").onclick = this._logoClickHandler.bind(this);
        document.getElementById("show-summary").onclick = this.showResultsSummary.bind(this);
        document.getElementById("show-details").onclick = this.showResultsDetails.bind(this);
        document.querySelectorAll(".show-about").forEach(
            each => { each.onclick = this.showAbout.bind(this) }
        );
        document.querySelectorAll(".start-tests-button").forEach(
            button => { button.onclick = this._startBenchmarkHandler.bind(this); }
        );
    }

    _popStateHandler(event) {
        if (event.state) {
            const sectionToShow = event.state.section;
            if (sectionToShow) {
                const sections = document.querySelectorAll('main > section');
                for (let i = 0; i < sections.length; i++) {
                    if (sections[i].id === sectionToShow)
                        return this._showSection(sectionToShow, false);
                }
            }
        }
        return this._showSection('home', false);
    }

    _resizeScreeHandler() {
        // FIXME: Detect when the window size changes during the test.
        const mainSize = document.querySelector('main').getBoundingClientRect()
        const screenIsTooSmall = window.innerWidth <  mainSize.width 
            || window.innerHeight < mainSize.height;
        document.getElementById('screen-size').textContent = window.innerWidth + 'px by ' + window.innerHeight + 'px';
        document.getElementById('screen-size-warning').style.display = screenIsTooSmall ? null : 'none';
    }

    _startBenchmarkHandler() {
        if (this.startBenchmark())
            this._showSection('running');
    }

    _logoClickHandler(event) {
        // Prevent any accidental UI changes during benchmark runs.
        if (!this._isRunning)
            this._showSection('home', true);
        event.preventDefault();
        return false;
    }

    showResultsSummary() {
        this._showSection('summarized-results', true);
    }

    showResultsDetails() {
        this._showSection('detailed-results', true);
    }

    showAbout() {
        this._showSection('about', true);
    }

    _showSection(sectionIdentifier, pushState) {
        const currentSectionElement = document.querySelector('section.selected');
        console.assert(currentSectionElement);

        const newSectionElement = document.getElementById(sectionIdentifier);
        console.assert(newSectionElement);

        currentSectionElement.classList.remove('selected');
        newSectionElement.classList.add('selected');

        if (pushState)
            history.pushState({section: sectionIdentifier}, document.title);
    }
}

window.benchmarkClient = new MainBenchmarkClient();


function renderMetricView(metric) {
	const children = metric.children;
	return `
		<dl>
			<dt>${metric.name}</dt>
			<dd>
				${renderScatterPlot({
					height: 30 + children.length * 10,
					width: 350,
					values: scatterPlotValues(metric),
					unit: "ms",
					xAxisLabel: "Duration [ms]"})}
				<ul class="chart">
					${children.map(
						(metric, i) => `
							<li class=${COLORS[i % COLORS.length]}>${metric.shortName}</li>
						`
					).join("")}
				</ul>
			</dd>
		</dl>
		${renderTestDetails(metric)}
	`;
}
function renderTestDetails(metric) {
	const children = metric.children;
	const hasChildMetric = children.length > 0 && children[0].children.length > 0;
    if (!hasChildMetric)
      return""
	return `
		<label class="details-toggle">
			<input type="checkbox"/>
			Timing Details
		</label>
		${metric.children.map(metric => renderMetricView(metric)).join("")}
	`;
}

function scatterPlotValues(metric) {
	let points = [];
	const metrics = metric.children;
	for (let metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
		const subMetric = metric.children[metricIndex];
		// Add variation data point
		const point = [
			subMetric.mean - subMetric.delta/2,
			metricIndex,
			`Mean: ${subMetric.valueString}`,
			subMetric.delta
		];
		points.push(point);
		const values = subMetric.values;
		for (let i = 0; i < values.length; i++) {
			const value = values[i];
			const point = [
				value,
				metricIndex + i / values.length,
				`Iteration ${i}: ${value.toFixed(2)}ms`
			];
			points.push(point);
		}
	}
	return points;
}

export const COLORS = ['blue', 'green', 'purple', 'orange', 'violet', 'green-light'];

function renderBarChart({ metric, width = 500, height = 200, min = 0, max})
{
	const values = metric.values;
	let maxValue = max;
	if (max == null) {
		maxValue = metric.max;
		max = (maxValue + (maxValue / height) * 20) | 0;
	}
    const unit = metric.unit;
	const meanValue = metric.mean;
	const w = (width / values.length) | 0;
	const large = w < 50;
	const innerHeight = height - 2;
	const toYPos = (value) => ((value / max) * innerHeight) | 0;
	const maxLabelWidth = 70;
	const maxYPos = height - toYPos(maxValue);
	const meanYPos = height - toYPos(meanValue);
	const minYPos = height - toYPos(metric.min);
	const barBorder = 14;
	const minLabelHeight = 14;

	return `
		<svg
			class="bar-chart chart"
			height=${height + 20}
			width=${width + maxLabelWidth}
			viewBox="${`-${maxLabelWidth} 0 ${width + maxLabelWidth} ${height + 20}`}"
			preserveAspectRatio="xMinYMin slice"
		>
			<text class="label" x="4" y=${maxYPos}>${maxValue.toFixed(1)}${unit}–</text>
			<text class="label" x="-1" y=${height}>${min}${unit}</text>
			<text x=${width / 2} y=${height + 5}>Iteration</text>
			<line x1="0" x2="0" y1="0" y2=${height} class="axis" />
			<line x1="0" x2=${width} y1=${height} y2=${height} class="axis" />
			${Math.abs(maxYPos - meanYPos) < minLabelHeight
				? null
				: `
						<text class="label" x="4" y=${meanYPos}>
							${meanValue.toFixed(1)}${unit}–
						</text>
				  `}
			${Math.abs(maxYPos - minYPos) < minLabelHeight &&
			Math.abs(meanYPos - minYPos) < minLabelHeight
				? null
				: `
						<text class="label" x="4" y=${minYPos}>
							${metric.min.toFixed(1)}${unit}–
						</text>
				  `}
			<line x1="0" x2=${width} y1=${maxYPos} y2=${maxYPos} class="minMax" />
			<line x1="0" x2=${width} y1=${meanYPos} y2=${meanYPos} class="mean">
				<title>Mean: ${metric.valueString}</title>
			</line>
			<line x1="0" x2=${width} y1=${minYPos} y2=${minYPos} class="minMax" />
			${values.map(
				(value, i) => `
					<g
						class=${large ? 'bar large' : 'bar'}
						transform="translate(${i * w} ${(innerHeight + 1 - toYPos(value)) | 0})"
					>
						<rect x=${barBorder / 2} height=${toYPos(value)} width=${w - barBorder}>
							<title>Iteration ${i}: ${value.toFixed(2)}${unit}</title>
						</rect>
						<text y="5" x=${w / 2} text-anchor="middle">
							${value.toFixed(1).replace('.0', '')}
						</text>
					</g>
				`
			).join("")}
		</svg>
	`;
}

function renderScatterPlot({ values, width = 500, height = 200, xAxisLabel, unit = '' }) {
	let xmin = Infinity,
		xmax = 0;
	let ymin = Infinity,
		ymax = 0;
	for (let value of values) {
		let [x, y] = value;
		xmin = Math.min(xmin, x);
		xmax = Math.max(xmax, x);
		ymin = Math.min(ymin, y);
		ymax = Math.max(ymax, y);
	}

	const yspread = ymax - ymin || 1;
	const xspread = xmax - xmin;
	const vaxis = 16;
	const vbuf = 10;
	const haxis = 10;
	const axisWidth = width - haxis * 2;
	const unitToXpos = axisWidth / xspread;
	const unitToYPos = (height - vaxis - vbuf * 2) / yspread;
	const vaxisY = height - vaxis + 4;
	const markerSize = 2;

	return `
		<svg
			class="scatter-plot chart"
			width=${width}
			height=${height}
			viewBox="${`0 0 ${width} ${height}`}"
		>
			<line
				x1=${haxis}
				x1=${haxis + axisWidth}
				y1=${vaxisY - 4}
				y2=${vaxisY - 4}
				class="axis"
			/>
			<text y=${vaxisY} x="0" text-anchor="start">${xmin.toFixed(2)}${unit}</text>
			<text y=${vaxisY} x=${width / 2} text-anchor="middle">${xAxisLabel}</text>
			<text y=${vaxisY} x=${width - haxis} text-anchor="end">${xmax.toFixed(2)}${unit}</text>
			<defs>
				<g id="marker">
					<circle r=${markerSize - 1} />
				</g>
			</defs>
			${values.map(renderValue).join("")}
		</svg>
	`;

	function renderValue(value) {
		const [rawX, rawY, label, rawWidth = 0] = value;
		let w = rawWidth * unitToXpos;
		let x = (rawX - xmin) * unitToXpos + haxis - rawWidth / 2;
		let y = (rawY - ymin) * unitToYPos + vbuf;
		const trackIndex = rawY | 0;
		const cssClass = COLORS[trackIndex % COLORS.length];

		if (value.length <= 3) {
			return `
				<use href="#marker" x=${x} y=${y} class="marker ${cssClass}">
					<title>${label}</title>
				</use>
			`;
		}

		const boxY = y - markerSize;
		const boxY2 = y + vbuf;
		const height = vbuf + markerSize;
		return `
			<g class="percentile ${cssClass}">
				<rect x=${x} y=${boxY} width=${w} height=${height}>
					<title>${label}</title>
				</rect>
				<line x1=${x} x2=${x} y1=${boxY} y2=${boxY2} />
				<line
					x1=${x + w / 2}
					x2=${x + w / 2}
					y1=${boxY}
					y2=${boxY2}
					stroke-dasharray=${height / 3}
				/>
				<line x1=${x + w} x2=${x + w} y1=${boxY} y2=${boxY2} />
			</g>
		`;
	}
}