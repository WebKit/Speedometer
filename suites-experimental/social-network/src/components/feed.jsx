import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { guard } from "../analytics/guard.js";
import { checkImpressions } from "../analytics/impressions.js";
import { useRecord } from "../store/hooks.js";
import Story from "./story.jsx";
import { MeasureContext } from "./measure.js";

const ESTIMATED_HEIGHT = 560;
const GAP = 16;

// Measured unit heights outlive the feed, so coming back to a page lays out the
// placeholders at their real size.
const heights = new Map();

function FeedUnit({ id, position, register }) {
    const ref = useRef(null);
    const story = useRecord(id);
    useLayoutEffect(() => {
        register(id, ref.current);
        heights.set(id, ref.current.getBoundingClientRect().height);
        return () => register(id, null);
    }, [id, register]);
    return (
        <div ref={ref} data-unit-live="true" data-story-id={id} data-position={position} data-sponsored={story.sponsored || undefined}>
            <Story id={id} position={position} />
        </div>
    );
}

/**
 * A windowed list of stories inside `scrollerRef`. Units more than a couple of screens
 * away from the viewport collapse to empty placeholders that keep their measured
 * height, so the scroll position never jumps.
 */
export default function Feed({ edges, scrollerRef, onNearEnd, initialScrollTop = 0, label }) {
    const listRef = useRef(null);
    const elements = useRef(new Map());
    const [range, setRange] = useState({ start: 0, end: Math.min(edges.length, 2) });
    const rangeRef = useRef(range);
    const lastScroll = useRef({ top: -1, count: -1 });
    const edgesRef = useRef(edges);
    edgesRef.current = edges;
    const nearEndRef = useRef(onNearEnd);
    nearEndRef.current = onNearEnd;

    const register = useCallback((id, element) => {
        if (element)
            elements.current.set(id, element);
        else
            elements.current.delete(id);
    }, []);

    const remeasure = useCallback((id) => {
        const element = elements.current.get(id);
        if (element)
            heights.set(id, element.getBoundingClientRect().height);
    }, []);

    const computeRange = useCallback(() => {
        const scroller = scrollerRef.current;
        const list = listRef.current;
        const items = edgesRef.current;
        const scrollTop = scroller.scrollTop;
        const viewport = scroller.clientHeight;
        const listTop = list.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scrollTop;
        const top = scrollTop - 2 * viewport - listTop;
        const bottom = scrollTop + 3 * viewport - listTop;
        let offset = 0;
        let start = -1;
        let end = 0;
        for (let i = 0; i < items.length; i++) {
            const height = heights.get(items[i].node.__ref) ?? ESTIMATED_HEIGHT;
            if (start === -1 && offset + height >= top)
                start = i;
            if (offset <= bottom)
                end = i + 1;
            offset += height + GAP;
        }
        start = Math.max(0, start);
        return { start, end: Math.max(start + 1, end) };
    }, [scrollerRef]);

    const update = useCallback(
        (fromScroll) => {
            const next = computeRange();
            const current = rangeRef.current;
            if (next.start !== current.start || next.end !== current.end) {
                rangeRef.current = next;
                // Scroll-driven window changes commit synchronously, as virtualizers do,
                // so the rows exist before the browser paints the new offset.
                if (fromScroll)
                    flushSync(() => setRange(next));
                else
                    setRange(next);
            }
            checkImpressions(scrollerRef.current, listRef.current.querySelectorAll("[data-unit-live]"));
            // Only reading toward the end asks for more; re-laying out after a page
            // arrives never chains into another request.
            if (fromScroll && nearEndRef.current && next.end >= edgesRef.current.length)
                nearEndRef.current();
        },
        [computeRange, scrollerRef]
    );

    useLayoutEffect(() => {
        if (initialScrollTop)
            scrollerRef.current.scrollTop = initialScrollTop;
        // Only on mount: restoring later would fight the reader.
    }, []);

    useLayoutEffect(() => {
        update(false);
    }, [edges.length, update]);

    useEffect(() => {
        const scroller = scrollerRef.current;
        const onScroll = () =>
            guard("feed.scroll", () => {
                const top = scroller.scrollTop;
                const count = edgesRef.current.length;
                if (top === lastScroll.current.top && count === lastScroll.current.count)
                    return;
                lastScroll.current = { top, count };
                update(true);
            });
        scroller.addEventListener("scroll", onScroll, { passive: true });
        return () => scroller.removeEventListener("scroll", onScroll);
    }, [scrollerRef, update]);

    return (
        <MeasureContext.Provider value={remeasure}>
            <div ref={listRef} className="feed flex flex-col gap-4" role="feed" aria-label={label} aria-busy={false}>
                {edges.map((edge, index) => {
                    const id = edge.node.__ref;
                    const live = index >= range.start && index < range.end;
                    return (
                        <div key={id} className="feed-unit" data-unit-index={index} aria-posinset={index + 1} aria-setsize={-1}>
                            {live ? <FeedUnit id={id} position={index} register={register} /> : <div data-virtualized="true" style={{ minHeight: heights.get(id) ?? ESTIMATED_HEIGHT }} />}
                        </div>
                    );
                })}
            </div>
        </MeasureContext.Provider>
    );
}
