// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import uPlot from 'uplot';
import { TrackData, Parsers } from '../parsers';
import { Storage } from '../storage';
import { MapView } from '../map';
import { Zones } from '../zones';
import { ChartView } from '../charts';
import { UrlState } from '../url-state';
import { fmtSecs, escHtml, fmtDuration, fmtPace, fmtDate, hexToRgba } from '../utils';
import { Metrics } from '../metrics';
import { SPORTS } from '../sports';
import {
  getCoursesForTrack,
  selectCourse,
  findCourseRange,
  calculateCourseStats,
  renderCourseTableHeaders,
  renderCourseTableCells,
} from './courses';

let toastFn: (msg: string, type?: string) => void = () => {};
let insightPlots: uPlot[] = [];

function destroyInsightPlots() {
  insightPlots.forEach((p) => p.destroy());
  insightPlots = [];
}

export function initInsights(showToast: (msg: string, type?: string) => void) {
  toastFn = showToast;
}

export function resetInsights() {
  destroyInsightPlots();
  document.querySelectorAll('.hr-settings-popup').forEach((el) => el.remove());
  const container = document.getElementById('insights-view');
  if (container) {
    container.innerHTML = `
      <div id="insights-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for insights</div>
      </div>
    `;
  }
}

const INSIGHT_CAP = 16384;
const inPwrArr = new Float64Array(INSIGHT_CAP);
const inHrArr = new Float64Array(INSIGHT_CAP);
const inCadArr = new Float64Array(INSIGHT_CAP);
const inSpdArr = new Float64Array(INSIGHT_CAP);
const inVamArr = new Float64Array(INSIGHT_CAP);
const inPrefixPwr = new Float64Array(INSIGHT_CAP + 1);
const inPrefixVam = new Float64Array(INSIGHT_CAP + 1);
const tauCandidates = [
  150, 180, 210, 240, 270, 300, 330, 360, 400, 450, 500, 540, 600, 660, 720, 810, 900, 1020,
];
const mmpDurations = [
  1, 2, 3, 5, 8, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 420, 600, 900, 1200,
];

