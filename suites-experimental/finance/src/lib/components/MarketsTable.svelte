<script>
    import { untrack } from "svelte";
    import Icon from "./Icon.svelte";
    import TableRow from "./TableRow.svelte";

    let { rows, pageIndex, pageSize } = $props();

    const columns = [
        { id: "symbol", label: "Symbol", text: (row) => row.quote.symbol },
        { id: "name", label: "Name", text: (row) => row.quote.name },
        { id: "chart", label: "1D Chart" },
        { id: "price", label: "Price", value: (row) => row.quote.price },
        { id: "change", label: "Change", value: (row) => row.quote.change },
        { id: "change-percent", label: "Change %", value: (row) => row.quote.changePercent },
        { id: "volume", label: "Volume", value: (row) => row.quote.volume },
        { id: "avg-volume", label: "Avg Vol (3M)", value: (row) => row.avgVolume },
        { id: "market-cap", label: "Market Cap", value: (row) => row.marketCap },
        { id: "pe-ratio", label: "P/E Ratio (TTM)", value: (row) => row.peRatio ?? -Infinity },
        { id: "52-week-change", label: "52 Wk Change %", value: (row) => row.fiftyTwoWeekChangePercent },
        { id: "rating", label: "Analyst Rating", value: (row) => -row.rating },
        { id: "52-week-range", label: "52 Wk Range" },
        { id: "earnings-date", label: "Earnings Date", value: (row) => row.earningsDate },
    ];

    let sortColumn = $state(null);
    let sortDirection = $state(-1);

    // Sorts on the values at the time of the click: rows don't jump around
    // while quotes stream in.
    const sorted = $derived.by(() => {
        const column = sortColumn;
        const direction = sortDirection;
        if (!column)
            return rows;
        return untrack(() => {
            if (column.text) {
                const collator = new Intl.Collator("en-US");
                return [...rows].sort((a, b) => direction * collator.compare(column.text(a), column.text(b)));
            }
            const keyed = rows.map((row) => ({ row, key: column.value(row) }));
            keyed.sort((a, b) => direction * (a.key - b.key));
            return keyed.map(({ row }) => row);
        });
    });

    const visible = $derived(sorted.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize));

    function sortBy(column) {
        if (sortColumn === column) {
            sortDirection = -sortDirection;
        } else {
            sortColumn = column;
            sortDirection = column.text ? 1 : -1;
        }
    }
</script>

<div class="scroller" data-module="screener-table">
    <table>
        <thead>
            <tr>
                {#each columns as column (column.id)}
                    <th class={[column.value && "num", column.id === "symbol" && "sticky-cell"]} aria-sort={sortColumn === column ? (sortDirection > 0 ? "ascending" : "descending") : undefined}>
                        {#if column.value || column.text}
                            <button class="sort-button tw-inline-flex tw-items-center tw-gap-1" type="button" data-column={column.id} onclick={() => sortBy(column)}>
                                {column.label}
                                <span class="tw-opacity-60" aria-hidden="true">
                                    {#if sortColumn === column}
                                        <Icon name={sortDirection > 0 ? "up" : "down"} size={12} />
                                    {:else}
                                        <Icon name="sort" size={12} />
                                    {/if}
                                </span>
                            </button>
                        {:else}
                            {column.label}
                        {/if}
                    </th>
                {/each}
                <th><span class="tw-sr-only">Actions</span></th>
            </tr>
        </thead>
        <tbody>
            {#each visible as row (row.quote.symbol)}
                <TableRow {row} />
            {/each}
        </tbody>
    </table>
</div>

<style>
    .scroller {
        overflow-x: auto;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-variant-numeric: tabular-nums;
    }

    th {
        position: sticky;
        top: 0;
        padding: 8px 10px;
        border-bottom: 1px solid var(--line);
        background: var(--surface);
        color: var(--muted);
        font-size: 12px;
        font-weight: 600;
        text-align: left;
        white-space: nowrap;
    }

    th.num {
        text-align: right;
    }

    th.sticky-cell {
        left: 0;
        z-index: 2;
    }

    .sort-button {
        font-weight: 600;
    }
</style>
