<script>
    import { SCREENERS } from "../data/market.js";

    let { active } = $props();
    let strip;

    // Centers the active tab by hand: scrollIntoView would also scroll the
    // documents that embed this one.
    $effect(() => {
        active;
        const tab = strip.querySelector(".tab.active");
        strip.scrollLeft = tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
    });
</script>

<nav class="tabs tw-flex tw-gap-2" bind:this={strip} data-module="screener-tabs" aria-label="Screeners">
    {#each SCREENERS as screener (screener.id)}
        <a class={["tab", screener.id === active && "active"]} href="#/markets/stocks/{screener.id}">{screener.label}</a>
    {/each}
</nav>

<style>
    .tabs {
        overflow-x: auto;
        scrollbar-width: none;
    }

    .tab {
        flex: none;
        padding: 6px 14px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--surface);
        font-weight: 600;
    }

    .tab.active {
        background: var(--ink);
        border-color: var(--ink);
        color: white;
    }
</style>
