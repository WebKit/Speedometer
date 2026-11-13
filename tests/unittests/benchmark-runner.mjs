import { BenchmarkRunner, BenchmarkTestStep, WarmupSuite } from "../../resources/benchmark-runner.mjs";
import { SuiteRunner, RemoteSuiteRunner } from "../../resources/suite-runner.mjs";
import { StepRunner, AsyncStepRunner } from "../../resources/shared/step-runner.mjs";
import { STEP_SCHEDULER_LOOKUP } from "../../resources/shared/step-scheduler.mjs";
import { MESSAGE_TYPE } from "../../resources/shared/benchmark.mjs";
import { Params, defaultParams } from "../../resources/shared/params.mjs";
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
        url: "about:blank",
        async prepare(page) {},
        enabled: true,
        tests: [TEST_FIXTURE("Test 1"), TEST_FIXTURE("Test 2"), TEST_FIXTURE("Test 3")],
    },
    {
        name: "Suite 2",
        url: "about:blank",
        async prepare(page) {},
        enabled: true,
        tests: [TEST_FIXTURE("Test 1")],
    },
];

function stubBrowserIframeSrcSetter() {
    if (typeof HTMLIFrameElement === "undefined")
        return;
    const desc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");
    if (desc && !desc.set?.isSinonProxy) {
        sinon.stub(HTMLIFrameElement.prototype, "src").set(function () {
            setTimeout(() => this.onload?.(), 0);
        });
    }
}

