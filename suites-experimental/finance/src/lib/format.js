const price = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero" });
const percent = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero" });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
const relative = new Intl.RelativeTimeFormat("en-US", { numeric: "auto", style: "narrow" });

export function formatPrice(value) {
    return price.format(value);
}

export function formatChange(value) {
    return signed.format(value);
}

export function formatPercent(value) {
    return percent.format(value / 100);
}

export function formatCompact(value) {
    return value === null ? "--" : compact.format(value);
}

export function formatRatio(value) {
    return value === null ? "--" : price.format(value);
}

export function formatDate(value) {
    return date.format(value);
}

export function formatTime(value) {
    return time.format(value);
}

export function formatRelative(timestamp, now) {
    const minutes = Math.round((timestamp - now) / 60000);
    if (minutes > -60)
        return relative.format(minutes, "minute");
    const hours = Math.round(minutes / 60);
    if (hours > -24)
        return relative.format(hours, "hour");
    return relative.format(Math.round(hours / 24), "day");
}

export function trend(value) {
    if (value > 0)
        return "up";
    if (value < 0)
        return "down";
    return "flat";
}
