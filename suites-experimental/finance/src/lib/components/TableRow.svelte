<script>
    import { formatChange, formatCompact, formatDate, formatPercent, formatPrice, formatRatio, trend } from "../format.js";
    import { subscribe } from "../quotes.svelte.js";
    import Icon from "./Icon.svelte";
    import IconButton from "./IconButton.svelte";
    import PriceChange from "./PriceChange.svelte";
    import RangeCell from "./RangeCell.svelte";
    import RatingCell from "./RatingCell.svelte";
    import SvgSparkline from "./SvgSparkline.svelte";

    let { row } = $props();
    const quote = $derived(row.quote);
    $effect(() => subscribe(quote.symbol));
</script>

<tr class="row">
    <td class="sticky-cell">
        <div class="tw-flex tw-items-center tw-gap-2">
            <IconButton icon="star" label="Add {quote.symbol} to watchlist" toggles />
            <a class="symbol-link tw-flex tw-items-center tw-gap-2" href="#/markets/stocks/trending">
                <span class="logo-mark" style:--hue={row.hue}>{quote.symbol[0]}</span>
                <span class="tw-grid">
                    <span class="tw-font-bold">{quote.symbol}</span>
                    <span class="tw-text-[10px] tw-font-medium tw-uppercase tw-text-muted">{row.exchange}</span>
                </span>
            </a>
        </div>
    </td>
    <td>
        <div class="name tw-grid">
            <span class="tw-truncate" title={quote.name}>{quote.name}</span>
            <span class="tw-truncate tw-text-[11px] tw-text-muted">{row.sector}</span>
        </div>
    </td>
    <td><SvgSparkline {quote} /></td>
    <td class="num"><span class="tw-font-semibold"><PriceChange {quote} format={formatPrice} /></span></td>
    <td class="num"><PriceChange {quote} field="change" format={formatChange} colored /></td>
    <td class="num">
        <span class={["tw-inline-flex tw-items-center tw-gap-0.5", trend(quote.change)]}>
            <Icon name={quote.change < 0 ? "down" : "up"} size={12} />
            <PriceChange {quote} field="changePercent" format={formatPercent} />
        </span>
    </td>
    <td class="num"><span>{formatCompact(quote.volume)}</span></td>
    <td class="num"><span>{formatCompact(row.avgVolume)}</span></td>
    <td class="num"><span>{formatCompact(row.marketCap)}</span></td>
    <td class="num"><span>{formatRatio(row.peRatio)}</span></td>
    <td class="num"><span class={trend(row.fiftyTwoWeekChangePercent)}>{formatPercent(row.fiftyTwoWeekChangePercent)}</span></td>
    <td><RatingCell rating={row.rating} /></td>
    <td><RangeCell low={row.fiftyTwoWeekLow} high={row.fiftyTwoWeekHigh} {quote} /></td>
    <td class="num"><time datetime={new Date(row.earningsDate).toISOString()}>{formatDate(row.earningsDate)}</time></td>
    <td><IconButton icon="more" label="More actions for {quote.symbol}" /></td>
</tr>

<style>
    td {
        padding: 8px 10px;
        border-bottom: 1px solid var(--line);
        text-align: left;
        white-space: nowrap;
    }

    .num {
        text-align: right;
    }

    .sticky-cell {
        position: sticky;
        left: 0;
        z-index: 1;
        background: var(--surface);
    }

    .symbol-link {
        color: var(--accent);
    }

    .logo-mark {
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: hsl(var(--hue) 45% 88%);
        color: hsl(var(--hue) 45% 30%);
        font-size: 12px;
        font-weight: 700;
    }

    .name {
        min-width: 180px;
        max-width: 220px;
    }

    .row:hover td {
        background: #f8f9fb;
    }
</style>
