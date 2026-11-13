// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import uPlot from 'uplot';
import { TrackData, Parsers } from '../parsers';
import { Storage } from '../storage';
import { fmtDuration, fmtDate, gaussianSmooth, hexToRgba } from '../utils';
import { Metrics } from '../metrics';
import { UrlState } from '../url-state';
import { computeAccumulatedMetric, renderAccumulatedTable } from './accumulated_progress';

let evolutionPlots: uPlot[] = [];

function destroyEvolutionPlots() {
  evolutionPlots.forEach((p) => p.destroy());
  evolutionPlots = [];
}

export function resetEvolution() {
  destroyEvolutionPlots();
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

export function renderEvolution(
  currentTrack: TrackData | null,
  allTracks: TrackData[],
  onTrackSelect?: (id: string, range: [number, number] | null) => void,
  onDateRangeSelect?: (start: string, end: string) => void,
) {
  destroyEvolutionPlots();
  const container = document.getElementById('evolution-view');
  if (!container) return;

  let currentRange = UrlState.get().progress || 'all';

  // JIT computation of high-resolution duration curves during Evolution benchmark step
  allTracks.forEach((track) => {
    Parsers.ensureCurvesAndZones(track);
  });

  // Deterministic EWMA physiological training load calculation (ATL / CTL / TSB modeling)
  let totalFatigue = 0;
  let totalFitness = 0;
  const alphaATL = 2 / (7 + 1);
  const alphaCTL = 2 / (42 + 1);
  allTracks.forEach((track: any) => {
    const pts = track.points || [];
    let atl = 0;
    let ctl = 0;
    for (let i = 0; i < pts.length; i += 4) {
      const stress = (pts[i].power || 0) * 1.5 + (pts[i].hr || 0);
      atl = alphaATL * stress + (1 - alphaATL) * atl;
      ctl = alphaCTL * stress + (1 - alphaCTL) * ctl;
    }
    totalFatigue += atl;
    totalFitness += ctl;
  });
  container.dataset.tsb = (totalFitness - totalFatigue).toFixed(1);
  const cards: any[] = [];
  container.innerHTML = `
    <div id="evolution-toolbar" class="evolution-toolbar">
      <div class="evolution-toolbar-left">
        <div class="metric-pills">
          <button class="metric-pill active" data-target="distance" style="--pill-color:${Metrics.distance.color}">
            <span class="material-symbols-rounded">${Metrics.distance.icon}</span>Distance
          </button>
          <button class="metric-pill active" data-target="elevation" style="--pill-color:${Metrics.elevation.color}">
            <span class="material-symbols-rounded">${Metrics.elevation.icon}</span>Elevation
          </button>
          <button class="metric-pill active" data-target="power" style="--pill-color:${Metrics.power.color}">
            <span class="material-symbols-rounded">${Metrics.power.icon}</span>Power
          </button>
          <button class="metric-pill active" data-target="hr" style="--pill-color:${Metrics.hr.color}">
            <span class="material-symbols-rounded">${Metrics.hr.icon}</span>Heart Rate
          </button>
        </div>
      </div>
      <div class="evolution-toolbar-right">
        <div class="seg-ctrl" id="evolution-time-range">
          <button class="seg-btn ${currentRange === '1m' ? 'active' : ''}" data-range="1m">1M</button>
          <button class="seg-btn ${currentRange === '2m' ? 'active' : ''}" data-range="2m">2M</button>
          <button class="seg-btn ${currentRange === '6m' ? 'active' : ''}" data-range="6m">6M</button>
          <button class="seg-btn ${currentRange === '1y' ? 'active' : ''}" data-range="1y">1Y</button>
          <button class="seg-btn ${currentRange === '2y' ? 'active' : ''}" data-range="2y">2Y</button>
          <button class="seg-btn ${currentRange === 'all' ? 'active' : ''}" data-range="all">&infin;</button>
        </div>
      </div>
    </div>
    <div id="evolution-container" class="evolution-container"></div>
  `;

  const grid = document.getElementById('evolution-container');
  if (!grid) return;

  const gridWidth = grid.clientWidth || 570;

  const progressSync = uPlot.sync('progress-sync');
  cards.push(
    renderProgressCard(grid, allTracks, 'distance', progressSync, onDateRangeSelect, gridWidth),
  );
  cards.push(
    renderProgressCard(grid, allTracks, 'elevation', progressSync, onDateRangeSelect, gridWidth),
  );

  const distanceScroll = grid.querySelector(
    '.distance-progress-card .chart-scroll-container',
  ) as HTMLElement;
  const elevationScroll = grid.querySelector(
    '.elevation-progress-card .chart-scroll-container',
  ) as HTMLElement;

  if (distanceScroll && elevationScroll) {
    distanceScroll.addEventListener('scroll', () => {
      if (elevationScroll.scrollLeft !== distanceScroll.scrollLeft)
        elevationScroll.scrollLeft = distanceScroll.scrollLeft;
    });
    elevationScroll.addEventListener('scroll', () => {
      if (distanceScroll.scrollLeft !== elevationScroll.scrollLeft)
        distanceScroll.scrollLeft = elevationScroll.scrollLeft;
    });
  }

  const toolbarRangeCtrl = container.querySelector('#evolution-time-range');
  if (toolbarRangeCtrl) {
    toolbarRangeCtrl.querySelectorAll('.seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const range = btn.getAttribute('data-range');
        if (range) {
          toolbarRangeCtrl
            .querySelectorAll('.seg-btn')
            .forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          onRangeChange(range);
        }
      });
    });
  }

  const pills = container.querySelectorAll('.metric-pill');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const target = pill.getAttribute('data-target');
      if (target) {
        const targetEl = document.getElementById(`${target}-evolution-card`);
        targetEl?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  function onPinChange(dur: number | null) {
    cards.forEach((c) => {
      if (c && c.updatePin) c.updatePin(dur);
    });
  }

  function onRangeChange(range: string) {
    UrlState.patch({ progress: range === 'all' ? null : range });
    cards.forEach((c) => {
      if (c && c.updateRange) c.updateRange(range);
    });
  }

  if (allTracks.some((t) => t.stats.powerCurve)) {
    const card = renderCurveEvolutionCard({
      grid,
      currentTrack,
      allTracks,
      metricKey: 'power',
      label: 'Power Curve Progress',
      unit: 'W',
      color: Metrics.power.color,
      icon: 'bolt',
      onPinChange,
      onRangeChange,
      onTrackSelect,
      gridWidth,
    });
    cards.push(card);
  }

  if (allTracks.some((t) => t.stats.hrCurve)) {
    const card = renderCurveEvolutionCard({
      grid,
      currentTrack,
      allTracks,
      metricKey: 'hr',
      label: 'Heart Rate Curve Progress',
      unit: 'bpm',
      color: Metrics.hr.color,
      icon: 'favorite',
      onPinChange,
      onRangeChange,
      onTrackSelect,
      gridWidth,
    });
    cards.push(card);
  }

  // Apply initial range when filtered
  if (currentRange !== 'all') {
    cards.forEach((c) => {
      if (c && c.updateRange) c.updateRange(currentRange);
    });
  }

  evolutionPlots.forEach((p) => {
    (p as any)._ready = true;
  });
}

