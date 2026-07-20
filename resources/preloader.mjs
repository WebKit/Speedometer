import { SW_MESSAGES } from "./shared/sw-messages.mjs";
import { params } from "./shared/params.mjs";

const PRELOAD_TIMEOUT_MS = 60_000;

export class ResourcePreloader {
    constructor() {
        this._registration = null;
        this._sw = null;
        this._preloadParams = "";
        this._pendingRequest = null;
        this._onPreloadProgress = null;
    }

    isCached() {
        if (!params.preload)
            return true;
        return params.toSearchParams() === this._preloadParams;
    }

    async setup() {
        if (!params.preload) {
            await this._unregisterOldServiceWorkers();
            return;
        }

        await this._registerServiceWorker();
        this._setupMessageListener();
    }

    async _unregisterOldServiceWorkers() {
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const existing of existingRegistrations)
            await existing.unregister();
        this._registration = null;
        this._sw = null;
    }

    async _registerServiceWorker() {
        this._registration = await navigator.serviceWorker.register("./sw.mjs", { type: "module" });
        await navigator.serviceWorker.ready;
        this._sw = navigator.serviceWorker.controller || this._registration.active;
    }

    _setupMessageListener() {
        navigator.serviceWorker.addEventListener("message", this.onMessage.bind(this));
    }

    _validateMessageRouting(data) {
        if (!this._pendingRequest)
            throw new Error(`Received unexpected ServiceWorker message without any pending request: ${data.type}`);

        if (this._pendingRequest.type !== data.type)
            throw new Error(`Received ServiceWorker message type '${data.type}' but expected '${this._pendingRequest.type}'`);
    }

    onMessage(event) {
        const data = event.data || {};

        if (data.type === SW_MESSAGES.FATAL_ERROR) {
            globalThis.benchmarkClient?.handleError(new Error(data.message));
            return;
        }

        this._validateMessageRouting(data);

        if (data.status === SW_MESSAGES.PRELOAD_PROGRESS) {
            this._onPreloadProgress(data);
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
            return Promise.resolve();

        if (this._pendingRequest)
            this._rejectPendingRequest(`Already waiting for ${this._pendingRequest.type}, overriding with ${messageData.type}`);

        return new Promise((resolve, reject) => {
            let timeoutId = null;

            if (timeoutMs > 0) {
                timeoutId = setTimeout(() => {
                    if (this._pendingRequest?.type === messageData.type)
                        this._rejectPendingRequest(`Service worker message timed out: ${messageData.type}`);
                }, timeoutMs);
            }

            this._pendingRequest = { type: messageData.type, resolve, reject, timeoutId };
            this._sw.postMessage(messageData);
        });
    }

    _rejectPendingRequest(errorMessage) {
        const pendingRequest = this._pendingRequest;
        this._pendingRequest = null;
        if (pendingRequest.timeoutId)
            clearTimeout(pendingRequest.timeoutId);

        console.warn(errorMessage);
        pendingRequest.reject(new Error(errorMessage));
    }

    async teardown() {
        const response = await this.getFailedRequests();
        if (response.requests?.length > 0) {
            console.warn("The following requests failed during the benchmark and bypassed the cache:");
            console.warn(response.requests.join("\n"));
            throw new Error("The benchmark had missing resources that were not cached. Check the console for details.");
        }
    }

    async stopPreloading() {
        if (!this._sw)
            return;
        await this._postMessage({ type: SW_MESSAGES.STOP_PRELOADING });
        if (this._activePreloadPromise)
            await this._activePreloadPromise;
    }

    async preloadSuites(suites, clearCache = true, onProgress) {
        if (!this._sw)
            return undefined;
        if (this._onPreloadProgress)
            throw new Error("Preload already active");
        this._onPreloadProgress = onProgress;

        const suitesData = suites
            .filter((s) => s.resources)
            .map((s) => ({
                name: s.name,
                url: new URL(s.url, window.location.href).href,
                resources: new URL(s.resources, window.location.href).href,
            }));

        if (suitesData.length === 0)
            return undefined;

        const startTime = performance.now();
        this._activePreloadPromise = this._postMessage({ type: SW_MESSAGES.PRELOAD_SUITES, suites: suitesData, clearCache }, PRELOAD_TIMEOUT_MS);
        const response = await this._activePreloadPromise;
        this._activePreloadPromise = null;

        if (response.status === SW_MESSAGES.PRELOAD_DONE) {
            const timeTakenMs = performance.now() - startTime;
            const sizeMB = (response.transferredSize / (1024 * 1024)).toFixed(2);
            const timeSec = (timeTakenMs / 1000).toFixed(2);
            console.log(`Preloaded ${response.count} files (${sizeMB} MB transferred) in ${timeSec}s`);
        }
        this._preloadParams = params.toSearchParams();
        return undefined;
    }

    async getFailedRequests() {
        return this._postMessage({ type: SW_MESSAGES.GET_FAILED_REQUESTS });
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
        this._progressCompletedElement.max = total;
        this._progressCompletedElement.value = loaded;
        const match = url.match(/(?:suites(?:-experimental)?|resources)\/(.+)$/);
        const filename = match ? match[1] : "";
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
