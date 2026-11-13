// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { Injectable, ApplicationRef } from '@angular/core';
import { Subject } from 'rxjs';
import { TrackData, Parsers } from '../parsers';
import { Storage } from '../storage';
import { UrlState } from '../url-state';
import { MapView } from '../map';
import { ChartView } from '../charts';

export interface TrackFilters {
  date: [string | null, string | null];
  dist: [number | null, number | null];
  dur: [number | null, number | null];
  metrics: Set<string>;
  tags: string[];
  sport: string | null;
}

export const TRACK_COLORS: string[] = [
  '#FF6B35',
  '#4ECDC4',
  '#45B7D1',
  '#F7DC6F',
  '#FF6B6B',
  '#BB8FCE',
  '#82E0AA',
  '#F8C471',
  '#3b82f6',
];

@Injectable({ providedIn: 'root' })
export class TrackStateService {
  tracks: Record<string, TrackData> = {};
  skippedImports: { name: string; reason: string }[] = [];
  selectedId: string | null = null;
  activeTab: string = 'graphs';
  colorIdx: number = 0;
  followDot: boolean = false;
  currentMapColors: string[] | null = null;
  cancelProcessing: boolean = false;

  searchQuery: string = '';
  searchRegex: boolean = false;
  currentSort: string = 'date-desc';
  selectionRange: [number, number] | null = null;

  filters: TrackFilters = {
    date: [null, null],
    dist: [null, null],
    dur: [null, null],
    metrics: new Set<string>(),
    tags: [],
    sport: null,
  };

  toastMessage: { msg: string; type: 'info' | 'error' } | null = null;

  readonly stateChanges$ = new Subject<void>();

  appRef: ApplicationRef | null = null;
  graphsTab: any = null;
  insightsTab: any = null;
  detailsTab: any = null;
  combinedTab: any = null;
  evolutionTab: any = null;
  coursesTab: any = null;

  onSelectTrackCallback: ((id: string, fit?: boolean, deferChartRender?: boolean) => void) | null =
    null;
  onDeleteTrackCallback: ((id: string) => Promise<void>) | null = null;
  onApplyFiltersCallback: ((skipRender?: boolean) => void) | null = null;
  onChartRangeChangeCallback:
    | ((min: number | null, max: number | null, axis: string, fit?: boolean) => void)
    | null = null;

  constructor() {
    (window as any).__trackStateService = this;
  }

  get allTracks(): TrackData[] {
    return Object.values(this.tracks);
  }

  get selectedTrack(): TrackData | null {
    return this.selectedId && this.tracks[this.selectedId] ? this.tracks[this.selectedId] : null;
  }

  get filteredTrackIds(): string[] {
    const ids = Object.keys(this.tracks).filter((id) => !this.tracks[id]._filtered);
    return ids.sort((a, b) => {
      if (a === this.selectedId) return -1;
      if (b === this.selectedId) return 1;

      const ta = this.tracks[a];
      const tb = this.tracks[b];
      const sa = ta.stats;
      const sb = tb.stats;

      let cmp = 0;
      switch (this.currentSort) {
        case 'date-asc':
          cmp = (sa.startTime || 0) - (sb.startTime || 0);
          break;
        case 'date-desc':
          cmp = (sb.startTime || 0) - (sa.startTime || 0);
          break;
        case 'dist-asc':
          cmp = (sa.totalDist || 0) - (sb.totalDist || 0);
          break;
        case 'dist-desc':
          cmp = (sb.totalDist || 0) - (sa.totalDist || 0);
          break;
        case 'dur-asc':
          cmp = (sa.duration || 0) - (sb.duration || 0);
          break;
        case 'dur-desc':
          cmp = (sb.duration || 0) - (sa.duration || 0);
          break;
        default:
          cmp = 0;
      }
      return cmp || a.localeCompare(b);
    });
  }

  get filteredTracks(): TrackData[] {
    return this.filteredTrackIds.map((id) => this.tracks[id]);
  }

  getGlobalTags(): string[] {
    const all = new Set<string>();
    Object.values(this.tracks).forEach((t) => {
      (t.tags || []).forEach((tag) => all.add(tag));
    });
    return Array.from(all).sort();
  }

  showToast(msg: string, type: 'info' | 'error' = 'info'): void {
    this.toastMessage = { msg, type };
    const container = document.getElementById('toast-container');
    if (container) {
      container.innerHTML = '';
      const t = document.createElement('div');
      t.className = `toast ${type}`;
      t.textContent = msg;
      container.appendChild(t);
    }
    this.notify();
  }

