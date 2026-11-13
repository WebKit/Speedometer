<script>
    import { page } from "$app/state";
    import Icon from "./Icon.svelte";

    const sections = [
        { label: "News", href: "#/", menu: ["Today's news", "US", "Politics", "World", "Tech", "Earnings", "Economy", "Housing"] },
        { label: "Markets", href: "#/markets/stocks/trending", markets: true, menu: ["Stocks: Most Actives", "Stocks: Gainers", "Stocks: Losers", "Trending Tickers", "Futures", "World Indices", "Bonds", "Currencies", "Crypto", "Sectors"] },
        { label: "Research", href: "#/", menu: ["Screeners", "Calendar", "Stock Comparison", "Advanced Chart", "Currency Converter"] },
        { label: "Personal Finance", href: "#/", menu: ["Credit Cards", "Banking", "Best HYSA", "Student Loans", "Insurance", "Mortgages", "Taxes"] },
        { label: "Videos", href: "#/", menu: ["Latest", "Editor's Picks", "Investing Insights", "Trending Stocks", "All Shows"] },
        { label: "Watch Now", href: "#/", menu: [] },
    ];
    const marketLinks = [
        { id: "trending", label: "Trending Tickers" },
        { id: "most-active", label: "Most Active" },
        { id: "gainers", label: "Top Gainers" },
        { id: "losers", label: "Top Losers" },
        { id: "52-week-gainers", label: "52 Week Gainers" },
        { id: "large-cap", label: "Large Cap" },
    ];

    const onMarkets = $derived(page.route.id?.startsWith("/markets") ?? false);
</script>

<header class="site-header" data-module="header">
    <div class="tw-flex tw-items-center tw-gap-6 tw-px-6 tw-py-2.5">
        <a id="logo-link" class="logo" href="#/" aria-label="Quoteboard home">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M3 17l5-6 4 4 7-9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <span>quoteboard</span>
        </a>
        <form class="search tw-relative tw-max-w-xl tw-flex-1" role="search" onsubmit={(event) => event.preventDefault()}>
            <span class="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-muted"><Icon name="search" /></span>
            <input class="tw-w-full tw-rounded-full tw-border tw-border-line tw-py-2 tw-pl-9 tw-pr-4" type="search" placeholder="Search for news, symbols or companies" aria-label="Search" />
        </form>
        <nav class="tw-ml-auto tw-flex tw-items-center tw-gap-4 tw-font-semibold">
            <a class="tw-text-accent" href="#/">Upgrade</a>
            <button class="tw-text-muted" type="button" aria-label="Notifications"><Icon name="bell" size={20} /></button>
            <a class="tw-flex tw-items-center tw-gap-1.5" href="#/"><Icon name="user" size={20} /><span>Sign in</span></a>
        </nav>
    </div>
    <nav class="section-nav tw-flex tw-gap-1 tw-px-5" aria-label="Sections">
        {#each sections as section (section.label)}
            <div class="section-item">
                <a class={["section-link", (section.markets ? onMarkets : !onMarkets && section.label === "News") && "active"]} href={section.href}>{section.label}</a>
                {#if section.menu.length}
                    <div class="section-menu" role="menu">
                        {#each section.menu as item (item)}
                            <a class="tw-block tw-rounded tw-px-3 tw-py-1.5 hover:tw-bg-gray-100" role="menuitem" href="#/">{item}</a>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </nav>
    {#if onMarkets}
        <nav class="sub-nav" aria-label="Markets">
            {#each marketLinks as link (link.id)}
                <a class={["sub-nav-link", page.params.screener === link.id && "active"]} href="#/markets/stocks/{link.id}">{link.label}</a>
            {/each}
        </nav>
    {:else}
        <nav class="sub-nav" aria-label="News">
            <a class="sub-nav-link active" href="#/">Today's news</a>
            <a id="nav-trending" class="sub-nav-link" href="#/markets/stocks/trending">Trending tickers</a>
            <a class="sub-nav-link" href="#/markets/stocks/gainers">Top gainers</a>
            <a class="sub-nav-link" href="#/markets/stocks/most-active">Most active</a>
            <a class="sub-nav-link" href="#/">Earnings</a>
            <a class="sub-nav-link" href="#/">Economy</a>
        </nav>
    {/if}
</header>

<style>
    .site-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--surface);
        border-bottom: 1px solid var(--line);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--accent);
        font-weight: 800;
        font-size: 20px;
        letter-spacing: -0.5px;
    }

    .search input {
        background: var(--canvas);
    }

    .section-item {
        position: relative;
    }

    .section-link {
        display: block;
        padding: 8px 10px;
        font-weight: 600;
        border-bottom: 3px solid transparent;
        white-space: nowrap;
    }

    .section-link.active {
        border-bottom-color: var(--accent);
        color: var(--accent);
    }

    .section-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 20;
        min-width: 200px;
        padding: 8px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .section-item:hover .section-menu,
    .section-item:focus-within .section-menu {
        display: block;
    }

    .sub-nav {
        display: flex;
        gap: 4px;
        padding: 0 20px;
        overflow-x: auto;
        scrollbar-width: none;
        border-top: 1px solid var(--line);
        background: var(--canvas);
    }

    .sub-nav-link {
        padding: 7px 10px;
        font-size: 13px;
        color: var(--muted);
        white-space: nowrap;
    }

    .sub-nav-link.active {
        color: var(--ink);
        font-weight: 600;
    }
</style>
