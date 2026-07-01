import m from "mithril";

export const Controls = {
    view(vnode) {
        const {
            activeFilters,
            onFilterChange,
            searchQuery,
            onSearchQueryChange,
            replacementQuery,
            onReplacementQueryChange,
            onSearchReplace,
            onToggleTOC,
            onLoadTOC,
            onScrollToMonth
        } = vnode.attrs;

        const categories = ["hardware", "software", "consumer", "networking", "milestone"];
        
        const categoryLabels = {
            "hardware": "Hardware",
            "software": "Software",
            "consumer": "Konsumenten",
            "networking": "Netzwerk",
            "milestone": "Meilenstein"
        };

        return m("header#app-header", [
            m(".header-title-section", [
                m("h1", "Geschichte des Computers"),
                m("span.subtitle", "1900 - 2026")
            ]),

            m(".header-actions", [
                m(".action-group.filter-group", [
                    m("span.group-label", "Filter:"),
                    m("#filter-panel", 
                        categories.map(cat =>
                            m("label.custom-checkbox", { key: cat }, [
                                m("input[type=checkbox]", {
                                    checked: activeFilters.includes(cat),
                                    onchange: (e) => onFilterChange(cat, e.target.checked)
                                }),
                                m("span.label-text", categoryLabels[cat] || cat)
                            ])
                        )
                    )
                ]),

                m(".action-group.search-group", [
                    m(".search-replace-panel", [
                        m("input[type=text]", {
                            placeholder: "Suchen...",
                            value: searchQuery,
                            oninput: (e) => onSearchQueryChange(e.target.value)
                        }),
                        m("input[type=text]", {
                            placeholder: "Ersetzen...",
                            value: replacementQuery,
                            oninput: (e) => onReplacementQueryChange(e.target.value)
                        }),
                        m("button.btn-primary", {
                            onclick: onSearchReplace
                        }, "Ersetzen")
                    ])
                ]),

                m(".action-group#controls", [
                    m("button.btn-secondary", { onclick: onToggleTOC }, "Jahrzehnte umschalten"),
                    m("button.btn-secondary", { onclick: onLoadTOC }, "Jahrzehnte laden"),
                    m(".divider"),
                    m("button.btn-nav", { onclick: () => onScrollToMonth(1940) }, [
                        m("span.year", "1940er"), m("span.desc", "(Z3/Turing)")
                    ]),
                    m("button.btn-nav", { onclick: () => onScrollToMonth(1980) }, [
                        m("span.year", "1980er"), m("span.desc", "(Heimcomputer)")
                    ]),
                    m("button.btn-nav", { onclick: () => onScrollToMonth(2020) }, [
                        m("span.year", "2020er"), m("span.desc", "(KI/Silicon)")
                    ])
                ])
            ])
        ]);
    }
};
