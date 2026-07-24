import { BenchmarkRunner, BenchmarkTestStep } from "../../resources/benchmark-runner.mjs";
import { SuiteRunner } from "../../resources/suite-runner.mjs";
import { StepRunner, AsyncStepRunner } from "../../resources/shared/step-runner.mjs";
import { STEP_SCHEDULER_LOOKUP } from "../../resources/shared/step-scheduler.mjs";
import { defaultParams } from "../../resources/shared/params.mjs";
import { skipInShell } from "../../resources/shared/helpers.mjs";

function TEST_FIXTURE(name) {
    return {
        name,
        run: sinon.stub(),
    };
}

const SUITES_FIXTURE = [
    {
        name: "Suite 1",
        async prepare(page) {},
        enabled: true,
        tests: [TEST_FIXTURE("Test 1"), TEST_FIXTURE("Test 2"), TEST_FIXTURE("Test 3")],
    },
    {
        name: "Suite 2",
        async prepare(page) {},
        enabled: true,
        tests: [TEST_FIXTURE("Test 1")],
    },
];

const CLIENT_FIXTURE = {
    willRunTest: sinon.stub(),
    didFinishSuite: sinon.stub(),
    didRunSuites: sinon.stub(),
};

describe("BenchmarkRunner", () => {
    const { spy, stub, assert } = sinon;
    let runner;

    before(function () {
        skipInShell(this);
        runner = new BenchmarkRunner(SUITES_FIXTURE, CLIENT_FIXTURE);
    });

    it("should be defined", () => {
        expect(runner).not.to.be(undefined);
    });

    describe("Frame", () => {
        describe("_removeFrame", () => {
            let frame, removeChildSpy;

            before(async () => {
                frame = await runner._appendFrame();

                removeChildSpy = spy(frame.parentNode, "removeChild");
            });

            it("should remove the frame if a frame is defined", () => {
                expect(runner._frame).to.equal(frame);

                runner._removeFrame();

                assert.calledWith(removeChildSpy, frame);
                expect(runner._frame).to.equal(null);
            });
        });

        describe("_appendFrame", () => {
            const DEFAULT_WIDTH = defaultParams.viewport.width;
            const DEFAULT_HEIGHT = defaultParams.viewport.height;
            it(`should create an absolutely positioned iframe with ${DEFAULT_WIDTH}px x ${DEFAULT_WIDTH}px dimensions`, async () => {
                const createElementSpy = spy(document, "createElement");

                const frame = await runner._appendFrame();
                expect(frame).to.be.a(HTMLIFrameElement);
                assert.calledWith(createElementSpy, frame.nodeName.toLowerCase());

                const { width, height, position } = getComputedStyle(frame);

                expect(parseInt(width)).to.equal(DEFAULT_WIDTH);
                expect(parseInt(height)).to.equal(DEFAULT_HEIGHT);
                expect(position).to.be("absolute");
            });

            it("should disable scrolling in the frame", async () => {
                const { scrolling } = await runner._appendFrame();
                expect(scrolling).to.be("no");
            });

            it("should insert the frame as the first child in the document body", async () => {
                const firstChild = document.createTextNode("First Child");
                const insertBeforeSpy = spy(document.body, "insertBefore");

                document.body.prepend(firstChild);

                const frame = await runner._appendFrame();
                assert.calledWith(insertBeforeSpy, frame, firstChild);

                document.body.removeChild(firstChild); // clean up
            });
        });
    });

    describe("Suite", () => {
        describe("runAllSuites", () => {
            let _runSuiteStub, _finalizeStub, _loadFrameStub, _appendFrameStub, _removeFrameStub;

            before(async () => {
                _runSuiteStub = stub(SuiteRunner.prototype, "_runSuite").callsFake(async () => null);
                _finalizeStub = stub(runner, "_finalize").callsFake(async () => null);
                _loadFrameStub = stub(SuiteRunner.prototype, "_loadFrame").callsFake(async () => null);
                _appendFrameStub = stub(runner, "_appendFrame").callsFake(async () => null);
                _removeFrameStub = stub(runner, "_removeFrame").callsFake(() => null);
                runner._suites.forEach((suite) => spy(suite, "prepare"));
                expect(runner._suites).not.to.have.length(0);
                await runner.runAllSuites();
            });

            it("should call prepare on all suites", () => {
                let suitesPrepareCount = 0;
                for (const suite of runner._suites) {
                    suitesPrepareCount += 1;
                    assert.calledOnce(suite.prepare);
                }
                expect(suitesPrepareCount).equal(SUITES_FIXTURE.length);
            });

            it("should run all test suites", async () => {
                assert.calledTwice(_runSuiteStub);
            });

            it("should remove the previous frame and then the current frame", () => {
                assert.calledTwice(_loadFrameStub);
                assert.calledTwice(_appendFrameStub);
                assert.calledTwice(_removeFrameStub);
            });

            it("should fire the function responsible for finalizing results", () => {
                assert.calledOnce(_finalizeStub);
            });
        });

        describe("runSuite", () => {
            let _prepareSuiteSpy, _loadFrameStub, _runTestStub, _validateSuiteResultsStub, _suitePrepareSpy, performanceMarkSpy;

            const suite = SUITES_FIXTURE[0];

            before(async () => {
                _prepareSuiteSpy = spy(SuiteRunner.prototype, "_prepareSuite");
                _loadFrameStub = stub(SuiteRunner.prototype, "_loadFrame").callsFake(async () => null);
                _runTestStub = stub(StepRunner.prototype, "runStep").callsFake(async () => ({ syncTime: 0, asyncTime: 0 }));
                _validateSuiteResultsStub = stub(SuiteRunner.prototype, "_validateSuiteResults").callsFake(async () => null);
                performanceMarkSpy = spy(window.performance, "mark");
                _suitePrepareSpy = spy(suite, "prepare");

                await runner.runSuite(suite);
            });

            it("should prepare the suite first", async () => {
                assert.calledOnce(_prepareSuiteSpy);
                assert.calledOnce(_suitePrepareSpy);
                assert.calledOnce(_loadFrameStub);
            });

            it("should run and record results for every test in suite", async () => {
                assert.calledThrice(_runTestStub);
                assert.calledOnce(_validateSuiteResultsStub);
                assert.calledWith(performanceMarkSpy, "suite-Suite 1-prepare-start");
                assert.calledWith(performanceMarkSpy, "suite-Suite 1-prepare-end");
                assert.calledWith(performanceMarkSpy, "suite-Suite 1-start");
                assert.calledWith(performanceMarkSpy, "suite-Suite 1-end");
                expect(performanceMarkSpy.callCount).to.equal(4);
                assert.calledOnce(runner._client.didFinishSuite);
            });
        });
    });

    describe("Test", () => {
        describe("_runTestAndRecordResults", () => {
            let performanceMarkSpy;

            const suite = SUITES_FIXTURE[0];
            const params = { measurementMethod: "raf" };

            before(async () => {
                runner._suite = suite;
                await runner._appendFrame();
                performanceMarkSpy = spy(window.performance, "mark");
                const suiteRunner = new SuiteRunner(runner._frame, runner._page, params, suite, runner._client, runner._measuredValues);
                await suiteRunner._runSuite();
            });

            it("should run client pre and post hooks if present", () => {
                assert.calledWith(runner._client.willRunTest, suite, suite.tests[0]);
            });

            it("should write performance marks at the start and end of the test with the correct test name", () => {
                assert.calledWith(performanceMarkSpy, "Suite 1.Test 1-start");
                assert.calledWith(performanceMarkSpy, "Suite 1.Test 1-sync-end");
                assert.calledWith(performanceMarkSpy, "Suite 1.Test 1-async-end");

                // SuiteRunner adds 2 marks.
                // Suite used here contains 3 tests.
                // Each StepRunner adds 3 marks.
                expect(performanceMarkSpy.callCount).to.equal(11);
            });
        });

        describe("Finalize", () => {
            describe("_finalize", () => {
                const suite = SUITES_FIXTURE[1];

                const syncStart = 8000;
                const syncEnd = 10000;
                const asyncEnd = 13000;

                const params = { measurementMethod: "raf" };

                before(async () => {
                    stub(runner, "_measuredValues").value({
                        tests: {},
                    });

                    const originalMark = window.performance.mark.bind(window.performance);
                    const performanceMarkStub = sinon.stub(window.performance, "mark").withArgs(sinon.match.any).callThrough();
                    const performanceNowStub = sinon.stub(window.performance, "now");

                    performanceNowStub.onFirstCall().returns(syncStart);
                    performanceMarkStub.onThirdCall().callsFake((markName) => originalMark(markName, { startTime: asyncEnd }));
                    performanceNowStub.onSecondCall().returns(asyncEnd);

                    // instantiate recorded test results
                    const suiteRunner = new SuiteRunner(runner._frame, runner._page, params, suite, runner._client, runner._measuredValues);
                    await suiteRunner._runSuite();

                    await runner._finalize();
                });

                it("should calculate measured test values correctly", () => {
                    const syncTime = syncEnd - syncStart;
                    const asyncTime = asyncEnd - syncEnd;

                    const total = syncTime + asyncTime;
                    const mean = total / suite.tests.length;
                    const geomean = Math.pow(total, 1 / suite.tests.length);
                    const score = 1000 / geomean;

                    const { total: measuredTotal, mean: measuredMean, geomean: measuredGeomean, score: measuredScore } = runner._measuredValues;

                    expect(measuredTotal).to.equal(total);
                    expect(measuredMean).to.equal(mean);
                    expect(measuredGeomean).to.equal(geomean);
                    expect(measuredScore).to.equal(score);

                    assert.calledWith(runner._client.didRunSuites, runner._measuredValues);
                });
            });
        });
    });

    describe("StepRunner", () => {
        const suite = SUITES_FIXTURE[0];
        const params = { measurementMethod: "raf", warmupBeforeSync: 0 };

        it("should run StepRunner and return { syncTime, asyncTime }", async () => {
            const step = new BenchmarkTestStep("SyncStep", sinon.stub());
            const runner = new StepRunner(null, null, params, suite, step, "default");
            const { syncTime, asyncTime } = await runner.runStep();
            expect(typeof syncTime).to.equal("number");
            expect(typeof asyncTime).to.equal("number");
            assert.calledOnce(step.run);
        });

        it("should run AsyncStepRunner and return { syncTime, asyncTime }", async () => {
            const asyncStep = new BenchmarkTestStep(
                "AsyncStep",
                sinon.stub().callsFake(async () => {})
            );
            const runner = new AsyncStepRunner(null, null, params, suite, asyncStep, "async");
            const { syncTime, asyncTime } = await runner.runStep();
            expect(typeof syncTime).to.equal("number");
            expect(typeof asyncTime).to.equal("number");
            assert.calledOnce(asyncStep.run);
        });
    });

    describe("StepScheduler", () => {
        it("should schedule callbacks and resolve in RAFStepScheduler", async () => {
            const syncCallback = sinon.stub();
            const asyncCallback = sinon.stub();
            const scheduler = new STEP_SCHEDULER_LOOKUP.raf(syncCallback, asyncCallback, { waitBeforeSync: 0 });
            const result = await scheduler.start();
            expect(result).to.be(undefined);
            assert.calledOnce(syncCallback);
            assert.calledOnce(asyncCallback);
        });

        it("should respect waitBeforeSync when starting scheduler", async () => {
            const syncCallback = sinon.stub();
            const asyncCallback = sinon.stub();
            const scheduler = new STEP_SCHEDULER_LOOKUP.raf(syncCallback, asyncCallback, { waitBeforeSync: 10 });
            const result = await scheduler.start();
            expect(result).to.be(undefined);
            assert.calledOnce(syncCallback);
            assert.calledOnce(asyncCallback);
        });
    });
});

