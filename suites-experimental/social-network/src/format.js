import { NOW } from "./data/server.js";

const shortDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const plural = new Intl.PluralRules("en-US");

export function relativeTime(seconds) {
    const delta = NOW - seconds;
    if (delta < 60)
        return "Just now";
    if (delta < 3600)
        return `${Math.floor(delta / 60)}m`;
    if (delta < 86400)
        return `${Math.floor(delta / 3600)}h`;
    if (delta < 86400 * 7)
        return `${Math.floor(delta / 86400)}d`;
    return shortDate.format(new Date(seconds * 1000));
}

export function absoluteTime(seconds) {
    return fullDate.format(new Date(seconds * 1000));
}

export function compactNumber(value) {
    return compact.format(value);
}

export function countLabel(count, singular, pluralForm) {
    return `${compactNumber(count)} ${plural.select(count) === "one" ? singular : pluralForm}`;
}
