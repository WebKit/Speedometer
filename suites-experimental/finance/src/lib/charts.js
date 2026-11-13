const UP = [10, 138, 95];
const DOWN = [209, 52, 75];

function rgba([r, g, b], alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Sizes the backing store to the element's laid-out size. Callers pass a size
// they have measured once rather than reading layout on every draw.
function prepareCanvas(canvas, width, height) {
    const ratio = window.devicePixelRatio || 1;
    const backingWidth = Math.round(width * ratio);
    const backingHeight = Math.round(height * ratio);
    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
    }
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    return { context, width, height };
}

export function extent(series, baseline) {
    let min = baseline;
    let max = baseline;
    for (const value of series) {
        if (value < min)
            min = value;
        if (value > max)
            max = value;
    }
    if (min === max)
        return [min - 1, max + 1];
    return [min, max];
}

function tracePath(context, series, scaleX, scaleY) {
    context.beginPath();
    for (let i = 0; i < series.length; i++) {
        if (i === 0)
            context.moveTo(scaleX(i), scaleY(series[i]));
        else
            context.lineTo(scaleX(i), scaleY(series[i]));
    }
}

function drawSeries(context, series, baseline, width, top, bottom, left, right, lineWidth) {
    const [min, max] = extent(series, baseline);
    const color = series[series.length - 1] >= baseline ? UP : DOWN;
    const scaleX = (i) => left + (i / (series.length - 1)) * (right - left);
    const scaleY = (value) => top + (1 - (value - min) / (max - min)) * (bottom - top);

    tracePath(context, series, scaleX, scaleY);
    context.lineTo(scaleX(series.length - 1), bottom);
    context.lineTo(scaleX(0), bottom);
    context.closePath();
    const gradient = context.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, rgba(color, 0.28));
    gradient.addColorStop(1, rgba(color, 0));
    context.fillStyle = gradient;
    context.fill();

    tracePath(context, series, scaleX, scaleY);
    context.strokeStyle = rgba(color, 1);
    context.lineWidth = lineWidth;
    context.lineJoin = "round";
    context.stroke();

    context.beginPath();
    context.setLineDash([2, 3]);
    context.moveTo(left, scaleY(baseline));
    context.lineTo(right, scaleY(baseline));
    context.strokeStyle = "rgba(90, 98, 112, 0.7)";
    context.lineWidth = 1;
    context.stroke();
    context.setLineDash([]);

    return { min, max, scaleY };
}

export function drawSparkline(canvas, size, series, baseline) {
    const { context, width, height } = prepareCanvas(canvas, size.width, size.height);
    drawSeries(context, series, baseline, width, 2, height - 2, 0, width, 1.5);
}

export function drawAreaChart(canvas, size, series, baseline, timeLabels, formatValue) {
    const { context, width, height } = prepareCanvas(canvas, size.width, size.height);
    const axisWidth = 64;
    const axisHeight = 22;
    const right = width - axisWidth;
    const bottom = height - axisHeight;
    const { min, max, scaleY } = drawSeries(context, series, baseline, width, 8, bottom, 0, right, 2);

    context.font = "11px system-ui, sans-serif";
    context.fillStyle = "#5a6270";
    context.strokeStyle = "rgba(90, 98, 112, 0.15)";
    context.lineWidth = 1;
    context.textBaseline = "middle";
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const value = min + ((max - min) * i) / steps;
        const y = Math.round(scaleY(value)) + 0.5;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(right, y);
        context.stroke();
        context.fillText(formatValue(value), right + 8, y);
    }

    context.textBaseline = "alphabetic";
    context.textAlign = "center";
    for (let i = 0; i < timeLabels.length; i++) {
        const x = (i / (timeLabels.length - 1)) * right;
        const label = timeLabels[i];
        const labelWidth = context.measureText(label).width;
        context.fillText(label, Math.min(Math.max(x, labelWidth / 2), right - labelWidth / 2), height - 6);
    }
    context.textAlign = "start";
}

export function svgSparklinePath(series, baseline, width, height) {
    const [min, max] = extent(series, baseline);
    const scaleY = (value) => 1 + (1 - (value - min) / (max - min)) * (height - 2);
    let path = "";
    for (let i = 0; i < series.length; i++) {
        const x = (i / (series.length - 1)) * width;
        path += `${i ? "L" : "M"}${x.toFixed(1)} ${scaleY(series[i]).toFixed(1)}`;
    }
    return { path, baselineY: scaleY(baseline).toFixed(1) };
}

const HEAT_STOPS = [
    [-3, [198, 47, 69]],
    [0, [93, 100, 112]],
    [3, [19, 145, 95]],
];

export function heatColor(changePercent) {
    const value = Math.max(-3, Math.min(3, changePercent));
    for (let i = 1; i < HEAT_STOPS.length; i++) {
        const [toValue, to] = HEAT_STOPS[i];
        if (value <= toValue) {
            const [fromValue, from] = HEAT_STOPS[i - 1];
            const t = (value - fromValue) / (toValue - fromValue);
            const channel = (c) => Math.round(from[c] + (to[c] - from[c]) * t);
            return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
        }
    }
    return `rgb(${HEAT_STOPS[2][1].join(", ")})`;
}

function worstRatio(row, rowArea, side) {
    let min = Infinity;
    let max = 0;
    for (const item of row) {
        min = Math.min(min, item.area);
        max = Math.max(max, item.area);
    }
    const sideSquared = side * side;
    const areaSquared = rowArea * rowArea;
    return Math.max((sideSquared * max) / areaSquared, areaSquared / (sideSquared * min));
}

// Squarified treemap (Bruls, Huizing, van Wijk). Items need a positive value.
export function squarify(items, x, y, width, height) {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const scale = (width * height) / total;
    const queue = items.map((item) => ({ item, area: item.value * scale })).sort((a, b) => b.area - a.area);
    const rects = [];

    let row = [];
    let rowArea = 0;
    const layoutRow = () => {
        const horizontal = width >= height;
        const side = horizontal ? height : width;
        const thickness = rowArea / side;
        let offset = 0;
        for (const entry of row) {
            const length = entry.area / thickness;
            if (horizontal)
                rects.push({ item: entry.item, x, y: y + offset, width: thickness, height: length });
            else
                rects.push({ item: entry.item, x: x + offset, y, width: length, height: thickness });
            offset += length;
        }
        if (horizontal) {
            x += thickness;
            width -= thickness;
        } else {
            y += thickness;
            height -= thickness;
        }
        row = [];
        rowArea = 0;
    };

    for (const entry of queue) {
        const side = Math.min(width, height);
        if (row.length && worstRatio([...row, entry], rowArea + entry.area, side) > worstRatio(row, rowArea, side))
            layoutRow();
        row.push(entry);
        rowArea += entry.area;
    }
    if (row.length)
        layoutRow();
    return rects;
}

// Measures a canvas once on mount, then follows its resizes.
export function observeSize(canvas, onResize) {
    onResize({ width: canvas.clientWidth, height: canvas.clientHeight });
    const observer = new ResizeObserver(([entry]) => {
        const { inlineSize, blockSize } = entry.contentBoxSize[0];
        onResize({ width: inlineSize, height: blockSize });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
}
