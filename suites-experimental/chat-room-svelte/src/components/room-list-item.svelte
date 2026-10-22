<script>
    import { AVATAR_COLORS } from "../data/rooms.js";

    let { index, room, selected, onSelect } = $props();
</script>

<button id="room-list-item-{index}" class={["room-list-item", selected && "room-list-item-selected"]} type="button" onclick={() => onSelect(room.id)}>
    <span class="avatar" style:background-color={AVATAR_COLORS[room.colorIndex]}>{room.initials}</span>
    <span class="room-list-item-text">
        <span class="room-list-item-name">{room.name}</span>
        <span class="room-list-item-preview">{room.lastMessage}</span>
    </span>
</button>
