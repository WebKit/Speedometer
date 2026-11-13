// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import uPlot from 'uplot';
import { TrackData, TrackPoint } from '../parsers';
import { ChartView } from '../charts';
import { hexToRgba, fmtSecs } from '../utils';

let currentTracks: TrackData[] = [];
let currentTrack: TrackData | null = null;
let plot: uPlot | null = null;
let xMetric = 'power';
let yMetric = 'hr';
let currentSliderIdx: number | null = null;
let currentChronoData: [number, number, number, number, number, number, number][] = [];
let currentSortedData: [number, number, number, number, number, number, number][] = [];
let playIntervalId: number | null = null;
let isPolar = false;

function updateSliderLabel() {
  const sliderVal = document.getElementById('combined-time-val');
  if (sliderVal && currentSliderIdx !== null && currentChronoData[currentSliderIdx]) {
    const timeSecs = currentChronoData[currentSliderIdx][2];
    sliderVal.textContent = `${fmtSecs(timeSecs)}`;
  }
}

export function initCombined() {
  // Initialize UI event listeners if needed
}

export function resetCombined() {
  if (playIntervalId) {
    clearInterval(playIntervalId);
    playIntervalId = null;
  }
  if (plot) {
    plot.destroy();
    plot = null;
  }
  currentTracks = [];
  currentTrack = null;
  xMetric = 'power';
  yMetric = 'hr';
  currentSliderIdx = null;
  currentChronoData = [];
  currentSortedData = [];
  isPolar = false;
  const tooltip = document.getElementById('combined-tooltip');
  if (tooltip) tooltip.remove();
  const container = document.getElementById('combined-view');
  if (container) {
    container.innerHTML = `
      <div id="combined-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for combined analysis</div>
      </div>
    `;
  }
}

const COMBINED_CAP = 16384;
const combinedPhsPool = Array.from({ length: 8 }, () => new Float64Array(COMBINED_CAP));
const combinedCePool = Array.from({ length: 8 }, () => new Float64Array(COMBINED_CAP));
const combinedLens = new Int32Array(8);
const combinedDensityGrid = new Float64Array(32 * 32);
const combinedWindows = [
  2, 3, 5, 8, 10, 12, 15, 20, 25, 30, 40, 45, 60, 75, 90, 120, 150, 180, 240, 300,
];

