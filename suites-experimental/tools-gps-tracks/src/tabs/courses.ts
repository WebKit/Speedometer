// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { MapView } from '../map';
import { Storage } from '../storage';
import { UrlState } from '../url-state';
import { fmtPace, fmtDate, haversine } from '../utils';
import { SPORTS } from '../sports';
import { METRICS } from '../metrics';
import { ChartView } from '../charts';

export interface CoursePoint {
  lat: number;
  lon: number;
  radius: number; // in meters
  name?: string;
}

export interface Course {
  id: string;
  name: string;
  points: CoursePoint[];
}

export interface CourseTrackEffortView {
  id: string;
  displayName: string;
  date: string;
  sport: string | null;
  color: string;
  duration: number;
  dist: number;
  avgWatts: number | null;
  avgHR: number | null;
  avgSpeed: number | null;
  avgCadence: number | null;
  avgVam: number | null;
  splitsSummary: string;
  gapLabel: string;
  dtwDistance: number;
  distStr: string;
  durationStr: string;
  speedStr: string;
  paceStr: string;
  vamStr: string;
  wattsStr: string;
  hrStr: string;
  startIdx: number;
  endIdx: number;
  isSelected: boolean;
}

export interface CourseViewModel {
  id: string;
  name: string;
  points: CoursePoint[];
  pointsCount: number;
  distanceKm: string;
  matchingCount: number;
  isOpen: boolean;
  isActive: boolean;
  matchedTracks: CourseTrackEffortView[];
}

export interface CoursesComputedPayload {
  courseViews: CourseViewModel[];
  selectedCourseSummary: CourseViewModel | null;
  totalMatchesCount: number;
  corridorDeviationStr: string;
  isEditMode: boolean;
  activeCourseId: string | null;
  openCourseId: string | null;
}

let courses: Course[] = [];
let activeCourseId: string | null = null;
let isEditMode = false;
let openCourseId: string | null = null;
let toastFn: (msg: string, type?: string) => void = () => {};
let coursesComponentRef: any = null;

export function registerCoursesComponent(comp: any) {
  coursesComponentRef = comp;
}

function getCoursesComponent(): any {
  return coursesComponentRef || (window as any).__trackStateService?.coursesTab || null;
}

export function getCoursesList(): Course[] {
  return courses;
}

export function getCoursesEditMode(): boolean {
  return isEditMode;
}

export function setCoursesEditMode(mode: boolean) {
  isEditMode = mode;
  if (!mode) {
    MapView.setCustomClickHandler(null);
    document.getElementById('map-container')?.classList.remove('editing-mode');
  }
}

export function getCoursesForTrack(track: any): Course[] {
  return courses.filter((c) => {
    if (c.points.length === 0) return false;
    for (const pt of c.points) {
      let passesPoint = false;
      for (const trackPt of track.points) {
        const d = haversine(pt.lat, pt.lon, trackPt.lat, trackPt.lon);
        if (d <= pt.radius) {
          passesPoint = true;
          break;
        }
      }
      if (!passesPoint) return false;
    }
    return true;
  });
}

export function initCourses(showToast: (msg: string, type?: string) => void) {
  toastFn = showToast;
  loadCourses();
}

export function resetCourses() {
  courses = [];
  activeCourseId = null;
  openCourseId = null;
  isEditMode = false;
  const comp = getCoursesComponent();
  if (comp && typeof comp.reset === 'function') {
    comp.reset();
    return;
  }
  const container = document.getElementById('courses-view');
  if (container) {
    container.innerHTML = `
      <div id="courses-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">route</span>
        <div class="empty-text">No courses created yet</div>
      </div>
    `;
  }
}

