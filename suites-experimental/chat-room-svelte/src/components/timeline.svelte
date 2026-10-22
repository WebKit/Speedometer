<script>
    // Only the rows near the viewport are mounted; two spacers stand in for the
    // rest. The scroller carries no vertical padding (see styles.css), so
    // scrollTop maps one to one onto the height model's offsets.
    import { untrack } from "svelte";
    import { setActions } from "../actions.js";
    import { createOutgoingMessage, dateLabelFor } from "../data/rooms.js";
    import { RowHeights } from "../row-heights.js";
    import Composer from "./composer.svelte";
    import Message from "./message.svelte";

    // Rows kept mounted either side of the visible range, so a small scroll reuses
    // rows already in the DOM instead of replacing the whole window.
    const OVERSCAN = 4;

    // Deliberately under the measured mean of ~111px: a room opens pinned to its
    // newest message, and an estimate that ran high would shrink the measured
    // total under the pin and drag the window backwards through history.
    const ESTIMATED_ROW_HEIGHT = 100;

    // How close to the bottom still counts as following the conversation.
    const PIN_THRESHOLD = 4;

    // A room opens on its newest page and fetches older ones as the reader goes
    // back, the way a real client does, which is what inserts content *above* the
    // viewport.
    const INITIAL_PAGE = 300;
    const OLDER_PAGE = 120;

    // The parent keys this component by room id, so `room` never changes over its
    // lifetime.
    let { room, onSelectRoom } = $props();

    let scroller;
    let highlightedId = $state(null);

    // Messages the local user sent, kept here rather than pushed into the
    // fixtures, so a room switch remounts back to the original timeline instead
    // of letting rooms grow across benchmark iterations.
    let sent = $state.raw([]);

    const messages = $derived(sent.length ? [...room.messages, ...sent] : room.messages);

    // Rows before heights.first exist in the fixture but are not in the timeline
    // yet. The model only grows -- at the end when the local user sends, at the
    // front when older history loads.
    const heights = $derived(new RowHeights(room.messages.length, Math.max(0, room.messages.length - INITIAL_PAGE), ESTIMATED_ROW_HEIGHT));

    // Bumped whenever the height model changes, because the model is a plain
    // object and nothing else tells Svelte that the spacers moved.
    let heightsVersion = $state(0);

    // Only a reply-quote click turns an id back into a row, so the index is
    // built on first use. Building it eagerly meant rebuilding a map over the
    // room's whole history inside every room switch.
    const indexById = $derived.by(() => {
        const list = messages;
        let byId = null;
        return (id) => {
            if (byId === null)
                byId = new Map(list.map((message, index) => [message.id, index]));
            return byId.get(id);
        };
    });

    // The mounted range, end exclusive. Starts empty because the first settle
    // pass pins the scroller to the bottom, and the window follows from there.
    let range = $state.raw({ start: 0, end: 0 });

    // True while the timeline is following the conversation, the way a chat
    // client keeps you at the newest message until you scroll away yourself.
    let pinnedToBottom = true;

    // Set while a reply-quote jump is settling, because the target's offset is
    // an estimate at the moment the jump is issued.
    let jumpTarget = null;

    // The row under the top of the viewport, and how far into it, captured
    // before measurements moved the offsets out from under it.
    let anchor = null;

    function rangeFor(scrollTop, viewportHeight) {
        const first = heights.indexAt(scrollTop);
        const bottom = scrollTop + viewportHeight;
        let last = first;
        while (last + 1 < heights.count && heights.offsetAt(last + 1) < bottom)
            last++;
        return {
            start: Math.max(heights.first, first - OVERSCAN),
            end: Math.min(heights.count, last + 1 + OVERSCAN),
        };
    }

    function centeredOffset(index, viewportHeight) {
        const centered = heights.offsetAt(index) - (viewportHeight - heights.heightAt(index)) / 2;
        return Math.max(0, Math.min(centered, heights.totalHeight - viewportHeight));
    }

    // Comparing rather than assigning unconditionally skips the update when the
    // window has not moved, which is the common case for a scroll inside the
    // overscan and for the second pass of a correction.
    function updateRange(next) {
        if (range.start !== next.start || range.end !== next.end)
            range = next;
    }

    // Captured against the offsets the DOM was last laid out with. Restoring the
    // pair after the offsets move is what keeps the content still.
    function captureAnchor(scrollTop) {
        const index = heights.indexAt(scrollTop);
        return { index, offset: scrollTop - heights.offsetAt(index) };
    }

    function handleScroll() {
        // A scroll the browser queued before a room switch is still delivered to
        // the detached scroller, after bind:this has cleared it.
        if (scroller === null)
            return;

        pinnedToBottom = scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight) <= PIN_THRESHOLD;

        // Prefetch the next page a viewport before the top, the way a real client
        // does. The anchor has to be taken before the model learns about the new
        // rows. No in-flight guard: the rows land synchronously, a page below the
        // top.
        if (heights.first > 0 && scroller.scrollTop < scroller.clientHeight) {
            anchor = captureAnchor(scroller.scrollTop);
            heights.extendTo(Math.max(0, heights.first - OLDER_PAGE));
            heightsVersion++;
            return;
        }

        updateRange(rangeFor(scroller.scrollTop, scroller.clientHeight));
    }

    // Measure what is mounted, then put the content back where it was. The rows
    // that just mounted were laid out against estimates, so without the
    // correction the content under the viewport would jump.
    function settle() {
        const viewportHeight = scroller.clientHeight;

        const pending = anchor;
        const captured = pending ?? captureAnchor(scroller.scrollTop);

        let changed = false;
        for (const row of scroller.querySelectorAll(".timeline-message")) {
            if (heights.measure(Number(row.dataset.index), row.getBoundingClientRect().height))
                changed = true;
        }

        // The spacers were sized from the heights these measurements just
        // replaced, so the scroller is an update behind the model. Take another
        // pass, or the offset gets clamped against a height about to change.
        if (changed) {
            anchor = captured;
            heightsVersion++;
            return;
        }

        anchor = null;
        if (jumpTarget !== null) {
            scroller.scrollTop = centeredOffset(jumpTarget, viewportHeight);
            jumpTarget = null;
        } else if (pinnedToBottom) {
            scroller.scrollTop = scroller.scrollHeight;
        } else if (pending) {
            scroller.scrollTop = heights.offsetAt(pending.index) + pending.offset;
        }

        updateRange(rangeFor(scroller.scrollTop, viewportHeight));
    }

    // Jump to the quoted message and leave it highlighted. The offset comes from
    // the height model, because the quoted row is usually not mounted. No smooth
    // behavior, no scrollIntoView, and the highlight holds until the next jump
    // rather than clearing on a timer, so a timed step stays deterministic.
    function jumpToMessage(messageId) {
        const index = indexById(messageId);
        if (index === undefined)
            return;
        highlightedId = messageId;
        pinnedToBottom = false;
        jumpTarget = index;

        // A quote can point further back than the room has been loaded, so the
        // history in between has to come in before there is an offset to scroll
        // to, the way following a permalink loads its context.
        if (index < heights.first) {
            heights.extendTo(Math.max(0, index - OVERSCAN));
            heightsVersion++;
        }

        scroller.scrollTop = centeredOffset(index, scroller.clientHeight);
        updateRange(rangeFor(scroller.scrollTop, scroller.clientHeight));
    }

    function handleSend(text) {
        pinnedToBottom = true;
        jumpTarget = null;
        sent = [...sent, createOutgoingMessage(room, sent.length, text)];
        heights.grow(messages.length);
        heightsVersion++;
    }

    setActions({ selectRoom: (roomId) => onSelectRoom(roomId), jumpToMessage });

    // Grouping and the date separator come from the message array rather than
    // from the window: a row that changed height as the window moved would
    // invalidate the very height cache being built here.
    const rows = $derived.by(() => {
        const lastDayIndex = messages[messages.length - 1].dayIndex;
        const result = [];
        for (let index = range.start; index < range.end; index++) {
            const message = messages[index];
            // messages[index - 1] is always there: the fixture holds the whole
            // room even when only the newest page is in the timeline.
            const previous = index > 0 ? messages[index - 1] : null;
            const startsDay = previous === null || previous.dayIndex !== message.dayIndex;
            result.push({ index, message, dateLabel: startsDay ? dateLabelFor(message.dayIndex, lastDayIndex) : null, unreadBelow: index === room.readUpToIndex + 1 });
        }
        return result;
    });

    const spacers = $derived.by(() => {
        // Read only to recompute when the model changes underneath the range.
        heightsVersion;
        return { top: heights.offsetAt(range.start), bottom: heights.totalHeight - heights.offsetAt(range.end) };
    });

    // Runs after every DOM update to the rows or spacers, the way the timeline
    // has to re-measure whenever what is mounted may have changed height. A pass
    // that changes the model or the range schedules the next one, until the
    // measurements settle.
    $effect(() => {
        rows;
        spacers;
        highlightedId;
        untrack(settle);
    });
</script>

<ol id="timeline" class="timeline" bind:this={scroller} onscroll={handleScroll}>
    <li class="timeline-spacer" style:height="{spacers.top}px" aria-hidden="true"></li>
    {#each rows as row (row.message.id)}
        <Message index={row.index} message={row.message} highlighted={row.message.id === highlightedId} dateLabel={row.dateLabel} unreadBelow={row.unreadBelow} />
    {/each}
    <li class="timeline-spacer" style:height="{spacers.bottom}px" aria-hidden="true"></li>
</ol>
<Composer roomName={room.name} onSend={handleSend} />
