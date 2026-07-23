/*
 * Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 */

/**
 * 1950s Black & White Blueprint / Planning Design
 * Style reference: STYLE_CONFIG in src/graphics.js
 * Mandates pure black background (#000000), crisp B&W geometry, slanted borders,
 * independent drop shadow angles, and gradual organic watercolor animation reveals.
 */
import { STAGES } from "./content.js";
import { initGraphics, updateGraphics } from "./graphics.js";
import { initScrollamaEngine } from "./engine-scrollama.js";

const INLINE_ILLUSTRATION_CACHE = Object.create(null);

const INLINE_ILLUSTRATION_TITLES = {
    "step-1": ["DETAIL A-1.1: DOVETAIL LOG CORNER NOTCH", "SECTION B-1.2: DRY-LAID FIELDSTONE HEARTH SECTION"],
    "step-2": ["DETAIL A-2.1: DRAW-BORE TREENAIL OFFSET JOINT", "SECTION B-2.2: TIMBER BENT ASSEMBLY RIGGING"],
    "step-3": ["DETAIL A-3.1: SUBTERRANEAN GRAVITY DRAIN TRENCH", "SECTION B-3.2: SPRING HOUSE THERMAL ENVELOPE"],
    "step-4": ["DETAIL A-4.1: OVERSHOT WATERWHEEL BUCKET PROFILE", "SECTION B-4.2: TRUNDLE LANTERN CROWN GEAR MESH"],
    "step-5": ["DETAIL A-5.1: BALLOON FRAMING STUD-TO-SILL JOINT", "SECTION B-5.2: WROUGHT IRON TURNBUCKLE TIE-ROD"],
    "step-6": ["DETAIL A-6.1: SPINDLE LATHE TURNED BALUSTER PROFILE", "SECTION B-6.2: BLACK-IRON GAS MANIFOLD DISTRIBUTOR"],
    "step-7": ["DETAIL A-7.1: TIMBER BANK BARN HAY LOFT HOIST", "SECTION B-7.2: TERRACOTTA PERIMETER DRAINAGE TILE"],
    "step-8": ["DETAIL A-8.1: PORCELAIN KNOB-AND-TUBE CERAMIC INSULATOR", "SECTION B-8.2: CAST-IRON HYDRONIC RADIATOR FIN SECTION"],
    "step-9": ["DETAIL A-9.1: STRUCTURAL RIDGE DEFLECTION & SAG", "SECTION B-9.2: SEVERE MORTAR LEACHING & TREE ROOT INVASION"],
    "step-10": ["DETAIL A-10.1: SCREW-JACK STEEL LALLY COLUMN THREAD", "SECTION B-10.2: TEMPORARY CONCRETE FOOTING BEARING PAD"],
    "step-11": ["DETAIL A-11.1: HYDRAULIC JACKING & RE-LEVELING DATUM", "SECTION B-11.2: CONCEALED C-CHANNEL LINTEL REINFORCEMENT"],
    "step-12": ["DETAIL A-12.1: SUB-SLAB RADON SUCTION PIT CORE", "SECTION B-12.2: PERFORATED PVC FRENCH DRAINAGE LOOP"],
    "step-13": ["DETAIL A-13.1: CLOSED-CELL SPRAY FOAM CAVITY SEAL", "SECTION B-13.2: GEOTHERMAL BOREHOLE HEAT EXCHANGE LOOP"],
    "step-14": ["DETAIL A-14.1: HISTORIC POST-AND-BEAM EXPOSED INTERIOR", "SECTION B-14.2: BI-DIRECTIONAL V2H BATTERY STORAGE"],
    "step-15": ["DETAIL A-15.1: BOUSSINESQ STRESS BULB SOIL ATTENUATION", "SECTION B-15.2: HYDROSTATIC GROUNDWATER PRESSURE VECTOR"],
    "step-16": ["DETAIL A-16.1: DEW-POINT CONDENSATION PLANE INTERSECTION", "SECTION B-16.2: INFRARED FLUX MATRIX THERMAL BRIDGING ELIMINATION"],
    "step-17": ["DETAIL A-17.1: DEAD VS LIVE LOAD VECTOR RESOLUTION", "SECTION B-17.2: WIND MOMENT SHEAR DEFLECTION DRIFT (L/360)"],
};

function drawFuzzyLine(ctx, x1, y1, x2, y2, strokeColor = "#ffffff", lineWidth = 1.8, options = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.1)
        return;

    let sx = x1;
    let sy = y1;
    let ex = x2;
    let ey = y2;

    if (options.overrun !== false) {
        const ux = dx / len;
        const uy = dy / len;
        const overrunStart = 1.5 + Math.abs(Math.sin((x1 * 11.3 + y1 * 29.1) * 0.1)) * 1.5;
        const overrunEnd = 1.5 + Math.abs(Math.cos((x2 * 19.7 + y2 * 37.3) * 0.1)) * 1.5;
        sx -= ux * overrunStart;
        sy -= uy * overrunStart;
        ex += ux * overrunEnd;
        ey += uy * overrunEnd;
    }

    const steps = Math.max(3, Math.floor(len / 12));
    const points = [{ x: sx, y: sy }];
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const seed = (sx * 17.1 + sy * 31.7 + ex * 23.3 + ey * 47.9 + i * 19.3) * 0.1;
        const jx = Math.sin(seed) * 1.6;
        const jy = Math.cos(seed * 1.3) * 1.6;
        points.push({
            x: sx + (ex - sx) * t + jx,
            y: sy + (ey - sy) * t + jy,
        });
    }
    points.push({ x: ex, y: ey });

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = strokeColor === "#D12B3E" ? "rgba(209, 43, 62, 0.4)" : "rgba(255, 255, 255, 0.45)";
    ctx.shadowBlur = 2.0 + Math.abs(Math.sin((sx + sy) * 0.2)) * 1.0;
    if (options.dashed)
        ctx.setLineDash([4, 2]);
    else if (options.dashArray)
        ctx.setLineDash(options.dashArray);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++)
        ctx.lineTo(points[i].x, points[i].y);

    ctx.stroke();
    ctx.restore();

    if (options.singlePass !== true) {
        ctx.save();
        ctx.strokeStyle = strokeColor === "#D12B3E" ? "rgba(209, 43, 62, 0.6)" : "rgba(204, 204, 204, 0.7)";
        ctx.lineWidth = Math.max(1, lineWidth * 0.75);
        ctx.shadowBlur = 1.5;
        if (options.dashed)
            ctx.setLineDash([4, 2]);
        else if (options.dashArray)
            ctx.setLineDash(options.dashArray);

        ctx.beginPath();
        const offSeed = (sx * 13.1 + sy * 71.7) * 0.1;
        const baseOx = Math.sin(offSeed) * 0.8;
        const baseOy = Math.cos(offSeed) * 0.8;
        for (let i = 0; i < points.length; i++) {
            const seed2 = (sx * 29.3 + sy * 41.9 + i * 23.7) * 0.1;
            const ox = baseOx + Math.sin(seed2 * 1.1) * 0.6;
            const oy = baseOy + Math.cos(seed2 * 1.7) * 0.6;
            if (i === 0)
                ctx.moveTo(points[i].x + ox, points[i].y + oy);
            else
                ctx.lineTo(points[i].x + ox, points[i].y + oy);
        }
        ctx.stroke();
        ctx.restore();
    }
}

