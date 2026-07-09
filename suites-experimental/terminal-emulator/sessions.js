// Generate deterministic sessions for terminal emulator benchmarking

const ANSI = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
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
};

// 1. Build Log Session: Generates ~150 chunks (~1500+ lines) of verbose compiler & build logs
export function generateBuildLogSession() {
    const chunks = [];
    const components = ["WebCore", "JavaScriptCore", "WebKit2", "WTF", "PAL", "Angle", "Skia", "V8", "Blink", "Platform"];
    const files = ["Node.cpp", "Element.cpp", "Document.cpp", "JSLexer.cpp", "Parser.cpp", "RenderBox.cpp", "CSSParser.cpp", "EventLoop.cpp", "FrameView.cpp", "DOMWindow.cpp"];

    chunks.push(`${ANSI.bold}${ANSI.cyan}==> Starting build suite configuration (Speedometer Terminal Emulator Workload)...${ANSI.reset}\r\n`);
    chunks.push(`${ANSI.green}✔ Pre-build checks passed. Environment: Linux x86_64, Node v22.0.0, Clang 18.0.0${ANSI.reset}\r\n`);

    let totalProgress = 0;
    for (let i = 1; i <= 150; i++) {
        let chunk = "";
        const comp = components[i % components.length];
        const file = files[i % files.length];
        totalProgress = Math.min(100, Math.floor((i / 150) * 100));

        chunk += `${ANSI.dim}[${new Date(1720448000000 + i * 500).toISOString()}]${ANSI.reset} [${ANSI.bold}${totalProgress.toString().padStart(3, " ")}%${ANSI.reset}] Building CXX object Source/${comp}/CMakeFiles/${comp}.dir/${file}.o\r\n`;

        if (i % 7 === 0) {
            chunk += `${ANSI.bold}${ANSI.yellow}warning:${ANSI.reset} unused parameter 'execState' [-Wunused-parameter]\r\n`;
            chunk += `  142 | JSValue ${comp}::evaluate(JSGlobalObject* ${ANSI.bold}${ANSI.yellow}execState${ANSI.reset}, const SourceCode& source)\r\n`;
            chunk += `      |                                         ${ANSI.yellow}^~~~~~~~~~${ANSI.reset}\r\n`;
        }

        if (i % 19 === 0) {
            chunk += `${ANSI.bold}${ANSI.cyan}info:${ANSI.reset} vectorization enabled for loop in ${file} at line ${100 + i}\r\n`;
            chunk += `  ${ANSI.dim}remark: vectorized 4 instructions in unrolled loop (-Rpass=loop-vectorize)${ANSI.reset}\r\n`;
        }

        if (i % 31 === 0) {
            chunk += `${ANSI.bold}${ANSI.magenta}[LINK]${ANSI.reset} Linking shared library lib${comp}.so...\r\n`;
            chunk += `  ${ANSI.green}✔ Created lib${comp}.so (48.2 MB)${ANSI.reset}\r\n`;
        }

        if (i % 45 === 0) {
            chunk += `${ANSI.bold}${ANSI.red}error (ignored):${ANSI.reset} temporary lock contention in distributed cache for ${file}\r\n`;
            chunk += "  Retrying build step 2 of 3...\r\n";
            chunk += `  ${ANSI.green}✔ Retry successful!${ANSI.reset}\r\n`;
        }

        chunks.push(chunk);
    }

    chunks.push(`${ANSI.bold}${ANSI.green}==> Build completed successfully in 42.8s! Total artifacts: 1,420 targets.${ANSI.reset}\r\n`);
    return chunks;
}

// 2. Links Session: Dumps logs saturated with URLs, file paths, and stack traces
export function generateLinksSession() {
    const chunks = [];
    chunks.push(`${ANSI.bold}${ANSI.blue}=== Test Execution Summary & Artifact Links ===${ANSI.reset}\r\n`);

    for (let i = 1; i <= 80; i++) {
        let chunk = "";
        chunk += `[Test Worker #${(i % 8) + 1}] RUNNING: https://github.com/WebKit/Speedometer/issues/${1000 + i}\r\n`;
        chunk += "  ↳ Reference spec: https://html.spec.whatwg.org/multipage/webappapis.html#event-loops\r\n";
        chunk += `  ↳ Local fixture: file:///usr/local/google/home/cbruni/Documents/Speedometer/suites/editors/codemirror.html:${10 + i}:${(i % 20) + 1}\r\n`;
        chunk += `  ↳ Stack trace: at Object.runTest (src/speedometer-utils/benchmark.mjs:${50 + i}:12)\r\n`;
        chunk += "  ↳ Documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext\r\n";
        chunk += `  ↳ NPM Registry: https://registry.npmjs.org/@xterm/xterm/-/xterm-5.5.${i % 10}.tgz\r\n`;
        chunks.push(chunk);
    }
    return chunks;
}

