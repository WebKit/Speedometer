import { SW_MESSAGES } from "./resources/shared/sw-messages.mjs";

const CACHE_NAME = "speedometer-cache-v4.0";
const DB_NAME = "SpeedometerStateDB";
const STORE_NAME = "SpeedometerSWState";
const DB_VERSION = 2;
let failedRequests = new Set();

class LockStore {
    constructor() {
        this.dbPromise = null;
    }

    async _openDB() {
        if (this.dbPromise)
            return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME))
                    db.createObjectStore(STORE_NAME);
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                this.dbPromise = null;
                reject(request.error);
            };
        });
        return this.dbPromise;
    }

    async _runTransaction(mode, callback) {
        try {
            const db = await this._openDB();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, mode);
                const req = callback(tx.objectStore(STORE_NAME));
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        } catch (e) {
            console.warn(`IndexedDB ${mode} failed`, e);
            return null;
        }
    }

    async getOwner() {
        const data = await this._runTransaction("readonly", (store) => store.get("stateData"));
        return data?.clientId || null;
    }

    async setOwner(clientId) {
        await this._runTransaction("readwrite", (store) => store.put({ clientId }, "stateData"));
    }

    async clear() {
        await this._runTransaction("readwrite", (store) => store.delete("stateData"));
    }

    async hasLock(clientId) {
        const activeClientId = await this.getOwner();
        if (!activeClientId)
            return true;
        return activeClientId === clientId;
    }
}

const STORE = new LockStore();

function replyToClient(event, status, msg = {}) {
    const type = event.data?.type;
    event.source?.postMessage({ type, status, ...msg });
}

function replyError(event, message) {
    replyToClient(event, SW_MESSAGES.ERROR, { message });
}

function delayAsync(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_CONCURRENT_REQUESTS = 20;

class RequestLimiter {
    constructor(limit = MAX_CONCURRENT_REQUESTS) {
        this.limit = limit;
        this.active = 0;
        this.queue = [];
    }

    async _processQueue() {
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            try {
                await task();
            } catch (e) {
                // Individual task errors are handled by their respective promises
            }
            await delayAsync(1); // Yield to event loop
        }
        this.active--;
    }

    schedule(fn) {
        return new Promise((resolve, reject) => {
            const task = () => fn().then(resolve, reject);
            task.resolve = resolve;
            this.queue.push(task);

            if (this.active < this.limit) {
                this.active++;
                this._processQueue(); // Intentionally not awaited
            }
        });
    }

    clear() {
        for (const task of this.queue)
            task.resolve?.(0);

        this.queue.length = 0;
    }
}

const requestLimiter = new RequestLimiter(MAX_CONCURRENT_REQUESTS);

let currentPreloadEvent = null;
let currentPreloadId = 0;

function handleResetPreloadingMessage(event) {
    if (currentPreloadEvent)
        replyToClient(currentPreloadEvent, SW_MESSAGES.PRELOAD_ABORTED);

    currentPreloadEvent = null;
    currentPreloadId++;
    requestLimiter.clear();
    if (event)
        replyToClient(event, SW_MESSAGES.RESET_PRELOADING);
}

async function handlePreloadSuitesMessage(event, clientId, { suites = [], delay = 0, clearCache = true }) {
    try {
        await STORE.getOwner();
        await updateActiveClient(clientId);

        handleResetPreloadingMessage(); // Call it without event to avoid replying to the PRELOAD_SUITES channel!

        currentPreloadEvent = event;
        const preloadId = currentPreloadId;

        failedRequests.clear();
        if (clearCache)
            await caches.delete(CACHE_NAME);

        const cache = await caches.open(CACHE_NAME);
        const urlsToCache = await getUrlsToCache(suites);
        const total = urlsToCache.length;

        let loaded = 0;
        let transferredSize = 0;

        const promises = urlsToCache.map(async (item, index) => {
            if (preloadId !== currentPreloadId)
                return;
            const size = await fetchAndCache(cache, item.url, delay * index);
            if (preloadId !== currentPreloadId)
                return;
            transferredSize += size;
            loaded++;
            replyToClient(event, SW_MESSAGES.PRELOAD_PROGRESS, { loaded, total, url: item.url, suiteName: item.suiteName });
        });

        await Promise.all(promises);

        if (preloadId !== currentPreloadId)
            return;

        if (!await STORE.hasLock(clientId)) {
            replyError(event, "Speedometer aborted: Another tab took over.");
            return;
        }
        replyToClient(event, SW_MESSAGES.PRELOAD_DONE, { transferredSize, count: urlsToCache.length });
    } catch (error) {
        console.error("Error during preload:", error);
        replyError(event, error.message || "Failed to preload resources.");
    } finally {
        if (currentPreloadEvent === event)
            currentPreloadEvent = null;
    }
}

