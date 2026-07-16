/*
 * Copyright (C) 2014 Apple Inc. All rights reserved.
 * Copyright (C) 2024 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * 1950s Black & White Blueprint / Planning Design with Gradual Organic Watercolor Animation Reveals
 * Enhanced with Organic Hand-Drafted Fuzzy Pencil Linework, Offscreen Sprite Caching, & High-Contrast Pure Black
 *
 * Core Style & Aesthetic Rules:
 * - Theme: Negative blueprint drafting / technical planning print on a pure black background (#000000).
 * - Palette: Strictly high-contrast B&W for all structural UI, wireframes, typography, and procedural line art.
 *   Primary drafting ink is pure white (#ffffff), secondary lines/specifications are light gray (#cccccc), and hatching/grids are muted gray (#777777).
 * - Background Assets: Strictly planning paper dot grid (no static watercolor or grayscale bitmap background textures).
 * - Linework: All vector paths and geometric primitives use dual-pass, irregular, wobbly, and fuzzy pencil strokes with corner overruns.
 * - Performance: Repeating hatchings and complex geometric elements are cached to offscreen sprites and procedural patterns.
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
    grid: "public/planning_paper_dot_grid.webp",
};

const imageCache = {};
const spriteCache = {};
const patternCache = {};

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

function getCachedSprite(key, width, height, renderFunc) {
    if (typeof document === "undefined" && typeof OffscreenCanvas === "undefined")
        return null;
    if (!spriteCache[key]) {
        let canvas = null;
        if (typeof OffscreenCanvas !== "undefined") {
            canvas = new OffscreenCanvas(width, height);
        } else if (typeof document !== "undefined") {
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
        }
        if (canvas) {
            const ctx = canvas.getContext("2d");
            renderFunc(ctx, width, height);
            spriteCache[key] = canvas;
        }
    }
    return spriteCache[key] || null;
}

function getCachedPattern(ctx, key, width, height, renderFunc) {
    if (!patternCache[key]) {
        const sprite = getCachedSprite(`pattern_${key}`, width, height, renderFunc);
        if (sprite && ctx && typeof ctx.createPattern === "function")
            patternCache[key] = ctx.createPattern(sprite, "repeat");
    }
    return patternCache[key] || null;
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
    const colorProg = Math.max(0.0, Math.min(1.0, p / 0.6));
    const labelProg = Math.max(0.0, Math.min(1.0, (p - 0.6) / 0.4));
    return { colorProg, labelProg };
}

function getPhaseTiming(localProg) {
    const assemblyProg = Math.min(1.0, localProg / 0.35);
    const secondaryProg = Math.max(0.0, Math.min(1.0, (localProg - 0.35) / 0.35));
    const holdProg = Math.max(0.0, Math.min(1.0, (localProg - 0.7) / 0.3));
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
            item.g.setAttribute("transform", "translate(0, 50) scale(1)");

            const phase = getParagraphPhase(stageProg, 5);
            setCalloutPhaseVisibility(item.g, phase);

            const handler = STAGE_HANDLERS[i];
            if (handler) {
                if (typeof handler.updateSVG === "function")
                    handler.updateSVG(item.g, stageProg, item.canvas.width, item.canvas.height, phase);

                if (typeof handler.renderCanvas === "function") {
                    item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
                    item.ctx.save();
                    item.ctx.translate(0, 50);
                    handler.renderCanvas(item.ctx, item.g, stageProg, item.canvas.width, item.canvas.height, phase);
                    item.ctx.restore();
                    drawTopMiddleWidget(item.ctx, i, stageProg, phase);
                }
            }

            item.lastProg = stageProg;
        }
    }
}

/* =========================================================================
   1950s STRICT GRAYSCALE & B&W ORGANIC FUZZY PENCIL DRAFTING UTILITIES
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

/**
 * Core Organic Fuzzy Pencil Line Primitive
 * Draws dual-pass, high-resolution scanned pencil strokes with natural human drafting wobble,
 * uneven line pressure, and quirky drafting errors (overshooting corners by ±1.5..3.0px).
 */
function drawFuzzyPencilLine(ctx, x1, y1, x2, y2, roughness = 0.8, width = 1.2, options = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1)
        return;

    const ux = dx / dist;
    const uy = dy / dist;
    const nx = -uy;
    const ny = ux;

    let sx = x1,
        sy = y1,
        ex = x2,
        ey = y2;

    if (options.overshoot !== false && options.overshoot !== 0) {
        const seedOvershoot = ((x1 * 3.1 + y1 * 7.7 + x2 * 5.3 + y2 * 11.1) % 1.5) + 1.5;
        const os = typeof options.overshoot === "number" ? options.overshoot : seedOvershoot;
        sx = x1 - ux * os;
        sy = y1 - uy * os;
        ex = x2 + ux * os;
        ey = y2 + uy * os;
    }

    const steps = Math.max(3, Math.ceil(dist / 14));
    const color = options.color || ctx.strokeStyle || "#ffffff";
    const secondaryColor = options.secondaryColor || "rgba(255, 255, 255, 0.45)";

    // Pass 1: Fuzzy secondary underlying stroke (soft pencil lead scatter)
    ctx.save();
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = width * 1.4;
    ctx.shadowBlur = options.shadowBlur || 2.2;
    ctx.shadowColor = options.shadowColor || "rgba(255, 255, 255, 0.65)";
    ctx.beginPath();
    ctx.moveTo(sx + nx * 0.5, sy + ny * 0.5);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        let px = sx + (ex - sx) * t;
        let py = sy + (ey - sy) * t;
        if (i < steps) {
            const seed = (x1 * 13.1 + y1 * 71.7 + x2 * 19.3 + y2 * 41.9 + i * 17.3) * 0.1;
            px += Math.sin(seed) * roughness * 1.2;
            py += Math.cos(seed * 1.3) * roughness * 1.2;
        }
        ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Pass 2: Primary sharp/wobbly core pencil line
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        let px = sx + (ex - sx) * t;
        let py = sy + (ey - sy) * t;
        if (i < steps) {
            const seed = (x1 * 17.3 + y1 * 53.1 + x2 * 23.9 + y2 * 31.7 + i * 29.3) * 0.12;
            px += Math.sin(seed * 1.1) * roughness;
            py += Math.cos(seed * 0.9) * roughness;
        }
        ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Optional double-stroked overlapping middle segment for human uneven pressure
    if (options.doubleStroke !== false && dist > 25) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = Math.max(0.8, width * 0.85);
        ctx.beginPath();
        const midT1 = 0.2 + ((x1 + y1) % 0.2);
        const midT2 = 0.65 + ((x2 + y2) % 0.2);
        ctx.moveTo(sx + (ex - sx) * midT1 + nx * roughness * 0.6, sy + (ey - sy) * midT1 + ny * roughness * 0.6);
        ctx.lineTo(sx + (ex - sx) * midT2 + nx * roughness * 0.4, sy + (ey - sy) * midT2 + ny * roughness * 0.4);
        ctx.stroke();
    }
    ctx.restore();
}

/* eslint-disable-next-line no-unused-vars */
function drawHandLine(ctx, x1, y1, x2, y2, roughness = 0.6, steps = 4) {
    drawFuzzyPencilLine(ctx, x1, y1, x2, y2, roughness, ctx.lineWidth || 1, {
        overshoot: 2.2,
        doubleStroke: typeof steps === "number" && steps > 3,
    });
}

function drawSketchRect(ctx, x, y, w, h, overshoot = 2.8, options = {}) {
    drawFuzzyPencilLine(ctx, x, y, x + w, y, options.roughness || 0.6, ctx.lineWidth || 1, { ...options, overshoot });
    drawFuzzyPencilLine(ctx, x + w, y, x + w, y + h, options.roughness || 0.6, ctx.lineWidth || 1, { ...options, overshoot });
    drawFuzzyPencilLine(ctx, x + w, y + h, x, y + h, options.roughness || 0.6, ctx.lineWidth || 1, { ...options, overshoot });
    drawFuzzyPencilLine(ctx, x, y + h, x, y, options.roughness || 0.6, ctx.lineWidth || 1, { ...options, overshoot });
}

/* eslint-disable-next-line no-unused-vars */
function drawCrossSectionHatching(ctx, x, y, w, h, spacing = 8, angle = -Math.PI / 4, color = "rgba(255, 255, 255, 0.35)") {
    if (w <= 0 || h <= 0)
        return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

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
        drawFuzzyPencilLine(ctx, x1, y1, x2, y2, 0.4, 1, {
            color,
            secondaryColor: "rgba(255, 255, 255, 0.18)",
            overshoot: false,
            doubleStroke: false,
        });
    }
    ctx.restore();
}

function drawMasonryHatch(ctx, x, y, w, h, weathered = false) {
    if (w <= 0 || h <= 0)
        return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const tileKey = weathered ? "masonry_weathered_tile" : "masonry_clean_tile";
    const pattern = getCachedPattern(ctx, tileKey, 64, 64, (sCtx, sw, sh) => {
        sCtx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        sCtx.lineWidth = 1;
        const spacing = 14;
        for (let d = -sh; d < sw + sh; d += spacing) {
            if (weathered && Math.sin(d * 0.5) > 0.3)
                continue;
            drawFuzzyPencilLine(sCtx, d, 0, d - sh, sh, 0.4, 1, {
                color: "rgba(255, 255, 255, 0.45)",
                secondaryColor: "rgba(255, 255, 255, 0.2)",
                overshoot: false,
                doubleStroke: false,
            });
        }
    });

    if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(x - 20, y - 20, w + 40, h + 40);
    } else {
        const spacing = 14;
        for (let d = -h; d < w + h; d += spacing) {
            if (weathered && Math.sin(d * 0.5) > 0.3)
                continue;
            drawFuzzyPencilLine(ctx, x + d, y, x + d - h, y + h, 0.4, 1, {
                color: "rgba(255, 255, 255, 0.45)",
                secondaryColor: "rgba(255, 255, 255, 0.2)",
                overshoot: false,
                doubleStroke: false,
            });
        }
    }
    ctx.restore();
}

function drawSteelHatch(ctx, x, y, w, h) {
    if (w <= 0 || h <= 0)
        return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const pattern = getCachedPattern(ctx, "steel_hatch_tile", 64, 64, (sCtx, sw, sh) => {
        for (let d = -sh; d < sw + sh; d += 16) {
            drawFuzzyPencilLine(sCtx, d, 0, d - sh, sh, 0.3, 1, {
                color: "rgba(255, 255, 255, 0.55)",
                secondaryColor: "rgba(255, 255, 255, 0.25)",
                overshoot: false,
                doubleStroke: false,
            });
            drawFuzzyPencilLine(sCtx, d + 4, 0, d + 4 - sh, sh, 0.3, 1, {
                color: "rgba(255, 255, 255, 0.55)",
                secondaryColor: "rgba(255, 255, 255, 0.25)",
                overshoot: false,
                doubleStroke: false,
            });
        }
    });

    if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(x - 20, y - 20, w + 40, h + 40);
    } else {
        for (let d = -h; d < w + h; d += 16) {
            drawFuzzyPencilLine(ctx, x + d, y, x + d - h, y + h, 0.3, 1, {
                color: "rgba(255, 255, 255, 0.55)",
                secondaryColor: "rgba(255, 255, 255, 0.25)",
                overshoot: false,
                doubleStroke: false,
            });
            drawFuzzyPencilLine(ctx, x + d + 4, y, x + d + 4 - h, y + h, 0.3, 1, {
                color: "rgba(255, 255, 255, 0.55)",
                secondaryColor: "rgba(255, 255, 255, 0.25)",
                overshoot: false,
                doubleStroke: false,
            });
        }
    }
    ctx.restore();
}

