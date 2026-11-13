// Builds public/document.pdf, the fixture the PDFViewer-PDFjs workload renders. See
// the README for what it covers and why.
//
// The output has to be byte-identical between builds so the committed dist/ does not
// churn, which is why every date in the info dict is pinned - PDFKit derives the file
// /ID from that dict, and CreationDate otherwise defaults to `new Date()`.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import PDFDocument from "pdfkit";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT = path.join(ROOT, "public", "document.pdf");

const PAGE = { width: 612, height: 792 };
const MARGIN = 54;
const CONTENT = { left: MARGIN, top: MARGIN, right: PAGE.width - MARGIN, bottom: PAGE.height - MARGIN };
const CONTENT_WIDTH = CONTENT.right - CONTENT.left;

const PAGE_COUNT = 24;
const TITLE = "Planetary Observation Review";
const SUBTITLE = "Instrument baselines, thermal basin transects and launch window logistics";

const INK = "#1b1f24";
const MUTED = "#5c6673";
const HAIRLINE = "#c9d1d9";
const ACCENT = "#0b6e8a";
const ACCENT_WARM = "#c2570b";
const PAPER_TINT = "#f2f5f7";

// Two fontkit subsetting constraints, both of which throw "Offset is outside the
// bounds of the DataView" if broken: use .woff and not the .woff2 alongside it, whose
// glyf transform fontkit mis-reconstructs for composite glyphs, and use a mono face
// without coding ligatures - the ligature glyphs a face like JetBrains Mono
// substitutes for "=>" or "++" fail the same way.
const FONT_FILES = {
    Body: "@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff",
    Heading: "@fontsource/inter/files/inter-latin-700-normal.woff",
    Mono: "@fontsource/source-code-pro/files/source-code-pro-latin-400-normal.woff",
};

const PHOTOS = {
    earth: { file: "earth-apollo17.jpg", alt: "The full disc of the Earth photographed from Apollo 17." },
    earthrise: { file: "earthrise-apollo8.jpg", alt: "The Earth rising above the lunar horizon, photographed from Apollo 8." },
    launch: { file: "apollo11-launch.jpg", alt: "A Saturn V lifting off, with the exhaust plume filling the lower frame." },
    spring: { file: "grand-prismatic-spring.jpg", alt: "An aerial view of a hot spring, ringed by orange microbial mats." },
};

const CHAPTERS = [
    { title: "Instrument Overview", topic: "detector response" },
    { title: "Calibration and Baselines", topic: "baseline drift" },
    { title: "Atmospheric Sampling", topic: "aerosol loading" },
    { title: "Thermal Basin Survey", topic: "basin discharge" },
    { title: "Launch Window Logistics", topic: "ascent corridors" },
    { title: "Appendix: Data Tables", topic: "tabulated residuals" },
];

const MOTIF = ["text", "photo", "chart", "mixed"];
const MOTIF_TITLES = {
    text: "Summary",
    photo: "Plates",
    chart: "Measurements",
    mixed: "Tabulated Results",
};

const WORDS = [
    "aerosol",
    "albedo",
    "altitude",
    "ambient",
    "analysis",
    "aperture",
    "apogee",
    "array",
    "ascent",
    "atmosphere",
    "azimuth",
    "baseline",
    "basin",
    "bearing",
    "calibration",
    "caldera",
    "canopy",
    "cascade",
    "channel",
    "climate",
    "cluster",
    "composite",
    "conduit",
    "contour",
    "corridor",
    "coverage",
    "crater",
    "current",
    "declination",
    "density",
    "deposit",
    "detector",
    "diameter",
    "diffuse",
    "dispersion",
    "drift",
    "dynamics",
    "eclipse",
    "elevation",
    "emission",
    "ensemble",
    "envelope",
    "epoch",
    "equator",
    "erosion",
    "estimate",
    "exposure",
    "feature",
    "filament",
    "fissure",
    "flux",
    "forecast",
    "fraction",
    "fumarole",
    "gradient",
    "granular",
    "gravity",
    "harmonic",
    "horizon",
    "humidity",
    "incident",
    "inclination",
    "injection",
    "inlet",
    "integral",
    "interval",
    "inversion",
    "isotope",
    "kernel",
    "lattice",
    "layer",
    "lidar",
    "limb",
    "magnitude",
    "mantle",
    "margin",
    "matrix",
    "meridian",
    "mesa",
    "mineral",
    "moisture",
    "momentum",
    "monitor",
    "nadir",
    "nominal",
    "observation",
    "occultation",
    "opacity",
    "orbit",
    "outcrop",
    "parallax",
    "parameter",
    "payload",
    "penumbra",
    "perigee",
    "phase",
    "plateau",
    "plume",
    "polarity",
    "porosity",
    "precision",
    "pressure",
    "profile",
    "projection",
    "quadrant",
    "radiance",
    "radius",
    "reflectance",
    "refraction",
    "regolith",
    "residual",
    "resolution",
    "response",
    "ridge",
    "runoff",
    "salinity",
    "sample",
    "saturation",
    "scatter",
    "sediment",
    "segment",
    "sequence",
    "series",
    "shear",
    "signature",
    "silica",
    "sinter",
    "solstice",
    "spectrum",
    "stability",
    "stratum",
    "subsurface",
    "survey",
    "swath",
    "telemetry",
    "terrace",
    "texture",
    "thermal",
    "threshold",
    "tolerance",
    "topography",
    "trajectory",
    "transect",
    "transit",
    "travertine",
    "turbulence",
    "umbra",
    "uniform",
    "validation",
    "variance",
    "vector",
    "velocity",
    "vent",
    "viscosity",
    "visibility",
    "volume",
    "vortex",
    "wavelength",
    "window",
    "zenith",
];

