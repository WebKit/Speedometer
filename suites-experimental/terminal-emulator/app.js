import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { CanvasAddon } from "@xterm/addon-canvas";
import { WebGLAddon } from "@xterm/addon-webgl";
import { generateBuildLogSession, generateLinksSession, generateNcursesSession } from "./sessions.js";

// Terminal instances and addons storage
const terminals = {};
const fitAddons = {};
let activeTabId = "build";
let isInitialized = false;

// Pre-generate session data for deterministic benchmarking
const buildLogChunks = generateBuildLogSession();
const linksChunks = generateLinksSession();
const ncursesFrames = generateNcursesSession();

// Determine renderer backend from URL query param (default: canvas, fallback: dom)
const params = new URLSearchParams(window.location.search);
const rendererType = (params.get("renderer") || "canvas").toLowerCase();

/**
 * Initialize all 4 terminal panes and attach addons
 */
export function initTerminals() {
    if (isInitialized) return;

    const tabs = ["build", "links", "ncurses", "git"];

    tabs.forEach((tabId) => {
        const container = document.getElementById(`pane-${tabId}`);
        if (!container) return;

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
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 13,
            lineHeight: 1.2,
            scrollback: 5000,
            cursorBlink: false, // Turn off blinking for deterministic rendering
            allowTransparency: false,
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

        term.open(container);
        fitAddon.fit();

        terminals[tabId] = term;
        fitAddons[tabId] = fitAddon;
    });

    // Populate Git tab with static sample output
    if (terminals.git) {
        writeAndFlushSync(terminals.git, "\x1b[33mOn branch main\x1b[0m\r\n");
        writeAndFlushSync(terminals.git, "Your branch is up to date with 'origin/main'.\r\n\r\n");
        writeAndFlushSync(terminals.git, "Changes not staged for commit:\r\n");
        writeAndFlushSync(terminals.git, '  (use "git add <file>..." to update what will be committed)\r\n');
        writeAndFlushSync(terminals.git, '  (use "git restore <file>..." to discard changes in working directory)\r\n');
        writeAndFlushSync(terminals.git, "\t\x1b[31mmodified:   src/app.js\x1b[0m\r\n");
        writeAndFlushSync(terminals.git, "\t\x1b[31mmodified:   style.css\x1b[0m\r\n\r\n");
        writeAndFlushSync(terminals.git, "Untracked files:\r\n");
        writeAndFlushSync(terminals.git, '  (use "git add <file>..." to include in what will be committed)\r\n');
        writeAndFlushSync(terminals.git, "\t\x1b[31msessions.js\x1b[0m\r\n\r\n");
        writeAndFlushSync(terminals.git, 'no changes added to commit (use "git add" and/or "git commit -a")\r\n');
    }

    // Display initial content in all terminals so font loading, glyph texture atlas
    // generation, and canvas renderer warmup are covered in the setup phase.
    if (terminals.build && buildLogChunks.length > 0) {
        writeSync(terminals.build, "\x1b[36m⚡ Speedometer Terminal Emulator Suite - Initializing Build Environment...\x1b[0m\r\n\r\n");
        for (let i = 0; i < Math.min(10, buildLogChunks.length); i++) {
            writeSync(terminals.build, buildLogChunks[i]);
        }
    }
    if (terminals.links && linksChunks.length > 0) {
        writeSync(terminals.links, "\x1b[36m🔗 Speedometer Web Links & Traces - Initializing Link Environment...\x1b[0m\r\n\r\n");
        for (let i = 0; i < Math.min(10, linksChunks.length); i++) {
            writeSync(terminals.links, linksChunks[i]);
        }
    }
    if (terminals.ncurses && ncursesFrames.length > 0) {
        writeSync(terminals.ncurses, ncursesFrames[0]);
    }

    // Synchronously unpause and flush all terminals during setup so texture atlases
    // and renderer backends are 100% warmed up before benchmark step measurement begins.
    Object.values(terminals).forEach((term) => {
        if (term._core && term._core._renderService) {
            const rs = term._core._renderService;
            if (rs._isPaused) {
                rs._isPaused = false;
                if (rs._charSizeService && !rs._charSizeService.hasValidSize) {
                    rs._charSizeService.measure();
                }
                if (rs._needsFullRefresh) {
                    if (rs._pausedResizeTask && typeof rs._pausedResizeTask.flush === "function") {
                        rs._pausedResizeTask.flush();
                    }
                    rs.refreshRows(0, rs._rowCount - 1);
                    rs._needsFullRefresh = false;
                }
            }
        }
        flushSync(term);
    });

    isInitialized = true;
    switchTab("build");
}

function tryLoadCanvas(term) {
    try {
        const canvasAddon = new CanvasAddon();
        term.loadAddon(canvasAddon);
    } catch (e) {
        console.warn("Canvas renderer failed to initialize, using default DOM renderer:", e);
    }
}

