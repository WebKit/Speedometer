// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).
import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { CanvasAddon } from "@xterm/addon-canvas";
import { WebGLAddon } from "@xterm/addon-webgl";
import { generateBuildLogSession, generateLinksSession, generateNcursesSession } from "./sessions.js";

// Terminal instances and addons storage
const TERMINAL_FONT_FAMILY = '"DejaVu Sans Mono", monospace';
const FIXED_CHAR_WIDTH = 8;
const FIXED_CHAR_HEIGHT = 15;
const FIXED_CELL_WIDTH = 8;
const FIXED_CELL_HEIGHT = 18;
const FIXED_SCROLLBAR_WIDTH = 10;

const terminals = {};
const fitAddons = {};
let activeTabId = "build";
let isInitialized = false;
let tabSwitchCounter = 0;
let fontsReadyPromise = null;

function ensureFontsLoaded() {
    if (!fontsReadyPromise) {
        if (document.fonts && typeof document.fonts.load === "function") {
            fontsReadyPromise = Promise.all([
                document.fonts.load('400 13px "DejaVu Sans Mono"'),
                document.fonts.load('700 13px "DejaVu Sans Mono"'),
            ]);
        } else {
            fontsReadyPromise = Promise.resolve();
        }
    }
    return fontsReadyPromise;
}

const initialFontLoad = ensureFontsLoaded();

// Pre-generate session data for deterministic benchmarking
const buildLogChunks = generateBuildLogSession();
const linksChunks = generateLinksSession();
const ncursesFrames = generateNcursesSession();

// Determine renderer backend from URL query param (default: canvas, fallback: dom)
const params = new URLSearchParams(window.location.search);
const rendererType = (params.get("renderer") || "canvas").toLowerCase();

function normalizeCharSizeService(cs) {
    if (!cs || cs._isNormalized)
        return;
    cs._isNormalized = true;
    if (cs._measureStrategy && typeof cs._measureStrategy.measure === "function") {
        const origStrategyMeasure = cs._measureStrategy.measure.bind(cs._measureStrategy);
        cs._measureStrategy.measure = () => {
            const res = origStrategyMeasure();
            if (res && typeof res === "object") {
                res.width = FIXED_CHAR_WIDTH;
                res.height = FIXED_CHAR_HEIGHT;
                return res;
            }
            return { width: FIXED_CHAR_WIDTH, height: FIXED_CHAR_HEIGHT };
        };
    }
    if (typeof cs.measure === "function") {
        const origMeasure = cs.measure.bind(cs);
        cs.measure = () => {
            origMeasure();
            cs.width = FIXED_CHAR_WIDTH;
            cs.height = FIXED_CHAR_HEIGHT;
        };
    }
    cs.width = FIXED_CHAR_WIDTH;
    cs.height = FIXED_CHAR_HEIGHT;
}

function neutralizeBitmapGenerator(bg) {
    if (!bg)
        return;
    const proto = Object.getPrototypeOf(bg);
    if (proto && proto !== Object.prototype && !proto._isNeutralized) {
        proto._isNeutralized = true;
        proto.refresh = () => {};
        proto._generate = () => {};
    }
    bg.refresh = () => {};
    bg._generate = () => {};
    bg._bitmap = null;
    if (bg._commitTimeout !== undefined) {
        window.clearTimeout(bg._commitTimeout);
        bg._commitTimeout = undefined;
    }
}

/**
 * Initialize all 4 terminal panes and attach addons
 */
