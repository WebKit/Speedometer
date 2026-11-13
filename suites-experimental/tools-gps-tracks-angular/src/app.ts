// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

import 'zone.js';
import '@angular/compiler';
import { ApplicationRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent, PreloadedBenchmarkPayload } from './app.component';

export function selectTrack(id: string, fit = true, deferChartRender = false): void {
  (window as any).__trackStateService?.selectTrack(id, fit, deferChartRender);
}

let activeAppRef: ApplicationRef | null = null;
let activeAppComponent: AppComponent | null = null;
let preloadedBenchmarkPayloads: PreloadedBenchmarkPayload[] | null = null;

async function preloadBenchmarkFiles(): Promise<PreloadedBenchmarkPayload[]> {
  if (preloadedBenchmarkPayloads) return preloadedBenchmarkPayloads;
  try {
    const manifestResp = await fetch('./test-data/manifest.json');
    const fileNames: string[] = await manifestResp.json();
    const decoder = new TextDecoder();
    preloadedBenchmarkPayloads = await Promise.all(
      fileNames.map(async (name) => {
        const fileResp = await fetch(`./test-data/${name}`);
        let buf = await fileResp.arrayBuffer();
        let cleanName = name;
        if (name.toLowerCase().endsWith('.gz')) {
          cleanName = name.slice(0, -3);
          const bytes = new Uint8Array(buf);
          if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
            const ds = new DecompressionStream('gzip');
            const stream = new Blob([buf]).stream().pipeThrough(ds);
            buf = await new Response(stream).arrayBuffer();
          }
        }
        const text = cleanName.toLowerCase().endsWith('.fit') ? undefined : decoder.decode(buf);
        const file = new File([buf], cleanName, { type: 'application/octet-stream' });
        (file as any)._buf = buf;
        if (text !== undefined) (file as any)._text = text;
        return { cleanName, buf, text, file };
      }),
    );
    if (typeof (window as any).__resetBenchmarkSeed === 'function') {
      (window as any).__resetBenchmarkSeed();
    }
    return preloadedBenchmarkPayloads;
  } catch {
    return [];
  }
}

async function ensureFreshAngularBootstrap(): Promise<AppComponent> {
  if (activeAppRef) {
    activeAppRef.destroy();
    activeAppRef = null;
    activeAppComponent = null;
  }
  if (!document.getElementById('app')) {
    const rootEl = document.createElement('app-root');
    rootEl.id = 'app';
    const toastEl = document.getElementById('toast-container');
    if (toastEl && toastEl.parentNode) {
      toastEl.parentNode.insertBefore(rootEl, toastEl);
    } else {
      document.body.appendChild(rootEl);
    }
  }
  activeAppRef = await bootstrapApplication(AppComponent);
  activeAppComponent = activeAppRef.components[0]?.instance as AppComponent;
  return activeAppComponent;
}

function bindBenchmarkTriggers(): void {
  const btnLoad = document.getElementById('btn-step-load');
  const btnAnalysis = document.getElementById('btn-step-analysis');
  const btnInsights = document.getElementById('btn-step-insights');
  const btnDetails = document.getElementById('btn-step-details');
  const btnAggregate = document.getElementById('btn-step-aggregate');
  const btnEvolution = document.getElementById('btn-step-evolution');
  const btnCourses = document.getElementById('btn-step-courses');

  btnLoad?.addEventListener('click', async () => {
    try {
      const payloads = await preloadBenchmarkFiles();
      const comp = await ensureFreshAngularBootstrap();
      await comp.runBenchmarkLoad(payloads);
    } catch (err) {
      console.error('Angular benchmark load step error:', err);
      window.dispatchEvent(new CustomEvent('load-and-parse-complete'));
    }
  });

  btnAnalysis?.addEventListener('click', () => {
    activeAppComponent?.runBenchmarkAnalysis();
  });

  btnInsights?.addEventListener('click', () => {
    activeAppComponent?.runBenchmarkInsights();
  });

  btnDetails?.addEventListener('click', () => {
    activeAppComponent?.runBenchmarkDetails();
  });

  btnAggregate?.addEventListener('click', () => {
    activeAppComponent?.runBenchmarkAggregate();
  });

  btnEvolution?.addEventListener('click', () => {
    activeAppComponent?.runBenchmarkEvolution();
  });

  btnCourses?.addEventListener('click', () => {
    activeAppComponent?.runBenchmarkCourses();
  });

  (window as any).benchmarkSteps = {
    loadAndParseFiles: () => document.getElementById('btn-step-load')?.click(),
    displayAnalysisMetrics: () => document.getElementById('btn-step-analysis')?.click(),
    displayInsights: () => document.getElementById('btn-step-insights')?.click(),
    displayDetails: () => document.getElementById('btn-step-details')?.click(),
    displayAggregateMetrics: () => document.getElementById('btn-step-aggregate')?.click(),
    displayEvolutionMetrics: () => document.getElementById('btn-step-evolution')?.click(),
    displayCourses: () => document.getElementById('btn-step-courses')?.click(),
  };
}

async function initPreparePhase(): Promise<void> {
  let fontTimerId: number | null = null;
  const fontTimeout = new Promise<void>((resolve) => {
    fontTimerId = window.setTimeout(resolve, 1000);
  });
  try {
    const fontLoadPromise = document.fonts
      ? Promise.all([
          document.fonts.load('24px "Material Symbols Rounded"').catch(() => {}),
          document.fonts.ready,
        ])
      : Promise.resolve();
    await Promise.race([fontLoadPromise, fontTimeout]);
  } finally {
    if (fontTimerId !== null) window.clearTimeout(fontTimerId);
  }
  document.body.classList.remove('loading-fonts');

  bindBenchmarkTriggers();
  await preloadBenchmarkFiles();

  const readyEl = document.createElement('div');
  readyEl.id = 'app-is-ready';
  readyEl.setAttribute('data-ready', 'true');
  readyEl.style.display = 'none';
  document.body.appendChild(readyEl);

  const camelReadyEl = document.createElement('div');
  camelReadyEl.id = 'appIsReady';
  camelReadyEl.setAttribute('data-ready', 'true');
  camelReadyEl.style.display = 'none';
  document.body.appendChild(camelReadyEl);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void initPreparePhase();
  });
} else {
  void initPreparePhase();
}