function drawFuzzyRect(ctx, x, y, w, h, strokeColor = "#ffffff", lineWidth = 1.8) {
    drawFuzzyLine(ctx, x, y, x + w, y, strokeColor, lineWidth, { overrun: true });
    drawFuzzyLine(ctx, x + w, y, x + w, y + h, strokeColor, lineWidth, { overrun: true });
    drawFuzzyLine(ctx, x + w, y + h, x, y + h, strokeColor, lineWidth, { overrun: true });
    drawFuzzyLine(ctx, x, y + h, x, y, strokeColor, lineWidth, { overrun: true });
}

function drawFuzzyCircle(ctx, cx, cy, r, strokeColor = "#ffffff", lineWidth = 1.8, startAngle = 0, endAngle = Math.PI * 2, options = {}) {
    const segments = Math.max(12, Math.floor(r * 0.8));
    const angleStep = (endAngle - startAngle) / segments;
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const theta = startAngle + i * angleStep;
        const seed = (cx * 11.3 + cy * 29.1 + i * 13.7) * 0.1;
        const jitterR = r + Math.sin(seed) * 1.5;
        points.push({
            x: cx + Math.cos(theta) * jitterR,
            y: cy + Math.sin(theta) * jitterR,
        });
    }

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = strokeColor === "#D12B3E" ? "rgba(209, 43, 62, 0.4)" : "rgba(255, 255, 255, 0.45)";
    ctx.shadowBlur = 2.0;
    if (options.dashed)
        ctx.setLineDash([4, 2]);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++)
        ctx.lineTo(points[i].x, points[i].y);

    ctx.stroke();
    ctx.restore();

    if (options.singlePass !== true) {
        ctx.save();
        ctx.strokeStyle = strokeColor === "#D12B3E" ? "rgba(209, 43, 62, 0.6)" : "rgba(204, 204, 204, 0.7)";
        ctx.lineWidth = Math.max(1, lineWidth * 0.75);
        ctx.shadowBlur = 1.5;
        if (options.dashed)
            ctx.setLineDash([4, 2]);

        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const seed2 = (cx * 19.3 + cy * 37.1 + i * 17.7) * 0.1;
            const ox = Math.sin(seed2) * 1.0;
            const oy = Math.cos(seed2 * 1.3) * 1.0;
            if (i === 0)
                ctx.moveTo(points[i].x + ox, points[i].y + oy);
            else
                ctx.lineTo(points[i].x + ox, points[i].y + oy);
        }
        ctx.stroke();
        ctx.restore();
    }
}

function drawFuzzyPoly(ctx, points, strokeColor = "#ffffff", lineWidth = 1.8, closed = false, options = {}) {
    if (!points || points.length < 2)
        return;

    for (let i = 0; i < points.length - 1; i++) {
        drawFuzzyLine(ctx, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, strokeColor, lineWidth, {
            overrun: closed || i > 0 || i < points.length - 2,
            ...options,
        });
    }
    if (closed) {
        drawFuzzyLine(ctx, points[points.length - 1].x, points[points.length - 1].y, points[0].x, points[0].y, strokeColor, lineWidth, {
            overrun: true,
            ...options,
        });
    }
}

function drawDraftingTitle(ctx, title, x, y, color = "#ffffff", maxFontSize = 13) {
    ctx.save();
    let fontSize = maxFontSize;
    ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
    let measuredWidth = ctx.measureText(title).width;
    while (x + measuredWidth > ctx.canvas.width - 15 && fontSize > 8.5) {
        fontSize -= 0.5;
        ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
        measuredWidth = ctx.measureText(title).width;
    }
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
    ctx.shadowBlur = 1.5;
    ctx.fillText(title, x, y);
    ctx.restore();
}

function drawDraftingText(ctx, text, x, y, color = "#ffffff", fontSize = 11, bold = false) {
    ctx.save();
    ctx.font = `${bold ? "bold " : ""}${fontSize}px "Courier New", Courier, monospace`;
    ctx.fillStyle = color;
    ctx.shadowColor = color === "#D12B3E" ? "rgba(209, 43, 62, 0.4)" : "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = 1.5;
    ctx.fillText(text, x, y);
    ctx.restore();
}

function drawLeaderArrow(ctx, x1, y1, x2, y2, text, textX, textY, isDashed = false) {
    drawFuzzyLine(ctx, x1, y1, x2, y2, "#D12B3E", 1.5, { dashed: isDashed, overrun: false });
    drawFuzzyCircle(ctx, x1, y1, 3, "#D12B3E", 1.5, 0, Math.PI * 2, { singlePass: true });
    if (text)
        drawDraftingText(ctx, text, textX, textY, "#D12B3E", 11);
}

function drawWoodGrainHatch(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const count = Math.max(3, Math.floor(h / 9));
    for (let i = 0; i < count; i++) {
        const seed = (x * 7.1 + y * 13.3 + i * 31.1) * 0.1;
        const py = y + ((i + 0.5) / count) * h + Math.sin(seed) * 3;
        drawFuzzyLine(ctx, x + 2, py, x + w - 2, py + Math.cos(seed * 1.2) * 4, "rgba(255,255,255,0.22)", 1, { overrun: false, singlePass: true });
    }
    ctx.restore();
}

function drawMasonryHatch(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const rows = Math.max(3, Math.floor(h / 14));
    const rowH = h / rows;
    for (let r = 1; r < rows; r++) {
        const seed = (x * 11.7 + y * 19.3 + r * 23.9) * 0.1;
        const ry = y + r * rowH + Math.sin(seed) * 2;
        drawFuzzyLine(ctx, x, ry, x + w, ry, "rgba(255,255,255,0.28)", 1.2, { overrun: false, singlePass: true });
    }
    for (let r = 0; r < rows; r++) {
        const ry1 = y + r * rowH;
        const ry2 = y + (r + 1) * rowH;
        const cols = Math.max(2, Math.floor(w / 24));
        const colW = w / cols;
        const offset = r % 2 === 0 ? 0 : colW * 0.5;
        for (let c = 0; c <= cols; c++) {
            const seed2 = (x * 17.3 + y * 29.7 + r * 13.1 + c * 41.3) * 0.1;
            const cx = x + ((c * colW + offset) % w) + Math.sin(seed2) * 3;
            if (cx > x + 2 && cx < x + w - 2)
                drawFuzzyLine(ctx, cx, ry1, cx, ry2, "rgba(255,255,255,0.25)", 1, { overrun: false, singlePass: true });
        }
    }
    ctx.restore();
}

