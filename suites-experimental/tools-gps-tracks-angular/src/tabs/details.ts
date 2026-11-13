// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import { TrackData } from '../parsers';
import {
  getActiveDetailsComponent,
  setDetailsCallbacks,
  DetailsTabComponent,
} from '../components/details-tab.component';

export { DetailsTabComponent };

export function initDetails(onTagsChange: () => void, onDeleteTrack: (id: string) => void) {
  setDetailsCallbacks(onTagsChange, onDeleteTrack);
}

export function resetDetails() {
  const comp = getActiveDetailsComponent();
  if (comp) {
    comp.reset();
    return;
  }
  const container = document.getElementById('details-view');
  if (container) {
    container.innerHTML = `
      <div id="details-empty" class="empty-state">
        <span class="material-symbols-rounded empty-icon">no_sim</span>
        <div class="empty-text">Select a track for details</div>
      </div>
    `;
  }
}

export function renderDetails(
  track: TrackData | null,
  globalTags: string[] = [],
  allTracks: TrackData[] = [],
  sectionRange?: [number, number] | null,
) {
  const comp = getActiveDetailsComponent();
  if (comp) {
    comp.render(track, globalTags, allTracks, sectionRange);
  }
}
