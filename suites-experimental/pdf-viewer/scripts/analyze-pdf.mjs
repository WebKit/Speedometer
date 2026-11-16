// Dev tool. Loads public/document.pdf with pdfjs-dist in Node and reports what the
// fixture asks the renderer to do, to check a change to generate-pdf.mjs did what it
// was meant to. Exits non-zero on a filter outside pdf.js' free tier.
//
// Stream filters, shading and pattern types and the embedded font programs are not
// reachable through pdf.js' public API, so those come from a scan of the raw bytes.

import fs from "node:fs";
import path from "node:path";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const DOCUMENT = path.join(ROOT, "public", "document.pdf");

const FREE_TIER_FILTERS = new Set(["FlateDecode", "DCTDecode", "ASCII85Decode", "ASCIIHexDecode", "LZWDecode", "RunLengthDecode", "Crypt"]);
const SHADING_TYPES = { 1: "function", 2: "axial", 3: "radial", 4: "free-form mesh", 5: "lattice mesh", 6: "coons patch", 7: "tensor patch" };
const PATTERN_TYPES = { 1: "tiling", 2: "shading" };
const FONT_FILE_KEYS = { FontFile: "Type 1", FontFile2: "TrueType", FontFile3: "CFF" };

function tally(source, pattern, transform = (value) => value) {
    const counts = new Map();
    for (const match of source.matchAll(pattern)) {
        const key = transform(match[1]);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
}

function formatTally(counts, empty = "none") {
    if (counts.size === 0)
        return empty;
    return [...counts]
        .sort(([a], [b]) => String(a).localeCompare(String(b)))
        .map(([key, count]) => `${key} x${count}`)
        .join(", ");
}

function scanRawBytes(bytes) {
    const text = Buffer.from(bytes).toString("latin1");

    const filters = new Map();
    for (const match of text.matchAll(/\/Filter\s*(\/[A-Za-z0-9]+|\[[^\]]*\])/g)) {
        for (const name of match[1].match(/[A-Za-z0-9]+/g) ?? [])
            filters.set(name, (filters.get(name) ?? 0) + 1);
    }

    const fonts = new Map();
    for (const match of text.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+\-_]+)/g))
        fonts.set(match[1], /^[A-Z]{6}\+/.test(match[1]));

    const embedded = new Map();
    for (const [key, label] of Object.entries(FONT_FILE_KEYS)) {
        const count = text.split(`/${key} `).length - 1;
        if (count)
            embedded.set(label, count);
    }

    return {
        filters,
        fonts,
        embedded,
        shadings: tally(text, /\/ShadingType\s+(\d+)/g, (value) => SHADING_TYPES[value] ?? `type ${value}`),
        patterns: tally(text, /\/PatternType\s+(\d+)/g, (value) => PATTERN_TYPES[value] ?? `type ${value}`),
        imageSMasks: (text.match(/\/SMask\s+\d+\s+\d+\s+R/g) ?? []).length,
        luminositySMasks: (text.match(/\/S\s*\/Luminosity/g) ?? []).length,
        blendModes: tally(text, /\/BM\s*\/([A-Za-z]+)/g),
        transparencyGroups: (text.match(/\/S\s*\/Transparency/g) ?? []).length,
    };
}

async function analyzePage(page) {
    const operatorList = await page.getOperatorList();
    const viewport = page.getViewport({ scale: 1 });
    const annotations = await page.getAnnotations();
    const { styles } = await page.getTextContent();

    let images = 0;
    let clips = 0;
    let dashes = 0;
    const blendModes = new Set();
    const fonts = new Set();

    for (let i = 0; i < operatorList.fnArray.length; i++) {
        const args = operatorList.argsArray[i];
        switch (operatorList.fnArray[i]) {
            case pdfjs.OPS.paintImageXObject:
            case pdfjs.OPS.paintInlineImageXObject:
            case pdfjs.OPS.paintImageMaskXObject:
                images++;
                break;
            case pdfjs.OPS.clip:
            case pdfjs.OPS.eoClip:
                clips++;
                break;
            case pdfjs.OPS.setFont:
                fonts.add(args[0]);
                break;
            case pdfjs.OPS.setDash:
                if (args[0]?.length)
                    dashes++;
                break;
            case pdfjs.OPS.setGState:
                for (const [key, value] of args[0] ?? []) {
                    if (key === "BM" && value)
                        blendModes.add(typeof value === "string" ? value : value?.name ?? "unknown");
                }

                break;
            default:
                break;
        }
    }

    return {
        size: `${Math.round(viewport.width)}x${Math.round(viewport.height)}`,
        ops: operatorList.fnArray.length,
        images,
        clips,
        dashes,
        fonts,
        blendModes,
        annotations,
        styleNames: Object.keys(styles),
    };
}