function drawStipplingHatch(ctx, x, y, w, h, count = 35) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    for (let i = 0; i < count; i++) {
        const seed = (x * 13.9 + y * 47.1 + i * 83.3) * 0.05;
        const px = x + Math.abs(Math.sin(seed)) * w;
        const py = y + Math.abs(Math.cos(seed * 1.4)) * h;
        if (Math.sin(seed * 2.3) < 0.2) {
            drawFuzzyCircle(ctx, px, py, 1.2 + Math.abs(Math.sin(seed * 3.1)) * 1.5, "rgba(255,255,255,0.28)", 1, 0, Math.PI * 2, { singlePass: true });
        } else {
            drawFuzzyPoly(
                ctx,
                [
                    { x: px, y: py },
                    { x: px + 2.5, y: py + 1.5 },
                    { x: px + 1, y: py + 3 },
                ],
                "rgba(255,255,255,0.25)",
                1,
                true,
                { singlePass: true }
            );
        }
    }
    ctx.restore();
}

function drawFoamSquiggles(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const count = Math.max(8, Math.floor((w * h) / 350));
    for (let i = 0; i < count; i++) {
        const seed = (x * 23.1 + y * 59.3 + i * 71.7) * 0.05;
        const cx = x + 8 + Math.abs(Math.sin(seed)) * Math.max(1, w - 16);
        const cy = y + 8 + Math.abs(Math.cos(seed * 1.3)) * Math.max(1, h - 16);
        const r = 3 + Math.abs(Math.sin(seed * 2.1)) * 4;
        drawFuzzyCircle(ctx, cx, cy, r, "rgba(255,255,255,0.32)", 1.2, 0, Math.PI * 1.5, { singlePass: true });
    }
    ctx.restore();
}

function drawCrossSectionHatch(ctx, x, y, w, h, spacing = 9) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const maxDim = w + h;
    for (let d = -h; d < maxDim; d += spacing)
        drawFuzzyLine(ctx, x + d, y, x + d - h, y + h, "rgba(255,255,255,0.24)", 1, { overrun: false, singlePass: true });

    ctx.restore();
}

function drawConstructionReticles(ctx, width, height) {
    drawFuzzyLine(ctx, 40, height * 0.5, width - 40, height * 0.5, "rgba(255, 255, 255, 0.16)", 1, { dashed: true, singlePass: true, overrun: false });
    drawFuzzyLine(ctx, width * 0.5, 30, width * 0.5, height - 25, "rgba(255, 255, 255, 0.16)", 1, { dashed: true, singlePass: true, overrun: false });
}