const CITED = ["Bénard", "Kármán", "Poincaré", "Ångström", "Röntgen", "Møller", "Chandrasekhar", "Prandtl", "Coriolis", "Rayleigh"];

const CODE_LINES = [
    "export function residual(track, model) {",
    "    const window = track.samples.slice(-96);",
    "    const predicted = model.evaluate(window.map((s) => s.epoch));",
    "    let sum = 0;",
    "    for (let i = 0; i < window.length; i++)",
    "        sum += (window[i].radiance - predicted[i]) ** 2;",
    "    return Math.sqrt(sum / window.length);",
    "}",
];

// Seeded, so the body copy and every chart datum are identical on every build.
function createRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function pick(random, list) {
    return list[Math.floor(random() * list.length)];
}

function sentence(random, words = 14) {
    const parts = [];
    for (let i = 0; i < words; i++)
        parts.push(pick(random, WORDS));
    if (words > 9)
        parts.splice(Math.floor(words / 2), 0, `${pick(random, WORDS)},`);
    const text = parts.join(" ");
    return `${text[0].toUpperCase()}${text.slice(1)}.`;
}

function paragraph(random, sentences = 5) {
    const parts = [];
    for (let i = 0; i < sentences; i++)
        parts.push(sentence(random, 9 + Math.floor(random() * 10)));
    return parts.join(" ");
}

const CRC_TABLE = (() => {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++)
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
    }
    return table;
})();

function crc32(buffer) {
    let c = -1;
    for (const byte of buffer)
        c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
}

function pngChunk(type, data) {
    const chunk = Buffer.alloc(data.length + 12);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4, "ascii");
    data.copy(chunk, 8);
    chunk.writeUInt32BE(crc32(chunk.subarray(4, 8 + data.length)), 8 + data.length);
    return chunk;
}

// Minimal RGBA PNG encoder, so the one image with an alpha channel - which is how
// PDFKit is made to emit an /SMask - does not have to be a committed asset.
function encodePng(width, height, rgba) {
    const stride = width * 4;
    const raw = Buffer.alloc((stride + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (stride + 1)] = 0;
        rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8;
    header[9] = 6;
    return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), pngChunk("IHDR", header), pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })), pngChunk("IEND", Buffer.alloc(0))]);
}

// Alpha varies per pixel, so the SMask is a real image decode rather than a flat mask
// pdf.js could shortcut.
function buildSealOverlay(size = 512) {
    const rgba = Buffer.alloc(size * size * 4);
    const center = (size - 1) / 2;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = (x - center) / center;
            const dy = (y - center) / center;
            const radius = Math.hypot(dx, dy);
            const outerRing = Math.abs(radius - 0.94) < 0.018 ? 0.9 : 0;
            const innerRing = Math.abs(radius - 0.82) < 0.01 ? 0.7 : 0;
            const hatch = (x + y) % 26 < 3 ? 0.42 * Math.max(0, 1 - radius) : 0;
            const glow = Math.max(0, 0.62 - radius) * 1.1;
            const alpha = radius > 0.96 ? 0 : Math.min(1, Math.max(outerRing, innerRing, hatch, glow));
            const offset = (y * size + x) * 4;
            rgba[offset] = 252;
            rgba[offset + 1] = 250;
            rgba[offset + 2] = 244;
            rgba[offset + 3] = Math.round(alpha * 255);
        }
    }
    return encodePng(size, size, rgba);
}

// PDFKit exposes fill and stroke opacity but no blend mode, so reach into the page's
// ExtGState directly.
function setBlendMode(doc, mode) {
    doc._blendModes ??= new Map();
    if (!doc._blendModes.has(mode)) {
        const gstate = doc.ref({ Type: "ExtGState", BM: mode });
        gstate.end();
        doc._blendModes.set(mode, gstate);
    }
    doc.page.ext_gstates[`Bm${mode}`] = doc._blendModes.get(mode);
    doc.addContent(`/Bm${mode} gs`);
}

function appendArc(doc, cx, cy, r, from, to, move) {
    const steps = Math.max(1, Math.ceil(Math.abs(to - from) / (Math.PI / 2)));
    const delta = (to - from) / steps;
    const handle = (4 / 3) * Math.tan(delta / 4) * r;
    let angle = from;
    if (move)
        doc.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    for (let i = 0; i < steps; i++) {
        const next = angle + delta;
        const x0 = cx + r * Math.cos(angle);
        const y0 = cy + r * Math.sin(angle);
        const x1 = cx + r * Math.cos(next);
        const y1 = cy + r * Math.sin(next);
        doc.bezierCurveTo(x0 - handle * Math.sin(angle), y0 + handle * Math.cos(angle), x1 + handle * Math.sin(next), y1 - handle * Math.cos(next), x1, y1);
        angle = next;
    }
}

// The element has to be attached to its parent before `draw` is added, or PDFKit
// defers the closure and the drawing order stops matching the content stream.
function tagged(doc, parent, type, draw, options = {}) {
    const element = doc.struct(type, options);
    parent.add(element);
    element.add(draw);
    element.end();
    return element;
}

