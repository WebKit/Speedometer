// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { MapView } from '../map';
import { Storage } from '../storage';
import { UrlState } from '../url-state';
import { escHtml, fmtPace, fmtDate, haversine } from '../utils';
import { SPORTS } from '../sports';
import { METRICS } from '../metrics';
import { selectTrack } from '../app';
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

let courses: Course[] = [];

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

let activeCourseId: string | null = null;
let isEditMode = false;
let openCourseId: string | null = null;
let toastFn: (msg: string, type?: string) => void = () => {};
let courseLayer: any = null;
let zoomListener: (() => void) | null = null;

export function initCourses(showToast: (msg: string, type?: string) => void) {
  toastFn = showToast;
  loadCourses();
}

export function resetCourses() {
  courses = [];
  activeCourseId = null;
  openCourseId = null;
  isEditMode = false;
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
  for (let i = 0; i < Math.min(3, allTracks.length); i++) {
    const t = allTracks[i];
    if (!t?.points || t.points.length < 10) continue;
    const n = t.points.length;
    const pStart = t.points[Math.floor(n * 0.1)];
    const pMid = t.points[Math.floor(n * 0.5)];
    const pEnd = t.points[Math.floor(n * 0.85)];
    courses.push({
      id: `course-${i + 1}`,
      name: `${t.displayName || t.name || `Course ${i + 1}`} Segment`,
      points: [
        { lat: pStart.lat, lon: pStart.lon, radius: 250, name: 'Start' },
        { lat: pMid.lat, lon: pMid.lon, radius: 250, name: 'Checkpoint' },
        { lat: pEnd.lat, lon: pEnd.lon, radius: 250, name: 'Finish' },
      ],
    });
  }
  if (courses.length > 0) {
    activeCourseId = courses[0].id;
    openCourseId = courses[0].id;
  }
}

async function loadCourses() {
  try {
    const stored = await Storage.get('courses');
    if (stored) courses = stored;
  } catch (e) {
    console.error('Courses: Failed to load courses', e);
  }
}

async function saveCourses() {
  try {
    await Storage.set('courses', courses);
  } catch (e) {
    console.error('Courses: Failed to save courses', e);
    toastFn('Failed to save courses', 'error');
  }
}

function calculateCourseDistance(course: Course): number {
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
  const points = track.points.slice(startIdx, endIdx + 1);
  const startTime = points[0]?.time || 0;
  const endTime = points[points.length - 1]?.time || 0;
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

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
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
    if (i > 0) {
      const prev = points[i - 1];
      if (p.ele != null && prev.ele != null) {
        const de = p.ele - prev.ele;
        if (de > 0) totalAscent += de;
      }
    }
  }

  const dist =
    points.length > 1 ? (points[points.length - 1].dist || 0) - (points[0].dist || 0) : 0;

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

