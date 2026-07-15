# Speedometer 3.0: Terminal Emulator (Xterm.js)

## Description

This workload simulates an interactive developer terminal environment using [xterm.js](https://xtermjs.org/) and its official addons (`@xterm/addon-fit`, `@xterm/addon-web-links`, `@xterm/addon-canvas`, and `@xterm/addon-webgl`).


## Implementation Details

The application maintains four distinct terminal sessions organized into tabs (`Build Log`, `Links & Traces`, `Ncurses Monitor`, and `Git Status`). To ensure deterministic timing and repeatable results during benchmark runs, the workload incorporates universal asynchronous overrides (`async-overrides.js`) that intercept and synchronize `setTimeout`, `requestAnimationFrame`, `createImageBitmap`, and DOM observers (`ResizeObserver`, `IntersectionObserver`, `MutationObserver`).

### Benchmark Steps

1. **Dump & Scroll Output**: Dumps ~75 chunks (~750+ lines) of verbose C++ compilation logs into the viewport, exercises scrolling operations, and simulates user selection across blocks of output.
2. **Parse & Hover Inline Links**: Emits test logs saturated with URLs and file paths, then dispatches synthetic mouse hover events across grid cells to trigger regex link matching and decoration updates (`@xterm/addon-web-links`).
3. **Ncurses Color UI**: Sequentially renders 4 dynamic frames of an `htop`-style system process monitor using cursor positioning, RGB TrueColor escape sequences, and partial buffer refreshes.
4. **Switch Tabs & Resize**: Simulates switching active terminal tabs and resizing panel widths to trigger column reflow calculations (`@xterm/addon-fit`).

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
