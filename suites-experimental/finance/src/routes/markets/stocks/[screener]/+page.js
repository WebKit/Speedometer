import { error } from "@sveltejs/kit";
import { fetchJSON } from "#lib/data/api.js";
import { SCREENERS } from "#lib/data/market.js";
import { liveQuote } from "#lib/quotes.svelte.js";

// The profiled gainers page showed 25 story figures below its table.
const RELATED_STORIES = 25;

function logoHue(symbol) {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++)
        hash = (hash * 31 + symbol.charCodeAt(i)) | 0;
    return Math.abs(hash) % 360;
}

export async function load({ params }) {
    if (!SCREENERS.some((screener) => screener.id === params.screener))
        error(404, "Unknown screener");
    const [response, news] = await Promise.all([fetchJSON(`/v1/screener/${params.screener}`), fetchJSON("/v1/news")]);
    const symbols = new Set(response.quotes.map((quote) => quote.symbol));
    const related = news.stories.filter((story) => story.tickers.some((ticker) => symbols.has(ticker.symbol))).slice(0, RELATED_STORIES);
    return {
        screener: { id: response.id, title: response.title },
        stories: related.map((story) => ({ ...story, tickers: story.tickers.map(liveQuote) })),
        rows: response.quotes.map((quote) => ({
            quote: liveQuote(quote),
            hue: logoHue(quote.symbol),
            rating: 1 + (logoHue(quote.symbol) % 41) / 10,
            sector: quote.sector,
            exchange: quote.exchange,
            avgVolume: quote.avgVolume,
            marketCap: quote.marketCap,
            peRatio: quote.peRatio,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
            fiftyTwoWeekChangePercent: quote.fiftyTwoWeekChangePercent,
            earningsDate: quote.earningsDate,
        })),
    };
}
