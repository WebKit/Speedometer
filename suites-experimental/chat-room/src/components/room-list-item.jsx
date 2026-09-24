import { AVATAR_COLORS } from "../data/rooms.js";

export default function RoomListItem({ index, room, selected, onSelect }) {
    const className = selected ? "room-list-item room-list-item-selected" : "room-list-item";
    return (
        <button id={`room-list-item-${index}`} className={className} type="button" onClick={() => onSelect(room.id)}>
            <span className="avatar" style={{ backgroundColor: AVATAR_COLORS[room.colorIndex] }}>
                {room.initials}
            </span>
            <span className="room-list-item-text">
                <span className="room-list-item-name">{room.name}</span>
                <span className="room-list-item-preview">{room.lastMessage}</span>
            </span>
        </button>
    );
}
