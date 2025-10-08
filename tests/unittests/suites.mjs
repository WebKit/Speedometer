import { ExperimentalSuites } from "../../experimental/tests.mjs";
import { DefaultSuites } from "../../resources/default-tests.mjs";

const Suites = {
    ExperimentalSuites,
    DefaultSuites,
};

for (const [name, suites] of Object.entries(Suites)) {
    describe(`${name}-common`, () => {
        it("should be frozen", () => {
            // FIXME: freeze suite
            // expect(Object.isFrozen(suites)).to.be(true);
        });
        it("should have tags array", () => {
            suites.forEach((suite) => {
                expect(suite.tags).to.be.an("array");
            });
        });
        it("should have frozen tags array", () => {
            // FIXME: freeze suite and tags
            // suites.forEach((suite) => {
            //     expect(Object.isFrozen(suite.tags)).to.be(true);
            // });
        });
        it("should have frozen steps array", () => {
            suites.forEach((suite) => {
                expect(Object.isFrozen(suite.steps)).to.be(true);
            });
        });
        it("should not have duplicate tags", () => {
            suites.forEach((suite) => {
                const uniqueTags = new Set(suite.tags);
                expect(suite.tags).to.eql(Array.from(uniqueTags));
            });
        });
        it("should have 'all' tag", () => {
            // FIXME: freeze suite and tags
            // suites.forEach((suite) => {
            //     expect(suite.tags.includes("all")).to.be(true);
            // });
        });
        it("should not have enabled property", () => {
            suites.forEach((suite) => {
                expect(suite.enabled).to.be(undefined);
            });
        });
        it("should have a name string", () => {
            suites.forEach((suite) => {
                expect(suite.name).to.be.a("string");
                expect(suite.name.length).to.be.greaterThan(0);
            });
        });
        it("should have unique names", () => {
            const uniqueNames = new Set();
            suites.forEach((suite) => {
                expect(uniqueNames.has(suite.name)).to.be(false);
                uniqueNames.add(suite.name);
            });
        });
        it("should have a url string", () => {
            suites.forEach((suite) => {
                expect(suite.url).to.be.a("string");
                expect(suite.url.length).to.be.greaterThan(0);
            });
        });
    });
}

describe("ExperimentalSuites", () => {
    it("should have 'experimental' tag", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.tags.includes("experimental")).to.be(true);
        });
    });
    it("should not have 'default' tag", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.tags.includes("default")).to.be(false);
        });
    });
});

describe("Suites", () => {
    it("should not have 'experimental' tag", () => {
        DefaultSuites.forEach((suite) => {
            expect(suite.tags.includes("experimental")).to.be(false);
        });
    });
    it("should not have enabled property", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.enabled).to.be(undefined);
        });
    });
});