function chapterOf(pageIndex) {
    return CHAPTERS[Math.floor((pageIndex - 2) / MOTIF.length)];
}

function motifOf(pageIndex) {
    return MOTIF[(pageIndex - 2) % MOTIF.length];
}

function pageTitle(pageIndex) {
    return `${chapterOf(pageIndex).title} — ${MOTIF_TITLES[motifOf(pageIndex)]}`;
}

// Zero-padded because PDFKit sorts its name tree with localeCompare while the PDF
// spec wants byte order, and readers binary-search the tree. Fixed-width lowercase
// ASCII keys are the one case where the two orderings agree.
function destinationOf(pageIndex) {
    return `page-${String(pageIndex + 1).padStart(2, "0")}`;
}

function drawRunningHead(doc, pageIndex) {
    // The footer sits below the bottom margin, and PDFKit starts a new page for any
    // text that does. Drop the margin for the duration.
    const bottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.markContent("Artifact");
    doc.font("Heading")
        .fontSize(7.5)
        .fillColor(MUTED)
        .text(chapterOf(pageIndex).title.toUpperCase(), CONTENT.left, 34, { width: CONTENT_WIDTH * 0.7, lineBreak: false });
    doc.font("Mono")
        .fontSize(7.5)
        .text(`${pageIndex + 1} / ${PAGE_COUNT}`, CONTENT.left, 34, { width: CONTENT_WIDTH, align: "right", lineBreak: false });
    doc.moveTo(CONTENT.left, 48).lineTo(CONTENT.right, 48).lineWidth(0.5).stroke(HAIRLINE);
    doc.moveTo(CONTENT.left, CONTENT.bottom + 12)
        .lineTo(CONTENT.right, CONTENT.bottom + 12)
        .lineWidth(0.5)
        .stroke(HAIRLINE);
    doc.font("Body")
        .fontSize(8)
        .fillColor(MUTED)
        .text(TITLE, CONTENT.left, CONTENT.bottom + 20, { width: CONTENT_WIDTH, lineBreak: false });
    doc.endMarkedContent();
    doc.page.margins.bottom = bottomMargin;
}

function drawPageHeading(doc, section, pageIndex) {
    const chapter = chapterOf(pageIndex);
    tagged(doc, section, "H2", () => {
        doc.font("Mono")
            .fontSize(8)
            .fillColor(ACCENT)
            .text(`SECTION ${CHAPTERS.indexOf(chapter) + 1}.${((pageIndex - 2) % MOTIF.length) + 1}`, CONTENT.left, 62, { characterSpacing: 1.4, lineBreak: false });
        doc.font("Heading")
            .fontSize(17)
            .fillColor(INK)
            .text(pageTitle(pageIndex), CONTENT.left, 76, { width: CONTENT_WIDTH * 0.86 });
    });
    doc.moveTo(CONTENT.left, 108)
        .lineTo(CONTENT.left + 64, 108)
        .lineWidth(2)
        .stroke(ACCENT_WARM);
}

function drawFrontPage(doc, images, random) {
    const section = doc.struct("Sect");
    doc.addStructure(section);

    const mastheadHeight = 210;
    const photo = images.spring;
    const scale = Math.max(PAGE.width / photo.width, mastheadHeight / photo.height);

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.save().rect(0, 0, PAGE.width, mastheadHeight).clip();
            doc.image(photo, (PAGE.width - photo.width * scale) / 2, (mastheadHeight - photo.height * scale) / 2, { width: photo.width * scale });
            doc.restore();
        },
        { alt: PHOTOS.spring.alt }
    );

    const scrim = doc.linearGradient(0, 0, 0, mastheadHeight);
    scrim.stop(0, "#04070c", 0.15).stop(0.5, "#04070c", 0.62).stop(1, "#04070c", 0.92);
    doc.rect(0, 0, PAGE.width, mastheadHeight).fill(scrim);

    tagged(doc, section, "H1", () => {
        doc.font("Mono").fontSize(8.5).fillColor("#8fd0e4").text("OBSERVING SYSTEMS DIVISION — VOLUME 24", MARGIN, 108, { characterSpacing: 1.6, lineBreak: false });
        doc.font("Heading").fontSize(30).fillColor("#f7fafc").text(TITLE, MARGIN, 124, { width: CONTENT_WIDTH, lineGap: -3 });
    });
    tagged(doc, section, "P", () => {
        doc.font("Body").fontSize(11).fillColor("#d3dce4").text(SUBTITLE, MARGIN, 172, { width: 400 });
    });

    tagged(doc, section, "H2", () => {
        doc.font("Mono").fontSize(8).fillColor(ACCENT).text("SUMMARY OF FINDINGS", CONTENT.left, 232, { characterSpacing: 1.4, lineBreak: false });
    });
    doc.moveTo(CONTENT.left, 246).lineTo(CONTENT.right, 246).lineWidth(0.75).stroke(HAIRLINE);

    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(10)
            .fillColor(INK)
            .text(`${paragraph(random, 4)} ${paragraph(random, 3)}`, CONTENT.left, 258, { width: CONTENT_WIDTH, align: "justify", columns: 2, columnGap: 22, height: 96, ellipsis: true });
    });

    tagged(doc, section, "H2", () => {
        doc.font("Heading").fontSize(9).fillColor(INK).text("Key figures by transect", CONTENT.left, 372, { lineBreak: false });
    });
    const tableBottom = drawTable(doc, section, 388, random, { rows: 6 });

    const halfWidth = (CONTENT_WIDTH - 24) / 2;
    const figureTop = tableBottom + 26;
    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading").fontSize(9).fillColor(INK).text("Channel throughput", CONTENT.left, figureTop, { lineBreak: false });
            drawBarChart(doc, CONTENT.left, figureTop + 16, halfWidth, 96, random);
        },
        { alt: "A bar chart of channel throughput, bars filled with a vertical gradient." }
    );

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading")
                .fontSize(9)
                .fillColor(INK)
                .text("Reference plate", CONTENT.left + halfWidth + 24, figureTop, { lineBreak: false });
            const plateX = CONTENT.left + halfWidth + 24;
            const plateY = figureTop + 16;
            const plateHeight = 108;
            const cover = Math.max(halfWidth / images.earth.width, plateHeight / images.earth.height);
            doc.save().rect(plateX, plateY, halfWidth, plateHeight).clip();
            doc.image(images.earth, plateX + (halfWidth - images.earth.width * cover) / 2, plateY + (plateHeight - images.earth.height * cover) / 2, { width: images.earth.width * cover });
            doc.restore();
        },
        { alt: PHOTOS.earth.alt }
    );

    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(9.5)
            .fillColor(MUTED)
            .text(`Figure 1 — ${sentence(random, 9)}`, CONTENT.left, figureTop + 130, { width: CONTENT_WIDTH });
    });

    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(10)
            .fillColor(INK)
            .text(paragraph(random, 3), CONTENT.left, figureTop + 154, { width: CONTENT_WIDTH, align: "justify", height: 712 - figureTop - 154, ellipsis: true });
    });

    const band = doc.pattern([0, 0, 8, 8], 8, 8, "0 0 8 1.6 re f");
    doc.rect(CONTENT.left, 722, CONTENT_WIDTH, 8).fill([band, ACCENT]);
    section.end();
}

