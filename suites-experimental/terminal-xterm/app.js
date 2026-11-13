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
import { generateBuildLogSession, generateLinksSession, generateNcursesSession, generateGitSession } from "./sessions.js";

// Terminal instances and addons storage
const TERMINAL_FONT_FAMILY = '"DejaVu Sans Mono", monospace';
const FIXED_CHAR_WIDTH = 8;
const FIXED_CHAR_HEIGHT = 15;
const FIXED_CELL_WIDTH = 8;
const FIXED_CELL_HEIGHT = 18;
const FIXED_SCROLLBAR_WIDTH = 10;

const terminals = {};
const fitAddons = {};
const activeDecorations = {
    build: [],
    links: [],
    ncurses: [],
    git: [],
};
const shellIntegrationState = {
    build: { prompts: 0, commands: 0, completions: 0, cwd: "" },
    links: { prompts: 0, commands: 0, completions: 0, cwd: "" },
    ncurses: { prompts: 0, commands: 0, completions: 0, cwd: "" },
    git: { prompts: 0, commands: 0, completions: 0, cwd: "" },
};

let activeTabId = "build";
let isInitialized = false;
let tabSwitchCounter = 0;
let fontsReadyPromise = null;

function ensureFontsLoaded() {
    if (!fontsReadyPromise) {
        if (document.fonts && typeof document.fonts.load === "function")
            fontsReadyPromise = Promise.all([document.fonts.load('400 13px "DejaVu Sans Mono"'), document.fonts.load('700 13px "DejaVu Sans Mono"')]);
        else
            fontsReadyPromise = Promise.resolve();
    }
    return fontsReadyPromise;
}

const initialFontLoad = ensureFontsLoaded();

// Pre-generate session data for deterministic benchmarking
const buildLogChunks = generateBuildLogSession();
const linksChunks = generateLinksSession();
const ncursesFrames = generateNcursesSession();
const gitChunks = generateGitSession();

// Determine renderer backend from URL query param (default: canvas, fallback: dom)
const params = new URLSearchParams(window.location.search);
const rendererType = (params.get("renderer") || "canvas").toLowerCase();

