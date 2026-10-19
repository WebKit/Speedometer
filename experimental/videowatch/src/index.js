/**
 * @fileoverview Entry point for the VideoWatch-SPA Speedometer workload.
 * Registers Polymer Kevlar shell and Lit/Signals CoW custom elements,
 * mounts `<ytd-app>`, and binds `#run-playlist-session` for the benchmark runner.
 */
import { registerPolymerShell } from "./polymer-shell.js";

registerPolymerShell();

function initWatchApp() {
    const app = document.getElementById("app-root");
    const runBtn = document.getElementById("run-playlist-session");
    if (runBtn && app) {
        runBtn.addEventListener("click", () => {
            app.handleRunWatchSession();
        });
    }
    if (!document.getElementById("watch-app-ready")) {
        const marker = document.createElement("div");
        marker.id = "watch-app-ready";
        marker.style.display = "none";
        document.body.appendChild(marker);
    }
}

if (document.readyState === "loading")
    window.addEventListener("DOMContentLoaded", initWatchApp, { once: true });
else
    initWatchApp();
