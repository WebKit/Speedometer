import { Params, defaultParams } from "../../resources/shared/params.mjs";

describe("Params", () => {
    describe("toSearchParams", () => {
        it("should be empty for defaultParams", () => {
            expect(defaultParams.toSearchParams()).to.equal("");
        });
        it("should be empty for empty Params", () => {
            const params = new Params();
            expect(params.tags).to.eql(["default"]);
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
        it("should ignore a single default tag", () => {
            const params = new Params(
                new URLSearchParams({
                    tags: ["default"],
                })
            );
            expect(params.toSearchParams()).to.equal("");
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
        it("should support no suites", () => {
            const params = new Params(
                new URLSearchParams({
                    suites: "",
                })
            );
            expect(params.toSearchParams()).to.equal("suites=");
        });
    });
    describe("isDefault", () => {
        it("should return true for defaultParams", () => {
            expect(defaultParams.isDefault()).to.be(true);
        });
        it("should return false for newly instantiated empty Params", () => {
            const params = new Params();
            expect(params.isDefault()).to.be(false);
        });
        it("should return false for custom params", () => {
            const params = new Params(
                new URLSearchParams({
                    iterationCount: "100",
                })
            );
            expect(params.isDefault()).to.be(false);
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
        it("should warn on unused params when warnUnused is true", () => {
            const consoleErrorStub = sinon.stub(console, "error");
            try {
                new Params(new URLSearchParams({ unknownParam: "value" }), true);
                expect(consoleErrorStub.calledOnce).to.be(true);
                expect(consoleErrorStub.calledWith("Got unused search params: unknownParam")).to.be(true);
            } finally {
                consoleErrorStub.restore();
            }
        });
        it("should not warn on unused params when warnUnused is false", () => {
            const consoleErrorStub = sinon.stub(console, "error");
            try {
                new Params(new URLSearchParams({ unknownParam: "value" }), false);
                expect(consoleErrorStub.called).to.be(false);
            } finally {
                consoleErrorStub.restore();
            }
        });
        it("should generate a random integer shuffleSeed in [0, 65536) when shuffleSeed is 'generate'", () => {
            sinon.stub(Math, "random").returns(0.5);
            sinon.stub(console, "log");
            const params = new Params(
                new URLSearchParams({
                    shuffleSeed: "generate",
                })
            );
            expect(params.shuffleSeed).to.equal(32768);
        });
        it("should parse explicit integer shuffleSeed and reject invalid shuffleSeed", () => {
            const validParams = new Params(new URLSearchParams({ shuffleSeed: "12345" }));
            expect(validParams.shuffleSeed).to.equal(12345);

            expect(() => new Params(new URLSearchParams({ shuffleSeed: "not-a-seed" }))).to.throwError(/Invalid shuffle seed: 'NaN', must be either 'off', 'generate' or an integer\./);
        });
        it("should include the actual parameter key in error messages for invalid int or number params", () => {
            expect(() => new Params(new URLSearchParams({ iterationCount: "0" }))).to.throwError(/Invalid iterationCount param: '0', value must be >= 1\./);
            expect(() => new Params(new URLSearchParams({ warmupBeforeSync: "abc" }))).to.throwError(/Invalid warmupBeforeSync param: 'abc', expected Number\./);
            expect(() => new Params(new URLSearchParams({ complexity: "-1" }))).to.throwError(/Invalid complexity param: '-1', value must be >= 0\./);
        });
        it("should reject invalid viewport dimensions", () => {
            expect(() => new Params(new URLSearchParams({ viewport: "0x600" }))).to.throwError(/Invalid viewport\.width param: '0', value must be >= 1\./);
            expect(() => new Params(new URLSearchParams({ viewport: "800x0" }))).to.throwError(/Invalid viewport\.height param: '0', value must be >= 1\./);
            expect(() => new Params(new URLSearchParams({ viewport: "800" }))).to.throwError(/Invalid viewport param: 800/);
            expect(() => new Params(new URLSearchParams({ viewport: "abcxdef" }))).to.throwError(/Invalid viewport\.width param: 'abc', expected Number\./);
        });
    });
});
