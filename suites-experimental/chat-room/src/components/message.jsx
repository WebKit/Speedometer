import { useActions } from "../actions.js";
import { AVATAR_COLORS } from "../data/rooms.js";
import Reaction from "./reaction.jsx";
import RichText from "./rich-text.jsx";

// Consecutive messages from the same sender collapse into the previous one, the
// way a chat client renders a burst of them: no repeated avatar or name, just
// the body under a gutter that holds the timestamp on hover.
// The index is the row's position in the whole room, not in the mounted window,
// so the timeline can file the measured height against the right message.
export default function Message({ index, message, highlighted }) {
    const { jumpToMessage } = useActions();
    const classNames = ["timeline-message"];
    if (message.grouped)
        classNames.push("timeline-message-grouped");
    if (highlighted)
        classNames.push("timeline-message-highlighted");

    return (
        <li className={classNames.join(" ")} data-message-id={message.id} data-index={index}>
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
        </li>
    );
}
