<script>
    import { formatChange, formatPercent, formatPrice, trend } from "../format.js";
    import { subscribe } from "../quotes.svelte.js";
    import Icon from "./Icon.svelte";
    import IconButton from "./IconButton.svelte";
    import PriceChange from "./PriceChange.svelte";
    import SvgSparkline from "./SvgSparkline.svelte";

    let { quotes, sparklines = false } = $props();

    $effect(() => {
        const unsubscribers = quotes.map((quote) => subscribe(quote.symbol));
        return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    });
</script>

<ul class="quote-list">
    {#each quotes as quote (quote.symbol)}
        <li class="quote-row">
            <a class="tw-grid tw-min-w-0" href="#/markets/stocks/trending">
                <span class="tw-font-bold">{quote.symbol}</span>
                <span class="name">{quote.name}</span>
            </a>
            {#if sparklines}<SvgSparkline {quote} width={72} height={28} />{/if}
            <div class="tw-grid tw-justify-items-end tw-font-semibold">
                <PriceChange {quote} format={formatPrice} />
                <span class={["tw-inline-flex tw-items-center tw-gap-0.5 tw-text-xs", trend(quote.change)]}>
                    <Icon name={quote.change < 0 ? "down" : "up"} size={12} />
                    <PriceChange {quote} field="change" format={formatChange} />
                    <PriceChange {quote} field="changePercent" format={(value) => `(${formatPercent(value)})`} />
                </span>
            </div>
            <IconButton icon="star" label="Add {quote.symbol} to watchlist" toggles />
        </li>
    {/each}
</ul>

<style>
    .quote-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto auto;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid var(--line);
    }

    .quote-row:last-child {
        border-bottom: none;
    }

    .name {
        font-size: 12px;
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
