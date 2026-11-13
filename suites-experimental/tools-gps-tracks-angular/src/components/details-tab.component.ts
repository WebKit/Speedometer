// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Component, ChangeDetectorRef, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackData, Parsers } from '../parsers';
import { Storage } from '../storage';
import { fmtSecs, fmtDateTime, getTagColor, fmtFileSize } from '../utils';
import { SPORTS, getSportIcon } from '../sports';
import { Metrics } from '../metrics';
import { Zones } from '../zones';
import { TrackStateService } from '../services/track-state.service';

const SENSOR_ICONS: Record<string, string> = {
  'Heart Rate': Metrics.hr.icon,
  Cadence: Metrics.cadence.icon,
  Power: Metrics.power.icon,
  Temperature: Metrics.temperature.icon,
  Shifting: Metrics.gears.icon,
  Battery: Metrics.battery.icon,
};

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

export interface GearComboSummary {
  combo: string;
  ratio: string;
  seconds: number;
  pct: number;
  avgPower: number;
  avgCadence: number;
}

export interface TerrainSplitSummary {
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

export interface PeerCohortSummary {
  cohortSize: number;
  distRank: number;
  pwrRank: number;
  elevRank: number;
  cohortAvgPower: number;
  cohortAvgDistKm: string;
}

export interface DeviceCardView {
  name: string;
  manufacturer: string;
  extra: string;
  battery: string;
  sourceIcon: string;
  sourceType: string;
  deviceIcon: string;
  type: string;
}

export interface DetailZoneRow {
  kind: string;
  zone: string;
  name: string;
  range: string;
  timeStr: string;
  pctStr: string;
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

let activeDetailsComponent: DetailsTabComponent | null = null;
let externalOnTagsChangeCb: (() => void) | null = null;
let externalOnDeleteTrackCb: ((id: string) => void) | null = null;

export function getActiveDetailsComponent(): DetailsTabComponent | null {
  return activeDetailsComponent || (window as any).__trackStateService?.detailsTab || null;
}

export function setDetailsCallbacks(
  onTagsChange: () => void,
  onDeleteTrack: (id: string) => void,
): void {
  externalOnTagsChangeCb = onTagsChange;
  externalOnDeleteTrackCb = onDeleteTrack;
}

@Component({
  selector: 'app-details-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div id="details-view">
      <div *ngIf="isResetState" id="details-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for details</div>
      </div>

      <ng-container *ngIf="!isResetState && currentTrack">
        <div id="details-header" style="margin-bottom: 24px;">
          <input
            type="text"
            id="details-title-input"
            [(ngModel)]="titleInputVal"
            (change)="onTitleChange()"
            class="font-l"
            style="font-weight: 800; border: none; background: transparent; width: 100%; color: var(--text-color); margin-bottom: 4px; outline: none;"
          />
        </div>

        <div class="insights-grid" id="details-grid">
          <!-- Tags Card -->
          <div class="insight-card">
            <div class="insight-title"><span class="material-symbols-rounded">label</span>Tags</div>
            <div id="tag-container" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px">
              <span
                *ngIf="tagPills.length === 0"
                class="font-m"
                style="color:var(--text-dim); font-style:italic"
                >No tags added</span
              >
              <div
                *ngFor="let t of tagPills"
                class="tag-pill font-s"
                [style.background]="t.color + '15'"
                [style.border]="'1px solid ' + t.color + '44'"
                [style.color]="t.color"
                style="padding: 2px 8px; border-radius: 4px; font-weight: 600; display: flex; align-items: center; gap: 6px;"
              >
                <span>{{ t.name }}</span>
                <span
                  class="material-symbols-rounded btn-remove-tag font-l"
                  [attr.data-tag]="t.name"
                  [style.color]="t.color + 'aa'"
                  style="cursor:pointer"
                  (click)="onRemoveTag(t.name)"
                  >close</span
                >
              </div>
            </div>
            <div style="margin-top:12px; display:flex; gap:8px">
              <input
                type="text"
                id="new-tag-input"
                list="global-tags-list"
                placeholder="Add tag..."
                [(ngModel)]="newTagVal"
                (keydown.enter)="onAddTag()"
                class="font-m"
                style="flex:1; background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:4px 8px; color:var(--text); outline:none;"
              />
              <datalist id="global-tags-list">
                <option *ngFor="let gt of globalTags" [value]="gt"></option>
              </datalist>
              <button
                id="btn-add-tag"
                class="icon-btn mini"
                style="background:var(--surface2); border:1px solid var(--border); height:26px; width:26px"
                (click)="onAddTag()"
              >
                <span class="material-symbols-rounded font-l">add</span>
              </button>
            </div>
          </div>

          <!-- Activity Summary Card -->
          <div class="insight-card">
            <div class="insight-title">
              <span class="material-symbols-rounded">analytics</span>Activity Summary
            </div>
            <div
              class="details-grid"
              style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px"
            >
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Distance</div>
                <div class="details-card-value font-l">{{ summary.distKm }} km</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Duration</div>
                <div class="details-card-value font-l">{{ summary.durationStr }}</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Avg Speed</div>
                <div class="details-card-value font-l">{{ summary.avgSpeedStr }} km/h</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Max Speed</div>
                <div class="details-card-value font-l">{{ summary.maxSpeedStr }} km/h</div>
              </div>
              <div *ngIf="summary.avgBattery !== null" class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Avg Battery</div>
                <div class="details-card-value font-l">{{ summary.avgBattery }}%</div>
              </div>
            </div>
          </div>

          <!-- File Metadata Card -->
          <div class="insight-card">
            <div class="insight-title">
              <span class="material-symbols-rounded">info</span>File Metadata
            </div>
            <div
              class="details-grid"
              style="grid-template-columns: 1fr; gap: 12px; margin-top: 4px"
            >
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Original Filename</div>
                <div class="details-card-value font-m" style="word-break:break-all">
                  {{ metadata.fileName }}
                </div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">File Size</div>
                <div class="details-card-value font-l">{{ metadata.fileSizeStr }}</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Format</div>
                <div class="details-card-value font-l">{{ metadata.formatStr }}</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Sport</div>
                <div
                  id="sport-dropdown-trigger"
                  class="details-card-value font-l"
                  style="display: flex; align-items: center; gap: 6px; cursor: pointer;"
                  (click)="onShowSportMenu($event)"
                >
                  <span
                    class="material-symbols-rounded font-l"
                    id="sport-icon"
                    style="color: var(--text-dim);"
                    >{{ metadata.sportIcon }}</span
                  >
                  <span id="sport-name">{{ metadata.sportName }}</span>
                  <span class="material-symbols-rounded font-l" style="color: var(--text-dim);"
                    >expand_more</span
                  >
                  <span *ngIf="metadata.subSport" class="font-m" style="color:var(--text-dim)"
                    >({{ metadata.subSport }})</span
                  >
                </div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Device / Creator</div>
                <div class="details-card-value font-l">{{ metadata.device }}</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Start Time</div>
                <div class="details-card-value font-l">{{ metadata.startTimeStr }}</div>
              </div>
            </div>
          </div>

          <!-- Sensor Info & Peer Cohort Ranking Card -->
          <div class="insight-card">
            <div class="insight-title">
              <span class="material-symbols-rounded">sensors</span>Sensor Info
            </div>
            <div
              class="details-grid"
              style="grid-template-columns: 1fr; gap: 12px; margin-top: 4px"
            >
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Total Points</div>
                <div class="details-card-value font-l">{{ sensorInfo.pointsCountStr }} pts</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Telemetry Stability</div>
                <div class="details-card-value font-l">{{ telemetryStabilityPct }}%</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Peer Cohort Ranking</div>
                <div class="details-card-value font-m">
                  Dist #{{ peerSummary.distRank }}/{{ peerSummary.cohortSize }} · Elev #{{
                    peerSummary.elevRank
                  }}/{{ peerSummary.cohortSize }} ({{ peerSummary.cohortAvgDistKm }} km avg)
                </div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Sensors Found</div>
                <div
                  class="details-card-value font-l"
                  style="margin-top: 4px; display: flex; gap: 8px; align-items: center;"
                >
                  <ng-container *ngIf="sensorInfo.sensors.length > 0; else gpsOnlyTpl">
                    <span
                      *ngFor="let s of sensorInfo.sensors"
                      class="material-symbols-rounded font-l"
                      [title]="s.name"
                      >{{ s.icon }}</span
                    >
                  </ng-container>
                  <ng-template #gpsOnlyTpl>
                    <span class="font-m" style="color:var(--text-dim)">GPS only</span>
                  </ng-template>
                </div>
              </div>
            </div>
          </div>