  selectTrack(id: string, fit = true, deferChartRender = false): void {
    if (this.onSelectTrackCallback) {
      this.onSelectTrackCallback(id, fit, deferChartRender);
    }
  }

  selectTrackAndRange(trackId: string, range?: [number, number] | null): void {
    this.selectTrack(trackId, true);
    if (range) {
      ChartView.restoreSelection(range[0], range[1]);
      if (this.onChartRangeChangeCallback) {
        this.onChartRangeChangeCallback(range[0], range[1], 'time', true);
      }
    }
  }

  async deleteTrack(id: string): Promise<void> {
    if (this.onDeleteTrackCallback) {
      await this.onDeleteTrackCallback(id);
    } else {
      await Storage.remove(id);
      MapView.removeTrack(id);
      delete this.tracks[id];
      if (this.selectedId === id) {
        this.selectedId = null;
        ChartView.clear();
        UrlState.patch({ track: null, sel: null, sel_point: null });
      }
      this.applyFilters();
    }
  }

  applyFilters(skipRender = false): void {
    if (this.onApplyFiltersCallback) {
      this.onApplyFiltersCallback(skipRender);
      return;
    }
    const ids = Object.keys(this.tracks);
    ids.forEach((id) => {
      const t = this.tracks[id];
      const s = t.stats;
      let visible = true;

      if (this.searchQuery) {
        if (this.searchRegex) {
          try {
            const re = new RegExp(this.searchQuery, 'i');
            if (!re.test(t.name)) visible = false;
          } catch {
            visible = false;
          }
        } else {
          if (!t.name.toLowerCase().includes(this.searchQuery.toLowerCase())) visible = false;
        }
      }

      if (visible && (this.filters.date[0] || this.filters.date[1])) {
        const start = this.filters.date[0] ? new Date(this.filters.date[0]).getTime() : 0;
        const end = this.filters.date[1] ? new Date(this.filters.date[1]).getTime() : Infinity;
        const t0 = s.startTime || 0;
        if (t0 < start || t0 > end) visible = false;
      }

      if (visible && (this.filters.dist[0] !== null || this.filters.dist[1] !== null)) {
        const min = (this.filters.dist[0] || 0) * 1000;
        const max = (this.filters.dist[1] || Infinity) * 1000;
        if (s.totalDist < min || s.totalDist > max) visible = false;
      }

      if (visible && (this.filters.dur[0] !== null || this.filters.dur[1] !== null)) {
        const min = (this.filters.dur[0] || 0) * 60000;
        const max = (this.filters.dur[1] || Infinity) * 60000;
        const d = s.duration || 0;
        if (d < min || d > max) visible = false;
      }

      if (visible && this.filters.metrics.size > 0) {
        for (const m of this.filters.metrics) {
          const field = ChartView.METRICS[m]?.field;
          if (field && !t.points.some((p: any) => p[field] != null)) {
            visible = false;
            break;
          }
        }
      }

      if (visible && this.filters.sport) {
        if (t.sport !== this.filters.sport) visible = false;
      }

      if (visible && this.filters.tags.length > 0) {
        const trackTags = t.tags || [];
        if (!this.filters.tags.every((ft) => trackTags.includes(ft))) visible = false;
      }

      t._filtered = !visible;
      MapView.setTrackVisible(t.id, t.visible && visible);
    });
    if (!skipRender) this.notify();
  }

  syncFiltersToUrl(push = false): void {
    UrlState.patch(
      {
        f_date: this.filters.date.every((v) => v === null) ? null : this.filters.date,
        f_dist: this.filters.dist.every((v) => v === null) ? null : this.filters.dist,
        f_dur: this.filters.dur.every((v) => v === null) ? null : this.filters.dur,
        f_mets: this.filters.metrics.size === 0 ? null : Array.from(this.filters.metrics),
        f_tags: this.filters.tags.length === 0 ? null : this.filters.tags,
      },
      push,
    );
  }

  onTagsChanged(): void {
    this.applyFilters();
    this.syncFiltersToUrl();
    this.notify();
  }

  onDateRangeSelected(start: string, end: string): void {
    this.filters.date = [start, end];
    this.applyFilters();
    this.syncFiltersToUrl(true);
    this.notify();
  }

  activateTab(tabName: string, pushUrl = false): void {
    this.activeTab = tabName;
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.toggle('active', (b as HTMLElement).dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach((c) => {
      c.classList.toggle('active', c.id === `tab-${tabName}`);
    });
    UrlState.patch({ tab: tabName }, pushUrl);
    this.notify();
  }

  notify(): void {
    this.stateChanges$.next();
    try {
      this.appRef?.tick();
    } catch {
      // Ignore if already in a change detection cycle
    }
  }
}
