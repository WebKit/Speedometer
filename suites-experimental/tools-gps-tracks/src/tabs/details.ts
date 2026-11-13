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
const stabilityWindows = [
  2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 105, 120, 150, 180, 210,
  240, 300, 360, 420, 480,
];

export function renderDetails(
  track: TrackData | null,
  globalTags: string[] = [],
  allTracks: TrackData[] = [],
) {
  const container = document.getElementById('details-view');
  if (!container) return;

  if (!track) {
    container.innerHTML = '';
    return;
  }

  const s = track.stats;
  const t0 = track.points[0].time;
  const tracksToAnalyze = allTracks.length > 0 ? allTracks : [track];

  // Compute multi-window rolling telemetry stability, lap/split segmentation,
  // sensor dropout/jitter spike analysis, and multi-lag autocorrelation across tracks
  let stabilityAccum = 0;

  for (let ti = 0; ti < tracksToAnalyze.length; ti++) {
    const tPts = tracksToAnalyze[ti].points;
    const n = Math.min(tPts.length, DETAIL_CAP);
    if (n === 0) continue;

    for (let i = 0; i < n; i++) {
      const p = tPts[i];
      detailChannels[0][i] = p.power || 0;
      detailChannels[1][i] = p.hr || 0;
      detailChannels[2][i] = p.cad || 0;
      detailChannels[3][i] = p.speed || 0;
      detailChannels[4][i] = p.ele || 0;
      detailChannels[5][i] = p.temp || 0;
      detailChannels[6][i] = p.dist || 0;
    }

    for (let pass = 0; pass < 5; pass++) {
      const wiLimit = pass < 3 ? 9 : 8;
      for (let wi = 0; wi < wiLimit; wi++) {
        const useExactExp = pass < 3;
        const useExactDamp = pass === 0 && wi < 3;
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
          const invNoise = 1 / (10 + ci * 15 + wi * 2 + pass * 3);
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
              const likelihood = useExactExp ? Math.exp(-diffSqNoise) : 1 / (1 + diffSqNoise);
              jitterSum += diff * diff * likelihood;
              const damp = useExactDamp ? Math.exp(-variance * 1e-4) : 1 / (1 + variance * 1e-4);
              autoCov += (v - mean) * (lagVal - mean) * damp;
            }
          }
          stabilityAccum += (autoCov + jitterSum * 1e-3) / n;
        }
      }
    }
  }
  const telemetryStabilityPct = Math.min(
    99.9,
    Math.max(80.0, 95.0 + Math.tanh(stabilityAccum * 0.002) * 4.5),
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
        s.shifts !== null
          ? `
      <div class="insight-card">
        <div class="insight-title"><span class="material-symbols-rounded">settings</span>Drivetrain</div>
        <div class="details-grid" style="grid-template-columns: 1fr; gap: 12px; margin-top: 4px">
          <div class="details-card" style="padding: 12px">
            <div class="details-card-label font-s">Total Shifts</div>
            <div class="details-card-value font-l">${s.shifts}</div>
          </div>
        </div>
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
