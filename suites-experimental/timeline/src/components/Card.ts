// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

import m from "mithril";
import { TAGS } from "../data/tags.js";
import { t, translateContent } from "../i18n.js";

const Chart = {
    draw(dom, chartData, width) {
        const ctx = dom.getContext("2d");
        if (!ctx)
            return;
        const data = chartData.datasets;
        const max = Math.max(...data);
        const height = dom.height;
        const barWidth = (width - 40) / data.length;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "var(--primary-color)";

        data.forEach((val, idx) => {
            const barHeight = (val / max) * (height - 20);
            const x = 20 + idx * barWidth;
            const y = height - barHeight - 10;
            ctx.fillRect(x, y, barWidth - 5, barHeight);
        });
    },
    oncreate(vnode) {
        const { chartData, width } = vnode.attrs;
        this.draw(vnode.dom, chartData, width);
    },
    onupdate(vnode) {
        const { chartData, width } = vnode.attrs;
        this.draw(vnode.dom, chartData, width);
    },
    view(vnode) {
        const { width } = vnode.attrs;
        return m("canvas", {
            width: width - 40,
            height: 120,
        });
    },
};

const cardRangesMap = new WeakMap<Element, Range[]>();
let sharedSearchHighlight: any = null;

function getSearchHighlight(): any {
    if (typeof CSS === "undefined" || !("highlights" in CSS) || typeof (globalThis as any).Highlight === "undefined")
        return null;

    const highlights = (CSS as any).highlights;
    if (!sharedSearchHighlight)
        sharedSearchHighlight = new (globalThis as any).Highlight();

    if (!highlights.has("search-results"))
        highlights.set("search-results", sharedSearchHighlight);

    return sharedSearchHighlight;
}

function clearCardSearchHighlights(dom: Element | null | undefined) {
    if (!dom)
        return;
    const prevRanges = cardRangesMap.get(dom);
    if (prevRanges) {
        if (sharedSearchHighlight) {
            for (let i = 0; i < prevRanges.length; i++)
                sharedSearchHighlight.delete(prevRanges[i]);
        }

        cardRangesMap.delete(dom);
    }
}

function collectTextMatchRanges(root: Node | null, lowerQuery: string, queryLen: number, outRanges: Range[]) {
    if (!root)
        return;
    if (root.nodeType === 3) {
        const text = root.nodeValue;
        if (!text)
            return;
        const lowerText = text.toLowerCase();
        let startIndex = 0;
        let matchIndex: number;
        while ((matchIndex = lowerText.indexOf(lowerQuery, startIndex)) !== -1) {
            const range = document.createRange();
            range.setStart(root, matchIndex);
            range.setEnd(root, matchIndex + queryLen);
            outRanges.push(range);
            startIndex = matchIndex + queryLen;
        }
        return;
    }
    let child = root.firstChild;
    while (child) {
        collectTextMatchRanges(child, lowerQuery, queryLen, outRanges);
        child = child.nextSibling;
    }
}

function updateCardSearchHighlights(vnode: any) {
    const dom = vnode.dom as Element | null;
    if (!dom || typeof document === "undefined" || !document.createRange)
        return;

    const { card, searchQuery, language } = vnode.attrs;
    const rawQuery = typeof searchQuery === "string" ? searchQuery : "";
    const highlightKey = `${card?.id ?? ""}\0${language ?? ""}\0${rawQuery}`;
    if (vnode.state._lastHighlightKey === highlightKey)
        return;
    vnode.state._lastHighlightKey = highlightKey;

    clearCardSearchHighlights(dom);

    if (!rawQuery)
        return;

    const highlight = getSearchHighlight();
    if (!highlight)
        return;

    const lowerQuery = rawQuery.toLowerCase();
    const queryLen = lowerQuery.length;
    const newRanges: Range[] = [];
    const titleEl = dom.querySelector(".card-title");
    const descEl = dom.querySelector(".card-desc");
    collectTextMatchRanges(titleEl, lowerQuery, queryLen, newRanges);
    collectTextMatchRanges(descEl, lowerQuery, queryLen, newRanges);

    if (newRanges.length > 0) {
        cardRangesMap.set(dom, newRanges);
        for (let i = 0; i < newRanges.length; i++)
            highlight.add(newRanges[i]);
    }
}

function formatInlineStyles(str: string): any[] {
    if (!str)
        return [];

    const regexParts = [
        "`([^`]+)`", // 1. Code
        "\\*\\*([^*]+)\\*\\*", // 2. Bold
        "\\*([^*]+)\\*", // 3. Italic
    ];

    const masterRegex = new RegExp(regexParts.join("|"), "gi");
    let match;
    let lastIndex = 0;
    const result: any[] = [];

    while ((match = masterRegex.exec(str)) !== null) {
        const before = str.substring(lastIndex, match.index);
        if (before)
            result.push(before);

        const [, code, bold, italic] = match;

        if (code !== undefined)
            result.push(m("code", code));
        else if (bold !== undefined)
            result.push(m("strong", formatInlineStyles(bold)));
        else if (italic !== undefined)
            result.push(m("em", formatInlineStyles(italic)));

        lastIndex = masterRegex.lastIndex;
    }

    const after = str.substring(lastIndex);
    if (after)
        result.push(after);

    return result;
}

