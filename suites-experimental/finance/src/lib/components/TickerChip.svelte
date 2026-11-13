<script>
    import { formatPercent, trend } from "../format.js";
    import { subscribe } from "../quotes.svelte.js";
    import Icon from "./Icon.svelte";
    import PriceChange from "./PriceChange.svelte";

    let { quote } = $props();
    $effect(() => subscribe(quote.symbol));
</script>

<a class="ticker-chip" href="#/markets/stocks/trending" title={quote.name}>
    <span class="tw-font-bold">{quote.symbol}</span>
    <span class={["tw-inline-flex tw-items-center", trend(quote.change)]}>
        <Icon name={quote.change < 0 ? "down" : "up"} size={12} />
        <PriceChange {quote} field="changePercent" format={formatPercent} />
    </span>
</a>

<style>
    .ticker-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 1px 8px;
        border: 1px solid var(--line);
        border-radius: 999px;
        font-size: 12px;
    }

    .ticker-chip:hover {
        border-color: var(--accent);
    }
</style>
