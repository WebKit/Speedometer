# What is Speedometer?

Speedometer is a benchmark for web browsers that measures Web application responsiveness
by timing simulated user interactions on various workloads. Our primary goal is to make it
reflect the real-world Web as much as possible. When a browser improves its score on the
benchmark, actual users should benefit. In order to achieve this, it should:

-   Test end-to-end user journeys instead of testing specific features in a tight loop. Each
    test should exercise the full set of what’s needed from the engine in order for a user to
    accomplish a task.
-   Evolve over time, adapting to the present Web on a regular basis. This should be informed
    by current usage data, and by consensus about features which are important for engines to
    optimize to provide a consistent experience for users and site authors.
-   Be accessible to the public and useful to browser engineers. It should run in every modern
    browser by visiting a normal web page. It should run relatively quickly, while providing
    enough test coverage to be reflective of the real-world Web.

# Score and Test Measurement

Each test can contain several steps who contributed to the test duration. Note that the prepare step of a test is _unmeasured_ and thus does not contribute to the score. All following test
steps are **measured** and summed up in the test step time.

<img  src="./resources/measurement-timeline.svg" />

Each step consists of the following phases:

<dl>
    <dt>Sync:</dt>
    <dd>Time spent in synchronous JS execution.</dd>
    <dt>Async:</dt>
    <dd>Time spent in asynchronous JS like Promise or setTimeout tasks scheduled by the sync-step.</dd>
</dl>

## Score

The final benchmark score is calculated based of the inverse of [geomean](https://en.wikipedia.org/wiki/Geometric_mean) of all tests. We average the score over multiple iterations with the [arithmetic mean](https://en.wikipedia.org/wiki/Arithmetic_mean). By using the geomean to combine the test durations we maintain the invariant that relative improvements are favoured equally amongst all tests, even though they can have vastly different durations.

<img  src="./resources/score.svg" />
