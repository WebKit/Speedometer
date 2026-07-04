import data from "../src/data/index.js";
import expect from "expect.js";
import { TAGS } from "../src/data/tags.js";

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
                expect(ids.has(item.id)).to.be(false);
                ids.add(item.id);

                expect(item.date).to.be.a("string");
                expect(/^\d{4}-\d{2}-\d{2}$/.test(item.date)).to.be(true);

                expect(item.title).to.be.an("object");
                ["DE", "FR", "IT"].forEach((lang) => {
                    expect(item.title[lang]).to.be.a("string");
                    expect(item.title[lang].length).to.be.greaterThan(0);
                    expect(item.title[lang].includes(" ")).to.be(true);
                });
                expect(titles.has(item.title.DE)).to.be(false);
                titles.add(item.title.DE);

                expect(item.description).to.be.an("object");
                ["DE", "FR", "IT"].forEach((lang) => {
                    expect(item.description[lang]).to.be.a("string");
                    const minLength = 10;
                    expect(item.description[lang].length).to.be.greaterThan(minLength);
                });
                expect(descriptions.has(item.description.DE)).to.be(false);
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
                throw new Error(`Validation failed for item at index ${index} (ID: "${item.id}", Title: "${item.title}"): ${err.message}`);
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