// Regexes for custom IDE LinkProviders
const WORKSPACE_FILE_LINK_REGEX = /(?:file:\/\/\/[^\s:()[\]]+|(?:src|Source|resources|suites(?:-experimental)?)\/[A-Za-z0-9_./-]+)(?::(\d+)(?::(\d+))?|\((\d+),(\d+)\))/g;
const STACK_TRACE_ISSUE_LINK_REGEX = /(?:at\s+([A-Za-z0-9_.$<>]+)\s+\(([^():\s]+):(\d+):(\d+)\)|\b(TS\d{4})\b|#(\d{4,6})\b)/g;

// Regexes for @xterm/addon-search logical-line search engine
const BUILD_SEARCH_REGEXES = [
    /Source\/([A-Za-z0-9_]+)\/([A-Za-z0-9_.]+):(\d+):(\d+)\]\s+(warning|error)/g,
    /remark:\s+vectorized\s+(\d+)\s+instructions.*?\((-Rpass=[a-z-]+)\)/g,
    /Created\s+lib\/(lib[A-Za-z0-9_]+\.so)\s+\(([\d.]+)\s+MB/g,
    /Artifact validated\s+\(SHA-256:\s+([0-9a-f]+)\)/g,
];

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

function clearTabDecorations(tabId) {
    const list = activeDecorations[tabId];
    if (Array.isArray(list)) {
        for (let i = 0; i < list.length; i++) {
            list[i].decoration?.dispose?.();
            list[i].marker?.dispose?.();
        }
        list.length = 0;
    }
    const term = terminals[tabId];
    if (term?._core?._bufferService?.buffers?.normal?.clearAllMarkers)
        term._core._bufferService.buffers.normal.clearAllMarkers();
}

function createWorkspaceFileLinkProvider(term) {
    return {
        provideLinks(bufferLineNumber, callback) {
            const buf = term.buffer.active;
            const line = buf.getLine(bufferLineNumber - 1);
            if (!line) {
                callback(undefined);
                return;
            }
            let text = line.translateToString(true);
            if (!text || text.length < 5) {
                callback(undefined);
                return;
            }
            // Join wrapped continuation line if present (like VS Code TerminalLocalLinkDetector)
            const nextLine = buf.getLine(bufferLineNumber);
            if (nextLine && nextLine.isWrapped)
                text += nextLine.translateToString(true);

            const cols = term.cols || 80;
            WORKSPACE_FILE_LINK_REGEX.lastIndex = 0;
            let match;
            const links = [];
            while ((match = WORKSPACE_FILE_LINK_REGEX.exec(text)) !== null) {
                const matchText = match[0];
                const startOffset = match.index;
                const endOffset = match.index + matchText.length;
                const startRow = bufferLineNumber + Math.floor(startOffset / cols);
                const startCol = (startOffset % cols) + 1;
                const endRow = bufferLineNumber + Math.floor((endOffset - 1) / cols);
                const endCol = ((endOffset - 1) % cols) + 1;
                const targetLine = Number(match[1] || match[3] || 1);
                const targetCol = Number(match[2] || match[4] || 1);
                links.push({
                    range: {
                        start: { x: startCol, y: startRow },
                        end: { x: endCol, y: endRow },
                    },
                    text: matchText,
                    decorations: {
                        pointerCursor: true,
                        underline: true,
                    },
                    activate(_event, linkText) {
                        term._lastActivatedFileLink = { text: linkText, line: targetLine, col: targetCol };
                    },
                    hover(_event, linkText) {
                        term._lastHoveredFileLink = { text: linkText, line: targetLine, col: targetCol };
                    },
                    leave() {
                        term._lastHoveredFileLink = null;
                    },
                });
            }
            callback(links.length > 0 ? links : undefined);
        },
    };
}

function createStackTraceAndIssueLinkProvider(term) {
    return {
        provideLinks(bufferLineNumber, callback) {
            const buf = term.buffer.active;
            const line = buf.getLine(bufferLineNumber - 1);
            if (!line) {
                callback(undefined);
                return;
            }
            const text = line.translateToString(true);
            if (!text || text.length < 4) {
                callback(undefined);
                return;
            }
            STACK_TRACE_ISSUE_LINK_REGEX.lastIndex = 0;
            let match;
            const links = [];
            while ((match = STACK_TRACE_ISSUE_LINK_REGEX.exec(text)) !== null) {
                const matchText = match[0];
                const startCol = match.index + 1;
                const endCol = match.index + matchText.length;
                const symbol = match[1] || match[5] || `issue-${match[6]}`;
                links.push({
                    range: {
                        start: { x: startCol, y: bufferLineNumber },
                        end: { x: endCol, y: bufferLineNumber },
                    },
                    text: matchText,
                    decorations: {
                        pointerCursor: true,
                        underline: true,
                    },
                    activate(_event, linkText) {
                        term._lastActivatedSymbolLink = { symbol, text: linkText };
                    },
                    hover(_event, linkText) {
                        term._lastHoveredSymbolLink = { symbol, text: linkText };
                    },
                    leave() {
                        term._lastHoveredSymbolLink = null;
                    },
                });
            }
            callback(links.length > 0 ? links : undefined);
        },
    };
}

function initTerminalsCore() {
    const tabs = ["build", "links", "ncurses", "git"];
    if (isInitialized || Object.keys(terminals).length > 0) {
        for (const tabId of tabs) {
            clearTabDecorations(tabId);
            terminals[tabId]?.dispose?.();
            delete terminals[tabId];
            delete fitAddons[tabId];
            const pane = document.getElementById(`pane-${tabId}`);
            if (pane)
                pane.replaceChildren();
            shellIntegrationState[tabId] = { prompts: 0, commands: 0, completions: 0, cwd: "" };
        }
        const container = document.getElementById("terminal-container");
        if (container)
            container.style.width = "100%";
        activeTabId = "build";
        isInitialized = false;
    }

    tabSwitchCounter = 0;

    tabs.forEach((tabId) => initTerminalForTab(tabId));

    // 1. Populate Git tab with initial git status, graph log, and diff output + markers/decorations
    if (terminals.git && gitChunks.length > 0) {
        for (let i = 0; i < gitChunks.length; i++)
            writeSync(terminals.git, gitChunks[i]);

        const gitBuf = terminals.git.buffer.active;
        const gitCols = terminals.git.cols || 80;
        const gitCursorLine = gitBuf.baseY + gitBuf.cursorY;
        for (let y = 0; y < gitBuf.length; y++) {
            const line = gitBuf.getLine(y);
            if (!line)
                continue;
            const text = line.translateToString(true);
            const isHeader = text.startsWith("==>") || text.startsWith("diff --git") || text.startsWith("@@");
            const isAdd = !isHeader && text.startsWith("+") && !text.startsWith("+++");
            const isDel = !isHeader && !isAdd && text.startsWith("-") && !text.startsWith("---");
            if (isHeader || isAdd || isDel) {
                const marker = terminals.git.registerMarker(y - gitCursorLine);
                if (marker) {
                    const decoration = terminals.git.registerDecoration({
                        marker,
                        width: Math.min(12, gitCols),
                        overviewRulerOptions: {
                            color: isHeader ? "#3b8eea" : isAdd ? "#23d18b" : "#f14c4c",
                            position: isHeader ? "left" : isAdd ? "center" : "right",
                        },
                    });
                    activeDecorations.git.push({ marker, decoration });
                }
            }
        }
        warmUpTerminalAtlas(terminals.git);
    }

    // 2. Populate Build tab with initial build environment banner + shell startup + first 25 configure chunks
    if (terminals.build && buildLogChunks.length > 0) {
        writeSync(terminals.build, "\x1b[36m⚡ Speedometer Terminal Emulator Suite - Initializing Build Environment...\x1b[0m\r\n\r\n");
        const initialBuildCount = Math.min(25, buildLogChunks.length);
        for (let i = 0; i < initialBuildCount; i++)
            writeSync(terminals.build, buildLogChunks[i]);

        const buildBuf = terminals.build.buffer.active;
        const buildCols = terminals.build.cols || 80;
        const buildCursorLine = buildBuf.baseY + buildBuf.cursorY;
        for (let y = 0; y < buildBuf.length; y++) {
            const line = buildBuf.getLine(y);
            if (!line || line.isWrapped)
                continue;
            const text = line.translateToString(true);
            if (text.includes("==> Starting") || text.includes("warning:") || text.includes("[LINK]")) {
                const marker = terminals.build.registerMarker(y - buildCursorLine);
                if (marker) {
                    const decoration = terminals.build.registerDecoration({
                        marker,
                        width: Math.min(12, buildCols),
                        overviewRulerOptions: {
                            color: text.includes("warning:") ? "#e5e510" : "#11a8cd",
                            position: "left",
                        },
                    });
                    activeDecorations.build.push({ marker, decoration });
                }
            }
        }
        warmUpTerminalAtlas(terminals.build);
    }

    // 3. Populate Links tab with initial link/trace banner + first 20 chunks + initial link discovery
    if (terminals.links && linksChunks.length > 0) {
        writeSync(terminals.links, "\x1b[36m🔗 Speedometer Web Links & Traces - Initializing Link Environment...\x1b[0m\r\n\r\n");
        const initialLinksCount = Math.min(20, linksChunks.length);
        for (let i = 0; i < initialLinksCount; i++)
            writeSync(terminals.links, linksChunks[i]);

        const linkProviders = terminals.links._core?._linkProviderService?.linkProviders;
        const linksBuf = terminals.links.buffer.active;
        if (Array.isArray(linkProviders) && linksBuf) {
            const maxVisibleLine = Math.min(linksBuf.length, terminals.links.rows || 30);
            let initLinksFound = 0;
            for (let y = 1; y <= maxVisibleLine; y++) {
                for (let p = 0; p < linkProviders.length; p++) {
                    linkProviders[p].provideLinks(y, (links) => {
                        if (links)
                            initLinksFound += links.length;
                    });
                }
            }
            terminals.links._initLinksFound = initLinksFound;
        }
        warmUpTerminalAtlas(terminals.links);
    }

    // 4. Populate Ncurses tab with initial system monitor dashboard frame
    if (terminals.ncurses && ncursesFrames.length > 0) {
        writeSync(terminals.ncurses, ncursesFrames[0]);
        warmUpTerminalAtlas(terminals.ncurses);
    }

    // Activate build tab and synchronously unpause and flush each terminal once
    switchTab("build", false);
    for (const [tabId, term] of Object.entries(terminals)) {
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
        if (tabId !== "build" && term._core?._renderService)
            term._core._renderService._isPaused = true;
    }

    if (window.__activeTimers && window.__activeTimers.size > 0) {
        for (const timerId of Array.from(window.__activeTimers))
            window.clearTimeout(timerId);
    }

    isInitialized = true;
}

/**
 * Benchmark Step 1: Initialize all 4 terminal panes, attach addons, and populate initial shell state
 */
export async function initTerminals() {
    if (!(document.fonts && document.fonts.check('400 13px "DejaVu Sans Mono"') && document.fonts.check('700 13px "DejaVu Sans Mono"')))
        await initialFontLoad;

    initTerminalsCore();
    await finishStep();
}

function initTerminalForTab(tabId) {
    const container = document.getElementById(`pane-${tabId}`);
    if (!container)
        return;

    const term = new Terminal({
        allowProposedApi: true,
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
        overviewRulerWidth: FIXED_SCROLLBAR_WIDTH,
        linkHandler: {
            allowNonHttpProtocols: true,
            activate: (_event, text, range) => {
                term._lastActivatedOscLink = { text, range };
            },
            hover: (_event, text, range) => {
                term._lastHoveredOscLink = { text, range };
            },
            leave: () => {
                term._lastHoveredOscLink = null;
            },
        },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon((_event, uri) => {
        term._lastActivatedWebLink = uri;
    });

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.registerLinkProvider(createWorkspaceFileLinkProvider(term));
    term.registerLinkProvider(createStackTraceAndIssueLinkProvider(term));

    // Register IDE shell integration OSC 133 (FinalTerm) & OSC 633 (VS Code) handlers
    const shellState = shellIntegrationState[tabId];
    if (shellState && term.parser) {
        term.parser.registerOscHandler(133, (data) => {
            if (data.startsWith("A"))
                shellState.prompts++;
            else if (data.startsWith("B") || data.startsWith("C"))
                shellState.commands++;
            else if (data.startsWith("D"))
                shellState.completions++;
            return true;
        });
        term.parser.registerOscHandler(633, (data) => {
            if (data.startsWith("P;Cwd="))
                shellState.cwd = data.slice(6);
            return true;
        });
    }

    if (term._core && typeof term._core.onWillOpen === "function") {
        term._core.onWillOpen(() => {
            normalizeCharSizeService(term._core._charSizeService);
        });
    }

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

    term.open(container);

    const core = term._core;
    core?._renderService?._observerDisposable?.dispose?.();
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
                        const savedGenerators = layer._charAtlas?._sharedBitmapGenerators ? layer._charAtlas._sharedBitmapGenerators.slice() : null;
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
    if (!textLayer || !atlas)
        return;

    // Warm up ASCII 33..125 synchronously once per shared atlas so IdleTaskQueue._doWarmUp is a no-op
    if (!atlas._asciiWarmedUp) {
        atlas._asciiWarmedUp = true;
        for (let code = 33; code < 126; code++)
            atlas.getRasterizedGlyph(code, 0, 0, 0, true);
    }

    warmUpVisibleViewportAtlas(term);
}

function warmUpVisibleViewportAtlas(term) {
    const renderer = term?._core?._renderService?._renderer?.value;
    const textLayer = renderer?._renderLayers?.[0];
    const atlas = textLayer?._charAtlas;
    const bufferService = term?._core?._bufferService;
    const buffer = bufferService?.buffer;
    if (!textLayer || !atlas || !bufferService || !buffer || !textLayer._workCell || !textLayer._cellColorResolver)
        return;

    const cols = bufferService.cols;
    const rows = bufferService.rows;
    const cell = textLayer._workCell;
    const lines = buffer.lines;
    const startY = buffer.ydisp ?? buffer.ybase ?? 0;
    const endY = Math.min(lines.length, startY + rows);

    for (let y = startY; y < endY; y++) {
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
 * the terminal's render debouncer, viewport scrollbar, selection overlays, and
 * overview ruler canvas, forcing dirty rows and DOM elements to update immediately.
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

    // 4. Synchronously flush overview ruler canvas decorations if pending
    if (term._core._overviewRulerRenderer) {
        const ruler = term._core._overviewRulerRenderer;
        let hasRulerPending = false;
        if (ruler._refreshAnimationFrame !== undefined && ruler._refreshAnimationFrame !== null) {
            window.cancelAnimationFrame(ruler._refreshAnimationFrame);
            ruler._refreshAnimationFrame = undefined;
            hasRulerPending = true;
        }
        if (ruler._animationFrame !== undefined && ruler._animationFrame !== null) {
            window.cancelAnimationFrame(ruler._animationFrame);
            ruler._animationFrame = undefined;
            hasRulerPending = true;
        }
        if (hasRulerPending && typeof ruler._refreshDecorations === "function")
            ruler._refreshDecorations();
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
    for (let i = 0; i < 10; i++)
        await Promise.resolve();

    let drainLimit = 300;
    while ((window.__activeTimers.size > 0 || window.__activeBitmaps.size > 0 || (window.__activeObservers && window.__activeObservers.size > 0)) && drainLimit-- > 0) {
        if (window.__activeBitmaps.size > 0)
            await Promise.all(Array.from(window.__activeBitmaps));

        Object.values(terminals).forEach((t) => flushSync(t));
        if (window.__activeTimers.size > 0 || (window.__activeObservers && window.__activeObservers.size > 0))
            await new Promise((resolve) => setTimeout(resolve, 0));
    }

    for (let i = 0; i < 20; i++)
        await Promise.resolve();

    Object.values(terminals).forEach((t) => flushSync(t));

    window.dispatchEvent(new CustomEvent("step-complete"));
}

/**
 * Serialize a range of lines from an xterm IBuffer into an ANSI-styled string
 * AND an HTML styled snippet (@xterm/addon-serialize serialize() + serializeAsHTML()).
 */
function serializeBufferAsAnsiAndHtml(buf, startRow, endRow, cols) {
    const cell = buf.getNullCell();
    const ansiOut = [];
    const htmlOut = ['<pre class="xterm-serialize">'];
    let prevBold = 0;
    let prevDim = 0;
    let prevItalic = 0;
    let prevUnderline = 0;
    let prevInverse = 0;
    let prevFgMode = 0;
    let prevFgColor = -1;
    let prevBgMode = 0;
    let prevBgColor = -1;

    const maxRow = Math.min(buf.length, endRow);
    for (let y = startRow; y < maxRow; y++) {
        const line = buf.getLine(y);
        if (!line)
            continue;
        let ansiLine = "";
        let htmlLine = "<div>";
        let spanOpen = false;
        const lineLen = Math.min(cols, line.length);

        for (let x = 0; x < lineLen; x++) {
            line.getCell(x, cell);
            if (cell.getWidth() === 0)
                continue;

            const bold = cell.isBold();
            const dim = cell.isDim();
            const italic = cell.isItalic();
            const underline = cell.isUnderline();
            const inverse = cell.isInverse();
            const fgMode = cell.getFgColorMode();
            const fgColor = cell.getFgColor();
            const bgMode = cell.getBgColorMode();
            const bgColor = cell.getBgColor();

            if (bold !== prevBold || dim !== prevDim || italic !== prevItalic || underline !== prevUnderline || inverse !== prevInverse || fgMode !== prevFgMode || fgColor !== prevFgColor || bgMode !== prevBgMode || bgColor !== prevBgColor) {
                const sgr = [];
                const styles = [];
                if (cell.isAttributeDefault()) {
                    sgr.push(0);
                } else {
                    if (bold !== prevBold)
                        sgr.push(bold ? 1 : 22);
                    if (dim !== prevDim)
                        sgr.push(dim ? 2 : 22);
                    if (italic !== prevItalic)
                        sgr.push(italic ? 3 : 23);
                    if (underline !== prevUnderline)
                        sgr.push(underline ? 4 : 24);
                    if (inverse !== prevInverse)
                        sgr.push(inverse ? 7 : 27);
                    if (bold)
                        styles.push("font-weight:bold");
                    if (italic)
                        styles.push("font-style:italic");
                    if (underline)
                        styles.push("text-decoration:underline");

                    if (fgMode !== prevFgMode || fgColor !== prevFgColor) {
                        if (cell.isFgDefault()) {
                            sgr.push(39);
                        } else if (cell.isFgPalette()) {
                            sgr.push(38, 5, fgColor & 0xff);
                            styles.push(`color:var(--ansi-${fgColor & 0xff})`);
                        } else if (cell.isFgRGB()) {
                            const r = (fgColor >> 16) & 0xff;
                            const g = (fgColor >> 8) & 0xff;
                            const b = fgColor & 0xff;
                            sgr.push(38, 2, r, g, b);
                            styles.push(`color:rgb(${r},${g},${b})`);
                        }
                    }
                    if (bgMode !== prevBgMode || bgColor !== prevBgColor) {
                        if (cell.isBgDefault()) {
                            sgr.push(49);
                        } else if (cell.isBgPalette()) {
                            sgr.push(48, 5, bgColor & 0xff);
                            styles.push(`background:var(--ansi-${bgColor & 0xff})`);
                        } else if (cell.isBgRGB()) {
                            const r = (bgColor >> 16) & 0xff;
                            const g = (bgColor >> 8) & 0xff;
                            const b = bgColor & 0xff;
                            sgr.push(48, 2, r, g, b);
                            styles.push(`background:rgb(${r},${g},${b})`);
                        }
                    }
                }
                if (sgr.length > 0)
                    ansiLine += `\x1b[${sgr.join(";")}m`;
                if (spanOpen) {
                    htmlLine += "</span>";
                    spanOpen = false;
                }
                if (styles.length > 0) {
                    htmlLine += `<span style="${styles.join(";")}">`;
                    spanOpen = true;
                }

                prevBold = bold;
                prevDim = dim;
                prevItalic = italic;
                prevUnderline = underline;
                prevInverse = inverse;
                prevFgMode = fgMode;
                prevFgColor = fgColor;
                prevBgMode = bgMode;
                prevBgColor = bgColor;
            }

            const ch = cell.getChars() || " ";
            ansiLine += ch;
            htmlLine += ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch;
        }
        if (spanOpen)
            htmlLine += "</span>";
        htmlLine += "</div>";
        ansiOut.push(line.isWrapped ? ansiLine : `${ansiLine.trimEnd()}\r\n`);
        htmlOut.push(htmlLine);
    }
    htmlOut.push("</pre>");
    return {
        ansi: ansiOut.join(""),
        html: htmlOut.join(""),
    };
}

/**
 * Benchmark Step 1: Dump & Scroll Output
 * 1. Single-pass stream of a 360-step build & test pipeline with OSC 133/633 shell integration,
 *    OSC 8 compiler diagnostic links, \r\x1b[2K live progress bar updates, and 256/TrueColor spans.
 * 2. IDE Problem Matcher scan registering IMarkers and OverviewRuler IDecorations for warnings/errors.
 * 3. Unwrapped logical-line regex search engine (@xterm/addon-search pattern) with match highlighting.
 * 4. Marker-driven command/diagnostic scroll navigation.
 * 5. Dual ANSI + HTML scrollback serialization (@xterm/addon-serialize serialize() & serializeAsHTML()).
 */
export async function dumpAndScroll() {
    if (!isInitialized) {
        await ensureFontsLoaded();
        initTerminalsCore();
    }
    const term = terminals.build;
    if (!term) {
        await finishStep();
        return;
    }

    clearTabDecorations("build");
    writeSync(term, "\x1b[2J\x1b[3J\x1b[H");
    term.clear();
    switchTab("build", false);
    writeSync(term, "\x1b[2J\x1b[3J\x1b[H");
    term.clear();

    // 1. Write single-pass build pipeline session (zero loop repetition)
    for (let i = 0; i < buildLogChunks.length; i++)
        writeSync(term, buildLogChunks[i]);

    // 3. IDE Problem Matcher + Marker & Decoration Registration + Logical-Line Regex Search (@xterm/addon-search)
    const buf = term.buffer.active;
    const cols = term.cols || 80;
    const cursorLine = buf.baseY + buf.cursorY;
    const diagnostics = [];
    const regexMatches = [];

    for (let y = 0; y < buf.length; y++) {
        const line = buf.getLine(y);
        if (!line || line.isWrapped)
            continue;

        // Reconstruct unwrapped logical line across wrapped continuations
        let logicalText = line.translateToString(false);
        let wrappedCount = 0;
        while (y + wrappedCount + 1 < buf.length) {
            const next = buf.getLine(y + wrappedCount + 1);
            if (!next || !next.isWrapped)
                break;
            logicalText += next.translateToString(false);
            wrappedCount++;
        }
        const trimmed = logicalText.trimEnd();
        if (!trimmed)
            continue;

        const isError = trimmed.includes("error (ignored):");
        const isWarning = !isError && trimmed.includes("warning:");
        const isLinkStep = !isError && !isWarning && trimmed.includes("[LINK]");
        if ((isError || isWarning || isLinkStep) && activeDecorations.build.length < 110) {
            const offset = y - cursorLine;
            const marker = term.registerMarker(offset);
            if (marker) {
                const decoration = term.registerDecoration({
                    marker,
                    width: Math.min(14, cols),
                    overviewRulerOptions: {
                        color: isError ? "#f14c4c" : isWarning ? "#e5e510" : "#bc3fbc",
                        position: isError ? "right" : isWarning ? "center" : "left",
                    },
                });
                activeDecorations.build.push({ marker, decoration });
                diagnostics.push({ y, severity: isError ? 2 : isWarning ? 1 : 0 });
            }
        }

        // Run @xterm/addon-search regexes across the unwrapped logical line and map back to (row, col)
        for (let r = 0; r < BUILD_SEARCH_REGEXES.length; r++) {
            const rx = BUILD_SEARCH_REGEXES[r];
            rx.lastIndex = 0;
            let m;
            while ((m = rx.exec(trimmed)) !== null) {
                const matchRow = y + Math.floor(m.index / cols);
                const matchCol = m.index % cols;
                regexMatches.push({
                    row: matchRow,
                    col: matchCol,
                    length: m[0].length,
                    group: m[1] || "",
                });
            }
        }
    }

    // 4. Navigate through registered diagnostic markers and scrollback pages
    term.scrollToTop();
    for (let i = 0; i < activeDecorations.build.length; i += 3) {
        const targetLine = activeDecorations.build[i].marker.line;
        if (targetLine >= 0)
            term.scrollToLine(targetLine);
    }
    term.scrollPages(-2);
    term.scrollLines(15);
    term.scrollToBottom();

    // 5. Step through regex search matches via SelectionService and extract selections
    let selectedChars = 0;
    const maxSelections = Math.min(35, regexMatches.length);
    for (let i = 0; i < maxSelections; i++) {
        const m = regexMatches[i];
        term.select(m.col, m.row, m.length);
        selectedChars += term.getSelection().length;
    }
    term.selectLines(10, Math.min(160, buf.length - 1));
    selectedChars += term.getSelection().length;
    term.clearSelection();

    // 6. Export/serialize build scrollback as both ANSI and styled HTML (@xterm/addon-serialize)
    const serialized = serializeBufferAsAnsiAndHtml(buf, 0, buf.length, cols);
    term._lastScannedChars = selectedChars + serialized.ansi.length + serialized.html.length + diagnostics.length;

    warmUpVisibleViewportAtlas(term);
    flushSync(term);
    await finishStep();
}

/**
 * Benchmark Step 3: Inline Links & Hover
 * 1. Single-pass 200-entry test trace log with Web URLs, OSC 8 hyperlinks, workspace file spans, and stack frames.
 * 2. Interactive mousemove hover across 3 viewport scroll regions (top, middle, bottom) to exercise Linkifier & LinkRenderLayer.
 * 3. Full-buffer link resolution across all 4 registered providers (OscLinkProvider, WebLinksAddon,
 *    WorkspaceFileLinkProvider, StackTraceAndIssueLinkProvider) with URL/path/symbol parsing and hover tooltip updates.
 */
export async function hoverInlineLinks() {
    if (!isInitialized) {
        await ensureFontsLoaded();
        initTerminalsCore();
    }
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

    // 1. Write single-pass links & stack-trace session (zero loop repetition)
    for (let i = 0; i < linksChunks.length; i++)
        writeSync(term, linksChunks[i]);

    // Ensure IDE .xterm-hover tooltip container exists within term.element (per xterm.d.ts ILink.hover spec)
    let hoverTooltip = term.element?.querySelector(".xterm-hover");
    if (term.element && !hoverTooltip) {
        hoverTooltip = document.createElement("div");
        hoverTooltip.className = "xterm-hover";
        hoverTooltip.style.display = "none";
        term.element.appendChild(hoverTooltip);
    }

    // 2. Simulate mouse moves across distinct viewport rows & columns across 3 scroll regions
    const screenElement = term.element ? term.element.querySelector(".xterm-screen") : null;
    const buf = term.buffer.active;
    if (screenElement && buf) {
        const rect = screenElement.getBoundingClientRect();
        const rowHeight = rect.height / term.rows;
        const colPositions = [rect.left + rect.width * 0.25, rect.left + rect.width * 0.5, rect.left + rect.width * 0.72];
        const scrollTargets = [0, Math.floor(buf.length / 2), Math.max(0, buf.length - term.rows)];

        for (let s = 0; s < scrollTargets.length; s++) {
            term.scrollToLine(scrollTargets[s]);
            for (let row = 0; row < term.rows; row++) {
                const clientY = rect.top + (row + 0.5) * rowHeight;
                const clientX = colPositions[(row + s) % colPositions.length];
                screenElement.dispatchEvent(
                    new MouseEvent("mousemove", {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX,
                        clientY,
                    })
                );
            }
        }
    }

    // 3. Invoke all 4 registered link providers (OscLinkProvider, WebLinksAddon, WorkspaceFileLinkProvider,
    // StackTraceAndIssueLinkProvider) across all populated buffer lines and resolve targets.
    const providers = term._core?._linkProviderService?.linkProviders;
    if (Array.isArray(providers) && buf) {
        let linkCount = 0;
        let parsedTargets = 0;
        const cwd = shellIntegrationState.links.cwd || "/workspace/speedometer";

        for (let y = 1; y <= buf.length; y++) {
            const line = buf.getLine(y - 1);
            for (let p = 0; p < providers.length; p++) {
                providers[p].provideLinks(y, (links) => {
                    if (!links)
                        return;
                    linkCount += links.length;
                    for (let l = 0; l < links.length; l++) {
                        const link = links[l];
                        const startCol = Math.max(0, link.range.start.x - 1);
                        const endCol = Math.max(startCol + 1, link.range.end.x);
                        const extracted = line ? line.translateToString(false, startCol, endCol) : link.text;
                        if (extracted.startsWith("http://") || extracted.startsWith("https://") || extracted.startsWith("file://")) {
                            try {
                                const parsedUrl = new URL(extracted);
                                parsedTargets += parsedUrl.pathname.length + parsedUrl.hash.length;
                            } catch {
                                parsedTargets += extracted.length;
                            }
                        } else {
                            const resolvedPath = `${cwd}/${extracted}`;
                            const colonIdx = resolvedPath.lastIndexOf(":");
                            parsedTargets += colonIdx > 0 ? colonIdx : resolvedPath.length;
                        }
                        if ((linkCount & 31) === 0) {
                            link.hover?.(null, extracted);
                            if (hoverTooltip)
                                hoverTooltip.textContent = `Follow link (${extracted.slice(0, 48)})`;
                        }
                    }
                });
            }
        }
        term._lastLinkCount = linkCount + parsedTargets;
    }

    warmUpVisibleViewportAtlas(term);
    flushSync(term);
    await finishStep();
}

/**
 * Benchmark Step 4: Ncurses Color UI
 * 1. Runs 80 distinct interactive full-screen TUI frames in the Alternate Screen Buffer (\x1b[?1049h),
 *    exercising DECSTBM scroll regions (\x1b[10;25r), DeleteLine (\x1b[M), InsertLine (\x1b[L),
 *    ReverseIndex (\x1bM), cursor save/restore (\x1b7/\x1b8), EraseChars (\x1b[X), and modal overlays.
 * 2. After each frame, performs a 2D IBufferCell differential compositor pass comparing cell codepoints,
 *    24-bit RGB / 256-color palette modes, and SGR bitfields against the previous frame snapshot to build
 *    dirty-span redraw patches, flushing the renderer on major interactive TUI phase transitions.
 */
export async function ncursesColorUI() {
    if (!isInitialized) {
        await ensureFontsLoaded();
        initTerminalsCore();
    }
    switchTab("ncurses", false);
    const term = terminals.ncurses;
    if (!term) {
        await finishStep();
        return;
    }

    const rows = term.rows;
    const cols = term.cols;
    const gridSize = rows * cols;
    const prevCodes = new Uint32Array(gridSize);
    const prevFg = new Uint32Array(gridSize);
    const prevBg = new Uint32Array(gridSize);
    const prevStyle = new Uint16Array(gridSize);

    let totalDirtyCells = 0;
    let totalStyleRuns = 0;
    let diffPatchLength = 0;
    let inputBytesDispatched = 0;

    // Attach temporary onData listener to capture simulated TUI key/mouse input responses
    const dataDisposable = term.onData((data) => {
        inputBytesDispatched += data.length;
    });
    const tuiInputs = ["\x1bOA", "\x1bOB", "\x1b[15~", "\x1b[17~", "/renderer\r", "\x1b[11~"];

    for (let frameIdx = 0; frameIdx < ncursesFrames.length; frameIdx++) {
        if (frameIdx % 5 === 0)
            term.input(tuiInputs[(frameIdx / 5) % tuiInputs.length], false);

        writeSync(term, ncursesFrames[frameIdx]);

        const buf = term.buffer.active;
        const cell = buf.getNullCell();
        const baseY = buf.viewportY ?? buf.ydisp ?? 0;

        for (let y = 0; y < rows; y++) {
            const line = buf.getLine(baseY + y);
            if (!line)
                continue;

            let inDirtySpan = false;
            let spanPrevStyle = -1;
            let spanPrevFg = -1;
            let spanPrevBg = -1;
            let rowPatch = "";

            for (let x = 0; x < cols; x++) {
                line.getCell(x, cell);
                const idx = y * cols + x;
                const code = cell.getCode() || 32;
                const fg = (cell.getFgColorMode() << 24) | (cell.getFgColor() & 0xffffff);
                const bg = (cell.getBgColorMode() << 24) | (cell.getBgColor() & 0xffffff);
                const style
                    = (cell.isBold() ? 1 : 0)
                    | (cell.isDim() ? 2 : 0)
                    | (cell.isItalic() ? 4 : 0)
                    | (cell.isUnderline() ? 8 : 0)
                    | (cell.isInverse() ? 16 : 0)
                    | (cell.isFgRGB() ? 32 : 0)
                    | (cell.isBgRGB() ? 64 : 0)
                    | (cell.isFgPalette() ? 128 : 0)
                    | (cell.isBgPalette() ? 256 : 0);

                if (prevCodes[idx] !== code || prevFg[idx] !== fg || prevBg[idx] !== bg || prevStyle[idx] !== style) {
                    prevCodes[idx] = code;
                    prevFg[idx] = fg;
                    prevBg[idx] = bg;
                    prevStyle[idx] = style;
                    totalDirtyCells++;

                    if (!inDirtySpan) {
                        rowPatch += `\x1b[${y + 1};${x + 1}H`;
                        inDirtySpan = true;
                    }
                    if (style !== spanPrevStyle || fg !== spanPrevFg || bg !== spanPrevBg) {
                        totalStyleRuns++;
                        spanPrevStyle = style;
                        spanPrevFg = fg;
                        spanPrevBg = bg;
                        rowPatch += `\x1b[${style & 1 ? "1;" : ""}${style & 16 ? "7;" : ""}38;2;${(fg >> 16) & 0xff};${(fg >> 8) & 0xff};${fg & 0xff};48;2;${(bg >> 16) & 0xff};${(bg >> 8) & 0xff};${bg & 0xff}m`;
                    }
                    rowPatch += cell.getChars() || " ";
                } else {
                    inDirtySpan = false;
                }
            }
            const a11yLine = line.translateToString(true);
            diffPatchLength += rowPatch.length + a11yLine.length;
        }

        // Capture multiplexer / accessibility state snapshots at major TUI phase transitions
        if ((frameIdx + 1) % 10 === 0) {
            const phaseSnap = serializeBufferAsAnsiAndHtml(buf, 0, rows, cols);
            diffPatchLength += phaseSnap.ansi.length + phaseSnap.html.length;
        }
    }

    dataDisposable?.dispose?.();

    const modesFlag = term.modes.applicationCursorKeysMode ? 1 : 0;
    term._lastCellChecksum = (totalDirtyCells + totalStyleRuns + diffPatchLength + inputBytesDispatched + modesFlag) | 0;

    warmUpVisibleViewportAtlas(term);
    flushSync(term);
    await finishStep();
}

/**
 * Benchmark Step 5: Switch Tabs & Resize
 * 1. Exercises BufferReflow (_reflowSmaller and _reflowLarger) across split-pane column widths
 *    on the git terminal while responsive container width changes trigger FitAddon.fit()
 *    reflows across build and links.
 * 2. Cycles across all 4 terminal tabs (build -> links -> ncurses -> git -> build), updating
 *    each tab's terminal output and fitting the active viewport.
 */
export async function switchTabsAndResize() {
    if (!isInitialized) {
        await ensureFontsLoaded();
        initTerminalsCore();
    }
    const buildTerm = terminals.build;
    const linksTerm = terminals.links;
    const ncursesTerm = terminals.ncurses;
    const gitTerm = terminals.git;
    const container = document.getElementById("terminal-container");

    container.style.width = "92%";
    switchTab("build", false);
    writeSync(buildTerm, `\x1b[2m[Tab switched to build at ${++tabSwitchCounter}]\x1b[0m\r\n`);

    container.style.width = "96%";
    switchTab("links", false);
    writeSync(linksTerm, `\x1b[2m[Tab switched to links at ${++tabSwitchCounter}]\x1b[0m\r\n`);
    warmUpVisibleViewportAtlas(linksTerm);
    flushSync(linksTerm);

    container.style.width = "100%";

    switchTab("ncurses", false);
    writeSync(ncursesTerm, `\x1b[26;65H\x1b[48;2;30;75;50m\x1b[38;2;230;255;230m[Switch #${++tabSwitchCounter}]\x1b[0m`);
    warmUpVisibleViewportAtlas(ncursesTerm);
    flushSync(ncursesTerm);

    switchTab("git", false);
    writeSync(gitTerm, `\x1b[33m* ${(0xb100000 + tabSwitchCounter).toString(16)}\x1b[0m [git-status] Workspace reflow check #${++tabSwitchCounter} (3 files modified)\r\n`);
    warmUpVisibleViewportAtlas(gitTerm);
    flushSync(gitTerm);

    switchTab("build", false);
    warmUpVisibleViewportAtlas(buildTerm);
    flushSync(buildTerm);

    await finishStep();
}

/**
 * Layout Check
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

    await initialFontLoad;
    document.getElementById("terminal-container")?.setAttribute("data-fonts-ready", "true");
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
    get isInitialized() {
        return isInitialized;
    },
};
