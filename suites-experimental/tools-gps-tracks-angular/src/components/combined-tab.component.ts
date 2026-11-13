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
import { TrackData, TrackPoint } from '../parsers';
import { ChartView } from '../charts';
import { hexToRgba, fmtSecs } from '../utils';
import { TrackStateService } from '../services/track-state.service';

const COMBINED_CAP = 16384;
const combinedDensityGrid = new Float64Array(32 * 32);

export interface CombinedCorrelationRow {
  pairLabel: string;
  rVal: number;
  rValStr: string;
  slope: number;
  slopeStr: string;
  samples: number;
}

export interface CombinedSectionComparisonRow {
  sectionLabel: string;
  t1Power: number;
  t2Power: number;
  t1Hr: number;
  t2Hr: number;
  t1SpeedKmh: number;
  t1SpeedStr: string;
  t2SpeedKmh: number;
  t2SpeedStr: string;
  pwrDelta: number;
  pwrDeltaStr: string;
  cohortAvgPower: number;
}

export interface AggregateComparisonSummary {
  aggPts: number;
  corrScore: string;
  t1Name: string;
  t1Color: string;
  t2Name: string;
  t2Color: string;
  s1DistKm: string;
  s2DistKm: string;
  distDiff: string;
  distDiffPos: boolean;
  totalDist: string;
  s1Elev: string;
  s2Elev: string;
  eleDiff: string;
  eleDiffPos: boolean;
  totalElev: string;
  s1DurStr: string;
  s2DurStr: string;
  totalDurStr: string;
  s1AvgPwr: number;
  s1MaxPwr: number;
  s2AvgPwr: number;
  s2MaxPwr: number;
  pwrDiff: string;
  pwrDiffPos: boolean;
  avgPwr: number;
  maxPwr: number;
  s1AvgHr: number;
  s1MaxHr: number;
  s2AvgHr: number;
  s2MaxHr: number;
  hrDiff: string;
  hrDiffPos: boolean;
  avgHr: number;
  maxHr: number;
  s1TempStr: string;
  s2TempStr: string;
  tempDiff: string;
  tempDiffPos: boolean;
  avgTemp: string;
  maxTemp: string;
  s1Shifts: number;
  s2Shifts: number;
  shiftsDiff: number;
  shiftsDiffStr: string;
  shiftsDiffPos: boolean;
  totalShifts: number;
}

