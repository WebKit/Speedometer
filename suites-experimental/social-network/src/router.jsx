import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { log, setLoggerRoute } from "./analytics/logger.js";

// Hash routes keep the workload's own document URL intact. Page navigations render in a
// transition, like a client-side router does; the post dialog opens as an overlay on
// top of whatever page is underneath.

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
    window.history.pushState(null, "", `#${path}`);
    setLoggerRoute(routeName(path));
    log("page_view", { route: routeName(path), from: routeName(currentPage) });
    currentPage = path;
    startTransition(() => controls.setPage(path));
}

export function openPost(storyId) {
    window.history.pushState(null, "", `#/post/${storyId}`);
    log("page_view", { route: "post", from: routeName(currentPage), overlay: true });
    controls.setOverlay(storyId);
}

export function closePost() {
    window.history.replaceState(null, "", `#${currentPage}`);
    log("overlay_dismiss", { route: "post" });
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
        const onPopState = () => {
            const next = parse(window.location.hash);
            currentPage = next.page;
            startTransition(() => setPage(next.page));
            setOverlay(next.overlay);
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    return <RouterContext.Provider value={{ page, overlay }}>{children}</RouterContext.Provider>;
}

export function useRoute() {
    return useContext(RouterContext);
}
