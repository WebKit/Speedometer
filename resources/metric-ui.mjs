
export function renderMetricView(metric)
{
    const children = metric.children;
    return `
        <dl class="metric">
            <dt><h3>${metric.name}<h3></dt>
            <dd>
                <div class="metric-chart">
                    ${renderScatterPlot({
                        height: 30 + children.length * 20,
                        width: 500,
                        values: scatterPlotValues(metric),
                        unit: "ms",
                        xAxisLabel: "Duration [ms]"})}
                    <table class="chart chart-legend">
                        ${children.map(
                            (metric, i) => `
                                <tr class=${COLORS[i % COLORS.length]}>
                                    <td>⏺</td>
                                    <td>${metric.shortName}</td>
                                    <td>${metric.valueString}</td>
                                </tr>
                            `
                        ).join("")}
                    </table>
                </div>
                ${renderSubMetrics(metric)}
            </dd>
        </dl>
    `;
}

function renderSubMetrics(metric)
{
    const children = metric.children;
    const hasChildMetric = children.length > 0 && children[0].children.length > 0;
    if (!hasChildMetric)
      return""
    return `
        <label class="details-toggle"
               onclick="this.nextElementSibling.classList.toggle('visible')">
            <input type="checkbox"/>
            Details
        </label>
        <div class="submetrics">
            ${metric.children.map(metric => renderMetricView(metric)).join("")}
        </div>
    `;
}

function scatterPlotValues(metric)
{
    let points = [];
    const metrics = metric.children;
    for (let metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
        const subMetric = metric.children[metricIndex];
        // Add variation data point
        const point = [
            subMetric.mean - subMetric.delta / 2,
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

export const COLORS = ['blue', 'green', 'orange', 'violet', 'green-light', 'red', 'purple' ];

export function renderBarChart({ metric, width = 700, height = 200, min = 0, max})
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
    const vbuf = 15;
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