<script>
    import { startStream, stream } from "../quotes.svelte.js";
    import Icon from "./Icon.svelte";
    import TickerCard from "./TickerCard.svelte";

    let { quotes, label = "Markets", live = false } = $props();
    let track;
    let canScrollBack = $state(false);
    let canScrollForward = $state(true);

    function updateButtons() {
        canScrollBack = track.scrollLeft > 0;
        canScrollForward = track.scrollLeft + track.clientWidth < track.scrollWidth - 1;
    }

    function scrollPage(direction) {
        track.scrollLeft += direction * track.clientWidth * 0.8;
        updateButtons();
    }

    $effect(() => {
        quotes.length;
        updateButtons();
    });
</script>

<section class={["carousel tw-flex tw-items-center tw-gap-2", live && "market-strip"]} data-module="ticker-carousel" aria-label={label}>
    <button class="carousel-button" type="button" aria-label="Previous" disabled={!canScrollBack} onclick={() => scrollPage(-1)}><Icon name="chevronLeft" /></button>
    <div class="track tw-flex tw-flex-1 tw-gap-2" bind:this={track} onscroll={updateButtons}>
        {#each quotes as quote (quote.symbol)}
            <TickerCard {quote} />
        {/each}
    </div>
    <button class="carousel-button" type="button" aria-label="Next" disabled={!canScrollForward} onclick={() => scrollPage(1)}><Icon name="chevronRight" /></button>
    {#if live}
        <button id="live-toggle" class={["live-toggle", stream.live && "on"]} type="button" aria-pressed={stream.live} onclick={startStream}>
            <span class="live-dot"></span>
            {stream.live ? `Live · ${stream.messages}` : "Go live"}
        </button>
    {/if}
</section>

<style>
    .track {
        overflow-x: auto;
        scrollbar-width: none;
    }

    .market-strip .track {
        container: strip / inline-size;
    }

    .carousel-button {
        flex: none;
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border: 1px solid var(--line);
        border-radius: 50%;
        background: var(--surface);
    }

    .carousel-button:disabled {
        opacity: 0.35;
        cursor: default;
    }

    .live-toggle {
        flex: none;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--surface);
        font-weight: 600;
        font-size: 12px;
    }

    .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--muted);
    }

    .live-toggle.on .live-dot {
        background: var(--down);
    }
</style>
