// This file can be customized to report results as needed.

(function () {
    if (!window.testRunner && location.search !== "?webkit" && location.hash !== "#webkit")
        return;

    if (window.testRunner)
        window.testRunner.waitUntilDone();

    const scriptElement = document.createElement("script");
    scriptElement.src = "../resources/runner.js";
    document.head.appendChild(scriptElement);

    const styleElement = document.createElement("style");
    styleElement.textContent = "pre { padding-top: 600px; }";
    document.head.appendChild(styleElement);

    let createTest;
    const valuesByIteration = [];

    window.onload = () => {
        document.body.removeChild(document.querySelector("main"));
        startBenchmark();
    };

    window.benchmarkClient = {
        iterationCount: 5, // Use 4 different instances of DRT/WTR to run 5 iterations.
        willStartFirstIteration(iterationCount) {
            createTest = (name, aggregator, isLastTest, unit = "ms") => {
                return {
                    customIterationCount: iterationCount,
                    doNotIgnoreInitialRun: true,
                    doNotMeasureMemoryUsage: true,
                    continueTesting: !isLastTest,
                    unit: unit,
                    name: name,
                    aggregator: aggregator,
                };
            };
            PerfTestRunner.prepareToMeasureValuesAsync(createTest(null, "Geometric"));
        },
        didRunSuites(measuredValues) {
            PerfTestRunner.measureValueAsync(measuredValues.geomean);
            valuesByIteration.push(measuredValues);
        },
        didFinishLastIteration() {
            document.head.removeChild(document.querySelector("style"));

            const measuredValuesByFullName = {};
            function addToMeasuredValue(value, fullName, aggregator) {
                const values = measuredValuesByFullName[fullName] || [];
                measuredValuesByFullName[fullName] = values;
                values.push(value);
                values.aggregator = aggregator;
            }

            const scores = [];
            valuesByIteration.forEach((measuredValues) => {
                scores.push(measuredValues.score);
                for (const suiteName in measuredValues.tests) {
                    const suite = measuredValues.tests[suiteName];
                    for (const testName in suite.tests) {
                        const test = suite.tests[testName];
                        for (const subtestName in test.tests)
                            addToMeasuredValue(test.tests[subtestName], `${suiteName} / ${testName} / ${subtestName}`);
                        addToMeasuredValue(test.total, `${suiteName}/${testName}`, "Total");
                    }
                    addToMeasuredValue(suite.total, suiteName, "Total");
                }
            });

            PerfTestRunner.reportValues(createTest(null, null, false, "pt"), scores);

            const fullNames = [];
            for (const fullName in measuredValuesByFullName)
                fullNames.push(fullName);

            for (let i = 0; i < fullNames.length; i++) {
                const values = measuredValuesByFullName[fullNames[i]];
                PerfTestRunner.reportValues(createTest(fullNames[i], values.aggregator, i + 1 === fullNames.length), values);
            }
        },
    };
})();
