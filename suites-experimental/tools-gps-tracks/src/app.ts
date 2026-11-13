// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// ── Main Application ──────────────────────────────────────────────

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
import { fmtSecs, escHtml, fmtDate, getTagColor, compactId, shortRandom } from './utils';

const TRACK_COLORS: string[] = [
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

const POINT_ZOOM_LEVEL = 16;

let tracks: Record<string, TrackData> = {};
let skippedImports: { name: string; reason: string }[] = [];

function isSameDay(t1: number, t2: number) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

let cancelProcessing = false;
let selectedId: string | null = null;
let colorIdx = 0;
let followDot = false;
let currentMapColors: string[] | null = null;

// Search/Filter state
let searchQuery = '';
let searchRegex = false;
let currentSort = 'date-desc';

interface Filters {
  date: [string | null, string | null];
  dist: [number | null, number | null];
  dur: [number | null, number | null];
  metrics: Set<string>;
  tags: string[];
  sport: string | null;
}

let filters: Filters = {
  date: [null, null],
  dist: [null, null],
  dur: [null, null],
  metrics: new Set<string>(),
  tags: [],
  sport: null,
};

function syncFiltersToUrl(push: boolean = false) {
  UrlState.patch(
    {
      f_date: filters.date.every((v) => v === null) ? null : filters.date,
      f_dist: filters.dist.every((v) => v === null) ? null : filters.dist,
      f_dur: filters.dur.every((v) => v === null) ? null : filters.dur,
      f_mets: filters.metrics.size === 0 ? null : Array.from(filters.metrics),
      f_tags: filters.tags.length === 0 ? null : filters.tags,
    },
    push,
  );
}

function syncMetricsToUrl() {
  const active = ChartView.getActiveMetrics();
  const metrics = ChartView.METRICS;
  const abbrs = Array.from(active).map((key) => metrics[key].abbr);
  UrlState.patch({ metrics: abbrs.length ? abbrs : null });
}

const SORT_OPTIONS = [
  { label: 'Newest first', val: 'date-desc', icon: 'calendar_today' },
  { label: 'Oldest first', val: 'date-asc', icon: 'history' },
  { label: 'Longest distance', val: 'dist-desc', icon: 'straighten' },
  { label: 'Shortest distance', val: 'dist-asc', icon: 'horizontal_rule' },
  { label: 'Longest duration', val: 'dur-desc', icon: 'timer' },
  { label: 'Shortest duration', val: 'dur-asc', icon: 'timer_off' },
];

function showSortMenu(anchorEl: HTMLElement) {
  document.querySelectorAll('.sort-menu-popup').forEach((el) => el.remove());

  const popup = document.createElement('div');
  popup.className = 'sort-menu-popup';

  SORT_OPTIONS.forEach((opt) => {
    const item = document.createElement('div');
    item.className = `menu-item ${currentSort === opt.val ? 'active' : ''}`;
    item.innerHTML = `
      <span class="material-symbols-rounded">${opt.icon}</span>
      <span class="item-label">${opt.label}</span>
      <span class="material-symbols-rounded check">${currentSort === opt.val ? 'check' : ''}</span>
    `;
    item.addEventListener('click', () => {
      currentSort = opt.val;
      UrlState.patch({ sort: opt.val });
      updateSearchSortUI();
      renderTrackList();
      popup.remove();
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

function showMetricMenu(anchorEl: HTMLElement) {
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

      const pill = document.querySelector(`#metric-pills .metric-pill[data-metric="${key}"]`);
      if (pill) pill.classList.toggle('active', isNowActive);

      updateToolbarLayout();

      syncMetricsToUrl();
    });
    popup.appendChild(item);
  });

  const rect = anchorEl.getBoundingClientRect();
  popup.style.top = `${rect.bottom + 5}px`;
  popup.style.right = `${window.innerWidth - rect.right}px`;
  document.body.appendChild(popup);

  const close = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('click', close);
    }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

// ── Tab Management ────────────────────────────────────────────────
document.addEventListener('select-track', (e: any) => {
  const id = e.detail.id;
  const idx = e.detail.idx;
  const dur = e.detail.dur;
  if (id && tracks[id]) {
    selectTrack(id);
    if (idx != null && dur != null) {
      const t = tracks[id];
      const pts = t.points;
      if (idx >= 0 && idx < pts.length) {
        const pIdx = pts[idx];
        if (pIdx && pIdx.time != null) {
          const t0 = pts.find((p) => p.time != null)?.time || 0;
          const tMin = (pIdx.time - t0) / 1000;
          const tMax = tMin + dur;

          // ChartView selection
          ChartView.restoreSelection(tMin, tMax);

          // Find iMax based on duration
          let iMax = pts.findIndex((p) => (p.time || 0) >= pIdx.time! + dur * 1000);
          if (iMax === -1) iMax = pts.length - 1;

          const selPts = pts.slice(idx, iMax + 1);
          const stats = Parsers.computeStats(selPts);
          ChartView.setSelectionStats(stats);

          renderInsights(t);

          MapView.highlightSegment(id, pts, idx, iMax, false, currentMapColors);
          MapView.ensureVisible(selPts.map((p) => [p.lat, p.lon] as [number, number]));

          // Update URL state
          UrlState.patch({ sel: [tMin, tMax] });
        }
      }
    }
  }
});

document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('.tab-btn') as HTMLElement;
  if (!btn) return;
  const nav = btn.closest('#tab-nav');
  if (!nav) return;

  // Toggle buttons
  nav.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));

  const tab = btn.dataset.tab!;
  UrlState.patch({ tab }, true);

  // Toggle contents
  const panel = nav.closest('#chart-panel');
  if (panel) {
    panel.querySelectorAll('.tab-content').forEach((c) => {
      c.classList.toggle('active', c.id === `tab-${btn.dataset.tab}`);
    });
  }

  if (btn.dataset.tab === 'details' && selectedId && tracks[selectedId])
    renderDetails(tracks[selectedId], getGlobalTags());

  if (btn.dataset.tab === 'insights' && selectedId && tracks[selectedId])
    renderInsights(tracks[selectedId]);

  if (btn.dataset.tab === 'evolution') {
    renderEvolution(
      selectedId ? tracks[selectedId] : null,
      Object.values(tracks),
      (trackId, range) => {
        selectTrack(trackId, true);
        if (range) {
          ChartView.restoreSelection(range[0], range[1]);
          onChartRangeChange(range[0], range[1], 'time', true);
        }
      },
      (start, end) => {
        filters.date = [start, end];
        applyFilters();
        syncFiltersToUrl(true);
        updateFilterUI();
      },
    );
  }

  if (btn.dataset.tab === 'combined' && selectedId && tracks[selectedId])
    renderCombined(tracks[selectedId]);

  if (btn.dataset.tab === 'courses') renderCourses();

  if (btn.dataset.tab === 'graphs') {
    ChartView.resize();
    updateToolbarLayout();

    // Restore selection from URL
    const s = UrlState.get().sel;
    if (s) ChartView.restoreSelection(s[0], s[1]);
  }
});