          <!-- Biometric Averages Card -->
          <div *ngIf="hasBiometrics" class="insight-card">
            <div class="insight-title">
              <span class="material-symbols-rounded">monitoring</span>Biometric Averages
            </div>
            <div
              class="details-grid"
              style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px"
            >
              <div *ngIf="biometrics.avgHR" class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Avg HR</div>
                <div class="details-card-value font-l">{{ biometrics.avgHR }} bpm</div>
              </div>
              <div *ngIf="biometrics.maxHR" class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Max HR</div>
                <div class="details-card-value font-l">{{ biometrics.maxHR }} bpm</div>
              </div>
              <div *ngIf="biometrics.avgPower" class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Avg Power</div>
                <div class="details-card-value font-l">{{ biometrics.avgPower }} W</div>
              </div>
              <div *ngIf="biometrics.maxPower" class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Max Power</div>
                <div class="details-card-value font-l">{{ biometrics.maxPower }} W</div>
              </div>
              <div *ngIf="biometrics.avgCadence" class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Avg Cadence</div>
                <div class="details-card-value font-l">{{ biometrics.avgCadence }} rpm</div>
              </div>
              <div *ngIf="biometrics.avgTempStr" class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Avg Temp</div>
                <div class="details-card-value font-l">{{ biometrics.avgTempStr }} °C</div>
              </div>
              <div *ngIf="biometrics.tempRangeStr" class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Temp Range</div>
                <div class="details-card-value font-l">{{ biometrics.tempRangeStr }} °C</div>
              </div>
            </div>
          </div>

