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

/* eslint-disable-next-line no-unused-vars */
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

/* eslint-disable-next-line no-unused-vars */
let offscreenCanvas = null;
/* eslint-disable-next-line no-unused-vars */
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

/* eslint-disable-next-line no-unused-vars */
function applyCircularFocusClip(ctx, x, y, maxRadius, prog) {
    const r = maxRadius * Math.max(0, Math.min(1, prog));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
}

/* eslint-disable-next-line no-unused-vars */
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

/* eslint-disable-next-line no-unused-vars */
export function drawTintedBrush(ctx, imgKey, x, y, w, h, color, alpha = 0.5, blendMode = "screen", prog = 1.0, revealMode = "fade", revealArgs = {}) {
    if (prog <= 0)
        return;
    ctx.save();
    ctx.globalAlpha = alpha * Math.max(0, Math.min(1, prog));
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

export function getLandscapeRevealTiming(localProg) {
    const p = Math.max(0.0, Math.min(1.0, localProg));
    const colorProg = Math.max(0.0, Math.min(1.0, p / 0.60));
    const labelProg = Math.max(0.0, Math.min(1.0, (p - 0.60) / 0.40));
    return { colorProg, labelProg };
}

function getPhaseTiming(localProg) {
    const assemblyProg = Math.min(1.0, localProg / 0.35);
    const secondaryProg = Math.max(0.0, Math.min(1.0, (localProg - 0.35) / 0.35));
    const holdProg = Math.max(0.0, Math.min(1.0, (localProg - 0.70) / 0.30));
    return { assemblyProg, secondaryProg, holdProg };
}

/* eslint-disable-next-line no-unused-vars */
export function drawColorizedBackground(ctx, bgKey, x, y, w, h, color, wcKey = "wc1", prog = 1.0, revealMode = "fade", revealArgs = {}) {
    if (prog <= 0)
        return;
    ctx.save();
    ctx.globalAlpha = 0.75 * Math.max(0, Math.min(1, prog));
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
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
            g.style.transition = "none";

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

/* eslint-disable-next-line no-unused-vars */
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

function drawRoundRect(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
    }
}

/* Dimension Line with Independent & Irregular Shadow Angle */
function drawDimensionLine(ctx, x1, y1, x2, y2, label, color = "#ffffff", tickSize = 6, bgColor = "#0a0a0a") {
    ctx.save();
    ctx.strokeStyle = "#D12B3E";
    ctx.fillStyle = "#D12B3E";
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
    drawRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 4);
    ctx.fill();
    ctx.restore();

    // Foreground box at different angle
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(-0.015); // -0.9 deg
    const badgeBgColor = bgColor === "#ffffff" || bgColor === "#000000" ? "#0a0a0a" : bgColor;
    drawRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 4);
    ctx.fillStyle = badgeBgColor;
    ctx.fill();
    ctx.strokeStyle = "#D12B3E";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, 0, 1);
    ctx.restore();

    ctx.restore();
}