export function initTerminals() {
    if (isInitialized)
        return;

    tabSwitchCounter = 0;

    const tabs = ["build", "links", "ncurses", "git"];
    tabs.forEach((tabId) => initTerminalForTab(tabId));

    // Populate Git tab with static sample output
    if (terminals.git) {
        writeSync(terminals.git, "\x1b[33mOn branch main\x1b[0m\r\n");
        writeSync(terminals.git, "Your branch is up to date with 'origin/main'.\r\n\r\n");
        writeSync(terminals.git, "Changes not staged for commit:\r\n");
        writeSync(terminals.git, '  (use "git add <file>..." to update what will be committed)\r\n');
        writeSync(terminals.git, '  (use "git restore <file>..." to discard changes in working directory)\r\n');
        writeSync(terminals.git, "\t\x1b[31mmodified:   src/app.js\x1b[0m\r\n");
        writeSync(terminals.git, "\t\x1b[31mmodified:   style.css\x1b[0m\r\n\r\n");
        writeSync(terminals.git, "Untracked files:\r\n");
        writeSync(terminals.git, '  (use "git add <file>..." to include in what will be committed)\r\n');
        writeSync(terminals.git, "\t\x1b[31msessions.js\x1b[0m\r\n\r\n");
        writeSync(terminals.git, 'no changes added to commit (use "git add" and/or "git commit -a")\r\n');
    }

    // Display initial content in all terminals so font loading, glyph texture atlas
    // generation, and canvas renderer warmup are covered in the setup phase.
    if (terminals.build && buildLogChunks.length > 0) {
        for (let i = 10; i < buildLogChunks.length; i++)
            writeSync(terminals.build, buildLogChunks[i]);
        writeSync(terminals.build, "\x1b[2m[Tab switched to build links at 0123456789]\x1b[0m\r\n");
        warmUpTerminalAtlas(terminals.build);
        writeSync(terminals.build, "\x1b[2J\x1b[3J\x1b[H");
        writeSync(terminals.build, "\x1b[36m⚡ Speedometer Terminal Emulator Suite - Initializing Build Environment...\x1b[0m\r\n\r\n");
        for (let i = 0; i < Math.min(10, buildLogChunks.length); i++)
            writeSync(terminals.build, buildLogChunks[i]);
    }
    if (terminals.links && linksChunks.length > 0) {
        for (let i = 10; i < linksChunks.length; i++)
            writeSync(terminals.links, linksChunks[i]);
        warmUpTerminalAtlas(terminals.links);
        writeSync(terminals.links, "\x1b[2J\x1b[3J\x1b[H");
        writeSync(terminals.links, "\x1b[36m🔗 Speedometer Web Links & Traces - Initializing Link Environment...\x1b[0m\r\n\r\n");
        for (let i = 0; i < Math.min(10, linksChunks.length); i++)
            writeSync(terminals.links, linksChunks[i]);
    }
    if (terminals.ncurses && ncursesFrames.length > 0) {
        for (let i = 0; i < ncursesFrames.length; i++) {
            writeSync(terminals.ncurses, ncursesFrames[i]);
            warmUpTerminalAtlas(terminals.ncurses);
        }
        writeSync(terminals.ncurses, ncursesFrames[0]);
    }

    // Pre-warm glyph texture atlas across all populated buffer lines before drawing
    // to terminal screen canvases, avoiding interleaved putImageData/drawImage flushes.
    Object.values(terminals).forEach((term) => warmUpTerminalAtlas(term));

    // Synchronously unpause and flush all terminals during setup so texture atlases
    // and renderer backends are 100% warmed up before benchmark step measurement begins.
    Object.values(terminals).forEach((term) => {
        if (term._core && term._core._renderService) {
            const rs = term._core._renderService;
            if (rs._isPaused) {
                rs._isPaused = false;
                if (rs._charSizeService && !rs._charSizeService.hasValidSize)
                    rs._charSizeService.measure();

                if (rs._needsFullRefresh) {
                    if (rs._pausedResizeTask && typeof rs._pausedResizeTask.flush === "function")
                        rs._pausedResizeTask.flush();

                    rs.refreshRows(0, rs._rowCount - 1);
                    rs._needsFullRefresh = false;
                }
            }
        }
        flushSync(term);
    });

    isInitialized = true;
    switchTab("build");
    Object.values(terminals).forEach((t) => flushSync(t));
    if (window.__activeTimers) {
        for (const id of Array.from(window.__activeTimers))
            window.clearTimeout(id);
        window.__activeTimers.clear();
    }
}