function drawInsulationHatch(ctx, x, y, w, h, prog = 1.0, color = "rgba(204, 204, 204, 0.7)") {
    if (w <= 0 || h <= 0)
        return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const loopW = 12;
    const loops = Math.ceil(w / loopW);
    const midY = y + h / 2;
    const amp = (h / 2 - 3) * Math.min(1.0, prog * 1.2);

    for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass === 0 ? "rgba(255, 255, 255, 0.3)" : color;
        ctx.lineWidth = pass === 0 ? 2.2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(x, midY);
        for (let i = 0; i < loops; i++) {
            const lx = x + i * loopW;
            const jx = (i % 2 === 0 ? 0.6 : -0.6) * (pass === 0 ? 1 : 0);
            ctx.bezierCurveTo(lx + loopW * 0.25 + jx, midY - amp, lx + loopW * 0.75 + jx, midY - amp, lx + loopW, midY);
            ctx.bezierCurveTo(lx + loopW * 0.75 - jx, midY + amp, lx + loopW * 0.25 - jx, midY + amp, lx, midY);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawEarthHatch(ctx, x, y, w, h, color = "rgba(255, 255, 255, 0.35)") {
    if (w <= 0 || h <= 0)
        return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const pattern = getCachedPattern(ctx, "earth_hatch_tile", 80, 80, (sCtx, sw, sh) => {
        for (let d = -sh; d < sw + sh; d += 20) {
            drawFuzzyPencilLine(sCtx, d, 0, d - sh, sh, 0.4, 1, {
                color,
                secondaryColor: "rgba(255, 255, 255, 0.15)",
                overshoot: false,
                doubleStroke: false,
            });
        }
        for (let ty = 15; ty < sh; ty += 25) {
            for (let tx = 10; tx < sw; tx += 40) {
                drawFuzzyPencilLine(sCtx, tx, ty, tx + 14, ty, 0.5, 1.2, {
                    color,
                    secondaryColor: "rgba(255, 255, 255, 0.15)",
                    overshoot: false,
                    doubleStroke: false,
                });
            }
        }
    });

    if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(x - 20, y - 20, w + 40, h + 40);
    } else {
        for (let d = -h; d < w + h; d += 20) {
            drawFuzzyPencilLine(ctx, x + d, y, x + d - h, y + h, 0.4, 1, {
                color,
                secondaryColor: "rgba(255, 255, 255, 0.15)",
                overshoot: false,
                doubleStroke: false,
            });
        }
        for (let ty = y + 15; ty < y + h; ty += 25) {
            for (let tx = x + 10; tx < x + w; tx += 40) {
                drawFuzzyPencilLine(ctx, tx, ty, tx + 14, ty, 0.5, 1.2, {
                    color,
                    secondaryColor: "rgba(255, 255, 255, 0.15)",
                    overshoot: false,
                    doubleStroke: false,
                });
            }
        }
    }
    ctx.restore();
}

function drawWoodGrainHatch(ctx, x, y, w, h, density = 4, count = 3) {
    if (w <= 0 || h <= 0)
        return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const spacing = Math.max(4, h / (density + 1));
    for (let i = 1; i <= density; i++) {
        const py = y + i * spacing;
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.28)";
            ctx.lineWidth = pass === 0 ? 1.6 : 1.1;
            ctx.beginPath();
            ctx.moveTo(x, py);
            for (let c = 0; c < count; c++) {
                const j = pass === 0 ? 0.8 : 0;
                const cx1 = x + (w / count) * (c + 0.3);
                const cy1 = py + (i % 2 === 0 ? -3 : 3) * (c + 1) + j;
                const cx2 = x + (w / count) * (c + 0.7);
                const cy2 = py + (i % 2 === 0 ? 3 : -3) * (c + 1) - j;
                const ex = x + (w / count) * (c + 1);
                ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, py);
            }
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawFuzzyGearGeometry(ctx, cx, cy, radius, teeth, color = "#ffffff") {
    ctx.save();
    const pts = [];
    for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 === 0 ? radius : radius * 0.75;
        const a = (i * Math.PI) / teeth;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        drawFuzzyPencilLine(ctx, p1[0], p1[1], p2[0], p2[1], 0.5, 1.6, {
            color,
            secondaryColor: "rgba(255, 255, 255, 0.4)",
            overshoot: 1.6,
            doubleStroke: true,
        });
    }

    const innerPts = 12;
    for (let i = 0; i < innerPts; i++) {
        const a1 = (i * Math.PI * 2) / innerPts;
        const a2 = ((i + 1) * Math.PI * 2) / innerPts;
        drawFuzzyPencilLine(ctx, cx + Math.cos(a1) * (radius * 0.32), cy + Math.sin(a1) * (radius * 0.32), cx + Math.cos(a2) * (radius * 0.32), cy + Math.sin(a2) * (radius * 0.32), 0.4, 1.4, {
            color,
            secondaryColor: "rgba(255, 255, 255, 0.4)",
            overshoot: 0.8,
        });
    }
    ctx.restore();
}

function drawGear(ctx, cx, cy, radius, teeth, angle, color = "#ffffff") {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const spriteW = Math.ceil(radius * 2.8);
    const spriteH = Math.ceil(radius * 2.8);
    const spriteKey = `gear_${teeth}_${Math.round(radius)}_${color}`;

    const sprite = getCachedSprite(spriteKey, spriteW, spriteH, (sCtx, sw, sh) => {
        drawFuzzyGearGeometry(sCtx, sw / 2, sh / 2, radius, teeth, color);
    });

    if (sprite)
        ctx.drawImage(sprite, -spriteW / 2, -spriteH / 2);
    else
        drawFuzzyGearGeometry(ctx, 0, 0, radius, teeth, color);

    ctx.restore();
}

function drawRoundRect(ctx, x, y, w, h, r, options = {}) {
    ctx.save();
    drawFuzzyPencilLine(ctx, x + r, y, x + w - r, y, options.roughness || 0.6, ctx.lineWidth || 1.2, options);
    drawFuzzyPencilLine(ctx, x + w, y + r, x + w, y + h - r, options.roughness || 0.6, ctx.lineWidth || 1.2, options);
    drawFuzzyPencilLine(ctx, x + w - r, y + h, x + r, y + h, options.roughness || 0.6, ctx.lineWidth || 1.2, options);
    drawFuzzyPencilLine(ctx, x, y + h - r, x, y + r, options.roughness || 0.6, ctx.lineWidth || 1.2, options);

    const corners = [
        [x + w - r, y + r, 0],
        [x + w - r, y + h - r, Math.PI / 2],
        [x + r, y + h - r, Math.PI],
        [x + r, y + r, Math.PI * 1.5],
    ];
    for (const [cx, cy, startA] of corners) {
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(255, 255, 255, 0.4)" : options.color || "#ffffff";
            ctx.lineWidth = pass === 0 ? (ctx.lineWidth || 1.2) * 1.4 : ctx.lineWidth || 1.2;
            ctx.beginPath();
            for (let s = 0; s <= 4; s++) {
                const a = startA + (s / 4) * (Math.PI / 2);
                let px = cx + Math.cos(a) * r;
                let py = cy + Math.sin(a) * r;
                if (s > 0 && s < 4) {
                    px += Math.sin(s + startA) * 0.6;
                    py += Math.cos(s + startA) * 0.6;
                }
                if (s === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
    }
    ctx.restore();
}

/* Dimension Line with Independent & Irregular Shadow Angle */
function drawDimensionLine(ctx, x1, y1, x2, y2, label, color = "#ffffff", tickSize = 6, bgColor = "#0a0a0a") {
    ctx.save();
    ctx.strokeStyle = "#D12B3E";
    ctx.fillStyle = "#D12B3E";
    ctx.lineWidth = 1.4;

    drawFuzzyPencilLine(ctx, x1, y1, x2, y2, 0.4, 1.4, {
        color: "#D12B3E",
        secondaryColor: "rgba(209, 43, 62, 0.45)",
        overshoot: 2.2,
    });

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const tickAngle = Math.PI / 4;
    for (const [ptX, ptY] of [
        [x1, y1],
        [x2, y2],
    ]) {
        drawFuzzyPencilLine(ctx, ptX - Math.cos(angle + tickAngle) * tickSize, ptY - Math.sin(angle + tickAngle) * tickSize, ptX + Math.cos(angle + tickAngle) * tickSize, ptY + Math.sin(angle + tickAngle) * tickSize, 0.3, 1.5, {
            color: "#D12B3E",
            secondaryColor: "rgba(209, 43, 62, 0.45)",
            overshoot: 1.5,
        });
    }

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textW = ctx.measureText(label).width;
    const boxW = textW + 14;
    const boxH = 18;

    ctx.save();
    ctx.translate(midX + 5, midY + 4);
    ctx.rotate(0.031);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(-0.015);
    const badgeBgColor = bgColor === "#ffffff" || bgColor === "#000000" ? "#0a0a0a" : bgColor;
    ctx.fillStyle = badgeBgColor;
    ctx.beginPath();
    ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.fill();
    ctx.lineWidth = 1.4;
    drawRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 4, { color: "#D12B3E", secondaryColor: "rgba(209, 43, 62, 0.45)" });
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

    const ringPts = 16;
    for (let rFactor of [1.0, 0.35]) {
        const r = radius * rFactor;
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(209, 43, 62, 0.4)" : "#D12B3E";
            ctx.lineWidth = pass === 0 ? 2.0 : 1.4;
            ctx.beginPath();
            for (let i = 0; i <= ringPts; i++) {
                const a = (i * Math.PI * 2) / ringPts;
                let px = x + Math.cos(a) * r;
                let py = y + Math.sin(a) * r;
                if (i > 0 && i < ringPts) {
                    px += Math.sin(i * 1.7 + x) * 0.6;
                    py += Math.cos(i * 1.3 + y) * 0.6;
                }
                if (i === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
    }

    drawFuzzyPencilLine(ctx, x - radius - 6, y, x + radius + 6, y, 0.3, 1.4, { color: "#D12B3E", secondaryColor: "rgba(209, 43, 62, 0.45)" });
    drawFuzzyPencilLine(ctx, x, y - radius - 6, x, y + radius + 6, 0.3, 1.4, { color: "#D12B3E", secondaryColor: "rgba(209, 43, 62, 0.45)" });

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
        ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + radius + 15);
    }
    ctx.restore();
}

/* Title Block with Independent & Irregular Shadow Angle */
// eslint-disable-next-line no-unused-vars
function drawTitleBlock(ctx, width, height, title, dwgNo, scale, date = "OCT 1954", color = "#ffffff", bgColor = "#0a0a0a") {
    ctx.save();
    const boxW = 280;
    const boxH = 58;
    const bx = width - boxW - 20;
    const by = height - boxH - 20;

    ctx.save();
    ctx.translate(bx + boxW / 2 + 10, by + boxH / 2 + 12);
    ctx.rotate(0.026);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(bx + boxW / 2, by + boxH / 2);
    ctx.rotate(-0.014);
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.fill();

    ctx.lineWidth = 2.2;
    drawRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 6, { color: "#D12B3E", secondaryColor: "rgba(209, 43, 62, 0.45)" });

    drawFuzzyPencilLine(ctx, -boxW / 2, -boxH / 2 + 24, -boxW / 2 + boxW, -boxH / 2 + 24, 0.3, 1.5, { color: "#D12B3E", secondaryColor: "rgba(209, 43, 62, 0.45)", overshoot: 1.8 });
    drawFuzzyPencilLine(ctx, -boxW / 2 + 195, -boxH / 2 + 24, -boxW / 2 + 195, -boxH / 2 + boxH, 0.3, 1, { color: "#ffffff", secondaryColor: "rgba(255, 255, 255, 0.4)", overshoot: 1.8 });

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("PROJECT A-101: THE HOMESTEAD DOSSIER", -boxW / 2 + 8, -boxH / 2 + 16);

    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.fillText(title, -boxW / 2 + 8, -boxH / 2 + 40);
    ctx.fillStyle = "#cccccc";
    ctx.font = "10px system-ui, -apple-system, sans-serif";
    ctx.fillText(`SCALE: ${scale}`, -boxW / 2 + 8, -boxH / 2 + 51);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.fillText(`DWG ${dwgNo}`, -boxW / 2 + 203, -boxH / 2 + 40);
    ctx.fillStyle = "#cccccc";
    ctx.font = "10px system-ui, -apple-system, sans-serif";
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
        cx: targetX,
        cy: targetY,
        r: 4,
        fill: "#D12B3E",
        stroke: "#ffffff",
        "stroke-width": "1.2",
    });
    group.appendChild(targetDot);

    const tilt = targetX > x ? -1.5 : 1.5;
    const shadowTilt = targetX > x ? 1.4 : -1.7;
    const estTextW = text ? text.length * 6.8 + 24 : 0;
    const estSubW = subtext ? subtext.length * 5.9 + 24 : 0;
    const boxW = Math.max(190, Math.ceil(Math.max(estTextW, estSubW)));
    const boxH = subtext ? 36 : 26;
    const bx = x - (targetX > x ? 0 : boxW);
    const by = y - 24;

    const calloutBox = createSVGElement("g", { class: "tech-callout-box" });
    calloutBox.style.transition = "none";
    const boxCenterX = bx + boxW / 2;
    const boxCenterY = by + boxH / 2;
    calloutBox.setAttribute("data-center-x", String(boxCenterX));
    calloutBox.setAttribute("data-center-y", String(boxCenterY));

    const shadowBg = createSVGElement("rect", {
        x: bx + (targetX > x ? 7 : -7),
        y: by + 8,
        width: boxW,
        height: boxH,
        fill: "#000000",
        rx: "4",
        ry: "4",
        transform: `rotate(${shadowTilt}, ${boxCenterX}, ${boxCenterY})`,
    });
    calloutBox.appendChild(shadowBg);

    const labelBg = createSVGElement("rect", {
        x: bx,
        y: by,
        width: boxW,
        height: boxH,
        fill: "#0a0a0a",
        stroke: "#D12B3E",
        "stroke-width": "2",
        rx: "4",
        ry: "4",
        transform: `rotate(${tilt}, ${boxCenterX}, ${boxCenterY})`,
    });
    calloutBox.appendChild(labelBg);

    const textEl = createSVGElement("text", {
        x: bx + 8,
        y: by + 16,
        fill: "#ffffff",
        "font-family": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        "font-size": "11",
        "font-weight": "bold",
        transform: `rotate(${tilt}, ${boxCenterX}, ${boxCenterY})`,
    });
    textEl.textContent = text;
    calloutBox.appendChild(textEl);

    if (subtext) {
        const subEl = createSVGElement("text", {
            x: bx + 8,
            y: by + 28,
            fill: "#cccccc",
            "font-family": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            "font-size": "10",
            transform: `rotate(${tilt}, ${boxCenterX}, ${boxCenterY})`,
        });
        subEl.textContent = subtext;
        calloutBox.appendChild(subEl);
    }

    group.appendChild(calloutBox);
    g.appendChild(group);
    return group;
}

