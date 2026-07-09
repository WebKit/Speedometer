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
export function drawColorizedBackground(ctx, bgKey, x, y, w, h, color, wcKey = "wcWash", prog = 1.0, revealMode = "fade", revealArgs = {}) {
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
                // P0: Timber Clearing & Homestead Footprint Stakeout (Solid Construction / Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;
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

                // Staked 320 sq. ft. clearing footprint dropping into place during assemblyProg
                const dropY = (1 - easeOutQuart(assemblyProg)) * 40;
                ctx.save();
                ctx.translate(0, -dropY);
                drawSketchRect(ctx, 220, 400, 360, 40);
                drawEarthHatch(ctx, 220, 400, 360, 40, "rgba(255, 255, 255, 0.25)");
                ctx.strokeRect(260, 380, 280, 20); // Timber sill layout
                ctx.restore();

                // Secondary animation: Survey alignment reticles and clearing boundary dimensions
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
                drawDimensionLine(ctx, 260, 450, 540, 450, "320 SQ. FT. SURVey STAKED HOMESTEAD FOOTPRINT", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Hewn Log Carpentry & Interlocking Notched Joints (Solid Construction)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;

                // Foreground hewn oak log wall assembly on mechanical tracks
                const maxLogs = 6;
                const logsToShow = Math.min(maxLogs, Math.floor(assemblyProg * maxLogs) + 1);
                const logH = 26;
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
                    // Interlocking corner notches without iron nails
                    ctx.strokeRect(172, ly, 12, logH);
                    ctx.strokeRect(616, ly, 12, logH);
                    // Secondary animation: Rammed moss & clay chinking insulation
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
                // P2: Subterranean Dug Well & Dry-Laid Fieldstone Hearth (Geology & Utilities)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;

                // Log cabin slid back to 25% opacity
                ctx.save();
                ctx.globalAlpha = 0.25;
                drawSketchRect(ctx, 240, 260, 320, 140);
                drawMasonryHatch(ctx, 240, 260, 320, 140);
                ctx.restore();

                // Cutaway subterranean well shaft tapping water table on left
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
                    ctx.fillRect(124, 400 + wellDepth - (25 * secondaryProg), 62, 22 * secondaryProg); // Surface water table
                }

                // Massive dry-laid fieldstone hearth & chimney stack on right
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

                    const emberGrad = ctx.createRadialGradient(550, 375, 5, 550, 375, 45);
                    emberGrad.addColorStop(0, `rgba(255, 200, 50, ${fireAlpha})`);
                    emberGrad.addColorStop(0.4, `rgba(255, 100, 10, ${fireAlpha * 0.7})`);
                    emberGrad.addColorStop(1, "rgba(180, 40, 10, 0)");
                    ctx.fillStyle = emberGrad;
                    ctx.beginPath();
                    ctx.arc(550, 375, 45, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                drawSketchRect(ctx, 500, hearthY, 100, hearthH);
                drawMasonryHatch(ctx, 500, hearthY, 100, hearthH, true);

                // Secondary animation: Thermal heating radiation vectors
                if (secondaryProg > 0) {
                    ctx.strokeStyle = colorProg > 0 ? `rgba(255, 160, 50, ${0.8 * colorProg})` : "#666666";
                    ctx.lineWidth = 2;
                    for (let r = 1; r <= 3; r++) {
                        ctx.beginPath();
                        ctx.arc(550, 360, r * 18 * secondaryProg, Math.PI, 1.5 * Math.PI);
                        ctx.stroke();
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
                // P0: Geological Strata Profile (Geology & Subsoil Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;

                // Excavation profile cutting deeper into bedrock during assemblyProg
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
                drawEarthHatch(ctx, 120, 300, 560, Math.min(60, excavDepth), "rgba(255, 255, 255, 0.25)"); // Topsoil
                if (excavDepth > 60)
                    drawCrossSectionHatching(ctx, 120, 360, 560, Math.min(60, excavDepth - 60), 8, Math.PI / 4, "rgba(204, 204, 204, 0.4)"); // Impervious Clay

                if (excavDepth > 120)
                    drawMasonryHatch(ctx, 120, 420, 560, excavDepth - 120, true); // Metamorphic Granite Bedrock

                // Secondary animation: Geological strata elevation datums
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1.5;
                    drawHandLine(ctx, 120, 360, 680, 360, 0.2, 2); // Clay contact
                    drawHandLine(ctx, 120, 420, 680, 420, 0.2, 2); // Bedrock contact
                }
                drawDimensionLine(ctx, 120, 510, 680, 510, "GEOLOGICAL STRATA PROFILE EXCAVATION (BEDROCK & CLAY)", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Dry-Laid Fieldstone Footings & Gravity Keying (Solid Construction)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;
                drawDioramaPlatform(ctx, 120, 380, 560, 120, 20, "#111111", "#ffffff", 0.03);
                drawMasonryHatch(ctx, 120, 380, 560, 120, true); // Bedrock base

                // Glacial erratics dry-laid and keyed onto bedrock during assemblyProg
                const stones = Math.floor(assemblyProg * 8) + 1;
                for (let s = 0; s < Math.min(8, stones); s++) {
                    const sx = 160 + s * 60;
                    const sy = 320;
                    const dropY = s === stones - 1 ? (1 - (assemblyProg * 8 % 1)) * 40 : 0;
                    ctx.save();
                    ctx.translate(0, -dropY);
                    if (colorProg > 0) {
                        const stoneAlpha = 0.8 * colorProg;
                        const stoneGrad = ctx.createLinearGradient(sx, sy, sx, sy + 60);
                        stoneGrad.addColorStop(0, `rgba(235, 170, 50, ${stoneAlpha * 0.95})`);
                        stoneGrad.addColorStop(0.5, `rgba(217, 149, 36, ${stoneAlpha})`);
                        stoneGrad.addColorStop(1, `rgba(160, 110, 30, ${stoneAlpha * 0.8})`);
                        ctx.fillStyle = stoneGrad;
                        ctx.fillRect(sx, sy, 54, 60);
                    }
                    drawSketchRect(ctx, sx, sy, 54, 60);
                    drawMasonryHatch(ctx, sx, sy, 54, 60);
                    ctx.strokeRect(sx - 2, sy - 2, 58, 64);
                    ctx.restore();
                }

                // Secondary animation: Gravity keying load vectors and frost heave resistance
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 2.5 * secondaryProg;
                    for (let s = 0; s < 8; s += 2)
                        drawHandLine(ctx, 187 + s * 60, 300, 187 + s * 60, 330, 0.2, 2); // Downward load

                }
                drawDimensionLine(ctx, 160, 300, 620, 300, "DRY-LAID GRAVITY KEYED FOOTINGS - BASE THICKNESS 2'-6\"", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Gravity-Driven Drainage Trenching & Hydrological Flow (Geology & Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const colorProg = secondaryProg;
                const trenchW = 520 * easeOutQuart(assemblyProg);
                drawDioramaPlatform(ctx, 140, 320, trenchW, 160, 20, "#111111", "#ffffff", -0.035);
                drawMasonryHatch(ctx, 180, 340, Math.min(440, trenchW - 40), 100); // Footings inside

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
                    ctx.setLineDash([]);
                    ctx.restore();
                }

                // Perimeter sloped drainage trench with crushed gravel bed
                ctx.strokeStyle = "#cccccc";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(140, 460);
                ctx.lineTo(140 + trenchW, 460 + (trenchW / 520) * 30); // Gravity slope
                ctx.stroke();

                // Secondary animation: Hydrological groundwater flow arrows draining away from foundation
                if (secondaryProg > 0) {
                    const offset = (secondaryProg * 300) % 520;
                    const flowAlpha = colorProg > 0 ? 0.8 * colorProg : 1.0;
                    for (let w = 0; w < 4; w++) {
                        const wx = 140 + ((offset + w * 130) % 520);
                        if (wx <= 140 + trenchW) {
                            const wy = 460 + ((wx - 140) / 520) * 30;
                            if (colorProg > 0) {
                                ctx.fillStyle = `rgba(0, 180, 255, ${flowAlpha * 0.4})`;
                                ctx.beginPath();
                                ctx.arc(wx, wy - 6, 8, 0, Math.PI * 2);
                                ctx.fill();
                            }
                            ctx.fillStyle = colorProg > 0 ? `rgba(50, 230, 255, ${flowAlpha})` : "#cccccc";
                            ctx.beginPath();
                            ctx.arc(wx, wy - 6, 6, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
                drawDimensionLine(ctx, 140, 520, 660, 520, "GRAVITY DRAINAGE HYDROLOGICAL SLOPE & RUNOFF DIVERSION", "#ffffff", 6, "#ffffff");
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
                // P0: Steam-Milled Balloon Framing Assembly (Solid Construction)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 120, 450, 560, 40, 20, "#111111", "#ffffff", 0.03);
                // 2x4 vertical studs erecting from 2x6 sill plate to double top plate during assemblyProg
                const maxStudH = 260;
                const studH = maxStudH * easeOutQuart(assemblyProg);
                const lumberAlpha = 0.85 * easeOutQuart(secondaryProg);
                for (let s = 0; s < 8; s++) {
                    const sx = 150 + s * 70;
                    if (lumberAlpha > 0) {
                        const grad = ctx.createLinearGradient(sx - 6, 450 - studH, sx - 6, 450);
                        grad.addColorStop(0, `rgba(230, 160, 50, ${lumberAlpha})`);
                        grad.addColorStop(1, `rgba(180, 110, 30, ${lumberAlpha})`);
                        ctx.fillStyle = grad;
                        ctx.fillRect(sx - 6, 450 - studH, 12, studH);
                        ctx.fillStyle = "#ffffff";
                    }
                    ctx.strokeRect(sx - 6, 450 - studH, 12, studH);
                    drawHandLine(ctx, sx, 450, sx, 450 - studH, 0.2, 2);
                    // Secondary animation: Mass-produced cut wire nails and diagonal wind-bracing
                    if (secondaryProg > 0) {
                        ctx.fillStyle = "#cccccc";
                        ctx.fillRect(sx - 2, 446, 4, 4 * secondaryProg); // Wire nail connection
                        if (s < 7)
                            drawHandLine(ctx, sx + 6, 450 - studH * 0.6, sx + 64, 450 - studH * 0.4, 0.2, 2 * secondaryProg);

                        ctx.fillStyle = "#ffffff";
                    }
                }
                drawDimensionLine(ctx, 150, 470, 640, 470, "STEAM-MILLED BALLOON FRAMING STUDS @ 16\" O.C.", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Industrial Metallurgy - Lintel & Tie-Rods (Solid Construction & Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                // Background studs in 25% opacity
                ctx.save();
                ctx.globalAlpha = 0.25;
                for (let s = 0; s < 8; s++)
                    ctx.strokeRect(150 + s * 70 - 6, 190, 12, 260);
                ctx.restore();

                const spanW = 500 * easeOutQuart(assemblyProg);
                const winProg = easeOutQuart(secondaryProg);

                if (secondaryProg > 0) {
                    const brickAlpha = 0.85 * winProg;
                    const steelAlpha = 0.85 * winProg;

                    // Kiln-Fired Red Brick Terracotta Elevations
                    ctx.fillStyle = `rgba(180, 60, 40, ${brickAlpha})`;
                    ctx.fillRect(150, 250, 130, 200);
                    ctx.fillRect(520, 250, 130, 200);
                    ctx.fillRect(280, 250, 240, 20); // spandrel

                    // Metallic Steel-Blue Highlights along cast-iron lintel
                    ctx.fillStyle = `rgba(100, 130, 160, ${steelAlpha})`;
                    ctx.fillRect(150, 230, spanW, 20);
                }

                // Wrought iron tie-rods and cast-iron lintel beam sliding into place during assemblyProg
                ctx.strokeStyle = "#cccccc";
                ctx.lineWidth = 4;
                ctx.strokeRect(150, 230, spanW, 20);
                drawSteelHatch(ctx, 150, 230, spanW, 20);

                // Expansive parlor window opening and turnbuckle tension reinforcement
                if (secondaryProg > 0) {
                    const steelAlpha = 0.85 * winProg;
                    drawSketchRect(ctx, 280, 270, 240, 180 * winProg);

                    // Metallic Steel-Blue Highlights along wrought iron tie-rods
                    ctx.strokeStyle = `rgba(100, 130, 160, ${steelAlpha})`;
                    ctx.lineWidth = 6;
                    drawHandLine(ctx, 150, 240, 200, 240, 0.2, 3);
                    drawHandLine(ctx, 600, 240, 650, 240, 0.2, 3);

                    // Turnbuckle tension reinforcement vectors
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 2;
                    drawHandLine(ctx, 150, 240, 200, 240, 0.2, 3);
                    drawHandLine(ctx, 600, 240, 650, 240, 0.2, 3);

                    // Directional natural light flooding parlor (Warm Golden Sunlight Rays)
                    const sunGrad = ctx.createLinearGradient(0, 270, 0, 450);
                    sunGrad.addColorStop(0, `rgba(255, 220, 100, ${0.55 * winProg})`);
                    sunGrad.addColorStop(1, "rgba(255, 220, 100, 0.0)");
                    ctx.fillStyle = sunGrad;
                    ctx.beginPath();
                    ctx.moveTo(280, 270);
                    ctx.lineTo(520, 270);
                    ctx.lineTo(580, 450);
                    ctx.lineTo(220, 450);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                }
                drawDimensionLine(ctx, 150, 470, 650, 470, "CAST-IRON LINTEL BEAM & WROUGHT IRON TIE-ROD REINFORCEMENT", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Mechanized Pump & Indoor Copper Plumbing (Infrastructure Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 160, 360, 480, 120, 20, "#111111", "#ffffff", -0.03);

                if (secondaryProg > 0) {
                    const waterAlpha = 0.85 * easeOutQuart(secondaryProg);
                    const aqGrad = ctx.createLinearGradient(0, 410, 0, 480);
                    aqGrad.addColorStop(0, "rgba(0, 120, 200, 0.0)");
                    aqGrad.addColorStop(1, `rgba(0, 120, 200, ${waterAlpha})`);
                    ctx.fillStyle = aqGrad;
                    ctx.fillRect(160, 410, 480, 70);
                    ctx.fillStyle = "#ffffff";
                }

                // Deep aquifer borehole & pump mechanism assemble during assemblyProg
                const slideIn = (1 - easeOutQuart(assemblyProg)) * 50;
                ctx.save();
                ctx.translate(slideIn, 0);
                // Rotating cast-iron pump gears driven by secondaryProg
                const gearAngle1 = secondaryProg * Math.PI * 10;
                const gearAngle2 = -secondaryProg * Math.PI * 18;
                drawGear(ctx, 280, 260, 54, 18, gearAngle1, "#cccccc");
                drawGear(ctx, 354, 238, 30, 10, gearAngle2, "#ffffff");

                // Piston cylinder & copper plumbing pipe leading to indoor fixture
                const pistonY = 260 + Math.sin(gearAngle1) * 25;
                ctx.lineWidth = 3;
                drawHandLine(ctx, 280, pistonY, 280, 440, 0.2, 2);

                if (secondaryProg > 0) {
                    const copperAlpha = 0.85 * easeOutQuart(secondaryProg);
                    ctx.fillStyle = `rgba(210, 120, 60, ${copperAlpha})`;
                    ctx.fillRect(340, 360, 24, 100);
                    ctx.fillStyle = "#ffffff";
                }

                ctx.strokeRect(340, 360, 24, 100);
                drawSteelHatch(ctx, 340, 360, 24, 100);
                ctx.restore();

                // Secondary animation: Water pulses flowing upward from aquifer to indoor fixture
                if (secondaryProg > 0) {
                    const pulseOffset = (secondaryProg * 250) % 80;
                    ctx.fillStyle = `rgba(50, 220, 255, ${0.9 * easeOutQuart(secondaryProg)})`;
                    for (let w = 0; w < 3; w++) {
                        const wy = 440 - ((pulseOffset + w * 30) % 80);
                        if (wy > 360)
                            ctx.fillRect(346, wy, 12, 14);
                    }
                    ctx.fillStyle = "#ffffff";
                }
                drawDimensionLine(ctx, 160, 500, 640, 500, "MECHANIZED PUMP & INDOOR COPPER PLUMBING (60' AQUIFER)", "#ffffff", 6, "#ffffff");
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
                // P0: Agrarian Complex Expansion & Site Plan Layout (Solid Construction / Planning)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const { colorProg } = getLandscapeRevealTiming(phase.localProg);
                const siteAlpha = easeOutQuart(colorProg);
                drawDioramaPlatform(ctx, 80, 380, 640, 100, 20, "#111111", "#ffffff", 0.035);

                if (siteAlpha > 0) {
                    // Regional Land-Use Color Fills: pasture zones & central cultivated grain fields
                    ctx.fillStyle = `rgba(40, 160, 80, ${0.65 * siteAlpha})`;
                    ctx.fillRect(90, 390, 180, 80);
                    ctx.fillRect(530, 390, 180, 80);
                    ctx.fillStyle = `rgba(220, 180, 50, ${0.75 * siteAlpha})`;
                    ctx.fillRect(280, 390, 240, 80);
                    ctx.fillStyle = "#ffffff";
                }

                const slide = 200 * easeOutQuart(assemblyProg);
                if (siteAlpha > 0) {
                    // Rustic barn red/terracotta for central dwelling and assembling outbuildings
                    ctx.fillStyle = `rgba(160, 50, 40, ${0.8 * siteAlpha})`;
                    ctx.fillRect(350, 310, 100, 70); // Central dwelling
                    ctx.fillRect(350 - slide, 270, 110, 110); // Timber Barn
                    ctx.fillRect(450 + slide - 90, 310, 90, 70); // Granary
                    ctx.fillStyle = "#ffffff";
                }

                // Central homestead dwelling
                drawSketchRect(ctx, 350, 310, 100, 70);
                drawMasonryHatch(ctx, 350, 310, 100, 70);

                // Outbuildings (Timber Barn & Granary) assembling onto site plan during assemblyProg
                drawSketchRect(ctx, 350 - slide, 270, 110, 110); // Towering Timber Frame Barn left
                drawCrossSectionHatching(ctx, 350 - slide, 270, 110, 110, 8, Math.PI / 4, "rgba(204, 204, 204, 0.4)");
                drawSketchRect(ctx, 450 + slide - 90, 310, 90, 70); // Specialized Granary right
                drawCrossSectionHatching(ctx, 450 + slide - 90, 310, 90, 70, 8, -Math.PI / 4, "rgba(204, 204, 204, 0.4)");

                // Secondary animation: Operational courtyard circulation & site plan boundary dimensions
                if (secondaryProg > 0) {
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 2.5 * secondaryProg;
                    drawHandLine(ctx, 350 - slide + 110, 350, 350, 350, 0.4, 3);
                    drawHandLine(ctx, 450, 350, 450 + slide - 90, 350, 0.4, 3);
                }
                drawDimensionLine(ctx, 100, 500, 700, 500, "MULTI-BUILDING AGRARIAN COMPLEX SITE PLAN (45 CULTIVATED ACRES)", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Dry-Stone Boundary Walls & Wildlife Microhabitats (Solid Construction & Ecology)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const stoneAlpha = easeOutQuart(secondaryProg);
                // Buildings in soft background
                ctx.save();
                ctx.globalAlpha = 0.25;
                drawSketchRect(ctx, 140, 280, 100, 100);
                drawSketchRect(ctx, 350, 310, 100, 70);
                drawSketchRect(ctx, 560, 310, 90, 70);
                ctx.restore();

                // Miles of boundary walls constructing across pasture during assemblyProg
                const wallLen = 560 * easeOutQuart(assemblyProg);
                if (stoneAlpha > 0) {
                    ctx.fillStyle = `rgba(100, 140, 100, ${0.85 * stoneAlpha})`;
                    ctx.fillRect(120, 396, wallLen, 12);
                    ctx.fillStyle = "#ffffff";
                }

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                drawHandLine(ctx, 120, 400, 120 + wallLen, 400, 0.5, 8);
                for (let wx = 120; wx < 120 + wallLen; wx += 28) {
                    if (stoneAlpha > 0) {
                        const wallGrad = ctx.createLinearGradient(wx, 390, wx, 408);
                        wallGrad.addColorStop(0, `rgba(100, 140, 100, ${0.85 * stoneAlpha})`);
                        wallGrad.addColorStop(1, `rgba(130, 130, 140, ${0.85 * stoneAlpha})`);
                        ctx.fillStyle = wallGrad;
                        ctx.fillRect(wx, 390, 24, 18);
                        ctx.fillStyle = "#ffffff";
                    }
                    ctx.strokeRect(wx, 390, 24, 18);
                    drawMasonryHatch(ctx, wx, 390, 24, 18);
                }
                // Secondary animation: Silhouettes of native small mammals, birds & pollinators in grayscale
                if (secondaryProg > 0) {
                    ctx.fillStyle = "#cccccc";
                    for (let b = 0; b < 4; b++) {
                        const bx = 160 + b * 130 + Math.sin(secondaryProg * 10 + b) * 15;
                        const by = 360 + Math.cos(secondaryProg * 8 + b) * 10;
                        ctx.beginPath();
                        ctx.arc(bx, by, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.fillStyle = "#ffffff";
                }
                drawDimensionLine(ctx, 120, 450, 680, 450, "FROST-HEAVED DRY-STONE BOUNDARY WALLS & MICROHABITATS", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Structured Irrigation Sluice & Weir Gate Control (Hydraulic Engineering Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                const waterAlpha = easeOutQuart(secondaryProg);
                const orchardAlpha = easeOutQuart(secondaryProg);
                drawDioramaPlatform(ctx, 140, 340, 520, 140, 20, "#111111", "#ffffff", -0.03);

                // Stone-lined sluice channel & timber weir gate frame assembling during assemblyProg
                const dropY = (1 - easeOutQuart(assemblyProg)) * 40;
                ctx.save();
                ctx.translate(0, -dropY);
                if (waterAlpha > 0) {
                    const waterGrad = ctx.createLinearGradient(180, 350, 620, 350);
                    waterGrad.addColorStop(0, `rgba(0, 190, 210, ${0.85 * waterAlpha})`);
                    waterGrad.addColorStop(1, `rgba(0, 140, 180, ${0.85 * waterAlpha})`);
                    ctx.fillStyle = waterGrad;
                    ctx.fillRect(180, 350, 440, 60);
                    ctx.fillStyle = "#ffffff";
                }
                ctx.strokeRect(180, 340, 440, 80);
                drawEarthHatch(ctx, 180, 420, 440, 60, "rgba(255, 255, 255, 0.25)");
                ctx.restore();

                // Secondary animation: Wooden weir gate lifting & rushing water nourishing orchards
                const gateLift = 50 * easeOutQuart(secondaryProg);
                ctx.fillStyle = "#cccccc";
                ctx.fillRect(380, 340 - gateLift, 24, 80);
                ctx.strokeRect(380, 340 - gateLift, 24, 80);

                if (orchardAlpha > 0) {
                    ctx.fillStyle = `rgba(240, 180, 40, ${0.75 * orchardAlpha})`;
                    for (const ox of [160, 240, 310, 450, 530])
                        ctx.fillRect(ox, 320, 60, 20);

                    ctx.fillStyle = "#ffffff";
                }
                for (const ox of [160, 240, 310, 450, 530])
                    ctx.strokeRect(ox, 320, 60, 20);

                // Hydrological water flow lines in grayscale
                if (gateLift > 5) {
                    ctx.strokeStyle = "#666666";
                    ctx.lineWidth = 3;
                    const ripple = (secondaryProg * 300) % 40;
                    for (let wy = 360; wy < 410; wy += 14) {
                        drawHandLine(ctx, 190, wy, 375, wy, 0.2, 2);
                        drawHandLine(ctx, 408 + ripple, wy, 610, wy, 0.5, 4);
                    }
                }
                drawDimensionLine(ctx, 180, 500, 620, 500, "STRUCTURED IRRIGATION SLUICE & TIMBER WEIR GATE CONTROL", "#ffffff", 6, "#ffffff");
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
                // P0: Cultivation Ceased & Architectural Weathering (Structural Degradation)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 350, 520, 120, 20, "#111111", "#ffffff", 0.03);
                // Building facade moves into position during assemblyProg
                const dropY = (1 - easeOutQuart(assemblyProg)) * 30;
                ctx.save();
                ctx.translate(0, -dropY);
                const weatherAlpha = Math.min(1.0, phase.localProg / 0.35);
                if (weatherAlpha > 0) {
                    ctx.fillStyle = `rgba(140, 80, 40, ${0.45 * weatherAlpha})`;
                    ctx.fillRect(220, 220, 360, 22 * weatherAlpha);
                    ctx.fillStyle = `rgba(100, 110, 120, ${0.4 * weatherAlpha})`;
                    for (let lx = 235; lx < 570; lx += 45)
                        ctx.fillRect(lx, 242, 14, 108 * weatherAlpha);
                }
                drawSketchRect(ctx, 220, 220, 360, 130);
                drawMasonryHatch(ctx, 220, 220, 360, 130);
                ctx.restore();

                // Secondary animation: Wind-driven rain and peeling finish erosion lines in grayscale
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
                drawDimensionLine(ctx, 140, 490, 660, 490, "ABANDONED HOMESTEAD / ENVIRONMENTAL EXPOSURE & WEATHERING", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Roof Sag Deflection & Lime Mortar Leaching (Structural Failure Analysis)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 360, 520, 120, 20, "#111111", "#ffffff", 0.035);
                drawSketchRect(ctx, 200, 260, 400, 100);
                drawMasonryHatch(ctx, 200, 260, 400, 100, true);

                // During assemblyProg: Sagging roof ridge in quadratic curve under dead load
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

                // Secondary animation: Stepped foundation fissures and lime mortar leaching
                if (secondaryProg > 0) {
                    const crack = 80 * secondaryProg;
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
                }
                drawDimensionLine(ctx, 180, 300 + sag, 620, 300 + sag, "DEFLECTED ROOF RIDGE: 8.5\" MAX SAG (STRUCTURAL FAILURE)", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Ecological Succession & Botanical Reclamation (Ecology & Overgrowth Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 360, 520, 120, 20, "#111111", "#ffffff", -0.03);
                drawSketchRect(ctx, 200, 260, 400, 100);
                drawMasonryHatch(ctx, 200, 260, 400, 100, true);

                // During assemblyProg: roots establish in foundation beds; during secondaryProg: vines creep upward
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
                ctx.strokeStyle = vineStyle;
                ctx.lineWidth = 3.5;
                for (let v = 0; v < 6; v++) {
                    const startX = 220 + v * 65;
                    const maxH = 140 + (v % 3) * 30;
                    const currH = maxH * easeOutQuart(progressFactor);
                    ctx.beginPath();
                    ctx.moveTo(startX, 360);
                    ctx.bezierCurveTo(startX - 30, 360 - currH * 0.4, startX + 30, 360 - currH * 0.7, startX - 15, 360 - currH);
                    ctx.stroke();

                    if (currH > 30 && progressFactor > 0) {
                        ctx.fillStyle = leafStyle;
                        ctx.beginPath();
                        ctx.arc(startX - 15, 360 - currH, 6, 0, Math.PI * 2);
                        ctx.arc(startX - 8, 360 - currH + 6, 5, 0, Math.PI * 2);
                        ctx.arc(startX - 22, 360 - currH + 5, 5, 0, Math.PI * 2);
                        if (currH > 70) {
                            ctx.arc(startX + 12, 360 - currH * 0.5, 5, 0, Math.PI * 2);
                            ctx.arc(startX + 6, 360 - currH * 0.5 - 5, 4, 0, Math.PI * 2);
                        }
                        ctx.fill();
                    } else if (currH > 30 && secondaryProg > 0) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(startX - 15, 360 - currH, 6, 0, Math.PI * 2);
                        ctx.fill();
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
                // P0: Technical Blueprint Overlays & Survey Assessment (Diagnostics Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 360, 520, 100, 20, "#111111", "#ffffff", 0.035);
                drawSketchRect(ctx, 200, 260, 400, 100);

                // During assemblyProg: Crisp technical blueprint overlay aligning over historic shell
                const overlayH = 200 * easeOutQuart(assemblyProg);
                if (assemblyProg > 0)
                    ctx.fillStyle = `rgba(0, 255, 255, ${0.12 * assemblyProg})`;
                else
                    ctx.fillStyle = "rgba(204, 204, 204, 0.25)";
                ctx.fillRect(180, 240, 440, overlayH);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(180, 240, 440, overlayH);

                // Secondary animation: Pulsing laser transit elevation reference datums in grayscale / neon cyan
                if (secondaryProg > 0) {
                    ctx.save();
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.9 * secondaryProg})`;
                    ctx.shadowColor = `rgba(0, 255, 255, ${0.9 * secondaryProg})`;
                    ctx.shadowBlur = 14;
                    ctx.lineWidth = 2 + 1.5 * secondaryProg;
                    ctx.setLineDash([6, 4]);
                    ctx.beginPath();
                    ctx.moveTo(100, 310);
                    ctx.lineTo(100 + 600 * secondaryProg, 310);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                }
                drawDimensionLine(ctx, 180, 460, 620, 460, "CRISP TECHNICAL BLUEPRINT OVERLAY & LASER TRANSIT DATUM (REF A-4)", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Hydraulic Jacking & Steel Lintel / C-Channel Insertion (Solid Construction & Engineering)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 140, 380, 520, 80, 20, "#111111", "#ffffff", 0.03);

                // During assemblyProg: Sagging joists physically lifting back to horizontal level via hydraulic jacks
                const initialSag = 35 * (1 - easeOutQuart(assemblyProg));
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(180, 340);
                ctx.quadraticCurveTo(400, 340 + initialSag, 620, 340);
                ctx.stroke();

                // 12-ton hydraulic jack cylinders extending upward during assemblyProg
                const jackAlpha = assemblyProg;
                const jackH = 40 + (35 - initialSag);
                for (const jx of [280, 520]) {
                    if (jackAlpha > 0) {
                        ctx.fillStyle = `rgba(80, 120, 160, ${0.8 * jackAlpha})`;
                        ctx.fillRect(jx - 18, 380 - jackH, 36, jackH);
                    }
                    ctx.strokeRect(jx - 18, 380 - jackH, 36, jackH);
                    drawSteelHatch(ctx, jx - 18, 380 - jackH, 36, jackH);
                }

                // Secondary animation: Hidden steel W12x50 I-Beam lintels & C-channel grids locking in
                if (secondaryProg > 0) {
                    const steelW = 440 * easeOutQuart(secondaryProg);
                    ctx.fillStyle = `rgba(80, 120, 160, ${0.8 * secondaryProg})`;
                    ctx.fillRect(180, 260, steelW, 20);
                    ctx.strokeStyle = "#cccccc";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(180, 260, steelW, 20);
                    drawSteelHatch(ctx, 180, 260, steelW, 20);

                    ctx.save();
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.7 * secondaryProg})`;
                    ctx.shadowColor = `rgba(0, 255, 255, ${0.7 * secondaryProg})`;
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(140, 340);
                    ctx.lineTo(140 + 520 * secondaryProg, 340);
                    ctx.stroke();
                    ctx.restore();
                }
                drawDimensionLine(ctx, 180, 480, 620, 480, "12-TON HYDRAULIC JACK JOIST REALIGNMENT & STEEL W12x50 LINTEL", "#ffffff", 6, "#ffffff");

            } else {
                // P2: Epoxy Resin Splicing & Reclaimed Hardwood Joinery (Solid Construction & Code Compliance)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 160, 360, 480, 100, 20, "#111111", "#ffffff", -0.035);

                // Macro cutaway of timber sill with rotted section removed; hardwood splice block inserting
                const dropY = (1 - easeOutQuart(assemblyProg)) * 30;
                ctx.save();
                ctx.translate(0, -dropY);
                if (assemblyProg > 0) {
                    ctx.fillStyle = `rgba(240, 180, 40, ${0.25 * assemblyProg})`;
                    ctx.fillRect(220, 280, 360, 80);
                }
                ctx.strokeRect(220, 280, 360, 80);
                drawMasonryHatch(ctx, 220, 280, 200, 80); // Existing timber left
                ctx.restore();

                // Secondary animation: Liquid epoxy resin injection bonding the joint under pressure
                if (secondaryProg > 0) {
                    const fillW = 160 * easeOutQuart(secondaryProg);
                    const epoxyGrad = ctx.createLinearGradient(420, 280, 420 + fillW, 280);
                    epoxyGrad.addColorStop(0, `rgba(240, 180, 40, ${0.85 * secondaryProg})`);
                    epoxyGrad.addColorStop(1, `rgba(200, 130, 20, ${0.9 * secondaryProg})`);
                    ctx.fillStyle = epoxyGrad;
                    ctx.fillRect(420, 280, fillW, 80);
                    ctx.strokeRect(420, 280, fillW, 80);
                    drawCrossSectionHatching(ctx, 420 + fillW - 40, 280, Math.min(40, fillW), 80, 6, Math.PI / 4, "#cccccc");
                }
                drawDimensionLine(ctx, 220, 480, 580, 480, "EPOXY RESIN SPLICING & RECLAIMED HARDWOOD JOINERY (CODE ST-201)", "#ffffff", 6, "#ffffff");
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
                // P0: Closed-Cell Thermal Envelope (High-Performance Insulation Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
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
                        if (foamH > 5) {
                            ctx.fillStyle = `rgba(245, 200, 60, ${0.85 * secondaryProg})`;
                            ctx.fillRect(cx, 220 + (140 - foamH), 60, foamH);
                            drawInsulationHatch(ctx, cx, 220 + (140 - foamH), 60, foamH, secondaryProg, "#cccccc");
                        }
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
                drawDimensionLine(ctx, 140, 480, 660, 480, "R-45 AIRTIGHT CLOSED-CELL THERMAL ENVELOPE SPRAY FOAM", "#ffffff", 6, "#ffffff");

            } else if (phase.idx === 1) {
                // P1: Triple-Pane Low-E Argon Glazing (Fenestration Engineering Information)
                const { assemblyProg, secondaryProg } = getPhaseTiming(phase.localProg);
                drawDioramaPlatform(ctx, 160, 380, 480, 80, 20, "#111111", "#ffffff", 0.03);

                // During assemblyProg: Old window sash sliding out left, new high-performance window sliding in right
                const slideOut = 200 * easeOutQuart(assemblyProg);
                ctx.save();
                ctx.globalAlpha = 1 - assemblyProg;
                drawSketchRect(ctx, 240 - slideOut, 220, 140, 160);
                ctx.restore();

                const slideIn = 200 * (1 - easeOutQuart(assemblyProg));
                const winX = 330 + slideIn;
                const winY = 220;
                const winW = 180;
                const winH = 160;

                const argonAlpha = secondaryProg;
                if (argonAlpha > 0) {
                    const centerX = winX + winW / 2;
                    const centerY = winY + winH / 2;
                    const argonGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.max(winW, winH) * 0.6);
                    argonGrad.addColorStop(0, `rgba(50, 200, 255, ${0.75 * argonAlpha})`);
                    argonGrad.addColorStop(1, `rgba(50, 200, 255, ${0.15 * argonAlpha})`);
                    ctx.fillStyle = argonGrad;
                    ctx.fillRect(winX + 2, winY + 2, winW - 4, winH - 4);
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

                // Blocking external red infrared heat vectors that bounce away
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

                // Subterranean 400-ft geothermal bore loop moving into bedrock during assemblyProg
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

                // Secondary animation: Circulating heat-exchange fluid particles & solar PV array tilting
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

                // Solar PV array tilting on roof
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
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);

            const planX = 100, planY = 160, planW = 600, planH = 340;
            const livingX = planX + 160, livingW = planW - 160;
            const garageW = 160;

            drawImageIfLoaded(ctx, getOrLoadImage("grid"), planX, planY, planW, planH, 0.2, "screen");

            if (phase.idx >= 0) {
                const p0Prog = phase.idx === 0 ? phase.localProg : 1.0;
                const { secondaryProg } = getPhaseTiming(p0Prog);

                // 1 & 2. Size / Footprint & EV Bay - Procedural Highlights
                if (p0Prog > 0) {
                    ctx.save();
                    // Aspect 1: Living wing perimeter slate/emerald fill (3,800 sq. ft. area)
                    ctx.fillStyle = `rgba(40, 140, 90, ${0.25 * p0Prog})`;
                    ctx.fillRect(livingX, planY, livingW, planH);
                    // Aspect 1: Historic masonry hearth core warm terracotta fill
                    const coreX_fill = livingX + 60, coreY_fill = planY + 90, coreW_fill = 70, coreH_fill = 60;
                    ctx.fillStyle = `rgba(180, 70, 40, ${0.55 * p0Prog})`;
                    ctx.fillRect(coreX_fill, coreY_fill, coreW_fill, coreH_fill);
                    // Aspect 2: 12 kWh Battery storage stack energy amber fill
                    const batX_fill = planX + 16, batY_fill = planY + 30, batW_fill = 26, batH_fill = 90;
                    ctx.fillStyle = `rgba(230, 160, 40, ${0.45 * p0Prog})`;
                    ctx.fillRect(batX_fill, batY_fill, batW_fill, batH_fill);
                    // Aspect 2: Level 2 EV charging wall-box electric cyan fill
                    const evX_fill = planX + 55, evY_fill = planY + 16, evW_fill = 34, evH_fill = 20;
                    ctx.fillStyle = `rgba(0, 220, 255, ${0.45 * p0Prog})`;
                    ctx.fillRect(evX_fill, evY_fill, evW_fill, evH_fill);
                    ctx.restore();
                }

                // Architectural Floor Plan Perimeter (74'-0" x 52'-0")
                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 3;
                ctx.strokeRect(planX, planY, planW, planH);
                ctx.lineWidth = 1.5;
                ctx.strokeRect(planX + 12, planY + 12, planW - 24, planH - 24);
                ctx.beginPath();
                ctx.moveTo(planX + garageW, planY);
                ctx.lineTo(planX + garageW, planY + planH);
                ctx.moveTo(planX + garageW + 8, planY + 12);
                ctx.lineTo(planX + garageW + 8, planY + planH - 12);
                ctx.stroke();
                ctx.restore();

                // Historic Masonry Core Hatching
                const coreX = livingX + 60, coreY = planY + 90, coreW = 70, coreH = 60;
                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(coreX, coreY, coreW, coreH);
                drawMasonryHatch(ctx, coreX, coreY, coreW, coreH, true);
                ctx.restore();

                // Integrated West-wing Garage Bay: Level 2 EV Charger & 12 kWh Battery Storage Stack
                ctx.save();
                const batX = planX + 16, batY = planY + 30, batW = 26, batH = 90;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(batX, batY, batW, batH);
                drawSteelHatch(ctx, batX, batY, batW, batH);
                for (let b = 1; b < 4; b++) {
                    ctx.beginPath();
                    ctx.moveTo(batX, batY + b * 22.5);
                    ctx.lineTo(batX + batW, batY + b * 22.5);
                    ctx.stroke();
                }

                const evX = planX + 55, evY = planY + 16, evW = 34, evH = 20;
                ctx.strokeRect(evX, evY, evW, evH);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 9px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("EV-L2", evX + evW / 2, evY + evH / 2);

                if (secondaryProg > 0 || phase.idx > 0) {
                    const carProg = phase.idx === 0 ? secondaryProg : 1.0;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * carProg})`;
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([6, 4]);
                    ctx.strokeRect(planX + 28, planY + 80, 64, 140);
                    ctx.setLineDash([]);
                    drawHandLine(ctx, evX + evW / 2, evY + evH, planX + 60, planY + 80, 0.3, 3);
                }
                ctx.restore();

                drawDimensionLine(ctx, planX, planY - 18, planX + planW, planY - 18, "74'-0\" (OPEN FLOOR PLAN PERIMETER - 3,800 SQ. FT.)", "#ffffff", 6, "#000000");
                drawDimensionLine(ctx, planX + planW + 18, planY, planX + planW + 18, planY + planH, "52'-0\"", "#ffffff", 6, "#000000");
                drawDimensionLine(ctx, planX + 16, planY + planH - 35, planX + garageW - 10, planY + planH - 35, "12 kWh BATTERY & EV BAY", "#ffffff", 5, "#000000");
            }

            if (phase.idx >= 1) {
                const p1Prog = phase.idx === 1 ? phase.localProg : 1.0;

                // 3 & 4. Roof Overhang & Envelope - Procedural Highlights
                const overhangX = planX - 18, overhangY = planY - 18, overhangW = planW + 36, overhangH = planH + 36;
                if (p1Prog > 0) {
                    ctx.save();
                    const pvX_fill = livingX + 20, pvY_fill = planY + 160, pvW_fill = livingW - 40, pvH_fill = 75;
                    // Aspect 3: Radiant solar cell sapphire fill across panel array
                    ctx.fillStyle = `rgba(20, 90, 190, ${0.5 * p1Prog})`;
                    ctx.fillRect(pvX_fill, pvY_fill, pvW_fill, pvH_fill);
                    // Aspect 3: Glowing golden busbars along cantilever overhang margin
                    ctx.fillStyle = `rgba(255, 210, 50, ${0.25 * p1Prog})`;
                    ctx.fillRect(overhangX, overhangY, overhangW, 18);
                    ctx.fillRect(overhangX, overhangY + overhangH - 18, overhangW, 18);
                    // Aspect 4: Insulating envelope golden-yellow cavity fill along north overhang core
                    ctx.fillStyle = `rgba(240, 190, 50, ${0.45 * p1Prog})`;
                    ctx.fillRect(livingX, overhangY, livingW, 16);
                    ctx.restore();
                }

                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 6]);
                ctx.strokeRect(overhangX, overhangY, overhangW, overhangH);
                ctx.setLineDash([]);

                const pvX = livingX + 20, pvY = planY + 160, pvW = livingW - 40, pvH = 75;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.8;
                ctx.strokeRect(pvX, pvY, pvW, pvH);
                ctx.lineWidth = 1;
                for (let px = pvX + 35; px < pvX + pvW; px += 35) {
                    ctx.beginPath();
                    ctx.moveTo(px, pvY);
                    ctx.lineTo(px, pvY + pvH);
                    ctx.stroke();
                }
                for (let py = pvY + 25; py < pvY + pvH; py += 25) {
                    ctx.beginPath();
                    ctx.moveTo(pvX, py);
                    ctx.lineTo(pvX + pvW, py);
                    ctx.stroke();
                }

                drawInsulationHatch(ctx, livingX, overhangY, livingW, 16, p1Prog, "#ffffff");

                if (phase.idx > 1 || p1Prog > 0.3) {
                    const envProg = phase.idx === 1 ? p1Prog : 1.0;
                    drawInsulationHatch(ctx, planX + 2, planY + 2, planW - 4, 10, envProg, "rgba(204, 204, 204, 0.8)");
                    drawInsulationHatch(ctx, planX + 2, planY + planH - 12, planW - 4, 10, envProg, "rgba(204, 204, 204, 0.8)");
                }

                const glazeX = livingX + 30, glazeY = planY + planH - 6, glazeW = livingW - 60, glazeH = 12;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(glazeX, glazeY - 6, glazeW, glazeH);
                ctx.lineWidth = 1.2;
                for (let gP = 0; gP < 3; gP++) {
                    ctx.beginPath();
                    ctx.moveTo(glazeX, glazeY - 3 + gP * 3);
                    ctx.lineTo(glazeX + glazeW, glazeY - 3 + gP * 3);
                    ctx.stroke();
                }
                ctx.fillStyle = `rgba(60, 210, 255, ${0.55 * p1Prog})`;
                ctx.fillRect(glazeX, glazeY - 4, glazeW, 8);
                ctx.restore();

                drawDimensionLine(ctx, pvX, pvY - 14, pvX + pvW, pvY - 14, "ROOFTOP SOLAR PV ARRAY & R-60 INSULATION CORE", "#ffffff", 5, "#000000");
                drawDimensionLine(ctx, glazeX, glazeY + 22, glazeX + glazeW, glazeY + 22, "FRAMELESS TRIPLE-PANE LOW-E ARGON GLAZING (U-0.12)", "#ffffff", 5, "#000000");
            }

            if (phase.idx >= 2) {
                const p2Prog = phase.localProg;

                // 5. Geothermal Hydronic & HRV Core - Procedural Highlights
                const radiantX = livingX + 15, radiantY = planY + 30, radiantW = livingW - 30, radiantH = planH - 60;
                const hrvX = planX + 25, hrvY = planY + 230, hrvW = 75, hrvH = 55;
                if (p2Prog > 0) {
                    ctx.save();
                    // Aspect 5: Radiant thermal convection linear gradient (Red inlet to Blue outlet)
                    const slabGrad = ctx.createLinearGradient(radiantX, radiantY, radiantX + radiantW, radiantY + radiantH);
                    slabGrad.addColorStop(0, `rgba(220, 60, 60, ${0.45 * p2Prog})`);
                    slabGrad.addColorStop(1, `rgba(40, 140, 220, ${0.45 * p2Prog})`);
                    ctx.fillStyle = slabGrad;
                    ctx.fillRect(radiantX, radiantY, radiantW, radiantH);

                    // Aspect 5: HRV air recovery core dual-zone green/amber fill
                    ctx.fillStyle = `rgba(40, 200, 150, ${0.35 * p2Prog})`;
                    ctx.fillRect(hrvX, hrvY, hrvW / 2, hrvH);
                    ctx.fillStyle = `rgba(230, 140, 50, ${0.35 * p2Prog})`;
                    ctx.fillRect(hrvX + hrvW / 2, hrvY, hrvW / 2, hrvH);
                    ctx.restore();
                }

                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                const loopSpacing = 20;
                const loops = Math.floor(radiantH / loopSpacing);
                for (let l = 0; l <= loops; l++) {
                    const ly = radiantY + l * loopSpacing;
                    ctx.moveTo(radiantX, ly);
                    ctx.lineTo(radiantX + radiantW, ly);
                }
                ctx.stroke();
                ctx.lineWidth = 1;
                for (let l = 0; l < loops; l++) {
                    const ly1 = radiantY + l * loopSpacing, ly2 = radiantY + (l + 1) * loopSpacing;
                    ctx.beginPath();
                    if (l % 2 === 0)
                        ctx.arc(radiantX + radiantW, (ly1 + ly2) / 2, loopSpacing / 2, -Math.PI / 2, Math.PI / 2);
                    else
                        ctx.arc(radiantX, (ly1 + ly2) / 2, loopSpacing / 2, Math.PI / 2, -Math.PI / 2);
                    ctx.stroke();
                }

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(hrvX, hrvY, hrvW, hrvH);
                ctx.lineWidth = 1.5;
                ctx.strokeRect(hrvX + 6, hrvY + 6, hrvW - 12, hrvH - 12);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 10px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("HRV-CORE", hrvX + hrvW / 2, hrvY + hrvH / 2);

                ctx.save();
                ctx.strokeStyle = `rgba(40, 200, 150, ${0.9 * p2Prog})`; // Fresh intake emerald/cyan
                ctx.lineWidth = 2.2;
                drawHandLine(ctx, hrvX - 50, hrvY + 18, hrvX, hrvY + 18, 0.2, 2);
                ctx.beginPath();
                ctx.moveTo(hrvX - 8, hrvY + 13);
                ctx.lineTo(hrvX, hrvY + 18);
                ctx.lineTo(hrvX - 8, hrvY + 23);
                ctx.stroke();

                ctx.strokeStyle = `rgba(230, 140, 50, ${0.9 * p2Prog})`; // Warm exhaust amber
                drawHandLine(ctx, hrvX, hrvY + 38, hrvX - 50, hrvY + 38, 0.2, 2);
                ctx.beginPath();
                ctx.moveTo(hrvX - 42, hrvY + 33);
                ctx.lineTo(hrvX - 50, hrvY + 38);
                ctx.lineTo(hrvX - 42, hrvY + 43);
                ctx.stroke();

                ctx.strokeStyle = `rgba(40, 140, 220, ${0.9 * p2Prog})`; // Hydronic exchange blue
                drawHandLine(ctx, hrvX + hrvW, hrvY + 28, radiantX, hrvY + 28, 0.2, 2);
                ctx.beginPath();
                ctx.moveTo(radiantX - 8, hrvY + 23);
                ctx.lineTo(radiantX, hrvY + 28);
                ctx.lineTo(radiantX - 8, hrvY + 33);
                ctx.stroke();
                ctx.restore();

                drawDimensionLine(ctx, radiantX, radiantY + radiantH - 18, radiantX + radiantW, radiantY + radiantH - 18, "SUBTERRANEAN GEOTHERMAL HYDRONIC HEATING LOOPS (COPPER / PEX)", "#ffffff", 5, "#000000");
                drawDimensionLine(ctx, hrvX - 50, hrvY + hrvH + 12, hrvX + hrvW, hrvY + hrvH + 12, "BALANCED AIR EXCHANGE RECOVERY CORE (92% EFFICIENCY)", "#ffffff", 5, "#000000");
            }
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
        updateDOM: (container, prog, width, height, phase) => {
            // DOM updates handled by sticky layout container
        }
    }
];