async function getUrlsToCache(suites) {
    const urlsToCache = [];
    for (const suite of suites) {
        if (suite.resources)
            urlsToCache.push(...await parseSuiteResources(suite));
    }

    return urlsToCache;
}

async function parseSuiteResources(suite) {
    const response = await fetch(suite.resources);
    if (!response.ok) {
        console.error(`Failed to load resources for suite ${suite.name}: ${suite.resources} returned ${response.status}`);
        throw new Error(`Failed to load resources for suite ${suite.name}: ${suite.resources} returned ${response.status}`);
    }
    const text = await response.text();
    return text
        .trim()
        .split("\n")
        .map((resourceUrl) => ({
            url: new URL(resourceUrl.trim(), suite.url).href,
            suiteName: suite.name,
        }));
}

function getResponseSize(response) {
    const contentLength = response.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) : 0;
}

async function fetchAndCache(cache, url, delayMs) {
    if (delayMs)
        await delayAsync(delayMs);
    return requestLimiter.schedule(async () => {
        const request = new Request(url, { cache: "no-cache" });
        const existing = await cache.match(request, { ignoreSearch: true });
        if (existing)
            return getResponseSize(existing);

        try {
            const response = await fetch(request);
            if (!response.ok)
                return 0;
            const size = getResponseSize(response);
            await cache.put(request, response);
            return size;
        } catch (e) {
            console.warn("Cache failed for", url, e);
            return 0;
        }
    });
}

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

async function updateActiveClient(newClientId) {
    const oldClientId = await STORE.getOwner();
    if (oldClientId === newClientId)
        return false;

    await STORE.setOwner(newClientId);

    if (oldClientId) {
        const oldClient = await self.clients.get(oldClientId);
        oldClient?.postMessage({ type: SW_MESSAGES.FATAL_ERROR, message: "Speedometer aborted: Another tab took over." });
    }
    return true;
}

async function handleClearCacheMessage(event, clientId) {
    try {
        if (!await STORE.hasLock(clientId)) {
            replyError(event, "Cannot clear SW: You do not own the lock.");
            return;
        }
        await STORE.clear();
        replyToClient(event, SW_MESSAGES.SUCCESS);
    } catch (e) {
        replyError(event, e.message || "Failed to clear cache");
    }
}

async function handleGetFailedRequestsMessage(event, clientId) {
    replyToClient(event, SW_MESSAGES.FAILED_REQUESTS, { requests: Array.from(failedRequests) });
}

async function handleGetClientIdMessage(event, clientId) {
    const id = event.source?.id || clientId || crypto.randomUUID();
    replyToClient(event, SW_MESSAGES.CLIENT_ID, { clientId: id });
}

const MESSAGE_HANDLERS = Object.freeze({
    [SW_MESSAGES.PRELOAD_SUITES]: handlePreloadSuitesMessage,
    [SW_MESSAGES.RESET_PRELOADING]: handleResetPreloadingMessage,
    [SW_MESSAGES.CLEAR_CACHE]: handleClearCacheMessage,
    [SW_MESSAGES.GET_FAILED_REQUESTS]: handleGetFailedRequestsMessage,
    [SW_MESSAGES.GET_CLIENT_ID]: handleGetClientIdMessage,
});

self.addEventListener("message", (event) => {
    const { data } = event;
    if (!data)
        return;
    const clientId = data.clientId || event.source?.id;
    const handler = MESSAGE_HANDLERS[data.type];
    if (handler)
        event.waitUntil(handler(event, clientId, data));
    else
        console.error("Unknown service worker message type:", data.type);
});

self.addEventListener("fetch", (event) => {
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin")
        return;

    event.respondWith(
        (async () => {
            let requestToMatch = event.request;
            const urlObj = new URL(event.request.url);
            if (urlObj.pathname.endsWith("/")) {
                urlObj.pathname += "index.html";
                requestToMatch = urlObj.href;
            }

            const cachedResponse = await caches.match(requestToMatch, { cacheName: CACHE_NAME, ignoreSearch: true });
            if (cachedResponse)
                return cachedResponse;

            try {
                return await fetch(event.request);
            } catch (error) {
                failedRequests.add(event.request.url);
                return Response.error();
            }
        })()
    );
});