/**
 * Synchronously flush any pending debounced render passes or animation frames on
 * the terminal's render debouncer, viewport scrollbar, and selection overlays,
 * forcing dirty rows and DOM elements to update immediately.
 */
export function flushSync(term) {
    if (!term || !term._core) return;

    // 1. Flush terminal grid renderer (RenderService / RenderDebouncer)
    if (term._core._renderService) {
        const debouncer = term._core._renderService._renderDebouncer;
        if (debouncer && typeof debouncer._innerRefresh === "function") {
            if (debouncer._animationFrame) {
                window.cancelAnimationFrame(debouncer._animationFrame);
                debouncer._animationFrame = undefined;
            }
            debouncer._innerRefresh();
        }
    }

    // 2. Flush viewport scrollbar synchronization (Viewport)
    if (term._core.viewport) {
        const vp = term._core.viewport;
        if (vp._refreshAnimationFrame) {
            window.cancelAnimationFrame(vp._refreshAnimationFrame);
            vp._refreshAnimationFrame = undefined;
        }
        if (typeof vp._innerRefresh === "function") {
            vp._innerRefresh();
        }
    }

    // 3. Flush selection overlays (SelectionService)
    if (term._core._selectionService) {
        const sel = term._core._selectionService;
        if (sel._refreshAnimationFrame) {
            window.cancelAnimationFrame(sel._refreshAnimationFrame);
            sel._refreshAnimationFrame = undefined;
        }
        if (typeof sel._refresh === "function") {
            sel._refresh();
        }
    }
}

/**
 * Synchronously write data to the terminal buffer without macro-task timer delays
 * or 12ms chunking, updating grid cells without triggering intermediate canvas redraws.
 */
export function writeSync(term, data) {
    if (!term) return;
    if (term._core && term._core._writeBuffer && typeof term._core._writeBuffer.writeSync === "function") {
        term._core._writeBuffer.writeSync(data);
    } else {
        term.write(data);
    }
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
export function switchTab(tabId) {
    if (!terminals[tabId]) return;

    activeTabId = tabId;

    // Update tab header UI
    document.querySelectorAll(".tab").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    // Update terminal pane visibility
    document.querySelectorAll(".terminal-pane").forEach((pane) => {
        pane.classList.toggle("active", pane.id === `pane-${tabId}`);
    });

    // Reflow and fit terminal to container
    if (fitAddons[tabId]) {
        fitAddons[tabId].fit();
    }
    if (terminals[tabId]) {
        terminals[tabId].focus();
        // Immediately unpause render service and force pending layout/resize tasks
        // so that terminal operations render synchronously during -Sync instead of
        // waiting for asynchronous IntersectionObserver callbacks in -Async!
        const term = terminals[tabId];
        if (term._core && term._core._renderService) {
            const rs = term._core._renderService;
            if (rs._isPaused) {
                rs._isPaused = false;
                if (rs._charSizeService && !rs._charSizeService.hasValidSize) {
                    rs._charSizeService.measure();
                }
                if (rs._needsFullRefresh) {
                    if (rs._pausedResizeTask && typeof rs._pausedResizeTask.flush === "function") {
                        rs._pausedResizeTask.flush();
                    }
                    rs.refreshRows(0, rs._rowCount - 1);
                    rs._needsFullRefresh = false;
                }
            }
        }
        flushSync(terminals[tabId]);
    }
}

async function finishStep() {
    // 1. Give xterm and addons initial microtask ticks to allow any pending
    // DOM observer callbacks or event listeners to push their rendering timers.
    for (let i = 0; i < 10; i++) {
        await Promise.resolve();
    }

    // 2. Loop until all scheduled xterm rendering passes, texture atlas warmups,
    // macro-task timers (setTimeout/rAF/rIC), DOM observers, and
    // asynchronous GPU texture bitmaps (createImageBitmap) have completely drained.
    let drainLimit = 300;
    while ((window.__activeTimers.size > 0 || window.__activeBitmaps.size > 0 || (window.__activeObservers && window.__activeObservers.size > 0)) && drainLimit-- > 0) {
        if (window.__activeBitmaps.size > 0) {
            await Promise.all(Array.from(window.__activeBitmaps));
        }
        Object.values(terminals).forEach((term) => flushSync(term));
        // Yield to the browser's Macro-Task Queue so pending setTimeout(0),
        // requestAnimationFrame, and requestIdleCallback callbacks actually execute!
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // 3. Final defensive settling phase: await additional microtask ticks to ensure
    // zero deferred rendering work spills over into subsequent steps or async measurement.
    for (let i = 0; i < 20; i++) {
        await Promise.resolve();
    }

    // 4. Synchronously flush all terminal renderers, viewports, and selection overlays
    // right before step completion so zero animation frames spill over into -async.
    Object.values(terminals).forEach((term) => flushSync(term));

    window.dispatchEvent(new CustomEvent("step-complete"));
}

/**
 * Benchmark Step 1: Dump & Scroll Output
 * Dumps ~1,500 lines of verbose build logs, triggers line wrapping, and scrolls through buffer
 */
export async function dumpAndScroll() {
    switchTab("build");
    const term = terminals.build;
    if (!term) {
        await finishStep();
        return;
    }

    term.clear();

    // Write ~50% of build log chunks to target ~50ms workload complexity
    const limit = Math.min(75, buildLogChunks.length);
    for (let i = 0; i < limit; i++) {
        writeSync(term, buildLogChunks[i]);
    }
    flushSync(term);

    // Force viewport scroll manipulations and text selection
    term.scrollToTop();
    flushSync(term);
    for (let i = 0; i < 10; i++) {
        term.scrollLines(50);
        flushSync(term);
    }
    term.scrollToBottom();
    flushSync(term);

    // Simulate user selecting a block of logs
    term.select(0, 10, 80);
    flushSync(term);
    term.clearSelection();
    flushSync(term);

    await finishStep();
}

/**
 * Benchmark Step 2: Inline Links & Hover
 * Dumps URLs and paths, then simulates mouse hover events across grid to trigger regex link provider
 */
export async function hoverInlineLinks() {
    switchTab("links");
    const term = terminals.links;
    if (!term) {
        await finishStep();
        return;
    }

    term.clear();
    // Write ~50% of link chunks to target ~15ms workload complexity
    const limit = Math.min(40, linksChunks.length);
    for (let i = 0; i < limit; i++) {
        writeSync(term, linksChunks[i]);
    }
    flushSync(term);

    // Simulate mouse moves across rows to trigger @xterm/addon-web-links regex matching & decorations
    const screenElement = term.element ? term.element.querySelector(".xterm-screen") : null;
    if (screenElement) {
        const rect = screenElement.getBoundingClientRect();
        const stepY = rect.height / 25;
        const stepX = rect.width / 4;

        for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 3; col++) {
                const clientX = rect.left + col * stepX;
                const clientY = rect.top + row * stepY;
                const moveEvent = new MouseEvent("mousemove", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX,
                    clientY,
                });
                screenElement.dispatchEvent(moveEvent);
                flushSync(term);
            }
        }
    }

    await finishStep();
}

