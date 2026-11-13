import { memo, useContext, useLayoutEffect, useState } from "react";
import { fragment, scalars, spread, useFragment } from "../store/fragment.js";
import { publish, updateRecord } from "../store/store.js";
import { photo } from "../data/graphics.js";
import { VIEWER_ID } from "../data/server.js";
import { absoluteTime, relativeTime } from "../format.js";
import { t } from "../i18n.js";
import { guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { beginInteraction } from "../analytics/perf.js";
import { gate } from "../analytics/experiments.js";
import { navigate, openPost } from "../router.jsx";
import { draftId } from "../queries.js";
import Avatar from "./avatar.jsx";
import { CommentBody, CommentBody_comment } from "./comments.jsx";
import HovercardTrigger from "./hovercard.jsx";
import Icon from "./icon.jsx";
import Pressable from "./pressable.jsx";
import { ReactionStack } from "./reactions.jsx";
import RichText, { truncate } from "./rich-text.jsx";
import { GlimmerLine } from "./glimmer.jsx";
import { MeasureContext } from "./measure.js";

const TRUNCATE_AT = 260;
const PRIVACY_ICONS = { public: "globe", private: "lock", friends: "friends" };
const PRIVACY_LABELS = { public: "Anyone", private: "Members of the group", friends: "Your connections" };

export const BUSY_THREAD = 60;

const openActor = guarded("story.actor", (event, actorId) => {
    event.preventDefault();
    if (actorId.startsWith("u"))
        navigate(`/profile/${actorId}`);
});

const follow = guarded("story.follow", (storyId, actorId) => {
    updateRecord(storyId, () => ({ viewer_follows_actor: true }));
    publish();
    log("follow", { actor: actorId, surface: "story_header" });
});

const hideStory = guarded("story.hide", (storyId) => {
    log("story_hide_intent", { story: storyId });
});

const ActorLine_story = fragment("ActorLine_story", {
    ...scalars("id url created_time privacy sponsored viewer_follows_actor"),
    actor: scalars("id __typename name is_verified"),
    to_group: scalars("id name privacy"),
});

function ActorLine({ storyRef }) {
    const story = useFragment(ActorLine_story, storyRef);
    const { actor, to_group: group } = story;
    return (
        <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="flex min-w-0 flex-wrap items-center text-[15px] leading-5">
                <HovercardTrigger kind={actor.__typename === "Page" ? "page" : "user"} id={actor.id}>
                    <a className="text-primary font-semibold hover:underline" href={`#/profile/${actor.id}`} onClick={(event) => openActor(event, actor.id)} data-log="story_actor">
                        <strong>
                            <span>{actor.name}</span>
                        </strong>
                    </a>
                </HovercardTrigger>
                {actor.is_verified && <Icon name="verified" size={14} className="text-accent ml-1" label={t("Verified account")} />}
                {group
                    && <>
                        <Icon name="chevronRight" size={14} className="text-secondary mx-0.5" />
                        <HovercardTrigger kind="group" id={group.id}>
                            <a className="text-primary font-semibold hover:underline" href={`#/groups/${group.id}`} data-log="story_group">
                                <span>{group.name}</span>
                            </a>
                        </HovercardTrigger>
                    </>
                }
                {!story.viewer_follows_actor
                    && <>
                        <span className="text-secondary mx-1" aria-hidden="true">
                            ·
                        </span>
                        <Pressable className="text-link font-semibold hover:underline" onPress={() => follow(story.id, actor.id)} data-log="story_follow">
                            {t("Follow")}
                        </Pressable>
                    </>
                }
            </h3>
            <div className="text-secondary flex items-center gap-1 text-[13px] leading-4">
                {story.sponsored
                    ? <span>{t("Promoted")}</span>
                    : <a className="hover:underline" href={story.url} title={absoluteTime(story.created_time)} data-log="story_timestamp">
                        <span>{relativeTime(story.created_time)}</span>
                    </a>
                }
                <span aria-hidden="true">·</span>
                <Pressable className="rounded-full" label={t("Shared with: {audience}", { audience: PRIVACY_LABELS[story.privacy] })} data-log="story_audience">
                    <Icon name={PRIVACY_ICONS[story.privacy]} size={12} />
                </Pressable>
            </div>
        </div>
    );
}

const StoryHeader_story = fragment("StoryHeader_story", {
    id: true,
    actor: scalars("id __typename name avatar_seed"),
    ...spread(ActorLine_story),
});

function StoryHeader({ storyRef }) {
    const story = useFragment(StoryHeader_story, storyRef);
    const { actor } = story;
    return (
        <header className="flex items-start gap-2 px-4 pt-3">
            <HovercardTrigger kind={actor.__typename === "Page" ? "page" : "user"} id={actor.id}>
                <a href={`#/profile/${actor.id}`} onClick={(event) => openActor(event, actor.id)} aria-label={actor.name} tabIndex={-1}>
                    <Avatar seed={actor.avatar_seed} size={40} square={actor.__typename === "Page"} label={actor.name} />
                </a>
            </HovercardTrigger>
            <ActorLine storyRef={story} />
            <div className="flex items-center">
                <Pressable className="text-secondary hover:bg-hover rounded-full p-2" label={t("Actions for this post by {name}", { name: actor.name })} aria-haspopup="menu" data-log="story_menu">
                    <Icon name="dots" size={20} strokeWidth={3} />
                </Pressable>
                <Pressable className="text-secondary hover:bg-hover rounded-full p-2" label={t("Hide post")} onPress={() => hideStory(story.id)} data-log="story_hide">
                    <Icon name="close" size={20} />
                </Pressable>
            </div>
        </header>
    );
}

function StoryMessage({ message, expanded, onExpand, translatable }) {
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
                        {t("Read more")}
                    </Pressable>
                </>
            }
            {translatable
                && <Pressable className="text-secondary mt-1 flex items-center gap-1 text-[13px] font-semibold hover:underline" data-log="story_translate">
                    <Icon name="translate" size={14} />
                    {t("See translation")}
                </Pressable>
            }
        </div>
    );
}