function parseMarkdown(text: string): any[] {
    if (!text)
        return [];

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let lastIndex = 0;
    const parts: any[] = [];

    while ((match = linkRegex.exec(text)) !== null) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore)
            parts.push(...formatInlineStyles(textBefore));

        const label = match[1];
        const url = match[2];
        parts.push(m("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, formatInlineStyles(label)));
        lastIndex = linkRegex.lastIndex;
    }
    const textAfter = text.substring(lastIndex);
    if (textAfter)
        parts.push(...formatInlineStyles(textAfter));

    return parts;
}

export const Card = {
    oncreate(vnode: any) {
        if (vnode.attrs.onResize)
            vnode.attrs.onResize(vnode.dom.offsetWidth);
        updateCardSearchHighlights(vnode);
        if (vnode.attrs.isActive && vnode.dom) {
            try {
                vnode.dom.focus({ preventScroll: true });
            } catch (e) {
                void e;
            }
        }
    },
    onupdate(vnode: any) {
        if (vnode.attrs.onResize)
            vnode.attrs.onResize(vnode.dom.offsetWidth);
        updateCardSearchHighlights(vnode);
        if (vnode.attrs.isActive && vnode.dom && document.activeElement !== vnode.dom) {
            try {
                vnode.dom.focus({ preventScroll: true });
            } catch (e) {
                void e;
            }
        }
    },
    onremove(vnode: any) {
        clearCardSearchHighlights(vnode.dom);
    },
    view(vnode: any) {
        // IMPORTANT: Live translation of cards relies on calling translateContent() and t() dynamically inside view()
        // during Mithril redraws (e.g. when setLanguage is called or when language attribute changes in main.ts).
        // Do not cache translated strings statically outside view() or remove translateContent() calls, to prevent breaking live translation in future edits.
        const { card, isActive } = vnode.attrs;
        const { id, type, date, title, description, tags, stats, width, links } = card;

        const titleStr = translateContent(title);
        const descriptionStr = translateContent(description);

        const tagClass = tags.includes("milestone") ? "tag-milestone" : tags[0] ? `tag-${tags[0]}` : "";

        return m(
            ".timeline-card",
            {
                class: `card-${type} ${tagClass} ${isActive ? "card-active" : ""}`,
                id: id,
                tabindex: 0,
                style: Object.assign(
                    {
                        width: `${width}px`,
                    },
                    vnode.attrs.style
                ),
            },
            m(".timeline-card-inner", [
                m(".card-header", [m("span.card-date", date), m("h3.card-title", formatInlineStyles(titleStr))]),
                m(
                    ".card-tags",
                    tags.map((tag: string) => {
                        const tagData = (TAGS as any)[tag];
                        const label = tagData ? translateContent(tagData.label) : tag;
                        return m("span.tag", { class: `tag-${tag}` }, label);
                    })
                ),
                m("p.card-desc", parseMarkdown(descriptionStr)),
                stats
                    && m(".card-stats-summary", [
                        stats.transistors && m("div", [m("strong", t("transistors")), ` ${stats.transistors}`]),
                        stats.clockSpeed && m("div", [m("strong", t("clockSpeed")), ` ${stats.clockSpeed}`]),
                        stats.memory && m("div", [m("strong", t("memory")), ` ${stats.memory}`]),
                    ]),
                type === "table"
                    && card.cells
                    && m(
                        "table.stats-table",
                        card.cells.map((row: any[], rIdx: number) =>
                            m(
                                "tr",
                                row.map((cell) => rIdx === 0 ? m("th", translateContent(cell)) : m("td", translateContent(cell)))
                            )
                        )
                    ),
                type === "chart"
                    && card.chartData
                    && m(Chart, {
                        chartData: card.chartData,
                        width: width,
                    }),
                links
                    && Object.keys(links).length > 0
                    && m(
                        ".card-links",
                        {
                            style: {
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "12px",
                                marginTop: "auto",
                                paddingTop: "12px",
                            },
                        },
                        Object.keys(links)
                            .sort((a, b) => {
                                if (a === "wikipedia")
                                    return -1;
                                if (b === "wikipedia")
                                    return 1;
                                return a.localeCompare(b);
                            })
                            .map((key) => {
                                const rawUrl = links[key];
                                if (!rawUrl)
                                    return null;
                                const url = typeof rawUrl === "object" ? translateContent(rawUrl) : rawUrl;
                                if (!url)
                                    return null;
                                const label = key === "wikipedia" ? "Wikipedia" : key.charAt(0).toUpperCase() + key.slice(1);
                                return m(
                                    "a.card-link",
                                    {
                                        href: url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        style: {
                                            fontSize: "0.75rem",
                                            color: "var(--primary-color)",
                                            textDecoration: "none",
                                            fontWeight: "600",
                                            display: "inline-flex",
                                            alignItems: "center",
                                        },
                                    },
                                    `${label} ↗`
                                );
                            })
                    ),
            ])
        );
    },
};
