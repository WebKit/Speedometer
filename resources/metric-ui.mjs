export function renderMetricView(metric, width = 500) {
    const children = metric.children;
    const scatterPlot = renderScatterPlot({
        trackHeight: 20,
        width: width,
        values: scatterPlotNormalizedValues(metric),
        unit: "%",
        xAxisLabel: "Spread Normalized",
    });
    const legend = children
        .map(
            (metric, i) => `
                <tr class=${COLORS[i % COLORS.length]}>
                    <td>⏺</td>
                    <td>${metric.shortName}</td>
                    <td class="number">${metric.mean.toFixed(2)}</td>
                    <td>±</td>
                    <td>${metric.deltaString}</td>
                    <td>${metric.unit}</td>
                </tr>`
        )
        .join("");
    return `
        <dl class="metric">
            <dt><h3>${metric.name}<h3></dt>
            <dd>
                <div class="metric-chart">
                    ${scatterPlot}
                    <table class="chart chart-legend">${legend}</table>
                </div>
                ${renderSubMetrics(metric)}
            </dd>
        </dl>
    `;
}

function renderSubMetrics(metric) {
    const children = metric.children;
    const hasChildMetric = children.length > 0 && children[0].children.length > 0;
    if (!hasChildMetric)
        return "";
    return `
        <label class="details-toggle"
               onclick="this.nextElementSibling.classList.toggle('visible')">
            <input type="checkbox"/>
            Details
        </label>
        <div class="submetrics">
            ${metric.children.map((metric) => renderMetricView(metric)).join("")}
        </div>
    `;
}

function scatterPlotNormalizedValues(metric) {
    let points = [];
    const metrics = metric.children;
    // Arrange child-metrics values in a single coordinate system:
    // - metric 1: x values are in range [0, 1]
    // - metric 2: y values are in range [1, 2]
    // - ...
    // This way each metric data point is on a separate track in the scatter
    // plot.
    // All x values are normalized by the mean of each metric and centered on 0.
    // Example: [90ms, 100ms, 110ms] =>  [-10%, 0%, +10%]
    for (let metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
        const subMetric = metric.children[metricIndex];
        // Add coordinated for deviation rect:
        const mean = subMetric.mean;
        const width = subMetric.delta / mean;
        const left = 0 - width / 2;
        const y = metricIndex;
        const rect = [left * 100, y, `Mean: ${subMetric.valueString}`, width * 100];
        points.push(rect);
        // Add data for individual points:
        const values = subMetric.values;
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const x = (value / mean) * 100 - 100;
            const y = metricIndex + i / values.length;
            const point = [x, y, `Iteration ${i}: ${value.toFixed(2)}ms`];
            points.push(point);
        }
    }
    return points;
}

export const COLORS = ["blue", "green", "orange", "violet", "green-light", "red", "purple"];

export function renderBarChart({ metric, width = 700, height = 200, min = 0, max }) {
    const values = metric.values;
    let maxValue = max;
    if (max === undefined) {
        maxValue = metric.max;
        max = (maxValue + (maxValue / height) * 20) | 0;
    }
    const maxLabelWidth = 70;
    width -= maxLabelWidth;
    const unit = metric.unit;
    const meanValue = metric.mean;
    const w = (width / values.length) | 0;
    const large = w < 50;
    const innerHeight = height - 2;
    const toYPos = (value) => ((value / max) * innerHeight) | 0;
    const maxYPos = height - toYPos(maxValue);
    const meanYPos = height - toYPos(meanValue);
    const minYPos = height - toYPos(metric.min);
    const barBorder = 14;
    const minLabelHeight = 14;

    let meanLabel = "";
    let minLabel = "";
    if (Math.abs(maxYPos - meanYPos) < minLabelHeight) {
        meanLabel = `<text class="label" x="4" y="${meanYPos}">
                        ${meanValue.toFixed(1)}${unit}–
                     </text>`;
        if (Math.abs(maxYPos - minYPos) < minLabelHeight) {
            minLabel = `<text class="label" x="4" y="${minYPos}">
                            ${metric.min.toFixed(1)}${unit}–
                        </text>`;
        }
    }
    const bars = values
        .map(
            (value, i) => `
                <g
                    class="${large ? "bar large" : "bar"}"
                    transform="translate(${i * w} ${(innerHeight + 1 - toYPos(value)) | 0})">
                    <rect x="${barBorder / 2}" height="${toYPos(value)}" width="${w - barBorder}">
                        <title>Iteration ${i}: ${value.toFixed(2)}${unit}</title>
                    </rect>
                    <text y="5" x="${w / 2}" text-anchor="middle">
                        ${value.toFixed(1).replace(".0", "")}
                    </text>
                </g>
            `
        )
        .join("");
    return `
        <svg class="bar-chart chart"
                height="${height + 20}"
                width="${width + maxLabelWidth}"
                viewBox="${`-${maxLabelWidth} 0 ${width + maxLabelWidth} ${height + 20}`}"
                preserveAspectRatio="xMinYMin slice">
            <text class="label" x="4" y="${maxYPos}">${maxValue.toFixed(1)}${unit}–</text>
            <text class="label" x="-1" y="${height}">${min}${unit}</text>
            <text x="${width / 2}" y="${height + 5}">Iteration</text>
            <line x1="0" x2="0" y1="0" y2=${height} class="axis" />
            <line x1="0" x2="${width}" y1="${height}" y2="${height}" class="axis" />
            ${meanLabel}
            ${minLabel}
            <line x1="0" x2="${width}" y1="${maxYPos}" y2="${maxYPos}" class="minMax" />
            <line x1="0" x2="${width}" y1="${meanYPos}" y2="${meanYPos}" class="mean">
                <title>Mean: ${metric.valueString}</title>
            </line>
            <line x1="0" x2="${width}" y1="${minYPos}" y2="${minYPos}" class="minMax" />
            ${bars}
        </svg>
    `;
}

