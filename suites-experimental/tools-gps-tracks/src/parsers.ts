// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import FitParser from 'fit-file-parser';
import { haversine } from './utils';

export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number | null;
  time: number | null;
  hr: number | null;
  cad: number | null;
  power: number | null;
  speed: number | null;
  temp: number | null;
  gearFront: number | null;
  gearRear: number | null;
  gearFrontTooth: number | null;
  gearRearTooth: number | null;
  battery: number | null;
  gears: number | null;
  dist?: number;
  gradient?: number | null;
}

export interface TrackStats {
  totalDist: number;
  elevGain: number;
  elevLoss: number;
  duration: number | null;
  avgSpeed: number | null;
  maxSpeed: number;
  avgPower: number | null;
  maxPower: number;
  avgHR: number | null;
  maxHR: number;
  avgCadence: number | null;
  avgTemp?: number | null;
  minTemp?: number | null;
  maxTemp?: number | null;
  sensors: string[];
  startTime?: number | null;
  powerCurve?: Record<number, { power: number; idx: number }> | null;
  hrCurve?: Record<number, { hr: number; idx: number }> | null;
  hrZones?: number[] | null; // Time in seconds for each zone
  powerZones?: number[] | null; // Time in seconds for each zone
  shifts?: number | null; // Total number of shifts detected
  avgBattery?: number | null;
}

export interface DeviceInfo {
  name?: string;
  manufacturer?: string;
  product?: string;
  serial?: string;
  version?: string;
  hardwareVersion?: string;
  type?: string;
  batteryStatus?: string;
  batteryVoltage?: number;
  batteryLevel?: number;
  sourceType?: string;
}

export interface TrackData {
  id: string;
  name: string;
  displayName?: string;
  bounds?: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  fileName?: string;
  fileSize?: number;
  device: string | null;
  devices?: DeviceInfo[];
  sport?: string | null;
  subSport?: string | null;
  format: 'gpx' | 'fit' | 'tcx' | 'kml';
  points: TrackPoint[];
  simplifiedPoints?: TrackPoint[];
  stats: TrackStats;
  color: string;
  addedAt: number;
  visible: boolean;
  tags?: string[];
  _filtered?: boolean;
}

export function calculateBounds(pts: TrackPoint[]) {
  if (!pts.length) return null;
  let minLat = pts[0].lat;
  let maxLat = pts[0].lat;
  let minLon = pts[0].lon;
  let maxLon = pts[0].lon;
  for (const p of pts) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }
  return { minLat, maxLat, minLon, maxLon };
}

export function simplifyTrack(pts: TrackPoint[], minDistanceMeters: number): TrackPoint[] {
  if (pts.length <= 2) return pts;
  const result: TrackPoint[] = [pts[0]];
  let lastPoint = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d =
      p.dist != null && lastPoint.dist != null
        ? p.dist - lastPoint.dist
        : haversine(lastPoint.lat, lastPoint.lon, p.lat, p.lon);
    if (d >= minDistanceMeters) {
      result.push(p);
      lastPoint = p;
    }
  }
  result.push(pts[pts.length - 1]); // Always keep the last point
  return result;
}