function computeMultiTrackCorrelationAndSections(
  currentTracks: TrackData[],
  allTracks: TrackData[],
): {
  aggPts: number;
  corrSum: number;
  correlations: CombinedCorrelationRow[];
  sectionRows: CombinedSectionComparisonRow[];
} {
  const matrixTracks = allTracks.length >= 2 ? allTracks : currentTracks;
  const numTrk = Math.min(matrixTracks.length, 8);
  combinedDensityGrid.fill(0);

  const pairs: {
    label: string;
    getX: (p: TrackPoint) => number | null | undefined;
    getY: (p: TrackPoint) => number | null | undefined;
  }[] = [
    { label: 'Power vs Heart Rate', getX: (p) => p.power, getY: (p) => p.hr },
    {
      label: 'Speed vs Gradient',
      getX: (p) => (p.speed != null ? p.speed * 3.6 : undefined),
      getY: (p) => p.gradient,
    },
    { label: 'Cadence vs Power', getX: (p) => p.cad, getY: (p) => p.power },
    { label: 'Elevation vs VAM', getX: (p) => p.ele, getY: (p) => p.verticalSpeed },
    { label: 'Temperature vs HR', getX: (p) => p.temp, getY: (p) => p.hr },
  ];

  let aggPts = 0;
  let corrSum = 0;
  const correlations: CombinedCorrelationRow[] = [];

  for (let pi = 0; pi < pairs.length; pi++) {
    const pair = pairs[pi];
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumYY = 0;
    let sumXY = 0;
    let count = 0;

    for (let t = 0; t < numTrk; t++) {
      const pts = matrixTracks[t].points || [];
      const n = Math.min(pts.length, COMBINED_CAP);
      for (let k = 0; k < n; k++) {
        const p = pts[k];
        const x = pair.getX(p);
        const y = pair.getY(p);
        if (x != null && y != null) {
          sumX += x;
          sumY += y;
          sumXX += x * x;
          sumYY += y * y;
          sumXY += x * y;
          count++;
        }
        if (pi === 0) {
          const pw = p.power || 0;
          const h = p.hr || 0;
          const cd = p.cad || 0;
          const bx = Math.min(31, Math.max(0, (pw * 0.05) | 0));
          const by = Math.min(31, Math.max(0, ((h - 60) * 0.2) | 0));
          combinedDensityGrid[(bx << 5) | by] += 1 + cd * 0.01;
        }
      }
    }

    let rVal = 0;
    let slope = 0;
    if (count > 2) {
      const meanX = sumX / count;
      const meanY = sumY / count;
      const varX = Math.max(0, sumXX / count - meanX * meanX);
      const varY = Math.max(0, sumYY / count - meanY * meanY);
      const covXY = sumXY / count - meanX * meanY;
      const denom = Math.sqrt(varX * varY);
      rVal = denom > 1e-9 ? covXY / denom : 0;
      slope = varX > 1e-9 ? covXY / varX : 0;
    }
    aggPts += count;
    corrSum += Math.abs(rVal) * 100 + Math.abs(slope);
    correlations.push({
      pairLabel: pair.label,
      rVal,
      rValStr: rVal.toFixed(2),
      slope,
      slopeStr: slope.toFixed(2),
      samples: count,
    });
  }

  for (let g = 0; g < 1024; g++) {
    corrSum += combinedDensityGrid[g] * 1e-3;
  }

  const sectionLabels = ['Q1 (0–25%)', 'Q2 (25–50%)', 'Q3 (50–75%)', 'Q4 (75–100%)'];
  const sectionRows: CombinedSectionComparisonRow[] = [];
  const t1 = currentTracks[0];
  const t2 = currentTracks[1] || currentTracks[0];

  for (let q = 0; q < 4; q++) {
    const fStart = q * 0.25;
    const fEnd = (q + 1) * 0.25;

    const sliceStats = (trk: TrackData) => {
      const pts = trk.points || [];
      const sIdx = Math.floor(pts.length * fStart);
      const eIdx = Math.max(sIdx + 1, Math.floor(pts.length * fEnd));
      let pSum = 0,
        hSum = 0,
        spSum = 0,
        cnt = 0;
      for (let i = sIdx; i < eIdx && i < pts.length; i++) {
        const pt = pts[i];
        pSum += pt.power || 0;
        hSum += pt.hr || 0;
        spSum += (pt.speed || 0) * 3.6;
        cnt++;
      }
      return {
        power: cnt > 0 ? Math.round(pSum / cnt) : 0,
        hr: cnt > 0 ? Math.round(hSum / cnt) : 0,
        speedKmh: cnt > 0 ? spSum / cnt : 0,
      };
    };

    const st1 = sliceStats(t1);
    const st2 = sliceStats(t2);
    let cohortPwrSum = 0;
    for (let t = 0; t < numTrk; t++) {
      cohortPwrSum += sliceStats(matrixTracks[t]).power;
    }
    const pwrDelta = st2.power - st1.power;
    sectionRows.push({
      sectionLabel: sectionLabels[q],
      t1Power: st1.power,
      t2Power: st2.power,
      t1Hr: st1.hr,
      t2Hr: st2.hr,
      t1SpeedKmh: st1.speedKmh,
      t1SpeedStr: st1.speedKmh.toFixed(1),
      t2SpeedKmh: st2.speedKmh,
      t2SpeedStr: st2.speedKmh.toFixed(1),
      pwrDelta,
      pwrDeltaStr: `${pwrDelta >= 0 ? '+' : ''}${pwrDelta}W`,
      cohortAvgPower: numTrk > 0 ? Math.round(cohortPwrSum / numTrk) : 0,
    });
  }

  return { aggPts, corrSum, correlations, sectionRows };
}

let activeCombinedComponent: CombinedTabComponent | null = null;

export function getActiveCombinedComponent(): CombinedTabComponent | null {
  return activeCombinedComponent || (window as any).__trackStateService?.combinedTab || null;
}

