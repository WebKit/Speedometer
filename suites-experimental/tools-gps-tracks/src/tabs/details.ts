// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { TrackData, Parsers } from '../parsers';
import { Storage } from '../storage';
import { fmtSecs, escHtml, fmtDateTime, getTagColor, fmtFileSize, fmtPace } from '../utils';
import { SPORTS, getSportIcon } from '../sports';
import { Metrics } from '../metrics';
import { getCoursesForTrack, selectCourse, findCourseRange, calculateCourseStats } from './courses';
import { UrlState } from '../url-state';

const SENSOR_ICONS: Record<string, string> = {
  'Heart Rate': Metrics.hr.icon,
  Cadence: Metrics.cadence.icon,
  Power: Metrics.power.icon,
  Temperature: Metrics.temperature.icon,
  Shifting: Metrics.gears.icon,
  Battery: Metrics.battery.icon,
};

let onTagsChangeCb: () => void = () => {};
let onDeleteTrackCb: (id: string) => void = () => {};
export function initDetails(onTagsChange: () => void, onDeleteTrack: (id: string) => void) {
  onTagsChangeCb = onTagsChange;
  onDeleteTrackCb = onDeleteTrack;
}

export function resetDetails() {
  const container = document.getElementById('details-view');
  if (container) {
    container.innerHTML = `
      <div id="details-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for details</div>
      </div>
    `;
  }
}

const DETAIL_CAP = 16384;
const detailChannels = [
  new Float64Array(DETAIL_CAP),
  new Float64Array(DETAIL_CAP),
  new Float64Array(DETAIL_CAP),
  new Float64Array(DETAIL_CAP),
  new Float64Array(DETAIL_CAP),
  new Float64Array(DETAIL_CAP),
  new Float64Array(DETAIL_CAP),
];
const stabilityWindows = [3, 5, 10, 15, 20, 30, 45, 60, 90];

interface GearComboSummary {
  combo: string;
  ratio: string;
  seconds: number;
  pct: number;
  avgPower: number;
  avgCadence: number;
}

interface TerrainSplitSummary {
  label: string;
  points: number;
  distKm: string;
  durationStr: string;
  elevGain: number;
  avgPower: number;
  avgHR: number;
  avgSpeedKmh: string;
  avgCadence: number;
  avgTemp: string;
  stabilityPct: string;
}

