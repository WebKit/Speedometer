import data from "../src/data/index.js";
import expect from "expect.js";
import { TAGS, getPreciseYear, calculateDensityCurve, getDensityAtYear } from "../src/data/tags.js";
import m from "mithril";
import { Controls } from "../src/components/Controls.js";
import { Timeline } from "../src/components/Timeline.js";
import { t, setLanguage, getLanguage, translations } from "../src/i18n.js";

describe("Timeline Data Validation", () => {
    it("should load data successfully", () => {
        expect(data).to.be.an("array");
        expect(data.length).to.be.greaterThan(0);
    });

    it("should contain items with valid schemas", () => {
        const ids = new Set();
        const titles = new Set();
        const descriptions = new Set();
        data.forEach((item, index) => {
            try {
                expect(item).to.be.an("object");
                expect(item.id).to.be.a("string");
                if (ids.has(item.id)) throw new Error("Duplicate ID: " + item.id);
                ids.add(item.id);

                expect(item.date).to.be.a("string");
                expect(/^\d{4}-\d{2}-\d{2}$/.test(item.date)).to.be(true);

                expect(item.title).to.be.an("object");
                ["DE", "FR", "IT"].forEach((lang) => {
                    expect(item.title[lang]).to.be.a("string");
                    expect(item.title[lang].length).to.be.greaterThan(0);
                });
                if (titles.has(item.title.DE)) throw new Error("Duplicate Title: " + item.title.DE);
                titles.add(item.title.DE);

                expect(item.description).to.be.an("object");
                ["DE", "FR", "IT"].forEach((lang) => {
                    expect(item.description[lang]).to.be.a("string");
                    const minLength = 10;
                    expect(item.description[lang].length).to.be.greaterThan(minLength);
                });
                if (descriptions.has(item.description.DE)) throw new Error("Duplicate Description: " + item.description.DE);
                descriptions.add(item.description.DE);

                expect(item.tags).to.be.an("array");
                expect(item.tags.length).to.be.greaterThan(0);
                item.tags.forEach((tag) => {
                    if (!TAGS[tag]) {
                        throw new Error(`Tag "${tag}" is not in the preset allowed list of tags.`);
                    }
                });

                if (item.width !== undefined) {
                    expect(item.width).to.be.a("number");
                    expect(item.width).to.be.greaterThan(0);
                }

                expect(item.wikiUrl).to.be(undefined);

                expect(item.links).to.be.an("object");
                expect(item.links.wikipedia).to.be.an("object");
                ["DE", "FR", "IT"].forEach((lang) => {
                    expect(item.links.wikipedia[lang]).to.be.a("string");
                    expect(item.links.wikipedia[lang].startsWith("https://")).to.be(true);
                });
            } catch (err) {
                throw new Error(`Validation failed for item at index ${index} (ID: "${item.id}", Title: "${item.title ? item.title.DE : item.title}"): ${err.message}`);
            }
        });
    });

    it("should be chronologically sorted", () => {
        for (let i = 1; i < data.length; i++) expect(data[i].date >= data[i - 1].date).to.be(true);
    });

    it("should fit within MiniOverview range 1900 to 2026", () => {
        data.forEach((item) => {
            const year = parseInt(item.date.substring(0, 4), 10);
            expect(year).to.be.greaterThan(1899);
            expect(year).to.be.lessThan(2027);
        });
    });
});

