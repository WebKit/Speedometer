// Document-level auto-instrumentation: clicks, focus, typing activity and scroll depth
// are captured without any feature code having to call the logger.

import { guard } from "./guard.js";
import { flush, log } from "./logger.js";

const MAX_PATH_DEPTH = 8;

function elementPath(element) {
    const parts = [];
    let node = element;
    while (node && node.nodeType === 1 && parts.length < MAX_PATH_DEPTH) {
        let part = node.localName;
        if (node.id)
            part += `#${node.id}`;
        else if (node.classList.length)
            part += `.${node.classList[0]}`;
        const parent = node.parentElement;
        if (parent) {
            let index = 1;
            for (let sibling = node.previousElementSibling; sibling; sibling = sibling.previousElementSibling)
                index++;
            part += `:${index}`;
        }
        parts.unshift(part);
        node = parent;
    }
    return parts.join(">");
}

function loggingTarget(element) {
    const target = element.closest("[data-log]");
    if (!target)
        return null;
    const scopes = [];
    for (let scope = target.parentElement && target.parentElement.closest("[data-log-scope]"); scope; scope = scope.parentElement && scope.parentElement.closest("[data-log-scope]"))
        scopes.unshift(scope.getAttribute("data-log-scope"));
    return { target, name: target.getAttribute("data-log"), scopes };
}

function onClick(event) {
    const found = loggingTarget(event.target);
    const element = found ? found.target : event.target;
    log("click", {
        target: found ? found.name : "untagged",
        scopes: found ? found.scopes.join("/") : "",
        path: elementPath(element),
        label: (element.getAttribute("aria-label") || element.textContent || "").trim().slice(0, 48),
        role: element.getAttribute("role") || element.localName,
    });
}

const keyCounts = new WeakMap();

function onKeyDown(event) {
    const field = event.target;
    if (!(field instanceof HTMLElement))
        return;
    const count = (keyCounts.get(field) ?? 0) + 1;
    keyCounts.set(field, count);
    // Activity only: the content of what is typed never leaves the client.
    log("key_activity", { field: field.getAttribute("data-log") || field.localName, keys: count, modifier: event.ctrlKey || event.metaKey || event.altKey });
}

function onFocusIn(event) {
    const field = event.target;
    if (field.matches && field.matches("input, textarea, [contenteditable]"))
        log("field_focus", { field: field.getAttribute("data-log") || field.getAttribute("aria-label") || field.localName });
}

const depthReached = new WeakMap();

function onScroll(event) {
    const scroller = event.target.nodeType === 1 ? event.target : document.scrollingElement;
    if (!scroller)
        return;
    const range = scroller.scrollHeight - scroller.clientHeight;
    if (range <= 0)
        return;
    const depth = Math.min(100, Math.round((scroller.scrollTop / range) * 100));
    const bucket = Math.floor(depth / 25) * 25;
    const reached = depthReached.get(scroller) ?? -1;
    if (bucket > reached) {
        depthReached.set(scroller, bucket);
        log("scroll_milestone", { scroller: scroller.id || scroller.className.split(" ")[0], depth: bucket });
    }
    log("scroll_depth", { depth });
}

export function installAutotrack(root) {
    root.addEventListener("click", (event) => guard("autotrack.click", onClick, event), true);
    root.addEventListener("keydown", (event) => guard("autotrack.key", onKeyDown, event), true);
    root.addEventListener("focusin", (event) => guard("autotrack.focus", onFocusIn, event), true);
    root.addEventListener("scroll", (event) => guard("autotrack.scroll", onScroll, event), { capture: true, passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden")
            flush("hidden");
    });
    window.addEventListener("pagehide", () => flush("pagehide"));
}
