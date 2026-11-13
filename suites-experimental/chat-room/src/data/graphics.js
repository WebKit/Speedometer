// Procedurally generated SVG artwork, so the workload ships no third-party image
// assets. Data URIs are memoized per variant rather than per message, so a few
// dozen images cover the corpus and the browser can reuse a decode.

const SHAPE_VARIANTS = 4;

const PALETTES = [
    ["#3b82f6", "#bfdbfe"],
    ["#a855f7", "#f0d9ff"],
    ["#10b981", "#b7f5da"],
    ["#ef4444", "#ffd5d5"],
    ["#f59e0b", "#ffeab0"],
    ["#06b6d4", "#b8f2fb"],
    ["#6366f1", "#d5daff"],
    ["#84cc16", "#e3fab3"],
];

// Each variant arranges flat shapes over the gradient differently, so thumbnails
// read as distinct pictures without any of them being a photo.
function shapesFor(variant, width, height) {
    const w = width;
    const h = height;
    switch (variant) {
        case 0:
            return `<circle cx="${w * 0.32}" cy="${h * 0.38}" r="${h * 0.26}" fill="#fff" opacity=".55"/><circle cx="${w * 0.66}" cy="${h * 0.64}" r="${h * 0.3}" fill="#fff" opacity=".3"/>`;
        case 1:
            return `<path d="M0 ${h} L${w * 0.45} 0 H${w * 0.72} L${w * 0.24} ${h} Z" fill="#fff" opacity=".45"/><path d="M${w * 0.55} ${h} L${w} ${h * 0.2} V${h} Z" fill="#fff" opacity=".3"/>`;
        case 2: {
            const bars = [0.35, 0.62, 0.45, 0.8, 0.55];
            return bars
                .map((value, index) => {
                    const barWidth = (w * 0.9) / bars.length - 6;
                    const x = w * 0.05 + index * ((w * 0.9) / bars.length);
                    return `<rect x="${x}" y="${h * (1 - value) - 4}" width="${barWidth}" height="${h * value}" rx="3" fill="#fff" opacity="${0.3 + index * 0.08}"/>`;
                })
                .join("");
        }
        default:
            return `<rect x="${w * 0.12}" y="${h * 0.18}" width="${w * 0.5}" height="${h * 0.5}" rx="8" fill="#fff" opacity=".5"/><rect x="${w * 0.42}" y="${h * 0.4}" width="${w * 0.46}" height="${h * 0.46}" rx="8" fill="#fff" opacity=".33"/>`;
    }
}

const cache = new Map();

export function generatedImage(paletteIndex, variant, width, height) {
    // Callers pass raw hashes. Reduce them before they reach the cache key or the
    // gradient id, or every message gets a distinct id and its own decode.
    const palette = paletteIndex % PALETTES.length;
    const shape = variant % SHAPE_VARIANTS;

    const key = `${palette}-${shape}-${width}x${height}`;
    const cached = cache.get(key);
    if (cached)
        return cached;

    const [from, to] = PALETTES[palette];
    const gradientId = `g${palette}${shape}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#${gradientId})"/>${shapesFor(
        shape,
        width,
        height
    )}</svg>`;
    const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    cache.set(key, src);
    return src;
}
