<script>
    import RoomListItem from "./room-list-item.svelte";

    let { rooms, selectedRoomId, onSelect } = $props();
</script>

<nav class="room-list" aria-label="Rooms">
    {#each rooms as room, index (room.id)}
        <RoomListItem {index} {room} selected={room.id === selectedRoomId} {onSelect} />
    {/each}
</nav>
