export const COLORS = Object.freeze(["blue", "blue-light", "green-light", "green", "yellow", "orange", "red", "magenta", "violet", "purple", "blue-dark", "green-dark", "ochre", "rust"]);

export function renderMetricView(params) {
    let { metric, width = 500, trackHeight = 20, subMetricMargin = 35, title = "", mode = "normalized", colors = COLORS, renderChildren = true } = params;
    // Make sure subMetricMargin is set for use in renderSubMetrics.
    params.subMetricMargin = subMetricMargin;
    const children = metric.children;
    let scatterPlotParams = { width, trackHeight, colors };
    if (mode === "normalized") {
        scatterPlotParams.values = prepareScatterPlotValues(metric, true);
        scatterPlotParams.unit = "%";
        scatterPlotParams.xAxisLabel = "Spread Normalized";
    } else if (mode === "absolute") {
        scatterPlotParams.values = prepareScatterPlotValues(metric, false);
        scatterPlotParams.unit = metric.unit;
        scatterPlotParams.xAxisLabel = metric.unit;
    } else {
        throw new Error(`Invalid metric view mode = "${mode}"`);
    }
    const scatterPlot = renderScatterPlot(scatterPlotParams);
    const legend = children
        .map(
            (metric, i) => `
                <tr >
                    <td class=${colors[i % colors.length]} >●</td>
                    <td class="label">${metric.shortName}</td>
                    <td class="number">${metric.mean.toFixed(2)}</td>
                    <td>±</td>
                    <td>${metric.deltaString}</td>
                    <td>${metric.unit}</td>
                </tr>`
        )
        .join("");
    const subMetrics = renderChildren ? renderSubMetrics(params) : "";
    return `
        <dl class="metric">
            <dt><h3>${title}<h3></dt>
            <dd>
                <div class="metric-chart">
                    ${scatterPlot}
                    <table class="chart chart-legend">${legend}</table>
                </div>
                ${subMetrics}
            </dd>
        </dl>
    `;
}

function renderSubMetrics(params) {
    let { metric, width, subMetricMargin, colors = COLORS } = params;
    const children = metric.children;
    const hasChildMetric = children.length > 0 && children[0].children.length > 0;
    if (!hasChildMetric)
        return "";
    const subMetricWidth = width - subMetricMargin;
    let childColors = [...colors];
    const subMetrics = metric.children
        .map((metric) => {
            // Rotate colors to get different colors for sub-plots.
            for (let i = 0; i < metric.children.length; i++) {
                const color = childColors.pop();
                childColors.unshift(color);
            }
            const subMetricParams = { ...params, metric, title: metric.name, width: subMetricWidth, colors: childColors };
            return renderMetricView(subMetricParams);
        })
        .join("");
    return `
        <label class="details-toggle">
            <input type="checkbox" 
                    onclick="this.parentNode.nextElementSibling.classList.toggle('visible')" />
            Details
        </label>
        <div class="submetrics">
            ${subMetrics}
        </div>
    `;
}

function prepareScatterPlotValues(metric, normalize = true) {
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
    const toPercent = 100;
    for (let metricIndex = 0; metricIndex < metrics.length; metricIndex++) {
        const subMetric = metrics[metricIndex];
        // Add coordinated for deviation rect:
        const mean = subMetric.mean;
        const unit = subMetric.unit;
        let width = subMetric.delta;
        let center = mean;
        if (normalize) {
            width = (subMetric.delta / mean) * toPercent;
            center = 0;
        }
        let left = center - width / 2;
        const y = metricIndex;
        const label = `Mean: ${subMetric.valueString}\n` + `Min: ${subMetric.min.toFixed(2)}${unit}\n` + `Max: ${subMetric.max.toFixed(2)}${unit}`;
        const rect = [left, y, label, width];
        // Add data for individual points:
        const values = subMetric.values;
        points.push(rect);
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            let x = value;
            const normalized = (value / mean - 1) * toPercent;
            const sign = normalized < 0 ? "" : "+";
            if (normalize)
                x = normalized;
            // Each value is mapped to a y-coordinate in the range [metricIndex, metricIndex + 1]
            const valueOffsetY = i / values.length;
            const y = metricIndex + valueOffsetY;
            let label = `Iteration ${i}: ${value.toFixed(2)}${unit}\n` + `Normalized: $mean${sign}${normalized.toFixed(2)}%`;
            const point = [x, y, label];
            points.push(point);
        }
    }
    return points;
}

function renderScatterPlot({ values, width = 500, height, trackHeight, xAxisLabel, unit = "", colors = COLORS }) {
    if (!height && !trackHeight)
        throw new Error("Either height or trackHeight must be specified");
    let xmin = Infinity;
    let xmax = 0;
    let ymin = Infinity;
    let ymax = 0;
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
    const markerSize = 5;
    const trackMargin = 2;
    // Recalculate height:
    if (height) {
        trackHeight = (height - axisHeight - axisMarginY) / trackCount;
    } else {
        height = trackCount * trackHeight + axisHeight + axisMarginY;
    }
    // Horizontal axis position:
    const axisY = height - axisHeight + axisMarginY;
    const unitToPosX = width / spreadX;
    const unitToPosY = trackHeight - trackMargin - markerSize / 2;
    const points = values.map(renderValue).join("");
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
                    <circle r="${markerSize / 2}" />
                </g>
            </defs>
            <g class="values">
                ${points}
            </g>
        </svg>
    `;

    function renderValue(value) {
        const [rawX, rawY, label, rawWidth = 0] = value;
        const trackIndex = rawY | 0;
        const y = (rawY - ymin) * unitToPosY + markerSize * trackIndex;
        const cssClass = colors[trackIndex % colors.length];

        if (value.length <= 3) {
            // Render a simple marker:
            const x = (rawX - xmin) * unitToPosX;
            const adjustedY = y + markerSize / 2;
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