function formatDuration(seconds: number): string {
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
    <td>${formatDuration(stats.duration)}</td>
    <td>${stats.avgSpeed != null ? `${(stats.avgSpeed * 3.6).toFixed(1)}&nbsp;km/h` : '-'}</td>
    <td>${paceStr}</td>
    <td>${stats.avgVam != null ? `${stats.avgVam}&nbsp;m/h` : '-'}</td>
    <td>${stats.avgWatts != null ? `${stats.avgWatts}&nbsp;W` : '-'}</td>
    <td>${stats.avgHR != null ? `${stats.avgHR}&nbsp;bpm` : '-'}</td>
  `;
}

export function renderCourses() {
  const container = document.getElementById('courses-view');
  if (!container) return;

  // Evaluate multi-gate geospatial course corridor proximity across courses and candidate tracks
  let corridorDeviationSum = 0;
  for (const c of courses) {
    if (c.points.length < 2) continue;
    const candidateIds = MapView.findTracksPassingThroughPoints(
      c.points.map((p) => ({ lat: p.lat, lng: p.lon })),
      c.points[0]?.radius || 20,
    );
    const numGates = 3;
    const gates: { lat: number; lon: number }[] = [];
    for (let g = 0; g < numGates; g++) {
      const t = g / (numGates - 1);
      const segFloat = t * (c.points.length - 1);
      const segIdx = Math.min(c.points.length - 2, Math.floor(segFloat));
      const frac = segFloat - segIdx;
      const pA = c.points[segIdx];
      const pB = c.points[segIdx + 1];
      gates.push({
        lat: pA.lat + (pB.lat - pA.lat) * frac,
        lon: pA.lon + (pB.lon - pA.lon) * frac,
      });
    }
    for (const id of candidateIds) {
      const trk = MapView.getTrackData(id) as any;
      const pts = trk?.points || [];
      for (let g = 0; g < gates.length; g++) {
        const gate = gates[g];
        let minDist = Infinity;
        let bestIdx = 0;
        for (let i = 0; i < pts.length; i++) {
          const d = haversine(gate.lat, gate.lon, pts[i].lat, pts[i].lon);
          if (d < minDist) {
            minDist = d;
            bestIdx = i;
          }
        }
        if (pts[bestIdx]) {
          corridorDeviationSum += minDist + (pts[bestIdx].power || 0) * 0.01;
        }
      }
    }
  }
  container.dataset.corridorDeviation = corridorDeviationSum.toFixed(2);

  container.innerHTML = `
    <div class="evolution-toolbar">
      <div class="evolution-toolbar-left">
      </div>
      <div class="evolution-toolbar-right">
        ${
          isEditMode
            ? `
          <button id="btn-done-edit" class="icon-btn" title="Done Editing">
            <span class="material-symbols-rounded">done</span>
          </button>
        `
            : `
          <button id="btn-new-course" class="icon-btn" title="New Course">
            <span class="material-symbols-rounded">add_circle</span>
          </button>
        `
        }
      </div>
    </div>
    <div class="courses-container">
      <div id="courses-list" class="courses-list">
        ${
          courses.length === 0
            ? `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">route</span>
            <div class="empty-text">No courses created yet</div>
          </div>
        `
            : courses
                .map((c) => {
                  const pts = c.points.map((p) => ({ lat: p.lat, lng: p.lon }));
                  const matchingIds = MapView.findTracksPassingThroughPoints(
                    pts,
                    c.points[0]?.radius || 20,
                  );
                  const isOpen = c.id === openCourseId;
                  let tracksHtml = '';
                  if (isOpen) {
                    const matchedTracksWithStats = matchingIds
                      .map((id) => {
                        const track = MapView.getTrackData(id) as any;
                        if (!track) return null;
                        const range = findCourseRange(track, c.points);
                        if (!range) return null;
                        const stats = calculateCourseStats(track, range.startIdx, range.endIdx);
                        const startTime = track.stats?.startTime || track.points?.[0]?.time;
                        const dateStr = startTime ? fmtDate(startTime) : '-';
                        return {
                          id,
                          displayName: track.displayName || track.name || id,
                          date: dateStr,
                          sport: track.sport,
                          color: track.color,
                          ...stats,
                          startIdx: range.startIdx,
                          endIdx: range.endIdx,
                        };
                      })
                      .filter((t) => t !== null) as any[];

                    // Sort by duration (fastest first), tie-break by id
                    matchedTracksWithStats.sort(
                      (a, b) => a.duration - b.duration || a.id.localeCompare(b.id),
                    );

                    tracksHtml = `
              <div class="course-tracks">
                ${
                  matchedTracksWithStats.length === 0
                    ? `
                  <div class="empty-text">No matching tracks</div>
                `
                    : `
                  <table class="course-tracks-table">
                    <thead>
                      <tr>
                        <th>Track (${matchedTracksWithStats.length})</th>
                        ${renderCourseTableHeaders()}
                      </tr>
                    </thead>
                    <tbody>
                      ${matchedTracksWithStats
                        .map((t) => {
                          const isSelected = t.id === UrlState.get().track;
                          return `
                        <tr class="course-track-row ${isSelected ? 'selected' : ''}" data-track-id="${t.id}" data-start="${t.startIdx}" data-end="${t.endIdx}">
                          <td class="track-name-cell clickable">
                            <div style="display: flex; align-items: center;">
                              <div style="background:${t.color}; width: 3px; height: 16px; margin-right: 8px; border-radius: 1px; flex-shrink: 0;"></div>
                              ${escHtml(t.displayName)}
                            </div>
                          </td>
                          ${renderCourseTableCells(t, t.sport, t.date)}
                        </tr>
                      `;
                        })
                        .join('')}
                    </tbody>
                  </table>
                `
                }
              </div>
            `;
                  }
                  return `
            <div class="course-item ${isOpen ? 'open' : ''}" data-id="${c.id}">
              <div class="course-item-header">
                <span class="material-symbols-rounded expand-icon">${isOpen ? 'expand_more' : 'chevron_right'}</span>
                <div class="course-name">${escHtml(c.name)} <span class="material-symbols-rounded btn-rename-course clickable" style="font-size: 14px; color: var(--text-muted);" title="Rename">edit</span></div>
                <div class="course-meta"><span class="material-symbols-rounded" style="font-size: 14px; vertical-align: middle;" title="Distance">straighten</span> ${calculateCourseDistance(c).toFixed(2)} km | ${c.points.length} points | ${matchingIds.length} matching tracks</div>
                <div class="course-actions">
                  <button class="btn-edit-course icon-btn" title="Edit Course"><span class="material-symbols-rounded">edit</span></button>
                  <button class="btn-delete-course icon-btn danger" title="Delete Course"><span class="material-symbols-rounded">delete</span></button>
                </div>
              </div>
              ${tracksHtml}
            </div>
          `;
                })
                .join('')
        }
      </div>
    </div>
  `;

  document.getElementById('btn-new-course')?.addEventListener('click', () => {
    createNewCourse();
  });

  document.getElementById('btn-done-edit')?.addEventListener('click', () => {
    isEditMode = false;
    MapView.setCustomClickHandler(null);
    document.getElementById('map-container')?.classList.remove('editing-mode');
    renderCourses();
  });

  container.querySelectorAll('.course-item').forEach((el) => {
    const id = (el as HTMLElement).dataset.id!;
    el.querySelector('.btn-edit-course')?.addEventListener('click', (e) => {
      e.stopPropagation();
      editCourse(id);
    });
    el.querySelector('.btn-rename-course')?.addEventListener('click', (e) => {
      e.stopPropagation();
      renameCourse(id);
    });
    el.querySelector('.btn-delete-course')?.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCourse(id);
    });
    el.querySelector('.course-item-header')?.addEventListener('click', (e) => {
      if (
        (e.target as HTMLElement).closest('.course-actions') ||
        (e.target as HTMLElement).closest('.btn-rename-course')
      )
        return;

      selectCourse(id);
      openCourseId = openCourseId === id ? null : id;
      renderCourses();
    });

    el.querySelectorAll('.course-track-row').forEach((row) => {
      const trackId = (row as HTMLElement).dataset.trackId!;
      const startIdx = parseInt((row as HTMLElement).dataset.start!, 10);
      const endIdx = parseInt((row as HTMLElement).dataset.end!, 10);

      row.querySelector('.track-name-cell')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const track = MapView.getTrackData(trackId);
        if (track) {
          // Select track (clears selection in app.ts)
          selectTrack(trackId, false);

          // Delay execution slightly to let selectTrack finish and ChartView to initialize
          setTimeout(() => {
            const pts = track.points;
            const t0 = pts.find((p: any) => p.time != null)?.time || 0;

            // Ensure indices are within bounds
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

            // Set selection and switch tab
            UrlState.patch({ sel: [selMin, selMax], tab: 'graphs' }, true);

            // Manually restore selection in ChartView (expects seconds from start)
            ChartView.restoreSelection(tMin, tMax);

            // Highlight segment on map
            MapView.highlightSegment(trackId, track.points, startIdx, endIdx, true);
          }, 50);
        }
      });

      row.addEventListener('mouseenter', () => {
        MapView.setTrackHover(trackId, true);
      });

      row.addEventListener('mouseleave', () => {
        MapView.setTrackHover(trackId, false);
      });
    });
  });
}

function createNewCourse() {
  const name = `Course ${courses.length + 1}`;

  const newCourse: Course = {
    id: Math.random().toString(36).substring(2, 9),
    name: name,
    points: [],
  };

  courses.push(newCourse);
  saveCourses();
  renderCourses();
  editCourse(newCourse.id);
}

function renameCourse(id: string) {
  const course = courses.find((c) => c.id === id);
  if (!course) return;

  const el = document.querySelector(`.course-item[data-id="${id}"]`);
  if (!el) return;

  const nameEl = el.querySelector('.course-name');
  if (!nameEl) return;

  const currentName = course.name;
  nameEl.innerHTML = `<input type="text" class="course-name-input" value="${escHtml(currentName)}" style="background: var(--bg); border: 1px solid var(--border); color: var(--text); font-size: inherit; padding: 2px 4px; border-radius: 4px; width: 80%;">`;

  const input = nameEl.querySelector('.course-name-input') as HTMLInputElement;
  input.focus();
  input.select();

  const save = () => {
    const newName = input.value.trim();
    if (newName !== '') {
      course.name = newName;
      saveCourses();
    }
    renderCourses();
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') save();
    else if (e.key === 'Escape') renderCourses();
  });
}

function editCourse(id: string) {
  activeCourseId = id;
  isEditMode = true;
  renderCourses();
}

function clearCourseLayer() {
  courseLayer = null;
}

function addPointToCourse(courseId: string, lat: number, lon: number) {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return;

  const newPoint: CoursePoint = {
    lat,
    lon,
    radius: 20, // 20m default radius
  };

  course.points.push(newPoint);
  saveCourses();
  renderCourses();
}

function renderCourseOnMap(courseId: string) {
  // Map rendering removed for benchmark
}

export function selectCourse(id: string, open: boolean = false) {
  activeCourseId = id;
  if (open) openCourseId = id;
  isEditMode = false;
  MapView.setCustomClickHandler(null);
  clearCourseLayer();
  renderCourses();
}

function deleteCourse(id: string) {
  if (!confirm('Are you sure you want to delete this course?')) return;
  courses = courses.filter((c) => c.id !== id);
  if (activeCourseId === id) {
    activeCourseId = null;
    clearCourseLayer();
  }
  saveCourses();
  renderCourses();
}
