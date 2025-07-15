import { BenchmarkRunner } from "../../resources/benchmark-runner.mjs";
import { SuiteRunner } from "../../resources/suite-runner.mjs";
import { TestRunner } from "../../resources/shared/test-runner.mjs";
import { defaultParams } from "../../resources/shared/params.mjs";

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

    before(() => {
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
                for (const suite of runner._suites)
                    spy(suite, "prepare");
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
                _runTestStub = stub(TestRunner.prototype, "runTest").callsFake(async () => null);
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
                // Each TestRunner adds 3 marks.
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
});
