// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {
  Component,
  ChangeDetectorRef,
  ApplicationRef,
  AfterViewInit,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackStateService, TRACK_COLORS } from './services/track-state.service';
import { GraphsTabComponent } from './components/graphs-tab.component';
import { InsightsTabComponent } from './components/insights-tab.component';
import { DetailsTabComponent } from './components/details-tab.component';
import { CombinedTabComponent } from './components/combined-tab.component';
import { EvolutionTabComponent } from './components/evolution-tab.component';
import { CoursesTabComponent } from './components/courses-tab.component';
import { Storage } from './storage';
import { UrlState, AppState } from './url-state';
import { Parsers, TrackData, TrackPoint, calculateBounds, simplifyTrack } from './parsers';
import { MapView } from './map';
import { ChartView } from './charts';
import { renderDetails, initDetails, resetDetails } from './tabs/details';
import { renderInsights, initInsights, resetInsights } from './tabs/insights';
import {
  renderCombined,
  initCombined,
  resizeCombined,
  resetCombined,
  setCombinedMetrics,
  setCombinedPolar,
  setCombinedSliderProgress,
} from './tabs/combined';
import {
  renderEvolution,
  resetEvolution,
  setEvolutionGrouping,
  setEvolutionRange,
  setEvolutionPinnedDuration,
} from './tabs/progress';
import {
  renderCourses,
  initCourses,
  prepareBenchmarkCourses,
  getBenchmarkCourseIds,
  resetCourses,
  selectCourse,
} from './tabs/courses';
import { fmtDate, getTagColor, compactId, shortRandom } from './utils';

const POINT_ZOOM_LEVEL = 16;

const SORT_OPTIONS = [
  { label: 'Newest first', val: 'date-desc', icon: 'calendar_today' },
  { label: 'Oldest first', val: 'date-asc', icon: 'history' },
  { label: 'Longest distance', val: 'dist-desc', icon: 'straighten' },
  { label: 'Shortest distance', val: 'dist-asc', icon: 'horizontal_rule' },
  { label: 'Longest duration', val: 'dur-desc', icon: 'timer' },
  { label: 'Shortest duration', val: 'dur-asc', icon: 'timer_off' },
];

const FILTER_METRIC_OPTIONS = [
  { key: 'power', title: 'Power', icon: 'bolt' },
  { key: 'hr', title: 'Heart Rate', icon: 'favorite' },
  { key: 'cadence', title: 'Cadence', icon: 'directions_run' },
  { key: 'temperature', title: 'Temperature', icon: 'thermostat' },
  { key: 'battery', title: 'Battery', icon: 'battery_full' },
  { key: 'gearRear', title: 'Rear Gear', icon: 'settings' },
  { key: 'gearFront', title: 'Front Gear', icon: 'settings_input_component' },
];

const TABS = [
  { id: 'graphs', label: 'Analysis', icon: 'monitoring', marginLeft: '' },
  { id: 'insights', label: 'Insights', icon: 'analytics', marginLeft: '' },
  { id: 'details', label: 'Details', icon: 'list_alt', marginLeft: '' },
  { id: 'combined', label: 'Combined', icon: 'layers', marginLeft: '' },
  { id: 'evolution', label: 'Progress', icon: 'timeline', marginLeft: 'auto' },
  { id: 'courses', label: 'Courses', icon: 'route', marginLeft: '' },
];

