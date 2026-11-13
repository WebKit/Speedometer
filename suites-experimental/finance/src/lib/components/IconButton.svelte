<script>
    import Icon from "./Icon.svelte";

    let { icon, label, toggles = false } = $props();
    let pressed = $state(false);
</script>

<button class="icon-button" type="button" aria-label={label} title={label} aria-pressed={toggles ? pressed : undefined} onclick={() => toggles && (pressed = !pressed)}>
    <Icon name={icon} />
</button>

<style>
    .icon-button {
        display: inline-grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        color: var(--muted);
        background: transparent;
    }

    .icon-button:hover {
        background: var(--canvas);
        color: var(--ink);
    }

    .icon-button[aria-pressed="true"] {
        color: var(--accent);
    }
</style>
