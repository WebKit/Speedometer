// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import uPlot from 'uplot';
import { TrackData, Parsers } from '../parsers';
import { fmtDuration, fmtDate, gaussianSmooth, hexToRgba } from '../utils';
import { Metrics } from '../metrics';
import { UrlState } from '../url-state';
import {
  AccumulatedSummaryRow,
  AccumulatedTableRow,
  computeAccumulatedMetric,
  getAccumulatedSummaryRows,
  getAccumulatedTableRows,
} from './accumulated_progress';

export interface CurveTableRow {
  dur: number;
  durLabel: string;
  curValStr: string;
  maxValStr: string;
  mxId?: string;
  mxIdx?: number;
}

export interface LongitudinalHistoryRow {
  id: string;
  dateStr: string;
  name: string;
  sport: string;
  color: string;
  distKm: string;
  elevGainM: string;
  durationStr: string;
  avgPowerStr: string;
  avgHrStr: string;
  tssStr: string;
}

export interface EvolutionComputedPayload {
  atlStr: string;
  ctlStr: string;
  tsbStr: string;
  tsbStatus: string;
  trackName: string;
  hasPowerCurve: boolean;
  hasHrCurve: boolean;
  powerInitialDur: number;
  hrInitialDur: number;
  accumulatedSummaryRows: AccumulatedSummaryRow[];
  distanceAccumulatedRows: AccumulatedTableRow[];
  elevationAccumulatedRows: AccumulatedTableRow[];
  powerCurveRows: CurveTableRow[];
  hrCurveRows: CurveTableRow[];
  historyRows: LongitudinalHistoryRow[];
  availableSports: string[];
}

let evolutionPlots: uPlot[] = [];
let activeEvolutionCards: any[] = [];
let currentEvolutionGrouping: 'week' | 'month' = 'week';
let evolutionComponentRef: any = null;

export function registerEvolutionComponent(comp: any) {
  evolutionComponentRef = comp;
}

function getEvolutionComponent(): any {
  return evolutionComponentRef || (window as any).__trackStateService?.evolutionTab || null;
}

export function destroyEvolutionPlots() {
  evolutionPlots.forEach((p) => p.destroy());
  evolutionPlots = [];
  activeEvolutionCards = [];
}

export function resetEvolution() {
  destroyEvolutionPlots();
  currentEvolutionGrouping = 'week';
  const comp = getEvolutionComponent();
  if (comp && typeof comp.reset === 'function') {
    comp.reset();
    return;
  }
  const container = document.getElementById('evolution-view');
  if (container) {
    container.innerHTML = `
      <div id="evolution-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for progress analysis</div>
      </div>
    `;
  }
}

export function applyEvolutionGrouping(grouping: 'week' | 'month') {
  currentEvolutionGrouping = grouping;
  activeEvolutionCards.forEach((c) => {
    if (c && c.updateGrouping) c.updateGrouping(grouping);
  });
}

export function setEvolutionGrouping(grouping: 'week' | 'month') {
  const comp = getEvolutionComponent();
  if (comp && typeof comp.setGrouping === 'function') {
    comp.setGrouping(grouping);
    return;
  }
  applyEvolutionGrouping(grouping);
}

export function applyEvolutionRange(range: string) {
  UrlState.patch({ progress: range === 'all' ? null : range });
  activeEvolutionCards.forEach((c) => {
    if (c && c.updateRange) c.updateRange(range);
  });
}

export function setEvolutionRange(range: string) {
  const comp = getEvolutionComponent();
  if (comp && typeof comp.setRange === 'function') {
    comp.setRange(range);
    return;
  }
  applyEvolutionRange(range);
}

export function applyEvolutionPinnedDuration(dur: number | null) {
  activeEvolutionCards.forEach((c) => {
    if (c && c.updatePin) c.updatePin(dur);
  });
}

export function setEvolutionPinnedDuration(dur: number | null) {
  const comp = getEvolutionComponent();
  if (comp && typeof comp.setPinnedDuration === 'function') {
    comp.setPinnedDuration(dur);
    return;
  }
  applyEvolutionPinnedDuration(dur);
}

const EVO_CAP = 16384;
const evoPwrPrefix = new Float64Array(EVO_CAP + 1);
const evoHrPrefix = new Float64Array(EVO_CAP + 1);
const evoSpdPrefix = new Float64Array(EVO_CAP + 1);
const evoStressArr = new Float64Array(EVO_CAP);
const evoDailyTrimp = new Float64Array(365);
const envelopeDurations = [
  1, 2, 3, 5, 8, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360, 450, 600, 750, 900, 1200,
];

function computeCurveRowsForMetric(
  currentTrack: TrackData | null,
  allTracks: TrackData[],
  metricKey: 'power' | 'hr',
  unit: string,
): { rows: CurveTableRow[]; initialDur: number } {
  const maxCurve: Record<
    number,
    { val: number; trackInfo: string; trackId?: string; idx?: number }
  > = {};
  allTracks.forEach((t) => {
    const curve = metricKey === 'power' ? t.stats.powerCurve : t.stats.hrCurve;
    if (!curve) return;
    const name = t.name || 'Unnamed Track';
    const date =
      t.stats.startTime || t.addedAt ? fmtDate((t.stats.startTime || t.addedAt)!) : 'Unknown Date';
    const trackInfo = `${name} (${date})`;

    Object.entries(curve).forEach(([dur, data]) => {
      const d = Number(dur);
      const val = (data as any).power || (data as any).hr;
      if (!maxCurve[d] || val > maxCurve[d].val) {
        maxCurve[d] = { val, trackInfo, trackId: t.id, idx: (data as any).idx };
      }
    });
  });

  const currentCurve =
    (currentTrack &&
      (metricKey === 'power' ? currentTrack.stats.powerCurve : currentTrack.stats.hrCurve)) ||
    {};

  const allDurations = new Set<number>();
  Object.keys(maxCurve).forEach((d) => allDurations.add(Number(d)));
  Object.keys(currentCurve).forEach((d) => allDurations.add(Number(d)));
  const durations = Array.from(allDurations).sort((a, b) => a - b);

  const rows: CurveTableRow[] = durations.map((d) => {
    const cur = currentCurve[d]
      ? (currentCurve[d] as any).power || (currentCurve[d] as any).hr
      : '-';
    const mx = maxCurve[d]?.val || '-';
    return {
      dur: d,
      durLabel: fmtDuration(d),
      curValStr: `${cur} ${unit}`,
      maxValStr: `${mx} ${unit}`,
      mxId: maxCurve[d]?.trackId,
      mxIdx: maxCurve[d]?.idx,
    };
  });

  return { rows, initialDur: durations[0] || 5 };
}

