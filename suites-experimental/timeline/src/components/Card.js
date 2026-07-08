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
function formatInlineStyles(str, query) {
    if (!str)
        return [];
    const escapedQuery = query ? query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") : "";
    const regexParts = [
        "`([^`]+)`", // 1. Code
        "\\*\\*([^*]+)\\*\\*", // 2. Bold
        "\\*([^*]+)\\*", // 3. Italic
    ];
    if (escapedQuery)
        regexParts.push(`(${escapedQuery})`); // 4. Search Highlight

    const masterRegex = new RegExp(regexParts.join("|"), "gi");
    let match;
    let lastIndex = 0;
    const result = [];
    while ((match = masterRegex.exec(str)) !== null) {
        const before = str.substring(lastIndex, match.index);
        if (before)
            result.push(before);

        const [full, code, bold, italic, highlightStr] = match;
        if (code !== undefined)
            result.push(m("code", code));
        else if (bold !== undefined)
            result.push(m("strong", formatInlineStyles(bold, query)));
        else if (italic !== undefined)
            result.push(m("em", formatInlineStyles(italic, query)));
        else if (highlightStr !== undefined)
            result.push(m("mark.highlight", highlightStr));

        lastIndex = masterRegex.lastIndex;
    }
    const after = str.substring(lastIndex);
    if (after)
        result.push(after);

    return result;
}
function parseMarkdown(text, query) {
    if (!text)
        return [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let lastIndex = 0;
    const parts = [];
    while ((match = linkRegex.exec(text)) !== null) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore)
            parts.push(...formatInlineStyles(textBefore, query));

        const label = match[1];
        const url = match[2];
        parts.push(m("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, formatInlineStyles(label, query)));
        lastIndex = linkRegex.lastIndex;
    }
    const textAfter = text.substring(lastIndex);
    if (textAfter)
        parts.push(...formatInlineStyles(textAfter, query));

    return parts;
}
export const Card = {
    oncreate(vnode) {
        if (vnode.attrs.onResize)
            vnode.attrs.onResize(vnode.dom.offsetWidth);

    },
    onupdate(vnode) {
        if (vnode.attrs.onResize)
            vnode.attrs.onResize(vnode.dom.offsetWidth);

    },
    view(vnode) {
        // IMPORTANT: Live translation of cards relies on calling translateContent() and t() dynamically inside view()
        // during Mithril redraws (e.g. when setLanguage is called or when language attribute changes in main.ts).
        // Do not cache translated strings statically outside view() or remove translateContent() calls, to prevent breaking live translation in future edits.
        const { card, searchQuery } = vnode.attrs;
        const { id, type, date, title, description, tags, stats, width, links } = card;
        const titleStr = translateContent(title);
        const descriptionStr = translateContent(description);
        const tagClass = tags.includes("milestone") ? "tag-milestone" : tags[0] ? `tag-${tags[0]}` : "";
        return m(
            ".timeline-card",
            {
                class: `card-${type} ${tagClass}`,
                id: id,
                style: Object.assign(
                    {
                        width: `${width}px`,
                    },
                    vnode.attrs.style
                ),
            },
            m(".timeline-card-inner", [
                m(".card-header", [m("span.card-date", date), m("h3.card-title", formatInlineStyles(titleStr, searchQuery))]),
                m(
                    ".card-tags",
                    tags.map((tag) => {
                        const tagData = TAGS[tag];
                        const label = tagData ? translateContent(tagData.label) : tag;
                        return m("span.tag", { class: `tag-${tag}` }, label);
                    })
                ),
                m("p.card-desc", parseMarkdown(descriptionStr, searchQuery)),
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
                        card.cells.map((row, rIdx) =>
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
