// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { TrackData } from '../parsers';

export interface AccumulatedData {
  currentYear: number;
  pastYear: number;
  past6m: number;
  past1m: number;
  total: number;
  currentYearAvg: number;
  pastYearAvg: number;
  past6mAvg: number;
  past1mAvg: number;
  totalAvg: number;
}

export function computeAccumulatedMetric(
  allTracks: TrackData[],
  extractor: (t: TrackData) => number | undefined,
): AccumulatedData {
  // Derive deterministic reference timestamp from tracks (or fixed UTC fallback)
  let refTs = 0;
  for (let i = 0; i < allTracks.length; i++) {
    const st = allTracks[i].stats?.startTime;
    if (st && st > refTs) refTs = st;
  }
  if (!refTs) refTs = Date.UTC(2026, 7, 1);

  const now = new Date(refTs);
  const currentYear = now.getUTCFullYear();

  const oneYearAgoMs = Date.UTC(
    currentYear - 1,
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  );
  const sixMonthsAgoMs = Date.UTC(
    currentYear,
    now.getUTCMonth() - 6,
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  );
  const oneMonthAgoMs = Date.UTC(
    currentYear,
    now.getUTCMonth() - 1,
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  );

  let currentYearVal = 0;
  let pastYearVal = 0;
  let past6mVal = 0;
  let past1mVal = 0;
  let totalVal = 0;

  let minTime = refTs;

  allTracks.forEach((t) => {
    if (!t.stats.startTime) return;
    const val = extractor(t);
    if (val === undefined) return;

    totalVal += val;

    const time = t.stats.startTime;
    if (time < minTime) minTime = time;

    const date = new Date(time);

    if (date.getUTCFullYear() === currentYear) currentYearVal += val;

    if (time >= oneYearAgoMs) pastYearVal += val;

    if (time >= sixMonthsAgoMs) past6mVal += val;

    if (time >= oneMonthAgoMs) past1mVal += val;
  });

  const msecPerWeek = 7 * 24 * 60 * 60 * 1000;
  const currentYearStart = Date.UTC(currentYear, 0, 1);

  const currentYearWeeks = Math.max(0.1, (refTs - currentYearStart) / msecPerWeek);
  const pastYearWeeks = Math.max(0.1, (refTs - oneYearAgoMs) / msecPerWeek);
  const past6mWeeks = Math.max(0.1, (refTs - sixMonthsAgoMs) / msecPerWeek);
  const past1mWeeks = Math.max(0.1, (refTs - oneMonthAgoMs) / msecPerWeek);
  const totalWeeks = Math.max(0.1, (refTs - minTime) / msecPerWeek);

  return {
    currentYear: currentYearVal,
    pastYear: pastYearVal,
    past6m: past6mVal,
    past1m: past1mVal,
    total: totalVal,
    currentYearAvg: currentYearVal / currentYearWeeks,
    pastYearAvg: pastYearVal / pastYearWeeks,
    past6mAvg: past6mVal / past6mWeeks,
    past1mAvg: past1mVal / past1mWeeks,
    totalAvg: totalVal / totalWeeks,
  };
}

export function renderAccumulatedTable(
  accumulated: AccumulatedData,
  isDistance: boolean,
  unit: string,
): string {
  const factor = isDistance ? 1000 : 1;
  const format = (val: number) => {
    const formattedVal = isDistance ? val / factor : val;
    return formattedVal.toLocaleString('en-US', {
      minimumFractionDigits: isDistance ? 1 : 0,
      maximumFractionDigits: isDistance ? 1 : 0,
    });
  };

  return `
    <table class="accumulated-table">
      <thead>
        <tr>
          <th>Period</th>
          <th>${isDistance ? 'Distance' : 'Elevation'}</th>
          <th>${isDistance ? 'Distance/Week' : 'Elevation/Week'}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Current Year</td>
          <td>${format(accumulated.currentYear)}&nbsp;${unit}</td>
          <td>${format(accumulated.currentYearAvg)}&nbsp;${unit}</td>
        </tr>
        <tr>
          <td>Past Year</td>
          <td>${format(accumulated.pastYear)}&nbsp;${unit}</td>
          <td>${format(accumulated.pastYearAvg)}&nbsp;${unit}</td>
        </tr>
        <tr>
          <td>Past 6 Months</td>
          <td>${format(accumulated.past6m)}&nbsp;${unit}</td>
          <td>${format(accumulated.past6mAvg)}&nbsp;${unit}</td>
        </tr>
        <tr>
          <td>Past 1 Month</td>
          <td>${format(accumulated.past1m)}&nbsp;${unit}</td>
          <td>${format(accumulated.past1mAvg)}&nbsp;${unit}</td>
        </tr>
        <tr>
          <td>Total</td>
          <td>${format(accumulated.total)}&nbsp;${unit}</td>
          <td>${format(accumulated.totalAvg)}&nbsp;${unit}</td>
        </tr>
      </tbody>
    </table>
  `;
}

