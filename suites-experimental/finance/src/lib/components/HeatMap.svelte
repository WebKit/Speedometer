<script>
    import { heatColor, squarify } from "../charts.js";
    import { formatPercent } from "../format.js";

    let { rows } = $props();
    let container;
    let size = $state(null);

    const SECTOR_HEADER = 18;
    const GAP = 2;

    $effect(() => {
        size = { width: container.clientWidth, height: container.clientHeight };
    });

    const sectors = $derived.by(() => {
        const groups = new Map();
        for (const row of rows) {
            let group = groups.get(row.sector);
            if (!group) {
                group = { name: row.sector, rows: [], value: 0 };
                groups.set(row.sector, group);
            }
            group.rows.push(row);
            group.value += row.marketCap;
        }
        return [...groups.values()];
    });

    const layout = $derived.by(() => {
        if (!size)
            return [];
        return squarify(sectors, 0, 0, size.width, size.height).map((sectorRect) => {
            const inner = squarify(
                sectorRect.item.rows.map((row) => ({ row, value: row.marketCap })),
                sectorRect.x + GAP,
                sectorRect.y + SECTOR_HEADER,
                Math.max(1, sectorRect.width - 2 * GAP),
                Math.max(1, sectorRect.height - SECTOR_HEADER - GAP)
            );
            return { ...sectorRect, tiles: inner };
        });
    });
</script>

<div class="heatmap" bind:this={container} data-module="heatmap" role="img" aria-label="Heatmap by sector">
    {#each layout as sector (sector.item.name)}
        <div class="heatmap-sector" style:left="{sector.x}px" style:top="{sector.y}px" style:width="{sector.width}px" style:height="{sector.height}px">
            <span class="heatmap-sector-name">{sector.item.name}</span>
        </div>
        {#each sector.tiles as tile (tile.item.row.quote.symbol)}
            {@const quote = tile.item.row.quote}
            <a
                class={["heatmap-tile", tile.width * tile.height < 1800 && "compact", tile.width < 28 && "tiny"]}
                href="#/markets/stocks/trending"
                style:left="{tile.x}px"
                style:top="{tile.y}px"
                style:width="{Math.max(0, tile.width - 1)}px"
                style:height="{Math.max(0, tile.height - 1)}px"
                style:background-color={heatColor(quote.changePercent)}
                title="{quote.name} {formatPercent(quote.changePercent)}"
            >
                <span class="tile-symbol">{quote.symbol}</span>
                <span class="tile-change">{formatPercent(quote.changePercent)}</span>
            </a>
        {/each}
    {/each}
</div>

<style>
    .heatmap {
        position: relative;
        height: 640px;
        background: var(--ink);
        border-radius: var(--radius);
        overflow: hidden;
    }

    .heatmap-sector {
        position: absolute;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .heatmap-sector-name {
        display: block;
        padding: 1px 6px;
        color: rgba(255, 255, 255, 0.85);
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .heatmap-tile {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        color: white;
        font-size: 12px;
        font-weight: 700;
    }

    .heatmap-tile.compact .tile-change,
    .heatmap-tile.tiny .tile-symbol {
        display: none;
    }

    .tile-change {
        font-weight: 500;
        font-size: 11px;
    }
</style>
