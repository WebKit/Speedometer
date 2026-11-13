// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).
//
// Generate deterministic sessions for terminal emulator benchmarking

const ANSI = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
    inverse: "\x1b[7m",
    strikethrough: "\x1b[9m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgBlue: "\x1b[44m",
    clearScreen: "\x1b[2J\x1b[H",
    cursorHome: "\x1b[H",
    hideCursor: "\x1b[?25l",
    showCursor: "\x1b[?25h",
    altBufferOn: "\x1b[?1049h",
    altBufferOff: "\x1b[?1049l",
};

function rgbFg(r, g, b, text) {
    return `\x1b[38;2;${r};${g};${b}m${text}${ANSI.reset}`;
}
function rgbBg(r, g, b, text) {
    return `\x1b[48;2;${r};${g};${b}m${text}${ANSI.reset}`;
}
function c256Fg(code, text) {
    return `\x1b[38;5;${code}m${text}${ANSI.reset}`;
}
function osc8(url, text, id = "") {
    const params = id ? `id=${id}` : "";
    return `\x1b]8;${params};${url}\x07${text}\x1b]8;;\x07`;
}

// 1. Build Log Session: Single-pass 360-step ninja/cmake/clang build & ctest pipeline
// Exercises:
// - OSC 0/2 window title & OSC 133/633 shell integration prompt/command markers
// - Carriage-return + erase-in-line (\r\x1b[2K) live progress bar updates
// - 256-color (\x1b[38;5;Nm) & 24-bit TrueColor (\x1b[38;2;R;G;Bm) SGR spans
// - OSC 8 clickable compiler diagnostic file hyperlinks (\x1b]8;;file://...\x07)
// - UTF-8 box-drawing diagnostic carets and multi-column ctest summary table
export function generateBuildLogSession() {
    const chunks = [];
    const components = [
        "WebCore", "JavaScriptCore", "WebKit2", "WTF", "PAL", "ANGLE",
        "Skia", "V8", "Blink", "Platform", "Compositor", "Network",
        "Layout", "DOM", "Style", "Bindings",
    ];
    const files = [
        "Node.cpp", "Element.cpp", "Document.cpp", "JSLexer.cpp", "Parser.cpp",
        "RenderBox.cpp", "CSSParser.cpp", "EventLoop.cpp", "FrameView.cpp", "DOMWindow.cpp",
        "StyleResolver.cpp", "LayerTreeHost.cpp", "ResourceLoader.cpp", "BytecodeGenerator.cpp",
        "InlineFormattingContext.cpp", "ShadowRoot.cpp", "MutationObserver.cpp", "TextDecoder.cpp",
        "CanvasRenderingContext2D.cpp", "OffscreenCanvas.cpp",
    ];

    chunks.push(
        "\x1b]0;ninja -C out/Release speedometer_all\x07"
        + "\x1b]133;A\x07\x1b]633;P;Cwd=/workspace/speedometer\x07"
        + `${ANSI.bold}${ANSI.green}developer@workstation${ANSI.reset}:${ANSI.bold}${ANSI.blue}/workspace/speedometer${ANSI.reset}$ `
        + "\x1b]133;B\x07ninja -C out/Release -j16 speedometer_all && ctest --output-on-failure\r\n\x1b]133;C\x07"
        + `${ANSI.bold}${ANSI.cyan}==> Starting build suite configuration (Speedometer Terminal Emulator Workload)...${ANSI.reset}\r\n`
        + `${ANSI.green}✔ Pre-build checks passed. Environment: Linux x86_64, Node v22.0.0, Clang 18.0.0, LLD 18.0.0${ANSI.reset}\r\n`
    );

    const totalSteps = 780;
    for (let i = 1; i <= totalSteps; i++) {
        let chunk = "";
        const comp = components[i % components.length];
        const file = files[i % files.length];
        const totalProgress = Math.min(100, Math.floor((i / totalSteps) * 100));
        const barFilled = Math.floor((totalProgress / 100) * 16);
        const bar = "█".repeat(barFilled) + "░".repeat(16 - barFilled);

        // In-place ninja status bar overwrite (\r + CSI 2K) followed by completed compile line
        chunk += `\r\x1b[2K${c256Fg(39, `[${i}/${totalSteps}]`)} [${c256Fg(48, bar)}] Compiling ${comp}/${file}...`;
        chunk += `\r\x1b[2K${ANSI.dim}[${new Date(1720448000000 + i * 250).toISOString()}]${ANSI.reset} [${ANSI.bold}${totalProgress.toString().padStart(3, " ")}%${ANSI.reset}] ${c256Fg(75, `[${i}/${totalSteps}]`)} Building CXX object Source/${comp}/CMakeFiles/${comp}.dir/${file}.o\r\n`;

        if (i % 5 === 0) {
            const lineNum = 120 + (i % 90);
            const colNum = 14 + (i % 25);
            const fileUrl = `file:///workspace/speedometer/Source/${comp}/${file}`;
            chunk += `  ╭─[${osc8(fileUrl, `Source/${comp}/${file}:${lineNum}:${colNum}`, `diag-w-${i}`)}] ${ANSI.bold}${ANSI.yellow}warning:${ANSI.reset} unused parameter 'execState' [${c256Fg(214, "-Wunused-parameter")}]\r\n`;
            chunk += `  ${lineNum} │ JSValue ${comp}::evaluate(JSGlobalObject* ${ANSI.bold}${ANSI.underline}${ANSI.yellow}execState${ANSI.reset}, const SourceCode& source) -> Result\r\n`;
            chunk += `      │                                         ${ANSI.yellow}^~~~~~~~~~${ANSI.reset}\r\n`;
        }

        if (i % 11 === 0) {
            const lineNum = 200 + i;
            chunk += `${ANSI.bold}${ANSI.cyan}info:${ANSI.reset} vectorization enabled for loop in ${file} at line ${lineNum} (width == 8 && interleave >= 2)\r\n`;
            chunk += `  ${ANSI.dim}${ANSI.italic}remark: vectorized 8 instructions in unrolled loop (-Rpass=loop-vectorize)${ANSI.reset}\r\n`;
        }

        if (i % 18 === 0) {
            const sizeMb = (18.4 + (i % 35) * 1.3).toFixed(1);
            chunk += `${ANSI.bold}${ANSI.magenta}[LINK]${ANSI.reset} Linking shared library ${rgbFg(180, 140, 255, `lib${comp}.so`)} (LLD thinLTO cache hit 94%)...\r\n`;
            chunk += `  ${ANSI.green}✔ Created lib/lib${comp}.so (${sizeMb} MB, 1,280 exported symbols)${ANSI.reset}\r\n`;
        }

        if (i % 28 === 0) {
            const lineNum = 340 + i;
            const fileUrl = `file:///workspace/speedometer/Source/${comp}/${file}`;
            chunk += `\x1b]133;A\x07  ╭─[${osc8(fileUrl, `Source/${comp}/${file}:${lineNum}:9`, `diag-e-${i}`)}] ${ANSI.bold}${ANSI.red}error (ignored):${ANSI.reset} transient lock contention in distributed thinLTO cache for ${file}\r\n`;
            chunk += `  ${ANSI.dim}note: retrying remote cache fetch (attempt 2 of 3) with fallback local shard...${ANSI.reset}\r\n`;
            chunk += `  ${ANSI.green}✔ Retry successful! Artifact validated (SHA-256: ${(0x9a4f1000 + i * 7919).toString(16)})${ANSI.reset}\r\n`;
        }

        chunks.push(chunk);
    }

    chunks.push(
        `\r\n${ANSI.bold}${ANSI.cyan}==> Running ctest post-build verification suite (8 shards)...${ANSI.reset}\r\n`
        + "  ┌──────────────────────┬──────────┬──────────┬──────────┐\r\n"
        + "  │ Suite Shard          │  Passed  │ Warnings │ Duration │\r\n"
        + "  ├──────────────────────┼──────────┼──────────┼──────────┤\r\n"
        + `  │ WebCore.DOM          │ ${ANSI.green} 412/412${ANSI.reset} │     2    │   4.12s  │\r\n`
        + `  │ JavaScriptCore.JIT   │ ${ANSI.green} 628/628${ANSI.reset} │     5    │   8.45s  │\r\n`
        + `  │ Blink.LayoutNG       │ ${ANSI.green} 380/380${ANSI.reset} │     1    │   5.09s  │\r\n`
        + `  │ Skia.VulkanBackend   │ ${ANSI.green} 295/295${ANSI.reset} │     0    │   3.18s  │\r\n`
        + "  └──────────────────────┴──────────┴──────────┴──────────┘\r\n"
        + `${ANSI.bold}${ANSI.green}==> Build completed successfully in 42.8s! Total artifacts: 1,420 targets.${ANSI.reset}\r\n`
        + "\x1b]133;D;0\x07"
    );
    return chunks;
}