const CLIENT_FIXTURE = {
    willAddTestFrame: sinon.stub(),
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

    beforeEach(() => {
        stubBrowserIframeSrcSetter();
    });

    it("should be defined", () => {
        expect(runner).not.to.be(undefined);
    });

    describe("Frame", () => {
        it("should remove the frame after running a suite", async () => {
            let capturedFrame;
            let removeChildSpy;
            const frameClient = {
                willAddTestFrame: spy((frame) => {
                    capturedFrame = frame;
                }),
            };
            const frameRunner = new BenchmarkRunner([SUITES_FIXTURE[1]], frameClient);
            stub(StepRunner.prototype, "runStep").resolves({ syncTime: 10, asyncTime: 5 });
            const origInsertBefore = document.body.insertBefore.bind(document.body);
            stub(document.body, "insertBefore").callsFake((node, ref) => {
                const res = origInsertBefore(node, ref);
                removeChildSpy = spy(node.parentNode, "removeChild");
                return res;
            });

            await frameRunner.runAllSuites();

            expect(capturedFrame).to.be.a(HTMLIFrameElement);
            assert.calledWith(removeChildSpy, capturedFrame);
            expect(capturedFrame.parentNode).to.equal(null);
        });

        describe("iframe creation via runAllSuites", () => {
            const DEFAULT_WIDTH = defaultParams.viewport.width;
            const DEFAULT_HEIGHT = defaultParams.viewport.height;

            it(`should create an absolutely positioned iframe with ${DEFAULT_WIDTH}px x ${DEFAULT_HEIGHT}px dimensions and scrolling disabled`, async () => {
                const createElementSpy = spy(document, "createElement");
                let capturedStyles;
                let capturedFrame;
                const frameClient = {
                    willAddTestFrame: spy((frame) => {
                        capturedFrame = frame;
                    }),
                };
                const suite = {
                    name: "FrameCheckSuite",
                    url: "about:blank",
                    enabled: true,
                    async prepare() {
                        const { width, height, position } = getComputedStyle(capturedFrame);
                        capturedStyles = {
                            width: parseInt(width),
                            height: parseInt(height),
                            position,
                            scrolling: capturedFrame.scrolling,
                        };
                    },
                    tests: [TEST_FIXTURE("Test 1")],
                };
                stub(StepRunner.prototype, "runStep").resolves({ syncTime: 10, asyncTime: 5 });
                const frameRunner = new BenchmarkRunner([suite], frameClient);

                await frameRunner.runAllSuites();

                expect(capturedFrame).to.be.a(HTMLIFrameElement);
                assert.calledWith(createElementSpy, capturedFrame.nodeName.toLowerCase());
                expect(capturedStyles.width).to.equal(DEFAULT_WIDTH);
                expect(capturedStyles.height).to.equal(DEFAULT_HEIGHT);
                expect(capturedStyles.position).to.be("absolute");
                expect(capturedStyles.scrolling).to.be("no");
            });

            it("should insert the frame as the first child in the document body", async () => {
                const firstChild = document.createTextNode("First Child");
                const insertBeforeSpy = spy(document.body, "insertBefore");
                let capturedFrame;
                const frameClient = {
                    willAddTestFrame: spy((frame) => {
                        capturedFrame = frame;
                    }),
                };
                stub(StepRunner.prototype, "runStep").resolves({ syncTime: 10, asyncTime: 5 });
                const frameRunner = new BenchmarkRunner([SUITES_FIXTURE[1]], frameClient);

                document.body.prepend(firstChild);
                try {
                    await frameRunner.runAllSuites();
                    assert.calledWith(insertBeforeSpy, capturedFrame, firstChild);
                } finally {
                    document.body.removeChild(firstChild);
                }
            });
        });
    });

    describe("Suite", () => {
        describe("runAllSuites", () => {
            let runSpy, insertBeforeSpy, removeChildSpy, client;

            before(async () => {
                stubBrowserIframeSrcSetter();
                runSpy = spy(SuiteRunner.prototype, "run");
                insertBeforeSpy = spy(document.body, "insertBefore");
                removeChildSpy = spy(document.body, "removeChild");
                stub(StepRunner.prototype, "runStep").resolves({ syncTime: 10, asyncTime: 5 });
                SUITES_FIXTURE.forEach((suite) => spy(suite, "prepare"));
                client = {
                    didFinishSuite: spy(),
                    didRunSuites: spy(),
                };
                runner = new BenchmarkRunner(SUITES_FIXTURE, client);
                await runner.runAllSuites();
            });

            after(() => {
                sinon.restore();
            });

            it("should call prepare on all suites", () => {
                for (const suite of SUITES_FIXTURE)
                    assert.calledOnce(suite.prepare);
            });

            it("should run all test suites", async () => {
                assert.calledTwice(runSpy);
            });

            it("should insert and remove the frame for each suite", () => {
                assert.calledTwice(insertBeforeSpy);
                assert.calledTwice(removeChildSpy);
            });

            it("should fire the client callback responsible for reporting finalized results", () => {
                assert.calledOnce(client.didRunSuites);
            });
        });

        describe("runSuite", () => {
            let runStepStub, suitePrepareSpy, performanceMarkSpy, client, tempFrame;

            const suite = SUITES_FIXTURE[0];

            before(async () => {
                stubBrowserIframeSrcSetter();
                runStepStub = stub(StepRunner.prototype, "runStep").callsFake(async () => ({ syncTime: 10, asyncTime: 5 }));
                performanceMarkSpy = spy(window.performance, "mark");
                suitePrepareSpy = spy(suite, "prepare");
                client = {
                    willAddTestFrame: spy(),
                    willRunTest: spy(),
                    didFinishSuite: spy(),
                    didRunSuites: spy(),
                };
                runner = new BenchmarkRunner([suite], client);
                await runner.runAllSuites();
                void tempFrame;
            });

            after(() => {
                sinon.restore();
            });

            it("should prepare the suite first", async () => {
                assert.calledOnce(suitePrepareSpy);
            });

            it("should run and record results for every test in suite", async () => {
                assert.calledThrice(runStepStub);
                assert.calledWith(performanceMarkSpy, "suite-Suite 1-prepare-start");
                assert.calledWith(performanceMarkSpy, "suite-Suite 1-prepare-end");
                assert.calledWith(performanceMarkSpy, "suite-Suite 1-start");
                assert.calledWith(performanceMarkSpy, "suite-Suite 1-end");
                assert.calledOnce(client.didFinishSuite);
            });
        });
    });

    describe("Test", () => {
        describe("SuiteRunner.run()", () => {
            let performanceMarkSpy, client, tempFrame;

            const suite = SUITES_FIXTURE[0];
            const params = new Params(new URLSearchParams());

            before(async () => {
                stubBrowserIframeSrcSetter();
                tempFrame = document.createElement("iframe");
                document.body.appendChild(tempFrame);
                client = {
                    willRunTest: spy(),
                    didFinishSuite: spy(),
                };
                const originalMark = window.performance.mark.bind(window.performance);
                let stepCall = 0;
                stub(window.performance, "now").callsFake(() => ++stepCall * 10);
                performanceMarkSpy = stub(window.performance, "mark").callsFake((name, options) => {
                    if (name.endsWith("-sync-end"))
                        return originalMark(name, { startTime: ++stepCall * 10 });
                    return originalMark(name, options);
                });
                const measuredValues = { tests: {} };
                const suiteRunner = new SuiteRunner(tempFrame, {}, params, suite, client, measuredValues);
                await suiteRunner.run();
                document.body.removeChild(tempFrame);
            });

            after(() => {
                sinon.restore();
            });

            it("should run client pre and post hooks if present", () => {
                assert.calledWith(client.willRunTest, suite, suite.tests[0]);
                assert.calledWith(client.didFinishSuite, suite);
            });

            it("should write performance marks at the start and end of the test with the correct test name", () => {
                assert.calledWith(performanceMarkSpy, "Suite 1.Test 1-start");
                assert.calledWith(performanceMarkSpy, "Suite 1.Test 1-sync-end");
                assert.calledWith(performanceMarkSpy, "Suite 1.Test 1-async-end");

                // SuiteRunner.run() adds 4 marks (prepare-start, prepare-end, start, end).
                // Suite used here contains 3 tests, and each StepRunner adds 3 marks (4 + 9 = 13).
                expect(performanceMarkSpy.callCount).to.equal(13);
            });
        });

        describe("Finalize", () => {
            describe("runAllSuites scoring", () => {
                let singleSuiteRunner;
                let reportedMeasuredValues;

                const stepTimings = [
                    { syncStart: 8000, syncEnd: 10000, asyncEnd: 13000 },
                    { syncStart: 14000, syncEnd: 15500, asyncEnd: 17000 },
                    { syncStart: 18000, syncEnd: 19000, asyncEnd: 21500 },
                ];

                before(async () => {
                    stubBrowserIframeSrcSetter();
                    const suite = {
                        name: "Suite 1",
                        url: "about:blank",
                        async prepare() {},
                        enabled: true,
                        tests: [TEST_FIXTURE("Test 1"), TEST_FIXTURE("Test 2"), TEST_FIXTURE("Test 3")],
                    };
                    const client = {
                        willRunTest: sinon.stub(),
                        didFinishSuite: sinon.stub(),
                        didRunSuites: sinon.spy((mv) => {
                            reportedMeasuredValues = structuredClone(mv);
                        }),
                    };
                    singleSuiteRunner = new BenchmarkRunner([suite], client);

                    const originalMark = window.performance.mark.bind(window.performance);
                    const performanceMarkStub = sinon.stub(window.performance, "mark").withArgs(sinon.match.any).callThrough();
                    const performanceNowStub = sinon.stub(window.performance, "now");

                    // Marks during runAllSuites:
                    // 0: runner-prepare-start
                    // 1: runner-prepare-end
                    // 2: suite-Suite 1-prepare-start
                    // 3: suite-Suite 1-prepare-end
                    // 4: suite-Suite 1-start
                    // Steps (index 0, 1, 2):
                    //   5 + index * 3: start
                    //   6 + index * 3: sync-end
                    //   7 + index * 3: async-end
                    stepTimings.forEach(({ syncStart, syncEnd, asyncEnd }, index) => {
                        const nowBase = index * 2;
                        const markSyncEndCallIndex = 6 + index * 3;
                        performanceNowStub.onCall(nowBase).returns(syncStart);
                        performanceMarkStub.onCall(markSyncEndCallIndex).callsFake((markName) => originalMark(markName, { startTime: syncEnd }));
                        performanceNowStub.onCall(nowBase + 1).returns(asyncEnd);
                    });

                    await singleSuiteRunner.runAllSuites();
                });

                after(() => {
                    sinon.restore();
                });

                it("should calculate measured test values correctly across all steps in suite", () => {
                    const expectedTotal = stepTimings.reduce((sum, { syncStart, asyncEnd }) => sum + (asyncEnd - syncStart), 0);
                    const mean = expectedTotal;
                    const geomean = expectedTotal;
                    const score = 1000 / geomean;

                    expect(reportedMeasuredValues).not.to.be(undefined);
                    const { total: measuredTotal, mean: measuredMean, geomean: measuredGeomean, score: measuredScore } = reportedMeasuredValues;

                    expect(measuredTotal).to.equal(expectedTotal);
                    expect(measuredMean).to.equal(mean);
                    expect(measuredGeomean).to.equal(geomean);
                    expect(measuredScore).to.equal(score);
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
            stubBrowserIframeSrcSetter();
            let capturedFrame;
            let result;
            const runner = new BenchmarkRunner(
                [
                    {
                        name: "PageElement fixture",
                        enabled: true,
                        url: "about:blank",
                        async prepare(page) {
                            const fixtureNode = configureFrame(capturedFrame);
                            result = await callback(page.getElementById("resize-target"), fixtureNode);
                        },
                        tests: [new BenchmarkTestStep("NoOp", () => {})],
                    },
                ],
                {
                    willAddTestFrame(frame) {
                        capturedFrame = frame;
                    },
                }
            );
            sinon.stub(StepRunner.prototype, "runStep").resolves({ syncTime: 10, asyncTime: 5 });
            await runner.runAllSuites();
            return result;
        }

        // A fake ResizeObserver drives callbacks synchronously for exact-count assertions.
        async function createTracker() {
            let deliver;
            const disconnect = sinon.stub();
            class FakeResizeObserver {
                constructor(callback) {
                    deliver = (...widths) => callback(widths.map((width) => ({ contentBoxSize: [{ inlineSize: width }] })));
                }
                observe() {}
                disconnect() {
                    disconnect();
                }
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
                    resizeEventsPromise: element.observeResizeEvents(),
                    deliver: (...widths) => deliver(...widths),
                    disconnect,
                })
            );
        }

        it("treats the first callback as the baseline without counting it", async () => {
            const { resizeEventsPromise, deliver, disconnect } = await createTracker();
            deliver(200);
            const resizeEvents = await resizeEventsPromise;
            expect(resizeEvents.stop()).to.equal(0);
            sinon.assert.calledOnce(disconnect);
        });

        it("counts each distinct width change exactly once", async () => {
            const { resizeEventsPromise, deliver } = await createTracker();
            deliver(200); // seed
            const resizeEvents = await resizeEventsPromise;
            deliver(300);
            deliver(400);
            deliver(500);
            expect(resizeEvents.stop()).to.equal(3);
        });

        it("does not count callbacks that report the same width", async () => {
            const { resizeEventsPromise, deliver } = await createTracker();
            deliver(200); // seed
            const resizeEvents = await resizeEventsPromise;
            deliver(300);
            deliver(300);
            deliver(300);
            expect(resizeEvents.stop()).to.equal(1);
        });
    });
});

describe("Scoring & SuiteRunner (Node & Browser)", () => {
    const { spy, stub, assert } = sinon;
    let restoreGlobals;

    function createFakeFrame(onSetSrc) {
        let srcValue = "";
        const frame = {
            style: {},
            className: "",
            scrolling: "",
            parentNode: null,
            onload: null,
            onerror: null,
            setAttribute(name, value) {
                this[name] = value;
            },
            contentDocument: {
                body: {
                    getBoundingClientRect: () => ({ width: 800, height: 600, x: 0, y: 0 }),
                    appendChild() {},
                },
                createElement: () => ({ id: "", style: {} }),
                querySelector: () => null,
                querySelectorAll: () => [],
                getElementById: () => null,
            },
            contentWindow: {
                postMessage: spy(),
                addEventListener: spy(),
            },
        };
        Object.defineProperty(frame, "src", {
            get() {
                return srcValue;
            },
            set(val) {
                srcValue = val;
                if (onSetSrc)
                    onSetSrc(frame, val);
                else
                    queueMicrotask(() => frame.onload?.());
            },
            configurable: true,
        });
        return frame;
    }

    beforeEach(() => {
        if (typeof window === "undefined" || typeof document === "undefined") {
            const saved = {
                hasWindow: "window" in globalThis,
                window: globalThis.window,
                hasDocument: "document" in globalThis,
                document: globalThis.document,
                hasRAF: "requestAnimationFrame" in globalThis,
                requestAnimationFrame: globalThis.requestAnimationFrame,
            };

            const listeners = new Map();
            const fakeBody = {
                firstChild: null,
                getBoundingClientRect: () => ({ width: 800, height: 600, x: 0, y: 0 }),
                insertBefore(node) {
                    node.parentNode = fakeBody;
                    fakeBody.firstChild = node;
                    return node;
                },
                removeChild(node) {
                    if (fakeBody.firstChild === node)
                        fakeBody.firstChild = null;
                    node.parentNode = null;
                    return node;
                },
            };
            globalThis.document = {
                baseURI: "http://localhost:8080/",
                body: fakeBody,
                elementFromPoint: () => null,
                createElement: () => createFakeFrame(),
            };
            globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
            globalThis.window = {
                performance: globalThis.performance,
                requestAnimationFrame: globalThis.requestAnimationFrame,
                addEventListener(type, handler) {
                    if (!listeners.has(type))
                        listeners.set(type, new Set());
                    listeners.get(type).add(handler);
                },
                removeEventListener(type, handler) {
                    listeners.get(type)?.delete(handler);
                },
                dispatchEvent(event) {
                    for (const handler of Array.from(listeners.get(event.type) ?? []))
                        handler(event);
                },
            };
            globalThis.MouseEvent ??= class extends Event {};
            globalThis.WheelEvent ??= class extends Event {};

            restoreGlobals = () => {
                if (!saved.hasWindow)
                    delete globalThis.window;
                else
                    globalThis.window = saved.window;
                if (!saved.hasDocument)
                    delete globalThis.document;
                else
                    globalThis.document = saved.document;
                if (!saved.hasRAF)
                    delete globalThis.requestAnimationFrame;
                else
                    globalThis.requestAnimationFrame = saved.requestAnimationFrame;
            };
        } else {
            restoreGlobals = null;
            if (!window.requestAnimationFrame.isSinonProxy)
                stub(window, "requestAnimationFrame").callsFake((cb) => setTimeout(cb, 0));
        }
    });

    afterEach(() => {
        restoreGlobals?.();
    });

    function stubTimedStepRuns(stepTimings, prepareDuration = 10) {
        let stepIndex = 0;
        let nowCursor = 1000;
        let currentAsyncEnd = 1000;
        const originalMark = performance.mark.bind(performance);
        const originalMeasure = performance.measure.bind(performance);

        stub(performance, "now").callsFake(() => {
            const timing = stepTimings[stepIndex] ?? { syncTime: 10, asyncTime: 5 };
            // First performance.now() in a step is syncStartTime; second is asyncEndTime.
            if (nowCursor % 2 === 0) {
                const syncStart = 1000 + stepIndex * 100;
                const syncEnd = syncStart + timing.syncTime;
                currentAsyncEnd = syncEnd + timing.asyncTime;
                nowCursor++;
                return syncStart;
            }
            nowCursor++;
            stepIndex++;
            return currentAsyncEnd;
        });

        stub(performance, "mark").callsFake((name, options) => {
            if (name.endsWith("-sync-end")) {
                const timing = stepTimings[stepIndex] ?? { syncTime: 10, asyncTime: 5 };
                const syncStart = 1000 + stepIndex * 100;
                return originalMark(name, { startTime: syncStart + timing.syncTime });
            }
            return originalMark(name, options);
        });

        stub(performance, "measure").callsFake((name, startMark, endMark) => {
            if (name.startsWith("suite-") && name.endsWith("-prepare")) {
                const duration = typeof prepareDuration === "function" ? prepareDuration(name) : prepareDuration;
                return { duration };
            }
            return originalMeasure(name, startMark, endMark);
        });
    }

    describe("SuiteRunner.run() multi-step accumulation & stepRunnerType", () => {
        it("should sum total across all steps in a multi-step suite via suiteRunner.run() (regression test for #576)", async () => {
            const stepOrder = [];
            const multiStepSuite = {
                name: "TodoMVC-Test",
                url: "about:blank",
                enabled: true,
                prepare: spy(async () => {}),
                tests: [
                    new BenchmarkTestStep("Adding100Items", () => stepOrder.push("Adding100Items")),
                    new BenchmarkTestStep("CompletingAllItems", () => stepOrder.push("CompletingAllItems")),
                    new BenchmarkTestStep("DeletingAllItems", () => stepOrder.push("DeletingAllItems")),
                ],
            };

            const stepTimings = [
                { syncTime: 10, asyncTime: 5 }, // 15
                { syncTime: 20, asyncTime: 8 }, // 28
                { syncTime: 12, asyncTime: 3 }, // 15
            ];
            stubTimedStepRuns(stepTimings, 12);

            const measuredValues = { tests: {} };
            const client = {
                willRunTest: spy(),
                didFinishSuite: spy(),
            };
            const params = new Params(new URLSearchParams());
            const suiteRunner = new SuiteRunner(createFakeFrame(), {}, params, multiStepSuite, client, measuredValues);

            await suiteRunner.run();

            expect(stepOrder).to.eql(["Adding100Items", "CompletingAllItems", "DeletingAllItems"]);
            const suiteResults = measuredValues.tests["TodoMVC-Test"];
            expect(suiteResults).not.to.be(undefined);
            expect(suiteResults.tests.Adding100Items).to.eql({
                tests: { Sync: 10, Async: 5 },
                total: 15,
            });
            expect(suiteResults.tests.CompletingAllItems).to.eql({
                tests: { Sync: 20, Async: 8 },
                total: 28,
            });
            expect(suiteResults.tests.DeletingAllItems).to.eql({
                tests: { Sync: 12, Async: 3 },
                total: 15,
            });
            expect(suiteResults.prepare).to.equal(12);
            // Must be the sum (15 + 28 + 15 = 58), NOT overwritten by the last step (15)!
            expect(suiteResults.total).to.equal(58);
            assert.calledOnce(multiStepSuite.prepare);
            assert.calledThrice(client.willRunTest);
            assert.calledOnceWithExactly(client.didFinishSuite, multiStepSuite);
        });

        it("should run synchronously when suite.type is 'default' and useAsyncSteps is false", async () => {
            const events = [];
            const suite = {
                name: "ExplicitDefaultSuite",
                url: "about:blank",
                type: "default",
                enabled: true,
                async prepare() {},
                tests: [
                    new BenchmarkTestStep("Step1", () => {
                        Promise.resolve().then(() => events.push("microtask-after-sync-return"));
                        events.push("sync-step-body");
                    }),
                ],
            };

            const originalMark = performance.mark.bind(performance);
            stub(performance, "mark").callsFake((name, options) => {
                if (name === "ExplicitDefaultSuite.Step1-sync-end") {
                    events.push("sync-end-mark");
                    return originalMark(name, { startTime: 110 });
                }
                return originalMark(name, options);
            });
            stub(performance, "now").onFirstCall().returns(100).onSecondCall().returns(120);

            const measuredValues = { tests: {} };
            const params = new Params(new URLSearchParams());
            const suiteRunner = new SuiteRunner(createFakeFrame(), {}, params, suite, null, measuredValues);

            await suiteRunner.run();

            // Because StepRunner does not await step.run(), sync-end-mark is recorded BEFORE the microtask resolves!
            expect(events).to.eql(["sync-step-body", "sync-end-mark", "microtask-after-sync-return"]);
        });

        it("should await async step before marking sync-end when suite.type is 'async'", async () => {
            const events = [];
            const suite = {
                name: "ExplicitAsyncSuite",
                url: "about:blank",
                type: "async",
                enabled: true,
                async prepare() {},
                tests: [
                    new BenchmarkTestStep("Step1", async () => {
                        events.push("async-step-start");
                        await Promise.resolve();
                        events.push("async-step-resolved");
                    }),
                ],
            };

            const originalMark = performance.mark.bind(performance);
            stub(performance, "mark").callsFake((name, options) => {
                if (name === "ExplicitAsyncSuite.Step1-sync-end") {
                    events.push("sync-end-mark");
                    return originalMark(name, { startTime: 115 });
                }
                return originalMark(name, options);
            });
            stub(performance, "now").onFirstCall().returns(100).onSecondCall().returns(130);

            const measuredValues = { tests: {} };
            const params = new Params(new URLSearchParams());
            const suiteRunner = new SuiteRunner(createFakeFrame(), {}, params, suite, null, measuredValues);

            await suiteRunner.run();

            expect(events).to.eql(["async-step-start", "async-step-resolved", "sync-end-mark"]);
        });

        it("should await async step before marking sync-end when suite.type is undefined and params.useAsyncSteps is true", async () => {
            const events = [];
            const suite = {
                name: "ImplicitAsyncSuite",
                url: "about:blank",
                enabled: true,
                async prepare() {},
                tests: [
                    new BenchmarkTestStep("Step1", async () => {
                        events.push("async-step-start");
                        await Promise.resolve();
                        events.push("async-step-resolved");
                    }),
                ],
            };

            const originalMark = performance.mark.bind(performance);
            stub(performance, "mark").callsFake((name, options) => {
                if (name === "ImplicitAsyncSuite.Step1-sync-end") {
                    events.push("sync-end-mark");
                    return originalMark(name, { startTime: 115 });
                }
                return originalMark(name, options);
            });
            stub(performance, "now").onFirstCall().returns(100).onSecondCall().returns(130);

            const measuredValues = { tests: {} };
            const params = new Params(new URLSearchParams({ useAsyncSteps: "true" }));
            const suiteRunner = new SuiteRunner(createFakeFrame(), {}, params, suite, null, measuredValues);

            await suiteRunner.run();

            expect(events).to.eql(["async-step-start", "async-step-resolved", "sync-end-mark"]);
        });
    });

    describe("SuiteRunner.run() validation & WarmupSuite", () => {
        it("should throw during suiteRunner.run() when suite total is 0", async () => {
            const suite = {
                name: "ZeroTotalSuite",
                url: "about:blank",
                async prepare() {},
                tests: [new BenchmarkTestStep("FastStep", () => {})],
            };
            stubTimedStepRuns([{ syncTime: 0, asyncTime: 0 }], 10);

            const measuredValues = { tests: {} };
            const params = new Params(new URLSearchParams());
            const suiteRunner = new SuiteRunner(createFakeFrame(), {}, params, suite, null, measuredValues);

            let caughtError = null;
            try {
                await suiteRunner.run();
            } catch (err) {
                caughtError = err;
            }
            expect(caughtError).to.be.an(Error);
            expect(caughtError.message).to.match(/Got invalid 0-time total for suite ZeroTotalSuite: 0/);
        });

        it("should throw during suiteRunner.run() when measurePrepare is true and suite prepare time is 0", async () => {
            const suite = {
                name: "ZeroPrepareSuite",
                url: "about:blank",
                async prepare() {},
                tests: [new BenchmarkTestStep("Step1", () => {})],
            };
            stubTimedStepRuns([{ syncTime: 15, asyncTime: 10 }], 0);

            const measuredValues = { tests: {} };
            const params = new Params(new URLSearchParams({ measurePrepare: "true" }));
            const suiteRunner = new SuiteRunner(createFakeFrame(), {}, params, suite, null, measuredValues);

            let caughtError = null;
            try {
                await suiteRunner.run();
            } catch (err) {
                caughtError = err;
            }
            expect(caughtError).to.be.an(Error);
            expect(caughtError.message).to.match(/Got invalid 0-time prepare time for suite ZeroPrepareSuite: 0/);
        });

        it("should not throw during suiteRunner.run() when measurePrepare is false and prepare time is 0", async () => {
            const suite = {
                name: "ValidSuite",
                url: "about:blank",
                async prepare() {},
                tests: [new BenchmarkTestStep("Step1", () => {})],
            };
            stubTimedStepRuns([{ syncTime: 15, asyncTime: 10 }], 0);

            const measuredValues = { tests: {} };
            const params = new Params(new URLSearchParams());
            const suiteRunner = new SuiteRunner(createFakeFrame(), {}, params, suite, null, measuredValues);

            await suiteRunner.run();
            expect(measuredValues.tests.ValidSuite.total).to.equal(25);
        });

        it("should not register WarmupSuite in measuredValues.tests or throw on 0 total during suiteRunner.run()", async () => {
            stubTimedStepRuns(
                [
                    { syncTime: 0, asyncTime: 0 },
                    { syncTime: 0, asyncTime: 0 },
                    { syncTime: 0, asyncTime: 0 },
                ],
                0
            );
            const fakePage = {
                waitForElement: stub().resolves({}),
                querySelector: stub().returns({}),
                querySelectorAll: stub().returns([]),
                getElementById: stub().returns({
                    setValue: spy(),
                    click: spy(),
                    focus: spy(),
                    dispatchEvent: spy(),
                    enter: spy(),
                }),
            };
            const measuredValues = { tests: {} };
            const params = new Params(new URLSearchParams({ measurePrepare: "true" }));
            const suiteRunner = new SuiteRunner(createFakeFrame(), fakePage, params, WarmupSuite, null, measuredValues);

            await suiteRunner.run();

            expect(measuredValues.tests).to.eql({});
            expect(suiteRunner.suiteResults).to.eql({ tests: {}, prepare: 0, total: 0 });
        });
    });

    describe("RemoteSuiteRunner.run()", () => {
        function dispatchWindowMessage(data) {
            const event = typeof MessageEvent === "function" ? new MessageEvent("message", { data }) : { type: "message", data };
            window.dispatchEvent(event);
        }

        it("should record remote suite tests, total, and prepare time through remoteRunner.run()", async () => {
            const remoteSuite = {
                name: "RemoteTodoMVC",
                url: "about:blank",
                type: "remote",
                enabled: true,
                prepare: spy(async () => {}),
                config: { name: "custom-remote" },
            };
            const remoteResult = {
                tests: {
                    Adding100Items: { tests: { Sync: 12, Async: 8 }, total: 20 },
                    CompletingAllItems: { tests: { Sync: 15, Async: 5 }, total: 20 },
                    DeletingAllItems: { tests: { Sync: 7, Async: 3 }, total: 10 },
                },
                total: 50,
            };

            const frame = createFakeFrame((f) => {
                queueMicrotask(() => {
                    f.onload?.();
                    queueMicrotask(() => {
                        dispatchWindowMessage({
                            type: MESSAGE_TYPE.appReady,
                            payload: { appId: "remote-app-1.0" },
                        });
                    });
                });
            });
            frame.contentWindow.postMessage = spy((message) => {
                expect(message.type).to.equal(MESSAGE_TYPE.suiteStart);
                expect(message.payload).to.eql({ name: "custom-remote" });
                queueMicrotask(() => {
                    dispatchWindowMessage({
                        appId: "remote-app-1.0",
                        type: MESSAGE_TYPE.suiteComplete,
                        payload: { result: remoteResult },
                    });
                });
            });

            stub(performance, "measure").withArgs("suite-RemoteTodoMVC-prepare", "suite-RemoteTodoMVC-prepare-start", "suite-RemoteTodoMVC-prepare-end").returns({ duration: 30 });

            const measuredValues = { tests: {} };
            const client = { didFinishSuite: spy() };
            const params = new Params(new URLSearchParams({ measurePrepare: "true" }));
            const remoteRunner = new RemoteSuiteRunner(frame, {}, params, remoteSuite, client, measuredValues);

            await remoteRunner.run();

            expect(remoteRunner.appId).to.equal("remote-app-1.0");
            assert.calledOnce(remoteSuite.prepare);
            assert.calledOnce(frame.contentWindow.postMessage);
            expect(measuredValues.tests.RemoteTodoMVC).to.eql({
                tests: remoteResult.tests,
                prepare: 30,
                total: 50,
            });
            assert.calledOnceWithExactly(client.didFinishSuite, remoteSuite);
        });

        it("should reject messages from a mismatched appId during remoteRunner.run()", async () => {
            const remoteSuite = {
                name: "RemoteSuite",
                url: "about:blank",
                type: "remote",
                enabled: true,
                async prepare() {},
            };

            const messageHandlers = new Set();
            stub(window, "addEventListener").callsFake((type, handler) => {
                if (type === "message")
                    messageHandlers.add(handler);
            });
            stub(window, "removeEventListener").callsFake((type, handler) => {
                if (type === "message")
                    messageHandlers.delete(handler);
            });
            const deliverMessage = (data) => {
                for (const handler of Array.from(messageHandlers))
                    handler({ type: "message", data });
            };

            const frame = createFakeFrame((f) => {
                queueMicrotask(() => {
                    f.onload?.();
                    queueMicrotask(() => {
                        deliverMessage({
                            type: MESSAGE_TYPE.appReady,
                            payload: { appId: "expected-app-1" },
                        });
                    });
                });
            });

            let caughtMismatchedAppError = null;
            frame.contentWindow.postMessage = spy(() => {
                queueMicrotask(() => {
                    try {
                        deliverMessage({
                            appId: "wrong-app-2",
                            type: MESSAGE_TYPE.suiteComplete,
                            payload: { result: { tests: {}, total: 10 } },
                        });
                    } catch (err) {
                        caughtMismatchedAppError = err;
                    }
                    // Resolve the pending suiteComplete with the valid appId so run() finishes cleanly.
                    deliverMessage({
                        appId: "expected-app-1",
                        type: MESSAGE_TYPE.suiteComplete,
                        payload: { result: { tests: {}, total: 10 } },
                    });
                });
            });

            const params = new Params(new URLSearchParams());
            const remoteRunner = new RemoteSuiteRunner(frame, {}, params, remoteSuite, null, { tests: {} });
            await remoteRunner.run();

            expect(caughtMismatchedAppError).to.be.an(Error);
            expect(caughtMismatchedAppError.message).to.match(/Got message for invalid app: wrong-app-2 instead of expected-app-1/);
            expect(messageHandlers.size).to.equal(0);
        });
    });

    describe("BenchmarkRunner.runMultipleIterations() & runAllSuites() scoring", () => {
        beforeEach(() => {
            const origCreateElement = document.createElement.bind(document);
            const origInsertBefore = document.body.insertBefore.bind(document.body);
            const origRemoveChild = document.body.removeChild.bind(document.body);
            if (!document.createElement.isSinonProxy) {
                stub(document, "createElement").callsFake((tag) => {
                    if (tag === "iframe")
                        return createFakeFrame();
                    return origCreateElement(tag);
                });
            }
            if (!document.body.insertBefore.isSinonProxy) {
                stub(document.body, "insertBefore").callsFake((node, ref) => {
                    if (typeof Node !== "undefined" && !(node instanceof Node)) {
                        node.parentNode = document.body;
                        return node;
                    }
                    return origInsertBefore(node, ref);
                });
            }
            if (!document.body.removeChild.isSinonProxy) {
                stub(document.body, "removeChild").callsFake((node) => {
                    if (typeof Node !== "undefined" && !(node instanceof Node)) {
                        node.parentNode = null;
                        return node;
                    }
                    return origRemoveChild(node);
                });
            }
            if (typeof HTMLBodyElement !== "undefined" && !document.body.getBoundingClientRect.isSinonProxy)
                stub(document.body, "getBoundingClientRect").returns({ width: 800, height: 600, x: 0, y: 0 });
            if (typeof Document !== "undefined" && !document.elementFromPoint.isSinonProxy)
                stub(document, "elementFromPoint").returns(null);
        });

        it("should compute total, mean, geomean, score, and hierarchical metrics across multiple multi-step suites and iterations via runMultipleIterations()", async () => {
            const suites = [
                {
                    name: "SuiteA",
                    url: "about:blank",
                    enabled: true,
                    async prepare() {},
                    tests: [new BenchmarkTestStep("Step1", () => {}), new BenchmarkTestStep("Step2", () => {})],
                },
                {
                    name: "SuiteB",
                    url: "about:blank",
                    enabled: true,
                    async prepare() {},
                    tests: [new BenchmarkTestStep("Step1", () => {}), new BenchmarkTestStep("Step2", () => {})],
                },
            ];

            // Iteration 0:
            // SuiteA: Step1 (10+10=20), Step2 (15+5=20) => total = 40
            // SuiteB: Step1 (50+10=60), Step2 (80+20=100) => total = 160
            // Geomean(40, 160) = sqrt(6400) = 80, Total = 200, Mean = 100, Score = 1000 / 80 = 12.5
            // Iteration 1:
            // SuiteA: Step1 (10+5=15), Step2 (5+5=10) => total = 25
            // SuiteB: Step1 (30+10=40), Step2 (40+20=60) => total = 100
            // Geomean(25, 100) = sqrt(2500) = 50, Total = 125, Mean = 62.5, Score = 1000 / 50 = 20
            stubTimedStepRuns([
                { syncTime: 10, asyncTime: 10 },
                { syncTime: 15, asyncTime: 5 },
                { syncTime: 50, asyncTime: 10 },
                { syncTime: 80, asyncTime: 20 },
                { syncTime: 10, asyncTime: 5 },
                { syncTime: 5, asyncTime: 5 },
                { syncTime: 30, asyncTime: 10 },
                { syncTime: 40, asyncTime: 20 },
            ]);

            const measuredValuesPerIteration = [];
            let finishedMetrics = null;
            const client = {
                willStartFirstIteration: spy(),
                didRunSuites: spy((mv) => measuredValuesPerIteration.push(structuredClone(mv))),
                didFinishLastIteration: spy((metrics) => {
                    finishedMetrics = metrics;
                }),
            };

            const runner = new BenchmarkRunner(suites, client);
            await runner.runMultipleIterations(2);

            assert.calledOnceWithExactly(client.willStartFirstIteration, 2);
            expect(measuredValuesPerIteration.length).to.equal(2);

            expect(measuredValuesPerIteration[0].total).to.equal(200);
            expect(measuredValuesPerIteration[0].mean).to.equal(100);
            expect(measuredValuesPerIteration[0].geomean).to.be.within(79.999999, 80.000001);
            expect(measuredValuesPerIteration[0].score).to.be.within(12.499999, 12.500001);

            expect(measuredValuesPerIteration[1].total).to.equal(125);
            expect(measuredValuesPerIteration[1].mean).to.equal(62.5);
            expect(measuredValuesPerIteration[1].geomean).to.be.within(49.999999, 50.000001);
            expect(measuredValuesPerIteration[1].score).to.be.within(19.999999, 20.000001);

            expect(finishedMetrics).not.to.be(null);
            expect(finishedMetrics.SuiteA.values).to.eql([40, 25]);
            expect(finishedMetrics.SuiteA.mean).to.equal(32.5);
            expect(finishedMetrics["SuiteA/Step1"].values).to.eql([20, 15]);
            expect(finishedMetrics["SuiteA/Step1/Sync"].values).to.eql([10, 10]);
            expect(finishedMetrics["SuiteA/Step1/Async"].values).to.eql([10, 5]);
            expect(finishedMetrics["SuiteA/Step2"].values).to.eql([20, 10]);

            expect(finishedMetrics.SuiteB.values).to.eql([160, 100]);
            expect(finishedMetrics.SuiteB.mean).to.equal(130);

            expect(finishedMetrics["Iteration-0-Total"].values).to.eql([40, 160]);
            expect(finishedMetrics["Iteration-0-Total"].geomean).to.be.within(79.999999, 80.000001);
            expect(finishedMetrics["Iteration-1-Total"].values).to.eql([25, 100]);
            expect(finishedMetrics["Iteration-1-Total"].geomean).to.be.within(49.999999, 50.000001);

            expect(finishedMetrics.Geomean.values.length).to.equal(2);
            expect(finishedMetrics.Geomean.values[0]).to.be.within(79.999999, 80.000001);
            expect(finishedMetrics.Geomean.values[1]).to.be.within(49.999999, 50.000001);
            expect(finishedMetrics.Geomean.mean).to.be.within(64.999999, 65.000001);

            expect(finishedMetrics.Score.values.length).to.equal(2);
            expect(finishedMetrics.Score.values[0]).to.be.within(12.499999, 12.500001);
            expect(finishedMetrics.Score.values[1]).to.be.within(19.999999, 20.000001);
            expect(finishedMetrics.Score.mean).to.be.within(16.249999, 16.250001);
        });

        it("should record Iteration-i-Prepare and Prepare geomean metrics when measurePrepare is true", async () => {
            const suites = [
                {
                    name: "SuiteA",
                    url: "about:blank",
                    enabled: true,
                    async prepare() {},
                    tests: [new BenchmarkTestStep("Step1", () => {})],
                },
                {
                    name: "SuiteB",
                    url: "about:blank",
                    enabled: true,
                    async prepare() {},
                    tests: [new BenchmarkTestStep("Step1", () => {})],
                },
            ];

            // Iteration 0: prepare times 16 and 36 => geomean = 24
            // Iteration 1: prepare times 25 and 100 => geomean = 50
            const prepareTimes = [16, 36, 25, 100];
            let prepareIndex = 0;
            stubTimedStepRuns(
                [
                    { syncTime: 30, asyncTime: 20 },
                    { syncTime: 30, asyncTime: 20 },
                    { syncTime: 30, asyncTime: 20 },
                    { syncTime: 30, asyncTime: 20 },
                ],
                () => prepareTimes[prepareIndex++]
            );

            let finishedMetrics = null;
            const client = {
                didRunSuites: spy(),
                didFinishLastIteration: spy((metrics) => {
                    finishedMetrics = metrics;
                }),
            };
            const customParams = new Params(new URLSearchParams({ measurePrepare: "true", iterationCount: "2" }));
            const runner = new BenchmarkRunner(suites, client, customParams);
            await runner.runMultipleIterations(2);

            expect(finishedMetrics["Iteration-0-Prepare"].values).to.eql([16, 36]);
            expect(finishedMetrics["Iteration-0-Prepare"].geomean).to.be.within(23.999999, 24.000001);
            expect(finishedMetrics["Iteration-1-Prepare"].values).to.eql([25, 100]);
            expect(finishedMetrics["Iteration-1-Prepare"].geomean).to.be.within(49.999999, 50.000001);
            expect(finishedMetrics.Prepare.values.length).to.equal(2);
            expect(finishedMetrics.Prepare.values[0]).to.be.within(23.999999, 24.000001);
            expect(finishedMetrics.Prepare.values[1]).to.be.within(49.999999, 50.000001);
            expect(finishedMetrics.Prepare.mean).to.be.within(36.999999, 37.000001);
        });

        it("should support iterationCount > defaultParams.iterationCount when passed to runMultipleIterations()", async () => {
            const suites = [
                {
                    name: "SuiteA",
                    url: "about:blank",
                    enabled: true,
                    async prepare() {},
                    tests: [new BenchmarkTestStep("Step1", () => {})],
                },
            ];
            const stepTimings = Array.from({ length: 12 }, (_, i) => ({ syncTime: 15 + i, asyncTime: 5 }));
            stubTimedStepRuns(stepTimings, 5);

            let finishedMetrics = null;
            const client = {
                didRunSuites: spy(),
                didFinishLastIteration: spy((metrics) => {
                    finishedMetrics = metrics;
                }),
                handleError: spy(),
            };
            const runner = new BenchmarkRunner(suites, client);
            await runner.runMultipleIterations(12);

            assert.notCalled(client.handleError);
            expect(finishedMetrics).not.to.be(null);
            expect(finishedMetrics.Geomean.values.length).to.equal(12);
            expect(finishedMetrics["Iteration-11-Total"].values).to.eql([31]);
        });

        it("should exclude WarmupSuite from measuredValues and score when running with useWarmupSuite", async () => {
            const realSuite = {
                name: "RealSuite",
                url: "about:blank",
                enabled: true,
                async prepare() {},
                tests: [new BenchmarkTestStep("Step1", () => {}), new BenchmarkTestStep("Step2", () => {})],
            };
            // WarmupSuite has 3 steps, RealSuite has 2 steps
            stubTimedStepRuns([
                { syncTime: 5, asyncTime: 5 },
                { syncTime: 5, asyncTime: 5 },
                { syncTime: 5, asyncTime: 5 },
                { syncTime: 15, asyncTime: 10 },
                { syncTime: 15, asyncTime: 10 },
            ]);

            stub(WarmupSuite, "prepare").resolves();
            for (const step of WarmupSuite.tests)
                stub(step, "run");

            let reportedMeasuredValues = null;
            const client = {
                didRunSuites: spy((mv) => {
                    reportedMeasuredValues = structuredClone(mv);
                }),
                didFinishSuite: spy(),
            };

            const customParams = new Params(new URLSearchParams({ useWarmupSuite: "true" }));
            const runner = new BenchmarkRunner([realSuite], client, customParams);
            await runner.runAllSuites();

            expect(Object.keys(reportedMeasuredValues.tests)).to.eql(["RealSuite"]);
            // RealSuite has 2 steps * (15 + 10) = 50
            expect(reportedMeasuredValues.total).to.equal(50);
            expect(reportedMeasuredValues.geomean).to.equal(50);
            expect(reportedMeasuredValues.score).to.equal(1000 / 50);
        });

        it("should succeed in runMultipleIterations() when client omits didRunSuites or when no suites are enabled", async () => {
            const suites = [
                {
                    name: "SuiteA",
                    url: "about:blank",
                    enabled: true,
                    async prepare() {},
                    tests: [new BenchmarkTestStep("Step1", () => {})],
                },
            ];
            stubTimedStepRuns([{ syncTime: 25, asyncTime: 15 }], 5);

            let finishedMetrics = null;
            const runnerWithoutDidRunSuites = new BenchmarkRunner(suites, {
                didFinishLastIteration: (metrics) => {
                    finishedMetrics = metrics;
                },
            });
            await runnerWithoutDidRunSuites.runMultipleIterations(1);
            expect(finishedMetrics.SuiteA.values).to.eql([40]);
            expect(finishedMetrics.Score.values).to.eql([25]);

            let emptyMeasuredValues = null;
            const emptyRunner = new BenchmarkRunner([], {
                didRunSuites: (mv) => {
                    emptyMeasuredValues = structuredClone(mv);
                },
            });
            await emptyRunner.runAllSuites();
            expect(emptyMeasuredValues.total).to.equal(0);
            expect(Number.isNaN(emptyMeasuredValues.score)).to.be(true);
        });
    });
});
