<script>
    // 1 is a strong buy, 5 a strong sell, like analyst consensus scales.
    let { rating } = $props();
    const LABELS = ["Strong Buy", "Buy", "Hold", "Underperform", "Sell"];
    const label = $derived(LABELS[Math.min(4, Math.floor(rating - 1))]);
    const tone = $derived(rating < 2.5 ? "buy" : rating < 3.5 ? "hold" : "sell");
</script>

<div class="rating tw-flex tw-items-center tw-gap-2" title="Analyst rating {rating.toFixed(1)}">
    <span class={["badge", tone]}>{rating.toFixed(1)}</span>
    <span class="tw-text-xs tw-text-muted">{label}</span>
</div>

<style>
    .badge {
        min-width: 32px;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
        text-align: center;
    }

    .buy {
        background: #e0f3ec;
        color: var(--up);
    }

    .hold {
        background: #f1f2f4;
        color: var(--muted);
    }

    .sell {
        background: #fbe7ea;
        color: var(--down);
    }
</style>
