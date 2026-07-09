/**
 * 1950s Black & White Blueprint / Planning Design with Gradual Organic Watercolor Animation Reveals
 *
 * Core Style & Aesthetic Rules:
 * - Theme: Negative blueprint drafting / technical planning print on a pure black background (#000000).
 * - Palette: Strictly high-contrast B&W for all structural UI, wireframes, typography, and procedural line art.
 *   Primary drafting ink is pure white (#ffffff), secondary lines/specifications are light gray (#cccccc), and hatching/grids are muted gray (#777777).
 * - Background Assets: B&W topographic maps and planning paper dot grids rendered with screen/color-dodge/overlay blend modes (and inverted) so linework appears light on black.
 * - Watercolor Accents: Re-introduced organic watercolor brush textures (wcWash, wc1, wc2, wc3) are used EXCLUSIVELY as dynamic coloring elements during scroll animations.
 *   Vibrant mid-century architectural accent colors (Blueprint Blue #00a8ff, Amber Gold #fbc531, Terracotta #e84118, Emerald #4cd137) appear gradually as scroll progress advances.
 * - Reveal Modes: Watercolor coloring is revealed via clamped scroll progress (prog or phase.localProg) using:
 *   1. circular: Radial iris wipe expanding from an element center (applyCircularFocusClip).
 *   2. slide: Directional curtain wipe across a structural span (applySlideClip).
 *   3. fade: Smooth alpha opacity transition (fade wash).
 */
import { STAGES } from "./content.js";

export const STYLE_CONFIG = {
    theme: "1950s Black & White Blueprint / Planning Design with Organic Watercolor Accents",
    background: "#000000",
    canvasFill: "#000000",
    palette: {
        inkPrimary: "#ffffff",
        inkSecondary: "#cccccc",
        inkMuted: "#777777",
        paperLight: "#111111",
        paperCard: "#0a0a0a",
        accents: {
            blueprintBlue: "#00a8ff",
            amberGold: "#fbc531",
            terracotta: "#e84118",
            emerald: "#4cd137",
        },
    },
    revealModes: ["circular", "slide", "fade"],
};

const IMAGE_SOURCES = {
    topo1: "public/topo_map_1.webp",
    topo2: "public/topo_map_2.webp",
    topo3: "public/topo_map_3.webp",
    grid: "public/planning_paper_dot_grid.webp",
    wcWash: "public/bw_watercolor_texture.webp",
    wc1: "public/watercolor_stroke_1.webp",
    wc2: "public/watercolor_stroke_2.webp",
    wc3: "public/watercolor_stroke_3.webp",
};

const imageCache = {};

function getOrLoadImage(key) {
    if (typeof Image === "undefined")
        return null;
    if (!imageCache[key] && IMAGE_SOURCES[key]) {
        const img = new Image();
        img.src = IMAGE_SOURCES[key];
        imageCache[key] = img;
    }
    return imageCache[key] || null;
}

function drawImageIfLoaded(ctx, img, x, y, w, h, alpha = 0.35, composite = "screen", filter = "invert(1)") {
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = composite;
        if (filter && typeof ctx.filter !== "undefined")
            ctx.filter = filter;

        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
    }
}

let offscreenCanvas = null;
function getOffscreenCanvas(w, h) {
    if (typeof document === "undefined")
        return null;
    if (!offscreenCanvas)
        offscreenCanvas = document.createElement("canvas");

    if (offscreenCanvas.width !== w || offscreenCanvas.height !== h) {
        offscreenCanvas.width = w;
        offscreenCanvas.height = h;
    }
    return offscreenCanvas;
}

function applyCircularFocusClip(ctx, x, y, maxRadius, prog) {
    const r = maxRadius * Math.max(0, Math.min(1, prog));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
}

function applySlideClip(ctx, x, y, width, height, prog, direction = "left-to-right") {
    const p = Math.max(0, Math.min(1, prog));
    ctx.beginPath();
    if (direction === "left-to-right") {
        ctx.rect(x, y, width * p, height);
    } else if (direction === "top-to-bottom") {
        ctx.rect(x, y, width, height * p);
    } else if (direction === "center-out") {
        const w = width * p;
        ctx.rect(x + (width - w) / 2, y, w, height);
    } else {
        ctx.rect(x, y, width * p, height);
    }
    ctx.clip();
}

function drawTintedBrush(ctx, imgKey, x, y, w, h, color, alpha = 0.5, blendMode = "screen", prog = 1.0, revealMode = "fade", revealArgs = {}) {
    const img = getOrLoadImage(imgKey);
    if (!img || !img.complete || img.naturalWidth === 0)
        return;

    const clampedProg = Math.max(0, Math.min(1, prog));
    if (clampedProg <= 0)
        return;

    ctx.save();
    ctx.globalAlpha = revealMode === "fade" ? alpha * Math.pow(clampedProg, 1.5) : alpha;
    ctx.globalCompositeOperation = blendMode;

    if (revealMode === "circular") {
        const cx = revealArgs.cx !== undefined ? revealArgs.cx : x + w / 2;
        const cy = revealArgs.cy !== undefined ? revealArgs.cy : y + h / 2;
        const maxR = revealArgs.maxRadius !== undefined ? revealArgs.maxRadius : Math.sqrt(w * w + h * h) / 2;
        applyCircularFocusClip(ctx, cx, cy, maxR, clampedProg);
    } else if (revealMode === "slide") {
        const dir = revealArgs.direction || "left-to-right";
        applySlideClip(ctx, x, y, w, h, clampedProg, dir);
    }

    const off = getOffscreenCanvas(Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)));
    if (off) {
        const octx = off.getContext("2d");
        octx.save();
        octx.globalCompositeOperation = "source-over";
        octx.clearRect(0, 0, off.width, off.height);
        octx.drawImage(img, 0, 0, off.width, off.height);
        octx.globalCompositeOperation = "source-in";
        octx.fillStyle = color;
        octx.fillRect(0, 0, off.width, off.height);
        octx.restore();
        ctx.drawImage(off, x, y, w, h);
    } else {
        ctx.drawImage(img, x, y, w, h);
    }
    ctx.restore();
}

function getPhaseTiming(localProg) {
    const assemblyProg = Math.min(1.0, localProg / 0.35);
    const secondaryProg = Math.max(0.0, Math.min(1.0, (localProg - 0.35) / 0.35));
    const holdProg = Math.max(0.0, Math.min(1.0, (localProg - 0.70) / 0.30));
    return { assemblyProg, secondaryProg, holdProg };
}

function drawColorizedBackground(ctx, bgKey, x, y, w, h, color, wcKey = "wcWash", prog = 1.0, revealMode = "fade", revealArgs = {}) {
    const bgImg = getOrLoadImage(bgKey);
    const wcImg = getOrLoadImage(wcKey);
    if (!bgImg || !bgImg.complete || bgImg.naturalWidth === 0 || !wcImg || !wcImg.complete || wcImg.naturalWidth === 0)
        return;

    const clampedProg = Math.max(0, Math.min(1, prog));
    if (clampedProg <= 0)
        return;

    ctx.save();
    ctx.globalAlpha = revealMode === "fade" ? 0.75 * Math.pow(clampedProg, 1.5) : 0.75;
    ctx.globalCompositeOperation = "screen";

    if (revealMode === "circular") {
        const cx = revealArgs.cx !== undefined ? revealArgs.cx : x + w / 2;
        const cy = revealArgs.cy !== undefined ? revealArgs.cy : y + h / 2;
        const maxR = revealArgs.maxRadius !== undefined ? revealArgs.maxRadius : Math.sqrt(w * w + h * h) / 2;
        applyCircularFocusClip(ctx, cx, cy, maxR, clampedProg);
    } else if (revealMode === "slide") {
        const dir = revealArgs.direction || "left-to-right";
        applySlideClip(ctx, x, y, w, h, clampedProg, dir);
    }

    const off = getOffscreenCanvas(Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)));
    if (off) {
        const octx = off.getContext("2d");
        octx.save();
        octx.globalCompositeOperation = "source-over";
        octx.clearRect(0, 0, off.width, off.height);
        octx.filter = "invert(1)";
        octx.drawImage(bgImg, 0, 0, off.width, off.height);
        octx.filter = "none";
        octx.globalCompositeOperation = "source-in";
        octx.drawImage(wcImg, 0, 0, off.width, off.height);
        octx.fillStyle = color;
        octx.globalCompositeOperation = "multiply";
        octx.fillRect(0, 0, off.width, off.height);
        octx.restore();
        ctx.drawImage(off, x, y, w, h);
    }
    ctx.restore();
}

let stageGraphics = [];

export function initGraphics() {
    stageGraphics = [];

    for (const key of Object.keys(IMAGE_SOURCES))
        getOrLoadImage(key);

    for (let i = 0; i < STAGES.length; i++) {
        const canvas = document.getElementById(`graphic-canvas-${i}`);
        const svg = document.getElementById(`graphic-svg-${i}`);
        const caption = document.getElementById(`graphic-caption-${i}`);

        let ctx = null;
        if (canvas) {
            canvas.width = 800;
            canvas.height = 600;
            ctx = canvas.getContext("2d");
        }

        let g = null;
        if (svg) {
            svg.innerHTML = "";
            g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("id", `svg-stage-${i}`);
            g.setAttribute("opacity", "1");
            g.setAttribute("transform", "scale(1)");
            g.style.transition = "opacity 0.3s ease, transform 0.3s ease";

            const handler = STAGE_HANDLERS[i];
            if (handler && typeof handler.initSVG === "function")
                handler.initSVG(g, 800, 600);

            svg.appendChild(g);
        }

        if (caption && STAGES[i])
            caption.textContent = `Stage ${i + 1}: ${STAGES[i].title}`;

        stageGraphics.push({
            canvas,
            ctx,
            svg,
            g,
            caption,
            lastProg: -1,
        });
    }
}

export function updateGraphics(stageIndex, progress = 0) {
    const idx = Math.max(0, Math.min(STAGES.length - 1, stageIndex));
    const prog = Math.max(0, Math.min(1, progress));

    for (let i = 0; i < stageGraphics.length; i++) {
        const item = stageGraphics[i];
        if (!item || !item.g || !item.ctx || !item.canvas)
            continue;

        const stageProg = i === idx ? prog : i < idx ? 1.0 : 0.0;

        if (i === idx || item.lastProg !== stageProg) {
            const scale = 0.98 + stageProg * 0.04;
            item.g.setAttribute("transform", `scale(${scale.toFixed(4)})`);

            const phase = getParagraphPhase(stageProg, 3);
            setCalloutPhaseVisibility(item.g, phase.idx);

            const handler = STAGE_HANDLERS[i];
            if (handler) {
                if (typeof handler.updateSVG === "function")
                    handler.updateSVG(item.g, stageProg, item.canvas.width, item.canvas.height, phase);

                if (typeof handler.renderCanvas === "function") {
                    item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
                    handler.renderCanvas(item.ctx, item.g, stageProg, item.canvas.width, item.canvas.height, phase);
                }
            }

            item.lastProg = stageProg;
        }
    }
}

