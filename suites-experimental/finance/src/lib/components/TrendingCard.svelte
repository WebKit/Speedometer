<script>
    import QuoteList from "./QuoteList.svelte";

    let { quotes } = $props();
</script>

<section class="card" data-module="trending-tickers">
    <h2 class="section-title"><a href="#/markets/stocks/trending">Trending tickers</a></h2>
    <QuoteList {quotes} sparklines />
</section>
