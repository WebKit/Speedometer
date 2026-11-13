import { SW_MESSAGES } from "./shared/sw-messages.mjs";
import { params } from "./shared/params.mjs";

const PRELOAD_TIMEOUT_MS = 60_000;

export class ResourcePreloader {
    constructor(customParams = params) {
        this._params = customParams;
        this._registration = null;
        this._sw = null;
        this._preloadParams = null;
        this._pendingRequest = null;
        this._onPreloadProgress = null;
        this._activePreloadPromise = null;
        this._activeStopPromise = null;
        this._nextRequestId = 1;
        this._boundOnMessage = this.onMessage.bind(this);
        this._messageListenerAdded = false;
    }

    _isServiceWorkerSupported() {
        return Boolean(globalThis.navigator?.serviceWorker);
    }

    _serializeParams(suitesOrParams = this._params, maybeSuites = undefined) {
        const targetParams = typeof suitesOrParams?.toSearchParams === "function" ? suitesOrParams : this._params;
        const suites = Array.isArray(suitesOrParams) ? suitesOrParams : maybeSuites;
        const searchParamsStr = targetParams.toSearchParams();
        if (!Array.isArray(suites))
            return searchParamsStr;
        const suiteNames = suites
            .filter((s) => typeof s === "string" ? true : s.enabled !== false)
            .map((s) => typeof s === "string" ? s : s.name)
            .join(",");
        return `${searchParamsStr}|suites:${suiteNames}`;
    }

    isCached(enabledSuites) {
        if (!this._params.preload || (!this._registration && !this._sw) || !this._preloadParams)
            return false;
        if (enabledSuites === undefined)
            return this._preloadParams.split("|suites:")[0] === this._params.toSearchParams();
        return this._preloadParams === this._serializeParams(this._params, enabledSuites);
    }

    async setup() {
        if (!this._isServiceWorkerSupported())
            return;

        if (!this._params.preload) {
            if (this._registration || this._sw)
                await this._unregisterOldServiceWorkers();
            return;
        }

        if (this._registration && this._sw)
            return;

        await this._registerServiceWorker();
        this._setupMessageListener();
    }

    async _unregisterOldServiceWorkers() {
        this._removeMessageListener();
        const activeRegistration = this._registration;
        this._registration = null;
        this._sw = null;
        this._preloadParams = null;

        if (!this._isServiceWorkerSupported())
            return;

        const expectedScope = new URL("./", window.location.href).href;
        let unregisteredActive = false;
        const existingRegistrations = await navigator.serviceWorker?.getRegistrations?.() ?? [];
        for (const existing of existingRegistrations) {
            if (existing.scope === expectedScope) {
                await existing.unregister?.();
                if (existing === activeRegistration)
                    unregisteredActive = true;
            }
        }
        if (!unregisteredActive && (!activeRegistration?.scope || activeRegistration.scope === expectedScope))
            await activeRegistration?.unregister?.();
    }

    async _registerServiceWorker() {
        if (!this._isServiceWorkerSupported())
            return;

        this._registration = await navigator.serviceWorker?.register("./sw.mjs", { type: "module" });
        const readyRegistration = await navigator.serviceWorker?.ready;
        this._sw = this._registration?.active || readyRegistration?.active || navigator.serviceWorker?.controller || null;
    }

    _setupMessageListener() {
        if (!this._isServiceWorkerSupported() || this._messageListenerAdded)
            return;
        navigator.serviceWorker?.addEventListener("message", this._boundOnMessage);
        this._messageListenerAdded = true;
    }

    _removeMessageListener() {
        if (!this._isServiceWorkerSupported() || !this._messageListenerAdded)
            return;
        navigator.serviceWorker?.removeEventListener("message", this._boundOnMessage);
        this._messageListenerAdded = false;
    }

    _isValidMessage(data) {
        if (!this._pendingRequest)
            return false;

        if (data.requestId !== undefined && data.requestId !== this._pendingRequest.requestId)
            return false;

        if (this._pendingRequest.type !== data.type)
            return false;

        return true;
    }

    onMessage(event) {
        const data = event?.data || {};

        if (data.type === SW_MESSAGES.FATAL_ERROR) {
            globalThis.benchmarkClient?.handleError(new Error(data.message));
            return;
        }

        if (!this._isValidMessage(data))
            return;

        if (data.status === SW_MESSAGES.PRELOAD_PROGRESS) {
            this._onPreloadProgress?.(data);
            return;
        }

        const { resolve, reject, timeoutId } = this._pendingRequest;
        if (timeoutId)
            clearTimeout(timeoutId);
        this._pendingRequest = null;

        if (data.status === SW_MESSAGES.ERROR)
            reject(new Error(data.message || "Unknown SW Error"));
        else
            resolve(data);
    }

    _postMessage(messageData, timeoutMs = 0) {
        if (!this._sw)
            return Promise.resolve(null);

        if (this._pendingRequest) {
            const isCooperativePreemption = this._pendingRequest.type === SW_MESSAGES.PRELOAD_SUITES || messageData.type === SW_MESSAGES.STOP_PRELOADING;

            const logMessage = `Already waiting for ${this._pendingRequest.type}, overriding with ${messageData.type}`;
            if (isCooperativePreemption) {
                console.warn(logMessage);
                this._resolvePendingRequest(null);
            } else {
                this._rejectPendingRequest(logMessage);
            }
        }

        const requestId = this._nextRequestId++;
        const payload = { ...messageData, requestId };

        return new Promise((resolve, reject) => {
            let timeoutId = null;

            if (timeoutMs > 0) {
                timeoutId = setTimeout(() => {
                    if (this._pendingRequest?.requestId === requestId)
                        this._rejectPendingRequest(`Service worker message timed out: ${messageData.type}`);
                }, timeoutMs);
            }

            this._pendingRequest = { type: messageData.type, requestId, resolve, reject, timeoutId };
            this._sw?.postMessage(payload);
        });
    }

