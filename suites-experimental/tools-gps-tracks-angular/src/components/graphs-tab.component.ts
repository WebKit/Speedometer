// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackStateService } from '../services/track-state.service';
import { ChartView } from '../charts';
import { MapView } from '../map';
import { UrlState } from '../url-state';
import { TrackStats } from '../parsers';
import { fmtSecs } from '../utils';

export interface MetricPillConfig {
  key: string;
  label: string;
  icon: string;
  color: string;
  title: string;
}

export interface StatsDisplayRow {
  dist: string;
  duration: string;
  elevation: string;
  avgSpeed: string;
  avgPower: string;
  avgHr: string;
  avgTemp: string;
}

const DEFAULT_PILLS: MetricPillConfig[] = [
  {
    key: 'elevation',
    label: 'Elevation',
    icon: 'height',
    color: '#4ecdc4',
    title: 'Toggle Elevation graph',
  },
  {
    key: 'vam',
    label: 'VAM',
    icon: 'trending_up',
    color: '#ffa07a',
    title: 'Toggle VAM graph',
  },
  {
    key: 'speed',
    label: 'Speed',
    icon: 'speed',
    color: '#45b7d1',
    title: 'Toggle Speed graph',
  },
  {
    key: 'gradient',
    label: 'Gradient',
    icon: 'trending_up',
    color: '#a8c8a0',
    title: 'Toggle Gradient graph',
  },
  {
    key: 'power',
    label: 'Power',
    icon: 'bolt',
    color: '#f7dc6f',
    title: 'Toggle Power graph',
  },
  {
    key: 'hr',
    label: 'Heart Rate',
    icon: 'favorite',
    color: '#ff6b6b',
    title: 'Toggle Heart Rate graph',
  },
  {
    key: 'cadence',
    label: 'Cadence',
    icon: 'directions_run',
    color: '#bb8fce',
    title: 'Toggle Cadence graph',
  },
  {
    key: 'temperature',
    label: 'Temp',
    icon: 'thermostat',
    color: '#f8c471',
    title: 'Toggle Temperature graph',
  },
  {
    key: 'battery',
    label: 'Battery',
    icon: 'battery_full',
    color: '#45b7d1',
    title: 'Toggle Battery graph',
  },
  {
    key: 'gearRear',
    label: 'Rear Gear',
    icon: 'settings',
    color: '#82e0aa',
    title: 'Toggle Rear Gear graph',
  },
  {
    key: 'gearFront',
    label: 'Front Gear',
    icon: 'settings_input_component',
    color: '#a8c8a0',
    title: 'Toggle Front Gear graph',
  },
  {
    key: 'gears',
    label: 'Gears',
    icon: 'settings',
    color: '#ff8c00',
    title: 'Toggle Gears graph',
  },
];

