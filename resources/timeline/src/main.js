import m from "mithril";
import { allData as staticData } from "./data/index.js";
import { Controls } from "./components/Controls.js";
import { Timeline } from "./components/Timeline.js";
import { Card } from "./components/Card.js";
import { MiniOverview } from "./components/MiniOverview.js";

const App = () => {
    const allData = staticData;
    let activeFilters = ["hardware", "software", "consumer", "networking", "milestone"];
    let searchQuery = "";
    let replacementQuery = "";
    let tocVisible = false;
    let tocLoaded = false;
    let activeIndex = 0;
    let dataVersion = 1;

    const timelineHandle = {};

    let filteredData = [...allData];

    function applyFilters() {
        filteredData = allData.filter(card =>
            card.tags.some(tag => activeFilters.includes(tag))
        );
    }

    // Initial run
    applyFilters();

    return {
        view() {
            return m("#app-container", [
                m(Controls, {
                    activeFilters,
                    onFilterChange: (tag, checked) => {
                        if (checked) {
                            if (!activeFilters.includes(tag))
                                activeFilters.push(tag);
                        } else {
                            activeFilters = activeFilters.filter(t => t !== tag);
                        }
                        applyFilters();
                    },
                    searchQuery,
                    onSearchQueryChange: (val) => {
                        searchQuery = val;
                    },
                    replacementQuery,
                    onReplacementQueryChange: (val) => {
                        replacementQuery = val;
                    },
                    onSearchReplace: () => {
                        if (!searchQuery)
                            return;
                        const regex = new RegExp(searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");
                        allData.forEach(card => {
                            if (card.title) {
                                card.title = card.title.replace(regex, replacementQuery);
                            }
                            if (card.description) {
                                card.description = card.description.replace(regex, replacementQuery);
                            }
                        });
                        searchQuery = replacementQuery;
                        replacementQuery = "";
                        dataVersion++;
                        applyFilters();
                    },
                    onToggleTOC: () => {
                        tocVisible = !tocVisible;
                    },
                    onLoadTOC: () => {
                        tocLoaded = true;
                    },
                    onScrollToMonth: (decadeYear) => {
                        const targetCardIndex = filteredData.findIndex(card => card.id === `header-${decadeYear}`);
                        if (targetCardIndex !== -1 && timelineHandle.scrollToIndex)
                            timelineHandle.scrollToIndex(targetCardIndex);

                    }
                }),
                m("#main-content", [
                    m("aside#toc-sidebar", { class: tocVisible ? "" : "hidden" }, [
                        m("h2", "Jahrzehnte"),
                        tocLoaded && m("ul#toc-list", (() => {
                            const decadesList = [];
                            for (let y = 1900; y <= 2020; y += 10) {
                                const targetCard = filteredData.find(card => card.id === `header-${y}`);
                                if (targetCard) {
                                    decadesList.push({
                                        label: `${y}er`,
                                        targetId: targetCard.id
                                    });
                                }
                            }
                            const lastCard = filteredData.find(card => card.id === "header-2026");
                            if (lastCard) {
                                decadesList.push({
                                    label: "2026",
                                    targetId: lastCard.id
                                });
                            }
                            return decadesList.map(item =>
                                m("li", { key: item.label },
                                    m("a", {
                                        href: "#",
                                        onclick: (e) => {
                                            e.preventDefault();
                                            const targetCardIndex = filteredData.findIndex(card => card.id === item.targetId);
                                            if (targetCardIndex !== -1 && timelineHandle.scrollToIndex)
                                                timelineHandle.scrollToIndex(targetCardIndex);

                                        }
                                    }, item.label)
                                )
                            );
                        })())
                    ]),
                    m(Timeline, {
                        data: filteredData,
                        version: dataVersion,
                        handle: timelineHandle,
                        onActiveIndexChange: (idx) => {
                            activeIndex = idx;
                        },
                        renderItem: (item, onResize) => m(Card, {
                            card: item,
                            searchQuery: searchQuery,
                            onResize: onResize
                        })
                    })
                ]),
                m(MiniOverview, {
                    data: filteredData,
                    activeIndex: activeIndex,
                    onJumpToIndex: (idx) => {
                        if (timelineHandle.scrollToIndex)
                            timelineHandle.scrollToIndex(idx);

                    }
                })
            ]);
        }
    };
};

m.mount(document.getElementById("app"), App);