function drawTableOfContents(doc, images, random) {
    const section = doc.struct("Sect");
    doc.addStructure(section);

    const listWidth = 300;
    const listRight = CONTENT.left + listWidth;
    const asideLeft = listRight + 24;
    const asideWidth = CONTENT.right - asideLeft;

    tagged(doc, section, "H1", () => {
        doc.font("Heading").fontSize(24).fillColor(INK).text("Contents", CONTENT.left, 84, { lineBreak: false });
    });
    doc.moveTo(CONTENT.left, 120).lineTo(CONTENT.right, 120).lineWidth(1).stroke(HAIRLINE);

    const list = doc.struct("L");
    section.add(list);

    let y = 138;
    let lastChapter = null;
    for (let pageIndex = 2; pageIndex < PAGE_COUNT; pageIndex++) {
        const chapter = chapterOf(pageIndex);
        if (chapter !== lastChapter) {
            lastChapter = chapter;
            const item = doc.struct("LI");
            list.add(item);
            tagged(doc, item, "Lbl", () => {
                doc.font("Heading").fontSize(9.5).fillColor(ACCENT).text(chapter.title.toUpperCase(), CONTENT.left, y, { width: listWidth, characterSpacing: 0.5, lineBreak: false });
            });
            item.end();
            y += 18;
        }

        const label = MOTIF_TITLES[motifOf(pageIndex)];
        const number = String(pageIndex + 1);
        doc.font("Body").fontSize(11);
        const labelWidth = doc.widthOfString(label);
        const numberWidth = doc.widthOfString(number);

        const item = doc.struct("LI");
        list.add(item);
        const link = doc.struct("Link");
        item.add(link);
        link.add(() => {
            doc.fillColor(INK).text(label, CONTENT.left + 18, y, { lineBreak: false });
            doc.fillColor(MUTED).text(number, listRight - numberWidth, y, { lineBreak: false });
        });
        doc.goTo(CONTENT.left + 18, y - 2, listWidth - 18, 14, destinationOf(pageIndex), { structParent: link });
        link.end();
        item.end();

        doc.save().dash(1, { space: 2.5 });
        doc.moveTo(CONTENT.left + 26 + labelWidth, y + 8)
            .lineTo(listRight - numberWidth - 6, y + 8)
            .lineWidth(0.5)
            .stroke(HAIRLINE);
        doc.restore();
        y += 20;
    }
    list.end();

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading").fontSize(9).fillColor(INK).text("Budget by subsystem", asideLeft, 138, { lineBreak: false });
            drawDonutChart(doc, asideLeft + asideWidth / 2, 220, 58, 30, random);
        },
        { alt: "A donut chart of the instrument budget, split across five subsystems." }
    );

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading").fontSize(9).fillColor(INK).text("Launch record", asideLeft, 300, { lineBreak: false });
            doc.image(images.launch, asideLeft, 316, { fit: [asideWidth, 132], align: "center", valign: "center" });
        },
        { alt: PHOTOS.launch.alt }
    );

    tagged(doc, section, "P", () => {
        doc.font("Body").fontSize(8.5).fillColor(MUTED).text(sentence(random, 10), asideLeft, 456, { width: asideWidth });
    });

    doc.rect(asideLeft, 500, asideWidth, 92).fill(PAPER_TINT);
    tagged(doc, section, "P", () => {
        doc.font("Mono").fontSize(7.5).fillColor(INK);
        ["transects", "samples", "epochs", "residual"].forEach((label, index) => {
            doc.text(label.toUpperCase(), asideLeft + 10, 510 + index * 20, { lineBreak: false });
            doc.text((10 + random() * 900).toFixed(1), asideLeft + 10, 510 + index * 20, { width: asideWidth - 20, align: "right", lineBreak: false });
        });
    });

    section.end();
}

