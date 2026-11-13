import * as Statistics from "../../resources/statistics.mjs";

describe("Statistics", () => {
    describe("basic reducers (max, min, sum, product, squareSum)", () => {
        it("should compute max and min correctly", () => {
            expect(Statistics.max([10, 40, 20, 30])).to.be(40);
            expect(Statistics.min([10, 40, 20, 30])).to.be(10);
            expect(Statistics.max([-5, -2, -10])).to.be(-2);
            expect(Statistics.min([-5, -2, -10])).to.be(-10);
            expect(Statistics.max([])).to.be(-Infinity);
            expect(Statistics.min([])).to.be(Infinity);
        });

        it("should compute sum, product, and squareSum correctly", () => {
            expect(Statistics.sum([])).to.be(0);
            expect(Statistics.product([])).to.be(1);
            expect(Statistics.squareSum([])).to.be(0);

            expect(Statistics.sum([2, 3, 4])).to.be(9);
            expect(Statistics.product([2, 3, 4])).to.be(24);
            expect(Statistics.squareSum([2, 3, 4])).to.be(29);
        });
    });

    describe("sampleStandardDeviation()", () => {
        it("should return 0 when numberOfSamples is less than 2", () => {
            expect(Statistics.sampleStandardDeviation(0, 0, 0)).to.be(0);
            expect(Statistics.sampleStandardDeviation(1, 42, 42 * 42)).to.be(0);
        });

        it("should compute sample standard deviation for varied samples", () => {
            const values = [2, 4, 4, 4, 5, 5, 7, 9];
            const sum = Statistics.sum(values);
            const sqSum = Statistics.squareSum(values);
            const stdDev = Statistics.sampleStandardDeviation(values.length, sum, sqSum);
            expect(stdDev).to.be.within(2.138, 2.1381);
        });

        it("should clamp negative floating-point rounding residuals to 0 for identical samples", () => {
            const negativeResidualCandidates = [Array(3).fill(0.1), Array(6).fill(0.3), Array(10).fill(0.7), Array(10).fill(1000 / 3)];

            for (const values of negativeResidualCandidates) {
                const sum = Statistics.sum(values);
                const sqSum = Statistics.squareSum(values);
                const stdDev = Statistics.sampleStandardDeviation(values.length, sum, sqSum);
                expect(isNaN(stdDev)).to.be(false);
                expect(stdDev).to.be(0);
            }
        });
    });

    describe("supportedConfidenceLevels() & confidenceIntervalDelta()", () => {
        it("should list supported confidence levels", () => {
            expect(Statistics.supportedConfidenceLevels()).to.eql(["0.80", "0.90", "0.95", "0.98"]);
        });

        it("should throw for unsupported confidence levels", () => {
            expect(() => Statistics.confidenceIntervalDelta(0.99, 5, 50, 500)).to.throwError(/We only support 80%, 90%, 95%, 98% confidence intervals\./);
        });

        it("should return NaN when numberOfSamples is less than 2", () => {
            expect(isNaN(Statistics.confidenceIntervalDelta(0.95, 0, 0, 0))).to.be(true);
            expect(isNaN(Statistics.confidenceIntervalDelta(0.95, 1, 10, 100))).to.be(true);
        });

        it("should return 0 delta (not NaN) when all samples are identical floating-point numbers", () => {
            const values = Array(10).fill(1000 / 3);
            const delta = Statistics.confidenceIntervalDelta(0.95, values.length, Statistics.sum(values), Statistics.squareSum(values));
            expect(isNaN(delta)).to.be(false);
            expect(delta).to.be(0);
        });

        it("should compute confidence interval delta for 2 samples (1 degree of freedom)", () => {
            const values = [10, 20];
            const sum = Statistics.sum(values);
            const sqSum = Statistics.squareSum(values);
            const stdDev = Statistics.sampleStandardDeviation(2, sum, sqSum);
            // For confidenceLevel = 0.95 (probability = 0.975), df = 1 quantile is 12.706205
            const expectedDelta = (12.706205 * stdDev) / Math.sqrt(2);
            const delta = Statistics.confidenceIntervalDelta(0.95, 2, sum, sqSum);
            expect(delta).to.be.within(expectedDelta - 1e-6, expectedDelta + 1e-6);
        });

        it("should clamp degreesOfFreedom > 100 to the 100th entry in the t-distribution table", () => {
            const n = 102; // degreesOfFreedom = 101 > 100
            const values = Array.from({ length: n }, (_, i) => i + 1);
            const sum = Statistics.sum(values);
            const sqSum = Statistics.squareSum(values);
            const stdDev = Statistics.sampleStandardDeviation(n, sum, sqSum);
            // Last entry (index 99, df = 100) for probability 0.975 is 1.983972
            const expectedDelta = (1.983972 * stdDev) / Math.sqrt(n);
            const delta = Statistics.confidenceIntervalDelta(0.95, n, sum, sqSum);
            expect(delta).to.be.within(expectedDelta - 1e-9, expectedDelta + 1e-9);
        });
    });

    describe("confidenceInterval()", () => {
        it("should compute [mean - delta, mean + delta] with default 0.95 confidence level", () => {
            const values = [10, 20, 30];
            const interval = Statistics.confidenceInterval(values);
            const delta = Statistics.confidenceIntervalDelta(0.95, 3, 60, 1400);
            expect(interval[0]).to.be.within(20 - delta - 1e-9, 20 - delta + 1e-9);
            expect(interval[1]).to.be.within(20 + delta - 1e-9, 20 + delta + 1e-9);
        });

        it("should return [mean, mean] when all samples are identical floating-point values", () => {
            const values = Array(10).fill(1000 / 3);
            const mean = Statistics.sum(values) / values.length;
            const interval = Statistics.confidenceInterval(values, 0.95);
            expect(interval).to.eql([mean, mean]);
        });
    });
});
