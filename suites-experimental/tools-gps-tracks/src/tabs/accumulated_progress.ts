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