// 2. Links Session: Single-pass 200-entry test runner, stack trace & OSC 8 hyperlink log
// Exercises all 4 link provider subsystems:
// - WebLinksAddon (https:// URLs)
// - Built-in OscLinkProvider (\x1b]8;id=...;https://...\x07...\x1b]8;;\x07)
// - Custom IDE WorkspaceFileLinkProvider (file:///..., path:line:col, path(line,col))
// - Custom IDE StackTraceAndIssueLinkProvider (at Symbol (path:line:col), TSxxxx, #issue)
export function generateLinksSession() {
    const chunks = [];
    chunks.push(
        "\x1b]633;P;Cwd=/workspace/speedometer\x07"
        + `${ANSI.bold}${ANSI.blue}=== Test Execution Summary, Stack Traces & Hyperlinked Specs ===${ANSI.reset}\r\n`
    );

    const suites = ["codemirror", "todomvc", "chartjs", "react-stockcharts", "terminal-xterm", "prosemirror", "babylon", "pdfjs"];
    const modules = [
        "src/core/input/InputHandler.ts",
        "src/core/buffer/BufferReflow.ts",
        "src/browser/Linkifier.ts",
        "src/browser/services/DecorationService.ts",
        "src/common/parser/EscapeSequenceParser.ts",
        "Source/WebCore/dom/Document.cpp",
        "Source/JavaScriptCore/parser/Parser.cpp",
        "resources/benchmark-runner.mjs",
    ];
    const symbols = [
        "InputHandler.parse",
        "EscapeSequenceParser.parse",
        "BufferReflow._reflowSmaller",
        "Linkifier._linkifyRow",
        "DecorationService.registerDecoration",
        "OverviewRulerRenderer._refreshDecorations",
        "BenchmarkRunner._runStep",
        "TerminalCore._setup",
    ];

    for (let i = 1; i <= 200; i++) {
        const suite = suites[i % suites.length];
        const mod = modules[i % modules.length];
        const sym = symbols[i % symbols.length];
        const line = 40 + ((i * 7) % 320);
        const col = (i % 36) + 1;
        let chunk = "";
        chunk += `[Test Worker #${(i % 8) + 1}] RUNNING: https://github.com/WebKit/Speedometer/issues/${1000 + i} ${
            osc8(`https://tc39.es/ecma262/#sec-execution-contexts-${i}`, `[ECMA-262 §9.4.${i}]`, `spec-${i}`) }\r\n`;
        chunk += "  ↳ Reference spec: https://html.spec.whatwg.org/multipage/webappapis.html#event-loops\r\n";
        chunk += `  ↳ Local fixture: file:///workspace/speedometer/suites/editors/${suite}.html:${10 + i}:${(i % 20) + 1}\r\n`;
        chunk += `  ↳ Compiler span: ${mod}(${line},${col}): warning TS${2300 + (i % 90)}: diagnostic trace in ${mod}:${line}:${col} (issue #${4200 + i})\r\n`;
        chunk += `  ↳ Stack trace: at ${sym} (src/speedometer-utils/benchmark.mjs:${50 + i}:12) -> ${osc8(`https://crbug.com/${1400000 + i}`, `crbug.com/${1400000 + i}`, `bug-${i}`)}\r\n`;
        chunk += "  ↳ Documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext\r\n";
        chunk += `  ↳ NPM Registry: https://registry.npmjs.org/@xterm/xterm/-/xterm-5.5.${i % 10}.tgz\r\n`;
        chunks.push(chunk);
    }
    return chunks;
}

