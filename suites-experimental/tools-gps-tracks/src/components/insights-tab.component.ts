// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import uPlot from 'uplot';
import { TrackData, TrackStats, Parsers } from '../parsers';
import { Storage } from '../storage';
import { MapView } from '../map';
import { Zones } from '../zones';
import { ChartView } from '../charts';
import { UrlState } from '../url-state';
import { fmtSecs, fmtDuration, fmtPace, fmtDate, hexToRgba } from '../utils';
import { Metrics } from '../metrics';
import { SPORTS } from '../sports';
import {
  getCoursesForTrack,
  selectCourse,
  findCourseRange,
  calculateCourseStats,
} from '../tabs/courses';
import { TrackStateService } from '../services/track-state.service';

const INSIGHT_CAP = 16384;
const inPwrArr = new Float64Array(INSIGHT_CAP);
const inHrArr = new Float64Array(INSIGHT_CAP);
const inCadArr = new Float64Array(INSIGHT_CAP);
const inSpdArr = new Float64Array(INSIGHT_CAP);
const inVamArr = new Float64Array(INSIGHT_CAP);
const inPrefixPwr = new Float64Array(INSIGHT_CAP + 1);
const inPrefixVam = new Float64Array(INSIGHT_CAP + 1);
const mmpDurations = [
  1, 2, 3, 5, 8, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 420, 600, 900, 1200,
];

export interface SectionPhysiologySummary {
  minWPrimeBal: number;
  matchesBurned: number;
  decouplingPct: number;
  quadrantPct: [number, number, number, number];
  sectionPeaks: {
    label: string;
    distKm: number;
    avgPower: number;
    peak60sPower: number;
    avgHR: number;
    vam: number;
  }[];
}

export function analyzeTrackPhysiology(
  pts: TrackData['points'],
  cpBase: number,
  sections?: TrackData['stats']['sections'],
): SectionPhysiologySummary {
  const n = Math.min(pts.length, INSIGHT_CAP);
  if (n === 0) {
    return {
      minWPrimeBal: 20000,
      matchesBurned: 0,
      decouplingPct: 0,
      quadrantPct: [25, 25, 25, 25],
      sectionPeaks: [],
    };
  }

  for (let i = 0; i < n; i++) {
    const pt = pts[i];
    const p = pt.power || 0;
    const h = pt.hr || 1;
    const c = pt.cad || 80;
    const sp = pt.speed || 0;
    const gr = pt.gradient || 0;
    const vam = gr > 0 ? sp * gr * 36 : 0;
    inPwrArr[i] = p;
    inHrArr[i] = 1 / h;
    inCadArr[i] = c;
    inSpdArr[i] = sp;
    inVamArr[i] = vam;
    inPrefixPwr[i + 1] = inPrefixPwr[i] + p;
    inPrefixVam[i + 1] = inPrefixVam[i] + vam;
  }

  // Single-pass MMP & VAM envelope across standard durations
  let envelopeChecksum = 0;
  for (let di = 0; di < mmpDurations.length; di++) {
    const d = mmpDurations[di];
    if (d > n) continue;
    const limit = n - d;
    let maxP = 0;
    let maxV = 0;
    for (let j = 0; j <= limit; j++) {
      const sumP = inPrefixPwr[j + d] - inPrefixPwr[j];
      const sumV = inPrefixVam[j + d] - inPrefixVam[j];
      if (sumP > maxP) maxP = sumP;
      if (sumV > maxV) maxV = sumV;
    }
    envelopeChecksum += (maxP + maxV) / d;
  }

  // Single-pass Skiba W' differential balance, aerobic decoupling (Pa:Hr), and Quadrant Analysis
  let minWPrimeBal = 20000;
  let wBal = 20000;
  let matchesBurned = 0;
  let inMatchBurn = false;
  const half = n >> 1;
  let efSum1 = 0;
  let efSum2 = 0;
  const qCounts: [number, number, number, number] = [0, 0, 0, 0];
  const thresholdCad = 88;
  const thresholdTorque = cpBase / thresholdCad;

  for (let i = 0; i < n; i++) {
    const p = inPwrArr[i];
    const cad = Math.max(1, inCadArr[i]);
    const invH = inHrArr[i];
    const diff = p - cpBase;
    const dcp = diff < 0 ? -diff : 0;
    const dep = diff > 0 ? diff : 0;
    const expFactor = Math.exp(-0.008 * (dcp + dep * 0.625));
    const tauDyn = 546 * expFactor + 316;
    wBal = Math.min(20000, wBal - dep + (20000 - wBal) * (1 / tauDyn));
    if (wBal < minWPrimeBal) minWPrimeBal = wBal;

    if (wBal < 15500 && !inMatchBurn) {
      inMatchBurn = true;
      matchesBurned++;
    } else if (wBal > 17500 && inMatchBurn) {
      inMatchBurn = false;
    }

    const torque = p / cad;
    if (torque >= thresholdTorque && cad >= thresholdCad) qCounts[0]++;
    else if (torque >= thresholdTorque && cad < thresholdCad) qCounts[1]++;
    else if (torque < thresholdTorque && cad < thresholdCad) qCounts[2]++;
    else qCounts[3]++;

    const ef = p * invH;
    if (i < half) efSum1 += ef;
    else efSum2 += ef;
  }

  const ef1 = half > 0 ? efSum1 / half : 1;
  const ef2 = n - half > 0 ? efSum2 / (n - half) : 1;
  const decouplingPct = ef1 > 0 ? ((ef1 - ef2) / ef1) * 100 : 0;
  const quadrantPct: [number, number, number, number] = [
    Number(((qCounts[0] / n) * 100).toFixed(1)),
    Number(((qCounts[1] / n) * 100).toFixed(1)),
    Number(((qCounts[2] / n) * 100).toFixed(1)),
    Number(((qCounts[3] / n) * 100).toFixed(1)),
  ];

  const activeSections =
    sections && sections.length > 0
      ? sections.filter(
          (sec) => sec.kind === 'quarter' || sec.kind === 'climb' || sec.kind === 'sprint',
        )
      : [];

  const sectionPeaks = activeSections.slice(0, 8).map((sec) => {
    const st = sec.stats;
    const durHours = st.duration && st.duration > 0 ? st.duration / 3600000 : 0;
    return {
      label: sec.label,
      distKm: Number((st.totalDist / 1000).toFixed(2)),
      avgPower: st.avgPower || 0,
      peak60sPower: st.powerCurve?.[60]?.power || st.avgPower || 0,
      avgHR: st.avgHR || 0,
      vam: durHours > 0 ? Math.round(st.elevGain / durHours) : 0,
    };
  });

  if (envelopeChecksum < -1e12) minWPrimeBal = 0;
  return {
    minWPrimeBal,
    matchesBurned,
    decouplingPct,
    quadrantPct,
    sectionPeaks,
  };
}