    _resolvePendingRequest(data = null) {
        const pendingRequest = this._pendingRequest;
        this._pendingRequest = null;
        if (pendingRequest?.timeoutId)
            clearTimeout(pendingRequest.timeoutId);

        pendingRequest?.resolve(data);
    }

    _rejectPendingRequest(errorMessage) {
        const pendingRequest = this._pendingRequest;
        this._pendingRequest = null;
        if (pendingRequest?.timeoutId)
            clearTimeout(pendingRequest.timeoutId);

        console.warn(errorMessage);
        pendingRequest?.reject(new Error(errorMessage));
    }

    async teardown() {
        this._preloadParams = null;
        if (!this._sw && !this._registration)
            return;

        await this.stopPreloading();

        const response = await this.getFailedRequests();
        await this._unregisterOldServiceWorkers();
        if (response?.requests?.length > 0) {
            console.warn("The following requests failed during the benchmark and bypassed the cache:");
            console.warn(response.requests.join("\n"));
            throw new Error("The benchmark had missing resources that were not cached. Check the console for details.");
        }
    }

    async stopPreloading() {
        if (!this._sw)
            return;

        if (this._activeStopPromise) {
            await this._activeStopPromise;
            return;
        }

        if (this._activePreloadPromise || this._pendingRequest?.type === SW_MESSAGES.PRELOAD_SUITES)
            this._preloadParams = null;

        const activePreloadPromise = this._activePreloadPromise;
        this._activeStopPromise = this._postMessage({ type: SW_MESSAGES.STOP_PRELOADING });
        try {
            await this._activeStopPromise;
            if (activePreloadPromise)
                await activePreloadPromise;
        } finally {
            this._activeStopPromise = null;
        }
    }

    async preloadSuites(suites, clearCache = true, onProgress) {
        if (!this._isServiceWorkerSupported())
            return undefined;

        if (!this._params.preload) {
            if (this._registration || this._sw)
                await this._unregisterOldServiceWorkers();
            return undefined;
        }

        if (this._activeStopPromise)
            await this._activeStopPromise;

        if (!this._sw && !this._registration)
            await this.setup();

        if (!this._sw)
            return undefined;

        if (this._activePreloadPromise || this._onPreloadProgress)
            throw new Error("Preload already active");

        this._preloadParams = null;

        const suitesData = suites
            .filter((s) => s.resources)
            .map((s) => ({
                name: s.name,
                url: new URL(s.url, window.location.href).href,
                resources: new URL(s.resources, window.location.href).href,
            }));

        if (suitesData.length === 0)
            return undefined;

        this._onPreloadProgress = onProgress;
        const startTime = performance.now();
        try {
            this._activePreloadPromise = this._postMessage({ type: SW_MESSAGES.PRELOAD_SUITES, suites: suitesData, clearCache }, PRELOAD_TIMEOUT_MS);
            const response = await this._activePreloadPromise;
            if (this._activeStopPromise)
                await this._activeStopPromise;

            if (response?.status === SW_MESSAGES.PRELOAD_DONE) {
                const timeTakenMs = performance.now() - startTime;
                const sizeMB = ((response.transferredSize || 0) / (1024 * 1024)).toFixed(2);
                const timeSec = (timeTakenMs / 1000).toFixed(2);
                console.log(`Preloaded ${response.count} files (${sizeMB} MB transferred) in ${timeSec}s`);
                this._preloadParams = this._serializeParams(this._params, suites);
            }
            return response;
        } finally {
            this._activePreloadPromise = null;
            this._onPreloadProgress = null;
        }
    }

    async getFailedRequests() {
        if (!this._sw)
            return { requests: [] };

        const response = await this._postMessage({ type: SW_MESSAGES.GET_FAILED_REQUESTS });
        return response || { requests: [] };
    }
}

export class PreloadStatusUpdater {
    constructor() {
        this._latestData = null;
        this._rafId = null;
        this._updateFn = this._updateUI.bind(this);

        this._progressCompletedElement = document.getElementById("preload-progress-completed");
        this._infoLabelElement = document.getElementById("preload-info-label");
        this._infoProgressElement = document.getElementById("preload-info-progress");
    }

    start() {
        this.stop();
        this._progressCompletedElement.max = 1;
        this._progressCompletedElement.value = 0;
        this._infoLabelElement.textContent = "";
        this._infoProgressElement.textContent = "";
        document.body.style.setProperty("--preload-progress", "0%");
    }

    onProgress(data) {
        this._latestData = data;
        if (!this._rafId)
            this._rafId = requestAnimationFrame(this._updateFn);
    }

    _updateUI() {
        this._rafId = null;
        const data = this._latestData;
        if (!data)
            return;

        const { loaded, total, url, suiteName } = data;
        document.body.style.setProperty("--preload-progress", `${total > 0 ? (loaded / total) * 100 : 100}%`);
        this._progressCompletedElement.max = total > 0 ? total : 1;
        this._progressCompletedElement.value = total > 0 ? loaded : 0;
        const match = url?.match(/(?:suites(?:-experimental)?|resources)\/(.+)$/);
        const filename = match?.[1] ?? "";
        this._infoLabelElement.textContent = `${suiteName}: ${filename}`;
        this._infoProgressElement.textContent = `${loaded} / ${total}`;
    }

    stop() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._latestData = null;
    }
}
