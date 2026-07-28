import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionsContext } from "../actions.js";
import { createOutgoingMessage } from "../data/rooms.js";
import { RowHeights } from "../row-heights.js";
import Composer from "./composer.jsx";
import Message from "./message.jsx";

// Only the rows near the viewport are mounted; two spacers stand in for the rest.
// The scroller carries no vertical padding (see styles.css), so scrollTop maps one
// to one onto the height model's offsets.

// Rows kept mounted either side of the visible range, so a small scroll reuses
// rows already in the DOM instead of replacing the whole window.
const OVERSCAN = 4;

// Deliberately under the measured mean of ~111px: a room opens pinned to its
// newest message, and an estimate that ran high would shrink the measured total
// under the pin and drag the window backwards through history.
const ESTIMATED_ROW_HEIGHT = 100;

// How close to the bottom still counts as following the conversation.
const PIN_THRESHOLD = 4;

export default function Timeline({ room, onSelectRoom }) {
    const scrollerRef = useRef(null);
    const [highlightedId, setHighlightedId] = useState(null);

    // Messages the local user sent, kept here rather than pushed into the fixtures,
    // so a room switch remounts back to the original timeline instead of letting
    // rooms grow across benchmark iterations.
    const [sent, setSent] = useState([]);

    const messages = useMemo(() => sent.length ? [...room.messages, ...sent] : room.messages, [room.messages, sent]);

    const heights = useMemo(() => new RowHeights(room.messages.length, ESTIMATED_ROW_HEIGHT), [room.messages]);

    // Only ever grows, and only at the end, so calling it here is idempotent: a
    // re-render with the same messages changes nothing.
    heights.grow(messages.length);

    const indexById = useMemo(() => new Map(messages.map((message, index) => [message.id, index])), [messages]);

    // The mounted range, end exclusive. Starts empty because the total height is
    // still all estimates at that point: the mount effect below pins the scroller
    // to the bottom first, and the window follows from that offset.
    const [range, setRange] = useState({ start: 0, end: 0 });

    // True while the timeline is following the conversation, the way a chat client
    // keeps you at the newest message until you scroll away yourself.
    const pinnedToBottom = useRef(true);

    // Set while a reply-quote jump is settling, because the target's offset is an
    // estimate at the moment the jump is issued.
    const jumpTarget = useRef(null);

    // The row under the top of the viewport, and how far into it, captured before
    // measurements moved the offsets out from under it.
    const anchor = useRef(null);

    // Bumped when a measurement changes a cached height, purely to get another
    // render: the spacers are computed from the model during render, so nothing
    // else tells React that it moved.
    const [, recordMeasurements] = useState(0);

    const rangeFor = useCallback(
        (scrollTop, viewportHeight) => {
            const first = heights.indexAt(scrollTop);
            const bottom = scrollTop + viewportHeight;
            let last = first;
            while (last + 1 < heights.count && heights.offsetAt(last + 1) < bottom)
                last++;
            return {
                start: Math.max(0, first - OVERSCAN),
                end: Math.min(heights.count, last + 1 + OVERSCAN),
            };
        },
        [heights]
    );

    const centeredOffset = useCallback(
        (index, viewportHeight) => {
            const centered = heights.offsetAt(index) - (viewportHeight - heights.heightAt(index)) / 2;
            return Math.max(0, Math.min(centered, heights.totalHeight - viewportHeight));
        },
        [heights]
    );

    // Comparing rather than assigning unconditionally lets React bail out when the
    // window has not moved, which is the common case for a scroll inside the
    // overscan and for the second pass of a correction.
    const updateRange = useCallback((next) => {
        setRange((previous) => previous.start === next.start && previous.end === next.end ? previous : next);
    }, []);

    // Captured against the offsets the DOM was last laid out with. Restoring the
    // pair after the offsets move is what keeps the content still.
    const captureAnchor = useCallback(
        (scrollTop) => {
            const index = heights.indexAt(scrollTop);
            return { index, offset: scrollTop - heights.offsetAt(index) };
        },
        [heights]
    );

    const handleScroll = useCallback(() => {
        const scroller = scrollerRef.current;
        pinnedToBottom.current = scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight) <= PIN_THRESHOLD;
        updateRange(rangeFor(scroller.scrollTop, scroller.clientHeight));
    }, [rangeFor, updateRange]);

    // Measure what is mounted, then put the content back where it was. Runs after
    // every commit, because a row's height can change without the window moving:
    // that is what will make a narrower timeline re-measure in the thread-panel
    // phase.
    //
    // Correcting the scroll position is the part that makes windowing honest. The
    // rows that just mounted were laid out against estimates, so the offsets read
    // before this pass are stale the moment a measurement lands, and without the
    // correction the content under the viewport would jump.
    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        const viewportHeight = scroller.clientHeight;

        const pending = anchor.current;
        const captured = pending ?? captureAnchor(scroller.scrollTop);

        let changed = false;
        for (const row of scroller.querySelectorAll(".timeline-message")) {
            if (heights.measure(Number(row.dataset.index), row.getBoundingClientRect().height))
                changed = true;
        }

        // The spacers were sized during render, from the heights these measurements
        // just replaced, so the scroller is a commit behind the model. Take another
        // render, or the offset gets clamped against a height about to change.
        if (changed) {
            anchor.current = captured;
            recordMeasurements((passes) => passes + 1);
            return;
        }

        anchor.current = null;
        if (jumpTarget.current !== null) {
            scroller.scrollTop = centeredOffset(jumpTarget.current, viewportHeight);
            jumpTarget.current = null;
        } else if (pinnedToBottom.current) {
            scroller.scrollTop = scroller.scrollHeight;
        } else if (pending) {
            scroller.scrollTop = heights.offsetAt(pending.index) + pending.offset;
        }

        updateRange(rangeFor(scroller.scrollTop, viewportHeight));
    });

    // Clicking a reply quote jumps to the message it quotes and leaves it
    // highlighted. The offset comes from the height model rather than the DOM,
    // because the quoted message is usually not mounted: scrolling to an
    // arbitrary row is the case a virtualizer has to answer without measuring.
    // No smooth behavior and no scrollIntoView, so a timed step stays
    // deterministic. The highlight holds until the next jump rather than
    // clearing on a timer, for the same reason, and only changes background
    // colour, so committing it asynchronously cannot move the offset computed
    // here.
    const jumpToMessage = useCallback(
        (messageId) => {
            const index = indexById.get(messageId);
            if (index === undefined)
                return;
            const scroller = scrollerRef.current;
            setHighlightedId(messageId);
            pinnedToBottom.current = false;
            jumpTarget.current = index;
            scroller.scrollTop = centeredOffset(index, scroller.clientHeight);
            updateRange(rangeFor(scroller.scrollTop, scroller.clientHeight));
        },
        [centeredOffset, indexById, rangeFor, updateRange]
    );

    const actions = useMemo(() => ({ selectRoom: onSelectRoom, jumpToMessage }), [onSelectRoom, jumpToMessage]);

    const handleSend = useCallback(
        (text) => {
            pinnedToBottom.current = true;
            jumpTarget.current = null;
            setSent((previous) => [...previous, createOutgoingMessage(room, previous.length, text)]);
        },
        [room]
    );

    // Grouping is taken from the fixture rather than from the window, so a row
    // renders the same whether or not the message above it happens to be mounted.
    // Deriving it from the window would change a row's height as the window
    // moved, which would invalidate the very cache being built here.
    const rows = [];
    for (let index = range.start; index < range.end; index++) {
        const message = messages[index];
        rows.push(<Message key={message.id} index={index} message={message} highlighted={message.id === highlightedId} />);
    }

    return (
        <ActionsContext.Provider value={actions}>
            <ol id="timeline" className="timeline" ref={scrollerRef} onScroll={handleScroll}>
                <li className="timeline-spacer" style={{ height: heights.offsetAt(range.start) }} aria-hidden="true" />
                {rows}
                <li className="timeline-spacer" style={{ height: heights.totalHeight - heights.offsetAt(range.end) }} aria-hidden="true" />
            </ol>
            <Composer roomName={room.name} onSend={handleSend} />
        </ActionsContext.Provider>
    );
}
