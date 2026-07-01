import m from "mithril";

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
            height: 120
        });
    }
};

function highlight(text, query) {
    if (!query)
        return text;
    const constEscapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${constEscapedQuery})`, "gi"));
    return parts.map((part) =>
        part.toLowerCase() === query.toLowerCase()
            ? m("mark.highlight", part)
            : part
    );
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
        const { card, searchQuery } = vnode.attrs;
        const { id, type, date, title, description, tags, stats, width, wikiUrl } = card;

        const tagClass = tags.includes("milestone") ? "tag-milestone" : tags[0] ? `tag-${tags[0]}` : "";

        return m(".timeline-card", {
            class: `card-${type} ${tagClass}`,
            id: id,
            style: {
                width: `${width}px`
            }
        }, [
            m(".card-header", [
                m("span.card-date", date),
                m("h3.card-title", highlight(title, searchQuery))
            ]),
            m(".card-tags",
                tags.map(tag => m("span.tag", { class: `tag-${tag}` }, tag))
            ),
            m("p.card-desc", highlight(description, searchQuery)),
            stats && m(".card-stats-summary", [
                stats.transistors && m("div", [m("strong", "Transistoren:"), ` ${stats.transistors}`]),
                stats.clockSpeed && m("div", [m("strong", "Taktfrequenz:"), ` ${stats.clockSpeed}`]),
                stats.memory && m("div", [m("strong", "Speicher:"), ` ${stats.memory}`])
            ]),
            type === "table" && card.cells && m("table.stats-table",
                card.cells.map((row, rIdx) =>
                    m("tr",
                        row.map(cell =>
                            rIdx === 0 ? m("th", cell) : m("td", cell)
                        )
                    )
                )
            ),
            type === "chart" && card.chartData && m(Chart, {
                chartData: card.chartData,
                width: width
            }),
            wikiUrl && m("a.wiki-link", {
                href: wikiUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                style: {
                    display: "inline-block",
                    marginTop: "12px",
                    fontSize: "0.75rem",
                    color: "var(--primary-color)",
                    textDecoration: "none",
                    fontWeight: "600"
                }
            }, "Wikipedia ↗")
        ]);
    }
};