function drawTextPage(doc, section, pageIndex, random) {
    const chapter = chapterOf(pageIndex);
    const intro = paragraph(random, 4);
    const cap = intro[0];

    tagged(doc, section, "P", () => {
        doc.font("Body").fontSize(46).fillColor(ACCENT_WARM).text(cap, CONTENT.left, 122, { lineBreak: false });
        doc.font("Body")
            .fontSize(11.5)
            .fillColor(INK)
            .text(intro.slice(1), CONTENT.left + 40, 126, { width: CONTENT_WIDTH - 40, align: "justify", height: 62, ellipsis: false });
        doc.font("Body").fontSize(11.5).text(paragraph(random, 3), CONTENT.left, 196, { width: CONTENT_WIDTH, align: "justify" });
    });

    const quoteTop = 262;
    doc.rect(CONTENT.left, quoteTop, CONTENT_WIDTH, 76).fill(PAPER_TINT);
    doc.rect(CONTENT.left, quoteTop, 3, 76).fill(ACCENT);
    tagged(doc, section, "BlockQuote", () => {
        doc.font("Body")
            .fontSize(14)
            .fillColor(INK)
            .text(`“The ${chapter.topic} term dominates every residual we could not otherwise explain — ${pick(random, WORDS)} and ${pick(random, WORDS)} alike.”`, CONTENT.left + 22, quoteTop + 14, { width: CONTENT_WIDTH - 44, align: "left" });
        doc.font("Heading")
            .fontSize(8.5)
            .fillColor(MUTED)
            .text(`— ${pick(random, CITED)}, working note ${100 + Math.floor(random() * 800)}`, CONTENT.left + 22, quoteTop + 58, { lineBreak: false });
    });

    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(10.5)
            .fillColor(INK)
            .text(`${paragraph(random, 8)} ${paragraph(random, 8)} ${paragraph(random, 7)}`, CONTENT.left, quoteTop + 96, {
                width: CONTENT_WIDTH,
                align: "justify",
                columns: 2,
                columnGap: 22,
                height: CONTENT.bottom - quoteTop - 96,
                ellipsis: true,
            });
    });
}

function drawPhotoPage(doc, section, pageIndex, random, images) {
    const keys = ["spring", "launch", "earthrise", "earth"];
    // A different lead photo per page, so the four decodes are spread across the
    // document rather than landing in whichever prefix gets rendered.
    const primaryKey = keys[Math.floor((pageIndex - 3) / MOTIF.length) % keys.length];
    const primary = images[primaryKey];
    const cappedHeight = Math.min((CONTENT_WIDTH * primary.height) / primary.width, 250);
    const cappedWidth = (cappedHeight * primary.width) / primary.height;

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.image(primary, CONTENT.left + (CONTENT_WIDTH - cappedWidth) / 2, 124, { width: cappedWidth });
        },
        { alt: PHOTOS[primaryKey].alt }
    );

    tagged(doc, section, "Caption", () => {
        doc.font("Body")
            .fontSize(9)
            .fillColor(MUTED)
            .text(`Plate ${pageIndex + 1}.1 — ${sentence(random, 11)}`, CONTENT.left, 132 + cappedHeight, { width: CONTENT_WIDTH });
    });

    const rowTop = 170 + cappedHeight;
    const halfWidth = (CONTENT_WIDTH - 18) / 2;
    const secondaryKeys = keys.filter((key) => key !== primaryKey);
    const left = images[secondaryKeys[0]];
    const right = images[secondaryKeys[1]];
    const leftHeight = Math.min((halfWidth * left.height) / left.width, 150);
    const rightHeight = Math.min((halfWidth * right.height) / right.width, 150);

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.image(left, CONTENT.left, rowTop, { fit: [halfWidth, leftHeight], align: "center", valign: "center" });
        },
        { alt: PHOTOS[secondaryKeys[0]].alt }
    );

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.image(right, CONTENT.left + halfWidth + 18, rowTop, { fit: [halfWidth, rightHeight], align: "center", valign: "center" });
            // The seal is an RGBA PNG, so PDFKit emits it with an /SMask.
            doc.image(images.seal, CONTENT.left + halfWidth + 18 + halfWidth / 2 - 55, rowTop + rightHeight / 2 - 55, { width: 110 });
        },
        { alt: PHOTOS[secondaryKeys[1]].alt }
    );

    const captionTop = rowTop + Math.max(leftHeight, rightHeight) + 10;
    tagged(doc, section, "Caption", () => {
        doc.font("Body")
            .fontSize(9)
            .fillColor(MUTED)
            .text(`Plate ${pageIndex + 1}.2 — ${sentence(random, 8)}`, CONTENT.left, captionTop, { width: halfWidth });
        doc.font("Body")
            .fontSize(9)
            .fillColor(MUTED)
            .text(`Plate ${pageIndex + 1}.3 — ${sentence(random, 8)} Survey seal applied.`, CONTENT.left + halfWidth + 18, captionTop, { width: halfWidth });
    });

    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(10.5)
            .fillColor(INK)
            .text(`${paragraph(random, 5)} ${paragraph(random, 5)}`, CONTENT.left, captionTop + 40, { width: CONTENT_WIDTH, align: "justify", height: CONTENT.bottom - captionTop - 40, ellipsis: true });
    });
}