// eslint-disable-next-line no-unused-vars
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
        x1,
        y1,
        x2,
        y2,
        stroke: "#D12B3E",
        "stroke-width": "2.5",
        class: "tech-arrow-line",
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
        fill: "#D12B3E",
        class: "tech-arrow-head",
    });
    group.appendChild(head);

    const tx = (x1 + x2) / 2 + 10;
    const ty = (y1 + y2) / 2;
    const textEl = createSVGElement("text", {
        x: tx,
        y: ty,
        fill: "#ffffff",
        "font-family": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        "font-size": "11",
        "font-weight": "bold",
        class: "tech-arrow-label",
    });
    textEl.textContent = label;
    group.appendChild(textEl);

    g.appendChild(group);
    return group;
}

function addSVGTitleBlock(g, project, dwgNo, rev, scale, date = "OCT 1954") {
    const box = createSVGElement("g", { class: "tech-title-block", transform: "translate(0, -50)" });
    box.style.transition = "none";

    const shadow = createSVGElement("rect", {
        x: 488,
        y: 520,
        width: 300,
        height: 70,
        fill: "#000000",
        rx: "6",
        ry: "6",
        transform: "rotate(1.7, 638, 555)",
    });
    box.appendChild(shadow);

    const frameGroup = createSVGElement("g", { transform: "rotate(-1.2, 630, 545)" });
    const frame = createSVGElement("rect", {
        x: 480,
        y: 510,
        width: 300,
        height: 70,
        fill: "#0a0a0a",
        stroke: "#D12B3E",
        "stroke-width": "2.5",
        rx: "6",
        ry: "6",
    });
    frameGroup.appendChild(frame);

    const div1 = createSVGElement("line", { x1: 480, y1: 535, x2: 780, y2: 535, stroke: "#D12B3E", "stroke-width": "1.5" });
    const div2 = createSVGElement("line", { x1: 480, y1: 558, x2: 780, y2: 558, stroke: "#ffffff", "stroke-width": "1" });
    const div3 = createSVGElement("line", { x1: 640, y1: 535, x2: 640, y2: 580, stroke: "#ffffff", "stroke-width": "1" });
    frameGroup.append(div1, div2, div3);

    const tProj = createSVGElement("text", { x: 490, y: 528, fill: "#ffffff", "font-family": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', "font-size": "11", "font-weight": "bold" });
    tProj.textContent = `PROJ: ${project}`;

    const tDwg = createSVGElement("text", { x: 490, y: 550, fill: "#ffffff", "font-family": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', "font-size": "10", "font-weight": "bold" });
    tDwg.textContent = `DWG: ${dwgNo}`;

    const tRev = createSVGElement("text", { x: 650, y: 550, fill: "#ffffff", "font-family": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', "font-size": "10", "font-weight": "bold" });
    tRev.textContent = `REV: ${rev}`;

    const tScale = createSVGElement("text", { x: 490, y: 572, fill: "#cccccc", "font-family": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', "font-size": "10" });
    tScale.textContent = `SCALE: ${scale}`;

    const tDate = createSVGElement("text", { x: 650, y: 572, fill: "#cccccc", "font-family": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', "font-size": "10" });
    tDate.textContent = `DATE: ${date}`;

    frameGroup.append(tProj, tDwg, tRev, tScale, tDate);
    box.appendChild(frameGroup);
    g.appendChild(box);
}

function getParagraphPhase(progress, numParagraphs = 5) {
    const p = Math.max(0, Math.min(0.9999, progress));
    const idx = Math.floor(p * numParagraphs);
    const localProg = p * numParagraphs - idx;
    return { idx, localProg };
}

function setCalloutPhaseVisibility(g, phaseInput) {
    const phaseIdx = typeof phaseInput === "object" && phaseInput !== null && typeof phaseInput.idx === "number" ? phaseInput.idx : typeof phaseInput === "number" ? phaseInput : 0;
    const localProg = typeof phaseInput === "object" && phaseInput !== null && typeof phaseInput.localProg === "number" ? phaseInput.localProg : 1.0;

    const callouts = Array.from(g.querySelectorAll(".tech-callout, .tech-arrow, .tech-stamp-badge, .tech-datum"));
    const phaseCounters = {};

    callouts.forEach((el) => {
        const targetPhaseAttr = el.getAttribute("data-phase");
        const targetPhase = targetPhaseAttr === null || targetPhaseAttr === "" ? 0 : parseInt(targetPhaseAttr, 10);

        if (phaseCounters[targetPhase] === undefined)
            phaseCounters[targetPhase] = 0;

        const itemIndex = phaseCounters[targetPhase]++;

        if (targetPhase < phaseIdx) {
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
            const box = el.querySelector(".tech-callout-box");
            if (box) {
                const cx = parseFloat(box.getAttribute("data-center-x")) || 0;
                const cy = parseFloat(box.getAttribute("data-center-y")) || 0;
                box.setAttribute("transform", `translate(${cx}, ${cy}) scale(1) translate(${-cx}, ${-cy})`);
            }
        } else if (targetPhase > phaseIdx) {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
            const box = el.querySelector(".tech-callout-box");
            if (box) {
                const cx = parseFloat(box.getAttribute("data-center-x")) || 0;
                const cy = parseFloat(box.getAttribute("data-center-y")) || 0;
                box.setAttribute("transform", `translate(${cx}, ${cy}) scale(0.35) translate(${-cx}, ${-cy})`);
            }
        } else {
            const stagger = 0.18;
            const duration = 0.45;
            const start = itemIndex * stagger;
            const t = (localProg - start) / duration;

            if (t <= 0) {
                el.style.opacity = "0";
                el.style.pointerEvents = "none";
                const box = el.querySelector(".tech-callout-box");
                if (box) {
                    const cx = parseFloat(box.getAttribute("data-center-x")) || 0;
                    const cy = parseFloat(box.getAttribute("data-center-y")) || 0;
                    box.setAttribute("transform", `translate(${cx}, ${cy}) scale(0.35) translate(${-cx}, ${-cy})`);
                }
            } else if (t >= 1) {
                el.style.opacity = "1";
                el.style.pointerEvents = "auto";
                const box = el.querySelector(".tech-callout-box");
                if (box) {
                    const cx = parseFloat(box.getAttribute("data-center-x")) || 0;
                    const cy = parseFloat(box.getAttribute("data-center-y")) || 0;
                    box.setAttribute("transform", `translate(${cx}, ${cy}) scale(1) translate(${-cx}, ${-cy})`);
                }
            } else {
                const opacity = Math.min(1, t * 2.0);
                el.style.opacity = String(opacity.toFixed(4));
                el.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
                const box = el.querySelector(".tech-callout-box");
                if (box) {
                    const popScale = 0.35 + 0.65 * easeOutBack(t);
                    const cx = parseFloat(box.getAttribute("data-center-x")) || 0;
                    const cy = parseFloat(box.getAttribute("data-center-y")) || 0;
                    box.setAttribute("transform", `translate(${cx}, ${cy}) scale(${popScale.toFixed(4)}) translate(${-cx}, ${-cy})`);
                }
            }
        }
    });
}

// eslint-disable-next-line no-unused-vars
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
    drawFuzzyPencilLine(ctx, x1, y1, x2, y2, 0.3, 2.5, { color, secondaryColor: "rgba(255, 255, 255, 0.45)", overshoot: 3.0 });
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.floor(dist / 22);
    for (let i = 0; i <= steps; i++) {
        const tx = x1 + Math.cos(angle) * (i * 22);
        const ty = y1 + Math.sin(angle) * (i * 22);
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(255, 255, 255, 0.4)" : color;
            ctx.lineWidth = pass === 0 ? 1.8 : 1.2;
            ctx.beginPath();
            const r = 2.5;
            for (let s = 0; s <= 8; s++) {
                const a = (s * Math.PI * 2) / 8;
                const px = tx + Math.cos(a) * r + (s > 0 && s < 8 ? Math.sin(s + i) * 0.4 : 0);
                const py = ty + Math.sin(a) * r + (s > 0 && s < 8 ? Math.cos(s + i) * 0.4 : 0);
                if (s === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawDioramaPlatform(ctx, x, y, w, h, depth = 18, color = "#0a0a0a", borderColor = "#ffffff", shadowTilt = 0.03) {
    ctx.save();
    ctx.save();
    ctx.translate(x + 12, y + 14);
    ctx.rotate(shadowTilt);
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(-12, -14, w + depth, h + depth);
    ctx.restore();

    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.lineWidth = 2.2;
    drawSketchRect(ctx, x, y, w, h, 3.2, { color: borderColor, secondaryColor: "rgba(255, 255, 255, 0.45)" });

    ctx.fillStyle = "#e5e5e5";
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + depth, y + h + depth);
    ctx.lineTo(x + w + depth, y + h + depth);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    drawFuzzyPencilLine(ctx, x, y + h, x + depth, y + h + depth, 0.4, 1.8, { color: borderColor, overshoot: 2.0 });
    drawFuzzyPencilLine(ctx, x + depth, y + h + depth, x + w + depth, y + h + depth, 0.4, 1.8, { color: borderColor, overshoot: 2.0 });
    drawFuzzyPencilLine(ctx, x + w + depth, y + h + depth, x + w, y + h, 0.4, 1.8, { color: borderColor, overshoot: 2.0 });

    ctx.fillStyle = "#cccccc";
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + depth, y + depth);
    ctx.lineTo(x + w + depth, y + h + depth);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    drawFuzzyPencilLine(ctx, x + w, y, x + w + depth, y + depth, 0.4, 1.8, { color: borderColor, overshoot: 2.0 });
    drawFuzzyPencilLine(ctx, x + w + depth, y + depth, x + w + depth, y + h + depth, 0.4, 1.8, { color: borderColor, overshoot: 2.0 });
    ctx.restore();
}

// eslint-disable-next-line no-unused-vars
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

function drawTopMiddleWidget(ctx, stageIndex, prog, phase) {
    ctx.save();
    const cx = 400,
        cy = 76,
        w = 280,
        h = 104;
    const boxTilt = ((stageIndex % 2 === 0 ? -1.2 : 1.4) * Math.PI) / 180;
    const shadowTilt = ((stageIndex % 2 === 0 ? 1.6 : -1.5) * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx + 6, cy + 8);
    ctx.rotate(shadowTilt);
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(boxTilt);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.lineWidth = 1.8;
    drawSketchRect(ctx, -w / 2, -h / 2, w, h, 3.0, { color: "#ffffff", secondaryColor: "rgba(255, 255, 255, 0.45)" });

    drawFuzzyPencilLine(ctx, -w / 2 + 10, -h / 2 + 20, w / 2 - 10, -h / 2 + 20, 0.3, 1.3, { color: "#ffffff", overshoot: 2.0 });

    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 11px "Impact", "Arial Black", sans-serif';
    ctx.letterSpacing = "0.06em";

    const fontStyle = '10px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    if (stageIndex === 0) {
        ctx.fillText("SPEC: FRONTIER COMPASS & WIND ROSE", -w / 2 + 12, -h / 2 + 14);

        const rx = -90,
            ry = 13;
        for (let r of [28, 18, 9]) {
            for (let pass = 0; pass < 2; pass++) {
                ctx.strokeStyle = pass === 0 ? "rgba(204, 204, 204, 0.35)" : "#cccccc";
                ctx.lineWidth = pass === 0 ? 1.6 : 1.0;
                ctx.beginPath();
                for (let s = 0; s <= 16; s++) {
                    const a = (s * Math.PI * 2) / 16;
                    let px = rx + Math.cos(a) * r;
                    let py = ry + Math.sin(a) * r;
                    if (s > 0 && s < 16) {
                        px += Math.sin(s + r) * 0.4;
                        py += Math.cos(s + r) * 0.4;
                    }
                    if (s === 0)
                        ctx.moveTo(px, py);
                    else
                        ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
        }

        const angle = -Math.PI / 4 + prog * Math.PI * 0.6;
        const nx = rx + Math.cos(angle) * 26;
        const ny = ry + Math.sin(angle) * 26;
        drawFuzzyPencilLine(ctx, rx - Math.cos(angle) * 11, ry - Math.sin(angle) * 11, nx, ny, 0.3, 2, { color: "#ffffff" });
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("ELEVATION : +1,420 FT ASL", -35, -12);
        ctx.fillText("MAG DECL  : 14°12' W", -35, 3);
        ctx.fillText(`WIND VEL  : ${(25 + prog * 20).toFixed(1)} KTS NW`, -35, 18);
        ctx.fillText(`CANOPY DEN: ${(98 - prog * 15).toFixed(0)}% VIRGIN`, -35, 33);
    } else if (stageIndex === 1) {
        ctx.fillText("SPEC: T-AUGER ROTATION & DRAW-BORE TENSION", -w / 2 + 12, -h / 2 + 14);

        const gx = -95,
            gy = 12;
        drawGear(ctx, gx, gy, 24, 8, prog * Math.PI * 4, "#ffffff");
        drawGear(ctx, gx + 34, gy + 10, 16, 6, -prog * Math.PI * 6, "#cccccc");

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("MORTISE DEPTH: 112.5 MM", -35, -12);
        ctx.fillText("TREENAIL PEG : TAPER 1:16", -35, 3);
        ctx.fillText(`DRAW TENSION : ${(1800 + prog * 600).toFixed(0)} PSI`, -35, 18);
        ctx.fillText(`JOINT GAP    : ${(1.8 - prog * 1.8).toFixed(2)} MM`, -35, 33);
    } else if (stageIndex === 2) {
        ctx.fillText("SPEC: GEOLOGICAL BORE LOG & WATER TABLE", -w / 2 + 12, -h / 2 + 14);

        const bx = -115,
            by = -15,
            bw = 50,
            bh = 56;
        drawSketchRect(ctx, bx, by, bw, bh, 2.0, { color: "#cccccc" });
        drawEarthHatch(ctx, bx, by + 28, bw, 28, "rgba(255, 255, 255, 0.3)");

        const waterY = by + 42 - prog * 24;
        drawFuzzyPencilLine(ctx, bx, waterY, bx + bw, waterY, 0.4, 2, { color: "#ffffff", overshoot: 2.2 });

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("STRATUM   : METAMORPHIC GRANITE", -50, -12);
        ctx.fillText(`WATER HEAD: ${(14.2 - prog * 8).toFixed(1)} FT BELOW SILL`, -50, 3);
        ctx.fillText(`FROST LINE: ${(48 + prog * 6).toFixed(0)} IN DEPTH`, -50, 18);
        ctx.fillText(`PERIM GRAD: ${(1.5 + prog * 1.5).toFixed(1)}% AWAY`, -50, 33);
    } else if (stageIndex === 3) {
        ctx.fillText("SPEC: OVERSHOT FLUME VELOCITY & CROWN TORQUE", -w / 2 + 12, -h / 2 + 14);

        const wx = -95,
            wy = 12;
        drawGear(ctx, wx, wy, 26, 16, prog * Math.PI * 3, "#ffffff");
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(255, 255, 255, 0.4)" : "#ffffff";
            ctx.lineWidth = pass === 0 ? 2.0 : 1.5;
            ctx.beginPath();
            for (let s = 0; s <= 12; s++) {
                const a = (s * Math.PI * 2) / 12;
                const px = wx + Math.cos(a) * 12 + (s > 0 && s < 12 ? Math.sin(s) * 0.4 : 0);
                const py = wy + Math.sin(a) * 12 + (s > 0 && s < 12 ? Math.cos(s) * 0.4 : 0);
                if (s === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("FLUME VEL : 42.5 CFS EQUIV", -40, -12);
        ctx.fillText("HEAD DROP : 14.0 FT NET", -40, 3);
        ctx.fillText(`WHEEL RPM : ${(8 + prog * 12).toFixed(1)} RPM`, -40, 18);
        ctx.fillText(`SHAFT TORQ: ${(420 + prog * 380).toFixed(0)} FT-LBS`, -40, 33);
    } else if (stageIndex === 4) {
        ctx.fillText("SPEC: STEAM GEAR RATIO & PUMP KINEMATICS", -w / 2 + 12, -h / 2 + 14);

        const gx = -95,
            gy = 12;
        drawGear(ctx, gx, gy, 24, 12, prog * Math.PI * 4, "#ffffff");
        drawGear(ctx, gx + 36, gy + 8, 16, 8, -prog * Math.PI * 6, "#cccccc");

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("RATIO     : 3:2 REDUCTION DRIVE", -35, -12);
        ctx.fillText(`PUMP RATE : ${(12 + prog * 18).toFixed(1)} GAL/MIN`, -35, 3);
        ctx.fillText(`BOILER PSI: ${(45 + prog * 40).toFixed(0)} PSI NET`, -35, 18);
        ctx.fillText(`STROKE VEL: ${(0.8 + prog * 1.2).toFixed(2)} M/SEC`, -35, 33);
    } else if (stageIndex === 5) {
        ctx.fillText("SPEC: SPINDLE LATHE RPM & GAS MANIFOLD PSI", -w / 2 + 12, -h / 2 + 14);

        const lx = -95,
            ly = 12;
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(204, 204, 204, 0.4)" : "#cccccc";
            ctx.lineWidth = pass === 0 ? 1.8 : 1.2;
            ctx.beginPath();
            for (let s = 0; s <= 14; s++) {
                const a = (s * Math.PI * 2) / 14;
                const px = lx + Math.cos(a) * 24 + (s > 0 && s < 14 ? Math.sin(s) * 0.5 : 0);
                const py = ly + Math.sin(a) * 24 + (s > 0 && s < 14 ? Math.cos(s) * 0.5 : 0);
                if (s === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        drawFuzzyPencilLine(ctx, lx - 20, ly, lx + 20, ly, 0.3, 1.5, { color: "#ffffff", overshoot: 1.6 });
        drawFuzzyPencilLine(ctx, lx, ly - 20, lx, ly + 20, 0.3, 1.5, { color: "#ffffff", overshoot: 1.6 });
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(lx + Math.cos(prog * Math.PI * 6) * 14, ly + Math.sin(prog * Math.PI * 6) * 14, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("SPINDLE   : STEAM LATHE TURNED", -40, -12);
        ctx.fillText(`LATHE VEL : ${(850 + prog * 400).toFixed(0)} RPM`, -40, 3);
        ctx.fillText(`GAS PRESS : ${(3.2 + prog * 0.6).toFixed(2)} PSI`, -40, 18);
        ctx.fillText(`ILLUM LUX : ${(120 + prog * 80).toFixed(0)} LUMENS`, -40, 33);
    } else if (stageIndex === 6) {
        ctx.fillText("SPEC: IRRIGATION SLUICE & WEIR REGULATOR", -w / 2 + 12, -h / 2 + 14);

        const sx = -110,
            sy = -12,
            sw = 45,
            sh = 52;
        drawSketchRect(ctx, sx, sy, sw, sh, 2.0, { color: "#cccccc" });
        const gateY = sy + sh - prog * 36;
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(sx, gateY, sw, sh - (gateY - sy));
        drawFuzzyPencilLine(ctx, sx, gateY, sx + sw, gateY, 0.4, 2, { color: "#ffffff", overshoot: 2.2 });

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText(`GATE APERTURE: ${(prog * 24).toFixed(1)} IN OPEN`, -50, -12);
        ctx.fillText(`FLOW VELOCITY: ${(1.2 + prog * 3.4).toFixed(2)} FT/SEC`, -50, 3);
        ctx.fillText(`HEAD DROP    : ${(6.4 - prog * 2.1).toFixed(1)} FT NET`, -50, 18);
        ctx.fillText(`DISCHARGE    : ${(450 * prog).toFixed(0)} GPM`, -50, 33);
    } else if (stageIndex === 7) {
        ctx.fillText("SPEC: AC WATT-HOUR DISK & BOILER BTU OUTPUT", -w / 2 + 12, -h / 2 + 14);

        const mx = -95,
            my = 12;
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(255, 255, 255, 0.4)" : "#ffffff";
            ctx.lineWidth = pass === 0 ? 2.0 : 1.5;
            ctx.beginPath();
            for (let s = 0; s <= 14; s++) {
                const a = (s * Math.PI * 2) / 14;
                const px = mx + Math.cos(a) * 22 + (s > 0 && s < 14 ? Math.sin(s) * 0.4 : 0);
                const py = my + Math.sin(a) * 22 + (s > 0 && s < 14 ? Math.cos(s) * 0.4 : 0);
                if (s === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        drawGear(ctx, mx, my, 14, 8, prog * Math.PI * 8, "#cccccc");

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("VOLTAGE   : 110V 60HZ SINGLE PH.", -45, -12);
        ctx.fillText(`METER DISK: ${(12 + prog * 48).toFixed(1)} RPM SPIN`, -45, 3);
        ctx.fillText(`BOILER OUT: ${(65 + prog * 55).toFixed(0)} K-BTU/HR`, -45, 18);
        ctx.fillText(`WATER TEMP: ${(140 + prog * 45).toFixed(0)} °F RAD`, -45, 33);
    } else if (stageIndex === 8) {
        ctx.fillText("SPEC: STRUCTURAL STRAIN & DEFLECTION", -w / 2 + 12, -h / 2 + 14);

        const rx = -110,
            ry = 12;
        drawFuzzyPencilLine(ctx, rx - 20, ry, rx + 20, ry, 0.3, 1, { color: "#cccccc", overshoot: 1.5 });
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let s = 0; s <= 6; s++) {
            const t = s / 6;
            const px = rx - 20 + 40 * t;
            const py = ry + Math.sin(t * Math.PI) * prog * 18 + (s > 0 && s < 6 ? Math.sin(s * 2) * 0.5 : 0);
            if (s === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText(`MAX DEFLECTION: ${(prog * 4.8).toFixed(2)} IN DOWN`, -50, -12);
        ctx.fillText("SPAN LENGTH   : 24'-0\" CLEAR", -50, 3);
        ctx.fillText(`LOAD RATIO    : ${(1.2 + prog * 0.8).toFixed(2)}x SAFE LIMIT`, -50, 18);
        ctx.fillText(`STRAIN INDEX  : ${(82 + prog * 65).toFixed(0)} MICRO-STR`, -50, 33);
    } else if (stageIndex === 9) {
        ctx.fillText("SPEC: SCREW-JACK AXIAL LOAD & SHORING VECTOR", -w / 2 + 12, -h / 2 + 14);

        const jx = -95,
            jy = 12;
        drawSketchRect(ctx, jx - 12, jy - 22, 24, 44, 2.0, { color: "#ffffff" });
        drawSteelHatch(ctx, jx - 12, jy - 22, 24, 44);

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("SHORING   : STEEL SCREW-JACK", -50, -12);
        ctx.fillText(`AXIAL LOAD: ${(8.2 + prog * 6.0).toFixed(1)} TONS NET`, -50, 3);
        ctx.fillText(`TORQUE ADV: ${(12 + prog * 18).toFixed(1)} FT-LBS`, -50, 18);
        ctx.fillText(`DEFLECT RT: ${(1.8 - prog * 1.8).toFixed(2)} MM/YR`, -50, 33);
    } else if (stageIndex === 10) {
        ctx.fillText("SPEC: 12-TON HYDRAULIC LIFT CALIBRATION", -w / 2 + 12, -h / 2 + 14);

        const cx2 = -95,
            cy2 = 12;
        drawSurveyReticle(ctx, cx2, cy2, 24, "DATUM", "#ffffff");

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText(`JACK RAM PRESS: ${(prog * 3400).toFixed(0)} PSI`, -40, -12);
        ctx.fillText(`VERTICAL LIFT : ${(prog * 3.75).toFixed(2)} IN UP`, -40, 3);
        ctx.fillText(`SILL DATUM ERR: ${(1.2 - prog * 1.2).toFixed(2)} DEGREES`, -40, 18);
        ctx.fillText(`BEAM LOAD TRSF: ${(prog * 100).toFixed(0)}% TO STEEL`, -40, 33);
    } else if (stageIndex === 11) {
        ctx.fillText("SPEC: SUB-SLAB RADON SUCTION & VACUUM IN. WG", -w / 2 + 12, -h / 2 + 14);

        const vx = -95,
            vy = 12;
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? "rgba(255, 255, 255, 0.4)" : "#ffffff";
            ctx.lineWidth = pass === 0 ? 2.0 : 1.5;
            ctx.beginPath();
            for (let s = 0; s <= 14; s++) {
                const a = (s * Math.PI * 2) / 14;
                const px = vx + Math.cos(a) * 22 + (s > 0 && s < 14 ? Math.sin(s) * 0.4 : 0);
                const py = vy + Math.sin(a) * 22 + (s > 0 && s < 14 ? Math.cos(s) * 0.4 : 0);
                if (s === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        drawGear(ctx, vx, vy, 15, 6, prog * Math.PI * 6, "#cccccc");

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("SUCTION   : SUB-SLAB ACTIVE CORE", -45, -12);
        ctx.fillText(`VACUUM WG : ${(-0.4 - prog * 1.4).toFixed(2)} IN. WG`, -45, 3);
        ctx.fillText(`FAN EXHAUST: ${(40 + prog * 105).toFixed(0)} CFM`, -45, 18);
        ctx.fillText(`RADON LEVEL: ${(18.4 - prog * 17.6).toFixed(1)} PCI/L`, -45, 33);
    } else if (stageIndex === 12) {
        ctx.fillText("SPEC: THERMODYNAMIC ENERGY EXCHANGE", -w / 2 + 12, -h / 2 + 14);

        const tx = -110,
            ty = -15,
            tw = 45,
            th = 50;
        drawSketchRect(ctx, tx, ty, tw, th, 2.0, { color: "#cccccc" });
        drawInsulationHatch(ctx, tx, ty, tw, th, prog, "rgba(255, 255, 255, 0.45)");

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText(`ENVELOPE R-VAL: R-${(12 + prog * 33).toFixed(0)} FOAM`, -50, -12);
        ctx.fillText(`AIR LEAKAGE   : ${(12.5 - prog * 11.8).toFixed(2)} ACH50`, -50, 3);
        ctx.fillText(`GLAZING U-FAC : ${(0.35 - prog * 0.22).toFixed(3)} BTU`, -50, 18);
        ctx.fillText(`LOOP COP EFF  : ${(2.1 + prog * 2.4).toFixed(1)} COP`, -50, 33);
    } else if (stageIndex === 13) {
        ctx.fillText("SPEC: CANTILEVER MOMENT & V2H BATTERY", -w / 2 + 12, -h / 2 + 14);

        const mx = -110,
            my = 10;
        drawFuzzyPencilLine(ctx, mx - 15, my + 15, mx + 15, my - 15, 0.4, 2, { color: "#ffffff", overshoot: 2.0 });
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText(`MOMENT LOAD : ${(120 + prog * 180).toFixed(0)} KIP-FT`, -50, -12);
        ctx.fillText(`PV GENERATION: ${(4.2 + prog * 11.8).toFixed(1)} KW PEAK`, -50, 3);
        ctx.fillText(`V2H STORAGE  : ${(28 + prog * 72).toFixed(0)}% CHARGED`, -50, 18);
        ctx.fillText(`NET CARBON   : ${(-15 * prog).toFixed(0)}% (POSITIVE)`, -50, 33);
    } else if (stageIndex === 14) {
        ctx.fillText("SPEC: BOUSSINESQ STRESS BULB & SOIL STRATA", -w / 2 + 12, -h / 2 + 14);

        const sx = -95,
            sy = 12;
        for (let r = 8; r <= 24; r += 8) {
            for (let pass = 0; pass < 2; pass++) {
                ctx.strokeStyle = pass === 0 ? "rgba(204, 204, 204, 0.35)" : "#cccccc";
                ctx.lineWidth = pass === 0 ? 1.6 : 1.0;
                ctx.beginPath();
                for (let s = 0; s <= 10; s++) {
                    const a = (s * Math.PI) / 10;
                    let px = sx + Math.cos(a) * r;
                    let py = sy + Math.sin(a) * r;
                    if (s > 0 && s < 10) {
                        px += Math.sin(s + r) * 0.4;
                        py += Math.cos(s + r) * 0.4;
                    }
                    if (s === 0)
                        ctx.moveTo(px, py);
                    else
                        ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
        }

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("STRATUM   : COMPACTED GLACIAL TILL", -50, -12);
        ctx.fillText("SAFE BEARING: 3.5 TONS / SQ. FT.", -50, 3);
        ctx.fillText(`STRESS ATTEN: ${(100 - prog * 75).toFixed(0)}% @ -12 FT`, -50, 18);
        ctx.fillText(`HYDRO HEAD  : ${(4.5 - prog * 4.5).toFixed(1)} PSI NET`, -50, 33);
    } else if (stageIndex === 15) {
        ctx.fillText("SPEC: DEW-POINT PLANE & INFRARED FLUX MATRIX", -w / 2 + 12, -h / 2 + 14);

        const dx = -95,
            dy = 12;
        drawSketchRect(ctx, dx - 16, dy - 16, 32, 32, 2.0, { color: "#ffffff" });
        drawInsulationHatch(ctx, dx - 16, dy - 16, 32, 32, prog, "rgba(255, 255, 255, 0.4)");

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("THERMAL FLUX: FINITE ELEMENT MODEL", -45, -12);
        ctx.fillText(`U-FACTOR NET: ${(0.08 - prog * 0.058).toFixed(3)} BTU/HR`, -45, 3);
        ctx.fillText("DEW-POINT   : EXTERIOR VAPOR BARRIER", -45, 18);
        ctx.fillText(`HEAT LOSS   : -${(60 + prog * 34.2).toFixed(1)}% REDUCTION`, -45, 33);
    } else if (stageIndex === 16) {
        ctx.fillText("SPEC: WIND MOMENT SHEAR DEFLECTION VECTOR", -w / 2 + 12, -h / 2 + 14);

        const kx = -95,
            ky = 12;
        drawFuzzyPencilLine(ctx, kx - 18, ky + 18, kx + prog * 18, ky - 18, 0.4, 2, { color: "#ffffff", overshoot: 2.0 });
        drawSketchRect(ctx, kx - 6, ky - 6, 12, 12, 1.5, { color: "#ffffff" });

        ctx.font = fontStyle;
        ctx.letterSpacing = "0em";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("MECHANICS : DYNAMIC VECTOR EQUILIB.", -45, -12);
        ctx.fillText("WIND SHEAR: 90 MPH GUST DESIGN", -45, 3);
        ctx.fillText(`STORY DRIFT: ${(prog * 0.24).toFixed(2)} IN. (L/360)`, -45, 18);
        ctx.fillText(`LIVE RATIO : ${(40 + prog * 10).toFixed(0)} PSF DESIGN`, -45, 33);
    }

    ctx.restore();
    ctx.restore();
}

/* =========================================================================
   ALL 17 STAGE HANDLERS (STAGE 0 .. STAGE 16)
   ========================================================================= */

const STAGE_HANDLERS = [
    // Stage 0: 1780 - Early Settlement
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "VIRGIN HEMLOCK CANOPY", "98% OLD-GROWTH DENSITY", "stage0-callout1", 0);
            addSVGCallout(g, 775, 50, 560, 280, "FIELDSTONE DRY-STACK", "GLACIAL ERRATIC CLEARING", "stage0-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 360, "HAND-HEWN TIMBER SILLS", "BROADAXE MORTISE JOINING", "stage0-callout3", 1);
            addSVGCallout(g, 775, 250, 520, 370, "CLAY & STRAW CHINKING", "THERMAL MASS INSULATION", "stage0-callout4", 1);
            addSVGCallout(g, 25, 420, 160, 470, "SUBTERRANEAN DUG WELL", "TAPPING SURFACE WATER TABLE", "stage0-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 470, "PITCH-ROOF SHAKES", "HAND-SPLIT WHITE CEDAR", "stage0-callout6", 2);
            addSVGCallout(g, 25, 520, 180, 520, "SPLIT-RAIL WORM FENCE", "NO POST-HOLE DIGGING", "stage0-callout7", 3);
            addSVGCallout(g, 775, 520, 560, 500, "CENTRAL HEATING CORE", "RADIANT THERMAL CHIMNEY", "stage0-callout8", 4);
            addSVGTitleBlock(g, "EARLY SETTLEMENT HOMESTEAD", "A-101", "1780", 'SCALE: 3/8" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 100, 360, 600, 140, 24, "#0a0a0a", "#ffffff", -0.02);
            drawEarthHatch(ctx, 100, 360, 600, 140, "rgba(255, 255, 255, 0.25)");

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            const wallH = 100 * assemblyProg;
            drawMasonryHatch(ctx, 250, 340 - wallH, 300, wallH, false);
            drawSketchRect(ctx, 250, 340 - wallH, 300, wallH, 2.5, { color: "#ffffff" });

            if (phase.idx >= 1) {
                for (let k = 0; k < 5; k++) {
                    const bx = 260 + k * 65;
                    drawRoundRect(ctx, bx, 340 - Math.min(wallH, 25), 45, 20, 5, { color: "#cccccc" });
                }
            }

            if (phase.idx >= 2)
                drawDimensionLine(ctx, 250, 350, 550, 350, "30'-0\" FRONTAGE", "#ffffff", 12, "#000000");

            if (phase.idx >= 3) {
                const roofY = 340 - wallH - 60 * assemblyProg;
                drawFuzzyPencilLine(ctx, 230, 340 - wallH, 400, roofY, 0.4, 2, { color: "#ffffff", overshoot: 2.8 });
                drawFuzzyPencilLine(ctx, 570, 340 - wallH, 400, roofY, 0.4, 2, { color: "#ffffff", overshoot: 2.8 });
                drawFuzzyPencilLine(ctx, 230, 340 - wallH, 570, 340 - wallH, 0.4, 1.8, { color: "#cccccc", overshoot: 2.2 });
            }
        },
    },
    // Stage 1: 1795 - Mortise-and-Tenon Framing
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 280, "SEASONED WHITE OAK", "HEAVY TIMBER STRUCTURAL GIRTS", "stage1-callout1", 0);
            addSVGCallout(g, 775, 50, 560, 300, "SCRIBED GIRT CONNECTIONS", "GROUND FITTED ALIGNMENT", "stage1-callout2", 0);
            addSVGCallout(g, 25, 235, 340, 320, "T-HANDLE AUGER BORING", "DEEP CIRCULAR MORTISE CAVITY", "stage1-callout3", 1);
            addSVGCallout(g, 775, 250, 460, 330, "FRAMING CHISEL CLEARING", "RECTANGULAR SLOT SHAPING", "stage1-callout4", 1);
            addSVGCallout(g, 25, 420, 300, 380, "INTERLOCKING TENONS", "NO METAL HARDWARE REQ.", "stage1-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 390, "DRAW-BORE TREENAILS", "OFFSET HOLE TENSION PEG", "stage1-callout6", 3);
            addSVGCallout(g, 25, 520, 260, 450, "COMMUNAL BENT RAISING", "GIN POLE & PULLEY TACKLE", "stage1-callout7", 4);
            addSVGTitleBlock(g, "MORTISE-AND-TENON FRAMING", "A-201", "1795", 'SCALE: 1" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 140, 320, 520, 160, 28, "#111111", "#ffffff", 0.025);
            drawMechanicalTrack(ctx, 160, 360, 640, 360, "rgba(255, 255, 255, 0.35)");

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            drawWoodGrainHatch(ctx, 220, 250, 90, 200, 6, 3);
            drawSketchRect(ctx, 220, 250, 90, 200, 2.5, { color: "#ffffff" });

            drawWoodGrainHatch(ctx, 490, 250, 90, 200, 6, 3);
            drawSketchRect(ctx, 490, 250, 90, 200, 2.5, { color: "#ffffff" });

            if (phase.idx >= 1) {
                drawGear(ctx, 360, 310, 28, 8, prog * Math.PI * 6, "#ffffff");
                drawFuzzyPencilLine(ctx, 360, 310, 360, 370 + assemblyProg * 30, 0.4, 2, { color: "#ffffff", overshoot: 1.6 });
            }
            if (phase.idx >= 2) {
                const tenonX = 310 + assemblyProg * 90;
                drawWoodGrainHatch(ctx, tenonX, 290, 100, 40, 4, 2);
                drawSketchRect(ctx, tenonX, 290, 100, 40, 2.2, { color: "#ffffff" });
            }
            if (phase.idx >= 3) {
                for (let p = 0; p < 6; p++) {
                    const px = 330 + p * 25;
                    const py = 260 + assemblyProg * 45;
                    ctx.fillStyle = "#0a0a0a";
                    ctx.fillRect(px, py, 6, 22);
                    drawSketchRect(ctx, px, py, 6, 22, 1.2, { color: "#ffffff" });
                }
            }
            if (phase.idx >= 4) {
                for (let b = 0; b < 5; b++) {
                    const bx = 180 + b * 90;
                    const by = 220 - assemblyProg * 40;
                    drawFuzzyPencilLine(ctx, bx, by, bx + 60, by - 30, 0.4, 2, { color: "#cccccc", overshoot: 2.2 });
                }
            }
        },
    },
    // Stage 2: 1810 - Geology & Landscape
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 260, 320, "HYDROLOGICAL PROFILE", "PERMEABLE GRAVEL VS BEDROCK", "stage2-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 320, "GLACIAL TILL STRATA", "NATURAL FILTER BED", "stage2-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 380, "SPRING HOUSE STRUCTURE", "YEAR-ROUND 48°F WATER", "stage2-callout3", 1);
            addSVGCallout(g, 775, 250, 520, 390, "FROST LINE DATUM", "36-INCH FOOTING DEPTH", "stage2-callout4", 1);
            addSVGCallout(g, 25, 420, 200, 465, "GRAVITY DRAINAGE TRENCH", "PERIMETER HYDROLOGICAL DIVERSION", "stage2-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 465, "GRANITE LEDGE OUTCROP", "NATURAL FOUNDATION FOOTING", "stage2-callout6", 2);
            addSVGCallout(g, 25, 520, 220, 510, "SUBTERRANEAN STRATA MAP", "+420M ASL DATUM", "stage2-callout7", 3);
            addSVGCallout(g, 775, 520, 560, 510, "STEPPED CELLAR ROOTS", "THERMAL STABILITY 50°F", "stage2-callout8", 4);
            addSVGTitleBlock(g, "GEOLOGY & SUBTERRANEAN DRAINAGE", "A-301", "1810", 'SCALE: 1/4" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 120, 280, 560, 220, 32, "#080808", "#ffffff", 0.03);
            drawEarthHatch(ctx, 120, 350, 560, 150, "rgba(255, 255, 255, 0.35)");

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            const strataH = 120 * assemblyProg;
            drawMasonryHatch(ctx, 300, 420 - strataH, 200, strataH, true);
            drawSketchRect(ctx, 300, 420 - strataH, 200, strataH, 2.5, { color: "#ffffff" });

            if (phase.idx >= 1) {
                drawFuzzyPencilLine(ctx, 280, 380, 520, 380, 0.4, 2, { color: "#cccccc", overshoot: 2.4 });
                for (let k = 0; k < 6; k++)
                    drawRoundRect(ctx, 290 + k * 35, 385, 30, 28, 4, { color: "#cccccc" });
            }

            if (phase.idx >= 2)
                drawDimensionLine(ctx, 140, 350, 140, 470, "12'-0\" STRATA DEPTH", "#ffffff", -16, "#000000");
        },
    },
    // Stage 3: 1835 - Watercourse & Millwright
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 220, 260, "PERENNIAL STREAM DAM", "REGULATED HYDRAULIC MILLRACE", "stage3-callout1", 0);
            addSVGCallout(g, 775, 50, 560, 270, "ELEVATED WOODEN FLUME", "MAXIMIZED GRAVITATIONAL HEAD", "stage3-callout2", 0);
            addSVGCallout(g, 25, 235, 260, 380, "16-BLADE OVERSHOT WHEEL", "KINETIC MOMENTUM OAK AXLE", "stage3-callout3", 1);
            addSVGCallout(g, 775, 250, 520, 380, "SLUICE WEIR GATE LEVER", "RACK-AND-PINION FLOW CONTROL", "stage3-callout4", 1);
            addSVGCallout(g, 25, 420, 310, 440, "TRUNDLE LANTERN CROWN GEAR", "90 DEGREE TORQUE REDIRECTION", "stage3-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 440, "RECIPROCATING VERTICAL SAW", "AUTOMATED TIMBER MILLING", "stage3-callout6", 3);
            addSVGCallout(g, 25, 520, 280, 510, "TWELVEFOLD PRODUCTIVITY", "REGIONAL AGRARIAN HUB", "stage3-callout7", 4);
            addSVGTitleBlock(g, "WATERCOURSE & MILLWRIGHT", "A-401", "1835", 'SCALE: 1/2" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 100, 360, 600, 150, 26, "#0a0a0a", "#ffffff", -0.025);
            drawWoodGrainHatch(ctx, 120, 230, 220, 40, 4, 3);
            drawSketchRect(ctx, 120, 230, 220, 40, 2.2, { color: "#ffffff" });

            drawGear(ctx, 260, 380, 85, 16, prog * Math.PI * 4, "#ffffff");
            drawGear(ctx, 260, 380, 28, 8, prog * Math.PI * 4, "#cccccc");
            drawGear(ctx, 480, 380, 55, 14, -prog * Math.PI * 6, "#ffffff");
            drawGear(ctx, 560, 340, 38, 10, prog * Math.PI * 8, "#cccccc");

            for (let w = 0; w < 8; w++) {
                const wy = 270 + w * 14;
                const wx = 240 + Math.sin(prog * 15 + w) * 10;
                drawFuzzyPencilLine(ctx, 220, 250, wx, wy, 0.4, 1.5, { color: "#ffffff", overshoot: 1.5 });
            }

            const sawY = 280 + Math.sin(prog * 20) * 35;
            drawSketchRect(ctx, 600, sawY - 40, 16, 80, 2.5, { color: "#ffffff" });
            drawSteelHatch(ctx, 600, sawY - 40, 16, 80);
        },
    },
    // Stage 4: 1860 - Industrial Revolution
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 280, "BALLOON FRAMING REVOLUTION", "LIGHTWEIGHT 2X4 STUDS", "stage4-callout1", 0);
            addSVGCallout(g, 775, 50, 560, 290, "STANDARDIZED DIMENSION LUMBER", "SAWMILL MASS PRODUCTION", "stage4-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 360, "CAST IRON HEATING STOVE", "COAL FUEL TRANSITION", "stage4-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "MACHINE-CUT STEEL NAILS", "INSTANT JOINERY REPLACEMENT", "stage4-callout4", 1);
            addSVGCallout(g, 25, 420, 260, 420, "STEAM PUMP INFRASTRUCTURE", "AQUIFER PLUMBING SANITATION", "stage4-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 420, "DOUBLE-HUNG GLASS WINDOWS", "PULLEY & COUNTERWEIGHT", "stage4-callout6", 2);
            addSVGCallout(g, 25, 520, 240, 500, "WROUGHT IRON TIE-RODS", "ADJUSTABLE TURNBUCKLE", "stage4-callout7", 3);
            addSVGCallout(g, 775, 520, 540, 500, "MECHANIZED WELL PUMP", "INDOOR SANITATION HYGIENE", "stage4-callout8", 4);
            addSVGTitleBlock(g, "INDUSTRIAL REVOLUTION FRAMING", "A-501", "1860", 'SCALE: 3/8" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 140, 340, 520, 160, 26, "#0a0a0a", "#ffffff", 0.025);
            drawMechanicalTrack(ctx, 160, 380, 640, 380, "rgba(255, 255, 255, 0.35)");

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            const numStuds = Math.floor(12 * assemblyProg);
            for (let i = 0; i < numStuds; i++) {
                const sx = 200 + i * 35;
                drawWoodGrainHatch(ctx, sx, 220, 12, 120, 2, 2);
                drawSketchRect(ctx, sx, 220, 12, 120, 1.8, { color: "#ffffff" });
            }
            if (phase.idx >= 1) {
                drawSteelHatch(ctx, 450, 280, 60, 80);
                drawSketchRect(ctx, 450, 280, 60, 80, 2.2, { color: "#ffffff" });
            }
        },
    },
    // Stage 5: 1885 - Victorian Expansion
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 230, 270, "QUEEN ANNE ORNAMENTATION", "MULTI-GABLED ROOF PROFILE", "stage5-callout1", 0);
            addSVGCallout(g, 775, 50, 550, 280, "SPINDLE LATHE BALUSTERS", "HIGH-SPEED TURNED MILLWORK", "stage5-callout2", 0);
            addSVGCallout(g, 25, 235, 270, 350, "FISH-SCALE SHINGLE SKIN", "CEDAR PATTERN SHADOW LINES", "stage5-callout3", 1);
            addSVGCallout(g, 775, 250, 520, 360, "CHAMFERED PORCH COLUMNS", "GINGERBREAD GABLE SCROLLWORK", "stage5-callout4", 1);
            addSVGCallout(g, 25, 420, 300, 440, "BLACK-IRON GAS MANIFOLD", "THREADED CENTRAL FUEL PIPE", "stage5-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 440, "BRASS PARLOR SCONCES", "EVENING ILLUMINATION NETWORK", "stage5-callout6", 3);
            addSVGCallout(g, 25, 520, 280, 510, "EMBOSSED WALLCOVERINGS", "PLASTER CEILING MEDALLIONS", "stage5-callout7", 4);
            addSVGTitleBlock(g, "VICTORIAN ORNAMENTAL MILLWORK", "A-601", "1885", 'SCALE: 3/4" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 120, 350, 560, 150, 24, "#111111", "#ffffff", 0.03);
            drawMasonryHatch(ctx, 160, 250, 180, 130, false);
            drawSketchRect(ctx, 160, 250, 180, 130, 2.5, { color: "#ffffff" });

            drawWoodGrainHatch(ctx, 380, 240, 50, 180, 6, 2);
            drawSketchRect(ctx, 380, 240, 50, 180, 2.5, { color: "#ffffff" });

            for (let b = 0; b < 6; b++) {
                const bx = 460 + b * 28;
                const by = 310 + Math.sin(prog * 12 + b) * 4;
                drawRoundRect(ctx, bx, by, 14, 65, 4, { color: "#ffffff" });
            }
            drawSteelHatch(ctx, 220, 390, 360, 25);
            drawSketchRect(ctx, 220, 390, 360, 25, 2.0, { color: "#ffffff" });

            for (let g = 0; g < 5; g++) {
                const gx = 250 + g * 75;
                drawSurveyReticle(ctx, gx, 330, 16 + Math.sin(prog * 8 + g) * 4, "GAS LUX", "#ffffff");
            }
        },
    },
    // Stage 6: 1900 - Gradual Farm Improvements
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "TIMBER BANK BARN EXPANSION", "GRAVITY-FED HAY LOFT", "stage6-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "GALVANIZED STEEL WINDMILL", "DEEP AQUIFER PUMPING", "stage6-callout2", 0);
            addSVGCallout(g, 25, 235, 260, 360, "SILO FERMENTATION TOWER", "ENSILAGE WINTER STORAGE", "stage6-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "SOIL DRAINAGE TILES", "TERRACOTTA PERIMETER LOOP", "stage6-callout4", 1);
            addSVGCallout(g, 25, 420, 220, 470, "IRRIGATION SLUICE CHANNELS", "PERENNIAL STREAM HARNESSING", "stage6-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 470, "CONCRETE FLOORING SLABS", "SANITARY DAIRY PRODUCTION", "stage6-callout6", 2);
            addSVGCallout(g, 25, 520, 200, 510, "POLLINATOR CAVITIES", "STONE WALL WILDLIFE HABITAT", "stage6-callout7", 3);
            addSVGCallout(g, 775, 520, 560, 510, "HEIRLOOM ORCHARD FURROWS", "45 CULTIVATED ACRES", "stage6-callout8", 4);
            addSVGTitleBlock(g, "GRADUAL FARM IMPROVEMENTS", "A-701", "1900", 'SCALE: 1/4" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 110, 350, 580, 150, 25, "#0a0a0a", "#ffffff", -0.025);

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            const barnW = 240 * assemblyProg;
            drawWoodGrainHatch(ctx, 200, 230, barnW, 120, 4, 3);
            drawSketchRect(ctx, 200, 230, barnW, 120, 2.5, { color: "#ffffff" });

            if (phase.idx >= 1) {
                drawGear(ctx, 540, 260, 45, 12, prog * Math.PI * 4, "#ffffff");
                drawFuzzyPencilLine(ctx, 540, 260, 540, 350, 0.4, 2, { color: "#ffffff", overshoot: 2.0 });
            }
        },
    },
    // Stage 7: 1925 - Electrification & Heating
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "PORCELAIN KNOB-AND-TUBE", "CERAMIC JOIST INSULATORS", "stage7-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "COPPER CONDUCTOR WIRING", "SPARK ARC PREVENTATIVE CLEAT", "stage7-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 360, "CAST-IRON HOT WATER BOILER", "COAL-FIRED BASEMENT FURNACE", "stage7-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "HYDRONIC RADIATOR FINS", "FLUTED CONVECTIVE SURFACE", "stage7-callout4", 1);
            addSVGCallout(g, 25, 420, 320, 440, "WATT-HOUR INDUCTION DISK", "SPINNING ELECTROMECHANICAL METER", "stage7-callout5", 2);
            addSVGCallout(g, 775, 420, 480, 440, "CLOSED-LOOP IRON PIPING", "UNIFORM DRAFT-FREE WARMTH", "stage7-callout6", 3);
            addSVGCallout(g, 25, 520, 280, 510, "110V AC SINGLE-PHASE", "MODERN ENERGY ECONOMY", "stage7-callout7", 4);
            addSVGTitleBlock(g, "ELECTRIFICATION & HYDRONIC HEATING", "A-801", "1925", 'SCALE: 1/2" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 110, 360, 580, 145, 25, "#0a0a0a", "#ffffff", -0.028);
            drawSteelHatch(ctx, 180, 320, 140, 90);
            drawSketchRect(ctx, 180, 320, 140, 90, 2.5, { color: "#ffffff" });

            drawGear(ctx, 520, 320, 38, 12, prog * Math.PI * 10, "#ffffff");
            for (let k = 0; k < 6; k++) {
                const kx = 220 + k * 55;
                drawRoundRect(ctx, kx, 260, 18, 28, 6, { color: "#ffffff" });
                if (phase.idx >= 1)
                    drawFuzzyPencilLine(ctx, kx + 9, 274, kx + 55 + 9, 274 + Math.sin(prog * 20 + k) * 6, 0.6, 2, { color: "#ffffff", overshoot: 1.6 });
            }
            for (let r = 0; r < 7; r++) {
                const rx = 200 + r * 16;
                const ry = 310 - prog * 40;
                drawFuzzyPencilLine(ctx, rx, 320, rx + Math.sin(prog * 10 + r) * 12, ry, 0.4, 1.5, { color: "#cccccc", overshoot: 1.5 });
            }
        },
    },
    // Stage 8: 1950 - Decline & Abandonment
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "ROOF RIDGE SAG & COLLAPSE", "STRUCTURAL RIDGE DEFLECTION", "stage8-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "WATER INFILTRATION ROT", "FUNGAL DECAY OF HEMLOCK GIRTS", "stage8-callout2", 0);
            addSVGCallout(g, 25, 235, 260, 360, "COLLAPSED FLUME TRESTLE", "DISRUPTED HYDRAULIC POWER", "stage8-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "FROST-HEAVED DRY-STACK", "LATERAL FOUNDATION BULGING", "stage8-callout4", 1);
            addSVGCallout(g, 25, 420, 200, 460, "FOUNDATION TREE ROOTS", "BIOLOGICAL MASONRY DISRUPTION", "stage8-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 460, "RUSTED IRON TIE-RODS", "TENSILE FAILURE & SEPARATION", "stage8-callout6", 2);
            addSVGCallout(g, 25, 520, 220, 510, "SEVERE MORTAR LEACHING", "ACIDIC RAINFALL EROSION", "stage8-callout7", 3);
            addSVGCallout(g, 775, 520, 540, 510, "BOTANICAL CANOPY OVERGROWTH", "PIONEER SAPLING WEDGING", "stage8-callout8", 4);
            addSVGTitleBlock(g, "DECLINE & STRUCTURAL WEATHERING", "A-901", "1950", 'SCALE: 3/8" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 130, 360, 540, 150, 26, "#0a0a0a", "#ffffff", 0.02);

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            const sag = 40 * assemblyProg;
            drawWoodGrainHatch(ctx, 200, 250 + sag, 400, 100 - sag * 0.5, 5, 2);
            drawSketchRect(ctx, 200, 250 + sag, 400, 100 - sag * 0.5, 2.5, { color: "#ffffff" });

            if (phase.idx >= 1) {
                drawEarthHatch(ctx, 180, 360, 120, 60, "rgba(255, 255, 255, 0.4)");
                drawSketchRect(ctx, 180, 360, 120, 60, 2.0, { color: "#cccccc" });
            }
        },
    },
    // Stage 9: 1965 - Emergency Shoring & Stabilization
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "IMMINENT COLLAPSE ARREST", "PRESERVATIONIST INTERVENTION", "stage9-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "SCREW-JACK STEEL LALLY", "ADJUSTABLE THREADED COLLAR", "stage9-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 360, "SAGGING SUMMER BEAMS", "UPWARD JACKING FORCE HALT", "stage9-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "TEMPORARY CONCRETE PADS", "DIRT FLOOR LOAD TRANSFER", "stage9-callout4", 1);
            addSVGCallout(g, 25, 420, 320, 440, "STRUCTURAL STRAPPING", "BULGING MASONRY CONTAINMENT", "stage9-callout5", 2);
            addSVGCallout(g, 775, 420, 480, 440, "EXTERNAL WATT-HOUR METER", "WEATHERPROOF TEMPORARY POWER", "stage9-callout6", 3);
            addSVGCallout(g, 25, 520, 280, 510, "HEAVY TAR CANVAS SHEETING", "RAPID ROOF WEATHERPROOFING", "stage9-callout7", 4);
            addSVGTitleBlock(g, "EMERGENCY SHORING & STABILIZATION", "A-1001", "1965", 'SCALE: 3/8" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 130, 370, 540, 140, 22, "#111111", "#ffffff", 0.028);
            drawWoodGrainHatch(ctx, 180, 250, 440, 45, 5, 3);
            drawSketchRect(ctx, 180, 250, 440, 45, 2.5, { color: "#ffffff" });

            drawEarthHatch(ctx, 280, 460, 240, 35);
            drawSketchRect(ctx, 280, 460, 240, 35, 2.0, { color: "#cccccc" });

            for (let j = 0; j < 4; j++) {
                const jx = 290 + j * 75;
                const colH = 155 + prog * 15;
                drawSteelHatch(ctx, jx, 460 - colH, 26, colH);
                drawSketchRect(ctx, jx, 460 - colH, 26, colH, 2.0, { color: "#ffffff" });
                drawGear(ctx, jx + 13, 460 - colH + 20, 22, 8, prog * Math.PI * 6, "#ffffff");
            }
            if (phase.idx >= 3) {
                drawMasonryHatch(ctx, 180, 200, 440, 35, true);
                drawSketchRect(ctx, 180, 200, 440, 35, 2.2, { color: "#cccccc" });
            }
        },
    },
    // Stage 10: 1980 - Modernization Planning
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "GEOTECHNICAL CORE SAMPLING", "LOAD-BEARING STRATA VERIFIED", "stage10-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "STRUCTURAL FINITE ELEMENT", "COMPUTERIZED DEFLECTION MODEL", "stage10-callout2", 0);
            addSVGCallout(g, 25, 235, 260, 360, "HYDRAULIC LIFTING RE-LEVEL", "PRECISION 12-TON JACKING", "stage10-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "REINFORCED CONCRETE UNDERPIN", "4,000 PSI REBAR FOUNDATION", "stage10-callout4", 1);
            addSVGCallout(g, 25, 420, 200, 465, "EPOXY RESIN SPLICING", "SILL REPAIR & STRUCTURAL GRAFT", "stage10-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 465, "PERMEABLE MEMBRANE ENVELOPE", "BREATHABLE AIR SEALING", "stage10-callout6", 2);
            addSVGCallout(g, 25, 520, 220, 510, "CONCEALED STEEL LINTEL", "C-CHANNEL REINFORCEMENT", "stage10-callout7", 3);
            addSVGCallout(g, 775, 520, 540, 510, "LASER TRANSIT REALIGNMENT", "CODE COMPLIANCE DATUM", "stage10-callout8", 4);
            addSVGTitleBlock(g, "MODERNIZATION & STABILIZATION", "A-1101", "1980", 'SCALE: 3/8" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 120, 350, 560, 150, 26, "#0a0a0a", "#ffffff", -0.025);

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            const liftH = 30 * assemblyProg;
            drawSteelHatch(ctx, 220, 330 - liftH, 360, 20);
            drawSketchRect(ctx, 220, 330 - liftH, 360, 20, 2.5, { color: "#ffffff" });

            if (phase.idx >= 1)
                drawSurveyReticle(ctx, 400, 280 - liftH, 20, "DATUM +0.00", "#ffffff");
        },
    },
    // Stage 11: 1995 - Radon Mitigation & Perimeter Drainage
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "SUB-SLAB RADON SUCTION PIT", "INTERCEPTING BEDROCK SOIL GAS", "stage11-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "PERFORATED COLLECTION PIPES", "WASHED DRAINAGE GRAVEL BED", "stage11-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 360, "CONTINUOUS PVC EXHAUST FAN", "PERMANENT NEGATIVE PRESSURE", "stage11-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "PERFORATED PVC FRENCH DRAIN", "GEOTEXTILE FABRIC WRAPPED", "stage11-callout4", 1);
            addSVGCallout(g, 25, 420, 320, 440, "-12 FT BELOW GRADE FOOTING", "HYDROSTATIC VECTOR RELIEF", "stage11-callout5", 2);
            addSVGCallout(g, 775, 420, 480, 440, "DAYLIGHT DISCHARGE BASIN", "GRAVITY MEADOW DIVERSION", "stage11-callout6", 3);
            addSVGCallout(g, 25, 520, 280, 510, "BONE-DRY GRANITE CELLAR", "INDOOR AIR QUALITY SAFE", "stage11-callout7", 4);
            addSVGTitleBlock(g, "RADON MITIGATION & FRENCH DRAINAGE", "A-1201", "1995", 'SCALE: 1/2" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 100, 260, 600, 250, 30, "#0a0a0a", "#ffffff", -0.025);
            drawEarthHatch(ctx, 120, 420, 560, 90);
            drawMasonryHatch(ctx, 360, 420, 80, 60, false);
            drawSketchRect(ctx, 360, 420, 80, 60, 2.2, { color: "#ffffff" });

            drawGear(ctx, 400, 290, 32, 12, prog * Math.PI * 12, "#ffffff");
            for (let a = 0; a < 8; a++) {
                const ay = 410 - a * 15;
                const ax = 400 + Math.sin(prog * 12 + a) * 8;
                drawFuzzyPencilLine(ctx, ax, ay + 10, ax, ay - 10, 0.4, 1.5, { color: "#ffffff", overshoot: 1.5 });
            }
            drawEarthHatch(ctx, 140, 390, 90, 45);
            drawEarthHatch(ctx, 570, 390, 90, 45);
            for (let p = 0; p < 5; p++)
                drawFuzzyPencilLine(ctx, 150 + p * 15, 410, 150 + p * 15 + prog * 20, 410, 0.3, 2, { color: "#ffffff", overshoot: 1.5 });
        },
    },
    // Stage 12: 2010 - Ecological Insulation
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "CLOSED-CELL SPRAY FOAM", "R-45 CONTINUOUS CAVITY SEAL", "stage12-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "MINERAL WOOL ACOUSTIC BATT", "FIRE-RETARDANT & SOUNDPROOF", "stage12-callout2", 0);
            addSVGCallout(g, 25, 235, 260, 360, "TRIPLE-PANE LOW-E GLAZING", "ARGON GAS THERMAL BREAK", "stage12-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "HEAT RECOVERY VENTILATION", "92% THERMAL EXCHANGE EFFICIENCY", "stage12-callout4", 1);
            addSVGCallout(g, 25, 420, 220, 480, "GEOTHERMAL HEAT LOOP", "400 FT BEDROCK BOREHOLE", "stage12-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 480, "SOLAR THERMAL MANIFOLD", "HYDRONIC RADIANT FLOOR SUPPLY", "stage12-callout6", 2);
            addSVGCallout(g, 25, 520, 200, 510, "ELASTOMERIC VAPOR BARRIER", "ZERO-DRAFT ENCAPSULATION", "stage12-callout7", 3);
            addSVGCallout(g, 775, 520, 540, 510, "RADIANT CLIMATE CONTROL", "U-FACTOR 0.022 NET", "stage12-callout8", 4);
            addSVGTitleBlock(g, "ECOLOGICAL & THERMAL RETROFIT", "A-1301", "2010", 'SCALE: 1/2" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 110, 340, 580, 150, 25, "#0a0a0a", "#ffffff", 0.02);

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            const foamW = 200 * assemblyProg;
            drawWoodGrainHatch(ctx, 180, 240, foamW, 100, 4, 2);
            drawSketchRect(ctx, 180, 240, foamW, 100, 2.5, { color: "#ffffff" });

            if (phase.idx >= 1)
                drawGear(ctx, 500, 280, 35, 12, prog * Math.PI * 4, "#ffffff");
        },
    },
    // Stage 13: Present Modern Design
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "HISTORIC POST-AND-BEAM EXPOSED", "PRESERVED 1780 HEWN TIMBERS", "stage13-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "STRUCTURAL GLASS CURTAIN WALL", "FRAMELESS STEEL SPIDER JOINTS", "stage13-callout2", 0);
            addSVGCallout(g, 25, 235, 260, 360, "CANTILEVERED STEEL MEZZANINE", "FLOATING LOFT ARCHITECTURE", "stage13-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "INTEGRATED SMART-HOME DATUM", "AUTOMATED SHADING & CLIMATE", "stage13-callout4", 1);
            addSVGCallout(g, 25, 420, 260, 460, "GEOTHERMAL & HRV SYSTEMS", "HYDRONIC RADIANT HEATING", "stage13-callout5", 2);
            addSVGCallout(g, 775, 420, 500, 460, "RECLAIMED OAK PLANK FLOORING", "SUSTAINABLE MATERIAL REUSE", "stage13-callout6", 2);
            addSVGCallout(g, 25, 520, 240, 510, "BI-DIRECTIONAL V2H BATTERY", "MICROGRID ENERGY STORAGE", "stage13-callout7", 3);
            addSVGCallout(g, 775, 520, 540, 510, "NET-NEGATIVE CARBON OP.", "POSITIVE ENERGY GENERATION", "stage13-callout8", 4);
            addSVGTitleBlock(g, "PRESENT MODERN DESIGN", "A-1401", "2026", 'SCALE: 3/8" = 1\'-0"', "AUG 1952");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 120, 350, 560, 150, 24, "#0a0a0a", "#ffffff", -0.02);

            const { assemblyProg } = getPhaseTiming(phase.localProg);
            drawSteelHatch(ctx, 200, 260, 400 * assemblyProg, 80);
            drawSketchRect(ctx, 200, 260, 400 * assemblyProg, 80, 2.5, { color: "#ffffff" });

            if (phase.idx >= 1)
                drawDimensionLine(ctx, 200, 360, 600, 360, "MODERN HOMESTEAD", "#ffffff", -20, "#000000");
        },
    },
    // Stage 14: 2026 - Geotechnical Engineering Drill-down
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "BOUSSINESQ STRESS BULB", "SUBTERRANEAN LOAD PROPAGATION", "stage14-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "3.5 TONS/SQ. FT. BEARING", "COMPACTED GLACIAL TILL STRATA", "stage14-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 360, "HYDROSTATIC HEAD VECTOR", "-12 FT BELOW GRADE PRESSURE", "stage14-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "WASHED GRAVEL BACKFILL", "LATERAL SHEAR DISSIPATION", "stage14-callout4", 1);
            addSVGCallout(g, 25, 420, 320, 440, "ZERO DIFFERENTIAL SETTLE.", "MULTI-STORY LOAD STABILITY", "stage14-callout5", 2);
            addSVGCallout(g, 775, 420, 480, 440, "BORE LOG DIAGNOSTICS", "METAMORPHIC GRANITE SHELF", "stage14-callout6", 3);
            addSVGCallout(g, 25, 520, 280, 510, "PERPETUAL SOIL INTEGRITY", "GEOTECHNICAL DRILL-DOWN", "stage14-callout7", 4);
            addSVGTitleBlock(g, "GEOTECHNICAL SOIL STRATA PROFILE", "A-1501", "2026", 'SCALE: 1/4" = 1\'-0"', "JUL 2026");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 110, 250, 580, 260, 32, "#111111", "#ffffff", 0.035);
            drawEarthHatch(ctx, 130, 270, 540, 240);
            drawMasonryHatch(ctx, 350, 250, 100, 40, false);
            drawSketchRect(ctx, 350, 250, 100, 40, 2.2, { color: "#ffffff" });

            for (let r = 1; r <= 6; r++) {
                for (let pass = 0; pass < 2; pass++) {
                    ctx.strokeStyle = pass === 0 ? "rgba(255, 255, 255, 0.35)" : "#ffffff";
                    ctx.lineWidth = pass === 0 ? 2.2 : 1.6;
                    ctx.beginPath();
                    const rad = r * 30 * prog;
                    for (let s = 0; s <= 16; s++) {
                        const a = (s * Math.PI) / 16;
                        let px = 400 + Math.cos(a) * rad;
                        let py = 290 + Math.sin(a) * rad;
                        if (s > 0 && s < 16) {
                            px += Math.sin(s + r) * 0.5;
                            py += Math.cos(s + r) * 0.5;
                        }
                        if (s === 0)
                            ctx.moveTo(px, py);
                        else
                            ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                }
            }
            for (let h = 0; h < 6; h++) {
                const hy = 320 + h * 30;
                drawDimensionLine(ctx, 140, hy, 140 + prog * 60, hy, `HYDRO VECTOR ${h + 1}`, "#ffffff", 4, "#000000");
            }
        },
    },
    // Stage 15: 2026 - Thermodynamics Drill-down
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "DEW-POINT CONDENSATION TRACK", "EXTERIOR VAPOR BARRIER FACE", "stage15-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "INFRARED FLUX MATRIX", "ZERO THERMAL BRIDGING OVERLAY", "stage15-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 360, "R-45 CLOSED-CELL FOAM", "INTERSTITIAL ROT PREVENTION", "stage15-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "FINITE ELEMENT MODELING", "U-FACTOR 0.022 NET RATING", "stage15-callout4", 1);
            addSVGCallout(g, 25, 420, 320, 440, "MULTI-LAYER VAPOR GRADIENT", "WOOD FIBER SHEATHING BOARD", "stage15-callout5", 2);
            addSVGCallout(g, 775, 420, 480, 440, "94.2% HEAT LOSS REDUCTION", "ADVANCED BUILDING PHYSICS", "stage15-callout6", 3);
            addSVGCallout(g, 25, 520, 280, 510, "THERMODYNAMIC MASTERY", "ULTRA-LOW-ENERGY CLIMATE", "stage15-callout7", 4);
            addSVGTitleBlock(g, "THERMODYNAMIC FLUX & DEW-POINT PLANE", "A-1601", "2026", 'SCALE: 3/4" = 1\'-0"', "JUL 2026");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 120, 260, 560, 240, 28, "#0a0a0a", "#ffffff", -0.025);
            drawWoodGrainHatch(ctx, 140, 280, 140, 200, 5, 2);
            drawSketchRect(ctx, 140, 280, 140, 200, 2.5, { color: "#ffffff" });

            drawInsulationHatch(ctx, 420, 280, 240, 200, prog, "rgba(255, 255, 255, 0.45)");
            drawSketchRect(ctx, 420, 280, 240, 200, 2.5, { color: "#ffffff" });

            drawFuzzyPencilLine(ctx, 400, 270, 400, 490, 0.3, 3, { color: "#ffffff", overshoot: 3.0 });
            for (let f = 0; f < 8; f++) {
                const fy = 290 + f * 24;
                const fx = 420 - prog * 60;
                drawFuzzyPencilLine(ctx, 560, fy, fx, fy, 0.4, 1.5, { color: "#ffffff", overshoot: 1.8 });
                ctx.fillStyle = "#ffffff";
                drawSketchRect(ctx, fx - 4, fy - 3, 6, 6, 1.2, { color: "#ffffff" });
            }
        },
    },
    // Stage 16: 2026 - Structural Kinematics Drill-down
    {
        initSVG: (g, width, height) => {
            addSVGCallout(g, 25, 50, 240, 270, "DEAD VS LIVE LOAD VECTORS", "32 PSF PERMANENT / 40 PSF LIVE", "stage16-callout1", 0);
            addSVGCallout(g, 775, 50, 540, 280, "WIND MOMENT SHEAR DEFLECTION", "90 MPH GUST OVERTURNING MOMENT", "stage16-callout2", 0);
            addSVGCallout(g, 25, 235, 280, 360, "HYBRID STEEL MOMENT FRAME", "BRACED TIMBER SHEAR WALLS", "stage16-callout3", 1);
            addSVGCallout(g, 775, 250, 500, 370, "OPTICAL STRAIN GAUGE DATUM", "STORY DRIFT INDEX L/360", "stage16-callout4", 1);
            addSVGCallout(g, 25, 420, 320, 440, "MAX DEFLECTION < 0.25 INCHES", "ELASTIC TOLERANCE COMPLIANT", "stage16-callout5", 2);
            addSVGCallout(g, 775, 420, 480, 440, "GRAVITY LOAD EQUILIBRIUM", "POST DOWN TO GRANITE FOOTING", "stage16-callout6", 3);
            addSVGCallout(g, 25, 520, 280, 510, "STRUCTURAL KINEMATICS MATRIX", "18TH CENTURY MEETS 21ST CENTURY", "stage16-callout7", 4);
            addSVGTitleBlock(g, "STRUCTURAL KINEMATICS & SHEAR DRIFT", "A-1701", "2026", 'SCALE: 3/8" = 1\'-0"', "JUL 2026");
        },
        updateSVG: (g, prog, width, height, phase) => {},
        renderCanvas: (ctx, g, prog, width, height, phase) => {
            for (let x = 0; x < width; x += 40)
                drawFuzzyPencilLine(ctx, x, 0, x, height, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });
            for (let y = 0; y < height; y += 40)
                drawFuzzyPencilLine(ctx, 0, y, width, y, 0.3, 1, { color: "rgba(255, 255, 255, 0.12)", secondaryColor: "rgba(255, 255, 255, 0.05)", overshoot: false });

            drawDioramaPlatform(ctx, 100, 350, 600, 160, 28, "#0a0a0a", "#ffffff", -0.03);
            const driftX = prog * 20;
            drawSteelHatch(ctx, 220 + driftX, 220, 360, 130);
            drawSketchRect(ctx, 220 + driftX, 220, 360, 130, 2.5, { color: "#ffffff" });

            for (let a = 0; a < 6; a++) {
                const ax = 250 + a * 60 + driftX;
                drawDimensionLine(ctx, ax, 190, ax, 220 + prog * 10, `LOAD ${a + 1}`, "#ffffff", 5, "#000000");
            }
            for (let w = 0; w < 5; w++) {
                const wy = 240 + w * 22;
                drawDimensionLine(ctx, 120, wy, 210 + driftX, wy, "90 MPH SHEAR", "#ffffff", 5, "#000000");
            }
            drawSurveyReticle(ctx, 400 + driftX, 280, 24, "L/360 DRIFT", "#ffffff");
        },
    },
];
