<script>
    import { tick } from "svelte";
    import { pageReady } from "#lib/analytics.js";
    import HeatMap from "#lib/components/HeatMap.svelte";
    import MarketsTable from "#lib/components/MarketsTable.svelte";
    import Pagination from "#lib/components/Pagination.svelte";
    import ScreenerTabs from "#lib/components/ScreenerTabs.svelte";
    import SectorChips from "#lib/components/SectorChips.svelte";
    import StoryStream from "#lib/components/StoryStream.svelte";
    import TickerCarousel from "#lib/components/TickerCarousel.svelte";

    let { data } = $props();
    let view = $state("table");
    let pageIndex = $state(0);
    let pageSize = $state(25);
    const HIGHLIGHTS = 10;

    $effect(() => {
        const id = data.screener.id;
        tick().then(() => pageReady(`screener:${id}`));
    });
</script>

<div class="screener tw-grid tw-gap-3.5">
    <ScreenerTabs active={data.screener.id} />
    <TickerCarousel quotes={data.rows.slice(0, HIGHLIGHTS).map((row) => row.quote)} label="Trending now" />
    <div class="tw-flex tw-items-center tw-justify-between">
        <h1 class="tw-text-[26px] tw-font-bold">{data.screener.title}</h1>
        <div class="switch-group" role="tablist">
            <button id="view-table" class={["switch", view === "table" && "active"]} type="button" role="tab" aria-selected={view === "table"} onclick={() => (view = "table")}>Table</button>
            <button id="view-heatmap" class={["switch", view === "heatmap" && "active"]} type="button" role="tab" aria-selected={view === "heatmap"} onclick={() => (view = "heatmap")}>Heatmap</button>
        </div>
    </div>
    <SectorChips rows={data.rows} />
    {#key data.screener.id}
        {#if view === "table"}
            <MarketsTable rows={data.rows} {pageIndex} {pageSize} />
            <Pagination total={data.rows.length} bind:pageIndex bind:pageSize />
        {:else}
            <HeatMap rows={data.rows} />
        {/if}
    {/key}
    <StoryStream stories={data.stories} title="News about these stocks" module="screener-news" />
</div>

<style>
    .screener {
        grid-template-columns: minmax(0, 1fr);
    }
</style>