          <!-- Drivetrain & Gear Matrix Card -->
          <div *ngIf="hasDrivetrain" class="insight-card">
            <div class="insight-title">
              <span class="material-symbols-rounded">settings</span>Drivetrain &amp; Gear Matrix
            </div>
            <div
              class="details-grid"
              style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px"
            >
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Total Shifts</div>
                <div class="details-card-value font-l">{{ totalShifts }}</div>
              </div>
              <div class="details-card" style="padding: 12px">
                <div class="details-card-label font-s">Cohort Power Rank</div>
                <div class="details-card-value font-l">
                  #{{ peerSummary.pwrRank }} / {{ peerSummary.cohortSize }} ({{
                    peerSummary.cohortAvgPower
                  }}
                  W avg)
                </div>
              </div>
            </div>
            <table
              style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px;"
            >
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
                <tr
                  *ngFor="let gm of gearMatrix"
                  style="border-bottom: 1px solid var(--border-dim);"
                >
                  <td style="padding:4px; font-weight:700">{{ gm.combo }}</td>
                  <td style="padding:4px; text-align:right">{{ gm.ratio }}</td>
                  <td style="padding:4px; text-align:right">{{ gm.pct }}% ({{ gm.seconds }}s)</td>
                  <td style="padding:4px; text-align:right">{{ gm.avgPower }} W</td>
                  <td style="padding:4px; text-align:right">{{ gm.avgCadence }} rpm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Power & HR Zone Summary Table Card -->
          <div *ngIf="zoneTableRows.length > 0" class="insight-card">
            <div class="insight-title">
              <span class="material-symbols-rounded">bar_chart</span>Power &amp; HR Zone Summary
            </div>
            <table
              style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px;"
            >
              <thead>
                <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted);">
                  <th style="text-align:left; padding:4px">Zone</th>
                  <th style="text-align:left; padding:4px">Name</th>
                  <th style="text-align:right; padding:4px">Range</th>
                  <th style="text-align:right; padding:4px">Time</th>
                  <th style="text-align:right; padding:4px">Share</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let zr of zoneTableRows"
                  style="border-bottom: 1px solid var(--border-dim);"
                >
                  <td style="padding:4px; font-weight:700">{{ zr.kind }} {{ zr.zone }}</td>
                  <td style="padding:4px">{{ zr.name }}</td>
                  <td style="padding:4px; text-align:right">{{ zr.range }}</td>
                  <td style="padding:4px; text-align:right">{{ zr.timeStr }}</td>
                  <td style="padding:4px; text-align:right">{{ zr.pctStr }}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section & Kilometer Splits Card -->
          <div
            *ngIf="splitRows.length > 0"
            class="insight-card"
            style="column-span: all; display: block;"
          >
            <div class="insight-title">
              <span class="material-symbols-rounded">splitscreen</span>Section &amp; Kilometer
              Splits ({{ splitRows.length }})
            </div>
            <table
              style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px;"
            >
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
                <tr
                  *ngFor="let sr of splitRows"
                  style="border-bottom: 1px solid var(--border-dim);"
                >
                  <td style="padding:4px; font-weight:600">{{ sr.label }}</td>
                  <td style="padding:4px; text-align:right">{{ sr.distKm }} km</td>
                  <td style="padding:4px; text-align:right">{{ sr.durationStr }}</td>
                  <td style="padding:4px; text-align:right">+{{ sr.elevGain }} m</td>
                  <td style="padding:4px; text-align:right">{{ sr.avgSpeedKmh }} km/h</td>
                  <td style="padding:4px; text-align:right">{{ sr.avgPower }} W</td>
                  <td style="padding:4px; text-align:right">{{ sr.avgHR }} bpm</td>
                  <td style="padding:4px; text-align:right">{{ sr.avgCadence }} rpm</td>
                  <td style="padding:4px; text-align:right">{{ sr.avgTemp }} °C</td>
                  <td style="padding:4px; text-align:right">{{ sr.stabilityPct }}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Hardware & Sensors Card -->
          <div *ngIf="deviceCards.length > 0" class="insight-card">
            <div class="insight-title">
              <span class="material-symbols-rounded">watch</span>Hardware &amp; Sensors
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px">
              <div *ngFor="let d of deviceCards" class="details-card" style="padding: 10px">
                <div style="display:flex; justify-content:space-between; align-items:baseline">
                  <div style="display:flex; align-items:center; gap:6px">
                    <span class="material-symbols-rounded font-l" style="color:var(--text-dim)">{{
                      d.deviceIcon
                    }}</span>
                    <div class="font-m" style="font-weight:700; color:var(--text)">
                      {{ d.name }}
                    </div>
                    <span
                      *ngIf="d.sourceIcon"
                      class="material-symbols-rounded font-l"
                      style="color:var(--text-dim)"
                      [title]="d.sourceType"
                      >{{ d.sourceIcon }}</span
                    >
                  </div>
                  <div *ngIf="d.manufacturer" class="font-s" style="font-weight:600">
                    <span style="color:var(--text-dim)">{{ d.manufacturer }}</span>
                  </div>
                </div>
                <div *ngIf="d.extra" class="font-s" style="color:var(--text-dim); margin-top:2px">
                  {{ d.extra }}
                </div>
                <div
                  style="display:flex; justify-content:space-between; align-items:center; margin-top:4px"
                >
                  <div
                    class="font-s"
                    style="color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:0.5px"
                  >
                    {{ d.type }}
                  </div>
                  <div
                    *ngIf="d.battery"
                    class="font-s"
                    style="color:var(--text-muted); display:flex; align-items:center; gap:4px"
                  >
                    <span class="material-symbols-rounded font-m">battery_charging_full</span>
                    {{ d.battery }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Danger Zone Card -->
          <div
            class="insight-card"
            style="border: 1px solid var(--border); column-span: all; display: block;"
          >
            <div class="insight-title" style="color: var(--danger)">
              <span class="material-symbols-rounded">delete</span>Danger Zone
            </div>
            <div style="margin-top: 8px">
              <button
                id="btn-delete-track"
                style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--danger); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600;"
                (click)="onDeleteTrack()"
              >
                <span class="material-symbols-rounded font-l">delete</span>Delete Track
              </button>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class DetailsTabComponent implements OnInit, OnDestroy {
  public state = inject(TrackStateService);
  private cdr = inject(ChangeDetectorRef);

  isResetState = true;
  currentTrack: TrackData | null = null;
  globalTags: string[] = [];
  titleInputVal = '';
  newTagVal = '';
  tagPills: { name: string; color: string }[] = [];

  summary = {
    distKm: '0.00',
    durationStr: '—',
    avgSpeedStr: '—',
    maxSpeedStr: '0.0',
    avgBattery: null as number | null,
  };

  metadata = {
    fileName: '—',
    fileSizeStr: '—',
    formatStr: 'GPX',
    sportIcon: 'question_mark',
    sportName: '—',
    subSport: '',
    device: 'Unknown Device',
    startTimeStr: 'Unknown',
  };

  sensorInfo = {
    pointsCountStr: '0',
    sensors: [] as { name: string; icon: string }[],
  };

  telemetryStabilityPct = '95.0';

  hasBiometrics = false;
  biometrics = {
    avgHR: null as number | null,
    maxHR: 0,
    avgPower: null as number | null,
    maxPower: 0,
    avgCadence: null as number | null,
    avgTempStr: null as string | null,
    tempRangeStr: null as string | null,
  };

  hasDrivetrain = false;
  totalShifts = 0;
  gearMatrix: GearComboSummary[] = [];
  splitRows: TerrainSplitSummary[] = [];
  zoneTableRows: DetailZoneRow[] = [];
  peerSummary: PeerCohortSummary = {
    cohortSize: 1,
    distRank: 1,
    pwrRank: 1,
    elevRank: 1,
    cohortAvgPower: 0,
    cohortAvgDistKm: '0.0',
  };

  deviceCards: DeviceCardView[] = [];

  constructor() {
    this.state.detailsTab = this;
    activeDetailsComponent = this;
  }

  ngOnInit(): void {
    this.state.detailsTab = this;
    activeDetailsComponent = this;
  }

  ngOnDestroy(): void {
    if (activeDetailsComponent === this) {
      activeDetailsComponent = null;
    }
  }

  private notifyTagsChanged(): void {
    if (externalOnTagsChangeCb) {
      externalOnTagsChangeCb();
    } else {
      this.state.onTagsChanged();
    }
  }

  reset(): void {
    this.isResetState = true;
    this.currentTrack = null;
    this.tagPills = [];
    this.splitRows = [];
    this.gearMatrix = [];
    this.zoneTableRows = [];
    this.deviceCards = [];
    this.cdr.detectChanges();
  }

  render(
    track: TrackData | null,
    globalTags: string[] = [],
    allTracks: TrackData[] = [],
    sectionRange?: [number, number] | null,
  ): void {
    this.isResetState = false;
    this.currentTrack = track;
    this.globalTags = globalTags;

    if (!track) {
      this.cdr.detectChanges();
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
    const t0 = activeTrack.points[0]?.time;
    Parsers.ensureCurvesAndZones(activeTrack);
    const detailAnalysis = analyzeTrackDetails(activeTrack, allTracks);
    this.telemetryStabilityPct = Math.min(
      99.9,
      Math.max(80.0, 95.0 + Math.tanh(detailAnalysis.stabilityAccum * 0.002) * 4.5),
    ).toFixed(1);

    this.titleInputVal = track.displayName || track.name;
    this.rebuildTagPills();

    this.summary = {
      distKm: (s.totalDist / 1000).toFixed(2),
      durationStr: s.duration ? fmtSecs(Math.floor(s.duration / 1000)) : '—',
      avgSpeedStr: s.avgSpeed ? (s.avgSpeed * 3.6).toFixed(1) : '—',
      maxSpeedStr: (s.maxSpeed * 3.6).toFixed(1),
      avgBattery: s.avgBattery ?? null,
    };

    this.metadata = {
      fileName: track.fileName || '—',
      fileSizeStr: track.fileSize ? fmtFileSize(track.fileSize) : '—',
      formatStr: track.format.toUpperCase(),
      sportIcon: getSportIcon(track.sport),
      sportName: SPORTS[track.sport?.toLowerCase() || '']?.name || '—',
      subSport: track.subSport || '',
      device: track.device || 'Unknown Device',
      startTimeStr: t0 ? fmtDateTime(t0) : 'Unknown',
    };

    this.sensorInfo = {
      pointsCountStr: track.points.length.toLocaleString('en-US'),
      sensors: s.sensors.map((sensor) => ({
        name: sensor,
        icon: SENSOR_ICONS[sensor] || 'sensors',
      })),
    };

    this.hasBiometrics = Boolean(s.avgHR || s.avgPower || s.avgCadence || s.avgTemp != null);
    this.biometrics = {
      avgHR: s.avgHR,
      maxHR: s.maxHR,
      avgPower: s.avgPower,
      maxPower: s.maxPower,
      avgCadence: s.avgCadence,
      avgTempStr: s.avgTemp != null ? s.avgTemp.toFixed(1) : null,
      tempRangeStr:
        s.minTemp != null && s.maxTemp != null
          ? `${s.minTemp.toFixed(1)} – ${s.maxTemp.toFixed(1)}`
          : null,
    };

    this.gearMatrix = detailAnalysis.gearMatrix;
    this.splitRows = detailAnalysis.splitRows;
    this.peerSummary = detailAnalysis.peerSummary;
    this.totalShifts = s.shifts ?? 0;
    this.hasDrivetrain = s.shifts !== null || this.gearMatrix.length > 0;

    // Build Power/HR zone summary rows
    const zRows: DetailZoneRow[] = [];
    if (s.powerZones) {
      const totalP = s.powerZones.reduce((a, b) => a + b, 0);
      const pZones = Zones.getPowerZones();
      s.powerZones.forEach((secs, idx) => {
        if (idx < pZones.length && secs > 0) {
          const z = pZones[idx];
          const pct = totalP > 0 ? (secs / totalP) * 100 : 0;
          zRows.push({
            kind: 'Pwr',
            zone: `Z${idx + 1}`,
            name: z.name,
            range: isFinite(z.max)
              ? `${Math.round(z.min)}–${Math.round(z.max)} W`
              : `>${Math.round(z.min)} W`,
            timeStr: fmtSecs(Math.round(secs)),
            pctStr: pct.toFixed(1),
          });
        }
      });
    }
    if (s.hrZones) {
      const totalH = s.hrZones.reduce((a, b) => a + b, 0);
      const hZones = Zones.getHRZones();
      s.hrZones.forEach((secs, idx) => {
        if (idx < hZones.length && secs > 0) {
          const z = hZones[idx];
          const pct = totalH > 0 ? (secs / totalH) * 100 : 0;
          zRows.push({
            kind: 'HR',
            zone: `Z${idx + 1}`,
            name: z.name,
            range: isFinite(z.max)
              ? `${Math.round(z.min)}–${Math.round(z.max)} bpm`
              : `>${Math.round(z.min)} bpm`,
            timeStr: fmtSecs(Math.round(secs)),
            pctStr: pct.toFixed(1),
          });
        }
      });
    }
    this.zoneTableRows = zRows;

    // Hardware & Sensors cards
    if (track.devices && track.devices.length > 0) {
      const seen = new Set<string>();
      this.deviceCards = track.devices
        .filter((d) => {
          const hasIdentifiableInfo = d.name || d.product || d.manufacturer;
          if (!hasIdentifiableInfo) return false;
          const key = `${d.name}|${d.product}|${d.manufacturer}|${d.serial}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((d) => {
          const name = d.name || d.product || 'Unknown Device';
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

          return {
            name: String(name),
            manufacturer: d.manufacturer || '',
            extra,
            battery,
            sourceIcon,
            sourceType: String(d.sourceType || ''),
            deviceIcon,
            type: d.type || 'device',
          };
        });
    } else {
      this.deviceCards = [];
    }

    this.cdr.detectChanges();
  }

  private rebuildTagPills(): void {
    const tags = this.currentTrack?.tags || [];
    this.tagPills = tags.map((t) => ({
      name: t,
      color: getTagColor(t),
    }));
  }

  async onAddTag(): Promise<void> {
    if (!this.currentTrack) return;
    const val = this.newTagVal.trim().toLowerCase();
    if (!val) return;
    const tags = new Set(this.currentTrack.tags || []);
    if (tags.has(val)) {
      this.newTagVal = '';
      this.cdr.detectChanges();
      return;
    }
    tags.add(val);
    this.currentTrack.tags = Array.from(tags).sort();
    await Storage.save(this.currentTrack);
    this.newTagVal = '';
    this.rebuildTagPills();
    this.cdr.detectChanges();
    this.notifyTagsChanged();
  }

  async onRemoveTag(tag: string): Promise<void> {
    if (!this.currentTrack) return;
    this.currentTrack.tags = (this.currentTrack.tags || []).filter((t) => t !== tag);
    await Storage.save(this.currentTrack);
    this.rebuildTagPills();
    this.cdr.detectChanges();
    this.notifyTagsChanged();
  }

  async onTitleChange(): Promise<void> {
    if (!this.currentTrack) return;
    const val = this.titleInputVal.trim();
    if (!val) return;
    this.currentTrack.displayName = val;
    await Storage.save(this.currentTrack);
    this.notifyTagsChanged();
  }

  onShowSportMenu(event: MouseEvent): void {
    event.stopPropagation();
    const track = this.currentTrack;
    if (!track) return;
    const anchorEl = event.currentTarget as HTMLElement;

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
        this.metadata.sportIcon = def.icon;
        this.metadata.sportName = def.name;
        this.cdr.detectChanges();
        this.notifyTagsChanged();
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
      this.metadata.sportIcon = 'question_mark';
      this.metadata.sportName = '—';
      this.cdr.detectChanges();
      this.notifyTagsChanged();
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

  onDeleteTrack(): void {
    if (!this.currentTrack) return;
    if (confirm(`Remove "${this.currentTrack.name}"?`)) {
      if (externalOnDeleteTrackCb) {
        externalOnDeleteTrackCb(this.currentTrack.id);
      } else {
        void this.state.deleteTrack(this.currentTrack.id);
      }
    }
  }
}
