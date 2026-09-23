import { SW_MESSAGES } from "./resources/shared/sw-messages.mjs";
import { RequestLimiter } from "./resources/shared/request-limiter.mjs";

const CACHE_NAME = "speedometer-cache-v4";
const MAX_CONCURRENT_REQUESTS = 20;
const WORKER_STATE = {
    failedRequests: new Set(),
    abortController: null,
    requestLimiter: new RequestLimiter(MAX_CONCURRENT_REQUESTS),
};

function replyToClient(event, status, msg = {}) {
    const type = event.data?.type;
    event.source?.postMessage({ type, status, ...msg });
}

function replyError(event, message) {
    replyToClient(event, SW_MESSAGES.ERROR, { message });
}

async function handleStopPreloadingMessage(event) {
    await stopPreloading(event.source?.id);
    replyToClient(event, SW_MESSAGES.STOP_PRELOADING);
}

async function stopPreloading(currentClientId) {
    if (WORKER_STATE.abortController) {
        WORKER_STATE.abortController.abort();
        WORKER_STATE.abortController = null;
    }
    await stopAllOtherClients(currentClientId);
    WORKER_STATE.requestLimiter.clear();
}

async function stopAllOtherClients(currentClientId) {
    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of allClients) {
        if (currentClientId && client.id !== currentClientId)
            client.postMessage({ type: SW_MESSAGES.FATAL_ERROR, message: "Aborted Run: Another tab took over." });
    }

}

async function handlePreloadSuitesMessage(event, { suites = [], clearCache = true }) {
    try {
        await stopPreloading(event.source?.id);
        // debounce on progress callbacks to limit overhead.
        const MAX_RATE_MS = 100;
        const onProgress = (payload) => {
            replyToClient(event, SW_MESSAGES.PRELOAD_PROGRESS, payload);
        };
        const { transferredSize, count } = await preloadSuites(suites, clearCache, throttle(onProgress, MAX_RATE_MS));
        replyToClient(event, SW_MESSAGES.PRELOAD_DONE, { transferredSize, count });
    } catch (error) {
        if (error.name === "AbortError")
            return;
        console.error("Error during preload:", error);
        replyError(event, error.message || "Failed to preload resources.");
    }
}

function throttle(callback, max_rate_ms) {
    let lastCallbackTime = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCallbackTime > max_rate_ms) {
            lastCallbackTime = now;
            callback(...args);
        }
    };
}

async function preloadSuites(suites, clearCache, onProgress) {
    const abortController = new AbortController();
    const signal = abortController.signal;
    WORKER_STATE.abortController = abortController;

    WORKER_STATE.failedRequests.clear();
    if (clearCache)
        await caches.delete(CACHE_NAME);

    const cache = await caches.open(CACHE_NAME);
    const urlsToCache = await getUrlsToCache(suites, signal);
    const total = urlsToCache.length;

    let loaded = 0;
    let transferredSize = 0;

    const promises = urlsToCache.map(async (item, index) => {
        const size = await fetchAndCache(cache, item.url, signal);
        transferredSize += size;
        loaded++;
        if (!signal.aborted)
            onProgress({ loaded, total, url: item.url, suiteName: item.suiteName });
    });

    await Promise.all(promises);
    return { transferredSize, count: urlsToCache.length };
}

async function getUrlsToCache(suites, signal) {
    const urlsToCache = [];
    for (const suite of suites) {
        signal.throwIfAborted();
        if (suite.resources)
            urlsToCache.push(...await parseSuiteResources(suite, signal));
    }

    return urlsToCache;
}

async function parseSuiteResources(suite, signal) {
    const response = await fetch(suite.resources, { signal });
    if (!response.ok) {
        const errorMsg = `Failed to load resources for suite ${suite.name}: ${suite.resources} returned ${response.status}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
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

async function fetchAndCache(cache, url, signal) {
    signal.throwIfAborted();

    return WORKER_STATE.requestLimiter.schedule(async () => {
        signal.throwIfAborted();
        const request = new Request(url, { cache: "no-cache", signal });
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
            signal.throwIfAborted();
            console.error("Cache failed for", url, e);
            return 0;
        }
    });
}

function getResponseSize(response) {
    const contentLength = response.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) : 0;
}

async function handleGetFailedRequestsMessage(event) {
    replyToClient(event, SW_MESSAGES.FAILED_REQUESTS, { requests: Array.from(WORKER_STATE.failedRequests) });
}

const MESSAGE_HANDLERS = Object.freeze({
    [SW_MESSAGES.PRELOAD_SUITES]: handlePreloadSuitesMessage,
    [SW_MESSAGES.STOP_PRELOADING]: handleStopPreloadingMessage,
    [SW_MESSAGES.GET_FAILED_REQUESTS]: handleGetFailedRequestsMessage,
});

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
    const { data } = event;
    if (!data)
        return;
    const handler = MESSAGE_HANDLERS[data.type];
    if (handler)
        event.waitUntil(handler(event, data));
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
                WORKER_STATE.failedRequests.add(event.request.url);
                return Response.error();
            }
        })()
    );
});
