import { createRandom, pick } from "./random.js";

// Fixed "now" (a Thursday, 21:00 UTC, the US close) instead of Date.now().
export const NOW = Date.UTC(2026, 10, 12, 21, 0);
export const SESSION_OPEN = Date.UTC(2026, 10, 12, 14, 30);
export const POINTS_PER_SESSION = 78;
export const POINT_INTERVAL_MS = 5 * 60 * 1000;

const SECTORS = [
    { name: "Technology", suffixes: ["Systems", "Semiconductor", "Software", "Networks", "Devices"] },
    { name: "Healthcare", suffixes: ["Therapeutics", "Biosciences", "Medical", "Health"] },
    { name: "Financial Services", suffixes: ["Bancorp", "Capital", "Financial", "Trust"] },
    { name: "Consumer Cyclical", suffixes: ["Motors", "Retail", "Brands", "Apparel"] },
    { name: "Industrials", suffixes: ["Industries", "Aerospace", "Logistics", "Machinery"] },
    { name: "Communication Services", suffixes: ["Media", "Telecom", "Interactive", "Studios"] },
    { name: "Energy", suffixes: ["Energy", "Petroleum", "Resources", "Power"] },
    { name: "Consumer Defensive", suffixes: ["Foods", "Beverages", "Household", "Grocers"] },
    { name: "Utilities", suffixes: ["Utilities", "Electric", "Water", "Gas"] },
    { name: "Real Estate", suffixes: ["Realty", "Properties", "REIT", "Land"] },
    { name: "Basic Materials", suffixes: ["Materials", "Chemicals", "Mining", "Steel"] },
];

const NAME_HEADS = ["Ar", "Bel", "Cor", "Dyn", "El", "Fen", "Gal", "Hel", "Ion", "Jun", "Kel", "Lum", "Mer", "Nov", "Or", "Pax", "Quin", "Ros", "Sol", "Tor", "Ul", "Ver", "Wex", "Xan", "Yor", "Zen"];
const NAME_TAILS = ["ada", "ex", "ion", "ora", "ics", "tek", "via", "lon", "ara", "is", "ent", "ix", "um", "eon"];
const LEGAL = ["Inc.", "Corp.", "Holdings", "Group", "Ltd.", "Co."];
const EXCHANGES = ["NMS", "NYQ", "NGM", "ASE"];

const COMPANY_COUNT = 240;

function randomWalk(random, start, count, volatility, drift) {
    const series = new Array(count);
    let value = start;
    for (let i = 0; i < count; i++) {
        value *= 1 + drift + (random() - 0.5) * volatility;
        series[i] = Math.round(value * 100) / 100;
    }
    return series;
}

function makeSymbol(name, used, random) {
    const letters = name.replace(/[^A-Z]/gi, "").toUpperCase();
    for (let length = 3; length <= 4; length++) {
        for (let attempt = 0; attempt < 8; attempt++) {
            let symbol = letters[0];
            while (symbol.length < length)
                symbol += letters[1 + Math.floor(random() * (letters.length - 1))];
            if (!used.has(symbol)) {
                used.add(symbol);
                return symbol;
            }
        }
    }
    const fallback = `${letters.slice(0, 2)}${used.size}`;
    used.add(fallback);
    return fallback;
}

function buildCompanies() {
    const random = createRandom(0x5eed);
    const usedNames = new Set();
    const usedSymbols = new Set();
    const companies = [];
    while (companies.length < COMPANY_COUNT) {
        const sector = SECTORS[companies.length % SECTORS.length];
        const base = pick(random, NAME_HEADS) + pick(random, NAME_TAILS);
        const name = `${base} ${pick(random, sector.suffixes)} ${pick(random, LEGAL)}`;
        if (usedNames.has(base))
            continue;
        usedNames.add(base);

        const symbol = makeSymbol(base + sector.suffixes[0], usedSymbols, random);
        const previousClose = Math.round((8 + random() ** 2 * 700) * 100) / 100;
        const volatility = 0.004 + random() * 0.012;
        const drift = (random() - 0.48) * 0.0012;
        const series = randomWalk(random, previousClose, POINTS_PER_SESSION, volatility, drift);
        const price = series[series.length - 1];
        const yearSeries = randomWalk(random, price * (0.6 + random() * 0.6), 52, 0.08, 0.002);
        yearSeries[yearSeries.length - 1] = price;
        const fiftyTwoWeekLow = Math.min(...yearSeries, ...series);
        const fiftyTwoWeekHigh = Math.max(...yearSeries, ...series);
        const sharesOutstanding = Math.round(2e7 + random() ** 3 * 8e9);
        const avgVolume = Math.round(sharesOutstanding * (0.002 + random() * 0.02));

        companies.push({
            symbol,
            name,
            sector: sector.name,
            exchange: pick(random, EXCHANGES),
            previousClose,
            price,
            change: Math.round((price - previousClose) * 100) / 100,
            changePercent: ((price - previousClose) / previousClose) * 100,
            volume: Math.round(avgVolume * (0.3 + random() * 2.5)),
            avgVolume,
            marketCap: Math.round(price * sharesOutstanding),
            peRatio: random() < 0.15 ? null : Math.round((4 + random() * 70) * 100) / 100,
            fiftyTwoWeekLow,
            fiftyTwoWeekHigh,
            fiftyTwoWeekChangePercent: ((price - yearSeries[0]) / yearSeries[0]) * 100,
            earningsDate: NOW + Math.floor(random() * 90) * 86400000,
            interest: random() * (1 + Math.abs(price - previousClose) / previousClose) * 100,
            series,
        });
    }
    return companies;
}

