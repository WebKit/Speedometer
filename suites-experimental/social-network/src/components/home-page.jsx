import { useEffect, useRef, useState } from "react";
import { queryKey, queryStatusId } from "../store/network.js";
import { checkFragment, fragment, scalars, spread, useFragment } from "../store/fragment.js";
import { photo } from "../data/graphics.js";
import { VIEWER_ID } from "../data/server.js";
import { guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { gate } from "../analytics/experiments.js";
import { HOME_FEED, loadMoreHomeFeed } from "../queries.js";
import { signal } from "../signals.js";
import Avatar from "./avatar.jsx";
import Feed, { FeedEdge } from "./feed.jsx";
import Icon from "./icon.jsx";
import { GlimmerStory } from "./glimmer.jsx";
import { UIBox, UIImage, UILink, UIText } from "./ui.jsx";

const TRAY_VISIBLE = 4;

const HomeViewer = fragment("HomeViewer", scalars("id name short_name avatar_seed"));

function ComposerBox() {
    const viewer = useFragment(HomeViewer, VIEWER_ID);
    return (
        <UIBox className="bg-surface shadow-card rounded-lg px-4 pb-2 pt-3" data-log-scope="composer">
            <UIBox className="flex items-center gap-2">
                {viewer && <Avatar seed={viewer.avatar_seed} size={40} label="" />}
                <button type="button" className="bg-surface-alt text-secondary hover:bg-hover h-10 flex-1 rounded-full px-3 text-left text-[17px]" data-log="composer_open">
                    Share something with your neighbours{viewer ? `, ${viewer.short_name}` : ""}
                </button>
            </UIBox>
            <UIBox className="border-divider mt-3 flex border-t pt-2">
                {[
                    ["photo", "Photo", "text-badge-green"],
                    ["calendar", "Event", "text-badge-blue"],
                    ["poll", "Poll", "text-badge-purple"],
                ].map(([icon, label, color]) =>
                    <button key={label} type="button" className="text-secondary hover:bg-hover flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[15px] font-semibold" data-log={`composer_${label.toLowerCase()}`}>
                        <Icon name={icon} size={22} className={color} />
                        {label}
                    </button>
                )}
            </UIBox>
        </UIBox>
    );
}

const StoryCard_card = fragment("StoryCard_card", {
    ...scalars("id seed seen"),
    owner: scalars("id name avatar_seed"),
});

const StoriesTrayQuery = fragment("StoriesTrayQuery", {
    status: true,
    root: { stories_tray: spread(StoryCard_card) },
});

function StoryCard({ cardRef }) {
    const card = useFragment(StoryCard_card, cardRef);
    const { owner } = card;
    return (
        <UILink className="bg-surface-alt relative block h-[200px] w-[112px] shrink-0 overflow-hidden rounded-lg" href={`#/stories/${card.id}`} data-log="stories_tray_card" onClick={(event) => event.preventDefault()}>
            <UIImage className="h-full w-full object-cover transition-transform hover:scale-105" src={photo(card.seed, 224, 400)} width="112" height="200" alt="" />
            <UIText className="absolute left-2 top-2">
                <Avatar seed={owner.avatar_seed} size={32} ring={!card.seen} label="" />
            </UIText>
            <UIText className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 px-2 pb-2 pt-6 text-[13px] font-semibold leading-4 text-white">{owner.name}</UIText>
        </UILink>
    );
}

function StoriesTray() {
    const status = useFragment(StoriesTrayQuery, queryStatusId(queryKey("StoriesTray")));
    const [offset, setOffset] = useState(0);
    const cards = status && status.root ? status.root.stories_tray : [];
    const viewer = useFragment(HomeViewer, VIEWER_ID);
    const page = guarded("stories.page", (delta) => {
        setOffset((value) => Math.max(0, Math.min(cards.length - TRAY_VISIBLE, value + delta)));
        log("stories_tray_page", { delta });
    });
    return (
        <UIBox className="relative overflow-hidden" aria-label="Stories" role="region" data-log-scope="stories_tray">
            <UIBox className="flex gap-2 transition-transform duration-300" style={{ transform: `translateX(-${offset * 120}px)` }}>
                <button type="button" className="bg-surface shadow-card relative h-[200px] w-[112px] shrink-0 overflow-hidden rounded-lg" data-log="stories_create">
                    {viewer && <UIImage className="h-[150px] w-full object-cover" src={photo(viewer.avatar_seed * 31, 224, 300)} width="112" height="150" alt="" />}
                    <UIText className="border-surface bg-accent absolute left-1/2 top-[134px] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 text-white">
                        <Icon name="plus" size={16} strokeWidth={3} />
                    </UIText>
                    <UIText className="text-primary absolute inset-x-0 bottom-2 text-center text-[13px] font-semibold">Add a moment</UIText>
                </button>
                {cards.map((ref) =>
                    <StoryCard key={ref.__id} cardRef={ref} />
                )}
            </UIBox>
            {offset > 0
                && <button type="button" className="bg-surface shadow-popover absolute left-2 top-[84px] flex h-10 w-10 items-center justify-center rounded-full" aria-label="Previous stories" onClick={() => page(-2)}>
                    <Icon name="chevronLeft" size={20} />
                </button>
            }
            {offset < cards.length - TRAY_VISIBLE
                && <button type="button" className="bg-surface shadow-popover absolute right-2 top-[84px] flex h-10 w-10 items-center justify-center rounded-full" aria-label="Next stories" onClick={() => page(2)}>
                    <Icon name="chevronRight" size={20} />
                </button>
            }
        </UIBox>
    );
}

const onNearEnd = guarded("feed.near_end", () => {
    if (gate("feed_prefetch_next_page"))
        loadMoreHomeFeed();
});

const HomeFeedConnection = fragment("HomeFeedConnection", {
    ...scalars("id status generation page_info"),
    edges: FeedEdge,
});

export default function HomePage({ scrollerRef }) {
    const feed = useFragment(HomeFeedConnection, HOME_FEED);
    const signaled = useRef({ generation: -1, count: 0 });
    const status = feed ? feed.status : "loading";
    const count = feed ? feed.edges.length : 0;

    const shown = useRef(false);

    // The page stays mounted while another one is shown. Coming back reconnects its
    // effects; it checks that everything it reads is still in the store, the way a
    // cached query is checked before it renders, and reports that it is ready.
    useEffect(() => {
        if (shown.current) {
            const availability = checkFragment(HomeFeedConnection, HOME_FEED);
            log("query_availability", { query: "HomeFeed", ...availability });
            signal("home-ready");
        }
        shown.current = true;
    }, []);

    useEffect(() => {
        if (status !== "ready")
            return;
        const last = signaled.current;
        if (last.generation === -1)
            signal("home-ready");
        else if (feed.generation !== last.generation)
            signal("home-feed-refreshed");
        else if (count > last.count)
            signal("feed-page-loaded");

        signaled.current = { generation: feed.generation, count };
    }, [status, count, feed]);

    const hasStories = feed && feed.edges.length > 0;
    return (
        <UIBox className="home mx-auto flex w-full max-w-[500px] flex-col gap-4 px-2 py-4" data-feed-status={status}>
            <ComposerBox />
            <StoriesTray />
            {hasStories
                ? <Feed key={feed.generation} edges={feed.edges} scrollerRef={scrollerRef} onNearEnd={onNearEnd} label="Stories" />
                : <>
                    <GlimmerStory />
                    <GlimmerStory />
                </>
            }
            {feed && feed.status === "loading-more" && <GlimmerStory />}
        </UIBox>
    );
}
