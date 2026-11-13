# VideoWatch SPA — Hybrid Polymer + Lit/Signals + Redux Workload

A single-page video watch application built with [@polymer/polymer](https://polymer-library.polymer-project.org/), [lit-html](https://lit.dev/docs/libraries/standalone-templates/), [@preact/signals-core](https://github.com/preactjs/signals), and [Redux](https://redux.js.org/).

## Introduction

`VideoWatch-SPA` models the architecture and DOM/JavaScript lifecycle of a large-scale desktop video streaming SPA (`watch` route navigation), with a custom element hierarchy (`ytd-*` / `yt-*` / `ytp-*`) inspired by YouTube Desktop's hybrid Polymer shell and Lit/Signals lockup architecture:

-   **Outer Application Shell (`@polymer/polymer` Custom Elements)**: Custom elements (`ytd-app`, `ytd-watch-flexy`, `ytd-watch-metadata`, `ytd-playlist-panel-renderer`, `ytd-comments`, `ytd-comment-thread-renderer`, `ytd-engagement-panel-section-list-renderer`, `ytd-watch-next-secondary-results-renderer`) using `PolymerElement` (`html` template stamping, `dom-repeat`, and property bindings).
-   **Inner Reactive Lockups (`lit-html` + `@preact/signals-core`)**: Reactive sidebar video lockup cards (`yt-lockup-view-model`) using Signals and `lit-html` rendering into open Shadow Roots with shared `adoptedStyleSheets`.
-   **Centralized Normalized State (`redux`)**: A normalized Redux store managing `watchNext` route payloads, entity maps (`entities.byKey`), bounded navigation history snapshots, and component recycling pools (`sharedElementPool` + `PooledSubtreeStamper`).
-   **Allocation & Retention Modeling**:
    -   `_buildTranscriptAndStoryboardIndex` (`resolvedBindings` / `tokenIndex`), `_retainedProjection` on lockup custom elements, `_bootstrapComponentRegistry`, and `_collectNavigationDomSnapshots` (`PANEL_DOM_QUERIES` post-navigation active-cursor marker scans across component and host shadow roots with bounded FIFO eviction in `_retainedDomSnapshots`) intentionally model allocation-heavy per-navigation precomputation and bounded multi-navigation retention so that the measured `NavigatePlaylistAndInteract` step includes both minor and major GC cycles across the JavaScript and DOM heaps.

During the measured `NavigatePlaylistAndInteract` step, the workload executes a continuous sequence of in-page SPA video navigations, exercising realistic custom-element pooling vs. fresh DOM subtree stamping, Shadow DOM layout/style updates, and cross-heap JS/DOM object lifetimes.

> **Note (No Media Decoding)**: This workload intentionally does not instantiate a `<video>` element or decode audio/video streams. The player viewport, scrub-bar chapter heatmap, transcript timeline, and thumbnail cards are rendered purely with HTML, CSS gradients, and inline SVG so that the benchmark remains 100% deterministic, offline, and main-thread-bound (measuring JavaScript, DOM/Shadow DOM, CSS/layout, and garbage collection without async media decoder threads or hardware codec variance).

## Installation

Ensure you have [Node.js](https://nodejs.org/en) installed (`>=22.0.0`).

```bash
npm install
```

## Production Build

To bundle the JavaScript modules with Rollup and copy the static assets into `dist/`:

```bash
npm run build
```

## Project Structure

```
├── dist/                   # Production build output (bundle.js, index.html, styles.css)
├── src/
│   ├── data.js             # Deterministic watch-next navigation payload generator
│   ├── index.js            # Application entry point
│   ├── lockup-elements.js  # Lit + Signals reactive lockup/chip custom elements
│   ├── polymer-shell.js    # PolymerElement outer shell & SPA navigation controller
│   └── store.js            # Normalized Redux store & custom-element recycling pool
├── index.html              # Main HTML entry file
├── package.json            # NPM configuration
├── rollup.config.mjs       # Rollup bundler configuration
└── styles.css              # Global & custom-property stylesheet
```