// Helper to generate RGB TrueColor ANSI escape sequences
function rgbFg(r, g, b, text) {
    return `\x1b[38;2;${r};${g};${b}m${text}${ANSI.reset}`;
}
function rgbBg(r, g, b, text) {
    return `\x1b[48;2;${r};${g};${b}m${text}${ANSI.reset}`;
}

// 3. ncurses Session: Simulates 4 dynamic frames of an htop/top system monitor
export function generateNcursesSession() {
    const frames = [];
    const procList = [
        { pid: 1420, user: "cbruni", pri: 20, ni: 0, virt: "4820M", res: "312M", shr: "84M", s: "R", cpu: 45.2, mem: 1.9, time: "4:12.08", cmd: "/usr/bin/google-chrome-stable --type=renderer" },
        { pid: 1842, user: "cbruni", pri: 20, ni: 0, virt: "8920M", res: "1.2G", shr: "120M", s: "S", cpu: 32.8, mem: 7.4, time: "18:45.12", cmd: "node tests/server.mjs --port 8000" },
        { pid: 2901, user: "cbruni", pri: 20, ni: 0, virt: "1420M", res: "180M", shr: "64M", s: "R", cpu: 28.4, mem: 1.1, time: "1:02.45", cmd: "vite build --watch" },
        { pid: 3105, user: "cbruni", pri: 20, ni: 0, virt: "980M", res: "92M", shr: "45M", s: "S", cpu: 14.1, mem: 0.6, time: "0:45.90", cmd: "python3 sidecar.py --daemon" },
        { pid: 402, user: "root", pri: 20, ni: 0, virt: "310M", res: "24M", shr: "18M", s: "S", cpu: 5.0, mem: 0.2, time: "12:10.01", cmd: "/lib/systemd/systemd-journald" },
        { pid: 881, user: "root", pri: -20, ni: -20, virt: "0", res: "0", shr: "0", s: "I", cpu: 1.2, mem: 0.0, time: "0:04.12", cmd: "[kworker/u16:2-events_unbound]" },
        { pid: 5120, user: "cbruni", pri: 20, ni: 0, virt: "2100M", res: "410M", shr: "95M", s: "S", cpu: 0.8, mem: 2.5, time: "2:14.50", cmd: "code /usr/local/google/home/cbruni/Documents/Speedometer" },
        { pid: 6012, user: "cbruni", pri: 20, ni: 0, virt: "650M", res: "45M", shr: "28M", s: "S", cpu: 0.4, mem: 0.3, time: "0:12.80", cmd: "bash -i" },
        { pid: 7100, user: "cbruni", pri: 20, ni: 0, virt: "520M", res: "38M", shr: "22M", s: "S", cpu: 0.1, mem: 0.2, time: "0:05.10", cmd: "git status -uall" },
        { pid: 8192, user: "cbruni", pri: 20, ni: 0, virt: "120M", res: "8M", shr: "6M", s: "R", cpu: 0.0, mem: 0.1, time: "0:00.05", cmd: "ps aux --sort=-pcpu" },
    ];

    for (let frameIdx = 0; frameIdx < 4; frameIdx++) {
        let frame = frameIdx === 0 ? ANSI.clearScreen + ANSI.hideCursor : ANSI.cursorHome;

        // Header / Uptime / Load Avg
        const load1 = (2.45 + Math.sin(frameIdx / 5) * 0.5).toFixed(2);
        const load5 = (2.1 + Math.cos(frameIdx / 7) * 0.3).toFixed(2);
        const load15 = (1.85 + Math.sin(frameIdx / 10) * 0.2).toFixed(2);
        frame += `${rgbFg(100, 220, 255, "htop 3.3.0")} - ${rgbFg(220, 220, 220, "16:15:27 up 14 days, 6:42, 4 users")}, load average: ${rgbFg(255, 100, 100, load1)}, ${rgbFg(255, 180, 100, load5)}, ${rgbFg(180, 255, 100, load15)}\r\n`;
        frame += `Tasks: ${ANSI.bold}142${ANSI.reset}, ${ANSI.bold}430${ANSI.reset} thr; ${rgbFg(100, 255, 100, "3 running")}, 427 sleeping, 0 stopped, 0 zombie\r\n\r\n`;

        // Render 8 CPU Cores in 2 columns (4 rows)
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 2; col++) {
                const coreNum = row + col * 4 + 1;
                // Vary CPU percentage per core per frame
                const cpuPct = Math.min(100, Math.max(2, Math.floor(40 + Math.sin(frameIdx * 0.3 + coreNum) * 35 + (coreNum % 3) * 10)));
                const barWidth = 25;
                const filledWidth = Math.floor((cpuPct / 100) * barWidth);

                let barStr = "[";
                for (let b = 0; b < barWidth; b++) {
                    if (b < filledWidth) {
                        if (b < 12)
                            barStr += rgbFg(80, 250, 120, "|"); // green
                        else if (b < 20)
                            barStr += rgbFg(255, 200, 50, "|"); // yellow
                        else
                            barStr += rgbFg(250, 70, 70, "|"); // red
                    } else {
                        barStr += rgbFg(60, 60, 60, " ");
                    }
                }
                barStr += `] ${rgbFg(220, 220, 220, `${cpuPct.toString().padStart(5, " ")}%`)}`;

                const label = rgbFg(100, 220, 255, `CPU${coreNum}`.padEnd(5, " "));
                frame += `${label}${barStr}   `;
            }
            frame += "\r\n";
        }

        // Memory & Swap bars
        const memPct = 42.5 + Math.sin(frameIdx * 0.1) * 2;
        const swapPct = 12.0;
        const memBarWidth = 63;
        const memFilled = Math.floor((memPct / 100) * memBarWidth);
        let memBar = "[";
        for (let b = 0; b < memBarWidth; b++)
            memBar += b < memFilled ? rgbFg(80, 200, 255, "|") : rgbFg(60, 60, 60, " ");

        memBar += `] ${rgbFg(220, 220, 220, "13.6G/32.0G")}`;
        frame += `${rgbFg(100, 220, 255, "Mem  ")}${memBar}\r\n`;

        let swapBar = "[";
        const swapFilled = Math.floor((swapPct / 100) * memBarWidth);
        for (let b = 0; b < memBarWidth; b++)
            swapBar += b < swapFilled ? rgbFg(255, 100, 200, "|") : rgbFg(60, 60, 60, " ");

        swapBar += `] ${rgbFg(220, 220, 220, "1.92G/16.0G")}`;
        frame += `${rgbFg(100, 220, 255, "Swp  ")}${swapBar}\r\n\r\n`;

        // Table Header
        const headerText = "  PID USER      PRI  NI  VIRT   RES   SHR S  CPU%  MEM%   TIME+  Command".padEnd(80, " ");
        frame += `${rgbBg(40, 90, 60, rgbFg(255, 255, 255, ANSI.bold + headerText))}\r\n`;

        // Process List rows
        for (let pIdx = 0; pIdx < procList.length; pIdx++) {
            const proc = procList[pIdx];
            // Mutate CPU slightly
            let curCpu = proc.cpu;
            if (proc.s === "R")
                curCpu = Math.max(0.1, (proc.cpu + Math.sin(frameIdx + pIdx) * 5).toFixed(1));

            const rowBg = pIdx === frameIdx % procList.length ? "\x1b[48;2;60;80;100m" : "";
            const pidStr = rgbFg(255, 180, 100, proc.pid.toString().padStart(5, " "));
            const userStr = rgbFg(180, 220, 255, proc.user.padEnd(8, " "));
            const priStr = proc.pri.toString().padStart(4, " ");
            const niStr = proc.ni.toString().padStart(3, " ");
            const virtStr = proc.virt.padStart(6, " ");
            const resStr = rgbFg(150, 255, 150, proc.res.padStart(5, " "));
            const shrStr = proc.shr.padStart(5, " ");
            const sStr = proc.s === "R" ? rgbFg(80, 250, 120, proc.s) : proc.s;
            const cpuStr = proc.s === "R" ? rgbFg(255, 100, 100, curCpu.toString().padStart(5, " ")) : curCpu.toString().padStart(5, " ");
            const memStr = proc.mem.toString().padStart(5, " ");
            const timeStr = proc.time.padStart(9, " ");
            const cmdStr = proc.cmd.slice(0, 32).padEnd(32, " ");

            frame += `${rowBg}${pidStr} ${userStr} ${priStr} ${niStr} ${virtStr} ${resStr} ${shrStr} ${sStr} ${cpuStr} ${memStr} ${timeStr}  ${cmdStr}${ANSI.reset}\r\n`;
        }

        // Footer navigation help
        frame += `\r\n${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F1"))}Help  ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F2"))}Setup  ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F3"))}Search  ${rgbBg(
            50,
            50,
            50,
            rgbFg(255, 255, 255, "F4")
        )}Filter  ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F5"))}Tree  ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F6"))}SortBy  ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F7"))}Nice -  ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F8"))}Nice +  ${rgbBg(
            50,
            50,
            50,
            rgbFg(255, 255, 255, "F9")
        )}Kill  ${rgbBg(50, 50, 50, rgbFg(255, 255, 255, "F10"))}Quit`;

        frames.push(frame);
    }
    return frames;
}