describe("Density and Moving Average Smooth Window Calculation", () => {
    describe("getPreciseYear", () => {
        it("should parse string dates correctly", () => {
            expect(getPreciseYear("1950-01-01")).to.be(1950);
            expect(Math.abs(getPreciseYear("1950-07-01") - 1950.5)).to.be.lessThan(0.01);
            expect(Math.abs(getPreciseYear("2026-12-31") - 2026.91)).to.be.lessThan(0.01);
        });

        it("should handle numeric years and string years", () => {
            expect(getPreciseYear(1980)).to.be(1980);
            expect(getPreciseYear("1980")).to.be(1980);
        });

        it("should return null for invalid inputs", () => {
            expect(getPreciseYear(null)).to.be(null);
            expect(getPreciseYear(undefined)).to.be(null);
            expect(getPreciseYear("invalid-date")).to.be(null);
            expect(getPreciseYear(NaN)).to.be(null);
        });
    });

    describe("calculateDensityCurve", () => {
        it("should return empty results for empty array or invalid items", () => {
            const res1 = calculateDensityCurve([]);
            expect(res1.maxVal).to.be(0);
            expect(res1.path).to.be("");
            expect(res1.areaPath).to.be("");

            const res2 = calculateDensityCurve([{}, { date: "invalid" }]);
            expect(res2.maxVal).to.be(0);
            expect(res2.path).to.be("");
            expect(res2.areaPath).to.be("");
        });

        it("should calculate a smooth moving average window for a single card with Hann cosine kernel", () => {
            const items = [{ date: "1950-06-01" }];
            const res = calculateDensityCurve(items, { startYear: 1900, endYear: 2026, windowYears: 6, maxHeight: 75 });
            expect(res.maxVal).to.be.greaterThan(0);
            expect(res.points.length).to.be(127); // 1900 to 2026 inclusive
            expect(res.path.startsWith("M ")).to.be(true);
            expect(res.areaPath.startsWith("M ")).to.be(true);
            expect(res.areaPath.endsWith(" Z")).to.be(true);

            const point1950 = res.points.find((p) => p.year === 1950);
            expect(point1950.y).to.be(25); // 100 - maxHeight (100 - 75 = 25)

            const point1953 = res.points.find((p) => p.year === 1953);
            expect(point1953.value).to.be.greaterThan(0);
            expect(point1953.value).to.be.lessThan(point1950.value);

            const point1960 = res.points.find((p) => p.year === 1960);
            expect(point1960.value).to.be(0);
            expect(point1960.y).to.be(100);
        });

        it("should calculate density correctly for multiple cards in different categories/years", () => {
            const items = [{ date: "1970-01-01" }, { date: "1971-01-01" }, { date: "1972-01-01" }, { date: "2000-01-01" }];
            const res = calculateDensityCurve(items, { startYear: 1900, endYear: 2026, windowYears: 5, maxHeight: 80 });
            expect(res.maxVal).to.be.greaterThan(1);

            const point1971 = res.points.find((p) => p.year === 1971);
            const point2000 = res.points.find((p) => p.year === 2000);
            expect(point1971.value).to.be.greaterThan(point2000.value);
            expect(point1971.y).to.be.lessThan(point2000.y);
        });
    });

    describe("getDensityAtYear", () => {
        it("should compute higher density and item counts near clustered events", () => {
            const data = [{ date: "1970-01-01" }, { date: "1970-06-01" }, { date: "1971-01-01" }, { date: "1971-06-01" }, { date: "1972-01-01" }, { date: "1990-01-01" }];
            const res = calculateDensityCurve(data, { startYear: 1900, endYear: 2000, windowYears: 4, maxHeight: 80 });

            const density1971 = getDensityAtYear(1971, res, data, 4);
            const density1990 = getDensityAtYear(1990, res, data, 4);
            const density1920 = getDensityAtYear(1920, res, data, 4);

            expect(density1971.density).to.be.greaterThan(density1990.density);
            expect(density1990.density).to.be.greaterThan(density1920.density);
            expect(density1971.itemsInWindow).to.be(5);
            expect(density1990.itemsInWindow).to.be(1);
            expect(density1920.itemsInWindow).to.be(0);
        });
    });
});

