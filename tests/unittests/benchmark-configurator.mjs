import { BenchmarkConfigurator } from "../../resources/benchmark-configurator.mjs";

describe("BenchmarkConfigurator", () => {
    it("should set measurePrepare to false on processed suites if not present", async () => {
        const configurator = new BenchmarkConfigurator();
        await configurator.init();
        const suites = configurator.suites;
        expect(suites.length).to.be.greaterThan(0);
        suites.forEach((suite) => {
            expect(suite).to.have.property("measurePrepare");
            expect(suite.measurePrepare).to.be.a("boolean");
        });
    });

    it("should validate URLs correctly in _isValidUrl", () => {
        const configurator = new BenchmarkConfigurator();
        expect(configurator._isValidUrl("http://example.com")).to.be(true);
        expect(configurator._isValidUrl("suites/todomvc/index.html")).to.be(true);
        expect(configurator._isValidUrl("")).to.be(false);
        expect(configurator._isValidUrl(null)).to.be(false);
    });

    it("should enable suites by names", async () => {
        const configurator = new BenchmarkConfigurator();
        await configurator.init();
        const firstSuiteName = configurator.suites[0].name;
        configurator.enableSuites([firstSuiteName], []);
        expect(configurator.suites[0].enabled).to.be(true);
        // Assuming there are multiple suites
        expect(configurator.suites[1].enabled).to.be(false);
    });

    it("should enable suites by tags", async () => {
        const configurator = new BenchmarkConfigurator();
        await configurator.init();
        configurator.enableSuites([], ["todomvc"]);
        const todomvcSuites = configurator.suites.filter((suite) => suite.tags.includes("todomvc"));
        const otherSuites = configurator.suites.filter((suite) => !suite.tags.includes("todomvc"));
        todomvcSuites.forEach((suite) => expect(suite.enabled).to.be(true));
        otherSuites.forEach((suite) => expect(suite.enabled).to.be(false));
    });
});