function initTerminalForTab(tabId) {
    const container = document.getElementById(`pane-${tabId}`);
    if (!container)
        return;

    const term = new Terminal({
        theme: {
            background: "#1e1e1e",
            foreground: "#d4d4d4",
            cursor: "#007acc",
            selectionBackground: "#264f78",
            black: "#000000",
            red: "#cd3131",
            green: "#0dbc79",
            yellow: "#e5e510",
            blue: "#2472c8",
            magenta: "#bc3fbc",
            cyan: "#11a8cd",
            white: "#e5e5e5",
            brightBlack: "#666666",
            brightRed: "#f14c4c",
            brightGreen: "#23d18b",
            brightYellow: "#f5f543",
            brightBlue: "#3b8eea",
            brightMagenta: "#d670d6",
            brightCyan: "#29b8db",
            brightWhite: "#e5e5e5",
        },
        fontFamily: TERMINAL_FONT_FAMILY,
        fontSize: 13,
        lineHeight: 1.2,
        scrollback: 5000,
        cursorBlink: false, // Turn off blinking for deterministic rendering
        allowTransparency: false,
        overviewRuler: { width: FIXED_SCROLLBAR_WIDTH },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Load performance rendering backend
    if (rendererType === "webgl") {
        try {
            const webglAddon = new WebGLAddon();
            term.loadAddon(webglAddon);
        } catch (e) {
            console.warn("WebGL renderer failed to initialize, falling back to Canvas/DOM:", e);
            tryLoadCanvas(term);
        }
    } else if (rendererType === "canvas") {
        tryLoadCanvas(term);
    }

    if (term._core && typeof term._core.onWillOpen === "function") {
        term._core.onWillOpen(() => {
            normalizeCharSizeService(term._core._charSizeService);
        });
    }

    term.open(container);

    const core = term._core;
    if (core && core._charSizeService) {
        normalizeCharSizeService(core._charSizeService);
        core._charSizeService.measure();
    }

    if (core && core.viewport) {
        const vp = core.viewport;
        vp.scrollBarWidth = FIXED_SCROLLBAR_WIDTH;
        if (typeof vp.reset === "function") {
            vp.reset = () => {
                vp.scrollBarWidth = FIXED_SCROLLBAR_WIDTH;
                vp._currentRowHeight = 0;
                vp._currentDeviceCellHeight = 0;
                vp._lastRecordedBufferLength = 0;
                vp._lastRecordedViewportHeight = 0;
                vp._lastRecordedBufferHeight = 0;
                vp._lastTouchY = 0;
                vp._lastScrollTop = 0;
                vp.syncScrollArea();
            };
        }
        if (typeof vp._refresh === "function") {
            vp._refresh = (immediate) => {
                vp.scrollBarWidth = FIXED_SCROLLBAR_WIDTH;
                if (immediate) {
                    if (vp._refreshAnimationFrame !== null && vp._refreshAnimationFrame !== undefined) {
                        window.cancelAnimationFrame(vp._refreshAnimationFrame);
                        vp._refreshAnimationFrame = null;
                    }
                    vp._innerRefresh();
                    return;
                }
                if (vp._refreshAnimationFrame === null || vp._refreshAnimationFrame === undefined)
                    vp._refreshAnimationFrame = window.requestAnimationFrame(() => vp._innerRefresh());
            };
        }
    }

    const renderer = core?._renderService?._renderer?.value;
    if (renderer) {
        // Dispose DevicePixelObserver so Chrome and Firefox match Safari (0 active ResizeObservers)
        renderer._devicePixelObserver?.dispose?.();
        renderer._observerDisposable?.dispose?.();

        if (typeof renderer._updateDimensions === "function") {
            const origUpdateDimensions = renderer._updateDimensions.bind(renderer);
            renderer._updateDimensions = () => {
                origUpdateDimensions();
                const dpr = renderer._coreBrowserService?.dpr ?? window.devicePixelRatio ?? 1;
                const cols = renderer._bufferService?.cols ?? term.cols ?? 80;
                const rows = renderer._bufferService?.rows ?? term.rows ?? 24;

                renderer.dimensions.css.cell.width = FIXED_CELL_WIDTH;
                renderer.dimensions.css.cell.height = FIXED_CELL_HEIGHT;
                renderer.dimensions.css.canvas.width = FIXED_CELL_WIDTH * cols;
                renderer.dimensions.css.canvas.height = FIXED_CELL_HEIGHT * rows;
                renderer.dimensions.device.char.width = Math.round(FIXED_CHAR_WIDTH * dpr);
                renderer.dimensions.device.char.height = Math.round(FIXED_CHAR_HEIGHT * dpr);
                renderer.dimensions.device.cell.width = Math.round(FIXED_CELL_WIDTH * dpr);
                renderer.dimensions.device.cell.height = Math.round(FIXED_CELL_HEIGHT * dpr);
                renderer.dimensions.device.canvas.width = renderer.dimensions.device.cell.width * cols;
                renderer.dimensions.device.canvas.height = renderer.dimensions.device.cell.height * rows;

                if (Array.isArray(renderer._rowElements)) {
                    for (const el of renderer._rowElements) {
                        el.style.width = `${renderer.dimensions.css.canvas.width}px`;
                        el.style.height = `${renderer.dimensions.css.cell.height}px`;
                        el.style.lineHeight = `${renderer.dimensions.css.cell.height}px`;
                    }
                    if (renderer._screenElement) {
                        renderer._screenElement.style.width = `${renderer.dimensions.css.canvas.width}px`;
                        renderer._screenElement.style.height = `${renderer.dimensions.css.canvas.height}px`;
                    }
                }
            };
        }

        if (typeof renderer._refreshRowElements === "function") {
            const pinDomWidthCache = () => {
                if (!renderer._widthCache)
                    return;
                if (renderer._widthCache._flat && typeof renderer._widthCache._flat.fill === "function")
                    renderer._widthCache._flat.fill(FIXED_CELL_WIDTH);
                else
                    renderer._widthCache._flat = FIXED_CELL_WIDTH;
                renderer._widthCache.get = () => FIXED_CELL_WIDTH;
                renderer._widthCache.clear = () => {
                    if (renderer._widthCache._flat && typeof renderer._widthCache._flat.fill === "function")
                        renderer._widthCache._flat.fill(FIXED_CELL_WIDTH);
                    renderer._widthCache._holey?.clear?.();
                };
            };
            if (typeof renderer._setDefaultSpacing === "function") {
                const origSetDefaultSpacing = renderer._setDefaultSpacing.bind(renderer);
                renderer._setDefaultSpacing = () => {
                    origSetDefaultSpacing();
                    pinDomWidthCache();
                };
                renderer._setDefaultSpacing();
            } else {
                pinDomWidthCache();
            }
            renderer.handleResize = (cols, rows) => {
                renderer._refreshRowElements(cols, rows);
                renderer._updateDimensions();
                term._core?._renderService?.refreshRows(0, rows - 1);
            };
            renderer.handleBlur = () => {
                renderer._rowContainer?.classList.remove("xterm-focus");
                term._core?._renderService?.refreshRows(0, term.rows - 1);
            };
            renderer.handleFocus = () => {
                renderer._rowContainer?.classList.add("xterm-focus");
                const y = term._core?._bufferService?.buffer?.y ?? 0;
                term._core?._renderService?.refreshRows(y, y);
            };
        }

        if (typeof renderer._setCanvasDevicePixelDimensions === "function") {
            const origSetDims = renderer._setCanvasDevicePixelDimensions.bind(renderer);
            renderer._setCanvasDevicePixelDimensions = (width, height) => {
                if (renderer.dimensions?.device?.canvas?.width === width && renderer.dimensions?.device?.canvas?.height === height)
                    return;
                origSetDims(width, height);
            };
        }

        if (Array.isArray(renderer._renderLayers)) {
            for (const layer of renderer._renderLayers) {
                if (!layer)
                    continue;
                if (typeof layer._clearCursor === "function" && typeof layer._clearCells === "function") {
                    layer._clearCursor = function () {
                        if (this._state) {
                            this._clearCells(this._state.x, this._state.y, this._state.width, this._state.height || 1);
                            this._state = { x: 0, y: 0, isFocused: false, style: "", width: 0 };
                        }
                    };
                }
                if (typeof layer._refreshCharAtlas === "function") {
                    const syncSharedBitmapGenerators = () => {
                        if (!layer._charAtlas || !Array.isArray(layer._bitmapGenerator))
                            return;
                        for (let i = 0; i < layer._bitmapGenerator.length; i++)
                            neutralizeBitmapGenerator(layer._bitmapGenerator[i]);
                        if (!layer._charAtlas._sharedBitmapGenerators) {
                            layer._charAtlas._sharedBitmapGenerators = layer._bitmapGenerator.slice();
                        } else {
                            for (let i = 0; i < layer._charAtlas.pages.length; i++) {
                                const shared = layer._charAtlas._sharedBitmapGenerators[i];
                                if (shared && shared.canvas === layer._charAtlas.pages[i].canvas) {
                                    neutralizeBitmapGenerator(shared);
                                    layer._bitmapGenerator[i] = shared;
                                } else {
                                    neutralizeBitmapGenerator(layer._bitmapGenerator[i]);
                                    layer._charAtlas._sharedBitmapGenerators[i] = layer._bitmapGenerator[i];
                                }
                            }
                            layer._bitmapGenerator = layer._charAtlas._sharedBitmapGenerators.slice();
                        }
                    };
                    syncSharedBitmapGenerators();
                    const origRefreshAtlas = layer._refreshCharAtlas.bind(layer);
                    layer._refreshCharAtlas = (colors) => {
                        const savedGenerators = layer._charAtlas?._sharedBitmapGenerators
                            ? layer._charAtlas._sharedBitmapGenerators.slice()
                            : null;
                        origRefreshAtlas(colors);
                        if (savedGenerators && layer._charAtlas)
                            layer._charAtlas._sharedBitmapGenerators = savedGenerators;
                        syncSharedBitmapGenerators();
                    };
                }
            }
        }

        if (typeof renderer._updateDimensions === "function")
            renderer._updateDimensions();
    }

    fitAddon.fit();

    if (core && typeof core.scrollLines === "function") {
        const origScrollLines = core.scrollLines.bind(core);
        core.scrollLines = (disp, suppressScrollEvent, source) => {
            if (disp === 0 && suppressScrollEvent && source === 1)
                return;
            origScrollLines(disp, suppressScrollEvent, source);
        };
    }
    if (core && core._bufferService && typeof core._bufferService.resize === "function") {
        const bs = core._bufferService;
        const origBsResize = bs.resize.bind(bs);
        bs.resize = (cols, rows) => {
            if (bs._reflowOnly) {
                bs.cols = cols;
                bs.rows = rows;
                bs.buffers.resize(cols, rows);
                return;
            }
            origBsResize(cols, rows);
        };
    }

    terminals[tabId] = term;
    fitAddons[tabId] = fitAddon;
}

function tryLoadCanvas(term) {
    try {
        const canvasAddon = new CanvasAddon();
        term.loadAddon(canvasAddon);
    } catch (e) {
        console.warn("Canvas renderer failed to initialize, using default DOM renderer:", e);
    }
}

function warmUpTerminalAtlas(term) {
    const renderer = term?._core?._renderService?._renderer?.value;
    const textLayer = renderer?._renderLayers?.[0];
    const atlas = textLayer?._charAtlas;
    const bufferService = term?._core?._bufferService;
    if (!textLayer || !atlas || !bufferService || !textLayer._workCell || !textLayer._cellColorResolver)
        return;

    // Warm up ASCII 33..125 synchronously so IdleTaskQueue._doWarmUp is a no-op
    for (let code = 33; code < 126; code++)
        atlas.getRasterizedGlyph(code, 0, 0, 0, true);

    const buffer = bufferService.buffer;
    const lines = buffer.lines;
    const cols = bufferService.cols;
    const maxLine = Math.min(lines.length, buffer.ybase + bufferService.rows);
    const cell = textLayer._workCell;

    for (let y = 0; y < maxLine; y++) {
        const line = lines.get(y);
        if (!line)
            continue;
        for (let x = 0; x < cols; x++) {
            line.loadCell(x, cell);
            if (cell.getWidth() === 0)
                continue;
            const chars = cell.getChars();
            textLayer._cellColorResolver.resolve(cell, x, y, textLayer._deviceCellWidth);
            const res = textLayer._cellColorResolver.result;
            if (chars && chars.length > 1)
                atlas.getRasterizedGlyphCombinedChar(chars, res.bg, res.fg, res.ext, true);
            else
                atlas.getRasterizedGlyph(cell.getCode() || 32, res.bg, res.fg, res.ext, true);
        }
    }
}

/**
 * Synchronously flush any pending debounced render passes or animation frames on
 * the terminal's render debouncer, viewport scrollbar, and selection overlays,
 * forcing dirty rows and DOM elements to update immediately.
 */
export function flushSync(term) {
    if (!term || !term._core)
        return;

    // 0. Flush any pending buffer memory cleanup idle tasks synchronously
    const buffers = term._core._bufferService?.buffers;
    if (buffers) {
        buffers.normal?._memoryCleanupQueue?.flush();
        buffers.alt?._memoryCleanupQueue?.flush();
    }

    // 1. Flush terminal grid renderer (RenderService / RenderDebouncer) only when dirty
    let didGridRefresh = false;
    if (term._core._renderService) {
        const debouncer = term._core._renderService._renderDebouncer;
        if (debouncer && typeof debouncer._innerRefresh === "function") {
            const hasPending = debouncer._rowStart !== undefined || debouncer._animationFrame !== undefined;
            if (debouncer._animationFrame !== undefined) {
                window.cancelAnimationFrame(debouncer._animationFrame);
                debouncer._animationFrame = undefined;
            }
            if (hasPending) {
                debouncer._innerRefresh();
                didGridRefresh = true;
            }
        }

        // Clear any pending texture atlas warmup queue or bitmap generator timers.
        const layers = term._core._renderService._renderer?.value?._renderLayers;
        if (Array.isArray(layers)) {
            for (const layer of layers) {
                if (layer?._charAtlas?._warmUpQueue)
                    layer._charAtlas._warmUpQueue.clear();
                if (Array.isArray(layer?._bitmapGenerator)) {
                    for (let i = 0; i < layer._bitmapGenerator.length; i++)
                        neutralizeBitmapGenerator(layer._bitmapGenerator[i]);
                }
            }
        }
    }

    // 2. Flush viewport scrollbar synchronization (Viewport) only when a refresh is pending
    if (term._core.viewport) {
        const vp = term._core.viewport;
        vp.scrollBarWidth = FIXED_SCROLLBAR_WIDTH;
        if (vp._refreshAnimationFrame !== null && vp._refreshAnimationFrame !== undefined) {
            window.cancelAnimationFrame(vp._refreshAnimationFrame);
            vp._refreshAnimationFrame = null;
            if (typeof vp._innerRefresh === "function")
                vp._innerRefresh();
            vp._lastScrollTop = vp._viewportElement.scrollTop;
        }
    }

    // 3. Flush selection overlays (SelectionService) only when a refresh is pending
    if (term._core._selectionService) {
        const sel = term._core._selectionService;
        if (sel._refreshAnimationFrame !== undefined && sel._refreshAnimationFrame !== null) {
            window.cancelAnimationFrame(sel._refreshAnimationFrame);
            sel._refreshAnimationFrame = undefined;
            if (typeof sel._refresh === "function" && (!didGridRefresh || term.hasSelection()))
                sel._refresh();
        }
    }

    // 4. Cancel any pending overview ruler animation frames so they do not leak timers
    if (term._core._overviewRulerRenderer) {
        const ruler = term._core._overviewRulerRenderer;
        if (ruler._refreshAnimationFrame !== undefined && ruler._refreshAnimationFrame !== null) {
            window.cancelAnimationFrame(ruler._refreshAnimationFrame);
            ruler._refreshAnimationFrame = undefined;
        }
        if (ruler._animationFrame !== undefined && ruler._animationFrame !== null) {
            window.cancelAnimationFrame(ruler._animationFrame);
            ruler._animationFrame = undefined;
        }
    }
}

/**
 * Synchronously write data to the terminal buffer without macro-task timer delays
 * or 12ms chunking, updating grid cells without triggering intermediate canvas redraws.
 */
export function writeSync(term, data) {
    if (!term)
        return;
    if (term._core && term._core._writeBuffer && typeof term._core._writeBuffer.writeSync === "function")
        term._core._writeBuffer.writeSync(data);
    else
        term.write(data);
}

/**
 * Synchronously write data to the terminal buffer and immediately flush all renderers.
 */
export function writeAndFlushSync(term, data) {
    writeSync(term, data);
    flushSync(term);
}

/**
 * Switch active tab and resize terminal viewport
 */
export function switchTab(tabId, shouldFlush = true) {
    if (!terminals[tabId])
        return;

    const prevTabId = activeTabId;
    activeTabId = tabId;

    // Update tab header UI
    document.querySelectorAll(".tab").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    // Update terminal pane visibility
    document.querySelectorAll(".terminal-pane").forEach((pane) => {
        pane.classList.toggle("active", pane.id === `pane-${tabId}`);
    });

    // Pause deactivated terminal before focusing the new terminal so blur events
    // on the hidden tab do not schedule background animation frame timers.
    if (prevTabId && prevTabId !== tabId && terminals[prevTabId]?._core) {
        const prevCore = terminals[prevTabId]._core;
        if (prevCore._renderService) {
            prevCore._renderService._isPaused = true;
            const prevDebouncer = prevCore._renderService._renderDebouncer;
            if (prevDebouncer) {
                if (prevDebouncer._animationFrame !== undefined) {
                    window.cancelAnimationFrame(prevDebouncer._animationFrame);
                    prevDebouncer._animationFrame = undefined;
                }
                prevDebouncer._rowStart = undefined;
                prevDebouncer._rowEnd = undefined;
            }
        }
        if (prevCore.viewport && prevCore.viewport._refreshAnimationFrame) {
            window.cancelAnimationFrame(prevCore.viewport._refreshAnimationFrame);
            prevCore.viewport._refreshAnimationFrame = null;
        }
        if (prevCore._selectionService && prevCore._selectionService._refreshAnimationFrame) {
            window.cancelAnimationFrame(prevCore._selectionService._refreshAnimationFrame);
            prevCore._selectionService._refreshAnimationFrame = undefined;
        }
        prevCore._bufferService?.buffers?.normal?._memoryCleanupQueue?.flush();
    }

    const term = terminals[tabId];
    const rs = term._core?._renderService;
    if (rs && rs._charSizeService && !rs._charSizeService.hasValidSize)
        rs._charSizeService.measure();

    // Reflow and fit terminal to container, then focus before unpausing so fit() and
    // focus() coalesce into the single end-of-step flushSync(term).
    fitAddons[tabId].fit();
    term.focus();

    if (rs && rs._isPaused) {
        rs._isPaused = false;
        if (rs._needsFullRefresh) {
            if (rs._pausedResizeTask && typeof rs._pausedResizeTask.flush === "function")
                rs._pausedResizeTask.flush();

            rs.refreshRows(0, rs._rowCount - 1);
            rs._needsFullRefresh = false;
        }
    }

    if (shouldFlush)
        flushSync(term);
}

async function finishStep() {
    // 1. Give xterm and addons initial microtask ticks to allow any pending
    // DOM observer callbacks or event listeners to push their rendering timers.
    for (let i = 0; i < 10; i++)
        await Promise.resolve();

    // 2. Loop until all scheduled xterm rendering passes, texture atlas warmups,
    // macro-task timers (setTimeout/rAF/rIC), DOM observers, and
    // asynchronous GPU texture bitmaps (createImageBitmap) have completely drained.
    let drainLimit = 300;
    while ((window.__activeTimers.size > 0 || window.__activeBitmaps.size > 0 || (window.__activeObservers && window.__activeObservers.size > 0)) && drainLimit-- > 0) {
        if (window.__activeBitmaps.size > 0)
            await Promise.all(Array.from(window.__activeBitmaps));

        Object.values(terminals).forEach((t) => flushSync(t));
        if (window.__activeTimers.size > 0 || (window.__activeObservers && window.__activeObservers.size > 0)) {
            // Yield to the browser's Macro-Task Queue so pending setTimeout(0),
            // requestAnimationFrame, and requestIdleCallback callbacks actually execute!
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    // 3. Final defensive settling phase: await additional microtask ticks to ensure
    // zero deferred rendering work spills over into subsequent steps or async measurement.
    for (let i = 0; i < 20; i++)
        await Promise.resolve();

    // 4. Synchronously flush all terminal renderers, viewports, and selection overlays
    // right before step completion so zero animation frames spill over into -async.
    Object.values(terminals).forEach((t) => flushSync(t));

    window.dispatchEvent(new CustomEvent("step-complete"));
}

/**
 * Benchmark Step 1: Dump & Scroll Output
 * Writes 2 passes of verbose build logs (~300 chunks), exercises ring buffer scrolling,
 * multi-line selection text extraction, and active buffer line translation, then flushes once.
 */
export async function dumpAndScroll() {
    if (!isInitialized) {
        await ensureFontsLoaded();
        initTerminals();
    }
    const term = terminals.build;
    if (!term) {
        await finishStep();
        return;
    }

    writeSync(term, "\x1b[2J\x1b[3J\x1b[H");
    term.clear();
    switchTab("build", false);
    writeSync(term, "\x1b[2J\x1b[3J\x1b[H");
    term.clear();

    // Write 2 passes of buildLogChunks (~300 writeSync calls) to exercise InputHandler.parse,
    // EscapeSequenceParser, UTF-32 decoding, and CircularList ring buffer management.
    for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < buildLogChunks.length; i++)
            writeSync(term, buildLogChunks[i]);
    }

    // Scroll through valid scrollback positions without mid-loop flushes
    term.scrollToTop();
    for (let i = 0; i < 15; i++)
        term.scrollLines(15);
    term.scrollToBottom();

    // Select a multi-line range and extract selection text across wrapped lines in pure JS
    term.selectLines(10, Math.min(90, term.buffer.active.length - 1));
    const selectedText = term.getSelection();
    term.selectLines(0, Math.max(0, term.buffer.active.length - 1));
    const fullSelectedText = term.getSelection();
    term.clearSelection();

    // Translate all active buffer lines to strings in pure JS
    const buf = term.buffer.active;
    let totalChars = selectedText.length + fullSelectedText.length;
    for (let y = 0; y < buf.length; y++) {
        const line = buf.getLine(y);
        if (line)
            totalChars += line.translateToString(true).length;
    }
    term._lastScannedChars = totalChars;

    flushSync(term);
    await finishStep();
}

/**
 * Benchmark Step 2: Inline Links & Hover
 * Writes 2 passes of URL/trace chunks, hovers across 25 distinct rows, and invokes
 * link providers across the full active buffer before flushing once.
 */
export async function hoverInlineLinks() {
    const term = terminals.links;
    if (!term) {
        await finishStep();
        return;
    }

    writeSync(term, "\x1b[2J\x1b[3J\x1b[H");
    term.clear();
    switchTab("links", false);
    writeSync(term, "\x1b[2J\x1b[3J\x1b[H");
    term.clear();

    // Write 2 passes of linksChunks (~160 writeSync calls)
    for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < linksChunks.length; i++)
            writeSync(term, linksChunks[i]);
    }

    // Simulate mouse moves across 25 distinct rows (1 hover per row so Linkifier does not
    // early-return on this._activeLine === position.y, with zero flushSync inside the loop)
    const screenElement = term.element ? term.element.querySelector(".xterm-screen") : null;
    if (screenElement) {
        const rect = screenElement.getBoundingClientRect();
        const rowHeight = rect.height / term.rows;
        const clientX = rect.left + rect.width / 3;

        for (let row = 0; row < 25; row++) {
            const clientY = rect.top + (row + 0.5) * rowHeight;
            const moveEvent = new MouseEvent("mousemove", {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX,
                clientY,
            });
            screenElement.dispatchEvent(moveEvent);
        }
    }

    // Invoke registered link providers across all populated lines in term.buffer.active
    // so LinkComputer.computeLink runs across the full link buffer in pure JS.
    const providers = term._core?._linkProviderService?.linkProviders;
    const buf = term.buffer.active;
    if (Array.isArray(providers) && buf) {
        let linkCount = 0;
        for (let y = 1; y <= buf.length; y++) {
            for (let p = 0; p < providers.length; p++) {
                providers[p].provideLinks(y, (links) => {
                    if (links)
                        linkCount += links.length;
                });
            }
        }
        term._lastLinkCount = linkCount;
    }

    flushSync(term);
    await finishStep();
}

