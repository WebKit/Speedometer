const CACHE_NAME = "sw-startup-workload-v1";
let ASSETS = ["./app/index.html", "./app/main.mjs", "./app/style.css", "./app/work_schedule.json", "https://esm.sh/react@18", "https://esm.sh/react-dom@18/client"];

async function cacheAssets() {
    const cache = await caches.open(CACHE_NAME);
    for (const url of ASSETS) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
                console.log("SW caching:", url);
            }
        } catch (e) {
            console.error(`Failed to cache ${url}:`, e);
        }
    }
}

async function installAssets(event) {
    await cacheAssets();
    self.skipWaiting();
}

self.addEventListener("install", (event) => {
    event.waitUntil(installAssets(event));
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

async function prefetchAssets(event) {
    await cacheAssets();
    event?.ports[0].postMessage({
        type: "PREFETCH_COMPLETE",
    });
}

self.addEventListener("message", (event) => {
    if (event.data.type === "PREFETCH")
        event.waitUntil(prefetchAssets(event));
});
