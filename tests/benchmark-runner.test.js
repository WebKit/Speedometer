import { jest } from "@jest/globals";
import { BenchmarkRunner } from "../resources/benchmark-runner";

jest.useFakeTimers();

const TEST_FIXTURE = (name) => ({
    name,
    run: () => jest.fn(),
});

const SUITES_FIXTURE = [
    {
        name: "Suite 1",
        url: "todomvc/vanilla-examples/vanillajs/index.html",
        tests: [
            TEST_FIXTURE("Test 1"),
            TEST_FIXTURE("Test 2"),
            TEST_FIXTURE("Test 3"),
        ],
    },
    {
        name: "Suite 2",
        url: "todomvc/vanilla-examples/vanillajs/index.html",
        tests: [TEST_FIXTURE("Test 1")],
    },
];

const CLIENT_FIXTURE = {
    willRunTest: jest.fn(),
    didRunTest: jest.fn(),
    didRunSuites: jest.fn(),
};

describe("BenchmarkRunner", () => {
    let runner;

    beforeAll(() => {
        runner = new BenchmarkRunner(SUITES_FIXTURE, CLIENT_FIXTURE);
    });

    test("runner is defined", () => {
        expect(runner).not.toBeNull();
    });

    describe("_writeMark", () => {
        it("should fire performance.mark with the correct name", () => {
            window.performance.mark = jest.fn(); // stubbing performance.mark since it is not available by default in jsdom: https://jestjs.io/docs/next/timer-mocks#selective-faking

            const performanceMarkSpy = jest.spyOn(global.performance, "mark");
            runner._writeMark("Button clicked");
            expect(performanceMarkSpy).toHaveBeenCalledWith("Button clicked");
        });
    });

    describe("Frame", () => {
        describe("_removeFrame", () => {
            let frame, removeChildSpy;

            beforeAll(async () => {
                jest.clearAllMocks();
                frame = await runner._appendFrame();

                removeChildSpy = jest.spyOn(frame.parentNode, "removeChild");
            });

            it("should remove the frame if a frame is defined", () => {
                expect(runner._frame).toEqual(frame);

                runner._removeFrame();

                expect(removeChildSpy).toHaveBeenCalledWith(frame);
                expect(runner._frame).toEqual(null);
            });
        });

        describe("_appendFrame", () => {
            it("should create an absolutely positioned iframe with 800px x 600px dimensions", async () => {
                const createElementSpy = jest.spyOn(document, "createElement");

                const frame = await runner._appendFrame();
                expect(frame).toBeInstanceOf(HTMLIFrameElement);
                expect(createElementSpy).toHaveBeenCalledWith(
                    frame.nodeName.toLowerCase()
                );
                expect(frame.style.width).toBe("800px");
                expect(frame.style.height).toBe("600px");
                expect(frame.style.position).toBe("absolute");
            });

            it("should disable scrolling in the frame", async () => {
                const { scrolling } = await runner._appendFrame();
                expect(scrolling).toBe("no");
            });

            it("should add 8px left and top spacing to the frame if the window is larger than 800px x 600px", async () => {
                const { style } = await runner._appendFrame();
                expect(style.left).toBe("8px");
                expect(style.top).toBe("8px");
            });

            it("should not add outer spacing to the frame if the window is smaller than 800px x 600px", async () => {
                window.innerWidth = 700;

                const { style } = await runner._appendFrame();
                expect(style.left).toBe("0px");
                expect(style.top).toBe("0px");
            });

            it("should insert the frame as the first child in the document body", async () => {
                const firstChild = document.createTextNode("First Child");
                document.body.prepend(firstChild);

                const insertBeforeSpy = jest.spyOn(
                    document.body,
                    "insertBefore"
                );
                const frame = await runner._appendFrame();
                expect(insertBeforeSpy).toHaveBeenCalledWith(frame, firstChild);
            });
        });
    });

    describe("Suite", () => {
        describe("_runAllSuites", () => {
            let _runSuiteSpy, _removeFrameSpy, _finalizeSpy;
            beforeAll(async () => {
                _runSuiteSpy = jest
                    .spyOn(runner, "_runSuite")
                    .mockImplementation(() => jest.fn());
                _finalizeSpy = jest
                    .spyOn(runner, "_finalize")
                    .mockImplementation(() => jest.fn());
                _removeFrameSpy = jest.spyOn(runner, "_removeFrame");

                await runner._runAllSuites();
            });

            it("should run all test suites", () => {
                expect(_runSuiteSpy).toHaveBeenCalledTimes(2);
            });

            it("should remove the previous frame and then the current frame", () => {
                expect(_removeFrameSpy).toHaveBeenCalledTimes(2);
            });

            it("should fire the function responsible for finalizing results", () => {
                expect(_finalizeSpy).toHaveBeenCalled();
            });
        });

        describe("_runSuite", () => {
            let _prepareSuiteSpy, _runTestAndRecordResultsSpy;

            const suite = SUITES_FIXTURE[0];

            beforeAll(async () => {
                jest.restoreAllMocks();
                _prepareSuiteSpy = jest
                    .spyOn(runner, "_prepareSuite")
                    .mockImplementation(() => jest.fn());
                _runTestAndRecordResultsSpy = jest
                    .spyOn(runner, "_runTestAndRecordResults")
                    .mockImplementation(() => jest.fn());
                runner._runSuite(suite);
            });

            it("should prepare the suite first", async () => {
                expect(_prepareSuiteSpy).toHaveBeenCalled();
            });

            it("should run and record results for every test in suite", async () => {
                expect(_runTestAndRecordResultsSpy).toHaveBeenCalledTimes(3);
            });
        });
    });

    describe("Test", () => {
        describe("_runTestAndRecordResults", () => {
            let _runTestSpy, willRunTestSpy, didRunTestSpy;

            const suite = SUITES_FIXTURE[0];

            beforeAll(async () => {
                jest.restoreAllMocks();
                await runner._appendFrame();

                _runTestSpy = jest.spyOn(runner, "_runTest");
                willRunTestSpy = jest.spyOn(runner._client, "willRunTest");
                didRunTestSpy = jest.spyOn(runner._client, "didRunTest");

                runner._runTestAndRecordResults(suite, suite.tests[0]);
            });

            beforeEach(() => {
                jest.runAllTimers();
            });

            it("should run the test with the correct arguments", () => {
                expect(_runTestSpy).toHaveBeenCalledWith(
                    suite,
                    suite.tests[0],
                    runner._page,
                    expect.any(Function)
                );
            });

            it("should run client pre and post hooks if present", () => {
                expect(willRunTestSpy).toHaveBeenCalledWith(
                    suite,
                    suite.tests[0]
                );
                expect(didRunTestSpy).toHaveBeenCalledWith(
                    suite,
                    suite.tests[0]
                );
            });
        });

        describe("_runTest", () => {
            let _writeMarkSpy, _testFnSpy, page;
            const callback = jest.fn();

            const suite = SUITES_FIXTURE[0];

            beforeAll(async () => {
                page = { _frame: await runner._appendFrame() };
                _writeMarkSpy = jest.spyOn(runner, "_writeMark");
                _testFnSpy = jest
                    .spyOn(suite.tests[0], "run")
                    .mockImplementation(() => jest.fn());

                // Mocking performance.now calls to measure test sync and async times (ms)
                jest.spyOn(global.performance, "now")
                    .mockReturnValueOnce(8000000) // startTime (sync)
                    .mockReturnValueOnce(10000000) // endTime (sync)
                    .mockReturnValueOnce(12000000) // startTime (async)
                    .mockReturnValueOnce(13000000); // endTime (async)

                runner._runTest(suite, suite.tests[0], page, callback);
            });

            it("should write performance marks at the start and end of the test with the correct test name", () => {
                expect(_writeMarkSpy).toHaveBeenCalledWith(
                    "Suite 1.Test 1-start"
                );
                expect(_writeMarkSpy).toHaveBeenCalledWith(
                    "Suite 1.Test 1-sync-end"
                );

                jest.runAllTimers();

                expect(_writeMarkSpy).toHaveBeenLastCalledWith(
                    "Suite 1.Test 1-async-end"
                );
                expect(_writeMarkSpy).toHaveBeenCalledTimes(3);
            });

            it("should run the test", () => {
                expect(_testFnSpy).toHaveBeenCalledWith(page);
            });

            it("should fire the callback with correct arguments for sync time, async time, and frame height", () => {
                const height =
                    runner._frame.contentDocument.body.getBoundingClientRect()
                        .height;

                expect(callback).toHaveBeenCalledWith(2000000, 1000000, height);
            });
        });
    });

    describe("Finalize", () => {
        describe("_finalize", () => {
            let didRunSuitesSpy;

            const syncStart = 8000000;
            const syncEnd = 10000000;
            const asyncStart = 12000000;
            const asyncEnd = 13000000;

            const suite = SUITES_FIXTURE[1];

            beforeAll(() => {
                jest.restoreAllMocks();
                runner._measuredValues.tests = {};
                didRunSuitesSpy = jest.spyOn(runner._client, "didRunSuites");

                // Mocking performance.now calls to measure test sync and async times (ms)
                jest.spyOn(global.performance, "now")
                    .mockReturnValueOnce(syncStart) // startTime (sync)
                    .mockReturnValueOnce(syncEnd) // endTime (sync)
                    .mockReturnValueOnce(asyncStart) // startTime (async)
                    .mockReturnValueOnce(asyncEnd); // endTime (async)

                runner._runTestAndRecordResults(suite, suite.tests[0]); // instantiate recorded test results
            });

            beforeEach(() => {
                jest.runAllTimers();
                runner._finalize();
            });

            it("should calculate measured test values correctly", () => {
                const syncTime = syncEnd - syncStart;
                const asyncTime = asyncEnd - asyncStart;

                const total = syncTime + asyncTime;
                const mean = total / suite.tests.length;
                const geomean = Math.pow(total, 1 / suite.tests.length);
                const score = (60 * 1000) / geomean / 3; // correctionFactor = 3

                const {
                    total: measuredTotal,
                    mean: measuredMean,
                    geomean: measuredGeomean,
                    score: measuredScore,
                } = runner._measuredValues;

                expect(measuredTotal).toEqual(total);
                expect(measuredMean).toEqual(mean);
                expect(measuredGeomean).toEqual(geomean);
                expect(measuredScore).toEqual(score);
            });

            it("should run the client run suites hook with measured values", () => {
                expect(didRunSuitesSpy).toHaveBeenCalledWith(
                    runner._measuredValues
                );
            });
        });
    });
});