export function computeBanisterAndEvolutionData(
  currentTrack: TrackData | null,
  allTracks: TrackData[],
): EvolutionComputedPayload {
  // Ensure duration curves and zones are available on all tracks
  allTracks.forEach((track) => {
    Parsers.ensureCurvesAndZones(track);
  });

  // Single-pass Banister impulse-response training load (ATL / CTL / TSB) and historical curve envelope
  let totalFatigue = 0;
  let totalFitness = 0;
  evoDailyTrimp.fill(0);

  for (let ti = 0; ti < allTracks.length; ti++) {
    const pts = allTracks[ti].points || [];
    const n = Math.min(pts.length, EVO_CAP);
    if (n === 0) continue;

    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const pw = p.power || 0;
      const h = p.hr || 0;
      const sp = p.speed || 0;
      const el = p.ele || 0;
      evoPwrPrefix[i + 1] = evoPwrPrefix[i] + pw;
      evoHrPrefix[i + 1] = evoHrPrefix[i] + h;
      evoSpdPrefix[i + 1] = evoSpdPrefix[i] + sp;
      const hrRatio = Math.max(0, Math.min(1.2, (h - 60) / 135));
      evoStressArr[i] = pw * 1.5 + h + hrRatio * (1 + 1.92 * hrRatio) * 10 + el * 0.02;
    }

    for (let di = 0; di < envelopeDurations.length; di++) {
      const d = envelopeDurations[di];
      if (d > n) continue;
      const limit = n - d;
      let maxP = 0;
      let maxH = 0;
      for (let j = 0; j <= limit; j++) {
        const dh = evoHrPrefix[j + d] - evoHrPrefix[j];
        const sp = evoPwrPrefix[j + d] - evoPwrPrefix[j];
        if (sp > maxP) maxP = sp;
        if (dh > maxH) maxH = dh;
      }
      totalFitness += ((maxP + maxH + evoSpdPrefix[limit]) / d) * 1e-3;
    }

    const alphaA = 2 / 8;
    const oneMinusA = 1 - alphaA;
    const alphaC = 2 / 43;
    const oneMinusC = 1 - alphaC;
    const hrRest = 52;
    const invHrSpan = 1 / (195 - hrRest);
    let atl = 0;
    let ctl = 0;
    for (let i = 0; i < n; i++) {
      const h = evoHrPrefix[i + 1] - evoHrPrefix[i];
      const hrRatio = Math.max(0, (h - hrRest) * invHrSpan);
      const kh = 1.92 * hrRatio;
      const trimp = evoStressArr[i] * 0.25 + hrRatio * 0.64 * (1 + kh * (1 + 0.5 * kh)) * 15;
      atl = alphaA * trimp + oneMinusA * atl;
      ctl = alphaC * trimp + oneMinusC * ctl;
    }
    totalFatigue += atl * 0.01;
    totalFitness += ctl * 0.01;

    const dayIdx = (ti * 57) % 365;
    evoDailyTrimp[dayIdx] += evoPwrPrefix[n] * 1e-3 + evoHrPrefix[n] * 1e-3;
  }

  let atl365 = 0;
  let ctl365 = 0;
  for (let day = 0; day < 365; day++) {
    const load = evoDailyTrimp[day] + (day % 7 === 0 ? 45 : 15);
    atl365 = atl365 * 0.86 + load * 0.14;
    ctl365 = ctl365 * 0.976 + load * 0.024;
  }
  totalFatigue += atl365 * 1e-3;
  totalFitness += ctl365 * 1e-3;

  const tsbNum = totalFitness - totalFatigue;
  const tsbStr = tsbNum.toFixed(1);
  const atlStr = totalFatigue.toFixed(1);
  const ctlStr = totalFitness.toFixed(1);
  const tsbStatus = tsbNum > 5 ? 'Fresh / Peak' : tsbNum >= -10 ? 'Optimal Load' : 'High Fatigue';

  const accumulatedSummaryRows = getAccumulatedSummaryRows(allTracks);
  const distAcc = computeAccumulatedMetric(allTracks, (t) => t.stats.totalDist);
  const elevAcc = computeAccumulatedMetric(allTracks, (t) => t.stats.elevGain);
  const distanceAccumulatedRows = getAccumulatedTableRows(distAcc, true, 'km');
  const elevationAccumulatedRows = getAccumulatedTableRows(elevAcc, false, 'm');

  const hasPowerCurve = allTracks.some((t) => !!t.stats.powerCurve);
  const hasHrCurve = allTracks.some((t) => !!t.stats.hrCurve);

  const powerCurveInfo = hasPowerCurve
    ? computeCurveRowsForMetric(currentTrack, allTracks, 'power', 'W')
    : { rows: [], initialDur: 5 };
  const hrCurveInfo = hasHrCurve
    ? computeCurveRowsForMetric(currentTrack, allTracks, 'hr', 'bpm')
    : { rows: [], initialDur: 5 };

  const sportsSet = new Set<string>();
  allTracks.forEach((t) => {
    if (t.sport) sportsSet.add(t.sport);
  });

  const sortedHistory = [...allTracks].sort(
    (a, b) =>
      (b.stats.startTime || b.addedAt || 0) - (a.stats.startTime || a.addedAt || 0) ||
      a.id.localeCompare(b.id),
  );
  const historyRows: LongitudinalHistoryRow[] = sortedHistory.map((t) => {
    const durSec = (t.stats.duration || 0) / 1000;
    const avgPwr = t.stats.avgPower || 150;
    const ftp = 200;
    const intensityFactor = avgPwr / ftp;
    const tss = ((durSec * avgPwr * intensityFactor) / (ftp * 3600)) * 100;
    return {
      id: t.id,
      dateStr: t.stats.startTime ? fmtDate(t.stats.startTime) : '-',
      name: t.displayName || t.name || t.id,
      sport: t.sport || 'cycling',
      color: t.color || '#FF6B35',
      distKm: ((t.stats.totalDist || 0) / 1000).toFixed(1),
      elevGainM: Math.round(t.stats.elevGain || 0).toString(),
      durationStr: fmtDuration(Math.round(durSec)),
      avgPowerStr: t.stats.avgPower != null ? `${Math.round(t.stats.avgPower)} W` : '-',
      avgHrStr: t.stats.avgHR != null ? `${Math.round(t.stats.avgHR)} bpm` : '-',
      tssStr: Math.round(tss).toString(),
    };
  });

  return {
    atlStr,
    ctlStr,
    tsbStr,
    tsbStatus,
    trackName: currentTrack ? currentTrack.name || 'Current Track' : 'Current Track',
    hasPowerCurve,
    hasHrCurve,
    powerInitialDur: powerCurveInfo.initialDur,
    hrInitialDur: hrCurveInfo.initialDur,
    accumulatedSummaryRows,
    distanceAccumulatedRows,
    elevationAccumulatedRows,
    powerCurveRows: powerCurveInfo.rows,
    hrCurveRows: hrCurveInfo.rows,
    historyRows,
    availableSports: Array.from(sportsSet).sort(),
  };
}

