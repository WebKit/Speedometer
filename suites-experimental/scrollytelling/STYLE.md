# Speedometer Scrollytelling Workload — Style & Architectural Requirements

When modifying or extending the `suites-experimental/scrollytelling` workload, all engineers, agents, and subagents must strictly adhere to the following 9 architectural and graphic design rules to maintain visual harmony and benchmark timing precision.

---

## 1. Core Aesthetic & Palette: 1950s Black & White Blueprint / Planning Design
- **Background Texture**: Pure black drafting background (`#000000` body background, `#111111` drafting canvas/inactive cards, `#0a0a0a` active panels).
- **Allowed Background Assets**: Only use B&W topographic maps (`topo_map_*.webp`) and our standalone tiling SVG drafting grid (`drafting_grid_tiling.svg`) blended with `screen` / `color-dodge` / `overlay` (and inverted where necessary) so linework appears crisp white/light gray on black.

---

## 2. Strict Black & White Geometry & Ink Palette (Zero Dark-on-Dark Text)
- All structural wireframes, text, cards, borders, badges, and procedural line art remain strictly high-contrast black and white.
- **Primary Text & Drawing Ink**: `#ffffff` (pure white) or `var(--ink-primary)`.
- **Secondary Lines & Hatching**: `#cccccc` and `#777777` or `var(--ink-secondary)`.
- **Active Highlights & Cards**: `#0a0a0a` (deep black/slate) or `#000000` (pure black) backgrounds with `#ffffff` text and borders.
- **NEVER** use dark or muted text over dark gray/dark backgrounds. Every label, subtitle, specification, and TOC link must remain bright and legible at all times.

---

## 3. Slightly Slanted Borders & Geometric Shapes
- Every layout container, header, step card (`.step`), drawing frame (`.graphic-sticky-wrapper`), timeline point (`.timeline-point`), and SVG/Canvas title block or callout badge must feature intentional, slightly slanted geometric angles (`-2.0°` to `+2.0°`) and asymmetric outlines.
- **Exemption**: Standard paragraph body text (`.step-paragraph-item`, `.step-description`) is explicitly exempt from slanting and must remain vertical.

---

## 4. Independent & Irregular Drop Shadow Angles (The "Collage / Diorama" Rule)
- **Irregularity per Element**: Drop shadow distances and offset angles must vary irregularly per text block, per animation stage, and per card.
- **Angle Independence (`Shadow Angle != Box Angle`)**: A drop shadow must **never** share the exact same rotation angle as the box casting it.
  - **In CSS**: Implement shadows using positioned pseudo-elements (`::before` or `::after` with `background: var(--shadow-solid, #222222); z-index: -1;`) rotated at a slightly different angle (`--shadow-tilt`) than the box itself (`--step-tilt`, `--tab-tilt`).
  - **In Canvas & SVG**: Draw drop shadows as separate underlying polygons or rectangles with an independent rotation transformation before drawing the foreground element.

---

## 5. Three-Tier Typography Hierarchy
1. **Display / Titles / Badges**: Bold mid-century industrial display fonts (`Impact`, `Arial Black`, `Futura`).
2. **Narrative Body Text / Paragraphs**: Clean, effortlessly readable standard sans-serif / system fonts (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) with comfortable line height (`1.65`) and normal weight (`400`).
3. **Technical Specifications & Metadata**: Typewriter monospace fonts (`Courier New`, `Courier`, monospace) exclusively for engineering specifications (`.step-specs`), title blocks, leader callouts, Table of Contents items, and bottom timeline year markers.

---

## 6. Vertical Standard Paragraph Text & 100% Full Opacity at All Times
- **Standard Text Styling & Vertical Alignment**: Paragraph text must never be broken into visually separate boxes, cards, or tabs. All paragraph text must use standard text styling with clean vertical alignment (`0°` rotation, straight vertical layout).
- **100% Full Opacity Guarantee**: Section cards (`.step`) and all text elements (`.step-meta`, `.step-title`, `.step-paragraph-item`, `.step-specs`, `.spec-label`, `.toc-item`, `.toc-num`, `.timeline-point`) must **never be grayed out or dimmed** when inactive. Section text must maintain `opacity: 1 !important;` and bright white/light-gray text colors at all times.

---

## 7. Zero CSS Transitions / Layout Animations (Speedometer Benchmark Accuracy)
- In the Speedometer synchronous test harness, `window.requestAnimationFrame` is intercepted and flushed synchronously before measuring `page.layout()`.
- When CSS transitions or animations are present, DOM elements get trapped in asynchronous intermediate states, corrupting benchmark frame timing and layout snapshots.
- **Rule**: All CSS transitions and inline JS animations must remain disabled globally (`transition: none !important; animation: none !important;`). All state updates (active card highlighting, TOC collapsing, timeline visibility) must occur instantaneously and synchronously.

---

## 8. Dynamic Animation-Specific Procedural Color Highlights (Zero Permanent Brush Backgrounds)
- **No Static Bitmap Brush Backgrounds**: Permanent watercolor brush background textures (`bw_watercolor_texture.webp`, `wcWash`, `wc1`, `wc2`, `wc3`) must never be rendered over stage backgrounds or animations.
- **Dynamic Procedural Highlights**: Color accents are permitted exclusively as dynamic, animation-specific HTML5 Canvas 2D fills and gradients that animate from `0.0` as scroll progress advances (e.g., foliage emerald canopies, oak log carpentry, aquifer sapphire water tables, kiln-fired red brick terracotta walls, golden sunlight rays, hydraulic sluice cyan water, laser transit neon beams, and geothermal radiant convection loops).

---

## 9. Tiling Drafting Grid Asset & Interactive Navigation Overlays
- **Tiling Grid Asset**: Use our standalone SVG grid asset (`drafting_grid_tiling.svg` with large ~1cm intersection dots and fine ~1mm dotted connecting lines) tiled via CSS `background-repeat: repeat` and Canvas 2D `IMAGE_SOURCES.grid`.
- **Collapsible TOC & Bottom Timeline Overlays**: Both navigation overlays must remain hidden at the top of the page (`.is-hidden`) and appear synchronously without CSS transitions after scrolling past the header title threshold (~300px).

---

## Onboarding & Best Practices: The `/learn` Command
When onboarding to or modifying this scrollytelling benchmark workload, we strongly recommend that all engineers, agents, and subagents use the `/learn` slash command to familiarize themselves with these 9 architectural rules, benchmark constraints, and styling guardrails before making code changes or submitting pull requests.
