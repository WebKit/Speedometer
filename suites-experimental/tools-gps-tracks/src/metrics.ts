// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { TrackPoint } from './parsers';

export interface MetricDefinition {
  label: string;
  field: keyof TrackPoint;
  unit: string;
  color: string;
  abbr: string;
  icon: string;
  fmt: (v: number, precise?: boolean) => string;
  fmtAxis: (v: number) => string;
  compute?: (
    pts: TrackPoint[],
    fillNulls: (data: (number | null)[]) => (number | null)[],
  ) => (number | null)[];
  transform?: (v: number) => number | null;
  smoothSigma?: number;
}

export const Metrics = {
  speed: { name: 'Speed', color: '#45B7D1', icon: 'speed' },
  gradient: { name: 'Gradient', color: '#A8C8A0', icon: 'trending_up' },
  power: { name: 'Power', color: '#F7DC6F', icon: 'bolt' },
  hr: { name: 'Heart Rate', color: '#FF6B6B', icon: 'favorite' },
  cadence: { name: 'Cadence', color: '#BB8FCE', icon: 'directions_run' },
  temperature: { name: 'Temperature', color: '#F8C471', icon: 'thermostat' },
  elevation: { name: 'Elevation', color: '#4ECDC4', icon: 'terrain' },
  distance: { name: 'Distance', color: '#9f1bfdff', icon: 'arrow_range' },
  gearRear: { name: 'Rear Gear', color: '#82E0AA', icon: 'settings' },
  gearFront: { name: 'Front Gear', color: '#A8C8A0', icon: 'settings_input_component' },
  gears: { name: 'Gears', color: '#FF8C00', icon: 'settings' },
  battery: { name: 'Battery', color: '#45B7D1', icon: 'battery_full' },
  vam: { name: 'VAM', color: '#FFA07A', icon: 'trending_up' },
};

export const METRICS: Record<string, MetricDefinition> = {
  elevation: {
    label: 'Elevation',
    field: 'ele',
    unit: 'm',
    color: Metrics.elevation.color,
    abbr: 'ele',
    icon: Metrics.elevation.icon,
    fmt: (v, p) => (p ? v.toFixed(1) : Math.round(v).toString()),
    fmtAxis: (v) => Math.round(v).toString(),
  },
  speed: {
    label: 'Speed',
    field: 'speed',
    unit: 'km/h',
    color: Metrics.speed.color,
    abbr: 'spd',
    icon: Metrics.speed.icon,
    fmt: (v) => (v * 3.6).toFixed(1),
    fmtAxis: (v) => (v * 3.6).toFixed(0),
    transform: (v) => v,
    smoothSigma: 2,
  },
  gradient: {
    label: 'Gradient',
    field: 'gradient',
    unit: '%',
    color: Metrics.gradient.color,
    abbr: 'grad',
    icon: Metrics.gradient.icon,
    fmt: (v) => v.toFixed(1),
    fmtAxis: (v) => v.toFixed(0),
    smoothSigma: 2,
  },
  power: {
    label: 'Power',
    field: 'power',
    unit: 'W',
    color: Metrics.power.color,
    abbr: 'pwr',
    icon: Metrics.power.icon,
    fmt: (v) => Math.round(v).toString(),
    fmtAxis: (v) => Math.round(v).toString(),
  },
  hr: {
    label: 'Heart Rate',
    field: 'hr',
    unit: 'bpm',
    color: Metrics.hr.color,
    abbr: 'hr',
    icon: Metrics.hr.icon,
    fmt: (v) => Math.round(v).toString(),
    fmtAxis: (v) => Math.round(v).toString(),
  },
  cadence: {
    label: 'Cadence',
    field: 'cad',
    unit: 'rpm',
    color: Metrics.cadence.color,
    abbr: 'cad',
    icon: Metrics.cadence.icon,
    fmt: (v) => Math.round(v).toString(),
    fmtAxis: (v) => Math.round(v).toString(),
  },
  temperature: {
    label: 'Temp',
    field: 'temp',
    unit: '°C',
    color: Metrics.temperature.color,
    abbr: 'temp',
    icon: Metrics.temperature.icon,
    fmt: (v) => v.toFixed(1),
    fmtAxis: (v) => Math.round(v).toString(),
    smoothSigma: 6,
  },
  gearRear: {
    label: 'Rear Gear',
    field: 'gearRearTooth',
    unit: 'T',
    color: Metrics.gearRear.color,
    abbr: 'rgr',
    icon: Metrics.gearRear.icon,
    fmt: (v) => Math.round(v).toString(),
    fmtAxis: (v) => Math.round(v).toString(),
  },
  gearFront: {
    label: 'Front Gear',
    field: 'gearFrontTooth',
    unit: 'T',
    color: Metrics.gearFront.color,
    abbr: 'fgr',
    icon: Metrics.gearFront.icon,
    fmt: (v) => Math.round(v).toString(),
    fmtAxis: (v) => Math.round(v).toString(),
  },
  gears: {
    label: 'Gears',
    field: 'gears',
    unit: '',
    color: Metrics.gears.color,
    abbr: 'gr',
    icon: Metrics.gears.icon,
    fmt: (v) => v.toFixed(2),
    fmtAxis: (v) => v.toFixed(1),
  },
  battery: {
    label: 'Battery',
    field: 'battery',
    unit: '%',
    color: Metrics.battery.color,
    abbr: 'bat',
    icon: Metrics.battery.icon,
    fmt: (v) => Math.round(v).toString(),
    fmtAxis: (v) => Math.round(v).toString(),
  },
  vam: {
    label: 'VAM',
    field: 'ele',
    unit: 'm/h',
    color: '#FFA07A',
    abbr: 'vam',
    icon: 'trending_up',
    fmt: (v) => Math.round(v).toString(),
    fmtAxis: (v) => Math.round(v).toString(),
    smoothSigma: 5,
    compute: (pts, fillNulls) => {
      const vam = new Array(pts.length).fill(null);
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        const prev = pts[i - 1];
        if (p.ele != null && prev.ele != null && p.time != null && prev.time != null) {
          const de = p.ele - prev.ele;
          const dt = (p.time - prev.time) / 1000; // in seconds
          if (dt > 0) vam[i] = (de / dt) * 3600; // m/h
        }
      }
      return fillNulls(vam);
    },
  },
};