const PhotoTile_photo = fragment("PhotoTile_photo", scalars("id seed width height alt"));

function PhotoTile({ photoRef, count, index, extra, span }) {
    const record = useFragment(PhotoTile_photo, photoRef);
    const height = count === 1 ? Math.round((600 * record.height) / record.width) : 600;
    return (
        <a href={`#/photo/${record.id}`} className={`relative block overflow-hidden ${span}`} data-log="story_photo" onClick={(event) => event.preventDefault()}>
            <img className="h-full w-full object-cover" src={photo(record.seed, 600, height)} alt={record.alt} width="600" height={height} decoding="async" />
            <span className="pointer-events-none absolute inset-0 bg-black opacity-0 hover:opacity-10" aria-hidden="true" />
            {extra > 0 && index === count - 1 && <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-3xl font-bold text-white">{t("+{count, number}", { count: extra })}</span>}
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
                <PhotoTile key={ref.__id} photoRef={ref} count={count} index={index} extra={extra} span={spans(index)} />
            )}
        </div>
    );
}

const LinkCard_link = fragment("LinkCard_link", scalars("id url domain title description image_seed"));

function LinkCard({ linkRef, sponsored }) {
    const link = useFragment(LinkCard_link, linkRef);
    return (
        <a className="border-divider bg-surface-alt block border-y hover:brightness-95" href={link.url} target="_blank" rel="noreferrer" data-log="story_link_card">
            <img className="aspect-[1.91/1] w-full object-cover" src={photo(link.image_seed, 600, 314)} width="600" height="314" alt="" />
            <div className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                    <div className="text-secondary truncate text-xs uppercase">{link.domain}</div>
                    <div className="text-primary line-clamp-2 text-[16px] font-semibold leading-5">{link.title}</div>
                    <div className="text-secondary line-clamp-1 text-sm">{link.description}</div>
                </div>
                {sponsored
                    && <Pressable className="bg-hover text-primary shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold" data-log="ad_cta">
                        {t("Learn more")}
                    </Pressable>
                }
            </div>
        </a>
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

const InlineComposer_viewer = fragment("InlineComposer_viewer", scalars("id avatar_seed"));
const InlineComposer_draft = fragment("InlineComposer_draft", scalars("id text ranges"));

function InlineComposer({ storyId }) {
    const viewer = useFragment(InlineComposer_viewer, VIEWER_ID);
    const draft = useFragment(InlineComposer_draft, draftId(storyId));
    const hasDraft = draft && draft.text.trim();
    return (
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
            {viewer && <Avatar seed={viewer.avatar_seed} size={32} label="" />}
            <div className="bg-surface-alt flex flex-1 items-center rounded-full pr-1">
                <Pressable className={`min-w-0 flex-1 px-3 py-2 text-[15px] ${hasDraft ? "text-primary" : "text-secondary"}`} onPress={() => openComments(storyId, "inline_composer")} data-log="story_inline_composer">
                    {hasDraft
                        ? <span className="flex min-w-0 items-baseline gap-1.5">
                            <span className="text-accent shrink-0 text-xs font-semibold uppercase">{t("Draft")}</span>
                            <RichText className="truncate" text={draft.text} ranges={draft.ranges} />
                        </span>
                        : t("Write a comment…")
                    }
                </Pressable>
                {[
                    ["smile", "Insert an emoji"],
                    ["camera", "Attach a photo or video"],
                    ["gif", "Comment with a GIF"],
                    ["sticker", "Comment with a sticker"],
                ].map(([icon, label]) =>
                    <Pressable key={icon} className="text-secondary hover:bg-hover rounded-full p-1.5" label={t(label)}>
                        <Icon name={icon} size={16} />
                    </Pressable>
                )}
            </div>
        </div>
    );
}

function CommentPreviews({ storyId, comments, total }) {
    return (
        <div className="border-divider border-t pt-2">
            <div className="flex items-center justify-between px-4 pb-2">
                <Pressable className="text-secondary flex items-center gap-1 text-[15px] font-semibold hover:underline" data-log="story_comment_order">
                    {t("Most relevant")}
                    <Icon name="chevronDown" size={16} />
                </Pressable>
            </div>
            <div className="flex flex-col gap-2 px-4">
                {comments.map((ref) =>
                    <CommentBody key={ref.__id} commentRef={ref} />
                )}
            </div>
            {total > comments.length
                && <Pressable className="text-secondary mx-4 mt-2 text-[15px] font-semibold hover:underline" onPress={() => openComments(storyId, "preview")} data-log="story_view_more_comments">
                    {t("{count, plural, one {View # more comment} other {View # more comments}}", { count: total - comments.length })}
                </Pressable>
            }
        </div>
    );
}

function ReactionSummary({ feedback, summaryV2 }) {
    const names = feedback.reactors.map((reactor) => reactor.name);
    const others = feedback.reaction_count - names.length;
    let label;
    if (!summaryV2)
        label = t("{count, plural, one {# reaction} other {# reactions}}", { count: feedback.reaction_count });
    else if (others > 0)
        label = t("{names} and {count, plural, one {# other} other {# others}}", { names: names.slice(0, 1), count: others + names.length - 1 });
    else
        label = t("{names}", { names });
    return (
        <Pressable className="flex min-w-0 items-center gap-1.5 hover:underline" label={t("See who reacted to this")} data-log="story_reactors">
            <ReactionStack reactions={feedback.top_reactions} />
            <span className="truncate">{label}</span>
        </Pressable>
    );
}

const Engagement_feedback = fragment("Engagement_feedback", {
    ...scalars("id reaction_count top_reactions comment_count share_count viewer_reaction"),
    reactors: scalars("id name"),
    top_comments: spread(CommentBody_comment),
});

function ActionButton({ icon, label, active, onPress, className = "", ...rest }) {
    return (
        <Pressable className={`${className} hover:bg-hover flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-semibold ${active ? "text-accent" : "text-secondary"}`} onPress={onPress} {...rest}>
            <Icon name={icon} size={18} />
            <span>{label}</span>
        </Pressable>
    );
}

function Engagement({ storyId, feedbackRef, inDialog }) {
    const feedback = useFragment(Engagement_feedback, feedbackRef);
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
    const commentsLabel = t("{count, plural, one {# comment} other {# comments}}", { count: feedback.comment_count });
    return (
        <>
            <div className="text-secondary flex items-center justify-between gap-2 px-4 py-2.5 text-[15px]">
                {feedback.reaction_count > 0 ? <ReactionSummary feedback={feedback} summaryV2={summaryV2} /> : <span />}
                <div className="flex shrink-0 gap-3">
                    {feedback.comment_count > 0
                        && <Pressable className="story-comments-count hover:underline" onPress={inDialog ? focusComposer : () => openComments(storyId, "count")} data-log="story_comment_count">
                            {commentsLabel}
                        </Pressable>
                    }
                    {feedback.share_count > 0
                        && <Pressable className="hover:underline" data-log="story_shares">
                            {t("{count, plural, one {# share} other {# shares}}", { count: feedback.share_count })}
                        </Pressable>
                    }
                </div>
            </div>
            <div className="border-divider mx-3 flex border-t py-1">
                <ActionButton icon="like" label={t("Like")} active={!!feedback.viewer_reaction} onPress={() => toggleLike(feedback.id)} aria-pressed={feedback.viewer_reaction === "like"} data-log="story_like" />
                <ActionButton
                    icon="comment"
                    label={t("Comment")}
                    className="story-comments-button"
                    onPress={inDialog ? focusComposer : () => openComments(storyId, "button")}
                    aria-label={t("Comment on this post, {comments}", { comments: commentsLabel })}
                    data-thread={busy ? "busy" : "quiet"}
                    data-log="story_comment"
                />
                <ActionButton icon="share" label={t("Share")} data-log="story_share" />
                <ActionButton icon="send" label={t("Send")} data-log="story_send" />
            </div>
            {!inDialog && feedback.top_comments.length > 0 && <CommentPreviews storyId={storyId} comments={feedback.top_comments} total={feedback.comment_count} />}
            {!inDialog && <InlineComposer storyId={storyId} />}
        </>
    );
}

export const Story_story = fragment("Story_story", {
    ...scalars("id sponsored message can_translate tracking"),
    attachments: spread(PhotoTile_photo),
    link: spread(LinkCard_link),
    feedback: spread(Engagement_feedback),
    ...spread(StoryHeader_story),
});

function Story({ id, position, expandable = true, inDialog = false }) {
    const story = useFragment(Story_story, id);
    const [expanded, setExpanded] = useState(!expandable);
    const remeasure = useContext(MeasureContext);

    useLayoutEffect(() => {
        if (expanded && expandable)
            remeasure(id);
    }, [expanded, expandable, id, remeasure]);

    const expand = guarded("story.see_more", () => {
        setExpanded(true);
        log("story_expand", { story: id, position, length: story.message.text.length, tracking: story.tracking });
    });

    return (
        <article className="story bg-surface shadow-card overflow-hidden rounded-lg" aria-label={t("Post {position, number}", { position: position + 1 })} data-log-scope="story">
            <StoryHeader storyRef={story} />
            <StoryMessage message={story.message} expanded={expanded} onExpand={expand} translatable={story.can_translate} />
            {story.attachments.length > 0 && <PhotoGrid attachments={story.attachments} />}
            {story.link && <LinkCard linkRef={story.link} sponsored={story.sponsored} />}
            {story.sponsored
                && <div className="bg-surface-alt flex items-center justify-between px-4 py-2">
                    <span className="text-secondary text-sm">{t("Offer ends soon")}</span>
                    <Pressable className="bg-hover text-primary rounded-md px-3 py-1.5 text-sm font-semibold" data-log="ad_cta">
                        {t("Learn more")}
                    </Pressable>
                </div>
            }
            <Engagement storyId={id} feedbackRef={story.feedback} inDialog={inDialog} />
        </article>
    );
}

export default memo(Story);