export function prepareBenchmarkCourses(allTracks: any[]) {
  courses = [];
  const specs: {
    trackIdx: number;
    suffix: string;
    fracs: [number, number, number];
    radius: number;
  }[] = [
    { trackIdx: 0, suffix: 'Full Loop', fracs: [0.1, 0.5, 0.85], radius: 450 },
    { trackIdx: 1, suffix: 'Opening Climb Sector', fracs: [0.08, 0.25, 0.45], radius: 450 },
    { trackIdx: 2, suffix: 'Lakeside Corridor', fracs: [0.1, 0.45, 0.8], radius: 850 },
    { trackIdx: 3, suffix: 'Sprint Interval Sector', fracs: [0.2, 0.5, 0.75], radius: 850 },
    { trackIdx: 4, suffix: 'Alpine Grand Tour Stage', fracs: [0.1, 0.5, 0.85], radius: 900 },
    { trackIdx: 5, suffix: 'Summit Finish Climb', fracs: [0.5, 0.72, 0.92], radius: 900 },
  ];

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const t = allTracks[spec.trackIdx] || allTracks[i % Math.max(1, allTracks.length)];
    if (!t?.points || t.points.length < 10) continue;
    const n = t.points.length;
    const pStart = t.points[Math.floor(n * spec.fracs[0])];
    const pMid = t.points[Math.floor(n * spec.fracs[1])];
    const pEnd = t.points[Math.floor(n * spec.fracs[2])];
    courses.push({
      id: `course-${i + 1}`,
      name: `${t.displayName || t.name || `Course ${i + 1}`} — ${spec.suffix}`,
      points: [
        { lat: pStart.lat, lon: pStart.lon, radius: spec.radius, name: 'Start Gate' },
        { lat: pMid.lat, lon: pMid.lon, radius: spec.radius, name: 'Mid Sector' },
        { lat: pEnd.lat, lon: pEnd.lon, radius: spec.radius, name: 'Finish Gate' },
      ],
    });
  }
  if (courses.length > 0) {
    activeCourseId = courses[0].id;
    openCourseId = courses[0].id;
  }
}

export function getBenchmarkCourseIds(): string[] {
  return courses.map((c) => c.id);
}

async function loadCourses() {
  try {
    const stored = await Storage.get('courses');
    if (stored) courses = stored;
  } catch (e) {
    console.error('Courses: Failed to load courses', e);
  }
}

export async function saveCourses() {
  try {
    await Storage.set('courses', courses);
  } catch (e) {
    console.error('Courses: Failed to save courses', e);
    toastFn('Failed to save courses', 'error');
  }
}

export function calculateCourseDistance(course: Course): number {
  let total = 0;
  for (let i = 0; i < course.points.length - 1; i++) {
    const p1 = course.points[i];
    const p2 = course.points[i + 1];
    total += haversine(p1.lat, p1.lon, p2.lat, p2.lon);
  }
  return total / 1000; // in km
}

export function findCourseRange(
  track: any,
  coursePoints: CoursePoint[],
): { startIdx: number; endIdx: number } | null {
  if (coursePoints.length < 2) return null;

  let currentPtIdx = 0;
  let startIdx = -1;
  let endIdx = -1;

  for (let i = 0; i < track.points.length; i++) {
    const tp = track.points[i];
    const cp = coursePoints[currentPtIdx];
    const d = haversine(cp.lat, cp.lon, tp.lat, tp.lon);

    if (d <= cp.radius) {
      if (currentPtIdx === 0) startIdx = i;

      if (currentPtIdx === coursePoints.length - 1) {
        endIdx = i;
        return { startIdx, endIdx };
      }
      currentPtIdx++;
    }
  }
  return null;
}

export function calculateCourseStats(track: any, startIdx: number, endIdx: number) {
  const pts = track.points;
  const n = pts.length;
  if (n === 0 || startIdx > endIdx) {
    return {
      duration: 0,
      dist: 0,
      avgWatts: null,
      avgHR: null,
      avgSpeed: null,
      avgCadence: null,
      avgVam: null,
    };
  }
  const s = Math.max(0, Math.min(startIdx, n - 1));
  const e = Math.max(s, Math.min(endIdx, n - 1));
  const startTime = pts[s]?.time || 0;
  const endTime = pts[e]?.time || 0;
  const duration = (endTime - startTime) / 1000; // in seconds

  let totalPower = 0;
  let powerCount = 0;
  let totalHR = 0;
  let hrCount = 0;
  let totalSpeed = 0;
  let speedCount = 0;
  let totalCadence = 0;
  let cadenceCount = 0;
  let totalAscent = 0;

  for (let i = s; i <= e; i++) {
    const p = pts[i];
    if (p.power != null) {
      totalPower += p.power;
      powerCount++;
    }
    if (p.hr != null) {
      totalHR += p.hr;
      hrCount++;
    }
    if (p.speed != null) {
      totalSpeed += p.speed;
      speedCount++;
    }
    if (p.cadence != null) {
      totalCadence += p.cadence;
      cadenceCount++;
    }
    if (i > s) {
      const prev = pts[i - 1];
      if (p.ele != null && prev.ele != null) {
        const de = p.ele - prev.ele;
        if (de > 0) totalAscent += de;
      }
    }
  }

  const dist = e > s ? (pts[e].dist || 0) - (pts[s].dist || 0) : 0;

  return {
    duration,
    dist,
    avgWatts: powerCount > 0 ? Math.round(totalPower / powerCount) : null,
    avgHR: hrCount > 0 ? Math.round(totalHR / hrCount) : null,
    avgSpeed: speedCount > 0 ? totalSpeed / speedCount : null,
    avgCadence: cadenceCount > 0 ? Math.round(totalCadence / cadenceCount) : null,
    avgVam: duration > 0 ? Math.round(totalAscent / (duration / 3600)) : null,
  };
}