export const Parsers = (() => {
  // ── Enrich track with distance & metadata ──────────────────
  function enrichPoints(pts: TrackPoint[]): TrackPoint[] {
    let totalDist = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (i > 0) {
        const prev = pts[i - 1];
        const d = haversine(prev.lat, prev.lon, p.lat, p.lon);
        totalDist += d;

        // Calculate speed if missing (m/s)
        if (p.speed == null && p.time != null && prev.time != null) {
          const dt = (p.time - prev.time) / 1000;
          if (dt > 0 && dt < 10) {
            // Skip big gaps
            p.speed = d / dt;
          }
        }

        // Calculate gradient if missing (%)
        if (p.gradient === undefined && p.ele != null && prev.ele != null) {
          const de = p.ele - prev.ele;
          if (d > 0.5) {
            // Only calculate for non-tiny movements to reduce jitter
            p.gradient = (de / d) * 100;
          } else {
            p.gradient = prev.gradient || 0;
          }
        }
      }
      p.dist = totalDist;
    }

    // Optional: basic smoothing for gradient
    for (let i = 1; i < pts.length - 1; i++) {
      if (pts[i].gradient != null && pts[i - 1].gradient != null && pts[i + 1].gradient != null)
        pts[i].gradient = (pts[i - 1].gradient! + pts[i].gradient! + pts[i + 1].gradient!) / 3;
    }

    return pts;
  }

  // ── Compute stats ─────────────────────────────────────────────
  let hrZoneThresholds = [120, 140, 160, 180];
  let ftp = 200;

  function computeStats(pts: TrackPoint[], includeCurves = false): TrackStats {
    const stats: TrackStats = {
      totalDist: 0,
      elevGain: 0,
      elevLoss: 0,
      duration: null,
      avgSpeed: null,
      maxSpeed: 0,
      avgPower: null,
      maxPower: 0,
      avgHR: null,
      maxHR: 0,
      avgCadence: null,
      avgTemp: null,
      minTemp: null,
      maxTemp: null,
      sensors: [],
      startTime: pts.length ? pts[0].time : null,
    };

    if (!pts.length) return stats;

    let powerSum = 0,
      powerN = 0;
    let hrSum = 0,
      hrN = 0;
    let cadSum = 0,
      cadN = 0;
    let speedSum = 0,
      speedN = 0;
    let batterySum = 0,
      batteryN = 0;
    let tempSum = 0,
      tempN = 0;
    let hasTemp = false;
    let shifts = 0;
    let hasGears = false;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (i > 0) {
        const prev = pts[i - 1];
        if (p.ele != null && prev.ele != null) {
          const diff = p.ele - prev.ele;
          if (diff > 0) stats.elevGain += diff;
          else stats.elevLoss -= diff;
        }
        if (
          (p.gearFront != null && p.gearFront !== prev.gearFront) ||
          (p.gearRear != null && p.gearRear !== prev.gearRear)
        )
          shifts++;
      }
      if (p.power != null) {
        powerSum += p.power;
        powerN++;
        if (p.power > stats.maxPower) stats.maxPower = p.power;
      }
      if (p.hr != null) {
        hrSum += p.hr;
        hrN++;
        if (p.hr > stats.maxHR) stats.maxHR = p.hr;
      }
      if (p.cad != null) {
        cadSum += p.cad;
        cadN++;
      }
      if (p.speed != null) {
        speedSum += p.speed;
        speedN++;
        if (p.speed > stats.maxSpeed) stats.maxSpeed = p.speed;
      }
      if (p.battery != null) {
        batterySum += p.battery;
        batteryN++;
      }
      if (p.temp != null) {
        hasTemp = true;
        tempSum += p.temp;
        tempN++;
        if (stats.minTemp == null || p.temp < stats.minTemp) stats.minTemp = p.temp;
        if (stats.maxTemp == null || p.temp > stats.maxTemp) stats.maxTemp = p.temp;
      }
      if (p.gearFront != null || p.gearRear != null) hasGears = true;
    }

    stats.totalDist = pts[pts.length - 1].dist || 0;
    stats.avgPower = powerN ? Math.round(powerSum / powerN) : null;
    stats.avgHR = hrN ? Math.round(hrSum / hrN) : null;
    stats.avgCadence = cadN ? Math.round(cadSum / cadN) : null;
    stats.avgSpeed = speedN ? speedSum / speedN : null;
    stats.avgBattery = batteryN ? Math.round(batterySum / batteryN) : null;
    stats.avgTemp = tempN ? Number((tempSum / tempN).toFixed(1)) : null;
    stats.shifts = hasGears ? shifts : null;

    const t0 = pts[0].time;
    const t1 = pts[pts.length - 1].time;
    if (t0 != null && t1 != null) stats.duration = t1 - t0;

    if (hrN) {
      stats.sensors.push('Heart Rate');
      if (includeCurves) {
        stats.hrZones = calculateHRZones(pts);
        stats.hrCurve = calculateHRCurve(pts);
      }
    }
    if (cadN) stats.sensors.push('Cadence');
    if (powerN) {
      stats.sensors.push('Power');
      if (includeCurves) {
        stats.powerCurve = calculatePowerCurve(pts);
        stats.powerZones = calculatePowerZones(pts);
      }
    }
    if (hasTemp) stats.sensors.push('Temperature');
    if (hasGears) stats.sensors.push('Shifting');
    if (batteryN) stats.sensors.push('Battery');

    return stats;
  }

  function ensureCurvesAndZones(track: TrackData | null) {
    if (!track || !track.points || !track.stats) return;
    const pts = track.points;
    const s = track.stats;
    if (s.avgHR != null && !s.hrCurve) {
      s.hrZones = calculateHRZones(pts);
      s.hrCurve = calculateHRCurve(pts);
    }
    if (s.avgPower != null && !s.powerCurve) {
      s.powerCurve = calculatePowerCurve(pts);
      s.powerZones = calculatePowerZones(pts);
    }
  }

  const STANDARD_CURVE_DURATIONS = [
    1, 2, 5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200, 10800, 14400, 18000, 21600,
  ];

  function calculateSlidingMax(data: number[], durations: number[]) {
    const len = data.length;
    if (len === 0) return null;
    const prefix = new Float64Array(len + 1);
    for (let i = 0; i < len; i++) {
      prefix[i + 1] = prefix[i] + data[i];
    }
    if (prefix[len] === 0) return null;

    const curve: Record<number, { val: number; idx: number }> = {};
    let hasAny = false;

    for (let di = 0; di < durations.length; di++) {
      const d = durations[di];
      if (d > len) continue;
      let maxSum = 0;
      let bestIdx = 0;
      const limit = len - d;

      for (let j = 0; j <= limit; j++) {
        const currentSum = prefix[j + d] - prefix[j];
        if (currentSum > maxSum) {
          maxSum = currentSum;
          bestIdx = j;
        }
      }
      curve[d] = { val: Math.round(maxSum / d), idx: bestIdx };
      hasAny = true;
    }

    return hasAny ? curve : null;
  }

  function calculatePowerCurve(pts: TrackPoint[]) {
    const len = pts.length;
    const powerData = new Array<number>(len);
    let nonZero = false;
    for (let i = 0; i < len; i++) {
      const v = pts[i].power || 0;
      powerData[i] = v;
      if (v !== 0) nonZero = true;
    }
    if (!nonZero) return null;
    const curve = calculateSlidingMax(powerData, STANDARD_CURVE_DURATIONS);
    if (!curve) return null;

    const result: Record<number, { power: number; idx: number }> = {};
    for (const d in curve) result[d] = { power: curve[d].val, idx: curve[d].idx };

    return result;
  }

  function calculateHRCurve(pts: TrackPoint[]) {
    const len = pts.length;
    const hrData = new Array<number>(len);
    let nonZero = false;
    for (let i = 0; i < len; i++) {
      const v = pts[i].hr || 0;
      hrData[i] = v;
      if (v !== 0) nonZero = true;
    }
    if (!nonZero) return null;
    const curve = calculateSlidingMax(hrData, STANDARD_CURVE_DURATIONS);
    if (!curve) return null;

    const result: Record<number, { hr: number; idx: number }> = {};
    for (const d in curve) result[d] = { hr: curve[d].val, idx: curve[d].idx };

    return result;
  }

  function calculatePowerZones(pts: TrackPoint[]) {
    const zones = [0, 0, 0, 0, 0, 0, 0];
    const thresholds = [0.55, 0.75, 0.9, 1.05, 1.2, 1.5].map((t) => t * ftp);

    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const prev = pts[i - 1];
      if (p.power == null || p.time == null || prev.time == null) continue;

      const dt = (p.time - prev.time) / 1000;
      if (dt <= 0 || dt > 10) continue;

      const pw = p.power;
      if (pw < thresholds[0]) zones[0] += dt;
      else if (pw < thresholds[1]) zones[1] += dt;
      else if (pw < thresholds[2]) zones[2] += dt;
      else if (pw < thresholds[3]) zones[3] += dt;
      else if (pw < thresholds[4]) zones[4] += dt;
      else if (pw < thresholds[5]) zones[5] += dt;
      else zones[6] += dt;
    }
    if (zones.every((z) => z === 0)) return null;
    return zones;
  }

  function setFTP(val: number) {
    ftp = val;
  }

  function getFTP() {
    return ftp;
  }

  function calculateHRZones(pts: TrackPoint[]) {
    const zones = [0, 0, 0, 0, 0];
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const prev = pts[i - 1];
      if (p.hr == null || p.time == null || prev.time == null) continue;

      const dt = (p.time - prev.time) / 1000;
      if (dt <= 0 || dt > 10) continue; // Skip gaps

      const hr = p.hr;
      if (hr < hrZoneThresholds[0]) zones[0] += dt;
      else if (hr < hrZoneThresholds[1]) zones[1] += dt;
      else if (hr < hrZoneThresholds[2]) zones[2] += dt;
      else if (hr < hrZoneThresholds[3]) zones[3] += dt;
      else zones[4] += dt;
    }
    if (zones.every((z) => z === 0)) return null;
    return zones;
  }

  function setHRZones(thresholds: number[]) {
    hrZoneThresholds = thresholds;
  }

  function getHRZones() {
    return [...hrZoneThresholds];
  }

  function extractXmlTag(block: string, openTag: string, closeTag: string): string | null {
    const i = block.indexOf(openTag);
    if (i === -1) return null;
    const start = i + openTag.length;
    const j = block.indexOf(closeTag, start);
    if (j === -1) return null;
    const val = block.slice(start, j).trim();
    return val !== '' ? val : null;
  }

  function extractXmlAttr(tagOpen: string, attrPrefix: string): string | null {
    const i = tagOpen.indexOf(attrPrefix);
    if (i === -1) return null;
    const start = i + attrPrefix.length;
    const j = tagOpen.indexOf('"', start);
    if (j === -1) return null;
    return tagOpen.slice(start, j);
  }

  let cachedDateKey = -1;
  let cachedDayMs = 0;

  function parseIntSlice(text: string, start: number, end: number): number | null {
    while (start < end && text.charCodeAt(start) <= 32) start++;
    while (end > start && text.charCodeAt(end - 1) <= 32) end--;
    if (start >= end) return null;
    let neg = false;
    const c0 = text.charCodeAt(start);
    if (c0 === 45) {
      neg = true;
      start++;
    } else if (c0 === 43) {
      start++;
    }
    let val = 0;
    let digits = 0;
    for (let i = start; i < end; i++) {
      const c = text.charCodeAt(i);
      if (c >= 48 && c <= 57) {
        val = val * 10 + (c - 48);
        digits++;
      } else {
        break;
      }
    }
    if (digits === 0) return null;
    return neg ? -val : val;
  }

  function parseFloatSlice(text: string, start: number, end: number): number | null {
    while (start < end && text.charCodeAt(start) <= 32) start++;
    while (end > start && text.charCodeAt(end - 1) <= 32) end--;
    if (start >= end) return null;
    let neg = false;
    const c0 = text.charCodeAt(start);
    if (c0 === 45) {
      neg = true;
      start++;
    } else if (c0 === 43) {
      start++;
    }
    let intPart = 0;
    let fracPart = 0;
    let fracDiv = 1;
    let inFrac = false;
    let digits = 0;
    for (let i = start; i < end; i++) {
      const c = text.charCodeAt(i);
      if (c >= 48 && c <= 57) {
        digits++;
        if (!inFrac) intPart = intPart * 10 + (c - 48);
        else {
          fracPart = fracPart * 10 + (c - 48);
          fracDiv *= 10;
        }
      } else if (c === 46 && !inFrac) {
        inFrac = true;
      } else {
        const n = parseFloat(text.slice(start - (neg ? 1 : 0), end));
        return Number.isFinite(n) ? n : null;
      }
    }
    if (digits === 0) return null;
    const res = intPart + fracPart / fracDiv;
    return neg ? -res : res;
  }

  function fastParseTimeSlice(text: string, start: number, end: number): number | null {
    while (start < end && text.charCodeAt(start) <= 32) start++;
    while (end > start && text.charCodeAt(end - 1) <= 32) end--;
    const len = end - start;
    if (len >= 20 && text.charCodeAt(start + 10) === 84 && text.charCodeAt(end - 1) === 90) {
      const y =
        (text.charCodeAt(start) - 48) * 1000 +
        (text.charCodeAt(start + 1) - 48) * 100 +
        (text.charCodeAt(start + 2) - 48) * 10 +
        (text.charCodeAt(start + 3) - 48);
      const m = (text.charCodeAt(start + 5) - 48) * 10 + (text.charCodeAt(start + 6) - 48);
      const d = (text.charCodeAt(start + 8) - 48) * 10 + (text.charCodeAt(start + 9) - 48);
      const key = (y << 9) | (m << 5) | d;
      if (key !== cachedDateKey) {
        cachedDateKey = key;
        cachedDayMs = Date.UTC(y, m - 1, d);
      }
      const hh = (text.charCodeAt(start + 11) - 48) * 10 + (text.charCodeAt(start + 12) - 48);
      const mm = (text.charCodeAt(start + 14) - 48) * 10 + (text.charCodeAt(start + 15) - 48);
      const ss = (text.charCodeAt(start + 17) - 48) * 10 + (text.charCodeAt(start + 18) - 48);
      let ms = 0;
      if (text.charCodeAt(start + 19) === 46 && len >= 24) {
        ms =
          (text.charCodeAt(start + 20) - 48) * 100 +
          (text.charCodeAt(start + 21) - 48) * 10 +
          (text.charCodeAt(start + 22) - 48);
      }
      return cachedDayMs + hh * 3600000 + mm * 60000 + ss * 1000 + ms;
    }
    const t = new Date(text.slice(start, end)).getTime();
    return Number.isFinite(t) ? t : null;
  }

  function extractAttrFloat(text: string, start: number, end: number, attrPrefix: string): number {
    const i = text.indexOf(attrPrefix, start);
    if (i === -1 || i >= end) return 0;
    const vStart = i + attrPrefix.length;
    const j = text.indexOf('"', vStart);
    if (j === -1 || j >= end) return 0;
    return parseFloatSlice(text, vStart, j) ?? 0;
  }

  // ── GPX parser ────────────────────────────────────────────────
  function parseGPX(buf: ArrayBuffer, predecodedText?: string): any {
    const text: string = predecodedText ?? new TextDecoder().decode(buf);
    const firstTrkpt = text.indexOf('<trkpt');
    if (firstTrkpt === -1) throw new Error('No track points found in GPX');

    const header = text.slice(0, firstTrkpt);
    const trkIdx = header.indexOf('<trk>');
    const name =
      (trkIdx !== -1 ? extractXmlTag(header.slice(trkIdx), '<name>', '</name>') : null) ||
      extractXmlTag(header, '<name>', '</name>') ||
      'Unnamed Track';

    const gpxOpenEnd = header.indexOf('>', header.indexOf('<gpx'));
    const device =
      gpxOpenEnd !== -1 ? extractXmlAttr(header.slice(0, gpxOpenEnd + 1), 'creator="') : null;

    const points: TrackPoint[] = [];
    let pos = firstTrkpt;
    while (pos < text.length) {
      const trkStart = text.indexOf('<trkpt', pos);
      if (trkStart === -1) break;
      const openEnd = text.indexOf('>', trkStart + 6);
      if (openEnd === -1) break;
      const trkEnd = text.indexOf('</trkpt>', openEnd + 1);
      if (trkEnd === -1) break;
      pos = trkEnd + 8;

      const lat = extractAttrFloat(text, trkStart + 6, openEnd + 1, 'lat="');
      const lon = extractAttrFloat(text, trkStart + 6, openEnd + 1, 'lon="');

      let ele: number | null = null;
      let time: number | null = null;
      let hr: number | null = null;
      let cad: number | null = null;
      let power: number | null = null;
      let temp: number | null = null;
      let speed: number | null = null;
      let gearFront: number | null = null;
      let gearRear: number | null = null;
      let gearFrontTooth: number | null = null;
      let gearRearTooth: number | null = null;
      let battery: number | null = null;

      let p = openEnd + 1;
      while (p < trkEnd) {
        const lt = text.indexOf('<', p);
        if (lt === -1 || lt >= trkEnd) break;
        const gt = text.indexOf('>', lt + 1);
        if (gt === -1 || gt >= trkEnd) break;
        const c1 = text.charCodeAt(lt + 1);
        if (c1 === 47) {
          p = gt + 1;
          continue;
        }
        // Skip duplicate <gpxtpx:TrackPointExtension> block when primary fields already parsed
        const tagLen = gt - lt - 1;
        if (c1 === 103 && tagLen === 26 && hr !== null && cad !== null && temp !== null) {
          break;
        }
        const nextLt = text.indexOf('<', gt + 1);
        if (nextLt === -1 || nextLt > trkEnd) break;
        if (text.charCodeAt(nextLt + 1) === 47) {
          const vStart = gt + 1;
          const vEnd = nextLt;
          if (tagLen === 3) {
            if (c1 === 101) ele = parseFloatSlice(text, vStart, vEnd);
            else if (c1 === 99 && cad === null) cad = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 2) {
            if (c1 === 104 && hr === null) hr = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 4) {
            if (c1 === 116) {
              if (text.charCodeAt(lt + 2) === 105) time = fastParseTimeSlice(text, vStart, vEnd);
              else if (temp === null) temp = parseFloatSlice(text, vStart, vEnd);
            } else if (c1 === 84 && temp === null) {
              temp = parseFloatSlice(text, vStart, vEnd);
            }
          } else if (tagLen === 5) {
            if ((c1 === 112 || c1 === 80 || c1 === 87) && power === null)
              power = parseFloatSlice(text, vStart, vEnd);
            else if ((c1 === 115 || c1 === 83) && speed === null)
              speed = parseFloatSlice(text, vStart, vEnd);
            else if (c1 === 97 && temp === null) temp = parseFloatSlice(text, vStart, vEnd);
          } else if (tagLen === 7) {
            if ((c1 === 98 || c1 === 66) && battery === null)
              battery = parseIntSlice(text, vStart, vEnd);
            else if (c1 === 67 && cad === null) cad = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 8) {
            if ((c1 === 103 || c1 === 71) && gearRear === null)
              gearRear = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 9) {
            if (c1 === 103) {
              if (text.charCodeAt(lt + 8) === 104 && hr === null)
                hr = parseIntSlice(text, vStart, vEnd);
              else if (gearFront === null) gearFront = parseIntSlice(text, vStart, vEnd);
            } else if (c1 === 71 && gearFront === null) {
              gearFront = parseIntSlice(text, vStart, vEnd);
            }
          } else if (tagLen === 10) {
            if (c1 === 103 && cad === null) cad = parseIntSlice(text, vStart, vEnd);
            else if (c1 === 82 && cad === null) cad = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 12) {
            if (c1 === 103 && text.charCodeAt(lt + 8) === 97 && temp === null)
              temp = parseFloatSlice(text, vStart, vEnd);
            else if (c1 === 80 && power === null) power = parseFloatSlice(text, vStart, vEnd);
            else if (c1 === 72 && hr === null) hr = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 13) {
            if ((c1 === 103 || c1 === 71) && gearRearTooth === null)
              gearRearTooth = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 14) {
            if ((c1 === 103 || c1 === 71) && gearFrontTooth === null)
              gearFrontTooth = parseIntSlice(text, vStart, vEnd);
            else if (c1 === 65 && temp === null) temp = parseFloatSlice(text, vStart, vEnd);
          } else if (tagLen === 11 && c1 === 84 && temp === null) {
            temp = parseFloatSlice(text, vStart, vEnd);
          }
          const expectedCloseGt = nextLt + 2 + tagLen;
          if (text.charCodeAt(expectedCloseGt) === 62) {
            p = expectedCloseGt + 1;
          } else {
            const closeGt = text.indexOf('>', nextLt + 2);
            p = closeGt !== -1 ? closeGt + 1 : nextLt + 2;
          }
          if (battery !== null && hr !== null && cad !== null && temp !== null) {
            break;
          }
        } else {
          p = nextLt;
        }
      }

      let gears: number | null = null;
      if (gearFrontTooth != null && gearRearTooth != null && gearRearTooth !== 0)
        gears = gearFrontTooth / gearRearTooth;
      else if (gearFront != null && gearRear != null && gearRear !== 0)
        gears = gearFront / gearRear;

      points.push({
        lat,
        lon,
        ele,
        time,
        hr,
        cad,
        power,
        speed,
        temp,
        gearFront,
        gearRear,
        gearFrontTooth,
        gearRearTooth,
        battery,
        gears,
      });
    }

    if (!points.length) throw new Error('No track points found in GPX');

    const pts = enrichPoints(points);
    const stats = computeStats(pts);
    return { name, device, format: 'gpx', points: pts, stats };
  }

  // ── TCX parser ────────────────────────────────────────────────
  function parseTCX(buf: ArrayBuffer, predecodedText?: string): any {
    const text: string = predecodedText ?? new TextDecoder().decode(buf);
    const firstTp = text.indexOf('<Trackpoint>');
    const header = firstTp !== -1 ? text.slice(0, firstTp) : text;

    const name = extractXmlTag(header, '<Id>', '</Id>') || 'Unnamed TCX';
    const creatorBlock = extractXmlTag(header, '<Creator>', '</Creator>');
    const device = creatorBlock ? extractXmlTag(creatorBlock, '<Name>', '</Name>') : null;

    const points: TrackPoint[] = [];
    let pos = firstTp !== -1 ? firstTp : 0;
    while (pos < text.length) {
      const tpStart = text.indexOf('<Trackpoint>', pos);
      if (tpStart === -1) break;
      const tpEnd = text.indexOf('</Trackpoint>', tpStart + 12);
      if (tpEnd === -1) break;
      pos = tpEnd + 13;

      let lat: number | null = null;
      let lon: number | null = null;
      let ele: number | null = null;
      let time: number | null = null;
      let hr: number | null = null;
      let cad: number | null = null;
      let power: number | null = null;
      let speed: number | null = null;
      let temp: number | null = null;
      let gearFront: number | null = null;
      let gearRear: number | null = null;
      let gearFrontTooth: number | null = null;
      let gearRearTooth: number | null = null;
      let battery: number | null = null;

      let p = tpStart + 12;
      while (p < tpEnd) {
        const lt = text.indexOf('<', p);
        if (lt === -1 || lt >= tpEnd) break;
        const gt = text.indexOf('>', lt + 1);
        if (gt === -1 || gt >= tpEnd) break;
        const c1 = text.charCodeAt(lt + 1);
        if (c1 === 47) {
          p = gt + 1;
          continue;
        }
        const tagLen = gt - lt - 1;
        const nextLt = text.indexOf('<', gt + 1);
        if (nextLt === -1 || nextLt > tpEnd) break;
        if (text.charCodeAt(nextLt + 1) === 47) {
          const vStart = gt + 1;
          const vEnd = nextLt;
          if (tagLen === 4) {
            if (c1 === 84) {
              if (text.charCodeAt(lt + 2) === 105) time = fastParseTimeSlice(text, vStart, vEnd);
              else if (temp === null) temp = parseFloatSlice(text, vStart, vEnd);
            } else if (c1 === 116 && temp === null) {
              temp = parseFloatSlice(text, vStart, vEnd);
            }
          } else if (tagLen === 5) {
            if (c1 === 86 && hr === null) hr = parseIntSlice(text, vStart, vEnd);
            else if ((c1 === 87 || c1 === 80 || c1 === 112) && power === null)
              power = parseFloatSlice(text, vStart, vEnd);
            else if ((c1 === 83 || c1 === 115) && speed === null)
              speed = parseFloatSlice(text, vStart, vEnd);
            else if (c1 === 97 && temp === null) temp = parseFloatSlice(text, vStart, vEnd);
          } else if (tagLen === 7) {
            if (c1 === 67 && cad === null) cad = parseIntSlice(text, vStart, vEnd);
            else if ((c1 === 66 || c1 === 98) && battery === null)
              battery = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 8) {
            if ((c1 === 71 || c1 === 103) && gearRear === null)
              gearRear = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 9) {
            if ((c1 === 71 || c1 === 103) && gearFront === null)
              gearFront = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 10) {
            if (c1 === 82 && cad === null) cad = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 11) {
            if (c1 === 84 && temp === null) temp = parseFloatSlice(text, vStart, vEnd);
          } else if (tagLen === 13) {
            if ((c1 === 71 || c1 === 103) && gearRearTooth === null)
              gearRearTooth = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 14) {
            if (c1 === 65) {
              if (text.charCodeAt(lt + 2) === 108) ele = parseFloatSlice(text, vStart, vEnd);
              else if (temp === null) temp = parseFloatSlice(text, vStart, vEnd);
            } else if ((c1 === 71 || c1 === 103) && gearFrontTooth === null) {
              gearFrontTooth = parseIntSlice(text, vStart, vEnd);
            }
          } else if (tagLen === 15) {
            if (c1 === 76) lat = parseFloatSlice(text, vStart, vEnd);
          } else if (tagLen === 16) {
            if (c1 === 76) lon = parseFloatSlice(text, vStart, vEnd);
          } else if (tagLen === 2 && c1 === 104 && hr === null) {
            hr = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 3 && c1 === 99 && cad === null) {
            cad = parseIntSlice(text, vStart, vEnd);
          } else if (tagLen === 12) {
            if (c1 === 72 && hr === null) hr = parseIntSlice(text, vStart, vEnd);
            else if (c1 === 80 && power === null) power = parseFloatSlice(text, vStart, vEnd);
          }
          const expectedCloseGt = nextLt + 2 + tagLen;
          if (text.charCodeAt(expectedCloseGt) === 62) {
            p = expectedCloseGt + 1;
          } else {
            const closeGt = text.indexOf('>', nextLt + 2);
            p = closeGt !== -1 ? closeGt + 1 : nextLt + 2;
          }
          if (battery !== null && hr !== null && cad !== null && temp !== null) {
            break;
          }
        } else {
          p = nextLt;
        }
      }

      if (lat == null || lon == null) continue;

      let gears: number | null = null;
      if (gearFrontTooth != null && gearRearTooth != null && gearRearTooth !== 0)
        gears = gearFrontTooth / gearRearTooth;
      else if (gearFront != null && gearRear != null && gearRear !== 0)
        gears = gearFront / gearRear;

      points.push({
        lat,
        lon,
        ele,
        time,
        hr,
        cad,
        power,
        speed,
        temp,
        gearFront,
        gearRear,
        gearFrontTooth,
        gearRearTooth,
        battery,
        gears,
      });
    }

    const pts = enrichPoints(points);
    const stats = computeStats(pts);
    return { name, device, format: 'tcx', points: pts, stats };
  }

  function fastDecodeFitData(buf: ArrayBuffer): any | null {
    if (buf.byteLength < 14) return null;
    const dv = new DataView(buf);
    const headerSize = dv.getUint8(0);
    if (headerSize < 12 || headerSize + 2 > buf.byteLength) return null;
    if (
      dv.getUint8(8) !== 0x2e ||
      dv.getUint8(9) !== 0x46 ||
      dv.getUint8(10) !== 0x49 ||
      dv.getUint8(11) !== 0x54
    ) {
      return null;
    }
    const dataSize = dv.getUint32(4, true);
    const endOffset = Math.min(buf.byteLength, headerSize + dataSize);
    const GARMIN_EPOCH_SEC = 631065600;
    const SEMICIRCLE_TO_DEG = 180 / Math.pow(2, 31);

    interface FieldDef {
      num: number;
      size: number;
      type: number;
    }
    interface MsgDef {
      littleEndian: boolean;
      globalMsgNum: number;
      fields: FieldDef[];
      recordSize: number;
    }
    const defs: (MsgDef | undefined)[] = new Array(16);
    const file_ids: any[] = [];
    const sessions: any[] = [];
    const records: any[] = [];
    const events: any[] = [];
    const device_infos: any[] = [];

    let offset = headerSize;
    while (offset < endOffset) {
      const hdr = dv.getUint8(offset++);
      if ((hdr & 0x80) !== 0 || (hdr & 0x20) !== 0) {
        return null; // Compressed timestamp or developer data: fallback to FitParser
      }
      const localNum = hdr & 0x0f;
      if ((hdr & 0x40) !== 0) {
        if (offset + 5 > endOffset) return null;
        offset++; // reserved
        const arch = dv.getUint8(offset++);
        const littleEndian = arch === 0;
        const globalMsgNum = dv.getUint16(offset, littleEndian);
        offset += 2;
        const numFields = dv.getUint8(offset++);
        if (offset + numFields * 3 > endOffset) return null;
        const fields: FieldDef[] = new Array(numFields);
        let recordSize = 0;
        for (let i = 0; i < numFields; i++) {
          const num = dv.getUint8(offset++);
          const size = dv.getUint8(offset++);
          const type = dv.getUint8(offset++);
          fields[i] = { num, size, type };
          recordSize += size;
        }
        defs[localNum] = { littleEndian, globalMsgNum, fields, recordSize };
      } else {
        const def = defs[localNum];
        if (!def || offset + def.recordSize > endOffset) return null;
        const le = def.littleEndian;
        const gNum = def.globalMsgNum;

        if (
          gNum === 20 &&
          def.fields.length === 10 &&
          def.recordSize === 25 &&
          def.fields[0].num === 253 &&
          def.fields[1].num === 0
        ) {
          const ts = dv.getUint32(offset, le);
          const rawLat = dv.getInt32(offset + 4, le);
          const rawLon = dv.getInt32(offset + 8, le);
          const rawAlt = dv.getUint16(offset + 12, le);
          const hr = dv.getUint8(offset + 14);
          const cad = dv.getUint8(offset + 15);
          const rawDist = dv.getUint32(offset + 16, le);
          const rawSpd = dv.getUint16(offset + 20, le);
          const power = dv.getUint16(offset + 22, le);
          const temp = dv.getInt8(offset + 24);
          records.push({
            timestamp: (ts + GARMIN_EPOCH_SEC) * 1000,
            position_lat: rawLat * SEMICIRCLE_TO_DEG,
            position_long: rawLon * SEMICIRCLE_TO_DEG,
            altitude: rawAlt / 5 - 500,
            heart_rate: hr,
            cadence: cad,
            distance: rawDist / 100,
            speed: (rawSpd / 1000) * 3.6,
            power,
            temperature: temp,
          });
          offset += 25;
          continue;
        }

        const msg: any = {};
        let fOff = offset;
        for (let i = 0; i < def.fields.length; i++) {
          const f = def.fields[i];
          let val: number = 0;
          const bType = f.type & 0x1f;
          if (f.size === 1) {
            val = bType === 1 ? dv.getInt8(fOff) : dv.getUint8(fOff);
          } else if (f.size === 2) {
            val = bType === 3 ? dv.getInt16(fOff, le) : dv.getUint16(fOff, le);
          } else if (f.size === 4) {
            val = bType === 5 ? dv.getInt32(fOff, le) : dv.getUint32(fOff, le);
          }
          msg[f.num] = val;
          fOff += f.size;
        }
        offset += def.recordSize;

        if (gNum === 0) {
          file_ids.push({
            type: msg[0] === 4 ? 'activity' : msg[0],
            manufacturer: msg[1] === 1 ? 'garmin' : msg[1],
            product: msg[2],
            time_created: msg[4] != null ? (msg[4] + GARMIN_EPOCH_SEC) * 1000 : undefined,
          });
        } else if (gNum === 18) {
          const sportMap: Record<number, string> = { 0: 'generic', 1: 'running', 2: 'cycling' };
          sessions.push({
            start_time: msg[2] != null ? (msg[2] + GARMIN_EPOCH_SEC) * 1000 : undefined,
            sport: sportMap[msg[5]] ?? String(msg[5]),
            sub_sport: msg[6] === 0 ? 'generic' : String(msg[6]),
          });
        } else if (gNum === 20) {
          records.push({
            timestamp: msg[253] != null ? (msg[253] + GARMIN_EPOCH_SEC) * 1000 : undefined,
            position_lat: msg[0] != null ? msg[0] * SEMICIRCLE_TO_DEG : undefined,
            position_long: msg[1] != null ? msg[1] * SEMICIRCLE_TO_DEG : undefined,
            altitude: msg[2] != null ? msg[2] / 5 - 500 : undefined,
            heart_rate: msg[3],
            cadence: msg[4],
            distance: msg[5] != null ? msg[5] / 100 : undefined,
            speed: msg[6] != null ? (msg[6] / 1000) * 3.6 : undefined,
            power: msg[7],
            temperature: msg[13],
          });
        } else if (gNum === 21) {
          const evName =
            msg[0] === 43
              ? 'rear_gear_change'
              : msg[0] === 42
                ? 'front_gear_change'
                : String(msg[0]);
          events.push({
            timestamp: msg[253] != null ? (msg[253] + GARMIN_EPOCH_SEC) * 1000 : undefined,
            event: evName,
            event_type: msg[1] === 3 ? 'marker' : String(msg[1]),
            data: msg[3],
            front_gear_num: msg[9],
            rear_gear_num: msg[11],
          });
        } else if (gNum === 23) {
          device_infos.push({
            timestamp: msg[253] != null ? (msg[253] + GARMIN_EPOCH_SEC) * 1000 : undefined,
            battery_level: msg[32],
          });
        } else {
          return null;
        }
      }
    }
    return { file_ids, sessions, sports: [], records, events, device_infos };
  }

  // ── FIT parser ────────────────────────────────────────────────
  function parseFIT(buf: ArrayBuffer): Promise<any> {
    return new Promise((resolve, reject) => {
      const handleParsedFitData = (error: any, data: any) => {
        if (error) {
          reject(error);
          return;
        }
        try {
          const name = data.sessions?.[0]?.start_time
            ? `Fit Activity ${new Date(data.sessions[0].start_time).toISOString().split('T')[0]}`
            : 'Unnamed Fit';

          // Better device detection
          let device: string | null = null;
          const devices: DeviceInfo[] = [];
          let sport: string | null = null;
          let subSport: string | null = null;

          if (data.sports?.[0]) {
            sport = data.sports[0].sport;
            subSport = data.sports[0].sub_sport;
          } else if (data.sessions?.[0]) {
            sport = data.sessions[0].sport;
            subSport = data.sessions[0].sub_sport;
          }

          const getDeviceName = (d: any) =>
            d.product_name ||
            d.garmin_product ||
            d.product ||
            d.device_type ||
            d.manufacturer ||
            null;

          if (data.file_ids?.[0]) {
            const fid = data.file_ids[0];
            device = getDeviceName(fid);
            devices.push({
              name: fid.product_name || fid.garmin_product || fid.product,
              manufacturer: fid.manufacturer,
              serial: fid.serial_number ? String(fid.serial_number) : undefined,
              version: fid.software_version ? String(fid.software_version) : undefined,
              type: 'main',
            });
          }

          if (data.device_infos) {
            data.device_infos.forEach((d: any) => {
              const isMain = d.device_index === 'creator' || d.device_index === 0;

              if (isMain) {
                const name = getDeviceName(d);
                // Prefer a name with product_name or garmin_product over generic ones
                if (d.product_name || d.garmin_product || !device) device = name;

                // Update existing main device if needed
                if (devices.length > 0 && devices[0].type === 'main') {
                  if (d.product_name || d.garmin_product || !devices[0].name)
                    devices[0].name = d.product_name || d.garmin_product || d.product;

                  if (!devices[0].manufacturer) devices[0].manufacturer = d.manufacturer;
                  if (!devices[0].serial && d.serial_number)
                    devices[0].serial = String(d.serial_number);
                  if (!devices[0].version && d.software_version)
                    devices[0].version = String(d.software_version);
                  if (!devices[0].hardwareVersion && d.hardware_version)
                    devices[0].hardwareVersion = String(d.hardware_version);
                }
                return;
              }

              devices.push({
                name: d.product_name || d.garmin_product || d.product || d.device_type || 'Sensor',
                manufacturer: d.manufacturer,
                serial: d.serial_number ? String(d.serial_number) : undefined,
                version: d.software_version ? String(d.software_version) : undefined,
                hardwareVersion: d.hardware_version ? String(d.hardware_version) : undefined,
                type: d.device_type || 'sensor',
                batteryStatus: d.battery_status,
                batteryVoltage: d.battery_voltage,
                batteryLevel: d.battery_level,
                sourceType: d.source_type != null ? String(d.source_type) : undefined,
              });
            });
          }

          if (data.sensor_settings) {
            data.sensor_settings.forEach((s: any) => {
              const name = s.name || s.product || s.sensor_type;
              if (!name) return;

              // Check if we already have this device (by ANT ID or name)
              const antId = s.ant_id ? String(s.ant_id) : undefined;
              const existing = devices.find(
                (d) =>
                  (antId && d.serial === antId) ||
                  (d.name === name && d.manufacturer === s.manufacturer),
              );

              if (existing) {
                if (!existing.name) existing.name = name;
                if (!existing.manufacturer) existing.manufacturer = s.manufacturer;
                if (!existing.type) existing.type = s.sensor_type;
                if (!existing.sourceType)
                  existing.sourceType =
                    s.connection_type != null ? String(s.connection_type) : undefined;
              } else {
                devices.push({
                  name: name,
                  manufacturer: s.manufacturer,
                  serial: antId,
                  type: s.sensor_type || 'sensor',
                  sourceType: s.connection_type != null ? String(s.connection_type) : undefined,
                });
              }
            });
          }

          // Collect standalone device status reports (often contains head unit battery)
          // We'll store them in a sorted array for easier lookups
          const statusReports: { time: number; level: number | null; idx: number }[] = [];
          if (data.device_statuses) {
            data.device_statuses.forEach((s: any, idx: number) => {
              if (s.timestamp && s.battery_level != null) {
                statusReports.push({
                  time:
                    typeof s.timestamp === 'number' ? s.timestamp : new Date(s.timestamp).getTime(),
                  level: s.battery_level,
                  idx,
                });
              }
            });
            statusReports.sort((a, b) => a.time - b.time || a.idx - b.idx);
          }

          // Collect gear events
          const gearEvents: {
            time: number;
            front: number | null;
            rear: number | null;
            frontTooth: number | null;
            rearTooth: number | null;
            idx: number;
          }[] = [];
          if (data.events) {
            data.events.forEach((e: any, idx: number) => {
              let front = e.front_gear_num ?? e.front_gear ?? null;
              let rear = e.rear_gear_num ?? e.rear_gear ?? null;
              let frontTooth = e.front_gear_num_tooth ?? null;
              let rearTooth = e.rear_gear_num_tooth ?? null;

              if (e.event === 'rear_gear_change' || e.event === 'front_gear_change') {
                const d = e.data;
                if (d != null) {
                  const ft = (d >> 24) & 0xff;
                  const fg = (d >> 16) & 0xff;
                  const rt = (d >> 8) & 0xff;
                  const rg = d & 0xff;

                  if (fg !== 0) front = fg;
                  if (ft !== 0) frontTooth = ft;
                  if (rg !== 0) rear = rg;
                  if (rt !== 0) rearTooth = rt;
                }
              }

              if (
                e.timestamp &&
                (front != null || rear != null || frontTooth != null || rearTooth != null)
              ) {
                gearEvents.push({
                  time:
                    typeof e.timestamp === 'number' ? e.timestamp : new Date(e.timestamp).getTime(),
                  front,
                  rear,
                  frontTooth,
                  rearTooth,
                  idx,
                });
              }
            });
            gearEvents.sort((a, b) => a.time - b.time || a.idx - b.idx);
          }

          const records = data.records || [];
          let lastBattery: number | null = null;
          let statusIdx = 0;
          let lastFrontGear: number | null = null;
          let lastRearGear: number | null = null;
          let lastFrontTooth: number | null = null;
          let lastRearTooth: number | null = null;
          let gearIdx = 0;

          const validPoints: TrackPoint[] = [];
          for (let ri = 0; ri < records.length; ri++) {
            const r = records[ri];
            const lat = r.position_lat;
            const lon = r.position_long;
            if (lat == null || lon == null) continue;

            const time =
              r.timestamp != null
                ? typeof r.timestamp === 'number'
                  ? r.timestamp
                  : r.timestamp instanceof Date
                    ? r.timestamp.getTime()
                    : new Date(r.timestamp).getTime()
                : null;
            const speed = r.speed != null ? r.speed / 3.6 : null; // km/h → m/s

            let battery = r.battery_level ?? null;

            // If not in record, check our status reports
            if (battery == null && time) {
              // Catch up statusIdx to current time
              while (statusIdx < statusReports.length && statusReports[statusIdx].time <= time) {
                lastBattery = statusReports[statusIdx].level;
                statusIdx++;
              }
              battery = lastBattery;
            } else if (battery != null) {
              lastBattery = battery;
            }

            // Update gear state from events
            if (time) {
              while (gearIdx < gearEvents.length && gearEvents[gearIdx].time <= time) {
                const e = gearEvents[gearIdx];
                if (e.front != null) lastFrontGear = e.front;
                if (e.rear != null) lastRearGear = e.rear;
                if (e.frontTooth != null) lastFrontTooth = e.frontTooth;
                if (e.rearTooth != null) lastRearTooth = e.rearTooth;
                gearIdx++;
              }
            }

            const gearFront: number | null = r.front_gear_num ?? r.front_gear ?? lastFrontGear;
            const gearRear: number | null = r.rear_gear_num ?? r.rear_gear ?? lastRearGear;
            const gearFrontTooth: number | null = r.front_gear_num_tooth ?? lastFrontTooth;
            const gearRearTooth: number | null = r.rear_gear_num_tooth ?? lastRearTooth;

            if (r.front_gear_num != null || r.front_gear != null) lastFrontGear = gearFront;
            if (r.rear_gear_num != null || r.rear_gear != null) lastRearGear = gearRear;
            if (r.front_gear_num_tooth != null) lastFrontTooth = gearFrontTooth;
            if (r.rear_gear_num_tooth != null) lastRearTooth = gearRearTooth;

            const gears =
              gearFrontTooth != null && gearRearTooth != null && gearRearTooth !== 0
                ? gearFrontTooth / gearRearTooth
                : null;

            validPoints.push({
              lat,
              lon,
              ele: r.altitude ?? r.enhanced_altitude ?? null,
              time,
              hr: r.heart_rate ?? null,
              cad: r.cadence ?? null,
              power: r.power ?? null,
              speed,
              temp: r.temperature ?? null,
              gearFront,
              gearRear,
              gearFrontTooth,
              gearRearTooth,
              battery,
              gears,
            });
          }

          if (!validPoints.length) {
            reject(new Error('FIT file has no GPS points'));
            return;
          }

          const pts = enrichPoints(validPoints);
          const stats = computeStats(pts);
          resolve({ name, device, devices, format: 'fit', points: pts, stats, sport, subSport });
        } catch (ex) {
          reject(ex);
        }
      };

      const fastData = fastDecodeFitData(buf);
      if (fastData) {
        handleParsedFitData(null, fastData);
        return;
      }

      const fitParser = new FitParser({
        force: true,
        speedUnit: 'km/h',
        lengthUnit: 'm',
        temperatureUnit: 'celsius',
        elapsedRecordField: true,
      });

      fitParser.parse(buf, handleParsedFitData);
    });
  }

  // ── KML parser ────────────────────────────────────────────────
  function parseKML(buf: ArrayBuffer): any {
    const text = new TextDecoder().decode(buf);
    const doc = new DOMParser().parseFromString(text, 'application/xml');

    let name = 'Unnamed Track';
    const nameEl = doc.querySelector('Document > name, Placemark > name');
    if (nameEl) name = nameEl.textContent?.trim() || name;

    // Track: look for gx:Track or LineString
    const coordEls = doc.querySelectorAll('coordinates');
    if (!coordEls.length) throw new Error('No coordinates found in KML');

    const points: TrackPoint[] = [];
    coordEls.forEach((el) => {
      const lines = el.textContent?.trim().split(/\s+/) || [];
      lines.forEach((line) => {
        const parts = line.split(',');
        if (parts.length < 2) return;
        const lon = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        const ele = parts.length > 2 ? parseFloat(parts[2]) : null;
        if (isNaN(lat) || isNaN(lon)) return;
        points.push({
          lat,
          lon,
          ele: ele != null && isNaN(ele) ? null : ele,
          time: null,
          hr: null,
          cad: null,
          power: null,
          speed: null,
          temp: null,
          gearFront: null,
          gearRear: null,
          gearFrontTooth: null,
          gearRearTooth: null,
          battery: null,
          gears: null,
        });
      });
    });

    if (!points.length) throw new Error('No valid coordinates in KML');
    const pts = enrichPoints(points);
    const stats = computeStats(pts);
    return { name, format: 'kml', points: pts, stats };
  }

  // ── Public: dispatch by extension ────────────────────────────
  async function parseFile(file: File): Promise<any> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const buf: ArrayBuffer = (file as any)._buf ?? (await file.arrayBuffer());
    const predecodedText: string | undefined = (file as any)._text;
    let result: any;
    switch (ext) {
      case 'gpx':
        result = parseGPX(buf, predecodedText);
        break;
      case 'tcx':
        result = parseTCX(buf, predecodedText);
        break;
      case 'fit':
        result = await parseFIT(buf);
        break;
      case 'kml':
        result = parseKML(buf);
        break;
      default:
        throw new Error(`Unsupported format: .${ext}`);
    }

    if (result) {
      result.fileName = file.name;
      result.fileSize = file.size;
    }
    return result;
  }

  return {
    parseFile,
    computeStats,
    ensureCurvesAndZones,
    calculatePowerCurve,
    calculateHRCurve,
    calculatePowerZones,
    calculateHRZones,
    enrichPoints,
    setHRZones,
    getHRZones,
    setFTP,
    getFTP,
  };
})();