function getOrGenerateInlineIllustrationDataURL(stageId, pIdx, title) {
    const cacheKey = `${stageId}-${pIdx}`;
    if (INLINE_ILLUSTRATION_CACHE[cacheKey])
        return INLINE_ILLUSTRATION_CACHE[cacheKey];

    if (typeof document === "undefined" || !document.createElement)
        return "";

    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return "";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDraftingTitle(ctx, title || "", 15, 24, "#ffffff", 13);
    drawConstructionReticles(ctx, canvas.width, canvas.height);

    if (stageId === "step-1" && pIdx === 1) {
        drawFuzzyRect(ctx, 60, 50, 180, 45);
        drawWoodGrainHatch(ctx, 60, 50, 180, 45);
        drawFuzzyRect(ctx, 60, 105, 180, 45);
        drawWoodGrainHatch(ctx, 60, 105, 180, 45);
        drawFuzzyPoly(
            ctx,
            [
                { x: 60, y: 50 },
                { x: 95, y: 72.5 },
                { x: 60, y: 95 },
            ],
            "#ffffff",
            2
        );
        drawFuzzyLine(ctx, 70, 55, 230, 55, "rgba(255,255,255,0.3)", 1, { overrun: false });
        drawFuzzyLine(ctx, 70, 110, 230, 110, "rgba(255,255,255,0.3)", 1, { overrun: false });
        drawLeaderArrow(ctx, 260, 72.5, 380, 72.5, "SLOPE TAPER 1:4 (DRAINAGE)", 270, 66, true);
        drawLeaderArrow(ctx, 260, 127.5, 380, 127.5, "BROADAXE HEWN OAK SILL", 270, 122, false);
    } else if (stageId === "step-1" && pIdx === 3) {
        drawFuzzyRect(ctx, 50, 140, 400, 40);
        drawStipplingHatch(ctx, 50, 140, 400, 40);
        drawCrossSectionHatch(ctx, 50, 140, 400, 40, 16);
        drawFuzzyRect(ctx, 180, 45, 140, 95);
        drawMasonryHatch(ctx, 180, 45, 140, 95);
        drawFuzzyLine(ctx, 190, 60, 310, 60, "#ffffff", 1.5, { overrun: false });
        drawFuzzyLine(ctx, 190, 85, 310, 85, "#ffffff", 1.5, { overrun: false });
        drawFuzzyLine(ctx, 190, 110, 310, 110, "#ffffff", 1.5, { overrun: false });
        drawLeaderArrow(ctx, 340, 92, 440, 92, "CENTRAL MASS CHIMNEY", 355, 86, false);
    } else if (stageId === "step-2" && pIdx === 1) {
        drawFuzzyRect(ctx, 100, 60, 140, 90);
        drawWoodGrainHatch(ctx, 100, 60, 140, 90);
        drawFuzzyRect(ctx, 240, 80, 120, 50);
        drawWoodGrainHatch(ctx, 240, 80, 120, 50);
        drawFuzzyCircle(ctx, 210, 105, 10, "#ffffff", 1.8);
        drawFuzzyCircle(ctx, 213, 105, 8, "#D12B3E", 1.5, 0, Math.PI * 2, { dashed: true });
        drawLeaderArrow(ctx, 213, 160, 213, 50, "3.1 MM PIN OFFSET TENSION", 250, 58, false);
    } else if (stageId === "step-2" && pIdx === 3) {
        drawFuzzyLine(ctx, 80, 160, 420, 160, "#ffffff", 2);
        drawFuzzyLine(ctx, 150, 160, 150, 60, "#ffffff", 2.2);
        drawFuzzyLine(ctx, 150, 60, 330, 60, "#ffffff", 2.2);
        drawFuzzyLine(ctx, 330, 60, 330, 160, "#ffffff", 2.2);
        drawFuzzyLine(ctx, 150, 110, 190, 60, "#ffffff", 1.8);
        drawFuzzyLine(ctx, 330, 110, 290, 60, "#ffffff", 1.8);
        drawWoodGrainHatch(ctx, 145, 60, 190, 100);
        drawLeaderArrow(ctx, 350, 60, 440, 40, "PULLEY RIGGING POINT", 360, 34, false);
    } else if (stageId === "step-3" && pIdx === 1) {
        drawFuzzyPoly(
            ctx,
            [
                { x: 120, y: 60 },
                { x: 380, y: 60 },
                { x: 330, y: 160 },
                { x: 170, y: 160 },
            ],
            "#ffffff",
            2,
            true
        );
        drawStipplingHatch(ctx, 140, 70, 220, 80);
        drawFuzzyCircle(ctx, 250, 135, 18, "#ffffff", 2);
        drawCrossSectionHatch(ctx, 235, 120, 30, 30, 6);
        drawLeaderArrow(ctx, 268, 135, 420, 135, "PERFORATED CLAY TILE DATUM", 280, 128, false);
    } else if (stageId === "step-3" && pIdx === 3) {
        drawFuzzyRect(ctx, 130, 70, 240, 90);
        drawMasonryHatch(ctx, 130, 70, 240, 90);
        drawFuzzyRect(ctx, 150, 130, 200, 30, "rgba(255,255,255,0.7)", 1.5);
        drawFuzzyPoly(
            ctx,
            [
                { x: 130, y: 70 },
                { x: 250, y: 35 },
                { x: 370, y: 70 },
            ],
            "#ffffff",
            2.2
        );
        drawLeaderArrow(ctx, 380, 145, 460, 145, "CONSTANT 48°F WATER", 385, 138, false);
    } else if (stageId === "step-4" && pIdx === 1) {
        drawFuzzyCircle(ctx, 160, 115, 65, "#ffffff", 2);
        drawFuzzyCircle(ctx, 160, 115, 50, "#ffffff", 1.5);
        drawFuzzyCircle(ctx, 160, 115, 14, "#ffffff", 2);
        drawFuzzyLine(ctx, 160, 50, 175, 65, "#ffffff", 2);
        drawFuzzyLine(ctx, 225, 115, 210, 130, "#ffffff", 2);
        drawFuzzyLine(ctx, 160, 180, 145, 165, "#ffffff", 2);
        drawFuzzyLine(ctx, 95, 115, 110, 100, "#ffffff", 2);
        drawWoodGrainHatch(ctx, 110, 65, 100, 100);
        drawLeaderArrow(ctx, 225, 115, 390, 115, "16 OAK BUCKET CAVITIES", 240, 108, false);
    } else if (stageId === "step-4" && pIdx === 3) {
        drawFuzzyRect(ctx, 120, 85, 110, 24);
        drawWoodGrainHatch(ctx, 120, 85, 110, 24);
        drawFuzzyRect(ctx, 226, 55, 24, 84);
        drawCrossSectionHatch(ctx, 226, 55, 24, 84, 8);
        drawLeaderArrow(ctx, 230, 97, 380, 97, "90° TORQUE TRANSLATION", 245, 90, false);
    } else if (stageId === "step-5" && pIdx === 1) {
        drawFuzzyRect(ctx, 180, 130, 140, 30);
        drawWoodGrainHatch(ctx, 180, 130, 140, 30);
        drawFuzzyRect(ctx, 210, 45, 22, 85);
        drawWoodGrainHatch(ctx, 210, 45, 22, 85);
        drawFuzzyRect(ctx, 268, 45, 22, 85);
        drawWoodGrainHatch(ctx, 268, 45, 22, 85);
        drawLeaderArrow(ctx, 232, 85, 370, 85, "CONTINUOUS 2X4 DIMENSION STUD", 245, 78, false);
    } else if (stageId === "step-5" && pIdx === 3) {
        drawFuzzyLine(ctx, 80, 110, 210, 110, "#ffffff", 3);
        drawFuzzyRect(ctx, 210, 98, 80, 24);
        drawCrossSectionHatch(ctx, 210, 98, 80, 24, 7);
        drawFuzzyLine(ctx, 290, 110, 420, 110, "#ffffff", 3);
        drawLeaderArrow(ctx, 250, 122, 380, 160, "REVERSE THREAD TENSION COLLAR", 280, 172, false);
    } else if (stageId === "step-6" && pIdx === 1) {
        drawFuzzyPoly(
            ctx,
            [
                { x: 230, y: 45 },
                { x: 215, y: 65 },
                { x: 245, y: 85 },
                { x: 230, y: 105 },
                { x: 215, y: 125 },
                { x: 245, y: 145 },
                { x: 230, y: 165 },
            ],
            "#ffffff",
            2.2
        );
        drawFuzzyPoly(
            ctx,
            [
                { x: 270, y: 45 },
                { x: 285, y: 65 },
                { x: 255, y: 85 },
                { x: 270, y: 105 },
                { x: 285, y: 125 },
                { x: 255, y: 145 },
                { x: 270, y: 165 },
            ],
            "#ffffff",
            2.2
        );
        drawWoodGrainHatch(ctx, 225, 50, 50, 110);
        drawFuzzyLine(ctx, 250, 40, 250, 170, "rgba(255,255,255,0.3)", 1, { dashed: true });
        drawLeaderArrow(ctx, 275, 105, 410, 105, "HIGH-SPEED TURNED CHISEL CUT", 285, 98, false);
    } else if (stageId === "step-6" && pIdx === 3) {
        drawFuzzyLine(ctx, 100, 115, 400, 115, "#ffffff", 4);
        drawFuzzyCircle(ctx, 200, 115, 8, "#ffffff", 1.8);
        drawFuzzyCircle(ctx, 300, 115, 8, "#ffffff", 1.8);
        drawFuzzyLine(ctx, 200, 115, 200, 60, "#ffffff", 2.5);
        drawFuzzyLine(ctx, 300, 115, 300, 60, "#ffffff", 2.5);
        drawCrossSectionHatch(ctx, 190, 65, 20, 50, 8);
        drawCrossSectionHatch(ctx, 290, 65, 20, 50, 8);
        drawLeaderArrow(ctx, 315, 85, 440, 85, 'THREADED 3/4" PIPE TEE', 320, 78, false);
    } else if (stageId === "step-7" && pIdx === 1) {
        drawFuzzyRect(ctx, 120, 60, 260, 110);
        drawWoodGrainHatch(ctx, 120, 60, 260, 110);
        drawFuzzyPoly(
            ctx,
            [
                { x: 120, y: 60 },
                { x: 250, y: 30 },
                { x: 380, y: 60 },
            ],
            "#ffffff",
            2
        );
        drawFuzzyCircle(ctx, 250, 50, 8, "#ffffff", 2);
        drawFuzzyLine(ctx, 250, 58, 250, 130, "#ffffff", 1.5);
        drawLeaderArrow(ctx, 260, 80, 420, 80, "GRAVITY PULLEY TRACK DATUM", 270, 73, false);
    } else if (stageId === "step-7" && pIdx === 3) {
        drawFuzzyCircle(ctx, 210, 115, 35, "#ffffff", 2.2);
        drawFuzzyCircle(ctx, 210, 115, 25, "#ffffff", 1.5);
        drawCrossSectionHatch(ctx, 175, 80, 70, 70, 8);
        drawFuzzyLine(ctx, 150, 160, 270, 160, "rgba(255,255,255,0.3)", 1);
        drawFuzzyLine(ctx, 160, 170, 260, 170, "rgba(255,255,255,0.3)", 1);
        drawStipplingHatch(ctx, 150, 150, 120, 25);
        drawLeaderArrow(ctx, 248, 115, 410, 115, "POROUS CLAY INFILTRATION JOINT", 258, 108, false);
    } else if (stageId === "step-8" && pIdx === 1) {
        drawFuzzyRect(ctx, 140, 90, 220, 30);
        drawWoodGrainHatch(ctx, 140, 90, 220, 30);
        drawFuzzyRect(ctx, 220, 65, 28, 25);
        drawCrossSectionHatch(ctx, 220, 65, 28, 25, 6);
        drawFuzzyLine(ctx, 80, 77, 420, 77, "#ffffff", 2.2);
        drawLeaderArrow(ctx, 250, 77, 390, 50, "CERAMIC JOIST STANDOFF CLEAT", 260, 44, false);
    } else if (stageId === "step-8" && pIdx === 3) {
        drawFuzzyRect(ctx, 150, 65, 26, 95);
        drawCrossSectionHatch(ctx, 150, 65, 26, 95, 8);
        drawFuzzyRect(ctx, 190, 65, 26, 95);
        drawCrossSectionHatch(ctx, 190, 65, 26, 95, 8);
        drawFuzzyRect(ctx, 230, 65, 26, 95);
        drawCrossSectionHatch(ctx, 230, 65, 26, 95, 8);
        drawFuzzyRect(ctx, 270, 65, 26, 95);
        drawCrossSectionHatch(ctx, 270, 65, 26, 95, 8);
        drawFuzzyLine(ctx, 145, 145, 305, 145, "#ffffff", 4);
        drawLeaderArrow(ctx, 300, 110, 430, 110, "HIGH THERMAL MASS COLUMN", 310, 103, false);
    } else if (stageId === "step-9" && pIdx === 1) {
        drawFuzzyPoly(
            ctx,
            [
                { x: 100, y: 130 },
                { x: 250, y: 165 },
                { x: 400, y: 130 },
            ],
            "#ffffff",
            2.5
        );
        drawFuzzyLine(ctx, 100, 130, 400, 130, "rgba(255,255,255,0.3)", 1, { dashed: true });
        drawWoodGrainHatch(ctx, 140, 130, 220, 30);
        drawLeaderArrow(ctx, 250, 130, 250, 147, "4.8 INCH RIDGE SAG DEFLECTION", 265, 142, false);
    } else if (stageId === "step-9" && pIdx === 3) {
        drawFuzzyRect(ctx, 120, 60, 220, 100);
        drawMasonryHatch(ctx, 120, 60, 220, 100);
        drawFuzzyPoly(
            ctx,
            [
                { x: 340, y: 80 },
                { x: 310, y: 110 },
                { x: 325, y: 155 },
            ],
            "#ffffff",
            2.5
        );
        drawStipplingHatch(ctx, 310, 90, 40, 60);
        drawLeaderArrow(ctx, 330, 115, 440, 115, "BIOLOGICAL WEDGING FAILURE", 335, 108, false);
    } else if (stageId === "step-10" && pIdx === 1) {
        drawFuzzyRect(ctx, 225, 45, 50, 120);
        drawFuzzyLine(ctx, 225, 75, 275, 85, "#ffffff", 2);
        drawFuzzyLine(ctx, 225, 95, 275, 105, "#ffffff", 2);
        drawFuzzyLine(ctx, 225, 115, 275, 125, "#ffffff", 2);
        drawFuzzyRect(ctx, 210, 85, 80, 16);
        drawCrossSectionHatch(ctx, 225, 45, 50, 120, 10);
        drawLeaderArrow(ctx, 290, 93, 420, 93, "ADJUSTABLE ACME THREAD COLLAR", 295, 86, false);
    } else if (stageId === "step-10" && pIdx === 3) {
        drawFuzzyPoly(
            ctx,
            [
                { x: 180, y: 140 },
                { x: 320, y: 140 },
                { x: 350, y: 175 },
                { x: 150, y: 175 },
            ],
            "#ffffff",
            2,
            true
        );
        drawStipplingHatch(ctx, 160, 145, 180, 25);
        drawFuzzyRect(ctx, 235, 65, 30, 75);
        drawCrossSectionHatch(ctx, 235, 65, 30, 75, 8);
        drawLeaderArrow(ctx, 335, 158, 450, 158, "POURED LOAD SPREADER DATUM", 340, 151, false);
    } else if (stageId === "step-11" && pIdx === 1) {
        drawFuzzyRect(ctx, 160, 110, 180, 28);
        drawWoodGrainHatch(ctx, 160, 110, 180, 28);
        drawFuzzyRect(ctx, 220, 145, 60, 35);
        drawCrossSectionHatch(ctx, 220, 145, 60, 35, 8);
        drawFuzzyLine(ctx, 250, 145, 250, 138, "#ffffff", 3);
        drawLeaderArrow(ctx, 340, 124, 450, 124, "PRECISION 12-TON LIFT POINT", 345, 117, false);
    } else if (stageId === "step-11" && pIdx === 3) {
        drawFuzzyRect(ctx, 180, 80, 140, 44);
        drawWoodGrainHatch(ctx, 180, 80, 140, 44);
        drawFuzzyPoly(
            ctx,
            [
                { x: 180, y: 80 },
                { x: 210, y: 80 },
                { x: 210, y: 114 },
                { x: 180, y: 114 },
            ],
            "#ffffff",
            2.5
        );
        drawCrossSectionHatch(ctx, 180, 80, 30, 34, 6);
        drawFuzzyPoly(
            ctx,
            [
                { x: 320, y: 80 },
                { x: 290, y: 80 },
                { x: 290, y: 114 },
                { x: 320, y: 114 },
            ],
            "#ffffff",
            2.5
        );
        drawCrossSectionHatch(ctx, 290, 80, 30, 34, 6);
        drawLeaderArrow(ctx, 320, 102, 440, 102, "STRUCTURAL STEEL C-CHANNEL", 325, 95, false);
    } else if (stageId === "step-12" && pIdx === 1) {
        drawFuzzyRect(ctx, 140, 120, 220, 25);
        drawStipplingHatch(ctx, 140, 120, 220, 25);
        drawFuzzyRect(ctx, 210, 145, 80, 35);
        drawStipplingHatch(ctx, 210, 145, 80, 35, 20);
        drawFuzzyRect(ctx, 240, 60, 20, 85);
        drawCrossSectionHatch(ctx, 240, 60, 20, 85, 7);
        drawLeaderArrow(ctx, 260, 90, 410, 90, '4" PVC ACTIVE SUCTION RISER', 265, 83, false);
    } else if (stageId === "step-12" && pIdx === 3) {
        drawFuzzyCircle(ctx, 210, 120, 30, "#ffffff", 2.2);
        drawCrossSectionHatch(ctx, 180, 90, 60, 60, 8);
        drawFuzzyCircle(ctx, 210, 142, 4, "#ffffff", 1.2);
        drawFuzzyCircle(ctx, 192, 135, 4, "#ffffff", 1.2);
        drawFuzzyCircle(ctx, 228, 135, 4, "#ffffff", 1.2);
        drawFuzzyRect(ctx, 160, 75, 100, 90, "rgba(255,255,255,0.4)", 1.2);
        drawStipplingHatch(ctx, 160, 75, 100, 90, 45);
        drawLeaderArrow(ctx, 240, 120, 410, 120, "GEOTEXTILE FABRIC GRAVEL ENCASEMENT", 248, 113, false);
    } else if (stageId === "step-13" && pIdx === 1) {
        drawFuzzyRect(ctx, 160, 60, 180, 100);
        drawFoamSquiggles(ctx, 160, 60, 180, 100);
        drawFuzzyPoly(
            ctx,
            [
                { x: 160, y: 75 },
                { x: 220, y: 75 },
                { x: 280, y: 75 },
                { x: 340, y: 75 },
            ],
            "rgba(255,255,255,0.4)",
            2
        );
        drawFuzzyPoly(
            ctx,
            [
                { x: 160, y: 115 },
                { x: 220, y: 115 },
                { x: 280, y: 115 },
                { x: 340, y: 115 },
            ],
            "rgba(255,255,255,0.4)",
            2
        );
        drawLeaderArrow(ctx, 340, 105, 450, 105, "R-45 CONTINUOUS FOAM MATRIX", 345, 98, false);
    } else if (stageId === "step-13" && pIdx === 3) {
        drawFuzzyRect(ctx, 220, 50, 60, 130);
        drawStipplingHatch(ctx, 220, 50, 60, 130, 25);
        drawFuzzyLine(ctx, 242, 50, 242, 165, "#ffffff", 2);
        drawFuzzyLine(ctx, 258, 50, 258, 165, "#ffffff", 2);
        drawFuzzyPoly(
            ctx,
            [
                { x: 242, y: 165 },
                { x: 250, y: 175 },
                { x: 258, y: 165 },
            ],
            "#ffffff",
            2
        );
        drawLeaderArrow(ctx, 280, 110, 430, 110, "400 FT VERTICAL CLOSED LOOP", 285, 103, false);
    } else if (stageId === "step-14" && pIdx === 1) {
        drawFuzzyRect(ctx, 120, 60, 40, 110);
        drawWoodGrainHatch(ctx, 120, 60, 40, 110);
        drawFuzzyRect(ctx, 160, 60, 200, 36);
        drawWoodGrainHatch(ctx, 160, 60, 200, 36);
        drawLeaderArrow(ctx, 360, 78, 460, 78, "PRESERVED 1780 HEWN TIMBER", 365, 71, false);
    } else if (stageId === "step-14" && pIdx === 3) {
        drawFuzzyRect(ctx, 170, 70, 160, 95);
        drawCrossSectionHatch(ctx, 170, 70, 160, 95, 12);
        drawFuzzyRect(ctx, 220, 55, 60, 15);
        drawFuzzyPoly(
            ctx,
            [
                { x: 250, y: 90 },
                { x: 240, y: 115 },
                { x: 255, y: 115 },
                { x: 245, y: 140 },
            ],
            "#ffffff",
            2.5
        );
        drawLeaderArrow(ctx, 330, 115, 450, 115, "MICROGRID SOLID-STATE DATUM", 335, 108, false);
    } else if (stageId === "step-15" && pIdx === 1) {
        drawFuzzyRect(ctx, 200, 55, 100, 30);
        drawStipplingHatch(ctx, 200, 55, 100, 30, 15);
        drawFuzzyPoly(
            ctx,
            [
                { x: 170, y: 85 },
                { x: 250, y: 120 },
                { x: 330, y: 85 },
            ],
            "#ffffff",
            1.5
        );
        drawFuzzyPoly(
            ctx,
            [
                { x: 140, y: 85 },
                { x: 250, y: 155 },
                { x: 360, y: 85 },
            ],
            "#ffffff",
            1.5
        );
        drawFuzzyPoly(
            ctx,
            [
                { x: 110, y: 85 },
                { x: 250, y: 190 },
                { x: 390, y: 85 },
            ],
            "#ffffff",
            1.5
        );
        drawStipplingHatch(ctx, 120, 85, 260, 100, 40);
        drawLeaderArrow(ctx, 330, 130, 440, 130, "ISOBAR STRESS DISSIPATION", 335, 123, false);
    } else if (stageId === "step-15" && pIdx === 3) {
        drawFuzzyRect(ctx, 220, 60, 35, 110);
        drawMasonryHatch(ctx, 220, 60, 35, 110);
        drawFuzzyLine(ctx, 140, 85, 220, 85, "#ffffff", 2);
        drawFuzzyPoly(
            ctx,
            [
                { x: 220, y: 85 },
                { x: 210, y: 80 },
                { x: 210, y: 90 },
            ],
            "#ffffff",
            1.5,
            true
        );
        drawFuzzyLine(ctx, 160, 120, 220, 120, "#ffffff", 2);
        drawFuzzyPoly(
            ctx,
            [
                { x: 220, y: 120 },
                { x: 210, y: 115 },
                { x: 210, y: 125 },
            ],
            "#ffffff",
            1.5,
            true
        );
        drawStipplingHatch(ctx, 130, 70, 85, 70, 30);
        drawLeaderArrow(ctx, 255, 100, 410, 100, "LATERAL HYDROSTATIC THRUST", 260, 93, false);
    } else if (stageId === "step-16" && pIdx === 1) {
        drawFuzzyRect(ctx, 140, 60, 90, 110);
        drawFoamSquiggles(ctx, 140, 60, 90, 110);
        drawFuzzyRect(ctx, 230, 60, 130, 110);
        drawCrossSectionHatch(ctx, 230, 60, 130, 110, 10);
        drawFuzzyLine(ctx, 230, 50, 230, 180, "#D12B3E", 2.5, { dashed: true });
        drawDraftingText(ctx, "DEW-POINT ISOTHERM DATUM", 245, 165, "#D12B3E", 11);
    } else if (stageId === "step-16" && pIdx === 3) {
        drawFuzzyRect(ctx, 150, 70, 200, 85);
        drawCrossSectionHatch(ctx, 150, 70, 200, 85, 7);
        drawFuzzyLine(ctx, 120, 95, 150, 95, "#ffffff", 1.8);
        drawFuzzyLine(ctx, 120, 130, 150, 130, "#ffffff", 1.8);
        drawLeaderArrow(ctx, 350, 112, 460, 112, "ZERO THERMAL BRIDGING PROFILE", 355, 105, false);
    } else if (stageId === "step-17" && pIdx === 1) {
        drawFuzzyRect(ctx, 220, 80, 60, 90);
        drawWoodGrainHatch(ctx, 220, 80, 60, 90);
        drawFuzzyLine(ctx, 250, 35, 250, 80, "#ffffff", 2.5);
        drawFuzzyPoly(
            ctx,
            [
                { x: 250, y: 80 },
                { x: 244, y: 70 },
                { x: 256, y: 70 },
            ],
            "#ffffff",
            1.5,
            true
        );
        drawLeaderArrow(ctx, 280, 120, 430, 120, "32 PSF DEAD + 40 PSF LIVE LOAD", 285, 113, false);
    } else if (stageId === "step-17" && pIdx === 3) {
        drawFuzzyPoly(
            ctx,
            [
                { x: 170, y: 165 },
                { x: 290, y: 165 },
                { x: 310, y: 65 },
                { x: 190, y: 65 },
            ],
            "#ffffff",
            2,
            true
        );
        drawCrossSectionHatch(ctx, 170, 65, 140, 100, 12);
        drawFuzzyLine(ctx, 120, 85, 190, 85, "#ffffff", 2.5);
        drawFuzzyPoly(
            ctx,
            [
                { x: 190, y: 85 },
                { x: 180, y: 79 },
                { x: 180, y: 91 },
            ],
            "#ffffff",
            1.5,
            true
        );
        drawLeaderArrow(ctx, 310, 115, 440, 115, "MAX STORY DRIFT INDEX L/360", 315, 108, false);
    }

    try {
        const dataUrl = canvas.toDataURL("image/png");
        INLINE_ILLUSTRATION_CACHE[cacheKey] = dataUrl;
        return dataUrl;
    } catch (e) {
        return "";
    }
}
function renderStageSections() {
    const container = document.getElementById("scrolly-container");
    if (!container)
        return;

    container.innerHTML = "";
    STAGES.forEach((stage, idx) => {
        const stageEl = document.createElement("section");
        const isOdd = idx % 2 === 0; // 0-indexed: 0 is Stage 1 (odd -> text left), 1 is Stage 2 (even -> text right)
        stageEl.setAttribute("class", `stage-section ${isOdd ? "layout-text-left" : "layout-text-right"}`);
        stageEl.setAttribute("id", `stage-section-${idx}`);
        stageEl.setAttribute("data-stage-index", String(idx));

        const specsHtml = stage.specs
            .map(
                (spec) => `
            <div class="spec-item">
                <span class="spec-label">${spec.label}</span>
                <span class="spec-value">${spec.value}</span>
            </div>`
            )
            .join("");

        const descHtml = Array.isArray(stage.paragraphs)
            ? stage.paragraphs
                .map((p, pIdx) => {
                    const illTitles = INLINE_ILLUSTRATION_TITLES[stage.id] || [];
                    let illPrefix = "";
                    if (pIdx === 1 && illTitles[0]) {
                        const dataUrl = getOrGenerateInlineIllustrationDataURL(stage.id, 1, illTitles[0]);
                        if (dataUrl)
                            illPrefix = `<div class="step-inline-illustration" style="opacity: 1 !important; transition: none !important; animation: none !important; background: transparent !important; border: 2px solid var(--ink-secondary); border-radius: 6px; margin: 16px 0; padding: 12px; text-align: center;"><img class="step-inline-illustration-img" src="${dataUrl}" alt="${illTitles[0]}" style="opacity: 1 !important; transition: none !important; animation: none !important; background: transparent !important; max-width: 100%; height: auto;"></div>`;
                    } else if (pIdx === 3 && illTitles[1]) {
                        const dataUrl = getOrGenerateInlineIllustrationDataURL(stage.id, 3, illTitles[1]);
                        if (dataUrl)
                            illPrefix = `<div class="step-inline-illustration" style="opacity: 1 !important; transition: none !important; animation: none !important; background: transparent !important; border: 2px solid var(--ink-secondary); border-radius: 6px; margin: 16px 0; padding: 12px; text-align: center;"><img class="step-inline-illustration-img" src="${dataUrl}" alt="${illTitles[1]}" style="opacity: 1 !important; transition: none !important; animation: none !important; background: transparent !important; max-width: 100%; height: auto;"></div>`;
                    }

                    return `${illPrefix}
                <p class="step-paragraph-item step-description" data-p-index="${pIdx}">${p}</p>`;
                })
                .join("")
            : `<p class="step-paragraph-item step-description" data-p-index="0">${stage.description}</p>`;

        const narrativeHtml = `
            <div class="stage-narrative-column">
                <article id="step-${idx + 1}" class="step ${idx === 0 ? "is-active" : ""}" data-index="${idx}">
                    <span class="step-meta">Stage ${idx + 1} // ${stage.year}</span>
                    <h2 class="step-title">${stage.title}: ${stage.subtitle}</h2>
                    <div class="step-body">${descHtml}</div>
                    <div class="step-specs">${specsHtml}</div>
                </article>
            </div>
        `;

        const graphicHtml = `
            <div class="stage-graphic-column" aria-label="Interactive architectural display for Stage ${idx + 1}">
                <div class="graphic-sticky-wrapper">
                    <canvas class="graphic-canvas" id="graphic-canvas-${idx}"></canvas>
                    <svg class="graphic-svg" id="graphic-svg-${idx}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet"></svg>
                    <div class="caption" id="graphic-caption-${idx}">Stage ${idx + 1}: ${stage.title}</div>
                </div>
            </div>
        `;

        stageEl.innerHTML = narrativeHtml + graphicHtml;
        container.appendChild(stageEl);

        const pItems = stageEl.querySelectorAll(".step-paragraph-item");
        pItems.forEach((item) => {
            item.addEventListener("click", () => {
                item.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        });
    });
}

function renderFloatingTOC() {
    const tocList = document.getElementById("toc-list");
    if (!tocList)
        return;

    tocList.innerHTML = `<div id="toc-active-indicator" class="toc-active-indicator"></div>${STAGES.map(
        (stage, idx) => `
            <li class="toc-item-wrapper">
                <button class="toc-item ${idx === 0 ? "is-active" : ""}" data-index="${idx}">
                    <span class="toc-num">0${idx + 1}</span>
                    <span class="toc-label">${stage.title}</span>
                </button>
            </li>
        `
    ).join("")}`;

    const buttons = tocList.querySelectorAll(".toc-item");
    buttons.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            if (typeof window.stepTo === "function")
                window.stepTo(idx);
        });
    });

    const toggleBtn = document.getElementById("toc-toggle-btn");
    const floatingToc = document.getElementById("floating-toc");
    const toggleSymbol = document.getElementById("toc-toggle-symbol");
    if (toggleBtn && floatingToc && !toggleBtn.dataset.listenerAttached) {
        toggleBtn.dataset.listenerAttached = "true";
        toggleBtn.addEventListener("click", () => {
            const isCollapsed = floatingToc.classList.toggle("is-collapsed");
            toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
            if (toggleSymbol)
                toggleSymbol.textContent = isCollapsed ? "[ + ]" : "[ - ]";

            if (!isCollapsed && typeof window.forceScrollytellingUpdate === "function")
                window.forceScrollytellingUpdate();
        });
    }
}

