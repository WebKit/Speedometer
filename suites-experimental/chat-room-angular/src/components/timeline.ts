import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, forwardRef, inject, input, output, signal, untracked } from "@angular/core";
import { ChatActions } from "../actions";
import { createOutgoingMessage, dateLabelFor } from "../data";
import { RowHeights } from "../row-heights.js";
import type { ChatMessage, Room } from "../types";
import { Message } from "./message";

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

interface Range {
    start: number;
    end: number;
}

interface Anchor {
    index: number;
    offset: number;
}

// The parent tracks this component by room id, so `room` never changes over its
// lifetime.
@Component({
    selector: "ol[chat-timeline]",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Message],
    providers: [{ provide: ChatActions, useExisting: forwardRef(() => Timeline) }],
    host: { id: "timeline", class: "timeline", "(scroll)": "handleScroll()" },
    template: `
        <li class="timeline-spacer" [style.height.px]="spacers().top" aria-hidden="true"></li>
        @for (row of rows(); track row.message.id) {
            <li chat-message [index]="row.index" [message]="row.message" [highlighted]="row.message.id === highlightedId()" [dateLabel]="row.dateLabel" [unreadBelow]="row.unreadBelow"></li>
        }
        <li class="timeline-spacer" [style.height.px]="spacers().bottom" aria-hidden="true"></li>
    `,
})
export class Timeline implements ChatActions {
    readonly room = input.required<Room>();
    readonly roomSelected = output<string>();

    private readonly scroller: HTMLElement = inject(ElementRef).nativeElement;
    protected readonly highlightedId = signal<string | null>(null);

    // Messages the local user sent, kept here rather than pushed into the
    // fixtures, so a room switch remounts back to the original timeline instead of
    // letting rooms grow across benchmark iterations.
    private readonly sent = signal<ChatMessage[]>([]);

    private readonly messages = computed(() => {
        const sent = this.sent();
        return sent.length ? [...this.room().messages, ...sent] : this.room().messages;
    });

    // Rows before heights.first exist in the fixture but are not in the timeline
    // yet. The model only grows -- at the end when the local user sends, at the
    // front when older history loads.
    private readonly heights = computed(() => {
        const count = this.room().messages.length;
        return new RowHeights(count, Math.max(0, count - INITIAL_PAGE), ESTIMATED_ROW_HEIGHT);
    });

    // Bumped whenever the height model changes, because the model is a plain
    // object and nothing else tells Angular that the spacers moved.
    private readonly heightsVersion = signal(0);

    // Only a reply-quote click turns an id back into a row, so the index is built
    // on first use. Building it eagerly meant rebuilding a map over the room's
    // whole history inside every room switch.
    private readonly indexById = computed(() => {
        const messages = this.messages();
        let byId: Map<string, number> | null = null;
        return (id: string) => {
            if (byId === null)
                byId = new Map(messages.map((message, index) => [message.id, index]));
            return byId.get(id);
        };
    });

    // The mounted range, end exclusive. Starts empty because the first settle pass
    // pins the scroller to the bottom, and the window follows from there. The
    // equality check skips the update when the window has not moved, which is the
    // common case for a scroll inside the overscan and for the second pass of a
    // correction.
    private readonly range = signal<Range>({ start: 0, end: 0 }, { equal: (a, b) => a.start === b.start && a.end === b.end });

    // True while the timeline is following the conversation, the way a chat
    // client keeps you at the newest message until you scroll away yourself.
    private pinnedToBottom = true;

    // Set while a reply-quote jump is settling, because the target's offset is an
    // estimate at the moment the jump is issued.
    private jumpTarget: number | null = null;

    // The row under the top of the viewport, and how far into it, captured before
    // measurements moved the offsets out from under it.
    private anchor: Anchor | null = null;

    // Grouping and the date separator come from the message array rather than from
    // the window: a row that changed height as the window moved would invalidate
    // the very height cache being built here.
    protected readonly rows = computed(() => {
        const messages = this.messages();
        const { start, end } = this.range();
        const readUpToIndex = this.room().readUpToIndex;
        const lastDayIndex = messages[messages.length - 1].dayIndex;
        const rows = [];
        for (let index = start; index < end; index++) {
            const message = messages[index];
            // messages[index - 1] is always there: the fixture holds the whole
            // room even when only the newest page is in the timeline.
            const previous = index > 0 ? messages[index - 1] : null;
            const startsDay = previous === null || previous.dayIndex !== message.dayIndex;
            rows.push({ index, message, dateLabel: startsDay ? dateLabelFor(message.dayIndex, lastDayIndex) : null, unreadBelow: index === readUpToIndex + 1 });
        }
        return rows;
    });

    protected readonly spacers = computed(() => {
        // Read only to recompute when the model changes underneath the range.
        this.heightsVersion();
        const heights = this.heights();
        const { start, end } = this.range();
        return { top: heights.offsetAt(start), bottom: heights.totalHeight - heights.offsetAt(end) };
    });

