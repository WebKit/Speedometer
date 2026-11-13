<script>
    let { name, size = 16 } = $props();

    const PATHS = {
        star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z",
        plus: "M12 5v14M5 12h14",
        more: "M6 12h.01M12 12h.01M18 12h.01",
        share: "M4 12v7h16v-7M12 3v12M7 8l5-5 5 5",
        bookmark: "M6 3h12v18l-6-4-6 4z",
        up: "M12 19V5M6 11l6-6 6 6",
        down: "M12 5v14M6 13l6 6 6-6",
        chevronLeft: "M15 5l-7 7 7 7",
        chevronRight: "M9 5l7 7-7 7",
        search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
        bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
        user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
        play: "M8 5v14l11-7z",
        sort: "M8 9l4-4 4 4M8 15l4 4 4-4",
    };
</script>

<svg class="icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d={PATHS[name]} />
</svg>

<style>
    .icon {
        flex: none;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
</style>