@Component({
  selector: 'app-combined-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div id="combined-view" style="overflow: hidden">
      <div *ngIf="!hasTrack" id="combined-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for combined analysis</div>
      </div>

      <ng-container *ngIf="hasTrack">
        <!-- Multi-Track Aggregate Comparison & Section Analysis -->
        <div
          *ngIf="isMultiTrack && aggSummary"
          class="aggregate-comparison"
          [attr.data-corr-samples]="aggSummary.aggPts"
          [attr.data-corr-score]="aggSummary.corrScore"
          style="padding: 12px; background: var(--surface); border-bottom: 1px solid var(--border);"
        >
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: var(--text);">
            Aggregate Track Comparison &amp; Section Analysis ({{ currentTracksCount }} Tracks)
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border2); color: var(--text-muted);">
                <th style="padding: 6px 4px;">Metric</th>
                <th style="padding: 6px 4px;" [style.color]="aggSummary.t1Color">
                  {{ aggSummary.t1Name }} (T1)
                </th>
                <th style="padding: 6px 4px;" [style.color]="aggSummary.t2Color">
                  {{ aggSummary.t2Name }} (T2)
                </th>
                <th style="padding: 6px 4px;">Delta (T2 - T1)</th>
                <th style="padding: 6px 4px;">Aggregate Summary</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 6px 4px; font-weight: 600;">Distance</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s1DistKm }} km</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s2DistKm }} km</td>
                <td
                  style="padding: 6px 4px; font-weight: 600;"
                  [style.color]="aggSummary.distDiffPos ? '#4ECDC4' : '#FF6B6B'"
                >
                  {{ aggSummary.distDiff }} km
                </td>
                <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">
                  {{ aggSummary.totalDist }} km (Total)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 6px 4px; font-weight: 600;">Elevation Gain</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s1Elev }} m</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s2Elev }} m</td>
                <td
                  style="padding: 6px 4px; font-weight: 600;"
                  [style.color]="aggSummary.eleDiffPos ? '#4ECDC4' : '#FF6B6B'"
                >
                  {{ aggSummary.eleDiff }} m
                </td>
                <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">
                  {{ aggSummary.totalElev }} m (Total)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 6px 4px; font-weight: 600;">Duration</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s1DurStr }}</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s2DurStr }}</td>
                <td style="padding: 6px 4px;">--</td>
                <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">
                  {{ aggSummary.totalDurStr }} (Total)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 6px 4px; font-weight: 600;">Avg / Max Power</td>
                <td style="padding: 6px 4px;">
                  {{ aggSummary.s1AvgPwr }} W / {{ aggSummary.s1MaxPwr }} W
                </td>
                <td style="padding: 6px 4px;">
                  {{ aggSummary.s2AvgPwr }} W / {{ aggSummary.s2MaxPwr }} W
                </td>
                <td
                  style="padding: 6px 4px; font-weight: 600;"
                  [style.color]="aggSummary.pwrDiffPos ? '#4ECDC4' : '#FF6B6B'"
                >
                  {{ aggSummary.pwrDiff }} W (Avg)
                </td>
                <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">
                  {{ aggSummary.avgPwr }} W (Avg) / {{ aggSummary.maxPwr }} W (Max)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 6px 4px; font-weight: 600;">Avg / Max HR</td>
                <td style="padding: 6px 4px;">
                  {{ aggSummary.s1AvgHr }} bpm / {{ aggSummary.s1MaxHr }} bpm
                </td>
                <td style="padding: 6px 4px;">
                  {{ aggSummary.s2AvgHr }} bpm / {{ aggSummary.s2MaxHr }} bpm
                </td>
                <td
                  style="padding: 6px 4px; font-weight: 600;"
                  [style.color]="aggSummary.hrDiffPos ? '#4ECDC4' : '#FF6B6B'"
                >
                  {{ aggSummary.hrDiff }} bpm (Avg)
                </td>
                <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">
                  {{ aggSummary.avgHr }} bpm (Avg) / {{ aggSummary.maxHr }} bpm (Max)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 6px 4px; font-weight: 600;">Avg / Max Temp</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s1TempStr }}</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s2TempStr }}</td>
                <td
                  style="padding: 6px 4px; font-weight: 600;"
                  [style.color]="aggSummary.tempDiffPos ? '#4ECDC4' : '#FF6B6B'"
                >
                  {{ aggSummary.tempDiff }} °C (Avg)
                </td>
                <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">
                  {{ aggSummary.avgTemp }} °C (Avg) / {{ aggSummary.maxTemp }} °C (Max)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 6px 4px; font-weight: 600;">Gear Shifts</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s1Shifts }}</td>
                <td style="padding: 6px 4px;">{{ aggSummary.s2Shifts }}</td>
                <td
                  style="padding: 6px 4px; font-weight: 600;"
                  [style.color]="aggSummary.shiftsDiffPos ? '#4ECDC4' : '#FF6B6B'"
                >
                  {{ aggSummary.shiftsDiffStr }}
                </td>
                <td style="padding: 6px 4px; font-weight: 700; color: #E2E8F0;">
                  {{ aggSummary.totalShifts }} (Total)
                </td>
              </tr>
              <tr
                *ngFor="let sr of sectionRows"
                style="border-bottom: 1px solid rgba(255,255,255,0.05);"
              >
                <td style="padding: 4px; font-weight: 600;">{{ sr.sectionLabel }} Split</td>
                <td style="padding: 4px;">
                  {{ sr.t1Power }}W · {{ sr.t1Hr }}bpm · {{ sr.t1SpeedStr }}km/h
                </td>
                <td style="padding: 4px;">
                  {{ sr.t2Power }}W · {{ sr.t2Hr }}bpm · {{ sr.t2SpeedStr }}km/h
                </td>
                <td style="padding: 4px;">{{ sr.pwrDeltaStr }}</td>
                <td style="padding: 4px;">Cohort Avg: {{ sr.cohortAvgPower }}W</td>
              </tr>
            </tbody>
          </table>
          <div
            style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;font-size:11px;color:var(--text-muted);"
          >
            <span *ngFor="let c of correlations">
              <strong>{{ c.pairLabel }}:</strong> r={{ c.rValStr }}, β={{ c.slopeStr }} ({{
                c.samples
              }})
            </span>
          </div>
        </div>

        <!-- Combined Controls Bar -->
        <div
          class="combined-controls"
          style="display: flex; align-items: center; padding: 6px 12px; gap: 12px; border-bottom: 1px solid var(--border); background: var(--bg); min-height: 40px; box-sizing: border-box;"
        >
          <div class="selector-group" style="display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-rounded font-l" style="color: var(--text-muted);"
              >arrow_forward</span
            >
            <span class="font-m" style="font-weight: 600; color: var(--text-muted);">X Axis:</span>
            <button
              id="btn-combined-x"
              class="sort-select-btn"
              style="min-width: 150px;"
              (click)="onShowAxisMenu('x', $event)"
            >
              <span class="material-symbols-rounded" [style.color]="xDef.color">{{
                xDef.icon
              }}</span>
              <span class="item-label">{{ xDef.label }}</span>
              <span class="material-symbols-rounded arrow">expand_more</span>
            </button>
          </div>
          <div class="selector-group" style="display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-rounded font-l" style="color: var(--text-muted);"
              >arrow_upward</span
            >
            <span class="font-m" style="font-weight: 600; color: var(--text-muted);">Y Axis:</span>
            <button
              id="btn-combined-y"
              class="sort-select-btn"
              style="min-width: 150px;"
              (click)="onShowAxisMenu('y', $event)"
            >
              <span class="material-symbols-rounded" [style.color]="yDef.color">{{
                yDef.icon
              }}</span>
              <span class="item-label">{{ yDef.label }}</span>
              <span class="material-symbols-rounded arrow">expand_more</span>
            </button>
          </div>
          <div class="slider-group" style="display: flex; align-items: center; gap: 6px; flex: 1;">
            <span class="material-symbols-rounded font-l" style="color: var(--text-muted);"
              >schedule</span
            >
            <span class="font-m" style="font-weight: 600; color: var(--text-muted);">Time:</span>
            <input
              type="range"
              id="combined-time-slider"
              min="0"
              [attr.max]="sliderMax"
              [value]="sliderValue"
              style="flex: 1;"
              (input)="onSliderInput($event)"
            />
            <span
              id="combined-time-val"
              class="font-s"
              style="color: var(--text); background: var(--surface3); padding: 3px 8px; border-radius: 12px; border: 1px solid var(--border); min-width: 65px; text-align: center; flex-shrink: 0;"
              >{{ sliderTimeLabel }}</span
            >
            <button
              id="btn-combined-play"
              class="sort-select-btn"
              style="padding: 4px; flex: 0 0 28px; height: 28px; width: 28px; justify-content: center;"
              (click)="onTogglePlay()"
            >
              <span class="material-symbols-rounded">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
            </button>
          </div>
          <div
            class="toggle-group"
            style="display: flex; align-items: center; background: var(--surface3); border-radius: 4px; padding: 2px; border: 1px solid var(--border); flex-shrink: 0;"
          >
            <button
              id="btn-combined-cart"
              class="sort-select-btn"
              [style.background]="!isPolar ? 'var(--theme-color)' : 'transparent'"
              [style.color]="!isPolar ? 'white' : 'var(--text-muted)'"
              style="width: 24px; height: 24px; border: none; display: flex; align-items: center; justify-content: center;"
              title="Cartesian Coordinates"
              (click)="setPolar(false)"
            >
              <span class="material-symbols-rounded font-l">grid_on</span>
            </button>
            <button
              id="btn-combined-polar"
              class="sort-select-btn"
              [style.background]="isPolar ? 'var(--theme-color)' : 'transparent'"
              [style.color]="isPolar ? 'white' : 'var(--text-muted)'"
              style="width: 24px; height: 24px; border: none; display: flex; align-items: center; justify-content: center;"
              title="Polar Coordinates"
              (click)="setPolar(true)"
            >
              <span class="material-symbols-rounded font-l">radar</span>
            </button>
          </div>
        </div>

        <div
          id="combined-plot-container"
          #plotContainer
          style="width: 100%; flex: 1; min-height: 0; background: var(--surface2); padding: 0; overflow: hidden;"
          [style.display]="isPolar && !isMultiTrack ? 'flex' : ''"
          [style.alignItems]="isPolar && !isMultiTrack ? 'center' : ''"
          [style.justifyContent]="isPolar && !isMultiTrack ? 'center' : ''"
        >
          <div
            *ngIf="noDataForMetrics"
            class="empty-text"
            style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-dim);"
          >
            No data for selected metrics
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class CombinedTabComponent implements OnInit, OnDestroy {
  public state = inject(TrackStateService);
  private cdr = inject(ChangeDetectorRef);
  private elRef = inject(ElementRef<HTMLElement>);

  @ViewChild('plotContainer') plotContainerRef?: ElementRef<HTMLElement>;

  hasTrack = false;
  isMultiTrack = false;
  noDataForMetrics = false;
  currentTracksCount = 0;

  currentTracks: TrackData[] = [];
  currentTrack: TrackData | null = null;
  allTracks: TrackData[] = [];

  xMetric = 'power';
  yMetric = 'hr';
  xDef: any = ChartView.METRICS.power;
  yDef: any = ChartView.METRICS.hr;
  isPolar = false;
  isPlaying = false;

  sliderMax = 100;
  sliderValue = 0;
  sliderTimeLabel = '0:00';
  currentSliderIdx: number | null = null;

  aggSummary: AggregateComparisonSummary | null = null;
  correlations: CombinedCorrelationRow[] = [];
  sectionRows: CombinedSectionComparisonRow[] = [];

  private plot: uPlot | null = null;
  private currentChronoData: [number, number, number, number, number, number, number][] = [];
  private currentSortedData: [number, number, number, number, number, number, number][] = [];
  private playIntervalId: number | null = null;

  constructor() {
    this.state.combinedTab = this;
    activeCombinedComponent = this;
  }

  ngOnInit(): void {
    this.state.combinedTab = this;
    activeCombinedComponent = this;
  }

  ngOnDestroy(): void {
    this.stopPlaying();
    this.destroyPlot();
    if (activeCombinedComponent === this) {
      activeCombinedComponent = null;
    }
  }

  private destroyPlot(): void {
    if (this.plot) {
      this.plot.destroy();
      this.plot = null;
    }
  }

  reset(): void {
    this.stopPlaying();
    this.destroyPlot();
    this.currentTracks = [];
    this.currentTrack = null;
    this.hasTrack = false;
    this.isMultiTrack = false;
    this.xMetric = 'power';
    this.yMetric = 'hr';
    this.currentSliderIdx = null;
    this.currentChronoData = [];
    this.currentSortedData = [];
    this.isPolar = false;
    this.aggSummary = null;
    this.correlations = [];
    this.sectionRows = [];
    const tooltip = document.getElementById('combined-tooltip');
    if (tooltip) tooltip.remove();
    this.cdr.detectChanges();
  }

  setMetrics(xKey: string, yKey: string): void {
    this.xMetric = xKey;
    this.yMetric = yKey;
    if (this.currentTracks.length >= 2) {
      this.render(this.currentTracks, this.allTracks);
    } else if (this.currentTrack) {
      this.render(this.currentTrack, this.allTracks);
    }
  }

  setPolar(polar: boolean): void {
    if (this.isPolar !== polar) {
      this.isPolar = polar;
      if (this.currentTracks.length >= 2) {
        this.render(this.currentTracks, this.allTracks);
      } else if (this.currentTrack) {
        this.render(this.currentTrack, this.allTracks);
      }
    }
  }

  setSliderProgress(fraction: number): void {
    const clamped = Math.max(0, Math.min(1, fraction));
    const maxLen =
      this.currentChronoData.length > 0
        ? this.currentChronoData.length - 1
        : this.currentTrack
          ? Math.max(0, this.currentTrack.points.length - 1)
          : 0;
    this.currentSliderIdx = Math.round(clamped * maxLen);
    this.sliderMax = maxLen;
    this.sliderValue = this.currentSliderIdx;
    this.updateSliderLabel();
    this.cdr.detectChanges();
    if (this.plot) this.plot.redraw();
  }

  private updateSliderLabel(): void {
    if (this.currentSliderIdx !== null && this.currentChronoData[this.currentSliderIdx]) {
      const timeSecs = this.currentChronoData[this.currentSliderIdx][2];
      this.sliderTimeLabel = fmtSecs(timeSecs);
    }
  }

  render(trackOrTracks: TrackData | TrackData[] | null, allTracks: TrackData[] = []): void {
    this.stopPlaying();
    this.allTracks = allTracks;

    if (Array.isArray(trackOrTracks)) {
      this.currentTracks = trackOrTracks;
      this.currentTrack = trackOrTracks[0] || null;
    } else if (trackOrTracks) {
      this.currentTracks = [trackOrTracks];
      this.currentTrack = trackOrTracks;
    } else {
      this.currentTracks = [];
      this.currentTrack = null;
    }

    const track = this.currentTrack;
    if (!track) {
      this.destroyPlot();
      this.hasTrack = false;
      this.isMultiTrack = false;
      this.cdr.detectChanges();
      return;
    }

    this.hasTrack = true;
    this.currentTracksCount = this.currentTracks.length;
    this.isMultiTrack = this.currentTracks.length >= 2;

    const metrics = ChartView.METRICS;
    const availableMetrics: string[] = [];
    for (const key in metrics) {
      const def = metrics[key];
      if (track.points.some((p) => (p as any)[def.field] != null)) availableMetrics.push(key);
    }

    if (!availableMetrics.includes(this.xMetric) && availableMetrics.length > 0) {
      this.xMetric = availableMetrics[0];
    }
    if (!availableMetrics.includes(this.yMetric) && availableMetrics.length > 1) {
      this.yMetric = availableMetrics[1];
    } else if (!availableMetrics.includes(this.yMetric) && availableMetrics.length > 0) {
      this.yMetric = availableMetrics[0];
    }

    this.xDef = metrics[this.xMetric] || metrics.power;
    this.yDef = metrics[this.yMetric] || metrics.hr;

    if (this.isMultiTrack) {
      const { aggPts, corrSum, correlations, sectionRows } =
        computeMultiTrackCorrelationAndSections(this.currentTracks, allTracks);
      this.correlations = correlations;
      this.sectionRows = sectionRows;

      const t1 = this.currentTracks[0];
      const t2 = this.currentTracks[1];
      const s1 = t1.stats;
      const s2 = t2.stats;
      const distDiffNum = (s2.totalDist - s1.totalDist) / 1000;
      const distDiff = distDiffNum.toFixed(2);
      const pwrDiffNum = (s2.avgPower || 0) - (s1.avgPower || 0);
      const pwrDiff = pwrDiffNum.toFixed(0);
      const hrDiffNum = (s2.avgHR || 0) - (s1.avgHR || 0);
      const hrDiff = hrDiffNum.toFixed(0);
      const eleDiffNum = s2.elevGain - s1.elevGain;
      const eleDiff = eleDiffNum.toFixed(0);
      const shiftsDiff = (s2.shifts || 0) - (s1.shifts || 0);

      const totalDist = ((s1.totalDist + s2.totalDist) / 1000).toFixed(2);
      const totalElev = (s1.elevGain + s2.elevGain).toFixed(0);
      const totalDur = ((s1.duration || 0) + (s2.duration || 0)) / 1000;
      const avgPwr = Math.round(((s1.avgPower || 0) + (s2.avgPower || 0)) / 2);
      const maxPwr = Math.max(s1.maxPower || 0, s2.maxPower || 0);
      const avgHr = Math.round(((s1.avgHR || 0) + (s2.avgHR || 0)) / 2);
      const maxHr = Math.max(s1.maxHR || 0, s2.maxHR || 0);
      const tempDiffNum = (s2.avgTemp ?? 0) - (s1.avgTemp ?? 0);
      const tempDiff = tempDiffNum.toFixed(1);
      const avgTemp = (((s1.avgTemp ?? 0) + (s2.avgTemp ?? 0)) / 2).toFixed(1);
      const maxTemp = Math.max(s1.maxTemp ?? 0, s2.maxTemp ?? 0).toFixed(1);
      const totalShifts = (s1.shifts || 0) + (s2.shifts || 0);

      this.aggSummary = {
        aggPts,
        corrScore: corrSum.toFixed(4),
        t1Name: t1.displayName || t1.name,
        t1Color: t1.color,
        t2Name: t2.displayName || t2.name,
        t2Color: t2.color,
        s1DistKm: (s1.totalDist / 1000).toFixed(2),
        s2DistKm: (s2.totalDist / 1000).toFixed(2),
        distDiff: `${Number(distDiff) >= 0 ? '+' : ''}${distDiff}`,
        distDiffPos: Number(distDiff) >= 0,
        totalDist,
        s1Elev: s1.elevGain.toFixed(0),
        s2Elev: s2.elevGain.toFixed(0),
        eleDiff: `${Number(eleDiff) >= 0 ? '+' : ''}${eleDiff}`,
        eleDiffPos: Number(eleDiff) >= 0,
        totalElev,
        s1DurStr: s1.duration ? fmtSecs(s1.duration / 1000) : '--',
        s2DurStr: s2.duration ? fmtSecs(s2.duration / 1000) : '--',
        totalDurStr: fmtSecs(totalDur),
        s1AvgPwr: s1.avgPower || 0,
        s1MaxPwr: s1.maxPower || 0,
        s2AvgPwr: s2.avgPower || 0,
        s2MaxPwr: s2.maxPower || 0,
        pwrDiff: `${Number(pwrDiff) >= 0 ? '+' : ''}${pwrDiff}`,
        pwrDiffPos: Number(pwrDiff) >= 0,
        avgPwr,
        maxPwr,
        s1AvgHr: s1.avgHR || 0,
        s1MaxHr: s1.maxHR || 0,
        s2AvgHr: s2.avgHR || 0,
        s2MaxHr: s2.maxHR || 0,
        hrDiff: `${Number(hrDiff) >= 0 ? '+' : ''}${hrDiff}`,
        hrDiffPos: Number(hrDiff) >= 0,
        avgHr,
        maxHr,
        s1TempStr: `${s1.avgTemp != null ? s1.avgTemp.toFixed(1) : '--'} °C / ${s1.maxTemp != null ? s1.maxTemp.toFixed(1) : '--'} °C`,
        s2TempStr: `${s2.avgTemp != null ? s2.avgTemp.toFixed(1) : '--'} °C / ${s2.maxTemp != null ? s2.maxTemp.toFixed(1) : '--'} °C`,
        tempDiff: `${Number(tempDiff) >= 0 ? '+' : ''}${tempDiff}`,
        tempDiffPos: Number(tempDiff) >= 0,
        avgTemp,
        maxTemp,
        s1Shifts: s1.shifts || 0,
        s2Shifts: s2.shifts || 0,
        shiftsDiff,
        shiftsDiffStr: `${shiftsDiff >= 0 ? '+' : ''}${shiftsDiff}`,
        shiftsDiffPos: shiftsDiff >= 0,
        totalShifts,
      };
    } else {
      this.aggSummary = null;
      this.correlations = [];
      this.sectionRows = [];
    }

    this.noDataForMetrics = false;
    this.cdr.detectChanges();
    this.updatePlot();
  }

  private updatePlot(): void {
    if (!this.currentTrack) return;
    const container =
      this.plotContainerRef?.nativeElement ||
      (this.elRef.nativeElement.querySelector('#combined-plot-container') as HTMLElement | null);
    if (!container) return;

    const xDef = this.xDef;
    const yDef = this.yDef;

    if (this.currentTracks.length >= 2) {
      let maxLen = 0;
      for (let t = 0; t < this.currentTracks.length; t++) {
        if (this.currentTracks[t].points.length > maxLen) {
          maxLen = this.currentTracks[t].points.length;
        }
      }
      const xData: number[] = new Array(maxLen);
      for (let i = 0; i < maxLen; i++) xData[i] = i;

      const seriesList: uPlot.Series[] = [{}];
      const dataArrays: (number | null)[][] = [xData];

      for (let t = 0; t < this.currentTracks.length; t++) {
        const trk = this.currentTracks[t];
        const pts = trk.points;
        const yArr: (number | null)[] = new Array(maxLen);
        for (let i = 0; i < maxLen; i++) {
          const p = pts[i];
          yArr[i] = p && (p as any)[yDef.field] != null ? (p as any)[yDef.field] : null;
        }
        dataArrays.push(yArr);
        seriesList.push({
          label: `${trk.displayName || trk.name} (${yDef.label})`,
          stroke: trk.color || '#3b82f6',
          width: 2,
          points: { show: false },
        });
      }

      this.destroyPlot();

      const width = container.clientWidth > 0 ? container.clientWidth : 800;
      const height = container.clientHeight > 0 ? container.clientHeight : 350;

      const opts: uPlot.Options = {
        width,
        height,
        padding: [10, 15, 0, 0],
        scales: { x: { time: false }, y: { auto: true } },
        series: seriesList,
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

      this.plot = new uPlot(opts, dataArrays as uPlot.AlignedData, container);
      this.resize();
      return;
    }

    const pts = this.currentTrack.points;
    const t0 = pts[0]?.time || 0;
    const chronoData = pts
      .map((p, idx) => [
        (p as any)[xDef.field],
        (p as any)[yDef.field],
        ((p.time || t0) - t0) / 1000,
        (p.dist || 0) / 1000,
        idx,
      ])
      .filter(([x, y]) => x != null && y != null) as [number, number, number, number, number][];

    if (chronoData.length === 0) {
      this.destroyPlot();
      this.noDataForMetrics = true;
      this.cdr.detectChanges();
      return;
    }

    if (this.isPolar) {
      const xVals = chronoData.map((d) => d[0]);
      const yVals = chronoData.map((d) => d[1]);
      const xMin = Math.min(...xVals);
      const xMax = Math.max(...xVals);
      const yMin = Math.min(...yVals);
      const yMax = Math.max(...yVals);

      this.currentChronoData = chronoData.map((d) => {
        const xVal = d[0];
        const yVal = d[1];
        const theta = ((xVal - xMin) / (xMax - xMin || 1)) * 2 * Math.PI;
        const r = (yVal - yMin) / (yMax - yMin || 1);
        const px = r * Math.cos(theta);
        const py = r * Math.sin(theta);
        return [px, py, d[2], d[3], d[4], xVal, yVal] as any;
      });
    } else {
      this.currentChronoData = chronoData.map(
        (d) => [d[0], d[1], d[2], d[3], d[4], d[0], d[1]] as any,
      );
    }

    this.sliderMax = chronoData.length - 1;
    if (this.currentSliderIdx === null || this.currentSliderIdx >= chronoData.length) {
      this.currentSliderIdx = chronoData.length - 1;
    }
    this.sliderValue = this.currentSliderIdx;
    this.updateSliderLabel();
    this.cdr.detectChanges();

    this.currentSortedData = [...this.currentChronoData].sort((a, b) => a[0] - b[0] || a[4] - b[4]);

    const xData = this.currentSortedData.map((d) => d[0]);
    const yData = this.currentSortedData.map((d) => d[1]);

    let width = container.clientWidth > 0 ? container.clientWidth : 600;
    let height = container.clientHeight > 0 ? container.clientHeight : 400;

    if (this.isPolar) {
      const size = Math.min(width, height > 0 ? height : width);
      width = size;
      height = size;
    }

    const opts: uPlot.Options = {
      width,
      height,
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
          side: 2,
          show: !this.isPolar,
          label: `${xDef.label} (${xDef.unit})`,
          stroke: '#555564',
          grid: { stroke: '#2e2e34', width: 1 },
          font: '10px system-ui, sans-serif',
          values: (_u, vals) => vals.map((v) => (v != null ? xDef.fmtAxis(v) : '')),
          size: 30,
        },
        {
          side: 3,
          show: !this.isPolar,
          label: `${yDef.label} (${yDef.unit})`,
          stroke: '#555564',
          grid: { stroke: '#2e2e34', width: 1 },
          font: '10px system-ui, sans-serif',
          values: (_u, vals) => vals.map((v) => (v != null ? yDef.fmtAxis(v) : '')),
          size: 40,
        },
      ],
      cursor: {
        drag: { x: false, y: false },
        dataIdx: (u, _seriesIdx, dataIdx) => {
          const cursorLeft = u.cursor.left;
          const cursorTop = u.cursor.top;
          if (cursorLeft != null && cursorTop != null && cursorLeft >= 0 && cursorTop >= 0) {
            let minD2 = Infinity;
            let closestIdx = -1;

            for (let i = 0; i < this.currentSortedData.length; i++) {
              const [xVal, yVal] = this.currentSortedData[i];
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

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1 * dpr;

            let started = false;
            for (let i = 0; i < this.currentChronoData.length; i++) {
              const [xVal, yVal] = this.currentChronoData[i];
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

            if (this.currentSliderIdx !== null) {
              ctx.save();
              const windowSize = 100;
              const startIdx = Math.max(0, this.currentSliderIdx - windowSize);
              const endIdx = this.currentSliderIdx;

              for (let i = startIdx; i < endIdx; i++) {
                const [xVal1, yVal1] = this.currentChronoData[i];
                const [xVal2, yVal2] = this.currentChronoData[i + 1];
                const cx1 = u.valToPos(xVal1, 'x', true);
                const cy1 = u.valToPos(yVal1, 'y', true);
                const cx2 = u.valToPos(xVal2, 'x', true);
                const cy2 = u.valToPos(yVal2, 'y', true);

                const progress = (i - startIdx) / (endIdx - startIdx || 1);
                const lineWidth = 1 + 5 * progress;
                const alpha = 0.15 + 0.6 * progress;

                ctx.beginPath();
                ctx.moveTo(cx1, cy1);
                ctx.lineTo(cx2, cy2);
                ctx.strokeStyle = hexToRgba(yDef.color, alpha);
                ctx.lineWidth = lineWidth * dpr;
                ctx.stroke();
              }

              for (let i = startIdx; i <= endIdx; i++) {
                const [xVal, yVal] = this.currentChronoData[i];
                const cx = u.valToPos(xVal, 'x', true);
                const cy = u.valToPos(yVal, 'y', true);

                const progress = (i - startIdx) / (endIdx - startIdx || 1);
                const size = 3 + 7 * progress;
                const fillAlpha = 0.01 + 0.14 * progress;

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

            if (idx != null && this.currentSortedData[idx] && u.cursor.left! >= 0) {
              const d = this.currentSortedData[idx];
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

    this.destroyPlot();
    this.plot = new uPlot(opts, [xData, yData], container);

    this.plot.over.addEventListener('click', () => {
      if (this.plot) {
        const idx = this.plot.cursor.idx;
        if (idx != null && this.currentSortedData[idx]) {
          const originalIdx = this.currentSortedData[idx][4];
          ChartView.setCursorAt(originalIdx);
        }
      }
    });

    this.resize();
  }

  resize(): void {
    const plotContainer =
      this.plotContainerRef?.nativeElement ||
      (this.elRef.nativeElement.querySelector('#combined-plot-container') as HTMLElement | null);
    if (this.plot && plotContainer && plotContainer.clientWidth > 0) {
      const w = plotContainer.clientWidth;
      const h = plotContainer.clientHeight;

      if (w > 0 && h > 0) {
        if (this.isPolar && !this.isMultiTrack) {
          const size = Math.min(w, h);
          this.plot.setSize({ width: size, height: size });
        } else {
          this.plot.setSize({ width: w, height: h });
        }
      }
    }
  }

  onSliderInput(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.currentSliderIdx = val;
    this.sliderValue = val;
    this.updateSliderLabel();
    this.cdr.detectChanges();
    if (this.plot) this.plot.redraw();
  }

  onTogglePlay(): void {
    if (this.playIntervalId) {
      this.stopPlaying();
      this.cdr.detectChanges();
    } else {
      if (
        this.currentSliderIdx !== null &&
        this.currentSliderIdx >= this.currentChronoData.length - 1
      ) {
        this.currentSliderIdx = 0;
        this.sliderValue = 0;
        this.updateSliderLabel();
        if (this.plot) this.plot.redraw();
      }
      this.startPlaying();
      this.cdr.detectChanges();
    }
  }

  private startPlaying(): void {
    this.isPlaying = true;
    this.playIntervalId = window.setInterval(() => {
      if (
        this.currentSliderIdx !== null &&
        this.currentSliderIdx < this.currentChronoData.length - 1
      ) {
        this.currentSliderIdx = Math.min(
          this.currentSliderIdx + 5,
          this.currentChronoData.length - 1,
        );
        this.sliderValue = this.currentSliderIdx;
        this.updateSliderLabel();
        this.cdr.detectChanges();
        if (this.plot) this.plot.redraw();
      } else {
        this.stopPlaying();
        this.cdr.detectChanges();
      }
    }, 20);
  }

  private stopPlaying(): void {
    if (this.playIntervalId) {
      clearInterval(this.playIntervalId);
      this.playIntervalId = null;
    }
    this.isPlaying = false;
  }

  onShowAxisMenu(axis: 'x' | 'y', event: MouseEvent): void {
    event.stopPropagation();
    const anchorEl = event.currentTarget as HTMLElement;
    document.querySelectorAll('.metric-menu-popup').forEach((el) => el.remove());

    const popup = document.createElement('div');
    popup.className = 'metric-menu-popup';

    const metrics = ChartView.METRICS;
    const track = this.currentTrack;
    if (!track) return;

    const availableMetrics: string[] = [];
    for (const key in metrics) {
      const def = metrics[key];
      if (track.points.some((p) => (p as any)[def.field] != null)) availableMetrics.push(key);
    }

    availableMetrics.forEach((key) => {
      const def = metrics[key];
      const item = document.createElement('div');
      const currentVal = axis === 'x' ? this.xMetric : this.yMetric;
      item.className = `menu-item ${currentVal === key ? 'active' : ''}`;
      item.innerHTML = `
        <span class="material-symbols-rounded" style="color:${def.color}">${def.icon}</span>
        <span class="item-label">${def.label}</span>
        <span class="material-symbols-rounded check">${currentVal === key ? 'check' : ''}</span>
      `;
      item.addEventListener('click', () => {
        if (axis === 'x') this.xMetric = key;
        else this.yMetric = key;

        popup.remove();
        if (this.currentTracks.length >= 2) {
          this.render(this.currentTracks, this.allTracks);
        } else {
          this.render(this.currentTrack, this.allTracks);
        }
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
}