/**
 * Benchmark Step 3: Ncurses Color UI
 * Writes 6 passes of 4 htop frames (24 frames) via writeSync, inspects active viewport cells
 * via IBufferLine/IBufferCell bitfield getters after each pass, and flushes once at the end.
 */
export async function ncursesColorUI() {
    switchTab("ncurses", false);
    const term = terminals.ncurses;
    if (!term) {
        await finishStep();
        return;
    }

    const buf = term.buffer.active;
    const cell = buf.getNullCell();
    let checksum = 0;

    for (let pass = 0; pass < 6; pass++) {
        for (let i = 0; i < ncursesFrames.length; i++)
            writeSync(term, ncursesFrames[i]);

        const baseY = buf.viewportY ?? buf.ydisp ?? 0;
        for (let y = 0; y < term.rows; y++) {
            const line = buf.getLine(baseY + y);
            if (!line)
                continue;
            for (let x = 0; x < term.cols; x++) {
                line.getCell(x, cell);
                checksum = ((checksum * 31) + cell.getCode() + (cell.getFgColor() & 0xffffff) + (cell.getBgColor() & 0xffffff)) | 0;
            }
        }
    }
    term._lastCellChecksum = checksum;

    flushSync(term);
    await finishStep();
}

/**
 * Benchmark Step 4: Switch Tabs & Resize
 * Exercises BufferReflow (_reflowSmaller and _reflowLarger) across a sequence of column widths
 * on populated scrollback buffers, then switches tabs and flushes once per visible tab switch.
 */
