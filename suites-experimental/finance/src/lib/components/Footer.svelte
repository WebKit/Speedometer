<script>
    const columns = [
        { title: "Markets", links: ["Stocks: Most Actives", "Stocks: Gainers", "Stocks: Losers", "Trending Tickers", "Futures", "World Indices", "US Treasury Bonds", "Currencies", "Crypto", "Top ETFs", "Top Mutual Funds"] },
        { title: "News", links: ["Latest", "Stock Market", "Originals", "Economies", "Earnings", "Tech", "Housing", "Crypto", "Politics"] },
        { title: "Research", links: ["Screeners", "Calendar", "Stock Comparison", "Advanced Chart", "Currency Converter", "Investment Ideas", "Research Reports"] },
        { title: "Personal Finance", links: ["Credit Cards", "Banking", "Best HYSA", "Student Loans", "Insurance", "Mortgages", "Taxes"] },
    ];
    const partnerParams = ["?utm_source=footer", "?partner=quoteboard", "/promo/offer", "?ref=nav", ""];
    const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
</script>

<footer class="site-footer tw-grid tw-gap-6 tw-px-6 tw-py-8" data-module="footer">
    {#each columns as column, columnIndex (column.title)}
        <div>
            <h3 class="tw-mb-2 tw-text-[13px] tw-font-bold">{column.title}</h3>
            <ul class="tw-grid tw-gap-1 tw-text-[13px] tw-text-muted">
                {#each column.links as link, linkIndex (link)}
                    <li><a class="hover:tw-underline" href="https://example.com/{slug(column.title)}/{slug(link)}{partnerParams[(columnIndex + linkIndex) % partnerParams.length]}">{link}</a></li>
                {/each}
            </ul>
        </div>
    {/each}
    <p class="tw-col-span-full tw-text-xs tw-text-muted">Quoteboard is a synthetic benchmark workload. All companies, prices and stories are generated and fictional.</p>
</footer>

<style>
    .site-footer {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        background: var(--surface);
        border-top: 1px solid var(--line);
    }
</style>
