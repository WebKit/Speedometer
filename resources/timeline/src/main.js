import m from "mithril";
import staticData from "./data/index.js";
import { Controls } from "./components/Controls.js";
import { Timeline } from "./components/Timeline.js";
import { Card } from "./components/Card.js";
import { MiniOverview } from "./components/MiniOverview.js";

const App = () => {
    const allData = staticData;

    allData.forEach((card, index) => {
        if (!card) {
            console.error(`Validation Error: Card at index ${index} is null or undefined.`);
            return;
        }
        const identifier = card.id ? `ID: ${card.id}` : `index: ${index}`;
        if (!card.title) {
            console.error(`Validation Error: Card (${identifier}) is missing a 'title'.`);
        }
        if (!Array.isArray(card.tags) || card.tags.length === 0) {
            console.error(`Validation Error: Card (${identifier}) must have at least one tag in the 'tags' array.`);
        }
        if (!card.description) {
            console.error(`Validation Error: Card (${identifier}) is missing a 'description'.`);
        }
        if (!card.wikiUrl) {
            console.error(`Validation Error: Card (${identifier}) is missing a 'wikiUrl'.`);
        }
    });
    let activeFilters = ["hardware", "software", "consumer", "networking", "milestone"];
    let searchQuery = "";
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
                    }
                }),
                m("#main-content", [

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
                    onJumpToIndex: (idx, behavior = "smooth") => {
                        if (timelineHandle.scrollToIndex)
                            timelineHandle.scrollToIndex(idx, behavior);

                    }
                })
            ]);
        }
    };
};

m.mount(document.getElementById("app"), App);
