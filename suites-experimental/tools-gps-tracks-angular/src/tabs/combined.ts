// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { TrackData } from '../parsers';
import {
  getActiveCombinedComponent,
  CombinedTabComponent,
  CombinedCorrelationRow,
  CombinedSectionComparisonRow,
} from '../components/combined-tab.component';

export { CombinedTabComponent };
export type { CombinedCorrelationRow, CombinedSectionComparisonRow };

export function initCombined() {
  // Handled by CombinedTabComponent lifecycle
}

export function resetCombined() {
  const comp = getActiveCombinedComponent();
  if (comp) {
    comp.reset();
    return;
  }
  const tooltip = document.getElementById('combined-tooltip');
  if (tooltip) tooltip.remove();
  const container = document.getElementById('combined-view');
  if (container) {
    container.innerHTML = `
      <div id="combined-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for combined analysis</div>
      </div>
    `;
  }
}

export function setCombinedMetrics(xKey: string, yKey: string) {
  const comp = getActiveCombinedComponent();
  if (comp) {
    comp.setMetrics(xKey, yKey);
  }
}

export function setCombinedPolar(polar: boolean) {
  const comp = getActiveCombinedComponent();
  if (comp) {
    comp.setPolar(polar);
  }
}

export function setCombinedSliderProgress(fraction: number) {
  const comp = getActiveCombinedComponent();
  if (comp) {
    comp.setSliderProgress(fraction);
  }
}

export function renderCombined(
  trackOrTracks: TrackData | TrackData[] | null,
  allTracks: TrackData[] = [],
) {
  const comp = getActiveCombinedComponent();
  if (comp) {
    comp.render(trackOrTracks, allTracks);
  }
}

export function resizeCombined() {
  const comp = getActiveCombinedComponent();
  if (comp) {
    comp.resize();
  }
}
