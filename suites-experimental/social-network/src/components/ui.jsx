// The design system's primitives. Every box, text run, link and image of a page goes
// through one of these, the way a large app renders everything through its own
// component library: each reads the theme and logging surface from context, links and
// images register with the interaction and visual-completion trackers, and text inherits
// its typography from the text around it.

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { log } from "../analytics/logger.js";
import { useRoute } from "../router.jsx";
import { BackgroundedContext } from "./measure.js";

const ThemeContext = createContext({ scheme: "light", density: "comfortable" });

export const SurfaceContext = createContext("app");

// Every mounted interactive element, so an event can be attributed to the control and
// surface it landed on, and so impressions of controls can be counted per surface.
const interactables = new Map();
const surfaceCounts = new Map();

export function useInteractable(ref, name, surface) {
    useLayoutEffect(() => {
        const element = ref.current;
        interactables.set(element, { name, surface });
        surfaceCounts.set(surface, (surfaceCounts.get(surface) ?? 0) + 1);
        return () => {
            interactables.delete(element);
            const count = surfaceCounts.get(surface) - 1;
            if (count)
                surfaceCounts.set(surface, count);
            else
                surfaceCounts.delete(surface);
        };
    }, [ref, name, surface]);
}

export function interactableFor(element) {
    for (let node = element; node; node = node.parentElement) {
        const entry = interactables.get(node);
        if (entry)
            return entry;
    }
    return null;
}

// Visual completion: the page counts as visually complete for an interaction once every
// image that mounted for it has loaded.
const pendingImages = new Set();
let visualEpoch = 0;

function markImageLoaded(image) {
    if (pendingImages.delete(image) && pendingImages.size === 0)
        log("visually_complete", { epoch: ++visualEpoch });
}

function useVisualCompletion(ref) {
    useLayoutEffect(() => {
        const image = ref.current;
        if (!image.complete)
            pendingImages.add(image);
        return () => pendingImages.delete(image);
    }, [ref]);
    return useCallback((event) => markImageLoaded(event.currentTarget), []);
}

function useThemedClassName(className) {
    const theme = useContext(ThemeContext);
    return useMemo(() => theme.density === "compact" ? `${className} density-compact` : className, [theme, className]);
}

/**
 * A layout box: `as` picks the element, everything else passes through. A box with a
 * `data-log-scope` opens a logging surface of that name for everything inside it.
 */
export function UIBox({ as: Element = "div", className = "", ref, ...rest }) {
    const themed = useThemedClassName(className);
    const parent = useContext(SurfaceContext);
    const scope = rest["data-log-scope"];
    const surface = useMemo(() => scope ? `${parent}/${scope}` : parent, [parent, scope]);
    const element = <Element ref={ref} className={themed || undefined} {...rest} />;
    return surface === parent ? element : <SurfaceContext.Provider value={surface}>{element}</SurfaceContext.Provider>;
}

const TextContext = createContext(null);

/** A run of text. Nested runs inherit the outer run's typography. */
export function UIText({ as: Element = "span", className = "", children, ...rest }) {
    const outer = useContext(TextContext);
    const themed = useThemedClassName(className);
    const style = useMemo(() => ({ depth: outer ? outer.depth + 1 : 0, className: themed }), [outer, themed]);
    return (
        <TextContext.Provider value={style}>
            <Element className={themed || undefined} {...rest}>
                {children}
            </Element>
        </TextContext.Provider>
    );
}

const ROUTES = [
    [/^#\/profile\/([^/]+)$/, "profile"],
    [/^#\/post\/([^/]+)$/, "post"],
    [/^#\/groups\/([^/]+)/, "group"],
    [/^#\/hashtag\/([^/]+)$/, "hashtag"],
    [/^#\/photo\/([^/]+)$/, "photo"],
    [/^#\/comment\/([^/]+)$/, "comment"],
    [/^#\/messages/, "messages"],
    [/^#\/search\//, "search"],
];

function routeOf(href) {
    if (!href || !href.startsWith("#/"))
        return null;
    for (const [pattern, name] of ROUTES) {
        if (pattern.test(href))
            return name;
    }

    return "page";
}

/**
 * A link. Routes inside the app stay in memory, so an in-app link never touches the
 * location; `onClick` runs first and can navigate. A link to the current page is marked
 * as such, so every link follows the route.
 */
export function UILink({ href, className = "", onClick, children, ref: externalRef, ...rest }) {
    const ownRef = useRef(null);
    const ref = externalRef ?? ownRef;
    const backgrounded = useContext(BackgroundedContext);
    const surface = useContext(SurfaceContext);
    const themed = useThemedClassName(className);
    const route = useMemo(() => routeOf(href), [href]);
    const { page } = useRoute();
    const current = href === `#${page}` ? "page" : undefined;
    useInteractable(ref, rest["data-log"] ?? route ?? "outbound", surface);
    const handleClick = useCallback(
        (event) => {
            if (onClick)
                onClick(event);
            if (route && !event.defaultPrevented)
                event.preventDefault();
        },
        [onClick, route]
    );
    return (
        <a ref={ref} href={href} className={themed || undefined} onClick={handleClick} aria-current={current} {...rest} tabIndex={backgrounded ? -1 : rest.tabIndex}>
            {children}
        </a>
    );
}

/** An image that takes part in visual-completion tracking. */
export function UIImage({ className = "", alt = "", ...rest }) {
    const ref = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const themed = useThemedClassName(className);
    const track = useVisualCompletion(ref);
    const onLoad = useCallback(
        (event) => {
            track(event);
            setLoaded(true);
        },
        [track]
    );
    return <img ref={ref} className={themed || undefined} alt={alt} onLoad={onLoad} data-loaded={loaded || undefined} {...rest} />;
}