function drawLineChart(doc, x, y, width, height, random) {
    doc.rect(x, y, width, height).lineWidth(0.75).stroke(HAIRLINE);
    for (let i = 1; i < 4; i++) {
        const gridY = y + (height * i) / 4;
        doc.save()
            .dash(2, { space: 3 })
            .moveTo(x, gridY)
            .lineTo(x + width, gridY)
            .lineWidth(0.5)
            .stroke(HAIRLINE)
            .restore();
    }

    const dashes = [null, [4, 2], [1, 2]];
    const colors = [ACCENT, ACCENT_WARM, "#6b7f2f"];
    const points = 26;
    for (let series = 0; series < 3; series++) {
        doc.save();
        if (dashes[series])
            doc.dash(dashes[series][0], { space: dashes[series][1] });
        let value = 0.35 + series * 0.18;
        for (let i = 0; i < points; i++) {
            value = Math.min(0.95, Math.max(0.05, value + (random() - 0.5) * 0.16));
            const px = x + (width * i) / (points - 1);
            const py = y + height - value * height;
            if (i === 0)
                doc.moveTo(px, py);
            else
                doc.lineTo(px, py);
        }
        doc.lineWidth(1.25).stroke(colors[series]);
        doc.restore();
    }

    doc.font("Mono").fontSize(6.5).fillColor(MUTED);
    for (let i = 0; i <= 4; i++) {
        doc.text(String(2002 + i * 5), x + (width * i) / 4 - 10, y + height + 5, { lineBreak: false });
        doc.text(String(100 - i * 25), x - 24, y + (height * i) / 4 - 3, { width: 20, align: "right", lineBreak: false });
    }
}

function drawBarChart(doc, x, y, width, height, random) {
    const bars = 9;
    const gap = 6;
    const barWidth = (width - gap * (bars - 1)) / bars;
    for (let i = 0; i < bars; i++) {
        const value = 0.25 + random() * 0.72;
        const barHeight = value * height;
        const barX = x + i * (barWidth + gap);
        const gradient = doc.linearGradient(barX, y + height - barHeight, barX, y + height);
        gradient.stop(0, ACCENT).stop(1, "#9fd8e8");
        doc.rect(barX, y + height - barHeight, barWidth, barHeight).fill(gradient);
        doc.font("Mono")
            .fontSize(6)
            .fillColor(MUTED)
            .text(String(Math.round(value * 100)), barX, y + height + 4, { width: barWidth, align: "center", lineBreak: false });
    }
    doc.moveTo(x, y + height)
        .lineTo(x + width, y + height)
        .lineWidth(0.75)
        .stroke(HAIRLINE);
}

function drawDonutChart(doc, cx, cy, outer, inner, random) {
    const weights = [];
    let total = 0;
    for (let i = 0; i < 5; i++) {
        const weight = 0.6 + random();
        weights.push(weight);
        total += weight;
    }
    const palette = [ACCENT, ACCENT_WARM, "#6b7f2f", "#8a5bb0", "#3f4b57"];
    let angle = -Math.PI / 2;
    weights.forEach((weight, index) => {
        const next = angle + (weight / total) * Math.PI * 2;
        const gradient = doc.radialGradient(cx, cy, inner, cx, cy, outer);
        gradient.stop(0, "#ffffff").stop(0.35, palette[index]).stop(1, palette[index]);
        appendArc(doc, cx, cy, outer, angle, next, true);
        doc.lineTo(cx + inner * Math.cos(next), cy + inner * Math.sin(next));
        appendArc(doc, cx, cy, inner, next, angle, false);
        doc.closePath().fill(gradient);
        angle = next;
    });
    doc.circle(cx, cy, inner).lineWidth(0.75).stroke("#ffffff");
}

function drawScatterPlot(doc, x, y, width, height, random) {
    doc.rect(x, y, width, height).lineWidth(0.75).stroke(HAIRLINE);
    doc.save().rect(x, y, width, height).clip();
    // Half the cloud is generated outside the frame on purpose, so the clip does work.
    for (let i = 0; i < 220; i++) {
        const px = x - width * 0.3 + random() * width * 1.6;
        const py = y - height * 0.3 + random() * height * 1.6;
        doc.circle(px, py, 1.4 + random() * 2.6)
            .fillOpacity(0.35)
            .fill(i % 3 === 0 ? ACCENT_WARM : ACCENT);
    }
    doc.fillOpacity(1);
    doc.restore();
}