/* =========================================================================
   1950s STRICT GRAYSCALE & B&W DRAFTING UTILITIES
   ========================================================================= */

function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs))
        el.setAttribute(k, String(v));

    return el;
}

function addSVGImage(g, src, x, y, width, height, opacity = 0.35, blendMode = "screen", filterStyle = "invert(1)") {
    const ns = "http://www.w3.org/2000/svg";
    const img = document.createElementNS(ns, "image");
    img.setAttribute("href", src);
    if (typeof img.setAttributeNS === "function")
        img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", src);

    img.setAttribute("x", String(x));
    img.setAttribute("y", String(y));
    img.setAttribute("width", String(width));
    img.setAttribute("height", String(height));
    img.setAttribute("opacity", String(opacity));
    if (blendMode)
        img.style.mixBlendMode = blendMode;
    if (filterStyle)
        img.style.filter = filterStyle;
    g.appendChild(img);
    return img;
}

function drawHandLine(ctx, x1, y1, x2, y2, roughness = 0.6, steps = 4) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const dx = x2 - x1;
    const dy = y2 - y1;
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        let nx = x1 + dx * t;
        let ny = y1 + dy * t;
        if (i < steps) {
            const seed = (x1 * 13.1 + y1 * 71.7 + x2 * 19.3 + y2 * 41.9 + i * 17.3) * 0.1;
            nx += Math.sin(seed) * roughness;
            ny += Math.cos(seed * 1.3) * roughness;
        }
        ctx.lineTo(nx, ny);
    }
    ctx.stroke();
}

function drawSketchRect(ctx, x, y, w, h, overshoot = 3) {
    drawHandLine(ctx, x - overshoot, y, x + w + overshoot, y, 0.4, 3);
    drawHandLine(ctx, x + w, y - overshoot, x + w, y + h + overshoot, 0.4, 3);
    drawHandLine(ctx, x + w + overshoot, y + h, x - overshoot, y + h, 0.4, 3);
    drawHandLine(ctx, x, y + h + overshoot, x, y - overshoot, 0.4, 3);
}

function drawCrossSectionHatching(ctx, x, y, w, h, spacing = 8, angle = -Math.PI / 4, color = "rgba(255, 255, 255, 0.35)") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    const diag = Math.sqrt(w * w + h * h) * 1.5;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let offset = -diag; offset <= diag; offset += spacing) {
        const x1 = cx + offset * cos - diag * sin;
        const y1 = cy + offset * sin + diag * cos;
        const x2 = cx + offset * cos + diag * sin;
        const y2 = cy + offset * sin - diag * cos;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.restore();
}

function drawMasonryHatch(ctx, x, y, w, h, weathered = false) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1;
    const spacing = 14;
    for (let d = -h; d < w + h; d += spacing) {
        if (weathered && Math.sin(d * 0.5) > 0.3)
            continue;
        ctx.beginPath();
        ctx.moveTo(x + d, y);
        ctx.lineTo(x + d - h, y + h);
        ctx.stroke();
    }
    ctx.restore();
}

function drawSteelHatch(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 1;
    for (let d = -h; d < w + h; d += 16) {
        ctx.beginPath();
        ctx.moveTo(x + d, y);
        ctx.lineTo(x + d - h, y + h);
        ctx.moveTo(x + d + 4, y);
        ctx.lineTo(x + d + 4 - h, y + h);
        ctx.stroke();
    }
    ctx.restore();
}

function drawInsulationHatch(ctx, x, y, w, h, prog = 1.0, color = "rgba(204, 204, 204, 0.7)") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    const loopW = 12;
    const loops = Math.ceil(w / loopW);
    const midY = y + h / 2;
    const amp = (h / 2 - 3) * Math.min(1.0, prog * 1.2);

    ctx.beginPath();
    ctx.moveTo(x, midY);
    for (let i = 0; i < loops; i++) {
        const lx = x + i * loopW;
        ctx.bezierCurveTo(lx + loopW * 0.25, midY - amp, lx + loopW * 0.75, midY - amp, lx + loopW, midY);
        ctx.bezierCurveTo(lx + loopW * 0.75, midY + amp, lx + loopW * 0.25, midY + amp, lx, midY);
    }
    ctx.stroke();
    ctx.restore();
}

function drawEarthHatch(ctx, x, y, w, h, color = "rgba(255, 255, 255, 0.35)") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let d = -h; d < w + h; d += 20) {
        ctx.beginPath();
        ctx.moveTo(x + d, y);
        ctx.lineTo(x + d - h, y + h);
        ctx.stroke();
    }
    ctx.strokeStyle = color;
    for (let ty = y + 15; ty < y + h; ty += 25) {
        for (let tx = x + 10; tx < x + w; tx += 40) {
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + 14, ty);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawGear(ctx, cx, cy, radius, teeth, angle, color = "#ffffff") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 === 0 ? radius : radius * 0.75;
        const a = angle + (i * Math.PI) / teeth;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

/* Dimension Line with Independent & Irregular Shadow Angle */
function drawDimensionLine(ctx, x1, y1, x2, y2, label, color = "#ffffff", tickSize = 6, bgColor = "#000000") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.4;

    drawHandLine(ctx, x1, y1, x2, y2, 0.3, 2);

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const tickAngle = Math.PI / 4;
    for (const [ptX, ptY] of [[x1, y1], [x2, y2]]) {
        ctx.beginPath();
        ctx.moveTo(ptX - Math.cos(angle + tickAngle) * tickSize, ptY - Math.sin(angle + tickAngle) * tickSize);
        ctx.lineTo(ptX + Math.cos(angle + tickAngle) * tickSize, ptY + Math.sin(angle + tickAngle) * tickSize);
        ctx.stroke();
    }

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textW = ctx.measureText(label).width;
    const boxW = textW + 14;
    const boxH = 18;

    // Independent shadow at different angle (+1.8 deg vs -0.9 deg)
    ctx.save();
    ctx.translate(midX + 5, midY + 4);
    ctx.rotate(0.031); // +1.8 deg
    ctx.fillStyle = "#000000";
    ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.restore();

    // Foreground box at different angle
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(-0.015); // -0.9 deg
    ctx.fillStyle = bgColor;
    ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.fillStyle = color;
    ctx.fillText(label, 0, 1);
    ctx.restore();

    ctx.restore();
}

function drawSurveyReticle(ctx, x, y, radius, label, color = "#ffffff") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    drawHandLine(ctx, x - radius - 6, y, x + radius + 6, y, 0.2, 2);
    drawHandLine(ctx, x, y - radius - 6, x, y + radius + 6, 0.2, 2);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius * 0.35, 0, Math.PI / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius * 0.35, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();

    if (label) {
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + radius + 15);
    }
    ctx.restore();
}

/* Title Block with Independent & Irregular Shadow Angle */
function drawTitleBlock(ctx, width, height, title, dwgNo, scale, date = "OCT 1954", color = "#ffffff", bgColor = "#0a0a0a") {
    ctx.save();
    const boxW = 280;
    const boxH = 58;
    const bx = width - boxW - 20;
    const by = height - boxH - 20;

    // Independent shadow rotated differently (+1.5 deg vs -0.8 deg)
    ctx.save();
    ctx.translate(bx + boxW / 2 + 10, by + boxH / 2 + 12);
    ctx.rotate(0.026); // +1.5 deg
    ctx.fillStyle = "#000000";
    ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.restore();

    // Main box
    ctx.save();
    ctx.translate(bx + boxW / 2, by + boxH / 2);
    ctx.rotate(-0.014); // -0.8 deg
    ctx.fillStyle = bgColor;
    ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

    ctx.beginPath();
    ctx.moveTo(-boxW / 2, -boxH / 2 + 26);
    ctx.lineTo(-boxW / 2 + boxW, -boxH / 2 + 26);
    ctx.moveTo(-boxW / 2 + 195, -boxH / 2 + 26);
    ctx.lineTo(-boxW / 2 + 195, -boxH / 2 + boxH);
    ctx.stroke();

    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("PROJECT: EVOLUTION OF A HOUSE", -boxW / 2 + 8, -boxH / 2 + 17);

    ctx.font = "bold 10px monospace";
    ctx.fillText(title, -boxW / 2 + 8, -boxH / 2 + 42);
    ctx.font = "9px monospace";
    ctx.fillText(`SCALE: ${scale}`, -boxW / 2 + 8, -boxH / 2 + 52);

    ctx.font = "bold 11px monospace";
    ctx.fillText(`DWG ${dwgNo}`, -boxW / 2 + 203, -boxH / 2 + 42);
    ctx.font = "8px monospace";
    ctx.fillText(`DATE: ${date}`, -boxW / 2 + 203, -boxH / 2 + 52);
    ctx.restore();

    ctx.restore();
}

/* 1950s Slanted Geometric SVG Callouts & Badges with Independent Shadow Angles */
function addSVGCallout(g, x, y, targetX, targetY, text, subtext = "", id = "", phase = null) {
    const group = createSVGElement("g", { class: "tech-callout" });
    if (id)
        group.setAttribute("id", id);
    if (phase !== null)
        group.setAttribute("data-phase", String(phase));
    group.style.transition = "opacity 0.35s ease";

    const leader = createSVGElement("polyline", {
        points: `${targetX},${targetY} ${x + (targetX > x ? 20 : -20)},${y} ${x},${y}`,
        fill: "none",
        stroke: "#ffffff",
        "stroke-width": "1.5",
        "stroke-dasharray": "4, 2",
    });
    group.appendChild(leader);

    const targetDot = createSVGElement("circle", {
        cx: targetX, cy: targetY, r: 3.5,
        fill: "#ffffff", stroke: "#ffffff", "stroke-width": "1",
    });
    group.appendChild(targetDot);

    const tilt = targetX > x ? -1.5 : 1.5;
    const shadowTilt = targetX > x ? 1.4 : -1.7; /* Independent irregular shadow angle! */
    const boxW = 185;
    const boxH = subtext ? 36 : 26;
    const bx = x - (targetX > x ? 0 : boxW);
    const by = y - 24;

    const shadowBg = createSVGElement("rect", {
        x: bx + (targetX > x ? 7 : -7), y: by + 8, width: boxW, height: boxH,
        fill: "#000000",
        transform: `rotate(${shadowTilt}, ${bx + boxW / 2}, ${by + boxH / 2})`
    });
    group.appendChild(shadowBg);

    const labelBg = createSVGElement("rect", {
        x: bx, y: by, width: boxW, height: boxH,
        fill: "#0a0a0a", stroke: "#ffffff", "stroke-width": "2", rx: "0",
        transform: `rotate(${tilt}, ${bx + boxW / 2}, ${by + boxH / 2})`
    });
    group.appendChild(labelBg);

    const textEl = createSVGElement("text", {
        x: bx + 8, y: by + 16,
        fill: "#ffffff", "font-family": '"Courier New", Courier, monospace', "font-size": "11", "font-weight": "bold",
        transform: `rotate(${tilt}, ${bx + boxW / 2}, ${by + boxH / 2})`
    });
    textEl.textContent = text;
    group.appendChild(textEl);

    if (subtext) {
        const subEl = createSVGElement("text", {
            x: bx + 8, y: by + 28,
            fill: "#cccccc", "font-family": '"Courier New", Courier, monospace', "font-size": "9",
            transform: `rotate(${tilt}, ${bx + boxW / 2}, ${by + boxH / 2})`
        });
        subEl.textContent = subtext;
        group.appendChild(subEl);
    }

    g.appendChild(group);
    return group;
}

