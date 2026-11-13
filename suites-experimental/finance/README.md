## Description

Finance portals combine three things on one page: a news front page, data-dense
market tables, and quotes that keep moving while the page is open. Small charts
are everywhere: canvas sparklines in the market strip, an intraday area chart, and
an SVG sparkline per table row.

This workload is an original, self-contained SvelteKit (Svelte 5) app,
"Quoteboard", that reproduces those interactions. Its features and their weight
were picked from Firefox profiles of a popular finance portal's home page and
screener pages: which modules each page loads, element counts (the largest
restyles touched about 2,400 elements on the home page and 4,000 on the screener
page), and how styles are organized. It is **not** derived from that site's source code or
assets. All companies, prices and stories are fictional and generated
deterministically at startup (seeded PRNG, fixed clock, no network), so every run
renders identical data.

## What are we testing

-   SvelteKit client-side navigation (hash router): `load` functions, JSON parsing
    of API-shaped responses, and mounting a route's component tree
-   Svelte 5 fine-grained reactivity: streamed quote updates touch only the cells
    that show them, and `{#key}` re-creates price spans to restart their flash
    animation
-   Canvas 2D drawing (paths, gradients, dashed lines, text), measured once on
    mount and resized through a `ResizeObserver`
-   SVG sparklines built as path strings. Charts render in their final state,
    with no draw-in animations
-   A 13-column auto-layout table that is sorted, paginated and resized
-   A squarified treemap heatmap of absolutely positioned tiles
-   The profiled site's styling architecture: Svelte component-scoped CSS (hashed
    `qb-` classes) next to `tw-`-prefixed Tailwind utilities, which makes style
    computation cost per element comparable to the profiled site's
-   A container query, `content-visibility: auto`, sticky headers, skeleton loaders
-   Page-view instrumentation like real portals ship: a `MutationObserver`,
    `checkVisibility()`, `getComputedStyle()` and `getBoundingClientRect()` per
    module, and a link audit, serialized into a beacon payload that isn't sent

## How are we testing

The suite starts on the home page, which is rendered while loading and is not
measured.

-   `NavigateToTrending` clicks "Trending tickers" and waits until the screener
    page has rendered a strip of quote cards, sector chips, its first 25 rows and
    25 related news stories.
-   `SortTable` sorts by five columns in turn.
-   `PaginateTable` steps through three pages, then shows 50 rows per page.
-   `ToggleHeatmap` switches to the heatmap view and back to the table.
-   `StreamQuotes` presses "Go live", which replays 20 quote messages, one per
    task. Each updates up to 24 subscribed symbols, which flash and redraw their
    charts.
-   `NavigateToHome` clicks the logo. The home page renders a skeleton, then the
    news stream that arrives a few tasks later.

Simulated responses arrive on `MessageChannel` tasks rather than timers, so the
measured time doesn't include timer clamping. Navigations are the only history
entries, two per iteration, which keeps the workload well clear of browsers'
`pushState` rate limits.

## Developer Documentation

The app was created with SvelteKit and `@sveltejs/adapter-static`, using the hash
router with a single bundle (`output.bundleStrategy: "single"`), so it can be
served from any subdirectory and never fetches code during a step. It can be
previewed during development with `npm run dev`. To update the files run in the
harness, run `npm run build`, which regenerates the committed `dist/` directory,
including `resources.txt`.

The built workload can be loaded within the harness at e.g.
`http://localhost:8080/?developerMode&suites=Finance-SvelteKit`, or directly at
`http://localhost:8080/suites-experimental/finance/dist/index.html`.
