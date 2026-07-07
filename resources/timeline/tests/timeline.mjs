import data from "../src/data/index.js";
import expect from "expect.js";
import { TAGS, getPreciseYear, calculateDensityCurve, getDensityAtYear } from "../src/data/tags.js";

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
            const items = [
                { date: "1970-01-01" },
                { date: "1971-01-01" },
                { date: "1972-01-01" },
                { date: "2000-01-01" }
            ];
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
            const data = [
                { date: "1970-01-01" },
                { date: "1970-06-01" },
                { date: "1971-01-01" },
                { date: "1971-06-01" },
                { date: "1972-01-01" },
                { date: "1990-01-01" }
            ];
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