export interface CurveTableRow {
  dur: number;
  durationLabel: string;
  val: number;
  idx: number;
}

export interface ZoneBarRow {
  zoneLabel: string;
  name: string;
  rangeText: string;
  timeStr: string;
  pct: number;
  pctStr: string;
  color: string;
}

export interface InsightCourseRow {
  id: string;
  name: string;
  hasSegment: boolean;
  dateStr: string;
  timeStr: string;
  speedStr: string;
  paceStr: string;
  sportIcon: string;
  sportTitle: string;
  powerStr: string;
  hrStr: string;
  cadStr: string;
}

let activeInsightsComponent: InsightsTabComponent | null = null;
let externalToastFn: ((msg: string, type?: string) => void) | null = null;

export function getActiveInsightsComponent(): InsightsTabComponent | null {
  return activeInsightsComponent || (window as any).__trackStateService?.insightsTab || null;
}

export function setInsightsToastFn(fn: (msg: string, type?: string) => void) {
  externalToastFn = fn;
}

@Component({
  selector: 'app-insights-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div id="insights-view">
      <div *ngIf="isResetState" id="insights-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for insights</div>
      </div>

      <div *ngIf="!isResetState && hasTrack && !hasInsights" class="empty-state">
        <span class="material-symbols-rounded empty-icon">analytics</span>
        <div class="empty-text">
          No insights available for this track (requires Power or Heart Rate data)
        </div>
      </div>

      <div
        *ngIf="!isResetState && hasTrack && hasInsights"
        class="insights-grid"
        id="insights-grid"
        #insightsGrid
        [attr.data-w-prime-min]="wPrimeMinAttr"
        [attr.data-matches]="matchesBurned"
      >
        <!-- Power Curve Card -->
        <div
          *ngIf="powerCurveRows.length > 0"
          class="insight-card"
          [style.--chart-color]="powerColor"
        >
          <div
            style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px"
          >
            <div style="display:flex; align-items:center; gap:8px">
              <div class="insight-title" style="margin-bottom:0">
                <span class="material-symbols-rounded" [style.color]="powerColor">bolt</span>Power
                Curve
              </div>
              <button
                class="map-color-btn icon-btn mini"
                [class.active]="mapColorMetric === 'power'"
                data-metric="power"
                title="Color map by this metric"
                (click)="onToggleMapColor('power', $event)"
              >
                <span class="material-symbols-rounded font-l">colorize</span>
              </button>
            </div>
            <button
              class="icon-btn mini btn-toggle-table"
              title="Toggle Data Table"
              (click)="powerTableExpanded = !powerTableExpanded"
            >
              <span class="material-symbols-rounded font-l">{{
                powerTableExpanded ? 'expand_less' : 'expand_more'
              }}</span>
            </button>
          </div>
          <div
            id="power-curve-chart"
            #powerCurveChart
            class="insight-chart-container"
            style="position: relative"
          >
            <div
              class="cur-y-val"
              #powerCurYVal
              [style.color]="powerColor"
              [style.borderColor]="powerColor + '44'"
              style="display:none"
            ></div>
          </div>
          <div
            class="curve-table-wrap"
            [style.display]="powerTableExpanded ? 'block' : 'none'"
            style="margin-top:16px; border-top:1px solid var(--border); padding-top:16px"
          >
            <table class="power-curve-table">
              <thead>
                <tr>
                  <th>Duration</th>
                  <th style="text-align:right">Peak</th>
                  <th style="width:32px"></th>
                </tr>
              </thead>
              <tbody class="curve-tbody">
                <tr *ngFor="let row of powerCurveRows">
                  <td>{{ row.durationLabel }}</td>
                  <td class="power-curve-val">{{ row.val }} W</td>
                  <td style="text-align:right">
                    <button
                      class="icon-btn mini btn-show-peak"
                      title="Highlight on Map"
                      [attr.data-idx]="row.idx"
                      [attr.data-len]="row.dur"
                      (click)="onShowPeak(row.idx, row.dur)"
                    >
                      <span class="material-symbols-rounded font-l">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Heart Rate Curve Card -->
        <div *ngIf="hrCurveRows.length > 0" class="insight-card" [style.--chart-color]="hrColor">
          <div
            style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px"
          >
            <div style="display:flex; align-items:center; gap:8px">
              <div class="insight-title" style="margin-bottom:0">
                <span class="material-symbols-rounded" [style.color]="hrColor">favorite</span>Heart
                Rate Curve
              </div>
              <button
                class="map-color-btn icon-btn mini"
                [class.active]="mapColorMetric === 'hr'"
                data-metric="hr"
                title="Color map by this metric"
                (click)="onToggleMapColor('hr', $event)"
              >
                <span class="material-symbols-rounded font-l">colorize</span>
              </button>
            </div>
            <button
              class="icon-btn mini btn-toggle-table"
              title="Toggle Data Table"
              (click)="hrTableExpanded = !hrTableExpanded"
            >
              <span class="material-symbols-rounded font-l">{{
                hrTableExpanded ? 'expand_less' : 'expand_more'
              }}</span>
            </button>
          </div>
          <div
            id="hr-curve-chart"
            #hrCurveChart
            class="insight-chart-container"
            style="position: relative"
          >
            <div
              class="cur-y-val"
              #hrCurYVal
              [style.color]="hrColor"
              [style.borderColor]="hrColor + '44'"
              style="display:none"
            ></div>
          </div>
          <div
            class="curve-table-wrap"
            [style.display]="hrTableExpanded ? 'block' : 'none'"
            style="margin-top:16px; border-top:1px solid var(--border); padding-top:16px"
          >
            <table class="power-curve-table">
              <thead>
                <tr>
                  <th>Duration</th>
                  <th style="text-align:right">Peak</th>
                  <th style="width:32px"></th>
                </tr>
              </thead>
              <tbody class="curve-tbody">
                <tr *ngFor="let row of hrCurveRows">
                  <td>{{ row.durationLabel }}</td>
                  <td class="power-curve-val">{{ row.val }} bpm</td>
                  <td style="text-align:right">
                    <button
                      class="icon-btn mini btn-show-peak"
                      title="Highlight on Map"
                      [attr.data-idx]="row.idx"
                      [attr.data-len]="row.dur"
                      (click)="onShowPeak(row.idx, row.dur)"
                    >
                      <span class="material-symbols-rounded font-l">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Power Zones Card -->
        <div
          *ngIf="powerZoneRows.length > 0"
          class="insight-card"
          [style.--chart-color]="powerColor"
        >
          <div
            style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px"
          >
            <div style="display:flex; align-items:center; gap:8px">
              <div class="insight-title" style="margin-bottom:0">
                <span class="material-symbols-rounded" [style.color]="powerColor">bolt</span>Power
                Zones
              </div>
              <button
                class="map-color-btn icon-btn mini"
                [class.active]="mapColorMetric === 'power'"
                data-metric="power"
                title="Color map by this metric"
                (click)="onToggleMapColor('power', $event)"
              >
                <span class="material-symbols-rounded font-l">colorize</span>
              </button>
            </div>
            <button
              class="icon-btn mini btn-pw-settings"
              title="Configure FTP"
              (click)="onShowPowerZoneSettings($event)"
            >
              <span class="material-symbols-rounded font-l">settings</span>
            </button>
          </div>
          <div style="padding: 5px 0">
            <div *ngFor="let z of powerZoneRows" style="margin-bottom:12px">
              <div
                class="font-m"
                style="display:flex; align-items:baseline; margin-bottom:4px; gap:8px"
              >
                <span style="font-weight:800; color:var(--text); width:20px">{{
                  z.zoneLabel
                }}</span>
                <span
                  style="font-weight:600; color:var(--text-muted); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis"
                  >{{ z.name }}</span
                >
                <span class="font-s" style="color:var(--text-dim); width:80px; text-align:right">{{
                  z.rangeText
                }}</span>
                <span
                  style="color:var(--text); width:70px; text-align:right; font-variant-numeric: tabular-nums"
                  >{{ z.timeStr }}</span
                >
                <span
                  class="font-s"
                  style="color:var(--text-dim); width:45px; text-align:right; font-variant-numeric: tabular-nums"
                  >{{ z.pctStr }}%</span
                >
              </div>
              <div
                style="height:8px; background:var(--surface); border-radius:4px; overflow:hidden"
              >
                <div style="height:100%" [style.width.%]="z.pct" [style.background]="z.color"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Heart Rate Zones Card -->
        <div *ngIf="hrZoneRows.length > 0" class="insight-card" [style.--chart-color]="hrColor">
          <div
            style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px"
          >
            <div style="display:flex; align-items:center; gap:8px">
              <div class="insight-title" style="margin-bottom:0">
                <span class="material-symbols-rounded" [style.color]="hrColor">favorite</span>Heart
                Rate Zones
              </div>
              <button
                class="map-color-btn icon-btn mini"
                [class.active]="mapColorMetric === 'hr'"
                data-metric="hr"
                title="Color map by this metric"
                (click)="onToggleMapColor('hr', $event)"
              >
                <span class="material-symbols-rounded font-l">colorize</span>
              </button>
            </div>
            <button
              class="icon-btn mini btn-hr-settings"
              title="Configure HR Zones"
              (click)="onShowHRZoneSettings($event)"
            >
              <span class="material-symbols-rounded font-l">settings</span>
            </button>
          </div>
          <div style="padding: 5px 0">
            <div *ngFor="let z of hrZoneRows" style="margin-bottom:12px">
              <div
                class="font-m"
                style="display:flex; align-items:baseline; margin-bottom:4px; gap:8px"
              >
                <span style="font-weight:800; color:var(--text); width:20px">{{
                  z.zoneLabel
                }}</span>
                <span
                  style="font-weight:600; color:var(--text-muted); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis"
                  >{{ z.name }}</span
                >
                <span class="font-s" style="color:var(--text-dim); width:95px; text-align:right">{{
                  z.rangeText
                }}</span>
                <span
                  style="color:var(--text); width:70px; text-align:right; font-variant-numeric: tabular-nums"
                  >{{ z.timeStr }}</span
                >
                <span
                  class="font-s"
                  style="color:var(--text-dim); width:45px; text-align:right; font-variant-numeric: tabular-nums"
                  >{{ z.pctStr }}%</span
                >
              </div>
              <div
                style="height:8px; background:var(--surface); border-radius:4px; overflow:hidden"
              >
                <div style="height:100%" [style.width.%]="z.pct" [style.background]="z.color"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Climbing Analysis Card -->
        <div class="insight-card">
          <div class="insight-title">
            <span class="material-symbols-rounded" [style.color]="elevColor">terrain</span>Climbing
            Analysis
          </div>
          <div
            class="details-grid"
            style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px"
          >
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">Total Ascent</div>
              <div class="details-card-value font-l">{{ climbingStats.elevGain }} m</div>
            </div>
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">Total Descent</div>
              <div class="details-card-value font-l">{{ climbingStats.elevLoss }} m</div>
            </div>
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">Avg Grade</div>
              <div class="details-card-value font-l">{{ climbingStats.grade }} %</div>
            </div>
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">VAM</div>
              <div class="details-card-value font-l">{{ climbingStats.vam }} m/h</div>
            </div>
          </div>
        </div>

        <!-- Efficiency, KPIs & W' Balance Card -->
        <div *ngIf="hasEfficiency" class="insight-card">
          <div
            style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px"
          >
            <div class="insight-title" style="margin-bottom:0">
              <span class="material-symbols-rounded" style="color:var(--accent)">monitoring</span
              >Efficiency &amp; W' Balance
            </div>
            <span
              class="badge font-s"
              style="background:var(--surface3); padding:2px 6px; border-radius:4px"
              >{{ sectionRangeBadge }}</span
            >
          </div>
          <div
            class="details-grid"
            style="grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px"
          >
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">EF (Avg Power / Avg HR)</div>
              <div class="details-card-value font-l">{{ efficiencyStats.ef }}</div>
            </div>
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">Aerobic Decoupling</div>
              <div class="details-card-value font-l">{{ efficiencyStats.decoupling }} %</div>
            </div>
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">Min W' Reserve</div>
              <div class="details-card-value font-l">
                {{ efficiencyStats.wPrimeKj }} kJ ({{ matchesBurned }} matches)
              </div>
            </div>
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">Quadrants (Q1/Q2/Q3/Q4)</div>
              <div class="details-card-value font-m">{{ efficiencyStats.quadrantsText }}</div>
            </div>
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">NP / IF / VI</div>
              <div class="details-card-value font-m">
                {{ efficiencyStats.np }} W · {{ efficiencyStats.ifVal }} · {{ efficiencyStats.vi }}
              </div>
            </div>
            <div class="details-card" style="padding: 12px">
              <div class="details-card-label font-s">TSS / Work</div>
              <div class="details-card-value font-m">
                {{ efficiencyStats.tss }} TSS · {{ efficiencyStats.workKj }} kJ
              </div>
            </div>
          </div>
        </div>

        <!-- Track Section & Climb Efforts Card -->
        <div *ngIf="sectionPeaks.length > 0" class="insight-card">
          <div class="insight-title">
            <span class="material-symbols-rounded" [style.color]="powerColor">segment</span>Track
            Section &amp; Climb Efforts
          </div>
          <table
            class="course-tracks-table"
            style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px;"
          >
            <thead>
              <tr>
                <th style="text-align:left; padding:4px">Section</th>
                <th style="text-align:right; padding:4px">Dist</th>
                <th style="text-align:right; padding:4px">Avg W</th>
                <th style="text-align:right; padding:4px">Peak 60s</th>
                <th style="text-align:right; padding:4px">Avg HR</th>
                <th style="text-align:right; padding:4px">VAM</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let sp of sectionPeaks"
                style="border-bottom: 1px solid var(--border-dim);"
              >
                <td style="padding:4px; font-weight:600">{{ sp.label }}</td>
                <td style="padding:4px; text-align:right">{{ sp.distKm }} km</td>
                <td style="padding:4px; text-align:right">{{ sp.avgPower }} W</td>
                <td style="padding:4px; text-align:right">{{ sp.peak60sPower }} W</td>
                <td style="padding:4px; text-align:right">{{ sp.avgHR }} bpm</td>
                <td style="padding:4px; text-align:right">{{ sp.vam }} m/h</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Courses Matched-Effort Card -->
        <div
          *ngIf="courseRows.length > 0"
          class="insight-card"
          style="column-span: all; display: block;"
        >
          <div class="insight-title">
            <span class="material-symbols-rounded">route</span>Courses ({{ courseRows.length }})
          </div>
          <div class="course-tracks-table-container" style="margin-top: 8px;">
            <table class="course-tracks-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Speed</th>
                  <th>Pace</th>
                  <th>Sport</th>
                  <th title="Power"><span class="material-symbols-rounded">bolt</span></th>
                  <th title="Heart Rate"><span class="material-symbols-rounded">favorite</span></th>
                  <th title="Cadence"><span class="material-symbols-rounded">footprint</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let c of courseRows"
                  class="course-track-row clickable-course"
                  [attr.data-id]="c.id"
                  style="border-bottom: 1px solid var(--border-dim); cursor: pointer;"
                  (click)="onSelectCourse(c.id)"
                  (mouseenter)="onHoverCourse(c.id)"
                  (mouseleave)="onLeaveCourse()"
                >
                  <td class="track-name-cell" style="padding: 8px;">
                    <div style="display: flex; align-items: center;">
                      <div
                        style="background:var(--accent); width: 3px; height: 16px; margin-right: 8px; border-radius: 1px; flex-shrink: 0;"
                      ></div>
                      {{ c.name }}
                    </div>
                  </td>
                  <ng-container *ngIf="c.hasSegment; else noSegmentTpl">
                    <td style="padding: 8px; text-align: center; color: var(--text-dim);">
                      {{ c.dateStr }}
                    </td>
                    <td style="padding: 8px; text-align: center; font-weight: 600;">
                      {{ c.timeStr }}
                    </td>
                    <td style="padding: 8px; text-align: center;">{{ c.speedStr }}</td>
                    <td style="padding: 8px; text-align: center;">{{ c.paceStr }}</td>
                    <td style="padding: 8px; text-align: center;">
                      <span
                        class="material-symbols-rounded"
                        style="font-size: 16px; color: var(--text-dim)"
                        [title]="c.sportTitle"
                        >{{ c.sportIcon }}</span
                      >
                    </td>
                    <td style="padding: 8px; text-align: center;">{{ c.powerStr }}</td>
                    <td style="padding: 8px; text-align: center;">{{ c.hrStr }}</td>
                    <td style="padding: 8px; text-align: center;">{{ c.cadStr }}</td>
                  </ng-container>
                  <ng-template #noSegmentTpl>
                    <td
                      colspan="8"
                      class="font-m"
                      style="color:var(--text-dim); text-align:center; padding: 8px;"
                    >
                      No continuous segment
                    </td>
                  </ng-template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InsightsTabComponent implements OnInit, OnDestroy {
  public state = inject(TrackStateService);
  private cdr = inject(ChangeDetectorRef);
  private elRef = inject(ElementRef<HTMLElement>);

  @ViewChild('insightsGrid') insightsGridRef?: ElementRef<HTMLElement>;
  @ViewChild('powerCurveChart') powerCurveChartRef?: ElementRef<HTMLElement>;
  @ViewChild('powerCurYVal') powerCurYValRef?: ElementRef<HTMLElement>;
  @ViewChild('hrCurveChart') hrCurveChartRef?: ElementRef<HTMLElement>;
  @ViewChild('hrCurYVal') hrCurYValRef?: ElementRef<HTMLElement>;

  isResetState = true;
  hasTrack = false;
  hasInsights = false;
  currentTrack: TrackData | null = null;
  allTracks: TrackData[] = [];

  powerColor = Metrics.power.color;
  hrColor = Metrics.hr.color;
  elevColor = Metrics.elevation.color;
  mapColorMetric: string | null = null;

  powerTableExpanded = false;
  hrTableExpanded = false;

  wPrimeMinAttr = '20000';
  matchesBurned = 0;
  sectionRangeBadge = 'Full Track';

  powerCurveRows: CurveTableRow[] = [];
  hrCurveRows: CurveTableRow[] = [];
  powerZoneRows: ZoneBarRow[] = [];
  hrZoneRows: ZoneBarRow[] = [];

  climbingStats = {
    elevGain: 0,
    elevLoss: 0,
    grade: '0.0',
    vam: 0,
  };

  hasEfficiency = false;
  efficiencyStats = {
    ef: '0.00',
    decoupling: '0.0',
    wPrimeKj: '20.0',
    quadrantsText: '25% / 25% / 25% / 25%',
    np: 0,
    ifVal: '0.00',
    vi: '1.00',
    tss: 0,
    workKj: 0,
  };

  sectionPeaks: SectionPhysiologySummary['sectionPeaks'] = [];
  courseRows: InsightCourseRow[] = [];

  private insightPlots: uPlot[] = [];
  private activeStats: TrackStats | null = null;

  constructor() {
    this.state.insightsTab = this;
    activeInsightsComponent = this;
  }

  ngOnInit(): void {
    this.state.insightsTab = this;
    activeInsightsComponent = this;
  }

  ngOnDestroy(): void {
    this.destroyPlots();
    if (activeInsightsComponent === this) {
      activeInsightsComponent = null;
    }
  }

  private showToast(msg: string, type?: string): void {
    if (externalToastFn) {
      externalToastFn(msg, type);
    } else {
      this.state.showToast(msg, type === 'error' ? 'error' : 'info');
    }
  }

  destroyPlots(): void {
    this.insightPlots.forEach((p) => p.destroy());
    this.insightPlots = [];
  }

  reset(): void {
    this.destroyPlots();
    document
      .querySelectorAll('.hr-settings-popup, .pw-settings-popup')
      .forEach((el) => el.remove());
    this.isResetState = true;
    this.hasTrack = false;
    this.hasInsights = false;
    this.currentTrack = null;
    this.activeStats = null;
    this.powerCurveRows = [];
    this.hrCurveRows = [];
    this.powerZoneRows = [];
    this.hrZoneRows = [];
    this.sectionPeaks = [];
    this.courseRows = [];
    this.cdr.detectChanges();
  }

  render(
    track: TrackData | null,
    allTracks: TrackData[] = [],
    sectionRange: [number, number] | null = null,
  ): void {
    this.destroyPlots();
    this.currentTrack = track;
    this.allTracks = allTracks;
    this.isResetState = false;

    if (!track) {
      this.hasTrack = false;
      this.hasInsights = false;
      this.activeStats = null;
      this.cdr.detectChanges();
      return;
    }

    this.hasTrack = true;
    Parsers.ensureCurvesAndZones(track);
    if (!track.stats.sections) {
      track.stats.sections = Parsers.analyzeTrackSections(track.points);
    }

    const activeRange = sectionRange || UrlState.get().sel || null;
    let activePts = track.points;
    let s = track.stats;
    if (activeRange && track.points.length > 4) {
      const t0 = track.points[0].time || 0;
      const startMs = t0 + activeRange[0] * 1000;
      const endMs = t0 + activeRange[1] * 1000;
      let iMin = track.points.findIndex((p) => (p.time || 0) >= startMs);
      let iMax = track.points.findIndex((p) => (p.time || 0) >= endMs);
      if (iMin === -1) iMin = 0;
      if (iMax === -1) iMax = track.points.length - 1;
      if (iMax > iMin + 4) {
        activePts = track.points.slice(iMin, iMax + 1);
        s = Parsers.computeStats(activePts, true);
      }
    }

    this.activeStats = s;
    if (!s.powerCurve && !s.hrZones && !s.hrCurve) {
      this.hasInsights = false;
      this.cdr.detectChanges();
      return;
    }

    this.hasInsights = true;
    this.mapColorMetric = ChartView.getMapColorMetric();
    this.powerTableExpanded = false;
    this.hrTableExpanded = false;
    this.sectionRangeBadge = activeRange
      ? `${fmtSecs(Math.round(activeRange[0]))} – ${fmtSecs(Math.round(activeRange[1]))}`
      : 'Full Track';

    const ftp = Parsers.getFTP();
    const phys = analyzeTrackPhysiology(activePts, ftp, track.stats.sections);
    this.wPrimeMinAttr = phys.minWPrimeBal.toFixed(0);
    this.matchesBurned = phys.matchesBurned;

    // Power Curve rows
    if (s.powerCurve) {
      const durations = Object.keys(s.powerCurve)
        .map(Number)
        .sort((a, b) => a - b);
      this.powerCurveRows = durations.map((d) => {
        const entry = (s.powerCurve as any)[d];
        const val = entry.power || entry.hr || entry.val || 0;
        return {
          dur: d,
          durationLabel: fmtDuration(d),
          val,
          idx: entry.idx,
        };
      });
    } else {
      this.powerCurveRows = [];
    }

    // HR Curve rows
    if (s.hrCurve) {
      const durations = Object.keys(s.hrCurve)
        .map(Number)
        .sort((a, b) => a - b);
      this.hrCurveRows = durations.map((d) => {
        const entry = (s.hrCurve as any)[d];
        const val = entry.power || entry.hr || entry.val || 0;
        return {
          dur: d,
          durationLabel: fmtDuration(d),
          val,
          idx: entry.idx,
        };
      });
    } else {
      this.hrCurveRows = [];
    }

    // Power Zones
    if (s.powerZones) {
      const totalTime = s.powerZones.reduce((a, b) => a + b, 0);
      const zones = Zones.getPowerZones();
      const rows: ZoneBarRow[] = [];
      s.powerZones.forEach((time, i) => {
        if (i >= zones.length) return;
        const z = zones[i];
        const pct = totalTime > 0 ? (time / totalTime) * 100 : 0;
        const rangeText = isFinite(z.max)
          ? `${Math.round(z.min)} - ${Math.round(z.max)} W`
          : `> ${Math.round(z.min)} W`;
        rows.push({
          zoneLabel: `Z${i + 1}`,
          name: z.name,
          rangeText,
          timeStr: fmtSecs(Math.round(time)),
          pct,
          pctStr: pct.toFixed(1),
          color: z.color,
        });
      });
      this.powerZoneRows = rows;
    } else {
      this.powerZoneRows = [];
    }

    // HR Zones
    if (s.hrZones) {
      const totalTime = s.hrZones.reduce((a, b) => a + b, 0);
      const zones = Zones.getHRZones();
      const rows: ZoneBarRow[] = [];
      s.hrZones.forEach((time, i) => {
        if (i >= zones.length) return;
        const z = zones[i];
        const pct = totalTime > 0 ? (time / totalTime) * 100 : 0;
        const rangeText = isFinite(z.max)
          ? `${Math.round(z.min)} - ${Math.round(z.max)} bpm`
          : `> ${Math.round(z.min)} bpm`;
        rows.push({
          zoneLabel: `Z${i + 1}`,
          name: z.name,
          rangeText,
          timeStr: fmtSecs(Math.round(time)),
          pct,
          pctStr: pct.toFixed(1),
          color: z.color,
        });
      });
      this.hrZoneRows = rows;
    } else {
      this.hrZoneRows = [];
    }

    // Climbing stats
    const distKm = s.totalDist / 1000;
    const grade = distKm > 0 ? (s.elevGain / (distKm * 1000)) * 100 : 0;
    this.climbingStats = {
      elevGain: Math.round(s.elevGain),
      elevLoss: Math.round(s.elevLoss),
      grade: grade.toFixed(1),
      vam: s.duration && s.duration > 0 ? Math.round((s.elevGain / s.duration) * 3600000) : 0,
    };

    // Efficiency & KPIs
    if (s.avgPower && s.avgHR) {
      this.hasEfficiency = true;
      const ef = s.avgPower / s.avgHR;
      const np = Math.round(
        s.avgPower *
          (1 +
            Math.min(
              0.22,
              Math.abs(phys.decouplingPct) * 0.005 +
                (s.maxPower > s.avgPower
                  ? ((s.maxPower - s.avgPower) / Math.max(100, s.maxPower)) * 0.08
                  : 0.04),
            )),
      );
      const vi = s.avgPower > 0 ? (np / s.avgPower).toFixed(2) : '1.00';
      const ifVal = ftp > 0 ? (np / ftp).toFixed(2) : '0.00';
      const durSecs = s.duration ? s.duration / 1000 : activePts.length;
      const tss =
        ftp > 0 && durSecs > 0 ? Math.round(((durSecs * np * (np / ftp)) / (ftp * 3600)) * 100) : 0;
      const workKj = Math.round((s.avgPower * durSecs) / 1000);

      this.efficiencyStats = {
        ef: ef.toFixed(2),
        decoupling: phys.decouplingPct.toFixed(1),
        wPrimeKj: (phys.minWPrimeBal / 1000).toFixed(1),
        quadrantsText: `${phys.quadrantPct.join('% / ')}%`,
        np,
        ifVal,
        vi,
        tss,
        workKj,
      };
    } else {
      this.hasEfficiency = false;
    }

    this.sectionPeaks = phys.sectionPeaks;

    // Courses for this track
    const trackCourses = getCoursesForTrack(track);
    this.courseRows = trackCourses.map((c) => {
      const range = findCourseRange(track, c.points);
      if (range) {
        const stats = calculateCourseStats(track, range.startIdx, range.endIdx);
        const startTime = track.stats?.startTime || track.points?.[0]?.time;
        const dateStr = startTime ? fmtDate(startTime) : '-';
        const timeStr = stats.duration ? fmtSecs(Math.round(stats.duration / 1000)) : '-';
        const speedStr = stats.avgSpeed ? `${(stats.avgSpeed * 3.6).toFixed(1)} km/h` : '-';
        const paceStr = stats.avgSpeed ? `${fmtPace(1000 / stats.avgSpeed)} /km` : '-';
        const sportKey = track.sport ? track.sport.toLowerCase() : '';
        const sportDef = SPORTS[sportKey];
        const sportIcon = sportDef ? sportDef.icon : 'help';
        const sportTitle = sportDef ? sportDef.name : track.sport || 'Unknown';
        return {
          id: c.id,
          name: c.name,
          hasSegment: true,
          dateStr,
          timeStr,
          speedStr,
          paceStr,
          sportIcon,
          sportTitle,
          powerStr: stats.avgWatts ? `${stats.avgWatts} W` : '-',
          hrStr: stats.avgHR ? `${stats.avgHR} bpm` : '-',
          cadStr: stats.avgCadence ? `${stats.avgCadence} rpm` : '-',
        };
      }
      return {
        id: c.id,
        name: c.name,
        hasSegment: false,
        dateStr: '-',
        timeStr: '-',
        speedStr: '-',
        paceStr: '-',
        sportIcon: 'help',
        sportTitle: 'Unknown',
        powerStr: '-',
        hrStr: '-',
        cadStr: '-',
      };
    });

    // Trigger Angular change detection synchronously so DOM containers are created before uPlot mounts
    this.cdr.detectChanges();

    this.mountCurveCharts(track, s);
  }

  private mountCurveCharts(track: TrackData, s: TrackStats): void {
    const gridEl =
      this.insightsGridRef?.nativeElement ||
      (this.elRef.nativeElement.querySelector('#insights-grid') as HTMLElement | null);
    if (!gridEl) return;

    const chartWidth = Math.round(gridEl.getBoundingClientRect().width - 42) || 480;

    if (s.powerCurve && this.powerCurveRows.length > 0) {
      const chartEl =
        this.powerCurveChartRef?.nativeElement ||
        (gridEl.querySelector('#power-curve-chart') as HTMLElement | null);
      const curYValEl =
        this.powerCurYValRef?.nativeElement ||
        (chartEl?.querySelector('.cur-y-val') as HTMLElement | null);
      if (chartEl && curYValEl) {
        this.createCurvePlot({
          chartEl,
          curYValEl,
          gridEl,
          track,
          curve: s.powerCurve,
          rows: this.powerCurveRows,
          metricKey: 'power',
          label: 'Power Curve',
          unit: 'W',
          color: this.powerColor,
          chartWidth,
        });
      }
    }

    if (s.hrCurve && this.hrCurveRows.length > 0) {
      const chartEl =
        this.hrCurveChartRef?.nativeElement ||
        (gridEl.querySelector('#hr-curve-chart') as HTMLElement | null);
      const curYValEl =
        this.hrCurYValRef?.nativeElement ||
        (chartEl?.querySelector('.cur-y-val') as HTMLElement | null);
      if (chartEl && curYValEl) {
        this.createCurvePlot({
          chartEl,
          curYValEl,
          gridEl,
          track,
          curve: s.hrCurve,
          rows: this.hrCurveRows,
          metricKey: 'hr',
          label: 'Heart Rate Curve',
          unit: 'bpm',
          color: this.hrColor,
          chartWidth,
        });
      }
    }
  }

  private createCurvePlot(opts: {
    chartEl: HTMLElement;
    curYValEl: HTMLElement;
    gridEl: HTMLElement;
    track: TrackData;
    curve: any;
    rows: CurveTableRow[];
    metricKey: string;
    label: string;
    unit: string;
    color: string;
    chartWidth: number;
  }): void {
    const { chartEl, curYValEl, gridEl, track, curve, rows, metricKey, label, unit, color } = opts;
    const xData = rows.map((r) => r.dur);
    const yData = rows.map((r) => r.val);

    // Clear previous uPlot root if any while preserving curYValEl
    chartEl.querySelectorAll('.uplot').forEach((el) => el.remove());

    const uOpts: uPlot.Options = {
      id: `${metricKey}-curve`,
      width:
        opts.chartWidth ||
        Math.round(gridEl.getBoundingClientRect().width - 42) ||
        chartEl.clientWidth ||
        500,
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
        dataIdx: (_u, _seriesIdx, dataIdx) => dataIdx,
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
                if (entry) {
                  this.onShowPeak(entry.idx, duration);
                }
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

            const hasFocus = idx != null && yData[idx] != null && u.cursor.left! >= 0;
            const mousePy = u.cursor.top!;
            const pointPy = hasFocus ? u.valToPos(yData[idx!]!, 'y', false) : 0;
            const isNear = hasFocus && Math.abs(mousePy - pointPy) < 40;

            if (isNear) {
              const cx = u.valToPos(xData[idx!]!, 'x', false);
              const cy = u.valToPos(yData[idx!]!, 'y', false);

              const durVal = xData[idx!];
              curYValEl.innerHTML = `${fmtDuration(durVal)}: ${yData[idx!]} ${unit}`;
              curYValEl.style.transform = `translate(${cx}px, ${cy}px) translate(15px, 15px)`;
              curYValEl.style.display = '';

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
              curYValEl.style.display = 'none';
            }
          },
        ],
      },
      legend: { show: false },
    };

    const plot = new uPlot(uOpts, [xData, yData], chartEl);
    (plot as any)._ready = true;
    this.insightPlots.push(plot);
  }

  onToggleMapColor(metricKey: string, event: MouseEvent): void {
    event.stopPropagation();
    ChartView.toggleMapColor(metricKey);
    this.mapColorMetric = ChartView.getMapColorMetric();
    this.cdr.detectChanges();
  }

  onShowPeak(startIdx: number, duration: number): void {
    if (!this.currentTrack) return;
    const pts = this.currentTrack.points;
    const endIdx = Math.min(pts.length - 1, startIdx + duration - 1);
    const t0 = pts[0]?.time || 0;
    const tMin = ((pts[startIdx]?.time || t0) - t0) / 1000;
    const tMax = ((pts[endIdx]?.time || t0) - t0) / 1000;

    UrlState.patch({ sel: [tMin, tMax] });
    MapView.highlightSegment(this.currentTrack.id, pts, startIdx, endIdx, true);
  }

  onSelectCourse(courseId: string): void {
    selectCourse(courseId, true);
    UrlState.patch({ tab: 'courses' }, true);
    this.state.activateTab('courses', true);
  }

  onHoverCourse(courseId: string): void {
    if (!this.currentTrack) return;
    const trackCourses = getCoursesForTrack(this.currentTrack);
    const c = trackCourses.find((course) => course.id === courseId);
    if (c) {
      const range = findCourseRange(this.currentTrack, c.points);
      if (range) {
        MapView.highlightSegment(
          this.currentTrack.id,
          this.currentTrack.points,
          range.startIdx,
          range.endIdx,
          false,
        );
      }
    }
  }

  onLeaveCourse(): void {
    MapView.clearHighlight();
  }

  onShowHRZoneSettings(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.currentTrack) return;
    const anchorEl = event.currentTarget as HTMLElement;
    const track = this.currentTrack;

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
          this.showToast('Zones must be in ascending order', 'error');
          return;
        }
      }

      Parsers.setHRZones(newZones);
      await Storage.set('hr_zones', newZones);

      track.stats = Parsers.computeStats(track.points, true);
      await Storage.save(track);

      this.render(track, this.allTracks);
      popup.remove();
      this.showToast('HR Zones updated');
    });

    const dismiss = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
        popup.remove();
        document.removeEventListener('click', dismiss);
      }
    };
    setTimeout(() => document.addEventListener('click', dismiss), 10);
  }

  onShowPowerZoneSettings(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.currentTrack) return;
    const anchorEl = event.currentTarget as HTMLElement;
    const track = this.currentTrack;

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

      this.render(track, this.allTracks);
      popup.remove();
      this.showToast(`FTP updated to ${newFtp}W`);
    });

    const dismiss = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
        popup.remove();
        document.removeEventListener('click', dismiss);
      }
    };
    setTimeout(() => document.addEventListener('click', dismiss), 10);
  }
}
