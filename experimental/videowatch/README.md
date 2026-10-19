# VideoWatch SPA — Hybrid Polymer + Lit/Signals + Redux Workload

A single-page video watch application built with [@polymer/polymer](https://polymer-library.polymer-project.org/), [lit-html](https://lit.dev/docs/libraries/standalone-templates/), [@preact/signals-core](https://github.com/preactjs/signals), and [Redux](https://redux.js.org/).

## Introduction

`VideoWatch-SPA` models the architecture and DOM/JavaScript lifecycle of a large-scale desktop video streaming SPA (`watch` route navigation):

-   **Outer Application Shell (`@polymer/polymer` Custom Elements)**: Custom elements (`ytd-app`, `ytd-watch-flexy`, `ytd-watch-metadata`, `ytd-playlist-panel-renderer`, `ytd-comments`, `ytd-engagement-panel-section-list-renderer`, `ytd-watch-next-secondary-results-renderer`) using `PolymerElement` (`html` template stamping, `dom-repeat`, property observers, and `shadycss` custom style variables).
-   **Inner Reactive Lockups (`lit-html` + `@preact/signals-core`)**: Modern reactive video lockup and comment/chip subtrees (`yt-lockup-view-model`, `yt-thumbnail-view-model`, `yt-LockupMetadataViewModel`, `yt-chip-cloud-chip-renderer`) using reactive Signals and `lit-html` rendering into open Shadow Roots with `adoptedStyleSheets`.
-   **Centralized Normalized State (`redux`)**: A normalized Redux store managing `watchNext` route payloads, entity maps (`entities.byKey`), bounded navigation history snapshots, and component recycling pools (`sharedElementPool`).

During the measured `NavigatePlaylistAndInteract` step, the workload executes a continuous sequence of in-page SPA video navigations, exercising realistic custom-element pooling vs. fresh DOM subtree stamping, Shadow DOM layout/style updates, and cross-heap JS/DOM object lifetimes.

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
│   ├── cow-lockup.js       # Lit + Signals reactive lockup/chip custom elements
│   ├── data.js             # Deterministic watch-next navigation payload generator
│   ├── index.js            # Application entry point
│   ├── polymer-shell.js    # PolymerElement outer shell & SPA navigation controller
│   └── store.js            # Normalized Redux store & custom-element recycling pool
├── index.html              # Main HTML entry file
├── package.json            # NPM configuration
├── rollup.config.mjs       # Rollup bundler configuration
└── styles.css              # Global & custom-property stylesheet
```