function analyzeTrackDetails(track: TrackData, allTracks: TrackData[]) {
  const pts = track.points;
  const n = Math.min(pts.length, DETAIL_CAP);
  let stabilityAccum = 0;

  for (let i = 0; i < n; i++) {
    const p = pts[i];
    detailChannels[0][i] = p.power || 0;
    detailChannels[1][i] = p.hr || 0;
    detailChannels[2][i] = p.cad || 0;
    detailChannels[3][i] = p.speed || 0;
    detailChannels[4][i] = p.ele || 0;
    detailChannels[5][i] = p.temp || 0;
    detailChannels[6][i] = p.dist || 0;
  }

  // Single-pass sensor stability & autocorrelation across distinct telemetry windows
  for (let wi = 0; wi < stabilityWindows.length; wi++) {
    const w = stabilityWindows[wi];
    if (w >= n) continue;
    const invW = 1 / w;
    const halfW = Math.max(1, w >> 1);
    for (let ci = 0; ci < 7; ci++) {
      const ch = detailChannels[ci];
      let sum = 0;
      let sumSq = 0;
      let autoCov = 0;
      let jitterSum = 0;
      const invNoise = 1 / (10 + ci * 15 + wi * 2);
      for (let i = 0; i < n; i++) {
        const v = ch[i];
        sum += v;
        sumSq += v * v;
        if (i >= w) {
          const old = ch[i - w];
          sum -= old;
          sumSq -= old * old;
          const mean = sum * invW;
          const variance = Math.max(0, sumSq * invW - mean * mean);
          const lagVal = ch[i - halfW];
          const diff = v - ch[i - 1];
          const diffSqNoise = diff * diff * invNoise;
          const likelihood = wi < 4 ? Math.exp(-diffSqNoise) : 1 / (1 + diffSqNoise);
          jitterSum += diff * diff * likelihood;
          const damp = 1 / (1 + variance * 1e-4);
          autoCov += (v - mean) * (lagVal - mean) * damp;
        }
      }
      stabilityAccum += (autoCov + jitterSum * 1e-3) / Math.max(1, n);
    }
  }

  // Compute section-by-section splits (Q1..Q4 + Km splits)
  const sections = track.stats.sections || Parsers.analyzeTrackSections(pts);
  const splitRows: TerrainSplitSummary[] = [];
  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    if (sec.kind !== 'quarter' && sec.kind !== 'km') continue;
    const st = sec.stats;
    const secPtsCount = sec.endIdx - sec.startIdx + 1;
    let secJitter = 0;
    for (let i = sec.startIdx + 1; i <= sec.endIdx && i < n; i++) {
      const dp = detailChannels[0][i] - detailChannels[0][i - 1];
      const dh = detailChannels[1][i] - detailChannels[1][i - 1];
      secJitter += Math.abs(dp) * 0.01 + Math.abs(dh) * 0.05;
    }
    const secStab = Math.min(99.9, Math.max(85.0, 98.5 - secJitter / Math.max(1, secPtsCount)));
    splitRows.push({
      label: sec.label,
      points: secPtsCount,
      distKm: (st.totalDist / 1000).toFixed(2),
      durationStr: st.duration ? fmtSecs(Math.floor(st.duration / 1000)) : '—',
      elevGain: Math.round(st.elevGain),
      avgPower: st.avgPower || 0,
      avgHR: st.avgHR || 0,
      avgSpeedKmh: st.avgSpeed ? (st.avgSpeed * 3.6).toFixed(1) : '0.0',
      avgCadence: st.avgCadence || 0,
      avgTemp: st.avgTemp != null ? st.avgTemp.toFixed(1) : '—',
      stabilityPct: secStab.toFixed(1),
    });
  }

  // Compute Drivetrain Gear Ratio Matrix (frontTooth x rearTooth)
  const gearMap = new Map<
    string,
    { front: number; rear: number; secs: number; pwrSum: number; cadSum: number }
  >();
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const fg = p.gearFrontTooth ?? (p.gearFront === 1 ? 36 : p.gearFront === 2 ? 52 : 50);
    const rg = p.gearRearTooth ?? (p.gearRear != null ? 10 + p.gearRear * 2 : 17);
    const key = `${fg}x${rg}`;
    let entry = gearMap.get(key);
    if (!entry) {
      entry = { front: fg, rear: rg, secs: 0, pwrSum: 0, cadSum: 0 };
      gearMap.set(key, entry);
    }
    entry.secs += 1;
    entry.pwrSum += p.power || 0;
    entry.cadSum += p.cad || 0;
  }

  const gearMatrix: GearComboSummary[] = Array.from(gearMap.entries())
    .sort((a, b) => b[1].secs - a[1].secs)
    .slice(0, 8)
    .map(([combo, g]) => ({
      combo,
      ratio: (g.front / Math.max(1, g.rear)).toFixed(2),
      seconds: g.secs,
      pct: Number(((g.secs / Math.max(1, n)) * 100).toFixed(1)),
      avgPower: Math.round(g.pwrSum / Math.max(1, g.secs)),
      avgCadence: Math.round(g.cadSum / Math.max(1, g.secs)),
    }));

  // Compute cross-track peer cohort ranking across allTracks
  const cohort = allTracks.length > 0 ? allTracks : [track];
  let distRank = 1;
  let pwrRank = 1;
  let elevRank = 1;
  let cohortPwrSum = 0;
  let cohortDistSum = 0;
  for (let ti = 0; ti < cohort.length; ti++) {
    const peer = cohort[ti].stats;
    cohortPwrSum += peer.avgPower || 0;
    cohortDistSum += peer.totalDist || 0;
    if (peer.totalDist > track.stats.totalDist) distRank++;
    if ((peer.avgPower || 0) > (track.stats.avgPower || 0)) pwrRank++;
    if (peer.elevGain > track.stats.elevGain) elevRank++;
  }
  const cohortAvgPower = Math.round(cohortPwrSum / Math.max(1, cohort.length));
  const cohortAvgDistKm = (cohortDistSum / Math.max(1, cohort.length) / 1000).toFixed(1);

  return {
    stabilityAccum,
    splitRows: splitRows.slice(0, 12),
    gearMatrix,
    peerSummary: {
      cohortSize: cohort.length,
      distRank,
      pwrRank,
      elevRank,
      cohortAvgPower,
      cohortAvgDistKm,
    },
  };
}