export function formatCourseDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function renderCourseTableHeaders() {
  return `
    <th><span class="material-symbols-rounded metric-icon date" title="Date">calendar_today</span> Date</th>
    <th><span class="material-symbols-rounded metric-icon" title="Distance">straighten</span> Distance</th>
    <th><span class="material-symbols-rounded metric-icon duration" title="Duration">timer</span> Duration</th>
    <th><span class="material-symbols-rounded metric-icon speed" title="Avg Speed">speed</span> Speed</th>
    <th><span class="material-symbols-rounded metric-icon speed" title="Avg Pace">speed</span> Pace</th>
    <th><span class="material-symbols-rounded metric-icon" style="color: ${METRICS.vam.color}" title="Avg VAM">trending_up</span> VAM</th>
    <th><span class="material-symbols-rounded metric-icon power" title="Avg Power">bolt</span> Power</th>
    <th><span class="material-symbols-rounded metric-icon hr" title="Avg Heart Rate">favorite</span> HR</th>
  `;
}

export function renderCourseTableCells(stats: any, sport: string | null, dateStr: string) {
  const sportDef = sport ? SPORTS[sport.toLowerCase()] : null;
  const paceUnit = sportDef?.paceUnit || 'km';
  let paceStr = '--';
  if (stats.avgSpeed != null && stats.avgSpeed > 0.1) {
    const paceSeconds = (paceUnit === 'km' ? 1000 : 100) / stats.avgSpeed;
    paceStr = `${fmtPace(paceSeconds)}&nbsp;min/${paceUnit}`;
  }

  return `
    <td>${dateStr}</td>
    <td>${stats.dist != null ? `${(stats.dist / 1000).toFixed(2)}&nbsp;km` : '-'}</td>
    <td>${formatCourseDuration(stats.duration)}</td>
    <td>${stats.avgSpeed != null ? `${(stats.avgSpeed * 3.6).toFixed(1)}&nbsp;km/h` : '-'}</td>
    <td>${paceStr}</td>
    <td>${stats.avgVam != null ? `${stats.avgVam}&nbsp;m/h` : '-'}</td>
    <td>${stats.avgWatts != null ? `${stats.avgWatts}&nbsp;W` : '-'}</td>
    <td>${stats.avgHR != null ? `${stats.avgHR}&nbsp;bpm` : '-'}</td>
  `;
}

const COURSE_CAP = 16384;
const courseTrkLats = new Float64Array(COURSE_CAP);
const courseTrkLons = new Float64Array(COURSE_CAP);
const courseTrkPwrs = new Float64Array(COURSE_CAP);
const courseGateLats = new Float64Array(32);
const courseGateLons = new Float64Array(32);
const DTW_SAMPLES = 180;
const DTW_BAND = 28;
const dtwRefProfile = new Float64Array(DTW_SAMPLES);
const dtwCandProfile = new Float64Array(DTW_SAMPLES);
const dtwPrevRow = new Float64Array(DTW_SAMPLES + 1);
const dtwCurrRow = new Float64Array(DTW_SAMPLES + 1);

