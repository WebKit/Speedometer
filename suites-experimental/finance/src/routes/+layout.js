import { fetchJSON } from "#lib/data/api.js";
import { liveQuote } from "#lib/quotes.svelte.js";

export async function load() {
    const summary = await fetchJSON("/v1/market-summary");
    return { indices: summary.quotes.map(liveQuote) };
}
