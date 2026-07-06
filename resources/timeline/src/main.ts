import m from "mithril";
import staticData from "./data/index.js";
import { Controls } from "./components/Controls.js";
import { Timeline } from "./components/Timeline.js";
import { Card } from "./components/Card.js";
import { MiniOverview } from "./components/MiniOverview.js";
import { TAGS } from "./data/tags.js";
import { translateContent } from "./i18n.js";

const App = () => {
    const allData = staticData;

    allData.forEach((card, index) => {
        if (!card) {
            console.error(`Validation Error: Card at index ${index} is null or undefined.`);
            return;
        }
        const identifier = card.id ? `ID: ${card.id}` : `index: ${index}`;
        if (!card.title) console.error(`Validation Error: Card (${identifier}) is missing a 'title'.`);

        if (!Array.isArray(card.tags) || card.tags.length === 0) console.error(`Validation Error: Card (${identifier}) must have at least one tag in the 'tags' array.`);

        if (!card.description) console.error(`Validation Error: Card (${identifier}) is missing a 'description'.`);

        if (!card.links || !card.links.wikipedia) console.error(`Validation Error: Card (${identifier}) is missing a Wikipedia link in 'links.wikipedia'.`);
    });
    let activeFilters = Object.keys(TAGS);
    let searchQuery = "";
    let showSuggestions = false;
    let activeIndex = 0;
    let layoutMode = "virtual";
    let dataVersion = 1;

    const timelineHandle: { scrollToIndex?: (idx: number, behavior?: string) => void } = {};

    let filteredData = [...allData];

    function applyFilters() {
        filteredData = allData.filter((card) => card.tags.some((tag) => activeFilters.includes(tag)));
    }

    // Initial run
    applyFilters();

    return {
        view() {
            let suggestions: Array<{ index: number; year: string; title: string }> = [];
            if (searchQuery.trim().length > 0) {
                const query = searchQuery.toLowerCase().trim();
                suggestions = filteredData.map((card, index) => {
                    const titleStr = translateContent(card.title).toLowerCase();
                    const descStr = translateContent(card.description).toLowerCase();
                    let score = 0;
                    if (titleStr.startsWith(query)) score += 100;
                    else if (titleStr.includes(query)) score += 50;
                    if (descStr.includes(query)) score += 10;
                    
                    const yearStr = card.date.substring(0, 4);
                    if (yearStr.includes(query)) score += 20;

                    return {
                        index,
                        year: yearStr,
                        title: translateContent(card.title),
                        score
                    };
                })
                .filter(m => m.score > 0)
                .sort((a, b) => b.score - a.score || a.index - b.index)
                .slice(0, 5);
            }

            return m("#app-container", [
                m("style", Object.values(TAGS).map((tag: any) => `
                    .tag-${tag.id} {
                        background-color: ${tag.bgColor} !important;
                        color: ${tag.color} !important;
                        border-color: ${tag.color}33 !important;
                    }
                    .timeline-card.tag-${tag.id}::before {
                        background: ${tag.color} !important;
                        box-shadow: 0 0 10px ${tag.color}, 0 0 20px ${tag.color} !important;
                    }
                    .timeline-card.tag-${tag.id}:hover .timeline-card-inner {
                        border-color: ${tag.color}aa !important;
                        box-shadow: 0 0 25px ${tag.color}25, inset 0 0 12px ${tag.color}15 !important;
                    }
                    .filter-pill.tag-${tag.id}.inactive {
                        opacity: 0.4;
                        background-color: transparent !important;
                        color: #64748b !important;
                        border-color: rgba(255, 255, 255, 0.1) !important;
                    }
                `).join("\n")),
                m(Controls as m.Component<any>, {
                    activeFilters,
                    searchQuery,
                    suggestions,
                    showSuggestions,
                    layoutMode,
                    onSearchChange: (q: string) => {
                        searchQuery = q;
                        showSuggestions = q.trim().length > 0;
                    },
                    onFocusSearch: () => {
                        if (searchQuery.trim().length > 0) {
                            showSuggestions = true;
                        }
                    },
                    onCloseSuggestions: () => {
                        showSuggestions = false;
                    },
                    onLayoutModeChange: (mode: string) => {
                        layoutMode = mode;
                        dataVersion++;
                    },
                    onJumpToCard: (idx: number) => {
                        activeIndex = idx;
                        showSuggestions = false;
                        dataVersion++;
                        setTimeout(() => {
                            if (timelineHandle.scrollToIndex) {
                                timelineHandle.scrollToIndex(idx, "smooth");
                            }
                        }, 0);
                    },
                    onFilterChange: (tag, checked) => {
                        let currentCardDate = null;
                        if (filteredData[activeIndex]) {
                            currentCardDate = filteredData[activeIndex].date;
                        }

                        if (checked) {
                            if (!activeFilters.includes(tag)) activeFilters.push(tag);
                        } else {
                            activeFilters = activeFilters.filter((t) => t !== tag);
                        }
                        applyFilters();

                        if (currentCardDate && filteredData.length > 0) {
                            let bestIndex = 0;
                            let minDiff = Infinity;
                            const targetTime = new Date(currentCardDate).getTime();
                            
                            filteredData.forEach((card, idx) => {
                                const cardTime = new Date(card.date).getTime();
                                const diff = Math.abs(cardTime - targetTime);
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    bestIndex = idx;
                                }
                            });
                            activeIndex = bestIndex;
                        } else {
                            activeIndex = 0;
                        }

                        dataVersion++;
                        setTimeout(() => {
                            if (timelineHandle.scrollToIndex) {
                                timelineHandle.scrollToIndex(activeIndex, "instant");
                            }
                        }, 0);
                    },
                }),
                m("#main-content", [
                    m(Timeline as m.ClosureComponent<any>, {
                        data: filteredData,
                        version: dataVersion,
                        handle: timelineHandle,
                        activeIndex: activeIndex,
                        layoutMode: layoutMode,
                        cardBuffer: 10,
                        onActiveIndexChange: (idx) => {
                            activeIndex = idx;
                        },
                        renderItem: (item) =>
                            m(Card, {
                                card: item,
                                searchQuery: searchQuery,
                            }),
                    }),
                ]),
                m(MiniOverview as m.ClosureComponent<any>, {
                    data: filteredData,
                    activeIndex: activeIndex,
                    onJumpToIndex: (idx, behavior = "smooth") => {
                        if (timelineHandle.scrollToIndex) timelineHandle.scrollToIndex(idx, behavior);
                    },
                }),
            ]);
        },
    };
};

m.mount(document.getElementById("app"), App);
