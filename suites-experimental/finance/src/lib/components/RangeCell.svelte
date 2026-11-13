<script>
    import { formatPrice } from "../format.js";

    let { low, high, quote } = $props();
    const position = $derived(Math.max(0, Math.min(100, ((quote.price - low) / (high - low || 1)) * 100)));
</script>

<div class="range-cell" role="meter" aria-valuemin={low} aria-valuemax={high} aria-valuenow={quote.price} aria-label="52 week range">
    <div class="range-labels tw-flex tw-justify-between tw-text-[11px] tw-text-muted">
        <span>{formatPrice(low)}</span>
        <span>{formatPrice(high)}</span>
    </div>
    <div class="range-bar">
        <span class="range-fill" style:width="{position}%"></span>
        <span class="range-marker" style:left="{position}%"></span>
    </div>
</div>

<style>
    .range-cell {
        width: 140px;
    }

    .range-bar {
        position: relative;
        height: 4px;
        margin-top: 4px;
        border-radius: 2px;
        background: #dde0e5;
    }

    .range-fill {
        position: absolute;
        inset: 0 auto 0 0;
        border-radius: 2px;
        background: linear-gradient(90deg, var(--down), #c5c9d0, var(--up));
    }

    .range-marker {
        position: absolute;
        top: -4px;
        width: 3px;
        height: 12px;
        margin-left: -1px;
        border-radius: 1px;
        background: var(--ink);
    }
</style>