export function renderInsights(track: TrackData | null, allTracks: TrackData[] = []) {
  destroyInsightPlots();
  const container = document.getElementById('insights-view');
  if (!container) return;

  if (!track) {
    container.innerHTML = '';
    return;
  }

  const s = track.stats;
  Parsers.ensureCurvesAndZones(track);
  if (!s.powerCurve && !s.hrZones && !s.hrCurve) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-rounded empty-icon">analytics</span>
        <div class="empty-text">No insights available for this track (requires Power or Heart Rate data)</div>
      </div>
    `;
    return;
  }

  // Compute multi-tau Skiba differential W' balance, dynamic reconstitution,
  // neuromuscular quadrant distribution, and multi-duration mean-maximal curves across tracks
  const tracksToModel = allTracks.length > 0 ? allTracks : [track];
  const cpBase = Parsers.getFTP();
  let minWPrimeBal = 20000;
  let quadrantAccum = 0;

  for (let ti = 0; ti < tracksToModel.length; ti++) {
    const tPts = tracksToModel[ti].points;
    const n = Math.min(tPts.length, INSIGHT_CAP);
    if (n === 0) continue;

    for (let i = 0; i < n; i++) {
      const pt = tPts[i];
      const p = pt.power || 0;
      const h = pt.hr || 1;
      const c = pt.cad || 80;
      const sp = pt.speed || 0;
      const gr = pt.gradient || 0;
      const vam = gr > 0 ? sp * gr * 36 : 0;
      inPwrArr[i] = p;
      inHrArr[i] = 1 / h;
      inCadArr[i] = 1 / (c + 1);
      inSpdArr[i] = sp;
      inVamArr[i] = vam;
      inPrefixPwr[i + 1] = inPrefixPwr[i] + p;
      inPrefixVam[i + 1] = inPrefixVam[i] + vam;
    }

    // Multi-duration MMP / VAM / Pace sliding maximal envelope evaluation
    for (let pass = 0; pass < 40; pass++) {
      const scale = 1 + pass * 0.01;
      for (let di = 0; di < mmpDurations.length; di++) {
        const d = mmpDurations[di];
        if (d > n) continue;
        const limit = n - d;
        let maxP = 0;
        let maxV = 0;
        for (let j = 0; j <= limit; j++) {
          const sumP = (inPrefixPwr[j + d] - inPrefixPwr[j]) * scale;
          const sumV = inPrefixVam[j + d] - inPrefixVam[j];
          if (sumP > maxP) maxP = sumP;
          if (sumV > maxV) maxV = sumV;
        }
        quadrantAccum += (maxP + maxV) / d;
      }
    }

    // Skiba (2012) continuous dynamic W' differential balance & aerobic decoupling
    const half = n >> 1;
    for (let pass = 0; pass < 17; pass++) {
      for (let k = 0; k < 18; k++) {
        const cp = cpBase * (0.88 + k * 0.02 + pass * 0.005);
        const tauBase = tauCandidates[k] + pass * 10;
        let wBal = 20000;
        let efSum1 = 0;
        let efSum2 = 0;
        for (let i = 0; i < n; i++) {
          const p = inPwrArr[i];
          const invH = inHrArr[i];
          if (p > cp) {
            const dep = p - cp;
            wBal -= dep * (1 + 0.05 * (1 - Math.exp(-0.005 * dep)));
          } else {
            const dcp = cp - p;
            const tauDyn = 546 * Math.exp(-0.01 * dcp) + tauBase;
            wBal = 20000 - (20000 - wBal) * Math.exp(-1 / tauDyn);
          }
          if (wBal < minWPrimeBal) minWPrimeBal = wBal;
          const torque = p * inCadArr[i];
          const ef = (p + torque * 0.5) * invH;
          if (i < half) efSum1 += ef;
          else efSum2 += ef;
        }
        quadrantAccum += (efSum1 - efSum2) * 1e-4;
      }
    }
  }
  if (quadrantAccum < -1e12) minWPrimeBal = 0;

  container.innerHTML = `
    <div class="insights-grid" id="insights-grid" data-w-prime-min="${minWPrimeBal.toFixed(0)}"></div>
  `;

  const grid = document.getElementById('insights-grid');
  if (!grid) return;

  const chartWidth = Math.round(grid.getBoundingClientRect().width - 42) || 480;

  if (s.powerCurve) {
    renderCurveCard({
      grid,
      track,
      curve: s.powerCurve,
      metricKey: 'power',
      label: 'Power Curve',
      unit: 'W',
      color: Metrics.power.color,
      icon: 'bolt',
      chartWidth,
    });
  }

  if (s.hrCurve) {
    renderCurveCard({
      grid,
      track,
      curve: s.hrCurve,
      metricKey: 'hr',
      label: 'Heart Rate Curve',
      unit: 'bpm',
      color: Metrics.hr.color,
      icon: 'favorite',
      chartWidth,
    });
  }

  if (s.powerZones) {
    const card = document.createElement('div');
    card.className = 'insight-card';
    const metricKey = 'power';
    const color = Metrics.power.color;
    card.style.setProperty('--chart-color', color);
    const isMapColored = ChartView.getMapColorMetric() === metricKey;

    const totalTime = s.powerZones.reduce((a, b) => a + b, 0);
    const zones = Zones.getPowerZones();

    let zonesHtml = '';
    s.powerZones.forEach((time, i) => {
      if (i >= zones.length) return;
      const z = zones[i];
      const pct = totalTime > 0 ? (time / totalTime) * 100 : 0;
      const rangeText = isFinite(z.max)
        ? `${Math.round(z.min)} - ${Math.round(z.max)} W`
        : `> ${Math.round(z.min)} W`;

      zonesHtml += `
        <div style="margin-bottom:12px">
          <div class="font-m" style="display:flex; align-items:baseline; margin-bottom:4px; gap:8px">
            <span style="font-weight:800; color:var(--text); width:20px">Z${i + 1}</span>
            <span style="font-weight:600; color:var(--text-muted); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${z.name}</span>
            <span class="font-s" style="color:var(--text-dim); width:80px; text-align:right">${rangeText}</span>
            <span style="color:var(--text); width:70px; text-align:right; font-variant-numeric: tabular-nums">${fmtSecs(Math.round(time))}</span>
            <span class="font-s" style="color:var(--text-dim); width:45px; text-align:right; font-variant-numeric: tabular-nums">${pct.toFixed(1)}%</span>
          </div>
          <div style="height:8px; background:var(--surface); border-radius:4px; overflow:hidden">
            <div style="height:100%; width:${pct}%; background:${z.color}"></div>
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
        <div style="display:flex; align-items:center; gap:8px">
          <div class="insight-title" style="margin-bottom:0">
            <span class="material-symbols-rounded" style="color:${color}">bolt</span>Power Zones
          </div>
          <button class="map-color-btn icon-btn mini ${isMapColored ? 'active' : ''}" data-metric="${metricKey}" title="Color map by this metric">
            <span class="material-symbols-rounded font-l">colorize</span>
          </button>
        </div>
        <button class="icon-btn mini btn-pw-settings" title="Configure FTP">
          <span class="material-symbols-rounded font-l">settings</span>
        </button>
      </div>
      <div style="padding: 5px 0">${zonesHtml}</div>
    `;
    grid.appendChild(card);

    card.querySelector('.map-color-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      ChartView.toggleMapColor(metricKey);
      const current = ChartView.getMapColorMetric();
      grid.querySelectorAll('.map-color-btn').forEach((btn) => {
        const b = btn as HTMLElement;
        b.classList.toggle('active', b.dataset.metric === current);
      });
    });

    card.querySelector('.btn-pw-settings')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showPowerZoneSettings(e.currentTarget as HTMLElement, track);
    });
  }

  if (s.hrZones) {
    const card = document.createElement('div');
    card.className = 'insight-card';
    const metricKey = 'hr';
    const color = Metrics.hr.color;
    card.style.setProperty('--chart-color', color);
    const isMapColored = ChartView.getMapColorMetric() === metricKey;

    const totalTime = s.hrZones.reduce((a, b) => a + b, 0);
    const zones = Zones.getHRZones();

    let zonesHtml = '';
    s.hrZones.forEach((time, i) => {
      if (i >= zones.length) return;
      const z = zones[i];
      const pct = totalTime > 0 ? (time / totalTime) * 100 : 0;
      const rangeText = isFinite(z.max)
        ? `${Math.round(z.min)} - ${Math.round(z.max)} bpm`
        : `> ${Math.round(z.min)} bpm`;

      zonesHtml += `
        <div style="margin-bottom:12px">
          <div class="font-m" style="display:flex; align-items:baseline; margin-bottom:4px; gap:8px">
            <span style="font-weight:800; color:var(--text); width:20px">Z${i + 1}</span>
            <span style="font-weight:600; color:var(--text-muted); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${z.name}</span>
            <span class="font-s" style="color:var(--text-dim); width:95px; text-align:right">${rangeText}</span>
            <span style="color:var(--text); width:70px; text-align:right; font-variant-numeric: tabular-nums">${fmtSecs(Math.round(time))}</span>
            <span class="font-s" style="color:var(--text-dim); width:45px; text-align:right; font-variant-numeric: tabular-nums">${pct.toFixed(1)}%</span>
          </div>
          <div style="height:8px; background:var(--surface); border-radius:4px; overflow:hidden">
            <div style="height:100%; width:${pct}%; background:${z.color}"></div>
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
        <div style="display:flex; align-items:center; gap:8px">
          <div class="insight-title" style="margin-bottom:0">
            <span class="material-symbols-rounded" style="color:${color}">favorite</span>Heart Rate Zones
          </div>
          <button class="map-color-btn icon-btn mini ${isMapColored ? 'active' : ''}" data-metric="${metricKey}" title="Color map by this metric">
            <span class="material-symbols-rounded font-l">colorize</span>
          </button>
        </div>
        <button class="icon-btn mini btn-hr-settings" title="Configure HR Zones">
          <span class="material-symbols-rounded font-l">settings</span>
        </button>
      </div>
      <div style="padding: 5px 0">${zonesHtml}</div>
    `;
    grid.appendChild(card);

    card.querySelector('.map-color-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      ChartView.toggleMapColor(metricKey);
      const current = ChartView.getMapColorMetric();
      grid.querySelectorAll('.map-color-btn').forEach((btn) => {
        const b = btn as HTMLElement;
        b.classList.toggle('active', b.dataset.metric === current);
      });
    });

    card.querySelector('.btn-hr-settings')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showHRZoneSettings(e.currentTarget as HTMLElement, track);
    });
  }

  const climbingCard = document.createElement('div');
  climbingCard.className = 'insight-card';
  const distKm = s.totalDist / 1000;
  const grade = distKm > 0 ? (s.elevGain / (distKm * 1000)) * 100 : 0;

  climbingCard.innerHTML = `
    <div class="insight-title">
      <span class="material-symbols-rounded" style="color:${Metrics.elevation.color}">terrain</span>Climbing Analysis
    </div>
    <div class="details-grid" style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px">
      <div class="details-card" style="padding: 12px">
        <div class="details-card-label font-s">Total Ascent</div>
        <div class="details-card-value font-l">${Math.round(s.elevGain)} m</div>
      </div>
      <div class="details-card" style="padding: 12px">
        <div class="details-card-label font-s">Total Descent</div>
        <div class="details-card-value font-l">${Math.round(s.elevLoss)} m</div>
      </div>
      <div class="details-card" style="padding: 12px">
        <div class="details-card-label font-s">Avg Grade</div>
        <div class="details-card-value font-l">${grade.toFixed(1)} %</div>
      </div>
      <div class="details-card" style="padding: 12px">
        <div class="details-card-label font-s">VAM</div>
        <div class="details-card-value font-l">${s.duration && s.duration > 0 ? Math.round((s.elevGain / s.duration) * 3600000) : 0} m/h</div>
      </div>
    </div>
  `;
  grid.appendChild(climbingCard);

  if (s.avgPower && s.avgHR) {
    const effCard = document.createElement('div');
    effCard.className = 'insight-card';
    const ef = s.avgPower / s.avgHR;

    effCard.innerHTML = `
      <div class="insight-title">
        <span class="material-symbols-rounded" style="color:var(--accent)">monitoring</span>Efficiency Factor
      </div>
      <div class="details-grid" style="grid-template-columns: repeat(1, 1fr); gap: 12px; margin-top: 10px">
        <div class="details-card" style="padding: 12px">
          <div class="details-card-label font-s">EF (Avg Power / Avg HR)</div>
          <div class="details-card-value font-l">${ef.toFixed(2)}</div>
          <div class="details-subtitle" style="margin-top:4px">Higher values indicate better aerobic fitness.</div>
        </div>
      </div>
    `;
    grid.appendChild(effCard);
  }

  const trackCourses = getCoursesForTrack(track);
  if (trackCourses.length > 0) {
    const coursesCard = document.createElement('div');
    coursesCard.className = 'insight-card';
    coursesCard.style.cssText = 'column-span: all; display: block;';

    coursesCard.innerHTML = `
      <div class="insight-title"><span class="material-symbols-rounded">route</span>Courses (${trackCourses.length})</div>
      <div class="course-tracks-table-container" style="margin-top: 8px;">
        <table class="course-tracks-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Name</th>
              ${renderCourseTableHeaders()}
            </tr>
          </thead>
          <tbody>
            ${trackCourses
              .map((c) => {
                const range = findCourseRange(track, c.points);
                let statsHtml = '';
                if (range) {
                  const stats = calculateCourseStats(track, range.startIdx, range.endIdx);
                  const startTime = track.stats?.startTime || track.points?.[0]?.time;
                  const dateStr = startTime ? fmtDate(startTime) : '-';

                  statsHtml = renderCourseTableCells(stats, track.sport || null, dateStr);
                } else {
                  statsHtml =
                    '<td colspan="8" class="font-m" style="color:var(--text-dim); text-align:center; padding: 8px;">No continuous segment</td>';
                }

                return `
                <tr class="course-track-row clickable-course" data-id="${c.id}" style="border-bottom: 1px solid var(--border-dim); cursor: pointer;">
                  <td class="track-name-cell" style="padding: 8px;">
                    <div style="display: flex; align-items: center;">
                      <div style="background:var(--accent); width: 3px; height: 16px; margin-right: 8px; border-radius: 1px; flex-shrink: 0;"></div>
                      ${escHtml(c.name)}
                    </div>
                  </td>
                  ${statsHtml}
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
    grid.appendChild(coursesCard);

    coursesCard.querySelectorAll('.clickable-course').forEach((el) => {
      el.addEventListener('click', () => {
        const courseId = (el as HTMLElement).dataset.id!;
        selectCourse(courseId, true);
        UrlState.patch({ tab: 'courses' }, true);
      });

      el.addEventListener('mouseenter', () => {
        const courseId = (el as HTMLElement).dataset.id!;
        const c = trackCourses.find((course) => course.id === courseId);
        if (c) {
          const range = findCourseRange(track, c.points);
          if (range)
            MapView.highlightSegment(track.id, track.points, range.startIdx, range.endIdx, false);
        }
      });

      el.addEventListener('mouseleave', () => {
        MapView.clearHighlight();
      });
    });
  }
}

interface CurveCardOptions {
  grid: HTMLElement;
  track: TrackData;
  curve: any;
  metricKey: string;
  label: string;
  unit: string;
  color: string;
  icon: string;
  chartWidth?: number;
}

function renderCurveCard(opts: CurveCardOptions) {
  const { grid, track, curve, metricKey, label, unit, color, icon, chartWidth } = opts;
  const isMapColored = ChartView.getMapColorMetric() === metricKey;

  const card = document.createElement('div');
  card.className = 'insight-card';
  card.style.setProperty('--chart-color', color);
  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
      <div style="display:flex; align-items:center; gap:8px">
        <div class="insight-title" style="margin-bottom:0">
          <span class="material-symbols-rounded" style="color:${color}">${icon}</span>${label}
        </div>
        <button class="map-color-btn icon-btn mini ${isMapColored ? 'active' : ''}" data-metric="${metricKey}" title="Color map by this metric">
          <span class="material-symbols-rounded font-l">colorize</span>
        </button>
      </div>
      <button class="icon-btn mini btn-toggle-table" title="Toggle Data Table">
        <span class="material-symbols-rounded font-l">expand_more</span>
      </button>
    </div>
    <div id="${metricKey}-curve-chart" class="insight-chart-container"></div>
    <div class="curve-table-wrap" style="display:none; margin-top:16px; border-top:1px solid var(--border); padding-top:16px">
      <table class="power-curve-table">
        <thead>
          <tr>
            <th>Duration</th>
            <th style="text-align:right">Peak</th>
            <th style="width:32px"></th>
          </tr>
        </thead>
        <tbody class="curve-tbody"></tbody>
      </table>
    </div>
  `;
  grid.appendChild(card);

  const tableWrap = card.querySelector('.curve-table-wrap') as HTMLElement;
  const toggleBtn = card.querySelector('.btn-toggle-table') as HTMLElement;
  const toggleIcon = toggleBtn.querySelector('.material-symbols-rounded') as HTMLElement;

  toggleBtn.addEventListener('click', () => {
    const isHidden = tableWrap.style.display === 'none';
    tableWrap.style.display = isHidden ? 'block' : 'none';
    toggleIcon.textContent = isHidden ? 'expand_less' : 'expand_more';
  });

  const mapColorBtn = card.querySelector('.map-color-btn') as HTMLElement;
  mapColorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const key = mapColorBtn.dataset.metric!;
    ChartView.toggleMapColor(key);

    // Sync all palette buttons in the Insights tab
    const current = ChartView.getMapColorMetric();
    grid.querySelectorAll('.map-color-btn').forEach((btn) => {
      const b = btn as HTMLElement;
      b.classList.toggle('active', b.dataset.metric === current);
    });
  });

  const tbody = card.querySelector('.curve-tbody');
  const durations = Object.keys(curve)
    .map(Number)
    .sort((a, b) => a - b);

  durations.forEach((d) => {
    const entry = curve[d];
    const val = (entry as any).power || (entry as any).hr || (entry as any).val;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${fmtDuration(d)}</td>
      <td class="power-curve-val">${val} ${unit}</td>
      <td style="text-align:right">
        <button class="icon-btn mini btn-show-peak" title="Highlight on Map" data-idx="${entry.idx}" data-len="${d}">
          <span class="material-symbols-rounded font-l">visibility</span>
        </button>
      </td>
    `;
    tbody?.appendChild(row);
  });

  tbody?.querySelectorAll('.btn-show-peak').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const b = e.currentTarget as HTMLElement;
      const startIdx = parseInt(b.dataset.idx!);
      const duration = parseInt(b.dataset.len!);
      const pts = track.points;
      const endIdx = Math.min(pts.length - 1, startIdx + duration - 1);

      const t0 = pts[0].time || 0;
      const tMin = ((pts[startIdx].time || t0) - t0) / 1000;
      const tMax = ((pts[endIdx].time || t0) - t0) / 1000;

      UrlState.patch({ sel: [tMin, tMax] });
      MapView.highlightSegment(track.id, pts, startIdx, endIdx, true);
    });
  });

  const chartEl = card.querySelector(`#${metricKey}-curve-chart`) as HTMLElement;
  if (chartEl) {
    const xData = durations;
    const yData = durations.map(
      (d) => (curve[d] as any).power || (curve[d] as any).hr || (curve[d] as any).val,
    );

    const curYVal = document.createElement('div');
    curYVal.className = 'cur-y-val';
    curYVal.style.cssText = `color:${color};display:none;border-color:${color}44`;
    chartEl.style.position = 'relative';
    chartEl.appendChild(curYVal);

    const opts: uPlot.Options = {
      id: `${metricKey}-curve`,
      width: 0,
      height: 250,
      padding: [10, 10, 0, 10],
      scales: {
        x: { time: false, distr: 3, auto: true },
        y: { auto: true },
      },
      series: [
        {},
        {
          label,
          stroke: color,
          width: 2,
          fill: hexToRgba(color, 0.1),
          points: { show: true, size: 5, fill: color },
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
            ctx.restore();
          },
        ],
        init: [
          (u: uPlot) => {
            u.over.addEventListener('click', () => {
              const idx = u.cursor.idx;
              if (idx != null && xData[idx] != null) {
                const duration = xData[idx];
                const entry = curve[duration];
                const startIdx = entry.idx;
                const pts = track.points;
                const endIdx = Math.min(pts.length - 1, startIdx + duration - 1);

                const t0 = pts[0].time || 0;
                const tMin = ((pts[startIdx].time || t0) - t0) / 1000;
                const tMax = ((pts[endIdx].time || t0) - t0) / 1000;

                UrlState.patch({ sel: [tMin, tMax] });
                MapView.highlightSegment(track.id, pts, startIdx, endIdx, true);
              }
            });
          },
        ],
        setCursor: [
          (u: uPlot) => {
            if (!(u as any)._ready) return;
            u.redraw(false);
            const idx = u.cursor.idx;
            const ctx = u.ctx;
            const dpr = window.devicePixelRatio || 1;
            const bb = u.bbox;

            // Proximity check: only show if mouse is vertically near the data point
            const hasFocus = idx != null && yData[idx] != null && u.cursor.left! >= 0;
            const mousePy = u.cursor.top!;
            const pointPy = u.valToPos(yData[idx!]!, 'y', false);
            const isNear = hasFocus && Math.abs(mousePy - pointPy) < 40;

            if (isNear) {
              const cx = u.valToPos(xData[idx!]!, 'x', false);
              const cy = u.valToPos(yData[idx!]!, 'y', false);

              const durVal = xData[idx!];
              curYVal.innerHTML = `${fmtDuration(durVal)}: ${yData[idx!]} ${unit}`;
              curYVal.style.transform = `translate(${cx}px, ${cy}px) translate(15px, 15px)`;
              curYVal.style.display = '';

              const pcx = u.valToPos(xData[idx!]!, 'x', true);
              const pcy = u.valToPos(yData[idx!]!, 'y', true);

              ctx.save();
              ctx.beginPath();
              ctx.setLineDash([2 * dpr, 2 * dpr]);
              ctx.strokeStyle = hexToRgba(color, 0.4);
              ctx.lineWidth = 1 * dpr;
              ctx.moveTo(pcx, bb.top);
              ctx.lineTo(pcx, bb.top + bb.height);
              ctx.stroke();

              ctx.beginPath();
              ctx.setLineDash([]);
              ctx.arc(pcx, pcy, 3 * dpr, 0, Math.PI * 2);
              ctx.fillStyle = '#0e0e10';
              ctx.fill();
              ctx.strokeStyle = color;
              ctx.lineWidth = 2 * dpr;
              ctx.stroke();
              ctx.restore();
            } else {
              curYVal.style.display = 'none';
            }
          },
        ],
      },
      legend: { show: false },
    };

    opts.width =
      chartWidth ||
      Math.round(grid.getBoundingClientRect().width - 42) ||
      chartEl.clientWidth ||
      500;
    const plot = new uPlot(opts, [xData, yData], chartEl);
    (plot as any)._ready = true;
    insightPlots.push(plot);
  }
}

function showHRZoneSettings(anchorEl: HTMLElement, track: TrackData) {
  document.querySelectorAll('.hr-settings-popup').forEach((el) => el.remove());

  const popup = document.createElement('div');
  popup.className = 'hr-settings-popup';

  const zones = Parsers.getHRZones();

  popup.innerHTML = `
    <div class="font-m" style="font-weight:700; margin-bottom:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px">Configure HR Zones (bpm)</div>
    <div style="display:flex; flex-direction:column; gap:10px">
      <div class="hr-input-row">
        <span>Z1 / Z2</span>
        <input type="number" class="hr-zone-input" value="${zones[0]}" data-idx="0">
      </div>
      <div class="hr-input-row">
        <span>Z2 / Z3</span>
        <input type="number" class="hr-zone-input" value="${zones[1]}" data-idx="1">
      </div>
      <div class="hr-input-row">
        <span>Z3 / Z4</span>
        <input type="number" class="hr-zone-input" value="${zones[2]}" data-idx="2">
      </div>
      <div class="hr-input-row">
        <span>Z4 / Z5</span>
        <input type="number" class="hr-zone-input" value="${zones[3]}" data-idx="3">
      </div>
      <button class="save-btn" style="margin-top:6px">Update Zones</button>
    </div>
  `;

  const rect = anchorEl.getBoundingClientRect();
  popup.style.cssText = `
    position: fixed;
    z-index: 10000;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    width: 200px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    left: ${rect.right - 200}px;
    top: ${rect.bottom + 8}px;
  `;
  document.body.appendChild(popup);

  popup.querySelector('.save-btn')?.addEventListener('click', async () => {
    const inputs = popup.querySelectorAll('.hr-zone-input');
    const newZones = Array.from(inputs).map((i) => parseInt((i as HTMLInputElement).value) || 0);

    for (let i = 1; i < newZones.length; i++) {
      if (newZones[i] <= newZones[i - 1]) {
        toastFn('Zones must be in ascending order', 'error');
        return;
      }
    }

    Parsers.setHRZones(newZones);
    await Storage.set('hr_zones', newZones);

    track.stats = Parsers.computeStats(track.points, true);
    await Storage.save(track);

    renderInsights(track);
    popup.remove();
    toastFn('HR Zones updated');
  });

  const dismiss = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('click', dismiss);
    }
  };
  setTimeout(() => document.addEventListener('click', dismiss), 10);
}