async function resetBenchmarkState() {
  if (typeof (window as any).__resetBenchmarkSeed === 'function') {
    (window as any).__resetBenchmarkSeed();
  }
  await Storage.clear();
  tracks = {};
  skippedImports = [];
  selectedId = null;
  colorIdx = 0;
  currentMapColors = null;
  cancelProcessing = false;
  followDot = false;
  searchQuery = '';
  searchRegex = false;
  currentSort = 'date-desc';
  filters.date = [null, null];
  filters.dist = [null, null];
  filters.dur = [null, null];
  filters.metrics.clear();
  filters.tags = [];
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
  document.querySelectorAll('.tab-btn').forEach((b) => {
    b.classList.toggle('active', (b as HTMLElement).dataset.tab === 'graphs');
  });
  document.querySelectorAll('.tab-content').forEach((c) => {
    c.classList.toggle('active', c.id === 'tab-graphs');
  });
  UrlState.reset();
  const toastContainer = document.getElementById('toast-container');
  if (toastContainer) toastContainer.innerHTML = '';
  document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
  if (typeof renderTrackList === 'function') renderTrackList();
}

// ── Boot ──────────────────────────────────────────────────────────
async function init() {
  // Wait for fonts to be loaded with a cleaned-up timeout
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
  const storageSelect = document.getElementById(
    'storage-backend-select',
  ) as HTMLSelectElement | null;
  if (storageSelect) {
    storageSelect.value = UrlState.get().storage || 'memory';
    storageSelect.addEventListener('change', (e) => {
      const selected = (e.target as HTMLSelectElement).value;
      const params = new URLSearchParams(window.location.search);
      if (selected === 'memory') {
        params.delete('storage');
      } else {
        params.set('storage', selected);
      }
      window.location.search = params.toString();
    });
  }

  const loader = document.getElementById('global-loader');
  const loaderText = document.getElementById('loader-text');
  const loaderSubtext = document.getElementById('loader-subtext');
  const progressBar = document.getElementById('loader-progress-bar') as HTMLElement;
  const mapLoader = document.getElementById('map-loader');
  const mapLoaderSpan = mapLoader?.querySelector('span');

  if (mapLoader) {
    if (mapLoaderSpan) mapLoaderSpan.textContent = 'Loading database...';
    mapLoader.classList.remove('hidden');
  }

  const urlState = UrlState.get();

  initInsights((msg: string, type?: string) => showToast(msg, type === 'error' ? 'error' : 'info'));
  initDetails(
    () => {
      applyFilters();
      syncFiltersToUrl();
    },
    (id: string) => {
      deleteTrack(id);
    },
  );
  initCombined();
  initCourses((msg: string, type?: string) => showToast(msg, type === 'error' ? 'error' : 'info'));

  // Init sub-systems
  MapView.init(
    (id) => selectTrack(id),
    onMapMove,
    onMapPointClick,
    (id, idx) => {
      if (id === selectedId) ChartView.setHoverAt(idx);
      else ChartView.setHoverAt(null);
    },
    onMapDblClick,
  );
  ChartView.init(onChartCursorMove, onChartRangeChange, onChartClick, (idx) => {
    UrlState.patch({ sel_point: idx });
  });

  ChartView.setMapColorChangeCb((data) => {
    if (data) {
      currentMapColors = data.colors;
      if (selectedId) MapView.colorTrackByMetric(selectedId, data.pts, data.colors);
    } else {
      currentMapColors = null;
      if (selectedId) MapView.clearMetricColor(selectedId);
    }

    // Refresh highlight with new colors if a selection exists
    const currentUrlState = UrlState.get();
    if (currentUrlState.sel)
      onChartRangeChange(currentUrlState.sel[0], currentUrlState.sel[1], ChartView.getXAxis());
  });

  applyState(urlState);

  // Reset persistent storage and in-memory state for clean multi-iteration benchmark executions
  await Storage.openDB();
  await resetBenchmarkState();

  // Load persisted tracks
  try {
    // Load global settings
    const hrZones = await Storage.get('hr_zones');
    if (hrZones) Parsers.setHRZones(hrZones);

    const ftp = await Storage.get('ftp');
    if (ftp) Parsers.setFTP(ftp);

    const saved = await Storage.getAll();
    saved.sort((a, b) => a.addedAt - b.addedAt);

    if (mapLoaderSpan) mapLoaderSpan.textContent = `Preparing ${saved.length} tracks...`;

    const tracksToLoad: TrackData[] = [];
    for (const t of saved) {
      let updated = false;
      if (!t.bounds && t.points.length > 0) {
        const b = calculateBounds(t.points);
        if (b) {
          t.bounds = b;
          updated = true;
        }
      }
      if (!t.simplifiedPoints && t.points.length > 0) {
        t.simplifiedPoints = simplifyTrack(t.points, 50);
        updated = true;
      }
      if (updated) await Storage.save(t);

      tracks[t.id] = t;
      tracksToLoad.push(t);
    }
    MapView.addTracks(tracksToLoad);
    applyFilters();

    const restoreId =
      urlState.track && saved.find((t) => t.id === urlState.track)
        ? urlState.track
        : saved.length > 0
          ? saved[0].id
          : null;

    const mapLoader = document.getElementById('map-loader');

    // 1. Process and load the "Priority" track first
    const selectedTrackData = saved.find((t) => t.id === restoreId);
    if (selectedTrackData) {
      await processAndLoadTrack(selectedTrackData);
      selectTrack(selectedTrackData.id, !urlState.map_pos);

      // Explicitly restore selection/pin from URL if they exist
      if (urlState.sel && Array.isArray(urlState.sel) && urlState.sel.length === 2) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ChartView.restoreSelection(urlState.sel![0], urlState.sel![1]);
          });
        });
      }
      if (urlState.sel_point !== undefined && urlState.sel_point !== null) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ChartView.setCursorAt(urlState.sel_point!);
          });
        });
      }
    }

    // Hide database loader
    if (mapLoader) mapLoader.classList.add('hidden');

    // 2. Load the rest in background chunks
    if (saved.length > (selectedTrackData ? 1 : 0)) {
      if (mapLoader) {
        if (mapLoaderSpan) mapLoaderSpan.textContent = 'Loading tracks...';
        mapLoader.classList.remove('hidden');
      }

      const remaining = saved.filter((t) => t.id !== restoreId);
      let index = 0;

      const loadNextChunk = async () => {
        const chunkSize = 2; // Process 2 tracks per frame
        const end = Math.min(index + chunkSize, remaining.length);

        for (; index < end; index++) await processAndLoadTrack(remaining[index]);

        if (index < remaining.length) {
          requestAnimationFrame(loadNextChunk);
        } else {
          if (mapLoader) mapLoader.classList.add('hidden');
          applyFilters(); // Final sync
          if (selectedId && tracks[selectedId]) {
            renderEvolution(tracks[selectedId], Object.values(tracks), (trackId, range) => {
              selectTrack(trackId, true);
              if (range) {
                ChartView.restoreSelection(range[0], range[1]);
                onChartRangeChange(range[0], range[1], 'time', true);
              }
            });
          }
          // Only fit all if no saved map position and we just finished loading everything
          if (saved.length && !urlState.map_pos) MapView.fitAll();
        }
      };

      requestAnimationFrame(loadNextChunk);
    } else {
      applyFilters();
      if (saved.length && !urlState.map_pos) MapView.fitAll();
    }
  } catch (e) {
    console.warn('Could not load saved tracks:', e);
  }

  // Panel resizers
  initResizeHandle();
  initSidebarResizer();
  initMetricPillDraggable();
  updateToolbarLayout();

  // Basemap switcher
  document.getElementById('basemap-switcher')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.bm-btn') as HTMLElement;
    if (!btn) return;
    document.querySelectorAll('.bm-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.layer) {
      MapView.switchBasemap(btn.dataset.layer);
      UrlState.patch({ map: btn.dataset.layer });
    }
  });

  // Fit all
  document.getElementById('btn-fit-all')?.addEventListener('click', () => MapView.fitAll());

  // Clear all
  document.getElementById('btn-clear-all')?.addEventListener('click', clearAll);

  // Search
  document.getElementById('track-search')?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    applyFilters();
    UrlState.patch({ q: searchQuery || null });
  });

  document.getElementById('btn-regex-toggle')?.addEventListener('click', (e) => {
    searchRegex = !searchRegex;
    (e.target as HTMLElement).classList.toggle('active', searchRegex);
    applyFilters();
    UrlState.patch({ re: searchRegex ? 1 : null });
  });

  // Sort
  document.getElementById('btn-sort-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showSortMenu(e.currentTarget as HTMLElement);
  });

  // Metric menu toggle
  document.getElementById('btn-metric-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showMetricMenu(e.currentTarget as HTMLElement);
  });

  // Metric toggles (shared logic)
  const toggleMetric = (metric: string, pill: HTMLElement | null) => {
    if (pill) pill.classList.toggle('active');
    ChartView.toggleMetric(metric);
    syncMetricsToUrl();
  };

  document.getElementById('metric-pills')?.addEventListener('click', (e) => {
    const pill = (e.target as HTMLElement).closest('.metric-pill') as HTMLElement;
    if (pill) {
      const metric = pill.dataset.metric;
      if (metric) {
        toggleMetric(metric, pill);

        // Scroll to it if it became active
        if (ChartView.getActiveMetrics().has(metric)) {
          const targetEl = document.querySelector(`.chart-row[data-metric="${metric}"]`);
          targetEl?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });

  // X-axis toggle
  document.getElementById('x-axis-ctrl')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.seg-btn') as HTMLElement;
    if (!btn) return;
    const axis = btn.dataset.axis!;
    ChartView.setXAxis(axis);
    document
      .querySelectorAll('#x-axis-ctrl .seg-btn')
      .forEach((b) => b.classList.toggle('active', b === btn));
    UrlState.patch({ xaxis: axis });
  });

  // Follow dot
  document.getElementById('btn-follow-dot')?.addEventListener('click', (e) => {
    followDot = !followDot;
    (e.currentTarget as HTMLElement).classList.toggle('active', followDot);
  });

  // Reset zoom
  document.getElementById('btn-reset-zoom')?.addEventListener('click', () => {
    ChartView.resetZoom();
    MapView.clearHighlight();
  });

  // File drag/drop
  initDropZone();

  // File browse
  document.getElementById('file-input')?.addEventListener('change', (e) => {
    handleFiles(Array.from((e.target as HTMLInputElement).files || []));
    (e.target as HTMLInputElement).value = '';
  });
  document.getElementById('folder-input')?.addEventListener('change', (e) => {
    handleFiles(Array.from((e.target as HTMLInputElement).files || []));
    (e.target as HTMLInputElement).value = '';
  });

  // Filters
  document.getElementById('btn-toggle-filters')?.addEventListener('click', () => {
    const panel = document.getElementById('filter-panel');
    if (panel) {
      panel.classList.toggle('hidden');
      document
        .getElementById('btn-toggle-filters')
        ?.classList.toggle('active', !panel.classList.contains('hidden'));
    }
  });

  const onFilterInput = (type: 'date' | 'dist' | 'dur', idx: number, e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    (filters[type] as any)[idx] = val === '' ? null : val;
    applyFilters();
    syncFiltersToUrl();
  };

  document
    .getElementById('filter-date-start')
    ?.addEventListener('change', (e) => onFilterInput('date', 0, e));
  document
    .getElementById('filter-date-end')
    ?.addEventListener('change', (e) => onFilterInput('date', 1, e));
  document
    .getElementById('filter-dist-min')
    ?.addEventListener('input', (e) => onFilterInput('dist', 0, e));
  document
    .getElementById('filter-dist-max')
    ?.addEventListener('input', (e) => onFilterInput('dist', 1, e));
  document
    .getElementById('filter-dur-min')
    ?.addEventListener('input', (e) => onFilterInput('dur', 0, e));
  document
    .getElementById('filter-dur-max')
    ?.addEventListener('input', (e) => onFilterInput('dur', 1, e));

  const burgerBtn = document.getElementById('sport-burger-btn');
  const dropdownContent = document.getElementById('sport-dropdown-content');
  burgerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdownContent) {
      const isVisible = dropdownContent.style.display === 'block';
      dropdownContent.style.display = isVisible ? 'none' : 'block';
    }
  });

  document.addEventListener('click', (e) => {
    if (dropdownContent && dropdownContent.style.display === 'block') {
      if (!dropdownContent.contains(e.target as Node) && e.target !== burgerBtn)
        dropdownContent.style.display = 'none';
    }
  });

  document.getElementById('sport-filter-container')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-sport]');
    if (btn) {
      const selectedSport = (btn as HTMLElement).dataset.sport || null;
      filters.sport = filters.sport === selectedSport ? null : selectedSport;
      applyFilters();
      syncFiltersToUrl();
      updateFilterUI();

      if (target.closest('.dropdown-item')) {
        if (dropdownContent) dropdownContent.style.display = 'none';
      }
    }
  });

  document.getElementById('filter-metrics')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.mini-pill') as HTMLElement;
    if (!btn) return;
    const m = btn.dataset.metric!;
    if (filters.metrics.has(m)) filters.metrics.delete(m);
    else filters.metrics.add(m);
    updateFilterUI();
    applyFilters();
    syncFiltersToUrl();
  });

  document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
    filters = {
      date: [null, null],
      dist: [null, null],
      dur: [null, null],
      metrics: new Set(),
      tags: [],
      sport: null,
    };
    updateFilterUI();
    applyFilters();
    syncFiltersToUrl();
  });

  document.getElementById('filter-tags')?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    filters.tags = val
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !!s);
    applyFilters();
    syncFiltersToUrl();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      MapView.hideCursor();
      MapView.closePopup?.();
      // Dismiss popups and modals
      document
        .querySelectorAll(
          '.color-picker-popup, .metric-menu-popup, .sort-menu-popup, .modal-backdrop',
        )
        .forEach((el) => el.remove());
    }
  });

  // Resize charts when window changes
  window.addEventListener('resize', () => {
    ChartView.resize();
    resizeCombined();
    MapView.invalidateSize?.();
    updateToolbarLayout();
  });

  // Handle back/forward navigation
  window.addEventListener('popstate', () => {
    UrlState.refresh();
    applyState(UrlState.get());
  });

  initBenchmarkTriggers();
  await preloadBenchmarkFiles();

  // Signal to Speedometer test harness that asynchronous initialization has completed
  // and benchmark step triggers are bound.
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