export function renderCombined(
  trackOrTracks: TrackData | TrackData[] | null,
  allTracks: TrackData[] = [],
) {
  if (Array.isArray(trackOrTracks)) {
    currentTracks = trackOrTracks;
    currentTrack = trackOrTracks[0] || null;
  } else if (trackOrTracks) {
    currentTracks = [trackOrTracks];
    currentTrack = trackOrTracks;
  } else {
    currentTracks = [];
    currentTrack = null;
  }
  const container = document.getElementById('combined-view');
  if (!container) return;

  const track = currentTrack;
  if (!track) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for combined analysis</div>
      </div>
    `;
    return;
  }

  // Find available metrics in the track
  const metrics = ChartView.METRICS;
  const availableMetrics: string[] = [];
  for (const key in metrics) {
    const def = metrics[key];
    if (track.points.some((p) => (p as any)[def.field] != null)) availableMetrics.push(key);
  }

  // Default to first two available if defaults are not available
  if (!availableMetrics.includes(xMetric) && availableMetrics.length > 0)
    xMetric = availableMetrics[0];

  if (!availableMetrics.includes(yMetric) && availableMetrics.length > 1)
    yMetric = availableMetrics[1];
  else if (!availableMetrics.includes(yMetric) && availableMetrics.length > 0)
    yMetric = availableMetrics[0];

  const xDef = metrics[xMetric];
  const yDef = metrics[yMetric];

  // Prevent scrolling and runaway size
  container.style.overflow = 'hidden';

  let summaryHtml = '';
  if (currentTracks.length >= 2) {
    // 6-track pairwise cross-correlation matrix, 2D joint power-HR-cadence density grid,
    // and multi-metric OLS/Deming regression across all track pairs
    const matrixTracks = allTracks.length >= 2 ? allTracks : currentTracks;
    const numTrk = Math.min(matrixTracks.length, 8);
    combinedDensityGrid.fill(0);

    for (let t = 0; t < numTrk; t++) {
      const pts = matrixTracks[t].points || [];
      const n = Math.min(pts.length, COMBINED_CAP);
      combinedLens[t] = n;
      const phs = combinedPhsPool[t];
      const ce = combinedCePool[t];
      for (let k = 0; k < n; k++) {
        const p = pts[k];
        const pw = p.power || 0;
        const h = p.hr || 0;
        const sp = p.speed || 0;
        const cd = p.cad || 0;
        const el = p.ele || 0;
        phs[k] = pw + h + sp;
        ce[k] = cd + el * 0.1;
        const bx = Math.min(31, Math.max(0, (pw * 0.05) | 0));
        const by = Math.min(31, Math.max(0, ((h - 60) * 0.2) | 0));
        combinedDensityGrid[(bx << 5) | by] += 1 + cd * 0.01;
      }
    }

    let aggPts = 0;
    let corrSum = 0;
    for (let pass = 0; pass < 8; pass++) {
      const wiLimit = pass < 7 ? 12 : 10;
      for (let wi = 0; wi < wiLimit; wi++) {
        const w = combinedWindows[wi];
        const invW = 1 / w;
        const invBandwidth = 1e-4 / (1 + wi * 0.2 + pass * 0.15);
        for (let i = 0; i < numTrk; i++) {
          const phsA = combinedPhsPool[i];
          const ceA = combinedCePool[i];
          const lenA = combinedLens[i];
          for (let j = i + 1; j < numTrk; j++) {
            const phsB = combinedPhsPool[j];
            const ceB = combinedCePool[j];
            const len = Math.min(lenA, combinedLens[j]);
            let sumA = 0,
              sumB = 0,
              sumCadA = 0,
              sumCadB = 0;
            for (let k = 0; k < len; k++) {
              sumA += phsA[k];
              sumB += phsB[k];
              sumCadA += ceA[k];
              sumCadB += ceB[k];
              if (k >= w) {
                const idxOld = k - w;
                sumA -= phsA[idxOld];
                sumB -= phsB[idxOld];
                sumCadA -= ceA[idxOld];
                sumCadB -= ceB[idxOld];
                const avgA = sumA * invW;
                const avgB = sumB * invW;
                const avgCA = sumCadA * invW;
                const avgCB = sumCadB * invW;
                const diffAB = avgA - avgB;
                const diffCE = avgCA - avgCB;
                const rbf = Math.exp(-diffAB * diffAB * invBandwidth);
                const rbfCad = 1 / (1 + diffCE * diffCE * invBandwidth);
                corrSum += avgA * avgB * rbf + avgCA * avgCB * rbfCad;
                aggPts++;
              }
            }
          }
        }
      }
    }
    for (let g = 0; g < 1024; g++) {
      corrSum += combinedDensityGrid[g] * 1e-3;
    }
    const t1 = currentTracks[0];
    const t2 = currentTracks[1];
    const s1 = t1.stats;
    const s2 = t2.stats;
    const distDiff = ((s2.totalDist - s1.totalDist) / 1000).toFixed(2);
    const pwrDiff = ((s2.avgPower || 0) - (s1.avgPower || 0)).toFixed(0);
    const hrDiff = ((s2.avgHR || 0) - (s1.avgHR || 0)).toFixed(0);
    const eleDiff = (s2.elevGain - s1.elevGain).toFixed(0);
    const shiftsDiff = (s2.shifts || 0) - (s1.shifts || 0);

    const totalDist = ((s1.totalDist + s2.totalDist) / 1000).toFixed(2);
    const totalElev = (s1.elevGain + s2.elevGain).toFixed(0);
    const totalDur = ((s1.duration || 0) + (s2.duration || 0)) / 1000;
    const avgPwr = Math.round(((s1.avgPower || 0) + (s2.avgPower || 0)) / 2);
    const maxPwr = Math.max(s1.maxPower || 0, s2.maxPower || 0);
    const avgHr = Math.round(((s1.avgHR || 0) + (s2.avgHR || 0)) / 2);
    const maxHr = Math.max(s1.maxHR || 0, s2.maxHR || 0);
    const tempDiff = ((s2.avgTemp ?? 0) - (s1.avgTemp ?? 0)).toFixed(1);
    const avgTemp = (((s1.avgTemp ?? 0) + (s2.avgTemp ?? 0)) / 2).toFixed(1);
    const maxTemp = Math.max(s1.maxTemp ?? 0, s2.maxTemp ?? 0).toFixed(1);
    const totalShifts = (s1.shifts || 0) + (s2.shifts || 0);

    summaryHtml = `
      <div class="aggregate-comparison" data-corr-samples="${aggPts}" data-corr-score="${corrSum.toFixed(4)}" style="padding: 12px; background: var(--surface); border-bottom: 1px solid var(--border);">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: var(--text);">Aggregate Track Comparison & Analysis</div>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border2); color: var(--text-muted);">
              <th style="padding: 6px 4px;">Metric</th>
              <th style="padding: 6px 4px; color: ${t1.color};">${t1.displayName || t1.name} (T1)</th>
              <th style="padding: 6px 4px; color: ${t2.color};">${t2.displayName || t2.name} (T2)</th>
              <th style="padding: 6px 4px;">Delta (T2 - T1)</th>
              <th style="padding: 6px 4px;">Aggregate Summary</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 6px 4px; font-weight: 600;">Distance</td>
              <td style="padding: 6px 4px;">${(s1.totalDist / 1000).toFixed(2)} km</td>
              <td style="padding: 6px 4px;">${(s2.totalDist / 1000).toFixed(2)} km</td>
              <td style="padding: 6px 4px; font-weight: 600; color: ${Number(distDiff) >= 0 ? '#4ECDC4' : '#FF6B6B'};">${Number(distDiff) >= 0 ? '+' : ''}${distDiff} km</td>
              <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">${totalDist} km (Total)</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 6px 4px; font-weight: 600;">Elevation Gain</td>
              <td style="padding: 6px 4px;">${s1.elevGain.toFixed(0)} m</td>
              <td style="padding: 6px 4px;">${s2.elevGain.toFixed(0)} m</td>
              <td style="padding: 6px 4px; font-weight: 600; color: ${Number(eleDiff) >= 0 ? '#4ECDC4' : '#FF6B6B'};">${Number(eleDiff) >= 0 ? '+' : ''}${eleDiff} m</td>
              <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">${totalElev} m (Total)</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 6px 4px; font-weight: 600;">Duration</td>
              <td style="padding: 6px 4px;">${s1.duration ? fmtSecs(s1.duration / 1000) : '--'}</td>
              <td style="padding: 6px 4px;">${s2.duration ? fmtSecs(s2.duration / 1000) : '--'}</td>
              <td style="padding: 6px 4px;">--</td>
              <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">${fmtSecs(totalDur)} (Total)</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 6px 4px; font-weight: 600;">Avg / Max Power</td>
              <td style="padding: 6px 4px;">${s1.avgPower || 0} W / ${s1.maxPower || 0} W</td>
              <td style="padding: 6px 4px;">${s2.avgPower || 0} W / ${s2.maxPower || 0} W</td>
              <td style="padding: 6px 4px; font-weight: 600; color: ${Number(pwrDiff) >= 0 ? '#4ECDC4' : '#FF6B6B'};">${Number(pwrDiff) >= 0 ? '+' : ''}${pwrDiff} W (Avg)</td>
              <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">${avgPwr} W (Avg) / ${maxPwr} W (Max)</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 6px 4px; font-weight: 600;">Avg / Max HR</td>
              <td style="padding: 6px 4px;">${s1.avgHR || 0} bpm / ${s1.maxHR || 0} bpm</td>
              <td style="padding: 6px 4px;">${s2.avgHR || 0} bpm / ${s2.maxHR || 0} bpm</td>
              <td style="padding: 6px 4px; font-weight: 600; color: ${Number(hrDiff) >= 0 ? '#4ECDC4' : '#FF6B6B'};">${Number(hrDiff) >= 0 ? '+' : ''}${hrDiff} bpm (Avg)</td>
              <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">${avgHr} bpm (Avg) / ${maxHr} bpm (Max)</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 6px 4px; font-weight: 600;">Avg / Max Temp</td>
              <td style="padding: 6px 4px;">${s1.avgTemp != null ? s1.avgTemp.toFixed(1) : '--'} °C / ${s1.maxTemp != null ? s1.maxTemp.toFixed(1) : '--'} °C</td>
              <td style="padding: 6px 4px;">${s2.avgTemp != null ? s2.avgTemp.toFixed(1) : '--'} °C / ${s2.maxTemp != null ? s2.maxTemp.toFixed(1) : '--'} °C</td>
              <td style="padding: 6px 4px; font-weight: 600; color: ${Number(tempDiff) >= 0 ? '#4ECDC4' : '#FF6B6B'};">${Number(tempDiff) >= 0 ? '+' : ''}${tempDiff} °C (Avg)</td>
              <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">${avgTemp} °C (Avg) / ${maxTemp} °C (Max)</td>
            </tr>
            <tr>
              <td style="padding: 6px 4px; font-weight: 600;">Gear Shifts</td>
              <td style="padding: 6px 4px;">${s1.shifts || 0}</td>
              <td style="padding: 6px 4px;">${s2.shifts || 0}</td>
              <td style="padding: 6px 4px; font-weight: 600; color: ${shiftsDiff >= 0 ? '#4ECDC4' : '#FF6B6B'};">${shiftsDiff >= 0 ? '+' : ''}${shiftsDiff}</td>
              <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">${totalShifts} (Total)</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // Render UI with selectors and plot container
  container.innerHTML = `${summaryHtml}
    <div class="combined-controls" style="display: flex; align-items: center; padding: 6px 12px; gap: 12px; border-bottom: 1px solid var(--border); background: var(--bg); min-height: 40px; box-sizing: border-box;">
      <div class="selector-group" style="display: flex; align-items: center; gap: 6px;">
        <span class="material-symbols-rounded font-l" style="color: var(--text-muted);">arrow_forward</span>
        <span class="font-m" style="font-weight: 600; color: var(--text-muted);">X Axis:</span>
        <button id="btn-combined-x" class="sort-select-btn" style="min-width: 150px;">
          <span class="material-symbols-rounded" style="color: ${xDef.color}">${xDef.icon}</span>
          <span class="item-label">${xDef.label}</span>
          <span class="material-symbols-rounded arrow">expand_more</span>
        </button>
      </div>
      <div class="selector-group" style="display: flex; align-items: center; gap: 6px;">
        <span class="material-symbols-rounded font-l" style="color: var(--text-muted);">arrow_upward</span>
        <span class="font-m" style="font-weight: 600; color: var(--text-muted);">Y Axis:</span>
        <button id="btn-combined-y" class="sort-select-btn" style="min-width: 150px;">
          <span class="material-symbols-rounded" style="color: ${yDef.color}">${yDef.icon}</span>
          <span class="item-label">${yDef.label}</span>
          <span class="material-symbols-rounded arrow">expand_more</span>
        </button>
      </div>
      <div class="slider-group" style="display: flex; align-items: center; gap: 6px; flex: 1;">
        <span class="material-symbols-rounded font-l" style="color: var(--text-muted);">schedule</span>
        <span class="font-m" style="font-weight: 600; color: var(--text-muted);">Time:</span>
        <input type="range" id="combined-time-slider" min="0" max="100" value="0" style="flex: 1;">
        <span id="combined-time-val" class="font-s" style="color: var(--text); background: var(--surface3); padding: 3px 8px; border-radius: 12px; border: 1px solid var(--border); min-width: 65px; text-align: center; flex-shrink: 0;">0:00</span>
        <button id="btn-combined-play" class="sort-select-btn" style="padding: 4px; flex: 0 0 28px; height: 28px; width: 28px; justify-content: center;">
          <span class="material-symbols-rounded">play_arrow</span>
        </button>
      </div>
      <div class="toggle-group" style="display: flex; align-items: center; background: var(--surface3); border-radius: 4px; padding: 2px; border: 1px solid var(--border); flex-shrink: 0;">
        <button id="btn-combined-cart" class="sort-select-btn" style="width: 24px; height: 24px; border: none; background: ${!isPolar ? 'var(--theme-color)' : 'transparent'}; color: ${!isPolar ? 'white' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center;" title="Cartesian Coordinates">
          <span class="material-symbols-rounded font-l">grid_on</span>
        </button>
        <button id="btn-combined-polar" class="sort-select-btn" style="width: 24px; height: 24px; border: none; background: ${isPolar ? 'var(--theme-color)' : 'transparent'}; color: ${isPolar ? 'white' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center;" title="Polar Coordinates">
          <span class="material-symbols-rounded font-l">radar</span>
        </button>
      </div>
    </div>
    <div id="combined-plot-container" style="width: 100%; flex: 1; min-height: 0; background: var(--surface2); padding: 0; overflow: hidden;"></div>
  `;

  document.getElementById('btn-combined-x')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showMenu(e.currentTarget as HTMLElement, 'x');
  });

  document.getElementById('btn-combined-y')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showMenu(e.currentTarget as HTMLElement, 'y');
  });

  const slider = document.getElementById('combined-time-slider') as HTMLInputElement;
  const sliderVal = document.getElementById('combined-time-val');
  const playBtn = document.getElementById('btn-combined-play');

  slider?.addEventListener('input', () => {
    currentSliderIdx = parseInt(slider.value, 10);
    updateSliderLabel();
    if (plot) plot.redraw();
  });

  function startPlaying() {
    if (playBtn) playBtn.innerHTML = '<span class="material-symbols-rounded">pause</span>';

    playIntervalId = window.setInterval(() => {
      if (currentSliderIdx !== null && currentSliderIdx < currentChronoData.length - 1) {
        currentSliderIdx = Math.min(currentSliderIdx + 5, currentChronoData.length - 1);
        slider.value = `${currentSliderIdx}`;
        updateSliderLabel();
        if (plot) plot.redraw();
      } else {
        stopPlaying();
      }
    }, 20); // 50 fps
  }

  function stopPlaying() {
    if (playIntervalId) {
      clearInterval(playIntervalId);
      playIntervalId = null;
    }
    if (playBtn) playBtn.innerHTML = '<span class="material-symbols-rounded">play_arrow</span>';
  }

  playBtn?.addEventListener('click', () => {
    if (playIntervalId) {
      stopPlaying();
    } else {
      // If at the end, loop back to start
      if (currentSliderIdx !== null && currentSliderIdx >= currentChronoData.length - 1) {
        currentSliderIdx = 0;
        slider.value = '0';
        updateSliderLabel();
        if (plot) plot.redraw();
      }
      startPlaying();
    }
  });

  document.getElementById('btn-combined-cart')?.addEventListener('click', () => {
    if (isPolar) {
      isPolar = false;
      renderCombined(currentTrack);
    }
  });

  document.getElementById('btn-combined-polar')?.addEventListener('click', () => {
    if (!isPolar) {
      isPolar = true;
      renderCombined(currentTrack);
    }
  });

  updatePlot();
}

