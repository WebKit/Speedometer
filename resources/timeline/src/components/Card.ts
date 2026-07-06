import m from "mithril";
import { TAGS } from "../data/tags.js";
import { t, translateContent } from "../i18n.js";

const Chart = {
    draw(dom, chartData, width) {
        const ctx = dom.getContext("2d");
        if (!ctx) return;
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

function highlight(text, query) {
    if (!query) return text;
    const constEscapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${constEscapedQuery})`, "gi"));
    return parts.map((part) => (part.toLowerCase() === query.toLowerCase() ? m("mark.highlight", part) : part));
}

export const Card = {
    oncreate(vnode: any) {
        if (vnode.attrs.onResize) {
            vnode.attrs.onResize(vnode.dom.offsetWidth);
        }
    },
    onupdate(vnode: any) {
        if (vnode.attrs.onResize) {
            vnode.attrs.onResize(vnode.dom.offsetWidth);
        }
    },
    view(vnode: any) {
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
                m(".card-header", [m("span.card-date", date), m("h3.card-title", highlight(titleStr, searchQuery))]),
                m(
                    ".card-tags",
                    tags.map((tag: string) => {
                        const tagData = (TAGS as any)[tag];
                        const label = tagData ? translateContent(tagData.label) : tag;
                        return m("span.tag", { class: `tag-${tag}` }, label);
                    })
                ),
                m("p.card-desc", highlight(descriptionStr, searchQuery)),
                stats &&
                    m(".card-stats-summary", [
                        stats.transistors && m("div", [m("strong", t("transistors")), ` ${stats.transistors}`]),
                        stats.clockSpeed && m("div", [m("strong", t("clockSpeed")), ` ${stats.clockSpeed}`]),
                        stats.memory && m("div", [m("strong", t("memory")), ` ${stats.memory}`]),
                    ]),
                type === "table" &&
                    card.cells &&
                    m(
                        "table.stats-table",
                        card.cells.map((row: any[], rIdx: number) =>
                            m(
                                "tr",
                                row.map((cell) => (rIdx === 0 ? m("th", cell) : m("td", cell)))
                            )
                        )
                    ),
                type === "chart" &&
                    card.chartData &&
                    m(Chart, {
                        chartData: card.chartData,
                        width: width,
                    }),
                links &&
                    Object.keys(links).length > 0 &&
                    m(
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
                                if (a === "wikipedia") return -1;
                                if (b === "wikipedia") return 1;
                                return a.localeCompare(b);
                            })
                            .map((key) => {
                                const rawUrl = links[key];
                                if (!rawUrl) return null;
                                const url = typeof rawUrl === "object" ? translateContent(rawUrl) : rawUrl;
                                if (!url) return null;
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
