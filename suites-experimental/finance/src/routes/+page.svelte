<script>
    import { tick } from "svelte";
    import { pageReady } from "#lib/analytics.js";
    import MarketSummary from "#lib/components/MarketSummary.svelte";
    import MoversCard from "#lib/components/MoversCard.svelte";
    import StoryItem from "#lib/components/StoryItem.svelte";
    import StoryStream from "#lib/components/StoryStream.svelte";
    import StoryStreamSkeleton from "#lib/components/StoryStreamSkeleton.svelte";
    import TrendingCard from "#lib/components/TrendingCard.svelte";

    let { data } = $props();
    const SUMMARY_TABS = 6;

    $effect(() => {
        let cancelled = false;
        data.news.then(async () => {
            await tick();
            if (!cancelled)
                pageReady("home");
        });
        return () => (cancelled = true);
    });
</script>

<div class="home">
    <div class="main-column">
        <MarketSummary quotes={data.indices.slice(0, SUMMARY_TABS)} />
        {#await data.news}
            <StoryStreamSkeleton count={6} />
        {:then stories}
            <StoryItem story={stories[0]} lead />
            <StoryStream stories={stories.slice(1)} />
        {/await}
    </div>
    <aside class="sidebar">
        <TrendingCard quotes={data.trending} />
        <MoversCard movers={data.movers} />
    </aside>
</div>

<style>
    .home {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 20px;
        align-items: start;
    }

    .main-column {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 20px;
        min-width: 0;
    }

    .sidebar {
        position: sticky;
        top: 112px;
        display: grid;
        gap: 20px;
    }

    @media (max-width: 900px) {
        .home {
            grid-template-columns: minmax(0, 1fr);
        }

        .sidebar {
            position: static;
        }
    }
</style>
