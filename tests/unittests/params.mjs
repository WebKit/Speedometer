import { Params, defaultParams } from "../../resources/shared/params.mjs";

describe("Params", () => {
    describe("toSearchParams", () => {
        it("should be empty for defaultParams", () => {
            expect(defaultParams.toSearchParams()).to.equal("");
        });
        it("should be empty for empty Params", () => {
            const params = new Params();
            expect(params.toSearchParams()).to.equal("");
        });
        it("should contain custom viewport", () => {
            const params = new Params(
                new URLSearchParams({
                    viewport: "100x200",
                })
            );
            expect(params.toSearchParams()).to.equal("viewport=100x200");
        });
        it("should not contain default viewport", () => {
            const params = new Params(
                new URLSearchParams({
                    viewport: "800x600",
                })
            );
            expect(params.toSearchParams()).to.equal("");
        });
        it("should contain custom iterationCount", () => {
            const params = new Params(
                new URLSearchParams({
                    iterationCount: "100",
                })
            );
            expect(params.toSearchParams()).to.equal("iterationCount=100");
        });
        it("should contain single suite", () => {
            const params = new Params(
                new URLSearchParams({
                    suites: "Suite1",
                })
            );
            expect(params.toSearchParams()).to.equal("suites=Suite1");
        });
        it("should contain multiple single suite", () => {
            const params = new Params(
                new URLSearchParams({
                    suites: "SuiteB,Suite1,SuiteA",
                })
            );
            expect(params.toSearchParams()).to.equal("suites=SuiteB%2CSuite1%2CSuiteA");
        });
        it("should contain multiple tags", () => {
            const params = new Params(
                new URLSearchParams({
                    tags: "tagB,tag1,tagA",
                })
            );
            expect(params.toSearchParams()).to.equal("tags=tagB%2Ctag1%2CtagA");
        });
    });

    describe("parse input params", () => {
        it("should parse custom viewport", () => {
            const params = new Params(
                new URLSearchParams({
                    viewport: "100x300",
                })
            );
            expect(params.viewport).to.eql({ width: 100, height: 300 });
        });
        it("should parse custom iterationCount", () => {
            const params = new Params(
                new URLSearchParams({
                    iterationCount: "100",
                })
            );
            expect(params.iterationCount).to.equal(100);
        });
        it("should parse custom tags", () => {
            const params = new Params(
                new URLSearchParams({
                    tags: "tagB,tag1,tagA",
                })
            );
            expect(params.tags).to.eql(["tagB", "tag1", "tagA"]);
        });
        it("should parse custom suites", () => {
            const params = new Params(
                new URLSearchParams({
                    suites: "SuiteB,Suite1,SuiteA",
                })
            );
            expect(params.suites).to.eql(["SuiteB", "Suite1", "SuiteA"]);
        });
    });
});
