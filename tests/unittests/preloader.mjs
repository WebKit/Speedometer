import { ResourcePreloader } from "../../resources/preloader.mjs";
import { Params } from "../../resources/shared/params.mjs";
import { SW_MESSAGES } from "../../resources/shared/sw-messages.mjs";

const TEST_SUITES = [
    {
        name: "SuiteA",
        url: "suites/suite-a/index.html",
        resources: "suites/suite-a/resources.txt",
        enabled: true,
    },
    {
        name: "SuiteB",
        url: "suites/suite-b/index.html",
        resources: "suites/suite-b/resources.txt",
        enabled: true,
    },
];

function createMutableParams(search = "developerMode=true") {
    return new Params(new URLSearchParams(search));
}

function createMockServiceWorkerEnv(scopeUrl) {
    const listeners = new Map();
    const activeWorker = {
        postMessage: sinon.stub(),
    };
    const registration = {
        scope: scopeUrl,
        active: activeWorker,
        unregister: sinon.stub().resolves(true),
    };
    const serviceWorkerContainer = {
        controller: activeWorker,
        ready: Promise.resolve(registration),
        register: sinon.stub().resolves(registration),
        getRegistrations: sinon.stub().resolves([registration]),
        addEventListener: sinon.stub().callsFake((type, fn) => {
            listeners.set(type, fn);
        }),
        removeEventListener: sinon.stub().callsFake((type, fn) => {
            if (listeners.get(type) === fn)
                listeners.delete(type);
        }),
        emitMessage(data) {
            listeners.get("message")?.({ data });
        },
    };
    return { serviceWorkerContainer, registration, activeWorker, listeners };
}

