// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import uPlot from 'uplot';
import { TrackPoint, TrackStats, TrackData } from './parsers';
import { gaussianSmooth, fmtSecs, hexToRgba, fmtPace } from './utils';
import { Zones } from './zones';
import { METRICS, MetricDefinition } from './metrics';
import { UrlState } from './url-state';
import { SPORTS } from './sports';

// Augment uPlot to include our custom property

interface WegPlot extends uPlot {
  _strasse?: {
    selFill: HTMLElement;
    anchorLine: HTMLElement;
    anchorLabel: HTMLElement;
    anchorHandle: HTMLElement;
    anchorMarker: HTMLElement;
    endLine: HTMLElement;
    endLabel: HTMLElement;
    endHandle: HTMLElement;
    endMarker: HTMLElement;
    curYVal: HTMLElement;
    updateHeaderStats: (min: number, max: number) => void;
  };
}

interface PlotData {
  uplot: WegPlot;
  row: HTMLDivElement;
  xData: number[];
  yData: (number | null)[];
  def: MetricDefinition;
  metricKey: string;
  statsTotalEl: HTMLDivElement;
  statsSelEl: HTMLDivElement;
  histCol: HTMLDivElement;
  histCanvas: HTMLCanvasElement;
  histData: HistData;
  hoveredHistY: number | null;
  pinnedHistY: number | null;
  smoothed?: boolean;
  incZero?: boolean;
  w?: number;
}

interface HistData {
  yData: (number | null)[];
  xData: number[];
  def: MetricDefinition;
  BINS: number;
  plot?: PlotData;
  bins?: number[];
  binAccum?: number[];
  min?: number;
  max?: number;
  padL?: number;
  selBins?: number[] | null;
  selBinAccum?: number[] | null;
  _lastYData?: any;
  _lastSelRange?: [number, number] | null;
  fullStats?: { min: number; max: number; avg: number } | null;
  fullStatsAll?: { min: number; max: number; avg: number } | null;
}