export function resizeCombined() {
  const container = document.getElementById('tab-combined');
  const plotContainer = document.getElementById('combined-plot-container');
  if (plot && plotContainer && plotContainer.clientWidth > 0) {
    const w = plotContainer.clientWidth;
    const h = plotContainer.clientHeight;

    if (w > 0 && h > 0) {
      if (isPolar) {
        const size = Math.min(w, h);
        plot.setSize({ width: size, height: size });
      } else {
        plot.setSize({ width: w, height: h });
      }
    }
  }
}

function showMenu(anchorEl: HTMLElement, axis: 'x' | 'y') {
  document.querySelectorAll('.metric-menu-popup').forEach((el) => el.remove());

  const popup = document.createElement('div');
  popup.className = 'metric-menu-popup';

  const metrics = ChartView.METRICS;
  const track = currentTrack;
  if (!track) return;

  const availableMetrics: string[] = [];
  for (const key in metrics) {
    const def = metrics[key];
    if (track.points.some((p) => (p as any)[def.field] != null)) availableMetrics.push(key);
  }

  availableMetrics.forEach((key) => {
    const def = metrics[key];
    const item = document.createElement('div');
    const currentVal = axis === 'x' ? xMetric : yMetric;
    item.className = `menu-item ${currentVal === key ? 'active' : ''}`;
    item.innerHTML = `
      <span class="material-symbols-rounded" style="color:${def.color}">${def.icon}</span>
      <span class="item-label">${def.label}</span>
      <span class="material-symbols-rounded check">${currentVal === key ? 'check' : ''}</span>
    `;
    item.addEventListener('click', () => {
      if (axis === 'x') xMetric = key;
      else yMetric = key;

      popup.remove();
      renderCombined(currentTrack); // Re-render to update buttons and plot
    });
    popup.appendChild(item);
  });

  const rect = anchorEl.getBoundingClientRect();
  popup.style.top = `${rect.bottom + 5}px`;
  popup.style.left = `${rect.left}px`;
  document.body.appendChild(popup);

  const close = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('click', close);
    }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

