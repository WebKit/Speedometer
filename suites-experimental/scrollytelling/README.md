# Scrollytelling Workload (Project A-101: The Homestead Dossier)

An experimental scrollytelling benchmark workload for Speedometer that evaluates browser performance during interactive scroll-driven visual storytelling.

## Overview

This workload models a 1950s/1960s mid-century architectural dossier and technical blueprint (`#000000` pure black background with high-contrast B&W geometry and procedural line art). As the user scrolls through 17 narrative stages covering American homestead evolution and geotechnical engineering analysis, the benchmark measures layout, Canvas 2D rendering, SVG overlay positioning, and DOM interaction performance.

## Architecture & Mechanics

- **Scroll Engine**: Uses `scrollama` to track stage progression and trigger deterministic scroll animations (`src/engine-scrollama.js`).
- **Graphics & Rendering**: Procedural Canvas 2D linework, monochrome cross-hatching, and organic watercolor animation reveals (`src/graphics.js`).
- **Layout & DOM**: 17 stages with 5 narrative phases each, featuring sticky SVG leader callouts, slanted borders, and upright body typography (`src/content.js`, `src/main.js`, `src/styles.css`).
- **Benchmark Determinism**: Intercepts `window.requestAnimationFrame` to synchronously flush visual states before `page.layout()` measurements (`index.html`).

## Building the Workload

To build the bundle using Rollup:

```bash
npm install
npm run build
```
