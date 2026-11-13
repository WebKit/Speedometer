<script>
    import { formatChange, formatPercent, formatPrice } from "../format.js";
    import { subscribe } from "../quotes.svelte.js";
    import CanvasSparkline from "./CanvasSparkline.svelte";
    import IconButton from "./IconButton.svelte";
    import PriceChange from "./PriceChange.svelte";

    let { quote } = $props();
    $effect(() => subscribe(quote.symbol));
</script>

<div class="ticker-card" data-symbol={quote.symbol}>
    <div class="tw-flex tw-items-start tw-justify-between tw-gap-1">
        <a class="tw-grid tw-min-w-0" href="#/markets/stocks/trending">
            <span class="ticker-name">{quote.name}</span>
            <span class="tw-text-[11px] tw-text-muted">{quote.symbol}</span>
        </a>
        <IconButton icon="plus" label="Add {quote.symbol} to watchlist" toggles />
    </div>
    <div class="tw-grid">
        <span class="tw-font-bold"><PriceChange {quote} format={formatPrice} /></span>
        <span class="ticker-change tw-flex tw-gap-1 tw-text-xs">
            <PriceChange {quote} field="change" format={formatChange} colored />
            <PriceChange {quote} field="changePercent" format={(value) => `(${formatPercent(value)})`} colored />
        </span>
    </div>
    <CanvasSparkline {quote} />
</div>

<style>
    .ticker-card {
        flex: 0 0 172px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--surface);
    }

    .ticker-name {
        font-weight: 600;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @container strip (max-width: 520px) {
        .ticker-change :global(.live-value + .live-value) {
            display: none;
        }
    }
</style>