// 3. ncurses Session: 24 distinct interactive full-screen TUI frames in the Alternate Screen Buffer
// Exercises:
// - Alternate Screen Buffer (\x1b[?1049h / \x1b[?1049l) + DECCKM (\x1b[?1h) + cursor save/restore (\x1b7 / \x1b8)
// - DECSTBM top/bottom scrolling margins (\x1b[10;25r)
// - Hardware line operations: Insert Line (\x1b[L), Delete Line (\x1b[M), Index (\x1bD), Reverse Index (\x1bM)
// - Multi-pane split layout: 16-core CPU/Mem telemetry + left Process Table + right Socket/I/O Inspector + Modal Overlays
export function generateNcursesSession() {
    const frames = [];
    const procList = [
        { pid: 1420, user: "developer", pri: 20, ni: 0, virt: "4820M", res: "312M", shr: "84M", s: "R", cpu: 45.2, mem: 1.9, time: "4:12.08", tree: "├─┬─ ", cmd: "chrome --type=renderer --site=speedometer" },
        { pid: 1488, user: "developer", pri: 20, ni: 0, virt: "2140M", res: "198M", shr: "62M", s: "R", cpu: 19.6, mem: 1.2, time: "1:48.33", tree: "│ ├─ ", cmd: "chrome --type=gpu-process --enable-oop-raster" },
        { pid: 1512, user: "developer", pri: 20, ni: 0, virt: "1680M", res: "145M", shr: "51M", s: "S", cpu: 11.4, mem: 0.9, time: "0:54.21", tree: "│ └─ ", cmd: "chrome --type=utility --network-service" },
        { pid: 1842, user: "developer", pri: 20, ni: 0, virt: "8920M", res: "1.2G", shr: "120M", s: "S", cpu: 32.8, mem: 7.4, time: "18:45.12", tree: "├─┬─ ", cmd: "node tests/server.mjs --port 8000" },
        { pid: 2901, user: "developer", pri: 20, ni: 0, virt: "1420M", res: "180M", shr: "64M", s: "R", cpu: 28.4, mem: 1.1, time: "1:02.45", tree: "│ ├─ ", cmd: "vite build --watch --mode development" },
        { pid: 2944, user: "developer", pri: 20, ni: 0, virt: "1180M", res: "142M", shr: "48M", s: "S", cpu: 16.5, mem: 0.9, time: "0:38.19", tree: "│ └─ ", cmd: "esbuild --service=0.20.2 --ping" },
        { pid: 3105, user: "developer", pri: 20, ni: 0, virt: "980M", res: "92M", shr: "45M", s: "S", cpu: 14.1, mem: 0.6, time: "0:45.90", tree: "├─── ", cmd: "python3 sidecar.py --daemon --workers 4" },
        { pid: 3412, user: "developer", pri: 20, ni: 0, virt: "3640M", res: "640M", shr: "110M", s: "R", cpu: 38.7, mem: 4.0, time: "6:19.04", tree: "├─┬─ ", cmd: "clang++ -O3 -std=c++20 Source/WebCore/DOM.cpp" },
        { pid: 3490, user: "developer", pri: 20, ni: 0, virt: "2890M", res: "510M", shr: "92M", s: "R", cpu: 24.3, mem: 3.2, time: "3:51.77", tree: "│ ├─ ", cmd: "ld.lld -shared -o lib/libWebCore.so" },
        { pid: 3518, user: "developer", pri: 20, ni: 0, virt: "1920M", res: "310M", shr: "74M", s: "R", cpu: 21.0, mem: 1.9, time: "2:11.09", tree: "│ └─ ", cmd: "llvm-objcopy --strip-debug libWebCore.so" },
        { pid: 402, user: "root", pri: 20, ni: 0, virt: "310M", res: "24M", shr: "18M", s: "S", cpu: 5.0, mem: 0.2, time: "12:10.01", tree: "├─── ", cmd: "/lib/systemd/systemd-journald" },
        { pid: 881, user: "root", pri: -20, ni: -20, virt: "0", res: "0", shr: "0", s: "I", cpu: 1.2, mem: 0.0, time: "0:04.12", tree: "├─── ", cmd: "[kworker/u16:2-events_unbound]" },
        { pid: 5120, user: "developer", pri: 20, ni: 0, virt: "2100M", res: "410M", shr: "95M", s: "S", cpu: 0.8, mem: 2.5, time: "2:14.50", tree: "├─┬─ ", cmd: "code /workspace/speedometer" },
        { pid: 5288, user: "developer", pri: 20, ni: 0, virt: "1540M", res: "285M", shr: "70M", s: "S", cpu: 4.2, mem: 1.8, time: "1:19.40", tree: "│ └─ ", cmd: "tsserver.js --useInferredProject" },
        { pid: 6012, user: "developer", pri: 20, ni: 0, virt: "650M", res: "45M", shr: "28M", s: "S", cpu: 0.4, mem: 0.3, time: "0:12.80", tree: "├─── ", cmd: "tmux new-session -s bench" },
        { pid: 7100, user: "developer", pri: 20, ni: 0, virt: "520M", res: "38M", shr: "22M", s: "S", cpu: 0.1, mem: 0.2, time: "0:05.10", tree: "├─── ", cmd: "git status -uall --porcelain=v2" },
        { pid: 8192, user: "developer", pri: 20, ni: 0, virt: "120M", res: "8M", shr: "6M", s: "R", cpu: 0.0, mem: 0.1, time: "0:00.05", tree: "└─── ", cmd: "htop --sort-key=PERCENT_CPU" },
    ];

    const sockets = [
        "TCP 127.0.0.1:8000->54120 ESTAB",
        "TCP 127.0.0.1:8000->54122 ESTAB",
        "TCP 127.0.0.1:9222->38910 ESTAB",
        "UNIX /run/user/1000/tmux-1000/default",
        "UNIX /tmp/.X11-unix/X0 STREAM",
        "TCP 10.128.0.42:443->build-cache",
        "UDP 127.0.0.53:53 systemd-resolve",
        "UNIX /run/systemd/journal/stdout",
    ];

    const sortColumns = ["PERCENT_CPU", "M_RESIDENT", "TIME+", "IO_RATE", "PID"];
    const sparkChars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];

    for (let frameIdx = 0; frameIdx < 80; frameIdx++) {
        let frame = "";
        if (frameIdx === 0) {
            frame += `${ANSI.altBufferOn}\x1b[?1h\x1b[?1000h${ANSI.hideCursor}${ANSI.clearScreen}\x1b]0;btop/htop 3.3.0 - tmux:0*\x07`;
        } else if (frameIdx === 79) {
            // Test normal buffer roundtrip (\x1b[?1049l -> \x1b[?1049h) and re-enable TUI modes
            frame += `\x1b[r\x1b[?1000l\x1b[?1l${ANSI.altBufferOff}${ANSI.altBufferOn}\x1b[?1h\x1b[?1000h${ANSI.cursorHome}`;
        } else {
            frame += `\x1b[r${ANSI.cursorHome}`;
        }

        // Row 1-2: Header / Uptime / Load Avg / Disk & Network telemetry
        const load1 = (2.45 + Math.sin(frameIdx / 3) * 0.65).toFixed(2);
        const load5 = (2.10 + Math.cos(frameIdx / 5) * 0.35).toFixed(2);
        const load15 = (1.85 + Math.sin(frameIdx / 8) * 0.22).toFixed(2);
        const netRx = (48.2 + frameIdx * 4.7).toFixed(1);
        const netTx = (19.5 + frameIdx * 2.3).toFixed(1);
        const ioRead = (124.0 + (frameIdx % 7) * 18.5).toFixed(1);
        const ioWrite = (86.4 + (frameIdx % 5) * 14.2).toFixed(1);
        frame += `${rgbFg(100, 220, 255, "htop/btop 3.3")} │ ${rgbFg(220, 220, 220, `16:15:${(10 + frameIdx).toString().padStart(2, "0")} up 14d 06:42`)} │ Load: ${rgbFg(255, 100, 100, load1)} ${rgbFg(255, 180, 100, load5)} ${rgbFg(180, 255, 100, load15)} │ I/O R:${c256Fg(114, `${ioRead}M/s`)} W:${c256Fg(209, `${ioWrite}M/s`)}\x1b[K\r\n`;
        frame += `Tasks: ${ANSI.bold}154${ANSI.reset} (${ANSI.bold}488${ANSI.reset} thr), ${rgbFg(100, 255, 100, "6 run")}, 482 slp │ Net RX:${c256Fg(81, `${netRx}MB/s`)} TX:${c256Fg(213, `${netTx}MB/s`)} │ Zram: ${c256Fg(141, "1.42G/8.0G (3.1x)")}\x1b[K\r\n`;

        // Rows 3-6: Render 16 CPU Cores in 4 columns (4 rows) with sparklines & temperatures
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const coreNum = row + col * 4 + 1;
                const cpuPct = Math.min(100, Math.max(4, Math.floor(42 + Math.sin(frameIdx * 0.4 + coreNum) * 38 + (coreNum % 3) * 8)));
                const barWidth = 9;
                const filledWidth = Math.floor((cpuPct / 100) * barWidth);
                const tempC = 54 + Math.floor(cpuPct * 0.28);
                const spark = sparkChars[(frameIdx + coreNum) % sparkChars.length] + sparkChars[(frameIdx * 2 + coreNum) % sparkChars.length];

                let barStr = "[";
                for (let b = 0; b < barWidth; b++) {
                    if (b < filledWidth) {
                        if (b < 4)
                            barStr += rgbFg(80, 250, 120, "|");
                        else if (b < 7)
                            barStr += rgbFg(255, 200, 50, "|");
                        else
                            barStr += rgbFg(250, 70, 70, "|");
                    } else {
                        barStr += rgbFg(60, 60, 60, "·");
                    }
                }
                barStr += `]${rgbFg(220, 220, 220, `${cpuPct.toString().padStart(3, " ")}%`)}`;
                const tempColor = tempC > 72 ? 203 : tempC > 64 ? 221 : 114;
                const label = rgbFg(100, 220, 255, `C${coreNum.toString().padEnd(2, " ")}`);
                frame += `${label}${c256Fg(75, spark)}${barStr}${c256Fg(tempColor, `${tempC}°`)} `;
            }
            frame += "\x1b[K\r\n";
        }

        // Rows 7-8: Memory, Swap & Disk Cache bars
        const memPct = 44.5 + Math.sin(frameIdx * 0.25) * 4.5;
        const swapPct = 12.0 + (frameIdx % 5) * 0.6;
        const memBarWidth = 52;
        const memFilled = Math.floor((memPct / 100) * memBarWidth);
        let memBar = "[";
        for (let b = 0; b < memBarWidth; b++)
            memBar += b < memFilled ? rgbFg(80, 200, 255, "|") : b < memFilled + 8 ? rgbFg(180, 140, 255, ":") : rgbFg(60, 60, 60, " ");
        memBar += `] ${rgbFg(220, 220, 220, `${(14.2 + frameIdx * 0.08).toFixed(2)}G/32.0G (Cache 6.4G)`)}`;
        frame += `${rgbFg(100, 220, 255, "Mem  ")}${memBar}\x1b[K\r\n`;

        let swapBar = "[";
        const swapFilled = Math.floor((swapPct / 100) * memBarWidth);
        for (let b = 0; b < memBarWidth; b++)
            swapBar += b < swapFilled ? rgbFg(255, 100, 200, "|") : rgbFg(60, 60, 60, " ");
        swapBar += `] ${rgbFg(220, 220, 220, "1.92G/16.0G │ PSI cpu:0.4% mem:0.0% io:1.2%")}`;
        frame += `${rgbFg(100, 220, 255, "Swp  ")}${swapBar}\x1b[K\r\n`;

        // Row 9: Split-Pane Table Header (Left: Process Table, Right: Active Sockets & I/O Inspector)
        const activeSort = sortColumns[frameIdx % sortColumns.length];
        const treeMode = (frameIdx >= 12 && frameIdx <= 18) || frameIdx >= 21;
        const leftHeader = ` PID  USER     PRI NI  VIRT   RES  S  CPU%  MEM%   TIME+  Command [${activeSort}]`.padEnd(64, " ").slice(0, 64);
        const rightHeader = " │ SOCKETS & OPEN FDS (lsof/ss)   ";
        frame += `${rgbBg(40, 90, 60, rgbFg(255, 255, 255, ANSI.bold + leftHeader))}${rgbBg(35, 65, 95, rgbFg(220, 240, 255, ANSI.bold + rightHeader))}\x1b[K\r\n`;

        // Rows 10-25: 16-row Split Pane (Left: Process List, Right: Live Socket/FD Inspector)
        for (let pIdx = 0; pIdx < 16; pIdx++) {
            const proc = procList[(pIdx + frameIdx) % procList.length];
            let curCpu = proc.cpu;
            if (proc.s === "R")
                curCpu = Math.max(0.2, (proc.cpu + Math.sin(frameIdx * 0.7 + pIdx) * 6.5).toFixed(1));

            const isSelected = pIdx === frameIdx % 16;
            const rowBg = isSelected ? "\x1b[48;2;45;75;105m" : "";
            const pidStr = rgbFg(255, 180, 100, proc.pid.toString().padStart(5, " "));
            const userStr = rgbFg(180, 220, 255, proc.user.slice(0, 7).padEnd(7, " "));
            const priStr = proc.pri.toString().padStart(3, " ");
            const niStr = proc.ni.toString().padStart(3, " ");
            const virtStr = proc.virt.padStart(6, " ");
            const resStr = rgbFg(150, 255, 150, proc.res.padStart(5, " "));
            const sStr = proc.s === "R" ? rgbFg(80, 250, 120, proc.s) : proc.s;
            const cpuStr = proc.s === "R" ? rgbFg(255, 100, 100, curCpu.toString().padStart(5, " ")) : curCpu.toString().padStart(5, " ");
            const memStr = proc.mem.toString().padStart(4, " ");
            const prefix = treeMode ? proc.tree : "";
            const cmdRaw = (prefix + proc.cmd).slice(0, 18).padEnd(18, " ");

            const sock = sockets[(pIdx + frameIdx) % sockets.length].padEnd(32, " ").slice(0, 32);
            const sockColor = sock.startsWith("TCP") ? 117 : sock.startsWith("UDP") ? 221 : 151;

            frame += `${rowBg}${pidStr} ${userStr} ${priStr}${niStr} ${virtStr} ${resStr} ${sStr} ${cpuStr} ${memStr} ${cmdRaw}${ANSI.reset}${rgbFg(90, 110, 130, "│")}${c256Fg(sockColor, sock)}\x1b[K\r\n`;
        }

        // Frames 15..29: Exercise DECSTBM scroll region (\x1b[10;25r) + DeleteLine (\x1b[M) / InsertLine (\x1b[L) / Index (\x1bD) / ReverseIndex (\x1bM)
        if (frameIdx >= 15 && frameIdx <= 29) {
            frame += "\x1b7\x1b[10;25r";
            if (frameIdx % 2 === 0) {
                frame += "\x1b[10;1H\x1b[1M\x1b[25;1H";
                frame += `${rgbFg(255, 180, 100, " 9410")} ${rgbFg(180, 220, 255, "develop")}  20  0  1840M  220M ${rgbFg(80, 250, 120, "R")} ${rgbFg(255, 100, 100, " 21.4")}  1.4 worker-pool-${frameIdx}     ${rgbFg(90, 110, 130, "│")}${c256Fg(117, "TCP 127.0.0.1:8000->54199 ESTAB ")}\x1b[K`;
            } else {
                frame += "\x1b[10;1H\x1bM\x1b[10;1H";
                frame += `${rgbFg(255, 180, 100, " 9522")} ${rgbFg(180, 220, 255, "develop")}  20  0  3120M  490M ${rgbFg(80, 250, 120, "R")} ${rgbFg(255, 100, 100, " 52.8")}  3.1 ninja -j16 #${frameIdx}    ${rgbFg(90, 110, 130, "│")}${c256Fg(151, "UNIX /tmp/ninja-jobserver-sock  ")}\x1b[K`;
            }
            frame += "\x1b[r\x1b8";
        }

        // Frames 30..44: Draw floating F6 Sort-By & F4 Filter Modal Dialog using direct cursor positioning (\x1b[row;colH) & EraseChars (\x1b[X)
        if (frameIdx >= 30 && frameIdx <= 44) {
            const modalCol = 36;
            const activeIdx = (frameIdx - 30) % 4;
            const modalRows = [
                "┌──────── Sort By (F6) & Filter (F4) ────────┐",
                `│ ${activeIdx === 0 ? ANSI.inverse : ""} ▸ PERCENT_CPU      (descending, threads) ${ANSI.reset} │`,
                `│ ${activeIdx === 1 ? ANSI.inverse : ""}   M_RESIDENT       (RSS high-water mark) ${ANSI.reset} │`,
                `│ ${activeIdx === 2 ? ANSI.inverse : ""}   TIME+            (cumulative CPU time) ${ANSI.reset} │`,
                `│ ${activeIdx === 3 ? ANSI.inverse : ""}   IO_RATE          (blkio R+W bytes/sec) ${ANSI.reset} │`,
                "├────────────────────────────────────────────┤",
                `│ Filter: ${rgbFg(255, 230, 120, `/renderer|clang|node|vite#${frameIdx}`)}█       │`,
                "└────────────────────────────────────────────┘",
            ];
            frame += "\x1b7";
            for (let m = 0; m < modalRows.length; m++)
                frame += `\x1b[${11 + m};${modalCol}H\x1b[46X${rgbBg(28, 38, 54, rgbFg(220, 240, 255, modalRows[m]))}`;

            frame += "\x1b8";
        }

        // Frames 45..79: Draw F2 Setup / CPU Affinity (taskset) & I/O Priority (ionice) Inspector Overlay
        if (frameIdx >= 45 && frameIdx <= 79) {
            const setupCol = 28;
            const maskHex = ((0xffff ^ (1 << (frameIdx % 8))) >>> 0).toString(16).padStart(4, "0");
            const setupRows = [
                "╔══════════ Setup (F2) · CPU Affinity & I/O Priority ══════════╗",
                `║ PID 1420Affinity Mask: 0x${maskHex} [C0-C15 active]  ionice: BE/2 ║`,
                "║ Meters: [Left: CPU1-8, Mem, Swp] [Right: CPU9-16, Net, Disk] ║",
                "║ Display: [x] Tree View  [x] Shadow Other Users  [x] Threads  ║",
                `║ Theme:   TrueColor Dark (24-bit RGB + 256-Palette SGR) #${frameIdx}   ║`,
                "╚══════════════════════════════════════════════════════════════╝",
            ];
            frame += "\x1b7";
            for (let s = 0; s < setupRows.length; s++)
                frame += `\x1b[${13 + s};${setupCol}H\x1b[64X${rgbBg(45, 32, 62, rgbFg(240, 225, 255, setupRows[s]))}`;

            frame += "\x1b8";
        }

        // Rows 26-27: tmux status ribbon + htop function key bar
        frame += `\x1b[26;1H${rgbBg(30, 75, 50, rgbFg(230, 255, 230, ` [bench-0] 0:htop* 1:ninja-build 2:perf-stat │ Frame ${frameIdx + 1}/30 │ AltBuf:ON `))}\x1b[K\r\n`;
        frame += `${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F1"))}Help ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F2"))}Setup ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F3"))}Search ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F4"))}Filter ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F5"))}Tree ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F6"))}SortBy ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F7"))}Nice- ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F8"))}Nice+ ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F9"))}Kill ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F10"))}Quit\x1b[K`;

        frames.push(frame);
    }
    return frames;
}

