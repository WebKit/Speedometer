import { useState } from "react";
import { rooms } from "./data/rooms.js";
import RoomList from "./components/room-list.jsx";
import Timeline from "./components/timeline.jsx";

export default function App() {
    const [selectedRoomId, setSelectedRoomId] = useState(rooms[0].id);
    const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

    // A plain state update, so the switch commits through React's normal
    // concurrent scheduler, the way a real discrete click does. The suite yields
    // a task between clicks so each switch commits before the next.
    const handleSelect = (roomId) => setSelectedRoomId(roomId);

    return (
        <div className="app">
            <RoomList rooms={rooms} selectedRoomId={selectedRoomId} onSelect={handleSelect} />
            <main className="room">
                <header className="room-header">
                    <h1 id="room-header-name" className="room-header-name">
                        {selectedRoom.name}
                    </h1>
                    <p className="room-header-topic">{selectedRoom.topic}</p>
                </header>
                {/* Keyed by room id so switching rooms fully tears down the old
                    timeline and mounts the new one, which is the work we profile. */}
                <Timeline key={selectedRoom.id} room={selectedRoom} />
            </main>
        </div>
    );
}
