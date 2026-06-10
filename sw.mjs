const CACHE_NAME = "speedometer-cache-v4.0";

const BENCHMARK_STATE = {
    IDLE: "IDLE",
    RUNNING: "RUNNING",
};

import { SW_MESSAGES } from "./resources/shared/sw-messages.mjs";

let currentState = BENCHMARK_STATE.IDLE;
let cachedUrls = new Set();
let cachedSuitesPrefixes = new Set();

function replyToClient(event, msg) {
    event.ports[0].postMessage(msg);
}

function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handlePrecache(event, { suites = [], delay = 0 }) {
    await caches.delete(CACHE_NAME);
    const cache = await caches.open(CACHE_NAME);

    let loaded = 0;
    let totalSize = 0;
    const urlsToCache = [];

    cachedSuitesPrefixes.clear();
    for (const suite of suites) {
        if (!suite.resources) continue;
        const prefix = new URL(".", suite.url).href;
        cachedSuitesPrefixes.add(prefix);
        urlsToCache.push(...await parseSuiteResources(suite));
    }

    const total = urlsToCache.length;
    const promises = urlsToCache.map(async (item, index) => {
        const size = await fetchAndCache(cache, item.url, delay * index);
        totalSize += size;
        loaded++;
        replyToClient(event, { type: SW_MESSAGES.PRECACHE_PROGRESS, loaded, total, url: item.url, suiteName: item.suiteName });
    });

    await Promise.all(promises);

    cachedUrls = new Set(urlsToCache.map(item => item.url));
    replyToClient(event, { type: SW_MESSAGES.PRECACHE_DONE, totalSize, count: urlsToCache.length });
}

async function parseSuiteResources(suite) {
    try {
        const response = await fetch(suite.resources);
        if (!response.ok) return [];
        const text = await response.text();
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        return lines.map(resourceUrl => ({
            url: new URL(resourceUrl, suite.url).href,
            suiteName: suite.name
        }));
    } catch (e) {
        console.warn("Failed to fetch resources.txt for", suite.name);
        return [];
    }
}

async function fetchAndCache(cache, url, delayMs) {
    if (delayMs) await delayAsync(delayMs);
    const request = new Request(url, { cache: "no-cache" });
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
}

self.addEventListener("install", function () {
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("message", function (event) {
    const { data } = event;
    if (!data) return;

    if (data.type === SW_MESSAGES.SET_STATE) {
        currentState = data.state;
    } else if (data.type === SW_MESSAGES.PRECACHE_SUITES) {
        event.waitUntil(handlePrecache(event, data));
    }
});

self.addEventListener("fetch", function (event) {
    const isCached = cachedUrls.has(event.request.url);

    if (isCached) {
        event.respondWith(handleFetch(event.request));
        return;
    }

    // We only enforce strict blocking when the benchmark is actively RUNNING 
    // to allow runner resources to be loaded.
    if (currentState !== BENCHMARK_STATE.RUNNING) return;

    let isCachedSuite = false;
    for (const prefix of cachedSuitesPrefixes) {
        if (event.request.url.startsWith(prefix) || event.request.referrer.startsWith(prefix)) {
            isCachedSuite = true;
            break;
        }
    }

    if (isCachedSuite) {
        console.warn(`Blocked uncached request for cached suite: ${event.request.url} (referrer: ${event.request.referrer})`);
        event.respondWith(Promise.resolve(Response.error()));
        return;
    }
    // Bypass Service Worker for everything else
});

async function handleFetch(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    return fetch(request);
}