function addSVGStressArrow(g, x1, y1, x2, y2, label, id = "", phase = null) {
    const group = createSVGElement("g", { class: "tech-arrow" });
    if (id)
        group.setAttribute("id", id);
    if (phase !== null)
        group.setAttribute("data-phase", String(phase));
    group.style.transition = "opacity 0.35s ease";
    group.setAttribute("data-base-x1", String(x1));
    group.setAttribute("data-base-y1", String(y1));
    group.setAttribute("data-base-x2", String(x2));
    group.setAttribute("data-base-y2", String(y2));

    const line = createSVGElement("line", {
        x1, y1, x2, y2,
        stroke: "#ffffff", "stroke-width": "2.5", class: "tech-arrow-line",
    });
    group.appendChild(line);

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 12;
    const hx1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
    const hy1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
    const hx2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
    const hy2 = y2 - headLen * Math.sin(angle + Math.PI / 6);

    const head = createSVGElement("polygon", {
        points: `${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`,
        fill: "#ffffff", class: "tech-arrow-head",
    });
    group.appendChild(head);

    const tx = (x1 + x2) / 2 + 10;
    const ty = (y1 + y2) / 2;
    const textEl = createSVGElement("text", {
        x: tx, y: ty,
        fill: "#ffffff", "font-family": '"Courier New", Courier, monospace', "font-size": "10", "font-weight": "bold", class: "tech-arrow-label",
    });
    textEl.textContent = label;
    group.appendChild(textEl);

    g.appendChild(group);
    return group;
}

function addSVGTitleBlock(g, project, dwgNo, rev, scale, date = "OCT 1954") {
    const box = createSVGElement("g", { class: "tech-title-block" });

    // Independent shadow rotated differently (+1.7 deg vs -1.2 deg)
    const shadow = createSVGElement("rect", {
        x: 488, y: 520, width: 300, height: 70,
        fill: "#000000",
        transform: "rotate(1.7, 638, 555)"
    });
    box.appendChild(shadow);

    const frameGroup = createSVGElement("g", { transform: "rotate(-1.2, 630, 545)" });
    const frame = createSVGElement("rect", {
        x: 480, y: 510, width: 300, height: 70,
        fill: "#0a0a0a", stroke: "#ffffff", "stroke-width": "3",
    });
    frameGroup.appendChild(frame);

    const div1 = createSVGElement("line", { x1: 480, y1: 535, x2: 780, y2: 535, stroke: "#ffffff", "stroke-width": "1.5" });
    const div2 = createSVGElement("line", { x1: 480, y1: 558, x2: 780, y2: 558, stroke: "#ffffff", "stroke-width": "1" });
    const div3 = createSVGElement("line", { x1: 640, y1: 535, x2: 640, y2: 580, stroke: "#ffffff", "stroke-width": "1" });
    frameGroup.append(div1, div2, div3);

    const tProj = createSVGElement("text", { x: 490, y: 528, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "11", "font-weight": "bold" });
    tProj.textContent = `PROJ: ${project}`;

    const tDwg = createSVGElement("text", { x: 490, y: 550, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "10", "font-weight": "bold" });
    tDwg.textContent = `DWG: ${dwgNo}`;

    const tRev = createSVGElement("text", { x: 650, y: 550, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "10", "font-weight": "bold" });
    tRev.textContent = `REV: ${rev}`;

    const tScale = createSVGElement("text", { x: 490, y: 572, fill: "#cccccc", "font-family": '"Courier New", monospace', "font-size": "9" });
    tScale.textContent = `SCALE: ${scale}`;

    const tDate = createSVGElement("text", { x: 650, y: 572, fill: "#cccccc", "font-family": '"Courier New", monospace', "font-size": "9" });
    tDate.textContent = `DATE: ${date}`;

    frameGroup.append(tProj, tDwg, tRev, tScale, tDate);
    box.appendChild(frameGroup);
    g.appendChild(box);
}

/* =========================================================================
   2.5D MECHANICAL DIORAMA HELPER FUNCTIONS (STRICT B&W / GRAYSCALE)
   ========================================================================= */

function getParagraphPhase(progress, numParagraphs = 3) {
    const p = Math.max(0, Math.min(0.9999, progress));
    const idx = Math.floor(p * numParagraphs);
    const localProg = (p * numParagraphs) - idx;
    return { idx, localProg };
}

function setCalloutPhaseVisibility(g, phaseIdx) {
    const callouts = g.querySelectorAll(".tech-callout, .tech-arrow, .tech-stamp-badge, .tech-datum");
    callouts.forEach((el) => {
        const targetPhase = el.getAttribute("data-phase");
        if (targetPhase === null || targetPhase === "" || parseInt(targetPhase, 10) === phaseIdx) {
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
        } else {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
        }
    });
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function drawMechanicalTrack(ctx, x1, y1, x2, y2, color = "#ffffff") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    drawHandLine(ctx, x1, y1, x2, y2, 0.2, 2);
    ctx.lineWidth = 1;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.floor(dist / 22);
    for (let i = 0; i <= steps; i++) {
        const tx = x1 + Math.cos(angle) * (i * 22);
        const ty = y1 + Math.sin(angle) * (i * 22);
        ctx.beginPath();
        ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function drawDioramaPlatform(ctx, x, y, w, h, depth = 18, color = "#0a0a0a", borderColor = "#ffffff", shadowTilt = 0.03) {
    ctx.save();
    // Independent drop shadow polygon (Rule 3)
    ctx.save();
    ctx.translate(x + 12, y + 14);
    ctx.rotate(shadowTilt);
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(-12, -14, w + depth, h + depth);
    ctx.restore();

    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2.2;
    ctx.strokeRect(x, y, w, h);

    // Front lip
    ctx.fillStyle = "#e5e5e5";
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + depth, y + h + depth);
    ctx.lineTo(x + w + depth, y + h + depth);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right lip
    ctx.fillStyle = "#cccccc";
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + depth, y + depth);
    ctx.lineTo(x + w + depth, y + h + depth);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawPopUpProp(ctx, x, y, w, h, prog, drawContentCallback) {
    ctx.save();
    const eased = easeOutBack(Math.min(1.0, prog * 1.2));
    const currH = h * eased;
    const currY = y + (h - currH);
    ctx.translate(x, currY);
    if (currH > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, currH);
        ctx.clip();
        drawContentCallback(ctx, w, currH, eased);
        ctx.restore();
    }
    ctx.restore();
}

/* =========================================================================
   INDIVIDUAL STAGE HANDLERS (STRICT B&W / GRAYSCALE DRAFTING ON PAPER)
   ========================================================================= */

