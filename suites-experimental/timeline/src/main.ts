import "./rAF-override.js";
import m from "mithril";
import staticData from "./data/index.js";
import { Controls } from "./components/Controls.js";
import { Timeline } from "./components/Timeline.js";
import { Card } from "./components/Card.js";
import { MiniOverview } from "./components/MiniOverview.js";
import { TAGS } from "./data/tags.js";
import { translateContent, getLanguage, setLanguage } from "./i18n.js";

const App = () => {
    const allData = staticData;
    let isStarted = false;
    let tagCounts: Record<string, number> = {};
    let activeCategories: string[] = [];
    let activeFilters: string[] = [];
    let filteredData: any[] = [];
    let searchQuery = "";
    let showSuggestions = false;
    let activeIndex = 0;
    let layoutMode = "virtual";
    let dataVersion = 1;
    const timelineHandle: { scrollToIndex?: (idx: number, behavior?: string) => void } = {};

    if (typeof window !== "undefined") {
        (window as any).stepScrollTimeline = () => {};
    }

    function startDataProcessing() {
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

        tagCounts = {};
        allData.forEach((card) => {
            if (card && Array.isArray(card.tags)) {
                card.tags.forEach((tag) => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        activeCategories = Object.keys(TAGS).filter((cat) => (tagCounts[cat] || 0) > 0);
        activeFilters = [...activeCategories];
        filteredData = [...allData];

        if (typeof window !== "undefined" && window.location && window.location.search) {
            try {
                const params = new URLSearchParams(window.location.search);
                const searchParam = params.get("search") || params.get("q");
                if (searchParam !== null) {
                    searchQuery = searchParam;
                }
                const tabParam = params.get("tab") || params.get("tags") || params.get("tag") || params.get("filter");
                if (tabParam !== null) {
                    const parsedTags = tabParam
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => activeCategories.includes(t));
                    if (parsedTags.length > 0) {
                        activeFilters = parsedTags;
                    }
                }
                const layoutParam = params.get("layout") || params.get("mode") || params.get("layoutMode");
                if (layoutParam === "virtual" || layoutParam === "browser") {
                    layoutMode = layoutParam;
                }
                const langParam = params.get("lang") || params.get("language") || params.get("l");
                if (langParam !== null) {
                    const upperLang = langParam.toUpperCase() as any;
                    if (["DE", "FR", "IT"].includes(upperLang)) {
                        setLanguage(upperLang);
                    }
                }
                applyFilters();

                const timeParam = params.get("time") || params.get("year") || params.get("date") || params.get("position") || params.get("index");
                if (timeParam !== null && filteredData.length > 0) {
                    const numVal = parseInt(timeParam, 10);
                    if (!isNaN(numVal)) {
                        if (numVal >= 1900 && numVal <= 2100) {
                            let bestIdx = 0;
                            let minDiff = Infinity;
                            filteredData.forEach((card, idx) => {
                                if (card && card.date) {
                                    const cardYear = parseInt(card.date.substring(0, 4), 10);
                                    if (!isNaN(cardYear)) {
                                        const diff = Math.abs(cardYear - numVal);
                                        if (diff < minDiff) {
                                            minDiff = diff;
                                            bestIdx = idx;
                                        }
                                    }
                                }
                            });
                            activeIndex = bestIdx;
                        } else if (numVal >= 0 && numVal < filteredData.length) {
                            activeIndex = numVal;
                        }
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        applyFilters();
        updateURLParams();
    }

    function applyFilters() {
        filteredData = allData.filter((card) => card.tags && card.tags.some((tag) => activeFilters.includes(tag)));
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
        } else {
            activeIndex = 0;
        }

        dataVersion++;
        if (timelineHandle.scrollToIndex) {
            timelineHandle.scrollToIndex(activeIndex, "instant");
        }
        updateURLParams();
    }

    let lastURLString = "";
    function updateURLParams() {
        if (!isStarted || typeof window === "undefined" || !window.history || !window.location) return;
        try {
            const url = new URL(window.location.href);
            if (searchQuery.trim().length > 0) {
                url.searchParams.set("search", searchQuery.trim());
            } else {
                url.searchParams.delete("search");
            }
            if (activeFilters.length > 0 && activeFilters.length < activeCategories.length) {
                url.searchParams.set("tags", activeFilters.join(","));
            } else {
                url.searchParams.delete("tags");
            }
            if (layoutMode !== "virtual") {
                url.searchParams.set("layout", layoutMode);
            } else {
                url.searchParams.delete("layout");
            }
            const currentLang = getLanguage();
            if (currentLang && currentLang !== "DE") {
                url.searchParams.set("lang", currentLang);
            } else {
                url.searchParams.delete("lang");
            }
            if (filteredData[activeIndex] && filteredData[activeIndex].date) {
                url.searchParams.set("time", filteredData[activeIndex].date.substring(0, 4));
            } else if (allData[activeIndex] && allData[activeIndex].date) {
                url.searchParams.set("time", allData[activeIndex].date.substring(0, 4));
            } else {
                url.searchParams.delete("time");
            }
            const newURLString = url.toString();
            if (newURLString !== lastURLString) {
                lastURLString = newURLString;
                window.history.replaceState(null, "", newURLString);
            }
        } catch (e) {
            // Ignore in non-browser/test environments
        }
    }

    return {
        view() {
            if (!isStarted) {
                return m("#app-container", {
                    style: {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        width: "100vw",
                        background: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 50%, #020617 100%)",
                        boxSizing: "border-box",
                        overflow: "hidden",
                    },
                }, [
                    m("div", {
                        style: {
                            textAlign: "center",
                            padding: "48px 64px",
                            background: "rgba(30, 41, 59, 0.5)",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            borderRadius: "24px",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15)",
                            backdropFilter: "blur(20px)",
                            maxWidth: "90vw",
                        },
                    }, [
                        m("h1", {
                            style: {
                                fontSize: "2.8rem",
                                fontWeight: "900",
                                margin: "0 0 12px 0",
                                background: "linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                letterSpacing: "-0.02em",
                            },
                        }, "Speedometer Timeline"),
                        m("p", {
                            style: {
                                color: "#94a3b8",
                                margin: "0 0 36px 0",
                                fontSize: "1.1rem",
                                fontWeight: "500",
                            },
                        }, "Interactive History of Computing & Hardware Performance"),
                        m("button#btn-explore.explore-btn", {
                            onclick: () => {
                                startDataProcessing();
                                isStarted = true;
                                m.redraw.sync();
                            },
                            style: {
                                padding: "16px 40px",
                                fontSize: "1.25rem",
                                fontWeight: "800",
                                color: "#ffffff",
                                background: "linear-gradient(135deg, #0284c7, #6366f1, #9333ea)",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                borderRadius: "9999px",
                                cursor: "pointer",
                                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                            },
                        }, "Explore Timeline"),
                    ]),
                ]);
            }

            let suggestions: Array<{ index: number; year: string; title: string }> = [];
            let matchingCards: any[] = [];
            if (searchQuery.trim().length > 0) {
                const query = searchQuery.toLowerCase().trim();
                const allMatches = filteredData
                    .map((card, index) => {
                        const titleStr = translateContent(card.title).toLowerCase();
                        const descStr = translateContent(card.description).toLowerCase();
                        let score = 0;
                        if (titleStr.startsWith(query)) score += 100;
                        else if (titleStr.includes(query)) score += 50;
                        if (descStr.includes(query)) score += 10;

                        const yearStr = card.date.substring(0, 4);
                        if (yearStr.includes(query)) score += 20;

                        return {
                            card,
                            index,
                            year: yearStr,
                            title: translateContent(card.title),
                            score,
                        };
                    })
                    .filter((m) => m.score > 0);

                matchingCards = allMatches.map((m) => m.card);

                suggestions = allMatches.sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 5);
            }

            return m("#app-container", [
                m(
                    "style",
                    Object.values(TAGS)
                        .map(
                            (tag: any) => `
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
                `
                        )
                        .join("\n")
                ),
                m(Controls as m.Component<any>, {
                    activeFilters,
                    tagCounts,
                    searchQuery,
                    suggestions,
                    showSuggestions,
                    layoutMode,
                    onSearchChange: (q: string) => {
                        searchQuery = q;
                        showSuggestions = q.trim().length > 0;
                        updateURLParams();
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
                        updateURLParams();
                    },
                    onJumpToCard: (idx: number) => {
                        activeIndex = idx;
                        showSuggestions = false;
                        dataVersion++;
                        updateURLParams();
                        if (timelineHandle.scrollToIndex) {
                            timelineHandle.scrollToIndex(idx, "instant");
                        }
                    },
                    onFilterChange: (tag: string, checked: boolean) => {
                        if (checked) {
                            if (!activeFilters.includes(tag)) activeFilters.push(tag);
                        } else {
                            activeFilters = activeFilters.filter((t) => t !== tag);
                        }
                        updateFilterSelection();
                    },
                    onFilterOnly: (tag: string) => {
                        activeFilters = [tag];
                        updateFilterSelection();
                    },
                    onSelectAllTags: () => {
                        activeFilters = [...activeCategories];
                        updateFilterSelection();
                    },
                    onResetFilters: () => {
                        activeFilters = [...activeCategories];
                        updateFilterSelection();
                    },
                    onLanguageChange: (lang: string) => {
                        dataVersion++;
                        updateURLParams();
                    },
                }),
                m("#main-content", [
                    m(Timeline as m.ClosureComponent<any>, {
                        data: filteredData,
                        version: dataVersion,
                        language: getLanguage(),
                        handle: timelineHandle,
                        activeIndex: activeIndex,
                        layoutMode: layoutMode,
                        cardBuffer: 10,
                        onActiveIndexChange: (idx) => {
                            activeIndex = idx;
                            updateURLParams();
                        },
                        renderItem: (item) =>
                            m(Card, {
                                card: item,
                                searchQuery: searchQuery,
                                language: getLanguage(),
                            }),
                    }),
                ]),
                m(MiniOverview as m.ClosureComponent<any>, {
                    data: filteredData,
                    allData: allData,
                    searchQuery: searchQuery,
                    matchingCards: matchingCards,
                    activeIndex: activeIndex,
                    language: getLanguage(),
                    onJumpToIndex: (idx, behavior = "smooth") => {
                        if (timelineHandle.scrollToIndex) timelineHandle.scrollToIndex(idx, behavior);
                    },
                }),
            ]);
        },
    };
};

m.mount(document.getElementById("app"), App);
