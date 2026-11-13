// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { Parsers } from './parsers';

export interface ZoneRange {
  name: string;
  min: number;
  max: number;
  color: string;
}

export const Zones = (() => {
  function getPowerZones(): ZoneRange[] {
    const ftp = Parsers.getFTP();
    const thresholds = [0.55, 0.75, 0.9, 1.05, 1.2, 1.5].map((t) => t * ftp);
    const names = [
      'Active Recovery',
      'Endurance',
      'Tempo',
      'Threshold',
      'VO2 Max',
      'Anaerobic',
      'Neuromuscular',
    ];
    const colors = ['#82E0AA', '#A8C8A0', '#F7DC6F', '#F8C471', '#F39C12', '#E67E22', '#C0392B'];

    const zones: ZoneRange[] = [];
    let last = 0;
    for (let i = 0; i < thresholds.length; i++) {
      zones.push({ name: names[i], min: last, max: thresholds[i], color: colors[i] });
      last = thresholds[i];
    }
    zones.push({ name: names[6], min: last, max: Infinity, color: colors[6] });
    return zones;
  }

  function getHRZones(): ZoneRange[] {
    const thresholds = Parsers.getHRZones();
    const names = ['Recovery', 'Aerobic', 'Tempo', 'Threshold', 'Anaerobic'];
    const colors = ['#82E0AA', '#F7DC6F', '#F8C471', '#FF6B6B', '#C0392B'];

    const zones: ZoneRange[] = [];
    let last = 0;
    for (let i = 0; i < thresholds.length; i++) {
      zones.push({ name: names[i], min: last, max: thresholds[i], color: colors[i] });
      last = thresholds[i];
    }
    zones.push({ name: names[4], min: last, max: Infinity, color: colors[4] });
    return zones;
  }

  return {
    getPowerZones,
    getHRZones,
  };
})();