export function mountEvolutionPlots(
  hostRoot: HTMLElement,
  currentTrack: TrackData | null,
  allTracks: TrackData[],
  currentRange: string,
  currentGrouping: 'week' | 'month',
  onPinChange: (dur: number | null) => void,
  onRangeChange: (range: string) => void,
  onTrackSelect?: (id: string, range: [number, number] | null) => void,
  onDateRangeSelect?: (start: string, end: string) => void,
) {
  currentEvolutionGrouping = currentGrouping;
  const grid =
    (hostRoot.querySelector('#evolution-container') as HTMLElement) ||
    document.getElementById('evolution-container');
  if (!grid) return;

  const gridWidth = grid.clientWidth || 570;
  const cards: any[] = [];
  activeEvolutionCards = cards;

  const progressSync = uPlot.sync('progress-sync');
  const distCardEl =
    (grid.querySelector('#distance-evolution-card') as HTMLElement) ||
    document.getElementById('distance-evolution-card');
  const elevCardEl =
    (grid.querySelector('#elevation-evolution-card') as HTMLElement) ||
    document.getElementById('elevation-evolution-card');

  if (distCardEl) {
    cards.push(
      mountProgressCardPlot(
        distCardEl,
        allTracks,
        'distance',
        progressSync,
        onDateRangeSelect,
        gridWidth,
      ),
    );
  }
  if (elevCardEl) {
    cards.push(
      mountProgressCardPlot(
        elevCardEl,
        allTracks,
        'elevation',
        progressSync,
        onDateRangeSelect,
        gridWidth,
      ),
    );
  }

  if (allTracks.some((t) => t.stats.powerCurve)) {
    const powerCardEl =
      (grid.querySelector('#power-evolution-card') as HTMLElement) ||
      document.getElementById('power-evolution-card');
    if (powerCardEl) {
      cards.push(
        mountCurveEvolutionPlots({
          cardContainer: powerCardEl,
          currentTrack,
          allTracks,
          metricKey: 'power',
          unit: 'W',
          color: Metrics.power.color,
          onPinChange,
          onRangeChange,
          onTrackSelect,
          gridWidth,
        }),
      );
    }
  }

  if (allTracks.some((t) => t.stats.hrCurve)) {
    const hrCardEl =
      (grid.querySelector('#hr-evolution-card') as HTMLElement) ||
      document.getElementById('hr-evolution-card');
    if (hrCardEl) {
      cards.push(
        mountCurveEvolutionPlots({
          cardContainer: hrCardEl,
          currentTrack,
          allTracks,
          metricKey: 'hr',
          unit: 'bpm',
          color: Metrics.hr.color,
          onPinChange,
          onRangeChange,
          onTrackSelect,
          gridWidth,
        }),
      );
    }
  }

  if (currentRange !== 'all') {
    cards.forEach((c) => {
      if (c && c.updateRange) c.updateRange(currentRange);
    });
  }

  evolutionPlots.forEach((p) => {
    (p as any)._ready = true;
  });
}

export function renderEvolution(
  currentTrack: TrackData | null,
  allTracks: TrackData[],
  onTrackSelect?: (id: string, range: [number, number] | null) => void,
  onDateRangeSelect?: (start: string, end: string) => void,
) {
  const comp = getEvolutionComponent();
  if (comp && typeof comp.render === 'function') {
    comp.render(currentTrack, allTracks, onTrackSelect, onDateRangeSelect);
    return;
  }
}

interface MountCurveEvolutionOptions {
  cardContainer: HTMLElement;
  currentTrack: TrackData | null;
  allTracks: TrackData[];
  metricKey: 'power' | 'hr';
  unit: string;
  color: string;
  onPinChange: (dur: number | null) => void;
  onRangeChange: (range: string) => void;
  onTrackSelect?: (id: string, range: [number, number] | null) => void;
  gridWidth?: number;
}