export async function switchTabsAndResize() {
    const buildTerm = terminals.build;
    const linksTerm = terminals.links;
    const container = document.getElementById("terminal-container");

    if (buildTerm && linksTerm) {
        const buildBs = buildTerm._core._bufferService;
        const linksBs = linksTerm._core._bufferService;
        const origBuildCols = buildBs.cols;
        const origLinksCols = linksBs.cols;
        const origRows = buildBs.rows;
        buildBs._reflowOnly = true;
        linksBs._reflowOnly = true;
        for (const cols of [80, 120, 72]) {
            buildBs.resize(cols, origRows);
            linksBs.resize(cols, origRows);
        }
        buildBs.resize(origBuildCols, origRows);
        linksBs.resize(origLinksCols, origRows);
        buildBs._reflowOnly = false;
        linksBs._reflowOnly = false;
    }

    container.style.width = "92%";
    switchTab("build", false);
    writeSync(buildTerm, `\x1b[2m[Tab switched to build at ${++tabSwitchCounter}]\x1b[0m\r\n`);

    container.style.width = "96%";
    switchTab("links", false);
    writeSync(linksTerm, `\x1b[2m[Tab switched to links at ${++tabSwitchCounter}]\x1b[0m\r\n`);
    flushSync(linksTerm);

    container.style.width = "100%";
    fitAddons.links?.fit();
    switchTab("build", false);
    flushSync(buildTerm);

    await finishStep();
}

