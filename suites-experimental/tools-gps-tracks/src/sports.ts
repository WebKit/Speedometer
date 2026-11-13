// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

export interface SportDefinition {
  name: string;
  icon: string;
  defaultPreset: 'speed' | 'pace';
  paceUnit?: 'km' | '100m';
}

export const SPORTS: Record<string, SportDefinition> = {
  cycling: { name: 'Cycling', icon: 'directions_bike', defaultPreset: 'speed' },
  skiing: { name: 'Skiing', icon: 'downhill_skiing', defaultPreset: 'speed' },
  running: { name: 'Running', icon: 'directions_run', defaultPreset: 'pace', paceUnit: 'km' },
  swimming: { name: 'Swimming', icon: 'pool', defaultPreset: 'pace', paceUnit: '100m' },
};

export function getSportIcon(sport: string | null | undefined): string {
  if (!sport) return 'question_mark';
  const key = sport.toLowerCase();
  return SPORTS[key]?.icon || 'exercise';
}