// 4. Git Session: Realistic git status, ANSI branch graph log, and syntax-colored unified diff
export function generateGitSession() {
    const chunks = [];
    chunks.push(
        `${ANSI.bold}${ANSI.yellow}## main...origin/main [ahead 3]${ANSI.reset}\r\n`
        + ` ${ANSI.red}M${ANSI.reset} suites-experimental/terminal-xterm/app.js\r\n`
        + ` ${ANSI.red}M${ANSI.reset} suites-experimental/terminal-xterm/sessions.js\r\n`
        + ` ${ANSI.green}A${ANSI.reset} suites-experimental/terminal-xterm/fonts/DejaVuSansMono-Regular.woff2\r\n\r\n`
        + `${ANSI.bold}${ANSI.cyan}==> git log --graph --oneline --decorate -n 20${ANSI.reset}\r\n`
    );

    const commits = [
        { hash: "a4f91c2", branch: " (HEAD -> main)", msg: "[terminal-xterm] Add problem matcher decorations and overview ruler" },
        { hash: "7b20e8d", branch: "", msg: "[terminal-xterm] Register custom workspace file & stack-trace link provider" },
        { hash: "c9134a0", branch: "", msg: "[terminal-xterm] Use alternate buffer and DECSTBM scroll regions in ncurses" },
        { hash: "1e88b45", branch: " (origin/main)", msg: "[terminal-xterm] Bundle vendor-neutral DejaVu Sans Mono WOFF2 fonts" },
        { hash: "9d04f11", branch: "", msg: "[terminal-xterm] Pin fixed cell dimensions for cross-browser parity" },
        { hash: "5c62a39", branch: " (tag: v3.1-rc1)", msg: "[runner] Stabilize async timer drain across experimental suites" },
    ];

    for (let i = 0; i < 20; i++) {
        const c = commits[i % commits.length];
        const rev = (0xa4f9100 + i * 4099).toString(16).slice(0, 7);
        const graph = i % 4 === 1 ? `${ANSI.red}*${ANSI.reset} ${ANSI.magenta}|\\${ANSI.reset}` : i % 4 === 2 ? `${ANSI.magenta}|${ANSI.reset} ${ANSI.green}*${ANSI.reset} ` : i % 4 === 3 ? `${ANSI.magenta}|/${ANSI.reset}  ` : `${ANSI.yellow}*${ANSI.reset}   `;
        chunks.push(`${graph} ${ANSI.yellow}${rev}${ANSI.reset}${ANSI.bold}${ANSI.cyan}${i === 0 ? c.branch : ""}${ANSI.reset} ${c.msg} (#${540 + i})\r\n`);
    }

    chunks.push(
        `\r\n${ANSI.bold}${ANSI.cyan}==> git diff --stat origin/main${ANSI.reset}\r\n`
        + ` suites-experimental/terminal-xterm/app.js      | 184 ${ANSI.green}++++++++++++++++++++${ANSI.red}-----${ANSI.reset}\r\n`
        + ` suites-experimental/terminal-xterm/sessions.js | 142 ${ANSI.green}+++++++++++++++${ANSI.red}----${ANSI.reset}\r\n`
        + " 2 files changed, 268 insertions(+), 58 deletions(-)\r\n\r\n"
        + `${ANSI.bold}diff --git a/suites-experimental/terminal-xterm/app.js b/suites-experimental/terminal-xterm/app.js${ANSI.reset}\r\n`
        + `${ANSI.cyan}@@ -196,8 +196,10 @@ function initTerminalForTab(tabId) {${ANSI.reset}\r\n`
        + "         scrollback: 5000,\r\n"
        + "         cursorBlink: false,\r\n"
        + "         allowTransparency: false,\r\n"
        + `${ANSI.red}-        overviewRuler: { width: FIXED_SCROLLBAR_WIDTH },${ANSI.reset}\r\n`
        + `${ANSI.green}+        allowProposedApi: true,${ANSI.reset}\r\n`
        + `${ANSI.green}+        overviewRulerWidth: FIXED_SCROLLBAR_WIDTH,${ANSI.reset}\r\n`
        + "     });\r\n"
    );

    return chunks;
}
