import { fetchJSON } from "#lib/data/api.js";
import { liveQuote } from "#lib/quotes.svelte.js";

const NEWS_LATENCY = 3;

export async function load() {
    // The news stream is slower than the quote endpoints and isn't awaited, so
    // the page renders its skeleton first and streams the stories in.
    const news = fetchJSON("/v1/news", NEWS_LATENCY).then(({ stories }) => stories.map((story) => ({ ...story, tickers: story.tickers.map(liveQuote) })));
    const movers = await fetchJSON("/v1/movers");
    return {
        news,
        trending: movers.trending.map(liveQuote),
        movers: {
            gainers: movers.gainers.map(liveQuote),
            losers: movers.losers.map(liveQuote),
            active: movers.active.map(liveQuote),
        },
    };
}
