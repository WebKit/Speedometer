// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

// Historical density and moving average smooth window calculations for timeline cards.
// Uses C1-continuous Hann cosine kernel smoothing for smooth, prominent density curves.

export function getPreciseYear(dateVal) {
    if (dateVal === null || dateVal === undefined) return null;
    if (typeof dateVal === "number") {
        return isNaN(dateVal) ? null : dateVal;
    }
    if (typeof dateVal === "string") {
        const parts = dateVal.trim().split("-");
        const year = parseInt(parts[0], 10);
        if (isNaN(year)) return null;
        let month = 1;
        if (parts.length > 1) {
            const parsedMonth = parseInt(parts[1], 10);
            if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
                month = parsedMonth;
            }
        }
        return year + (month - 1) / 12;
    }
    return null;
}

/**
 * Calculates a moving average smooth window density curve for a given set of timeline items.
 * Uses a continuous Hann cosine window function for C1-continuous smooth curves without jagged transitions.
 * @param {Array} items - Array of items with date, year, or preciseYear property
 * @param {Object} options - Configuration options (startYear, endYear, windowYears, maxHeight)
 * @returns {Object} { points, path, areaPath, maxVal }
 */
export function calculateDensityCurve(items, options = {}) {
    const startYear = options.startYear !== undefined ? options.startYear : 1900;
    const endYear = options.endYear !== undefined ? options.endYear : 2026;
    const windowYears = options.windowYears !== undefined ? options.windowYears : 6;
    const maxHeight = options.maxHeight !== undefined ? options.maxHeight : 85;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return { points: [], path: "", areaPath: "", maxVal: 0 };
    }

    const totalYears = endYear - startYear;
    if (totalYears <= 0) {
        return { points: [], path: "", areaPath: "", maxVal: 0 };
    }

    const getX = (year) => ((year - startYear) / totalYears) * 100;

    const validYears = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const dateVal = item ? (item.date !== undefined ? item.date : item.year !== undefined ? item.year : item.preciseYear) : null;
        const py = getPreciseYear(dateVal);
        if (py !== null && !isNaN(py)) {
            validYears.push(py);
        }
    }

    if (validYears.length === 0) {
        return { points: [], path: "", areaPath: "", maxVal: 0 };
    }

    const densities = [];
    let maxVal = 0;

    for (let y = startYear; y <= endYear; y++) {
        let weightedSum = 0;
        for (let i = 0; i < validYears.length; i++) {
            const dist = Math.abs(validYears[i] - y);
            if (dist <= windowYears) {
                // Hann cosine smoothing kernel: C1-continuous taper from 1 at dist=0 to 0 at dist=windowYears
                weightedSum += 0.5 * (1 + Math.cos((Math.PI * dist) / windowYears));
            }
        }
        if (weightedSum > maxVal) {
            maxVal = weightedSum;
        }
        densities.push({ year: y, value: weightedSum });
    }

    if (maxVal === 0) {
        return { points: [], path: "", areaPath: "", maxVal: 0 };
    }

    const points = densities.map((d) => {
        const x = getX(d.year);
        const height = (d.value / maxVal) * maxHeight;
        const y = 100 - height;
        return { year: d.year, x, y, value: d.value };
    });

    const lineCoords = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`);
    const path = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
    const areaPath = `M ${points[0].x.toFixed(2)},100 L ${lineCoords.join(" L ")} L ${points[points.length - 1].x.toFixed(2)},100 Z`;

    return { points, path, areaPath, maxVal };
}

/**
 * Retrieves exact density and item counts within a moving window around a target year.
 * Used for detailed tooltip reporting in MiniOverview.
 * @param {number} targetYear - Year to query
 * @param {Object} curveData - Result from calculateDensityCurve
 * @param {Array} items - Raw data items to count within window
 * @param {number} windowYears - Size of the smoothing window (default 6)
 * @returns {Object} { density, itemsInWindow }
 */
export function getDensityAtYear(targetYear, curveData, items, windowYears = 6) {
    let density = 0;
    if (curveData && curveData.points && curveData.points.length > 0) {
        let closest = curveData.points[0];
        let minDist = Math.abs(targetYear - closest.year);
        for (let i = 1; i < curveData.points.length; i++) {
            const dist = Math.abs(targetYear - curveData.points[i].year);
            if (dist < minDist) {
                minDist = dist;
                closest = curveData.points[i];
            }
        }
        density = closest.value !== undefined ? closest.value : closest.density !== undefined ? closest.density : 0;
    }

    let itemsInWindow = 0;
    if (items && Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const dateVal = item ? (item.date !== undefined ? item.date : item.year !== undefined ? item.year : item.preciseYear) : null;
            const py = getPreciseYear(dateVal);
            if (py !== null && Math.abs(py - targetYear) <= windowYears) {
                itemsInWindow++;
            }
        }
    } else {
        itemsInWindow = Math.round(density * 1.5);
    }

    return {
        density,
        itemsInWindow,
    };
}