export function computeCoursesViewData(): CoursesComputedPayload {
  // Evaluate multi-gate geospatial course corridor proximity & Dynamic Time Warping (DTW)
  // virtual-partner time-gap alignment matrix for the active/open course across candidate tracks
  let corridorDeviationSum = 0;
  const dtwByTrackId: Record<string, number> = {};
  const targetCourses =
    openCourseId || activeCourseId
      ? courses.filter((c) => c.id === openCourseId || c.id === activeCourseId)
      : courses;

  for (const c of targetCourses) {
    if (c.points.length < 2) continue;
    const candidateIds = MapView.findTracksPassingThroughPoints(
      c.points.map((p) => ({ lat: p.lat, lng: p.lon })),
      c.points[0]?.radius || 20,
    );
    const numGates = 4;
    for (let g = 0; g < numGates; g++) {
      const t = g / (numGates - 1);
      const segFloat = t * (c.points.length - 1);
      const segIdx = Math.min(c.points.length - 2, Math.floor(segFloat));
      const frac = segFloat - segIdx;
      const pA = c.points[segIdx];
      const pB = c.points[segIdx + 1];
      courseGateLats[g] = pA.lat + (pB.lat - pA.lat) * frac;
      courseGateLons[g] = pA.lon + (pB.lon - pA.lon) * frac;
    }
    for (let ci = 0; ci < candidateIds.length; ci++) {
      const id = candidateIds[ci];
      const trk = MapView.getTrackData(id) as any;
      const pts = trk?.points || [];
      const n = Math.min(pts.length, COURSE_CAP);
      if (n === 0) continue;

      for (let i = 0; i < n; i++) {
        const pt = pts[i];
        courseTrkLats[i] = pt.lat;
        courseTrkLons[i] = pt.lon;
        courseTrkPwrs[i] = pt.power || 0;
      }

      for (let g = 0; g < numGates; g++) {
        const gLat = courseGateLats[g];
        const gLon = courseGateLons[g];
        let minDist = Infinity;
        let bestIdx = 0;
        for (let i = 0; i < n; i++) {
          const d = haversine(gLat, gLon, courseTrkLats[i], courseTrkLons[i]);
          if (d < minDist) {
            minDist = d;
            bestIdx = i;
          }
        }
        corridorDeviationSum += minDist + courseTrkPwrs[bestIdx] * 0.01;
      }

      // Resample track telemetry and evaluate single-pass banded DTW virtual-partner pacing alignment
      for (let s = 0; s < DTW_SAMPLES; s++) {
        const idx = Math.min(n - 1, Math.floor((s * (n - 1)) / (DTW_SAMPLES - 1)));
        const pt = pts[idx];
        const val = (pt.speed || 0) * 3.6 + (pt.ele || 0) * 0.05 + (pt.power || 0) * 0.02;
        if (ci === 0) dtwRefProfile[s] = val;
        dtwCandProfile[s] = val;
      }

      dtwPrevRow.fill(1e9);
      dtwPrevRow[0] = 0;
      for (let i = 1; i <= DTW_SAMPLES; i++) {
        dtwCurrRow.fill(1e9);
        const jStart = Math.max(1, i - DTW_BAND);
        const jEnd = Math.min(DTW_SAMPLES, i + DTW_BAND);
        const rVal = dtwRefProfile[i - 1];
        for (let j = jStart; j <= jEnd; j++) {
          const diff = rVal - dtwCandProfile[j - 1];
          const diffSq = diff * diff;
          const cost = diffSq * (2 - 1 / (1 + diffSq * 0.01));
          const m1 = dtwPrevRow[j];
          const m2 = dtwCurrRow[j - 1];
          const m3 = dtwPrevRow[j - 1];
          const prevMin = m1 < m2 ? (m1 < m3 ? m1 : m3) : m2 < m3 ? m2 : m3;
          dtwCurrRow[j] = cost + prevMin;
        }
        dtwPrevRow.set(dtwCurrRow);
      }
      const dtwScore = dtwPrevRow[DTW_SAMPLES] * 1e-4;
      dtwByTrackId[id] = dtwScore;
      corridorDeviationSum += dtwScore;
    }
  }

  const selectedTrackId = UrlState.get().track;
  let totalMatchesCount = 0;

  const courseViews: CourseViewModel[] = courses.map((c) => {
    const pts = c.points.map((p) => ({ lat: p.lat, lng: p.lon }));
    const matchingIds = MapView.findTracksPassingThroughPoints(pts, c.points[0]?.radius || 20);
    totalMatchesCount += matchingIds.length;
    const isOpen = c.id === openCourseId;
    const isActive = c.id === activeCourseId;
    let matchedTracks: CourseTrackEffortView[] = [];

    if (isOpen) {
      const rawMatched = matchingIds
        .map((id) => {
          const track = MapView.getTrackData(id) as any;
          if (!track) return null;
          const range = findCourseRange(track, c.points);
          if (!range) return null;
          const stats = calculateCourseStats(track, range.startIdx, range.endIdx);
          const span = Math.max(1, range.endIdx - range.startIdx);
          const q1Idx = range.startIdx + Math.floor(span * 0.25);
          const q2Idx = range.startIdx + Math.floor(span * 0.5);
          const q3Idx = range.startIdx + Math.floor(span * 0.75);
          const s1Stats = calculateCourseStats(track, range.startIdx, q1Idx);
          const s2Stats = calculateCourseStats(track, q1Idx, q2Idx);
          const s3Stats = calculateCourseStats(track, q2Idx, q3Idx);
          const s4Stats = calculateCourseStats(track, q3Idx, range.endIdx);
          const startTime = track.stats?.startTime || track.points?.[0]?.time;
          const dateStr = startTime ? fmtDate(startTime) : '-';

          const sportDef = track.sport ? SPORTS[track.sport.toLowerCase()] : null;
          const paceUnit = sportDef?.paceUnit || 'km';
          let paceStr = '--';
          if (stats.avgSpeed != null && stats.avgSpeed > 0.1) {
            const paceSeconds = (paceUnit === 'km' ? 1000 : 100) / stats.avgSpeed;
            paceStr = `${fmtPace(paceSeconds)}\u00a0min/${paceUnit}`;
          }

          return {
            id,
            displayName: track.displayName || track.name || id,
            date: dateStr,
            sport: track.sport || null,
            color: track.color || '#FF6B35',
            ...stats,
            splitsSummary: `${s1Stats.avgWatts || 0}/${s2Stats.avgWatts || 0}/${s3Stats.avgWatts || 0}/${s4Stats.avgWatts || 0}W`,
            gapLabel: 'CR',
            dtwDistance: dtwByTrackId[id] || 0,
            distStr: stats.dist != null ? `${(stats.dist / 1000).toFixed(2)}\u00a0km` : '-',
            durationStr: formatCourseDuration(stats.duration),
            speedStr:
              stats.avgSpeed != null ? `${(stats.avgSpeed * 3.6).toFixed(1)}\u00a0km/h` : '-',
            paceStr,
            vamStr: stats.avgVam != null ? `${stats.avgVam}\u00a0m/h` : '-',
            wattsStr: stats.avgWatts != null ? `${stats.avgWatts}\u00a0W` : '-',
            hrStr: stats.avgHR != null ? `${stats.avgHR}\u00a0bpm` : '-',
            startIdx: range.startIdx,
            endIdx: range.endIdx,
            isSelected: id === selectedTrackId,
          } as CourseTrackEffortView;
        })
        .filter((t): t is CourseTrackEffortView => t !== null);

      // Sort by duration (fastest first), tie-break by id
      rawMatched.sort((a, b) => a.duration - b.duration || a.id.localeCompare(b.id));
      const bestDur = rawMatched[0]?.duration || 0;
      rawMatched.forEach((effort, idx) => {
        if (idx === 0) {
          effort.gapLabel = 'KOM / CR';
        } else {
          const delta = Math.max(0, effort.duration - bestDur);
          effort.gapLabel = `+${formatCourseDuration(delta)}`;
        }
      });
      matchedTracks = rawMatched;
    }

    return {
      id: c.id,
      name: c.name,
      points: c.points,
      pointsCount: c.points.length,
      distanceKm: calculateCourseDistance(c).toFixed(2),
      matchingCount: matchingIds.length,
      isOpen,
      isActive,
      matchedTracks,
    };
  });

  const selectedCourseSummary =
    courseViews.find((c) => c.id === openCourseId || c.id === activeCourseId) ||
    courseViews[0] ||
    null;

  return {
    courseViews,
    selectedCourseSummary,
    totalMatchesCount,
    corridorDeviationStr: corridorDeviationSum.toFixed(2),
    isEditMode,
    activeCourseId,
    openCourseId,
  };
}