function drawSurveyReticle(ctx, x, y, radius, label, color = "#ffffff") {
    ctx.save();
    ctx.strokeStyle = "#D12B3E";
    ctx.fillStyle = "#D12B3E";
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
        ctx.fillStyle = "#ffffff";
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
    drawRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 6);
    ctx.fill();
    ctx.restore();

    // Main box
    ctx.save();
    ctx.translate(bx + boxW / 2, by + boxH / 2);
    ctx.rotate(-0.014); // -0.8 deg
    drawRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 6);
    ctx.fillStyle = bgColor;
    ctx.fill();

    ctx.strokeStyle = "#D12B3E";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-boxW / 2, -boxH / 2 + 24);
    ctx.lineTo(-boxW / 2 + boxW, -boxH / 2 + 24);
    ctx.strokeStyle = "#D12B3E";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-boxW / 2 + 195, -boxH / 2 + 24);
    ctx.lineTo(-boxW / 2 + 195, -boxH / 2 + boxH);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("PROJECT: EVOLUTION OF A HOUSE", -boxW / 2 + 8, -boxH / 2 + 16);

    ctx.font = "bold 10px monospace";
    ctx.fillText(title, -boxW / 2 + 8, -boxH / 2 + 40);
    ctx.fillStyle = "#cccccc";
    ctx.font = "9px monospace";
    ctx.fillText(`SCALE: ${scale}`, -boxW / 2 + 8, -boxH / 2 + 51);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`DWG ${dwgNo}`, -boxW / 2 + 203, -boxH / 2 + 40);
    ctx.fillStyle = "#cccccc";
    ctx.font = "8px monospace";
    ctx.fillText(`DATE: ${date}`, -boxW / 2 + 203, -boxH / 2 + 51);
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
    group.style.transition = "none";

    const leader = createSVGElement("polyline", {
        points: `${targetX},${targetY} ${x + (targetX > x ? 20 : -20)},${y} ${x},${y}`,
        fill: "none",
        stroke: "#D12B3E",
        "stroke-width": "1.8",
        "stroke-dasharray": "4, 2",
    });
    group.appendChild(leader);

    const targetDot = createSVGElement("circle", {
        cx: targetX, cy: targetY, r: 4,
        fill: "#D12B3E", stroke: "#ffffff", "stroke-width": "1.2",
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
        fill: "#000000", rx: "4", ry: "4",
        transform: `rotate(${shadowTilt}, ${bx + boxW / 2}, ${by + boxH / 2})`
    });
    group.appendChild(shadowBg);

    const labelBg = createSVGElement("rect", {
        x: bx, y: by, width: boxW, height: boxH,
        fill: "#0a0a0a", stroke: "#D12B3E", "stroke-width": "2", rx: "4", ry: "4",
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
    group.style.transition = "none";
    group.setAttribute("data-base-x1", String(x1));
    group.setAttribute("data-base-y1", String(y1));
    group.setAttribute("data-base-x2", String(x2));
    group.setAttribute("data-base-y2", String(y2));

    const line = createSVGElement("line", {
        x1, y1, x2, y2,
        stroke: "#D12B3E", "stroke-width": "2.5", class: "tech-arrow-line",
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
        fill: "#D12B3E", class: "tech-arrow-head",
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
    box.style.transition = "none";

    // Independent shadow rotated differently (+1.7 deg vs -1.2 deg)
    const shadow = createSVGElement("rect", {
        x: 488, y: 520, width: 300, height: 70,
        fill: "#000000", rx: "6", ry: "6",
        transform: "rotate(1.7, 638, 555)"
    });
    box.appendChild(shadow);

    const frameGroup = createSVGElement("g", { transform: "rotate(-1.2, 630, 545)" });
    const frame = createSVGElement("rect", {
        x: 480, y: 510, width: 300, height: 70,
        fill: "#0a0a0a", stroke: "#D12B3E", "stroke-width": "2.5", rx: "6", ry: "6",
    });
    frameGroup.appendChild(frame);

    const div1 = createSVGElement("line", { x1: 480, y1: 535, x2: 780, y2: 535, stroke: "#D12B3E", "stroke-width": "1.5" });
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
        if (targetPhase === null || targetPhase === "" || parseInt(targetPhase, 10) <= phaseIdx) {
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

            // P0 callouts
            addSVGCallout(g, 25, 50, 180, 260, "OLD-GROWTH VIRGIN CANOPY", "HEMLOCK, OAK & MAPLE CLEARING", "stage0-callout1", 0);
            addSVGCallout(g, 490, 50, 420, 430, "320 SQ. FT. CLEARING", "SURVEY STAKED HOMESTEAD", "stage0-callout2", 0);

            // P1 callouts
            addSVGCallout(g, 25, 210, 180, 380, "INTERLOCKING NOTCHED JOINTS", "BROADAXE HEWN / NO IRON NAILS", "stage0-callout3", 1);
            addSVGCallout(g, 520, 240, 460, 390, "RAMMED MOSS & CLAY CHINKING", "WINDBREAK INSULATION", "stage0-callout4", 1);

            // P2 callouts
            addSVGCallout(g, 25, 380, 160, 470, "SUBTERRANEAN DUG WELL", "TAPPING SURFACE WATER TABLE", "stage0-callout5", 2);
            addSVGCallout(g, 480, 410, 560, 350, "DRY-LAID FIELDSTONE HEARTH", "SOLE THERMAL HEATING & ILLUM.", "stage0-callout6", 2);

            addSVGTitleBlock(g, "EARLY SETTLEMENT HOMESTEAD", "A-101", "1780", "SCALE: 3/8\" = 1'-0\"", "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            // Helper to draw color blurs behind SVG callout target areas
            const drawTargetBlur = (x, y, colorRGB, alpha) => {
                if (alpha <= 0)
                    return;
                const grad = ctx.createRadialGradient(x, y, 5, x, y, 65);
                grad.addColorStop(0, `rgba(${colorRGB}, ${alpha * 0.5})`);
                grad.addColorStop(1, `rgba(${colorRGB}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, 65, 0, Math.PI * 2);
                ctx.fill();
            };

            // Base Diorama Platform with independent shadow angle
            drawDioramaPlatform(ctx, 80, 380, 640, 90, 20, "#111111", "#ffffff", 0.035);
            drawMechanicalTrack(ctx, 120, 425, 680, 425, "rgba(255, 255, 255, 0.35)");

            if (phase.idx === 0) {
                // P0: Timber Clearing & Homestead Footprint Stakeout
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;

                drawTargetBlur(180, 260, "34, 139, 34", colorProg);
                drawTargetBlur(420, 430, "50, 205, 50", colorProg);

                if (colorProg > 0) {
                    const alpha = 0.7 * colorProg;
                    const stakeAlpha = 0.6 * colorProg;
                    ctx.save();
                    const canopyGrad = ctx.createLinearGradient(200, 280, 200, 420);
                    canopyGrad.addColorStop(0, `rgba(34, 139, 34, ${alpha})`);
                    canopyGrad.addColorStop(1, "rgba(50, 205, 50, 0)");
                    ctx.fillStyle = canopyGrad;
                    ctx.fillRect(200, 280, 400, 140);

                    const stakeGrad = ctx.createLinearGradient(220, 380, 220, 440);
                    stakeGrad.addColorStop(0, `rgba(50, 205, 50, ${stakeAlpha})`);
                    stakeGrad.addColorStop(1, `rgba(34, 139, 34, ${stakeAlpha * 0.4})`);
                    ctx.fillStyle = stakeGrad;
                    ctx.fillRect(220, 380, 360, 60);

                    ctx.strokeStyle = `rgba(50, 205, 50, ${Math.min(1, stakeAlpha * 1.5)})`;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(220, 380, 360, 60);
                    ctx.restore();
                }

                // 12 Geometric Falling Trees (representing clearing the virgin canopy)
                for (let i = 0; i < 12; i++) {
                    const tx = 160 + i * 40;
                    const ty = 340 - (i % 3) * 15;
                    const fall = Math.min(1, Math.max(0, (assemblyProg * 2.5) - (i * 0.1)));
                    const easedFall = easeOutQuart(fall);
                    ctx.save();
                    ctx.translate(tx, ty);
                    ctx.rotate(easedFall * Math.PI / 2);
                    ctx.strokeStyle = `rgba(180, 180, 180, ${1 - easedFall * 0.8})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -25); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-8, -15); ctx.lineTo(0, -35); ctx.lineTo(8, -15); ctx.closePath(); ctx.stroke();
                    ctx.restore();
                }

                // Staked 320 sq. ft. clearing footprint dropping into place
                const dropY = (1 - easeOutQuart(assemblyProg)) * 40;
                ctx.save();
                ctx.translate(0, -dropY);
                drawSketchRect(ctx, 220, 400, 360, 40);
                drawEarthHatch(ctx, 220, 400, 360, 40, "rgba(255, 255, 255, 0.25)");
                ctx.strokeRect(260, 380, 280, 20);
                ctx.restore();

                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(140, 390);
                    ctx.lineTo(140 + 520 * secondaryProg, 390);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    drawSurveyReticle(ctx, 180, 380, 16 * secondaryProg, "BM #101 / 1780", "#ffffff");
                    drawSurveyReticle(ctx, 620, 380, 16 * secondaryProg, "CORNER STAKE", "#ffffff");
                }
                drawDimensionLine(ctx, 260, 450, 540, 450, "320 SQ. FT. SURVEY STAKED HOMESTEAD FOOTPRINT", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Hewn Log Carpentry & Interlocking Notched Joints
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;

                drawTargetBlur(180, 380, "200, 100, 50", colorProg);
                drawTargetBlur(460, 390, "150, 150, 150", colorProg);

                const maxLogs = 8;
                const logsToShow = Math.min(maxLogs, Math.floor(assemblyProg * maxLogs) + 1);
                const logH = 20;
                for (let l = 0; l < logsToShow; l++) {
                    const ly = 400 - (l + 1) * logH;
                    const dropOffset = l === logsToShow - 1 ? (1 - (assemblyProg * maxLogs % 1)) * 30 : 0;
                    ctx.save();
                    ctx.translate(0, -dropOffset);
                    if (colorProg > 0) {
                        const logAlpha = 0.75 * colorProg;
                        const chinkAlpha = 0.85 * colorProg;
                        const logGrad = ctx.createLinearGradient(180, ly, 180, ly + logH);
                        logGrad.addColorStop(0, `rgba(160, 90, 40, ${logAlpha * 0.9})`);
                        logGrad.addColorStop(1, `rgba(180, 110, 50, ${logAlpha})`);
                        ctx.fillStyle = logGrad;
                        ctx.fillRect(180, ly, 440, logH - 2);
                        ctx.fillRect(172, ly, 12, logH);
                        ctx.fillRect(616, ly, 12, logH);

                        if (l > 0) {
                            ctx.strokeStyle = `rgba(200, 90, 50, ${chinkAlpha})`;
                            ctx.lineWidth = 3 * colorProg;
                            drawHandLine(ctx, 190, ly + logH - 1, 610, ly + logH - 1, 0.5, 6);
                        }
                    }
                    drawSketchRect(ctx, 180, ly, 440, logH - 2);
                    drawMasonryHatch(ctx, 180, ly, 440, logH - 2);
                    ctx.strokeRect(172, ly, 12, logH);
                    ctx.strokeRect(616, ly, 12, logH);
                    if (l > 0 && secondaryProg > 0 && colorProg <= 0) {
                        ctx.strokeStyle = "#cccccc";
                        ctx.lineWidth = 3 * secondaryProg;
                        drawHandLine(ctx, 190, ly + logH - 1, 610, ly + logH - 1, 0.5, 6);
                    }
                    ctx.restore();
                }
                if (secondaryProg > 0.3)
                    drawDimensionLine(ctx, 172, 230, 200, 230, "INTERLOCKING NOTCH JOINT - NO IRON NAILS", "#ffffff", 6, "#ffffff");

                drawDimensionLine(ctx, 180, 450, 620, 450, "BROADAXE HEWN OAK LOG CARPENTRY & CHINKING", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Subterranean Dug Well & Dry-Laid Fieldstone Hearth
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;

                drawTargetBlur(160, 470, "0, 150, 250", colorProg);
                drawTargetBlur(560, 350, "255, 100, 20", colorProg);

                ctx.save();
                ctx.globalAlpha = 0.25;
                drawSketchRect(ctx, 240, 240, 320, 160);
                drawMasonryHatch(ctx, 240, 240, 320, 160);
                ctx.restore();

                const wellDepth = 150 * easeOutQuart(assemblyProg);
                drawSketchRect(ctx, 120, 400, 70, wellDepth);
                drawEarthHatch(ctx, 120, 400, 70, wellDepth, "rgba(204, 204, 204, 0.6)");
                if (colorProg > 0) {
                    const waterAlpha = 0.8 * colorProg;
                    const waterH = 22 * colorProg;
                    const waterY = 400 + wellDepth - (25 * colorProg);
                    ctx.save();
                    const waterGrad = ctx.createLinearGradient(124, waterY, 124, waterY + waterH);
                    waterGrad.addColorStop(0, `rgba(0, 180, 255, ${waterAlpha * 0.95})`);
                    waterGrad.addColorStop(1, `rgba(0, 100, 180, ${waterAlpha * 0.85})`);
                    ctx.fillStyle = waterGrad;
                    ctx.fillRect(124, waterY, 62, waterH);
                    ctx.restore();
                } else if (secondaryProg > 0) {
                    ctx.fillStyle = "#cccccc";
                    ctx.fillRect(124, 400 + wellDepth - (25 * secondaryProg), 62, 22 * secondaryProg);
                }

                const hearthH = 260 * easeOutQuart(assemblyProg);
                const hearthY = 400 - hearthH;
                if (colorProg > 0) {
                    const fireAlpha = 0.85 * colorProg;
                    ctx.save();
                    const fireGrad = ctx.createLinearGradient(550, 375, 550, hearthY + 2);
                    fireGrad.addColorStop(0, `rgba(255, 160, 20, ${fireAlpha * 0.75})`);
                    fireGrad.addColorStop(0.5, `rgba(220, 60, 10, ${fireAlpha * 0.45})`);
                    fireGrad.addColorStop(1, "rgba(180, 40, 10, 0)");
                    ctx.fillStyle = fireGrad;
                    ctx.fillRect(502, hearthY + 2, 96, hearthH - 4);
                    ctx.restore();
                }
                drawSketchRect(ctx, 500, hearthY, 100, hearthH);
                drawMasonryHatch(ctx, 500, hearthY, 100, hearthH, true);

                if (secondaryProg > 0) {
                    ctx.strokeStyle = colorProg > 0 ? `rgba(255, 160, 50, ${0.8 * colorProg})` : "#666666";
                    ctx.lineWidth = 2;
                    for (let r = 1; r <= 3; r++) {
                        ctx.beginPath();
                        ctx.arc(550, 360, r * 18 * secondaryProg, Math.PI, 1.5 * Math.PI);
                        ctx.stroke();
                    }

                    ctx.fillStyle = `rgba(255, 200, 50, ${0.8 * secondaryProg})`;
                    for (let p = 0; p < 10; p++) {
                        const sparkY = hearthY + hearthH - 30 - ((secondaryProg * 250 + p * 20) % 180);
                        const sparkX = 550 + Math.sin(secondaryProg * 15 + p) * 15;
                        ctx.save();
                        ctx.globalAlpha = 1 - (hearthY + hearthH - 30 - sparkY) / 180;
                        ctx.beginPath();
                        ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                }
                drawDimensionLine(ctx, 120, 460, 190, 460, "DUG WELL WATER TABLE", "#ffffff", 6, "#ffffff");
                drawDimensionLine(ctx, 500, 460, 600, 460, "DRY-LAID FIELDSTONE HEARTH", "#ffffff", 6, "#ffffff");
            }

            const titles = ["TIMBER CLEARING", "LOG CARPENTRY & CHINKING", "WELL & FIELDSTONE HEARTH"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `A-101.${phase.idx + 1}`, "3/8\" = 1'-0\"", "AUG 1952", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 1: 1810 - Geology & Landscape (Bedrock, Footings, Drainage)
    {
        initSVG: (g, width, height) => {

            addSVGCallout(g, 25, 50, 180, 320, "METAMORPHIC GRANITE BEDROCK", "SUBTERRANEAN STRATA SHELF", "stage1-p0-1", 0);
            addSVGCallout(g, 490, 50, 480, 410, "IMPERVIOUS DENSE CLAY SUBSOIL", "EXCAVATION PROFILE", "stage1-p0-2", 0);

            addSVGStressArrow(g, 300, 240, 300, 380, "GRAVITY KEYING LOAD", "stage1-p1-arr1", 1);
            addSVGStressArrow(g, 500, 240, 500, 380, "FROST HEAVE RESISTANCE", "stage1-p1-arr2", 1);
            addSVGCallout(g, 25, 210, 260, 350, "DRY-LAID FIELDSTONE FOOTINGS", "KEYED TO BEDROCK WITHOUT MORTAR", "stage1-p1-1", 1);
            addSVGCallout(g, 520, 240, 420, 320, "GLACIAL ERRATICS", "GEOMETRIC FRICTION LOCKING", "stage1-p1-2", 1);

            addSVGCallout(g, 25, 380, 210, 450, "PERIMETER TRENCH", "RUNOFF DIVERSION", "stage1-p2-2", 2);
            addSVGCallout(g, 480, 410, 280, 460, "GRAVITY DRAINAGE TRENCHING", "HYDROLOGICAL FLOW MAPPING", "stage1-p2-1", 2);

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
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            if (phase.idx === 0) {
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;

                const excavDepth = 180 * easeOutQuart(assemblyProg);
                drawDioramaPlatform(ctx, 120, 300, 560, excavDepth, 20, "#111111", "#ffffff", -0.025);
                if (colorProg > 0) {
                    const alpha = 0.8 * colorProg;
                    const topsoilH = Math.min(60, excavDepth);
                    const clayH = Math.max(0, Math.min(60, excavDepth - 60));
                    const bedrockH = Math.max(0, excavDepth - 120);

                    ctx.save();
                    if (topsoilH > 0) {
                        const topsoilGrad = ctx.createLinearGradient(120, 300, 120, 300 + topsoilH);
                        topsoilGrad.addColorStop(0, `rgba(139, 69, 19, ${alpha * 0.95})`);
                        topsoilGrad.addColorStop(1, `rgba(110, 50, 15, ${alpha * 0.75})`);
                        ctx.fillStyle = topsoilGrad;
                        ctx.fillRect(120, 300, 560, topsoilH);
                    }
                    if (clayH > 0) {
                        const clayGrad = ctx.createLinearGradient(120, 360, 120, 360 + clayH);
                        clayGrad.addColorStop(0, `rgba(180, 80, 40, ${alpha * 0.95})`);
                        clayGrad.addColorStop(1, `rgba(150, 60, 30, ${alpha * 0.8})`);
                        ctx.fillStyle = clayGrad;
                        ctx.fillRect(120, 360, 560, clayH);
                    }
                    if (bedrockH > 0) {
                        const bedrockGrad = ctx.createLinearGradient(120, 420, 120, 420 + bedrockH);
                        bedrockGrad.addColorStop(0, `rgba(80, 100, 120, ${alpha * 0.95})`);
                        bedrockGrad.addColorStop(1, `rgba(60, 75, 95, ${alpha * 0.85})`);
                        ctx.fillStyle = bedrockGrad;
                        ctx.fillRect(120, 420, 560, bedrockH);
                    }
                    ctx.restore();
                }
                drawEarthHatch(ctx, 120, 300, 560, Math.min(60, excavDepth), "rgba(255, 255, 255, 0.25)");
                if (excavDepth > 60)
                    drawCrossSectionHatching(ctx, 120, 360, 560, Math.min(60, excavDepth - 60), 8, Math.PI / 4, "rgba(204, 204, 204, 0.4)");

                if (excavDepth > 120)
                    drawMasonryHatch(ctx, 120, 420, 560, excavDepth - 120, true);

                if (assemblyProg > 0) {
                    ctx.strokeStyle = `rgba(200, 200, 200, ${assemblyProg})`;
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 5; i++) {
                        const probX = 180 + i * 80;
                        const probY = 300 + (excavDepth * (0.8 + i * 0.04));
                        drawHandLine(ctx, probX, 280, probX, probY, 0.2, 2);
                        ctx.beginPath();
                        ctx.arc(probX, probY, 4, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }

                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1.5;
                    drawHandLine(ctx, 120, 360, 680, 360, 0.2, 2);
                    drawHandLine(ctx, 120, 420, 680, 420, 0.2, 2);
                }

                if (colorProg > 0) {
                    ctx.save();
                    ctx.globalCompositeOperation = "screen";
                    const alpha = 0.5 * colorProg;
                    const g1 = ctx.createRadialGradient(180, 320, 0, 180, 320, 90);
                    g1.addColorStop(0, `rgba(139, 69, 19, ${alpha})`);
                    g1.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = g1;
                    ctx.fillRect(90, 230, 180, 180);

                    const g2 = ctx.createRadialGradient(480, 410, 0, 480, 410, 90);
                    g2.addColorStop(0, `rgba(180, 80, 40, ${alpha})`);
                    g2.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = g2;
                    ctx.fillRect(390, 320, 180, 180);
                    ctx.restore();
                }

                drawDimensionLine(ctx, 120, 510, 680, 510, "GEOLOGICAL STRATA PROFILE EXCAVATION (BEDROCK & CLAY)", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;
                drawDioramaPlatform(ctx, 120, 380, 560, 120, 20, "#111111", "#ffffff", 0.03);
                drawMasonryHatch(ctx, 120, 380, 560, 120, true);

                const numStones = 12;
                const stones = Math.floor(assemblyProg * numStones) + 1;
                for (let s = 0; s < Math.min(numStones, stones); s++) {
                    const sx = 130 + s * 45;
                    const sy = 320 + (s % 2) * 5;
                    const dropY = s === stones - 1 ? (1 - (assemblyProg * numStones % 1)) * 50 : 0;
                    ctx.save();
                    ctx.translate(0, -dropY);
                    if (colorProg > 0) {
                        const stoneAlpha = 0.8 * colorProg;
                        const stoneGrad = ctx.createLinearGradient(sx, sy, sx, sy + 60);
                        stoneGrad.addColorStop(0, `rgba(235, 170, 50, ${stoneAlpha * 0.95})`);
                        stoneGrad.addColorStop(0.5, `rgba(217, 149, 36, ${stoneAlpha})`);
                        stoneGrad.addColorStop(1, `rgba(160, 110, 30, ${stoneAlpha * 0.8})`);
                        ctx.fillStyle = stoneGrad;
                        ctx.fillRect(sx, sy, 40, 60);
                    }
                    drawSketchRect(ctx, sx, sy, 40, 60);
                    drawMasonryHatch(ctx, sx, sy, 40, 60);
                    ctx.strokeRect(sx - 2, sy - 2, 44, 64);
                    ctx.restore();
                }

                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 2.5 * secondaryProg;
                    for (let s = 0; s < numStones; s += 2)
                        drawHandLine(ctx, 150 + s * 45, 300, 150 + s * 45, 330, 0.2, 2);
                }

                if (colorProg > 0) {
                    ctx.save();
                    ctx.globalCompositeOperation = "screen";
                    const alpha = 0.5 * colorProg;
                    const g1 = ctx.createRadialGradient(260, 350, 0, 260, 350, 90);
                    g1.addColorStop(0, `rgba(235, 170, 50, ${alpha})`);
                    g1.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = g1;
                    ctx.fillRect(170, 260, 180, 180);

                    const g2 = ctx.createRadialGradient(420, 320, 0, 420, 320, 90);
                    g2.addColorStop(0, `rgba(217, 149, 36, ${alpha})`);
                    g2.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = g2;
                    ctx.fillRect(330, 230, 180, 180);
                    ctx.restore();
                }

                drawDimensionLine(ctx, 160, 300, 620, 300, "DRY-LAID GRAVITY KEYED FOOTINGS - BASE THICKNESS 2'-6\"", "#ffffff", 6, "#ffffff");

            } else {
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;
                const trenchW = 520 * easeOutQuart(assemblyProg);
                drawDioramaPlatform(ctx, 140, 320, trenchW, 160, 20, "#111111", "#ffffff", -0.035);
                drawMasonryHatch(ctx, 180, 340, Math.min(440, trenchW - 40), 100);

                if (colorProg > 0) {
                    const flowAlpha = 0.8 * colorProg;
                    const slopeDrop = (trenchW / 520) * 30 + 14;
                    ctx.save();
                    const flowGrad = ctx.createLinearGradient(140, 436, 140 + trenchW, 460 + slopeDrop);
                    flowGrad.addColorStop(0, `rgba(0, 200, 180, ${flowAlpha * 0.95})`);
                    flowGrad.addColorStop(0.5, `rgba(0, 160, 190, ${flowAlpha})`);
                    flowGrad.addColorStop(1, `rgba(0, 120, 200, ${flowAlpha * 0.85})`);
                    ctx.fillStyle = flowGrad;
                    ctx.fillRect(140, 436, trenchW, slopeDrop);

                    ctx.strokeStyle = `rgba(0, 220, 255, ${flowAlpha * 0.7})`;
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([12, 8]);
                    ctx.lineDashOffset = -(colorProg * 50);
                    for (let streamY = 445; streamY <= 465; streamY += 10) {
                        ctx.beginPath();
                        ctx.moveTo(140, streamY);
                        ctx.lineTo(140 + trenchW, streamY + (trenchW / 520) * 20);
                        ctx.stroke();
                    }
                    ctx.restore();
                }

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(140, 450);
                ctx.lineTo(140 + trenchW, 480);
                ctx.stroke();

                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 1.5 * secondaryProg;
                    for (let x = 160; x < 140 + trenchW; x += 30)
                        drawHandLine(ctx, x, 450 + ((x - 140) / 520) * 30, x, 465 + ((x - 140) / 520) * 30, 0.2, 2);

                }

                if (colorProg > 0) {
                    ctx.save();
                    ctx.globalCompositeOperation = "screen";
                    const alpha = 0.5 * colorProg;
                    const g1 = ctx.createRadialGradient(280, 450, 0, 280, 450, 90);
                    g1.addColorStop(0, `rgba(0, 200, 180, ${alpha})`);
                    g1.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = g1;
                    ctx.fillRect(190, 360, 180, 180);
                    ctx.restore();
                }

                drawDimensionLine(ctx, 140, 520, 660, 520, "GRAVITY DRAINAGE TRENCHING & FLOW MAPPING", "#ffffff", 6, "#ffffff");
            }

            const titles = ["GEOLOGICAL EXCAVATION", "DRY-LAID FOOTINGS", "GRAVITY DRAINAGE TRENCHING"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `G-102.${phase.idx + 1}`, "1/2\" = 1'-0\"", "SEP 1953", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 2: 1860 - Industrial Revolution (Balloon Framing, Metallurgy, Mechanized Pump)
    {
        initSVG: (g, width, height) => {

            addSVGCallout(g, 25, 50, 140, 260, "STEAM-MILLED DIMENSIONED LUMBER", "STANDARDIZED 2x4 BALLOON FRAMING", "stage2-p0-1", 0);
            addSVGCallout(g, 490, 50, 480, 270, "MASS-PRODUCED CUT WIRE NAILS", "RAPID INDUSTRIAL ASSEMBLY", "stage2-p0-2", 0);

            addSVGCallout(g, 25, 210, 160, 250, "WROUGHT IRON TIE-RODS", "TURNBUCKLE TENSION REINFORCEMENT", "stage2-p1-1", 1);
            addSVGCallout(g, 520, 240, 500, 240, "CAST-IRON LINTEL REINFORCEMENT", "EXPANSIVE PARLOR WINDOW OPENING", "stage2-p1-2", 1);

            addSVGCallout(g, 25, 380, 200, 280, "MECHANIZED WATER PUMP", "CAST-IRON 4:1 GEAR RATIO", "stage2-p2-1", 2);
            addSVGCallout(g, 480, 410, 420, 420, "INDOOR COPPER PLUMBING", "DEEP AQUIFER INTAKE - 60 FT", "stage2-p2-2", 2);

            addSVGTitleBlock(g, "BALLOON FRAMING & PUMP", "S-103", "1860", "SCALE: 3/4\" = 1'-0\"", "NOV 1954");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);

            const drawBlur = (x, y, radius, r, g, b, alpha) => {
                const blurGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
                blurGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
                blurGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                ctx.fillStyle = blurGrad;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            };

            if (phase.idx === 0 && secondaryProg > 0) {
                const a = 0.6 * secondaryProg;
                drawBlur(140, 260, 65, 210, 160, 70, a);
                drawBlur(480, 270, 65, 120, 180, 220, a);
            } else if (phase.idx === 1 && secondaryProg > 0) {
                const a = 0.6 * secondaryProg;
                drawBlur(160, 250, 65, 100, 130, 160, a);
                drawBlur(500, 240, 75, 180, 60, 40, a);
            } else if (phase.idx === 2 && secondaryProg > 0) {
                const a = 0.6 * secondaryProg;
                drawBlur(200, 280, 65, 70, 180, 210, a);
                drawBlur(420, 420, 65, 210, 120, 60, a);
            }

            ctx.strokeStyle = "#ffffff";
            ctx.fillStyle = "#ffffff";
            ctx.lineWidth = 1.8;

            if (phase.idx === 0) {
                drawDioramaPlatform(ctx, 120, 480, 560, 40, 20, "#111111", "#ffffff", 0.03);

                const sillY = 470 + (1 - easeOutQuart(assemblyProg)) * 30;
                ctx.strokeRect(140, sillY, 520, 10);
                drawSteelHatch(ctx, 140, sillY, 520, 10);

                const maxStudH = 280;
                const studH = maxStudH * easeOutQuart(assemblyProg);
                for (let s = 0; s < 8; s++) {
                    const sx = 150 + s * 70;
                    ctx.strokeRect(sx, sillY - studH, 12, studH);
                    drawHandLine(ctx, sx + 6, sillY, sx + 6, sillY - studH, 0.2, 2);

                    if (secondaryProg > 0) {
                        ctx.fillStyle = "#cccccc";
                        ctx.fillRect(sx + 2, sillY - 2, 4, 4 * secondaryProg);
                        ctx.fillRect(sx + 6, sillY - 2, 4, 4 * secondaryProg);
                        if (s < 7)
                            drawHandLine(ctx, sx + 12, sillY - studH * 0.5 * secondaryProg, sx + 60, sillY - studH * 0.8 * secondaryProg, 0.2, 2);

                    }
                }
                drawDimensionLine(ctx, 150, 530, 640, 530, "STEAM-MILLED BALLOON FRAMING STUDS @ 16\" O.C.", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                ctx.save();
                ctx.globalAlpha = 0.25;
                ctx.strokeRect(140, 470, 520, 10);
                for (let s = 0; s < 8; s++)
                    ctx.strokeRect(150 + s * 70, 190, 12, 280);
                ctx.restore();

                const spanW = 500 * easeOutQuart(assemblyProg);
                const winProg = easeOutQuart(secondaryProg);

                ctx.strokeRect(150, 230, spanW, 20);
                drawSteelHatch(ctx, 150, 230, spanW, 20);

                if (secondaryProg > 0) {
                    const tieY = 240 + (1 - winProg) * 20;
                    ctx.save();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = `rgba(100, 130, 160, ${0.85 * winProg})`;
                    drawHandLine(ctx, 150, tieY, 150 + 100 * winProg, tieY, 0.2, 2);
                    drawHandLine(ctx, 650, tieY, 650 - 100 * winProg, tieY, 0.2, 2);

                    ctx.strokeRect(150 + 100 * winProg, tieY - 4, 10, 8);
                    ctx.strokeRect(650 - 100 * winProg - 10, tieY - 4, 10, 8);
                    ctx.restore();

                    ctx.fillStyle = `rgba(180, 50, 30, ${0.8 * winProg})`;
                    ctx.fillRect(150, 270, 130 * winProg, 200);
                    ctx.fillRect(650 - 130 * winProg, 270, 130 * winProg, 200);

                    const sunAlpha = 0.4 * winProg;
                    const sunGrad = ctx.createLinearGradient(0, 270, 0, 470);
                    sunGrad.addColorStop(0, `rgba(255, 230, 140, ${sunAlpha})`);
                    sunGrad.addColorStop(1, "rgba(255, 230, 140, 0.0)");
                    ctx.fillStyle = sunGrad;
                    ctx.beginPath();
                    ctx.moveTo(280, 270);
                    ctx.lineTo(520, 270);
                    ctx.lineTo(580, 470);
                    ctx.lineTo(220, 470);
                    ctx.closePath();
                    ctx.fill();
                }
                drawDimensionLine(ctx, 150, 530, 650, 530, "CAST-IRON LINTEL & WROUGHT IRON TIE-ROD REINFORCEMENT", "#ffffff", 6, "#ffffff");

            } else {
                drawDioramaPlatform(ctx, 160, 380, 480, 120, 20, "#111111", "#ffffff", -0.03);

                const slideIn = (1 - easeOutQuart(assemblyProg)) * 50;
                ctx.save();
                ctx.translate(slideIn, 0);

                const gearAngle1 = secondaryProg * Math.PI * 10;
                const gearAngle2 = -secondaryProg * Math.PI * 18;
                drawGear(ctx, 300, 280, 54, 18, gearAngle1, "#cccccc");
                drawGear(ctx, 374, 258, 30, 10, gearAngle2, "#ffffff");

                const pistonY = 280 + Math.sin(gearAngle1) * 20;
                ctx.lineWidth = 4;
                drawHandLine(ctx, 300, pistonY, 300, 440, 0.2, 2);

                ctx.beginPath();
                ctx.moveTo(300, 280);
                ctx.lineTo(300 + 40 * Math.cos(gearAngle1), 280 + 40 * Math.sin(gearAngle1));
                ctx.stroke();

                if (secondaryProg > 0) {
                    const copperAlpha = 0.85 * easeOutQuart(secondaryProg);
                    ctx.fillStyle = `rgba(210, 120, 60, ${copperAlpha})`;

                    ctx.fillRect(380, 280, 18, 160);
                    ctx.fillRect(380, 280, 80 * secondaryProg, 18);

                    const pulseOffset = (secondaryProg * 200) % 60;
                    ctx.fillStyle = `rgba(50, 220, 255, ${0.9})`;
                    for (let w = 0; w < 3; w++) {
                        const wy = 440 - ((pulseOffset + w * 40) % 160);
                        if (wy > 280)
                            ctx.fillRect(384, wy, 10, 12);

                    }

                    const aqGrad = ctx.createLinearGradient(0, 420, 0, 500);
                    aqGrad.addColorStop(0, "rgba(0, 120, 200, 0.0)");
                    aqGrad.addColorStop(1, `rgba(0, 120, 200, ${copperAlpha})`);
                    ctx.fillStyle = aqGrad;
                    ctx.fillRect(160, 420, 480, 80);
                }
                ctx.restore();

                drawDimensionLine(ctx, 160, 530, 640, 530, "MECHANIZED PUMP & INDOOR COPPER PLUMBING", "#ffffff", 6, "#ffffff");
            }

            const titles = ["STEAM-MILLED BALLOON FRAMING", "METALLURGICAL REINFORCEMENT", "MECHANIZED PUMP & PLUMBING"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `S-103.${phase.idx + 1}`, "3/4\" = 1'-0\"", "NOV 1954", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 3: 1900 - Gradual Farm Improvements (Agrarian Complex, Boundary Walls, Irrigation Sluice)
    {
        initSVG: (g, width, height) => {

            addSVGCallout(g, 25, 50, 200, 270, "TIMBER FRAME BARN", "POST & BEAM STRUCTURE", "stage3-callout1", 0);
            addSVGCallout(g, 490, 50, 260, 220, "GRAIN GRANARY", "SILO STORAGE SYSTEM", "stage3-callout3", 0);
            addSVGCallout(g, 25, 210, 430, 290, "FROST-HEAVED WALLS", "DRY-STONE FIELDSTONE", "stage3-callout2", 1);
            addSVGCallout(g, 520, 240, 520, 310, "MICROHABITATS", "NATIVE POLLINATORS", "stage3-callout4", 1);
            addSVGCallout(g, 25, 380, 330, 380, "IRRIGATION SLUICE", "WATER MANAGEMENT", "stage3-callout5", 2);
            addSVGCallout(g, 480, 410, 480, 400, "ADJUSTABLE WEIR", "WATER DIVERSION", "stage3-callout6", 2);

            addSVGTitleBlock(g, "AGRARIAN COMPLEX & IRRIGATION", "C-104", "1900", "SCALE: 1\" = 100'-0\"", "APR 1955");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);

            const drawTargetBlur = (tx, ty, r, r1, g1, b1, p) => {
                if (p > 0) {
                    ctx.save();
                    const grad = ctx.createRadialGradient(tx, ty, r * 0.1, tx, ty, r);
                    grad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${p * 0.6})`);
                    grad.addColorStop(1, `rgba(${r1}, ${g1}, ${b1}, 0)`);
                    ctx.fillStyle = grad;
                    ctx.globalCompositeOperation = "screen";
                    ctx.fillRect(tx - r, ty - r, r * 2, r * 2);
                    ctx.restore();
                }
            };

            if (phase.idx >= 0) {
                const blurProg = phase.idx === 0 ? assemblyProg : 1;
                drawTargetBlur(200, 270, 70, 255, 100, 50, blurProg);
                drawTargetBlur(260, 220, 60, 200, 150, 50, blurProg);
            }
            if (phase.idx >= 1) {
                const blurProg = phase.idx === 1 ? assemblyProg : 1;
                drawTargetBlur(430, 290, 80, 100, 180, 100, blurProg);
                drawTargetBlur(520, 310, 60, 80, 140, 200, blurProg);
            }
            if (phase.idx >= 2) {
                const blurProg = phase.idx === 2 ? assemblyProg : 1;
                drawTargetBlur(330, 380, 60, 0, 150, 255, blurProg);
                drawTargetBlur(480, 400, 60, 50, 200, 220, blurProg);
            }

            if (phase.idx === 0) {
                drawDioramaPlatform(ctx, 80, 380, 640, 100, 20, "#111111", "#ffffff", 0.035);

                const slide = 200 * easeOutQuart(assemblyProg);

                drawSketchRect(ctx, 350, 310, 100, 70);
                drawMasonryHatch(ctx, 350, 310, 100, 70);

                drawSketchRect(ctx, 400 - slide, 270, 120, 110);
                drawCrossSectionHatching(ctx, 400 - slide, 270, 120, 110, 8, Math.PI / 4, "rgba(204, 204, 204, 0.5)");

                drawSketchRect(ctx, 300 + slide, 220, 70, 70);
                drawCrossSectionHatching(ctx, 300 + slide, 220, 70, 70, 8, -Math.PI / 4, "rgba(204, 204, 204, 0.5)");

                const siloOut = 90 * easeOutQuart(assemblyProg);
                drawSketchRect(ctx, 300 + slide - 30, 290 - siloOut, 30, siloOut);

                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 2.5 * secondaryProg;
                    drawHandLine(ctx, 400 - slide + 120, 350, 350, 350, 0.4, 3);
                }

                for (let i = 0; i < 5; i++) {
                    const eqProg = (secondaryProg * 2 + i * 0.2) % 1;
                    const ex = 400 - slide + 150 + eqProg * 100 * (i % 2 === 0 ? 1 : -1);
                    const ey = 320 + i * 15;
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(ex, ey, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(ex - 6, ey - 3, 12, 6);
                }

                drawDimensionLine(ctx, 100, 500, 700, 500, "MULTI-BUILDING AGRARIAN COMPLEX SITE PLAN", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                ctx.save();
                ctx.globalAlpha = 0.25;
                drawSketchRect(ctx, 200, 270, 120, 110);
                drawSketchRect(ctx, 500, 220, 70, 70);
                ctx.restore();

                const wallLen = 560 * easeOutQuart(assemblyProg);

                for (let i = 0; i < 3; i++) {
                    const bx = 120 + wallLen * (i + 1) / 3;
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(bx, 385, 3 + 2 * Math.sin(assemblyProg * 20 + i), 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                drawHandLine(ctx, 120, 400, 120 + wallLen, 400, 0.5, 8);

                for (let wx = 120; wx < 120 + wallLen; wx += 28) {
                    ctx.strokeRect(wx, 390, 24, 18);
                    drawMasonryHatch(ctx, wx, 390, 24, 18);
                }

                if (secondaryProg > 0) {
                    ctx.fillStyle = "#cccccc";
                    for (let b = 0; b < 5; b++) {
                        const bx = 150 + b * 110 + Math.sin(secondaryProg * 15 + b) * 20;
                        const by = 350 + Math.cos(secondaryProg * 12 + b * 2) * 15;
                        ctx.beginPath();
                        ctx.arc(bx, by, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                drawDimensionLine(ctx, 120, 450, 680, 450, "FROST-HEAVED DRY-STONE BOUNDARY WALLS", "#ffffff", 6, "#ffffff");

            } else {
                drawDioramaPlatform(ctx, 140, 340, 520, 140, 20, "#111111", "#ffffff", -0.03);

                const dropY = (1 - easeOutQuart(assemblyProg)) * 40;
                ctx.save();
                ctx.translate(0, -dropY);
                ctx.strokeRect(180, 340, 440, 80);
                drawEarthHatch(ctx, 180, 420, 440, 60, "rgba(255, 255, 255, 0.25)");
                ctx.restore();

                const gateLift = 50 * easeOutQuart(secondaryProg);
                ctx.fillStyle = "#cccccc";
                ctx.fillRect(400, 340 - gateLift, 24, 80);
                ctx.strokeRect(400, 340 - gateLift, 24, 80);

                if (gateLift > 5) {
                    ctx.strokeStyle = "#666666";
                    ctx.lineWidth = 3;
                    const ripple = (secondaryProg * 250) % 40;
                    for (let wy = 360; wy < 410; wy += 12) {
                        drawHandLine(ctx, 190, wy, 390, wy, 0.2, 2);
                        drawHandLine(ctx, 428 + ripple, wy, 600, wy, 0.5, 4);
                    }
                }

                const wheelAngle = secondaryProg * Math.PI * 8;
                ctx.save();
                ctx.translate(560, 370);
                ctx.rotate(wheelAngle);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, Math.PI * 2);
                ctx.stroke();
                for (let i = 0; i < 4; i++) {
                    ctx.rotate(Math.PI / 2);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(20, 0);
                    ctx.stroke();
                }
                ctx.restore();

                drawDimensionLine(ctx, 180, 500, 620, 500, "STRUCTURED IRRIGATION SLUICE & WEIR GATE", "#ffffff", 6, "#ffffff");
            }

            const titles = ["AGRARIAN COMPLEX", "BOUNDARY WALLS", "IRRIGATION SLUICE"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `C-104.${phase.idx + 1}`, "1\" = 100'-0\"", "APR 1955", "#ffffff", "#0a0a0a");
        }
    },
    // Stage 4: 1950 - Decline & Abandonment (Weathering, Roof Sag, Botanical Reclamation)
    {
        initSVG: (g, width, height) => {

            addSVGCallout(g, 25, 50, 200, 250, "PROLONGED WEATHERING & EXPOSURE", "MAINTENANCE CEASED / ABANDONED", "stage4-callout1", 0);
            addSVGCallout(g, 490, 50, 400, 240, "CONDEMNED // ABANDONED 1950", "STRUCTURAL COMPROMISE SURVEY", "stage4-callout2", 0);
            const badge = createSVGElement("g", { class: "tech-stamp-badge", transform: "rotate(-2, 480, 160)", "data-phase": "0" });
            const bRect = createSVGElement("rect", { x: 480, y: 160, width: 260, height: 44, fill: "#0a0a0a", stroke: "#D12B3E", "stroke-width": "3", rx: "4", ry: "4" });
            const bText = createSVGElement("text", { x: 494, y: 188, fill: "#ffffff", "font-family": '"Impact", "Arial Black", sans-serif', "font-size": "14", "font-weight": "900", "letter-spacing": "0.08em" });
            bText.textContent = "CONDEMNED // ABANDONED 1950";
            badge.append(bRect, bText);
            g.appendChild(badge);

            addSVGStressArrow(g, 300, 160, 300, 280, "DEAD LOAD: 45 LBS/SQ FT", "stage4-p1-arr1", 1);
            addSVGCallout(g, 25, 210, 280, 310, "ROOF RAFTER DEFLECTION", "8.5\" MAX SAG (STRUCTURAL FAILURE)", "stage4-callout3", 1);
            addSVGCallout(g, 520, 240, 460, 340, "SEVERE MORTAR LEACHING", "LIME EROSION & MASONRY FISSURES", "stage4-callout4", 1);

            addSVGCallout(g, 25, 380, 220, 300, "BOTANICAL RECLAMATION", "WILD GRAPEVINE & VIRGINIA CREEPER", "stage4-callout5", 2);
            addSVGCallout(g, 480, 410, 480, 380, "PIONEER TREE ROOTS", "ROOT EXPANSION IN FOUNDATION BEDS", "stage4-callout6", 2);

            addSVGTitleBlock(g, "HOMESTEAD SURVEY & CONDEMNATION", "EX-101", "1950", "SCALE: 1/4\" = 1'-0\"", "1950-COND");
        },
        updateSVG: (g, prog, width, height, phase) => {
            // Handled automatically by setCalloutPhaseVisibility
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            // Helper for radial gradient color blurs behind callout targets
            const drawRadialCalloutBlur = (targetX, targetY, radius, colorStr, alpha = 0.5) => {
                if (alpha <= 0)
                    return;
                ctx.save();
                ctx.globalCompositeOperation = "screen";
                const grad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, radius);
                grad.addColorStop(0, colorStr.replace("ALPHA", String(alpha)));
                grad.addColorStop(0.5, colorStr.replace("ALPHA", String(alpha * 0.45)));
                grad.addColorStop(1, colorStr.replace("ALPHA", "0"));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(targetX, targetY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };

            if (phase.idx === 0) {
                // P0: Cultivation Ceased & Architectural Weathering (Structural Degradation)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawRadialCalloutBlur(200, 250, 95, "rgba(214, 112, 40, ALPHA)", 0.55 * phase.localProg);
                drawRadialCalloutBlur(400, 240, 100, "rgba(232, 65, 24, ALPHA)", 0.5 * phase.localProg);

                drawDioramaPlatform(ctx, 140, 350, 520, 120, 20, "#111111", "#ffffff", 0.03);
                // Moving Part 1: Building facade moves down into abandoned/settled position during assemblyProg
                const dropY = (1 - easeOutQuart(assemblyProg)) * 30;
                ctx.save();
                ctx.translate(0, -dropY);
                const weatherAlpha = Math.min(1.0, phase.localProg / 0.35);
                if (weatherAlpha > 0) {
                    ctx.fillStyle = `rgba(140, 80, 40, ${0.45 * weatherAlpha})`;
                    ctx.fillRect(220, 220, 360, 22 * weatherAlpha);
                    ctx.fillStyle = `rgba(100, 110, 120, ${0.4 * weatherAlpha})`;
                    // Moving Part 2: Peeling finish and weathered vertical timber erosion streaks
                    for (let lx = 235; lx < 570; lx += 45)
                        ctx.fillRect(lx, 242 + (1 - weatherAlpha) * 10, 14, 108 * weatherAlpha);
                }
                drawSketchRect(ctx, 220, 220, 360, 130);
                drawMasonryHatch(ctx, 220, 220, 360, 130);
                ctx.restore();

                // Moving Part 3: Wind-driven environmental rain and storm vectors sweeping across elevation
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "rgba(204, 204, 204, 0.55)";
                    ctx.lineWidth = 1.5;
                    const rainOffset = (secondaryProg * 400) % 200;
                    for (let r = 0; r < 14; r++) {
                        const rx = 180 + r * 35 + rainOffset * 0.5;
                        const ry = 140 + ((rainOffset + r * 40) % 250);
                        drawHandLine(ctx, rx, ry, rx - 35, ry + 70, 0.25, 2);
                    }
                }

                // Moving Part 4: Pulsing condemnation survey crosshairs / structural stress markers on corners
                if (secondaryProg > 0) {
                    const pulseRad = 12 + Math.sin(secondaryProg * Math.PI * 4) * 3;
                    const corners = [[235, 235], [565, 235]];
                    ctx.save();
                    ctx.strokeStyle = `rgba(209, 43, 62, ${0.8 * secondaryProg})`;
                    ctx.lineWidth = 2;
                    corners.forEach(([cx, cy]) => {
                        ctx.beginPath();
                        ctx.arc(cx, cy, pulseRad, 0, Math.PI * 2);
                        ctx.stroke();
                        drawHandLine(ctx, cx - pulseRad - 6, cy, cx + pulseRad + 6, cy, 0.1, 1.5);
                        drawHandLine(ctx, cx, cy - pulseRad - 6, cx, cy + pulseRad + 6, 0.1, 1.5);
                    });
                    ctx.restore();
                }
                drawDimensionLine(ctx, 140, 490, 660, 490, "ABANDONED HOMESTEAD / ENVIRONMENTAL EXPOSURE & WEATHERING", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Roof Sag Deflection & Lime Mortar Leaching (Structural Failure Analysis)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawRadialCalloutBlur(280, 310, 105, "rgba(232, 65, 24, ALPHA)", 0.6 * phase.localProg);
                drawRadialCalloutBlur(460, 340, 95, "rgba(160, 185, 210, ALPHA)", 0.5 * phase.localProg);

                drawDioramaPlatform(ctx, 140, 360, 520, 120, 20, "#111111", "#ffffff", 0.035);
                drawSketchRect(ctx, 200, 260, 400, 100);
                drawMasonryHatch(ctx, 200, 260, 400, 100, true);

                // Moving Part 5: Sagging roof ridge in quadratic curve under 45 lbs/sq ft dead load
                const sag = 65 * easeOutQuart(assemblyProg);
                if (sag > 0) {
                    ctx.fillStyle = `rgba(140, 80, 40, ${0.55 * assemblyProg})`;
                    ctx.beginPath();
                    ctx.moveTo(180, 260);
                    ctx.quadraticCurveTo(400, 260 + sag, 620, 260);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(180, 260);
                ctx.quadraticCurveTo(400, 260 + sag, 620, 260);
                ctx.stroke();

                // Moving Parts 6, 7, 8, 9: 4+ individual slate roof shingles slipping/dropping off battens
                const slideProg = Math.max(0, Math.min(1, assemblyProg * 0.45 + secondaryProg * 0.55));
                if (slideProg > 0) {
                    for (let i = 0; i < 4; i++) {
                        const shingleDelayProg = Math.max(0, Math.min(1, (slideProg - i * 0.12) / 0.52));
                        if (shingleDelayProg > 0) {
                            const easedDrop = easeOutQuart(shingleDelayProg);
                            const sx = 240 + i * 95 + (i % 2 === 0 ? -1 : 1) * 22 * easedDrop;
                            const sy = 245 + easedDrop * 55;
                            const sRot = (i % 2 === 0 ? -0.4 : 0.5) * easedDrop;
                            ctx.save();
                            ctx.translate(sx, sy);
                            ctx.rotate(sRot);
                            ctx.fillStyle = "#0a0a0a";
                            ctx.fillRect(-20, -12, 40, 24);
                            ctx.strokeStyle = "#cccccc";
                            ctx.lineWidth = 1.8;
                            ctx.strokeRect(-20, -12, 40, 24);
                            ctx.strokeStyle = "rgba(204, 204, 204, 0.45)";
                            drawHandLine(ctx, -15, -6, 15, -6, 0.1, 1.2);
                            drawHandLine(ctx, -15, 4, 15, 4, 0.1, 1.2);
                            ctx.restore();
                        }
                    }
                }

                // Moving Part 10: Stepped foundation fissures and widening masonry cracks
                if (secondaryProg > 0) {
                    const crack = 85 * secondaryProg;
                    ctx.fillStyle = `rgba(100, 110, 120, ${0.75 * secondaryProg})`;
                    ctx.beginPath();
                    ctx.moveTo(380, 260);
                    ctx.lineTo(396, 260 + crack * 0.4);
                    ctx.lineTo(383, 260 + crack * 0.8);
                    ctx.lineTo(395, 260 + crack);
                    ctx.lineTo(375, 260 + crack);
                    ctx.lineTo(367, 260 + crack * 0.8);
                    ctx.lineTo(384, 260 + crack * 0.4);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(380, 260);
                    ctx.lineTo(390, 260 + crack * 0.4);
                    ctx.lineTo(375, 260 + crack * 0.8);
                    ctx.lineTo(385, 260 + crack);
                    ctx.stroke();

                    // Secondary fissure at x=480 widening
                    ctx.beginPath();
                    ctx.moveTo(480, 260);
                    ctx.lineTo(488, 260 + crack * 0.5);
                    ctx.lineTo(476, 260 + crack * 0.9);
                    ctx.stroke();
                }

                // Moving Part 11: Lime mortar leaching droplets and calcium carbonate efflorescence streaks dripping down
                if (secondaryProg > 0) {
                    ctx.strokeStyle = `rgba(230, 240, 255, ${0.7 * secondaryProg})`;
                    ctx.lineWidth = 2;
                    for (let d = 0; d < 8; d++) {
                        const dx = 225 + d * 45;
                        const dripOffset = (secondaryProg * 140 + d * 30) % 85;
                        const dy = 265 + dripOffset;
                        drawHandLine(ctx, dx, 265, dx, dy, 0.15, 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * secondaryProg})`;
                        ctx.beginPath();
                        ctx.arc(dx, dy, 3.2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                drawDimensionLine(ctx, 180, 300 + sag, 620, 300 + sag, "DEFLECTED ROOF RIDGE: 8.5\" MAX SAG (STRUCTURAL FAILURE)", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Ecological Succession & Botanical Reclamation (Ecology & Overgrowth Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawRadialCalloutBlur(220, 300, 110, "rgba(76, 209, 55, ALPHA)", 0.6 * phase.localProg);
                drawRadialCalloutBlur(480, 380, 100, "rgba(46, 160, 67, ALPHA)", 0.55 * phase.localProg);

                drawDioramaPlatform(ctx, 140, 360, 520, 120, 20, "#111111", "#ffffff", -0.03);
                drawSketchRect(ctx, 200, 260, 400, 100);
                drawMasonryHatch(ctx, 200, 260, 400, 100, true);

                const progressFactor = assemblyProg * 0.3 + secondaryProg * 0.7;
                let vineStyle = "#cccccc";
                let leafStyle = "#ffffff";
                if (progressFactor > 0) {
                    const ivyGrad = ctx.createLinearGradient(0, 360, 0, 180);
                    ivyGrad.addColorStop(0, `rgba(40, 180, 60, ${0.85 * progressFactor})`);
                    ivyGrad.addColorStop(1, `rgba(100, 220, 100, ${0.95 * progressFactor})`);
                    vineStyle = ivyGrad;
                    leafStyle = ivyGrad;
                }

                // Moving Parts 12, 13, 14: Wild grapevine and Virginia creeper stems creeping upward & expanding leaf clusters
                ctx.strokeStyle = vineStyle;
                ctx.lineWidth = 3.5;
                for (let v = 0; v < 7; v++) {
                    const startX = 220 + v * 58;
                    const maxH = 145 + (v % 3) * 32;
                    const currH = maxH * easeOutQuart(progressFactor);
                    ctx.beginPath();
                    ctx.moveTo(startX, 360);
                    ctx.bezierCurveTo(startX - 30, 360 - currH * 0.4, startX + 30, 360 - currH * 0.7, startX - 15, 360 - currH);
                    ctx.stroke();

                    if (currH > 25 && progressFactor > 0) {
                        ctx.fillStyle = leafStyle;
                        ctx.beginPath();
                        const leafScale = Math.min(1, currH / 60);
                        ctx.arc(startX - 15, 360 - currH, 6.5 * leafScale, 0, Math.PI * 2);
                        ctx.arc(startX - 8, 360 - currH + 6, 5.5 * leafScale, 0, Math.PI * 2);
                        ctx.arc(startX - 22, 360 - currH + 5, 5.5 * leafScale, 0, Math.PI * 2);
                        if (currH > 70) {
                            ctx.arc(startX + 12, 360 - currH * 0.5, 5.5 * leafScale, 0, Math.PI * 2);
                            ctx.arc(startX + 6, 360 - currH * 0.5 - 5, 4.5 * leafScale, 0, Math.PI * 2);
                        }
                        ctx.fill();
                    } else if (currH > 25 && secondaryProg > 0) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(startX - 15, 360 - currH, 6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Moving Parts 15, 16, 17: Pioneer tree root branching network expanding downward into foundation & shifting stone blocks
                if (progressFactor > 0) {
                    ctx.strokeStyle = `rgba(180, 220, 180, ${0.85 * progressFactor})`;
                    ctx.lineWidth = 3;
                    for (let r = 0; r < 5; r++) {
                        const rootX = 240 + r * 75;
                        const rootLen = 65 * easeOutQuart(progressFactor);
                        ctx.beginPath();
                        ctx.moveTo(rootX, 360);
                        ctx.bezierCurveTo(rootX - 18, 360 + rootLen * 0.3, rootX + 22, 360 + rootLen * 0.7, rootX + (r % 2 === 0 ? -15 : 20), 360 + rootLen);
                        ctx.stroke();

                        // Lateral rootlets fracturing masonry joints
                        if (secondaryProg > 0 && rootLen > 25) {
                            ctx.lineWidth = 1.8;
                            ctx.beginPath();
                            ctx.moveTo(rootX - 5, 360 + rootLen * 0.5);
                            ctx.lineTo(rootX - 22, 360 + rootLen * 0.65);
                            ctx.moveTo(rootX + 6, 360 + rootLen * 0.6);
                            ctx.lineTo(rootX + 26, 360 + rootLen * 0.78);
                            ctx.stroke();
                        }
                    }

                    // Heaving / displaced foundation masonry blocks separating under root expansion
                    if (secondaryProg > 0) {
                        const heaveX = 14 * secondaryProg;
                        const heaveY = 8 * secondaryProg;
                        ctx.save();
                        ctx.strokeStyle = "#ffffff";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(450 + heaveX, 362 + heaveY, 38, 22);
                        ctx.strokeRect(320 - heaveX * 0.6, 364 + heaveY * 0.8, 42, 20);
                        ctx.restore();
                    }
                }
                drawDimensionLine(ctx, 140, 500, 660, 500, "BOTANICAL RECLAMATION // VIRGINIA CREEPER & ROOT PENETRATION", "#ffffff", 6, "#ffffff");
            }

            const titles = ["WEATHERING & ABANDONMENT", "ROOF SAG & MORTAR LEACHING", "BOTANICAL RECLAMATION"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `EX-101.${phase.idx + 1}`, "1/4\" = 1'-0\"", "1950-COND", "#ffffff", "#0a0a0a");
        }
    },

    // Stage 5: 1980 - Modernization Planning (Blueprint Overlays, Hydraulic Jacking, Epoxy Splicing)
    {
        initSVG: (g, width, height) => {

            addSVGCallout(g, 25, 50, 180, 240, "CRISP BLUEPRINT OVERLAYS", "HERITAGE CONSERVATION ASSESSMENT", "stage5-callout1", 0);
            addSVGCallout(g, 490, 50, 480, 270, "LASER TRANSIT REALIGNMENT", "PRECISION ELEVATION SURVEY (REF A-4)", "stage5-callout2", 0);

            addSVGStressArrow(g, 300, 480, 300, 380, "12-TON HYDRAULIC LIFT", "stage5-p1-arr1", 1);
            addSVGStressArrow(g, 500, 480, 500, 380, "LOAD TRANSFER TO BEDROCK", "stage5-p1-arr2", 1);
            addSVGCallout(g, 25, 210, 280, 360, "12-TON HYDRAULIC JACKS", "LIFTING SAGGING FLOOR JOISTS TO LEVEL", "stage5-callout3", 1);
            addSVGCallout(g, 520, 240, 440, 270, "STEEL W12x50 LINTELS", "HIDDEN STRUCTURAL I-BEAM REINFORCEMENT", "stage5-callout4", 1);

            addSVGCallout(g, 25, 380, 300, 320, "EPOXY RESIN INJECTION", "CONSERVATION JOINERY PRESSURE INJECTION", "stage5-callout5", 2);
            addSVGCallout(g, 480, 410, 480, 320, "HARDWOOD JOINERY SPLICE", "BRIDGING 18TH-C. AESTHETIC WITH CODE", "stage5-callout6", 2);

            const badge = createSVGElement("g", { class: "tech-stamp-badge", transform: "rotate(-2, 480, 160)", "data-phase": "2" });
            const bRect = createSVGElement("rect", { x: 480, y: 160, width: 280, height: 44, fill: "#0a0a0a", stroke: "#D12B3E", "stroke-width": "3", rx: "4", ry: "4" });
            const bText = createSVGElement("text", { x: 492, y: 187, fill: "#ffffff", "font-family": '"Impact", "Arial Black", sans-serif', "font-size": "13", "font-weight": "900", "letter-spacing": "0.06em" });
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
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 30)
                drawHandLine(ctx, x, 0, x, height, 0.1, 2);
            for (let y = 0; y < height; y += 30)
                drawHandLine(ctx, 0, y, width, y, 0.1, 2);

            const drawRadialCalloutBlur = (targetX, targetY, radius, color, alpha) => {
                if (alpha <= 0)
                    return;
                ctx.save();
                ctx.globalCompositeOperation = "screen";
                ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
                const grad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, radius);
                grad.addColorStop(0, color);
                grad.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(targetX, targetY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };

            if (phase.idx === 0) {
                // P0: Technical Blueprint Overlays & Laser Transit Elevation Assessment
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 360, 520, 100, 20, "#111111", "#ffffff", 0.035);
                drawSketchRect(ctx, 200, 260, 400, 100);
                drawMasonryHatch(ctx, 200, 260, 400, 100, true);

                drawRadialCalloutBlur(180, 240, 70, "rgba(0, 255, 255, 0.65)", 0.7 * Math.min(1, phase.localProg * 2));
                drawRadialCalloutBlur(480, 270, 70, "rgba(0, 255, 255, 0.65)", 0.7 * Math.min(1, phase.localProg * 2));

                const overlayProg = easeOutQuart(assemblyProg);
                const overlayH = 200 * overlayProg;
                if (assemblyProg > 0)
                    ctx.fillStyle = `rgba(0, 255, 255, ${0.15 * overlayProg})`;
                else
                    ctx.fillStyle = "rgba(204, 204, 204, 0.25)";
                ctx.fillRect(180, 240, 440, overlayH);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(180, 240, 440, overlayH);

                if (overlayProg > 0.1) {
                    ctx.save();
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 * overlayProg})`;
                    ctx.lineWidth = 1;
                    for (let gx = 220; gx <= 580; gx += 40)
                        drawHandLine(ctx, gx, 240, gx, 240 + overlayH, 0.1, 2);
                    for (let gy = 260; gy < 240 + overlayH; gy += 40)
                        drawHandLine(ctx, 180, gy, 620, gy, 0.1, 2);
                    ctx.restore();
                }

                const transitX = 180 + 440 * easeOutQuart(phase.localProg);
                drawSurveyReticle(ctx, transitX, 270, 16, "DATUM EL. 0.0'", "rgba(0, 255, 255, 0.9)");

                if (secondaryProg > 0) {
                    ctx.save();
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.9 * secondaryProg})`;
                    ctx.shadowColor = `rgba(0, 255, 255, ${0.9 * secondaryProg})`;
                    ctx.shadowBlur = 14;
                    ctx.lineWidth = 2 + 1.5 * secondaryProg;
                    ctx.setLineDash([6, 4]);
                    ctx.beginPath();
                    ctx.moveTo(100, 270);
                    ctx.lineTo(100 + 540 * secondaryProg, 270);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                }

                const caliperH = 140 * easeOutQuart(assemblyProg);
                if (assemblyProg > 0) {
                    for (const cx of [160, 640]) {
                        ctx.strokeStyle = "#ffffff";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(cx, 440);
                        ctx.lineTo(cx, 440 - caliperH);
                        ctx.stroke();
                        ctx.font = "bold 10px monospace";
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText(cx === 160 ? "REF-A" : "REF-B", cx - 12, 440 - caliperH - 8);
                        for (let tickY = 440; tickY >= 440 - caliperH; tickY -= 20)
                            drawHandLine(ctx, cx - 6, tickY, cx + 6, tickY, 0.1, 2);
                    }
                }

                drawDimensionLine(ctx, 180, 470, 620, 470, "CRISP TECHNICAL BLUEPRINT OVERLAYS & LASER TRANSIT DATUM SURVEY", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Hydraulic Jacking & Steel W12x50 Lintel / C-Channel Reinforcement
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 380, 520, 80, 20, "#111111", "#ffffff", 0.03);

                drawRadialCalloutBlur(280, 360, 75, "rgba(80, 160, 240, 0.65)", 0.7 * Math.min(1, phase.localProg * 2));
                drawRadialCalloutBlur(440, 270, 75, "rgba(80, 160, 240, 0.65)", 0.7 * Math.min(1, phase.localProg * 2));

                const initialSag = 35 * (1 - easeOutQuart(assemblyProg));
                const jackAlpha = assemblyProg;
                const jackH = 40 + (35 - initialSag);
                for (const jx of [240, 400, 560]) {
                    if (jackAlpha > 0) {
                        ctx.fillStyle = `rgba(80, 120, 160, ${0.8 * jackAlpha})`;
                        ctx.fillRect(jx - 18, 380 - jackH, 36, jackH);
                    }
                    ctx.strokeRect(jx - 18, 380 - jackH, 36, jackH);
                    drawSteelHatch(ctx, jx - 18, 380 - jackH, 36, jackH);

                    const pistonY = 340 + (jx === 400 ? initialSag : initialSag * 0.4);
                    ctx.fillStyle = "#cccccc";
                    ctx.fillRect(jx - 8, pistonY, 16, (380 - jackH) - pistonY);
                    ctx.strokeRect(jx - 8, pistonY, 16, (380 - jackH) - pistonY);
                }

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(180, 340 + initialSag * 0.4);
                ctx.quadraticCurveTo(400, 340 + initialSag, 620, 340 + initialSag * 0.4);
                ctx.stroke();

                if (secondaryProg > 0) {
                    const steelW = 440 * easeOutQuart(secondaryProg);
                    ctx.fillStyle = `rgba(80, 120, 160, ${0.85 * secondaryProg})`;
                    ctx.fillRect(180, 260, steelW, 24);
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(180, 260, steelW, 24);
                    drawSteelHatch(ctx, 180, 260, steelW, 24);
                    drawDimensionLine(ctx, 180, 250, 180 + steelW, 250, "W12x50 LINTEL", "#ffffff", 4, "#0a0a0a");

                    const gridH = 80 * easeOutQuart(secondaryProg);
                    for (const cx of [260, 340, 460, 540]) {
                        ctx.fillStyle = `rgba(100, 140, 180, ${0.7 * secondaryProg})`;
                        ctx.fillRect(cx - 8, 260, 16, gridH);
                        ctx.strokeRect(cx - 8, 260, 16, gridH);
                        drawSteelHatch(ctx, cx - 8, 260, 16, gridH);
                    }
                    ctx.save();
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 * secondaryProg})`;
                    ctx.shadowColor = `rgba(0, 255, 255, ${0.8 * secondaryProg})`;
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(140, 340);
                    ctx.lineTo(140 + 520 * secondaryProg, 340);
                    ctx.stroke();
                    ctx.restore();
                }

                drawDimensionLine(ctx, 180, 480, 620, 480, "12-TON HYDRAULIC JACK REALIGNMENT & STEEL W12x50 STRUCTURAL LINTEL", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Epoxy Resin Splicing & Reclaimed Hardwood Joinery
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 360, 520, 100, 20, "#111111", "#ffffff", -0.035);

                drawRadialCalloutBlur(300, 320, 70, "rgba(240, 180, 40, 0.7)", 0.7 * Math.min(1, phase.localProg * 2));
                drawRadialCalloutBlur(480, 320, 70, "rgba(220, 140, 30, 0.7)", 0.7 * Math.min(1, phase.localProg * 2));

                drawSketchRect(ctx, 180, 280, 100, 80);
                drawMasonryHatch(ctx, 180, 280, 100, 80, true);
                drawSketchRect(ctx, 520, 280, 100, 80);
                drawMasonryHatch(ctx, 520, 280, 100, 80, true);

                const removeProg = easeOutQuart(assemblyProg);
                if (removeProg < 0.95) {
                    ctx.save();
                    ctx.globalAlpha = 1 - removeProg;
                    const dropY = 50 * removeProg;
                    ctx.translate(0, dropY);
                    drawSketchRect(ctx, 280, 280, 140, 80);
                    drawMasonryHatch(ctx, 280, 280, 140, 80, true);
                    ctx.restore();
                }

                const insertProg = easeOutQuart(assemblyProg);
                const insertY = 280 - 60 * (1 - insertProg);
                if (assemblyProg > 0) {
                    ctx.save();
                    ctx.fillStyle = `rgba(220, 140, 30, ${0.35 * insertProg})`;
                    ctx.fillRect(280, insertY, 140, 80);
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 2.5;
                    ctx.strokeRect(280, insertY, 140, 80);
                    drawMasonryHatch(ctx, 280, insertY, 140, 80);
                    ctx.restore();
                }

                if (secondaryProg > 0) {
                    const fillW = 100 * easeOutQuart(secondaryProg);
                    const epoxyGrad = ctx.createLinearGradient(420, 280, 420 + fillW, 280);
                    epoxyGrad.addColorStop(0, `rgba(240, 180, 40, ${0.85 * secondaryProg})`);
                    epoxyGrad.addColorStop(1, `rgba(200, 130, 20, ${0.95 * secondaryProg})`);
                    ctx.fillStyle = epoxyGrad;
                    ctx.fillRect(420, 280, fillW, 80);
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(420, 280, fillW, 80);
                    drawCrossSectionHatching(ctx, 420, 280, fillW, 80, 6, Math.PI / 4, "#cccccc");

                    const portX = 420;
                    const portY = 280;
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(portX - 8, portY - 14, 16, 14);

                    ctx.beginPath();
                    ctx.arc(portX, portY - 24, 12, 0, Math.PI * 2);
                    ctx.fillStyle = "#0a0a0a";
                    ctx.fill();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    const needleAngle = -Math.PI / 3 + (Math.PI * 2 / 3) * easeOutQuart(secondaryProg);
                    ctx.strokeStyle = "#D12B3E";
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    ctx.moveTo(portX, portY - 24);
                    ctx.lineTo(portX + Math.cos(needleAngle) * 9, portY - 24 + Math.sin(needleAngle) * 9);
                    ctx.stroke();
                    ctx.font = "bold 8px monospace";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("PSI", portX - 7, portY - 38);
                }

                drawDimensionLine(ctx, 180, 480, 620, 480, "EPOXY RESIN TIMBER SPLICING & RECLAIMED HARDWOOD JOINERY (CODE ST-201)", "#ffffff", 6, "#ffffff");
            }

            const titles = ["BLUEPRINT OVERLAYS", "HYDRAULIC JACKING & STEEL", "EPOXY SPLICING & CODE"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `ST-201.${phase.idx + 1}`, "3/16\" = 1'-0\"", "MAY 1980", "#ffffff", "#0a0a0a");
        }
    },
    // Stage 6: 2010 - Ecological Insulation (Thermal Envelope, Triple Glazing, Geothermal & Solar PV)
    {
        initSVG: (g, width, height) => {

            addSVGCallout(g, 25, 50, 180, 260, "CLOSED-CELL SPRAY FOAM R-45", "HIGH-DENSITY CAVITY INSULATION", "stage6-callout1", 0);
            addSVGCallout(g, 490, 50, 480, 290, "AIRTIGHT THERMAL ENVELOPE", "ELIMINATES UNCONTROLLED AIR INFILTRATION", "stage6-callout2", 0);

            addSVGCallout(g, 25, 210, 180, 250, "TRIPLE-PANE LOW-E GLAZING", "U-FACTOR 0.12 / ZERO COLD BRIDGES", "stage6-callout3", 1);
            addSVGCallout(g, 520, 240, 480, 290, "ARGON GAS THERMAL BARRIER", "PULSING INERT GAS INTERSPACE", "stage6-callout4", 1);

            addSVGCallout(g, 25, 380, 180, 310, "400' GEOTHERMAL BEDROCK LOOP", "CLOSED-LOOP RADIATIVE HEAT EXCHANGE", "stage6-callout5", 2);
            addSVGCallout(g, 480, 410, 480, 240, "SOLAR PV ROOF ARRAY (-15% NET ENERGY)", "NET-POSITIVE RENEWABLE GENERATION", "stage6-callout6", 2);

            addSVGTitleBlock(g, "NET-ZERO RETROFIT", "ME-301", "2010", "SCALE: 3/16\" = 1'-0\"", "OCT 2010");
        },
        updateSVG: (g, prog, width, height, phase) => {
            if (phase.idx === 2) {
                const pvCallout = g.querySelector("#stage6-callout6 text:first-of-type");
                if (pvCallout) {
                    const gen = Math.round(15 * phase.localProg);
                    pvCallout.textContent = `SOLAR PV ROOF ARRAY (-${gen}% NET ENERGY)`;
                }
            }
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 35)
                drawHandLine(ctx, x, 0, x, height, 0.15, 2);
            for (let y = 0; y < height; y += 35)
                drawHandLine(ctx, 0, y, width, y, 0.15, 2);

            const drawCalloutBlur = (targetX, targetY, radius, colorInner, colorOuter, alpha) => {
                if (alpha <= 0)
                    return;
                ctx.save();
                ctx.globalCompositeOperation = "screen";
                const grad = ctx.createRadialGradient(targetX, targetY, 2, targetX, targetY, radius);
                grad.addColorStop(0, colorInner.replace("ALPHA", String(alpha)));
                grad.addColorStop(0.5, colorInner.replace("ALPHA", String(alpha * 0.5)));
                grad.addColorStop(1, colorOuter.replace("ALPHA", "0"));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(targetX, targetY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };

            if (phase.idx === 0) {
                // P0: Closed-Cell Thermal Envelope (High-Performance Insulation Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 360, 520, 100, 20, "#111111", "#ffffff", 0.035);

                // Radial color blurs behind each callout target area in Phase 0
                drawCalloutBlur(180, 260, 95, "rgba(255, 200, 50, ALPHA)", "rgba(255, 160, 20, ALPHA)", 0.75 * secondaryProg);
                drawCalloutBlur(480, 290, 95, "rgba(255, 220, 80, ALPHA)", "rgba(220, 180, 40, ALPHA)", 0.75 * secondaryProg);

                // Moving Parts 1-5: 5 wall stud framing cavities expanding with spray foam insulation
                const dropY = (1 - easeOutQuart(assemblyProg)) * 40;
                ctx.save();
                ctx.translate(0, -dropY);
                for (let c = 0; c < 5; c++) {
                    const cx = 180 + c * 90;
                    ctx.strokeRect(cx, 220, 60, 140);
                }
                ctx.restore();

                if (secondaryProg > 0) {
                    const foamH = 140 * easeOutQuart(secondaryProg);
                    for (let c = 0; c < 5; c++) {
                        const cx = 180 + c * 90;
                        if (foamH > 5) {
                            ctx.fillStyle = `rgba(245, 200, 60, ${0.85 * secondaryProg})`;
                            ctx.fillRect(cx, 220 + (140 - foamH), 60, foamH);
                            drawInsulationHatch(ctx, cx, 220 + (140 - foamH), 60, foamH, secondaryProg, "#cccccc");
                        }
                    }
                }

                // Moving Part 6: Bouncing red heat-loss arrows hitting the airtight vapor barrier
                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                for (let a = 0; a < 3; a++) {
                    const ay = 250 + a * 35;
                    const approachX = 100 + 75 * Math.min(1.0, secondaryProg * 1.3);
                    if (secondaryProg > 0) {
                        ctx.strokeStyle = `rgba(255, 80, 50, ${0.9 * secondaryProg})`;
                        ctx.fillStyle = `rgba(255, 80, 50, ${0.9 * secondaryProg})`;
                    }
                    drawHandLine(ctx, approachX - 55, ay, approachX, ay, 0.2, 2);
                    if (secondaryProg > 0.3) {
                        const bounceP = Math.min(1.0, (secondaryProg - 0.3) / 0.7);
                        const bounceX = 175 - 40 * bounceP;
                        const bounceY = ay - 22 * bounceP;
                        drawHandLine(ctx, 175, ay, bounceX, bounceY, 0.2, 2);
                        ctx.beginPath();
                        ctx.moveTo(bounceX, bounceY);
                        ctx.lineTo(bounceX + 8, bounceY - 2);
                        ctx.lineTo(bounceX + 5, bounceY + 7);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
                ctx.restore();

                drawDimensionLine(ctx, 140, 480, 660, 480, "R-45 AIRTIGHT CLOSED-CELL THERMAL ENVELOPE SPRAY FOAM", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Triple-Pane Low-E Argon Glazing (Fenestration Engineering Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 160, 380, 480, 80, 20, "#111111", "#ffffff", 0.03);

                // Radial color blurs behind each callout target area in Phase 1
                drawCalloutBlur(180, 250, 100, "rgba(0, 220, 255, ALPHA)", "rgba(0, 150, 220, ALPHA)", 0.8 * secondaryProg);
                drawCalloutBlur(480, 290, 100, "rgba(50, 200, 255, ALPHA)", "rgba(0, 120, 200, ALPHA)", 0.8 * secondaryProg);

                // Moving Part 7: Old drafty window sash sliding out left
                const slideOut = 200 * easeOutQuart(assemblyProg);
                ctx.save();
                ctx.globalAlpha = Math.max(0, 1 - assemblyProg * 1.1);
                drawSketchRect(ctx, 240 - slideOut, 220, 140, 160);
                drawHandLine(ctx, 240 - slideOut + 20, 225, 240 - slideOut + 120, 375, 0.4, 1);
                ctx.restore();

                // Moving Part 8: New triple-pane window sliding in right
                const slideIn = 200 * (1 - easeOutQuart(assemblyProg));
                const winX = 330 + slideIn;
                const winY = 220;
                const winW = 180;
                const winH = 160;

                // Moving Part 9: Pulsing argon gas thermal barrier inside window panes
                if (secondaryProg > 0) {
                    const pulse = 0.75 * secondaryProg * (0.8 + 0.2 * Math.sin(prog * Math.PI * 10));
                    const centerX = winX + winW / 2;
                    const centerY = winY + winH / 2;
                    ctx.save();
                    ctx.globalCompositeOperation = "screen";
                    const argonGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.max(winW, winH) * 0.6);
                    argonGrad.addColorStop(0, `rgba(50, 200, 255, ${pulse})`);
                    argonGrad.addColorStop(1, "rgba(50, 200, 255, 0)");
                    ctx.fillStyle = argonGrad;
                    ctx.fillRect(winX + 2, winY + 2, winW - 4, winH - 4);
                    ctx.restore();
                }

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                ctx.strokeRect(winX, winY, winW, winH);
                for (let gL = 1; gL <= 2; gL++) {
                    ctx.beginPath();
                    ctx.moveTo(winX + gL * 60, winY);
                    ctx.lineTo(winX + gL * 60, winY + winH);
                    ctx.stroke();
                }

                // Blocking external red infrared heat vectors deflecting away
                if (secondaryProg > 0) {
                    ctx.strokeStyle = `rgba(255, 80, 50, ${0.85 * secondaryProg})`;
                    ctx.lineWidth = 2.5;
                    for (let a = 0; a < 3; a++) {
                        const ay = 250 + a * 35;
                        drawHandLine(ctx, 580, ay, 515, ay, 0.2, 2);
                        if (secondaryProg > 0.3)
                            drawHandLine(ctx, 515, ay, 560, ay - 25, 0.2, 2);
                    }
                }
                drawDimensionLine(ctx, 160, 480, 640, 480, "TRIPLE-PANE LOW-E ARGON GLAZING (U-0.12 / ZERO COLD BRIDGES)", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Geothermal Bedrock Loops & Rooftop Solar PV (Renewable Energy Engineering)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 280, 520, 60, 20, "#111111", "#ffffff", -0.035);

                // Radial color blurs behind each callout target area in Phase 2
                drawCalloutBlur(180, 310, 105, "rgba(0, 220, 180, ALPHA)", "rgba(0, 160, 140, ALPHA)", 0.8 * secondaryProg);
                drawCalloutBlur(480, 240, 105, "rgba(20, 140, 255, ALPHA)", "rgba(10, 90, 200, ALPHA)", 0.8 * secondaryProg);

                // Moving Part 10: Subterranean 400-ft geothermal bore loop drilling/extending into bedrock
                const boreDepth = 180 * easeOutQuart(assemblyProg);
                const geoAlpha = assemblyProg;
                if (geoAlpha > 0 && boreDepth > 5) {
                    const geoGrad = ctx.createLinearGradient(0, 280, 0, 280 + boreDepth);
                    geoGrad.addColorStop(0, `rgba(0, 180, 180, ${0.3 * geoAlpha})`);
                    geoGrad.addColorStop(1, `rgba(0, 180, 180, ${0.85 * geoAlpha})`);
                    ctx.fillStyle = geoGrad;
                    ctx.beginPath();
                    ctx.moveTo(380, 280);
                    ctx.lineTo(380, 280 + boreDepth);
                    ctx.arc(395, 280 + boreDepth, 15, Math.PI, 0, true);
                    ctx.lineTo(410, 280);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(380, 280);
                ctx.lineTo(380, 280 + boreDepth);
                ctx.arc(395, 280 + boreDepth, 15, Math.PI, 0, true);
                ctx.lineTo(410, 280);
                ctx.stroke();

                // Moving Parts 11 & 12: Radiative hydronic fluid circulating in supply and return pipes
                if (secondaryProg > 0 && boreDepth > 10) {
                    const offset = (secondaryProg * 400) % (boreDepth * 2 + 40);
                    ctx.save();
                    ctx.fillStyle = "rgba(0, 220, 255, 0.95)";
                    ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
                    ctx.shadowBlur = 8;
                    ctx.fillRect(377, 280 + Math.min(boreDepth, offset), 6, 12);
                    ctx.fillStyle = "rgba(220, 255, 255, 0.95)";
                    ctx.shadowColor = "rgba(100, 255, 255, 0.9)";
                    ctx.shadowBlur = 10;
                    ctx.fillRect(407, 280 + boreDepth - Math.min(boreDepth, Math.max(0, offset - boreDepth)), 6, 12);
                    ctx.restore();
                }

                // Moving Part 13: Rooftop solar PV array tilting and pulsing with energy generation
                drawPopUpProp(ctx, 240, 160, 320, 60, assemblyProg * 0.3 + secondaryProg * 0.7, (c, w, h, eased) => {
                    c.fillStyle = `rgba(20, 80, 180, ${0.85 * eased})`;
                    c.fillRect(0, 0, w, h);
                    c.strokeStyle = `rgba(255, 200, 50, ${0.9 * eased})`;
                    c.lineWidth = 2.5;
                    c.strokeRect(0, 0, w, h);
                    for (let pv = 40; pv < w; pv += 40) {
                        c.beginPath();
                        c.moveTo(pv, 0);
                        c.lineTo(pv, h);
                        c.stroke();
                    }
                    if (secondaryProg > 0) {
                        c.fillStyle = `rgba(255, 220, 80, ${0.85 * secondaryProg})`;
                        const pulseCell = Math.floor((secondaryProg * 16) % 8) * 40;
                        c.fillRect(pulseCell + 8, 12, 24, 36);
                    }
                });
                drawDimensionLine(ctx, 140, 490, 660, 490, "400' SUBTERRANEAN GEOTHERMAL BEDROCK LOOP & ROOFTOP SOLAR PV", "#ffffff", 6, "#ffffff");
            }

            const titles = ["AIRTIGHT THERMAL ENVELOPE", "TRIPLE-PANE LOW-E GLAZING", "GEOTHERMAL & SOLAR PV"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `ME-301.${phase.idx + 1}`, "3/16\" = 1'-0\"", "OCT 2010", "#ffffff", "#0a0a0a");
        }
    },
    // Stage 7: Present Modern Design
    {
        year: 2026,
        initSVG: (g, width, height) => {

            // Phase 0 Callouts
            addSVGCallout(g, 25, 50, 400, 160, "3,800 SQ. FT. MINIMALIST SYNTHESIS", "OPEN FLOOR PLAN PERIMETER", "stage7-callout1", 0);
            addSVGCallout(g, 490, 50, 355, 280, "RESTORED 1780 FIELDSTONE HEARTH", "THERMAL MASS & TIMBER MANTEL", "stage7-callout2", 0);

            // Phase 1 Callouts
            addSVGCallout(g, 25, 210, 480, 200, "CANTILEVERED BLACK STEEL BEAMS", "STRUCTURAL W12x50 SPAN OVERHANG", "stage7-callout3", 1);
            addSVGCallout(g, 520, 240, 480, 494, "FRAMELESS GLASS CURTAIN WALLS", "TRIPLE-PANE LOW-E ARGON GLAZING", "stage7-callout4", 1);

            // Phase 2 Callouts
            addSVGCallout(g, 25, 380, 350, 540, "NATIVE MEADOW & RIPARIAN WETLANDS", "ECOLOGICAL LANDSCAPE RESTORATION", "stage7-callout5", 2);
            addSVGCallout(g, 480, 410, 155, 200, "LEVEL 2 EV CHARGING BAY", "BI-DIRECTIONAL V2H 12 kWh BATTERY", "stage7-callout6", 2);

            addSVGTitleBlock(g, "MINIMALIST SYNTHESIS", "A-701", "2026", "SCALE: 3/16\" = 1'-0\"", "JUL 2026");
        },
        updateSVG: (g, prog, width, height, phase) => {
            if (!phase || phase.idx === undefined)
                return;
            const callouts = Array.from(g.querySelectorAll(".tech-callout, .tech-arrow, .tech-stamp-badge"));
            callouts.forEach(el => {
                const targetPhase = el.getAttribute("data-phase");
                const isVisible = targetPhase === null || targetPhase === "" || parseInt(targetPhase, 10) <= phase.idx;
                el.style.opacity = isVisible ? "1" : "0";
                el.style.pointerEvents = isVisible ? "auto" : "none";
            });
        },
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 40)
                drawHandLine(ctx, x, 0, x, height, 0.2, 2);
            for (let y = 0; y < height; y += 40)
                drawHandLine(ctx, 0, y, width, y, 0.2, 2);

            // Helper to draw radial gradient color blurs behind each callout target area when active
            const drawCalloutBlur = (c, tx, ty, rad, cInner, cOuter, active) => {
                if (!active)
                    return;
                c.save();
                const grad = c.createRadialGradient(tx, ty, 0, tx, ty, rad);
                grad.addColorStop(0, cInner);
                grad.addColorStop(0.5, cOuter);
                grad.addColorStop(1, "rgba(0, 0, 0, 0)");
                c.fillStyle = grad;
                c.beginPath();
                c.arc(tx, ty, rad, 0, Math.PI * 2);
                c.fill();
                c.restore();
            };

            // Render radial color blurs behind each callout target area based on active phase
            drawCalloutBlur(ctx, 400, 160, 95, "rgba(50, 205, 50, 0.45)", "rgba(50, 205, 50, 0.15)", phase.idx >= 0);
            drawCalloutBlur(ctx, 355, 280, 90, "rgba(255, 130, 40, 0.55)", "rgba(220, 60, 10, 0.2)", phase.idx >= 0);
            drawCalloutBlur(ctx, 480, 200, 95, "rgba(100, 140, 190, 0.5)", "rgba(60, 90, 140, 0.18)", phase.idx >= 1);
            drawCalloutBlur(ctx, 480, 494, 95, "rgba(60, 210, 255, 0.5)", "rgba(20, 130, 200, 0.18)", phase.idx >= 1);
            drawCalloutBlur(ctx, 350, 540, 100, "rgba(34, 190, 140, 0.55)", "rgba(20, 120, 90, 0.2)", phase.idx >= 2);
            drawCalloutBlur(ctx, 155, 200, 90, "rgba(0, 240, 255, 0.55)", "rgba(0, 150, 200, 0.2)", phase.idx >= 2);

            const planX = 100, planY = 160, planW = 600, planH = 340;
            const livingX = planX + 160, livingW = planW - 160;
            const garageW = 160;

            // Base Diorama Platform with independent shadow angle (Rule 3)
            drawDioramaPlatform(ctx, planX, planY, planW, planH, 20, "#111111", "#ffffff", 0.035);
            drawMechanicalTrack(ctx, planX + 20, planY + planH + 25, planX + planW - 20, planY + planH + 25, "rgba(255, 255, 255, 0.35)");

            // PHASE 0: 3,800 sq ft Minimalist Synthesis & Restored 1780 Fieldstone Hearth Core
            if (phase.idx === 0) {
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);

                // Part 2: Floor plan perimeter survey alignment reticles and progressive boundary expansion
                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                drawSketchRect(ctx, planX, planY, planW * assemblyProg, planH);
                ctx.lineWidth = 1.5;
                if (assemblyProg > 0.3) {
                    drawSketchRect(ctx, planX + 12, planY + 12, (planW - 24) * assemblyProg, planH - 24);
                    ctx.beginPath();
                    ctx.moveTo(planX + garageW, planY);
                    ctx.lineTo(planX + garageW, planY + planH * assemblyProg);
                    ctx.stroke();
                }
                if (secondaryProg > 0) {
                    drawSurveyReticle(ctx, planX + 30, planY + 30, 16 * secondaryProg, "BM #701 / 2026", "#ffffff");
                    drawSurveyReticle(ctx, planX + planW - 30, planY + 30, 16 * secondaryProg, "CORNER STAKE", "#ffffff");
                }
                ctx.restore();

                // Part 3 & Part 1: Restored 1780 fieldstone hearth core & thermal radiation vectors
                const coreX = livingX + 60, coreY = planY + 90, coreW = 70, coreH = 60;
                ctx.save();
                if (secondaryProg > 0) {
                    ctx.fillStyle = `rgba(180, 70, 40, ${0.75 * secondaryProg})`;
                    ctx.fillRect(coreX, coreY, coreW, coreH);
                }
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(coreX, coreY, coreW, coreH * assemblyProg);
                if (assemblyProg > 0.4)
                    drawMasonryHatch(ctx, coreX, coreY, coreW, coreH * assemblyProg, true);

                // Part 1: Glowing and pulsing warm thermal radiation vectors from central hearth
                if (secondaryProg > 0) {
                    ctx.strokeStyle = `rgba(255, 140, 40, ${0.85 * secondaryProg})`;
                    ctx.lineWidth = 2;
                    for (let r = 1; r <= 4; r++) {
                        const rad = r * 22 * secondaryProg + ((prog * 40) % 22);
                        ctx.beginPath();
                        ctx.arc(355, 280, rad, -0.3 * Math.PI, 0.8 * Math.PI);
                        ctx.stroke();
                    }
                }
                ctx.restore();

                // West-wing Garage Bay: Level 2 EV Charger & Battery Rack
                ctx.save();
                const batX = planX + 16, batY = planY + 30, batW = 26, batH = 90 * assemblyProg;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(batX, batY, batW, batH);
                if (assemblyProg > 0.5)
                    drawSteelHatch(ctx, batX, batY, batW, batH);
                const evX = planX + 55, evY = planY + 16, evW = 34, evH = 20;
                ctx.strokeRect(evX, evY, evW, evH);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 9px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("EV-L2", evX + evW / 2, evY + evH / 2);
                ctx.restore();

                drawDimensionLine(ctx, planX, planY - 18, planX + planW, planY - 18, "74'-0\" (OPEN FLOOR PLAN PERIMETER - 3,800 SQ. FT.)", "#ffffff", 6, "#000000");
                drawDimensionLine(ctx, planX + planW + 18, planY, planX + planW + 18, planY + planH, "52'-0\"", "#ffffff", 6, "#000000");
            } else if (phase.idx === 1) {
                // PHASE 1: Cantilevered Black Steel Beams & Frameless Glass Curtain Walls
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);

                // Background floor perimeter at 25% opacity
                ctx.save();
                ctx.globalAlpha = 0.25;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(planX, planY, planW, planH);
                ctx.strokeRect(livingX + 60, planY + 90, 70, 60);
                drawMasonryHatch(ctx, livingX + 60, planY + 90, 70, 60, true);
                ctx.restore();

                // Part 4: Cantilevered black steel structural W12x50 beam extending across span
                const beamX = livingX - 18;
                const beamY = planY + 40;
                const beamH = 22;
                const spanW = (livingW + 36) * easeOutQuart(assemblyProg);
                ctx.save();
                ctx.fillStyle = "#0a0a0a";
                ctx.fillRect(beamX, beamY, spanW, beamH);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                ctx.strokeRect(beamX, beamY, spanW, beamH);
                drawSteelHatch(ctx, beamX, beamY, spanW, beamH);
                for (let bx = beamX + 25; bx < beamX + spanW - 15; bx += 40) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(bx, beamY + 6, 2.5, 0, Math.PI * 2);
                    ctx.arc(bx, beamY + beamH - 6, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                // Part 5: Frameless glass curtain wall Panel 1 lowering vertically into position
                const glazeX1 = livingX + 30;
                const glazeY1 = planY + planH - 12;
                const glazeW1 = 180;
                const glazeH1 = 14;
                const dropY1 = (1 - easeOutQuart(assemblyProg)) * 80;
                ctx.save();
                ctx.translate(0, -dropY1);
                if (secondaryProg > 0) {
                    ctx.fillStyle = `rgba(60, 210, 255, ${0.55 * secondaryProg})`;
                    ctx.fillRect(glazeX1, glazeY1, glazeW1, glazeH1);
                }
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(glazeX1, glazeY1, glazeW1, glazeH1);
                ctx.lineWidth = 1.2;
                for (let gP = 1; gP <= 2; gP++) {
                    ctx.beginPath();
                    ctx.moveTo(glazeX1, glazeY1 + gP * 4.5);
                    ctx.lineTo(glazeX1 + glazeW1, glazeY1 + gP * 4.5);
                    ctx.stroke();
                }
                ctx.restore();

                // Part 6: Frameless glass curtain wall Panel 2 lowering into position
                const glazeX2 = glazeX1 + glazeW1 + 12;
                const glazeY2 = planY + planH - 12;
                const glazeW2 = 180;
                const glazeH2 = 14;
                const dropY2 = (1 - easeOutQuart(Math.max(0, (assemblyProg - 0.15) / 0.85))) * 70;
                ctx.save();
                ctx.translate(0, -dropY2);
                if (secondaryProg > 0) {
                    ctx.fillStyle = `rgba(60, 210, 255, ${0.55 * secondaryProg})`;
                    ctx.fillRect(glazeX2, glazeY2, glazeW2, glazeH2);
                }
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(glazeX2, glazeY2, glazeW2, glazeH2);
                ctx.lineWidth = 1.2;
                for (let gP = 1; gP <= 2; gP++) {
                    ctx.beginPath();
                    ctx.moveTo(glazeX2, glazeY2 + gP * 4.5);
                    ctx.lineTo(glazeX2 + glazeW2, glazeY2 + gP * 4.5);
                    ctx.stroke();
                }
                ctx.restore();

                // Part 7: Frameless glass curtain wall Panel 3 lowering along north facade
                const glazeX3 = livingX + 30;
                const glazeY3 = planY - 6;
                const glazeW3 = 360;
                const glazeH3 = 14;
                const dropY3 = (1 - easeOutQuart(Math.max(0, (assemblyProg - 0.25) / 0.75))) * 60;
                ctx.save();
                ctx.translate(0, -dropY3);
                if (secondaryProg > 0) {
                    ctx.fillStyle = `rgba(60, 210, 255, ${0.55 * secondaryProg})`;
                    ctx.fillRect(glazeX3, glazeY3, glazeW3, glazeH3);
                }
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(glazeX3, glazeY3, glazeW3, glazeH3);
                ctx.lineWidth = 1.2;
                for (let gP = 1; gP <= 2; gP++) {
                    ctx.beginPath();
                    ctx.moveTo(glazeX3, glazeY3 + gP * 4.5);
                    ctx.lineTo(glazeX3 + glazeW3, glazeY3 + gP * 4.5);
                    ctx.stroke();
                }
                ctx.restore();

                // Rooftop solar PV array with golden photon highlights and busbar energy streams
                const pvX = livingX + 20, pvY = planY + 145, pvW = livingW - 40, pvH = 75;
                ctx.save();
                if (secondaryProg > 0) {
                    ctx.fillStyle = `rgba(20, 90, 190, ${0.75 * secondaryProg})`;
                    ctx.fillRect(pvX, pvY, pvW, pvH);
                    for (let i = 0; i < 6; i++) {
                        const photonProg = ((prog * 500 + i * 50) % 65) / 65;
                        const px = pvX + 25 + i * ((pvW - 50) / 5);
                        const py = pvY - 35 + photonProg * 55;
                        if (py <= pvY + pvH - 5) {
                            ctx.fillStyle = `rgba(255, 240, 100, ${0.85 * secondaryProg})`;
                            ctx.beginPath();
                            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.8;
                ctx.strokeRect(pvX, pvY, pvW, pvH);
                ctx.lineWidth = 1;
                for (let px = pvX + 35; px < pvX + pvW; px += 35)
                    drawHandLine(ctx, px, pvY, px, pvY + pvH, 0.2, 1);

                for (let py = pvY + 25; py < pvY + pvH; py += 25)
                    drawHandLine(ctx, pvX, py, pvX + pvW, py, 0.2, 1);

                ctx.restore();

                drawDimensionLine(ctx, pvX, pvY - 14, pvX + pvW, pvY - 14, "ROOFTOP SOLAR PV ARRAY & R-60 INSULATION CORE", "#ffffff", 5, "#000000");
                drawDimensionLine(ctx, glazeX1, glazeY1 + 24, glazeX2 + glazeW2, glazeY2 + 24, "FRAMELESS TRIPLE-PANE LOW-E ARGON GLAZING (U-0.12)", "#ffffff", 5, "#000000");
            } else {
                // PHASE 2: Native Meadow, Riparian Wetlands & Level 2 EV Charging Bay
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);

                // Background house structure at 25% opacity
                ctx.save();
                ctx.globalAlpha = 0.25;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(planX, planY, planW, planH);
                ctx.strokeRect(livingX - 18, planY + 40, livingW + 36, 22);
                drawSteelHatch(ctx, livingX - 18, planY + 40, livingW + 36, 22);
                ctx.strokeRect(livingX + 30, planY + planH - 12, 372, 14);
                ctx.restore();

                // Subterranean Geothermal Hydronic Loops & HRV Recovery Core
                const radiantX = livingX + 15, radiantY = planY + 70, radiantW = livingW - 30, radiantH = planH - 100;
                /* eslint-disable-next-line no-unused-vars */
                const hrvX = planX + 25, hrvY = planY + 230, hrvW = 75, hrvH = 55;
                ctx.save();
                if (secondaryProg > 0) {
                    const slabGrad = ctx.createLinearGradient(radiantX, radiantY, radiantX + radiantW, radiantY + radiantH);
                    slabGrad.addColorStop(0, `rgba(220, 60, 60, ${0.6 * secondaryProg})`);
                    slabGrad.addColorStop(1, `rgba(40, 140, 220, ${0.6 * secondaryProg})`);
                    ctx.fillStyle = slabGrad;
                    ctx.fillRect(radiantX, radiantY, radiantW * assemblyProg, radiantH);
                }
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                const loopSpacing = 20;
                const loops = Math.floor(radiantH / loopSpacing);
                for (let l = 0; l <= loops; l++) {
                    const ly = radiantY + l * loopSpacing;
                    ctx.beginPath();
                    ctx.moveTo(radiantX, ly);
                    ctx.lineTo(radiantX + radiantW * assemblyProg, ly);
                    ctx.stroke();
                }
                ctx.restore();

                // Part 13: Level 2 EV charging grid flow vectors pulsing near the garage bay
                ctx.save();
                const batX = planX + 16, batY = planY + 30, batW = 26, batH = 90;
                const evX = planX + 55, evY = planY + 16, evW = 34, evH = 20;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(batX, batY, batW, batH);
                drawSteelHatch(ctx, batX, batY, batW, batH);
                ctx.strokeRect(evX, evY, evW, evH);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 9px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("EV-L2", evX + evW / 2, evY + evH / 2);

                if (secondaryProg > 0) {
                    ctx.fillStyle = `rgba(0, 255, 255, ${0.95 * secondaryProg})`;
                    ctx.shadowColor = "rgba(0, 255, 255, 0.9)";
                    ctx.shadowBlur = 8;
                    const dist1 = Math.hypot(evX - (batX + batW), (evY + 10) - (batY + 10));
                    for (let i = 0; i < 4; i++) {
                        const offset1 = ((prog * 700 + i * (dist1 / 4)) % dist1) / dist1;
                        const px1 = (batX + batW) + (evX - (batX + batW)) * offset1;
                        const py1 = (batY + 10) + ((evY + 10) - (batY + 10)) * offset1;
                        ctx.beginPath();
                        ctx.arc(px1, py1, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    const dist2 = Math.hypot((planX + 60) - (evX + evW / 2), (planY + 90) - (evY + evH));
                    for (let i = 0; i < 5; i++) {
                        const offset2 = ((prog * 900 + i * (dist2 / 5)) % dist2) / dist2;
                        const px2 = (evX + evW / 2) + ((planX + 60) - (evX + evW / 2)) * offset2;
                        const py2 = (evY + evH) + ((planY + 90) - (evY + evH)) * offset2;
                        ctx.beginPath();
                        ctx.arc(px2, py2, 3.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    const ledPulse = 0.5 + 0.5 * Math.sin(prog * Math.PI * 16);
                    ctx.fillStyle = `rgba(50, 255, 150, ${(0.4 + 0.6 * ledPulse) * secondaryProg})`;
                    ctx.beginPath();
                    ctx.arc(evX + evW - 7, evY + 7, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                // Part 8: Riparian wetland stream 1 flowing across foreground landscape
                ctx.save();
                const streamY = 535;
                ctx.strokeStyle = secondaryProg > 0 ? `rgba(0, 220, 255, ${0.85 * secondaryProg})` : "#cccccc";
                ctx.lineWidth = 3;
                ctx.setLineDash([16, 12]);
                ctx.lineDashOffset = -(prog * 70);
                ctx.beginPath();
                ctx.moveTo(140, streamY);
                ctx.quadraticCurveTo(320, streamY + 14, 480, streamY - 6);
                ctx.quadraticCurveTo(600, streamY - 14, 760, streamY + 10);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();

                // Part 9: Riparian wetland stream 2 / tributary flowing
                ctx.save();
                const stream2Y = 552;
                ctx.strokeStyle = secondaryProg > 0 ? `rgba(40, 180, 220, ${0.75 * secondaryProg})` : "#888888";
                ctx.lineWidth = 2;
                ctx.setLineDash([12, 8]);
                ctx.lineDashOffset = -(prog * 50 + 20);
                ctx.beginPath();
                ctx.moveTo(160, stream2Y);
                ctx.quadraticCurveTo(340, stream2Y - 10, 500, stream2Y + 8);
                ctx.quadraticCurveTo(620, stream2Y + 16, 750, stream2Y - 6);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();

                // Part 10: Swaying native meadow grass cluster 1
                ctx.save();
                ctx.strokeStyle = secondaryProg > 0 ? `rgba(180, 230, 160, ${0.85 * secondaryProg})` : "#ffffff";
                ctx.lineWidth = 2;
                const sway1 = Math.sin(prog * Math.PI * 8) * 8 * (secondaryProg || 0.5);
                for (let g = 0; g < 7; g++) {
                    const gx = 260 + g * 14;
                    const gy = 525;
                    const gh = 26 + (g % 3) * 6;
                    ctx.beginPath();
                    ctx.moveTo(gx, gy);
                    ctx.quadraticCurveTo(gx + sway1 * 0.5, gy - gh * 0.5, gx + sway1, gy - gh);
                    ctx.stroke();
                }
                ctx.restore();

                // Part 11: Swaying native meadow grass cluster 2
                ctx.save();
                ctx.strokeStyle = secondaryProg > 0 ? `rgba(160, 220, 150, ${0.85 * secondaryProg})` : "#ffffff";
                ctx.lineWidth = 2;
                const sway2 = Math.sin(prog * Math.PI * 8 + 1.5) * 8 * (secondaryProg || 0.5);
                for (let g = 0; g < 8; g++) {
                    const gx = 420 + g * 15;
                    const gy = 528;
                    const gh = 28 + (g % 2) * 8;
                    ctx.beginPath();
                    ctx.moveTo(gx, gy);
                    ctx.quadraticCurveTo(gx + sway2 * 0.5, gy - gh * 0.5, gx + sway2, gy - gh);
                    ctx.stroke();
                }
                ctx.restore();

                // Part 12: Swaying native meadow grass cluster 3
                ctx.save();
                ctx.strokeStyle = secondaryProg > 0 ? `rgba(170, 225, 155, ${0.85 * secondaryProg})` : "#ffffff";
                ctx.lineWidth = 2;
                const sway3 = Math.sin(prog * Math.PI * 8 + 3.0) * 8 * (secondaryProg || 0.5);
                for (let g = 0; g < 7; g++) {
                    const gx = 580 + g * 14;
                    const gy = 524;
                    const gh = 25 + ((g + 1) % 3) * 7;
                    ctx.beginPath();
                    ctx.moveTo(gx, gy);
                    ctx.quadraticCurveTo(gx + sway3 * 0.5, gy - gh * 0.5, gx + sway3, gy - gh);
                    ctx.stroke();
                }
                ctx.restore();

                drawDimensionLine(ctx, 160, 575, 750, 575, "NATIVE MEADOW RESTORATION & RIPARIAN WETLAND BUFFER", "#ffffff", 5, "#000000");
                drawDimensionLine(ctx, radiantX, radiantY + radiantH - 15, radiantX + radiantW, radiantY + radiantH - 15, "GEOTHERMAL HYDRONIC HEATING & HRV AIR RECOVERY", "#ffffff", 5, "#000000");
            }

            const titles = ["3,800 SQ. FT. MINIMALIST SYNTHESIS", "CANTILEVERED STEEL & GLASS SPAN", "NATIVE LANDSCAPE & EV BAY"];
            drawTitleBlock(ctx, width, height, titles[phase.idx], `A-701.${phase.idx + 1}`, "3/16\" = 1'-0\"", "JUL 2026", "#ffffff", "#0a0a0a");
        },
        updateDOM: (container, prog, width, height, phase) => {
            // DOM updates handled by sticky layout container
        }
    }
];
