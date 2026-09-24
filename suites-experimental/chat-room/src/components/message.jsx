import { useActions } from "../actions.js";
import { AVATAR_COLORS } from "../data/rooms.js";
import Reaction from "./reaction.jsx";
import RichText from "./rich-text.jsx";

// Consecutive messages from the same sender collapse into the one above, the way
// a chat client renders a burst: no repeated avatar or name, and the gutter
// carries the timestamp on hover.
// The index is the row's position in the whole room, not in the mounted window,
// so the timeline can file the measured height against the right message.
//
// The date separator and the unread divider are drawn inside the row they belong
// to rather than as rows of their own, because the height cache, the spacers and
// the offset search are all indexed by message.
export default function Message({ index, message, highlighted, dateLabel, unreadBelow }) {
    const { jumpToMessage } = useActions();
    const classNames = ["timeline-message"];
    if (message.grouped)
        classNames.push("timeline-message-grouped");
    if (highlighted)
        classNames.push("timeline-message-highlighted");

    return (
        <li className={classNames.join(" ")} data-message-id={message.id} data-index={index}>
            {dateLabel !== null
                && <div className="timeline-date-separator">
                    <span className="timeline-date-separator-label">{dateLabel}</span>
                </div>
            }
            {unreadBelow
                && <div className="timeline-unread-divider" aria-label="Unread messages">
                    <span className="timeline-unread-divider-label">New</span>
                </div>
            }
            <div className="timeline-message-row">
                {message.grouped
                    ? <span className="timeline-message-gutter">{message.time}</span>
                    : <span className="avatar" style={{ backgroundColor: AVATAR_COLORS[message.colorIndex] }}>
                        {message.senderInitials}
                    </span>
                }
                <div className="timeline-message-body">
                    {message.replyTo
                        && <button className="timeline-message-reply" type="button" onClick={() => jumpToMessage(message.replyTo.id)}>
                            <span className="timeline-message-reply-sender">{message.replyTo.sender}</span>
                            <span className="timeline-message-reply-excerpt">{message.replyTo.excerpt}</span>
                        </button>
                    }
                    {!message.grouped
                        && <div className="timeline-message-meta">
                            <span className="timeline-message-sender">{message.sender}</span>
                            <span className="timeline-message-time">{message.time}</span>
                        </div>
                    }
                    <div className="timeline-message-text">
                        <RichText blocks={message.blocks} />
                    </div>
                    {message.reactions.length > 0
                        && <div className="timeline-message-reactions">
                            {message.reactions.map((reaction) =>
                                <Reaction key={reaction.emoji} reaction={reaction} />
                            )}
                        </div>
                    }
                </div>
            </div>
        </li>
    );
}
