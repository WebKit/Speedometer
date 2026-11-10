import { memo, useEffect } from "react";
import { useLinkedRecord, useRecord } from "../store/hooks.js";
import { photo } from "../data/graphics.js";
import { absoluteTime, compactNumber, relativeTime } from "../format.js";
import { guarded } from "../analytics/guard.js";
import { beginInteraction } from "../analytics/perf.js";
import { loadReplies, repliesConnectionId } from "../queries.js";
import { signal } from "../signals.js";
import Avatar from "./avatar.jsx";
import Icon from "./icon.jsx";
import Pressable from "./pressable.jsx";
import RichText from "./rich-text.jsx";
import { ReactionStack } from "./story.jsx";
import { GlimmerRow } from "./glimmer.jsx";

const expandReplies = guarded("comment.replies", (storyId, commentId) => {
    beginInteraction("replies-loaded", { comment: commentId });
    loadReplies(storyId, commentId);
});

function Attachment({ attachmentRef }) {
    const attachment = useLinkedRecord(attachmentRef);
    if (!attachment)
        return null;
    if (attachment.__typename === "Sticker")
        return <img className="mt-1 h-[120px] w-[120px]" src={photo(attachment.seed, 120, 120)} width="120" height="120" alt={attachment.label} />;
    return <img className="mt-1 max-h-[200px] rounded-xl object-cover" src={photo(attachment.seed, attachment.width, attachment.height)} width={attachment.width / 2} height={attachment.height / 2} alt={attachment.alt} />;
}

function Replies({ storyId, comment }) {
    const connection = useRecord(repliesConnectionId(comment.id));
    const status = connection ? connection.status : null;
    const count = connection ? connection.edges.length : 0;

    useEffect(() => {
        if (status === "ready")
            signal("replies-loaded");
    }, [status, count]);

    if (!connection) {
        return (
            <Pressable className="view-replies text-secondary mt-1 flex items-center gap-2 text-[15px] font-semibold hover:underline" onPress={() => expandReplies(storyId, comment.id)} data-log="comment_view_replies">
                <Icon name="chevronRight" size={16} className="rotate-90" />
                Show {comment.reply_count} {comment.reply_count === 1 ? "reply" : "replies"}
            </Pressable>
        );
    }
    const remaining = (connection.total_count ?? comment.reply_count) - connection.edges.length;
    return (
        <div className="border-divider mt-2 flex flex-col gap-2 border-l-2 pl-3">
            {connection.edges.map((edge) =>
                <Comment key={edge.node.__ref} commentRef={edge.node} storyId={storyId} depth={1} />
            )}
            {status !== "ready" && <GlimmerRow avatarSize={24} lines={2} />}
            {status === "ready" && remaining > 0
                && <Pressable className="view-replies text-secondary text-left text-[15px] font-semibold hover:underline" onPress={() => expandReplies(storyId, comment.id)} data-log="comment_more_replies">
                    Show {remaining} more {remaining === 1 ? "reply" : "replies"}
                </Pressable>
            }
        </div>
    );
}

function Comment({ commentRef, storyId, depth = 0 }) {
    const comment = useLinkedRecord(commentRef);
    const author = useLinkedRecord(comment.author);
    return (
        <div className={`comment flex gap-2 ${depth ? "" : "px-4"}`} role="article" aria-label={`Comment by ${author.name} ${relativeTime(comment.created_time)} ago`} data-log-scope="comment">
            <Avatar seed={author.avatar_seed} size={depth ? 24 : 32} label={author.name} />
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <a className="text-primary text-[14px] font-semibold hover:underline" href={`#/profile/${author.id}`} onClick={(event) => event.preventDefault()}>
                        {author.name}
                    </a>
                    <a className="text-secondary text-xs hover:underline" href={`#/comment/${comment.id}`} title={absoluteTime(comment.created_time)}>
                        {relativeTime(comment.created_time)}
                    </a>
                </div>
                <RichText className="text-primary text-[15px] leading-5" text={comment.body.text} ranges={comment.body.ranges} />
                {comment.attachment && <Attachment attachmentRef={comment.attachment} />}
                <div className="text-secondary mt-1 flex items-center gap-3 text-xs font-semibold">
                    <Pressable className="hover:text-primary flex items-center gap-1" data-log="comment_like">
                        <Icon name="like" size={14} />
                        {comment.reaction_count > 0 ? compactNumber(comment.reaction_count) : "Like"}
                    </Pressable>
                    <Pressable className="hover:text-primary" data-log="comment_reply">
                        Reply
                    </Pressable>
                    <Pressable className="hover:text-primary" data-log="comment_share">
                        Share
                    </Pressable>
                    {comment.reaction_count > 0 && <ReactionStack reactions={comment.top_reactions} size={16} />}
                </div>
                {depth === 0 && comment.reply_count > 0 && <Replies storyId={storyId} comment={comment} />}
            </div>
        </div>
    );
}

export default memo(Comment);
