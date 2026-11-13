// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { Component, ChangeDetectorRef, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackStateService } from '../services/track-state.service';
import { TrackData } from '../parsers';
import { Metrics } from '../metrics';
import { UrlState } from '../url-state';
import { fmtDuration } from '../utils';
import { AccumulatedSummaryRow, AccumulatedTableRow } from '../tabs/accumulated_progress';
import {
  CurveTableRow,
  LongitudinalHistoryRow,
  applyEvolutionGrouping,
  applyEvolutionPinnedDuration,
  applyEvolutionRange,
  computeBanisterAndEvolutionData,
  destroyEvolutionPlots,
  mountEvolutionPlots,
  registerEvolutionComponent,
} from '../tabs/progress';

@Component({
  selector: 'app-evolution-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="evolution-tab-host" [attr.data-tsb]="tsbStr">
      <div id="evolution-empty" class="empty-state" *ngIf="isEmpty">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for progress analysis</div>
      </div>

      <ng-container *ngIf="!isEmpty">
        <div id="evolution-toolbar" class="evolution-toolbar">
          <div
            class="evolution-toolbar-left"
            style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;"
          >
            <div class="metric-pills">
              <button
                *ngFor="let pill of metricPills"
                class="metric-pill active"
                [attr.data-target]="pill.target"
                [style.--pill-color]="pill.color"
                (click)="onMetricPillClick(pill.target)"
              >
                <span class="material-symbols-rounded">{{ pill.icon }}</span
                >{{ pill.label }}
              </button>
            </div>

            <div class="seg-ctrl" id="evolution-grouping-ctrl" title="Volume Aggregation Grouping">
              <button
                class="seg-btn"
                [class.active]="currentGrouping === 'week'"
                data-grouping="week"
                (click)="setGrouping('week')"
              >
                Week
              </button>
              <button
                class="seg-btn"
                [class.active]="currentGrouping === 'month'"
                data-grouping="month"
                (click)="setGrouping('month')"
              >
                Month
              </button>
            </div>

            <div class="seg-ctrl" id="evolution-pin-ctrl" title="Pin Curve Duration">
              <button
                *ngFor="let p of pinDurationOptions"
                class="seg-btn"
                [class.active]="pinnedDuration === p.sec"
                [attr.data-pin]="p.sec ?? 'free'"
                (click)="setPinnedDuration(p.sec)"
              >
                {{ p.label }}
              </button>
            </div>

            <select
              *ngIf="availableSports.length > 0"
              class="evolution-sport-select"
              [(ngModel)]="selectedSportFilter"
              name="evolutionSportFilter"
              (change)="onSportFilterChange()"
              style="background: var(--bg); border: 1px solid var(--border); color: var(--text); font-size: 11px; padding: 3px 6px; border-radius: 4px;"
            >
              <option value="all">All Sports</option>
              <option *ngFor="let s of availableSports" [value]="s">{{ s }}</option>
            </select>
          </div>

          <div class="evolution-toolbar-right">
            <div class="seg-ctrl" id="evolution-time-range">
              <button
                *ngFor="let r of rangeOptions"
                class="seg-btn"
                [class.active]="currentRange === r.key"
                [attr.data-range]="r.key"
                (click)="setRange(r.key)"
              >
                {{ r.label }}
              </button>
            </div>
          </div>
        </div>

        <div id="evolution-container" class="evolution-container">
          <!-- Accumulated Longitudinal Progress Summary & Banister ATL/CTL/TSB -->
          <div
            class="chart-row accumulated-multi-card"
            id="accumulated-summary-card"
            style="padding: 10px 14px;"
          >
            <div
              class="chart-row-header"
              style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;"
            >
              <div class="chart-row-label-group">
                <span class="material-symbols-rounded chart-row-icon" style="--chart-color: #4ecdc4"
                  >monitoring</span
                >
                <span class="chart-row-label">Accumulated Longitudinal Progress Summary</span>
              </div>
              <div
                class="banister-load-badges"
                style="display: flex; align-items: center; gap: 6px; font-size: 11px;"
              >
                <span class="badge" title="Chronic Training Load (Fitness)">CTL: {{ ctlStr }}</span>
                <span class="badge" title="Acute Training Load (Fatigue)">ATL: {{ atlStr }}</span>
                <span
                  class="badge"
                  [attr.data-tsb]="tsbStr"
                  title="Training Stress Balance (Banister Form)"
                  >TSB: {{ tsbStr }} ({{ tsbStatus }})</span
                >
              </div>
            </div>
            <table class="accumulated-table" style="width: 100%; font-size: 11px;">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Past 1M</th>
                  <th>Past 6M</th>
                  <th>Past Year</th>
                  <th>Current Year</th>
                  <th>Total</th>
                  <th>Weekly Avg</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of accumulatedSummaryRows; trackBy: trackByLabel">
                  <td style="font-weight: 600;">{{ r.label }}</td>
                  <td>{{ r.past1m }}&nbsp;{{ r.unit }}</td>
                  <td>{{ r.past6m }}&nbsp;{{ r.unit }}</td>
                  <td>{{ r.pastYear }}&nbsp;{{ r.unit }}</td>
                  <td>{{ r.currentYear }}&nbsp;{{ r.unit }}</td>
                  <td style="font-weight: 700;">{{ r.total }}&nbsp;{{ r.unit }}</td>
                  <td>{{ r.weeklyAvg }}&nbsp;{{ r.unit }}/wk</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Distance Progress Card -->
          <div class="chart-row distance-progress-card" id="distance-evolution-card">
            <div class="chart-row-header">
              <div class="chart-row-label-group">
                <span
                  class="material-symbols-rounded chart-row-icon"
                  id="progress-icon"
                  [style.--chart-color]="distanceColor"
                  >{{ distanceIcon }}</span
                >
                <span class="chart-row-label" id="progress-label">Distance Progress</span>
              </div>
            </div>
            <div class="card-content" style="display: flex;">
              <div id="distance-y-axis-chart" style="width: 50px;"></div>
              <div
                class="chart-scroll-container"
                style="flex: 1; overflow-x: auto; position: relative;"
                (scroll)="onDistanceScroll($event)"
              >
                <div id="distance-weekly-chart"></div>
              </div>
              <div class="accumulated-table-container" style="width: 320px; margin-left: 20px;">
                <table class="accumulated-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Distance</th>
                      <th>Distance/Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of distanceAccumulatedRows; trackBy: trackByPeriod">
                      <td>{{ r.period }}</td>
                      <td>{{ r.valueFormatted }}&nbsp;{{ r.unit }}</td>
                      <td>{{ r.weeklyAvgFormatted }}&nbsp;{{ r.unit }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Elevation Progress Card -->
          <div class="chart-row elevation-progress-card" id="elevation-evolution-card">
            <div class="chart-row-header">
              <div class="chart-row-label-group">
                <span
                  class="material-symbols-rounded chart-row-icon"
                  [style.--chart-color]="elevationColor"
                  >{{ elevationIcon }}</span
                >
                <span class="chart-row-label">Elevation Progress</span>
              </div>
            </div>
            <div class="card-content" style="display: flex;">
              <div id="elevation-y-axis-chart" style="width: 50px;"></div>
              <div
                class="chart-scroll-container"
                style="flex: 1; overflow-x: auto; position: relative;"
                (scroll)="onElevationScroll($event)"
              >
                <div id="elevation-weekly-chart"></div>
              </div>
              <div class="accumulated-table-container" style="width: 320px; margin-left: 20px;">
                <table class="accumulated-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Elevation</th>
                      <th>Elevation/Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of elevationAccumulatedRows; trackBy: trackByPeriod">
                      <td>{{ r.period }}</td>
                      <td>{{ r.valueFormatted }}&nbsp;{{ r.unit }}</td>
                      <td>{{ r.weeklyAvgFormatted }}&nbsp;{{ r.unit }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Power Curve Progress Card -->
          <div
            class="chart-row evolution-card-group"
            id="power-evolution-card"
            *ngIf="hasPowerCurve"
          >
            <div style="display: flex; flex-direction: row; gap: 0px; align-items: stretch;">
              <div
                class="chart-row progress-chart-row"
                [style.--chart-color]="powerColor"
                style="flex: 0 0 400px; border-bottom: none;"
              >
                <div class="chart-row-header">
                  <div class="chart-row-label-group">
                    <span
                      class="material-symbols-rounded chart-row-icon"
                      [style.--chart-color]="powerColor"
                      >bolt</span
                    >
                    <span class="chart-row-label">Power Curve Progress</span>
                  </div>
                </div>
                <div class="chart-row-body">
                  <div
                    id="power-evolution-chart"
                    class="insight-chart-container evolution-chart-container"
                  ></div>
                </div>
              </div>
              <div
                class="chart-row progress-chart-row"
                [style.--chart-color]="powerColor"
                style="flex: 1; border-bottom: none;"
              >
                <div class="chart-row-header">
                  <div class="chart-row-label-group">
                    <span
                      class="material-symbols-rounded chart-row-icon"
                      [style.--chart-color]="powerColor"
                      >bolt</span
                    >
                    <span class="chart-row-label" id="power-timeline-label">{{
                      powerTimelineLabel
                    }}</span>
                  </div>
                </div>
                <div class="chart-row-body">
                  <div
                    id="power-timeline-chart"
                    class="insight-chart-container evolution-chart-container"
                  ></div>
                </div>
              </div>
            </div>
            <div class="evolution-legend">
              <div class="evolution-legend-item">
                <span class="evolution-legend-line solid" [style.--chart-color]="powerColor"></span>
                <span>{{ trackName }}</span>
              </div>
              <div class="evolution-legend-item">
                <span class="evolution-legend-line dashed"></span>
                <span>All-Time Max</span>
              </div>
            </div>
            <details
              class="progress-details"
              style="margin-top: 0px;"
              [style.--chart-color]="powerColor"
            >
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
                  <tr *ngFor="let row of powerCurveRows; trackBy: trackByDur">
                    <td>{{ row.durLabel }}</td>
                    <td>{{ row.curValStr }}</td>
                    <td>
                      {{ row.maxValStr }}
                      <button
                        *ngIf="row.mxId"
                        class="evolution-select-btn"
                        [attr.data-id]="row.mxId"
                        [attr.data-idx]="row.mxIdx"
                        [attr.data-dur]="row.dur"
                        title="Select track and range"
                        (click)="onSelectCurveMax(row, $event)"
                      >
                        <span class="material-symbols-rounded">gps_fixed</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </details>
          </div>

          <!-- Heart Rate Curve Progress Card -->
          <div class="chart-row evolution-card-group" id="hr-evolution-card" *ngIf="hasHrCurve">
            <div style="display: flex; flex-direction: row; gap: 0px; align-items: stretch;">
              <div
                class="chart-row progress-chart-row"
                [style.--chart-color]="hrColor"
                style="flex: 0 0 400px; border-bottom: none;"
              >
                <div class="chart-row-header">
                  <div class="chart-row-label-group">
                    <span
                      class="material-symbols-rounded chart-row-icon"
                      [style.--chart-color]="hrColor"
                      >favorite</span
                    >
                    <span class="chart-row-label">Heart Rate Curve Progress</span>
                  </div>
                </div>
                <div class="chart-row-body">
                  <div
                    id="hr-evolution-chart"
                    class="insight-chart-container evolution-chart-container"
                  ></div>
                </div>
              </div>
              <div
                class="chart-row progress-chart-row"
                [style.--chart-color]="hrColor"
                style="flex: 1; border-bottom: none;"
              >
                <div class="chart-row-header">
                  <div class="chart-row-label-group">
                    <span
                      class="material-symbols-rounded chart-row-icon"
                      [style.--chart-color]="hrColor"
                      >favorite</span
                    >
                    <span class="chart-row-label" id="hr-timeline-label">{{
                      hrTimelineLabel
                    }}</span>
                  </div>
                </div>
                <div class="chart-row-body">
                  <div
                    id="hr-timeline-chart"
                    class="insight-chart-container evolution-chart-container"
                  ></div>
                </div>
              </div>
            </div>
            <div class="evolution-legend">
              <div class="evolution-legend-item">
                <span class="evolution-legend-line solid" [style.--chart-color]="hrColor"></span>
                <span>{{ trackName }}</span>
              </div>
              <div class="evolution-legend-item">
                <span class="evolution-legend-line dashed"></span>
                <span>All-Time Max</span>
              </div>
            </div>
            <details
              class="progress-details"
              style="margin-top: 0px;"
              [style.--chart-color]="hrColor"
            >
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
                  <tr *ngFor="let row of hrCurveRows; trackBy: trackByDur">
                    <td>{{ row.durLabel }}</td>
                    <td>{{ row.curValStr }}</td>
                    <td>
                      {{ row.maxValStr }}
                      <button
                        *ngIf="row.mxId"
                        class="evolution-select-btn"
                        [attr.data-id]="row.mxId"
                        [attr.data-idx]="row.mxIdx"
                        [attr.data-dur]="row.dur"
                        title="Select track and range"
                        (click)="onSelectCurveMax(row, $event)"
                      >
                        <span class="material-symbols-rounded">gps_fixed</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </details>
          </div>

          <!-- Longitudinal Activity History Table -->
          <div
            class="chart-row"
            id="evolution-history-card"
            *ngIf="historyRows.length > 0"
            style="padding: 10px 14px;"
          >
            <div class="chart-row-header" style="margin-bottom: 6px;">
              <div class="chart-row-label-group">
                <span class="material-symbols-rounded chart-row-icon" style="--chart-color: #45b7d1"
                  >history</span
                >
                <span class="chart-row-label"
                  >Longitudinal Activity History ({{ historyRows.length }})</span
                >
              </div>
            </div>
            <table class="accumulated-table" style="width: 100%; font-size: 11px;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Sport</th>
                  <th>Distance</th>
                  <th>Elevation</th>
                  <th>Duration</th>
                  <th>Avg Power</th>
                  <th>Avg HR</th>
                  <th>Est. TSS</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let h of historyRows; trackBy: trackByHistoryId"
                  class="clickable"
                  (click)="onHistoryRowClick(h.id)"
                >
                  <td>{{ h.dateStr }}</td>
                  <td style="font-weight: 600;">
                    <span
                      [style.background]="h.color"
                      style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px;"
                    ></span
                    >{{ h.name }}
                  </td>
                  <td>{{ h.sport }}</td>
                  <td>{{ h.distKm }}&nbsp;km</td>
                  <td>{{ h.elevGainM }}&nbsp;m</td>
                  <td>{{ h.durationStr }}</td>
                  <td>{{ h.avgPowerStr }}</td>
                  <td>{{ h.avgHrStr }}</td>
                  <td>{{ h.tssStr }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class EvolutionTabComponent implements OnInit, OnDestroy {
  public state = inject(TrackStateService);
  private cdr = inject(ChangeDetectorRef);
  private elRef = inject(ElementRef<HTMLElement>);

  public isEmpty = true;
  public currentGrouping: 'week' | 'month' = 'week';
  public currentRange = 'all';
  public pinnedDuration: number | null = null;
  public selectedSportFilter = 'all';
  public availableSports: string[] = [];

  public atlStr = '0.0';
  public ctlStr = '0.0';
  public tsbStr = '0.0';
  public tsbStatus = 'Optimal Load';
  public trackName = 'Current Track';

  public hasPowerCurve = false;
  public hasHrCurve = false;
  public powerInitialDur = 5;
  public hrInitialDur = 5;
  public powerTimelineLabel = 'Progress 5s Power';
  public hrTimelineLabel = 'Progress 5s HR';

  public accumulatedSummaryRows: AccumulatedSummaryRow[] = [];
  public distanceAccumulatedRows: AccumulatedTableRow[] = [];
  public elevationAccumulatedRows: AccumulatedTableRow[] = [];
  public powerCurveRows: CurveTableRow[] = [];
  public hrCurveRows: CurveTableRow[] = [];
  public historyRows: LongitudinalHistoryRow[] = [];

  public readonly distanceColor = Metrics.distance.color;
  public readonly distanceIcon = Metrics.distance.icon;
  public readonly elevationColor = Metrics.elevation.color;
  public readonly elevationIcon = Metrics.elevation.icon;
  public readonly powerColor = Metrics.power.color;
  public readonly hrColor = Metrics.hr.color;

  public readonly metricPills = [
    {
      target: 'distance',
      label: 'Distance',
      color: Metrics.distance.color,
      icon: Metrics.distance.icon,
    },
    {
      target: 'elevation',
      label: 'Elevation',
      color: Metrics.elevation.color,
      icon: Metrics.elevation.icon,
    },
    { target: 'power', label: 'Power', color: Metrics.power.color, icon: Metrics.power.icon },
    { target: 'hr', label: 'Heart Rate', color: Metrics.hr.color, icon: Metrics.hr.icon },
  ];

  public readonly rangeOptions = [
    { key: '1m', label: '1M' },
    { key: '2m', label: '2M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
    { key: '2y', label: '2Y' },
    { key: 'all', label: '∞' },
  ];

  public readonly pinDurationOptions: { sec: number | null; label: string }[] = [
    { sec: 5, label: '5s' },
    { sec: 30, label: '30s' },
    { sec: 60, label: '1m' },
    { sec: 300, label: '5m' },
    { sec: 1200, label: '20m' },
    { sec: null, label: 'Free' },
  ];

  private lastCurrentTrack: TrackData | null = null;
  private lastAllTracks: TrackData[] = [];
  private lastOnTrackSelect?: (id: string, range: [number, number] | null) => void;
  private lastOnDateRangeSelect?: (start: string, end: string) => void;

  constructor() {
    this.state.evolutionTab = this;
    registerEvolutionComponent(this);
  }

  ngOnInit(): void {
    const host = this.elRef.nativeElement;
    if (!document.getElementById('evolution-view')) {
      host.id = 'evolution-view';
    }
  }

  ngOnDestroy(): void {
    destroyEvolutionPlots();
    if (this.state.evolutionTab === this) {
      this.state.evolutionTab = null;
    }
  }

  public trackByLabel(_idx: number, item: AccumulatedSummaryRow): string {
    return item.label;
  }

  public trackByPeriod(_idx: number, item: AccumulatedTableRow): string {
    return item.period;
  }

  public trackByDur(_idx: number, item: CurveTableRow): number {
    return item.dur;
  }

  public trackByHistoryId(_idx: number, item: LongitudinalHistoryRow): string {
    return item.id;
  }

  public reset(): void {
    destroyEvolutionPlots();
    this.isEmpty = true;
    this.currentGrouping = 'week';
    this.currentRange = 'all';
    this.pinnedDuration = null;
    this.selectedSportFilter = 'all';
    this.accumulatedSummaryRows = [];
    this.distanceAccumulatedRows = [];
    this.elevationAccumulatedRows = [];
    this.powerCurveRows = [];
    this.hrCurveRows = [];
    this.historyRows = [];
    this.cdr.detectChanges();
  }

  public render(
    currentTrack: TrackData | null,
    allTracks: TrackData[],
    onTrackSelect?: (id: string, range: [number, number] | null) => void,
    onDateRangeSelect?: (start: string, end: string) => void,
  ): void {
    destroyEvolutionPlots();
    this.lastCurrentTrack = currentTrack;
    this.lastAllTracks = allTracks;
    this.lastOnTrackSelect = onTrackSelect;
    this.lastOnDateRangeSelect = onDateRangeSelect;

    this.isEmpty = false;
    this.currentRange = UrlState.get().progress || 'all';
    this.pinnedDuration = null;

    const filteredTracks =
      this.selectedSportFilter === 'all'
        ? allTracks
        : allTracks.filter((t) => t.sport === this.selectedSportFilter);
    const activeTracks = filteredTracks.length > 0 ? filteredTracks : allTracks;

    const payload = computeBanisterAndEvolutionData(currentTrack, activeTracks);
    this.atlStr = payload.atlStr;
    this.ctlStr = payload.ctlStr;
    this.tsbStr = payload.tsbStr;
    this.tsbStatus = payload.tsbStatus;
    this.trackName = payload.trackName;
    this.hasPowerCurve = payload.hasPowerCurve;
    this.hasHrCurve = payload.hasHrCurve;
    this.powerInitialDur = payload.powerInitialDur;
    this.hrInitialDur = payload.hrInitialDur;
    this.powerTimelineLabel = `Progress ${fmtDuration(this.powerInitialDur)} Power`;
    this.hrTimelineLabel = `Progress ${fmtDuration(this.hrInitialDur)} HR`;
    this.accumulatedSummaryRows = payload.accumulatedSummaryRows;
    this.distanceAccumulatedRows = payload.distanceAccumulatedRows;
    this.elevationAccumulatedRows = payload.elevationAccumulatedRows;
    this.powerCurveRows = payload.powerCurveRows;
    this.hrCurveRows = payload.hrCurveRows;
    this.historyRows = payload.historyRows;
    this.availableSports = payload.availableSports;

    const container = document.getElementById('evolution-view') || this.elRef.nativeElement;
    if (container) {
      container.dataset.tsb = this.tsbStr;
    }

    this.cdr.detectChanges();

    mountEvolutionPlots(
      this.elRef.nativeElement,
      currentTrack,
      activeTracks,
      this.currentRange,
      this.currentGrouping,
      (dur) => this.setPinnedDuration(dur),
      (rng) => this.setRange(rng),
      onTrackSelect,
      onDateRangeSelect,
    );
  }

  public setGrouping(grouping: 'week' | 'month'): void {
    this.currentGrouping = grouping;
    this.cdr.detectChanges();
    applyEvolutionGrouping(grouping);
  }

  public setRange(range: string): void {
    this.currentRange = range;
    this.cdr.detectChanges();
    applyEvolutionRange(range);
  }

  public setPinnedDuration(dur: number | null): void {
    this.pinnedDuration = dur;
    const pDur = dur !== null ? dur : this.powerInitialDur;
    const hDur = dur !== null ? dur : this.hrInitialDur;
    this.powerTimelineLabel = `Progress ${fmtDuration(pDur)} Power${dur !== null ? ' (Pinned)' : ''}`;
    this.hrTimelineLabel = `Progress ${fmtDuration(hDur)} HR${dur !== null ? ' (Pinned)' : ''}`;
    this.cdr.detectChanges();
    applyEvolutionPinnedDuration(dur);
  }

  public onSportFilterChange(): void {
    this.render(
      this.lastCurrentTrack,
      this.lastAllTracks,
      this.lastOnTrackSelect,
      this.lastOnDateRangeSelect,
    );
  }

  public onMetricPillClick(target: string): void {
    const targetEl = document.getElementById(`${target}-evolution-card`);
    targetEl?.scrollIntoView({ behavior: 'smooth' });
  }

  public onDistanceScroll(event: Event): void {
    const distScroll = event.target as HTMLElement;
    const elevScroll = this.elRef.nativeElement.querySelector(
      '.elevation-progress-card .chart-scroll-container',
    ) as HTMLElement | null;
    if (distScroll && elevScroll && elevScroll.scrollLeft !== distScroll.scrollLeft) {
      elevScroll.scrollLeft = distScroll.scrollLeft;
    }
  }

  public onElevationScroll(event: Event): void {
    const elevScroll = event.target as HTMLElement;
    const distScroll = this.elRef.nativeElement.querySelector(
      '.distance-progress-card .chart-scroll-container',
    ) as HTMLElement | null;
    if (distScroll && elevScroll && distScroll.scrollLeft !== elevScroll.scrollLeft) {
      distScroll.scrollLeft = elevScroll.scrollLeft;
    }
  }

  public onSelectCurveMax(row: CurveTableRow, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!row.mxId) return;
    document.dispatchEvent(
      new CustomEvent('select-track', {
        detail: {
          id: row.mxId,
          idx: row.mxIdx != null ? Number(row.mxIdx) : null,
          dur: row.dur != null ? Number(row.dur) : null,
        },
      }),
    );
  }

  public onHistoryRowClick(trackId: string): void {
    if (this.lastOnTrackSelect) {
      this.lastOnTrackSelect(trackId, null);
    } else {
      this.state.selectTrack(trackId, true);
    }
  }
}