/**
 * Benchmark Step 3: Ncurses Color UI
 * Emits 4 sequential frames of an htop monitor with cursor positioning, TrueColor, and partial grid redraws
 */
export async function ncursesColorUI() {
    switchTab("ncurses");
    const term = terminals.ncurses;
    if (!term) {
        await finishStep();
        return;
    }

    for (let i = 0; i < ncursesFrames.length; i++) {
        writeAndFlushSync(term, ncursesFrames[i]);
    }

    term.refresh(0, term.rows - 1);
    flushSync(term);
    await finishStep();
}

/**
 * Benchmark Step 4: Switch Tabs & Resize
 * Simulates switching between multiple active IDE terminal panels and reflowing columns
 */
export async function switchTabsAndResize() {
    // Switch between 2 active panels ("build" and "links") to target ~20ms workload complexity
    const tabs = ["build", "links"];
    const container = document.getElementById("terminal-container");

    for (let cycle = 0; cycle < 1; cycle++) {
        for (let i = 0; i < tabs.length; i++) {
            const tabId = tabs[i];

            // Simulate IDE sidebar toggling or panel resizing by mutating width slightly
            if (container) {
                container.style.width = i === 0 ? "95%" : "100%";
            }

            switchTab(tabId);

            // Write a small status ping and synchronously reflow/flush on active tab
            if (terminals[tabId]) {
                writeAndFlushSync(terminals[tabId], `\x1b[2m[Tab switched to ${tabId} at ${Date.now()}]\x1b[0m\r\n`);
            }
        }
    }

    if (container) {
        container.style.width = "100%";
    }
    switchTab("build");
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
window.addEventListener("DOMContentLoaded", () => {
    initTerminals();

    document.querySelectorAll(".tab").forEach((btn) => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            if (tabId) switchTab(tabId);
        });
    });

    const btnInit = document.getElementById("btn-init");
    const btnDump = document.getElementById("btn-dump-scroll");
    const btnLinks = document.getElementById("btn-hover-links");
    const btnNcurses = document.getElementById("btn-ncurses");
    const btnSwitch = document.getElementById("btn-switch-tabs");
    const btnLayout = document.getElementById("btn-layout");

    if (btnInit) btnInit.addEventListener("click", initTerminals);
    if (btnDump) btnDump.addEventListener("click", dumpAndScroll);
    if (btnLinks) btnLinks.addEventListener("click", hoverInlineLinks);
    if (btnNcurses) btnNcurses.addEventListener("click", ncursesColorUI);
    if (btnSwitch) btnSwitch.addEventListener("click", switchTabsAndResize);
    if (btnLayout) btnLayout.addEventListener("click", layoutCheck);

    // Handle window resizing
    window.addEventListener("resize", () => {
        if (fitAddons[activeTabId]) {
            fitAddons[activeTabId].fit();
        }
    });
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
