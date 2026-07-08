import m from "mithril";
import staticData from "./data/index.js";
import { Controls } from "./components/Controls.js";
import { Timeline } from "./components/Timeline.js";
import { Card } from "./components/Card.js";
import { MiniOverview } from "./components/MiniOverview.js";
import { TAGS } from "./data/tags.js";
import { translateContent, getLanguage } from "./i18n.js";
const App = () => {
    const allData = staticData;
    allData.forEach((card, index) => {
        if (!card) {
            console.error(`Validation Error: Card at index ${index} is null or undefined.`);
            return;
        }
        const identifier = card.id ? `ID: ${card.id}` : `index: ${index}`;
        if (!card.title)
            console.error(`Validation Error: Card (${identifier}) is missing a \x27title\x27.`);
        if (!Array.isArray(card.tags) || card.tags.length === 0)
            console.error(`Validation Error: Card (${identifier}) must have at least one tag in the \x27tags\x27 array.`);
        if (!card.description)
            console.error(`Validation Error: Card (${identifier}) is missing a \x27description\x27.`);
        if (!card.links || !card.links.wikipedia)
            console.error(`Validation Error: Card (${identifier}) is missing a Wikipedia link in \x27links.wikipedia\x27.`);
    });
    let activeFilters = Object.keys(TAGS);
    let searchQuery = "";
    let showSuggestions = false;
    let activeIndex = 0;
    let layoutMode = "virtual";
    let dataVersion = 1;
    const timelineHandle = {};
    let filteredData = [...allData];
    function applyFilters() {
        filteredData = allData.filter((card) => card.tags.some((tag) => activeFilters.includes(tag)));
    }
    function updateFilterSelection() {
        let currentCardDate = null;
        if (filteredData[activeIndex]) {
            currentCardDate = filteredData[activeIndex].date;
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
        }
        else {
            activeIndex = 0;
        }
        dataVersion++;
        setTimeout(() => {
            if (timelineHandle.scrollToIndex) {
                timelineHandle.scrollToIndex(activeIndex, "instant");
            }
        }, 0);
    }
    // Initial run
    applyFilters();
    return {
        view() {
            let suggestions = [];
            let matchingCards = [];
            if (searchQuery.trim().length > 0) {
                const query = searchQuery.toLowerCase().trim();
                const allMatches = filteredData.map((card, index) => {
                    const titleStr = translateContent(card.title).toLowerCase();
                    const descStr = translateContent(card.description).toLowerCase();
                    let score = 0;
                    if (titleStr.startsWith(query))
                        score += 100;
                    else if (titleStr.includes(query))
                        score += 50;
                    if (descStr.includes(query))
                        score += 10;
                    const yearStr = card.date.substring(0, 4);
                    if (yearStr.includes(query))
                        score += 20;
                    return {
                        card,
                        index,
                        year: yearStr,
                        title: translateContent(card.title),
                        score
                    };
                }).filter(m => m.score > 0);
                matchingCards = allMatches.map(m => m.card);
                suggestions = allMatches
                    .sort((a, b) => b.score - a.score || a.index - b.index)
                    .slice(0, 5);
            }
            return m("#app-container", [
                m("style", Object.values(TAGS).map((tag) => `
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
                m(Controls, {
                    activeFilters,
                    searchQuery,
                    suggestions,
                    showSuggestions,
                    layoutMode,
                    onSearchChange: (q) => {
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
                    onLayoutModeChange: (mode) => {
                        layoutMode = mode;
                        dataVersion++;
                    },
                    onJumpToCard: (idx) => {
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
                        if (checked) {
                            if (!activeFilters.includes(tag))
                                activeFilters.push(tag);
                        }
                        else {
                            activeFilters = activeFilters.filter((t) => t !== tag);
                        }
                        updateFilterSelection();
                    },
                    onFilterOnly: (tag) => {
                        activeFilters = [tag];
                        updateFilterSelection();
                    },
                    onSelectAllTags: () => {
                        activeFilters = Object.keys(TAGS);
                        updateFilterSelection();
                    },
                    onResetFilters: () => {
                        activeFilters = Object.keys(TAGS);
                        updateFilterSelection();
                    },
                    onLanguageChange: (lang) => {
                        dataVersion++;
                    },
                }),
                m("#main-content", [
                    m(Timeline, {
                        data: filteredData,
                        version: dataVersion,
                        language: getLanguage(),
                        handle: timelineHandle,
                        activeIndex: activeIndex,
                        layoutMode: layoutMode,
                        cardBuffer: 10,
                        onActiveIndexChange: (idx) => {
                            activeIndex = idx;
                        },
                        renderItem: (item) => m(Card, {
                            card: item,
                            searchQuery: searchQuery,
                            language: getLanguage(),
                        }),
                    }),
                ]),
                m(MiniOverview, {
                    data: filteredData,
                    allData: allData,
                    searchQuery: searchQuery,
                    matchingCards: matchingCards,
                    activeIndex: activeIndex,
                    language: getLanguage(),
                    onJumpToIndex: (idx, behavior = "smooth") => {
                        if (timelineHandle.scrollToIndex)
                            timelineHandle.scrollToIndex(idx, behavior);
                    },
                }),
            ]);
        },
    };
};
m.mount(document.getElementById("app"), App);
