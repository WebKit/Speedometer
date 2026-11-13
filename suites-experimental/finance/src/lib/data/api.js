import { SCREENERS, companies, indices, screenerResults, stories } from "./market.js";

// The app talks to its "backend" through serialized responses, so every page
// load pays for JSON.parse and for turning the payload into view models, the
// way it would with a real fetch. The strings are built once at startup,
// outside the measured steps.
const responses = new Map();

function serve(path, body) {
    responses.set(path, JSON.stringify(body));
}

for (const screener of SCREENERS) {
    serve(`/v1/screener/${screener.id}`, {
        id: screener.id,
        title: screener.label,
        total: companies.length,
        quotes: screenerResults(screener.id).map(({ interest, ...quote }) => quote),
    });
}

serve("/v1/market-summary", { quotes: indices });

function snapshot({ symbol, name, price, change, changePercent, previousClose, volume, series }) {
    return { symbol, name, price, change, changePercent, previousClose, volume, series };
}

const bySymbol = new Map(companies.map((company) => [company.symbol, company]));

serve("/v1/news", {
    stories: stories.map((story) => ({ ...story, tickers: story.tickers.map((symbol) => snapshot(bySymbol.get(symbol))) })),
});

function topBy(rank, count) {
    return [...companies]
        .sort((a, b) => rank(a) - rank(b))
        .slice(0, count)
        .map(snapshot);
}

serve("/v1/movers", {
    trending: topBy((q) => -q.interest, 8),
    gainers: topBy((q) => -q.changePercent, 6),
    losers: topBy((q) => q.changePercent, 6),
    active: topBy((q) => -q.volume, 6),
});

// Responses arrive on a later task, like a network response would. A
// MessageChannel rather than setTimeout(0), so a measured step doesn't pay for
// the timer clamp.
const channel = new MessageChannel();
const pending = [];
channel.port1.onmessage = () => pending.shift()();

export function nextTask() {
    return new Promise((resolve) => {
        pending.push(resolve);
        channel.port2.postMessage(0);
    });
}

// `latency` is in tasks, so slower endpoints resolve after faster ones.
export async function fetchJSON(path, latency = 1) {
    const body = responses.get(path);
    if (body === undefined)
        throw new Error(`No response for ${path}`);
    for (let i = 0; i < latency; i++)
        await nextTask();
    return JSON.parse(body);
}