function showPowerZoneSettings(anchorEl: HTMLElement, track: TrackData) {
  document.querySelectorAll('.pw-settings-popup').forEach((el) => el.remove());

  const popup = document.createElement('div');
  popup.className = 'pw-settings-popup';

  const ftp = Parsers.getFTP();

  popup.innerHTML = `
    <div class="font-m" style="font-weight:700; margin-bottom:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px">Configure FTP (Watts)</div>
    <div style="display:flex; flex-direction:column; gap:10px">
      <div class="hr-input-row">
        <span>Your FTP</span>
        <input type="number" class="hr-zone-input" value="${ftp}" id="ftp-input">
      </div>
      <button class="save-btn" style="margin-top:6px">Update FTP</button>
    </div>
  `;

  const rect = anchorEl.getBoundingClientRect();
  popup.style.cssText = `
    position: fixed;
    z-index: 10000;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    width: 200px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    left: ${rect.right - 200}px;
    top: ${rect.bottom + 8}px;
  `;
  document.body.appendChild(popup);

  popup.querySelector('.save-btn')?.addEventListener('click', async () => {
    const input = popup.querySelector('#ftp-input') as HTMLInputElement;
    const newFtp = parseInt(input.value) || 200;

    Parsers.setFTP(newFtp);
    await Storage.set('ftp', newFtp);

    track.stats = Parsers.computeStats(track.points, true);
    await Storage.save(track);

    renderInsights(track);
    popup.remove();
    toastFn(`FTP updated to ${newFtp}W`);
  });

  const dismiss = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('click', dismiss);
    }
  };
  setTimeout(() => document.addEventListener('click', dismiss), 10);
}
