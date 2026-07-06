import m from "mithril";
import { TAGS } from "../data/tags.js";
import { t, getLanguage, setLanguage, Language, translateContent } from "../i18n.js";

export const Controls = {
    view(vnode) {
        const { activeFilters, onFilterChange, searchQuery, suggestions, onSearchChange, onJumpToCard } = vnode.attrs;

        const categories = Object.keys(TAGS);

        return m("header#app-header", [
            m(".header-title-section", [
                m("h1", t("title")),
                m("span.subtitle", t("subtitle"))
            ]),

            m(".header-actions", [
                m(".action-group.search-group", { style: { position: "relative" } }, [
                    m("input.search-input", {
                        type: "text",
                        placeholder: "Suchen...",
                        value: searchQuery,
                        oninput: (e: any) => onSearchChange(e.target.value),
                        onkeydown: (e: any) => {
                            if (e.key === "Enter" && suggestions.length > 0) {
                                onJumpToCard(suggestions[0].index);
                                onSearchChange(""); // close suggestions
                            }
                        },
                        style: {
                            background: "rgba(0, 0, 0, 0.25)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            color: "#fff",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            outline: "none",
                            width: "180px",
                            transition: "all 0.3s",
                        }
                    }),
                    searchQuery && suggestions.length > 0 && m(".suggestions-panel", {
                        style: {
                            position: "absolute",
                            top: "38px",
                            left: "0",
                            right: "0",
                            background: "rgba(15, 23, 42, 0.95)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                            zIndex: 1000,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }
                    }, suggestions.map((s: any) =>
                        m(".suggestion-item", {
                            key: s.index,
                            onclick: () => {
                                onJumpToCard(s.index);
                                onSearchChange(""); // close suggestions
                            },
                            style: {
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                color: "#cbd5e1",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                                transition: "all 0.2s",
                                textAlign: "left",
                            },
                            onmouseover: (e: any) => {
                                e.target.style.background = "rgba(56, 189, 248, 0.15)";
                                e.target.style.color = "#38bdf8";
                            },
                            onmouseout: (e: any) => {
                                e.target.style.background = "";
                                e.target.style.color = "";
                            }
                        }, [
                            m("strong", { style: { color: "#fff", marginRight: "4px" } }, s.year + ":"),
                            s.title
                        ])
                    ))
                ]),
                m(".action-group.filter-group", [
                    m("span.group-label", t("filter")),
                    m(
                        "#filter-panel",
                        categories.map((cat) => {
                            const tagData = (TAGS as any)[cat];
                            const label = tagData ? translateContent(tagData.label) : cat;
                            return m(
                                "span.filter-pill",
                                {
                                    key: cat,
                                    class: `tag tag-${cat} ${activeFilters.includes(cat) ? "" : "inactive"}`,
                                    onclick: () => onFilterChange(cat, !activeFilters.includes(cat)),
                                },
                                label
                            );
                        })
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