function renderBottomTimeline() {
    const timelinePoints = document.getElementById("timeline-points");
    if (timelinePoints) {
        timelinePoints.innerHTML = "";
        STAGES.forEach((stage, idx) => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.className = "timeline-point";
            btn.type = "button";
            btn.textContent = `${stage.year}`;
            btn.setAttribute("aria-label", `Jump to Stage ${idx + 1}: ${stage.year}`);
            btn.addEventListener("click", () => {
                const targetEl = document.getElementById(`stage-section-${idx}`);
                if (targetEl)
                    targetEl.scrollIntoView({ behavior: "smooth" });
            });
            li.appendChild(btn);
            timelinePoints.appendChild(li);
        });
    }
}

window.forceScrollytellingUpdate = function () {
    const floatingToc = document.getElementById("floating-toc");
    if (floatingToc) {
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        const header = document.querySelector(".page-header");
        const threshold = header ? header.offsetHeight - 50 : 300;
        const shouldShowTOC = scrollY > threshold;
        if (shouldShowTOC) {
            if (floatingToc.classList.contains("is-hidden")) {
                floatingToc.classList.remove("is-hidden");
                floatingToc.classList.add("is-visible");
            }
        } else {
            if (!floatingToc.classList.contains("is-hidden")) {
                floatingToc.classList.add("is-hidden");
                floatingToc.classList.remove("is-visible");
            }
        }
    }

    const sections = Array.from(document.querySelectorAll(".stage-section"));
    if (sections.length === 0)
        return;

    const viewportCenter = window.innerHeight * 0.5;
    let activeIndex = -1;
    let activeProgress = 0.0;

    // Phase 1: Check if any section straddles the viewport center
    for (let idx = 0; idx < sections.length; idx++) {
        const secEl = sections[idx];
        const rect = secEl.getBoundingClientRect();
        if (rect.top <= viewportCenter && rect.bottom > viewportCenter) {
            activeIndex = idx;
            if (rect.height > 0) {
                if (rect.top >= 0) {
                    activeProgress = 0.0;
                } else {
                    const prog = -rect.top / Math.max(1, rect.height - window.innerHeight * 0.5);
                    activeProgress = Math.max(0.0, Math.min(1.0, prog));
                }
            }
            break;
        }
    }

    // Phase 2: If in a gap or out of bounds, find the section with the closest center
    if (activeIndex === -1) {
        let minDistance = Infinity;
        for (let idx = 0; idx < sections.length; idx++) {
            const secEl = sections[idx];
            const rect = secEl.getBoundingClientRect();
            const secCenter = rect.top + rect.height * 0.5;
            const dist = Math.abs(secCenter - viewportCenter);
            if (dist < minDistance) {
                minDistance = dist;
                activeIndex = idx;
                if (secCenter < viewportCenter)
                    activeProgress = 1.0;
                else
                    activeProgress = 0.0;
            }
        }
    }

    const steps = Array.from(document.querySelectorAll(".step"));
    steps.forEach((stepEl, idx) => {
        if (idx === activeIndex) {
            if (!stepEl.classList.contains("is-active"))
                stepEl.classList.add("is-active");
        } else {
            if (stepEl.classList.contains("is-active"))
                stepEl.classList.remove("is-active");
        }
    });

    const stageLabel = document.getElementById("active-stage-label");
    if (stageLabel && STAGES[activeIndex])
        stageLabel.textContent = `STAGE ${activeIndex + 1}: ${STAGES[activeIndex].title.toUpperCase()}`;

    const tocItems = document.querySelectorAll(".toc-item");
    const indicator = document.getElementById("toc-active-indicator");
    tocItems.forEach((item, idx) => {
        if (idx === activeIndex) {
            if (!item.classList.contains("is-active"))
                item.classList.add("is-active");
            if (indicator) {
                const wrapper = item.closest(".toc-item-wrapper") || item.parentElement || item;
                const offsetTop = wrapper.offsetTop;
                const height = wrapper.offsetHeight;
                indicator.style.transform = `translateY(${offsetTop}px)`;
                indicator.style.height = `${height}px`;
            }
        } else {
            if (item.classList.contains("is-active"))
                item.classList.remove("is-active");
        }
    });

    const bottomTimeline = document.getElementById("bottom-timeline-overlay");
    if (bottomTimeline) {
        if (bottomTimeline.classList.contains("is-hidden")) {
            bottomTimeline.classList.remove("is-hidden");
            bottomTimeline.classList.add("is-visible");
        }
        const points = bottomTimeline.querySelectorAll(".timeline-point");
        points.forEach((pt, idx) => {
            if (idx === activeIndex) {
                if (!pt.classList.contains("is-active"))
                    pt.classList.add("is-active");
            } else {
                if (pt.classList.contains("is-active"))
                    pt.classList.remove("is-active");
            }
        });
    }

    updateGraphics(activeIndex, activeProgress);
};

