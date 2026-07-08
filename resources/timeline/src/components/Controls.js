import m from "mithril";
import { TAGS } from "../data/tags.js";
import { t, getLanguage, setLanguage, translateContent } from "../i18n.js";
export const Controls = {
    view(vnode) {
        const { activeFilters, onFilterChange, onFilterOnly, onSelectAllTags, onResetFilters, searchQuery, suggestions, showSuggestions, layoutMode, onSearchChange, onJumpToCard, onFocusSearch, onCloseSuggestions, onLayoutModeChange } = vnode.attrs;
        const categories = Object.keys(TAGS);
        const resetAllTags = () => {
            if (onSelectAllTags)
                onSelectAllTags();
            else if (onResetFilters)
                onResetFilters();
        };
        return m("header#app-header", [
            m(".header-title-section", [
                m("h1", t("title")),
                m("span.subtitle", t("subtitle"))
            ]),
            m(".action-group.filter-group", {
                style: { width: "100%", height: "auto", padding: "8px 16px" },
                ondblclick: () => {
                    resetAllTags();
                },
            }, [
                m("span.group-label", {
                    style: { cursor: "pointer", userSelect: "none" },
                    title: "Double-click to select all tags",
                    ondblclick: (e) => {
                        e.stopPropagation();
                        resetAllTags();
                    },
                }, t("filter")),
                m("#filter-panel", {
                    ondblclick: (e) => {
                        e.stopPropagation();
                        resetAllTags();
                    },
                }, categories.map((cat) => {
                    const tagData = TAGS[cat];
                    const label = tagData ? translateContent(tagData.label) : cat;
                    return m("span.filter-pill", {
                        key: cat,
                        class: `tag tag-${cat} ${activeFilters.includes(cat) ? "" : "inactive"}`,
                        onclick: () => onFilterChange(cat, !activeFilters.includes(cat)),
                        ondblclick: (e) => {
                            e.stopPropagation();
                            if (onFilterOnly)
                                onFilterOnly(cat);
                        },
                    }, label);
                })),
            ]),
            m(".header-actions", [
                m(".action-group.search-group", { style: { position: "relative" } }, [
                    m("input.search-input", {
                        type: "text",
                        placeholder: t("searchPlaceholder"),
                        value: searchQuery,
                        oninput: (e) => onSearchChange(e.target.value),
                        onfocus: () => onFocusSearch(),
                        onclick: () => onFocusSearch(),
                        onblur: () => {
                            setTimeout(() => {
                                onCloseSuggestions();
                                m.redraw();
                            }, 150);
                        },
                        onkeydown: (e) => {
                            if (e.key === "Enter" && suggestions.length > 0) {
                                onJumpToCard(suggestions[0].index);
                            }
                            else if (e.key === "Escape") {
                                onCloseSuggestions();
                            }
                        }
                    }),
                    showSuggestions && searchQuery && suggestions.length > 0 && m(".suggestions-panel", {
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
                    }, [
                        m(".suggestions-header", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "6px 12px",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                                background: "rgba(0,0,0,0.2)",
                            }
                        }, [
                            m("span", { style: { fontWeight: "800", fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase" } }, t("suggestionsTitle")),
                            m("span.close-suggestions-btn", {
                                onclick: (e) => {
                                    e.stopPropagation();
                                    onCloseSuggestions();
                                },
                                style: {
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    fontWeight: "bold",
                                    color: "#64748b",
                                    padding: "2px 6px",
                                },
                                onmouseover: (e) => e.target.style.color = "#fff",
                                onmouseout: (e) => e.target.style.color = "#64748b",
                            }, "×")
                        ]),
                        suggestions.map((s) => m(".suggestion-item", {
                            key: s.index,
                            onclick: () => {
                                onJumpToCard(s.index);
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
                            onmouseover: (e) => {
                                e.target.style.background = "rgba(56, 189, 248, 0.15)";
                                e.target.style.color = "#38bdf8";
                            },
                            onmouseout: (e) => {
                                e.target.style.background = "";
                                e.target.style.color = "";
                            }
                        }, [
                            m("strong", { style: { color: "#fff", marginRight: "4px" } }, s.year + ":"),
                            s.title
                        ]))
                    ])
                ]),
                m(".action-group.layout-group", [
                    m("span.group-label", "LAYOUT"),
                    m(".layout-selector", { style: { display: "flex", gap: "4px" } }, [
                        m("button.lang-btn", {
                            class: layoutMode === "browser" ? "active" : "",
                            onclick: () => onLayoutModeChange("browser"),
                        }, "Browser"),
                        m("button.lang-btn", {
                            class: layoutMode === "virtual" ? "active" : "",
                            onclick: () => onLayoutModeChange("virtual"),
                        }, "Virtual")
                    ])
                ]),
                // IMPORTANT: Language selection buttons invoke setLanguage(lang) and trigger onLanguageChange callback
                // to increment dataVersion in main.ts, ensuring layout recalculations for live translation of cards.
                // Do not remove onLanguageChange or setLanguage here!
                m(".action-group.lang-group", [
                    m("span.group-label", "LANG"),
                    m(".lang-selector", { style: { display: "flex", gap: "4px" } }, ["DE", "FR", "IT", "EN", "ES", "JA"].map((lang) => m("button.lang-btn", {
                        class: getLanguage() === lang ? "active" : "",
                        onclick: () => {
                            setLanguage(lang);
                            if (vnode.attrs.onLanguageChange)
                                vnode.attrs.onLanguageChange(lang);
                        },
                    }, lang)))
                ])
            ]),
        ]);
    },
};
