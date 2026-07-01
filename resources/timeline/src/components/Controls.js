import m from "mithril";

export const Controls = {
    view(vnode) {
        const {
            activeFilters,
            onFilterChange
        } = vnode.attrs;

        const categories = ["hardware", "software", "consumer", "networking", "milestone", "gaming", "art", "military"];
        
        const categoryLabels = {
            "hardware": "Hardware",
            "software": "Software",
            "consumer": "Konsumenten",
            "networking": "Netzwerk",
            "milestone": "Meilenstein",
            "gaming": "Spiele",
            "art": "Kunst",
            "military": "Militär"
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
                            m("span.filter-pill", {
                                key: cat,
                                class: `tag tag-${cat} ${activeFilters.includes(cat) ? '' : 'inactive'}`,
                                onclick: () => onFilterChange(cat, !activeFilters.includes(cat))
                            }, categoryLabels[cat] || cat)
                        )
                    )
                ])
            ])
        ]);
    }
};
