import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getRecord } from "../store/store.js";
import { loadQuery } from "../store/network.js";
import { useLinkedRecord, useRecord } from "../store/hooks.js";
import { VIEWER_ID } from "../data/server.js";
import { guard, guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { beginInteraction } from "../analytics/perf.js";
import { closePost } from "../router.jsx";
import { commentsConnectionId, loadComments, loadMoreComments } from "../queries.js";
import { signal } from "../signals.js";
import Comment from "./comments.jsx";
import CommentComposer from "./comment-composer.jsx";
import Icon from "./icon.jsx";
import Popover from "./popover.jsx";
import Story from "./story.jsx";
import { GlimmerRow, GlimmerStory } from "./glimmer.jsx";

const ORDERS = [
    { id: "relevant", label: "Top", description: "Conversations with the most replies and reactions." },
    { id: "newest", label: "Latest", description: "Every comment, most recent at the top." },
    { id: "all", label: "Everything", description: "Oldest first, including comments our filters held back." },
];

const LOAD_MORE_DISTANCE = 300;

function OrderMenu({ order, onChange }) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const current = ORDERS.find((item) => item.id === order);
    const close = useCallback(() => setOpen(false), []);
    return (
        <div className="relative px-4 py-2">
            <button
                ref={anchorRef}
                type="button"
                id="comment-order"
                className="text-secondary flex items-center gap-1 text-[15px] font-semibold hover:underline"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                data-log="comment_order"
            >
                {current.label}
                <Icon name="chevronDown" size={16} />
            </button>
            {open
                && <Popover label="Comment order" anchorRef={anchorRef} onClose={close} className="left-4 top-10 w-[300px] p-2" role="menu">
                    {ORDERS.map((item) =>
                        <button
                            key={item.id}
                            type="button"
                            role="menuitemradio"
                            aria-checked={item.id === order}
                            data-order={item.id}
                            className={`comment-order-option hover:bg-hover block w-full rounded-md p-2 text-left ${item.id === order ? "bg-hover" : ""}`}
                            onClick={() => {
                                setOpen(false);
                                onChange(item.id);
                            }}
                        >
                            <span className="text-primary block text-[15px] font-semibold">{item.label}</span>
                            <span className="text-secondary block text-[13px] leading-4">{item.description}</span>
                        </button>
                    )}
                </Popover>
            }
        </div>
    );
}

function useParticipants(connection) {
    const edges = connection ? connection.edges : null;
    return useMemo(() => {
        const seen = new Map();
        for (const edge of edges ?? []) {
            const comment = getRecord(edge.node.__ref);
            const author = getRecord(comment.author.__ref);
            if (!seen.has(author.id))
                seen.set(author.id, author);
        }
        return Array.from(seen.values());
    }, [edges]);
}

export default function PostDialog({ storyId }) {
    const story = useRecord(storyId);
    const actor = useLinkedRecord(story ? story.actor : null);
    const viewer = useRecord(VIEWER_ID);
    const [order, setOrder] = useState("relevant");
    const connection = useRecord(commentsConnectionId(storyId, order));
    const people = useParticipants(connection);
    const bodyRef = useRef(null);
    const composerRef = useRef(null);
    const signaled = useRef({ order: null, count: 0 });
    const status = connection ? connection.status : "loading";
    const count = connection ? connection.edges.length : 0;

    useEffect(() => {
        if (!story)
            loadQuery("Story", { storyId });
        loadComments(storyId, "relevant");
    }, [story, storyId]);

    useLayoutEffect(() => {
        const opener = document.activeElement;
        if (composerRef.current)
            composerRef.current.focus({ preventScroll: true });
        return () => {
            if (opener && opener.isConnected)
                opener.focus({ preventScroll: true });
        };
    }, []);

    useEffect(() => {
        if (status !== "ready")
            return;
        const last = signaled.current;
        if (last.order === null)
            signal("post-dialog-ready");
        else if (last.order !== order)
            signal("comments-reordered");
        else if (count > last.count)
            signal("comments-page-loaded");
        signaled.current = { order, count };
    }, [status, count, order]);

    useEffect(() => {
        const body = bodyRef.current;
        const onScroll = () =>
            guard("dialog.scroll", () => {
                if (body.scrollTop + body.clientHeight >= body.scrollHeight - LOAD_MORE_DISTANCE && loadMoreComments(storyId, order))
                    log("comments_paginate", { story: storyId, order });
            });
        body.addEventListener("scroll", onScroll, { passive: true });
        return () => body.removeEventListener("scroll", onScroll);
    }, [storyId, order]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape" && !event.defaultPrevented)
                close();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    });

    const changeOrder = guarded("dialog.order", (next) => {
        if (next === order)
            return;
        beginInteraction("comments-reordered", { order: next });
        loadComments(storyId, next);
        setOrder(next);
        log("comment_order_change", { story: storyId, order: next });
    });

    const close = guarded("dialog.close", () => {
        log("dialog_close", { story: storyId, comments_seen: count });
        closePost();
    });

    const ready = status === "ready";
    const exhausted = ready && connection.page_info && !connection.page_info.has_next_page;

    return (
        <div className="bg-scrim fixed inset-0 z-50 flex items-center justify-center" onMouseDown={(event) => event.target === event.currentTarget && close()}>
            <div
                id="post-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={actor ? `Discussion with ${actor.name}` : "Discussion"}
                className="bg-surface shadow-popover flex h-[calc(100%-32px)] w-[min(700px,calc(100%-32px))] flex-col overflow-hidden rounded-lg"
                data-log-scope="post_dialog"
            >
                <header className="border-divider relative flex h-14 shrink-0 items-center justify-center border-b">
                    <h2 className="text-primary text-xl font-bold">Discussion</h2>
                    <button
                        type="button"
                        id="post-dialog-close"
                        className="bg-surface-alt text-secondary hover:bg-hover absolute right-3 flex h-9 w-9 items-center justify-center rounded-full"
                        aria-label="Close"
                        onClick={close}
                        data-log="dialog_close"
                    >
                        <Icon name="close" size={20} />
                    </button>
                </header>
                <div ref={bodyRef} id="post-dialog-body" className="min-h-0 flex-1 overflow-y-auto">
                    {story ? <Story id={storyId} position={0} expandable={false} inDialog /> : <GlimmerStory />}
                    <OrderMenu order={order} onChange={changeOrder} />
                    <div className="flex flex-col gap-3 pb-4" aria-label="Comments" aria-busy={!ready}>
                        {connection && connection.edges.map((edge) => <Comment key={edge.node.__ref} commentRef={edge.node} storyId={storyId} />)}
                        {!ready && [0, 1, 2].map((i) => <GlimmerRow key={i} avatarSize={32} />)}
                        {exhausted && <div className="comments-end text-secondary px-4 text-center text-[13px]">You&apos;ve seen all {connection.total_count} comments</div>}
                    </div>
                </div>
                <CommentComposer key={storyId} storyId={storyId} viewer={viewer} people={people} inputRef={composerRef} />
            </div>
        </div>
    );
}
