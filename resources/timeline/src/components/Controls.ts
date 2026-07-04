import m from "mithril";
import { TAGS } from "../data/tags.js";
import { t, getLanguage, setLanguage, Language } from "../i18n.js";

export const categoryLabels = new Proxy({}, {
    get(target, prop) {
        if (typeof prop === "string") {
            const key = `cat_${prop}` as any;
            return t(key) || prop;
        }
        return undefined;
    }
}) as Record<string, string>;

export const Controls = {
    view(vnode) {
        const { activeFilters, onFilterChange } = vnode.attrs;

        const categories = Object.keys(TAGS);

        return m("header#app-header", [
            m(".header-title-section", [
                m("h1", t("title")),
                m("span.subtitle", t("subtitle"))
            ]),

            m(".header-actions", [
                m(".action-group.filter-group", [
                    m("span.group-label", t("filter")),
                    m(
                        "#filter-panel",
                        categories.map((cat) =>
                            m(
                                "span.filter-pill",
                                {
                                    key: cat,
                                    class: `tag tag-${cat} ${activeFilters.includes(cat) ? "" : "inactive"}`,
                                    onclick: () => onFilterChange(cat, !activeFilters.includes(cat)),
                                },
                                categoryLabels[cat] || cat
                            )
                        )
                    ),
                ]),
                m(".action-group.lang-group", [
                    m("span.group-label", "LANG"),
                    m(".lang-selector", { style: { display: "flex", gap: "4px" } },
                        (["DE", "FR", "IT"] as Language[]).map((lang) =>
                            m("button.lang-btn", {
                                class: getLanguage() === lang ? "active" : "",
                                onclick: () => setLanguage(lang),
                                style: {
                                    background: getLanguage() === lang ? "var(--primary-color)" : "transparent",
                                    color: getLanguage() === lang ? "#000" : "var(--text-color)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    borderRadius: "4px",
                                    padding: "2px 6px",
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    transition: "all 0.2s"
                                }
                            }, lang)
                        )
                    )
                ])
            ]),
        ]);
    },
};