const INDEX_NAMES = [
    ["^LC500", "Large Cap 500", 6120],
    ["^IND30", "Industrials 30", 44210],
    ["^TECH", "Tech Composite", 19870],
    ["^SC2K", "Small Cap 2000", 2410],
    ["^VOLX", "Volatility Index", 16.4],
    ["CL=F", "Crude Oil", 71.2],
    ["GC=F", "Gold", 2650],
    ["^TNY", "10-Yr Bond", 4.31],
    ["EURUSD=X", "EUR/USD", 1.083],
    ["BTC-USD", "Bitcoin USD", 91250],
    ["^EU600", "Europe 600", 512.4],
    ["^AS225", "Asia 225", 38950],
];

function buildIndices() {
    const random = createRandom(0x1dec5);
    return INDEX_NAMES.map(([symbol, name, level]) => {
        const series = randomWalk(random, level, POINTS_PER_SESSION, 0.004, (random() - 0.5) * 0.0006);
        const price = series[series.length - 1];
        return {
            symbol,
            name,
            previousClose: level,
            price,
            change: price - level,
            changePercent: ((price - level) / level) * 100,
            series,
        };
    });
}

const SOURCES = ["Market Desk", "Wire Service", "Daily Ledger", "Capital Brief", "Street Notes", "The Closing Bell", "Quarterly Review"];
const HEADLINE_TEMPLATES = [
    "{company} shares jump after {event}",
    "{company} slides as {event} weighs on outlook",
    "Why {company} could be the next big {theme} play",
    "{company} beats estimates, raises full-year guidance",
    "Analysts split on {company} after {event}",
    "{sector} stocks rally as investors bet on {theme}",
    "{company} to cut 4% of workforce amid {theme} push",
    "Is {company} stock a buy after {event}?",
    "{company} and {other} announce {theme} partnership",
    "Stocks drift as traders weigh {event}",
];
const EVENTS = ["a strong earnings report", "a surprise guidance cut", "a new buyback program", "an analyst upgrade", "rate-cut hopes", "a product recall", "record quarterly revenue", "a CEO shake-up", "an antitrust probe", "the latest jobs data"];
const THEMES = ["AI", "clean energy", "cloud", "streaming", "biotech", "dividend", "infrastructure", "chip", "consumer"];
const SUMMARY_SENTENCES = [
    "The move extends a run that has seen the stock outperform the broader market this quarter.",
    "Management said demand remained resilient despite a softer macro backdrop.",
    "Investors are watching margins closely after two quarters of rising costs.",
    "Several brokerages adjusted their price targets following the announcement.",
    "Trading volume was well above the three-month average.",
    "The company reiterated its long-term targets during the call with analysts.",
    "Options activity pointed to elevated expectations for further volatility.",
    "Peers in the same industry moved in sympathy during the session.",
];

function buildStories(companies) {
    const random = createRandom(0x2ea75);
    const stories = [];
    for (let i = 0; i < 48; i++) {
        const company = pick(random, companies);
        const other = pick(random, companies);
        const title = pick(random, HEADLINE_TEMPLATES)
            .replace("{company}", company.name.split(" ").slice(0, 2).join(" "))
            .replace("{other}", other.name.split(" ")[0])
            .replace("{event}", pick(random, EVENTS))
            .replace("{theme}", pick(random, THEMES))
            .replace("{sector}", company.sector);
        const tickerCount = 1 + Math.floor(random() * 3);
        const tickers = [company.symbol];
        while (tickers.length < tickerCount)
            tickers.push(pick(random, companies).symbol);
        const sentenceCount = 2 + Math.floor(random() * 2);
        const summary = [];
        while (summary.length < sentenceCount) {
            const sentence = pick(random, SUMMARY_SENTENCES);
            if (!summary.includes(sentence))
                summary.push(sentence);
        }
        stories.push({
            id: `story-${i}`,
            title,
            summary: summary.join(" "),
            source: pick(random, SOURCES),
            publishedAt: NOW - Math.floor(5 + random() * 60 * 36) * 60000,
            tickers: [...new Set(tickers)],
            hue: Math.floor(random() * 360),
            premium: random() < 0.12,
            video: random() < 0.15,
        });
    }
    stories.sort((a, b) => b.publishedAt - a.publishedAt);
    return stories;
}

export const companies = buildCompanies();
export const indices = buildIndices();
export const stories = buildStories(companies);

const SCREENER_SIZE = 150;

export const SCREENERS = [
    { id: "trending", label: "Trending", rank: (q) => -q.interest },
    { id: "most-active", label: "Most Active", rank: (q) => -q.volume },
    { id: "gainers", label: "Top Gainers", rank: (q) => -q.changePercent },
    { id: "losers", label: "Top Losers", rank: (q) => q.changePercent },
    { id: "52-week-gainers", label: "52 Week Gainers", rank: (q) => -q.fiftyTwoWeekChangePercent },
    { id: "large-cap", label: "Large Cap", rank: (q) => -q.marketCap },
];

export function screenerResults(id) {
    const screener = SCREENERS.find((s) => s.id === id);
    return [...companies].sort((a, b) => screener.rank(a) - screener.rank(b)).slice(0, SCREENER_SIZE);
}
