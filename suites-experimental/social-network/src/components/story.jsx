import { memo, useContext, useLayoutEffect, useState } from "react";
import { useLinkedRecord, useRecord } from "../store/hooks.js";
import { publish, updateRecord } from "../store/store.js";
import { photo } from "../data/graphics.js";
import { absoluteTime, compactNumber, countLabel, relativeTime } from "../format.js";
import { guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { beginInteraction } from "../analytics/perf.js";
import { gate } from "../analytics/experiments.js";
import { navigate, openPost } from "../router.jsx";
import Avatar from "./avatar.jsx";
import Icon from "./icon.jsx";
import Pressable from "./pressable.jsx";
import RichText, { truncate } from "./rich-text.jsx";
import { GlimmerLine } from "./glimmer.jsx";
import { MeasureContext } from "./measure.js";

const TRUNCATE_AT = 260;
const REACTION_GLYPHS = { like: "👍", love: "❤️", thanks: "🙏", laugh: "😂", celebrate: "🎉", wow: "🤩" };
const PRIVACY_ICONS = { public: "globe", private: "lock", friends: "friends" };
const REACTION_COLORS = { like: "bg-reaction-like", love: "bg-reaction-love", thanks: "bg-reaction-care", laugh: "bg-reaction-warm", celebrate: "bg-reaction-care", wow: "bg-reaction-warm" };

export const BUSY_THREAD = 60;

const openActor = guarded("story.actor", (event, actorId) => {
    event.preventDefault();
    if (actorId.startsWith("u"))
        navigate(`/profile/${actorId}`);
});

function ActorLine({ story, actor }) {
    const group = useLinkedRecord(story.to_group);
    return (
        <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="truncate text-[15px] leading-5">
                <a className="text-primary font-semibold hover:underline" href={`#/profile/${actor.id}`} onClick={(event) => openActor(event, actor.id)} data-log="story_actor">
                    {actor.name}
                </a>
                {actor.is_verified && <Icon name="verified" size={14} className="text-accent ml-1" label="Verified account" />}
                {group
                    && <>
                        <Icon name="chevronRight" size={14} className="text-secondary mx-0.5" />
                        <a className="text-primary font-semibold hover:underline" href={`#/groups/${group.id}`} data-log="story_group">
                            {group.name}
                        </a>
                    </>
                }
            </h3>
            <div className="text-secondary flex items-center gap-1 text-[13px] leading-4">
                {story.sponsored
                    ? <span>Promoted</span>
                    : <a className="hover:underline" href={story.url} title={absoluteTime(story.created_time)} data-log="story_timestamp">
                        {relativeTime(story.created_time)}
                    </a>
                }
                <span aria-hidden="true">·</span>
                <Icon name={PRIVACY_ICONS[story.privacy]} size={12} label={`Shared with ${story.privacy}`} />
            </div>
        </div>
    );
}

function StoryHeader({ story }) {
    const actor = useLinkedRecord(story.actor);
    return (
        <header className="flex items-start gap-2 px-4 pt-3">
            <a href={`#/profile/${actor.id}`} onClick={(event) => openActor(event, actor.id)} aria-label={actor.name} tabIndex={-1}>
                <Avatar seed={actor.avatar_seed} size={40} square={actor.__typename === "Page"} label={actor.name} />
            </a>
            <ActorLine story={story} actor={actor} />
            <div className="flex items-center">
                <Pressable className="text-secondary hover:bg-hover rounded-full p-2" aria-label={`Actions for this post by ${actor.name}`} aria-haspopup="menu" data-log="story_menu">
                    <Icon name="dots" size={20} strokeWidth={3} />
                </Pressable>
            </div>
        </header>
    );
}

function StoryMessage({ message, expanded, onExpand }) {
    const short = expanded ? null : truncate(message.text, message.ranges, TRUNCATE_AT);
    const shown = short ?? message;
    const large = !expanded && message.text.length < 90;
    return (
        <div className={`px-4 pb-3 pt-2 ${large ? "text-2xl leading-8" : "text-[15px] leading-5"} text-primary`}>
            <RichText text={shown.text} ranges={shown.ranges} />
            {short
                && <>
                    <span>… </span>
                    <Pressable className="read-more text-link font-semibold hover:underline" onPress={onExpand} data-log="story_read_more">
                        Read more
                    </Pressable>
                </>
            }
        </div>
    );
}

function PhotoTile({ photoRef, count, index, extra, span }) {
    const record = useLinkedRecord(photoRef);
    const height = count === 1 ? Math.round((600 * record.height) / record.width) : 600;
    return (
        <a href={`#/photo/${record.id}`} className={`relative block overflow-hidden ${span}`} data-log="story_photo" onClick={(event) => event.preventDefault()}>
            <img className="h-full w-full object-cover" src={photo(record.seed, 600, height)} alt={record.alt} width="600" height={height} decoding="async" />
            {extra > 0 && index === count - 1 && <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-3xl font-bold text-white">+{extra}</span>}
        </a>
    );
}

function PhotoGrid({ attachments }) {
    const photos = attachments.slice(0, 5);
    const extra = attachments.length - photos.length;
    const count = photos.length;
    const layouts = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-2 grid-rows-2",
        4: "grid-cols-2 grid-rows-2",
        5: "grid-cols-6 grid-rows-2",
    };
    const spans = (index) => {
        if (count === 3 && index === 0)
            return "row-span-2";
        if (count === 5)
            return index < 2 ? "col-span-3" : "col-span-2";
        return "";
    };
    return (
        <div className={`grid gap-0.5 ${layouts[count]} ${count === 1 ? "" : "aspect-square"} bg-surface-alt overflow-hidden`}>
            {photos.map((ref, index) =>
                <PhotoTile key={ref.__ref} photoRef={ref} count={count} index={index} extra={extra} span={spans(index)} />
            )}
        </div>
    );
}

function LinkCard({ linkRef }) {
    const link = useLinkedRecord(linkRef);
    return (
        <a className="border-divider bg-surface-alt block border-y hover:brightness-95" href={link.url} target="_blank" rel="noreferrer" data-log="story_link_card">
            <img className="aspect-[1.91/1] w-full object-cover" src={photo(link.image_seed, 600, 314)} width="600" height="314" alt="" />
            <div className="px-3 py-2">
                <div className="text-secondary truncate text-xs uppercase">{link.domain}</div>
                <div className="text-primary line-clamp-2 text-[16px] font-semibold leading-5">{link.title}</div>
                <div className="text-secondary line-clamp-1 text-sm">{link.description}</div>
            </div>
        </a>
    );
}

export function ReactionStack({ reactions, size = 18 }) {
    return (
        <span className="flex -space-x-1">
            {reactions.map((reaction) =>
                <span
                    key={reaction.key}
                    className={`border-surface flex items-center justify-center rounded-full border-2 ${REACTION_COLORS[reaction.key]}`}
                    style={{ width: size, height: size, fontSize: size * 0.55 }}
                    aria-label={`${reaction.key}: ${reaction.count}`}
                >
                    {REACTION_GLYPHS[reaction.key]}
                </span>
            )}
        </span>
    );
}

const toggleLike = guarded("story.like", (feedbackId) => {
    updateRecord(feedbackId, (feedback) => {
        const liked = feedback.viewer_reaction === "like";
        return { viewer_reaction: liked ? null : "like", reaction_count: feedback.reaction_count + (liked ? -1 : 1) };
    });
    publish();
    log("reaction", { feedback: feedbackId, reaction: "like" });
});

const openComments = guarded("story.comments", (storyId, source) => {
    beginInteraction("post-dialog-ready", { story: storyId, source });
    openPost(storyId);
});

const focusComposer = guarded("story.comment_inline", () => {
    const composer = document.getElementById("comment-composer");
    if (composer)
        composer.focus();
});

function Engagement({ storyId, feedbackRef, inDialog }) {
    const feedback = useLinkedRecord(feedbackRef);
    if (feedback.reaction_count === undefined) {
        return (
            <div className="flex items-center justify-between px-4 py-3" aria-busy="true">
                <GlimmerLine width="30%" />
                <GlimmerLine width="20%" />
            </div>
        );
    }
    const summaryV2 = gate("story_reaction_summary_v2");
    const busy = feedback.comment_count >= BUSY_THREAD;
    return (
        <>
            <div className="text-secondary flex items-center justify-between gap-2 px-4 py-2.5 text-[15px]">
                {feedback.reaction_count > 0
                    ? <Pressable className="flex items-center gap-1.5 hover:underline" data-log="story_reactors">
                        <ReactionStack reactions={feedback.top_reactions} />
                        <span>{summaryV2 ? compactNumber(feedback.reaction_count) : countLabel(feedback.reaction_count, "reaction", "reactions")}</span>
                    </Pressable>
                    : <span />
                }
                <div className="flex gap-3">
                    {feedback.comment_count > 0
                        && <Pressable className="story-comments-count hover:underline" onPress={inDialog ? focusComposer : () => openComments(storyId, "count")} data-log="story_comment_count">
                            {countLabel(feedback.comment_count, "comment", "comments")}
                        </Pressable>
                    }
                    {feedback.share_count > 0 && <span>{countLabel(feedback.share_count, "share", "shares")}</span>}
                </div>
            </div>
            <div className="border-divider mx-3 flex border-t py-1">
                <Pressable
                    className={`hover:bg-hover flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-semibold ${feedback.viewer_reaction ? "text-accent" : "text-secondary"}`}
                    onPress={() => toggleLike(feedback.id)}
                    aria-pressed={feedback.viewer_reaction === "like"}
                    data-log="story_like"
                >
                    <Icon name="like" size={18} />
                    Like
                </Pressable>
                <Pressable
                    className="story-comments-button text-secondary hover:bg-hover flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-semibold"
                    onPress={inDialog ? focusComposer : () => openComments(storyId, "button")}
                    aria-label={`Comment on this post, ${countLabel(feedback.comment_count, "comment", "comments")}`}
                    data-thread={busy ? "busy" : "quiet"}
                    data-log="story_comment"
                >
                    <Icon name="comment" size={18} />
                    Comment
                </Pressable>
                <Pressable className="text-secondary hover:bg-hover flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-semibold" data-log="story_share">
                    <Icon name="share" size={18} />
                    Share
                </Pressable>
                <Pressable className="text-secondary hover:bg-hover ml-auto flex items-center rounded-lg px-2 py-1.5" aria-label="Bookmark" data-log="story_bookmark">
                    <Icon name="saved" size={18} />
                </Pressable>
            </div>
            {!inDialog && feedback.top_comment && <TopComment commentRef={feedback.top_comment} storyId={storyId} more={feedback.comment_count > 1} />}
        </>
    );
}

function TopComment({ commentRef, storyId, more }) {
    const comment = useLinkedRecord(commentRef);
    const author = useLinkedRecord(comment.author);
    return (
        <div className="border-divider border-t px-4 pb-3 pt-2">
            {more
                && <Pressable className="text-secondary mb-2 text-[15px] font-semibold hover:underline" onPress={() => openComments(storyId, "preview")} data-log="story_view_more_comments">
                    Join the discussion
                </Pressable>
            }
            <div className="flex gap-2">
                <Avatar seed={author.avatar_seed} size={32} label={author.name} />
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="text-primary text-[14px] font-semibold">{author.name}</span>
                        <span className="text-secondary text-xs" title={absoluteTime(comment.created_time)}>
                            {relativeTime(comment.created_time)}
                        </span>
                    </div>
                    <RichText className="text-primary line-clamp-3 text-[15px] leading-5" text={comment.body.text} ranges={comment.body.ranges} />
                    <div className="text-secondary mt-0.5 flex gap-3 text-xs font-semibold">
                        <Pressable className="hover:text-primary">Like</Pressable>
                        <Pressable className="hover:text-primary">Reply</Pressable>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Story({ id, position, expandable = true, inDialog = false }) {
    const story = useRecord(id);
    const [expanded, setExpanded] = useState(!expandable);
    const remeasure = useContext(MeasureContext);

    useLayoutEffect(() => {
        if (expanded && expandable)
            remeasure(id);
    }, [expanded, expandable, id, remeasure]);

    const expand = guarded("story.see_more", () => {
        setExpanded(true);
        log("story_expand", { story: id, position, length: story.message.text.length });
    });

    return (
        <article className="story bg-surface shadow-card overflow-hidden rounded-lg" aria-label={`Post ${position + 1}`} data-log-scope="story">
            <StoryHeader story={story} />
            <StoryMessage message={story.message} expanded={expanded} onExpand={expand} />
            {story.attachments.length > 0 && <PhotoGrid attachments={story.attachments} />}
            {story.link && <LinkCard linkRef={story.link} />}
            {story.sponsored
                && <div className="bg-surface-alt flex items-center justify-between px-4 py-2">
                    <span className="text-secondary text-sm">Offer ends soon</span>
                    <Pressable className="bg-hover text-primary rounded-md px-3 py-1.5 text-sm font-semibold" data-log="ad_cta">
                        Learn more
                    </Pressable>
                </div>
            }
            <Engagement storyId={id} feedbackRef={story.feedback} inDialog={inDialog} />
        </article>
    );
}

export default memo(Story);
