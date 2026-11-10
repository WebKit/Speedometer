// Procedural SVG artwork, so the workload ships no third-party images. Data URIs are
// memoized per variant, so a few dozen decodes cover the whole corpus.

const SKIES = [
    ["#fbc2a4", "#f7797d"],
    ["#a1c4fd", "#c2e9fb"],
    ["#d4fc79", "#96e6a1"],
    ["#fddb92", "#d1fdff"],
    ["#c79081", "#dfa579"],
    ["#89f7fe", "#66a6ff"],
    ["#fcb69f", "#ffecd2"],
    ["#30cfd0", "#330867"],
    ["#a8edea", "#fed6e3"],
    ["#5ee7df", "#b490ca"],
];

const GROUNDS = ["#2f4858", "#33658a", "#55505c", "#3d5a40", "#6b4e3d", "#264653", "#4a4e69", "#386641"];

const SCENES = 5;

function scene(variant, w, h, ground) {
    switch (variant) {
        case 0:
            return `<circle cx="${w * 0.72}" cy="${h * 0.3}" r="${h * 0.12}" fill="#fff8e7" opacity=".9"/><path d="M0 ${h * 0.75} L${w * 0.25} ${h * 0.42} L${w * 0.45} ${h * 0.66} L${w * 0.68} ${h * 0.35} L${w} ${
                h * 0.7
            } V${h} H0Z" fill="${ground}"/><path d="M0 ${h * 0.86} Q${w * 0.5} ${h * 0.74} ${w} ${h * 0.88} V${h} H0Z" fill="#000" opacity=".25"/>`;
        case 1:
            return `<path d="M0 ${h * 0.62} Q${w * 0.25} ${h * 0.56} ${w * 0.5} ${h * 0.62} T${w} ${h * 0.62} V${h} H0Z" fill="${ground}" opacity=".85"/><path d="M0 ${h * 0.74} Q${w * 0.25} ${h * 0.68} ${w * 0.5} ${h * 0.74} T${w} ${
                h * 0.74
            } V${h} H0Z" fill="${ground}"/><circle cx="${w * 0.24}" cy="${h * 0.28}" r="${h * 0.09}" fill="#fff" opacity=".8"/>`;
        case 2: {
            let towers = "";
            for (let i = 0; i < 9; i++) {
                const tw = w / 9;
                const th = h * (0.25 + ((i * 37) % 40) / 100);
                towers += `<rect x="${i * tw}" y="${h - th}" width="${tw - 2}" height="${th}" fill="${ground}" opacity="${0.75 + (i % 3) * 0.1}"/>`;
            }
            return towers;
        }
        case 3:
            return `<rect x="0" y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="${ground}"/><path d="M${w * 0.2} ${h * 0.7} L${w * 0.3} ${h * 0.3} L${w * 0.4} ${h * 0.7}Z" fill="#1b4332"/><path d="M${w * 0.55} ${h * 0.7} L${w * 0.68} ${
                h * 0.2
            } L${w * 0.81} ${h * 0.7}Z" fill="#2d6a4f"/><circle cx="${w * 0.86}" cy="${h * 0.22}" r="${h * 0.07}" fill="#fff" opacity=".7"/>`;
        default:
            return `<circle cx="${w * 0.5}" cy="${h * 0.55}" r="${h * 0.3}" fill="${ground}" opacity=".85"/><circle cx="${w * 0.5}" cy="${h * 0.55}" r="${h * 0.18}" fill="#fff" opacity=".35"/><rect x="${w * 0.1}" y="${h * 0.82}" width="${
                w * 0.8
            }" height="${h * 0.06}" rx="${h * 0.03}" fill="#000" opacity=".2"/>`;
    }
}

const photoCache = new Map();

export function photo(seed, width, height) {
    const sky = seed % SKIES.length;
    const variant = (seed >>> 4) % SCENES;
    const ground = GROUNDS[(seed >>> 8) % GROUNDS.length];
    const key = `${sky}-${variant}-${ground}-${width}x${height}`;
    let src = photoCache.get(key);
    if (src)
        return src;
    const [from, to] = SKIES[sky];
    const id = `s${sky}${variant}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#${id})"/>${scene(
        variant,
        width,
        height,
        ground
    )}</svg>`;
    src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    photoCache.set(key, src);
    return src;
}

const AVATAR_BACKGROUNDS = ["#e76f51", "#2a9d8f", "#e9c46a", "#264653", "#8ab17d", "#b56576", "#6d597a", "#457b9d", "#f4a261", "#3d405b", "#81b29a", "#e07a5f"];
const SKIN = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac", "#a0522d"];
const HAIR = ["#2b2118", "#5a3825", "#b7950b", "#1c1c1c", "#8e4b32", "#d6d6d6"];

const avatarCache = new Map();

export function avatar(seed) {
    const key = seed % 144;
    let src = avatarCache.get(key);
    if (src)
        return src;
    const bg = AVATAR_BACKGROUNDS[key % AVATAR_BACKGROUNDS.length];
    const skin = SKIN[(key >>> 1) % SKIN.length];
    const hair = HAIR[(key >>> 2) % HAIR.length];
    const longHair = key % 3 === 0;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="${bg}"/>${
        longHair ? `<rect x="20" y="22" width="40" height="40" rx="18" fill="${hair}"/>` : ""
    }<circle cx="40" cy="34" r="15" fill="${skin}"/><path d="M25 30 Q40 12 55 30 Q52 20 40 18 Q28 20 25 30Z" fill="${hair}"/><path d="M12 80 Q14 56 40 54 Q66 56 68 80Z" fill="#fff" opacity=".85"/></svg>`;
    src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    avatarCache.set(key, src);
    return src;
}