function mountCurveEvolutionPlots(opts: MountCurveEvolutionOptions) {
  const {
    cardContainer,
    currentTrack,
    allTracks,
    metricKey,
    unit,
    color,
    onPinChange,
    onTrackSelect,
    gridWidth,
  } = opts;

  let mainChart: uPlot | null = null;
  const urlState = UrlState.get();
  let currentRange = urlState.progress || 'all';

  const chartEl = cardContainer.querySelector(`#${metricKey}-evolution-chart`) as HTMLElement;
  if (!chartEl) return;
  chartEl.innerHTML = '';

  // 1. Compute global max curve
  const maxCurve: Record<
    number,
    { val: number; trackInfo: string; trackId?: string; idx?: number }
  > = {};
  allTracks.forEach((t) => {
    const curve = metricKey === 'power' ? t.stats.powerCurve : t.stats.hrCurve;
    if (!curve) return;
    const name = t.name || 'Unnamed Track';
    const date =
      t.stats.startTime || t.addedAt ? fmtDate((t.stats.startTime || t.addedAt)!) : 'Unknown Date';
    const trackInfo = `${name} (${date})`;

    Object.entries(curve).forEach(([dur, data]) => {
      const d = Number(dur);
      const val = (data as any).power || (data as any).hr;
      if (!maxCurve[d] || val > maxCurve[d].val)
        maxCurve[d] = { val, trackInfo, trackId: t.id, idx: (data as any).idx };
    });
  });

  // 2. Get current track curve
  const currentCurve =
    (currentTrack &&
      (metricKey === 'power' ? currentTrack.stats.powerCurve : currentTrack.stats.hrCurve)) ||
    {};

  // 3. Combine durations
  const allDurations = new Set<number>();
  Object.keys(maxCurve).forEach((d) => allDurations.add(Number(d)));
  Object.keys(currentCurve).forEach((d) => allDurations.add(Number(d)));
  const durations = Array.from(allDurations).sort((a, b) => a - b);

  const xData = durations;
  const yDataCurrent = durations.map((d) => {
    const entry = currentCurve[d];
    return entry ? (entry as any).power || (entry as any).hr : null;
  });
  const yDataMax = durations.map((d) => maxCurve[d]?.val || null);

  // Precompute timeline data for all tracks
  const validTracks = allTracks.filter((t) => (t.stats.startTime || t.addedAt) != null);
  validTracks.sort(
    (a, b) =>
      (a.stats.startTime || a.addedAt || 0) - (b.stats.startTime || b.addedAt || 0) ||
      a.id.localeCompare(b.id),
  );

  const xTimeline: number[] = [];
  const yTimelineData: Record<number, (number | null)[]> = {};
  durations.forEach((d) => (yTimelineData[d] = []));

  validTracks.forEach((t) => {
    const curve = metricKey === 'power' ? t.stats.powerCurve : t.stats.hrCurve;
    if (!curve) return;

    xTimeline.push((t.stats.startTime || t.addedAt)! / 1000); // seconds
    durations.forEach((d) => {
      const entry = curve[d];
      const val = entry ? (metricKey === 'power' ? (entry as any).power : (entry as any).hr) : null;
      yTimelineData[d].push(val);
    });
  });

  let currentDur = durations[0] || 5;
  let tracksFiltered = validTracks;
  let pinnedDur: number | null = null;

  function getFilteredData(dur: number, range: string) {
    const maxTime = xTimeline[xTimeline.length - 1] || 1785542400;
    let minTime = 0;

    if (range === '1m') minTime = maxTime - 30 * 24 * 3600;
    else if (range === '2m') minTime = maxTime - 60 * 24 * 3600;
    else if (range === '6m') minTime = maxTime - 180 * 24 * 3600;
    else if (range === '1y') minTime = maxTime - 365 * 24 * 3600;
    else if (range === '2y') minTime = maxTime - 2 * 365 * 24 * 3600;

    const filteredIndices: number[] = [];
    xTimeline.forEach((t, idx) => {
      if (t >= minTime) filteredIndices.push(idx);
    });

    const xFiltered = filteredIndices.map((i) => xTimeline[i]);
    const rawY = yTimelineData[dur] || [];
    const rawYFiltered = filteredIndices.map((i) => rawY[i]);
    const smoothedYFiltered = gaussianSmooth(rawYFiltered, 5);
    tracksFiltered = filteredIndices.map((i) => validTracks[i]);

    return { xFiltered, rawYFiltered, smoothedYFiltered };
  }

  let timelineChart: uPlot | null = null;

  const curYVal = document.createElement('div');
  curYVal.className = 'cur-y-val font-m';
  curYVal.style.cssText =
    'position:absolute;background:rgba(14, 14, 16, 0.9);color:#fff;padding:8px 12px;border-radius:4px;font-family:system-ui;pointer-events:none;z-index:1000;box-shadow:0 4px 6px rgba(0,0,0,0.3);border:1px solid #2e2e34;display:none;';
  chartEl.style.position = 'relative';
  chartEl.appendChild(curYVal);

  const optsUPlot: uPlot.Options = {
    id: `${metricKey}-evolution`,
    width: 400,
    height: 250,
    padding: [0, 10, 0, 10],
    scales: {
      x: { time: false, distr: 3, auto: true },
      y: { auto: true },
    },
    series: [
      {},
      {
        label: 'Current Track',
        stroke: color,
        width: 2,
        fill: hexToRgba(color, 0.1),
        points: { show: true, size: 5, fill: color },
      },
      {
        label: 'All-Time Max',
        stroke: '#888888',
        width: 1,
        fill: 'transparent',
        points: { show: true, size: 6, fill: '#888888' },
      },
    ],
    axes: [
      {
        stroke: '#555564',
        grid: { stroke: '#2e2e34', width: 1 },
        show: true,
        values: () => [],
        ticks: { show: false },
        font: '10px system-ui, sans-serif',
        size: 30,
      },
      {
        stroke: '#555564',
        grid: { stroke: '#2e2e34', width: 1 },
        values: (_u, vals) => vals.map((v) => `${v}${unit}`),
        font: '10px system-ui, sans-serif',
        size: 50,
      },
    ],
    cursor: {
      drag: { x: false, y: false },
      dataIdx: (_u, _seriesIdx, dataIdx) => dataIdx,
      x: false,
      y: false,
    },
    hooks: {
      draw: [
        (u: uPlot) => {
          const ctx = u.ctx;
          const dpr = window.devicePixelRatio || 1;
          const bb = u.bbox;
          const benchmarks = [
            1, 2, 5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200, 10800,
          ];
          const maxDur = xData[xData.length - 1];

          ctx.save();
          ctx.fillStyle = '#555564';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.font = `${10 * dpr}px system-ui, sans-serif`;

          let lastX = -100;
          benchmarks.forEach((d) => {
            if (d > maxDur) return;
            const x = u.valToPos(d, 'x', true);
            if (x > lastX + 30 * dpr && x < bb.left + bb.width + 5 * dpr) {
              ctx.fillText(fmtDuration(d), x, bb.top + bb.height + 6 * dpr);
              lastX = x;
            }
          });

          if (pinnedDur !== null) {
            const idx = xData.indexOf(pinnedDur);
            if (idx >= 0) {
              const pcx = u.valToPos(pinnedDur, 'x', true);
              const pcy = u.valToPos(yDataCurrent[idx]! || yDataMax[idx]!, 'y', true);

              ctx.save();
              ctx.beginPath();
              ctx.setLineDash([]);
              const curVal = yDataCurrent[idx];
              const dotRadius = curVal !== null ? 5 * dpr : 3 * dpr;
              const dotColor = curVal !== null ? color : '#888888';
              ctx.arc(pcx, pcy, dotRadius, 0, 2 * Math.PI);
              ctx.fillStyle = dotColor;
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 2 * dpr;
              ctx.stroke();
              ctx.restore();
            }
          }

          ctx.restore();
        },
        (u: uPlot) => {
          const ctx = u.ctx;
          const dpr = window.devicePixelRatio || 1;
          const bb = u.bbox;

          let idx = u.cursor.idx;
          let activeSeriesIdx = 1;
          const cursorLeft = u.cursor.left;
          const cursorTop = u.cursor.top;

          if (cursorLeft != null && cursorTop != null && cursorLeft >= 0 && cursorTop >= 0) {
            let minD2 = Infinity;
            let nearestIdx = -1;
            const radius = 30;
            const maxD2 = radius * radius;

            for (let i = 0; i < xData.length; i++) {
              const x = xData[i];
              const yCur = yDataCurrent[i];
              const yMax = yDataMax[i];

              if (x != null) {
                const px = u.valToPos(x, 'x', false);

                if (yCur != null) {
                  const py = u.valToPos(yCur, 'y', false);
                  const dx = px - cursorLeft;
                  const dy = py - cursorTop;
                  const d2 = dx * dx + dy * dy;
                  if (d2 < minD2) {
                    minD2 = d2;
                    nearestIdx = i;
                    activeSeriesIdx = 1;
                  }
                }
                if (yMax != null) {
                  const py = u.valToPos(yMax, 'y', false);
                  const dx = px - cursorLeft;
                  const dy = py - cursorTop;
                  const d2 = dx * dx + dy * dy;
                  if (d2 < minD2) {
                    minD2 = d2;
                    nearestIdx = i;
                    activeSeriesIdx = 2;
                  }
                }
              }
            }

            if (minD2 <= maxD2) idx = nearestIdx;
            else idx = null;
          }

          if (idx != null && u.data[0][idx] != null) {
            const pcx = u.valToPos(u.data[0][idx]!, 'x', true);
            const pcy = u.valToPos(
              activeSeriesIdx === 1 ? yDataCurrent[idx]! : yDataMax[idx]!,
              'y',
              true,
            );

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([2 * dpr, 2 * dpr]);
            ctx.strokeStyle = hexToRgba(activeSeriesIdx === 1 ? color : '#888888', 0.4);
            ctx.lineWidth = 1 * dpr;
            ctx.moveTo(pcx, bb.top);
            ctx.lineTo(pcx, bb.top + bb.height);
            ctx.moveTo(bb.left, pcy);
            ctx.lineTo(bb.left + bb.width, pcy);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.arc(pcx, pcy, 12 * dpr, 0, 2 * Math.PI);
            ctx.fillStyle = hexToRgba(activeSeriesIdx === 1 ? color : '#888888', 0.2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            const dotRadius = activeSeriesIdx === 1 ? 5 * dpr : 6 * dpr;
            const dotColor = activeSeriesIdx === 1 ? color : '#888888';
            ctx.arc(pcx, pcy, dotRadius, 0, 2 * Math.PI);
            ctx.fillStyle = dotColor;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2 * dpr;
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.setLineDash([]);

            const xValStr = fmtDuration(xData[idx!]);
            ctx.font = `bold ${10 * dpr}px system-ui, sans-serif`;
            const xValWidth = ctx.measureText(xValStr).width;
            const xbw = xValWidth + 10 * dpr;
            const pillH = 16 * dpr;

            const xLabelX = pcx - xbw / 2;
            const clampedXBx = Math.max(bb.left, Math.min(bb.left + bb.width - xbw, xLabelX));
            const xLabelY = bb.top + bb.height + 2 * dpr;

            ctx.fillStyle = 'rgba(14, 14, 16, 0.92)';
            ctx.beginPath();
            if ((ctx as any).roundRect)
              (ctx as any).roundRect(clampedXBx, xLabelY, xbw, pillH, 3 * dpr);
            else ctx.rect(clampedXBx, xLabelY, xbw, pillH);
            ctx.fill();
            ctx.strokeStyle = hexToRgba(color, 0.27);
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(xValStr, clampedXBx + xbw / 2, xLabelY + pillH / 2);

            const yVal = yDataCurrent[idx!]! || yDataMax[idx!]!;
            const yValStr = `${yVal.toFixed(0)} ${unit}`;
            const yValWidth = ctx.measureText(yValStr).width;
            const ybw = yValWidth + 10 * dpr;

            const yLabelX = bb.left - ybw - 2 * dpr;
            const yLabelY = pcy - pillH / 2;

            ctx.fillStyle = 'rgba(14, 14, 16, 0.92)';
            ctx.beginPath();
            if ((ctx as any).roundRect)
              (ctx as any).roundRect(yLabelX, yLabelY, ybw, pillH, 3 * dpr);
            else ctx.rect(yLabelX, yLabelY, ybw, pillH);
            ctx.fill();
            ctx.strokeStyle = hexToRgba(color, 0.27);
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(yValStr, yLabelX + 5 * dpr, yLabelY + pillH / 2);

            ctx.restore();
          }
        },
      ],
      setCursor: [
        (u: uPlot) => {
          if (!(u as any)._ready) return;
          u.redraw(false);

          let idx = u.cursor.idx;
          const cursorLeft = u.cursor.left;
          const cursorTop = u.cursor.top;

          if (cursorLeft != null && cursorTop != null && cursorLeft >= 0 && cursorTop >= 0) {
            let minD2 = Infinity;
            let nearestIdx = -1;
            const radius = 30;
            const maxD2 = radius * radius;

            for (let i = 0; i < xData.length; i++) {
              const x = xData[i];
              const yCur = yDataCurrent[i];
              const yMax = yDataMax[i];

              if (x != null) {
                const px = u.valToPos(x, 'x', false);

                if (yCur != null) {
                  const py = u.valToPos(yCur, 'y', false);
                  const dx = px - cursorLeft;
                  const dy = py - cursorTop;
                  const d2 = dx * dx + dy * dy;
                  if (d2 < minD2) {
                    minD2 = d2;
                    nearestIdx = i;
                  }
                }
                if (yMax != null) {
                  const py = u.valToPos(yMax, 'y', false);
                  const dx = px - cursorLeft;
                  const dy = py - cursorTop;
                  const d2 = dx * dx + dy * dy;
                  if (d2 < minD2) {
                    minD2 = d2;
                    nearestIdx = i;
                  }
                }
              }
            }

            if (minD2 <= maxD2) idx = nearestIdx;
            else idx = null;
          }

          const bb = u.bbox;
          const hasFocus = idx != null && xData[idx] != null;

          if (hasFocus) {
            const durVal = xData[idx!];
            const curVal = yDataCurrent[idx!];
            const mxVal = yDataMax[idx!];

            let html = `<div class="evolution-tooltip-title">${fmtDuration(durVal)}</div>`;
            if (curVal !== null) {
              html += `
                <div class="evolution-tooltip-row">
                  <span class="evolution-tooltip-label">Current:</span>
                  <span class="evolution-tooltip-value">${curVal} ${unit}</span>
                </div>
              `;
            }
            if (mxVal !== null) {
              html += `
                <div class="evolution-tooltip-row">
                  <span class="evolution-tooltip-label">Max:</span>
                  <span class="evolution-tooltip-value">${mxVal} ${unit}</span>
                </div>
              `;
            }

            curYVal.innerHTML = html;

            if (timelineChart && pinnedDur === null) {
              currentDur = durVal;
              const { xFiltered, rawYFiltered, smoothedYFiltered } = getFilteredData(
                currentDur,
                currentRange,
              );
              const lowerBound = smoothedYFiltered.map((v) => (v !== null ? v * 0.9 : null));
              const upperBound = smoothedYFiltered.map((v) => (v !== null ? v * 1.1 : null));
              timelineChart.setData([
                xFiltered,
                rawYFiltered,
                smoothedYFiltered,
                lowerBound,
                upperBound,
              ]);

              const labelEl = cardContainer.querySelector(`#${metricKey}-timeline-label`);
              if (labelEl)
                labelEl.textContent = `Progress ${fmtDuration(durVal)} ${metricKey === 'power' ? 'Power' : 'HR'}`;
            }
            curYVal.style.display = '';
            curYVal.style.left = `${cursorLeft! + bb.left}px`;
            curYVal.style.top = `${cursorTop! + bb.top}px`;
            curYVal.style.transform = 'translate(5px, -50%)';
          } else {
            curYVal.style.display = 'none';
          }
        },
      ],
    },
  };

  mainChart = new uPlot(optsUPlot, [xData, yDataCurrent, yDataMax], chartEl);
  evolutionPlots.push(mainChart);

  chartEl.addEventListener('click', () => {
    if (!mainChart) return;
    const idx = mainChart.cursor.idx;
    if (idx != null) {
      const clickedDur = xData[idx];
      let newPinnedDur: number | null = null;
      if (pinnedDur !== null) newPinnedDur = null;
      else newPinnedDur = clickedDur;

      onPinChange(newPinnedDur);

      if (currentTrack) {
        const stats = currentTrack.stats;
        const curve = metricKey === 'power' ? stats.powerCurve : stats.hrCurve;
        if (curve) {
          const entry = curve[clickedDur];
          if (entry) {
            const bestIdx = entry.idx;
            const duration = clickedDur;
            const startPt = currentTrack.points[bestIdx];
            const endPt = currentTrack.points[bestIdx + duration - 1];
            if (startPt && endPt && startPt.time != null && endPt.time != null) {
              const trackStart = currentTrack.points[0].time || 0;
              const min = (startPt.time - trackStart) / 1000;
              const max = (endPt.time - trackStart) / 1000;
              onTrackSelect?.(currentTrack.id, [min, max]);
            }
          }
        }
      }
    }
  });

  chartEl.addEventListener('mouseleave', () => {
    if (mainChart) mainChart.redraw();
  });

  let lastNearestIdx: number | null = null;

  const timelineEl = cardContainer.querySelector(`#${metricKey}-timeline-chart`) as HTMLElement;
  if (timelineEl) {
    timelineEl.innerHTML = '';
    timelineEl.style.position = 'relative';
    const timelineTooltip = document.createElement('div');
    timelineTooltip.className = 'timeline-tooltip font-m';
    timelineTooltip.style.cssText =
      'position:absolute;background:rgba(14, 14, 16, 0.9);color:#fff;padding:8px 12px;border-radius:4px;font-family:system-ui;pointer-events:none;z-index:1000;box-shadow:0 4px 6px rgba(0,0,0,0.3);border:1px solid #2e2e34;display:none;';
    timelineEl.appendChild(timelineTooltip);

    if (xTimeline.length > 0) {
      const { xFiltered, rawYFiltered, smoothedYFiltered } = getFilteredData(
        currentDur,
        currentRange,
      );
      const lowerBound = smoothedYFiltered.map((v) => (v !== null ? v * 0.9 : null));
      const upperBound = smoothedYFiltered.map((v) => (v !== null ? v * 1.1 : null));
      const dataTimeline = [xFiltered, rawYFiltered, smoothedYFiltered, lowerBound, upperBound];

      const series: any[] = [
        {
          value: (_u: any, v: number) => {
            if (v != null) return fmtDate(v * 1000);
            return '-';
          },
        },
        {
          label: 'Value',
          stroke: color,
          width: 0,
          points: { show: true, size: 6, fill: hexToRgba(color, 0.5) },
        },
        {
          label: 'Trend',
          stroke: color,
          width: 2,
          points: { show: false },
          spanGaps: true,
          fill: 'transparent',
          dash: [5, 5],
        },
        {
          label: 'Lower Bound',
          stroke: 'transparent',
          width: 0,
          points: { show: false },
          spanGaps: true,
        },
        {
          label: 'Upper Bound',
          stroke: 'transparent',
          width: 0,
          points: { show: false },
          spanGaps: true,
        },
      ];

      const labelEl = cardContainer.querySelector(`#${metricKey}-timeline-label`);
      if (labelEl)
        labelEl.textContent = `Progress ${fmtDuration(currentDur)} ${metricKey === 'power' ? 'Power' : 'HR'}`;

      const optsTimeline: uPlot.Options = {
        width: Math.max(100, (gridWidth || 570) - 400),
        height: 250,
        padding: [0, 10, 0, 10],
        tzDate: (ts: number) => uPlot.tzDate(new Date(ts * 1000), 'Etc/UTC'),
        cursor: {
          points: {
            show: false,
          },
          drag: { setScale: false },
          x: false,
          y: false,
        },
        scales: {
          x: {
            time: true,
            range: (u) => {
              const min = u.data[0][0];
              const max = u.data[0][u.data[0].length - 1];
              if (min === undefined || max === undefined) return [0, 100];
              if (min === max) return [min - 3600, max + 3600];
              return [min, max];
            },
          },
          y: { range: (_u: any, min: number, max: number) => [min * 0.9, max * 1.1] },
        },
        series: series,
        bands: [{ series: [4, 3], fill: hexToRgba(color, 0.2) }],
        hooks: {
          init: [
            (u: uPlot) => {
              u.over.addEventListener('click', () => {
                if (lastNearestIdx != null) {
                  const track = tracksFiltered[lastNearestIdx];
                  if (track) {
                    const stats = track.stats;
                    const curve = metricKey === 'power' ? stats.powerCurve : stats.hrCurve;
                    if (curve) {
                      const entry = curve[currentDur];
                      if (entry) {
                        const bestIdx = entry.idx;
                        const duration = currentDur;

                        const startPt = track.points[bestIdx];
                        const endPt = track.points[bestIdx + duration - 1];

                        if (startPt && endPt && startPt.time != null && endPt.time != null) {
                          const trackStart = track.points[0].time || 0;
                          const min = (startPt.time - trackStart) / 1000;
                          const max = (endPt.time - trackStart) / 1000;

                          opts.onTrackSelect?.(track.id, [min, max]);
                        } else {
                          opts.onTrackSelect?.(track.id, null);
                        }
                      } else {
                        opts.onTrackSelect?.(track.id, null);
                      }
                    } else {
                      opts.onTrackSelect?.(track.id, null);
                    }
                  }
                }
              });
            },
          ],
          draw: [
            (u: uPlot) => {
              const idx = u.cursor.idx;
              if (idx != null && u.data[0][idx] != null) {
                const val = u.data[1][idx];
                if (val != null) {
                  const tpcx = u.valToPos(u.data[0][idx]!, 'x', true);
                  const tpcy = u.valToPos(val, 'y', true);

                  const tctx = u.ctx;
                  const tdpr = window.devicePixelRatio || 1;

                  tctx.save();
                  tctx.beginPath();
                  tctx.setLineDash([2 * tdpr, 2 * tdpr]);
                  tctx.strokeStyle = hexToRgba(color, 0.4);
                  tctx.lineWidth = 1 * tdpr;
                  tctx.moveTo(tpcx, u.bbox.top);
                  tctx.lineTo(tpcx, u.bbox.top + u.bbox.height);
                  tctx.moveTo(u.bbox.left, tpcy);
                  tctx.lineTo(u.bbox.left + u.bbox.width, tpcy);
                  tctx.stroke();
                  tctx.restore();

                  tctx.save();
                  tctx.beginPath();
                  tctx.setLineDash([]);
                  tctx.arc(tpcx, tpcy, 12 * tdpr, 0, 2 * Math.PI);
                  tctx.fillStyle = hexToRgba(color, 0.2);
                  tctx.fill();
                  tctx.restore();

                  tctx.save();
                  tctx.beginPath();
                  tctx.arc(tpcx, tpcy, 6 * tdpr, 0, 2 * Math.PI);
                  tctx.fillStyle = color;
                  tctx.fill();
                  tctx.strokeStyle = '#fff';
                  tctx.lineWidth = 2 * tdpr;
                  tctx.stroke();
                  tctx.restore();

                  tctx.save();
                  tctx.setLineDash([]);

                  const d = new Date(u.data[0][idx]! * 1000);
                  const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                  tctx.font = `bold ${10 * tdpr}px system-ui, sans-serif`;
                  const dateWidth = tctx.measureText(dateStr).width;
                  const xbw = dateWidth + 10 * tdpr;
                  const pillH = 16 * tdpr;

                  const xLabelX = tpcx - xbw / 2;
                  const clampedXBx = Math.max(
                    u.bbox.left,
                    Math.min(u.bbox.left + u.bbox.width - xbw, xLabelX),
                  );
                  const xLabelY = u.bbox.top + u.bbox.height + 2 * tdpr;

                  tctx.fillStyle = 'rgba(14, 14, 16, 0.92)';
                  tctx.beginPath();
                  if ((tctx as any).roundRect)
                    (tctx as any).roundRect(clampedXBx, xLabelY, xbw, pillH, 3 * tdpr);
                  else tctx.rect(clampedXBx, xLabelY, xbw, pillH);
                  tctx.fill();
                  tctx.strokeStyle = hexToRgba(color, 0.27);
                  tctx.lineWidth = 1 * tdpr;
                  tctx.stroke();

                  tctx.fillStyle = color;
                  tctx.textAlign = 'center';
                  tctx.textBaseline = 'middle';
                  tctx.fillText(dateStr, clampedXBx + xbw / 2, xLabelY + pillH / 2);

                  const valStr = `${val.toFixed(0)} ${unit}`;
                  const valWidth = tctx.measureText(valStr).width;
                  const ybw = valWidth + 10 * tdpr;

                  const yLabelX = u.bbox.left - ybw - 2 * tdpr;
                  const yLabelY = tpcy - pillH / 2;

                  tctx.fillStyle = 'rgba(14, 14, 16, 0.92)';
                  tctx.beginPath();
                  if ((tctx as any).roundRect)
                    (tctx as any).roundRect(yLabelX, yLabelY, ybw, pillH, 3 * tdpr);
                  else tctx.rect(yLabelX, yLabelY, ybw, pillH);
                  tctx.fill();
                  tctx.strokeStyle = hexToRgba(color, 0.27);
                  tctx.lineWidth = 1 * tdpr;
                  tctx.stroke();

                  tctx.fillStyle = color;
                  tctx.textAlign = 'left';
                  tctx.textBaseline = 'middle';
                  tctx.fillText(valStr, yLabelX + 5 * tdpr, yLabelY + pillH / 2);

                  tctx.restore();
                }
              }
            },
          ],
          setCursor: [
            (u: uPlot) => {
              if (!(u as any)._ready) return;
              u.redraw(false);

              let idx = u.cursor.idx;
              const cursorLeft = u.cursor.left;
              const cursorTop = u.cursor.top;
              const bb = u.bbox;

              if (cursorLeft != null && cursorTop != null && cursorLeft >= 0 && cursorTop >= 0) {
                let minD2 = Infinity;
                let nearestIdx = -1;
                const radius = 30;
                const maxD2 = radius * radius;

                const xData = u.data[0];
                const yData = u.data[1];

                for (let i = 0; i < xData.length; i++) {
                  const x = xData[i];
                  const y = yData[i];
                  if (x == null || y == null) continue;

                  const px = u.valToPos(x, 'x', false);
                  const py = u.valToPos(y, 'y', false);

                  const dx = px - cursorLeft;
                  const dy = py - cursorTop;
                  const d2 = dx * dx + dy * dy;

                  if (d2 < minD2) {
                    minD2 = d2;
                    nearestIdx = i;
                  }
                }

                if (minD2 <= maxD2) {
                  idx = nearestIdx;
                  lastNearestIdx = nearestIdx;
                } else {
                  idx = null;
                  lastNearestIdx = null;
                }
              }

              if (idx != null && u.data[0][idx] != null) {
                const d = new Date(u.data[0][idx]! * 1000);
                const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

                const val = u.data[1][idx];
                const valStr = val != null ? `${val} ${unit}` : '—';

                timelineTooltip.innerHTML = `
                  <div class="evolution-tooltip-row">
                    <span class="evolution-tooltip-label">Date:</span>
                    <span class="evolution-tooltip-value">${dateStr}</span>
                  </div>
                  <div class="evolution-tooltip-row">
                    <span class="evolution-tooltip-label">Value:</span>
                    <span class="evolution-tooltip-value">${valStr}</span>
                  </div>
                `;
                timelineTooltip.style.display = 'block';
                timelineTooltip.style.left = `${cursorLeft! + bb.left}px`;
                timelineTooltip.style.top = `${cursorTop! + bb.top}px`;
                timelineTooltip.style.transform = 'translate(5px, -50%)';
              } else {
                timelineTooltip.style.display = 'none';
              }
            },
          ],
        },
        axes: [
          {
            space: 50,
            stroke: '#555564',
            grid: { stroke: '#2e2e34' },
            show: true,
            font: '10px system-ui, sans-serif',
            size: 30,
            values: (_u: any, vals: any[]) =>
              vals.map((v) => {
                const d = new Date(v * 1000);
                return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
              }),
          },
          {
            stroke: '#555564',
            grid: { stroke: '#2e2e34' },
            font: '10px system-ui, sans-serif',
            values: (_u: any, vals: any[]) => vals.map((v) => `${v} ${unit}`),
            show: true,
            space: 15,
            size: 50,
          },
        ],
      };

      timelineChart = new uPlot(optsTimeline, dataTimeline as any, timelineEl);
      evolutionPlots.push(timelineChart);

      timelineEl.addEventListener('mouseleave', () => {
        timelineChart!.redraw();
      });
    } else {
      timelineEl.innerHTML = '<div class="evolution-empty-text">No data for the past year</div>';
    }
  }

  return {
    updatePin: (dur: number | null) => {
      pinnedDur = dur;
      if (dur !== null) currentDur = dur;

      const labelEl = cardContainer.querySelector(`#${metricKey}-timeline-label`);
      if (labelEl)
        labelEl.textContent = `Progress ${fmtDuration(currentDur)} ${metricKey === 'power' ? 'Power' : 'HR'}${pinnedDur !== null ? ' (Pinned)' : ''}`;

      if (timelineChart) {
        const { xFiltered, rawYFiltered, smoothedYFiltered } = getFilteredData(
          currentDur,
          currentRange,
        );
        const lowerBound = smoothedYFiltered.map((v) => (v !== null ? v * 0.9 : null));
        const upperBound = smoothedYFiltered.map((v) => (v !== null ? v * 1.1 : null));
        timelineChart.setData([xFiltered, rawYFiltered, smoothedYFiltered, lowerBound, upperBound]);
      }
      if (mainChart) mainChart.redraw();
    },
    updateRange: (range: string) => {
      currentRange = range;
      if (timelineChart) {
        const { xFiltered, rawYFiltered, smoothedYFiltered } = getFilteredData(
          currentDur,
          currentRange,
        );
        const lowerBound = smoothedYFiltered.map((v) => (v !== null ? v * 0.9 : null));
        const upperBound = smoothedYFiltered.map((v) => (v !== null ? v * 1.1 : null));
        timelineChart.setData([xFiltered, rawYFiltered, smoothedYFiltered, lowerBound, upperBound]);
      }
    },
  };
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function computeWeeklyDistance(
  allTracks: TrackData[],
): { week: string; timestamp: number; distance: number }[] {
  const weeklyData: Record<string, { timestamp: number; distance: number }> = {};

  allTracks.forEach((t) => {
    if (!t.stats.startTime || !t.stats.totalDist) return;

    const date = new Date(t.stats.startTime);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) weeklyData[weekKey] = { timestamp: weekStart.getTime(), distance: 0 };

    weeklyData[weekKey].distance += t.stats.totalDist;
  });

  return Object.entries(weeklyData)
    .map(([week, data]) => ({ week, timestamp: data.timestamp, distance: data.distance }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function computeWeeklyElevation(
  allTracks: TrackData[],
): { week: string; timestamp: number; elevation: number }[] {
  const weeklyData: Record<string, { timestamp: number; elevation: number }> = {};

  allTracks.forEach((t) => {
    if (!t.stats.startTime || t.stats.elevGain === undefined) return;

    const date = new Date(t.stats.startTime);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey])
      weeklyData[weekKey] = { timestamp: weekStart.getTime(), elevation: 0 };

    weeklyData[weekKey].elevation += t.stats.elevGain;
  });

  return Object.entries(weeklyData)
    .map(([week, data]) => ({ week, timestamp: data.timestamp, elevation: data.elevation }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function computeMonthlyDistance(
  allTracks: TrackData[],
): { week: string; timestamp: number; distance: number }[] {
  const monthlyData: Record<string, { timestamp: number; distance: number }> = {};

  allTracks.forEach((t) => {
    if (!t.stats.startTime || !t.stats.totalDist) return;
    const date = new Date(t.stats.startTime);
    const monthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const monthKey = monthStart.toISOString().slice(0, 7);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { timestamp: monthStart.getTime(), distance: 0 };
    }
    monthlyData[monthKey].distance += t.stats.totalDist;
  });

  return Object.entries(monthlyData)
    .map(([week, data]) => ({ week, timestamp: data.timestamp, distance: data.distance }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function computeMonthlyElevation(
  allTracks: TrackData[],
): { week: string; timestamp: number; elevation: number }[] {
  const monthlyData: Record<string, { timestamp: number; elevation: number }> = {};

  allTracks.forEach((t) => {
    if (!t.stats.startTime || t.stats.elevGain === undefined) return;
    const date = new Date(t.stats.startTime);
    const monthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const monthKey = monthStart.toISOString().slice(0, 7);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { timestamp: monthStart.getTime(), elevation: 0 };
    }
    monthlyData[monthKey].elevation += t.stats.elevGain;
  });

  return Object.entries(monthlyData)
    .map(([week, data]) => ({ week, timestamp: data.timestamp, elevation: data.elevation }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function mountProgressCardPlot(
  cardContainer: HTMLElement,
  allTracks: TrackData[],
  type: 'distance' | 'elevation',
  syncKey?: any,
  onDateRangeSelect?: (start: string, end: string) => void,
  gridWidth?: number,
) {
  const isDistance = type === 'distance';
  let activeGrouping: 'week' | 'month' = currentEvolutionGrouping;
  let activeRange = UrlState.get().progress || 'all';
  const weeklySource = isDistance
    ? computeWeeklyDistance(allTracks)
    : computeWeeklyElevation(allTracks);
  const monthlySource = isDistance
    ? computeMonthlyDistance(allTracks)
    : computeMonthlyElevation(allTracks);
  let weeklyData = activeGrouping === 'month' ? monthlySource : weeklySource;

  const color = isDistance ? Metrics.distance.color : Metrics.elevation.color;
  const unit = isDistance ? 'km' : 'm';

  const chartEl = cardContainer.querySelector(`#${type}-weekly-chart`) as HTMLElement;
  const yAxisEl = cardContainer.querySelector(`#${type}-y-axis-chart`) as HTMLElement;

  if (!chartEl || !yAxisEl) return;
  chartEl.innerHTML = '';
  chartEl.style.position = 'relative';

  const tooltip = document.createElement('div');
  tooltip.className = 'cur-y-val';
  tooltip.style.cssText = `color:${color};display:none`;
  chartEl.appendChild(tooltip);

  const xData = weeklyData.map((d) => d.timestamp / 1000);
  const yData = isDistance
    ? (weeklyData as any[]).map((d) => d.distance / 1000)
    : (weeklyData as any[]).map((d) => d.elevation);

  if (xData.length === 0) return;

  const yDataSmoothed = gaussianSmooth(yData, 2);

  const chartClientW = Math.max(0, (gridWidth || 570) - 20 - 320 - 20);
  const width = Math.max(chartClientW, xData.length * 40);
  const maxVal = Math.max(...yData) * 1.1;

  const mainOpts: uPlot.Options = {
    width: width,
    height: 150,
    padding: [10, 10, 0, 10],
    tzDate: (ts: number) => uPlot.tzDate(new Date(ts * 1000), 'Etc/UTC'),
    scales: {
      x: { time: true },
      y: { range: [0, maxVal] },
    },
    series: [
      {},
      {
        label: isDistance ? 'Distance' : 'Elevation',
        stroke: color,
        fill: hexToRgba(color, 0.1),
        width: 2,
        points: { show: true, size: 4 },
      },
      {
        label: 'Trend',
        stroke: color,
        width: 2,
        dash: [5, 5],
        points: { show: false },
      },
    ],
    cursor: {
      sync: syncKey ? { key: syncKey.key } : undefined,
      drag: { x: false, y: false },
      points: { show: false },
      x: false,
      y: false,
    },
    hooks: {
      init: [
        (u: uPlot) => {
          u.over.addEventListener('click', () => {
            const idx = u.cursor.idx;
            if (idx != null) {
              const item = weeklyData[idx];
              if (item) {
                const start = new Date(item.timestamp);
                const end = new Date(item.timestamp + 7 * 24 * 60 * 60 * 1000);
                const startStr = start.toISOString().split('T')[0];
                const endStr = end.toISOString().split('T')[0];
                onDateRangeSelect?.(startStr, endStr);
              }
            }
          });
        },
      ],
      setCursor: [
        (u: uPlot) => {
          if (!(u as any)._ready) return;
          const idx = u.cursor.idx;
          const cursorLeft = u.cursor.left;
          const cursorTop = u.cursor.top;

          if (
            idx != null &&
            cursorLeft != null &&
            cursorTop != null &&
            cursorLeft >= 0 &&
            cursorTop >= 0
          ) {
            const val = u.data[1][idx];
            const valStr =
              val != null ? (isDistance ? `${val.toFixed(1)} km` : `${val.toFixed(0)} m`) : '—';

            tooltip.innerHTML = valStr;
            tooltip.style.display = 'block';
            tooltip.style.left = `${u.valToPos(u.data[0][idx]!, 'x', false)}px`;
            tooltip.style.top = `${u.valToPos(u.data[1][idx]!, 'y', false)}px`;
            tooltip.style.transform = 'translate(6px, -50%)';
          } else {
            tooltip.style.display = 'none';
          }

          u.redraw(false);
        },
      ],
      draw: [
        (u: uPlot) => {
          const idx = u.cursor.idx;
          if (idx != null && u.data[0][idx] != null) {
            const pcx = u.valToPos(u.data[0][idx]!, 'x', true);
            const pcy = u.valToPos(u.data[1][idx]!, 'y', true);
            const dpr = window.devicePixelRatio || 1;
            const ctx = u.ctx;
            const bb = u.bbox;

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([2 * dpr, 2 * dpr]);
            ctx.strokeStyle = hexToRgba(color, 0.4);
            ctx.lineWidth = 1 * dpr;
            ctx.moveTo(pcx, bb.top);
            ctx.lineTo(pcx, bb.top + bb.height);
            ctx.moveTo(bb.left, pcy);
            ctx.lineTo(bb.left + bb.width, pcy);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.arc(pcx, pcy, 12 * dpr, 0, 2 * Math.PI);
            ctx.fillStyle = hexToRgba(color, 0.2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(pcx, pcy, 6 * dpr, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2 * dpr;
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.setLineDash([]);

            const d = new Date(u.data[0][idx]! * 1000);
            const xValStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
            ctx.font = `bold ${10 * dpr}px system-ui, sans-serif`;
            const xValWidth = ctx.measureText(xValStr).width;
            const xbw = xValWidth + 10 * dpr;
            const pillH = 16 * dpr;

            const xLabelX = pcx - xbw / 2;
            const clampedXBx = Math.max(bb.left, Math.min(bb.left + bb.width - xbw, xLabelX));
            const xLabelY = bb.top + bb.height + 2 * dpr;

            ctx.fillStyle = 'rgba(14, 14, 16, 0.92)';
            ctx.beginPath();
            if ((ctx as any).roundRect)
              (ctx as any).roundRect(clampedXBx, xLabelY, xbw, pillH, 3 * dpr);
            else ctx.rect(clampedXBx, xLabelY, xbw, pillH);
            ctx.fill();
            ctx.strokeStyle = hexToRgba(color, 0.27);
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(xValStr, clampedXBx + xbw / 2, xLabelY + pillH / 2);

            ctx.restore();
          }
        },
      ],
    },
    axes: [
      {
        stroke: '#555564',
        grid: { stroke: '#2e2e34', width: 1 },
        show: true,
        space: 40,
        values: (_self, splits) =>
          splits.map((s) => {
            const d = new Date(s * 1000);
            return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
          }),
        font: '10px system-ui, sans-serif',
        size: 30,
      },
      {
        stroke: '#555564',
        grid: { stroke: '#2e2e34', width: 1 },
        show: true,
        values: (_self, splits) => splits.map((s) => `${s.toFixed(0)} ${unit}`),
        font: '10px system-ui, sans-serif',
        size: 40,
      },
    ],
  };

  const mainChart = new uPlot(mainOpts, [xData, yData, yDataSmoothed], chartEl);
  evolutionPlots.push(mainChart);

  const scrollContainer = cardContainer.querySelector('.chart-scroll-container') as HTMLElement;
  if (scrollContainer && xData.length * 40 > width)
    scrollContainer.scrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;

  function applySeriesData() {
    weeklyData = activeGrouping === 'month' ? monthlySource : weeklySource;
    const maxTime = weeklyData[weeklyData.length - 1]?.timestamp || 1785542400000;
    let minTime = 0;

    if (activeRange === '1m') minTime = maxTime - 30 * 24 * 3600 * 1000;
    else if (activeRange === '2m') minTime = maxTime - 60 * 24 * 3600 * 1000;
    else if (activeRange === '6m') minTime = maxTime - 180 * 24 * 3600 * 1000;
    else if (activeRange === '1y') minTime = maxTime - 365 * 24 * 3600 * 1000;
    else if (activeRange === '2y') minTime = maxTime - 2 * 365 * 24 * 3600 * 1000;

    const filteredData = weeklyData.filter((d) => d.timestamp >= minTime);

    const newXData = filteredData.map((d) => d.timestamp / 1000);
    const newYData = isDistance
      ? (filteredData as any[]).map((d) => d.distance / 1000)
      : (filteredData as any[]).map((d) => d.elevation);
    const newYDataSmoothed = gaussianSmooth(newYData, 2);

    const newWidth = Math.max(chartEl.clientWidth, newXData.length * 40);
    const newMaxVal = Math.max(1, ...newYData) * 1.1;

    mainChart.setSize({ width: newWidth, height: 150 });
    mainChart.setScale('y', { min: 0, max: newMaxVal });
    mainChart.setData([newXData, newYData, newYDataSmoothed]);

    if (scrollContainer)
      scrollContainer.scrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
  }

  return {
    updateRange: (range: string) => {
      activeRange = range;
      applySeriesData();
    },
    updateGrouping: (grouping: 'week' | 'month') => {
      activeGrouping = grouping;
      applySeriesData();
    },
  };
}