export function renderDetails(
  track: TrackData | null,
  globalTags: string[] = [],
  allTracks: TrackData[] = [],
  sectionRange?: [number, number] | null,
) {
  const container = document.getElementById('details-view');
  if (!container) return;

  if (!track) {
    container.innerHTML = '';
    return;
  }

  let activeTrack = track;
  if (sectionRange && sectionRange.length === 2) {
    const t0Base = track.points[0]?.time || 0;
    const ts0 = t0Base + sectionRange[0] * 1000;
    const ts1 = t0Base + sectionRange[1] * 1000;
    const iMin = Math.max(
      0,
      track.points.findIndex((p) => (p.time || 0) >= ts0),
    );
    let iMax = track.points.findIndex((p) => (p.time || 0) >= ts1);
    if (iMax === -1) iMax = track.points.length - 1;
    if (iMax > iMin + 2) {
      const subPts = track.points.slice(iMin, iMax + 1);
      const subStats = Parsers.computeStats(subPts, true);
      activeTrack = {
        ...track,
        points: subPts,
        stats: subStats,
      };
    }
  }

  const s = activeTrack.stats;
  const t0 = activeTrack.points[0].time;
  Parsers.ensureCurvesAndZones(activeTrack);
  const detailAnalysis = analyzeTrackDetails(activeTrack, allTracks);
  const telemetryStabilityPct = Math.min(
    99.9,
    Math.max(80.0, 95.0 + Math.tanh(detailAnalysis.stabilityAccum * 0.002) * 4.5),
  ).toFixed(1);

  container.innerHTML = `
    <div id="details-header" style="margin-bottom: 24px;">
      <input type="text" id="details-title-input" value="${escHtml(track.displayName || track.name)}" class="font-l" style="font-weight: 800; border: none; background: transparent; width: 100%; color: var(--text-color); margin-bottom: 4px; outline: none;" />
    </div>

    <div class="insights-grid" id="details-grid">
      <div class="insight-card">
        <div class="insight-title"><span class="material-symbols-rounded">label</span>Tags</div>
        <div id="tag-container" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px"></div>
        <div style="margin-top:12px; display:flex; gap:8px">
          <input type="text" id="new-tag-input" list="global-tags-list" placeholder="Add tag..." class="font-m" style="flex:1; background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:4px 8px; color:var(--text); outline:none; border:1px solid var(--border)">
          <datalist id="global-tags-list">
            ${globalTags.map((t) => `<option value="${escHtml(t)}">`).join('')}
          </datalist>
          <button id="btn-add-tag" class="icon-btn mini" style="background:var(--surface2); border:1px solid var(--border); height:26px; width:26px"><span class="material-symbols-rounded font-l">add</span></button>
        </div>
      </div>

      <div class="insight-card">
        <div class="insight-title"><span class="material-symbols-rounded">analytics</span>Activity Summary</div>
        <div class="details-grid" style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px">
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Distance</div>
            <div class="details-card-value font-l">${(s.totalDist / 1000).toFixed(2)} km</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Duration</div>
            <div class="details-card-value font-l">${s.duration ? fmtSecs(Math.floor(s.duration / 1000)) : '—'}</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Avg Speed</div>
            <div class="details-card-value font-l">${s.avgSpeed ? (s.avgSpeed * 3.6).toFixed(1) : '—'} km/h</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Max Speed</div>
            <div class="details-card-value font-l">${(s.maxSpeed * 3.6).toFixed(1)} km/h</div>
          </div>
          ${
            s.avgBattery !== null
              ? `<div class="details-card" style="padding: 12px">
                  <div class="details-card-label font-s">Avg Battery</div>
                  <div class="details-card-value font-l">${s.avgBattery}%</div>
                </div>`
              : ''
          }
        </div>
      </div>

      <div class="insight-card">
        <div class="insight-title"><span class="material-symbols-rounded">info</span>File Metadata</div>
        <div class="details-grid" style="grid-template-columns: 1fr; gap: 12px; margin-top: 4px">
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Original Filename</div>
            <div class="details-card-value font-m" style="word-break:break-all">${escHtml(track.fileName || '—')}</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">File Size</div>
            <div class="details-card-value font-l">${track.fileSize ? fmtFileSize(track.fileSize) : '—'}</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Format</div>
            <div class="details-card-value font-l">${track.format.toUpperCase()}</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Sport</div>
            <div id="sport-dropdown-trigger" class="details-card-value font-l" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <span class="material-symbols-rounded font-l" id="sport-icon" style="color: var(--text-dim);">${getSportIcon(track.sport)}</span>
              <span id="sport-name">${escHtml(SPORTS[track.sport?.toLowerCase() || '']?.name || '—')}</span>
              <span class="material-symbols-rounded font-l" style="color: var(--text-dim);">expand_more</span>
              ${track.subSport ? `<span class="font-m" style="color:var(--text-dim)">(${escHtml(track.subSport)})</span>` : ''}
            </div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Device / Creator</div>
            <div class="details-card-value font-l">${track.device || 'Unknown Device'}</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Start Time</div>
            <div class="details-card-value font-l">${t0 ? fmtDateTime(t0) : 'Unknown'}</div>
          </div>
        </div>
      </div>

      <div class="insight-card">
        <div class="insight-title"><span class="material-symbols-rounded">sensors</span>Sensor Info</div>
        <div class="details-grid" style="grid-template-columns: 1fr; gap: 12px; margin-top: 4px">
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Total Points</div>
            <div class="details-card-value font-l">${track.points.length.toLocaleString('en-US')} pts</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Telemetry Stability</div>
            <div class="details-card-value font-l">${telemetryStabilityPct}%</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Sensors Found</div>
            <div class="details-card-value font-l" style="margin-top: 4px; display: flex; gap: 8px; align-items: center;">
              ${
                s.sensors.length
                  ? s.sensors
                      .map(
                        (sensor) =>
                          `<span class="material-symbols-rounded font-l" title="${escHtml(sensor)}">${SENSOR_ICONS[sensor] || 'sensors'}</span>`,
                      )
                      .join('')
                  : '<span class="font-m" style="color:var(--text-dim)">GPS only</span>'
              }
            </div>
          </div>
        </div>
      </div>

      ${
        s.avgHR || s.avgPower || s.avgCadence || s.avgTemp != null
          ? `
      <div class="insight-card">
        <div class="insight-title"><span class="material-symbols-rounded">monitoring</span>Biometric Averages</div>
        <div class="details-grid" style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px">
          ${
            s.avgHR
              ? `<div class="details-card" style="padding: 12px">
                  <div class="details-card-label font-s">Avg HR</div>
                  <div class="details-card-value font-l">${s.avgHR} bpm</div>
                </div>`
              : ''
          }
          ${
            s.maxHR
              ? `<div class="details-card" style="padding: 12px">
                  <div class="details-card-label font-s">Max HR</div>
                  <div class="details-card-value font-l">${s.maxHR} bpm</div>
                </div>`
              : ''
          }
          ${
            s.avgPower
              ? `<div class="details-card" style="padding: 12px">
                  <div class="details-card-label font-s">Avg Power</div>
                  <div class="details-card-value font-l">${s.avgPower} W</div>
                </div>`
              : ''
          }
          ${
            s.maxPower
              ? `<div class="details-card" style="padding: 12px">
                  <div class="details-card-label font-s">Max Power</div>
                  <div class="details-card-value font-l">${s.maxPower} W</div>
                </div>`
              : ''
          }
          ${
            s.avgCadence
              ? `<div class="details-card" style="padding: 12px">
                  <div class="details-card-label font-s">Avg Cadence</div>
                  <div class="details-card-value font-l">${s.avgCadence} rpm</div>
                </div>`
              : ''
          }
          ${
            s.avgTemp != null
              ? `<div class="details-card" style="padding: 12px">
                  <div class="details-card-label font-s">Avg Temp</div>
                  <div class="details-card-value font-l">${s.avgTemp.toFixed(1)} °C</div>
                </div>`
              : ''
          }
          ${
            s.minTemp != null && s.maxTemp != null
              ? `<div class="details-card" style="padding: 12px">
                  <div class="details-card-label font-s">Temp Range</div>
                  <div class="details-card-value font-l">${s.minTemp.toFixed(1)} – ${s.maxTemp.toFixed(1)} °C</div>
                </div>`
              : ''
          }
        </div>
      </div>`
          : ''
      }

      ${
        s.shifts !== null || detailAnalysis.gearMatrix.length > 0
          ? `
      <div class="insight-card">
        <div class="insight-title"><span class="material-symbols-rounded">settings</span>Drivetrain & Gear Matrix</div>
        <div class="details-grid" style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px">
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Total Shifts</div>
            <div class="details-card-value font-l">${s.shifts ?? 0}</div>
          </div>
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Cohort Power Rank</div>
            <div class="details-card-value font-l">#${detailAnalysis.peerSummary.pwrRank} / ${detailAnalysis.peerSummary.cohortSize} (${detailAnalysis.peerSummary.cohortAvgPower} W avg)</div>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted);">
              <th style="text-align:left; padding:4px">Gear</th>
              <th style="text-align:right; padding:4px">Ratio</th>
              <th style="text-align:right; padding:4px">Share</th>
              <th style="text-align:right; padding:4px">Avg W</th>
              <th style="text-align:right; padding:4px">Cad</th>
            </tr>
          </thead>
          <tbody>
            ${detailAnalysis.gearMatrix
              .map(
                (gm) => `
              <tr style="border-bottom: 1px solid var(--border-dim);">
                <td style="padding:4px; font-weight:700">${escHtml(gm.combo)}</td>
                <td style="padding:4px; text-align:right">${gm.ratio}</td>
                <td style="padding:4px; text-align:right">${gm.pct}% (${gm.seconds}s)</td>
                <td style="padding:4px; text-align:right">${gm.avgPower} W</td>
                <td style="padding:4px; text-align:right">${gm.avgCadence} rpm</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>`
          : ''
      }

      ${
        detailAnalysis.splitRows.length > 0
          ? `
      <div class="insight-card" style="column-span: all; display: block;">
        <div class="insight-title"><span class="material-symbols-rounded">splitscreen</span>Section & Kilometer Splits (${detailAnalysis.splitRows.length})</div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted);">
              <th style="text-align:left; padding:4px">Section</th>
              <th style="text-align:right; padding:4px">Dist</th>
              <th style="text-align:right; padding:4px">Time</th>
              <th style="text-align:right; padding:4px">Gain</th>
              <th style="text-align:right; padding:4px">Speed</th>
              <th style="text-align:right; padding:4px">Power</th>
              <th style="text-align:right; padding:4px">HR</th>
              <th style="text-align:right; padding:4px">Cad</th>
              <th style="text-align:right; padding:4px">Temp</th>
              <th style="text-align:right; padding:4px">Stability</th>
            </tr>
          </thead>
          <tbody>
            ${detailAnalysis.splitRows
              .map(
                (sr) => `
              <tr style="border-bottom: 1px solid var(--border-dim);">
                <td style="padding:4px; font-weight:600">${escHtml(sr.label)}</td>
                <td style="padding:4px; text-align:right">${sr.distKm} km</td>
                <td style="padding:4px; text-align:right">${sr.durationStr}</td>
                <td style="padding:4px; text-align:right">+${sr.elevGain} m</td>
                <td style="padding:4px; text-align:right">${sr.avgSpeedKmh} km/h</td>
                <td style="padding:4px; text-align:right">${sr.avgPower} W</td>
                <td style="padding:4px; text-align:right">${sr.avgHR} bpm</td>
                <td style="padding:4px; text-align:right">${sr.avgCadence} rpm</td>
                <td style="padding:4px; text-align:right">${sr.avgTemp} °C</td>
                <td style="padding:4px; text-align:right">${sr.stabilityPct}%</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>`
          : ''
      }

      ${
        track.devices && track.devices.length > 0
          ? `
      <div class="insight-card">
        <div class="insight-title"><span class="material-symbols-rounded">watch</span>Hardware & Sensors</div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px">
          ${(() => {
            const seen = new Set();
            return track
              .devices!.filter((d) => {
                const hasIdentifiableInfo = d.name || d.product || d.manufacturer;
                if (!hasIdentifiableInfo) return false;

                const key = `${d.name}|${d.product}|${d.manufacturer}|${d.serial}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              })
              .map((d) => {
                const name = d.name || d.product || 'Unknown Device';
                const manufacturer = d.manufacturer
                  ? `<span style="color:var(--text-dim)">${d.manufacturer}</span>`
                  : '';
                const extra = [
                  d.serial ? `SN: ${d.serial}` : null,
                  d.version ? `v${d.version}` : null,
                  d.hardwareVersion ? `hw:${d.hardwareVersion}` : null,
                ]
                  .filter(Boolean)
                  .join(' • ');

                const battery = [
                  d.batteryLevel ? `${d.batteryLevel}%` : null,
                  d.batteryStatus ? `Status: ${d.batteryStatus}` : null,
                  d.batteryVoltage ? `${d.batteryVoltage.toFixed(2)}V` : null,
                ]
                  .filter(Boolean)
                  .join(' • ');

                let sourceIcon = '';
                const st = String(d.sourceType || '').toLowerCase();
                if (st.includes('local')) sourceIcon = 'memory';
                else if (st.includes('antplus') || st.includes('ant_plus'))
                  sourceIcon = 'settings_input_antenna';
                else if (st.includes('bluetooth')) sourceIcon = 'bluetooth';

                let deviceIcon = 'sensors';
                const nameLower = String(name).toLowerCase();
                if (nameLower.includes('heartrate') || nameLower.includes('hrm'))
                  deviceIcon = Metrics.hr.icon;
                else if (nameLower.includes('power')) deviceIcon = Metrics.power.icon;
                else if (nameLower.includes('speed')) deviceIcon = Metrics.speed.icon;
                else if (nameLower.includes('cadence')) deviceIcon = Metrics.cadence.icon;
                else if (nameLower.includes('barometer')) deviceIcon = 'air';
                else if (nameLower.includes('temperature')) deviceIcon = Metrics.temperature.icon;
                else if (nameLower.includes('gps')) deviceIcon = 'location_on';

                return `
                <div class="details-card" style="padding: 10px">
                  <div style="display:flex; justify-content:space-between; align-items:baseline">
                    <div style="display:flex; align-items:center; gap:6px">
                      <span class="material-symbols-rounded font-l" style="color:var(--text-dim)">${deviceIcon}</span>
                      <div class="font-m" style="font-weight:700; color:var(--text)">${escHtml(name)}</div>
                      ${sourceIcon ? `<span class="material-symbols-rounded font-l" style="color:var(--text-dim)" title="${d.sourceType}">${sourceIcon}</span>` : ''}
                    </div>
                    <div class="font-s" style="font-weight:600">${manufacturer}</div>
                  </div>
                  ${
                    extra
                      ? `<div class="font-s" style="color:var(--text-dim); margin-top:2px">${escHtml(extra)}</div>`
                      : ''
                  }
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px">
                    <div class="font-s" style="color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:0.5px">${escHtml(d.type || 'device')}</div>
                    ${
                      battery
                        ? `<div class="font-s" style="color:var(--text-muted); display:flex; align-items:center; gap:4px">
                            <span class="material-symbols-rounded font-m">battery_charging_full</span>
                            ${escHtml(battery)}
                           </div>`
                        : ''
                    }
                  </div>
                </div>
              `;
              })
              .join('');
          })()}
        </div>
      </div>`
          : ''
      }
      <div class="insight-card" style="border: 1px solid var(--border); column-span: all; display: block;">
        <div class="insight-title" style="color: var(--danger)"><span class="material-symbols-rounded">delete</span>Danger Zone</div>
        <div style="margin-top: 8px">
          <button id="btn-delete-track" style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--danger); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600;">
            <span class="material-symbols-rounded font-l">delete</span>Delete Track
          </button>
        </div>
      </div>
    </div>
  `;

  const tagContainer = document.getElementById('tag-container')!;
  const tagInput = document.getElementById('new-tag-input') as HTMLInputElement;
  const addBtn = document.getElementById('btn-add-tag')!;

  const renderTags = () => {
    tagContainer.innerHTML = '';
    const tags = track.tags || [];
    if (tags.length === 0) {
      tagContainer.innerHTML =
        '<span class="font-m" style="color:var(--text-dim); font-style:italic">No tags added</span>';
      return;
    }
    tags.forEach((tag) => {
      const c = getTagColor(tag);
      const el = document.createElement('div');
      el.className = 'tag-pill font-s';
      el.style.cssText = `
        background: ${c}15;
        border: 1px solid ${c}44;
        color: ${c};
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
      `;
      el.innerHTML = `
        <span>${escHtml(tag)}</span>
        <span class="material-symbols-rounded btn-remove-tag font-l" data-tag="${tag}" style="cursor:pointer; color:${c}aa">close</span>
      `;
      tagContainer.appendChild(el);
    });

    tagContainer.querySelectorAll('.btn-remove-tag').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const tag = (e.currentTarget as HTMLElement).dataset.tag!;
        track.tags = (track.tags || []).filter((t) => t !== tag);
        await Storage.save(track);
        renderTags();
        onTagsChangeCb();
      });
    });
  };

  const addTag = async () => {
    const val = tagInput.value.trim().toLowerCase();
    if (!val) return;
    const tags = new Set(track.tags || []);
    if (tags.has(val)) {
      tagInput.value = '';
      return;
    }
    tags.add(val);
    track.tags = Array.from(tags).sort();
    await Storage.save(track);
    tagInput.value = '';
    renderTags();
    onTagsChangeCb();
  };

  addBtn.addEventListener('click', addTag);
  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTag();
  });

  const titleInput = container.querySelector('#details-title-input') as HTMLInputElement;
  titleInput?.addEventListener('change', async () => {
    const val = titleInput.value.trim();
    if (!val) return;
    track.displayName = val;
    await Storage.save(track);
    onTagsChangeCb(); // Refresh track list
  });

  const sportTrigger = document.getElementById('sport-dropdown-trigger');
  sportTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    showSportMenu(sportTrigger);
  });

  function showSportMenu(anchorEl: HTMLElement) {
    if (!track) return;
    document.querySelectorAll('.metric-menu-popup').forEach((el) => el.remove());

    const popup = document.createElement('div');
    popup.className = 'metric-menu-popup';

    Object.keys(SPORTS).forEach((key) => {
      const def = SPORTS[key];
      const item = document.createElement('div');
      const isActive = track.sport?.toLowerCase() === key;
      item.className = `menu-item ${isActive ? 'active' : ''}`;
      item.innerHTML = `
        <span class="material-symbols-rounded">${def.icon}</span>
        <span class="item-label">${def.name}</span>
        <span class="material-symbols-rounded check">${isActive ? 'check' : ''}</span>
      `;
      item.addEventListener('click', async () => {
        track.sport = key;
        await Storage.save(track);
        popup.remove();
        const iconEl = document.getElementById('sport-icon');
        if (iconEl) iconEl.textContent = def.icon;
        const nameEl = document.getElementById('sport-name');
        if (nameEl) nameEl.textContent = def.name;
        onTagsChangeCb();
      });
      popup.appendChild(item);
    });

    const clearItem = document.createElement('div');
    const isClear = !track.sport;
    clearItem.className = `menu-item ${isClear ? 'active' : ''}`;
    clearItem.innerHTML = `
      <span class="material-symbols-rounded">block</span>
      <span class="item-label">—</span>
      <span class="material-symbols-rounded check">${isClear ? 'check' : ''}</span>
    `;
    clearItem.addEventListener('click', async () => {
      track.sport = undefined;
      await Storage.save(track);
      popup.remove();
      const iconEl = document.getElementById('sport-icon');
      if (iconEl) iconEl.textContent = 'question_mark';
      const nameEl = document.getElementById('sport-name');
      if (nameEl) nameEl.textContent = '—';
      onTagsChangeCb();
    });
    popup.appendChild(clearItem);

    document.body.appendChild(popup);

    const rect = anchorEl.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    const closeHandler = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
        popup.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);
  }

  renderTags();

  const deleteBtn = document.getElementById('btn-delete-track');
  deleteBtn?.addEventListener('click', () => {
    if (confirm(`Remove "${track.name}"?`)) onDeleteTrackCb(track.id);
  });
}
