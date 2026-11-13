/* global $state */
import { tick } from "svelte";
import { nextTask } from "./data/api.js";
import { createRandom } from "./data/random.js";

export class LiveQuote {
    price = $state(0);
    change = $state(0);
    changePercent = $state(0);
    volume = $state(0);
    series = $state.raw([]);
    // Bumped on every streamed update, so price cells can flash.
    revision = $state(0);
    direction = $state(0);

    constructor(quote) {
        this.symbol = quote.symbol;
        this.name = quote.name;
        this.previousClose = quote.previousClose;
        this.price = quote.price;
        this.change = quote.change;
        this.changePercent = quote.changePercent;
        this.volume = quote.volume ?? 0;
        this.series = quote.series;
    }

    apply(price, volume) {
        this.direction = Math.sign(price - this.price);
        this.price = price;
        this.change = price - this.previousClose;
        this.changePercent = (this.change / this.previousClose) * 100;
        this.volume += volume;
        const series = this.series.slice();
        series[series.length - 1] = price;
        this.series = series;
        this.revision++;
    }
}

const quotes = new Map();

// A response only seeds a symbol's live quote: once the stream has updated a
// symbol, its streamed values win over the (older) response.
export function liveQuote(quote) {
    let live = quotes.get(quote.symbol);
    if (!live) {
        live = new LiveQuote(quote);
        quotes.set(quote.symbol, live);
    }
    return live;
}

// Components subscribe to the symbols they show, the way a streaming client
// tells its socket which tickers to send.
const subscriptions = new Map();

export function subscribe(symbol) {
    subscriptions.set(symbol, (subscriptions.get(symbol) ?? 0) + 1);
    return () => {
        const count = subscriptions.get(symbol) - 1;
        if (count)
            subscriptions.set(symbol, count);
        else
            subscriptions.delete(symbol);
    };
}

export const stream = $state({ live: false, messages: 0 });

const STREAM_MESSAGES = 20;
const UPDATES_PER_MESSAGE = 24;
const random = createRandom(0x57ea);

function applyMessage() {
    const symbols = [...subscriptions.keys()];
    const updates = Math.min(symbols.length, UPDATES_PER_MESSAGE);
    for (let i = 0; i < updates; i++) {
        const quote = quotes.get(symbols[Math.floor(random() * symbols.length)]);
        const price = Math.round(quote.price * (1 + (random() - 0.5) * 0.006) * 100) / 100;
        quote.apply(price, Math.floor(random() * 5000));
    }
    stream.messages++;
}

// Replays a fixed burst of quote messages, one per task, then reports back.
export async function startStream() {
    if (stream.live)
        return;
    stream.live = true;
    for (let i = 0; i < STREAM_MESSAGES; i++) {
        await nextTask();
        applyMessage();
    }
    stream.live = false;
    await tick();
    window.dispatchEvent(new Event("finance-stream-complete"));
}
