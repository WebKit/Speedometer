export function freezeSuites(suites) {
    suites = suites.map((suite) => {
        // FIXME: freeze tags
        // suite.tags = Object.freeze(suite.tags);
        suite.steps = Object.freeze(suite.steps);
        // FIXME: freeze suite after fixing the benchmark-configurator.
        // return Object.freeze(suite);
        return suite;
    });
    return suites;
}