function isSameDay(t1: number, t2: number): boolean {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GraphsTabComponent,
    InsightsTabComponent,
    DetailsTabComponent,
    CombinedTabComponent,
    EvolutionTabComponent,
    CoursesTabComponent,
  ],
  template: `
    <div id="benchmark-controls" style="display: none">
      <button id="btn-step-load" (click)="runBenchmarkLoad()">Step 1: Load and Parse Files</button>
      <button id="btn-step-analysis" (click)="runBenchmarkAnalysis()">
        Step 2: Display Analysis Metrics
      </button>
      <button id="btn-step-insights" (click)="runBenchmarkInsights()">
        Step 3: Display Insights
      </button>
      <button id="btn-step-details" (click)="runBenchmarkDetails()">Step 4: Display Details</button>
      <button id="btn-step-aggregate" (click)="runBenchmarkAggregate()">
        Step 5: Display Aggregate Metrics
      </button>
      <button id="btn-step-evolution" (click)="runBenchmarkEvolution()">
        Step 6: Display Evolution Metrics
      </button>
      <button id="btn-step-courses" (click)="runBenchmarkCourses()">Step 7: Display Courses</button>
    </div>

    <div id="global-loader" [class.hidden]="!loaderVisible">
      <div class="loader-box">
        <button
          id="loader-close"
          class="material-symbols-rounded"
          title="Cancel import"
          (click)="onCancelLoader()"
        >
          close
        </button>
        <div class="loader-icon-wrap">
          <span class="material-symbols-rounded" [style.color]="loaderIconColor">{{
            loaderIcon
          }}</span>
          <div id="loader-warning-count" [style.display]="loaderWarningCount > 0 ? 'flex' : 'none'">
            <span>{{ loaderWarningCount }}</span>
            <span class="material-symbols-rounded font-l">description</span>
          </div>
        </div>
        <div class="loader-content">
          <div id="loader-text">{{ loaderText }}</div>
          <div id="loader-filename">{{ loaderFilename }}</div>
          <div id="loader-progress-wrap">
            <div id="loader-progress-bar" [style.width.%]="loaderProgressPct"></div>
          </div>
          <div id="loader-subtext">
            <span class="progress-index">{{ loaderProgressIndex }}</span>
            <span class="progress-total">{{ loaderProgressTotal }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Sidebar ── -->
    <aside id="sidebar">
      <div id="sidebar-header">
        <div class="logo">
          <span class="logo-icon material-symbols-rounded">terrain</span>
          <div>
            <div class="logo-title">Weg</div>
            <div class="logo-sub">GPS Analysis</div>
          </div>
        </div>
      </div>

      <div
        id="drop-zone"
        class="drop-idle"
        [class.drop-active]="dropActive"
        style="cursor: pointer"
      >
        <div
          id="import-warning"
          class="material-symbols-rounded"
          [class.hidden]="state.skippedImports.length === 0"
          style="color: #f59e0b; cursor: pointer; position: absolute; top: 10px; right: 10px"
          [title]="importWarningTitle"
          (click)="onShowSkippedImportsModal($event)"
        >
          warning
        </div>
        <div class="drop-icon material-symbols-rounded">download</div>
        <div class="drop-primary">Drop GPS files here</div>
        <div class="drop-formats">
          <span class="badge">GPX</span>
          <span class="badge">FIT</span>
          <span class="badge">TCX</span>
          <span class="badge">KML</span>
        </div>
        <div class="drop-browse-container">
          <label class="drop-browse" for="file-input">
            <span class="material-symbols-rounded">upload_file</span>Files
            <input
              type="file"
              id="file-input"
              multiple
              accept=".gpx,.fit,.tcx,.kml"
              hidden
              (change)="onFileInputChange($event)"
            />
          </label>
          <span class="drop-separator">·</span>
          <label class="drop-browse" id="folder-label" for="folder-input">
            <span class="material-symbols-rounded">folder_open</span>Folders
            <input
              type="file"
              id="folder-input"
              webkitdirectory
              directory
              mozdirectory
              odirectory
              multiple
              hidden
              (change)="onFileInputChange($event)"
            />
          </label>
        </div>
      </div>

      <div id="track-list-header">
        <span class="section-label">{{ trackListHeaderLabel }}</span>
        <div class="header-actions">
          <button
            id="btn-toggle-filters"
            title="Filter tracks"
            class="icon-btn"
            [class.active]="filterPanelOpen"
            (click)="onToggleFilterPanel()"
          >
            <span class="material-symbols-rounded">filter_alt</span>
          </button>
          <button
            id="btn-fit-all"
            title="Fit all tracks on map"
            class="icon-btn"
            (click)="onFitAll()"
          >
            <span class="material-symbols-rounded">zoom_out_map</span>
          </button>
          <button
            id="btn-clear-all"
            title="Remove all tracks"
            class="icon-btn danger"
            (click)="onClearAll()"
          >
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      </div>

      <div id="track-controls">
        <div class="search-bar">
          <span class="material-symbols-rounded search-icon">search</span>
          <input
            type="text"
            id="track-search"
            placeholder="Search tracks..."
            [value]="state.searchQuery"
            (input)="onSearchInput($event)"
          />
          <button
            id="btn-regex-toggle"
            class="icon-btn mini"
            [class.active]="state.searchRegex"
            title="Use Regular Expression"
            (click)="onToggleRegex()"
          >
            .*
          </button>
        </div>
      </div>

      <div id="filter-panel" [class.hidden]="!filterPanelOpen">
        <div class="filter-group">
          <label><span class="material-symbols-rounded">calendar_month</span>Date Range</label>
          <div class="filter-row">
            <input
              type="date"
              id="filter-date-start"
              [value]="state.filters.date[0] || ''"
              (change)="onFilterInput('date', 0, $event)"
            />
            <span>to</span>
            <input
              type="date"
              id="filter-date-end"
              [value]="state.filters.date[1] || ''"
              (change)="onFilterInput('date', 1, $event)"
            />
          </div>
        </div>
        <div class="filter-group">
          <label><span class="material-symbols-rounded">route</span>Distance (km)</label>
          <div class="filter-row">
            <input
              type="number"
              id="filter-dist-min"
              placeholder="Min"
              min="0"
              step="1"
              [value]="state.filters.dist[0] !== null ? state.filters.dist[0] : ''"
              (input)="onFilterInput('dist', 0, $event)"
            />
            <span>–</span>
            <input
              type="number"
              id="filter-dist-max"
              placeholder="Max"
              min="0"
              step="1"
              [value]="state.filters.dist[1] !== null ? state.filters.dist[1] : ''"
              (input)="onFilterInput('dist', 1, $event)"
            />
          </div>
        </div>
        <div class="filter-group">
          <label><span class="material-symbols-rounded">schedule</span>Duration (h)</label>
          <div class="filter-row">
            <input
              type="number"
              id="filter-dur-min"
              placeholder="Min"
              min="0"
              step="0.5"
              [value]="state.filters.dur[0] !== null ? state.filters.dur[0] : ''"
              (input)="onFilterInput('dur', 0, $event)"
            />
            <span>–</span>
            <input
              type="number"
              id="filter-dur-max"
              placeholder="Max"
              min="0"
              step="0.5"
              [value]="state.filters.dur[1] !== null ? state.filters.dur[1] : ''"
              (input)="onFilterInput('dur', 1, $event)"
            />
          </div>
        </div>
        <div class="filter-group">
          <label><span class="material-symbols-rounded">category</span>Sport</label>
          <div
            class="filter-row"
            id="sport-filter-container"
            style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap"
          >
            <div id="common-sports" style="display: flex; gap: 4px">
              <button
                *ngFor="let sport of commonSportOptions"
                class="mini-pill"
                [class.active]="state.filters.sport === sport"
                [attr.data-sport]="sport"
                [title]="capitalize(sport)"
                (click)="onSelectSportFilter(sport)"
              >
                <span class="material-symbols-rounded">{{ getSportIcon(sport) }}</span>
              </button>
            </div>
            <div
              class="dropdown"
              id="sport-burger-dropdown"
              [style.display]="allSportOptions.length > 4 ? 'inline-block' : 'none'"
              style="position: relative"
            >
              <button
                class="mini-pill"
                id="sport-burger-btn"
                title="More sports"
                (click)="onToggleSportDropdown($event)"
              >
                <span class="material-symbols-rounded">menu</span>
              </button>
              <div
                class="dropdown-content"
                id="sport-dropdown-content"
                [style.display]="sportDropdownOpen ? 'block' : 'none'"
                style="
                  position: absolute;
                  background-color: var(--surface);
                  min-width: 160px;
                  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                  z-index: 100;
                  border: 1px solid var(--border);
                  border-radius: 4px;
                  right: 0;
                "
              >
                <div
                  *ngFor="let sport of allSportOptions"
                  class="dropdown-item"
                  [class.active]="state.filters.sport === sport"
                  [attr.data-sport]="sport"
                  style="padding: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px"
                  (click)="onSelectSportFilter(sport, true)"
                >
                  <span class="material-symbols-rounded">{{ getSportIcon(sport) }}</span>
                  <span>{{ capitalize(sport) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="filter-group">
          <label><span class="material-symbols-rounded">label</span>Tags</label>
          <div class="filter-row">
            <input
              type="text"
              id="filter-tags"
              placeholder="e.g. race, commute"
              style="flex: 1"
              [value]="state.filters.tags.join(', ')"
              (input)="onFilterTagsInput($event)"
            />
          </div>
        </div>
        <div class="filter-group">
          <label><span class="material-symbols-rounded">query_stats</span>Has Metrics</label>
          <div id="filter-metrics" class="filter-metrics-grid">
            <button
              *ngFor="let m of filterMetricOptions"
              class="mini-pill"
              [class.active]="state.filters.metrics.has(m.key)"
              [attr.data-metric]="m.key"
              [title]="m.title"
              (click)="onToggleMetricFilter(m.key)"
            >
              <span class="material-symbols-rounded">{{ m.icon }}</span>
            </button>
          </div>
        </div>
        <div class="filter-footer">
          <button
            id="btn-reset-filters"
            class="icon-btn"
            title="Reset Filters"
            (click)="onResetFilters()"
          >
            <span class="material-symbols-rounded">filter_alt_off</span>
          </button>
        </div>
      </div>

      <div id="sort-controls">
        <div class="sort-ctrl">
          <label>Sort:</label>
          <button id="btn-sort-menu" class="sort-select-btn" (click)="onOpenSortMenu($event)">
            <span id="sort-current-icon" class="material-symbols-rounded">{{
              currentSortIcon
            }}</span>
            <span id="sort-current-label">{{ currentSortLabel }}</span>
            <span class="material-symbols-rounded arrow">expand_more</span>
          </button>
        </div>
      </div>

      <div id="track-list">
        <div id="track-list-empty" *ngIf="displayedTracks.length === 0">No tracks loaded yet</div>
        <div
          *ngFor="let track of displayedTracks; trackBy: trackById"
          class="track-item"
          [class.selected]="track.id === state.selectedId"
          [attr.data-id]="track.id"
          (click)="onTrackItemClick($event, track)"
        >
          <div class="track-color" [style.background]="track.color"></div>
          <div class="track-info">
            <div class="track-name">{{ track.displayName || track.name }}</div>
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;"
            >
              <div class="track-meta">
                <span>{{ formatTrackDate(track) }}</span>
                <span
                  ><span style="display: inline-block; width: 25px; text-align: right;">{{
                    formatTrackKm(track)
                  }}</span>
                  km</span
                >
                <span
                  *ngIf="track.sport"
                  class="material-symbols-rounded sport-icon"
                  [title]="track.sport"
                  >{{ getSportIcon(track.sport) }}</span
                >
                <span class="badge">{{ track.format.toUpperCase() }}</span>
              </div>
              <button
                class="icon-btn mini toggle-vis"
                title="Toggle visibility"
                (click)="onToggleTrackVis($event, track)"
              >
                <span class="material-symbols-rounded">{{
                  track.visible ? 'visibility' : 'visibility_off'
                }}</span>
              </button>
            </div>
            <div class="track-tags" *ngIf="track.tags && track.tags.length > 0">
              <span
                *ngFor="let tag of track.tags"
                class="track-tag"
                [style.borderColor]="getTagColor(tag) + '44'"
                [style.color]="getTagColor(tag)"
                >{{ tag }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </aside>

    <div id="sidebar-resizer"></div>

    <!-- ── Main ── -->
    <div id="main">
      <!-- Map (removed for benchmark workload) -->
      <div id="map-container" style="display: none">
        <div id="map-loader" class="hidden"><span></span></div>
      </div>
      <div id="resize-handle" style="display: none"></div>

      <!-- Chart panel -->
      <div id="chart-panel">
        <div id="tab-nav">
          <button
            *ngFor="let tab of tabs"
            class="tab-btn"
            [class.active]="state.activeTab === tab.id"
            [attr.data-tab]="tab.id"
            [style.marginLeft]="tab.marginLeft || null"
            (click)="onTabClick(tab.id)"
          >
            <span class="material-symbols-rounded">{{ tab.icon }}</span
            >{{ tab.label }}
          </button>
        </div>

        <div id="tab-graphs" class="tab-content" [class.active]="state.activeTab === 'graphs'">
          <app-graphs-tab></app-graphs-tab>
        </div>

        <div id="tab-insights" class="tab-content" [class.active]="state.activeTab === 'insights'">
          <app-insights-tab></app-insights-tab>
        </div>

        <div id="tab-details" class="tab-content" [class.active]="state.activeTab === 'details'">
          <app-details-tab></app-details-tab>
        </div>

        <div id="tab-combined" class="tab-content" [class.active]="state.activeTab === 'combined'">
          <app-combined-tab></app-combined-tab>
        </div>

        <div
          id="tab-evolution"
          class="tab-content"
          [class.active]="state.activeTab === 'evolution'"
        >
          <div id="evolution-view">
            <app-evolution-tab></app-evolution-tab>
          </div>
        </div>

        <div id="tab-courses" class="tab-content" [class.active]="state.activeTab === 'courses'">
          <div id="courses-view">
            <app-courses-tab></app-courses-tab>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit, AfterViewInit {
  public state = inject(TrackStateService);
  private cdr = inject(ChangeDetectorRef);
  private appRef = inject(ApplicationRef);

  readonly tabs = TABS;
  readonly filterMetricOptions = FILTER_METRIC_OPTIONS;

  displayedTracks: TrackData[] = [];
  allSportOptions: string[] = [];
  commonSportOptions: string[] = [];
  filterPanelOpen: boolean = false;
  sportDropdownOpen: boolean = false;
  dropActive: boolean = false;

  loaderVisible: boolean = false;
  loaderText: string = 'Importing tracks';
  loaderFilename: string = '';
  loaderProgressPct: number = 0;
  loaderProgressIndex: string = '';
  loaderProgressTotal: string = '';
  loaderIcon: string = 'download';
  loaderIconColor: string = 'var(--accent)';
  loaderWarningCount: number = 0;

  private preloadedBenchmarkPayloads:
    | {
        cleanName: string;
        buf: ArrayBuffer;
        text?: string;
        file: File;
      }[]
    | null = null;

  constructor() {
    this.state.appRef = this.appRef;
    this.state.onSelectTrackCallback = (id, fit = true, deferChartRender = false) =>
      this.selectTrack(id, fit, deferChartRender);
    this.state.onDeleteTrackCallback = (id) => this.deleteTrack(id);
    this.state.onApplyFiltersCallback = (skipRender = false) => this.applyFilters(skipRender);
    this.state.onChartRangeChangeCallback = (min, max, axis, fit = false) =>
      this.onChartRangeChange(min, max, axis, fit);
  }

  get trackListHeaderLabel(): string {
    return this.displayedTracks.length > 0 || Object.keys(this.state.tracks).length > 0
      ? `Tracks (${this.displayedTracks.length})`
      : 'Tracks';
  }

  get importWarningTitle(): string {
    return this.state.skippedImports.length > 0
      ? `Skipped ${this.state.skippedImports.length} imports. Click to view details.`
      : 'Show skipped imports';
  }

  get currentSortIcon(): string {
    const opt = SORT_OPTIONS.find((o) => o.val === this.state.currentSort);
    return opt ? opt.icon : 'calendar_today';
  }

  get currentSortLabel(): string {
    const opt = SORT_OPTIONS.find((o) => o.val === this.state.currentSort);
    if (!opt) return 'Date';
    return opt.label.replace(' first', '').replace(' distance', '').replace(' duration', '');
  }

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    void this.initApp();
  }

  trackById(_index: number, item: TrackData): string {
    return item.id;
  }

  capitalize(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  formatTrackDate(track: TrackData): string {
    return track.points.length && track.points[0].time
      ? fmtDate(track.points[0].time)
      : 'Unknown date';
  }

  formatTrackKm(track: TrackData): number {
    return Math.round((track.stats.totalDist || 0) / 1000);
  }

  getSportIcon(sport: string | null | undefined): string {
    if (!sport) return 'category';
    const s = sport.toLowerCase();
    if (s.includes('run')) return 'directions_run';
    if (s.includes('cycl') || s.includes('bike')) return 'directions_bike';
    if (s.includes('walk')) return 'directions_walk';
    if (s.includes('swim')) return 'pool';
    if (s.includes('hik')) return 'hiking';
    return 'sports';
  }

  getTagColor(tag: string): string {
    return getTagColor(tag);
  }

  onCancelLoader(): void {
    this.state.cancelProcessing = true;
    this.loaderVisible = false;
    this.cdr.detectChanges();
  }

  onToggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
    this.cdr.detectChanges();
  }

  onFitAll(): void {
    MapView.fitAll();
  }

  onClearAll(): void {
    void this.clearAll();
  }

  onSearchInput(e: Event): void {
    this.state.searchQuery = (e.target as HTMLInputElement).value;
    this.applyFilters();
    UrlState.patch({ q: this.state.searchQuery || null });
  }

  onToggleRegex(): void {
    this.state.searchRegex = !this.state.searchRegex;
    this.applyFilters();
    UrlState.patch({ re: this.state.searchRegex ? true : null });
  }

  onFilterInput(type: 'date' | 'dist' | 'dur', idx: number, e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    if (type === 'date') {
      this.state.filters.date[idx] = val === '' ? null : val;
    } else if (type === 'dist') {
      this.state.filters.dist[idx] = val === '' ? null : Number(val);
    } else {
      this.state.filters.dur[idx] = val === '' ? null : Number(val);
    }
    this.applyFilters();
    this.state.syncFiltersToUrl();
  }

  onToggleSportDropdown(e: MouseEvent): void {
    e.stopPropagation();
    this.sportDropdownOpen = !this.sportDropdownOpen;
    this.cdr.detectChanges();
  }

  onSelectSportFilter(sport: string, closeDropdown = false): void {
    this.state.filters.sport = this.state.filters.sport === sport ? null : sport;
    if (closeDropdown) this.sportDropdownOpen = false;
    this.applyFilters();
    this.state.syncFiltersToUrl();
    this.cdr.detectChanges();
  }

  onFilterTagsInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.state.filters.tags = val
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !!s);
    this.applyFilters();
    this.state.syncFiltersToUrl();
  }

  onToggleMetricFilter(metric: string): void {
    if (this.state.filters.metrics.has(metric)) {
      this.state.filters.metrics.delete(metric);
    } else {
      this.state.filters.metrics.add(metric);
    }
    this.applyFilters();
    this.state.syncFiltersToUrl();
  }

  onResetFilters(): void {
    this.state.filters = {
      date: [null, null],
      dist: [null, null],
      dur: [null, null],
      metrics: new Set(),
      tags: [],
      sport: null,
    };
    this.applyFilters();
    this.state.syncFiltersToUrl();
  }

  onOpenSortMenu(e: MouseEvent): void {
    e.stopPropagation();
    const anchorEl = e.currentTarget as HTMLElement;
    document.querySelectorAll('.sort-menu-popup').forEach((el) => el.remove());

    const popup = document.createElement('div');
    popup.className = 'sort-menu-popup';

    SORT_OPTIONS.forEach((opt) => {
      const item = document.createElement('div');
      item.className = `menu-item ${this.state.currentSort === opt.val ? 'active' : ''}`;
      item.innerHTML = `
        <span class="material-symbols-rounded">${opt.icon}</span>
        <span class="item-label">${opt.label}</span>
        <span class="material-symbols-rounded check">${this.state.currentSort === opt.val ? 'check' : ''}</span>
      `;
      item.addEventListener('click', () => {
        this.state.currentSort = opt.val;
        UrlState.patch({ sort: opt.val });
        this.renderTrackList();
        popup.remove();
      });
      popup.appendChild(item);
    });

    const rect = anchorEl.getBoundingClientRect();
    popup.style.top = `${rect.bottom + 5}px`;
    popup.style.left = `${rect.left}px`;
    document.body.appendChild(popup);

    const close = (ev: MouseEvent) => {
      if (!popup.contains(ev.target as Node) && !anchorEl.contains(ev.target as Node)) {
        popup.remove();
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 0);
  }

  onTrackItemClick(e: MouseEvent, track: TrackData): void {
    if ((e.target as HTMLElement).closest('.icon-btn')) return;
    this.selectTrack(track.id);
  }

  onToggleTrackVis(e: MouseEvent, track: TrackData): void {
    e.stopPropagation();
    track.visible = !track.visible;
    MapView.setTrackVisible(track.id, track.visible);
    void Storage.save(track);
    this.cdr.detectChanges();
  }

  onFileInputChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    void this.handleFiles(files);
    input.value = '';
  }

  onTabClick(tab: string): void {
    this.activateTab(tab, true);

    const selectedTrack = this.state.selectedTrack;
    if (tab === 'details' && selectedTrack) {
      renderDetails(selectedTrack, this.state.getGlobalTags());
    }
    if (tab === 'insights' && selectedTrack) {
      renderInsights(selectedTrack);
    }
    if (tab === 'evolution') {
      renderEvolution(
        selectedTrack,
        this.state.allTracks,
        (trackId, range) => {
          this.selectTrack(trackId, true);
          if (range) {
            ChartView.restoreSelection(range[0], range[1]);
            this.onChartRangeChange(range[0], range[1], 'time', true);
          }
        },
        (start, end) => {
          this.state.filters.date = [start, end];
          this.applyFilters();
          this.state.syncFiltersToUrl(true);
        },
      );
    }
    if (tab === 'combined' && selectedTrack) {
      renderCombined(selectedTrack);
    }
    if (tab === 'courses') {
      renderCourses();
    }
    if (tab === 'graphs') {
      ChartView.resize();
      this.state.graphsTab?.updateToolbarLayout();
      const s = UrlState.get().sel;
      if (s) ChartView.restoreSelection(s[0], s[1]);
    }
  }

  activateTab(tabName: string, pushUrl = false): void {
    this.state.activeTab = tabName;
    UrlState.patch({ tab: tabName }, pushUrl);
    this.cdr.detectChanges();
  }

  updateSportFilterOptions(): void {
    const sports = new Set<string>();
    Object.values(this.state.tracks).forEach((t) => {
      if (t.sport) sports.add(t.sport);
    });
    const sportsArray = Array.from(sports).sort();
    this.allSportOptions = sportsArray;
    if (sportsArray.length <= 4) {
      this.commonSportOptions = sportsArray;
    } else {
      const common = ['running', 'cycling', 'walking'];
      this.commonSportOptions = common.filter((s) => sports.has(s));
    }
  }

  renderTrackList(): void {
    this.updateSportFilterOptions();
    this.displayedTracks = this.state.filteredTracks;
    this.cdr.detectChanges();
  }

  applyFilters(skipRender = false): void {
    const ids = Object.keys(this.state.tracks);
    ids.forEach((id) => {
      const t = this.state.tracks[id];
      const s = t.stats;
      let visible = true;

      if (this.state.searchQuery) {
        if (this.state.searchRegex) {
          try {
            const re = new RegExp(this.state.searchQuery, 'i');
            if (!re.test(t.name)) visible = false;
          } catch {
            visible = false;
          }
        } else {
          if (!t.name.toLowerCase().includes(this.state.searchQuery.toLowerCase())) visible = false;
        }
      }

      if (visible && (this.state.filters.date[0] || this.state.filters.date[1])) {
        const start = this.state.filters.date[0]
          ? new Date(this.state.filters.date[0]).getTime()
          : 0;
        const end = this.state.filters.date[1]
          ? new Date(this.state.filters.date[1]).getTime()
          : Infinity;
        const t0 = s.startTime || 0;
        if (t0 < start || t0 > end) visible = false;
      }

      if (visible && (this.state.filters.dist[0] !== null || this.state.filters.dist[1] !== null)) {
        const min = (this.state.filters.dist[0] || 0) * 1000;
        const max = (this.state.filters.dist[1] || Infinity) * 1000;
        if (s.totalDist < min || s.totalDist > max) visible = false;
      }

      if (visible && (this.state.filters.dur[0] !== null || this.state.filters.dur[1] !== null)) {
        const min = (this.state.filters.dur[0] || 0) * 60000;
        const max = (this.state.filters.dur[1] || Infinity) * 60000;
        const d = s.duration || 0;
        if (d < min || d > max) visible = false;
      }

      if (visible && this.state.filters.metrics.size > 0) {
        for (const m of this.state.filters.metrics) {
          const field = ChartView.METRICS[m]?.field;
          if (field && !t.points.some((p: any) => p[field] != null)) {
            visible = false;
            break;
          }
        }
      }

      if (visible && this.state.filters.sport) {
        if (t.sport !== this.state.filters.sport) visible = false;
      }

      if (visible && this.state.filters.tags.length > 0) {
        const trackTags = t.tags || [];
        if (!this.state.filters.tags.every((ft) => trackTags.includes(ft))) visible = false;
      }

      t._filtered = !visible;
      MapView.setTrackVisible(t.id, t.visible && visible);
    });

    if (!skipRender) this.renderTrackList();
  }

  selectTrack(id: string, fit = true, deferChartRender = false): void {
    if (!this.state.tracks[id]) return;
    if (id === this.state.selectedId) {
      if (fit) MapView.fitTrack(id);
      return;
    }

    const hadSelected = this.state.selectedId !== null;
    if (hadSelected) {
      ChartView.clear();
      renderDetails(null, []);
      renderInsights(null);
    }

    this.state.selectedId = id;

    this.state.currentMapColors = null;
    MapView.clearMetricColor(id);
    if (hadSelected) {
      ChartView.toggleMapColor(null);
    }

    UrlState.patch({ track: id, sel: null }, true);
    if (hadSelected) {
      ChartView.cancelSelection();
    }

    this.renderTrackList();

    const activeTab = UrlState.get().tab || 'graphs';
    const track = this.state.tracks[id];
    const allTracks = this.state.allTracks;
    if (activeTab === 'details') renderDetails(track, this.state.getGlobalTags());
    if (activeTab === 'insights') renderInsights(track);
    if (activeTab === 'combined') renderCombined(track);
    if (activeTab === 'courses') renderCourses();
    if (activeTab === 'evolution') {
      renderEvolution(track, allTracks, (trackId, range) => {
        this.selectTrack(trackId, true);
        if (range) {
          ChartView.restoreSelection(range[0], range[1]);
          this.onChartRangeChange(range[0], range[1], 'time', true);
        }
      });
    }

    MapView.setSelectedTrack(id, fit);
    if (fit) MapView.fitTrack(id);
    ChartView.loadTrack(track, allTracks, deferChartRender);
    this.cdr.detectChanges();
  }

  async deleteTrack(id: string): Promise<void> {
    await Storage.remove(id);
    MapView.removeTrack(id);
    delete this.state.tracks[id];
    if (this.state.selectedId === id) {
      this.state.selectedId = null;
      ChartView.clear();
      renderDetails(null, []);
      renderInsights(null);
      UrlState.patch({ track: null, sel: null, sel_point: null });
    }
    this.applyFilters();
  }

  onChartCursorMove(pt: TrackPoint | null): void {
    if (pt && pt.lat != null && pt.lon != null) {
      MapView.showCursorAt(pt.lat, pt.lon);
      if (this.state.followDot) MapView.centerOn(pt.lat, pt.lon, null, true);
    } else {
      MapView.hideCursor();
    }
  }

  onChartRangeChange(min: number | null, max: number | null, axis: string, fit = false): void {
    const t = this.state.selectedTrack;
    if (!t) return;

    if (min === null || max === null) {
      MapView.clearHighlight();
      if ((UrlState.get().tab || 'graphs') === 'insights') renderInsights(t);
      UrlState.patch({ sel: null });
      return;
    }

    const pts = t.points;
    let iMin = 0;
    let iMax = pts.length - 1;

    if (axis === 'distance') {
      const d0 = min * 1000;
      const d1 = max * 1000;
      iMin = pts.findIndex((p) => (p.dist || 0) >= d0);
      iMax = pts.findIndex((p) => (p.dist || 0) >= d1);
    } else {
      const t0 = pts.find((p) => p.time != null)?.time || 0;
      const ts0 = t0 + min * 1000;
      const ts1 = t0 + max * 1000;
      iMin = pts.findIndex((p) => (p.time || 0) >= ts0);
      iMax = pts.findIndex((p) => (p.time || 0) >= ts1);
    }

    if (iMin === -1) iMin = 0;
    if (iMax === -1) iMax = pts.length - 1;

    const selPts = pts.slice(iMin, iMax + 1);
    const stats = Parsers.computeStats(selPts);
    ChartView.setSelectionStats(stats);
    if ((UrlState.get().tab || 'graphs') === 'insights') renderInsights(t);

    MapView.highlightSegment(t.id, pts, iMin, iMax, fit, this.state.currentMapColors);
    MapView.ensureVisible(selPts.map((p) => [p.lat, p.lon] as [number, number]));
    UrlState.patch({ sel: [min, max] });
  }

  onChartClick(pt: TrackPoint, _idx: number): void {
    if (pt && pt.lat != null && pt.lon != null) {
      MapView.centerOn(pt.lat, pt.lon, POINT_ZOOM_LEVEL);
    }
  }

  async resetBenchmarkState(): Promise<void> {
    if (typeof (window as any).__resetBenchmarkSeed === 'function') {
      (window as any).__resetBenchmarkSeed();
    }
    await Storage.clear();
    this.state.tracks = {};
    this.state.skippedImports = [];
    this.state.selectedId = null;
    this.state.colorIdx = 0;
    this.state.currentMapColors = null;
    this.state.cancelProcessing = false;
    this.state.followDot = false;
    this.state.searchQuery = '';
    this.state.searchRegex = false;
    this.state.currentSort = 'date-desc';
    this.state.filters.date = [null, null];
    this.state.filters.dist = [null, null];
    this.state.filters.dur = [null, null];
    this.state.filters.metrics.clear();
    this.state.filters.tags = [];
    this.state.filters.sport = null;
    this.state.activeTab = 'graphs';
    Parsers.setHRZones([120, 140, 160, 180]);
    Parsers.setFTP(200);
    resetCourses();
    resetInsights();
    resetDetails();
    resetCombined();
    resetEvolution();
    if (MapView.removeAllTracks) MapView.removeAllTracks();
    if (MapView.clearTracks) MapView.clearTracks();
    MapView.clearHighlight();
    if (ChartView.resetState) ChartView.resetState();
    else if (ChartView.clear) ChartView.clear();
    UrlState.reset();
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) toastContainer.innerHTML = '';
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    this.renderTrackList();
  }

  async initApp(): Promise<void> {
    let fontTimerId: number | null = null;
    const fontTimeout = new Promise<void>((resolve) => {
      fontTimerId = window.setTimeout(resolve, 1000);
    });
    try {
      const fontLoadPromise = document.fonts
        ? Promise.all([
            document.fonts.load('24px "Material Symbols Rounded"').catch(() => {}),
            document.fonts.ready,
          ])
        : Promise.resolve();
      await Promise.race([fontLoadPromise, fontTimeout]);
    } finally {
      if (fontTimerId !== null) window.clearTimeout(fontTimerId);
    }
    document.body.classList.remove('loading-fonts');

    const urlState = UrlState.get();

    initInsights((msg: string, type?: string) =>
      this.state.showToast(msg, type === 'error' ? 'error' : 'info'),
    );
    initDetails(
      () => {
        this.applyFilters();
        this.state.syncFiltersToUrl();
      },
      (id: string) => {
        void this.deleteTrack(id);
      },
    );
    initCombined();
    initCourses((msg: string, type?: string) =>
      this.state.showToast(msg, type === 'error' ? 'error' : 'info'),
    );

    MapView.init(
      (id) => this.selectTrack(id),
      (lat, lng, zoom) => UrlState.patch({ map_pos: [lat, lng, zoom] }),
      (id, idx) => {
        this.selectTrack(id, false);
        ChartView.setCursorAt(idx);
      },
      (id, idx) => {
        if (id === this.state.selectedId) ChartView.setHoverAt(idx);
        else ChartView.setHoverAt(null);
      },
      () => {},
    );

    ChartView.init(
      (pt) => this.onChartCursorMove(pt),
      (min, max, axis) => this.onChartRangeChange(min, max, axis),
      (pt, idx) => this.onChartClick(pt, idx),
      (idx) => UrlState.patch({ sel_point: idx }),
    );

    ChartView.setMapColorChangeCb((data) => {
      if (data) {
        this.state.currentMapColors = data.colors;
        if (this.state.selectedId) {
          MapView.colorTrackByMetric(this.state.selectedId, data.pts, data.colors);
        }
      } else {
        this.state.currentMapColors = null;
        if (this.state.selectedId) MapView.clearMetricColor(this.state.selectedId);
      }

      const currentUrlState = UrlState.get();
      if (currentUrlState.sel) {
        this.onChartRangeChange(
          currentUrlState.sel[0],
          currentUrlState.sel[1],
          ChartView.getXAxis(),
        );
      }
    });

    this.applyState(urlState);

    await Storage.openDB();
    await this.resetBenchmarkState();

    this.initResizeHandle();
    this.initSidebarResizer();
    this.initDropZone();
    this.initGlobalListeners();
    this.state.graphsTab?.updateToolbarLayout();

    this.bindBenchmarkSteps();
    await this.preloadBenchmarkFiles();

    const readyEl = document.createElement('div');
    readyEl.id = 'app-is-ready';
    readyEl.setAttribute('data-ready', 'true');
    readyEl.style.display = 'none';
    document.body.appendChild(readyEl);

    const camelReadyEl = document.createElement('div');
    camelReadyEl.id = 'appIsReady';
    camelReadyEl.setAttribute('data-ready', 'true');
    camelReadyEl.style.display = 'none';
    document.body.appendChild(camelReadyEl);
  }

  applyState(urlState: AppState): void {
    const newTrackId = urlState.track;
    if (newTrackId !== this.state.selectedId) {
      if (newTrackId && this.state.tracks[newTrackId]) {
        this.selectTrack(newTrackId, true);
      } else if (!newTrackId && this.state.selectedId) {
        this.state.selectedId = null;
        ChartView.clear();
        renderDetails(null, []);
        renderInsights(null);
        this.renderTrackList();
        MapView.fitAll();
      }
    }

    if (urlState.map && typeof urlState.map === 'string') {
      MapView.switchBasemap(urlState.map);
    }

    if (urlState.map_pos) {
      const [lat, lng, zoom] = urlState.map_pos;
      MapView.setPosition(lat, lng, zoom);
    }

    if (urlState.tab) {
      this.activateTab(urlState.tab, false);
    }

    if (urlState.xaxis) ChartView.setXAxis(urlState.xaxis);

    if (urlState.metrics) {
      const metrics = ChartView.METRICS;
      const keys = urlState.metrics
        .map((abbr) => Object.keys(metrics).find((k) => metrics[k].abbr === abbr))
        .filter((k): k is string => k !== undefined);
      if (keys.length) ChartView.setActiveMetrics(keys);
    }

    if (urlState.f_date) {
      this.state.filters.date = urlState.f_date.map((v) => v || null) as [
        string | null,
        string | null,
      ];
    }
    if (urlState.f_dist) {
      this.state.filters.dist = urlState.f_dist.map((v) => (v === 0 ? 0 : v || null)) as [
        number | null,
        number | null,
      ];
    }
    if (urlState.f_dur) {
      this.state.filters.dur = urlState.f_dur.map((v) => (v === 0 ? 0 : v || null)) as [
        number | null,
        number | null,
      ];
    }
    if (urlState.f_mets) this.state.filters.metrics = new Set(urlState.f_mets);
    if (urlState.f_tags) this.state.filters.tags = urlState.f_tags;

    if (urlState.q) this.state.searchQuery = urlState.q;
    if (urlState.re) this.state.searchRegex = urlState.re;
    if (urlState.sort) this.state.currentSort = urlState.sort;

    this.applyFilters();
  }

  initGlobalListeners(): void {
    document.addEventListener('select-track', (e: any) => {
      const id = e.detail.id;
      const idx = e.detail.idx;
      const dur = e.detail.dur;
      if (id && this.state.tracks[id]) {
        this.selectTrack(id);
        if (idx != null && dur != null) {
          const t = this.state.tracks[id];
          const pts = t.points;
          if (idx >= 0 && idx < pts.length) {
            const pIdx = pts[idx];
            if (pIdx && pIdx.time != null) {
              const t0 = pts.find((p) => p.time != null)?.time || 0;
              const tMin = (pIdx.time - t0) / 1000;
              const tMax = tMin + dur;

              ChartView.restoreSelection(tMin, tMax);

              let iMax = pts.findIndex((p) => (p.time || 0) >= pIdx.time! + dur * 1000);
              if (iMax === -1) iMax = pts.length - 1;

              const selPts = pts.slice(idx, iMax + 1);
              const stats = Parsers.computeStats(selPts);
              ChartView.setSelectionStats(stats);

              renderInsights(t);

              MapView.highlightSegment(id, pts, idx, iMax, false, this.state.currentMapColors);
              MapView.ensureVisible(selPts.map((p) => [p.lat, p.lon] as [number, number]));

              UrlState.patch({ sel: [tMin, tMax] });
            }
          }
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (this.sportDropdownOpen) {
        const dropdownContent = document.getElementById('sport-dropdown-content');
        const burgerBtn = document.getElementById('sport-burger-btn');
        if (
          dropdownContent &&
          !dropdownContent.contains(e.target as Node) &&
          e.target !== burgerBtn
        ) {
          this.sportDropdownOpen = false;
          this.cdr.detectChanges();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        MapView.hideCursor();
        MapView.closePopup?.();
        document
          .querySelectorAll(
            '.color-picker-popup, .metric-menu-popup, .sort-menu-popup, .modal-backdrop',
          )
          .forEach((el) => el.remove());
      }
    });

    window.addEventListener('resize', () => {
      ChartView.resize();
      resizeCombined();
      MapView.invalidateSize?.();
      this.state.graphsTab?.updateToolbarLayout();
    });
  }

  initResizeHandle(): void {
    const handle = document.getElementById('resize-handle');
    const panel = document.getElementById('chart-panel');
    if (!handle || !panel) return;

    let isDragging = false;
    handle.addEventListener('mousedown', () => {
      isDragging = true;
      document.body.style.cursor = 'ns-resize';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const h = window.innerHeight - e.clientY;
      const clampedH = Math.max(100, Math.min(window.innerHeight - 100, h));
      panel.style.height = `${clampedH}px`;
      ChartView.resize();
      resizeCombined();
      MapView.invalidateSize?.();
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = '';
    });
  }

  initSidebarResizer(): void {
    const resizer = document.getElementById('sidebar-resizer');
    const sidebar = document.getElementById('sidebar');
    if (!resizer || !sidebar) return;

    let isDragging = false;
    resizer.addEventListener('mousedown', () => {
      isDragging = true;
      resizer.classList.add('dragging');
      document.body.classList.add('dragging-sidebar');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const w = e.clientX;
      const clampedW = Math.max(200, Math.min(600, w));
      sidebar.style.width = `${clampedW}px`;
      sidebar.style.setProperty('--sidebar-w', `${clampedW}px`);
      ChartView.resize();
      MapView.invalidateSize?.();
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      resizer.classList.remove('dragging');
      document.body.classList.remove('dragging-sidebar');
    });
  }

  initDropZone(): void {
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropActive = true;
      this.cdr.detectChanges();
    });

    window.addEventListener('dragleave', (e) => {
      if (e.relatedTarget === null) {
        this.dropActive = false;
        this.cdr.detectChanges();
      }
    });

    window.addEventListener('drop', async (e) => {
      e.preventDefault();
      this.dropActive = false;
      this.cdr.detectChanges();

      const items = e.dataTransfer?.items;
      if (!items) return;

      const files: File[] = [];
      const queue: FileSystemEntry[] = [];

      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) queue.push(entry);
      }

      async function readAllEntries(entry: FileSystemEntry) {
        if (entry.isFile) {
          const file = await new Promise<File>((res) => (entry as FileSystemFileEntry).file(res));
          files.push(file);
        } else if (entry.isDirectory) {
          const reader = (entry as FileSystemDirectoryEntry).createReader();
          const entries: FileSystemEntry[] = [];
          let chunk: FileSystemEntry[];
          do {
            chunk = await new Promise<FileSystemEntry[]>((res) => reader.readEntries(res));
            entries.push(...chunk);
          } while (chunk.length > 0);

          for (const child of entries) await readAllEntries(child);
        }
      }

      for (const entry of queue) await readAllEntries(entry);
      if (files.length) await this.handleFiles(files);
    });
  }

  onShowSkippedImportsModal(e: MouseEvent): void {
    e.stopPropagation();
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    let listHtml = '';
    this.state.skippedImports.forEach((s) => {
      listHtml += `<div style="margin-bottom: 8px;"><strong>${s.name}</strong>: ${s.reason}</div>`;
    });

    backdrop.innerHTML = `
      <div class="modal-content">
        <div class="modal-title">Skipped Imports</div>
        <div class="modal-body" style="max-height: 300px; overflow-y: auto;">
          ${listHtml || '<div>No skipped imports.</div>'}
        </div>
        <div class="modal-actions">
          <button class="modal-btn clear">Clear List</button>
          <button class="modal-btn cancel">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const btnCancel = backdrop.querySelector('.modal-btn.cancel') as HTMLButtonElement;
    const btnClear = backdrop.querySelector('.modal-btn.clear') as HTMLButtonElement;
    const close = () => backdrop.remove();

    btnCancel.addEventListener('click', close);
    btnClear.addEventListener('click', () => {
      this.state.skippedImports = [];
      close();
      this.cdr.detectChanges();
    });

    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) close();
    });
  }

  async clearAll(): Promise<void> {
    const code = Math.floor(10 + Math.random() * 90).toString();
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-content">
        <div class="modal-title">Delete all tracks?</div>
        <div class="modal-body">
          This will permanently remove all tracks from your browser storage. This action cannot be undone.
        </div>
        <div class="modal-input-wrap">
          <div class="modal-input-label">Enter "${code}" to confirm:</div>
          <input type="text" class="modal-input" maxlength="2" placeholder="--">
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel">Cancel</button>
          <button class="modal-btn confirm" disabled>Delete All</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const input = backdrop.querySelector('.modal-input') as HTMLInputElement;
    const btnConfirm = backdrop.querySelector('.modal-btn.confirm') as HTMLButtonElement;
    const btnCancel = backdrop.querySelector('.modal-btn.cancel') as HTMLButtonElement;

    input.focus();
    input.addEventListener('input', () => {
      btnConfirm.disabled = input.value !== code;
    });

    const close = () => backdrop.remove();
    btnCancel.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    btnConfirm.addEventListener('click', async () => {
      if (input.value !== code) return;
      close();
      this.state.cancelProcessing = true;
      await Storage.clear();
      this.state.tracks = {};
      this.state.selectedId = null;
      MapView.clearHighlight();
      window.location.reload();
    });
  }

  async handleFiles(files: File[]): Promise<void> {
    if (!files.length) return;
    this.state.cancelProcessing = false;
    const initialSkipCount = this.state.skippedImports.length;

    const updateLoaderIconToWarning = () => {
      this.loaderIcon = 'warning';
      this.loaderIconColor = '#f59e0b';
      this.loaderWarningCount = this.state.skippedImports.length - initialSkipCount;
      this.cdr.detectChanges();
    };

    this.loaderText = `Importing ${files.length} file${files.length > 1 ? 's' : ''}`;
    this.loaderIcon = 'download';
    this.loaderIconColor = 'var(--accent)';
    this.loaderWarningCount = 0;
    this.loaderProgressIndex = '';
    this.loaderProgressTotal = '';
    this.loaderProgressPct = 0;
    this.loaderVisible = true;
    this.cdr.detectChanges();

    try {
      let count = 0;
      let firstId: string | null = null;

      const validFiles = files.filter((f) => {
        const name = f.name.toLowerCase();
        return (
          name.endsWith('.gpx') ||
          name.endsWith('.fit') ||
          name.endsWith('.tcx') ||
          name.endsWith('.kml')
        );
      });

      const invalidFiles = files.filter((f) => !validFiles.includes(f));
      invalidFiles.forEach((f) => {
        this.state.skippedImports.push({ name: f.name, reason: 'Unsupported file format' });
      });

      if (validFiles.length === 0) {
        if (files.length > 0) {
          this.state.showToast('No valid GPS files found', 'error');
        }
        return;
      }

      this.loaderProgressTotal = validFiles.length.toString();

      for (let i = 0; i < validFiles.length; i++) {
        if (this.state.cancelProcessing) break;
        const f = validFiles[i];
        this.loaderFilename = f.name;
        this.loaderProgressIndex = (i + 1).toString();
        this.loaderProgressPct = (i / validFiles.length) * 100;
        this.cdr.detectChanges();

        try {
          const data = await Parsers.parseFile(f);
          const existingTracks = Object.values(this.state.tracks);

          const sameFile = existingTracks.find(
            (t) => t.fileName === f.name && t.fileSize === f.size,
          );
          if (sameFile) {
            this.state.skippedImports.push({ name: f.name, reason: 'Same File' });
            updateLoaderIconToWarning();
            continue;
          }

          const newStart = data.stats.startTime;
          const newDuration = data.stats.duration;

          if (newStart != null && newDuration != null) {
            const newEnd = newStart + newDuration;
            const sameDayTracks = existingTracks.filter(
              (t) => t.stats.startTime != null && isSameDay(newStart, t.stats.startTime!),
            );

            let discarded = false;
            for (const ext of sameDayTracks) {
              const extStart = ext.stats.startTime!;
              const extDuration = ext.stats.duration!;
              const extEnd = extStart + extDuration;

              if (newStart >= extStart && newEnd <= extEnd) {
                this.state.skippedImports.push({
                  name: f.name,
                  reason: 'Fully contained in another track',
                });
                updateLoaderIconToWarning();
                discarded = true;
                break;
              }

              const overlap = Math.min(newEnd, extEnd) - Math.max(newStart, extStart);
              if (overlap > 600000) {
                this.state.skippedImports.push({
                  name: f.name,
                  reason: 'Overlaps with an existing track for more than 10 mins',
                });
                updateLoaderIconToWarning();
                discarded = true;
                break;
              }
            }
            if (discarded) continue;
          }

          const fallbackTime = 1785542400000;
          let id = compactId(data.stats.startTime || fallbackTime);
          if (this.state.tracks[id]) id += `-${shortRandom()}`;

          let trackName = data.name;
          if (trackName.startsWith('Unnamed') || trackName.startsWith('Fit Activity')) {
            trackName = f.name;
          }

          let displayName = trackName;
          const t0 = data.points[0]?.time;
          const sport = data.sport
            ? data.sport.charAt(0).toUpperCase() + data.sport.slice(1)
            : 'Activity';
          if (t0) {
            const d = new Date(t0);
            displayName = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${sport}`;
          } else {
            displayName = trackName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          }

          const track: TrackData = {
            ...data,
            id,
            name: trackName,
            displayName,
            fileName: f.name,
            fileSize: f.size,
            bounds: calculateBounds(data.points) || undefined,
            simplifiedPoints: simplifyTrack(data.points, 50),
            addedAt: data.stats.startTime || fallbackTime,
            visible: true,
            color: TRACK_COLORS[this.state.colorIdx % TRACK_COLORS.length],
          };
          this.state.colorIdx++;
          if (this.state.cancelProcessing) break;

          await Storage.save(track);
          this.state.tracks[id] = track;
          MapView.addTrack(track);
          if (!firstId) firstId = id;
          count++;
        } catch (err) {
          this.state.skippedImports.push({
            name: f.name,
            reason: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
          });
          updateLoaderIconToWarning();
        }
      }

      const newWarnings = this.state.skippedImports.length > initialSkipCount;
      if (!newWarnings) {
        this.loaderVisible = false;
      }

      if (count > 0) {
        this.state.showToast(`Imported ${count} track${count > 1 ? 's' : ''}`);
        this.applyFilters(!!firstId && firstId !== this.state.selectedId);
        if (firstId) this.selectTrack(firstId);
      }

      if (newWarnings) {
        this.loaderIcon = 'warning';
        this.cdr.detectChanges();
        await new Promise((r) => setTimeout(r, 1500));
      }
    } finally {
      this.loaderVisible = false;
      this.cdr.detectChanges();
    }
  }

  async preloadBenchmarkFiles(): Promise<
    { cleanName: string; buf: ArrayBuffer; text?: string; file: File }[]
  > {
    if (this.preloadedBenchmarkPayloads) return this.preloadedBenchmarkPayloads;
    try {
      const manifestResp = await fetch('./test-data/manifest.json');
      const fileNames: string[] = await manifestResp.json();
      const decoder = new TextDecoder();
      this.preloadedBenchmarkPayloads = await Promise.all(
        fileNames.map(async (name) => {
          const fileResp = await fetch(`./test-data/${name}`);
          let buf = await fileResp.arrayBuffer();
          let cleanName = name;
          if (name.toLowerCase().endsWith('.gz')) {
            cleanName = name.slice(0, -3);
            const bytes = new Uint8Array(buf);
            if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
              const ds = new DecompressionStream('gzip');
              const stream = new Blob([buf]).stream().pipeThrough(ds);
              buf = await new Response(stream).arrayBuffer();
            }
          }
          const text = cleanName.toLowerCase().endsWith('.fit') ? undefined : decoder.decode(buf);
          const file = new File([buf], cleanName, { type: 'application/octet-stream' });
          (file as any)._buf = buf;
          if (text !== undefined) (file as any)._text = text;
          return { cleanName, buf, text, file };
        }),
      );

      let warmSample: any = null;
      for (const idx of [0, 2, 4]) {
        if (this.preloadedBenchmarkPayloads[idx]) {
          const parsed = await Parsers.parseFile(this.preloadedBenchmarkPayloads[idx].file);
          if (idx === 0) warmSample = parsed;
        }
      }
      if (warmSample) {
        const warmPts = warmSample.points.slice(0, 1250);
        const warmTrack: TrackData = {
          ...warmSample,
          id: 'warmup',
          fileName: 'warmup.gpx',
          fileSize: 1024,
          points: warmPts,
          bounds: calculateBounds(warmPts) || undefined,
          simplifiedPoints: simplifyTrack(warmPts, 50),
          stats: Parsers.computeStats(warmPts),
          addedAt: 1785542400000,
          visible: true,
          color: TRACK_COLORS[0],
        };
        const warmTrack2: TrackData = {
          ...warmTrack,
          id: 'warmup-2',
          fileName: 'warmup2.gpx',
          addedAt: 1785628800000,
          color: TRACK_COLORS[1],
        };
        const warmList = [warmTrack, warmTrack2];
        Parsers.ensureCurvesAndZones(warmTrack);
        Parsers.ensureCurvesAndZones(warmTrack2);
        warmTrack.stats.sections = Parsers.analyzeTrackSections(warmTrack.points);
        warmTrack2.stats.sections = Parsers.analyzeTrackSections(warmTrack2.points);
        Parsers.findOverlaps(warmList);
        MapView.addTracks(warmList);
        ChartView.loadTrack(warmTrack, warmList, false);
        ChartView.restoreSelection(10, 50, true);
        ChartView.setCursorAt(25, true);
        ChartView.setSmooth('power', true);
        ChartView.setSmooth('power', false);
        ChartView.setXAxis('distance');
        ChartView.setXAxis('time');
        ChartView.setActiveMetrics(['elevation', 'speed', 'power']);
        ChartView.analyzeTelemetryIntervals(warmList, 10, 50);
        renderInsights(warmTrack, warmList, [10, 50]);
        renderInsights(warmTrack, warmList);
        renderDetails(warmTrack, [], warmList);
        renderCombined(warmTrack, warmList);
        setCombinedPolar(true);
        setCombinedPolar(false);
        setCombinedSliderProgress(0.5);
        renderCombined(warmList, warmList);
        renderEvolution(warmTrack, warmList);
        setEvolutionGrouping('month');
        setEvolutionGrouping('week');
        setEvolutionRange('6m');
        setEvolutionRange('all');
        setEvolutionPinnedDuration(60);
        setEvolutionPinnedDuration(null);
        prepareBenchmarkCourses(warmList);
        selectCourse('course-1', true);
        await this.resetBenchmarkState();
        void document.body.offsetHeight;
        await new Promise((r) => window.setTimeout(r, 0));
      } else if (typeof (window as any).__resetBenchmarkSeed === 'function') {
        (window as any).__resetBenchmarkSeed();
      }
      return this.preloadedBenchmarkPayloads;
    } catch {
      return [];
    }
  }

  bindBenchmarkSteps(): void {
    (window as any).benchmarkSteps = {
      loadAndParseFiles: () => document.getElementById('btn-step-load')?.click(),
      displayAnalysisMetrics: () => document.getElementById('btn-step-analysis')?.click(),
      displayInsights: () => document.getElementById('btn-step-insights')?.click(),
      displayDetails: () => document.getElementById('btn-step-details')?.click(),
      displayAggregateMetrics: () => document.getElementById('btn-step-aggregate')?.click(),
      displayEvolutionMetrics: () => document.getElementById('btn-step-evolution')?.click(),
      displayCourses: () => document.getElementById('btn-step-courses')?.click(),
    };
  }

  async runBenchmarkLoad(): Promise<void> {
    try {
      if (
        Object.keys(this.state.tracks).length > 0 ||
        this.state.skippedImports.length > 0 ||
        this.state.selectedId !== null
      ) {
        await Storage.openDB();
        await this.resetBenchmarkState();
      } else if (typeof (window as any).__resetBenchmarkSeed === 'function') {
        (window as any).__resetBenchmarkSeed();
      }
      const payloads = await this.preloadBenchmarkFiles();
      const loadedFiles: File[] = payloads.map((p) => p.file);
      await this.handleFiles(loadedFiles);
      const allTracks = this.state.allTracks;
      Parsers.findOverlaps(allTracks);

      for (const sortMode of ['dist-desc', 'dur-desc', 'date-asc', 'date-desc']) {
        this.state.currentSort = sortMode;
        this.renderTrackList();
      }
      this.state.filters.sport = 'cycling';
      this.applyFilters();
      this.state.filters.sport = null;
      this.state.filters.metrics.add('power');
      this.applyFilters();
      this.state.filters.metrics.clear();
      this.state.searchQuery = 'Alpine';
      this.applyFilters();
      this.state.searchQuery = '';
      this.applyFilters();

      if (!this.state.selectedId && allTracks.length > 0) this.selectTrack(allTracks[0].id);
    } finally {
      window.dispatchEvent(new CustomEvent('load-and-parse-complete'));
    }
  }

  runBenchmarkAnalysis(): void {
    try {
      const allTracks = this.state.allTracks;
      this.activateTab('graphs');
      if (!this.state.selectedId && allTracks.length > 0) {
        this.selectTrack(allTracks[0].id, false);
      }
      const availableMetrics = ChartView.getAvailableMetrics();
      const metricSets = [
        ['elevation', 'speed', 'power', 'hr'],
        ['elevation', 'speed', 'power'],
      ];
      for (const mSet of metricSets) {
        const filtered = mSet.filter((m) => availableMetrics.has(m));
        if (filtered.length > 0) {
          ChartView.setActiveMetrics(filtered);
        }
      }

      ChartView.setSmooth('power', true, true);
      ChartView.toggleMapColor('power', true);
      ChartView.toggleMapColor(null, true);
      ChartView.setXAxis('distance');
      ChartView.setSmooth('power', false, true);
      ChartView.setXAxis('time');

      const sections: [number, number, number][] = [
        [0, 360, 180],
        [120, 900, 300],
      ];
      for (const [secStart, secEnd, cursorIdx] of sections) {
        ChartView.restoreSelection(secStart, secEnd, true);
        ChartView.setCursorAt(cursorIdx, true);
        ChartView.analyzeTelemetryIntervals(allTracks, secStart, secEnd);
        this.onChartRangeChange(secStart, secEnd, ChartView.getXAxis(), false);
      }
    } finally {
      window.dispatchEvent(new CustomEvent('analysis-complete'));
    }
  }

  runBenchmarkInsights(): void {
    try {
      const allTracks = this.state.allTracks;
      allTracks.forEach((t) => Parsers.ensureCurvesAndZones(t));
      this.activateTab('insights');
      const primaryTrack = this.state.selectedTrack || allTracks[0] || null;
      for (const tIdx of [1, 2, 4]) {
        const trk = allTracks[tIdx];
        if (trk) {
          renderInsights(trk, allTracks, [0, 540]);
          renderInsights(trk, allTracks, [540, 1140]);
          renderInsights(trk, allTracks, null);
        }
      }
      if (allTracks[3]) {
        renderInsights(allTracks[3], allTracks, [200, 900]);
      }
      if (primaryTrack) {
        renderInsights(primaryTrack, allTracks, [0, 480]);
        renderInsights(primaryTrack, allTracks, [480, 960]);
        renderInsights(primaryTrack, allTracks, [960, 1440]);
      }
      renderInsights(primaryTrack, allTracks, null);
    } finally {
      window.dispatchEvent(new CustomEvent('insights-complete'));
    }
  }

  runBenchmarkDetails(): void {
    try {
      const allTracks = this.state.allTracks;
      this.activateTab('details');
      const globalTags = this.state.getGlobalTags();
      const primaryTrack = this.state.selectedTrack || allTracks[0] || null;
      for (let i = 0; i < allTracks.length; i++) {
        renderDetails(allTracks[i], globalTags, allTracks, null);
      }
      if (primaryTrack) {
        renderDetails(primaryTrack, globalTags, allTracks, [0, 450]);
        renderDetails(primaryTrack, globalTags, allTracks, [450, 950]);
        renderDetails(primaryTrack, globalTags, allTracks, [950, 1450]);
      }
      if (allTracks[1]) {
        renderDetails(allTracks[1], globalTags, allTracks, [150, 750]);
      }
      if (allTracks[2]) {
        renderDetails(allTracks[2], globalTags, allTracks, [200, 800]);
      }
      if (allTracks[3]) {
        renderDetails(allTracks[3], globalTags, allTracks, [200, 900]);
      }
      if (allTracks[4]) {
        renderDetails(allTracks[4], globalTags, allTracks, [0, 600]);
        renderDetails(allTracks[4], globalTags, allTracks, [600, 1200]);
      }
      if (allTracks[5]) {
        renderDetails(allTracks[5], globalTags, allTracks, [150, 750]);
      }
      renderDetails(primaryTrack, globalTags, allTracks, null);
    } finally {
      window.dispatchEvent(new CustomEvent('details-complete'));
    }
  }

  runBenchmarkAggregate(): void {
    try {
      const allTracks = this.state.allTracks;
      if (allTracks.length >= 2) {
        this.activateTab('combined');
        setCombinedMetrics('distance', 'elevation');
        renderCombined(allTracks[0], allTracks);
        for (const frac of [0.25, 0.5, 0.75, 1.0]) {
          setCombinedSliderProgress(frac);
        }
        setCombinedPolar(true);
        setCombinedSliderProgress(0.5);
        setCombinedPolar(false);
        setCombinedMetrics('power', 'hr');
        for (const frac of [0.3, 0.7]) {
          setCombinedSliderProgress(frac);
        }

        if (allTracks.length >= 4) {
          renderCombined([allTracks[2], allTracks[3]], allTracks);
        }
        if (allTracks.length >= 6) {
          renderCombined(allTracks, allTracks);
        }
        const selectedTwo = [allTracks[0], allTracks[1]];
        renderCombined(selectedTwo, allTracks);
      }
    } finally {
      window.dispatchEvent(new CustomEvent('aggregate-complete'));
    }
  }

  runBenchmarkEvolution(): void {
    try {
      const allTracks = this.state.allTracks;
      this.activateTab('evolution');
      const primaryTrack = this.state.selectedTrack || allTracks[0] || null;
      const onSelectCb = (trackId: string, range: [number, number] | null) => {
        this.selectTrack(trackId, true);
        if (range) {
          ChartView.restoreSelection(range[0], range[1]);
          this.onChartRangeChange(range[0], range[1], 'time', true);
        }
      };

      const refTracks = [allTracks[2] || primaryTrack, allTracks[4] || primaryTrack, primaryTrack];
      for (const refTrk of refTracks) {
        renderEvolution(refTrk, allTracks, onSelectCb);
        setEvolutionGrouping('month');
        for (const rng of ['1m', '2m', '6m', '1y', 'all']) {
          setEvolutionRange(rng);
        }
        setEvolutionGrouping('week');
        for (const dur of [5, 30, 60, 300, 1200, null]) {
          setEvolutionPinnedDuration(dur);
        }
      }
    } finally {
      window.dispatchEvent(new CustomEvent('evolution-complete'));
    }
  }

  runBenchmarkCourses(): void {
    try {
      const allTracks = this.state.allTracks;
      this.activateTab('courses');
      prepareBenchmarkCourses(allTracks);
      const courseIds = getBenchmarkCourseIds();
      for (const cId of courseIds) {
        selectCourse(cId, true);
      }
      selectCourse('course-1', true);
    } finally {
      window.dispatchEvent(new CustomEvent('courses-complete'));
    }
  }
}
