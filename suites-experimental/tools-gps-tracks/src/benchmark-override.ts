// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Deterministic PRNG (Mulberry32) for reproducible benchmark runs.
let seed = 0x20260720;
(window as any).__resetBenchmarkSeed = (): void => {
  seed = 0x20260720;
};
Math.random = (): number => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return window.setTimeout(() => callback(performance.now()), 0);
};

window.cancelAnimationFrame = (id: number): void => {
  window.clearTimeout(id);
};

// Guard history.replaceState and history.pushState against browser rate-limiting
// (e.g. WebKit's 100 calls per 10 seconds SecurityError across multi-iteration runs).
if (typeof history !== 'undefined') {
  const origReplace = history.replaceState?.bind(history);
  const origPush = history.pushState?.bind(history);
  if (origReplace) {
    history.replaceState = function (data: any, unused: string, url?: string | URL | null): void {
      try {
        origReplace(data, unused, url);
      } catch (_) {}
    };
  }
  if (origPush) {
    history.pushState = function (data: any, unused: string, url?: string | URL | null): void {
      try {
        origPush(data, unused, url);
      } catch (_) {}
    };
  }
}

// Normalize devicePixelRatio to 1 so uPlot and canvas rendering execute
// identical code paths (e.g. decimation thresholds and canvas dimensions) across browsers.
try {
  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => 1,
    configurable: true,
  });
} catch (_) {}

// Normalize navigator.language to en-US so Intl.NumberFormat / locale formatters
// produce identical strings across browsers and OS locales.
try {
  Object.defineProperty(navigator, 'language', {
    get: () => 'en-US',
    configurable: true,
  });
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US'],
    configurable: true,
  });
} catch (_) {}

// Normalize CanvasRenderingContext2D.prototype.measureText so canvas layout calculations
// (histogram padding, axis label bounding boxes, cursor pills) do not vary with OS/browser
// system-ui font glyph metrics.
if (typeof CanvasRenderingContext2D !== 'undefined') {
  CanvasRenderingContext2D.prototype.measureText = function (text: string): TextMetrics {
    const fontStr = this.font || '10px sans-serif';
    const sizeMatch = fontStr.match(/(\d+(?:\.\d+)?)px/);
    const fontSize = sizeMatch ? parseFloat(sizeMatch[1]) : 10;
    const isBold = /\bbold\b|\b[6-9]00\b/i.test(fontStr);
    const charWidth = fontSize * (isBold ? 0.6 : 0.55);
    const width = String(text).length * charWidth;
    return {
      width,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: width,
      actualBoundingBoxAscent: fontSize * 0.8,
      actualBoundingBoxDescent: fontSize * 0.2,
      fontBoundingBoxAscent: fontSize * 0.8,
      fontBoundingBoxDescent: fontSize * 0.2,
      emHeightAscent: fontSize * 0.8,
      emHeightDescent: fontSize * 0.2,
      hangingBaseline: fontSize * 0.8,
      alphabeticBaseline: 0,
      ideographicBaseline: -fontSize * 0.2,
    } as TextMetrics;
  };
}
