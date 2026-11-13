import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { log, scheduleFlush, setLoggerRoute } from "./analytics/logger.js";

// Routes live in memory only. The History API is rate limited per top-level page (WebKit
// throws after 100 pushState/replaceState calls in 10s across every frame), so URL updates
// would make this workload fail depending on which suites ran before it. Page navigations
// render in a transition, like a client-side router does; the post dialog opens as an
// overlay on top of whatever page is underneath.

const RouterContext = createContext(null);

function routeName(path) {
    if (path.startsWith("/profile/"))
        return "profile";
    return "home";
}

function parse(hash) {
    const path = hash.replace(/^#/, "") || "/";
    if (path.startsWith("/post/"))
        return { page: "/", overlay: path.slice("/post/".length) };
    return { page: path, overlay: null };
}

let controls = null;
let currentPage = "/";

export function navigate(path) {
    setLoggerRoute(routeName(path));
    log("page_view", { route: routeName(path), from: routeName(currentPage) });
    currentPage = path;
    scheduleFlush("navigation");
    startTransition(() => controls.setPage(path));
}

export function openPost(storyId) {
    log("page_view", { route: "post", from: routeName(currentPage), overlay: true });
    scheduleFlush("navigation");
    controls.setOverlay(storyId);
}

export function closePost() {
    log("overlay_dismiss", { route: "post" });
    scheduleFlush("navigation");
    controls.setOverlay(null);
}

export function RouterProvider({ children }) {
    const [initial] = useState(() => {
        const route = parse(window.location.hash);
        currentPage = route.page;
        return route;
    });
    const [page, setPage] = useState(initial.page);
    const [overlay, setOverlay] = useState(initial.overlay);
    controls = { setPage, setOverlay };

    useEffect(() => {
        setLoggerRoute(routeName(page));
    }, []);

    return <RouterContext.Provider value={{ page, overlay }}>{children}</RouterContext.Provider>;
}

export function useRoute() {
    return useContext(RouterContext);
}