let preloadedBenchmarkPayloads:
  | {
      cleanName: string;
      buf: ArrayBuffer;
      text?: string;
      file: File;
    }[]
  | null = null;

async function preloadBenchmarkFiles(): Promise<
  { cleanName: string; buf: ArrayBuffer; text?: string; file: File }[]
> {
  if (preloadedBenchmarkPayloads) return preloadedBenchmarkPayloads;
  try {
    const manifestResp = await fetch('./test-data/manifest.json');
    const fileNames: string[] = await manifestResp.json();
    const decoder = new TextDecoder();
    preloadedBenchmarkPayloads = await Promise.all(
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
    // Warm up GPX, TCX, and FIT parser and chart code paths during prepare phase
    let warmSample: any = null;
    for (const idx of [0, 2, 4]) {
      if (preloadedBenchmarkPayloads[idx]) {
        const parsed = await Parsers.parseFile(preloadedBenchmarkPayloads[idx].file);
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
      await resetBenchmarkState();
      void document.body.offsetHeight;
      await new Promise((r) => window.setTimeout(r, 0));
    } else if (typeof (window as any).__resetBenchmarkSeed === 'function') {
      (window as any).__resetBenchmarkSeed();
    }
    return preloadedBenchmarkPayloads;
  } catch {
    return [];
  }
}

function initBenchmarkTriggers() {
  const btnLoad = document.getElementById('btn-step-load');
  const btnAnalysis = document.getElementById('btn-step-analysis');
  const btnInsights = document.getElementById('btn-step-insights');
  const btnDetails = document.getElementById('btn-step-details');
  const btnAggregate = document.getElementById('btn-step-aggregate');
  const btnEvolution = document.getElementById('btn-step-evolution');
  const btnCourses = document.getElementById('btn-step-courses');

  function activateTab(tabName: string) {
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.toggle('active', (b as HTMLElement).dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach((c) => {
      c.classList.toggle('active', c.id === `tab-${tabName}`);
    });
    UrlState.patch({ tab: tabName }, false);
  }

  btnLoad?.addEventListener('click', async () => {
    try {
      if (Object.keys(tracks).length > 0 || skippedImports.length > 0 || selectedId !== null) {
        await Storage.openDB();
        await resetBenchmarkState();
      } else if (typeof (window as any).__resetBenchmarkSeed === 'function') {
        (window as any).__resetBenchmarkSeed();
      }
      const payloads = await preloadBenchmarkFiles();
      const loadedFiles: File[] = payloads.map((p) => p.file);
      await handleFiles(loadedFiles);
      const allTracks = Object.values(tracks);
      Parsers.findOverlaps(allTracks);

      // Exercise sidebar track list sorting and filtering across distinct criteria
      for (const sortMode of ['dist-desc', 'dur-desc', 'date-asc', 'date-desc']) {
        currentSort = sortMode;
        renderTrackList();
      }
      filters.sport = 'cycling';
      applyFilters();
      filters.sport = null;
      filters.metrics.add('power');
      applyFilters();
      filters.metrics.clear();
      searchQuery = 'Alpine';
      applyFilters();
      searchQuery = '';
      applyFilters();

      if (!selectedId && allTracks.length > 0) selectTrack(allTracks[0].id);
    } finally {
      window.dispatchEvent(new CustomEvent('load-and-parse-complete'));
    }
  });

  btnAnalysis?.addEventListener('click', () => {
    try {
      const allTracks = Object.values(tracks);
      activateTab('graphs');
      if (!selectedId && allTracks.length > 0) {
        selectTrack(allTracks[0].id, false);
      }
      const availableMetrics = ChartView.getAvailableMetrics();
      const metricSets = [
        ['elevation', 'speed', 'power', 'hr'],
        ['elevation', 'speed', 'power'],
      ];
      for (const mSet of metricSets) {
        const filtered = mSet.filter((m) => availableMetrics.has(m));
        if (filtered.length > 0) {
          document.querySelectorAll('#metric-pills .metric-pill').forEach((el) => {
            const metric = (el as HTMLElement).dataset.metric;
            if (metric) el.classList.toggle('active', filtered.includes(metric));
          });
          updateToolbarLayout();
          ChartView.setActiveMetrics(filtered);
        }
      }

      // Exercise smoothing, map metric coloring, and X-axis mode switching
      ChartView.setSmooth('power', true, true);
      ChartView.toggleMapColor('power', true);
      ChartView.toggleMapColor(null, true);
      ChartView.setXAxis('distance');
      ChartView.setSmooth('power', false, true);
      ChartView.setXAxis('time');

      // Analyze distinct sections of the track (Opening Climb & Main Analysis Window)
      const sections: [number, number, number][] = [
        [0, 360, 180],
        [120, 900, 300],
      ];
      for (const [secStart, secEnd, cursorIdx] of sections) {
        ChartView.restoreSelection(secStart, secEnd, true);
        ChartView.setCursorAt(cursorIdx, true);
        ChartView.analyzeTelemetryIntervals(allTracks, secStart, secEnd);
        onChartRangeChange(secStart, secEnd, ChartView.getXAxis(), false);
      }
    } finally {
      window.dispatchEvent(new CustomEvent('analysis-complete'));
    }
  });

  btnInsights?.addEventListener('click', () => {
    try {
      const allTracks = Object.values(tracks);
      allTracks.forEach((t) => Parsers.ensureCurvesAndZones(t));
      activateTab('insights');
      const primaryTrack = (selectedId && tracks[selectedId]) || allTracks[0] || null;
      // Analyze insights across GPX, TCX, and FIT tracks and across distinct track sections (Opening, Middle, Final thirds, Full)
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
  });

  btnDetails?.addEventListener('click', () => {
    try {
      const allTracks = Object.values(tracks);
      activateTab('details');
      const globalTags = getGlobalTags();
      const primaryTrack = (selectedId && tracks[selectedId]) || allTracks[0] || null;
      // Render and analyze telemetry details, splits, gear matrices, and zones across all 6 tracks and terrain sections
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
  });

  btnAggregate?.addEventListener('click', () => {
    try {
      const allTracks = Object.values(tracks);
      if (allTracks.length >= 2) {
        activateTab('combined');
        // 1. Exercise single-track 2D scatter/trail mode across metric pairs, Polar & Cartesian, and timeline sections
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

        // 2. Exercise multi-track comparison mode across regional pairs and all 6 tracks
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
  });

  btnEvolution?.addEventListener('click', () => {
    try {
      const allTracks = Object.values(tracks);
      activateTab('evolution');
      const primaryTrack = (selectedId && tracks[selectedId]) || allTracks[0] || null;
      const onSelectCb = (trackId: string, range: [number, number] | null) => {
        selectTrack(trackId, true);
        if (range) {
          ChartView.restoreSelection(range[0], range[1]);
          onChartRangeChange(range[0], range[1], 'time', true);
        }
      };

      // Exercise evolution view across different reference tracks, groupings ('month' & 'week'), time ranges, and pinned durations
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
  });

  btnCourses?.addEventListener('click', () => {
    try {
      const allTracks = Object.values(tracks);
      activateTab('courses');
      prepareBenchmarkCourses(allTracks);
      const courseIds = getBenchmarkCourseIds();
      for (const cId of courseIds) {
        selectCourse(cId, true);
      }
      selectCourse('course-1', true);
    } finally {
      window.dispatchEvent(new CustomEvent('courses-complete'));
    }
  });

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

async function processAndLoadTrack(t: TrackData) {
  // Migration: re-calculate stats if new insights are missing or old format
  const powerCurveEntries = t.stats.powerCurve ? Object.values(t.stats.powerCurve) : [];

  const needsEnrich =
    t.points.length > 1 && (t.points[1].speed === undefined || t.points[1].gradient === undefined);

  const needsRecalc =
    needsEnrich ||
    !t.stats.powerCurve ||
    !t.stats.hrZones ||
    !t.stats.hrCurve ||
    t.stats.shifts === undefined ||
    t.stats.avgBattery === undefined ||
    t.stats.avgTemp === undefined ||
    (powerCurveEntries.length > 0 && typeof (powerCurveEntries[0] as any) === 'number') ||
    ((t.stats.duration || 0) > 10800 * 1000 && t.stats.powerCurve && !t.stats.powerCurve[14400]);

  if (needsRecalc) {
    if (needsEnrich) t.points = Parsers.enrichPoints(t.points);
    t.stats = Parsers.computeStats(t.points);
    await Storage.save(t);
  }

  tracks[t.id] = t;
  colorIdx = Math.max(colorIdx, TRACK_COLORS.indexOf(t.color) + 1);
  MapView.addTrack(t);
  MapView.setTrackVisible(t.id, t.visible && !t._filtered);
  renderTrackList(); // Progressive list update
}

function initResizeHandle() {
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

function initSidebarResizer() {
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

// ── Event Handlers ──────────────────────────────────────────────

function onMapMove(lat: number, lng: number, zoom: number) {
  UrlState.patch({ map_pos: [lat, lng, zoom] });
}

function onMapPointClick(id: string, idx: number) {
  selectTrack(id, false);
  ChartView.setCursorAt(idx);
}

function onMapDblClick() {
  // MapView.fitAll();
}

function onChartCursorMove(pt: TrackPoint | null) {
  if (pt && pt.lat != null && pt.lon != null) {
    MapView.showCursorAt(pt.lat, pt.lon);
    if (followDot) MapView.centerOn(pt.lat, pt.lon, null, true);
  } else {
    MapView.hideCursor();
  }
}

function onChartRangeChange(min: number | null, max: number | null, axis: string, fit = false) {
  if (!selectedId || !tracks[selectedId]) return;
  const t = tracks[selectedId];

  if (min === null || max === null) {
    MapView.clearHighlight();
    if (t && (UrlState.get().tab || 'graphs') === 'insights') renderInsights(t);
    UrlState.patch({ sel: null });
    return;
  }

  // Find point indices
  const pts = t.points;
  let iMin = 0,
    iMax = pts.length - 1;

  if (axis === 'distance') {
    const d0 = min * 1000,
      d1 = max * 1000;
    iMin = pts.findIndex((p) => (p.dist || 0) >= d0);
    iMax = pts.findIndex((p) => (p.dist || 0) >= d1);
  } else {
    const t0 = pts.find((p) => p.time != null)?.time || 0;
    const ts0 = t0 + min * 1000,
      ts1 = t0 + max * 1000;
    iMin = pts.findIndex((p) => (p.time || 0) >= ts0);
    iMax = pts.findIndex((p) => (p.time || 0) >= ts1);
  }

  if (iMin === -1) iMin = 0;
  if (iMax === -1) iMax = pts.length - 1;

  // Compute selection stats
  const selPts = pts.slice(iMin, iMax + 1);
  const stats = Parsers.computeStats(selPts);
  ChartView.setSelectionStats(stats);
  if ((UrlState.get().tab || 'graphs') === 'insights') renderInsights(t);

  MapView.highlightSegment(selectedId, pts, iMin, iMax, fit, currentMapColors);
  MapView.ensureVisible(selPts.map((p) => [p.lat, p.lon] as [number, number]));
  UrlState.patch({ sel: [min, max] });
}

function onChartClick(pt: TrackPoint, idx: number) {
  if (pt && pt.lat != null && pt.lon != null) MapView.centerOn(pt.lat, pt.lon, POINT_ZOOM_LEVEL);
}

export function selectTrack(id: string, fit = true, deferChartRender = false) {
  if (!tracks[id]) return;
  if (id === selectedId) {
    if (fit) MapView.fitTrack(id);
    return;
  }

  const hadSelected = selectedId !== null;
  if (hadSelected) {
    // Clear current views immediately before loading new data
    ChartView.clear();
    renderDetails(null, []);
    renderInsights(null);
  }

  selectedId = id;

  // Fully reset metric coloring when switching tracks
  currentMapColors = null;
  MapView.clearMetricColor(id);
  if (hadSelected) {
    ChartView.toggleMapColor(null); // Ensure ChartView state also resets
  }

  // Clear selection on new track
  UrlState.patch({ track: id, sel: null }, true);
  if (hadSelected) {
    ChartView.cancelSelection();
  }

  // Update UI immediately
  renderTrackList();

  // Render details
  const activeTab = UrlState.get().tab || 'graphs';
  if (activeTab === 'details') renderDetails(tracks[id], getGlobalTags());
  if (activeTab === 'insights') renderInsights(tracks[id]);
  if (activeTab === 'combined') renderCombined(tracks[id]);
  if (activeTab === 'courses') renderCourses();
  if (activeTab === 'evolution') {
    renderEvolution(tracks[id], Object.values(tracks), (trackId, range) => {
      selectTrack(trackId, true);
      if (range) {
        ChartView.restoreSelection(range[0], range[1]);
        onChartRangeChange(range[0], range[1], 'time', true);
      }
    });
  }

  // Tell sub-views
  MapView.setSelectedTrack(id, fit);
  if (fit) MapView.fitTrack(id);
  ChartView.loadTrack(tracks[id], Object.values(tracks), deferChartRender);
}

async function deleteTrack(id: string) {
  await Storage.remove(id);
  MapView.removeTrack(id);
  delete tracks[id];
  if (selectedId === id) {
    selectedId = null;
    ChartView.clear();
    renderDetails(null, []);
    renderInsights(null);
    UrlState.patch({ track: null, sel: null, sel_point: null });
  }
  applyFilters();
}

async function clearAll() {
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

    cancelProcessing = true;
    await Storage.clear();

    tracks = {};
    selectedId = null;
    MapView.clearHighlight();
    window.location.reload();
  });
}

function applyFilters(skipRender = false) {
  const ids = Object.keys(tracks);
  ids.forEach((id) => {
    const t = tracks[id];
    const s = t.stats;
    let visible = true;

    // Search query
    if (searchQuery) {
      if (searchRegex) {
        try {
          const re = new RegExp(searchQuery, 'i');
          if (!re.test(t.name)) visible = false;
        } catch (e) {
          visible = false;
        }
      } else {
        if (!t.name.toLowerCase().includes(searchQuery.toLowerCase())) visible = false;
      }
    }

    // Date filter
    if (visible && (filters.date[0] || filters.date[1])) {
      const start = filters.date[0] ? new Date(filters.date[0]).getTime() : 0;
      const end = filters.date[1] ? new Date(filters.date[1]).getTime() : Infinity;
      const t0 = s.startTime || 0;
      if (t0 < start || t0 > end) visible = false;
    }

    // Distance filter
    if (visible && (filters.dist[0] !== null || filters.dist[1] !== null)) {
      const min = (filters.dist[0] || 0) * 1000;
      const max = (filters.dist[1] || Infinity) * 1000;
      if (s.totalDist < min || s.totalDist > max) visible = false;
    }

    // Duration filter
    if (visible && (filters.dur[0] !== null || filters.dur[1] !== null)) {
      const min = (filters.dur[0] || 0) * 60000;
      const max = (filters.dur[1] || Infinity) * 60000;
      const d = s.duration || 0;
      if (d < min || d > max) visible = false;
    }

    // Metrics filter
    if (visible && filters.metrics.size > 0) {
      for (const m of filters.metrics) {
        const field = ChartView.METRICS[m].field;
        if (!t.points.some((p: any) => p[field] != null)) {
          visible = false;
          break;
        }
      }
    }

    // Sport filter
    if (visible && filters.sport) {
      if (t.sport !== filters.sport) visible = false;
    }

    // Tags filter
    if (visible && filters.tags.length > 0) {
      const trackTags = t.tags || [];
      if (!filters.tags.every((ft) => trackTags.includes(ft))) visible = false;
    }

    t._filtered = !visible;
    MapView.setTrackVisible(t.id, t.visible && visible);
  });

  if (!skipRender) renderTrackList();
}

function updateFilterUI() {
  (document.getElementById('filter-date-start') as HTMLInputElement).value = filters.date[0] || '';
  (document.getElementById('filter-date-end') as HTMLInputElement).value = filters.date[1] || '';
  (document.getElementById('filter-dist-min') as HTMLInputElement).value =
    filters.dist[0] !== null ? String(filters.dist[0]) : '';
  (document.getElementById('filter-dist-max') as HTMLInputElement).value =
    filters.dist[1] !== null ? String(filters.dist[1]) : '';
  (document.getElementById('filter-dur-min') as HTMLInputElement).value =
    filters.dur[0] !== null ? String(filters.dur[0]) : '';
  (document.getElementById('filter-dur-max') as HTMLInputElement).value =
    filters.dur[1] !== null ? String(filters.dur[1]) : '';
  (document.getElementById('filter-tags') as HTMLInputElement).value = filters.tags.join(', ');

  document
    .querySelectorAll('#sport-filter-container .mini-pill, #sport-dropdown-content .dropdown-item')
    .forEach((el) => {
      const item = el as HTMLElement;
      item.classList.toggle('active', (item.dataset.sport || '') === (filters.sport || ''));
    });

  document.querySelectorAll('#filter-metrics .mini-pill').forEach((el) => {
    const btn = el as HTMLElement;
    btn.classList.toggle('active', filters.metrics.has(btn.dataset.metric!));
  });

  const activeCount =
    (filters.date[0] ? 1 : 0) +
    (filters.date[1] ? 1 : 0) +
    (filters.dist[0] !== null ? 1 : 0) +
    (filters.dist[1] !== null ? 1 : 0) +
    (filters.dur[0] !== null ? 1 : 0) +
    (filters.dur[1] !== null ? 1 : 0) +
    filters.metrics.size +
    (filters.tags.length > 0 ? 1 : 0);

  const badge = document.querySelector('#btn-toggle-filters .btn-badge');
  if (badge) {
    badge.textContent = activeCount > 0 ? String(activeCount) : '';
    badge.classList.toggle('hidden', activeCount === 0);
  }
}

function updateSearchSortUI() {
  const searchInput = document.getElementById('track-search') as HTMLInputElement;
  if (searchInput) searchInput.value = searchQuery;
  document.getElementById('btn-regex-toggle')?.classList.toggle('active', searchRegex);

  const opt = SORT_OPTIONS.find((o) => o.val === currentSort);
  if (opt) {
    const labelEl = document.getElementById('sort-current-label');
    const iconEl = document.getElementById('sort-current-icon');
    if (labelEl)
      labelEl.textContent = opt.label
        .replace(' first', '')
        .replace(' distance', '')
        .replace(' duration', '');
    if (iconEl) iconEl.textContent = opt.icon;
  }
}

function applyState(urlState: AppState) {
  // Restore track
  const newTrackId = urlState.track;
  if (newTrackId !== selectedId) {
    if (newTrackId && tracks[newTrackId]) {
      selectTrack(newTrackId, true);
    } else if (!newTrackId && selectedId) {
      selectedId = null;
      ChartView.clear();
      renderDetails(null, []);
      renderInsights(null);
      renderTrackList();
      MapView.fitAll();
    }
  }

  // Restore basemap
  if (urlState.map && typeof urlState.map === 'string') {
    MapView.switchBasemap(urlState.map);
    document
      .querySelectorAll('.bm-btn')
      .forEach((b) =>
        b.classList.toggle('active', (b as HTMLElement).dataset.layer === urlState.map),
      );
  }

  // Restore map position
  if (urlState.map_pos) {
    const [lat, lng, zoom] = urlState.map_pos;
    MapView.setPosition(lat, lng, zoom);
  }

  // Restore tab
  if (urlState.tab) {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      const b = btn as HTMLElement;
      if (b.dataset.tab === urlState.tab) {
        if (!b.classList.contains('active')) b.click();
      }
    });
  }

  // Restore x-axis mode
  if (urlState.xaxis) ChartView.setXAxis(urlState.xaxis);

  const currentXAxis = urlState.xaxis || 'time';
  document
    .querySelectorAll('#x-axis-ctrl .seg-btn')
    .forEach((b) => b.classList.toggle('active', (b as HTMLElement).dataset.axis === currentXAxis));

  // Restore active metrics
  if (urlState.metrics) {
    const metrics = ChartView.METRICS;
    const keys = urlState.metrics
      .map((abbr) => Object.keys(metrics).find((k) => metrics[k].abbr === abbr))
      .filter((k): k is string => k !== undefined);
    if (keys.length) ChartView.setActiveMetrics(keys);
  }

  // Restore filters
  if (urlState.f_date)
    filters.date = urlState.f_date.map((v) => v || null) as [string | null, string | null];
  if (urlState.f_dist)
    filters.dist = urlState.f_dist.map((v) => (v === 0 ? 0 : v || null)) as [
      number | null,
      number | null,
    ];
  if (urlState.f_dur)
    filters.dur = urlState.f_dur.map((v) => (v === 0 ? 0 : v || null)) as [
      number | null,
      number | null,
    ];
  if (urlState.f_mets) filters.metrics = new Set(urlState.f_mets);
  if (urlState.f_tags) filters.tags = urlState.f_tags;

  updateFilterUI();

  if (urlState.q) searchQuery = urlState.q;
  if (urlState.re) searchRegex = urlState.re;
  if (urlState.sort) currentSort = urlState.sort;
  updateSearchSortUI();

  applyFilters();
}

function updateSportFilterOptions() {
  const container = document.getElementById('sport-filter-container');
  if (!container) return;

  const commonContainer = document.getElementById('common-sports');
  const dropdownContent = document.getElementById('sport-dropdown-content');
  if (!commonContainer || !dropdownContent) return;

  const sports = new Set<string>();
  Object.values(tracks).forEach((t) => {
    if (t.sport) sports.add(t.sport);
  });

  const sportsArray = Array.from(sports).sort();
  const burgerDropdown = document.getElementById('sport-burger-dropdown');

  commonContainer.innerHTML = '';
  dropdownContent.innerHTML = '';

  if (sportsArray.length <= 4) {
    if (burgerDropdown) burgerDropdown.style.display = 'none';

    sportsArray.forEach((sport) => {
      const btn = document.createElement('button');
      btn.className = `mini-pill${filters.sport === sport ? ' active' : ''}`;
      btn.dataset.sport = sport;
      btn.title = sport.charAt(0).toUpperCase() + sport.slice(1);
      btn.innerHTML = `<span class="material-symbols-rounded">${getSportIcon(sport)}</span>`;
      commonContainer.appendChild(btn);
    });
  } else {
    if (burgerDropdown) burgerDropdown.style.display = 'inline-block';

    const commonSports = ['running', 'cycling', 'walking'];

    commonSports.forEach((sport) => {
      if (sports.has(sport)) {
        const btn = document.createElement('button');
        btn.className = `mini-pill${filters.sport === sport ? ' active' : ''}`;
        btn.dataset.sport = sport;
        btn.title = sport.charAt(0).toUpperCase() + sport.slice(1);
        btn.innerHTML = `<span class="material-symbols-rounded">${getSportIcon(sport)}</span>`;
        commonContainer.appendChild(btn);
      }
    });

    sportsArray.forEach((sport) => {
      const item = document.createElement('div');
      item.className = `dropdown-item${filters.sport === sport ? ' active' : ''}`;
      item.dataset.sport = sport;
      item.style.padding = '8px';
      item.style.cursor = 'pointer';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '8px';
      item.innerHTML = `
        <span class="material-symbols-rounded">${getSportIcon(sport)}</span>
        <span>${sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
      `;
      dropdownContent.appendChild(item);
    });
  }
}

function renderTrackList() {
  updateSportFilterOptions();
  const list = document.getElementById('track-list');
  const emptyEl = document.getElementById('track-list-empty') as HTMLElement;
  const headerLabel = document.querySelector('.section-label');
  if (!list) return;

  const ids = Object.keys(tracks).filter((id) => !tracks[id]._filtered);
  if (headerLabel) headerLabel.textContent = `Tracks (${ids.length})`;

  if (!ids.length) {
    list.innerHTML = '';
    if (emptyEl) {
      list.appendChild(emptyEl);
      emptyEl.style.display = 'block';
    }
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  list.innerHTML = '';

  ids
    .sort((a, b) => {
      // Current selected always first
      if (a === selectedId) return -1;
      if (b === selectedId) return 1;

      const ta = tracks[a],
        tb = tracks[b];
      const sa = ta.stats,
        sb = tb.stats;

      let cmp = 0;
      switch (currentSort) {
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
    })
    .forEach((id) => {
      list.appendChild(buildTrackItem(tracks[id]));
    });
}

function getGlobalTags(): string[] {
  const all = new Set<string>();
  Object.values(tracks).forEach((t) => {
    (t.tags || []).forEach((tag) => all.add(tag));
  });
  return Array.from(all).sort();
}

function getSportIcon(sport: string | null): string {
  if (!sport) return 'category';
  const s = sport.toLowerCase();
  if (s.includes('run')) return 'directions_run';
  if (s.includes('cycl') || s.includes('bike')) return 'directions_bike';
  if (s.includes('walk')) return 'directions_walk';
  if (s.includes('swim')) return 'pool';
  if (s.includes('hik')) return 'hiking';
  return 'sports';
}

function buildTrackItem(track: TrackData) {
  const item = document.createElement('div');
  item.className = `track-item${track.id === selectedId ? ' selected' : ''}`;
  item.dataset.id = track.id;

  const date =
    track.points.length && track.points[0].time ? fmtDate(track.points[0].time) : 'Unknown date';

  const tagsHtml =
    (track.tags || []).length > 0
      ? `<div class="track-tags">${(track.tags || [])
          .map((t) => {
            const c = getTagColor(t);
            return `<span class="track-tag" style="border-color:${c}44; color:${c}">${escHtml(t)}</span>`;
          })
          .join('')}</div>`
      : '';

  item.innerHTML = `
    <div class="track-color" style="background:${track.color}"></div>
    <div class="track-info">
      <div class="track-name">${escHtml(track.displayName || track.name)}</div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
        <div class="track-meta">
          <span>${date}</span>
          <span><span style="display: inline-block; width: 25px; text-align: right;">${Math.round(track.stats.totalDist / 1000)}</span> km</span>
          ${track.sport ? `<span class="material-symbols-rounded sport-icon" title="${escHtml(track.sport)}">${getSportIcon(track.sport)}</span>` : ''}
          <span class="badge">${track.format.toUpperCase()}</span>
        </div>
        <button class="icon-btn mini toggle-vis" title="Toggle visibility">
          <span class="material-symbols-rounded">${track.visible ? 'visibility' : 'visibility_off'}</span>
        </button>
      </div>
      ${tagsHtml}
    </div>
  `;

  item.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.icon-btn')) return;
    selectTrack(track.id);
  });

  const btnVis = item.querySelector('.toggle-vis') as HTMLElement;
  btnVis.addEventListener('click', () => {
    track.visible = !track.visible;
    btnVis.querySelector('.material-symbols-rounded')!.textContent = track.visible
      ? 'visibility'
      : 'visibility_off';
    MapView.setTrackVisible(track.id, track.visible);
    Storage.save(track);
  });

  return item;
}

function showToast(msg: string, type: 'info' | 'error' = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  container.innerHTML = '';
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
}

function showSkippedImportsModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  let listHtml = '';
  skippedImports.forEach((s) => {
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
    skippedImports = [];
    close();
    const importWarning = document.getElementById('import-warning');
    if (importWarning) importWarning.classList.add('hidden');
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
}

function initDropZone() {
  const zone = document.getElementById('drop-zone');
  if (!zone) return;

  const importWarning = document.getElementById('import-warning');
  if (importWarning) {
    importWarning.addEventListener('click', (e) => {
      e.stopPropagation();
      showSkippedImportsModal();
    });
  }

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drop-active');
  });

  window.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null) zone.classList.remove('drop-active');
  });

  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('drop-active');

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
        let entries: FileSystemEntry[] = [];
        let chunk: FileSystemEntry[];
        do {
          chunk = await new Promise<FileSystemEntry[]>((res) => reader.readEntries(res));
          entries.push(...chunk);
        } while (chunk.length > 0);

        for (const child of entries) await readAllEntries(child);
      }
    }

    for (const entry of queue) await readAllEntries(entry);

    if (files.length) handleFiles(files);
  });
}

