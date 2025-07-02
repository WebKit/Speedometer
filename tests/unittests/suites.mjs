import { ExperimentalSuites } from "../../experimental/tests.mjs";
import { Suites } from "../../resources/tests.mjs";

describe("ExperimentalSuites", () => {
    it("should be frozen", () => {
        expect(Object.isFrozen(ExperimentalSuites)).to.be(true);
    });
    it("should have tags array", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.tags).to.be.an("array");
        });
    });
    it("should have frozen tags array", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(Object.isFrozen(suite.tags)).to.be(true);
        });
    });
    it("should have frozen steps array", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(Object.isFrozen(suite.tags)).to.be(true);
        });
    });
    it("should have 'experimental' tag", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.tags.includes("experimental"));
        });
    });
    it("should be disabled by default", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.disabled).to.be(true);
        });
    });
    it("should have experimental url", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.url.startsWith("experimental/"));
        });
    });
    it("should have unique names", () => {
        const uniqueNames = new Set();
        ExperimentalSuites.forEach((suite) => {
            expect(uniqueNames.has(suite.name)).to.be(false);
            uniqueNames.add(suite.name);
        });
    });
});

describe("Suites", () => {
    it("should be frozen", () => {
        expect(Object.isFrozen(Suites)).to.be(true);
    });
    it("should have tags array", () => {
        Suites.forEach((suite) => {
            expect(suite.tags).to.be.an("array");
        });
    });
    it("should have frozen tags array", () => {
        Suites.forEach((suite) => {
            expect(Object.isFrozen(suite.tags)).to.be(true);
        });
    });
    it("should have frozen steps array", () => {
        Suites.forEach((suite) => {
            expect(Object.isFrozen(suite.tags)).to.be(true);
        });
    });
    it("should have 'all' tags", () => {
        Suites.forEach((suite) => {
            expect(suite.tags.includes("all")).to.be(true);
            expect(suite.tags[0]).to.be("all");
        });
    });
    it("default suites should be enabled by default", () => {
        Suites.forEach((suite) => {
            if (suite.tags.includes("default"))
                expect(!suite.disabled);
        });
    });
    it("should have 'default' and not 'experimental' tag", () => {
        Suites.forEach((suite) => {
            if (suite.tags.includes("experimental"))
                expect(!suite.tags.includes("default"));
        });
    });
    it("should not have duplicate tags", () => {
        Suites.forEach((suite) => {
            const uniqueTags = new Set(suite.tags);
            expect(suite.tags).to.eql(Array.from(uniqueTags));
        });
    });
    it("should have a name string", () => {
        Suites.forEach((suite) => {
            expect(suite.name).to.be.a("string");
            expect(suite.name.length).to.be.greaterThan(0);
        });
    });
    it("should have a url string", () => {
        Suites.forEach((suite) => {
            expect(suite.url).to.be.a("string");
            expect(suite.url.length).to.be.greaterThan(0);
        });
    });
    it("should have unique names", () => {
        const uniqueNames = new Set();
        Suites.forEach((suite) => {
            expect(uniqueNames.has(suite.name)).to.be(false);
            uniqueNames.add(suite.name);
        });
    });
});
