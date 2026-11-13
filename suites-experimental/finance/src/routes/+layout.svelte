<script>
    import "../app.css";
    import { onMount } from "svelte";
    import { observeModules } from "#lib/analytics.js";
    import Footer from "#lib/components/Footer.svelte";
    import Header from "#lib/components/Header.svelte";
    import TickerCarousel from "#lib/components/TickerCarousel.svelte";

    let { data, children } = $props();
    let main;

    onMount(() => observeModules(main));
</script>

<Header />
<div class="market-strip">
    <TickerCarousel quotes={data.indices} live />
</div>
<main class="page" bind:this={main}>
    {@render children()}
</main>
<Footer />

<style>
    .market-strip {
        padding: 10px 24px;
        background: var(--surface);
        border-bottom: 1px solid var(--line);
    }

    .page {
        max-width: 1440px;
        margin: 0 auto;
        padding: 20px 24px 40px;
    }
</style>
