import { BenchmarkStep, AsyncBenchmarkStep, BenchmarkSuite, AsyncBenchmarkSuite, BenchmarkConnector, BENCHMARK_SUITE_TYPE, MESSAGE_TYPE, MESSAGE_STATUS } from "../../resources/shared/benchmark.mjs";

describe("Shared Benchmark (BenchmarkStep, BenchmarkSuite, BenchmarkConnector)", () => {
    let restoreGlobals = [];
    let pendingMessagePromises = [];

    function createTimedStepClock(asyncDurationByMarkName = {}) {
        let now = 1000;
        const originalMark = performance.mark.bind(performance);
        sinon.stub(performance, "now").callsFake(() => now);
        sinon.stub(performance, "mark").callsFake((name, options) => {
            const mark = originalMark(name, { startTime: now, ...options });
            if (name in asyncDurationByMarkName)
                now += asyncDurationByMarkName[name];
            return mark;
        });
        return {
            advance(ms) {
                now += ms;
            },
        };
    }

    async function dispatchWindowMessage(data) {
        if (typeof MessageEvent !== "undefined" && typeof window.dispatchEvent === "function") {
            window.dispatchEvent(new MessageEvent("message", { data }));
            while (pendingMessagePromises.length > 0)
                await pendingMessagePromises.shift();
            return;
        }
        await window.dispatchMessage(data);
    }

    beforeEach(() => {
        restoreGlobals = [];
        pendingMessagePromises = [];
        if (typeof globalThis.document === "undefined") {
            globalThis.document = {
                body: {
                    getBoundingClientRect: () => ({ width: 800, height: 600 }),
                },
                elementFromPoint: () => null,
            };
            restoreGlobals.push(() => {
                delete globalThis.document;
            });
        }
        if (typeof globalThis.requestAnimationFrame === "undefined") {
            globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
            restoreGlobals.push(() => {
                delete globalThis.requestAnimationFrame;
            });
        } else {
            sinon.stub(globalThis, "requestAnimationFrame").callsFake((cb) => setTimeout(cb, 0));
        }
        if (typeof globalThis.window === "undefined") {
            const listeners = new Map();
            globalThis.window = {
                location: { search: "" },
                top: {
                    postMessage() {},
                },
                addEventListener(type, handler) {
                    if (!listeners.has(type))
                        listeners.set(type, new Set());
                    listeners.get(type).add(handler);
                },
                removeEventListener(type, handler) {
                    listeners.get(type)?.delete(handler);
                },
                async dispatchMessage(data) {
                    const handlers = Array.from(listeners.get("message") ?? []);
                    for (const handler of handlers)
                        await handler({ data });
                },
            };
            restoreGlobals.push(() => {
                delete globalThis.window;
            });
        } else {
            const wrappedListeners = new Map();
            const origAdd = window.addEventListener.bind(window);
            const origRemove = window.removeEventListener.bind(window);
            sinon.stub(window, "addEventListener").callsFake((type, handler, options) => {
                if (type === "message") {
                    const wrapped = (event) => {
                        const result = handler(event);
                        if (result && typeof result.then === "function")
                            pendingMessagePromises.push(result);
                        return result;
                    };
                    wrappedListeners.set(handler, wrapped);
                    return origAdd(type, wrapped, options);
                }
                return origAdd(type, handler, options);
            });
            sinon.stub(window, "removeEventListener").callsFake((type, handler, options) => {
                if (type === "message" && wrappedListeners.has(handler)) {
                    const wrapped = wrappedListeners.get(handler);
                    wrappedListeners.delete(handler);
                    return origRemove(type, wrapped, options);
                }
                return origRemove(type, handler, options);
            });
            restoreGlobals.push(() => {
                for (const wrapped of wrappedListeners.values())
                    origRemove("message", wrapped);
                wrappedListeners.clear();
            });
        }
    });

    afterEach(() => {
        while (restoreGlobals.length > 0)
            restoreGlobals.pop()();
    });

    describe("BenchmarkStep & AsyncBenchmarkStep", () => {
        it("should initialize step properties including ignoreResult", () => {
            const fn = () => {};
            const defaultStep = new BenchmarkStep("Step1", fn);
            expect(defaultStep.name).to.be("Step1");
            expect(defaultStep.run).to.be(fn);
            expect(defaultStep.ignoreResult).to.be(false);

            const ignoredStep = new BenchmarkStep("IgnoredStep", fn, true);
            expect(ignoredStep.ignoreResult).to.be(true);
        });

        it("should run synchronous BenchmarkStep and return { syncTime, asyncTime }", async () => {
            const clock = createTimedStepClock({
                "TestSuite.SyncStep-sync-end": 6,
            });
            const step = new BenchmarkStep("SyncStep", () => {
                clock.advance(14);
            });
            const suite = new BenchmarkSuite("TestSuite", [step]);
            const params = { measurementMethod: "raf", warmupBeforeSync: 0, waitBeforeSync: 0 };

            const result = await step.runAndRecordStep(params, suite, step);
            expect(result).to.eql({ syncTime: 14, asyncTime: 6 });
        });

        it("should await async function in AsyncBenchmarkStep before marking sync end", async () => {
            let asyncCompletedBeforeSyncEnd = false;
            const clock = createTimedStepClock({
                "AsyncSuite.AsyncStep-sync-end": 4,
            });

            const step = new AsyncBenchmarkStep("AsyncStep", async () => {
                await Promise.resolve();
                await Promise.resolve();
                clock.advance(11);
                asyncCompletedBeforeSyncEnd = true;
            });
            const suite = new BenchmarkSuite("AsyncSuite", [step]);
            const params = { measurementMethod: "raf", warmupBeforeSync: 0, waitBeforeSync: 0 };

            const result = await step.runAndRecordStep(params, suite, step);
            expect(asyncCompletedBeforeSyncEnd).to.be(true);
            expect(result).to.eql({ syncTime: 11, asyncTime: 4 });
        });
    });

    describe("BenchmarkSuite & AsyncBenchmarkSuite", () => {
        it("should set suite type to sync by default and async for AsyncBenchmarkSuite", () => {
            const syncSuite = new BenchmarkSuite("SyncSuite", []);
            expect(syncSuite.type).to.be(BENCHMARK_SUITE_TYPE.sync);

            const asyncSuite = new AsyncBenchmarkSuite("AsyncSuite", []);
            expect(asyncSuite.type).to.be(BENCHMARK_SUITE_TYPE.async);
        });

        it("should accumulate total across multiple steps and report progress through runAndRecordSuite", async () => {
            const clock = createTimedStepClock({
                "TodoMVC-MultiStep.Adding100Items-sync-end": 5,
                "TodoMVC-MultiStep.CompletingAllItems-sync-end": 8,
                "TodoMVC-MultiStep.DeletingAllItems-sync-end": 3,
            });

            const step1 = new BenchmarkStep("Adding100Items", () => clock.advance(10)); // total = 15
            const step2 = new BenchmarkStep("CompletingAllItems", () => clock.advance(20)); // total = 28
            const step3 = new BenchmarkStep("DeletingAllItems", () => clock.advance(12)); // total = 15

            const suite = new BenchmarkSuite("TodoMVC-MultiStep", [step1, step2, step3]);
            const progressSteps = [];
            const params = { measurementMethod: "raf", warmupBeforeSync: 0, waitBeforeSync: 0 };
            const response = await suite.runAndRecordSuite(params, (stepName) => progressSteps.push(stepName));

            expect(response.type).to.be("suite-tests-complete");
            expect(response.status).to.be("success");
            expect(response.suiteName).to.be("TodoMVC-MultiStep");
            expect(progressSteps).to.eql(["Adding100Items", "CompletingAllItems", "DeletingAllItems"]);

            const { result } = response;
            expect(result.total).to.be(15 + 28 + 15);
            expect(result.tests["Adding100Items"]).to.eql({
                tests: { Sync: 10, Async: 5 },
                total: 15,
            });
            expect(result.tests["CompletingAllItems"]).to.eql({
                tests: { Sync: 20, Async: 8 },
                total: 28,
            });
            expect(result.tests["DeletingAllItems"]).to.eql({
                tests: { Sync: 12, Async: 3 },
                total: 15,
            });
        });

        it("should exclude steps with ignoreResult=true from measuredValues.tests and total while still running them", async () => {
            const clock = createTimedStepClock({
                "IndexedDB-Suite.Adding100Items-sync-end": 5,
                "IndexedDB-Suite.FinishAddingItemsToDB-sync-end": 50,
                "IndexedDB-Suite.CompletingAllItems-sync-end": 10,
            });
            let ignoredStepRan = false;

            const step1 = new BenchmarkStep("Adding100Items", () => clock.advance(10)); // 15
            const ignoredStep = new BenchmarkStep(
                "FinishAddingItemsToDB",
                () => {
                    ignoredStepRan = true;
                    clock.advance(100);
                },
                true
            ); // 150 (ignored)
            const step2 = new BenchmarkStep("CompletingAllItems", () => clock.advance(20)); // 30

            const suite = new BenchmarkSuite("IndexedDB-Suite", [step1, ignoredStep, step2]);
            const progressSteps = [];
            const params = { measurementMethod: "raf", warmupBeforeSync: 0, waitBeforeSync: 0 };
            const { result } = await suite.runAndRecordSuite(params, (stepName) => progressSteps.push(stepName));

            expect(ignoredStepRan).to.be(true);
            expect(progressSteps).to.eql(["Adding100Items", "FinishAddingItemsToDB", "CompletingAllItems"]);
            expect(result.tests).to.only.have.keys("Adding100Items", "CompletingAllItems");
            expect(result.total).to.be(15 + 30);
        });
    });

    describe("BenchmarkConnector", () => {
        it("should construct appId from name and version, or fallback to -1 with a warning", () => {
            const warnStub = sinon.stub(console, "warn");
            const connectorWithId = new BenchmarkConnector({}, "news-next", "1.0.0");
            expect(connectorWithId.appId).to.be("news-next-1.0.0");
            expect(warnStub.called).to.be(false);

            const connectorWithoutId = new BenchmarkConnector({}, "", "");
            expect(connectorWithoutId.appId).to.be(-1);
            expect(warnStub.calledOnce).to.be(true);
        });

        it("should send app-ready on connect(), handle suite-start via window message events, and disconnect()", async () => {
            const postMessageStub = sinon.stub(window.top, "postMessage");
            const clock = createTimedStepClock({
                "RemoteSuite.Step1-sync-end": 2,
                "RemoteSuite.Step2-sync-end": 4,
            });

            const step1 = new BenchmarkStep("Step1", () => clock.advance(10));
            const step2 = new BenchmarkStep("Step2", () => clock.advance(8));
            const suite = new BenchmarkSuite("RemoteSuite", [step1, step2]);

            const connector = new BenchmarkConnector({ default: suite }, "remote-app", "2.0");
            connector.connect();

            expect(postMessageStub.calledOnce).to.be(true);
            expect(postMessageStub.firstCall.args[0]).to.eql({
                appId: "remote-app-2.0",
                type: MESSAGE_TYPE.appReady,
                payload: { appId: "remote-app-2.0" },
                status: MESSAGE_STATUS.success,
            });

            await dispatchWindowMessage({
                appId: "remote-app-2.0",
                key: "benchmark-connector",
                type: MESSAGE_TYPE.suiteStart,
                payload: { name: "default" },
            });

            // 1 app-ready + 2 step-complete + 1 suite-complete = 4 messages
            expect(postMessageStub.callCount).to.be(4);
            expect(postMessageStub.secondCall.args[0]).to.eql({
                appId: "remote-app-2.0",
                type: MESSAGE_TYPE.stepComplete,
                payload: { name: "remote-app", step: "Step1" },
                status: MESSAGE_STATUS.success,
            });
            expect(postMessageStub.thirdCall.args[0]).to.eql({
                appId: "remote-app-2.0",
                type: MESSAGE_TYPE.stepComplete,
                payload: { name: "remote-app", step: "Step2" },
                status: MESSAGE_STATUS.success,
            });
            expect(postMessageStub.getCall(3).args[0]).to.eql({
                appId: "remote-app-2.0",
                type: MESSAGE_TYPE.suiteComplete,
                payload: {
                    result: {
                        tests: {
                            Step1: { tests: { Sync: 10, Async: 2 }, total: 12 },
                            Step2: { tests: { Sync: 8, Async: 4 }, total: 12 },
                        },
                        prepare: 0,
                        total: 24,
                    },
                },
                status: MESSAGE_STATUS.success,
            });

            // After suiteComplete, connector has disconnected so further messages are ignored
            await dispatchWindowMessage({
                appId: "remote-app-2.0",
                key: "benchmark-connector",
                type: MESSAGE_TYPE.suiteStart,
                payload: { name: "default" },
            });
            expect(postMessageStub.callCount).to.be(4);
        });

        it("should ignore invalid messages and log error for missing suite or unsupported type", async () => {
            sinon.stub(window.top, "postMessage");
            const warnStub = sinon.stub(console, "warn");
            const errorStub = sinon.stub(console, "error");
            const connector = new BenchmarkConnector({}, "remote-app", "1.0");
            connector.connect();

            await dispatchWindowMessage({
                appId: "wrong-id",
                key: "benchmark-connector",
                type: MESSAGE_TYPE.suiteStart,
            });
            expect(warnStub.calledOnce).to.be(true);

            await dispatchWindowMessage({
                appId: "remote-app-1.0",
                key: "benchmark-connector",
                type: MESSAGE_TYPE.suiteStart,
                payload: { name: "nonexistent" },
            });
            expect(errorStub.calledWith('Suite with the name of "nonexistent" not found!')).to.be(true);

            await dispatchWindowMessage({
                appId: "remote-app-1.0",
                key: "benchmark-connector",
                type: "unsupported-type",
            });
            expect(errorStub.calledWith("Message data type not supported: unsupported-type")).to.be(true);

            connector.disconnect();
        });
    });
});
