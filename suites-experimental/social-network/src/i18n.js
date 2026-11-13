// UI strings are ICU-style messages, looked up in the locale's table and formatted at
// render time: `{name}` substitutes, `{count, number}` formats, `{count, plural, one {…}
// other {…}}` and `{kind, select, …}` pick a branch, and `#` inside a plural branch is the
// formatted number. Parsed messages are cached; formatting runs on every call.

import { hashString } from "./data/rng.js";

const LOCALE = "en-US";
const pluralRules = new Intl.PluralRules(LOCALE);
const ordinalRules = new Intl.PluralRules(LOCALE, { type: "ordinal" });
const numberFormats = {
    number: new Intl.NumberFormat(LOCALE),
    compact: new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 }),
    percent: new Intl.NumberFormat(LOCALE, { style: "percent" }),
};
const listFormat = new Intl.ListFormat(LOCALE, { style: "long", type: "conjunction" });

// The en-US table is the source language, so it is empty; other locales would map a
// message's hash to its translation.
const TRANSLATIONS = new Map();
const parsed = new Map();

function parseBranches(source, state) {
    const branches = {};
    for (;;) {
        while (/\s/.test(source[state.index]))
            state.index++;
        if (source[state.index] === "}")
            return branches;
        let key = "";
        while (source[state.index] !== "{" && !/\s/.test(source[state.index]))
            key += source[state.index++];
        while (source[state.index] !== "{")
            state.index++;
        state.index++;
        branches[key] = parseNodes(source, state, true);
        state.index++;
    }
}

function parseNodes(source, state, inBranch) {
    const nodes = [];
    let text = "";
    while (state.index < source.length) {
        const char = source[state.index];
        if (char === "}" && inBranch)
            break;
        if (char === "#" && inBranch) {
            if (text)
                nodes.push(text);
            text = "";
            nodes.push({ type: "pound" });
            state.index++;
            continue;
        }
        if (char !== "{") {
            text += char;
            state.index++;
            continue;
        }
        if (text)
            nodes.push(text);
        text = "";
        state.index++;
        let head = "";
        while (source[state.index] !== "}" && source[state.index] !== ",")
            head += source[state.index++];
        const name = head.trim();
        if (source[state.index] === "}") {
            state.index++;
            nodes.push({ type: "arg", name });
            continue;
        }
        state.index++;
        let format = "";
        while (source[state.index] !== "}" && source[state.index] !== ",")
            format += source[state.index++];
        format = format.trim();
        if (source[state.index] === "}") {
            state.index++;
            nodes.push({ type: "number", name, style: format === "number" ? "number" : format });
            continue;
        }
        state.index++;
        nodes.push({ type: format, name, branches: parseBranches(source, state) });
        state.index++;
    }
    if (text)
        nodes.push(text);
    return nodes;
}

function compile(message) {
    let nodes = parsed.get(message);
    if (!nodes) {
        const key = hashString(message).toString(36);
        nodes = parseNodes(TRANSLATIONS.get(key) ?? message, { index: 0 }, false);
        parsed.set(message, nodes);
    }
    return nodes;
}

function formatNodes(nodes, params, pound) {
    let out = "";
    for (const node of nodes) {
        if (typeof node === "string") {
            out += node;
            continue;
        }
        switch (node.type) {
            case "pound":
                out += pound;
                break;
            case "arg": {
                const value = params[node.name];
                out += Array.isArray(value) ? listFormat.format(value) : String(value ?? "");
                break;
            }
            case "number":
                out += numberFormats[node.style].format(params[node.name]);
                break;
            case "plural":
            case "selectordinal": {
                const value = params[node.name];
                const rules = node.type === "plural" ? pluralRules : ordinalRules;
                const branch = node.branches[`=${value}`] ?? node.branches[rules.select(value)] ?? node.branches.other;
                out += formatNodes(branch, params, numberFormats.compact.format(value));
                break;
            }
            case "select": {
                const branch = node.branches[params[node.name]] ?? node.branches.other;
                out += formatNodes(branch, params, pound);
                break;
            }
        }
    }
    return out;
}

export function t(message, params = {}) {
    return formatNodes(compile(message), params, "");
}
