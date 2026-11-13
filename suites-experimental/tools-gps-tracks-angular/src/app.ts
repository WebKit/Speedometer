// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import 'zone.js';
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';

export function selectTrack(id: string, fit = true, deferChartRender = false): void {
  (window as any).__trackStateService?.selectTrack(id, fit, deferChartRender);
}

function bootAngularApp(): void {
  bootstrapApplication(AppComponent).catch((err) => {
    console.error('Angular bootstrap error:', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAngularApp);
} else {
  bootAngularApp();
}