@Component({
  selector: 'app-graphs-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div id="chart-toolbar" [class.collapsed]="toolbarCollapsed">
      <div
        id="metric-pills"
        (dragstart)="onDragStart($event)"
        (dragover)="onDragOver($event)"
        (dragend)="onDragEnd()"
      >
        <button
          *ngFor="let pill of metricPills; trackBy: trackByPillKey"
          class="metric-pill"
          [class.active]="isPillActive(pill.key)"
          [class.disabled]="hasTrack && !isPillAvailable(pill.key)"
          [class.overflow-hidden]="overflowHiddenPills.has(pill.key)"
          [attr.data-metric]="pill.key"
          [style.--pill-color]="pill.color"
          [title]="pill.title"
          draggable="true"
          (click)="onPillClick(pill.key)"
        >
          <span class="material-symbols-rounded">{{ pill.icon }}</span
          >{{ pill.label }}
        </button>
        <span id="pill-overflow" [class.hidden]="!toolbarCollapsed">...</span>
      </div>
      <button
        id="btn-metric-menu"
        class="sort-select-btn"
        title="Select metrics to display"
        (click)="onOpenMetricMenu($event)"
      >
        <span class="material-symbols-rounded">bar_chart</span>
        <span class="btn-label">Graphs</span>
        <span class="material-symbols-rounded">expand_more</span>
      </button>
      <div id="chart-options">
        <div id="x-axis-ctrl" class="seg-ctrl">
          <button
            class="seg-btn"
            [class.active]="xAxis === 'distance'"
            data-axis="distance"
            title="Switch X-axis to Distance"
            (click)="onSelectXAxis('distance')"
          >
            <span class="material-symbols-rounded">route</span>Distance
          </button>
          <button
            class="seg-btn"
            [class.active]="xAxis === 'time'"
            data-axis="time"
            title="Switch X-axis to Time"
            (click)="onSelectXAxis('time')"
          >
            <span class="material-symbols-rounded">schedule</span>Time
          </button>
        </div>
        <button
          id="btn-follow-dot"
          class="icon-btn"
          [class.active]="state.followDot"
          title="Toggle Follow Point on Map"
          (click)="onToggleFollowDot()"
        >
          <span class="material-symbols-rounded">my_location</span>
        </button>
        <button
          id="btn-reset-zoom"
          class="icon-btn"
          title="Reset Zoom and Clear Selection"
          (click)="onResetZoom()"
        >
          <span class="material-symbols-rounded">restart_alt</span>
        </button>
      </div>
    </div>

    <div id="chart-stats" [class.hidden]="!hasTrack">
      <div id="chart-stats-wrap">
        <div id="chart-stats-total" class="stats-row">
          <div class="stats-row-label">Total</div>
          <div class="stats-cell" id="stat-distance" title="Total Distance">
            <span class="stat-label">Dist</span
            ><span class="stat-value">{{ totalStats.dist }}</span>
          </div>
          <div class="stats-cell" id="stat-duration" title="Total Duration">
            <span class="stat-label">Time</span
            ><span class="stat-value">{{ totalStats.duration }}</span>
          </div>
          <div class="stats-cell" id="stat-elevation" title="Total Elevation Gain">
            <span class="stat-label">Elev</span
            ><span class="stat-value">{{ totalStats.elevation }}</span>
          </div>
          <div class="stats-cell" id="stat-avg-speed" title="Average Speed">
            <span class="stat-label">Avg Spd</span
            ><span class="stat-value">{{ totalStats.avgSpeed }}</span>
          </div>
          <div class="stats-cell" id="stat-avg-power" title="Average Power">
            <span class="stat-label">Avg Pwr</span
            ><span class="stat-value">{{ totalStats.avgPower }}</span>
          </div>
          <div class="stats-cell" id="stat-avg-hr" title="Average Heart Rate">
            <span class="stat-label">Avg HR</span
            ><span class="stat-value">{{ totalStats.avgHr }}</span>
          </div>
          <div class="stats-cell" id="stat-avg-temp" title="Average Temperature">
            <span class="stat-label">Avg Temp</span
            ><span class="stat-value">{{ totalStats.avgTemp }}</span>
          </div>
        </div>
        <div id="chart-stats-sel" class="stats-row sel-row" [class.hidden]="!hasSelection">
          <div class="stats-row-label sel-label">
            Sel
            <button
              id="sel-cancel-btn"
              class="icon-btn danger"
              title="Clear selection and reset range"
              (click)="onCancelSelection()"
            >
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
          <div class="stats-cell" id="sel-distance" title="Selection Distance">
            <span class="stat-label">Dist</span
            ><span class="stat-value">{{ selectionStats.dist }}</span>
          </div>
          <div class="stats-cell" id="sel-duration" title="Selection Duration">
            <span class="stat-label">Time</span
            ><span class="stat-value">{{ selectionStats.duration }}</span>
          </div>
          <div class="stats-cell" id="sel-elevation" title="Selection Elevation Gain">
            <span class="stat-label">Elev</span
            ><span class="stat-value">{{ selectionStats.elevation }}</span>
          </div>
          <div class="stats-cell" id="sel-avg-speed" title="Selection Average Speed">
            <span class="stat-label">Avg Spd</span
            ><span class="stat-value">{{ selectionStats.avgSpeed }}</span>
          </div>
          <div class="stats-cell" id="sel-avg-power" title="Selection Average Power">
            <span class="stat-label">Avg Pwr</span
            ><span class="stat-value">{{ selectionStats.avgPower }}</span>
          </div>
          <div class="stats-cell" id="sel-avg-hr" title="Selection Average Heart Rate">
            <span class="stat-label">Avg HR</span
            ><span class="stat-value">{{ selectionStats.avgHr }}</span>
          </div>
          <div class="stats-cell" id="sel-avg-temp" title="Selection Average Temperature">
            <span class="stat-label">Avg Temp</span
            ><span class="stat-value">{{ selectionStats.avgTemp }}</span>
          </div>
        </div>
      </div>
    </div>

    <div id="charts-container">
      <div id="chart-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track to view analysis</div>
      </div>
    </div>
  `,
})
export class GraphsTabComponent implements OnInit {
  public state = inject(TrackStateService);
  private cdr = inject(ChangeDetectorRef);

  metricPills: MetricPillConfig[] = [...DEFAULT_PILLS];
  activeMetrics: Set<string> = new Set(['elevation', 'speed', 'power', 'hr', 'temperature']);
  availableMetrics: Set<string> = new Set();
  overflowHiddenPills: Set<string> = new Set();
  toolbarCollapsed: boolean = false;
  xAxis: string = 'time';
  hasTrack: boolean = false;
  hasSelection: boolean = false;

  totalStats: StatsDisplayRow = {
    dist: '--',
    duration: '--',
    elevation: '--',
    avgSpeed: '--',
    avgPower: '--',
    avgHr: '--',
    avgTemp: '--',
  };

  selectionStats: StatsDisplayRow = {
    dist: '--',
    duration: '--',
    elevation: '--',
    avgSpeed: '--',
    avgPower: '--',
    avgHr: '--',
    avgTemp: '--',
  };

  private draggedEl: HTMLElement | null = null;

  constructor() {
    this.state.graphsTab = this;
  }

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  trackByPillKey(_index: number, item: MetricPillConfig): string {
    return item.key;
  }

  isPillActive(key: string): boolean {
    if (!this.hasTrack) {
      return this.activeMetrics.has(key);
    }
    return this.availableMetrics.has(key) && this.activeMetrics.has(key);
  }

  isPillAvailable(key: string): boolean {
    return this.availableMetrics.has(key);
  }

  syncFromChartView(): void {
    this.activeMetrics = new Set(ChartView.getActiveMetrics());
    this.availableMetrics = new Set(ChartView.getAvailableMetrics());
    this.xAxis = ChartView.getXAxis();
    this.hasTrack = this.state.selectedTrack !== null;
    if (this.state.selectedTrack) {
      const s = this.state.selectedTrack.stats;
      this.totalStats = {
        dist: s.totalDist != null ? `${(s.totalDist / 1000).toFixed(1)} km` : '—',
        duration: s.duration != null ? fmtSecs(Math.floor(s.duration / 1000)) : '—',
        elevation: s.elevGain != null ? `${Math.round(s.elevGain)} m` : '—',
        avgSpeed: s.avgSpeed != null ? `${(s.avgSpeed * 3.6).toFixed(1)} km/h` : '—',
        avgPower: s.avgPower != null ? `${Math.round(s.avgPower)} W` : '—',
        avgHr: s.avgHR != null ? `${s.avgHR} bpm` : '—',
        avgTemp: s.avgTemp != null ? `${s.avgTemp.toFixed(1)} °C` : '—',
      };
    } else {
      this.totalStats = {
        dist: '--',
        duration: '--',
        elevation: '--',
        avgSpeed: '--',
        avgPower: '--',
        avgHr: '--',
        avgTemp: '--',
      };
      this.hasSelection = false;
    }
    this.updateToolbarLayout();
    this.cdr.detectChanges();
  }

  updateTotalStats(row: Partial<StatsDisplayRow>): void {
    this.hasTrack = true;
    this.totalStats = { ...this.totalStats, ...row };
    this.cdr.detectChanges();
  }

  setSelectionStats(stats: TrackStats | null): void {
    if (!stats) {
      this.hasSelection = false;
      this.selectionStats = {
        dist: '--',
        duration: '--',
        elevation: '--',
        avgSpeed: '--',
        avgPower: '--',
        avgHr: '--',
        avgTemp: '--',
      };
    } else {
      this.hasSelection = true;
      this.selectionStats = {
        dist: stats.totalDist != null ? `${(stats.totalDist / 1000).toFixed(1)} km` : '—',
        duration: stats.duration != null ? fmtSecs(Math.floor(stats.duration / 1000)) : '—',
        elevation: stats.elevGain != null ? `${Math.round(stats.elevGain)} m` : '—',
        avgSpeed: stats.avgSpeed != null ? `${(stats.avgSpeed * 3.6).toFixed(1)} km/h` : '—',
        avgPower: stats.avgPower != null ? `${stats.avgPower} W` : '—',
        avgHr: stats.avgHR != null ? `${stats.avgHR} bpm` : '—',
        avgTemp: stats.avgTemp != null ? `${stats.avgTemp.toFixed(1)} °C` : '—',
      };
    }
    this.cdr.detectChanges();
  }

  updateToolbarLayout(): void {
    const toolbar = document.getElementById('chart-toolbar');
    const availableW = toolbar ? Math.max(0, toolbar.clientWidth - 280) : 600;
    let totalW = 0;
    let hidden = false;
    const nextOverflow = new Set<string>();

    for (const pill of this.metricPills) {
      if (!this.isPillActive(pill.key)) continue;
      const deterministicPillWidth = 36 + pill.key.length * 6;
      totalW += deterministicPillWidth + 6;
      if (totalW > availableW) {
        hidden = true;
        nextOverflow.add(pill.key);
      }
    }

    this.overflowHiddenPills = nextOverflow;
    this.toolbarCollapsed = hidden;
    this.cdr.detectChanges();
  }

  onPillClick(metric: string): void {
    ChartView.toggleMetric(metric);
    this.syncMetricsToUrl();
    this.syncFromChartView();

    if (ChartView.getActiveMetrics().has(metric)) {
      const targetEl = document.querySelector(`.chart-row[data-metric="${metric}"]`);
      targetEl?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSelectXAxis(axis: string): void {
    this.xAxis = axis;
    ChartView.setXAxis(axis);
    UrlState.patch({ xaxis: axis });
    this.cdr.detectChanges();
  }

  onToggleFollowDot(): void {
    this.state.followDot = !this.state.followDot;
    this.cdr.detectChanges();
  }

  onResetZoom(): void {
    ChartView.resetZoom();
    MapView.clearHighlight();
    this.hasSelection = false;
    this.cdr.detectChanges();
  }

  onCancelSelection(): void {
    ChartView.cancelSelection();
    this.hasSelection = false;
    this.cdr.detectChanges();
  }

  onOpenMetricMenu(e: MouseEvent): void {
    e.stopPropagation();
    const anchorEl = e.currentTarget as HTMLElement;
    document.querySelectorAll('.metric-menu-popup').forEach((el) => el.remove());

    const popup = document.createElement('div');
    popup.className = 'metric-menu-popup';

    const metrics = ChartView.METRICS;
    const available = ChartView.getAvailableMetrics();
    const active = ChartView.getActiveMetrics();

    Object.entries(metrics).forEach(([key, def]) => {
      if (!available.has(key)) return;

      const item = document.createElement('div');
      item.className = `menu-item ${active.has(key) ? 'active' : ''}`;
      item.innerHTML = `
        <span class="material-symbols-rounded" style="color:${def.color}">${def.icon}</span>
        <span class="item-label">${def.label}</span>
        <span class="material-symbols-rounded check">${active.has(key) ? 'check' : ''}</span>
      `;
      item.addEventListener('click', () => {
        ChartView.toggleMetric(key);
        const isNowActive = ChartView.getActiveMetrics().has(key);
        item.classList.toggle('active', isNowActive);
        item.querySelector('.check')!.textContent = isNowActive ? 'check' : '';
        this.syncMetricsToUrl();
        this.syncFromChartView();
      });
      popup.appendChild(item);
    });

    const rect = anchorEl.getBoundingClientRect();
    popup.style.top = `${rect.bottom + 5}px`;
    popup.style.right = `${window.innerWidth - rect.right}px`;
    document.body.appendChild(popup);

    const close = (ev: MouseEvent) => {
      if (!popup.contains(ev.target as Node) && !anchorEl.contains(ev.target as Node)) {
        popup.remove();
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 0);
  }

  onDragStart(e: DragEvent): void {
    const target = (e.target as HTMLElement).closest('.metric-pill') as HTMLElement;
    if (!target) return;
    this.draggedEl = target;
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    target.classList.add('dragging-pill');
    setTimeout(() => (target.style.opacity = '0.4'), 0);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const container = document.getElementById('metric-pills');
    const target = (e.target as HTMLElement).closest('.metric-pill') as HTMLElement;
    if (container && target && this.draggedEl && target !== this.draggedEl) {
      const rect = target.getBoundingClientRect();
      const next = e.clientX - rect.left > rect.width / 2;
      container.insertBefore(this.draggedEl, next ? target.nextSibling : target);
    }
  }

  onDragEnd(): void {
    if (!this.draggedEl) return;
    this.draggedEl.classList.remove('dragging-pill');
    this.draggedEl.style.opacity = '';
    this.draggedEl = null;

    const container = document.getElementById('metric-pills');
    if (!container) return;
    const keys = Array.from(container.querySelectorAll('.metric-pill')).map(
      (el) => (el as HTMLElement).dataset.metric!,
    );
    ChartView.updateMetricOrder(keys);
    this.syncMetricsToUrl();
    this.cdr.detectChanges();
  }

  syncMetricsToUrl(): void {
    const active = ChartView.getActiveMetrics();
    const metrics = ChartView.METRICS;
    const abbrs = Array.from(active).map((key) => metrics[key].abbr);
    UrlState.patch({ metrics: abbrs.length ? abbrs : null });
  }
}