describe("Timeline Tag Filtering Logic", () => {
    it("should filter data correctly when activeFilters is set to a single tag (double-click behavior)", () => {
        const allTags = Object.keys(TAGS);
        allTags.forEach((singleTag) => {
            let activeFilters = ["hardware", "software", singleTag];
            activeFilters = [singleTag];
            expect(activeFilters.length).to.be(1);
            expect(activeFilters[0]).to.be(singleTag);
            const filtered = data.filter((card) => card.tags && card.tags.some((tag) => activeFilters.includes(tag)));
            if (filtered.length > 0) {
                filtered.forEach((card) => {
                    expect(card.tags).to.contain(singleTag);
                });
            }
        });
    });

    it("should select ONLY the double-clicked tag when calling onFilterOnly", () => {
        let activeFilters = ["hardware", "software", "ai"];
        const onFilterOnly = (tag) => {
            activeFilters = [tag];
        };
        onFilterOnly("ai");
        expect(activeFilters.length).to.be(1);
        expect(activeFilters[0]).to.be("ai");
    });

    it("should select ALL tags when double-clicking Filter label or calling onSelectAllTags / onResetFilters", () => {
        let activeFilters = ["hardware"];
        const onSelectAllTags = () => {
            activeFilters = Object.keys(TAGS);
        };
        onSelectAllTags();
        expect(activeFilters.length).to.be(Object.keys(TAGS).length);
        expect(activeFilters).to.contain("hardware");
        expect(activeFilters).to.contain("software");
    });

    it("should trigger onSelectAllTags / onResetFilters via ondblclick handler on Controls filter header and panel", () => {
        let activeFilters = ["hardware"];
        let selectAllCalled = false;
        const vnode = {
            attrs: {
                activeFilters,
                onSelectAllTags: () => {
                    selectAllCalled = true;
                    activeFilters = Object.keys(TAGS);
                },
                searchQuery: "",
                suggestions: [],
                showSuggestions: false,
                layoutMode: "virtual",
            },
        };
        const res = Controls.view(vnode);
        expect(res).to.be.an("object");

        function findDblClickVnodes(v) {
            let found = [];
            if (!v) return found;
            if (v.attrs && typeof v.attrs.ondblclick === "function") {
                found.push(v);
            }
            if (Array.isArray(v)) {
                for (const child of v) found = found.concat(findDblClickVnodes(child));
            } else if (v.children) {
                found = found.concat(findDblClickVnodes(v.children));
            }
            return found;
        }

        const dblClickNodes = findDblClickVnodes(res);
        expect(dblClickNodes.length).to.be.greaterThan(0);

        const filterHeaderNode = dblClickNodes.find((n) => {
            const cls = n.attrs ? n.attrs.class || n.attrs.className || "" : "";
            const tag = typeof n.tag === "string" ? n.tag : "";
            return cls.includes("group-label") || cls.includes("filter-group") || tag.includes("group-label");
        });
        expect(filterHeaderNode).to.not.be(undefined);

        let stopped = false;
        filterHeaderNode.attrs.ondblclick({
            stopPropagation: () => {
                stopped = true;
            },
        });
        expect(selectAllCalled).to.be(true);
        expect(activeFilters.length).to.be(Object.keys(TAGS).length);

        selectAllCalled = false;
        activeFilters = ["hardware"];
        const filterPanelNode = dblClickNodes.find((n) => {
            const id = n.attrs ? n.attrs.id || "" : "";
            return id === "filter-panel";
        });
        expect(filterPanelNode).to.not.be(undefined);
        filterPanelNode.attrs.ondblclick({ stopPropagation: () => {} });
        expect(selectAllCalled).to.be(true);
        expect(activeFilters.length).to.be(Object.keys(TAGS).length);
    });
});

describe("Density Graph & FLOPS Layout Bounds", () => {
    it("should map logVal within 0% to 100% bounds for minLog -4 and maxLog 19", () => {
        const minLog = -4;
        const maxLog = 19;
        const logRange = maxLog - minLog;
        const getY = (logVal) => 100 - ((logVal - minLog) / logRange) * 100;
        expect(getY(18)).to.be.greaterThan(0);
        expect(getY(18)).to.be.lessThan(100);
        expect(getY(-3)).to.be.greaterThan(0);
        expect(getY(-3)).to.be.lessThan(100);
    });

    it("should generate valid density curve paths for active data points", () => {
        const res = calculateDensityCurve(data, { startYear: 1900, endYear: 2026, windowYears: 6, maxHeight: 85 });
        expect(res.path.startsWith("M ")).to.be(true);
    });
});