async function main() {
    if (!fs.existsSync(DOCUMENT))
        throw new Error(`${path.relative(ROOT, DOCUMENT)} is missing. Run "npm run generate:pdf" first.`);

    const bytes = fs.readFileSync(DOCUMENT);
    const raw = scanRawBytes(bytes);
    // getDocument transfers the buffer to the worker, so hand it a copy.
    const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), verbosity: pdfjs.VerbosityLevel.ERRORS }).promise;

    const pages = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++)
        pages.push(await analyzePage(await doc.getPage(pageNumber)));

    const outline = await doc.getOutline();
    const destinations = await doc.getDestinations();
    const metadata = await doc.getMetadata();
    const structureTree = await (await doc.getPage(3)).getStructTree();

    let resolvedLinks = 0;
    let brokenLinks = 0;
    for (const page of pages) {
        for (const annotation of page.annotations) {
            if (annotation.subtype !== "Link")
                continue;
            const dest = typeof annotation.dest === "string" ? await doc.getDestination(annotation.dest) : annotation.dest;
            if (dest)
                resolvedLinks++;
            else
                brokenLinks++;
        }
    }

    const outlineLeaves = (outline ?? []).reduce((total, item) => total + 1 + (item.items?.length ?? 0), 0);
    const offTier = [...raw.filters.keys()].filter((name) => !FREE_TIER_FILTERS.has(name));
    const ops = pages.map((page) => page.ops).sort((a, b) => a - b);
    const allBlendModes = new Set(pages.flatMap((page) => [...page.blendModes]));
    const allStyles = new Set(pages.flatMap((page) => page.styleNames));
    const totals = (key) => pages.reduce((sum, page) => sum + page[key], 0);

    console.log(`document       ${path.relative(ROOT, DOCUMENT)} (${(bytes.length / 1024).toFixed(0)} KB)`);
    console.log(`pages          ${doc.numPages}, all ${pages[0].size} pt`);
    console.log(`info           ${metadata.info.Title} / created ${metadata.info.CreationDate} / ${metadata.info.Producer}`);
    console.log(`tagged         ${structureTree ? `yes (page 3 root: ${structureTree.role})` : "no"}`);
    console.log("");
    console.log(`font programs  ${formatTally(raw.embedded)}`);
    for (const [name, isSubset] of raw.fonts)
        console.log(`               ${name}${isSubset ? " [subset]" : " [NOT SUBSET]"}`);
    console.log(`pdf.js styles  ${[...allStyles].sort().join(", ")}`);
    console.log("");
    console.log(`filters        ${formatTally(raw.filters)}`);
    console.log(`off free tier  ${offTier.length ? offTier.join(", ") : "none"}`);
    console.log(`shadings       ${formatTally(raw.shadings)}`);
    console.log(`patterns       ${formatTally(raw.patterns)}`);
    console.log(`soft masks     ${raw.imageSMasks} image SMask, ${raw.luminositySMasks} luminosity, ${raw.transparencyGroups} transparency groups`);
    console.log(`blend modes    ${formatTally(raw.blendModes)} (reaching the renderer: ${[...allBlendModes].sort().join(", ") || "none"})`);
    console.log("");
    console.log(`image paints   ${totals("images")}`);
    console.log(`clips          ${totals("clips")}`);
    console.log(`dash changes   ${totals("dashes")}`);
    console.log(`annotations    ${pages.reduce((sum, page) => sum + page.annotations.length, 0)} (${resolvedLinks} links resolve, ${brokenLinks} broken)`);
    console.log(`outline        ${outline?.length ?? 0} top-level items, ${outlineLeaves} total`);
    console.log(`named dests    ${destinations instanceof Map ? destinations.size : Object.keys(destinations).length}`);
    console.log(`operators      min ${ops[0]}, median ${ops[ops.length >> 1]}, max ${ops[ops.length - 1]}`);
    console.log("");
    console.log("page   ops  images  clips  dashes  fonts  annots");
    pages.forEach((page, index) => {
        const columns = [
            String(index + 1).padStart(4),
            String(page.ops).padStart(5),
            String(page.images).padStart(7),
            String(page.clips).padStart(6),
            String(page.dashes).padStart(7),
            String(page.fonts.size).padStart(6),
            String(page.annotations.length).padStart(7),
        ];
        console.log(columns.join(" "));
    });

    if (offTier.length || brokenLinks)
        process.exitCode = 1;
}

await main();