/**
 * Benchmark Step 5: Layout Check
 */
export function layoutCheck() {
    const body = document.body.getBoundingClientRect();
    layoutCheck.e = document.elementFromPoint((body.width / 2) | 0, (body.height / 2) | 0);
}

// Event bindings for UI buttons and tab headers
window.addEventListener("DOMContentLoaded", async () => {
    document.querySelectorAll(".tab").forEach((btn) => {
        btn.addEventListener("click", () => {
            switchTab(btn.getAttribute("data-tab"));
        });
    });

    document.getElementById("btn-init").addEventListener("click", initTerminals);
    document.getElementById("btn-dump-scroll").addEventListener("click", dumpAndScroll);
    document.getElementById("btn-hover-links").addEventListener("click", hoverInlineLinks);
    document.getElementById("btn-ncurses").addEventListener("click", ncursesColorUI);
    document.getElementById("btn-switch-tabs").addEventListener("click", switchTabsAndResize);
    document.getElementById("btn-layout").addEventListener("click", layoutCheck);

    // Handle window resizing
    window.addEventListener("resize", () => {
        if (fitAddons[activeTabId])
            fitAddons[activeTabId].fit();
    });

    if (document.fonts && document.fonts.check('400 13px "DejaVu Sans Mono"') && document.fonts.check('700 13px "DejaVu Sans Mono"')) {
        initTerminals();
    } else {
        await initialFontLoad;
        initTerminals();
    }
});

// Expose benchmark steps globally for Speedometer suite runner and local experimentation
window.terminalBenchmark = {
    init: initTerminals,
    dumpAndScroll,
    hoverInlineLinks,
    ncursesColorUI,
    switchTabsAndResize,
    layout: layoutCheck,
    switchTab,
    terminals,
    fitAddons,
};
