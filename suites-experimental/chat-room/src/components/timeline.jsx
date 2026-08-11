import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionsContext } from "../actions.js";
import { createOutgoingMessage, dateLabelFor } from "../data/rooms.js";
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

// A room opens on its newest page and fetches older ones as the reader goes back,
// the way a real client does, which is what inserts content *above* the viewport.
const INITIAL_PAGE = 300;
const OLDER_PAGE = 120;

export default function Timeline({ room, onSelectRoom }) {
    const scrollerRef = useRef(null);
    const [highlightedId, setHighlightedId] = useState(null);

    // Messages the local user sent, kept here rather than pushed into the fixtures,
    // so a room switch remounts back to the original timeline instead of letting
    // rooms grow across benchmark iterations.
    const [sent, setSent] = useState([]);

    const messages = useMemo(() => sent.length ? [...room.messages, ...sent] : room.messages, [room.messages, sent]);

    // How far back the room has been loaded. Rows before this exist in the fixture
    // but are not in the timeline yet.
    const initialFirst = Math.max(0, room.messages.length - INITIAL_PAGE);
    const [firstLoaded, setFirstLoaded] = useState(initialFirst);

    const heights = useMemo(() => new RowHeights(room.messages.length, initialFirst, ESTIMATED_ROW_HEIGHT), [room.messages, initialFirst]);

    // The model only grows -- at the end when the local user sends, at the front
    // when older history loads -- so calling these during render is idempotent.
    heights.grow(messages.length);
    heights.extendTo(firstLoaded);

    // Only a reply-quote click turns an id back into a row, so the index is built
    // on first use. Building it during render meant rebuilding a map over the
    // room's whole history inside every room switch.
    const indexById = useMemo(() => {
        let byId = null;
        return (id) => {
            if (byId === null)
                byId = new Map(messages.map((message, index) => [message.id, index]));
            return byId.get(id);
        };
    }, [messages]);

    // The mounted range, end exclusive. Starts empty because the mount effect below
    // pins the scroller to the bottom first, and the window follows from there.
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
                start: Math.max(heights.first, first - OVERSCAN),
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

        // Prefetch the next page a viewport before the top, the way a real client
        // does. The anchor has to be taken before the model learns about the new
        // rows. No in-flight guard: the rows land synchronously, a page below the top.
        if (heights.first > 0 && scroller.scrollTop < scroller.clientHeight) {
            anchor.current = captureAnchor(scroller.scrollTop);
            setFirstLoaded(Math.max(0, heights.first - OLDER_PAGE));
            return;
        }

        updateRange(rangeFor(scroller.scrollTop, scroller.clientHeight));
    }, [captureAnchor, heights, rangeFor, updateRange]);

    // Measure what is mounted, then put the content back where it was. Runs after
    // every commit, because a row's height can change without the window moving.
    // The rows that just mounted were laid out against estimates, so without the
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

    // Jump to the quoted message and leave it highlighted. The offset comes from the
    // height model, because the quoted row is usually not mounted. No smooth
    // behavior, no scrollIntoView, and the highlight holds until the next jump
    // rather than clearing on a timer, so a timed step stays deterministic.
    const jumpToMessage = useCallback(
        (messageId) => {
            const index = indexById(messageId);
            if (index === undefined)
                return;
            const scroller = scrollerRef.current;
            setHighlightedId(messageId);
            pinnedToBottom.current = false;
            jumpTarget.current = index;

            // A quote can point further back than the room has been loaded, so the
            // history in between has to come in before there is an offset to
            // scroll to, the way following a permalink loads its context.
            if (index < heights.first) {
                heights.extendTo(Math.max(0, index - OVERSCAN));
                setFirstLoaded(heights.first);
            }

            scroller.scrollTop = centeredOffset(index, scroller.clientHeight);
            updateRange(rangeFor(scroller.scrollTop, scroller.clientHeight));
        },
        [centeredOffset, heights, indexById, rangeFor, updateRange]
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

    // Grouping and the date separator come from the message array rather than from
    // the window: a row that changed height as the window moved would invalidate
    // the very height cache being built here.
    const lastDayIndex = messages[messages.length - 1].dayIndex;
    const rows = [];
    for (let index = range.start; index < range.end; index++) {
        const message = messages[index];
        // messages[index - 1] is always there: the fixture holds the whole room
        // even when only the newest page is in the timeline.
        const previous = index > 0 ? messages[index - 1] : null;
        const startsDay = previous === null || previous.dayIndex !== message.dayIndex;
        rows.push(<Message key={message.id} index={index} message={message} highlighted={message.id === highlightedId} dateLabel={startsDay ? dateLabelFor(message.dayIndex, lastDayIndex) : null} unreadBelow={index === room.readUpToIndex + 1} />);
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