function renderScatterPlot({ values, width = 500, height, trackHeight, xAxisLabel, unit = "" }) {
    if (!height && !trackHeight)
        throw new Error("Either height or trackHeight must be specified");
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
    // Max delta of values across each axis:
    const trackCount = Math.ceil(ymax - ymin) || 1;
    const spreadX = xmax - xmin;
    // Axis + labels height:
    const axisHeight = 18;
    const axisMarginY = 4;
    const markerSize = 2;
    const trackMargin = markerSize;
    // Recalculate height:
    if (height) {
        trackHeight = (height - axisHeight - axisMarginY) / trackCount;
    } else {
        height = trackCount * trackHeight + axisHeight + axisMarginY;
    }
    // Horizontal axis position:
    const axisY = height - axisHeight + axisMarginY;
    const unitToPosX = width / spreadX;
    const unitToPosY = trackHeight - trackMargin;
    return `
        <svg class="scatter-plot chart"
            width="${width}" height="${height}"
            viewBox="${`0 0 ${width} ${height}`}">
            <g class="horizontal-axis">
                <line
                    x1="${0}" x2="${width}"
                    y1="${axisY - axisMarginY}" y2="${axisY - axisMarginY}"
                    class="axis" />
                <text y="${axisY}" x="0" text-anchor="start">${xmin.toFixed(2)}${unit}</text>
                <text y="${axisY}" x="${width / 2}" text-anchor="middle">${xAxisLabel}</text>
                <text y="${axisY}" x="${width}" text-anchor="end">${xmax.toFixed(2)}${unit}</text>
            </g>
            <defs>
                <g id="marker">
                    <circle r="${markerSize - 1}" />
                </g>
            </defs>
            ${values.map(renderValue).join("")}
        </svg>
    `;

    function renderValue(value) {
        const [rawX, rawY, label, rawWidth = 0] = value;
        const trackIndex = rawY | 0;
        const y = (rawY - ymin) * unitToPosY + trackMargin * trackIndex;
        const cssClass = COLORS[trackIndex % COLORS.length];

        if (value.length <= 3) {
            // Render a simple marker:
            const x = (rawX - xmin) * unitToPosX;
            const adjustedY = y + trackMargin;
            return `
                <use href="#marker" x="${x}" y="${adjustedY}" class="marker ${cssClass}">
                    <title>${label}</title>
                </use>
            `;
        } else {
            // Render a rect with 4 input values:
            const x = (rawX - xmin) * unitToPosX + rawWidth / 2;
            const w = rawWidth * unitToPosX;
            const centerX = x + w / 2;
            const top = y;
            const height = trackHeight - trackMargin;
            const bottom = top + height;
            return `
            <g class="percentile ${cssClass}">
                <rect x="${x}" y="${top}" width="${w}" height="${height}">
                    <title>${label}</title>
                </rect>
                <line x1="${x}" x2="${x}" y1="${top}" y2="${bottom}" />
                <line
                    x1="${centerX}" x2="${centerX}"
                    y1="${top}"     y2="${bottom}"
                    stroke-dasharray="${height / 3}" />
                <line x1="${x + w}" x2="${x + w}" y1="${top}" y2="${bottom}" />
            </g>
        `;
        }
    }
}
