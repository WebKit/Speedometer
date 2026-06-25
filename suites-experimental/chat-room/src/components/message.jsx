import { AVATAR_COLORS } from "../data/rooms.js";

export default function Message({ message }) {
    return (
        <li className="timeline-message">
            <span className="avatar" style={{ backgroundColor: AVATAR_COLORS[message.colorIndex] }}>
                {message.senderInitials}
            </span>
            <div className="timeline-message-body">
                <div className="timeline-message-meta">
                    <span className="timeline-message-sender">{message.sender}</span>
                    <span className="timeline-message-time">{message.time}</span>
                </div>
                <div className="timeline-message-text">{message.body}</div>
            </div>
        </li>
    );
}