    constructor() {
        // Runs after every render that changed the rows or the spacers, the way
        // the timeline has to re-measure whenever what is mounted may have changed
        // height. A pass that changes the model or the range marks the timeline
        // dirty again, and Angular renders and reruns this within the same tick,
        // until the measurements settle.
        afterRenderEffect(() => {
            this.rows();
            this.spacers();
            this.highlightedId();
            untracked(() => this.settle());
        });
    }

    selectRoom(roomId: string) {
        this.roomSelected.emit(roomId);
    }

    // Jump to the quoted message and leave it highlighted. The offset comes from
    // the height model, because the quoted row is usually not mounted. No smooth
    // behavior, no scrollIntoView, and the highlight holds until the next jump
    // rather than clearing on a timer, so a timed step stays deterministic.
    jumpToMessage(messageId: string) {
        const index = this.indexById()(messageId);
        if (index === undefined)
            return;
        const heights = this.heights();
        this.highlightedId.set(messageId);
        this.pinnedToBottom = false;
        this.jumpTarget = index;

        // A quote can point further back than the room has been loaded, so the
        // history in between has to come in before there is an offset to scroll
        // to, the way following a permalink loads its context.
        if (index < heights.first) {
            heights.extendTo(Math.max(0, index - OVERSCAN));
            this.heightsVersion.update((version) => version + 1);
        }

        this.scroller.scrollTop = this.centeredOffset(index, this.scroller.clientHeight);
        this.range.set(this.rangeFor(this.scroller.scrollTop, this.scroller.clientHeight));
    }

    send(text: string) {
        this.pinnedToBottom = true;
        this.jumpTarget = null;
        this.sent.update((sent) => [...sent, createOutgoingMessage(this.room(), sent.length, text)]);
        this.heights().grow(this.messages().length);
        this.heightsVersion.update((version) => version + 1);
    }

    protected handleScroll() {
        const scroller = this.scroller;
        const heights = this.heights();
        this.pinnedToBottom = scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight) <= PIN_THRESHOLD;

        // Prefetch the next page a viewport before the top, the way a real client
        // does. The anchor has to be taken before the model learns about the new
        // rows. No in-flight guard: the rows land synchronously, a page below the
        // top.
        if (heights.first > 0 && scroller.scrollTop < scroller.clientHeight) {
            this.anchor = this.captureAnchor(scroller.scrollTop);
            heights.extendTo(Math.max(0, heights.first - OLDER_PAGE));
            this.heightsVersion.update((version) => version + 1);
            return;
        }

        this.range.set(this.rangeFor(scroller.scrollTop, scroller.clientHeight));
    }

    // Measure what is mounted, then put the content back where it was. The rows
    // that just mounted were laid out against estimates, so without the
    // correction the content under the viewport would jump.
    private settle() {
        const scroller = this.scroller;
        const heights = this.heights();
        const viewportHeight = scroller.clientHeight;

        const pending = this.anchor;
        const captured = pending ?? this.captureAnchor(scroller.scrollTop);

        let changed = false;
        for (const row of scroller.querySelectorAll<HTMLElement>(".timeline-message")) {
            if (heights.measure(Number(row.dataset["index"]), row.getBoundingClientRect().height))
                changed = true;
        }

        // The spacers were sized from the heights these measurements just
        // replaced, so the scroller is a render behind the model. Take another
        // pass, or the offset gets clamped against a height about to change.
        if (changed) {
            this.anchor = captured;
            this.heightsVersion.update((version) => version + 1);
            return;
        }

        this.anchor = null;
        if (this.jumpTarget !== null) {
            scroller.scrollTop = this.centeredOffset(this.jumpTarget, viewportHeight);
            this.jumpTarget = null;
        } else if (this.pinnedToBottom) {
            scroller.scrollTop = scroller.scrollHeight;
        } else if (pending) {
            scroller.scrollTop = heights.offsetAt(pending.index) + pending.offset;
        }

        this.range.set(this.rangeFor(scroller.scrollTop, viewportHeight));
    }

    private rangeFor(scrollTop: number, viewportHeight: number): Range {
        const heights = this.heights();
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

    private centeredOffset(index: number, viewportHeight: number) {
        const heights = this.heights();
        const centered = heights.offsetAt(index) - (viewportHeight - heights.heightAt(index)) / 2;
        return Math.max(0, Math.min(centered, heights.totalHeight - viewportHeight));
    }

    // Captured against the offsets the DOM was last laid out with. Restoring the
    // pair after the offsets move is what keeps the content still.
    private captureAnchor(scrollTop: number): Anchor {
        const heights = this.heights();
        const index = heights.indexAt(scrollTop);
        return { index, offset: scrollTop - heights.offsetAt(index) };
    }
}