const STAGE_HANDLERS = [
    // Stage 0: 1780 - Early Settlement (Timber Clearing, Hewn Logs, Well & Hearth)
    {
        initSVG: (g, width, height) => {
            addSVGImage(g, IMAGE_SOURCES.topo1, 0, 0, width, height, 0.28, "screen");

            // P0 callout
            addSVGCallout(g, 240, 300, 180, 260, "OLD-GROWTH VIRGIN CANOPY", "HEMLOCK, OAK & MAPLE CLEARING", "stage0-callout1", 0);
            addSVGCallout(g, 500, 390, 420, 430, "320 SQ. FT. CLEARING", "SURVEY STAKED HOMESTEAD", "stage0-callout2", 0);

            // P1 callout
            addSVGCallout(g, 230, 320, 180, 380, "INTERLOCKING NOTCHED JOINTS", "BROADAXE HEWN / NO IRON NAILS", "stage0-callout3", 1);
            addSVGCallout(g, 520, 350, 460, 390, "RAMMED MOSS & CLAY CHINKING", "WINDBREAK INSULATION", "stage0-callout4", 1);

            // P2 callout
            addSVGCallout(g, 200, 360, 160, 470, "SUBTERRANEAN DUG WELL", "TAPPING SURFACE WATER TABLE", "stage0-callout5", 2);
            addSVGCallout(g, 540, 290, 560, 350, "DRY-LAID FIELDSTONE HEARTH", "SOLE THERMAL HEATING & ILLUM.", "stage0-callout6", 2);

            addSVGTitleBlock(g, "EARLY SETTLEMENT HOMESTEAD", "A-101", "1780", "SCALE: 3/8\" = 1'-0\"", "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            drawImageIfLoaded(ctx, getOrLoadImage("topo1"), 0, 0, width, height, 0.25, "screen");

            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            // Base Diorama Platform with independent shadow angle
            drawDioramaPlatform(ctx, 80, 380, 640, 90, 20, "#111111", "#ffffff", 0.035);
            drawMechanicalTrack(ctx, 120, 425, 680, 425, "rgba(255, 255, 255, 0.35)");

            if (phase.idx === 0) {
                // P0: Timber Clearing & Shelter
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.terracotta, "wcWash", secondaryProg, "circular", { cx: width / 2, cy: height / 2 });
                const treesStanding = Math.max(1, 5 - Math.floor(secondaryProg * 4.5));
                for (let t = 0; t < 5; t++) {
                    const tx = 150 + t * 110;
                    const dropY = (1 - easeOutQuart(assemblyProg)) * 60;
                    ctx.save();
                    ctx.translate(0, -dropY);
                    if (t < treesStanding) {
                        // Standing tree pop-up
                        ctx.fillStyle = "#cccccc";
                        ctx.beginPath();
                        ctx.moveTo(tx, 400);
                        ctx.lineTo(tx - 35, 290);
                        ctx.lineTo(tx - 15, 290);
                        ctx.lineTo(tx - 30, 230);
                        ctx.lineTo(tx, 160);
                        ctx.lineTo(tx + 30, 230);
                        ctx.lineTo(tx + 15, 290);
                        ctx.lineTo(tx + 35, 290);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    } else {
                        // Felled tree folded on guide track
                        drawSketchRect(ctx, tx - 40, 410, 80, 16);
                        drawCrossSectionHatching(ctx, tx - 40, 410, 80, 16, 6, Math.PI / 4, "rgba(204, 204, 204, 0.4)");
                    }
                    ctx.restore();
                }
                drawDimensionLine(ctx, 160, 450, 620, 450, "320 SQ. FT. CLEARING", "#ffffff", 6, "#ffffff");
                drawSurveyReticle(ctx, 110, 140, 24, "BM #101 / 1780", "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Hewn Log Carpentry & Chinking
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.amberGold, "wc1", secondaryProg, "slide", { direction: "left-to-right" });
                // Background trees folded
                for (let t = 0; t < 5; t++)
                    drawSketchRect(ctx, 150 + t * 110 - 35, 385, 70, 12);

                // Foreground log cabin assembly on mechanical tracks
                const maxLogs = 6;
                const logsToShow = Math.min(maxLogs, Math.floor(assemblyProg * maxLogs) + 1);
                const logH = 24;
                for (let l = 0; l < logsToShow; l++) {
                    const ly = 400 - (l + 1) * logH;
                    const dropOffset = l === logsToShow - 1 ? (1 - (assemblyProg * maxLogs % 1)) * 30 : 0;
                    ctx.save();
                    ctx.translate(0, -dropOffset);
                    drawSketchRect(ctx, 180, ly, 440, logH - 2);
                    drawMasonryHatch(ctx, 180, ly, 440, logH - 2);
                    // Interlocking corner notches
                    ctx.strokeRect(172, ly, 10, logH);
                    ctx.strokeRect(618, ly, 10, logH);
                    // Chinking in charcoal grayscale (secondary animation)
                    if (l > 0 && secondaryProg > 0) {
                        ctx.strokeStyle = "#cccccc";
                        ctx.lineWidth = 2 * secondaryProg;
                        drawHandLine(ctx, 190, ly + logH - 1, 610, ly + logH - 1, 0.8, 8);
                    }
                    ctx.restore();
                }
                drawDimensionLine(ctx, 180, 450, 620, 450, "ISOMETRIC LOG CARPENTRY", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Subterranean Well & Fieldstone Hearth
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.emerald, "wc2", secondaryProg, "fade");
                // Log cabin slid back to 30% opacity
                ctx.save();
                ctx.globalAlpha = 0.3;
                drawSketchRect(ctx, 220, 260, 360, 140);
                drawMasonryHatch(ctx, 220, 260, 360, 140);
                ctx.restore();

                // Cutaway well shaft on left
                const wellDepth = 150 * easeOutQuart(assemblyProg);
                drawSketchRect(ctx, 120, 400, 60, wellDepth);
                drawEarthHatch(ctx, 120, 400, 60, wellDepth, "rgba(204, 204, 204, 0.6)");
                if (secondaryProg > 0) {
                    ctx.fillStyle = "#cccccc";
                    ctx.fillRect(124, 400 + wellDepth - (20 * secondaryProg), 52, 18 * secondaryProg); // Water table
                }

                // Dry-laid fieldstone hearth on right
                const hearthH = 250 * easeOutQuart(assemblyProg);
                const hearthY = 400 - hearthH;
                drawSketchRect(ctx, 520, hearthY, 90, hearthH);
                drawMasonryHatch(ctx, 520, hearthY, 90, hearthH, true);
                // Grayscale radiation lines (secondary animation)
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#666666";
                    ctx.lineWidth = 2;
                    for (let r = 1; r <= 3; r++) {
                        ctx.beginPath();
                        ctx.arc(565, 380, r * 15 * secondaryProg, Math.PI, 1.5 * Math.PI);
                        ctx.stroke();
                    }
                }
                drawDimensionLine(ctx, 520, 450, 610, 450, "HEARTH ELEV.", "#ffffff", 6, "#ffffff");
            }

            const titles = ["TIMBER CLEARING", "LOG CARPENTRY & CHINKING", "WELL & FIELDSTONE HEARTH"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `A-101.${phase.idx + 1}`, "3/8\" = 1'-0\"", "AUG 1952", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 1: 1810 - Geology & Landscape (Bedrock, Footings, Drainage)
    {
        initSVG: (g, width, height) => {
            addSVGImage(g, IMAGE_SOURCES.topo2, 0, 0, width, height, 0.3, "screen");

            addSVGCallout(g, 260, 280, 180, 320, "METAMORPHIC GRANITE BEDROCK", "SUBTERRANEAN STRATA SHELF", "stage1-p0-1", 0);
            addSVGCallout(g, 540, 370, 480, 410, "IMPERVIOUS DENSE CLAY SUBSOIL", "EXCAVATION PROFILE", "stage1-p0-2", 0);

            addSVGStressArrow(g, 300, 240, 300, 380, "GRAVITY KEYING LOAD", "stage1-p1-arr1", 1);
            addSVGStressArrow(g, 500, 240, 500, 380, "FROST HEAVE RESISTANCE", "stage1-p1-arr2", 1);
            addSVGCallout(g, 340, 300, 260, 350, "DRY-LAID FIELDSTONE FOOTINGS", "KEYED TO BEDROCK WITHOUT MORTAR", "stage1-p1-1", 1);

            addSVGCallout(g, 380, 430, 280, 460, "GRAVITY DRAINAGE TRENCHING", "HYDROLOGICAL FLOW MAPPING", "stage1-p2-1", 2);
            addSVGStressArrow(g, 220, 450, 600, 480, "PERIMETER RUNOFF DIVERSION", "stage1-p2-arr", 2);

            addSVGTitleBlock(g, "GEOLOGY & DRAINAGE", "G-102", "1810", "SCALE: 1/2\" = 1'-0\"", "SEP 1953");
        },
        updateSVG: (g, prog, width, height, phase) => {
            if (phase.idx === 1) {
                const arr1 = g.querySelector("#stage1-p1-arr1 line");
                const head1 = g.querySelector("#stage1-p1-arr1 polygon");
                if (arr1 && head1) {
                    const newY = 240 + phase.localProg * 140;
                    arr1.setAttribute("y2", String(newY));
                    const angle = Math.PI / 2;
                    const hx1 = 300 - 12 * Math.cos(angle - Math.PI / 6);
                    const hy1 = newY - 12 * Math.sin(angle - Math.PI / 6);
                    const hx2 = 300 - 12 * Math.cos(angle + Math.PI / 6);
                    const hy2 = newY - 12 * Math.sin(angle + Math.PI / 6);
                    head1.setAttribute("points", `300,${newY} ${hx1},${hy1} ${hx2},${hy2}`);
                }
            }
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            drawImageIfLoaded(ctx, getOrLoadImage("topo2"), 0, 0, width, height, 0.28, "screen");

            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            if (phase.idx === 0) {
                // P0: Subterranean Bedrock & Clay Subsoils
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.blueprintBlue, "wc1", secondaryProg, "slide", { direction: "left-to-right" });
                const split = 60 * (1 - easeOutQuart(assemblyProg));
                drawDioramaPlatform(ctx, 100 - split, 300, 280, 180, 20, "#111111", "#ffffff", -0.025);
                drawEarthHatch(ctx, 100 - split, 300, 280, 100, "rgba(255, 255, 255, 0.25)"); // Topsoil
                if (secondaryProg > 0) {
                    drawCrossSectionHatching(ctx, 100 - split, 400, 280, 80 * secondaryProg, 8, Math.PI / 4, "rgba(204, 204, 204, 0.4)"); // Clay
                }

                drawDioramaPlatform(ctx, 420 + split, 300, 280, 180, 20, "#111111", "#ffffff", 0.04);
                drawMasonryHatch(ctx, 420 + split, 300, 280, 180, true); // Bedrock granite
                drawDimensionLine(ctx, 100, 510, 700, 510, "GEOLOGICAL STRATA EXCAVATION MODEL", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Dry-Laid Fieldstone Footings
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.terracotta, "wc3", secondaryProg, "circular", { cx: width / 2, cy: height / 2 });
                drawDioramaPlatform(ctx, 120, 380, 560, 120, 20, "#111111", "#ffffff", 0.03);
                drawMasonryHatch(ctx, 120, 380, 560, 120, true); // Bedrock base

                // Glacial erratic footings dropping from chutes
                const stones = Math.floor(assemblyProg * 8) + 1;
                for (let s = 0; s < Math.min(8, stones); s++) {
                    const sx = 160 + s * 60;
                    const sy = 330;
                    const dropY = (s === stones - 1) ? (1 - (assemblyProg * 8 % 1)) * 40 : 0;
                    ctx.save();
                    ctx.translate(0, -dropY);
                    drawSketchRect(ctx, sx, sy, 50, 50);
                    drawMasonryHatch(ctx, sx, sy, 50, 50);
                    ctx.strokeRect(sx - 2, sy - 2, 54, 54);
                    ctx.restore();
                }
                drawDimensionLine(ctx, 160, 310, 620, 310, "DRY-LAID GRAVITY KEYED FOOTINGS", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Gravity-Driven Drainage Trenching
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.amberGold, "wc2", secondaryProg, "slide", { direction: "top-to-bottom" });
                const trenchW = 520 * easeOutQuart(assemblyProg);
                drawDioramaPlatform(ctx, 140, 320, trenchW, 160, 20, "#111111", "#ffffff", -0.035);
                drawMasonryHatch(ctx, 180, 340, Math.min(440, trenchW - 40), 100); // Footings inside

                // Perimeter sloped drainage trench
                ctx.strokeStyle = "#cccccc";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(140, 460);
                ctx.lineTo(140 + trenchW, 460 + (trenchW / 520) * 30); // Gravity slope
                ctx.stroke();

                // Animated water flow particles along trench in grayscale (secondary animation)
                if (secondaryProg > 0) {
                    const offset = (secondaryProg * 300) % 520;
                    ctx.fillStyle = "#cccccc";
                    for (let w = 0; w < 4; w++) {
                        const wx = 140 + ((offset + w * 130) % 520);
                        if (wx <= 140 + trenchW) {
                            const wy = 460 + ((wx - 140) / 520) * 30;
                            ctx.beginPath();
                            ctx.arc(wx, wy - 6, 6, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
                drawDimensionLine(ctx, 140, 520, 660, 520, "GRAVITY DRAINAGE HYDROLOGICAL SLOPE", "#ffffff", 6, "#ffffff");
            }

            const titles = ["BEDROCK & CLAY SUBSOILS", "DRY-LAID STONE FOOTINGS", "GRAVITY DRAINAGE TRENCHING"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `G-102.${phase.idx + 1}`, "1/2\" = 1'-0\"", "SEP 1953", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 2: 1860 - Industrial Revolution (Balloon Framing, Metallurgy, Mechanized Pump)
    {
        initSVG: (g, width, height) => {
            addSVGImage(g, IMAGE_SOURCES.topo3, 0, 0, width, height, 0.25, "screen");
            addSVGImage(g, IMAGE_SOURCES.grid, 0, 0, width, height, 0.2, "screen");

            addSVGCallout(g, 240, 220, 160, 260, "STEAM-MILLED DIMENSIONED LUMBER", "STANDARDIZED 2x4 BALLOON FRAMING", "stage2-p0-1", 0);
            addSVGCallout(g, 520, 220, 440, 260, "MASS-PRODUCED CUT WIRE NAILS", "RAPID INDUSTRIAL ASSEMBLY", "stage2-p0-2", 0);

            addSVGCallout(g, 220, 200, 160, 250, "WROUGHT IRON TIE-RODS", "TURNBUCKLE TENSION REINFORCEMENT", "stage2-p1-1", 1);
            addSVGCallout(g, 540, 240, 480, 280, "CAST-IRON LINTEL REINFORCEMENT", "EXPANSIVE PARLOR WINDOW OPENING", "stage2-p1-2", 1);

            addSVGCallout(g, 260, 220, 200, 270, "MECHANIZED WATER PUMP", "CAST-IRON 4:1 GEAR RATIO", "stage2-p2-1", 2);
            addSVGCallout(g, 540, 360, 480, 410, "INDOOR COPPER PLUMBING", "DEEP AQUIFER INTAKE - 60 FT", "stage2-p2-2", 2);

            addSVGTitleBlock(g, "BALLOON FRAMING & PUMP", "S-103", "1860", "SCALE: 3/4\" = 1'-0\"", "NOV 1954");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            drawImageIfLoaded(ctx, getOrLoadImage("topo3"), 0, 0, width, height, 0.25, "screen");
            drawImageIfLoaded(ctx, getOrLoadImage("grid"), 0, 0, width, height, 0.2, "screen");

            ctx.strokeStyle = "#ffffff";
            ctx.fillStyle = "#ffffff";
            ctx.lineWidth = 1.8;

            if (phase.idx === 0) {
                // P0: Steam-Milled Balloon Framing
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "grid", 0, 0, width, height, STYLE_CONFIG.palette.accents.amberGold, "wc2", secondaryProg, "slide", { direction: "top-to-bottom" });
                drawDioramaPlatform(ctx, 120, 450, 560, 40, 20, "#111111", "#ffffff", 0.03);
                // 8 vertical studs shooting up on tracks during assemblyProg
                const maxStudH = 260;
                const studH = maxStudH * easeOutQuart(assemblyProg);
                for (let s = 0; s < 8; s++) {
                    const sx = 150 + s * 70;
                    ctx.strokeRect(sx - 6, 450 - studH, 12, studH);
                    drawHandLine(ctx, sx, 450, sx, 450 - studH, 0.2, 2);
                    // Secondary animation: Cut wire nail connection points and bracing
                    if (secondaryProg > 0) {
                        ctx.fillStyle = "#cccccc";
                        ctx.fillRect(sx - 2, 446, 4, 4 * secondaryProg);
                        if (s < 7) {
                            drawHandLine(ctx, sx + 6, 450 - studH * 0.5, sx + 64, 450 - studH * 0.5, 0.2, 2);
                        }
                        ctx.fillStyle = "#ffffff";
                    }
                }
                drawDimensionLine(ctx, 150, 470, 640, 470, "STEAM-MILLED DIMENSIONED BALLOON FRAMING", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Industrial Metallurgy & Parlor Expansions
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo3", 0, 0, width, height, STYLE_CONFIG.palette.accents.blueprintBlue, "wc1", secondaryProg, "slide", { direction: "center-out" });
                // Background studs dimmed
                ctx.save();
                ctx.globalAlpha = 0.25;
                for (let s = 0; s < 8; s++)
                    ctx.strokeRect(150 + s * 70 - 6, 190, 12, 260);
                ctx.restore();

                // Wrought iron tie-rods and cast-iron lintels sliding horizontally during assemblyProg
                const spanW = 500 * easeOutQuart(assemblyProg);
                ctx.strokeStyle = "#cccccc";
                ctx.lineWidth = 4;
                ctx.strokeRect(150, 240, spanW, 16);
                drawSteelHatch(ctx, 150, 240, spanW, 16);

                // Expansive parlor window pop-up and light beams (secondary animation)
                if (secondaryProg > 0) {
                    const winProg = easeOutQuart(secondaryProg);
                    drawSketchRect(ctx, 300, 280, 200, 160 * winProg);
                    // Grayscale light beams
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * winProg})`;
                    ctx.beginPath();
                    ctx.moveTo(300, 280);
                    ctx.lineTo(500, 280);
                    ctx.lineTo(560, 450);
                    ctx.lineTo(240, 450);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                }
                drawDimensionLine(ctx, 150, 470, 650, 470, "METALLURGICAL LINTEL & TIE-ROD REINFORCEMENT", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Mechanized Well Pumping & Copper Plumbing
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo3", 0, 0, width, height, STYLE_CONFIG.palette.accents.emerald, "wc3", secondaryProg, "fade");
                drawDioramaPlatform(ctx, 160, 360, 480, 120, 20, "#111111", "#ffffff", -0.03);

                // Gears and pump cylinder move into position during assemblyProg
                const slideIn = (1 - easeOutQuart(assemblyProg)) * 50;
                ctx.save();
                ctx.translate(slideIn, 0);
                // Rotating gears in charcoal grayscale driven by secondaryProg
                const gearAngle1 = secondaryProg * Math.PI * 10;
                const gearAngle2 = -secondaryProg * Math.PI * 18;
                drawGear(ctx, 280, 260, 50, 18, gearAngle1, "#cccccc");
                drawGear(ctx, 350, 240, 28, 10, gearAngle2, "#ffffff");

                // Piston & copper plumbing pipe
                const pistonY = 260 + Math.sin(gearAngle1) * 25;
                ctx.lineWidth = 3;
                drawHandLine(ctx, 280, pistonY, 280, 440, 0.2, 2);
                ctx.strokeRect(340, 360, 20, 100);
                drawSteelHatch(ctx, 340, 360, 20, 100);
                ctx.restore();

                // Water pulses flowing up pipe into sink basin in grayscale (secondary animation)
                if (secondaryProg > 0) {
                    const pulseOffset = (secondaryProg * 250) % 80;
                    ctx.fillStyle = "#cccccc";
                    for (let w = 0; w < 3; w++) {
                        const wy = 440 - ((pulseOffset + w * 30) % 80);
                        if (wy > 360)
                            ctx.fillRect(344, wy, 12, 14);
                    }
                }
                drawDimensionLine(ctx, 160, 500, 640, 500, "MECHANIZED PUMP & INDOOR PLUMBING", "#ffffff", 6, "#ffffff");
            }

            const titles = ["STEAM-MILLED BALLOON FRAMING", "METALLURGICAL REINFORCEMENT", "MECHANIZED PUMP & PLUMBING"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `S-103.${phase.idx + 1}`, "3/4\" = 1'-0\"", "NOV 1954", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 3: 1900 - Gradual Farm Improvements (Agrarian Complex, Boundary Walls, Irrigation Sluice)
    {
        initSVG: (g, width, height) => {
            addSVGImage(g, IMAGE_SOURCES.topo1, 0, 0, width, height, 0.28, "screen");

            addSVGCallout(g, 220, 200, 160, 240, "TIMBER FRAME BARN & GRANARY", "MULTI-BUILDING AGRARIAN COMPLEX", "stage3-p0-1", 0);
            addSVGCallout(g, 540, 200, 480, 250, "45 CULTIVATED ACRES SITE PLAN", "OPERATIONAL EFFICIENCY LAYOUT", "stage3-p0-2", 0);

            addSVGCallout(g, 240, 220, 180, 270, "DRY-STONE BOUNDARY WALLS", "FROST-HEAVED FIELDSTONE ASSEMBLY", "stage3-p1-1", 1);
            addSVGCallout(g, 540, 240, 480, 290, "WILDLIFE MICROHABITAT ENCLOSURES", "NATIVE BIRDS & BENEFICIAL POLLINATORS", "stage3-p1-2", 1);

            addSVGCallout(g, 260, 240, 200, 300, "IRRIGATION SLUICE CHANNEL", "STRUCTURED WATER MANAGEMENT", "stage3-p2-1", 2);
            addSVGCallout(g, 540, 280, 480, 340, "ADJUSTABLE WEIR GATE CONTROL", "NOURISHING HEIRLOOM ORCHARDS", "stage3-p2-2", 2);

            addSVGTitleBlock(g, "AGRARIAN COMPLEX & IRRIGATION", "C-104", "1900", "SCALE: 1\" = 100'-0\"", "APR 1955");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            drawImageIfLoaded(ctx, getOrLoadImage("topo1"), 0, 0, width, height, 0.25, "screen");

            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            if (phase.idx === 0) {
                // P0: Agrarian Complex Expansion
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.emerald, "wc3", secondaryProg, "fade");
                drawDioramaPlatform(ctx, 80, 380, 640, 100, 20, "#111111", "#ffffff", 0.035);
                // Center homestead
                drawSketchRect(ctx, 360, 310, 80, 70);
                drawMasonryHatch(ctx, 360, 310, 80, 70);

                // Outbuildings sliding out on tracks during assemblyProg
                const slide = 220 * easeOutQuart(assemblyProg);
                drawSketchRect(ctx, 360 - slide, 280, 100, 100); // Barn left
                drawCrossSectionHatching(ctx, 360 - slide, 280, 100, 100, 8, Math.PI / 4, "rgba(204, 204, 204, 0.4)");
                drawSketchRect(ctx, 440 + slide - 80, 320, 80, 60); // Granary right
                drawCrossSectionHatching(ctx, 440 + slide - 80, 320, 80, 60, 8, -Math.PI / 4, "rgba(204, 204, 204, 0.4)");
                // Secondary animation: Courtyard pathways and orchard trees
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 2 * secondaryProg;
                    drawHandLine(ctx, 360 - slide + 100, 350, 360, 350, 0.4, 3);
                    drawHandLine(ctx, 440, 350, 440 + slide - 80, 350, 0.4, 3);
                }
                drawDimensionLine(ctx, 100, 500, 700, 500, "MULTI-BUILDING AGRARIAN SITE PLAN (45 ACRES)", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Dry-Stone Boundary Walls
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.amberGold, "wcWash", secondaryProg, "circular", { cx: width / 2, cy: height / 2 });
                // Buildings in soft background
                ctx.save();
                ctx.globalAlpha = 0.25;
                drawSketchRect(ctx, 140, 280, 100, 100);
                drawSketchRect(ctx, 360, 310, 80, 70);
                drawSketchRect(ctx, 580, 320, 80, 60);
                ctx.restore();

                // Miles of boundary walls constructing across pasture during assemblyProg
                const wallLen = 560 * easeOutQuart(assemblyProg);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                drawHandLine(ctx, 120, 400, 120 + wallLen, 400, 0.5, 8);
                for (let wx = 120; wx < 120 + wallLen; wx += 25) {
                    ctx.strokeRect(wx, 392, 22, 16);
                    drawMasonryHatch(ctx, wx, 392, 22, 16);
                }
                // Secondary animation: Silhouettes of native pollinators/birds in grayscale
                if (secondaryProg > 0) {
                    ctx.fillStyle = "#cccccc";
                    for (let b = 0; b < 4; b++) {
                        const bx = 160 + b * 130 + Math.sin(secondaryProg * 10 + b) * 15;
                        const by = 360 + Math.cos(secondaryProg * 8 + b) * 10;
                        ctx.beginPath();
                        ctx.arc(bx, by, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                drawDimensionLine(ctx, 120, 450, 680, 450, "DRY-STONE FIELDSTONE BOUNDARY WALLS & MICROHABITAT", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Water Management & Irrigation Sluice
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.blueprintBlue, "wc1", secondaryProg, "slide", { direction: "left-to-right" });
                drawDioramaPlatform(ctx, 140, 340, 520, 140, 20, "#111111", "#ffffff", -0.03);

                // Sluice channel & weir gate frame moving into place during assemblyProg
                const dropY = (1 - easeOutQuart(assemblyProg)) * 40;
                ctx.save();
                ctx.translate(0, -dropY);
                ctx.strokeRect(200, 340, 400, 80);
                drawEarthHatch(ctx, 200, 420, 400, 60, "rgba(255, 255, 255, 0.25)");
                ctx.restore();

                // Secondary animation: Wooden weir gate lifting & rushing water
                const gateLift = 50 * easeOutQuart(secondaryProg);
                ctx.fillStyle = "#cccccc";
                ctx.fillRect(380, 340 - gateLift, 20, 80);
                ctx.strokeRect(380, 340 - gateLift, 20, 80);

                // Rushing irrigation water in grayscale
                if (gateLift > 5) {
                    ctx.strokeStyle = "#666666";
                    ctx.lineWidth = 3;
                    const ripple = (secondaryProg * 300) % 40;
                    for (let wy = 360; wy < 410; wy += 12) {
                        drawHandLine(ctx, 210, wy, 375, wy, 0.2, 2);
                        drawHandLine(ctx, 405 + ripple, wy, 590, wy, 0.5, 4);
                    }
                }
                drawDimensionLine(ctx, 200, 500, 600, 500, "STRUCTURED IRRIGATION SLUICE & WEIR GATE CONTROL", "#ffffff", 6, "#ffffff");
            }

            const titles = ["AGRARIAN COMPLEX EXPANSION", "DRY-STONE BOUNDARY WALLS", "IRRIGATION SLUICE & WEIR GATE"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `C-104.${phase.idx + 1}`, "1\" = 100'-0\"", "APR 1955", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 4: 1950 - Decline & Abandonment (Weathering, Roof Sag, Botanical Reclamation)
    {
        initSVG: (g, width, height) => {
            addSVGImage(g, IMAGE_SOURCES.topo2, 0, 0, width, height, 0.28, "screen");

            addSVGCallout(g, 260, 200, 200, 250, "PROLONGED WEATHERING & EXPOSURE", "MAINTENANCE CEASED / ABANDONED", "stage4-p0-1", 0);
            const badge = createSVGElement("g", { class: "tech-stamp-badge", transform: "rotate(-3, 480, 180)", "data-phase": "0" });
            const bRect = createSVGElement("rect", { x: 0, y: 0, width: 260, height: 44, fill: "#0a0a0a", stroke: "#ffffff", "stroke-width": "3" });
            const bText = createSVGElement("text", { x: 14, y: 28, fill: "#ffffff", "font-family": '"Impact", "Arial Black", sans-serif', "font-size": "14", "font-weight": "900", "letter-spacing": "0.08em" });
            bText.textContent = "CONDEMNED // ABANDONED 1950";
            badge.append(bRect, bText);
            g.appendChild(badge);

            addSVGStressArrow(g, 300, 160, 300, 280, "DEAD LOAD: 45 LBS/SQ FT", "stage4-p1-arr1", 1);
            addSVGCallout(g, 240, 360, 180, 390, "ROOF RAFTER DEFLECTION", "8.5\" MAX SAG (STRUCTURAL FAILURE)", "stage4-p1-1", 1);
            addSVGCallout(g, 540, 380, 460, 420, "SEVERE MORTAR LEACHING", "LIME EROSION / FOUNDATION FISSURES", "stage4-p1-2", 1);

            addSVGCallout(g, 240, 220, 180, 280, "BOTANICAL RECLAMATION", "WILD GRAPEVINE & VIRGINIA CREEPER", "stage4-p2-1", 2);
            addSVGCallout(g, 540, 340, 480, 400, "PIONEER TREE SPECIES", "TAKING ROOT IN FOUNDATION BEDS", "stage4-p2-2", 2);

            addSVGTitleBlock(g, "HOMESTEAD SURVEY & CONDEMNATION", "EX-101", "1950", "SCALE: 1/4\" = 1'-0\"", "1950-COND");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            drawImageIfLoaded(ctx, getOrLoadImage("topo2"), 0, 0, width, height, 0.25, "screen");

            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            if (phase.idx === 0) {
                // P0: Cultivation Ceased & Weathering
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.terracotta, "wcWash", secondaryProg, "circular", { cx: width / 2, cy: height / 2 });
                drawDioramaPlatform(ctx, 140, 350, 520, 120, 20, "#111111", "#ffffff", 0.03);
                // Building moves into position during assemblyProg
                const dropY = (1 - easeOutQuart(assemblyProg)) * 30;
                ctx.save();
                ctx.translate(0, -dropY);
                drawSketchRect(ctx, 220, 220, 360, 130);
                drawMasonryHatch(ctx, 220, 220, 360, 130);
                ctx.restore();

                // Secondary animation: Wind-driven rain and peeling finish animations in grayscale
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "rgba(204, 204, 204, 0.5)";
                    ctx.lineWidth = 1.5;
                    const rainOffset = (secondaryProg * 400) % 200;
                    for (let r = 0; r < 12; r++) {
                        const rx = 180 + r * 35 + rainOffset * 0.5;
                        const ry = 150 + ((rainOffset + r * 40) % 250);
                        drawHandLine(ctx, rx, ry, rx - 30, ry + 60, 0.2, 2);
                    }
                }
                drawDimensionLine(ctx, 140, 490, 660, 490, "ABANDONED HOMESTEAD / ENVIRONMENTAL EXPOSURE", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Roof Sag & Mortar Leaching
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.amberGold, "wc2", secondaryProg, "slide", { direction: "top-to-bottom" });
                drawDioramaPlatform(ctx, 140, 360, 520, 120, 20, "#111111", "#ffffff", 0.035);
                drawSketchRect(ctx, 200, 260, 400, 100);
                drawMasonryHatch(ctx, 200, 260, 400, 100, true);

                // During assemblyProg: Sagging roof ridge in quadratic curve (charcoal black)
                const sag = 65 * easeOutQuart(assemblyProg);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(180, 260);
                ctx.quadraticCurveTo(400, 260 + sag, 620, 260);
                ctx.stroke();

                // Secondary animation: Mortar leaching cracks
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 2.5;
                    const crack = 80 * secondaryProg;
                    ctx.beginPath();
                    ctx.moveTo(380, 260);
                    ctx.lineTo(390, 260 + crack * 0.4);
                    ctx.lineTo(375, 260 + crack * 0.8);
                    ctx.lineTo(385, 260 + crack);
                    ctx.stroke();
                }
                drawDimensionLine(ctx, 180, 300 + sag, 620, 300 + sag, "DEFLECTED ROOF RIDGE: 8.5\" MAX SAG", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Botanical Reclamation
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.emerald, "wc3", secondaryProg, "fade");
                drawDioramaPlatform(ctx, 140, 360, 520, 120, 20, "#111111", "#ffffff", -0.03);
                drawSketchRect(ctx, 200, 260, 400, 100);
                drawMasonryHatch(ctx, 200, 260, 400, 100, true);

                // During assemblyProg: roots establish; during secondaryProg: vines creep upward
                ctx.strokeStyle = "#cccccc";
                ctx.lineWidth = 3.5;
                const progressFactor = assemblyProg * 0.3 + secondaryProg * 0.7;
                for (let v = 0; v < 6; v++) {
                    const startX = 220 + v * 65;
                    const maxH = 140 + (v % 3) * 30;
                    const currH = maxH * easeOutQuart(progressFactor);
                    ctx.beginPath();
                    ctx.moveTo(startX, 360);
                    ctx.bezierCurveTo(startX - 30, 360 - currH * 0.4, startX + 30, 360 - currH * 0.7, startX - 15, 360 - currH);
                    ctx.stroke();

                    if (currH > 30 && secondaryProg > 0) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(startX - 15, 360 - currH, 6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                drawDimensionLine(ctx, 140, 500, 660, 500, "BOTANICAL RECLAMATION // VIRGINIA CREEPER CANOPY", "#ffffff", 6, "#ffffff");
            }

            const titles = ["WEATHERING & ABANDONMENT", "ROOF SAG & MORTAR LEACHING", "BOTANICAL RECLAMATION"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `EX-101.${phase.idx + 1}`, "1/4\" = 1'-0\"", "1950-COND", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 5: 1980 - Modernization Planning (Blueprint Overlays, Hydraulic Jacking, Epoxy Splicing)
    {
        initSVG: (g, width, height) => {
            addSVGImage(g, IMAGE_SOURCES.topo3, 0, 0, width, height, 0.28, "screen");
            addSVGImage(g, IMAGE_SOURCES.grid, 0, 0, width, height, 0.2, "screen");

            addSVGCallout(g, 240, 180, 180, 240, "CRISP BLUEPRINT OVERLAYS", "HERITAGE CONSERVATION ASSESSMENT", "stage5-p0-1", 0);
            addSVGCallout(g, 540, 220, 480, 270, "LASER TRANSIT REALIGNMENT DATUM", "PRECISION ELEVATION SURVEY (REF A-4)", "stage5-p0-2", 0);

            addSVGStressArrow(g, 300, 480, 300, 380, "12-TON HYDRAULIC LIFT", "stage5-p1-arr1", 1);
            addSVGStressArrow(g, 500, 480, 500, 380, "LOAD TRANSFER TO BEDROCK", "stage5-p1-arr2", 1);
            addSVGCallout(g, 240, 260, 180, 320, "HYDRAULIC JACK REALIGNMENT", "LIFTING SAGGING FLOOR JOISTS TO LEVEL", "stage5-p1-1", 1);
            addSVGCallout(g, 540, 280, 480, 340, "STEEL W12x50 LINTEL & C-CHANNEL", "HIDDEN STRUCTURAL REINFORCEMENT", "stage5-p1-2", 1);

            addSVGCallout(g, 260, 240, 200, 300, "EPOXY RESIN TIMBER SPLICING", "CONSERVATION JOINERY INJECTION", "stage5-p2-1", 2);
            addSVGCallout(g, 540, 280, 480, 340, "RECLAIMED PERIOD HARDWOOD", "BRIDGING 18TH-C. AESTHETIC WITH CODE", "stage5-p2-2", 2);

            const badge = createSVGElement("g", { class: "tech-stamp-badge", transform: "rotate(-2, 480, 180)", "data-phase": "2" });
            const bRect = createSVGElement("rect", { x: 0, y: 0, width: 280, height: 44, fill: "#0a0a0a", stroke: "#ffffff", "stroke-width": "3" });
            const bText = createSVGElement("text", { x: 12, y: 27, fill: "#ffffff", "font-family": '"Impact", "Arial Black", sans-serif', "font-size": "13", "font-weight": "900", "letter-spacing": "0.06em" });
            bText.textContent = "RESIDENTIAL CODE COMPLIANT";
            badge.append(bRect, bText);
            g.appendChild(badge);

            addSVGTitleBlock(g, "STRUCTURAL CONSERVATION", "ST-201", "1980", "SCALE: 3/16\" = 1'-0\"", "MAY 1980");
        },
        updateSVG: (g, prog, width, height, phase) => {
            if (phase.idx === 1) {
                const lift1 = g.querySelector("#stage5-p1-arr1 line");
                const lift2 = g.querySelector("#stage5-p1-arr2 line");
                if (lift1 && lift2) {
                    const newY = 380 - phase.localProg * 35;
                    lift1.setAttribute("y2", String(newY));
                    lift2.setAttribute("y2", String(newY));
                }
            }
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            drawImageIfLoaded(ctx, getOrLoadImage("topo3"), 0, 0, width, height, 0.25, "screen");
            drawImageIfLoaded(ctx, getOrLoadImage("grid"), 0, 0, width, height, 0.2, "screen");

            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 30)
                drawHandLine(ctx, x, 0, x, height, 0.1, 2);
            for (let y = 0; y < height; y += 30)
                drawHandLine(ctx, 0, y, width, y, 0.1, 2);

            if (phase.idx === 0) {
                // P0: Architectural Blueprint Overlays & Laser Transit
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "grid", 0, 0, width, height, STYLE_CONFIG.palette.accents.blueprintBlue, "wc1", secondaryProg, "slide", { direction: "center-out" });
                drawDioramaPlatform(ctx, 140, 360, 520, 100, 20, "#111111", "#ffffff", 0.035);
                drawSketchRect(ctx, 200, 260, 400, 100);

                // During assemblyProg: Grayscale overlay sliding down into place
                const overlayH = 200 * easeOutQuart(assemblyProg);
                ctx.fillStyle = "rgba(204, 204, 204, 0.25)";
                ctx.fillRect(180, 240, 440, overlayH);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(180, 240, 440, overlayH);

                // Secondary animation: Pulsing laser transit reference line in grayscale
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 1 + 1.5 * secondaryProg;
                    ctx.setLineDash([6, 4]);
                    ctx.beginPath();
                    ctx.moveTo(100, 310);
                    ctx.lineTo(100 + 600 * secondaryProg, 310);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                drawDimensionLine(ctx, 180, 460, 620, 460, "BLUEPRINT OVERLAY & LASER TRANSIT DATUM", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Hydraulic Jacking & Steel Reinforcement
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo3", 0, 0, width, height, STYLE_CONFIG.palette.accents.terracotta, "wc2", secondaryProg, "slide", { direction: "left-to-right" });
                drawDioramaPlatform(ctx, 140, 380, 520, 80, 20, "#111111", "#ffffff", 0.03);

                // During assemblyProg: Sagging joists physically lifting back to horizontal level
                const initialSag = 35 * (1 - easeOutQuart(assemblyProg));
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(180, 340);
                ctx.quadraticCurveTo(400, 340 + initialSag, 620, 340);
                ctx.stroke();

                // Hydraulic jack cylinders extending upward during assemblyProg
                const jackH = 40 + (35 - initialSag);
                for (const jx of [280, 520]) {
                    ctx.strokeRect(jx - 18, 380 - jackH, 36, jackH);
                    drawSteelHatch(ctx, jx - 18, 380 - jackH, 36, jackH);
                }

                // Secondary animation: Steel I-Beam lintels sliding in horizontally
                if (secondaryProg > 0) {
                    const steelW = 440 * easeOutQuart(secondaryProg);
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(180, 260, steelW, 20);
                    drawSteelHatch(ctx, 180, 260, steelW, 20);
                }
                drawDimensionLine(ctx, 180, 480, 620, 480, "HYDRAULIC JACKING & STEEL REINFORCEMENT", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Epoxy Splicing & Code Compliance
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo3", 0, 0, width, height, STYLE_CONFIG.palette.accents.amberGold, "wc3", secondaryProg, "circular", { cx: width / 2, cy: height / 2 });
                drawDioramaPlatform(ctx, 160, 360, 480, 100, 20, "#111111", "#ffffff", -0.035);

                // Macro cutaway of timber sill moving into place during assemblyProg
                const dropY = (1 - easeOutQuart(assemblyProg)) * 30;
                ctx.save();
                ctx.translate(0, -dropY);
                ctx.strokeRect(220, 280, 360, 80);
                drawMasonryHatch(ctx, 220, 280, 200, 80); // Damaged timber left
                ctx.restore();

                // Secondary animation: Liquid epoxy injection filling rotted cavity
                if (secondaryProg > 0) {
                    const fillW = 160 * easeOutQuart(secondaryProg);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                    ctx.fillRect(420, 280, fillW, 80);
                    ctx.strokeRect(420, 280, fillW, 80);
                    drawCrossSectionHatching(ctx, 420 + fillW - 40, 280, Math.min(40, fillW), 80, 6, Math.PI / 4, "#cccccc");
                }
                drawDimensionLine(ctx, 220, 480, 580, 480, "EPOXY RESIN SPLICING & HARDWOOD JOINERY", "#ffffff", 6, "#ffffff");
            }

            const titles = ["BLUEPRINT OVERLAYS", "HYDRAULIC JACKING & STEEL", "EPOXY SPLICING & CODE"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `ST-201.${phase.idx + 1}`, "3/16\" = 1'-0\"", "MAY 1980", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 6: 2010 - Ecological Insulation (Thermal Envelope, Triple Glazing, Geothermal & Solar PV)
    {
        initSVG: (g, width, height) => {
            addSVGImage(g, IMAGE_SOURCES.topo1, 0, 0, width, height, 0.28, "screen");

            addSVGCallout(g, 240, 220, 180, 280, "CLOSED-CELL VAPOR BARRIER R-45", "AIRTIGHT THERMAL ENVELOPE SPRAY FOAM", "stage6-p0-1", 0);
            addSVGCallout(g, 540, 260, 480, 320, "ELIMINATION OF AIR INFILTRATION", "EXCEPTIONAL INSULATING PERFORMANCE", "stage6-p0-2", 0);

            addSVGCallout(g, 240, 200, 180, 260, "TRIPLE-PANE LOW-E GLAZING", "ARGON GAS FILLED / HISTORIC PROFILE", "stage6-p1-1", 1);
            addSVGCallout(g, 540, 240, 480, 300, "U-FACTOR 0.12 PERFORMANCE", "ZERO COLD BRIDGES / NO SOLAR GAIN", "stage6-p1-2", 1);

            addSVGCallout(g, 240, 220, 180, 280, "400' GEOTHERMAL BEDROCK LOOP", "CLOSED-LOOP RADIATIVE HEAT EXCHANGE", "stage6-p2-1", 2);
            addSVGCallout(g, 540, 200, 480, 250, "SOLAR PV ROOF ARRAY (-15% NET ENERGY)", "NET-ZERO CARBON CLEAN PRODUCER", "stage6-p2-2", 2);

            addSVGTitleBlock(g, "NET-ZERO RETROFIT", "ME-301", "2010", "SCALE: 3/16\" = 1'-0\"", "OCT 2010");
        },
        updateSVG: (g, prog, width, height, phase) => {
            if (phase.idx === 2) {
                const pvCallout = g.querySelector("#stage6-p2-2 text:first-of-type");
                if (pvCallout) {
                    const gen = Math.round(15 * phase.localProg);
                    pvCallout.textContent = `SOLAR PV ARRAY (-${gen}% NET ENERGY)`;
                }
            }
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            drawImageIfLoaded(ctx, getOrLoadImage("topo1"), 0, 0, width, height, 0.25, "screen");

            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 35)
                drawHandLine(ctx, x, 0, x, height, 0.15, 2);
            for (let y = 0; y < height; y += 35)
                drawHandLine(ctx, 0, y, width, y, 0.15, 2);

            if (phase.idx === 0) {
                // P0: Closed-Cell Thermal Envelope
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.amberGold, "wc2", secondaryProg, "fade");
                drawDioramaPlatform(ctx, 140, 360, 520, 100, 20, "#111111", "#ffffff", 0.035);

                // Wall stud framing cavities move into place during assemblyProg
                const dropY = (1 - easeOutQuart(assemblyProg)) * 40;
                ctx.save();
                ctx.translate(0, -dropY);
                for (let c = 0; c < 5; c++) {
                    const cx = 180 + c * 90;
                    ctx.strokeRect(cx, 220, 60, 140);
                }
                ctx.restore();

                // Secondary animation: Expanding spray foam insulation filling cavities & heat-loss bounce
                if (secondaryProg > 0) {
                    const foamH = 140 * easeOutQuart(secondaryProg);
                    for (let c = 0; c < 5; c++) {
                        const cx = 180 + c * 90;
                        if (foamH > 5)
                            drawInsulationHatch(ctx, cx, 220 + (140 - foamH), 60, foamH, secondaryProg, "#cccccc");
                    }
                }
                // Grayscale heat-loss arrows bouncing back from airtight barrier
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                for (let a = 0; a < 3; a++) {
                    const ay = 250 + a * 35;
                    drawHandLine(ctx, 120, ay, 175, ay, 0.2, 2);
                    if (secondaryProg > 0.3)
                        drawHandLine(ctx, 175, ay, 140, ay - 15, 0.2, 2); // Bounce back
                }
                drawDimensionLine(ctx, 140, 480, 660, 480, "R-45 AIRTIGHT CLOSED-CELL THERMAL ENVELOPE", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Triple-Pane Low-E Glazing
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.blueprintBlue, "wc1", secondaryProg, "slide", { direction: "left-to-right" });
                drawDioramaPlatform(ctx, 160, 380, 480, 80, 20, "#111111", "#ffffff", 0.03);

                // During assemblyProg: Old window sash sliding out left, new window sliding in right
                const slideOut = 200 * easeOutQuart(assemblyProg);
                ctx.save();
                ctx.globalAlpha = 1 - assemblyProg;
                drawSketchRect(ctx, 240 - slideOut, 220, 140, 160);
                ctx.restore();

                const slideIn = 200 * (1 - easeOutQuart(assemblyProg));
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                ctx.strokeRect(330 + slideIn, 220, 180, 160);
                for (let gL = 1; gL <= 2; gL++) {
                    ctx.beginPath();
                    ctx.moveTo(330 + slideIn + gL * 60, 220);
                    ctx.lineTo(330 + slideIn + gL * 60, 380);
                    ctx.stroke();
                }

                // Secondary animation: Argon gas insulation barrier illuminating between panes
                if (secondaryProg > 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * secondaryProg})`;
                    ctx.fillRect(330 + slideIn + 5, 222, 170, 156);
                }
                drawDimensionLine(ctx, 160, 480, 640, 480, "TRIPLE-PANE LOW-E ARGON GLAZING (U-0.12)", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Geothermal Loops & Solar PV
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo1", 0, 0, width, height, STYLE_CONFIG.palette.accents.emerald, "wc3", secondaryProg, "circular", { cx: width / 2, cy: height / 2 });
                drawDioramaPlatform(ctx, 140, 280, 520, 60, 20, "#111111", "#ffffff", -0.035);

                // Subterranean 400-ft geothermal bore loop moving into place during assemblyProg
                const boreDepth = 180 * easeOutQuart(assemblyProg);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(380, 280);
                ctx.lineTo(380, 280 + boreDepth);
                ctx.arc(395, 280 + boreDepth, 15, Math.PI, 0, true);
                ctx.lineTo(410, 280);
                ctx.stroke();

                // Secondary animation: Circulating heat-exchange fluid particles & solar PV array tilting
                if (secondaryProg > 0) {
                    const offset = (secondaryProg * 400) % (boreDepth * 2 + 40);
                    ctx.fillStyle = "#666666"; // Down
                    ctx.fillRect(377, 280 + Math.min(boreDepth, offset), 6, 12);
                    ctx.fillStyle = "#ffffff"; // Up
                    ctx.fillRect(407, 280 + boreDepth - Math.min(boreDepth, Math.max(0, offset - boreDepth)), 6, 12);
                }

                // Solar PV array tilting on roof
                drawPopUpProp(ctx, 240, 160, 320, 60, assemblyProg * 0.3 + secondaryProg * 0.7, (c, w, h, eased) => {
                    c.strokeStyle = "#ffffff";
                    c.lineWidth = 2.5;
                    c.strokeRect(0, 0, w, h);
                    for (let pv = 40; pv < w; pv += 40) {
                        c.beginPath();
                        c.moveTo(pv, 0);
                        c.lineTo(pv, h);
                        c.stroke();
                    }
                });
                drawDimensionLine(ctx, 140, 490, 660, 490, "400' GEOTHERMAL LOOP & SOLAR PV ARRAY", "#ffffff", 6, "#ffffff");
            }

            const titles = ["AIRTIGHT THERMAL ENVELOPE", "TRIPLE-PANE LOW-E GLAZING", "GEOTHERMAL & SOLAR PV"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `ME-301.${phase.idx + 1}`, "3/16\" = 1'-0\"", "OCT 2010", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 7: Present - Modern Design (Minimalist Synthesis, Cantilever Steel & Glass, Riparian Landscape)
    {
        initSVG: (g, width, height) => {
            addSVGImage(g, IMAGE_SOURCES.topo2, 0, 0, width, height, 0.25, "screen");
            addSVGImage(g, IMAGE_SOURCES.grid, 0, 0, width, height, 0.2, "screen");

            addSVGCallout(g, 240, 220, 180, 280, "PRESERVED 1780 FIELDSTONE HEARTH", "TACTILE HISTORIC MONUMENT IN LIGHT", "stage7-p0-1", 0);
            addSVGCallout(g, 540, 260, 480, 320, "HAND-HEWN TIMBER POSTS", "CENTURIES-OLD CRAFTSMANSHIP", "stage7-p0-2", 0);

            addSVGCallout(g, 240, 180, 180, 240, "CANTILEVERED BLACK STEEL I-BEAM", "W18x86 STRUCTURAL TENSION FLANGE", "stage7-p1-1", 1);
            addSVGCallout(g, 540, 260, 480, 320, "FRAMELESS GLASS CURTAIN WALL", "24'-0'' CANTILEVER SPAN CURTAIN", "stage7-p1-2", 1);
            addSVGStressArrow(g, 360, 340, 360, 240, "SUPPORT REACTION: 45 KIPS", "stage7-p1-arr", 1);

            addSVGCallout(g, 240, 200, 180, 260, "3,800 SQ. FT. SYNTHESIZED RESIDENCE", "MINIMALIST ARCHITECTURAL SYNTHESIS", "stage7-p2-1", 2);
            addSVGCallout(g, 540, 280, 480, 340, "RESTORED RIPARIAN WETLANDS", "NATIVE MEADOW GRASSES & RIPARIAN SITE", "stage7-p2-2", 2);

            addSVGTitleBlock(g, "MODERNIST SYNTHESIS", "A-500", "PRESENT", "SCALE: 1/8\" = 1'-0\"", "PRESENT");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            drawImageIfLoaded(ctx, getOrLoadImage("topo2"), 0, 0, width, height, 0.25, "screen");
            drawImageIfLoaded(ctx, getOrLoadImage("grid"), 0, 0, width, height, 0.2, "screen");

            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.15, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.15, 2);

            if (phase.idx === 0) {
                // P0: Minimalist Architectural Synthesis (Historic Hearth Monument in Light)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.emerald, "wc3", secondaryProg, "circular", { cx: width / 2, cy: height / 2 });
                drawDioramaPlatform(ctx, 120, 360, 560, 100, 20, "#111111", "#ffffff", 0.035);

                // During assemblyProg: Restored 1780 hearth and timbers sliding into gallery spotlight
                const slide = 150 * easeOutQuart(assemblyProg);
                drawSketchRect(ctx, 160 + slide, 220, 140, 140);
                drawMasonryHatch(ctx, 160 + slide, 220, 140, 140, true);

                // Secondary animation: Gallery spotlight cone from above in grayscale
                if (secondaryProg > 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * secondaryProg})`;
                    ctx.beginPath();
                    ctx.moveTo(230 + slide, 100);
                    ctx.lineTo(130 + slide, 360);
                    ctx.lineTo(330 + slide, 360);
                    ctx.closePath();
                    ctx.fill();
                }
                drawDimensionLine(ctx, 120, 480, 680, 480, "HISTORIC 1780 HEARTH & TIMBERS AS TACTILE MONUMENTS", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Cantilevered Black Steel & Frameless Glass
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.blueprintBlue, "wc1", secondaryProg, "slide", { direction: "left-to-right" });
                drawDioramaPlatform(ctx, 120, 380, 560, 80, 20, "#111111", "#ffffff", 0.03);
                drawSketchRect(ctx, 140, 240, 120, 140); // Core masonry left

                // During assemblyProg: Black steel I-beam cantilevering horizontally into space
                const spanW = 360 * easeOutQuart(assemblyProg);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(260, 240, spanW, 26);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(260, 240, spanW, 26);
                drawSteelHatch(ctx, 260, 240, spanW, 26);

                // Secondary animation: Frameless glass curtain wall panels descending
                if (secondaryProg > 0) {
                    const glassH = 114 * easeOutQuart(secondaryProg);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(280, 266, spanW - 30, glassH);
                    for (let gx = 340; gx < 280 + spanW - 30; gx += 60) {
                        ctx.beginPath();
                        ctx.moveTo(gx, 266);
                        ctx.lineTo(gx, 266 + glassH);
                        ctx.stroke();
                    }
                }
                drawDimensionLine(ctx, 260, 480, 260 + spanW, 480, "24'-0\" CANTILEVER SPAN & FRAMELESS GLASS", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Living Architecture in Riparian Landscape
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawColorizedBackground(ctx, "topo2", 0, 0, width, height, STYLE_CONFIG.palette.accents.amberGold, "wcWash", secondaryProg, "fade");
                drawDioramaPlatform(ctx, 100, 360, 600, 100, 20, "#111111", "#ffffff", -0.035);

                // During assemblyProg: Full residence moves into wide isometric view
                const dropY = (1 - easeOutQuart(assemblyProg)) * 30;
                ctx.save();
                ctx.translate(0, -dropY);
                drawSketchRect(ctx, 160, 260, 120, 100); // Historic wing
                drawMasonryHatch(ctx, 160, 260, 120, 100, true);
                ctx.fillRect(280, 270, 320, 22); // Cantilever wing
                drawSteelHatch(ctx, 280, 270, 320, 22);
                ctx.strokeRect(300, 292, 280, 68); // Glass wall
                ctx.restore();

                // Secondary animation: Animated native meadow grasses & riparian wetland ripples in grayscale
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 2 * secondaryProg;
                    const ripple = (secondaryProg * 300) % 50;
                    for (let r = 0; r < 4; r++) {
                        const ry = 400 + r * 15;
                        drawHandLine(ctx, 120, ry, 300, ry, 0.3, 2);
                        drawHandLine(ctx, 350 + ripple, ry, 680, ry, 0.5, 4);
                    }
                }
                drawDimensionLine(ctx, 100, 490, 700, 490, "3,800 SQ. FT. LIVING ARCHITECTURE // 1780 – PRESENT", "#ffffff", 6, "#ffffff");
            }

            const titles = ["HISTORIC HEARTH MONUMENT", "CANTILEVER STEEL & GLASS", "RIPARIAN SITE SYNTHESIS"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `A-500.${phase.idx + 1}`, "1/8\" = 1'-0\"", "PRESENT", "#ffffff", "#0a0a0a");
        }
    }
];
