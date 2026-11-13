<script>
    import { drawAreaChart, observeSize } from "../charts.js";
    import { formatChange, formatPercent, formatPrice, formatTime, trend } from "../format.js";
    import { NOW, POINT_INTERVAL_MS, SESSION_OPEN } from "../data/market.js";
    import PriceChange from "./PriceChange.svelte";

    let { quotes } = $props();
    let selected = $state(0);
    let canvas;
    const quote = $derived(quotes[selected]);
    const timeLabels = $derived(Array.from({ length: 7 }, (_, i) => formatTime(SESSION_OPEN + ((i * (quote.series.length - 1)) / 6) * POINT_INTERVAL_MS)));

    let size = $state.raw(null);

    $effect(() => observeSize(canvas, (measured) => (size = measured)));

    $effect(() => {
        if (size)
            drawAreaChart(canvas, size, quote.series, quote.previousClose, timeLabels, formatPrice);
    });
</script>

<section class="card" data-module="market-summary">
    <div class="tabs tw-mb-3.5 tw-flex tw-gap-1.5" role="tablist">
        {#each quotes as tab, index (tab.symbol)}
            <button class={["summary-tab", index === selected && "active"]} type="button" role="tab" aria-selected={index === selected} onclick={() => (selected = index)}>
                <span class="tw-font-semibold">{tab.name}</span>
                <PriceChange quote={tab} field="changePercent" format={formatPercent} colored />
            </button>
        {/each}
    </div>
    <div class="tw-mb-2 tw-flex tw-items-end tw-justify-between tw-gap-3">
        <div>
            <h2 class="tw-text-2xl tw-font-bold">{quote.name}</h2>
            <span class="tw-text-xs tw-text-muted">{quote.symbol} · At close: {formatTime(NOW)} EST</span>
        </div>
        <div class={["price tw-flex tw-items-baseline tw-gap-1.5 tw-text-base tw-font-semibold", trend(quote.change)]}>
            <PriceChange {quote} format={formatPrice} />
            <PriceChange {quote} field="change" format={formatChange} colored />
            <PriceChange {quote} field="changePercent" format={(value) => `(${formatPercent(value)})`} colored />
        </div>
    </div>
    <canvas bind:this={canvas} aria-label="{quote.name} intraday chart"></canvas>
</section>

<style>
    .tabs {
        overflow-x: auto;
        scrollbar-width: none;
    }

    .summary-tab {
        display: grid;
        flex: 0 0 auto;
        padding: 6px 12px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--surface);
        text-align: left;
        font-size: 12px;
    }

    .summary-tab.active {
        border-color: var(--accent);
        background: var(--accent-soft);
    }

    .price > :global(.live-value:first-child) {
        font-size: 26px;
        font-weight: 700;
    }

    canvas {
        display: block;
        width: 100%;
        height: 260px;
    }
</style>