describe("Timeline Empty State and Translations", () => {
    function getVnodeText(v) {
        if (!v) return "";
        if (typeof v === "string" || typeof v === "number") return String(v);
        if (Array.isArray(v)) return v.map(getVnodeText).join("");
        if (v.text !== undefined) return String(v.text);
        if (v.children) return getVnodeText(v.children);
        return "";
    }

    function findVnodes(vnode, predicate) {
        let results = [];
        if (!vnode) return results;
        if (predicate(vnode)) results.push(vnode);
        if (Array.isArray(vnode)) {
            for (const child of vnode) {
                results = results.concat(findVnodes(child, predicate));
            }
        } else if (vnode.children) {
            results = results.concat(findVnodes(vnode.children, predicate));
        }
        return results;
    }

    const isEmptyState = (v) => {
        const cls = v && v.attrs ? v.attrs.class || v.attrs.className || "" : "";
        return cls.includes("empty-state");
    };

    it("should provide translation strings for \x27noMatches\x27 across all 3 supported languages in i18n.ts", () => {
        const supportedLangs = ["DE", "FR", "IT"];
        const expectedSubstrings = {
            DE: "Keine Treffer",
            FR: "Aucun résultat",
            IT: "Nessun risultato",
        };
        supportedLangs.forEach((lang) => {
            expect(translations[lang]).to.be.an("object");
            expect(translations[lang].noMatches).to.be.a("string");
            expect(translations[lang].noMatches.length).to.be.greaterThan(0);
            expect(translations[lang].noMatches).to.contain(expectedSubstrings[lang]);

            setLanguage(lang);
            expect(getLanguage()).to.be(lang);
            expect(t("noMatches")).to.be(translations[lang].noMatches);
        });
    });

    it("should render empty state message with t(\x27noMatches\x27) when 0 cards are displayed on timeline", () => {
        setLanguage("DE");
        const timelineComp = Timeline();
        const vnode = {
            attrs: {
                data: [],
                version: 1,
                language: "DE",
                layoutMode: "virtual",
                renderItem: () => m("div"),
            },
        };
        timelineComp.oninit(vnode);
        const resDE = timelineComp.view(vnode);

        const emptyNodes = findVnodes(resDE, isEmptyState);
        expect(emptyNodes.length).to.be.greaterThan(0);
        const textDE = getVnodeText(emptyNodes[0]);
        expect(textDE).to.contain("Keine Treffer gefunden");
    });

    it("should dynamically re-evaluate empty state translation on language switch (Mithril safeguard rule)", () => {
        setLanguage("DE");
        const timelineComp = Timeline();
        const vnode = {
            attrs: {
                data: [],
                version: 1,
                language: "DE",
                layoutMode: "virtual",
                renderItem: () => m("div"),
            },
        };
        timelineComp.oninit(vnode);
        let res = timelineComp.view(vnode);
        let nodes = findVnodes(res, isEmptyState);
        expect(getVnodeText(nodes[0])).to.contain("Keine Treffer gefunden");

        // Switch to FR
        setLanguage("FR");
        vnode.attrs.language = "FR";
        vnode.attrs.version = 2;
        timelineComp.onbeforeupdate(vnode);
        res = timelineComp.view(vnode);
        nodes = findVnodes(res, isEmptyState);
        expect(getVnodeText(nodes[0])).to.contain("Aucun résultat trouvé");

        // Switch to IT
        setLanguage("IT");
        vnode.attrs.language = "IT";
        vnode.attrs.version = 3;
        timelineComp.onbeforeupdate(vnode);
        res = timelineComp.view(vnode);
        nodes = findVnodes(res, isEmptyState);
        expect(getVnodeText(nodes[0])).to.contain("Nessun risultato trovato");
    });
});
