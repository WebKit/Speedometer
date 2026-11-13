# Speedometer 3.0: Terminal Emulator (Xterm.js)

## Description

This workload simulates an interactive developer terminal environment using [xterm.js](https://xtermjs.org/) and its official addons (`@xterm/addon-fit`, `@xterm/addon-web-links`, `@xterm/addon-canvas`, and `@xterm/addon-webgl`).

## Implementation Details

The application maintains four distinct terminal sessions organized into tabs (`Build Log`, `Links & Traces`, `Ncurses Monitor`, and `Git Status`). To ensure deterministic timing and repeatable results during benchmark runs, the workload incorporates universal asynchronous overrides (`async-overrides.js`) that intercept and synchronize `setTimeout`, `requestAnimationFrame`, `createImageBitmap`, and DOM observers (`ResizeObserver`, `IntersectionObserver`, `MutationObserver`).

### Benchmark Steps

1. **Init Terminals**: Instantiates all four `Terminal` panes (`Build Log`, `Links & Traces`, `Ncurses Monitor`, and `Git Status`), attaches `FitAddon`, `WebLinksAddon`, `CanvasAddon` (or fallback renderer), custom IDE file/stack-trace `LinkProvider`s, and `OSC 133`/`633` shell integration handlers, fits each viewport to `96 × 30`, populates initial shell startup state and decorations across all four panes, and warms up the glyph texture atlas.
2. **Dump & Scroll Output**: Streams a single-pass C++/CMake/Ninja compilation and `ctest` verification log with OSC 133/633 shell integration markers, OSC 8 diagnostic hyperlinks, and live progress updates, then runs IDE problem-matcher marker/decoration registration (`OverviewRuler`), unwrapped logical-line regex search (`@xterm/addon-search` pattern), marker-driven scroll navigation, and dual ANSI + HTML scrollback serialization (`@xterm/addon-serialize` pattern).
3. **Parse & Hover Inline Links**: Streams a single-pass test runner and stack trace log saturated with URLs, OSC 8 hyperlinks, workspace file spans, and stack frames, dispatches mouse hover events across multiple viewport scroll regions, and resolves inline links across all 4 registered link providers (`OscLinkProvider`, `@xterm/addon-web-links`, workspace file path detector, and stack-trace/issue symbol provider).
4. **Ncurses Color UI**: Sequentially renders 80 interactive full-screen `htop`/`btop` system monitor frames in the alternate screen buffer (`\x1b[?1049h`) using DECSTBM scroll regions, hardware line insert/delete operations, modal overlays, simulated user input, and a 2D `IBufferCell` differential compositor pass with periodic state snapshots.
5. **Switch Tabs & Resize**: Resizes the terminal container across multiple widths (`92%`, `96%`, `100%`) while cycling across all four terminal tabs (`Build Log`, `Links & Traces`, `Ncurses Monitor`, and `Git Status`), triggering `FitAddon.fit()` column reflows (`BufferReflow`) and viewport updates.

## Build Steps

The workload uses Vite to bundle dependencies into the `dist/` folder:

```bash
npm install
npm run build-dev
```

## Local Preview

To run the application in development mode with live reloading:

```bash
npm run dev
```

## Bundled Font & License

To ensure identical glyph metrics and terminal grid dimensions across all browsers and operating systems without external network requests, this workload bundles unmodified copies of **DejaVu Sans Mono** v2.37 (`fonts/DejaVuSansMono-Regular.woff2` and `fonts/DejaVuSansMono-Bold.woff2`):

-   **Copyright**: Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public domain.
-   **License**: Bitstream Vera Fonts License and Public Domain (`https://dejavu-fonts.github.io/License.html`). See `fonts/LICENSE` and `dist/assets/DejaVuSansMono-LICENSE.txt`.
