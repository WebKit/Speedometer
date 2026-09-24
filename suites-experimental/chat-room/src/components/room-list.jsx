import RoomListItem from "./room-list-item.jsx";

export default function RoomList({ rooms, selectedRoomId, onSelect }) {
    return (
        <nav className="room-list" aria-label="Rooms">
            {rooms.map((room, index) =>
                <RoomListItem key={room.id} index={index} room={room} selected={room.id === selectedRoomId} onSelect={onSelect} />
            )}
        </nav>
    );
}