export const ChartView = (() => {
  let plots: PlotData[] = [];
  let renderedTrack: TrackData | null = null;
  let renderedXAxis: string = 'time';
  let renderedSpeedMode: string = 'speed';
  let renderedMapColorMetric: string | null = null;
  let syncKey: {
    key: string;
    sub: (u: uPlot) => void;
    unsub: (u: uPlot) => void;
    pub: (type: string, u: uPlot, x: number, y: number, w: number, h: number, i: number) => void;
  } | null = null;
  let scaleSyncing: boolean = false;
  let cursorSyncing: boolean = false;
  let activeMetrics: Set<string> = new Set(['elevation']);
  let availableMetrics: Set<string> = new Set();
  let smoothedMetrics: Set<string> = new Set(['speed', 'gradient', 'vam', 'temperature']);
  let metricsIncludingZero: Set<string> = new Set(['power']);
  let xAxis: string = 'time';
  let currentTrack: TrackData | null = null;
  let allTracks: TrackData[] = [];

  // Selection / anchor
  let selAnchorVal: number | null = null; // x-value at drag-start / zoom left edge
  let selEndVal: number | null = null; // x-value at zoom right edge
  let isDragging: boolean = false;
  let updatingRange: boolean = false; // guard against setScale hook re-entry during handle drag
  let pinnedPtIdx: number | null = null; // point index pinned by map click
  let lastMouseXVal: number | null = null; // last hovered x-value for keyboard zoom center
  let lastHistMouseEvent: MouseEvent | null = null;
  let hoveredHistData: HistData | null = null;
  let hoveredHistCanvas: HTMLCanvasElement | null = null;

  let currentXRange: [number, number] | null = null; // [min, max] currently rendered
  let targetXRange: [number, number] | null = null; // [min, max] for smooth keyboard animation
  let animId: number | null = null;

  // Callbacks
  let onCursorMoveCb: ((pt: TrackPoint | null) => void) | null = null;
  let onRangeChangeCb: ((min: number | null, max: number | null, axis: string) => void) | null =
    null;
  let onClickCb: ((pt: TrackPoint, idx: number) => void) | null = null;
  let onPinChangeCb: ((idx: number | null) => void) | null = null;

  const HIST_W: number = 130;
  const ROW_BODY_PADDING: number = 28; // 14px left + 14px right
  const HIST_GAP: number = 20; // margin-left on .hist-col
  let statsVisible: boolean = true;
  let histTooltipEl: HTMLElement | null = null;
  let container: HTMLElement | null = null;
  let emptyEl: HTMLElement | null = null;
  let selStatsEl: HTMLElement | null = null;
  let resetSelBtn: HTMLElement | null = null;
  let mapColorMetric: string | null = null;
  let onMapColorChangeCb: ((data: { pts: TrackPoint[]; colors: string[] } | null) => void) | null =
    null;

  // ── Init ──────────────────────────────────────────────────────
  function init(
    onCursorMove: (pt: TrackPoint | null) => void,
    onRangeChange: (min: number | null, max: number | null, axis: string) => void,
    onClick: (pt: TrackPoint, idx: number) => void,
    onPinChange: (idx: number | null) => void,
  ) {
    onCursorMoveCb = onCursorMove;
    onRangeChangeCb = onRangeChange;
    onClickCb = onClick;
    onPinChangeCb = onPinChange;
    container = document.getElementById('charts-container');
    container?.addEventListener('scroll', () => {
      if (lastHistMouseEvent && hoveredHistCanvas && hoveredHistData)
        updateHistTooltip(lastHistMouseEvent, hoveredHistCanvas, hoveredHistData);
    });
    emptyEl = document.getElementById('chart-empty');
    selStatsEl = document.getElementById('chart-stats-sel');
    resetSelBtn = document.getElementById('btn-reset-selection');
    histTooltipEl = document.getElementById('hist-tooltip');
    syncKey = uPlot.sync('strasse-sync');

    document.getElementById('sel-cancel-btn')?.addEventListener('click', cancelSelection);
    resetSelBtn?.classList.add('hidden');

    // ── WASD Keyboard Navigation ──
    const navKeys = new Set(['w', 'a', 's', 'd']);
    const activeNavKeys = new Set<string>();

    document.addEventListener('keydown', (e) => {
      if (!plots.length || !currentTrack) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) return;

      const key = e.key.toLowerCase();
      if (!navKeys.has(key)) return;

      e.preventDefault();
      activeNavKeys.add(key);

      const u = plots[0].uplot;
      if (!targetXRange) targetXRange = [u.scales.x!.min!, u.scales.x!.max!];

      let [min, max] = targetXRange;
      const span = max - min;
      const moveStep = span * 0.1;
      const zoomFactor = 0.15;

      let newMin = min,
        newMax = max;

      if (key === 'a') {
        // Pan left
        newMin = min - moveStep;
        newMax = max - moveStep;
      } else if (key === 'd') {
        // Pan right
        newMin = min + moveStep;
        newMax = max + moveStep;
      } else if (key === 'w' || key === 's') {
        // Zoom
        const center = lastMouseXVal !== null ? lastMouseXVal : (min + max) / 2;
        const factor = key === 'w' ? 1 - zoomFactor : 1 + zoomFactor * 1.2;
        newMin = center - (center - min) * factor;
        newMax = center + (max - center) * factor;
      }

      // Clamp to track bounds
      const xFull = [plots[0].xData[0]!, plots[0].xData[plots[0].xData.length - 1]!];
      if (newMin < xFull[0]) {
        const d = xFull[0] - newMin;
        newMin += d;
        newMax += d;
      }
      if (newMax > xFull[1]) {
        const d = newMax - xFull[1];
        newMin -= d;
        newMax -= d;
      }
      newMin = Math.max(xFull[0], newMin);
      newMax = Math.min(xFull[1], newMax);

      if (newMax - newMin > 0.001) {
        targetXRange = [newMin, newMax];
        setVisibleRange(newMin, newMax, true); // true = animate
      }
    });

    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (navKeys.has(key)) activeNavKeys.delete(key);
    });
  }

  function setVisibleRange(min: number, max: number, animate = false) {
    if (!plots.length) return;
    if (!animate) {
      plots.forEach(({ uplot: u }) => u.setScale('x', { min, max }));
      return;
    }

    const startMin = (currentXRange ? currentXRange[0] : plots[0].uplot.scales.x!.min) as number;
    const startMax = (currentXRange ? currentXRange[1] : plots[0].uplot.scales.x!.max) as number;

    if (animId) cancelAnimationFrame(animId);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const factor = 0.25; // Smoothing factor

    const step = () => {
      if (!targetXRange) return;
      const [tMin, tMax] = targetXRange;

      const cMin = lerp(currentXRange![0], tMin, factor);
      const cMax = lerp(currentXRange![1], tMax, factor);

      plots.forEach(({ uplot: u }) => {
        u.setScale('x', { min: cMin, max: cMax });
      });

      if (Math.abs(cMin - tMin) > 0.0001 || Math.abs(cMax - tMax) > 0.0001)
        animId = requestAnimationFrame(step);
      else animId = null;
    };
    animId = requestAnimationFrame(step);
  }

  // ── Public API ────────────────────────────────────────────────
  function loadTrack(track: TrackData, others: TrackData[] = [], deferRender = false) {
    pinnedPtIdx = null;
    selAnchorVal = null;
    selEndVal = null;
    allTracks = others;

    // Detect which metrics are available in this file
    availableMetrics = new Set(
      Object.entries(METRICS)
        .filter(([, def]) => track.points.some((p) => p[def.field] != null))
        .map(([key]) => key),
    );

    // If no metrics are active (e.g. first load), default to core overview metrics
    if (activeMetrics.size === 0) {
      activeMetrics = new Set(['elevation'].filter((m) => availableMetrics.has(m)));
    }

    // Sync the pill buttons in the toolbar
    document.querySelectorAll('.metric-pill').forEach((el) => {
      const pill = el as HTMLElement;
      const metric = pill.dataset.metric!;
      const isAvailable = availableMetrics.has(metric);
      pill.classList.toggle('active', isAvailable && activeMetrics.has(metric));
      pill.classList.toggle('disabled', !isAvailable);
    });

    currentTrack = track;
    if (deferRender) {
      updateStats(track);
    } else {
      render();
    }
  }

  function clear() {
    pinnedPtIdx = null;
    selAnchorVal = null;
    selEndVal = null;
    currentTrack = null;
    destroyPlots();
    if (emptyEl) {
      emptyEl.style.display = 'flex';
      emptyEl.innerHTML = `
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track to view analysis</div>
      `;
    }
    const chartStats = document.getElementById('chart-stats');
    if (chartStats) chartStats.classList.add('hidden');
    clearSelectionStats();
    mapColorMetric = null;
    if (onMapColorChangeCb) onMapColorChangeCb(null);
  }

  function resetState() {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    activeMetrics = new Set(['elevation']);
    availableMetrics = new Set();
    smoothedMetrics = new Set(['speed', 'gradient', 'vam', 'temperature']);
    metricsIncludingZero = new Set(['power']);
    xAxis = 'time';
    allTracks = [];
    currentXRange = null;
    targetXRange = null;
    lastMouseXVal = null;
    lastHistMouseEvent = null;
    hoveredHistData = null;
    hoveredHistCanvas = null;
    statsVisible = true;
    clear();
    document.querySelectorAll('#metric-pills .metric-pill').forEach((el) => {
      const pill = el as HTMLElement;
      pill.classList.toggle('active', activeMetrics.has(pill.dataset.metric!));
      pill.classList.remove('disabled', 'overflow-hidden');
    });
    const overflowEl = document.getElementById('pill-overflow');
    if (overflowEl) overflowEl.classList.add('hidden');
    const toolbar = document.getElementById('chart-toolbar');
    if (toolbar) toolbar.classList.remove('collapsed');
    document.querySelectorAll('#x-axis-ctrl .seg-btn').forEach((b) => {
      b.classList.toggle('active', (b as HTMLElement).dataset.axis === 'time');
    });
  }

  function toggleMetric(key: string) {
    if (activeMetrics.has(key)) activeMetrics.delete(key);
    else activeMetrics.add(key);
    if (currentTrack) render(true);
  }

  function setActiveMetrics(keys: string[]) {
    activeMetrics = new Set(keys);
    if (currentTrack) render(true);
    // Sync the pill buttons
    document.querySelectorAll('.metric-pill').forEach((el) => {
      const pill = el as HTMLElement;
      pill.classList.toggle('active', activeMetrics.has(pill.dataset.metric!));
    });
  }

  function setXAxis(axis: string) {
    if (xAxis === axis || !currentTrack) {
      xAxis = axis;
      return;
    }

    const pts = currentTrack.points;
    const t0 = pts.find((p) => p.time != null)?.time || 0;

    // Helper to convert a value from OLD axis to NEW axis
    const convert = (val: number | null) => {
      if (val === null) return null;
      // We need to find the point index closest to 'val' on the OLD axis
      let idx = 0;
      if (xAxis === 'distance') {
        const dTarget = val * 1000;
        idx = pts.findIndex((p) => (p.dist || 0) >= dTarget);
      } else {
        const tTarget = t0 + val * 1000;
        idx = pts.findIndex((p) => (p.time || 0) >= tTarget);
      }
      if (idx === -1) idx = pts.length - 1;

      // Now get the value at this index on the NEW axis
      if (axis === 'distance') return (pts[idx].dist || 0) / 1000;
      else return ((pts[idx].time || t0) - t0) / 1000;
    };

    // Convert selection
    if (selAnchorVal !== null) selAnchorVal = convert(selAnchorVal);
    if (selEndVal !== null) selEndVal = convert(selEndVal);

    // Convert zoom range (from first plot)
    let newRange: [number, number] | null = null;
    if (plots.length) {
      const u = plots[0].uplot;
      const r0 = convert(u.scales.x!.min!);
      const r1 = convert(u.scales.x!.max!);
      if (r0 !== null && r1 !== null) newRange = [r0, r1];
    }

    xAxis = axis;
    render(true);

    // Apply converted zoom
    if (newRange) {
      scaleSyncing = true;
      plots.forEach(({ uplot: u }) => {
        u.batch(() => u.setScale('x', { min: newRange![0], max: newRange![1] }));
      });
      scaleSyncing = false;
    }
  }

  function toggleStats() {
    statsVisible = !statsVisible;
    plots.forEach(({ histCol }) => histCol.classList.toggle('visible', statsVisible));
    resize();
  }

  function setMapColorChangeCb(cb: (data: { pts: TrackPoint[]; colors: string[] } | null) => void) {
    onMapColorChangeCb = cb;
  }

  function toggleMapColor(key: string | null) {
    if (mapColorMetric === key || key === null) {
      mapColorMetric = null;
      _updateMapColorBtns();
      if (onMapColorChangeCb) onMapColorChangeCb(null);
    } else {
      mapColorMetric = key;
      _updateMapColorBtns();
      _fireMapColorCb();
    }
    // Re-render to show/hide colored fills on the graphs
    if (currentTrack) render(true);
  }

  function _updateMapColorBtns() {
    document.querySelectorAll('.map-color-btn').forEach((el) => {
      const b = el as HTMLElement;
      b.classList.toggle('active', b.dataset.metric === mapColorMetric);
    });
  }

  function _fireMapColorCb() {
    if (!onMapColorChangeCb || !mapColorMetric || !currentTrack) return;
    const plot = plots.find((p) => p.metricKey === mapColorMetric);
    if (!plot) return;
    const colors = _computePointColors(mapColorMetric, plot.yData);
    onMapColorChangeCb({ pts: currentTrack.points, colors });
  }

  function _computePointColors(key: string, yData: (number | null)[]): string[] {
    const vals = yData.filter((v): v is number => v != null && isFinite(v));
    if (!vals.length) return yData.map(() => '#888896');
    const min = Math.min(...vals),
      max = Math.max(...vals);

    const sport = currentTrack?.sport;
    const sportDef = sport ? SPORTS[sport.toLowerCase()] : null;
    const defaultMode = sportDef?.defaultPreset || 'speed';
    const urlState = UrlState.get();
    const speedMode = (urlState as any).speed_mode || defaultMode;
    const paceUnit = sportDef?.paceUnit || 'km';

    return yData.map((v) => {
      if (v == null || !isFinite(v)) return '#888896';
      if (key === 'gradient') return gradientColor(v);
      if (key === 'speed') {
        if (speedMode === 'pace') {
          const speed = (paceUnit === 'km' ? 1000 : 100) / v;
          return speedColor(speed);
        }
        return speedColor(v);
      }
      const t = max === min ? 0.5 : Math.max(0, Math.min(1, (v - min) / (max - min)));
      if (t <= 0.25) return lerpHex('#4575b4', '#91bfdb', t / 0.25);
      if (t <= 0.5) return lerpHex('#91bfdb', '#fee090', (t - 0.25) / 0.25);
      if (t <= 0.75) return lerpHex('#fee090', '#fc8d59', (t - 0.5) / 0.25);
      return lerpHex('#fc8d59', '#d73027', (t - 0.75) / 0.25);
    });
  }

  function resetZoom() {
    cancelSelection();
  }

  function cancelSelection() {
    selAnchorVal = null;
    selEndVal = null;
    pinnedPtIdx = null;
    if (onPinChangeCb) onPinChangeCb(null);

    // Reset individual histogram pins
    plots.forEach((p) => {
      p.pinnedHistY = null;
    });

    updateSelOverlay();
    redrawHistograms();

    // Perform the actual zoom reset
    scaleSyncing = true;
    plots.forEach(({ uplot: u, xData }) => {
      u.batch(() => u.setScale('x', { min: xData[0]!, max: xData[xData.length - 1]! }));
      u._strasse?.updateHeaderStats(xData[0]!, xData[xData.length - 1]!);
    });
    scaleSyncing = false;

    if (onRangeChangeCb) onRangeChangeCb(null, null, xAxis);
  }

  function setSelectionStats(stats: TrackStats) {
    if (!selStatsEl) return;
    const fmt = (id: string, val: string) => {
      const el = document.querySelector(`#${id} .stat-value`);
      if (el) el.textContent = val;
    };
    fmt(
      'sel-distance',
      stats.totalDist != null ? `${(stats.totalDist / 1000).toFixed(1)} km` : '—',
    );
    fmt('sel-duration', stats.duration != null ? fmtSecs(Math.floor(stats.duration / 1000)) : '—');
    fmt('sel-elevation', stats.elevGain != null ? `${Math.round(stats.elevGain)} m` : '—');
    fmt(
      'sel-avg-speed',
      stats.avgSpeed != null ? `${(stats.avgSpeed * 3.6).toFixed(1)} km/h` : '—',
    );
    fmt('sel-avg-power', stats.avgPower != null ? `${stats.avgPower} W` : '—');
    fmt('sel-avg-hr', stats.avgHR != null ? `${stats.avgHR} bpm` : '—');
    fmt('sel-avg-temp', stats.avgTemp != null ? `${stats.avgTemp.toFixed(1)} °C` : '—');
    selStatsEl.classList.remove('hidden');
    if (resetSelBtn) resetSelBtn.classList.remove('hidden');
  }

  function clearSelectionStats() {
    if (selStatsEl) selStatsEl.classList.add('hidden');
    if (resetSelBtn) resetSelBtn.classList.add('hidden');
    [
      'sel-distance',
      'sel-duration',
      'sel-elevation',
      'sel-avg-speed',
      'sel-avg-power',
      'sel-avg-hr',
      'sel-avg-temp',
    ].forEach((id) => {
      const el = document.querySelector(`#${id} .stat-value`);
      if (el) el.textContent = '--';
    });
  }

  // Called on boot to restore a saved selection without re-firing onRangeChangeCb
  // xMin/xMax are ALWAYS provided in Time (seconds from start)
  function restoreSelection(tMin: number, tMax: number, deferRender = false) {
    if (!currentTrack) return;
    const pts = currentTrack.points;
    const t0 = pts.find((p) => p.time != null)?.time || 0;
    const totalDuration = ((pts[pts.length - 1]?.time || 0) - t0) / 1000;

    // If values look like absolute timestamps in ms, convert to seconds from start
    if (tMin > 1e12) tMin = (tMin - t0) / 1000;
    if (tMax > 1e12) tMax = (tMax - t0) / 1000;

    // Crop to max limits of the track
    tMin = Math.max(0, Math.min(tMin, totalDuration));
    tMax = Math.max(0, Math.min(tMax, totalDuration));

    const convert = (tOffset: number) => {
      if (xAxis === 'time') return tOffset;
      const tTarget = t0 + tOffset * 1000;
      let idx = pts.findIndex((p) => (p.time || 0) >= tTarget);
      if (idx === -1) idx = pts.length - 1;
      return (pts[idx].dist || 0) / 1000;
    };

    const xMin = convert(tMin);
    const xMax = convert(tMax);

    selAnchorVal = xMin;
    selEndVal = xMax;
    currentXRange = [xMin, xMax];
    if (deferRender) return;
    scaleSyncing = true; // suppress the setScale → onRangeChangeCb loop
    plots.forEach(({ uplot: u }) => {
      u.batch(() => u.setScale('x', { min: xMin, max: xMax }));
    });
    scaleSyncing = false;
    updateAnchorLines();
    redrawHistograms();
  }

  function resize() {
    if (!plots.length || !container) return;
    const w = Math.round(
      Math.max(
        100,
        container.getBoundingClientRect().width -
          ROW_BODY_PADDING -
          (statsVisible ? HIST_W + HIST_GAP : 0),
      ),
    );
    let anyResized = false;
    plots.forEach(({ uplot: u, histCanvas, histData }) => {
      if (w !== u.width) {
        u.setSize({ width: w, height: u.height });
        anyResized = true;
        if (statsVisible && histCanvas && histData) drawHistogram(histCanvas, histData, u.height);
      }
    });
    if (anyResized) updateSelOverlay();
  }

  // ── Render ────────────────────────────────────────────────────
  function render(keepState = false) {
    let savedRange: [number, number] | null = null;
    let savedScroll = 0;
    if (keepState && container) savedScroll = container.scrollTop;

    if (keepState && currentXRange) {
      savedRange = [currentXRange[0], currentXRange[1]];
    } else if (keepState && plots.length) {
      const u = plots[0].uplot;
      savedRange = [u.scales.x!.min!, u.scales.x!.max!];
    }

    if (!currentTrack) {
      destroyPlots(keepState);
      return;
    }
    const pts = currentTrack.points;
    if (!pts.length) {
      destroyPlots(keepState);
      return;
    }

    const sport = currentTrack?.sport;
    const sportDef = sport ? SPORTS[sport.toLowerCase()] : null;
    const defaultMode = sportDef?.defaultPreset || 'speed';
    const urlState = UrlState.get();
    const speedMode = (urlState as any).speed_mode || defaultMode;
    const paceUnit = sportDef?.paceUnit || 'km';

    const available = [...activeMetrics].filter((m) =>
      pts.some((p) => p[METRICS[m].field] != null),
    );
    if (!available.length) {
      destroyPlots(keepState);
      if (emptyEl) {
        emptyEl.style.display = 'flex';
        emptyEl.innerHTML = `
          <span class="material-symbols-rounded empty-icon">no_sim</span>
          <div class="empty-text">No data for selected metrics</div>
        `;
      }
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    const containerW = container ? container.getBoundingClientRect().width : 800;
    const w = Math.round(
      Math.max(100, containerW - ROW_BODY_PADDING - (statsVisible ? HIST_W + HIST_GAP : 0)),
    );

    const canReuse =
      keepState &&
      renderedTrack === currentTrack &&
      renderedXAxis === xAxis &&
      renderedSpeedMode === speedMode &&
      renderedMapColorMetric === mapColorMetric &&
      plots.length > 0;

    let xData: (number | null)[];
    if (canReuse) {
      xData = plots[0].xData;
    } else if (xAxis === 'distance') {
      xData = pts.map((p) => (p.dist || 0) / 1000);
    } else {
      const t0 = pts.find((p) => p.time != null)?.time || 0;
      let lastValidX = 0;
      xData = pts.map((p) => {
        if (p.time != null) {
          lastValidX = (p.time - t0) / 1000;
          return lastValidX;
        }
        return lastValidX; // monotonic fallback
      });
    }

    const existingByKey = new Map<string, PlotData>();
    if (canReuse) {
      if (histTooltipEl) histTooltipEl.style.display = 'none';
      const availSet = new Set(available);
      for (const p of plots) {
        const isSmoothed = smoothedMetrics.has(p.metricKey);
        const isIncZero = metricsIncludingZero.has(p.metricKey);
        if (
          availSet.has(p.metricKey) &&
          p.smoothed === isSmoothed &&
          p.incZero === isIncZero &&
          p.w === w
        ) {
          existingByKey.set(p.metricKey, p);
        } else {
          syncKey!.unsub(p.uplot);
          p.uplot.destroy();
          p.row.remove();
        }
      }
      plots = [];
    } else {
      destroyPlots(keepState);
    }

    if (container) {
      const nextSiblingRows: (HTMLElement | null)[] = new Array(available.length).fill(null);
      let nextExisting: HTMLElement | null = null;
      for (let i = available.length - 1; i >= 0; i--) {
        nextSiblingRows[i] = nextExisting;
        const ex = existingByKey.get(available[i]);
        if (ex) nextExisting = ex.row;
      }

      available.forEach((key, idx) => {
        const reused = existingByKey.get(key);
        if (reused) {
          plots.push(reused);
          const uplot = reused.uplot;
          const s = (uplot as any)._strasse;
          const prevSync = scaleSyncing;
          scaleSyncing = true;
          uplot.batch(() => {
            if (
              savedRange &&
              (uplot.scales.x!.min !== savedRange[0] || uplot.scales.x!.max !== savedRange[1])
            ) {
              uplot.setScale('x', { min: savedRange[0], max: savedRange[1] });
            } else {
              s?.updateHeaderStats(uplot.scales.x!.min!, uplot.scales.x!.max!, uplot);
              uplot.redraw(false);
            }
          });
          scaleSyncing = prevSync;

          let initHoverBinI: number | null = null;
          if (
            pinnedPtIdx != null &&
            reused.xData[pinnedPtIdx] != null &&
            reused.yData[pinnedPtIdx] != null
          ) {
            buildHistBins(reused.histData);
            if (reused.histData.min != null && reused.histData.max != null) {
              const span = reused.histData.max - reused.histData.min || 1;
              initHoverBinI = Math.min(
                reused.histData.BINS - 1,
                Math.floor(
                  ((reused.yData[pinnedPtIdx]! - reused.histData.min) / span) *
                    reused.histData.BINS,
                ),
              );
              reused.hoveredHistY = reused.yData[pinnedPtIdx];
            }
          }
          drawHistogram(reused.histCanvas, reused.histData, 130, initHoverBinI);
          return;
        }

        let def = METRICS[key];

        let transform = def.transform;
        let fmt = def.fmt;
        let fmtAxis = def.fmtAxis;
        let unit = def.unit;
        let label = def.label;

        if (key === 'speed' && speedMode === 'pace') {
          label = 'Pace';
          unit = `min/${paceUnit}`;
          fmt = (v) => fmtPace(v);
          fmtAxis = (v) => fmtPace(v);
          transform = (v) => {
            if (v == null || v < 0.1) return null;
            return (paceUnit === 'km' ? 1000 : 100) / v;
          };

          def = { ...def, label, unit, fmt, fmtAxis, transform };
        }

        let yData = def.compute
          ? def.compute(pts, fillNulls)
          : fillNulls(
              pts.map((p) => {
                const v = p[def.field] as number;
                return v != null && transform ? transform(v) : v;
              }),
            );

        if (smoothedMetrics.has(key)) yData = gaussianSmooth(yData, def.smoothSigma || 2);

        createChart(key, def, xData, yData, w, pts, savedRange, nextSiblingRows[idx]);
      });
    }

    renderedTrack = currentTrack;
    renderedXAxis = xAxis;
    renderedSpeedMode = speedMode;
    renderedMapColorMetric = mapColorMetric;

    updateStats(currentTrack);
    // Restore anchor/end lines if a selection was active
    if (selAnchorVal != null && selEndVal != null) updateAnchorLines();
    // Re-apply map color if active
    _updateMapColorBtns();
    if (mapColorMetric) _fireMapColorCb();

    if (keepState && container && savedScroll > 0) container.scrollTop = savedScroll;
  }

  // ── Create one chart row ───────────────────────────────────────
  function createChart(
    metricKey: string,
    def: MetricDefinition,
    xData: (number | null)[],
    yData: (number | null)[],
    w: number,
    pts: TrackPoint[],
    initialRange: [number, number] | null = null,
    insertBeforeEl: HTMLElement | null = null,
  ) {
    const sport = currentTrack?.sport;
    const sportDef = sport ? SPORTS[sport.toLowerCase()] : null;
    const defaultMode = sportDef?.defaultPreset || 'speed';
    const urlState = UrlState.get();
    const speedMode = (urlState as any).speed_mode || defaultMode;

    // Gradient data: smooth over a 20 m distance window (±10 m each side)
    const gradData = metricKey === 'elevation' ? smoothGradient(pts, 20) : null;
    const row = document.createElement('div');
    row.className = 'chart-row';
    row.dataset.metric = metricKey;
    row.style.setProperty('--chart-color', def.color);

    // Header
    const header = document.createElement('div');
    header.className = `chart-row-header${statsVisible ? ' with-histogram' : ''}`;

    const labelEl = document.createElement('div');
    labelEl.className = 'chart-row-label-group';
    labelEl.innerHTML = `
      <span class="material-symbols-rounded chart-row-icon" style="--chart-color:${def.color}">${def.icon}</span>
      <span class="chart-row-label">${def.label}</span>
    `;

    // Smoothing toggle
    const smoothBtn = document.createElement('button');
    smoothBtn.className = `icon-btn mini smooth-btn${smoothedMetrics.has(metricKey) ? ' active' : ''}`;
    smoothBtn.title = 'Toggle data smoothing';
    smoothBtn.innerHTML = `<span class="material-symbols-rounded">${smoothedMetrics.has(metricKey) ? 'blur_on' : 'blur_off'}</span>`;
    smoothBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (smoothedMetrics.has(metricKey)) smoothedMetrics.delete(metricKey);
      else smoothedMetrics.add(metricKey);

      render(true); // Re-render all charts to keep sync if needed (though only this one changes data)
    });

    const mapColorBtn = document.createElement('button');

    mapColorBtn.className = `map-color-btn icon-btn${mapColorMetric === metricKey ? ' active' : ''}`;
    mapColorBtn.dataset.metric = metricKey;
    mapColorBtn.title = 'Color map track by this metric';
    mapColorBtn.innerHTML = '<span class="material-symbols-rounded">colorize</span>';
    mapColorBtn.addEventListener('click', () => toggleMapColor(metricKey));

    // Zero-filter toggle (Cadence/Power/Speed)
    let zeroBtn: HTMLButtonElement | null = null;
    if (metricKey === 'cadence' || metricKey === 'power' || metricKey === 'speed') {
      zeroBtn = document.createElement('button');
      const incZero = metricsIncludingZero.has(metricKey);
      zeroBtn.className = `icon-btn mini${incZero ? ' active' : ''}`;
      zeroBtn.title = incZero ? 'Currently INCLUDING 0 values' : 'Currently EXCLUDING 0 values';
      zeroBtn.innerHTML = `<span class="material-symbols-rounded">${incZero ? 'exposure_zero' : 'mobile_off'}</span>`;
      zeroBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (metricsIncludingZero.has(metricKey)) metricsIncludingZero.delete(metricKey);
        else metricsIncludingZero.add(metricKey);
        render(true);
      });
    }

    const statsTotalEl = document.createElement('div');
    statsTotalEl.className = 'chart-stats-total';

    const statsSelEl = document.createElement('div');
    statsSelEl.className = 'chart-stats-selection';

    const statsContainer = document.createElement('div');
    statsContainer.className = 'chart-row-stats-container';
    statsContainer.append(statsTotalEl, statsSelEl);

    const actionsEl = document.createElement('div');
    actionsEl.className = 'chart-row-actions';
    actionsEl.append(smoothBtn, mapColorBtn);

    const rightActionsEl = document.createElement('div');
    rightActionsEl.className = 'chart-row-right-actions';

    if (metricKey === 'speed') {
      const paceToggle = document.createElement('div');
      paceToggle.className = 'seg-ctrl';
      paceToggle.innerHTML = `
        <button class="seg-btn ${speedMode === 'speed' ? 'active' : ''}" data-mode="speed">Speed</button>
        <button class="seg-btn ${speedMode === 'pace' ? 'active' : ''}" data-mode="pace">Pace</button>
      `;
      paceToggle.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.seg-btn') as HTMLElement;
        if (!btn) return;
        const mode = btn.dataset.mode;
        if (mode === 'speed' || mode === 'pace') {
          const isDefault = mode === defaultMode;
          UrlState.patch({ speed_mode: isDefault ? null : mode });
          render(true);
        }
      });
      rightActionsEl.append(paceToggle);
    }

    if (zeroBtn) rightActionsEl.append(zeroBtn);

    header.append(labelEl, actionsEl, statsContainer, rightActionsEl);

    const rowBody = document.createElement('div');
    rowBody.className = 'chart-row-body';

    const plotEl = document.createElement('div');
    plotEl.style.position = 'relative';
    rowBody.appendChild(plotEl);

    const fixedMinLabel = document.createElement('div');
    fixedMinLabel.className = 'fixed-x-label fixed-x-min';
    const fixedMaxLabel = document.createElement('div');
    fixedMaxLabel.className = 'fixed-x-label fixed-x-max';
    plotEl.append(fixedMinLabel, fixedMaxLabel);

    const histCol = document.createElement('div');
    histCol.className = `hist-col${statsVisible ? ' visible' : ''}`;
    const histCanvas = document.createElement('canvas');
    histCanvas.className = 'hist-canvas';
    histCol.appendChild(histCanvas);
    rowBody.appendChild(histCol);

    row.append(header, rowBody);

    const isDistAxis = xAxis === 'distance';

    function formatX(v: number, range: number): string {
      if (v == null) return '';
      if (isDistAxis) {
        const dec = range < 1 ? 3 : range < 5 ? 2 : range < 20 ? 1 : 0;
        return `${v.toFixed(dec)} km`;
      } else {
        const absV = Math.abs(v);
        const h = Math.floor(absV / 3600);
        const m = Math.floor((absV % 3600) / 60);
        const s = Math.round(absV % 60);
        const hh = h > 0 ? `${h}:` : '';
        const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
        const ss = String(s).padStart(2, '0');
        return `${v < 0 ? '-' : ''}${hh}${mm}:${ss}`;
      }
    }

    const incZeroDefault =
      metricsIncludingZero.has(metricKey) ||
      (metricKey !== 'power' && metricKey !== 'cadence' && metricKey !== 'speed');

    // Compute global Y range and full-track stats in a single pass
    let gMin = Infinity,
      gMax = -Infinity,
      allSum = 0,
      allCount = 0,
      filtMin = Infinity,
      filtMax = -Infinity,
      filtSum = 0,
      filtCount = 0;
    for (let i = 0; i < yData.length; i++) {
      const v = yData[i];
      if (v == null || !isFinite(v)) continue;
      if (v < gMin) gMin = v;
      if (v > gMax) gMax = v;
      allSum += v;
      allCount++;
      if (v !== 0 || incZeroDefault) {
        if (v < filtMin) filtMin = v;
        if (v > filtMax) filtMax = v;
        filtSum += v;
        filtCount++;
      }
    }
    if (allCount === 0) {
      gMin = 0;
      gMax = 100;
    }
    const fullStatsAll = allCount ? { min: gMin, max: gMax, avg: allSum / allCount } : null;
    const fullStatsFiltered = filtCount
      ? { min: filtMin, max: filtMax, avg: filtSum / filtCount }
      : null;
    const gPad = Math.abs(gMax - gMin) * 0.1 || 1;
    const fixedYRange = [gMin - gPad, gMax + gPad];

    let statsTotalInitialized = false;

    // Per-range stats
    function updateHeaderStats(visibleMin: number, visibleMax: number, u?: uPlot) {
      const incZero =
        metricsIncludingZero.has(metricKey) ||
        (metricKey !== 'power' && metricKey !== 'cadence' && metricKey !== 'speed');

      // Update fixed X labels
      const range = visibleMax - visibleMin;
      fixedMinLabel.textContent = formatX(visibleMin, range);
      fixedMaxLabel.textContent = formatX(visibleMax, range);

      const getHtml = (xMin: number, xMax: number, isFull = false) => {
        const s =
          isFull && incZero === incZeroDefault
            ? fullStatsFiltered
            : rangeStats(xData, yData, xMin, xMax, incZero);
        if (!s) return '';

        let h = `
          <span class="mm-item" title="Min"><span class="material-symbols-rounded mm-icon">align_flex_end</span>${def.fmt(s.min, true)}&nbsp;${def.unit}</span>
          <span class="mm-item" title="Avg"><span class="material-symbols-rounded mm-icon">align_center</span>${def.fmt(s.avg, true)}&nbsp;${def.unit}</span>
          <span class="mm-item" title="Max"><span class="material-symbols-rounded mm-icon">align_flex_start</span>${def.fmt(s.max, true)}&nbsp;${def.unit}</span>
        `;

        if (metricKey === 'elevation') {
          const es = elevationRangeStats(pts, xMin, xMax);
          h += `
            <span class="mm-item" title="Gain"><span class="material-symbols-rounded mm-icon">trending_up</span>+${Math.round(es.gain)}&nbsp;m</span>
            <span class="mm-item" title="Loss"><span class="material-symbols-rounded mm-icon">trending_down</span>-${Math.round(es.loss)}&nbsp;m</span>
          `;
        }
        return h;
      };

      if (!statsTotalInitialized) {
        statsTotalInitialized = true;
        statsTotalEl.innerHTML = `<span class="all-chip material-symbols-rounded" title="Show full track and clear selection">all_inclusive</span>${getHtml(
          xData[0]!,
          xData[xData.length - 1]!,
          true,
        )}`;
        statsTotalEl.querySelector('.all-chip')?.addEventListener('click', (e) => {
          e.stopPropagation();
          cancelSelection();
        });
      }

      if (selAnchorVal !== null && selEndVal !== null) {
        statsSelEl.innerHTML = getHtml(selAnchorVal, selEndVal, false);
        statsSelEl.style.display = 'flex';
        statsSelEl.style.setProperty('--sel-color', def.color);
      } else {
        statsSelEl.style.display = 'none';
      }
    }
    let initializingScale = false;
    const uOpts: uPlot.Options = {
      width: w,
      height: 130,
      padding: [4, 0, 0, 0],
      cursor: {
        sync: {
          key: syncKey!.key,
        },
        drag: { x: true, y: false, uni: 16 },
        focus: { prox: 16 },
        points: {
          size: 7,
          stroke: '#0e0e10',
          width: 2,
          fill: (metricKey === 'elevation'
            ? (u: uPlot, _si: number) => gradientColor(gradData ? gradData[u.cursor.idx!]! : null)
            : def.color) as any,
        },
        x: false,
        y: false,
      },
      select: {
        show: true,
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
      legend: { show: false },
      scales: {
        x: {
          time: false,
          range: (_u: uPlot, mn: number, mx: number) => [mn, mx],
          min: initialRange ? initialRange[0] : undefined,
          max: initialRange ? initialRange[1] : undefined,
        },
        y: {
          range: () => fixedYRange as [number, number],
          dir: metricKey === 'speed' && speedMode === 'pace' ? -1 : 1,
        },
      },
      axes: [
        {
          side: 2, // bottom
          stroke: '#555564',
          grid: { stroke: '#2e2e34', width: 1 },
          ticks: {
            show: true,
            stroke: '#2e2e34',
          },
          size: 30,
          space: 80,
          font: '10px system-ui, sans-serif',
          splits: (u: uPlot, axisIdx: number, scaleMin: number, scaleMax: number) => {
            const range = scaleMax - scaleMin;
            const width = u.bbox.width > 0 ? u.bbox.width : u.width;
            const targetLabels = width / 80;
            const idealIncr = range / targetLabels;

            let incrs;
            if (!isDistAxis) {
              // Time in seconds
              incrs = [
                1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14400, 28800, 43200,
                86400, 604800, 2592000, 31536000,
              ];
            } else {
              incrs = [
                0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
                2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000,
              ];
            }

            let incr = incrs[incrs.length - 1];
            for (let i = 0; i < incrs.length; i++) {
              if (incrs[i] >= idealIncr) {
                incr = incrs[i];
                break;
              }
            }

            const splits = [];
            let val = Math.ceil(scaleMin / incr) * incr;
            const precision = incr < 1 ? 2 : 0;

            while (val <= scaleMax) {
              const pos = u.valToPos(val, 'x', true);
              if (pos >= u.bbox.left + 80 && pos <= u.bbox.left + u.bbox.width - 80)
                splits.push(Number(val.toFixed(precision)));

              val += incr;
            }
            return splits;
          },
          values: ((_u: uPlot, vals: number[]) => {
            const range = (_u.scales.x?.max ?? 1) - (_u.scales.x?.min ?? 0);

            return vals.map((v) => {
              if (v == null) return '';
              const pos = _u.valToPos(v, 'x', true);
              // Strict 80px margin to prevent overlapping with fixed labels or Y axis
              if (pos < _u.bbox.left + 80 || pos > _u.bbox.left + _u.bbox.width - 80) return null;
              return formatX(v, range);
            });
          }) as any,
        },
        {
          side: 3, // left
          stroke: '#555564',
          grid: { stroke: '#2e2e34', width: 1 },
          ticks: { stroke: '#2e2e34' },
          size: 55,
          font: '10px system-ui, sans-serif',
          values: ((_u: uPlot, vals: number[]) =>
            vals.map((v) => (v != null ? def.fmtAxis(v) : ''))) as any,
        },
      ],
      series: [
        {},
        // Main selected track series
        {
          label: def.label,
          stroke: 'rgba(0,0,0,0)', // Stroke handled in draw hooks for layering
          width: 0,
          points: { show: false },
          paths: () => null,
        },
      ],
      hooks: {
        draw: [
          (u: uPlot) => {
            const top = u.bbox.top + u.bbox.height + 5; // 5px below plot area!
            fixedMinLabel.style.top = `${top}px`;
            fixedMinLabel.style.left = `${u.bbox.left}px`;

            fixedMaxLabel.style.top = `${top}px`;
            fixedMaxLabel.style.left = `${u.bbox.left + u.bbox.width}px`;
            fixedMaxLabel.style.transform = 'translateX(-100%)';
          },
          // 1. (bottom) Color / metric color of the selected track
          (u: uPlot) => {
            if (metricKey === 'gears') {
              drawTrackPath(
                u,
                xData as number[],
                yData as number[],
                def.color,
                1.5,
                metricKey,
                null,
                pts,
              );
            } else if (metricKey === 'elevation') {
              drawElevationGradient(u, xData as number[], yData as number[], gradData);
            } else if (metricKey === 'gradient') {
              drawGradientChart(u, xData as number[], yData as number[]);
            } else if (mapColorMetric === metricKey) {
              drawMetricColorFill(u, xData as number[], yData as number[], pts, metricKey);
            } else {
              // Normal colored line
              drawTrackPath(
                u,
                xData as number[],
                yData as number[],
                def.color,
                1.5,
                metricKey,
                null,
                pts,
              );
            }
          },

          // 2. Pinned point (middle)
          (u: uPlot) => {
            const plot = plots.find((p) => p.uplot === u);
            if (!plot) return;

            const s = (u as any)._strasse;
            // Priority 1: Global pinned point (all charts)
            if (pinnedPtIdx != null) {
              drawPinnedDot(u, xData, yData, def.color, def, pts, metricKey);
            } else {
              if (s && s.pinYVal) s.pinYVal.style.display = 'none';

              // Priority 2: Individual histogram pinned Y-pos (this chart only)
              if (plot.pinnedHistY != null)
                drawYAxisHighlight(u, xData, yData, plot.pinnedHistY, def.color, def);
            }
          },

          // 3. Pinned & Hover elements (labels, vertical lines)
          (u: uPlot) => {
            const hIdx = u.cursor.idx;
            const hasPinned = pinnedPtIdx != null;

            let hasHover = hIdx != null && u.cursor.left! >= 0;
            if (hasHover && pinnedPtIdx == null) {
              const cy = u.valToPos(yData[hIdx!]!, 'y', true);
              const dist = Math.abs(u.cursor.top! - cy);
              if (dist > 100) hasHover = false;
            }

            // B. Draw Hover vertical line
            if (hasHover && hIdx !== pinnedPtIdx)
              drawVerticalLineOnly(u, pts, hIdx!, hexToRgba(def.color, 0.4), 1.0);

            // C. Bold selection x-axis line & span pill
            if (selAnchorVal != null && selEndVal != null) {
              const ctx = u.ctx;
              const dpr = window.devicePixelRatio || 1;
              const bb = u.bbox;
              const ax = u.valToPos(selAnchorVal, 'x', true);
              const ex = u.valToPos(selEndVal, 'x', true);

              ctx.save();
              ctx.beginPath();
              ctx.lineWidth = 3 * dpr;
              ctx.strokeStyle = def.color;
              ctx.moveTo(ax, bb.top + bb.height);
              ctx.lineTo(ex, bb.top + bb.height);
              ctx.stroke();

              const span = Math.abs(selEndVal - selAnchorVal);
              const label = xAxis === 'distance' ? `${span.toFixed(2)} km` : fmtSecs(span);
              const fontSize = 9 * dpr;
              const fontStr = `bold ${fontSize}px system-ui, sans-serif`;
              if (ctx.font !== fontStr) ctx.font = fontStr;
              const tw = ctx.measureText(label).width;

              const visibleL = Math.max(bb.left, ax);
              const visibleR = Math.min(bb.left + bb.width, ex);
              const visibleW = visibleR - visibleL;

              if (visibleW > tw + 14 * dpr) {
                const padH = 5 * dpr;
                const padV = 2 * dpr;
                const bw = tw + padH * 2;
                const bh = fontSize + padV * 2;
                const bx = (visibleL + visibleR) / 2 - bw / 2;
                const by = bb.top + bb.height - bh / 2;

                ctx.beginPath();
                if ((ctx as any).roundRect) (ctx as any).roundRect(bx, by, bw, bh, 3 * dpr);
                else ctx.rect(bx, by, bw, bh);
                ctx.fillStyle = def.color;
                ctx.fill();

                ctx.fillStyle = '#000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, bx + bw / 2, by + bh / 2);
              }
              ctx.restore();
            }

            // D. Draw label pills (on top)
            // Pinned labels first (semi-transparent)
            if (hasPinned) drawXAxisLabels(u, pts, pinnedPtIdx!, def.color, true, 0.7);

            // Hover labels last (fully opaque, topmost)
            if (hasHover && hIdx !== pinnedPtIdx)
              drawXAxisLabels(u, pts, hIdx!, def.color, true, 1.0);
          },
        ],
        setCursor: [
          (u: uPlot) => {
            if (scaleSyncing) return;
            const idx = u.cursor.idx;

            // Trigger redraw on cursor move to ensure custom canvas markers (hover lines/labels) update live
            // Note: uPlot handles cross-chart sync when syncKey is used.
            u.redraw(false);

            // Track current x-value for keyboard navigation
            if (u.cursor.left! >= 0) lastMouseXVal = u.posToVal(u.cursor.left!, 'x');
            else lastMouseXVal = null;

            // ── Floating y-value next to cursor dot ──
            const s = (u as any)._strasse;
            let showHover = idx != null && yData[idx] != null;

            // Distance threshold: if no pinned point, check proximity to data line
            if (showHover && pinnedPtIdx == null) {
              const cy = u.valToPos(yData[idx!]!, 'y', true);
              const dist = Math.abs(u.cursor.top! - cy);
              if (dist > 100) showHover = false;
            }

            if (s) {
              if (showHover)
                updateTooltip(
                  u,
                  s.curYVal,
                  idx!,
                  xData as number[],
                  yData as number[],
                  pts,
                  def,
                  metricKey,
                );
              else s.curYVal.style.display = 'none';
            }

            // Map marker
            if (!cursorSyncing) {
              if (idx != null && pts[idx]) {
                if (onCursorMoveCb && (pinnedPtIdx != null || showHover)) {
                  onCursorMoveCb(pts[idx]);
                } else if (onCursorMoveCb && !showHover) {
                  // If we're too far and nothing is pinned, hide map cursor
                  onCursorMoveCb(null);
                }
              } else if (idx === null && onCursorMoveCb) {
                onCursorMoveCb(null);
              }
            }

            // Highlight matching histogram bucket
            if (idx != null && yData[idx] != null) {
              const { min, max } = histData;
              if (min != null && max != null) {
                const span = max - min || 1;
                const binI = Math.min(
                  histData.BINS - 1,
                  Math.floor(((yData[idx]! - min) / span) * histData.BINS),
                );
                if (plot.hoveredHistY !== yData[idx]) {
                  plot.hoveredHistY = yData[idx];
                  drawHistogram(histCanvas, histData, 130, binI);
                }
              }
            } else if (plot.hoveredHistY !== null) {
              plot.hoveredHistY = null;
              drawHistogram(histCanvas, histData, 130);
            }
          },
        ],

        setScale: [
          (u: uPlot, key: string) => {
            if (key !== 'x' || initializingScale) return;
            const { min, max } = u.scales.x!;

            // Sync currentXRange so keyboard navigation baseline is always accurate
            currentXRange = [min!, max!];

            // Update header stats for VISIBLE range
            updateHeaderStats(min as number, max as number, u);

            if (scaleSyncing) return;

            // Clear keyboard target when user interacts via mouse
            if (!updatingRange) targetXRange = null;

            // Sync sibling plots
            scaleSyncing = true;
            plots.forEach(({ uplot: other }) => {
              if (other !== u) other.batch(() => other.setScale('x', { min: min!, max: max! }));
            });
            scaleSyncing = false;

            updateSelOverlay();
            redrawHistograms();

            if (onRangeChangeCb && selAnchorVal !== null)
              onRangeChangeCb(selAnchorVal, selEndVal, xAxis);
          },
        ],

        setSelect: [
          (u: uPlot) => {
            if (updatingRange) return;
            targetXRange = null;
            const { left, width } = u.select;
            if (width > 0) {
              const min = u.posToVal(left, 'x');
              const max = u.posToVal(left + width, 'x');
              selAnchorVal = min;
              selEndVal = max;

              // Sync stats to new selection
              updateHeaderStats(u.scales.x!.min!, u.scales.x!.max!, u);
              updateSelOverlay();
              redrawHistograms();

              if (onRangeChangeCb) onRangeChangeCb(selAnchorVal, selEndVal, xAxis);

              // Clear uPlot's internal selection immediately so it doesn't block WASD/interaction
              u.setSelect({ left: 0, top: 0, width: 0, height: 0 }, false);
            }
          },
        ],
      },
    };

    // ── Overlay (pointer-events off except handles) ──
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:5';

    // Selection fill
    const selFill = document.createElement('div');
    selFill.className = 'sel-fill';
    selFill.style.display = 'none';

    // Anchor line + label + drag handle
    const anchorLine = document.createElement('div');
    anchorLine.className = 'sel-line sel-line-anchor';
    anchorLine.style.display = 'none';

    const anchorLabel = document.createElement('div');
    anchorLabel.className = 'sel-line-label sel-line-label-anchor';
    anchorLabel.style.display = 'none';

    const anchorHandle = document.createElement('div');
    anchorHandle.className = 'sel-handle sel-handle-anchor';
    anchorHandle.style.display = 'none';

    const anchorMarker = document.createElement('div');
    anchorMarker.className = 'sel-graph-marker';
    anchorMarker.innerHTML =
      '<span class="material-symbols-rounded font-l" style="font-variation-settings:\'FILL\' 1">play_circle</span>';
    anchorMarker.style.display = 'none';

    // End line + label + drag handle
    const endLine = document.createElement('div');
    endLine.className = 'sel-line sel-line-end';
    endLine.style.display = 'none';

    const endLabel = document.createElement('div');
    endLabel.className = 'sel-line-label sel-line-label-end';
    endLabel.style.display = 'none';

    const endHandle = document.createElement('div');
    endHandle.className = 'sel-handle sel-handle-end';
    endHandle.style.display = 'none';

    const endMarker = document.createElement('div');
    endMarker.className = 'sel-graph-marker';
    endMarker.innerHTML =
      '<span class="material-symbols-rounded font-l" style="font-variation-settings:\'FILL\' 1">stop_circle</span>';
    endMarker.style.display = 'none';

    // Floating cursor y-value
    const curYVal = document.createElement('div');
    curYVal.className = 'cur-y-val';
    curYVal.style.cssText = `color:${def.color};display:none`;

    // Floating pinned y-value
    const pinYVal = document.createElement('div');
    pinYVal.className = 'cur-y-val pin';
    pinYVal.style.cssText = `color:${def.color};display:none`;

    overlay.append(
      selFill,
      anchorLine,
      anchorLabel,
      anchorHandle,
      anchorMarker,
      endLine,
      endLabel,
      endHandle,
      endMarker,
      curYVal,
      pinYVal,
    );

    const histData: HistData = {
      yData,
      xData: xData as number[],
      def,
      BINS: 24,
      min: allCount ? gMin : undefined,
      max: allCount ? gMax : undefined,
      fullStats: fullStatsFiltered,
      fullStatsAll,
    };
    const plot: PlotData = {
      uplot: null as any,
      row,
      xData: xData as number[],
      yData,
      def,
      metricKey,
      statsTotalEl,
      statsSelEl,
      histCol,
      histCanvas,
      histData,
      hoveredHistY: null,
      pinnedHistY: null,
      smoothed: smoothedMetrics.has(metricKey),
      incZero: metricsIncludingZero.has(metricKey),
      w,
    };
    histData.plot = plot; // Back-reference for tooltip to trigger redraws

    const prevSync = scaleSyncing;
    scaleSyncing = true;
    const uplot = new uPlot(uOpts, [xData, yData] as any, (self, init) => {
      plot.uplot = self as WegPlot;
      plots.push(plot);
      plotEl.appendChild(self.root);
      self.over.appendChild(overlay);
      (self as any)._strasse = {
        selFill,
        anchorLine,
        anchorLabel,
        anchorHandle,
        anchorMarker,
        endLine,
        endLabel,
        endHandle,
        endMarker,
        curYVal,
        pinYVal,
        updateHeaderStats,
      };
      self.batch(() => {
        init();
      });
    }) as WegPlot;
    scaleSyncing = prevSync;

    // ── Handle drag ──
    attachHandleDrag(anchorHandle, uplot, xData, true);
    attachHandleDrag(endHandle, uplot, xData, false);

    // ── Mouse listeners ──
    let mousedownX: number | null = null;
    uplot.over.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = false;
      const rect = uplot.over.getBoundingClientRect();
      const xPx = e.clientX - rect.left;
      mousedownX = xPx;
    });
    uplot.over.addEventListener('mousemove', (e) => {
      if (mousedownX !== null) {
        const rect = uplot.over.getBoundingClientRect();
        if (Math.abs(e.clientX - rect.left - mousedownX) > 5) isDragging = true;
      }
    });
    uplot.over.addEventListener('mouseup', () => {
      mousedownX = null;
    });

    // Click to pin point (sticky selection)
    uplot.over.addEventListener('click', () => {
      if (isDragging) return;
      const idx = uplot.cursor.idx;
      if (idx != null && pts[idx]) {
        pinnedPtIdx = idx;
        plots.forEach(({ uplot: u }) => u.redraw(false));
        if (onClickCb) onClickCb(pts[idx], idx);
        if (onPinChangeCb) onPinChangeCb(idx);
      }
    });

    row.addEventListener('dblclick', cancelSelection);

    let initHoverBinI: number | null = null;
    if (pinnedPtIdx != null && xData[pinnedPtIdx] != null && yData[pinnedPtIdx] != null) {
      buildHistBins(histData);
      if (histData.min != null && histData.max != null) {
        const span = histData.max - histData.min || 1;
        initHoverBinI = Math.min(
          histData.BINS - 1,
          Math.floor(((yData[pinnedPtIdx]! - histData.min) / span) * histData.BINS),
        );
        plot.hoveredHistY = yData[pinnedPtIdx];
      }
    }

    drawHistogram(histCanvas, histData, 130, initHoverBinI);
    attachHistTooltip(histCanvas, histData);
    if (container) {
      if (insertBeforeEl) container.insertBefore(row, insertBeforeEl);
      else container.appendChild(row);
    }
  }

  // ── Selection overlay (fill + lines + handles) ───────────────
  function updateSelOverlay() {
    updateAnchorLines();
    // Redraw canvas markers (bold selection line + span pill)
    plots.forEach(({ uplot: u }) => u.batch(() => u.redraw(false)));
  }

  function updateAnchorLines() {
    plots.forEach(({ uplot: u, def }) => {
      const s = (u as any)._strasse;
      if (!s) return;
      const {
        selFill,
        anchorLine,
        anchorLabel,
        anchorHandle,
        anchorMarker,
        endLine,
        endLabel,
        endHandle,
        endMarker,
      } = s;
      if (selAnchorVal == null || selEndVal == null) {
        [
          selFill,
          anchorLine,
          anchorLabel,
          anchorHandle,
          anchorMarker,
          endLine,
          endLabel,
          endHandle,
          endMarker,
        ].forEach((el: HTMLElement) => {
          el.style.display = 'none';
        });
        return;
      }
      const aX = u.valToPos(selAnchorVal, 'x');
      const eX = u.valToPos(selEndVal, 'x');
      const dpr = window.devicePixelRatio || 1;
      const bb = u.bbox;
      const overW = bb.width / dpr;
      const overH = bb.height / dpr;
      const plotBottom = (bb.top + bb.height) / dpr;

      const isAnchorVisible = aX >= 0 && aX <= overW;
      const isEndVisible = eX >= 0 && eX <= overW;

      // Fill: clamp left/right to visible area
      const fillL = Math.max(0, aX);
      const fillR = Math.min(overW, eX);
      if (fillR > fillL) {
        selFill.style.left = `${fillL}px`;
        selFill.style.width = `${fillR - fillL}px`;
        selFill.style.top = '0';
        selFill.style.height = `${overH}px`;
        selFill.style.backgroundColor = hexToRgba(def.color, 0.07);
        selFill.style.display = '';
      } else {
        selFill.style.display = 'none';
      }

      // Anchor line
      if (isAnchorVisible) {
        anchorLine.style.left = `${aX}px`;
        anchorLine.style.height = `${overH}px`;
        anchorLine.style.borderLeftColor = def.color;
        anchorLine.style.display = '';
        // Anchor label
        const aText = fmtXVal(selAnchorVal);
        anchorLabel.textContent = aText;
        const aLabelW = aText.length * 7 + 10;
        anchorLabel.style.left = aX + aLabelW + 4 < overW ? `${aX + 3}px` : `${aX - aLabelW - 3}px`;
        anchorLabel.style.display = '';
        // Anchor handle
        anchorHandle.style.left = `${aX}px`;
        anchorHandle.style.backgroundColor = def.color;
        anchorHandle.style.display = '';
        // Anchor marker: centered on the bold line
        anchorMarker.style.left = `${aX}px`;
        anchorMarker.style.top = `${plotBottom}px`;
        const aIcon = anchorMarker.querySelector('.material-symbols-rounded') as HTMLElement;
        if (aIcon) aIcon.style.color = def.color;
        anchorMarker.style.display = '';
      } else {
        [anchorLine, anchorLabel, anchorHandle, anchorMarker].forEach(
          (el: HTMLElement) => (el.style.display = 'none'),
        );
      }

      // End line
      if (isEndVisible) {
        endLine.style.left = `${eX}px`;
        endLine.style.height = `${overH}px`;
        endLine.style.borderLeftColor = def.color;
        endLine.style.display = '';
        // End label
        const eText = fmtXVal(selEndVal);
        endLabel.textContent = eText;
        const eLabelW = eText.length * 7 + 10;
        endLabel.style.left = eX - eLabelW - 3 > 0 ? `${eX - eLabelW - 3}px` : `${eX + 3}px`;
        endLabel.style.display = '';
        // End handle
        endHandle.style.left = `${eX}px`;
        endHandle.style.backgroundColor = def.color;
        endHandle.style.display = '';
        // End marker: centered on the bold line
        endMarker.style.left = `${eX}px`;
        endMarker.style.top = `${plotBottom}px`;
        const eIcon = endMarker.querySelector('.material-symbols-rounded') as HTMLElement;
        if (eIcon) eIcon.style.color = def.color;
        endMarker.style.display = '';
      } else {
        [endLine, endLabel, endHandle, endMarker].forEach(
          (el: HTMLElement) => (el.style.display = 'none'),
        );
      }
    });
  }

  function fmtXVal(v: number) {
    return xAxis === 'distance' ? `${v.toFixed(2)} km` : fmtSecs(v);
  }

  // ── Handle drag logic ─────────────────────────────────────────
  function attachHandleDrag(
    handleEl: HTMLElement,
    uplot: uPlot,
    xData: (number | null)[],
    isAnchor: boolean,
  ) {
    // pointer-events enabled on the handle itself
    handleEl.style.pointerEvents = 'auto';

    handleEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const startX = e.clientX;
      const startVal = isAnchor ? selAnchorVal : selEndVal;
      const overW = uplot.over.offsetWidth;
      // px-per-data-unit at current zoom
      const xMin = uplot.scales.x!.min!,
        xMax = uplot.scales.x!.max!;
      const pxPerUnit = overW / (xMax - xMin);
      const xFull = [xData[0]!, xData[xData.length - 1]!];

      document.body.style.cursor = 'ew-resize';
      isDragging = true;

      function onMove(me: MouseEvent) {
        const dx = me.clientX - startX;
        let newVal = (startVal || 0) + dx / pxPerUnit;
        newVal = Math.max(xFull[0], Math.min(xFull[1], newVal));

        if (isAnchor) selAnchorVal = Math.min(newVal, (selEndVal || xFull[1]) - 0.001);
        else selEndVal = Math.max(newVal, (selAnchorVal || xFull[0]) + 0.001);

        // When dragging handles, we typically want to stay zoomed to the selection?
        // Actually, let's keep the zoom as is, and just update the selection overlay and stats.
        plots.forEach((p) =>
          (p.uplot as any)._strasse?.updateHeaderStats(
            p.uplot.scales.x!.min!,
            p.uplot.scales.x!.max!,
          ),
        );
        updateSelOverlay();
        redrawHistograms();
        if (onRangeChangeCb) onRangeChangeCb(selAnchorVal, selEndVal, xAxis);
      }

      function onUp() {
        document.body.style.cursor = '';
        isDragging = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // ── Histogram logic ──────────────────────────────────────────
  function buildHistBins(histData: HistData) {
    const { yData, xData, BINS } = histData;

    // Cache to avoid re-binning every frame during hover
    if (histData._lastYData === yData && histData.bins) return;
    histData._lastYData = yData;

    let min = histData.min;
    let max = histData.max;
    if (min == null || max == null) {
      let lo = Infinity,
        hi = -Infinity,
        cnt = 0;
      for (let i = 0; i < yData.length; i++) {
        const v = yData[i];
        if (v == null || !isFinite(v)) continue;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
        cnt++;
      }
      if (!cnt) return;
      min = lo;
      max = hi;
      histData.min = min;
      histData.max = max;
    }

    const bins = new Array(BINS).fill(0);
    const binAccum = new Array(BINS).fill(0); // accumulated x-weight per bin (time in s or dist in km)

    const span = max - min || 1;
    const metricKey =
      histData.plot?.metricKey ?? Object.keys(METRICS).find((k) => METRICS[k] === histData.def);
    const incZero =
      !metricKey ||
      metricsIncludingZero.has(metricKey) ||
      (metricKey !== 'power' && metricKey !== 'cadence' && metricKey !== 'speed');

    for (let i = 0; i < yData.length; i++) {
      const v = yData[i];
      if (v == null || !isFinite(v)) continue;
      if (v === 0 && !incZero) continue;

      const bi = Math.min(BINS - 1, Math.floor(((v - min) / span) * BINS));
      bins[bi]++;

      // weight by x-delta
      const prev = i > 0 && xData[i - 1] != null ? xData[i - 1]! : xData[i]!;
      const next = i < xData.length - 1 && xData[i + 1] != null ? xData[i + 1]! : xData[i]!;
      binAccum[bi] += (next - prev) / 2;
    }
    histData.bins = bins;
    histData.binAccum = binAccum;
  }

  function redrawHistograms() {
    plots.forEach(({ histCanvas, histData, uplot: u }) => {
      drawHistogram(histCanvas, histData, u.height);
    });
  }

  function drawHistogram(
    canvas: HTMLCanvasElement,
    histData: HistData,
    chartH: number,
    hoverBinI: number | null = null,
  ) {
    const { def, BINS } = histData;
    buildHistBins(histData);
    const { bins, min, max } = histData;
    if (!bins || min == null || max == null) return;

    const hasSel = selAnchorVal != null && selEndVal != null;

    // Compute selection bins if a range is active and changed
    if (
      hasSel &&
      (histData._lastSelRange?.[0] !== selAnchorVal || histData._lastSelRange?.[1] !== selEndVal)
    ) {
      histData._lastSelRange = [selAnchorVal!, selEndVal!];
      const selBins = new Array(BINS).fill(0);
      const selBinAccum = new Array(BINS).fill(0);
      const { yData, xData } = histData;
      const span = max - min || 1;
      const metricKey =
        histData.plot?.metricKey ?? Object.keys(METRICS).find((k) => METRICS[k] === histData.def);
      const incZero =
        !metricKey ||
        metricsIncludingZero.has(metricKey) ||
        (metricKey !== 'power' && metricKey !== 'cadence' && metricKey !== 'speed');

      for (let i = 0; i < yData.length; i++) {
        const v = yData[i];
        if (v == null || !isFinite(v)) continue;
        if (v === 0 && !incZero) continue;

        const x = xData[i];
        if (x == null || x < selAnchorVal! || x > selEndVal!) continue;
        const bi = Math.min(BINS - 1, Math.floor(((v - min) / span) * BINS));
        selBins[bi]++;
        const prev = i > 0 && xData[i - 1] != null ? xData[i - 1]! : xData[i]!;
        const next = i < xData.length - 1 && xData[i + 1] != null ? xData[i + 1]! : xData[i]!;
        selBinAccum[bi] += (next - prev) / 2;
      }
      histData.selBins = selBins;
      histData.selBinAccum = selBinAccum;
    } else if (!hasSel) {
      histData.selBins = null;
      histData.selBinAccum = null;
      histData._lastSelRange = null;
    }
    const selBins = histData.selBins;

    const dpr = window.devicePixelRatio || 1;
    const W = HIST_W;
    const H = chartH;

    // Performance: only set dimensions if they changed (resets canvas)
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    }

    const ctx = canvas.getContext('2d')!;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const peak = Math.max(...bins);

    // Measure label width so bars start right after them
    const fmt = (v: number) => def.fmtAxis(v);
    const fontStr = '9px system-ui, sans-serif';
    if (ctx.font !== fontStr) ctx.font = fontStr;
    const labelW = Math.ceil(
      Math.max(
        ctx.measureText(`${fmt(max)} ${def.unit}`).width,
        ctx.measureText(`${fmt(min)} ${def.unit}`).width,
      ),
    );

    // Vertical alignment with main graph:
    // uPlot padding: [4, 0, 0, 0]
    // Axis size: 30
    const pad = { t: 4, r: 0, b: 30, l: labelW + 6 };
    histData.padL = pad.l;
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    // bin 0 = lowest values → drawn at bottom; bin BINS-1 = highest → drawn at top
    const binY = (i: number) => pad.t + (BINS - 1 - i) * (plotH / BINS);
    const binH = plotH / BINS - 1;

    // Full distribution (dimmed when selection active)
    const baseAlpha = hasSel ? 0.15 : 0.6;
    ctx.fillStyle = hexToRgba(def.color, baseAlpha);
    for (let i = 0; i < BINS; i++) {
      if (!bins[i]) continue;
      const bw = (bins[i] / peak) * plotW;
      ctx.fillRect(pad.l, binY(i), bw, binH);
    }

    // Selection overlay (bright)
    if (selBins) {
      ctx.fillStyle = hexToRgba(def.color, 0.85);
      for (let i = 0; i < BINS; i++) {
        if (!selBins[i]) continue;
        const bw = (selBins[i] / peak) * plotW;
        ctx.fillRect(pad.l, binY(i), bw, binH);
      }
      ctx.fillStyle = def.color;
      ctx.fillRect(pad.l, pad.t, 2, plotH);
    }

    // CDF overlay — smooth curve from bottom (0%) to top (100%)
    const total = bins.reduce((s, v) => s + v, 0);
    if (total > 0) {
      // Build CDF points: one per bin boundary, bottom→top
      const pts2 = [{ x: pad.l, y: pad.t + plotH }];
      let cumSum = 0;
      for (let i = 0; i < BINS; i++) {
        cumSum += bins[i];
        pts2.push({ x: pad.l + (cumSum / total) * plotW, y: binY(i) });
      }

      ctx.beginPath();
      // CDF line is now solid
      ctx.setLineDash([]);
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 0.75 * dpr;
      ctx.lineJoin = 'round';
      ctx.moveTo(pts2[0].x, pts2[0].y);
      for (let i = 1; i < pts2.length - 1; i++) {
        const mx = (pts2[i].x + pts2[i + 1].x) / 2;
        const my = (pts2[i].y + pts2[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts2[i].x, pts2[i].y, mx, my);
      }
      ctx.lineTo(pts2[pts2.length - 1].x, pts2[pts2.length - 1].y);
      ctx.stroke();

      // ── Hover highlight on CDF ──
      if (hoverBinI != null && pts2[hoverBinI + 1]) {
        const cp = pts2[hoverBinI + 1];
        // Vertical line down
        ctx.beginPath();
        ctx.setLineDash([2 * dpr, 2 * dpr]);
        ctx.strokeStyle = hexToRgba(def.color, 0.6);
        ctx.moveTo(cp.x, cp.y);
        ctx.lineTo(cp.x, pad.t + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dot: tiny precision point
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 1.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#0e0e10';
        ctx.fill();
        ctx.strokeStyle = def.color;
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
      }
    }

    // Axis labels: max at top, min at bottom
    if (ctx.fillStyle !== '#888896') ctx.fillStyle = '#888896';
    const font9 = '9px system-ui, sans-serif';
    if (ctx.font !== font9) ctx.font = font9;
    ctx.textAlign = 'right';

    // Draw Max
    ctx.textBaseline = 'top';
    ctx.fillText(`${fmt(max)} ${def.unit}`, pad.l - 4, pad.t);

    // Draw Min
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${fmt(min)} ${def.unit}`, pad.l - 4, H - pad.b);

    // Draw Avg (only if it doesn't overlap min/max)
    const stats =
      !hasSel && histData.fullStatsAll !== undefined
        ? histData.fullStatsAll
        : rangeStats(
            histData.xData,
            histData.yData,
            selAnchorVal || -Infinity,
            selEndVal || Infinity,
          );
    if (stats) {
      const avgY =
        pad.t +
        (BINS - 1 - Math.min(BINS - 1, Math.floor(((stats.avg - min) / (max - min || 1)) * BINS))) *
          (plotH / BINS);
      const minLabelY = H - pad.b;
      const maxLabelY = pad.t;
      const labelHeight = 10; // Approx 10px height for 9px font

      if (avgY > maxLabelY + labelHeight + 2 && avgY < minLabelY - labelHeight - 2) {
        ctx.textBaseline = 'middle';
        if (ctx.fillStyle !== '#aaa') ctx.fillStyle = '#aaa';
        ctx.fillText(`${fmt(stats.avg)} ${def.unit}`, pad.l - 4, avgY);
        // Draw small indicator tick
        ctx.beginPath();
        ctx.moveTo(pad.l - 3, avgY);
        ctx.lineTo(pad.l, avgY);
        if (ctx.strokeStyle !== '#aaa') ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // ── Higher/Lower percentages below histogram ──
    if (hoverBinI != null && total > 0) {
      let countLower = 0;
      for (let i = 0; i < hoverBinI; i++) countLower += bins[i];
      let countHigher = 0;
      for (let i = hoverBinI + 1; i < BINS; i++) countHigher += bins[i];

      const pLower = Math.round((countLower / total) * 100);
      const pHigher = Math.round((countHigher / total) * 100);

      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const font8 = '8px system-ui, sans-serif';
      if (ctx.font !== font8) ctx.font = font8;

      const textY = H - pad.b + 6;

      // Draw "Lower" stat
      if (ctx.fillStyle !== '#888896') ctx.fillStyle = '#888896';
      ctx.fillText('LOWER', pad.l, textY);
      if (ctx.fillStyle !== '#ccc') ctx.fillStyle = '#ccc';
      const fontB10 = 'bold 10px system-ui, sans-serif';
      if (ctx.font !== fontB10) ctx.font = fontB10;
      ctx.fillText(`${pLower}%`, pad.l, textY + 10);

      // Draw "Higher" stat
      const midX = pad.l + plotW / 2;
      if (ctx.font !== font8) ctx.font = font8;
      if (ctx.fillStyle !== '#888896') ctx.fillStyle = '#888896';
      ctx.fillText('HIGHER', midX, textY);
      if (ctx.fillStyle !== '#ccc') ctx.fillStyle = '#ccc';
      if (ctx.font !== fontB10) ctx.font = fontB10;
      ctx.fillText(`${pHigher}%`, midX, textY + 10);

      ctx.restore();
    }
  }

  function attachHistTooltip(canvas: HTMLCanvasElement, histData: HistData) {
    const { plot } = histData;

    canvas.addEventListener('click', (e) => {
      const binI = getBinAt(canvas, histData, e);
      if (binI != null && plot) {
        const { min, max, BINS } = histData;
        const span = max! - min! || 1;
        plot.pinnedHistY = min! + (binI + 0.5) * (span / BINS!);
        plots.forEach(({ uplot: u }) => u.redraw(false));
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      lastHistMouseEvent = e;
      updateHistTooltip(e, canvas, histData);
    });

    canvas.addEventListener('mouseenter', () => {
      hoveredHistCanvas = canvas;
      hoveredHistData = histData;
    });

    canvas.addEventListener('mouseleave', () => {
      if (hoveredHistCanvas === canvas) {
        hoveredHistCanvas = null;
        hoveredHistData = null;
      }
      if (histTooltipEl) histTooltipEl.style.display = 'none';
      const lineEl = document.getElementById('hist-line');
      if (lineEl) lineEl.style.display = 'none';
      if (plot) {
        plot.hoveredHistY = null;
        drawHistogram(canvas, histData, canvas.height / (window.devicePixelRatio || 1));
      }
    });
  }

  function getBinAt(canvas: HTMLCanvasElement, histData: HistData, e: MouseEvent) {
    const { bins, BINS } = histData;
    if (!bins) return null;
    const rect = canvas.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    // Use exact padding from drawHistogram: t: 4, b: 30
    const pad = { t: 4, b: 30 };
    const plotH = rect.height - pad.t - pad.b;
    const rawI = Math.floor(((relY - pad.t) / plotH) * BINS!);
    const binI = BINS! - 1 - rawI;
    if (rawI < 0 || rawI >= BINS!) return null;
    return binI;
  }

  function updateHistTooltip(e: MouseEvent, canvas: HTMLCanvasElement, histData: HistData) {
    if (!histTooltipEl) return;
    const { bins, binAccum, min, max, BINS, def, plot } = histData;
    if (!bins || !binAccum || min == null || max == null) return;

    const lineEl = document.getElementById('hist-line');
    const binI = getBinAt(canvas, histData, e);

    if (binI == null || !bins[binI]) {
      histTooltipEl.style.display = 'none';
      if (lineEl) lineEl.style.display = 'none';
      if (plot) {
        plot.hoveredHistY = null;
        drawHistogram(canvas, histData, canvas.height / (window.devicePixelRatio || 1));
      }
      return;
    }

    if (plot) {
      const span = max - min || 1;
      plot.hoveredHistY = min + (binI + 0.5) * (span / BINS!);
      drawHistogram(canvas, histData, canvas.height / (window.devicePixelRatio || 1), binI);
    }

    const count = bins[binI];
    const total = bins.reduce((s, v) => s + v, 0);
    const pct = (count / total) * 100;

    const span = max - min || 1;
    const low = min + binI * (span / BINS!);
    const high = min + (binI + 1) * (span / BINS!);
    const label = `${def.fmt(low, true)} – ${def.fmt(high, true)} ${def.unit}`;

    // Zone info
    let zoneHtml = '';
    const mid = (low + high) / 2;
    const metricKey = Object.keys(METRICS).find((k) => METRICS[k] === def);
    let zones: any[] = [];
    if (metricKey === 'power') zones = Zones.getPowerZones();
    else if (metricKey === 'hr') zones = Zones.getHRZones();

    if (zones.length > 0) {
      const zIdx = zones.findIndex((z) => mid >= z.min && mid < z.max);
      const z =
        zIdx !== -1
          ? zones[zIdx]
          : mid >= zones[zones.length - 1].min
            ? zones[zones.length - 1]
            : null;
      if (z) {
        const finalZIdx = zIdx !== -1 ? zIdx : zones.length - 1;
        zoneHtml = `
          <div class="font-s" style="display:flex; align-items:center; gap:8px; margin-top:2px; margin-bottom:8px; padding-left:8px; border-left:3px solid ${z.color}; font-weight:700; text-transform:uppercase; letter-spacing:0.5px">
            <span style="color:var(--text)">Z${finalZIdx + 1}</span>
            <span style="color:var(--text-dim)">·</span>
            <span style="color:var(--text-muted)">${z.name}</span>
          </div>
        `;
      }
    }

    const totalAccum =
      xAxis === 'distance' ? `${binAccum[binI].toFixed(2)} km` : fmtSecs(binAccum[binI]);
    const totalPct = (binAccum[binI] / binAccum.reduce((s, v) => s + v, 0)) * 100;

    let html = `
      <div class="hist-tt-header" style="border-left-color:${def.color}">${label}</div>
      ${zoneHtml}
    `;

    if (totalAccum) {
      html += `<div class="hist-tt-grid">
        <span class="hist-tt-label">${xAxis === 'distance' ? 'Dist' : 'Time'}</span>
        <span class="hist-tt-value">${totalAccum}</span>
        <span class="hist-tt-pct">${totalPct.toFixed(1)}%</span>
      </div>`;
    }

    // Selection context
    if (histData.selBins && histData.selBinAccum) {
      const stotalAccum =
        xAxis === 'distance'
          ? `${histData.selBinAccum[binI].toFixed(2)} km`
          : fmtSecs(histData.selBinAccum[binI]);
      const stotalPct =
        (histData.selBinAccum[binI] / histData.selBinAccum.reduce((s, v) => s + v, 0)) * 100;

      html += `
        <div class="hist-tt-grid sel-row">
          <span class="hist-tt-label sel">Sel ${xAxis === 'distance' ? 'Dist' : 'Time'}</span>
          <span class="hist-tt-value sel">${stotalAccum}</span>
          <span class="hist-tt-pct sel">${stotalPct.toFixed(1)}%</span>
        </div>
      `;
    }

    histTooltipEl.innerHTML = html;

    // Position tooltip: fixed X left of canvas, Y centered on bin
    histTooltipEl.style.display = 'block';
    const ttH = histTooltipEl.offsetHeight;
    const ttW = histTooltipEl.offsetWidth;
    const rect = canvas.getBoundingClientRect();
    const plotH = rect.height - 4 - 30; // pad.t + pad.b
    const binCenterY = rect.top + 4 + (BINS! - 1 - binI + 0.5) * (plotH / BINS!);

    histTooltipEl.style.left = `${rect.left - ttW - 12}px`;
    histTooltipEl.style.top = `${binCenterY - ttH / 2}px`;

    // Horizontal line sync
    if (lineEl) {
      lineEl.style.display = 'block';
      lineEl.style.top = `${binCenterY}px`;
      lineEl.style.left = '0px';
      lineEl.style.width = `${rect.left}px`;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  function destroyPlots(keepState = false) {
    if (histTooltipEl) histTooltipEl.style.display = 'none';
    plots.forEach(({ uplot: u, row }) => {
      syncKey!.unsub(u);
      u.destroy();
      row.remove();
    });
    plots = [];
    renderedTrack = null;
    if (!keepState) {
      selAnchorVal = null;
      selEndVal = null;
    }
    isDragging = false;
  }

  function rangeStats(
    xData: (number | null)[],
    yData: (number | null)[],
    xMin: number,
    xMax: number,
    incZero = true,
  ) {
    let min = Infinity,
      max = -Infinity,
      sum = 0,
      n = 0;
    for (let i = 0; i < xData.length; i++) {
      if (xData[i] == null || xData[i]! < xMin || xData[i]! > xMax) continue;
      const v = yData[i];
      if (v == null || !isFinite(v)) continue;
      if (v === 0 && !incZero) continue;

      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
      n++;
    }
    return n ? { min, max, avg: sum / n } : null;
  }

  function elevationRangeStats(pts: TrackPoint[], xMin: number, xMax: number) {
    let gain = 0,
      loss = 0;
    let prevEle: number | null = null;
    const isDist = xAxis === 'distance';
    const t0 = pts[0].time || 0;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const x = isDist ? (p.dist || 0) / 1000 : (p.time! - t0) / 1000;
      if (x < xMin || x > xMax) continue;

      if (p.ele != null) {
        if (prevEle != null) {
          const diff = p.ele - prevEle;
          if (diff > 0) gain += diff;
          else if (diff < 0) loss += Math.abs(diff);
        }
        prevEle = p.ele;
      }
    }
    return { gain, loss };
  }

  // ── Plot Rendering Helpers (Canvas) ───────────────────────────
  function updateTooltip(
    u: WegPlot,
    el: HTMLElement,
    idx: number,
    xData: (number | null)[],
    yData: (number | null)[],
    pts: TrackPoint[],
    def: MetricDefinition,
    metricKey: string,
  ) {
    if (idx == null || yData[idx] == null) {
      el.style.display = 'none';
      return;
    }

    const cx = u.valToPos(xData[idx]!, 'x', false);
    const cy = u.valToPos(yData[idx]!, 'y', false);

    let gColor = '#888896';
    let g = 0;
    if (idx > 0 && pts[idx] && pts[idx - 1]) {
      const p0 = pts[idx - 1],
        p1 = pts[idx];
      const d = (p1.dist || 0) - (p0.dist || 0);
      if (d > 0.1 && p1.ele != null && p0.ele != null) {
        g = ((p1.ele - p0.ele) / d) * 100;
        gColor = gradientColor(g);
      }
    }

    let content =
      metricKey !== 'elevation'
        ? `${def.fmt(yData[idx]!, false)}&nbsp;${def.unit}`
        : `${def.fmt(yData[idx]!, false)}&nbsp;${def.unit} <span class="font-m" style="color:${gColor};margin-left:6px">∠</span> ${Math.abs(g).toFixed(1)}%`;

    // Special handling for gears: show tooth count if available
    if (metricKey === 'gearRear' && pts[idx].gearRearTooth != null) {
      content = `${pts[idx].gearRearTooth}T <span class="font-s" style="opacity:0.6; margin-left:4px">(pos ${yData[idx]})</span>`;
    } else if (metricKey === 'gearFront' && pts[idx].gearFrontTooth != null) {
      content = `${pts[idx].gearFrontTooth}T <span class="font-s" style="opacity:0.6; margin-left:4px">(pos ${yData[idx]})</span>`;
    } else if (metricKey === 'gears') {
      const p = pts[idx];
      const front =
        p.gearFrontTooth != null
          ? `${p.gearFrontTooth}T`
          : p.gearFront != null
            ? `pos ${p.gearFront}`
            : '';
      const rear =
        p.gearRearTooth != null
          ? `${p.gearRearTooth}T`
          : p.gearRear != null
            ? `pos ${p.gearRear}`
            : '';

      if (front || rear)
        content += ` <span class="font-s" style="opacity:0.6; margin-left:4px">(${front} / ${rear})</span>`;
    }

    if (el.innerHTML !== content) el.innerHTML = content;

    const color44 = `${def.color}44`;
    if (el.style.color !== def.color) el.style.color = def.color;
    if (el.style.borderColor !== color44) el.style.borderColor = color44;

    const left = `${cx}px`;
    const top = `${cy}px`;
    const transform = 'translate(6px, -50%)';
    if (el.style.left !== left) el.style.left = left;
    if (el.style.top !== top) el.style.top = top;
    if (el.style.transform !== transform) el.style.transform = transform;
    if (el.style.display !== '') el.style.display = '';
  }

  const gradientColorRgbaCache = new Map<number | null, string>();
  function gradientColorRgba(g: number | null): string {
    let c = gradientColorRgbaCache.get(g);
    if (!c) {
      c = hexToRgba(gradientColor(g), 0.8);
      gradientColorRgbaCache.set(g, c);
    }
    return c;
  }

  function drawElevationGradient(
    u: uPlot,
    xData: number[],
    yData: number[],
    gradData: (number | null)[] | null,
  ) {
    const ctx = u.ctx;
    const bb = u.bbox;
    const dpr = window.devicePixelRatio || 1;
    const xMin = u.scales.x?.min ?? -Infinity;
    const xMax = u.scales.x?.max ?? Infinity;
    const yMin = u.scales.y?.min ?? 0;
    const yMax = u.scales.y?.max ?? 100;
    const xScale = bb.width / (xMax - xMin || 1);
    const yScale = bb.height / (yMax - yMin || 1);
    const yBase = bb.top + bb.height;

    const idxs = u.series[0]?.idxs;
    const iStart = idxs ? Math.max(1, idxs[0]) : 1;
    const iEnd = idxs ? Math.min(xData.length - 1, idxs[1] + 1) : xData.length - 1;
    const step = Math.max(1, Math.floor((iEnd - iStart) / 250));

    ctx.save();
    ctx.lineWidth = 1.5 * dpr;

    const byColor = new Map<string, number[]>();

    let prevIdx = iStart - 1;
    for (let i = iStart; i <= iEnd; i += step) {
      const xv1 = xData[i];
      const xv0 = xData[prevIdx];
      prevIdx = i;
      if (xv1 == null || yData[i] == null || xv0 == null || yData[i - step] == null) continue;
      if (xv1 < xMin || xv0 > xMax) continue;

      const x0 = bb.left + (xv0 - xMin) * xScale;
      const y0 = yBase - (yData[i - step]! - yMin) * yScale;
      const x1 = bb.left + (xv1 - xMin) * xScale;
      const y1 = yBase - (yData[i]! - yMin) * yScale;

      const g = gradData && gradData[i] != null ? Math.round(gradData[i]! / 2) * 2 : null;
      const color = gradientColorRgba(g);
      let segs = byColor.get(color);
      if (!segs) {
        segs = [];
        byColor.set(color, segs);
      }
      segs.push(x0, y0, x1, y1);
    }

    for (const [color, segs] of byColor) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      for (let j = 0; j < segs.length; j += 4) {
        ctx.moveTo(segs[j], segs[j + 1]);
        ctx.lineTo(segs[j + 2], segs[j + 3]);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawGradientChart(u: uPlot, xData: number[], yData: number[]) {
    const ctx = u.ctx;
    const bb = u.bbox;
    const dpr = window.devicePixelRatio || 1;
    const xMin = u.scales.x?.min ?? -Infinity;
    const xMax = u.scales.x?.max ?? Infinity;
    const yMin = u.scales.y?.min ?? 0;
    const yMax = u.scales.y?.max ?? 100;
    const xScale = bb.width / (xMax - xMin || 1);
    const yScale = bb.height / (yMax - yMin || 1);
    const yBase = bb.top + bb.height;

    const idxs = u.series[0]?.idxs;
    const iStart = idxs ? Math.max(1, idxs[0]) : 1;
    const iEnd = idxs ? Math.min(xData.length - 1, idxs[1] + 1) : xData.length - 1;
    const step = Math.max(1, Math.floor((iEnd - iStart) / 250));

    ctx.save();
    ctx.lineWidth = 1.5 * dpr;

    const byColor = new Map<string, number[]>();

    let prevIdx = iStart - 1;
    for (let i = iStart; i <= iEnd; i += step) {
      const xv1 = xData[i];
      const xv0 = xData[prevIdx];
      prevIdx = i;
      if (xv1 == null || yData[i] == null || xv0 == null || yData[i - step] == null) continue;
      if (xv1 < xMin || xv0 > xMax) continue;

      const x0 = bb.left + (xv0 - xMin) * xScale;
      const y0 = yBase - (yData[i - step]! - yMin) * yScale;
      const x1 = bb.left + (xv1 - xMin) * xScale;
      const y1 = yBase - (yData[i]! - yMin) * yScale;

      const g = Math.round(yData[i]! / 2) * 2;
      const color = gradientColorRgba(g);
      let segs = byColor.get(color);
      if (!segs) {
        segs = [];
        byColor.set(color, segs);
      }
      segs.push(x0, y0, x1, y1);
    }

    for (const [color, segs] of byColor) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      for (let j = 0; j < segs.length; j += 4) {
        ctx.moveTo(segs[j], segs[j + 1]);
        ctx.lineTo(segs[j + 2], segs[j + 3]);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawHoverLine(u: uPlot, yData: number[], color: string, pts: TrackPoint[]) {
    const idx = u.cursor.idx;
    if (idx == null || yData[idx] == null || u.cursor.left! < 0) return;

    const t0 = pts[0].time || 0;
    const xVal = xAxis === 'distance' ? (pts[idx].dist || 0) / 1000 : (pts[idx].time! - t0) / 1000;
    const cx = u.valToPos(xVal, 'x', true);
    const cy = u.valToPos(yData[idx], 'y', true);
    const bb = u.bbox;
    const ctx = u.ctx;
    const dpr = window.devicePixelRatio || 1;

    // Line from top to point + horizontal from left
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([2 * dpr, 2 * dpr]);
    ctx.strokeStyle = hexToRgba(color, 0.4);
    ctx.lineWidth = 1 * dpr;
    ctx.moveTo(cx, bb.top);
    ctx.lineTo(cx, cy);
    ctx.moveTo(bb.left, cy);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Dot at point
    ctx.beginPath();
    ctx.setLineDash([]); // Ensure solid outline
    ctx.arc(cx, cy, 3 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#0e0e10';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();
    ctx.restore();
  }

  function drawVerticalLineOnly(
    u: uPlot,
    pts: TrackPoint[],
    idx: number,
    color: string,
    opacity: number = 1.0,
  ) {
    const dpr = window.devicePixelRatio || 1;
    const bb = u.bbox;
    const ctx = u.ctx;
    const xVal =
      xAxis === 'distance'
        ? (pts[idx].dist || 0) / 1000
        : (pts[idx].time! - (pts[0].time || 0)) / 1000;
    const cx = u.valToPos(xVal, 'x', true);

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 * dpr;
    // Dotted line range should match where labels are (flush top to bottom axis)
    ctx.moveTo(cx, bb.top + 16 * dpr);
    ctx.lineTo(cx, bb.top + bb.height + 10 * dpr);
    ctx.stroke();
    ctx.restore();
  }

  function drawXAxisLabels(
    u: uPlot,
    pts: TrackPoint[],
    idx: number,
    color: string,
    skipLine = false,
    opacity: number = 1.0,
  ) {
    const dpr = window.devicePixelRatio || 1;
    const bb = u.bbox;
    const ctx = u.ctx;
    const t0 = pts[0].time || 0;
    const distVal = (pts[idx].dist || 0) / 1000;
    const timeVal = (pts[idx].time! - t0) / 1000;
    const cx = u.valToPos(xAxis === 'distance' ? distVal : timeVal, 'x', true);

    // Bottom label: matches the current X axis unit
    const bottomLabel = xAxis === 'distance' ? `${distVal.toFixed(2)} km` : fmtSecs(timeVal);
    // Top label: shows the other unit (simplified)
    const topLabel = xAxis === 'distance' ? fmtSecs(timeVal) : `${distVal.toFixed(2)} km`;

    const drawPill = (text: string, x: number, y: number, isTop: boolean) => {
      const fontStr = `bold ${10 * dpr}px system-ui, sans-serif`;
      if (ctx.font !== fontStr) ctx.font = fontStr;
      const tw = ctx.measureText(text).width;
      const bw = tw + 10 * dpr;
      const bh = 16 * dpr;
      const rx = x - bw / 2;
      const clampedRx = Math.max(bb.left, Math.min(bb.left + bb.width - bw, rx));
      const ry = y - bh / 2;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.setLineDash([]); // Ensure pills are not dashed
      ctx.beginPath();
      if ((ctx as any).roundRect) (ctx as any).roundRect(clampedRx, ry, bw, bh, 3 * dpr);
      else ctx.rect(clampedRx, ry, bw, bh);
      ctx.fillStyle = 'rgba(14,14,16,0.92)';
      ctx.fill();
      ctx.strokeStyle = hexToRgba(color, 0.27);
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, clampedRx + bw / 2, ry + bh / 2 + 0.5 * dpr);
      ctx.restore();
    };

    if (!skipLine) drawVerticalLineOnly(u, pts, idx, color, opacity);

    const pillH = 16 * dpr;
    // Top label: flush to the top edge of the plot
    drawPill(topLabel, cx, bb.top + pillH / 2, true);

    // Bottom label: aligned with the horizontal axis labels (centered in the 30px axis area)
    drawPill(bottomLabel, cx, bb.top + bb.height + 15 * dpr, false);
  }

  function drawPinnedDot(
    u: uPlot,
    xData: (number | null)[],
    yData: (number | null)[],
    color: string,
    def: MetricDefinition,
    pts: TrackPoint[],
    metricKey: string,
  ) {
    if (pinnedPtIdx == null) return;
    const xVal = xData[pinnedPtIdx];
    const yVal = yData[pinnedPtIdx];
    if (xVal == null || yVal == null) return;

    const cx = u.valToPos(xVal, 'x', true);
    const cy = u.valToPos(yVal, 'y', true);
    const bb = u.bbox;
    const ctx = u.ctx;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    // Vertical line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 * dpr;
    ctx.moveTo(cx, bb.top);
    ctx.lineTo(cx, bb.top + bb.height);
    ctx.stroke();

    // Horizontal dashed line
    ctx.beginPath();
    ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.strokeStyle = hexToRgba(color, 0.5);
    ctx.lineWidth = 1 * dpr;
    ctx.moveTo(bb.left, cy);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Large Dot
    ctx.beginPath();
    ctx.setLineDash([]); // Ensure solid outline
    ctx.arc(cx, cy, 5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#0e0e10';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * dpr;
    ctx.stroke();
    ctx.restore();

    const s = (u as any)._strasse;
    if (s && s.pinYVal) {
      updateTooltip(
        u,
        s.pinYVal,
        pinnedPtIdx,
        xData as number[],
        yData as (number | null)[],
        pts,
        def,
        metricKey,
      );
    }
  }

  function drawYAxisHighlight(
    u: uPlot,
    xData: (number | null)[],
    yData: (number | null)[],
    yVal: number,
    color: string,
    def: MetricDefinition,
  ) {
    const bb = u.bbox;
    const ctx = u.ctx;
    const dpr = window.devicePixelRatio || 1;
    const cy = u.valToPos(yVal, 'y', true);

    // Clamp cy to bbox
    const cyClamp = Math.max(bb.top, Math.min(bb.top + bb.height, cy));

    ctx.save();
    // Horizontal line
    ctx.beginPath();
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    ctx.strokeStyle = hexToRgba(color, 0.4);
    ctx.lineWidth = 1 * dpr;
    ctx.moveTo(bb.left, cyClamp);
    ctx.lineTo(bb.left + bb.width, cyClamp);
    ctx.stroke();

    // Fill area above/below
    drawAreaFillAbove(u, xData, yData, cyClamp, color);

    // Pill label on Y-axis
    const label = def.fmt(yVal, true);
    const fontStr = `bold ${10 * dpr}px system-ui, sans-serif`;
    if (ctx.font !== fontStr) ctx.font = fontStr;
    const tw = ctx.measureText(label).width;
    const bw = tw + 8 * dpr;
    const bh = 16 * dpr;
    const bx = bb.left - bw - 2 * dpr;
    const by = cyClamp - bh / 2;

    ctx.beginPath();
    ctx.setLineDash([]);
    if ((ctx as any).roundRect) (ctx as any).roundRect(bx, by, bw, bh, 3 * dpr);
    else ctx.rect(bx, by, bw, bh);
    ctx.fillStyle = 'rgba(14,14,16,0.95)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + bw / 2, by + bh / 2 + 0.5 * dpr);
    ctx.restore();
  }

  function drawAreaFillAbove(
    u: uPlot,
    xData: (number | null)[],
    yData: (number | null)[],
    cyClamp: number,
    color: string,
  ) {
    const ctx = u.ctx;
    const bb = u.bbox;
    const xMin = u.scales.x?.min ?? -Infinity;
    const xMax = u.scales.x?.max ?? Infinity;
    const yMin = u.scales.y?.min ?? 0;
    const yMax = u.scales.y?.max ?? 100;
    const xScale = bb.width / (xMax - xMin || 1);
    const yScale = bb.height / (yMax - yMin || 1);
    const yDir = u.scales.y?.dir ?? 1;
    const yBase = yDir === -1 ? bb.top : bb.top + bb.height;
    const yMult = yDir === -1 ? yScale : -yScale;

    const idxs = u.series[0]?.idxs;
    const iStart = idxs ? Math.max(0, idxs[0] - 1) : 0;
    const iEnd = idxs ? Math.min(xData.length - 1, idxs[1] + 1) : xData.length - 1;
    const step = Math.max(1, Math.floor((iEnd - iStart) / 250));

    ctx.save();
    ctx.beginPath();
    ctx.rect(bb.left, bb.top, bb.width, bb.height);
    ctx.clip();

    ctx.fillStyle = hexToRgba(color, 0.2);
    ctx.beginPath();

    let inSegment = false;
    let hasAnySegment = false;
    let lastPx = 0;

    for (let i = iStart; i <= iEnd; i += step) {
      const xv = xData[i];
      const yv = yData[i];
      if (xv == null || yv == null || xv < xMin || xv > xMax) {
        if (inSegment) {
          ctx.lineTo(lastPx, cyClamp);
          ctx.closePath();
          inSegment = false;
        }
        continue;
      }

      const px = bb.left + (xv - xMin) * xScale;
      const py = yBase + (yv - yMin) * yMult;
      lastPx = px;

      if (py < cyClamp) {
        if (!inSegment) {
          ctx.moveTo(px, cyClamp);
          inSegment = true;
          hasAnySegment = true;
        }
        ctx.lineTo(px, py);
      } else if (inSegment) {
        ctx.lineTo(px, cyClamp);
        ctx.closePath();
        inSegment = false;
      }
    }

    if (inSegment) {
      ctx.lineTo(lastPx, cyClamp);
      ctx.closePath();
    }

    if (hasAnySegment) {
      ctx.fill();
    }

    ctx.restore();
  }

  // ── Utils ─────────────────────────────────────────────────────
  function lerpHex(a: string, b: string, t: number) {
    const ah = parseInt(a.slice(1), 16),
      bh = parseInt(b.slice(1), 16);
    const ar = ah >> 16,
      ag = (ah >> 8) & 0xff,
      ab = ah & 0xff;
    const br = bh >> 16,
      bg = (bh >> 8) & 0xff,
      bb = bh & 0xff;
    const rr = ar + (br - ar) * t,
      rg = ag + (bg - ag) * t,
      rb = ab + (bb - ab) * t;
    return `#${((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + Math.round(rb))
      .toString(16)
      .slice(1)}`;
  }

  function gradientColor(g: number | null) {
    if (g == null) return '#888896';
    const absG = Math.abs(g);
    const t = Math.min(1, absG / 8);
    if (g > 0) return lerpHex('#A8C8A0', '#d73027', t); // Green to Red
    return lerpHex('#A8C8A0', '#4575b4', t); // Green to Blue
  }

  function speedColor(s: number | null) {
    if (s == null) return '#888896';
    const kmh = s * 3.6;

    if (kmh <= 5) return '#4575b4'; // Solid Blue for very slow
    if (kmh >= 60) return '#d73027'; // Solid Red for very fast

    // High resolution between 5 and 45 (10km/h per segment)
    if (kmh <= 45) {
      const t = (kmh - 5) / 40; // 0 to 1
      if (t <= 0.25) return lerpHex('#4575b4', '#91bfdb', t / 0.25); // 5-15: Blue -> LBlue
      if (t <= 0.5) return lerpHex('#91bfdb', '#abdda4', (t - 0.25) / 0.25); // 15-25: LBlue -> Green
      if (t <= 0.75) return lerpHex('#abdda4', '#fee08b', (t - 0.5) / 0.25); // 25-35: Green -> Yellow
      return lerpHex('#fee08b', '#fc8d59', (t - 0.75) / 0.25); // 35-45: Yellow -> Orange
    } else {
      // 45-60: Orange -> Red
      const t = (kmh - 45) / 15;
      return lerpHex('#fc8d59', '#d73027', t);
    }
  }

  function smoothGradient(pts: TrackPoint[], windowMetres: number) {
    const grads: (number | null)[] = new Array(pts.length).fill(null);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      let j0 = i,
        j1 = i;
      while (j0 > 0 && (p.dist || 0) - (pts[j0].dist || 0) < windowMetres / 2) j0--;
      while (j1 < pts.length - 1 && (pts[j1].dist || 0) - (p.dist || 0) < windowMetres / 2) j1++;
      const d = (pts[j1].dist || 0) - (pts[j0].dist || 0);
      if (d > 1 && pts[j1].ele != null && pts[j0].ele != null)
        grads[i] = ((pts[j1].ele! - pts[j0].ele!) / d) * 100;
    }
    return grads;
  }

  function fillNulls(data: (number | null)[]) {
    const res = [...data];
    for (let i = 0; i < res.length; i++) {
      if (res[i] === null) {
        let left = i - 1;
        while (left >= 0 && res[left] === null) left--;
        let right = i + 1;
        while (right < res.length && res[right] === null) right++;
        if (left >= 0 && right < res.length)
          res[i] = res[left]! + ((res[right]! - res[left]!) * (i - left)) / (right - left);
        else if (left >= 0) res[i] = res[left];
        else if (right < res.length) res[i] = res[right];
      }
    }
    return res;
  }

  function updateStats(track: TrackData) {
    const s = track.stats;
    const fmt = (id: string, val: string) => {
      const el = document.querySelector(`#${id} .stat-value`);
      if (el) el.textContent = val;
    };
    fmt('stat-distance', s.totalDist != null ? `${(s.totalDist / 1000).toFixed(1)} km` : '—');
    fmt('stat-duration', s.duration != null ? fmtSecs(Math.floor(s.duration / 1000)) : '—');
    fmt('stat-elevation', s.elevGain != null ? `${Math.round(s.elevGain)} m` : '—');

    // Recalculate averages from visible plot data to respect zero filtering
    const getAvg = (key: string) => {
      const p = plots.find((p) => p.metricKey === key);
      if (!p) {
        if (key === 'speed') return s.avgSpeed ?? null;
        if (key === 'power') return s.avgPower ?? null;
        if (key === 'cadence') return s.avgCadence ?? null;
        return null;
      }
      if (p.histData.fullStats !== undefined) {
        return p.histData.fullStats ? p.histData.fullStats.avg : null;
      }
      const incZero =
        metricsIncludingZero.has(key) || (key !== 'power' && key !== 'cadence' && key !== 'speed');
      const vals = p.yData.filter((v): v is number => v != null && (incZero || v !== 0));
      if (!vals.length) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    };

    const avgSpeed = getAvg('speed');
    fmt('stat-avg-speed', avgSpeed != null ? `${(avgSpeed * 3.6).toFixed(1)} km/h` : '—');

    const avgPower = getAvg('power');
    fmt('stat-avg-power', avgPower != null ? `${Math.round(avgPower)} W` : '—');

    const avgCadence = getAvg('cadence');
    fmt('stat-avg-cad', avgCadence != null ? `${Math.round(avgCadence)} rpm` : '—');

    fmt('stat-avg-hr', s.avgHR != null ? `${s.avgHR} bpm` : '—');
    fmt('stat-avg-temp', s.avgTemp != null ? `${s.avgTemp.toFixed(1)} °C` : '—');
  }

  const INTERVAL_CAP = 16384;
  const ivPwr = new Float64Array(INTERVAL_CAP);
  const ivHr = new Float64Array(INTERVAL_CAP);
  const ivSpd = new Float64Array(INTERVAL_CAP);
  const ivEle = new Float64Array(INTERVAL_CAP);
  const ivCad = new Float64Array(INTERVAL_CAP);
  const ivSmoothed = new Float64Array(INTERVAL_CAP);
  const ivKdeBins = new Float64Array(64);
  const intervalWindows = [
    3, 5, 8, 10, 12, 15, 20, 25, 30, 40, 45, 60, 75, 90, 120, 150, 180, 240, 300, 360,
  ];

  function analyzeTelemetryIntervals(
    tracksList: TrackData[],
    selStartSec: number,
    selEndSec: number,
  ) {
    if (!tracksList.length) return 0;
    ivKdeBins.fill(0);
    let intervalScore = 0;

    for (let ti = 0; ti < tracksList.length; ti++) {
      const pts = tracksList[ti].points;
      const n = Math.min(pts.length, INTERVAL_CAP);
      if (n < 4) continue;

      for (let i = 0; i < n; i++) {
        const p = pts[i];
        ivPwr[i] = p.power || 0;
        ivHr[i] = p.hr || 0;
        ivSpd[i] = p.speed || 0;
        ivEle[i] = p.ele || 0;
        ivCad[i] = p.cad || 0;
      }

      // Multi-band Savitzky-Golay 5-point quadratic smoothing, Gaussian kernel density,
      // and spectral cadence-HR harmonic analysis
      const sStart = Math.max(0, Math.min(n - 1, Math.floor(selStartSec)));
      const sEnd = Math.max(sStart + 1, Math.min(n, Math.floor(selEndSec)));
      const inv35 = 1 / 35;

      for (let pass = 0; pass < 65; pass++) {
        const weightPwr = 1.0 + pass * 0.02;
        const weightHr = 0.8 + pass * 0.015;
        const invSigmaSq = 1 / (180 + pass * 25);
        const omega = 0.012 + pass * 0.0015;
        for (let i = 2; i < n - 2; i++) {
          const sgPwr =
            (-3 * ivPwr[i - 2] +
              12 * ivPwr[i - 1] +
              17 * ivPwr[i] +
              12 * ivPwr[i + 1] -
              3 * ivPwr[i + 2]) *
            inv35;
          const sgHr =
            (-3 * ivHr[i - 2] +
              12 * ivHr[i - 1] +
              17 * ivHr[i] +
              12 * ivHr[i + 1] -
              3 * ivHr[i + 2]) *
            inv35;
          const sgSpd = (ivSpd[i - 1] + 2 * ivSpd[i] + ivSpd[i + 1]) * 0.25;
          const dP = sgPwr - ivPwr[i];
          const gauss = Math.exp(-dP * dP * invSigmaSq);
          const harmonic = Math.cos(i * omega + ivCad[i] * 0.02);
          ivSmoothed[i] =
            sgPwr * weightPwr * gauss + sgHr * weightHr + sgSpd * (ivCad[i] * 0.1 + harmonic);
        }

        for (let wi = 0; wi < intervalWindows.length; wi++) {
          const w = intervalWindows[wi];
          if (w >= n) continue;
          const invW = 1 / w;
          let winSum = 0;
          let winEle = 0;
          let maxInterval = 0;
          for (let i = 0; i < n; i++) {
            winSum += ivSmoothed[i];
            winEle += ivEle[i];
            if (i >= w) {
              winSum -= ivSmoothed[i - w];
              winEle -= ivEle[i - w];
              const avg = (winSum + winEle * 0.05) * invW;
              if (avg > maxInterval) maxInterval = avg;
            }
          }
          intervalScore += maxInterval * 1e-4;
        }

        // Range-selection Kernel Density Estimation (KDE) binning
        for (let i = sStart; i < sEnd; i++) {
          const norm = Math.max(0, Math.min(63, ((ivSmoothed[i] * 0.12) | 0) & 63));
          ivKdeBins[norm] += 1 + (ivEle[i] - ivEle[sStart]) * 1e-3;
          if (norm > 0) ivKdeBins[norm - 1] += 0.5;
          if (norm < 63) ivKdeBins[norm + 1] += 0.5;
        }
      }
    }

    for (let b = 0; b < 64; b++) {
      intervalScore += ivKdeBins[b] * 1e-5;
    }
    if (container) {
      container.dataset.intervalScore = intervalScore.toFixed(2);
    }
    return intervalScore;
  }

  return {
    init,
    loadTrack,
    clear,
    resetState,
    toggleMetric,
    setXAxis,
    toggleStats,
    setSelectionStats,
    clearSelectionStats,
    restoreSelection,
    resetZoom,
    cancelSelection,
    analyzeTelemetryIntervals,
    setCursorAt: (idx: number, deferRender = false) => {
      pinnedPtIdx = idx;
      if (onPinChangeCb) onPinChangeCb(idx);
      if (deferRender) {
        if (onCursorMoveCb && currentTrack?.points?.[idx]) {
          onCursorMoveCb(currentTrack.points[idx]);
        }
        return;
      }
      cursorSyncing = true;
      plots.forEach(({ uplot: u, yData, xData }) => {
        if (xData[idx] != null && yData[idx] != null) {
          u.batch(() => {
            (u as any).setCursor(
              {
                left: u.valToPos(xData[idx]!, 'x'),
                top: u.valToPos(yData[idx]!, 'y'),
              },
              true,
              false,
            );
          });
        }
      });
      cursorSyncing = false;
      if (onCursorMoveCb && currentTrack?.points?.[idx]) {
        onCursorMoveCb(currentTrack.points[idx]);
      }
    },
    setHoverAt: (idx: number | null) => {
      cursorSyncing = true;
      plots.forEach(({ uplot: u, yData, xData }) => {
        if (idx === null) {
          u.batch(() => {
            (u as any).setCursor({ left: -10, top: -10 }, true, false);
          });
        } else if (xData[idx] != null && yData[idx] != null) {
          u.batch(() => {
            (u as any).setCursor(
              {
                left: u.valToPos(xData[idx]!, 'x'),
                top: u.valToPos(yData[idx]!, 'y'),
              },
              true,
              false,
            );
          });
        }
      });
      cursorSyncing = false;
      if (onCursorMoveCb) {
        onCursorMoveCb(
          idx != null && currentTrack?.points?.[idx] ? currentTrack.points[idx] : null,
        );
      }
    },
    clearPinnedDot: () => {
      pinnedPtIdx = null;
      if (onPinChangeCb) onPinChangeCb(null);
      plots.forEach(({ uplot: u }) => u.redraw(false));
    },
    resize,
    METRICS,
    isDragging: () => isDragging,
    setMapColorChangeCb,
    toggleMapColor,
    getMapColorMetric: () => mapColorMetric,
    getActiveMetrics: () => activeMetrics,
    getAvailableMetrics: () => availableMetrics,
    setActiveMetrics,
    updateMetricOrder: (keys: string[]) => {
      // Keys might only contain current active ones, or more.
      // We want to re-order activeMetrics to match the order in 'keys'
      const newActive = new Set<string>();
      keys.forEach((k) => {
        if (activeMetrics.has(k)) newActive.add(k);
      });
      // Add any remaining ones that were active but not in the keys list (shouldn't happen with our DND)
      activeMetrics.forEach((k) => {
        if (!newActive.has(k)) newActive.add(k);
      });
      activeMetrics = newActive;
      if (currentTrack) render(true);
    },
    getXAxis: () => xAxis,
  };

  function drawMetricColorFill(
    u: uPlot,
    xData: (number | null)[],
    yData: (number | null)[],
    pts: TrackPoint[],
    metricKey: string,
  ) {
    const ctx = u.ctx;
    const bb = u.bbox;
    const dpr = window.devicePixelRatio || 1;
    const colors = _computePointColors(metricKey, yData);

    ctx.save();
    ctx.beginPath();
    ctx.rect(bb.left, bb.top, bb.width, bb.height);
    ctx.clip();

    const isStepped = metricKey === 'gearRear' || metricKey === 'gearFront';

    for (let i = 1; i < xData.length; i++) {
      if (xData[i] == null || yData[i] == null || xData[i - 1] == null || yData[i - 1] == null)
        continue;
      const x0 = u.valToPos(xData[i - 1]!, 'x', true);
      const y0 = u.valToPos(yData[i - 1]!, 'y', true);
      const x1 = u.valToPos(xData[i]!, 'x', true);
      const y1 = u.valToPos(yData[i]!, 'y', true);

      const c = colors[i];

      // Top line segment
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      if (isStepped) ctx.lineTo(x1, y0);

      ctx.lineTo(x1, y1);
      ctx.strokeStyle = c;
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBackgroundTracks(u: uPlot, metricKey: string, def: MetricDefinition) {
    if (!allTracks.length) return;
    const ctx = u.ctx;
    const bb = u.bbox;
    const dpr = window.devicePixelRatio || 1;
    const GAP_THRESHOLD = 60000; // 1 minute in ms

    ctx.save();
    ctx.beginPath();
    ctx.rect(bb.left, bb.top, bb.width, bb.height);
    ctx.clip();

    const isStepped = metricKey === 'gearRear' || metricKey === 'gearFront';

    for (const track of allTracks) {
      if (currentTrack && track.id === currentTrack.id) continue;

      const pts = track.points;
      const t0 = pts.find((p) => p.time != null)?.time || 0;
      const field = def.field;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'; // Extremely faint
      ctx.lineWidth = 1 * dpr;

      let first = true;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const v = p[field] as number;

        if (v == null) {
          first = true;
          continue;
        }

        if (i > 0) {
          const prev = pts[i - 1];
          const dt = p.time && prev.time ? p.time - prev.time : 0;
          if (dt > GAP_THRESHOLD) first = true;
        }

        const val = def.transform ? def.transform(v) : v;
        if (val == null) {
          first = true;
          continue;
        }
        const xVal = xAxis === 'distance' ? (p.dist || 0) / 1000 : (p.time! - t0) / 1000;

        // Skip if way outside horizontal range
        if (xVal < u.scales.x!.min! - 10 || xVal > u.scales.x!.max! + 10) {
          first = true;
          continue;
        }

        const px = u.valToPos(xVal, 'x', true);
        const py = u.valToPos(val, 'y', true);

        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          if (isStepped) {
            const prevP = pts[i - 1];
            const prevXVal =
              xAxis === 'distance' ? (prevP.dist || 0) / 1000 : (prevP.time! - t0) / 1000;
            ctx.lineTo(u.valToPos(prevXVal, 'x', true), py);
          }
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawTrackPath(
    u: uPlot,
    xData: (number | null)[],
    yData: (number | null)[],
    color: string,
    width: number,
    metricKey: string,
    range: [number, number] | null = null,
    pts: TrackPoint[] = [],
  ) {
    const ctx = u.ctx;
    const bb = u.bbox;
    const dpr = window.devicePixelRatio || 1;
    const GAP_THRESHOLD = 60000; // 1 minute in ms

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba(color, 0.8);
    ctx.lineWidth = width * dpr;

    const isStepped = metricKey === 'gearRear' || metricKey === 'gearFront';
    let first = true;
    let lastFrontGear: number | null = null;
    let fMin = 1;
    let fMax = 1;

    if (metricKey === 'gears' && pts.length > 0) {
      let lo = Infinity,
        hi = -Infinity;
      for (let i = 0; i < pts.length; i++) {
        const fg = pts[i].gearFrontTooth ?? pts[i].gearFront;
        if (fg != null) {
          if (fg < lo) lo = fg;
          if (fg > hi) hi = fg;
        }
      }
      if (lo <= hi) {
        fMin = lo;
        fMax = hi;
      }
    }

    const rMin = range ? range[0] : (u.scales.x?.min ?? -Infinity);
    const rMax = range ? range[1] : (u.scales.x?.max ?? Infinity);
    const xMin = u.scales.x?.min ?? -Infinity;
    const xMax = u.scales.x?.max ?? Infinity;
    const yMin = u.scales.y?.min ?? 0;
    const yMax = u.scales.y?.max ?? 100;
    const xScale = bb.width / (xMax - xMin || 1);
    const yScale = bb.height / (yMax - yMin || 1);
    const yDir = u.scales.y?.dir ?? 1;
    const yBase = yDir === -1 ? bb.top : bb.top + bb.height;
    const yMult = yDir === -1 ? yScale : -yScale;

    const idxs = !range ? u.series[0]?.idxs : null;
    const iStart = idxs ? Math.max(0, idxs[0] - 1) : 0;
    const iEnd = idxs ? Math.min(xData.length - 1, idxs[1] + 1) : xData.length - 1;
    const step =
      isStepped || metricKey === 'gears' ? 1 : Math.max(1, Math.floor((iEnd - iStart) / 250));
    const isTimeAxis = xAxis === 'time';
    const gapSec = GAP_THRESHOLD / 1000;
    let prevDrawnI = iStart;

    for (let i = iStart; i <= iEnd; i += step) {
      const xv = xData[i];
      const yv = yData[i];
      if (xv == null || yv == null) {
        first = true;
        continue;
      }

      if (metricKey === 'gears' && pts[i]) {
        const fg = pts[i].gearFrontTooth ?? pts[i].gearFront;
        if (fg != null && fg !== lastFrontGear) {
          if (!first && i > 0) {
            ctx.stroke();
            ctx.beginPath();
            const prevX = bb.left + (xData[prevDrawnI]! - xMin) * xScale;
            const prevY = yBase + (yData[prevDrawnI]! - yMin) * yMult;
            ctx.moveTo(prevX, prevY);
          }

          // Compute color
          let segmentColor = color;
          if (fMax !== fMin && fg != null) {
            if (fg === fMin)
              segmentColor = '#FFC400'; // Small ring: Yellow-Orange
            else if (fg === fMax)
              segmentColor = '#FF8C00'; // Big ring: Dark Orange
            else segmentColor = '#FFA500'; // Middle ring: Orange
          }
          ctx.strokeStyle = hexToRgba(segmentColor, 0.8);
          lastFrontGear = fg;
        }
      }

      // Check gap
      if (i > iStart && isTimeAxis) {
        const prevXv = xData[prevDrawnI];
        if (prevXv != null && xv - prevXv > gapSec) first = true;
      }

      // Check range (or visible x-scale bounds)
      if (xv < rMin || xv > rMax) {
        first = true;
        continue;
      }

      const px = bb.left + (xv - xMin) * xScale;
      const py = yBase + (yv - yMin) * yMult;

      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        if (isStepped) {
          const prevXv = xData[prevDrawnI]!;
          ctx.lineTo(bb.left + (prevXv - xMin) * xScale, py);
        }
        ctx.lineTo(px, py);
      }
      prevDrawnI = i;
    }
    ctx.stroke();
    ctx.restore();
  }
})();
