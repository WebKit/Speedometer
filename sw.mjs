const CACHE_NAME = "speedometer-cache-v4.0";
const DB_NAME = "SpeedometerStateDB";
const STORE_NAME = "stateStore";

const BENCHMARK_STATE = {
    IDLE: "IDLE",
    RUNNING: "RUNNING",
};

import { SW_MESSAGES } from "./resources/shared/sw-messages.mjs";

let currentState = null;
let cachedSuitesPrefixes = null;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function ensureState() {
    if (currentState !== null) return;
    try {
        const db = await openDB();
        const data = await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const req = tx.objectStore(STORE_NAME).get('stateData');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        if (data) {
            currentState = data.state;
            cachedSuitesPrefixes = new Set(data.prefixes);
        } else {
            currentState = BENCHMARK_STATE.IDLE;
            cachedSuitesPrefixes = new Set();
        }
    } catch (e) {
        console.warn("IndexedDB read failed, falling back to IDLE", e);
        currentState = BENCHMARK_STATE.IDLE;
        cachedSuitesPrefixes = new Set();
    }
}

async function saveState(state, prefixes) {
    currentState = state;
    if (prefixes) cachedSuitesPrefixes = new Set(prefixes);
    
    try {
        const db = await openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const req = tx.objectStore(STORE_NAME).put({ 
                state: currentState, 
                prefixes: Array.from(cachedSuitesPrefixes || []) 
            }, 'stateData');
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.warn("IndexedDB write failed", e);
    }
}

function replyToClient(event, msg) {
    event.ports[0].postMessage(msg);
}

function delayAsync(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Limits concurrent promise executions.
 * Returns a function that queues tasks and runs at most `limit` simultaneously.
 */
function createConcurrencyLimiter(limit) {
    let active = 0;
    const queue = [];
    const next = () => {
        if (active >= limit || queue.length === 0) return;

        active++;
        const task = queue.shift();
        task().finally(() => {
            active--;
            next();
        });
    };
    return (fn) => new Promise((resolve, reject) => {
        queue.push(() => fn().then(resolve, reject));
        next();
    });
}

const MAX_CONCURRENT_REQUESTS = 20;
const requestLimiter = createConcurrencyLimiter(MAX_CONCURRENT_REQUESTS);

async function handlePreload(event, { suites = [], delay = 0, clearCache = true }) {
    if (clearCache) {
        await caches.delete(CACHE_NAME);
        await saveState(BENCHMARK_STATE.IDLE, new Set());
    }
    const cache = await caches.open(CACHE_NAME);

    await ensureState();

    let loaded = 0;
    let totalSize = 0;
    const urlsToCache = [];
    
    for (const suite of suites) {
        if (!suite.resources) continue;
        const prefix = new URL(".", suite.url).href;
        cachedSuitesPrefixes.add(prefix);
        urlsToCache.push(...await parseSuiteResources(suite));
    }

    await saveState(currentState, cachedSuitesPrefixes);

    const total = urlsToCache.length;
    const promises = urlsToCache.map(async (item, index) => {
        const size = await fetchAndCache(cache, item.url, delay * index);
        totalSize += size;
        loaded++;
        replyToClient(event, { type: SW_MESSAGES.PRELOAD_PROGRESS, loaded, total, url: item.url, suiteName: item.suiteName });
    });

    await Promise.all(promises);

    replyToClient(event, { type: SW_MESSAGES.PRELOAD_DONE, totalSize, count: urlsToCache.length });
}

async function parseSuiteResources(suite) {
    try {
        const response = await fetch(suite.resources);
        if (!response.ok) return [];
        const text = await response.text();
        return text
            .trim()
            .split("\n")
            .map((resourceUrl) => ({
                url: new URL(resourceUrl.trim(), suite.url).href,
                suiteName: suite.name,
            }));
    } catch (e) {
        console.warn("Failed to fetch resources.txt for", suite.name);
        return [];
    }
}

async function fetchAndCache(cache, url, delayMs) {
    if (delayMs) await delayAsync(delayMs);

    return requestLimiter(async () => {
        const request = new Request(url, { cache: "no-cache" });
        const existing = await cache.match(request);
        if (existing) {
            const blob = await existing.blob();
            return blob.size;
        }

        try {
            await cache.add(request);
            const cachedResponse = await cache.match(request);
            if (!cachedResponse) return 0;
            const blob = await cachedResponse.blob();
            return blob.size;
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

self.addEventListener("message", (event) => {
    const { data } = event;
    if (!data) return;

    if (data.type === SW_MESSAGES.SET_STATE) {
        event.waitUntil((async () => {
            await ensureState();
            if (currentState === BENCHMARK_STATE.RUNNING && data.state === BENCHMARK_STATE.RUNNING) {
                if (event.ports[0]) event.ports[0].postMessage({ type: 'ERROR', message: "Another Speedometer instance is already running." });
                return;
            }
            await saveState(data.state, cachedSuitesPrefixes);
            if (event.ports[0]) event.ports[0].postMessage({ type: 'SUCCESS' });
        })());
    } else if (data.type === SW_MESSAGES.PRELOAD_SUITES) {
        event.waitUntil((async () => {
            await ensureState();
            if (currentState === BENCHMARK_STATE.RUNNING) {
                if (event.ports[0]) event.ports[0].postMessage({ type: 'ERROR', message: "Another Speedometer instance is already running." });
                return;
            }
            await handlePreload(event, data);
        })());
    }
});

self.addEventListener("fetch", (event) => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request, { ignoreSearch: true });
        if (cachedResponse) return cachedResponse;

        await ensureState();

        if (currentState !== BENCHMARK_STATE.RUNNING) {
            return fetch(event.request);
        }

        for (const prefix of cachedSuitesPrefixes) {
            if (event.request.url.startsWith(prefix) || event.request.referrer.startsWith(prefix)) {
                console.warn(`Blocked uncached request for cached suite: ${event.request.url} (referrer: ${event.request.referrer})`);
                return Response.error();
            }
        }
        
        return fetch(event.request);
    })());
});
