// Component and event interception for interaction attribution. The JSX runtime routes
// every element through here: function components are swapped (once) for a wrapper that
// keeps a stack of the components rendering, and every event handler on a host element is
// wrapped so the interaction it starts is attributed to the component that rendered it.

import { memo } from "react";
import { guard } from "./guard.js";
import { log } from "./logger.js";

const MEMO_TYPE = Symbol.for("react.memo");
const wrappedComponents = new WeakMap();
const wrappedMemos = new WeakMap();
const renderStack = [];
const renderCounts = new Map();
let totalRenders = 0;

// Events that start an interaction get a flowlet; the rest are only guarded.
const FLOWLET_EVENTS = new Set(["onClick", "onKeyDown", "onInput", "onChange", "onFocus", "onMouseDown", "onPointerDown", "onSubmit"]);

let flowletId = 0;
const activeFlowlets = [];

function componentName(Component) {
    return Component.displayName || Component.name || "Anonymous";
}

function wrapComponent(Component) {
    let wrapped = wrappedComponents.get(Component);
    if (wrapped)
        return wrapped;
    const name = componentName(Component);
    wrapped = function InterceptedComponent(props) {
        renderStack.push(name);
        renderCounts.set(name, (renderCounts.get(name) ?? 0) + 1);
        totalRenders++;
        try {
            return Component(props);
        } finally {
            renderStack.pop();
        }
    };
    wrapped.displayName = name;
    wrappedComponents.set(Component, wrapped);
    return wrapped;
}

function wrapMemo(type) {
    let wrapped = wrappedMemos.get(type);
    if (!wrapped) {
        wrapped = typeof type.type === "function" && !type.type.prototype?.isReactComponent ? memo(wrapComponent(type.type), type.compare) : type;
        wrappedMemos.set(type, wrapped);
    }
    return wrapped;
}

export function interceptType(type) {
    if (typeof type === "function")
        return type.prototype && type.prototype.isReactComponent ? type : wrapComponent(type);
    if (type !== null && typeof type === "object" && type.$$typeof === MEMO_TYPE)
        return wrapMemo(type);
    return type;
}

export function currentFlowlet() {
    return activeFlowlets.length ? activeFlowlets[activeFlowlets.length - 1] : null;
}

function wrapHandler(handler, propName, owner, ownerPath) {
    const flowlet = FLOWLET_EVENTS.has(propName);
    return function interceptedHandler(event) {
        if (!flowlet)
            return guard(`${owner}.${propName}`, handler, event);
        const entry = { id: ++flowletId, owner, path: ownerPath, event: propName.slice(2).toLowerCase(), start: performance.now() };
        activeFlowlets.push(entry);
        try {
            return guard(`${owner}.${propName}`, handler, event);
        } finally {
            activeFlowlets.pop();
            log("ui_event", { flowlet: entry.id, owner, path: ownerPath, event: entry.event, duration: Math.round((performance.now() - entry.start) * 100) / 100 });
        }
    };
}

export function interceptProps(type, props) {
    if (typeof type !== "string" || props === null)
        return props;
    let owner = null;
    let ownerPath = null;
    for (const key in props) {
        if (key.charCodeAt(0) !== 111 || key.charCodeAt(1) !== 110 || typeof props[key] !== "function")
            continue;
        if (owner === null) {
            owner = renderStack.length ? renderStack[renderStack.length - 1] : "root";
            ownerPath = renderStack.slice(-4).join(">");
        }
        props[key] = wrapHandler(props[key], key, owner, ownerPath);
    }
    return props;
}

export function renderStats() {
    return { total: totalRenders, components: renderCounts.size };
}

export function topRendered(count) {
    return Array.from(renderCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([name, renders]) => `${name}:${renders}`);
}
