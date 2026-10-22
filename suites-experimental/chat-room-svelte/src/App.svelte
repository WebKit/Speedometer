<script>
    import { rooms } from "./data/rooms.js";
    import RoomList from "./components/room-list.svelte";
    import Timeline from "./components/timeline.svelte";

    let selectedRoomId = $state(rooms[0].id);
    const selectedRoom = $derived(rooms.find((room) => room.id === selectedRoomId));

    const handleSelect = (roomId) => {
        selectedRoomId = roomId;
    };
</script>

<div class="app">
    <RoomList {rooms} {selectedRoomId} onSelect={handleSelect} />
    <main class="room">
        <header class="room-header">
            <h1 id="room-header-name" class="room-header-name">{selectedRoom.name}</h1>
            <p class="room-header-topic">{selectedRoom.topic}</p>
        </header>
        <!-- Keyed by room id so switching rooms fully tears down the old timeline
             and mounts the new one, which is the work we profile. -->
        {#key selectedRoom.id}
            <Timeline room={selectedRoom} onSelectRoom={handleSelect} />
        {/key}
    </main>
</div>
