# Scrollytelling Workload: Layout & Design Decision Document

This document records the concise design decisions and architectural rules for the **Project A-101: The Homestead Dossier** scrollytelling benchmark workload in Speedometer.

## Executive Design Decision

The workload models a 1950s/1960s mid-century architectural journal, technical drafting blueprint, and precision print instruction manual (such as the classic 1968 Canon Autozoom 518 instruction manual). To maintain visual harmony and benchmark performance consistency, all layout components, CSS styles, Canvas procedural renderings, and SVG overlays must follow these foundational rules:

### Aesthetic Reference: Inverted 1968 Canon Autozoom 518 Graphic & Layout Style

Our visual identity adapts the utilitarian yet refined late-1960s Japanese industrial technical print design of the Canon Autozoom 518 manual, inverted for a negative dark-mode drafting void (`#000000` pure black background, `#111111` drafting canvas, `#ffffff` primary white text and linework). The typography establishes a strict hierarchy combining bold, condensed mid-century display lettering with clean, airy geometric sans-serifs (resembling Futura/Helvetica) and typewriter monospace engineering tables. Section headers and step sequences (`1`, `2`, `3`) leap from the dark canvas in high-contrast **crimson-ruby accent red** (`#D12B3E`), paired with crisp red leader-line callouts (`---→`) targeting mechanical and structural components. The layout balances technical precision and human warmth through asymmetric grids, slanted geometric shapes, rounded rectangular diagram frames, and high-contrast duotone architectural line art.

### 1. 1950s Black & White Blueprint / Planning Design with Organic Watercolor Accents

-   **Pure Black Background & B&W UI**: The UI theme is negative blueprint drafting (light on dark void). Body background is `#000000`. Inactive cards and drafting canvas are `#111111`, active cards are `#0a0a0a`. Primary drafting ink and typography is `#ffffff`. Secondary lines are `#cccccc` and `#777777`.
-   **Organic Watercolor Accents**: Watercolor brush assets (`bw_watercolor_texture.webp`, `watercolor_stroke_*.webp`) are allowed exclusively as gradual animation coloring elements (revealed via circular focus, slide wipe, or fade wash as scroll progress advances).
-   **Allowed Backgrounds**: Only B&W topographic maps (`topo_map_*.webp`) and planning paper dot grids (`planning_paper_dot_grid.webp`) blended with `screen` / `color-dodge` / `overlay` (and inverted where necessary) to render as white linework on black.

### 2. Slightly Slanted Borders & Geometric Shapes

-   Containers, headers, step cards, title blocks, and callout badges must be enclosed in slightly slanted geometric shapes (-2.0° to +2.0° tilt) with asymmetric polygon borders or trapezoidal outlines. (Note: Paragraph text is explicitly exempt from slanting and must remain vertical).

### 3. Irregular & Independent Drop Shadows (Shadow Angle ≠ Box Angle)

-   **Irregularity**: Every section, card, title block, and text badge must cast a drop shadow at an irregular distance and angle (varying between bottom-right, bottom-left, top-right, and top-left across stages).
-   **Independent Shadow Tilt**: A drop shadow must NEVER have the same rotation angle as the box casting it.
    -   In DOM/CSS, drop shadows are constructed as separate `::before` or `::after` pseudo-elements (`background: var(--shadow-solid, #222222)`) with an independent rotation variable (`--shadow-tilt`) that differs from the box rotation (`--graphic-tilt` or `--step-tilt`).
    -   In Canvas and SVG, drop shadows are rendered as distinct underlying geometry rotated independently from the foreground box.

### 4. Vertical Standard Paragraph Text (No Separate Boxes or Animations)

-   **Standard Text Styling & Vertical Alignment**: Paragraph text (`.step-paragraph-item`, `.step-description`) must NEVER be broken into visually separate boxes, cards, or tabs. Whether a stage has a single paragraph or multiple paragraphs, all paragraph text must use standard text styling with clean vertical alignment (0° rotation, straight vertical layout).
-   **Zero Layout Animations**: Paragraph text must have 0 layout animations and 0 transforms (no translating on hover/active, no scaling, no rotating, and no drop shadows or background boxes).

### 5. Three-Tier Typography Hierarchy

1. **Display / Titles / Badges**: Bold mid-century industrial display fonts (`Impact`, `Arial Black`, `Futura`).
2. **Narrative Body Text / Paragraphs**: Clean, effortlessly readable standard sans-serif / system fonts (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) with comfortable line height (`1.65`) and normal weight (`400`) for all paragraph text (`.step-description`).
3. **Technical Specifications & Metadata**: Typewriter monospace fonts (`Courier New`, `Courier`, monospace) exclusively for engineering specifications (`.step-specs`), title blocks, leader callouts, diorama tab headers (`.paragraph-mech-tab`), and table of contents items.

-   All procedural line art features hand-drafted jitter and cross-hatching in white/cream/light gray tones.
