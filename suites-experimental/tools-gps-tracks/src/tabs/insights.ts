// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { TrackData } from '../parsers';
import {
  getActiveInsightsComponent,
  setInsightsToastFn,
  InsightsTabComponent,
} from '../components/insights-tab.component';

export { InsightsTabComponent };

export function initInsights(showToast: (msg: string, type?: string) => void) {
  setInsightsToastFn(showToast);
}

export function resetInsights() {
  const comp = getActiveInsightsComponent();
  if (comp) {
    comp.reset();
    return;
  }
  document.querySelectorAll('.hr-settings-popup').forEach((el) => el.remove());
  const container = document.getElementById('insights-view');
  if (container) {
    container.innerHTML = `
      <div id="insights-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for insights</div>
      </div>
    `;
  }
}

export function renderInsights(
  track: TrackData | null,
  allTracks: TrackData[] = [],
  sectionRange: [number, number] | null = null,
) {
  const comp = getActiveInsightsComponent();
  if (comp) {
    comp.render(track, allTracks, sectionRange);
  }
}