window.scrollToStep = function (index) {
    const sections = document.querySelectorAll(".stage-section");
    if (index >= 0 && index < sections.length) {
        const secEl = sections[index];
        secEl.scrollIntoView({ behavior: "instant", block: "start" });
        if (typeof window.forceScrollytellingUpdate === "function")
            window.forceScrollytellingUpdate();
    }
};

for (let i = 0; i < STAGES.length; i++) {
    window[`stepTo${i}`] = function () {
        window.scrollToStep(i);
    };
}

window.stepTo = function (index) {
    window.scrollToStep(index);
};

window._scrubProgress = 0.0;

window.resetScrub = function () {
    window._scrubProgress = 0.0;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (typeof window.forceScrollytellingUpdate === "function")
        window.forceScrollytellingUpdate();
};

window.scrubNext = function () {
    window._scrubProgress = Math.min(1.0, window._scrubProgress + 1.0 / 30.0);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: maxScroll * window._scrubProgress, behavior: "instant" });
    if (typeof window.forceScrollytellingUpdate === "function")
        window.forceScrollytellingUpdate();
};

window.scrubPrev = function () {
    window._scrubProgress = Math.max(0.0, window._scrubProgress - 1.0 / 30.0);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: maxScroll * window._scrubProgress, behavior: "instant" });
    if (typeof window.forceScrollytellingUpdate === "function")
        window.forceScrollytellingUpdate();
};

window.scrubForward = window.scrubNext;
window.scrubBackward = window.scrubPrev;

function initApp() {
    renderStageSections();
    renderFloatingTOC();
    renderBottomTimeline();
    initGraphics();

    initScrollamaEngine(updateGraphics);

    const handleScroll = () => {
        if (typeof window.forceScrollytellingUpdate === "function")
            window.forceScrollytellingUpdate();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    if (typeof window.forceScrollytellingUpdate === "function")
        window.forceScrollytellingUpdate();
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initApp);
else
    initApp();