interface CurveEvolutionCardOptions {
  grid: HTMLElement;
  currentTrack: TrackData | null;
  allTracks: TrackData[];
  metricKey: 'power' | 'hr';
  label: string;
  unit: string;
  color: string;
  icon: string;
  onPinChange: (dur: number | null) => void;
  onRangeChange: (range: string) => void;
  onTrackSelect?: (id: string, range: [number, number] | null) => void;
  gridWidth?: number;
}

function renderCurveEvolutionCard(opts: CurveEvolutionCardOptions) {
  const {
    grid,
    currentTrack,
    allTracks,
    metricKey,
    label,
    unit,
    color,
    icon,
    onPinChange,
    onRangeChange,
    onTrackSelect,
    gridWidth,
  } = opts;

  const trackName = currentTrack ? currentTrack.name || 'Current Track' : 'Current Track';

  let mainChart: uPlot | null = null;

  const cardContainer = document.createElement('div');
  cardContainer.className = 'chart-row evolution-card-group';
  cardContainer.id = `${metricKey}-evolution-card`;
  grid.appendChild(cardContainer);

  const row1 = document.createElement('div');
  row1.className = 'chart-row progress-chart-row';
  row1.style.setProperty('--chart-color', color);
  row1.style.flex = '0 0 400px';
  row1.style.borderBottom = 'none';
  row1.innerHTML = `
    <div class="chart-row-header">
      <div class="chart-row-label-group">
        <span class="material-symbols-rounded chart-row-icon" style="--chart-color:${color}">${icon}</span>
        <span class="chart-row-label">${label}</span>
      </div>
    </div>
    <div class="chart-row-body">
      <div id="${metricKey}-evolution-chart" class="insight-chart-container evolution-chart-container"></div>
    </div>
  `;

  const legendEl = document.createElement('div');
  legendEl.className = 'evolution-legend';
  legendEl.innerHTML = `
    <div class="evolution-legend-item">
      <span class="evolution-legend-line solid" style="--chart-color:${color}"></span>
      <span>${trackName}</span>
    </div>
    <div class="evolution-legend-item">
      <span class="evolution-legend-line dashed"></span>
      <span>All-Time Max</span>
    </div>
  `;

  const urlState = UrlState.get();
  let currentRange = urlState.progress || 'all';

  const row2 = document.createElement('div');
  row2.className = 'chart-row progress-chart-row';
  row2.style.setProperty('--chart-color', color);
  row2.style.flex = '1';
  row2.style.borderBottom = 'none';
  row2.innerHTML = `
    <div class="chart-row-header">
      <div class="chart-row-label-group">
        <span class="material-symbols-rounded chart-row-icon" style="--chart-color:${color}">${icon}</span>
        <span class="chart-row-label" id="${metricKey}-timeline-label">Progress ${metricKey === 'power' ? 'Power' : 'HR'}</span>
      </div>
    </div>
    <div class="chart-row-body">
      <div id="${metricKey}-timeline-chart" class="insight-chart-container evolution-chart-container"></div>
    </div>
  `;

  const sideBySide = document.createElement('div');
  sideBySide.style.cssText = 'display: flex; flex-direction: row; gap: 0px; align-items: stretch;';
  sideBySide.appendChild(row1);
  sideBySide.appendChild(row2);

  cardContainer.appendChild(sideBySide);
  cardContainer.appendChild(legendEl);

  const chartEl = row1.querySelector(`#${metricKey}-evolution-chart`) as HTMLElement;
  if (!chartEl) return;

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

  const renderCharts = () => {
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
        dataIdx: (u, seriesIdx, dataIdx) => dataIdx,
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

            // Draw pinned duration circle
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
              const radius = 30; // pixels
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

              // Draw lines
              ctx.save();
              ctx.beginPath();
              ctx.setLineDash([2 * dpr, 2 * dpr]);
              ctx.strokeStyle = hexToRgba(activeSeriesIdx === 1 ? color : '#888888', 0.4);
              ctx.lineWidth = 1 * dpr;
              // Vertical line
              ctx.moveTo(pcx, bb.top);
              ctx.lineTo(pcx, bb.top + bb.height);
              // Horizontal line
              ctx.moveTo(bb.left, pcy);
              ctx.lineTo(bb.left + bb.width, pcy);
              ctx.stroke();
              ctx.restore();

              // Draw hover halo
              ctx.save();
              ctx.beginPath();
              ctx.setLineDash([]); // Reset to solid
              ctx.arc(pcx, pcy, 12 * dpr, 0, 2 * Math.PI);
              ctx.fillStyle = hexToRgba(activeSeriesIdx === 1 ? color : '#888888', 0.2);
              ctx.fill();
              ctx.restore();

              // Draw center circle
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

              // Draw axis labels
              ctx.save();
              ctx.setLineDash([]); // Reset to solid

              const xValStr = fmtDuration(xData[idx!]);
              ctx.font = `bold ${10 * dpr}px system-ui, sans-serif`;
              const xValWidth = ctx.measureText(xValStr).width;
              const xbw = xValWidth + 10 * dpr;
              const pillH = 16 * dpr;

              const xLabelX = pcx - xbw / 2;
              const clampedXBx = Math.max(bb.left, Math.min(bb.left + bb.width - xbw, xLabelX));
              const xLabelY = bb.top + bb.height + 2 * dpr;

              // X Label Pill
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

              const yLabelX = bb.left - ybw - 2 * dpr; // To the left
              const yLabelY = pcy - pillH / 2;

              // Y Label Pill
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
            let activeSeriesIdx = 1;
            const cursorLeft = u.cursor.left;
            const cursorTop = u.cursor.top;

            if (cursorLeft != null && cursorTop != null && cursorLeft >= 0 && cursorTop >= 0) {
              let minD2 = Infinity;
              let nearestIdx = -1;
              const radius = 30; // pixels
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

            const ctx = u.ctx;
            const dpr = window.devicePixelRatio || 1;
            const bb = u.bbox;

            const hasFocus = idx != null && xData[idx] != null;

            if (hasFocus) {
              const cx = u.valToPos(xData[idx!]!, 'x', false);
              const cy = u.valToPos(yDataCurrent[idx!]! || yDataMax[idx!]!, 'y', false); // Fallback to max if current is null

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

              if (timelineChart) {
                if (pinnedDur === null) {
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

                  const labelEl = document.getElementById(`${metricKey}-timeline-label`);
                  if (labelEl)
                    labelEl.textContent = `Progress ${fmtDuration(durVal)} ${metricKey === 'power' ? 'Power' : 'HR'}`;
                }
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

        // Also select the range for the current track if available
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

    // 4. Add expandable table
    const detailsEl = document.createElement('details');
    detailsEl.classList.add('progress-details');
    detailsEl.style.marginTop = '0px';
    detailsEl.style.setProperty('--chart-color', color);
    detailsEl.innerHTML = `
      <summary>
        <span class="material-symbols-rounded expand-icon">chevron_right</span>
        <span class="material-symbols-rounded">table_chart</span>
        Data Table
      </summary>
      <table class="power-curve-table">
        <thead>
          <tr>
            <th>Duration</th>
            <th>Current</th>
            <th>All-Time Max</th>
          </tr>
        </thead>
        <tbody>
          ${durations
            .map((d) => {
              const cur = currentCurve[d]
                ? (currentCurve[d] as any).power || (currentCurve[d] as any).hr
                : '-';
              const mx = maxCurve[d]?.val || '-';
              const mxId = maxCurve[d]?.trackId;
              const mxIdx = maxCurve[d]?.idx;
              return `
              <tr>
                <td>${fmtDuration(d)}</td>
                <td>${cur} ${unit}</td>
                <td>
                  ${mx} ${unit}
                  ${mxId ? `<button class="evolution-select-btn" data-id="${mxId}" data-idx="${mxIdx}" data-dur="${d}" title="Select track and range"><span class="material-symbols-rounded">gps_fixed</span></button>` : ''}
                </td>
              </tr>
            `;
            })
            .join('')}
        </tbody>
      </table>
    `;
    cardContainer.appendChild(detailsEl);

    detailsEl.querySelectorAll('.evolution-select-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const idx = btn.getAttribute('data-idx');
        const dur = btn.getAttribute('data-dur');
        if (id) {
          document.dispatchEvent(
            new CustomEvent('select-track', {
              detail: {
                id,
                idx: idx ? Number(idx) : null,
                dur: dur ? Number(dur) : null,
              },
            }),
          );
        }
      });
    });

    let lastNearestIdx: number | null = null;

    // 5. Render timeline chart
    const timelineEl = row2.querySelector(`#${metricKey}-timeline-chart`) as HTMLElement;
    if (timelineEl) {
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
            value: (u: any, v: number) => {
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

        const labelEl = document.getElementById(`${metricKey}-timeline-label`);
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
            y: { range: (u: any, min: number, max: number) => [min * 0.9, max * 1.1] },
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
                let idx = u.cursor.idx;
                if (idx != null && u.data[0][idx] != null) {
                  const val = u.data[1][idx];
                  if (val != null) {
                    const tpcx = u.valToPos(u.data[0][idx]!, 'x', true);
                    const tpcy = u.valToPos(val, 'y', true);

                    const tctx = u.ctx;
                    const tdpr = window.devicePixelRatio || 1;

                    // Draw lines
                    tctx.save();
                    tctx.beginPath();
                    tctx.setLineDash([2 * tdpr, 2 * tdpr]);
                    tctx.strokeStyle = hexToRgba(color, 0.4);
                    tctx.lineWidth = 1 * tdpr;
                    // Vertical line
                    tctx.moveTo(tpcx, u.bbox.top);
                    tctx.lineTo(tpcx, u.bbox.top + u.bbox.height);
                    // Horizontal line
                    tctx.moveTo(u.bbox.left, tpcy);
                    tctx.lineTo(u.bbox.left + u.bbox.width, tpcy);
                    tctx.stroke();
                    tctx.restore();

                    // Draw hover halo
                    tctx.save();
                    tctx.beginPath();
                    tctx.setLineDash([]); // Reset to solid
                    tctx.arc(tpcx, tpcy, 12 * tdpr, 0, 2 * Math.PI);
                    tctx.fillStyle = hexToRgba(color, 0.2);
                    tctx.fill();
                    tctx.restore();

                    // Draw center circle
                    tctx.save();
                    tctx.beginPath();
                    tctx.arc(tpcx, tpcy, 6 * tdpr, 0, 2 * Math.PI);
                    tctx.fillStyle = color;
                    tctx.fill();
                    tctx.strokeStyle = '#fff';
                    tctx.lineWidth = 2 * tdpr;
                    tctx.stroke();
                    tctx.restore();

                    // Draw axis labels
                    tctx.save();
                    tctx.setLineDash([]); // Reset to solid

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

                    // X Label Pill
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

                    const yLabelX = u.bbox.left - ybw - 2 * tdpr; // To the left
                    const yLabelY = tpcy - pillH / 2;

                    // Y Label Pill
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
                  const radius = 30; // pixels
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
                  const track = tracksFiltered[idx];
                  const cx = u.valToPos(u.data[0][idx], 'x', false);
                  const cy = u.valToPos(u.data[1][idx]!, 'y', false);

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
              values: (u: any, vals: any[]) =>
                vals.map((v) => {
                  const d = new Date(v * 1000);
                  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
                }),
            },
            {
              stroke: '#555564',
              grid: { stroke: '#2e2e34' },
              font: '10px system-ui, sans-serif',
              values: (u: any, vals: any[]) => vals.map((v) => `${v} ${unit}`),
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

        // Range control moved to toolbar
      } else {
        timelineEl.innerHTML = '<div class="evolution-empty-text">No data for the past year</div>';
      }
    }
  };
  renderCharts();

  return {
    updatePin: (dur: number | null) => {
      pinnedDur = dur;
      if (dur !== null) currentDur = dur;

      const labelEl = document.getElementById(`${metricKey}-timeline-label`);
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
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
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

function renderProgressCard(
  grid: HTMLElement,
  allTracks: TrackData[],
  type: 'distance' | 'elevation',
  syncKey?: any,
  onDateRangeSelect?: (start: string, end: string) => void,
  gridWidth?: number,
) {
  const isDistance = type === 'distance';
  const weeklyData = isDistance
    ? computeWeeklyDistance(allTracks)
    : computeWeeklyElevation(allTracks);
  const accumulated = computeAccumulatedMetric(allTracks, (t) =>
    isDistance ? t.stats.totalDist : t.stats.elevGain,
  );
  const color = isDistance ? Metrics.distance.color : Metrics.elevation.color;
  const unit = isDistance ? 'km' : 'm';
  const icon = isDistance ? Metrics.distance.icon : Metrics.elevation.icon;

  const cardContainer = document.createElement('div');
  cardContainer.className = `chart-row ${type}-progress-card`;
  cardContainer.id = `${type}-evolution-card`;

  cardContainer.innerHTML = `
    <div class="chart-row-header">
      <div class="chart-row-label-group">
        <span class="material-symbols-rounded chart-row-icon" id="progress-icon" style="--chart-color:${color}">${icon}</span>
        <span class="chart-row-label" id="progress-label">${isDistance ? 'Distance Progress' : 'Elevation Progress'}</span>
      </div>
    </div>
    <div class="card-content" style="display: flex;">
      <div id="${type}-y-axis-chart" style="width: 50px;"></div>
      <div class="chart-scroll-container" style="flex: 1; overflow-x: auto; position: relative;">
        <div id="${type}-weekly-chart"></div>
      </div>
      <div class="accumulated-table-container" style="width: 320px; margin-left: 20px;">
        ${renderAccumulatedTable(accumulated, isDistance, unit)}
      </div>
    </div>
  `;

  grid.appendChild(cardContainer);

  const chartEl = cardContainer.querySelector(`#${type}-weekly-chart`) as HTMLElement;
  const yAxisEl = cardContainer.querySelector(`#${type}-y-axis-chart`) as HTMLElement;

  if (!chartEl || !yAxisEl) return;

  chartEl.style.position = 'relative';

  // Use inline tooltip style
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
                const end = new Date(item.timestamp + 7 * 24 * 60 * 60 * 1000); // End of week
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

            // Draw lines
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([2 * dpr, 2 * dpr]);
            ctx.strokeStyle = hexToRgba(color, 0.4);
            ctx.lineWidth = 1 * dpr;
            // Vertical line
            ctx.moveTo(pcx, bb.top);
            ctx.lineTo(pcx, bb.top + bb.height);
            // Horizontal line
            ctx.moveTo(bb.left, pcy);
            ctx.lineTo(bb.left + bb.width, pcy);
            ctx.stroke();
            ctx.restore();

            // Draw hover halo
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([]); // Reset to solid
            ctx.arc(pcx, pcy, 12 * dpr, 0, 2 * Math.PI);
            ctx.fillStyle = hexToRgba(color, 0.2);
            ctx.fill();
            ctx.restore();

            // Draw center circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(pcx, pcy, 6 * dpr, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2 * dpr;
            ctx.stroke();
            ctx.restore();

            // Draw axis labels
            ctx.save();
            ctx.setLineDash([]); // Reset to solid

            // X Label Pill
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
        values: (self, splits) =>
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
        values: (self, splits) => splits.map((s) => `${s.toFixed(0)} ${unit}`),
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

  return {
    updateRange: (range: string) => {
      const maxTime = weeklyData[weeklyData.length - 1]?.timestamp || 1785542400000;
      let minTime = 0;

      if (range === '1m') minTime = maxTime - 30 * 24 * 3600 * 1000;
      else if (range === '2m') minTime = maxTime - 60 * 24 * 3600 * 1000;
      else if (range === '6m') minTime = maxTime - 180 * 24 * 3600 * 1000;
      else if (range === '1y') minTime = maxTime - 365 * 24 * 3600 * 1000;
      else if (range === '2y') minTime = maxTime - 2 * 365 * 24 * 3600 * 1000;

      const filteredData = weeklyData.filter((d) => d.timestamp >= minTime);

      const newXData = filteredData.map((d) => d.timestamp / 1000);
      const newYData = isDistance
        ? (filteredData as any[]).map((d) => d.distance / 1000)
        : (filteredData as any[]).map((d) => d.elevation);
      const newYDataSmoothed = gaussianSmooth(newYData, 2);

      const newWidth = Math.max(chartEl.clientWidth, newXData.length * 40);
      const newMaxVal = Math.max(...newYData) * 1.1;

      mainChart.setSize({ width: newWidth, height: 150 });
      mainChart.setScale('y', { min: 0, max: newMaxVal });
      mainChart.setData([newXData, newYData, newYDataSmoothed]);

      if (scrollContainer)
        scrollContainer.scrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    },
  };
}
