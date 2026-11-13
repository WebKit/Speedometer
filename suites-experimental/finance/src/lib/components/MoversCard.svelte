<script>
    import QuoteList from "./QuoteList.svelte";

    let { movers } = $props();
    const tabs = [
        { id: "gainers", label: "Gainers" },
        { id: "losers", label: "Losers" },
        { id: "active", label: "Most Active" },
    ];
    let selected = $state("gainers");
</script>

<section class="movers card" data-module="movers">
    <h2 class="section-title">Top movers</h2>
    <div class="switch-group tw-mb-2" role="tablist">
        {#each tabs as tab (tab.id)}
            <button class={["switch", selected === tab.id && "active"]} type="button" role="tab" aria-selected={selected === tab.id} data-tab={tab.id} onclick={() => (selected = tab.id)}>{tab.label}</button>
        {/each}
    </div>
    <QuoteList quotes={movers[selected]} />
    <a class="tw-mt-2.5 tw-block tw-font-semibold tw-text-accent" href="#/markets/stocks/{selected === 'active' ? 'most-active' : selected}">See more</a>
</section>