describe("PageElement", () => {
    describe("observeResizeEvents", () => {
        before(function () {
            skipInShell(this);
        });

        async function withPageElement(configureFrame, callback) {
            let fixtureNode;
            let result;
            const runner = new BenchmarkRunner(
                [
                    {
                        name: "PageElement fixture",
                        enabled: true,
                        url: "about:blank",
                        async prepare(page) {
                            result = await callback(page.getElementById("resize-target"), fixtureNode);
                        },
                        tests: [],
                    },
                ],
                {}
            );
            sinon.stub(SuiteRunner.prototype, "_loadFrame").callsFake(async function () {
                fixtureNode = configureFrame(this.frame);
            });
            sinon.stub(SuiteRunner.prototype, "_runSuite").callsFake(async () => {});
            await runner.runAllSuites();
            return result;
        }

        // A fake ResizeObserver drives deliveries synchronously for exact-count assertions.
        async function createTracker() {
            let deliver;
            class FakeResizeObserver {
                constructor(callback) {
                    deliver = (...widths) => callback(widths.map((width) => ({ contentBoxSize: [{ inlineSize: width }] })));
                }
                observe() {}
                disconnect() {}
            }
            return withPageElement(
                (frame) => {
                    Object.defineProperty(frame.contentWindow, "ResizeObserver", { configurable: true, value: FakeResizeObserver });
                    const node = frame.contentDocument.createElement("div");
                    node.id = "resize-target";
                    frame.contentDocument.body.appendChild(node);
                    return node;
                },
                (element) => ({
                    resizeEvents: element.observeResizeEvents(),
                    deliver: (...widths) => deliver(...widths),
                })
            );
        }

        it("treats the first delivery as the baseline without counting it", async () => {
            const { resizeEvents, deliver } = await createTracker();
            deliver(200);
            await resizeEvents.ready;
            expect(resizeEvents.count).to.equal(0);
        });

        it("counts each distinct width change exactly once", async () => {
            const { resizeEvents, deliver } = await createTracker();
            deliver(200); // seed
            deliver(300);
            deliver(400);
            deliver(500);
            expect(resizeEvents.count).to.equal(3);
        });

        it("does not count deliveries that report the same width", async () => {
            const { resizeEvents, deliver } = await createTracker();
            deliver(200); // seed
            deliver(300);
            deliver(300);
            deliver(300);
            expect(resizeEvents.count).to.equal(1);
        });
    });
});