function drawChartPage(doc, section, pageIndex, random) {
    const columnWidth = (CONTENT_WIDTH - 26) / 2;

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading").fontSize(9).fillColor(INK).text("Radiance residual by epoch", CONTENT.left, 124, { lineBreak: false });
            drawLineChart(doc, CONTENT.left + 26, 140, CONTENT_WIDTH - 26, 150, random);
        },
        { alt: "A line chart with three dashed series tracking radiance residuals." }
    );

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading").fontSize(9).fillColor(INK).text("Channel throughput", CONTENT.left, 322, { lineBreak: false });
            drawBarChart(doc, CONTENT.left, 338, columnWidth, 130, random);
        },
        { alt: "A bar chart of channel throughput, bars filled with a vertical gradient." }
    );

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading")
                .fontSize(9)
                .fillColor(INK)
                .text("Budget by subsystem", CONTENT.left + columnWidth + 26, 322, { lineBreak: false });
            drawDonutChart(doc, CONTENT.left + columnWidth + 26 + columnWidth / 2, 404, 64, 34, random);
        },
        { alt: "A donut chart of the instrument budget, split across five subsystems." }
    );

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading").fontSize(9).fillColor(INK).text("Sample dispersion", CONTENT.left, 500, { lineBreak: false });
            drawScatterPlot(doc, CONTENT.left, 516, columnWidth, 130, random);
        },
        { alt: "A scatter plot of sample dispersion, clipped to its frame." }
    );

    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.font("Heading")
                .fontSize(9)
                .fillColor(INK)
                .text("Coverage band", CONTENT.left + columnWidth + 26, 500, { lineBreak: false });
            const stripe = doc.pattern([0, 0, 10, 10], 10, 10, "0 0 m 10 10 l 1.6 w S");
            doc.rect(CONTENT.left + columnWidth + 26, 516, columnWidth, 130).fill([stripe, ACCENT]);
            doc.rect(CONTENT.left + columnWidth + 26, 516, columnWidth, 130)
                .lineWidth(0.75)
                .stroke(HAIRLINE);
        },
        { alt: "A band filled with a diagonal hatch pattern, standing in for survey coverage." }
    );

    tagged(doc, section, "Caption", () => {
        doc.font("Body")
            .fontSize(9)
            .fillColor(MUTED)
            .text(`Figure ${pageIndex + 1} — ${sentence(random, 10)}`, CONTENT.left, 660, { width: CONTENT_WIDTH });
    });

    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(10)
            .fillColor(INK)
            .text(paragraph(random, 4), CONTENT.left, 686, { width: CONTENT_WIDTH, align: "justify", height: CONTENT.bottom - 686, ellipsis: true });
    });
}

function drawTable(doc, section, top, random, { rows = 11 } = {}) {
    const columns = [150, 78, 78, 88, 110];
    const rowHeight = 19;
    const headers = ["Transect", "Samples", "Mean", "Residual", "Confidence"];

    doc.rect(CONTENT.left, top, CONTENT_WIDTH, rowHeight).fill(INK);
    for (let i = 1; i < rows; i += 2)
        doc.rect(CONTENT.left, top + rowHeight * i, CONTENT_WIDTH, rowHeight).fill(PAPER_TINT);

    const table = doc.struct("Table");
    section.add(table);

    const headerRow = doc.struct("TR");
    table.add(headerRow);
    let x = CONTENT.left;
    headers.forEach((header, index) => {
        const cellX = x;
        tagged(
            doc,
            headerRow,
            "TH",
            () => {
                doc.font("Heading")
                    .fontSize(8)
                    .fillColor("#ffffff")
                    .text(header.toUpperCase(), cellX + 7, top + 6, { width: columns[index] - 14, align: index === 0 ? "left" : "right", characterSpacing: 0.5, lineBreak: false });
            },
            { scope: "Column" }
        );
        x += columns[index];
    });
    headerRow.end();

    for (let row = 1; row < rows; row++) {
        const y = top + rowHeight * row;
        const dataRow = doc.struct("TR");
        table.add(dataRow);
        const samples = 40 + Math.floor(random() * 260);
        const mean = 0.4 + random() * 4.2;
        const residual = (random() - 0.5) * 1.4;
        const values = [`${pick(random, WORDS)} ${row}`, String(samples), mean.toFixed(3), residual.toFixed(3), `± ${(0.02 + random() * 0.18).toFixed(3)}`];
        x = CONTENT.left;
        values.forEach((value, index) => {
            const cellX = x;
            tagged(doc, dataRow, "TD", () => {
                doc.font(index === 0 ? "Body" : "Mono")
                    .fontSize(index === 0 ? 9.5 : 8)
                    .fillColor(index === 3 && residual < 0 ? ACCENT_WARM : INK)
                    .text(value, cellX + 7, top + rowHeight * row + 6, { width: columns[index] - 14, align: index === 0 ? "left" : "right", lineBreak: false });
            });
            x += columns[index];
        });
        dataRow.end();
        doc.moveTo(CONTENT.left, y).lineTo(CONTENT.right, y).lineWidth(0.4).stroke(HAIRLINE);
    }
    table.end();

    doc.rect(CONTENT.left, top, CONTENT_WIDTH, rowHeight * rows)
        .lineWidth(0.75)
        .stroke(HAIRLINE);
    x = CONTENT.left;
    for (let i = 0; i < columns.length - 1; i++) {
        x += columns[i];
        doc.moveTo(x, top)
            .lineTo(x, top + rowHeight * rows)
            .lineWidth(0.4)
            .stroke(HAIRLINE);
    }
    return top + rowHeight * rows;
}

