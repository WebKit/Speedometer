// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function compactId(timestamp: number): string {
  // Use a compact representation of the timestamp (seconds since epoch)
  // 1712650000 -> Base64
  const buf = new Uint32Array([Math.floor(timestamp / 1000)]);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf.buffer)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function shortRandom(): string {
  return Math.random().toString(36).slice(2, 6);
}

export function fmtDuration(s: number): string {
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${Math.round(s / 3600)}h`;
}

export function fmtSecs(s: number): string {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${Math.floor(s % 60)}s`;
}

export function fmtPace(seconds: number | null): string {
  if (seconds == null || !isFinite(seconds)) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function fmtDate(ts: number | string | Date): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return 'Unknown date';
  return d.toISOString().split('T')[0];
}

export function fmtDateTime(ts: number | string | Date): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return 'Unknown';
  const iso = d.toISOString();
  return `${iso.split('T')[0]} ${iso.split('T')[1].slice(0, 5)}`;
}

export function fmtFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function escHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getTagColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);

  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 65%)`;
}

/**
 * Smoothes a numeric array using a simple Gaussian kernel.
 * sigma: standard deviation (radius of smoothing)
 */
export function gaussianSmooth(data: (number | null)[], sigma: number = 2): (number | null)[] {
  if (sigma <= 0) return data;

  const size = Math.ceil(sigma * 3) * 2 + 1;
  const kernel = new Float32Array(size);
  const half = Math.floor(size / 2);
  let sum = 0;

  for (let i = 0; i < size; i++) {
    const x = i - half;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  for (let i = 0; i < size; i++) kernel[i] /= sum;

  const result: (number | null)[] = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    if (data[i] === null) {
      result[i] = null;
      continue;
    }

    let val = 0;
    let weightSum = 0;
    for (let k = 0; k < size; k++) {
      const idx = i + k - half;
      if (idx >= 0 && idx < data.length && data[idx] !== null) {
        val += data[idx]! * kernel[k];
        weightSum += kernel[k];
      }
    }
    result[i] = weightSum > 0 ? val / weightSum : data[i];
  }
  return result;
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
