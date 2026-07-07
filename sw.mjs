import { SW_MESSAGES } from "./resources/shared/sw-messages.mjs";

const CACHE_NAME = "speedometer-cache-v4.0";
const DB_NAME = "SpeedometerStateDB";
const STORE_NAME = "SpeedometerSWState";
const DB_VERSION = 2;

class LockStore {
    constructor() {
        this.activeClientId = null;
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

    async getOwner() {
        if (this.activeClientId !== null)
            return this.activeClientId;
        try {
            const db = await this._openDB();
            const data = await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, "readonly");
                const req = tx.objectStore(STORE_NAME).get("stateData");
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
            this.activeClientId = data?.clientId || null;
        } catch (e) {
            console.warn("IndexedDB read failed", e);
            this.activeClientId = null;
        }
        return this.activeClientId;
    }

    async setOwner(clientId) {
        this.activeClientId = clientId;
        try {
            const db = await this._openDB();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const req = tx.objectStore(STORE_NAME).put({ clientId }, "stateData");
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        } catch (e) {
            console.warn("IndexedDB write failed", e);
        }
    }

    async clear() {
        this.activeClientId = null;
        try {
            const db = await this._openDB();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const req = tx.objectStore(STORE_NAME).delete("stateData");
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        } catch (e) {
            console.warn("IndexedDB clear failed", e);
        }
    }

    hasLock(clientId) {
        if (!this.activeClientId)
            return true;
        return this.activeClientId === clientId;
    }
}

const STORE = new LockStore();

function replyToClient(event, type, msg = {}) {
    event.ports?.[0]?.postMessage({ type, ...msg });
}

function replyError(event, message) {
    replyToClient(event, "ERROR", { message });
}

function delayAsync(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_CONCURRENT_REQUESTS = 20;
function createConcurrencyLimiter(limit = MAX_CONCURRENT_REQUESTS) {
    let active = 0;
    const queue = [];
    const next = () => {
        if (active >= limit || queue.length === 0)
            return;
        active++;
        const task = queue.shift();
        task().finally(() => {
            active--;
            next();
        });
    };
    return (fn) =>
        new Promise((resolve, reject) => {
            queue.push(() => fn().then(resolve, reject));
            next();
        });
}
const requestLimiter = createConcurrencyLimiter(MAX_CONCURRENT_REQUESTS);

async function handlePreloadSuitesMessage(event, clientId, { suites = [], delay = 0, clearCache = true }) {
    await STORE.getOwner();
    await updateActiveClient(clientId);

    if (clearCache)
        await caches.delete(CACHE_NAME);

    const cache = await caches.open(CACHE_NAME);
    let loaded = 0;
    let transferredSize = 0;
    const urlsToCache = [];

    for (const suite of suites) {
        if (!suite.resources)
            continue;
        urlsToCache.push(...await parseSuiteResources(suite));
    }

    const total = urlsToCache.length;
    const promises = urlsToCache.map(async (item, index) => {
        const size = await fetchAndCache(cache, item.url, delay * index);
        transferredSize += size;
        loaded++;
        replyToClient(event, SW_MESSAGES.PRELOAD_PROGRESS, { loaded, total, url: item.url, suiteName: item.suiteName });
    });

    await Promise.all(promises);

    if (!STORE.hasLock(clientId)) {
        replyError(event, "Speedometer aborted: Another tab took over.");
        return;
    }
    replyToClient(event, SW_MESSAGES.PRELOAD_DONE, { transferredSize, count: urlsToCache.length });
}

async function parseSuiteResources(suite) {
    const response = await fetch(suite.resources);
    if (!response.ok)
        return [];
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
    return requestLimiter(async () => {
        const request = new Request(url, { cache: "no-cache" });
        const existing = await cache.match(request);
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
    const oldClientId = STORE.activeClientId;
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
    await STORE.getOwner();
    if (!STORE.hasLock(clientId)) {
        replyError(event, "Cannot clear SW: You do not own the lock.");
        return;
    }
    await STORE.clear();
    replyToClient(event, "SUCCESS");
}

const MESSAGE_HANDLERS = Object.freeze({
    __proto__: null,
    [SW_MESSAGES.PRELOAD_SUITES]: handlePreloadSuitesMessage,
    [SW_MESSAGES.CLEAR_CACHE]: handleClearCacheMessage,
});

self.addEventListener("message", (event) => {
    const { data } = event;
    if (!data)
        return;
    const handler = MESSAGE_HANDLERS[data.type];
    if (handler)
        event.waitUntil(handler(event, event.source?.id, data));
    else
        console.error("Unknown service worker message type:", data.type);
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request, { ignoreSearch: true });
            if (cachedResponse)
                return cachedResponse;

            return fetch(event.request);
        })()
    );
});