function drawMixedPage(doc, section, pageIndex, random, images) {
    const tableBottom = drawTable(doc, section, 126, random);

    const codeTop = tableBottom + 22;
    doc.roundedRect(CONTENT.left, codeTop, CONTENT_WIDTH, 108, 4).fill("#111820");
    tagged(doc, section, "Code", () => {
        doc.font("Mono").fontSize(8).fillColor("#d8e2ea");
        CODE_LINES.forEach((line, index) => {
            doc.text(line, CONTENT.left + 12, codeTop + 10 + index * 11.5, { lineBreak: false });
        });
    });

    const bandTop = codeTop + 126;
    const bandHeight = 104;
    doc.save();
    setBlendMode(doc, "Multiply");
    doc.circle(CONTENT.left + 62, bandTop + 38, 34).fill(ACCENT);
    doc.circle(CONTENT.left + 100, bandTop + 38, 34).fill(ACCENT_WARM);
    setBlendMode(doc, "Screen");
    doc.circle(CONTENT.left + 81, bandTop + 62, 34).fill("#6b7f2f");
    doc.restore();

    const thumbWidth = 128;
    tagged(
        doc,
        section,
        "Figure",
        () => {
            doc.image(images.earthrise, CONTENT.right - thumbWidth, bandTop, { fit: [thumbWidth, bandHeight], align: "center", valign: "center" });
        },
        { alt: PHOTOS.earthrise.alt }
    );

    const asideLeft = CONTENT.left + 148;
    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(10)
            .fillColor(INK)
            .text(paragraph(random, 3), asideLeft, bandTop, { width: CONTENT.right - thumbWidth - 16 - asideLeft, align: "left", height: bandHeight, ellipsis: true });
    });

    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(9.5)
            .fillColor(MUTED)
            .text(`References: ${CITED.slice(0, 5).join(", ")}. Compiled for section ${CHAPTERS.indexOf(chapterOf(pageIndex)) + 1}.`, CONTENT.left, bandTop + bandHeight + 16, { width: CONTENT_WIDTH });
    });

    tagged(doc, section, "P", () => {
        doc.font("Body")
            .fontSize(10)
            .fillColor(INK)
            .text(`${paragraph(random, 5)} ${paragraph(random, 5)}`, CONTENT.left, bandTop + bandHeight + 42, { width: CONTENT_WIDTH, align: "justify", height: CONTENT.bottom - bandTop - bandHeight - 42, ellipsis: true });
    });
}

function buildDocument() {
    const doc = new PDFDocument({
        size: [PAGE.width, PAGE.height],
        margin: MARGIN,
        autoFirstPage: false,
        tagged: true,
        displayTitle: true,
        lang: "en-US",
        pdfVersion: "1.7",
        info: {
            Title: TITLE,
            Author: "Speedometer",
            Subject: SUBTITLE,
            Keywords: "speedometer, pdf.js, benchmark fixture",
            Creator: "Speedometer PDFViewer-PDFjs generate-pdf.mjs",
            CreationDate: new Date(0),
            ModDate: new Date(0),
        },
    });

    for (const [name, file] of Object.entries(FONT_FILES))
        doc.registerFont(name, fs.readFileSync(path.join(ROOT, "node_modules", file)));

    const images = { seal: doc.openImage(buildSealOverlay()) };
    for (const [key, photo] of Object.entries(PHOTOS))
        images[key] = doc.openImage(fs.readFileSync(path.join(ROOT, "assets", photo.file)));

    doc.addPage();
    doc.addNamedDestination(destinationOf(0));
    drawFrontPage(doc, images, createRandom(0x5eed0001));

    doc.addPage();
    doc.addNamedDestination(destinationOf(1));
    drawTableOfContents(doc, images, createRandom(0x5eed0002));

    for (let pageIndex = 2; pageIndex < PAGE_COUNT; pageIndex++) {
        doc.addPage();
        doc.addNamedDestination(destinationOf(pageIndex));
        // Seeded per page so a page always renders the same content no matter how many
        // pages the workload's complexity param asks for.
        const random = createRandom(0x5eed0000 + pageIndex * 7919);
        drawRunningHead(doc, pageIndex);
        const section = doc.struct("Sect", { title: pageTitle(pageIndex) });
        doc.addStructure(section);
        drawPageHeading(doc, section, pageIndex);
        switch (motifOf(pageIndex)) {
            case "text":
                drawTextPage(doc, section, pageIndex, random);
                break;
            case "photo":
                drawPhotoPage(doc, section, pageIndex, random, images);
                break;
            case "chart":
                drawChartPage(doc, section, pageIndex, random);
                break;
            default:
                drawMixedPage(doc, section, pageIndex, random, images);
        }
        section.end();
    }

    // The outline needs page refs, so it can only be built once every page exists.
    doc.outline.addItem("Front page", { pageNumber: 0 });
    doc.outline.addItem("Contents", { pageNumber: 1 });
    CHAPTERS.forEach((chapter, index) => {
        const item = doc.outline.addItem(chapter.title, { pageNumber: 2 + index * MOTIF.length, expanded: true });
        for (let offset = 0; offset < MOTIF.length; offset++) {
            const pageIndex = 2 + index * MOTIF.length + offset;
            if (pageIndex < PAGE_COUNT)
                item.addItem(MOTIF_TITLES[motifOf(pageIndex)], { pageNumber: pageIndex });
        }
    });

    return doc;
}

async function main() {
    const doc = buildDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const done = new Promise((resolve) => doc.on("end", resolve));
    doc.end();
    await done;

    const buffer = Buffer.concat(chunks);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, buffer);
    console.log(`Wrote ${path.relative(ROOT, OUTPUT)}: ${PAGE_COUNT} pages, ${(buffer.length / 1024).toFixed(0)} KB`);
}

await main();
