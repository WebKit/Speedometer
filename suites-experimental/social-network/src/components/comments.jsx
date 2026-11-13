import { memo, useEffect } from "react";
import { fragment, scalars, spread, useFragment, useRetain } from "../store/fragment.js";
import { photo } from "../data/graphics.js";
import { absoluteTime, relativeTime } from "../format.js";
import { t } from "../i18n.js";
import { guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { beginInteraction } from "../analytics/perf.js";
import { loadReplies, repliesConnectionId } from "../queries.js";
import { signal } from "../signals.js";
import Avatar from "./avatar.jsx";
import HovercardTrigger from "./hovercard.jsx";
import Icon from "./icon.jsx";
import Pressable from "./pressable.jsx";
import RichText from "./rich-text.jsx";
import { ReactionStack } from "./reactions.jsx";
import { GlimmerRow } from "./glimmer.jsx";

const expandReplies = guarded("comment.replies", (storyId, commentId) => {
    beginInteraction("replies-loaded", { comment: commentId });
    loadReplies(storyId, commentId);
});

const translate = guarded("comment.translate", (commentId) => {
    log("comment_translate", { comment: commentId });
});

const Attachment_attachment = fragment("Attachment_attachment", scalars("id __typename seed label width height alt"));

function Attachment({ attachmentRef }) {
    const attachment = useFragment(Attachment_attachment, attachmentRef);
    if (!attachment)
        return null;
    if (attachment.__typename === "Sticker")
        return <img className="mt-1 h-[120px] w-[120px]" src={photo(attachment.seed, 120, 120)} width="120" height="120" alt={attachment.label} />;
    return (
        <Pressable className="mt-1 block w-fit overflow-hidden rounded-xl" label={attachment.alt} data-log="comment_photo">
            <img className="max-h-[200px] object-cover" src={photo(attachment.seed, attachment.width, attachment.height)} width={attachment.width / 2} height={attachment.height / 2} alt={attachment.alt} />
        </Pressable>
    );
}

export const CommentBody_comment = fragment("CommentBody_comment", {
    ...scalars("id created_time body reaction_count top_reactions badges is_edited can_translate"),
    author: scalars("id name avatar_seed is_verified"),
    attachment: spread(Attachment_attachment),
});

/**
 * A comment's avatar, bubble, attachment and action row; `children` renders under it,
 * where the thread puts replies.
 */
export function CommentBody({ commentRef, small = false, children }) {
    const comment = useFragment(CommentBody_comment, commentRef);
    const { author } = comment;
    const when = relativeTime(comment.created_time);
    return (
        <div className="comment flex gap-2" role="article" aria-label={t("Comment by {name} {when} ago", { name: author.name, when })} data-log-scope="comment">
            <HovercardTrigger kind="user" id={author.id}>
                <a href={`#/profile/${author.id}`} onClick={(event) => event.preventDefault()} tabIndex={-1}>
                    <Avatar seed={author.avatar_seed} size={small ? 24 : 32} label={author.name} />
                </a>
            </HovercardTrigger>
            <div className="min-w-0 flex-1">
                <div className="group/bubble flex items-center gap-1">
                    <div className={`bg-surface-alt relative min-w-0 rounded-2xl px-3 py-2 ${comment.reaction_count > 0 ? "mb-2" : ""}`}>
                        <div className="flex flex-wrap items-center gap-x-1.5">
                            <HovercardTrigger kind="user" id={author.id}>
                                <a className="text-primary text-[13px] font-semibold hover:underline" href={`#/profile/${author.id}`} onClick={(event) => event.preventDefault()}>
                                    <span>{author.name}</span>
                                </a>
                            </HovercardTrigger>
                            {author.is_verified && <Icon name="verified" size={12} className="text-accent" label={t("Verified account")} />}
                            {comment.badges.map((badge) =>
                                <span key={badge} className="bg-accent-soft text-accent flex items-center gap-0.5 rounded px-1 text-[11px] font-semibold">
                                    <Icon name="star" size={10} />
                                    <span>{badge}</span>
                                </span>
                            )}
                        </div>
                        <RichText className="text-primary text-[15px] leading-5" text={comment.body.text} ranges={comment.body.ranges} />
                        {comment.reaction_count > 0
                            && <span className="absolute -bottom-2.5 right-1">
                                <Pressable
                                    className="bg-surface shadow-card flex items-center gap-1 rounded-full py-0.5 pl-0.5 pr-1.5 text-[12px]"
                                    label={t("{count, plural, one {# reaction} other {# reactions}}; see who reacted", { count: comment.reaction_count })}
                                    data-log="comment_reactors"
                                >
                                    <ReactionStack reactions={comment.top_reactions} size={16} />
                                    <span className="text-secondary">{t("{count, number}", { count: comment.reaction_count })}</span>
                                </Pressable>
                            </span>
                        }
                    </div>
                    <Pressable className="text-secondary hover:bg-hover shrink-0 rounded-full p-1.5 opacity-0 group-hover/bubble:opacity-100" label={t("Edit or delete this")} aria-haspopup="menu" data-log="comment_menu">
                        <Icon name="dots" size={16} strokeWidth={3} />
                    </Pressable>
                </div>
                {comment.attachment && <Attachment attachmentRef={comment.attachment} />}
                <div className="text-secondary mt-0.5 flex items-center gap-3 px-3 text-xs">
                    <a className="hover:underline" href={`#/comment/${comment.id}`} title={absoluteTime(comment.created_time)} onClick={(event) => event.preventDefault()}>
                        <span>{when}</span>
                    </a>
                    <Pressable className="font-semibold hover:underline" data-log="comment_like">
                        {t("Like")}
                    </Pressable>
                    <Pressable className="font-semibold hover:underline" data-log="comment_reply">
                        {t("Reply")}
                    </Pressable>
                    <Pressable className="font-semibold hover:underline" data-log="comment_share">
                        {t("Share")}
                    </Pressable>
                    {comment.is_edited && <span>{t("Edited")}</span>}
                </div>
                {comment.can_translate
                    && <Pressable className="text-secondary mt-0.5 px-3 text-xs font-semibold hover:underline" onPress={() => translate(comment.id)} data-log="comment_translate">
                        {t("See translation")}
                    </Pressable>
                }
                {children}
            </div>
        </div>
    );
}

export const Comment_comment = fragment("Comment_comment", {
    ...scalars("id reply_count depth"),
    ...spread(CommentBody_comment),
});

export const CommentConnection = fragment("CommentConnection", {
    ...scalars("id status total_count page_info order"),
    edges: { cursor: true, node: spread(Comment_comment) },
});

function Replies({ storyId, comment }) {
    const connection = useFragment(CommentConnection, repliesConnectionId(comment.id));
    useRetain(connection ? repliesConnectionId(comment.id) : null);
    const status = connection ? connection.status : null;
    const count = connection ? connection.edges.length : 0;

    useEffect(() => {
        if (status === "ready")
            signal("replies-loaded");
    }, [status, count]);

    if (!connection) {
        return (
            <Pressable className="view-replies text-secondary mt-1 flex items-center gap-2 px-3 text-[14px] font-semibold hover:underline" onPress={() => expandReplies(storyId, comment.id)} data-log="comment_view_replies">
                <Icon name="reply" size={16} />
                {t("{count, plural, one {View # reply} other {View all # replies}}", { count: comment.reply_count })}
            </Pressable>
        );
    }
    const remaining = (connection.total_count ?? comment.reply_count) - connection.edges.length;
    return (
        <div className="border-divider mt-2 flex flex-col gap-2 border-l-2 pl-3">
            {connection.edges.map((edge) =>
                <Comment key={edge.node.__id} commentRef={edge.node} storyId={storyId} depth={1} />
            )}
            {status !== "ready" && <GlimmerRow avatarSize={24} lines={2} />}
            {status === "ready" && remaining > 0
                && <Pressable className="view-replies text-secondary text-left text-[14px] font-semibold hover:underline" onPress={() => expandReplies(storyId, comment.id)} data-log="comment_more_replies">
                    {t("{count, plural, one {View # more reply} other {View # more replies}}", { count: remaining })}
                </Pressable>
            }
        </div>
    );
}

function Comment({ commentRef, storyId, depth = 0 }) {
    const comment = useFragment(Comment_comment, commentRef);
    return (
        <div className={depth ? "" : "px-4"}>
            <CommentBody commentRef={comment} small={depth > 0}>
                {depth === 0 && comment.reply_count > 0 && <Replies storyId={storyId} comment={comment} />}
            </CommentBody>
        </div>
    );
}

export default memo(Comment);