export interface MultiMetricAccumulatedSummary {
  distance: AccumulatedData;
  elevation: AccumulatedData;
  durationHours: AccumulatedData;
  tss: AccumulatedData;
  workKj: AccumulatedData;
  climbCount: AccumulatedData;
}

export function computeMultiMetricAccumulated(
  allTracks: TrackData[],
): MultiMetricAccumulatedSummary {
  const distance = computeAccumulatedMetric(allTracks, (t) => t.stats.totalDist);
  const elevation = computeAccumulatedMetric(allTracks, (t) => t.stats.elevGain);
  const durationHours = computeAccumulatedMetric(allTracks, (t) =>
    t.stats.duration ? t.stats.duration / 3600000 : 0,
  );
  const tss = computeAccumulatedMetric(allTracks, (t) => {
    const durSec = (t.stats.duration || 0) / 1000;
    const avgPwr = t.stats.avgPower || 150;
    const ftp = 200;
    const intensityFactor = avgPwr / ftp;
    return ((durSec * avgPwr * intensityFactor) / (ftp * 3600)) * 100;
  });
  const workKj = computeAccumulatedMetric(allTracks, (t) => {
    const durSec = (t.stats.duration || 0) / 1000;
    const avgPwr = t.stats.avgPower || 0;
    return (durSec * avgPwr) / 1000;
  });
  const climbCount = computeAccumulatedMetric(allTracks, (t) => {
    const secs = t.stats.sections || [];
    return secs.filter((s) => s.kind === 'climb').length;
  });

  return {
    distance,
    elevation,
    durationHours,
    tss,
    workKj,
    climbCount,
  };
}

export function renderAccumulatedProgressSummary(allTracks: TrackData[]): string {
  const summary = computeMultiMetricAccumulated(allTracks);
  const fmt = (v: number, digits = 1) =>
    v.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const rows: {
    label: string;
    unit: string;
    data: AccumulatedData;
    scale: number;
    digits: number;
  }[] = [
    { label: 'Distance', unit: 'km', data: summary.distance, scale: 0.001, digits: 1 },
    { label: 'Elevation Gain', unit: 'm', data: summary.elevation, scale: 1, digits: 0 },
    { label: 'Moving Duration', unit: 'h', data: summary.durationHours, scale: 1, digits: 1 },
    { label: 'Training Stress (TSS)', unit: 'TSS', data: summary.tss, scale: 1, digits: 0 },
    { label: 'Mechanical Work', unit: 'kJ', data: summary.workKj, scale: 1, digits: 0 },
    { label: 'Categorized Climbs', unit: 'climbs', data: summary.climbCount, scale: 1, digits: 0 },
  ];

  return `
    <div class="chart-row accumulated-multi-card" id="accumulated-summary-card" style="padding: 10px 14px;">
      <div class="chart-row-header" style="margin-bottom: 6px;">
        <div class="chart-row-label-group">
          <span class="material-symbols-rounded chart-row-icon" style="--chart-color:#4ECDC4">monitoring</span>
          <span class="chart-row-label">Accumulated Longitudinal Progress Summary</span>
        </div>
      </div>
      <table class="accumulated-table" style="width: 100%; font-size: 11px;">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Past 1M</th>
            <th>Past 6M</th>
            <th>Past Year</th>
            <th>Current Year</th>
            <th>Total</th>
            <th>Weekly Avg</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td style="font-weight: 600;">${r.label}</td>
              <td>${fmt(r.data.past1m * r.scale, r.digits)}&nbsp;${r.unit}</td>
              <td>${fmt(r.data.past6m * r.scale, r.digits)}&nbsp;${r.unit}</td>
              <td>${fmt(r.data.pastYear * r.scale, r.digits)}&nbsp;${r.unit}</td>
              <td>${fmt(r.data.currentYear * r.scale, r.digits)}&nbsp;${r.unit}</td>
              <td style="font-weight: 700;">${fmt(r.data.total * r.scale, r.digits)}&nbsp;${r.unit}</td>
              <td>${fmt(r.data.totalAvg * r.scale, r.digits)}&nbsp;${r.unit}/wk</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}