describe("ResourcePreloader", () => {
    let createdWindow = false;
    let hadOwnServiceWorker = false;
    let originalServiceWorkerDescriptor;

    function setNavigatorServiceWorker(value) {
        Object.defineProperty(globalThis.navigator, "serviceWorker", {
            value,
            configurable: true,
            writable: true,
        });
    }

    beforeEach(() => {
        if (typeof globalThis.window === "undefined") {
            globalThis.window = {
                location: {
                    href: "http://localhost:8080/index.html",
                },
            };
            createdWindow = true;
        }
        hadOwnServiceWorker = Object.prototype.hasOwnProperty.call(globalThis.navigator, "serviceWorker");
        originalServiceWorkerDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, "serviceWorker");
    });

    afterEach(() => {
        if (hadOwnServiceWorker && originalServiceWorkerDescriptor)
            Object.defineProperty(globalThis.navigator, "serviceWorker", originalServiceWorkerDescriptor);
        else
            delete globalThis.navigator.serviceWorker;

        if (createdWindow) {
            delete globalThis.window;
            createdWindow = false;
        }
    });

    it("should not throw in non-secure contexts where navigator.serviceWorker is undefined", async () => {
        setNavigatorServiceWorker(undefined);
        const testParams = createMutableParams("developerMode=true&preload=true");
        const preloader = new ResourcePreloader(testParams);

        await preloader.setup();
        expect(preloader._registration).to.be(null);
        expect(preloader._sw).to.be(null);

        const preloadResult = await preloader.preloadSuites(TEST_SUITES);
        expect(preloadResult).to.be(undefined);
        expect(preloader.isCached(TEST_SUITES)).to.be(false);

        await preloader.teardown();
    });

    it("should not touch navigator.serviceWorker on setup() when params.preload is false", async () => {
        const expectedScope = new URL("./", window.location.href).href;
        const { serviceWorkerContainer } = createMockServiceWorkerEnv(expectedScope);
        setNavigatorServiceWorker(serviceWorkerContainer);

        const testParams = createMutableParams("developerMode=true&preload=false");
        const preloader = new ResourcePreloader(testParams);

        await preloader.setup();
        expect(serviceWorkerContainer.register.called).to.be(false);
        expect(serviceWorkerContainer.getRegistrations.called).to.be(false);
        expect(serviceWorkerContainer.addEventListener.called).to.be(false);
    });

    it("should lazily set up Service Worker when params.preload is toggled from false to true, and tear down when toggled back to false", async () => {
        const expectedScope = new URL("./", window.location.href).href;
        const { serviceWorkerContainer, registration, activeWorker } = createMockServiceWorkerEnv(expectedScope);
        setNavigatorServiceWorker(serviceWorkerContainer);

        const testParams = createMutableParams("developerMode=true&preload=false");
        const preloader = new ResourcePreloader(testParams);

        // Initial setup with preload=false does not register SW.
        await preloader.setup();
        expect(serviceWorkerContainer.register.called).to.be(false);

        // Toggle preload to true (as in Developer Mode) and call preloadSuites().
        testParams.preload = true;
        activeWorker.postMessage.callsFake((msg) => {
            if (msg.type === SW_MESSAGES.PRELOAD_SUITES) {
                serviceWorkerContainer.emitMessage({
                    type: SW_MESSAGES.PRELOAD_SUITES,
                    status: SW_MESSAGES.PRELOAD_DONE,
                    requestId: msg.requestId,
                    transferredSize: 1024,
                    count: 2,
                });
            }
        });

        await preloader.preloadSuites(TEST_SUITES);
        expect(serviceWorkerContainer.register.calledOnce).to.be(true);
        expect(preloader.isCached(TEST_SUITES)).to.be(true);

        // Toggle preload back to false: preloadSuites() should tear down registration and skip preloading.
        testParams.preload = false;
        activeWorker.postMessage.resetHistory();
        await preloader.preloadSuites(TEST_SUITES);

        expect(registration.unregister.calledOnce).to.be(true);
        expect(activeWorker.postMessage.called).to.be(false);
        expect(preloader._registration).to.be(null);
        expect(preloader._sw).to.be(null);
        expect(preloader.isCached(TEST_SUITES)).to.be(false);
    });

    it("should only unregister Service Worker registrations matching the current scope", async () => {
        const expectedScope = new URL("./", window.location.href).href;
        const otherScope = new URL("/other-benchmark/", window.location.href).href;
        const { serviceWorkerContainer, registration, activeWorker } = createMockServiceWorkerEnv(expectedScope);

        const otherRegistration = {
            scope: otherScope,
            unregister: sinon.stub().resolves(true),
        };
        serviceWorkerContainer.getRegistrations.resolves([otherRegistration, registration]);
        setNavigatorServiceWorker(serviceWorkerContainer);

        activeWorker.postMessage.callsFake((msg) => {
            if (msg.type === SW_MESSAGES.STOP_PRELOADING) {
                serviceWorkerContainer.emitMessage({
                    type: SW_MESSAGES.STOP_PRELOADING,
                    status: SW_MESSAGES.STOP_PRELOADING,
                    requestId: msg.requestId,
                });
            } else if (msg.type === SW_MESSAGES.GET_FAILED_REQUESTS) {
                serviceWorkerContainer.emitMessage({
                    type: SW_MESSAGES.GET_FAILED_REQUESTS,
                    status: SW_MESSAGES.FAILED_REQUESTS,
                    requestId: msg.requestId,
                    requests: [],
                });
            }
        });

        const testParams = createMutableParams("developerMode=true&preload=true");
        const preloader = new ResourcePreloader(testParams);
        await preloader.setup();
        await preloader.teardown();

        expect(registration.unregister.calledOnce).to.be(true);
        expect(otherRegistration.unregister.called).to.be(false);
    });

    it("should ignore stale PRELOAD_PROGRESS and PRELOAD_DONE messages from an earlier requestId", async () => {
        const expectedScope = new URL("./", window.location.href).href;
        const { serviceWorkerContainer, activeWorker } = createMockServiceWorkerEnv(expectedScope);
        setNavigatorServiceWorker(serviceWorkerContainer);

        const testParams = createMutableParams("developerMode=true&preload=true");
        const preloader = new ResourcePreloader(testParams);
        await preloader.setup();

        let firstPreloadRequestId = null;
        activeWorker.postMessage.callsFake((msg) => {
            if (msg.type === SW_MESSAGES.PRELOAD_SUITES && firstPreloadRequestId === null) {
                firstPreloadRequestId = msg.requestId;
                // Do not reply immediately; simulate in-flight preload that gets stopped.
            } else if (msg.type === SW_MESSAGES.STOP_PRELOADING) {
                // Before STOP_PRELOADING replies, emit stale PRELOAD_PROGRESS and PRELOAD_DONE from the first request!
                serviceWorkerContainer.emitMessage({
                    type: SW_MESSAGES.PRELOAD_SUITES,
                    status: SW_MESSAGES.PRELOAD_PROGRESS,
                    requestId: firstPreloadRequestId,
                    loaded: 1,
                    total: 2,
                    url: "suites/suite-a/app.js",
                    suiteName: "SuiteA",
                });
                serviceWorkerContainer.emitMessage({
                    type: SW_MESSAGES.PRELOAD_SUITES,
                    status: SW_MESSAGES.PRELOAD_DONE,
                    requestId: firstPreloadRequestId,
                    transferredSize: 512,
                    count: 2,
                });
                // Now reply to STOP_PRELOADING with its matching requestId.
                serviceWorkerContainer.emitMessage({
                    type: SW_MESSAGES.STOP_PRELOADING,
                    status: SW_MESSAGES.STOP_PRELOADING,
                    requestId: msg.requestId,
                });
            }
        });

        const progressSpy = sinon.spy();
        const preloadPromise = preloader.preloadSuites(TEST_SUITES, true, progressSpy);
        const stopPromise = preloader.stopPreloading();

        const [preloadResult] = await Promise.all([preloadPromise, stopPromise]);
        expect(preloadResult).to.be(null);

        // Emit another late message after no request is pending: must not throw.
        serviceWorkerContainer.emitMessage({
            type: SW_MESSAGES.PRELOAD_SUITES,
            status: SW_MESSAGES.PRELOAD_DONE,
            requestId: firstPreloadRequestId,
            transferredSize: 512,
            count: 2,
        });
    });

    it("should return false from isCached(enabledSuites) when stopped early or when enabled suites change", async () => {
        const expectedScope = new URL("./", window.location.href).href;
        const { serviceWorkerContainer, activeWorker } = createMockServiceWorkerEnv(expectedScope);
        setNavigatorServiceWorker(serviceWorkerContainer);

        const testParams = createMutableParams("developerMode=true&preload=true");
        const preloader = new ResourcePreloader(testParams);
        await preloader.setup();

        // 1. Preload stopped early -> isCached must be false.
        activeWorker.postMessage.callsFake((msg) => {
            if (msg.type === SW_MESSAGES.STOP_PRELOADING) {
                serviceWorkerContainer.emitMessage({
                    type: SW_MESSAGES.STOP_PRELOADING,
                    status: SW_MESSAGES.STOP_PRELOADING,
                    requestId: msg.requestId,
                });
            }
        });

        const abortedPreload = preloader.preloadSuites(TEST_SUITES);
        await preloader.stopPreloading();
        const abortedResult = await abortedPreload;
        expect(abortedResult).to.be(null);
        expect(preloader.isCached(TEST_SUITES)).to.be(false);

        // 2. Full preload succeeds -> isCached is true for the same suites, false if enabled suites change.
        activeWorker.postMessage.callsFake((msg) => {
            if (msg.type === SW_MESSAGES.PRELOAD_SUITES) {
                serviceWorkerContainer.emitMessage({
                    type: SW_MESSAGES.PRELOAD_SUITES,
                    status: SW_MESSAGES.PRELOAD_DONE,
                    requestId: msg.requestId,
                    transferredSize: 2048,
                    count: 2,
                });
            }
        });

        await preloader.preloadSuites(TEST_SUITES);
        expect(preloader.isCached(TEST_SUITES)).to.be(true);

        // Changing enabled suites (e.g. toggling a suite checkbox in Developer Mode) invalidates cache.
        const subsetSuites = [TEST_SUITES[0]];
        expect(preloader.isCached(subsetSuites)).to.be(false);
    });
});