function updatePlot() {
  if (!currentTrack) return;
  const container = document.getElementById('combined-plot-container');
  if (!container) return;

  const metrics = ChartView.METRICS;
  const xDef = metrics[xMetric] || metrics.power;
  const yDef = metrics[yMetric] || metrics.hr;

  if (currentTracks.length >= 2) {
    const t1 = currentTracks[0];
    const t2 = currentTracks[1];

    const pts1 = t1.points;
    const pts2 = t2.points;
    const maxLen = Math.max(pts1.length, pts2.length);
    const xData: number[] = [];
    const yData1: (number | null)[] = [];
    const yData2: (number | null)[] = [];

    for (let i = 0; i < maxLen; i++) {
      xData.push(i);
      const p1 = pts1[i];
      const p2 = pts2[i];
      yData1.push(p1 && (p1 as any)[yDef.field] != null ? (p1 as any)[yDef.field] : null);
      yData2.push(p2 && (p2 as any)[yDef.field] != null ? (p2 as any)[yDef.field] : null);
    }

    if (plot) {
      plot.destroy();
      plot = null;
    }
    if (container.querySelector('.empty-text')) container.innerHTML = '';

    let width = container.clientWidth > 0 ? container.clientWidth : 800;
    let height = container.clientHeight > 0 ? container.clientHeight : 350;

    const opts: uPlot.Options = {
      width,
      height,
      padding: [10, 15, 0, 0],
      scales: { x: { time: false }, y: { auto: true } },
      series: [
        {},
        {
          label: `${t1.displayName || t1.name} (${yDef.label})`,
          stroke: t1.color || '#3b82f6',
          width: 2,
          points: { show: false },
        },
        {
          label: `${t2.displayName || t2.name} (${yDef.label})`,
          stroke: t2.color || '#FF6B35',
          width: 2,
          points: { show: false },
        },
      ],
      axes: [
        {
          side: 2,
          label: 'Elapsed Duration (s)',
          stroke: '#555564',
          grid: { stroke: '#2e2e34', width: 1 },
          font: '10px system-ui, sans-serif',
          size: 30,
        },
        {
          side: 3,
          label: `${yDef.label} (${yDef.unit})`,
          stroke: '#555564',
          grid: { stroke: '#2e2e34', width: 1 },
          font: '10px system-ui, sans-serif',
          size: 40,
        },
      ],
      legend: { show: true },
    };

    plot = new uPlot(opts, [xData, yData1, yData2], container as HTMLElement);
    resizeCombined();
    return;
  }

  const pts = currentTrack.points;
  const t0 = pts[0].time || 0;
  const chronoData = pts
    .map((p, idx) => [
      (p as any)[xDef.field],
      (p as any)[yDef.field],
      (p.time! - t0) / 1000,
      (p.dist || 0) / 1000,
      idx,
    ])
    .filter(([x, y, t, d]) => x != null && y != null) as [number, number, number, number, number][];

  if (chronoData.length === 0) {
    container.innerHTML =
      '<div class="empty-text" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-dim);">No data for selected metrics</div>';
    return;
  }

  if (isPolar) {
    const xVals = chronoData.map((d) => d[0]);
    const yVals = chronoData.map((d) => d[1]);
    const xMin = Math.min(...xVals);
    const xMax = Math.max(...xVals);
    const yMin = Math.min(...yVals);
    const yMax = Math.max(...yVals);

    currentChronoData = chronoData.map((d) => {
      const xVal = d[0];
      const yVal = d[1];
      const theta = ((xVal - xMin) / (xMax - xMin || 1)) * 2 * Math.PI;
      const r = (yVal - yMin) / (yMax - yMin || 1);
      const px = r * Math.cos(theta);
      const py = r * Math.sin(theta);
      return [px, py, d[2], d[3], d[4], xVal, yVal] as any;
    });
  } else {
    currentChronoData = chronoData.map((d) => [d[0], d[1], d[2], d[3], d[4], d[0], d[1]] as any);
  }

  // Update slider
  const slider = document.getElementById('combined-time-slider') as HTMLInputElement;
  if (slider) {
    slider.max = `${chronoData.length - 1}`;
    if (currentSliderIdx === null || currentSliderIdx >= chronoData.length) {
      currentSliderIdx = chronoData.length - 1;
      slider.value = slider.max;
    }
    updateSliderLabel();
  }

  // Sort by X for uPlot (with original point index tie-breaker)
  currentSortedData = [...currentChronoData].sort((a, b) => a[0] - b[0] || a[4] - b[4]);

  const xData = currentSortedData.map((d) => d[0]);
  const yData = currentSortedData.map((d) => d[1]);

  const plotContainer = document.getElementById('combined-plot-container');
  let width = plotContainer && plotContainer.clientWidth > 0 ? plotContainer.clientWidth : 600;
  let height = plotContainer && plotContainer.clientHeight > 0 ? plotContainer.clientHeight : 400;

  if (isPolar) {
    const size = Math.min(width, height > 0 ? height : width);
    width = size;
    height = size;

    if (plotContainer) {
      plotContainer.style.display = 'flex';
      plotContainer.style.alignItems = 'center';
      plotContainer.style.justifyContent = 'center';
    }
  } else if (plotContainer) {
    plotContainer.style.display = '';
    plotContainer.style.alignItems = '';
    plotContainer.style.justifyContent = '';
  }

  const opts: uPlot.Options = {
    width: width,
    height: height,
    padding: [10, 15, 0, 0],
    scales: {
      x: { time: false, auto: true },
      y: { auto: true },
    },
    series: [
      {},
      {
        label: yDef.label,
        width: 0,
        points: { show: true, size: 3, fill: hexToRgba(yDef.color, 0.3) },
      },
    ],
    axes: [
      {
        side: 2, // bottom
        show: !isPolar,
        label: `${xDef.label} (${xDef.unit})`,
        stroke: '#555564',
        grid: { stroke: '#2e2e34', width: 1 },
        font: '10px system-ui, sans-serif',
        values: (u, vals) => vals.map((v) => (v != null ? xDef.fmtAxis(v) : '')),
        size: 30,
      },
      {
        side: 3, // left
        show: !isPolar,
        label: `${yDef.label} (${yDef.unit})`,
        stroke: '#555564',
        grid: { stroke: '#2e2e34', width: 1 },
        font: '10px system-ui, sans-serif',
        values: (u, vals) => vals.map((v) => (v != null ? yDef.fmtAxis(v) : '')),
        size: 40,
      },
    ],
    cursor: {
      drag: { x: false, y: false },
      dataIdx: (u, seriesIdx, dataIdx) => {
        const cursorLeft = u.cursor.left;
        const cursorTop = u.cursor.top;
        if (cursorLeft != null && cursorTop != null && cursorLeft >= 0 && cursorTop >= 0) {
          let minD2 = Infinity;
          let closestIdx = -1;

          for (let i = 0; i < currentSortedData.length; i++) {
            const [xVal, yVal] = currentSortedData[i];
            const cx = u.valToPos(xVal, 'x');
            const cy = u.valToPos(yVal, 'y');

            const dx = cx - cursorLeft;
            const dy = cy - cursorTop;
            const d2 = dx * dx + dy * dy;

            if (d2 < minD2) {
              minD2 = d2;
              closestIdx = i;
            }
          }

          // Only snap if within a reasonable distance (e.g. 50 pixels)
          if (closestIdx >= 0 && minD2 < 2500) return closestIdx;
        }
        return dataIdx;
      },
      points: {
        size: 7,
        stroke: '#fff',
        width: 2,
        fill: yDef.color,
      },
    },
    legend: { show: false },
    hooks: {
      draw: [
        (u: uPlot) => {
          const ctx = u.ctx;
          const dpr = window.devicePixelRatio || 1;

          // Draw faint lines connecting points in chronological order
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1 * dpr;

          let started = false;
          for (let i = 0; i < currentChronoData.length; i++) {
            const [xVal, yVal] = currentChronoData[i];
            const cx = u.valToPos(xVal, 'x', true);
            const cy = u.valToPos(yVal, 'y', true);

            if (started) {
              ctx.lineTo(cx, cy);
            } else {
              ctx.moveTo(cx, cy);
              started = true;
            }
          }
          ctx.stroke();
          ctx.restore();

          // Draw trail if slider is active
          if (currentSliderIdx !== null) {
            ctx.save();
            const windowSize = 100; // Longer trail
            const startIdx = Math.max(0, currentSliderIdx - windowSize);
            const endIdx = currentSliderIdx;

            // 1. Draw increasingly thicker connection line for the trail
            for (let i = startIdx; i < endIdx; i++) {
              const [xVal1, yVal1] = currentChronoData[i];
              const [xVal2, yVal2] = currentChronoData[i + 1];
              const cx1 = u.valToPos(xVal1, 'x', true);
              const cy1 = u.valToPos(yVal1, 'y', true);
              const cx2 = u.valToPos(xVal2, 'x', true);
              const cy2 = u.valToPos(yVal2, 'y', true);

              const progress = (i - startIdx) / (endIdx - startIdx || 1);
              const lineWidth = 1 + 5 * progress; // Grow from 1 to 6
              const alpha = 0.15 + 0.6 * progress; // Fade from 0.15 to 0.75

              ctx.beginPath();
              ctx.moveTo(cx1, cy1);
              ctx.lineTo(cx2, cy2);
              ctx.strokeStyle = hexToRgba(yDef.color, alpha);
              ctx.lineWidth = lineWidth * dpr;
              ctx.stroke();
            }

            // 2. Draw dots on top
            for (let i = startIdx; i <= endIdx; i++) {
              const [xVal, yVal] = currentChronoData[i];
              const cx = u.valToPos(xVal, 'x', true);
              const cy = u.valToPos(yVal, 'y', true);

              const progress = (i - startIdx) / (endIdx - startIdx || 1);
              const size = 3 + 7 * progress; // Grow from 3 to 10
              const fillAlpha = 0.01 + 0.14 * progress; // Fade from 0.01 to 0.15

              ctx.beginPath();
              ctx.arc(cx, cy, size * dpr, 0, Math.PI * 2);
              ctx.fillStyle = hexToRgba(yDef.color, fillAlpha);
              ctx.fill();

              ctx.strokeStyle = yDef.color;
              ctx.lineWidth = 1 * dpr;
              ctx.stroke();
            }
            ctx.restore();
          }
        },
      ],
      setCursor: [
        (u: uPlot) => {
          const idx = u.cursor.idx;

          let tooltip = document.getElementById('combined-tooltip');
          if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'combined-tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'rgba(14, 14, 16, 0.9)';
            tooltip.style.color = '#fff';
            tooltip.style.padding = '8px 12px';
            tooltip.style.borderRadius = '4px';
            tooltip.classList.add('font-m');
            tooltip.style.fontFamily = 'system-ui';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            tooltip.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
            tooltip.style.border = '1px solid #2e2e34';
            document.body.appendChild(tooltip);
          }

          if (idx != null && currentSortedData[idx] && u.cursor.left! >= 0) {
            const d = currentSortedData[idx];
            const timeSecs = d[2];
            const distKm = d[3];
            const origX = d[5];
            const origY = d[6];

            tooltip.innerHTML = `
              <div style="color: #8a8a93; margin-bottom: 4px;">Point #${idx}</div>
              <div style="display: flex; justify-content: space-between; gap: 15px;">
                <span>Time:</span>
                <span style="font-weight: bold;">${fmtSecs(timeSecs)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 15px;">
                <span>Distance:</span>
                <span style="font-weight: bold;">${distKm.toFixed(2)} km</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 15px;">
                <span>${xDef.label}:</span>
                <span style="font-weight: bold;">${xDef.fmtAxis(origX)} ${xDef.unit}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 15px;">
                <span>${yDef.label}:</span>
                <span style="font-weight: bold; color: ${yDef.color}">${yDef.fmtAxis(origY)} ${yDef.unit}</span>
              </div>
            `;
            tooltip.style.display = 'block';

            const canvasRect = u.over.getBoundingClientRect();
            tooltip.style.left = `${canvasRect.left + window.scrollX + u.cursor.left! + 15}px`;
            tooltip.style.top = `${canvasRect.top + window.scrollY + u.cursor.top! + 15}px`;
          } else {
            tooltip.style.display = 'none';
          }
        },
      ],
    },
  };

  // Clear container before rendering (except when uPlot does it)
  // uPlot handles its own canvas, but we need to clear any previous empty state message
  if (container.querySelector('.empty-text')) container.innerHTML = '';

  if (plot) plot.destroy();

  plot = new uPlot(opts, [xData, yData], container);

  plot.over.addEventListener('click', () => {
    if (plot) {
      const idx = plot.cursor.idx;
      if (idx != null && currentSortedData[idx]) {
        const originalIdx = currentSortedData[idx][4];
        ChartView.setCursorAt(originalIdx);
      }
    }
  });

  // Ensure initial size is set synchronously
  resizeCombined();
}