export function renderCourses() {
  const comp = getCoursesComponent();
  if (comp && typeof comp.render === 'function') {
    comp.render();
    return;
  }
}

export function createNewCourseItem(customName?: string, radius: number = 450): Course {
  const name = customName?.trim() || `Course ${courses.length + 1}`;
  const stateSvc = (window as any).__trackStateService;
  const refTrack = stateSvc?.selectedTrack || stateSvc?.allTracks?.[0];
  const points: CoursePoint[] = [];
  if (refTrack?.points && refTrack.points.length >= 10) {
    const n = refTrack.points.length;
    const pStart = refTrack.points[Math.floor(n * 0.1)];
    const pMid = refTrack.points[Math.floor(n * 0.5)];
    const pEnd = refTrack.points[Math.floor(n * 0.85)];
    points.push(
      { lat: pStart.lat, lon: pStart.lon, radius, name: 'Start Gate' },
      { lat: pMid.lat, lon: pMid.lon, radius, name: 'Mid Sector' },
      { lat: pEnd.lat, lon: pEnd.lon, radius, name: 'Finish Gate' },
    );
  }

  const newCourse: Course = {
    id: `course-${courses.length + 1}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    points,
  };

  courses.push(newCourse);
  activeCourseId = newCourse.id;
  openCourseId = newCourse.id;
  isEditMode = true;
  saveCourses();
  renderCourses();
  return newCourse;
}

export function renameCourseById(id: string, newName: string) {
  const course = courses.find((c) => c.id === id);
  if (!course) return;
  const trimmed = newName.trim();
  if (trimmed !== '') {
    course.name = trimmed;
    saveCourses();
  }
  renderCourses();
}

export function editCourseById(id: string) {
  activeCourseId = id;
  isEditMode = true;
  renderCourses();
}

export function toggleCourseHeader(id: string) {
  activeCourseId = id;
  openCourseId = openCourseId === id ? null : id;
  isEditMode = false;
  MapView.setCustomClickHandler(null);
  renderCourses();
}

export function selectCourse(id: string, open: boolean = false) {
  activeCourseId = id;
  if (open) openCourseId = id;
  isEditMode = false;
  MapView.setCustomClickHandler(null);
  renderCourses();
}

export function deleteCourseById(id: string) {
  if (!confirm('Are you sure you want to delete this course?')) return;
  courses = courses.filter((c) => c.id !== id);
  if (activeCourseId === id) {
    activeCourseId = null;
  }
  if (openCourseId === id) {
    openCourseId = null;
  }
  saveCourses();
  renderCourses();
}

export function selectCourseTrackEffort(trackId: string, startIdx: number, endIdx: number) {
  const track = MapView.getTrackData(trackId);
  if (!track) return;

  const stateSvc = (window as any).__trackStateService;
  if (stateSvc) {
    stateSvc.selectTrack(trackId, false);
  } else {
    document.dispatchEvent(new CustomEvent('select-track', { detail: { id: trackId } }));
  }

  setTimeout(() => {
    const pts = track.points;
    const t0 = pts.find((p: any) => p.time != null)?.time || 0;

    const sIdx = Math.max(0, Math.min(startIdx, pts.length - 1));
    const eIdx = Math.max(0, Math.min(endIdx, pts.length - 1));

    const tMin = Math.max(0, ((pts[sIdx]?.time || 0) - t0) / 1000);
    const tMax = Math.max(0, ((pts[eIdx]?.time || 0) - t0) / 1000);

    const axis = ChartView.getXAxis();
    let selMin = tMin;
    let selMax = tMax;

    if (axis === 'distance') {
      selMin = Math.max(0, (pts[sIdx]?.dist || 0) / 1000);
      selMax = Math.max(0, (pts[eIdx]?.dist || 0) / 1000);
    }

    UrlState.patch({ sel: [selMin, selMax], tab: 'graphs' }, true);
    if (stateSvc) {
      stateSvc.activateTab('graphs', false);
    }
    ChartView.restoreSelection(tMin, tMax);
    MapView.highlightSegment(trackId, track.points, startIdx, endIdx, true);
  }, 50);
}