async function handleFiles(files: File[]) {
  if (!files.length) return;
  cancelProcessing = false;
  const initialSkipCount = skippedImports.length;

  const loader = document.getElementById('global-loader');
  const loaderText = document.getElementById('loader-text');
  const loaderSubtext = document.getElementById('loader-subtext');
  const progressBar = document.getElementById('loader-progress-bar') as HTMLElement;
  const loaderClose = document.getElementById('loader-close');

  if (loaderClose) {
    loaderClose.addEventListener('click', () => {
      cancelProcessing = true;
      if (loader) loader.classList.add('hidden');
    });
  }

  function updateLoaderIconToWarning() {
    const loaderIcon = document.querySelector('.loader-icon-wrap span') as HTMLElement;
    if (loaderIcon) {
      loaderIcon.textContent = 'warning';
      loaderIcon.style.color = '#f59e0b';
    }
    const warningCount = document.getElementById('loader-warning-count');
    if (warningCount) {
      const count = skippedImports.length - initialSkipCount;
      const countSpan = warningCount.querySelector('span');
      if (countSpan) countSpan.textContent = `${count}`;
      warningCount.style.display = 'flex';
    }
  }

  if (loader) {
    if (loaderText)
      loaderText.textContent = `Importing ${files.length} file${files.length > 1 ? 's' : ''}`;
    const loaderIcon = document.querySelector('.loader-icon-wrap span') as HTMLElement;
    if (loaderIcon) {
      loaderIcon.textContent = 'download';
      loaderIcon.style.color = 'var(--accent)';
    }
    const warningCount = document.getElementById('loader-warning-count');
    if (warningCount) {
      warningCount.style.display = 'none';
      const countSpan = warningCount.querySelector('span');
      if (countSpan) countSpan.textContent = '0';
    }
    if (loaderSubtext) loaderSubtext.textContent = '';
    if (progressBar) progressBar.style.width = '0%';
    loader.classList.remove('hidden');

    if (skippedImports.length > initialSkipCount) updateLoaderIconToWarning();
  }

  try {
    let count = 0;
    let firstId: string | null = null;
    let processedSinceLastUpdate = 0;

    // Filter out obviously invalid files early
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
      skippedImports.push({ name: f.name, reason: 'Unsupported file format' });
    });

    if (validFiles.length === 0) {
      if (files.length > 0) {
        showToast('No valid GPS files found', 'error');
        // Still update warning icon if there were invalid files!
        const importWarning = document.getElementById('import-warning');
        if (importWarning && skippedImports.length > 0) {
          importWarning.classList.remove('hidden');
          importWarning.title = `Skipped ${skippedImports.length} imports. Click to view details.`;
        }
      }
      return;
    }

    const loaderFilename = document.getElementById('loader-filename');
    let progressIdxEl: HTMLElement | null = null;
    if (loaderSubtext) {
      loaderSubtext.innerHTML =
        '<span class="progress-index"></span><span class="progress-total"></span>';
      progressIdxEl = loaderSubtext.querySelector('.progress-index') as HTMLElement | null;
      const totalEl = loaderSubtext.querySelector('.progress-total');
      if (totalEl) totalEl.textContent = validFiles.length.toString();
    }

    for (let i = 0; i < validFiles.length; i++) {
      if (cancelProcessing) break;
      const f = validFiles[i];
      if (loaderFilename) loaderFilename.textContent = f.name;
      if (progressIdxEl) progressIdxEl.textContent = (i + 1).toString();
      if (progressBar) progressBar.style.width = `${(i / validFiles.length) * 100}%`;

      try {
        const data = await Parsers.parseFile(f);

        // Duplicate checks
        const existingTracks = Object.values(tracks);

        // Rule 1: Same file and same size
        const sameFile = existingTracks.find((t) => t.fileName === f.name && t.fileSize === f.size);
        if (sameFile) {
          skippedImports.push({ name: f.name, reason: 'Same File' });
          updateLoaderIconToWarning();
          continue;
        }

        // Rule 2 & 3: Same start day checks
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

            // Rule 2: Fully contained
            if (newStart >= extStart && newEnd <= extEnd) {
              skippedImports.push({ name: f.name, reason: 'Fully contained in another track' });
              updateLoaderIconToWarning();
              discarded = true;
              break;
            }

            // Rule 3: Overlaps for > 10 mins
            const overlap = Math.min(newEnd, extEnd) - Math.max(newStart, extStart);
            if (overlap > 600000) {
              // 10 mins in ms
              skippedImports.push({
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
        if (tracks[id]) id += `-${shortRandom()}`;

        // Use filename as activity name if internal name is generic
        let trackName = data.name;
        if (trackName.startsWith('Unnamed') || trackName.startsWith('Fit Activity'))
          trackName = f.name;

        // Generate a nice display name
        let displayName = trackName;
        const t0 = data.points[0]?.time;
        const sport = data.sport
          ? data.sport.charAt(0).toUpperCase() + data.sport.slice(1)
          : 'Activity';
        if (t0) {
          const d = new Date(t0);
          displayName = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${sport}`;
        } else {
          displayName = trackName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '); // Remove extension and replace underscores
        }

        const track: TrackData = {
          ...data,
          id,
          name: trackName,
          displayName,
          fileName: f.name,
          fileSize: f.size,
          bounds: calculateBounds(data.points) || undefined,
          simplifiedPoints: simplifyTrack(data.points, 50), // 50m resolution
          addedAt: data.stats.startTime || fallbackTime,
          visible: true,
          color: TRACK_COLORS[colorIdx % TRACK_COLORS.length],
        };
        colorIdx++;
        if (cancelProcessing) break;

        await Storage.save(track);
        tracks[id] = track;
        MapView.addTrack(track);
        if (!firstId) firstId = id;
        count++;
        processedSinceLastUpdate++;

        if (processedSinceLastUpdate >= 5) {
          processedSinceLastUpdate = 0;
        }
      } catch (err) {
        skippedImports.push({
          name: f.name,
          reason: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
        });
        updateLoaderIconToWarning();
      }
    }

    // Update warning icon
    const importWarning = document.getElementById('import-warning');
    if (importWarning) {
      if (skippedImports.length > 0) {
        importWarning.classList.remove('hidden');
        importWarning.title = `Skipped ${skippedImports.length} imports. Click to view details.`;
      } else {
        importWarning.classList.add('hidden');
      }
    }

    const newWarnings = skippedImports.length > initialSkipCount;
    if (!newWarnings && loader) {
      loader.classList.add('hidden');
    }

    if (count > 0) {
      showToast(`Imported ${count} track${count > 1 ? 's' : ''}`);
      applyFilters(!!firstId && firstId !== selectedId);
      if (firstId) selectTrack(firstId);
    }

    if (newWarnings) {
      const loaderIcon = document.querySelector('.loader-icon-wrap span');
      if (loaderIcon) loaderIcon.textContent = 'warning';
      // Delay hiding loader to let user see the alert icon
      await new Promise((r) => setTimeout(r, 1500));
    }
  } finally {
    if (loader) loader.classList.add('hidden');
  }
}

function initMetricPillDraggable() {
  const container = document.getElementById('metric-pills');
  if (!container) return;

  let draggedEl: HTMLElement | null = null;

  container.addEventListener('dragstart', (e) => {
    const target = (e.target as HTMLElement).closest('.metric-pill') as HTMLElement;
    if (!target) return;
    draggedEl = target;
    e.dataTransfer!.effectAllowed = 'move';
    target.classList.add('dragging-pill');
    // For transparent background in ghost image
    setTimeout(() => (target.style.opacity = '0.4'), 0);
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    const target = (e.target as HTMLElement).closest('.metric-pill') as HTMLElement;
    if (target && target !== draggedEl) {
      const rect = target.getBoundingClientRect();
      const next = e.clientX - rect.left > rect.width / 2;
      container.insertBefore(draggedEl!, next ? target.nextSibling : target);
    }
  });

  container.addEventListener('dragend', () => {
    if (!draggedEl) return;
    draggedEl.classList.remove('dragging-pill');
    draggedEl.style.opacity = '';
    draggedEl = null;

    // Update Chart order
    const keys = Array.from(container.querySelectorAll('.metric-pill')).map(
      (el) => (el as HTMLElement).dataset.metric!,
    );
    ChartView.updateMetricOrder(keys);
    syncMetricsToUrl();
  });
}

function updateToolbarLayout() {
  const toolbar = document.getElementById('chart-toolbar');
  const pills = document.getElementById('metric-pills');
  if (!toolbar || !pills) return;

  toolbar.classList.remove('collapsed');
  const availableW = Math.max(0, toolbar.clientWidth - 280);
  let totalW = 0;
  let hidden = false;

  Array.from(pills.children).forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.id === 'pill-overflow') return;

    htmlEl.classList.remove('overflow-hidden');
    if (!htmlEl.classList.contains('active')) return;
    const metricKey = htmlEl.dataset.metric || '';
    const deterministicPillWidth = 36 + metricKey.length * 6;
    totalW += deterministicPillWidth + 6;

    if (totalW > availableW) {
      hidden = true;
      htmlEl.classList.add('overflow-hidden');
    }
  });

  const overflowEl = document.getElementById('pill-overflow');
  if (overflowEl) overflowEl.classList.toggle('hidden', !hidden);

  if (hidden) toolbar.classList.add('collapsed');
}

document.addEventListener('DOMContentLoaded', init);
