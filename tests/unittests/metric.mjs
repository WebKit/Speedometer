import expect from "expect.js";
import { Metric } from "../../resources/metric.mjs";

describe("Metric (Data Trees & Serialization)", () => {
    describe("constructor & property enumeration", () => {
        it("should initialize with required string name and default 'ms' unit", () => {
            const metric = new Metric("test-metric");
            expect(metric.name).to.be("test-metric");
            expect(metric.unit).to.be("ms");
            expect(metric.description).to.be("");
            expect(metric.values).to.eql([]);
            expect(metric.mean).to.be(0);
            expect(metric.delta).to.be(0);
            expect(metric.percentDelta).to.be(0);
        });

        it("should accept custom unit strings", () => {
            const metric = new Metric("score-metric", "score");
            expect(metric.unit).to.be("score");
        });

        it("should throw an Error if name is not a string", () => {
            expect(() => new Metric(123)).to.throwError(/Invalid metric\.name=123, expected string/);
            expect(() => new Metric()).to.throwError(/Invalid metric\.name=undefined, expected string/);
        });

        it("should define geomean, parent, and children as non-enumerable properties to prevent JSON.stringify circular reference crashes", () => {
            const root = new Metric("Root");
            const child = new Metric("Root-Child");
            root.addChild(child);

            expect(root.geomean).to.be(0);
            expect(root.children).to.contain(child);
            expect(child.parent).to.be(root);

            const enumeratedKeys = Object.keys(root);
            expect(enumeratedKeys).not.to.contain("geomean");
            expect(enumeratedKeys).not.to.contain("parent");
            expect(enumeratedKeys).not.to.contain("children");

            expect(() => JSON.stringify(root)).not.to.throwError();
            const serialized = JSON.parse(JSON.stringify(root));
            expect(serialized.name).to.be("Root");
            expect(serialized.geomean).to.be(undefined);
            expect(serialized.parent).to.be(undefined);
            expect(serialized.children).to.be(undefined);
        });
    });

    describe("shortName", () => {
        it("should return the full name when no parent is set", () => {
            const metric = new Metric("Suite-Test");
            expect(metric.shortName).to.be("Suite-Test");
        });

        it("should strip the parent name prefix when parent is set", () => {
            const parent = new Metric("Suite");
            const child = new Metric("Suite-Test");
            parent.addChild(child);
            expect(child.shortName).to.be("Test");
        });
    });

    describe("valueString & deltaString", () => {
        it("should format mean and unit when delta or percentDelta is zero", () => {
            const metric = new Metric("Test");
            metric.mean = 10.5;
            metric.delta = 0;
            metric.percentDelta = 0;
            expect(metric.valueString).to.be("10.50 ms");
            expect(metric.deltaString).to.be("");
        });

        it("should format mean, delta, percentDelta, and unit when confidence intervals are computed", () => {
            const metric = new Metric("Test");
            metric.mean = 100.0;
            metric.delta = 2.5;
            metric.percentDelta = 2.5;
            expect(metric.deltaString).to.be("2.50 (2.5%)");
            expect(metric.valueString).to.be("100.00 ± 2.50 (2.5%) ms");
        });
    });

    describe("add() & addChild()", () => {
        it("should add valid numeric values and update length", () => {
            const metric = new Metric("Test");
            metric.add(15);
            metric.add(25);
            expect(metric.values).to.eql([15, 25]);
            expect(metric.length).to.be(2);
        });

        it("should throw when adding non-numeric values", () => {
            const metric = new Metric("Test");
            expect(() => metric.add("not a number")).to.throwError(/Adding invalid value=not a number to metric=Test/);
        });

        it("should throw when re-adding a metric that already has a parent", () => {
            const parent1 = new Metric("Parent1");
            const parent2 = new Metric("Parent2");
            const child = new Metric("Child");
            parent1.addChild(child);
            expect(() => parent2.addChild(child)).to.throwError(/Cannot re-add sub metric/);
        });
    });

    describe("computeAggregatedMetrics()", () => {
        it("should correctly compute sum, min, max, mean, and geomean for numeric samples", () => {
            const metric = new Metric("Test");
            metric.add(10);
            metric.add(20);
            metric.add(30);
            metric.computeAggregatedMetrics();

            expect(metric.sum).to.be(60);
            expect(metric.min).to.be(10);
            expect(metric.max).to.be(30);
            expect(metric.mean).to.be(20);
            // Geomean of (10, 20, 30) = (6000)^(1/3) ~ 18.1712
            expect(metric.geomean).to.be.within(18.17, 18.18);
            expect(metric.delta).to.be.a("number");
            expect(metric.percentDelta).to.be.a("number");
        });

        it("should handle single sample without confidence intervals", () => {
            const metric = new Metric("Single");
            metric.add(42);
            metric.computeAggregatedMetrics();

            expect(metric.sum).to.be(42);
            expect(metric.min).to.be(42);
            expect(metric.max).to.be(42);
            expect(metric.mean).to.be(42);
            expect(metric.geomean).to.be(42);
            expect(metric.delta).to.be(0);
            expect(metric.percentDelta).to.be(0);
        });
    });
});
