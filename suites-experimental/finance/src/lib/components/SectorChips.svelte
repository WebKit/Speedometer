<script>
    import { formatPercent, trend } from "../format.js";

    let { rows } = $props();

    const sectors = $derived.by(() => {
        const totals = new Map();
        for (const row of rows) {
            const entry = totals.get(row.sector) ?? { name: row.sector, count: 0, change: 0 };
            entry.count++;
            entry.change += row.quote.changePercent;
            totals.set(row.sector, entry);
        }
        return [...totals.values()].sort((a, b) => b.count - a.count);
    });
</script>

<div class="chips tw-flex tw-gap-2" data-module="sector-chips" aria-label="Sectors">
    <button class="chip active" type="button">All sectors <span class="count">{rows.length}</span></button>
    {#each sectors as sector (sector.name)}
        <button class="chip" type="button">
            {sector.name}
            <span class="count">{sector.count}</span>
            <span class={["tw-text-xs", trend(sector.change)]}>{formatPercent(sector.change / sector.count)}</span>
        </button>
    {/each}
</div>

<style>
    .chips {
        overflow-x: auto;
        scrollbar-width: none;
    }

    .chip {
        flex: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--surface);
        font-size: 13px;
    }

    .chip.active {
        border-color: var(--accent);
        background: var(--accent-soft);
    }

    .count {
        padding: 0 6px;
        border-radius: 999px;
        background: var(--canvas);
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
    }
</style>
