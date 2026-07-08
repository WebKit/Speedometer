import { STAGES } from "./content.js";

const IMAGE_SOURCES = {
    topo1: "public/topo_map_1.webp",
    topo2: "public/topo_map_2.webp",
    topo3: "public/topo_map_3.webp",
    grid: "public/planning_paper_dot_grid.webp",
    texture: "public/bw_watercolor_texture.webp",
    stroke1: "public/watercolor_stroke_1.webp",
    stroke2: "public/watercolor_stroke_2.webp",
    stroke3: "public/watercolor_stroke_3.webp",
};

const imageCache = {};

function getOrLoadImage(key) {
    if (typeof Image === "undefined") return null;
    if (!imageCache[key] && IMAGE_SOURCES[key]) {
        const img = new Image();
        img.src = IMAGE_SOURCES[key];
        imageCache[key] = img;
    }
    return imageCache[key] || null;
}

function drawImageIfLoaded(ctx, img, x, y, w, h, alpha = 0.35, composite = "overlay") {
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = composite;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
    }
}

let stageGraphics = [];

export function initGraphics() {
    stageGraphics = [];

    for (const key of Object.keys(IMAGE_SOURCES)) {
        getOrLoadImage(key);
    }

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

            buildSVGContentForStage(g, i);
            svg.appendChild(g);
        }

        if (caption && STAGES[i]) {
            caption.textContent = `Stage ${i + 1}: ${STAGES[i].title}`;
        }

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

function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, String(v));
    }
    return el;
}

function buildSVGContentForStage(g, stageIndex) {
    const ns = "http://www.w3.org/2000/svg";
    const path = createSVGElement("path", {
        fill: "none",
        stroke: "#ffffff",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: "dynamic-path",
    });

    if (stageIndex === 0) {
        path.setAttribute("d", "M 300 400 L 300 300 L 400 220 L 500 300 L 500 400 Z M 360 400 L 360 330 L 440 330 L 440 400 Z M 150 400 L 200 260 L 250 400 Z M 550 400 L 600 280 L 650 400 Z");
    } else if (stageIndex === 1) {
        path.setAttribute("d", "M 100 420 Q 250 400 400 420 T 700 410 M 120 470 Q 280 440 420 460 T 680 450 M 140 520 Q 300 490 450 510 T 660 500 M 300 420 L 300 320 L 500 320 L 500 420 Z");
    } else if (stageIndex === 2) {
        path.setAttribute("d", "M 260 420 L 260 240 L 400 140 L 540 240 L 540 420 Z M 260 330 L 540 330 M 350 420 L 350 240 M 450 420 L 450 240 M 260 240 L 540 240 M 400 140 L 400 420 M 600 420 L 600 200 L 640 200 L 640 420 Z");
    } else if (stageIndex === 3) {
        path.setAttribute("d", "M 150 420 L 150 280 L 300 180 L 450 280 L 450 420 Z M 500 420 L 500 320 L 700 320 L 700 420 Z M 100 450 L 700 450 M 100 480 L 700 480 M 100 510 L 700 510 M 100 450 L 150 510 M 300 450 L 350 510 M 500 450 L 550 510");
    } else if (stageIndex >= 4) {
        path.setAttribute("d", "M 100 420 L 700 420 M 150 420 L 150 200 M 650 420 L 650 200");
        path.setAttribute("stroke-dasharray", "8, 4");
    }

    g.appendChild(path);

    for (let j = 0; j < 5; j++) {
        const circle = createSVGElement("circle", {
            cx: 200 + j * 100,
            cy: 150 + (j % 2) * 50,
            r: 4,
            fill: "#ffffff",
            class: "dynamic-node",
        });
        g.appendChild(circle);
    }

    if (stageIndex >= 4) {
        buildTechnicalSVG(g, stageIndex);
    }
}

function addSVGCallout(g, x, y, targetX, targetY, text, subtext = "", id = "") {
    const group = createSVGElement("g", { class: "tech-callout" });
    if (id) group.setAttribute("id", id);

    const leader = createSVGElement("polyline", {
        points: `${targetX},${targetY} ${x + (targetX > x ? 20 : -20)},${y} ${x},${y}`,
        fill: "none",
        stroke: "rgba(255, 255, 255, 0.85)",
        "stroke-width": "1.5",
        "stroke-dasharray": "4, 2",
    });
    group.appendChild(leader);

    const targetDot = createSVGElement("circle", {
        cx: targetX,
        cy: targetY,
        r: 3.5,
        fill: "#ffffff",
        stroke: "#000000",
        "stroke-width": "1",
    });
    group.appendChild(targetDot);

    const labelBg = createSVGElement("rect", {
        x: x - (targetX > x ? 0 : 180),
        y: y - 22,
        width: 180,
        height: subtext ? 32 : 22,
        fill: "rgba(0, 0, 0, 0.85)",
        stroke: "rgba(255, 255, 255, 0.6)",
        "stroke-width": "1",
        rx: "2",
    });
    group.appendChild(labelBg);

    const textEl = createSVGElement("text", {
        x: x - (targetX > x ? -8 : 172),
        y: y - 8,
        fill: "#ffffff",
        "font-family": '"Courier New", Courier, monospace',
        "font-size": "11",
        "font-weight": "bold",
        "letter-spacing": "0.05em",
    });
    textEl.textContent = text;
    group.appendChild(textEl);

    if (subtext) {
        const subEl = createSVGElement("text", {
            x: x - (targetX > x ? -8 : 172),
            y: y + 5,
            fill: "rgba(255, 255, 255, 0.7)",
            "font-family": '"Courier New", Courier, monospace',
            "font-size": "9",
        });
        subEl.textContent = subtext;
        group.appendChild(subEl);
    }

    g.appendChild(group);
    return group;
}

function addSVGStressArrow(g, x1, y1, x2, y2, label, id = "") {
    const group = createSVGElement("g", { class: "tech-arrow" });
    if (id) group.setAttribute("id", id);
    group.setAttribute("data-base-x1", String(x1));
    group.setAttribute("data-base-y1", String(y1));
    group.setAttribute("data-base-x2", String(x2));
    group.setAttribute("data-base-y2", String(y2));

    const line = createSVGElement("line", {
        x1, y1, x2, y2,
        stroke: "#ffffff",
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
        fill: "#ffffff",
        class: "tech-arrow-head",
    });
    group.appendChild(head);

    const tx = (x1 + x2) / 2 + 10;
    const ty = (y1 + y2) / 2;
    const textEl = createSVGElement("text", {
        x: tx,
        y: ty,
        fill: "#ffffff",
        "font-family": '"Courier New", Courier, monospace',
        "font-size": "10",
        "font-weight": "bold",
        class: "tech-arrow-label",
    });
    textEl.textContent = label;
    group.appendChild(textEl);

    g.appendChild(group);
    return group;
}

function addSVGTitleBlock(g, project, dwgNo, rev, scale) {
    const box = createSVGElement("g", { class: "tech-title-block" });

    const frame = createSVGElement("rect", {
        x: 480, y: 510, width: 300, height: 70,
        fill: "rgba(0, 0, 0, 0.9)",
        stroke: "#ffffff",
        "stroke-width": "2",
    });
    box.appendChild(frame);

    const div1 = createSVGElement("line", { x1: 480, y1: 535, x2: 780, y2: 535, stroke: "#ffffff", "stroke-width": "1.5" });
    const div2 = createSVGElement("line", { x1: 480, y1: 558, x2: 780, y2: 558, stroke: "#ffffff", "stroke-width": "1" });
    const div3 = createSVGElement("line", { x1: 640, y1: 535, x2: 640, y2: 580, stroke: "#ffffff", "stroke-width": "1" });
    box.append(div1, div2, div3);

    const tProj = createSVGElement("text", { x: 490, y: 528, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "11", "font-weight": "bold" });
    tProj.textContent = `PROJ: ${project}`;

    const tDwg = createSVGElement("text", { x: 490, y: 550, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "10" });
    tDwg.textContent = `DWG: ${dwgNo}`;

    const tRev = createSVGElement("text", { x: 650, y: 550, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "10" });
    tRev.textContent = `REV: ${rev}`;

    const tScale = createSVGElement("text", { x: 490, y: 572, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "9" });
    tScale.textContent = `SCALE: ${scale}`;

    const tDate = createSVGElement("text", { x: 650, y: 572, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "9" });
    tDate.textContent = "STUDIO: SAARINEN/MIES";

    box.append(tProj, tDwg, tRev, tScale, tDate);

    const revTri = createSVGElement("polygon", {
        points: "765,520 775,520 770,511",
        fill: "none",
        stroke: "#ffffff",
        "stroke-width": "1.5",
    });
    box.appendChild(revTri);

    g.appendChild(box);
}

function buildTechnicalSVG(g, stageIndex) {
    if (stageIndex === 4) {
        addSVGTitleBlock(g, "HISTORIC HOMESTEAD SURVEY", "EX-101", "1950-COND", "SCALE: 1/4 IN. = 1 FT.");

        const imgTopo = createSVGElement("image", {
            href: IMAGE_SOURCES.topo1,
            x: 20, y: 20, width: 760, height: 560,
            opacity: "0.35",
            preserveAspectRatio: "none",
            style: "mix-blend-mode: overlay;",
        });
        const imgStroke = createSVGElement("image", {
            href: IMAGE_SOURCES.stroke1,
            x: 150, y: 100, width: 500, height: 350,
            opacity: "0.4",
            preserveAspectRatio: "xMidYMid slice",
            style: "mix-blend-mode: screen;",
        });
        g.append(imgTopo, imgStroke);

        addSVGStressArrow(g, 260, 100, 260, 190, "DEAD LOAD: 45 LBS/SQ FT", "tech-arrow-5-1");
        addSVGStressArrow(g, 360, 80, 360, 210, "SNOW ACCUMULATION LOAD", "tech-arrow-5-2");
        addSVGStressArrow(g, 480, 100, 480, 190, "ROOF DEFLECTION LOAD", "tech-arrow-5-3");

        addSVGCallout(g, 480, 430, 300, 400, "SEVERE MORTAR LEACHING", "REF. SEC 4 / LIME EROSION", "tech-callout-5-1");
        addSVGCallout(g, 520, 160, 350, 210, "ROOF RAFTER DEFLECTION", "MAX SAG 8.5'' (STRUCTURAL FAILURE)", "tech-deflection-label");
        addSVGCallout(g, 180, 350, 240, 330, "BOTANICAL RECLAMATION", "VITIS RIPARIA / VIRGINIA CREEPER", "tech-callout-5-3");
        addSVGCallout(g, 500, 350, 420, 410, "COMPROMISED TIMBER SILLS", "ROT & GROUNDWATER INUNDATION", "tech-callout-5-4");

        const badge = createSVGElement("g", { class: "tech-stamp-badge" });
        const bRect = createSVGElement("rect", { x: 40, y: 40, width: 220, height: 36, fill: "rgba(0,0,0,0.85)", stroke: "#ffffff", "stroke-width": "2", "stroke-dasharray": "6,3" });
        const bText = createSVGElement("text", { x: 50, y: 63, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "11", "font-weight": "bold" });
        bText.textContent = "UNSAFE STRUCTURE // CONDEMNED";
        badge.append(bRect, bText);
        g.appendChild(badge);
    } else if (stageIndex === 5) {
        addSVGTitleBlock(g, "STRUCTURAL CONSERVATION", "ST-201", "MAY 1980", "SCALE: 3/16 IN. = 1 FT.");

        const imgGrid = createSVGElement("image", {
            href: IMAGE_SOURCES.grid,
            x: 10, y: 10, width: 780, height: 580,
            opacity: "0.35",
            preserveAspectRatio: "none",
            style: "mix-blend-mode: overlay;",
        });
        const imgTopo = createSVGElement("image", {
            href: IMAGE_SOURCES.topo2,
            x: 50, y: 50, width: 700, height: 500,
            opacity: "0.35",
            preserveAspectRatio: "xMidYMid meet",
            style: "mix-blend-mode: overlay;",
        });
        g.append(imgGrid, imgTopo);

        addSVGStressArrow(g, 300, 530, 300, 430, "HYDRAULIC LIFT: 12 TONS", "tech-lift-1");
        addSVGStressArrow(g, 500, 530, 500, 430, "LOAD TRANSFER TO BEDROCK", "tech-lift-2");

        addSVGCallout(g, 500, 240, 380, 300, "STEEL I-BEAM W12x50 LINTEL", "ASTM A36 STRUCTURAL STEEL", "tech-callout-6-1");
        addSVGCallout(g, 540, 310, 460, 260, "C-CHANNEL REINFORCEMENT GRID", "HIDDEN LOAD-BEARING TRANSFER", "tech-callout-6-2");
        addSVGCallout(g, 520, 380, 580, 420, "LASER TRANSIT REALIGNMENT", "DATUM ELEV. 0'-0'' (REF A-4)", "tech-callout-6-3");
        addSVGCallout(g, 180, 460, 270, 420, "EPOXY RESIN SILL SPLICE", "DETAIL 3/A-102 / RECLAIMED OAK", "tech-callout-6-4");

        const datum1 = createSVGElement("g", { class: "tech-datum", transform: "translate(150, 420)" });
        const d1Circ = createSVGElement("circle", { r: 14, fill: "none", stroke: "#ffffff", "stroke-width": "2" });
        const d1Line = createSVGElement("line", { x1: -14, y1: 0, x2: 14, y2: 0, stroke: "#ffffff", "stroke-width": "1.5" });
        const d1T1 = createSVGElement("text", { x: -4, y: -4, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "9", "font-weight": "bold" });
        d1T1.textContent = "A";
        const d1T2 = createSVGElement("text", { x: -8, y: 10, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "8" });
        d1T2.textContent = "101";
        datum1.append(d1Circ, d1Line, d1T1, d1T2);

        const datum2 = createSVGElement("g", { class: "tech-datum", transform: "translate(650, 420)" });
        const d2Circ = createSVGElement("circle", { r: 14, fill: "none", stroke: "#ffffff", "stroke-width": "2" });
        const d2Line = createSVGElement("line", { x1: -14, y1: 0, x2: 14, y2: 0, stroke: "#ffffff", "stroke-width": "1.5" });
        const d2T1 = createSVGElement("text", { x: -4, y: -4, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "9", "font-weight": "bold" });
        d2T1.textContent = "B";
        const d2T2 = createSVGElement("text", { x: -8, y: 10, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "8" });
        d2T2.textContent = "102";
        datum2.append(d2Circ, d2Line, d2T1, d2T2);

        g.append(datum1, datum2);
    } else if (stageIndex === 6) {
        addSVGTitleBlock(g, "NET-ZERO RETROFIT", "ME-301", "R-45 / NET-0", "SCALE: 3/16 IN. = 1 FT.");

        const imgTopo = createSVGElement("image", {
            href: IMAGE_SOURCES.topo3,
            x: 0, y: 350, width: 800, height: 250,
            opacity: "0.45",
            preserveAspectRatio: "none",
            style: "mix-blend-mode: overlay;",
        });
        const imgStroke = createSVGElement("image", {
            href: IMAGE_SOURCES.stroke2,
            x: 200, y: 150, width: 400, height: 250,
            opacity: "0.3",
            preserveAspectRatio: "xMidYMid meet",
            style: "mix-blend-mode: screen;",
        });
        g.append(imgTopo, imgStroke);

        addSVGCallout(g, 500, 130, 330, 160, "CLOSED-CELL VAPOR BARRIER R-45", "THERMAL ENVELOPE / AIRTIGHT SEAL", "tech-callout-7-1");
        addSVGCallout(g, 520, 270, 480, 280, "TRIPLE-PANE LOW-E ARGON GLAZING", "U-FACTOR 0.12 / NO COLD BRIDGES", "tech-callout-7-2");
        addSVGCallout(g, 500, 480, 560, 500, "400'-0'' GEOTHERMAL BORE IN BEDROCK", "CLOSED-LOOP RADIATIVE HEAT EXCHANGE", "tech-callout-7-3");
        addSVGCallout(g, 180, 360, 400, 400, "RADIATIVE FLOOR HEATING MANIFOLD", "HYDRONIC THERMAL DISTRIBUTION", "tech-callout-7-4");
        addSVGCallout(g, 180, 160, 280, 140, "SOLAR PV ROOF ARRAY", "NET ENERGY -15% (POSITIVE GENERATION)", "tech-callout-7-5");

        const flow1 = createSVGElement("path", {
            d: "M 340 320 C 340 270 460 270 460 320",
            fill: "none",
            stroke: "#ffffff",
            "stroke-width": "1.5",
            "stroke-dasharray": "6, 4",
            class: "tech-flow-arrow",
        });
        const flow2 = createSVGElement("path", {
            d: "M 460 340 C 460 380 340 380 340 340",
            fill: "none",
            stroke: "#ffffff",
            "stroke-width": "1.5",
            "stroke-dasharray": "6, 4",
            class: "tech-flow-arrow",
        });
        g.append(flow1, flow2);

        const elevTag = createSVGElement("g", { class: "tech-elev-tag", transform: "translate(80, 400)" });
        const eLine = createSVGElement("line", { x1: 0, y1: 0, x2: 80, y2: 0, stroke: "#ffffff", "stroke-width": "1.5" });
        const eTri = createSVGElement("polygon", { points: "40,0 35,-10 45,-10", fill: "#ffffff" });
        const eText = createSVGElement("text", { x: 0, y: -14, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "10", "font-weight": "bold" });
        eText.textContent = "GRADE ELEV. +420'-0''";
        elevTag.append(eLine, eTri, eText);
        g.appendChild(elevTag);
    } else if (stageIndex === 7) {
        addSVGTitleBlock(g, "MODERNIST SYNTHESIS", "A-500", "PRESENT", "SCALE: 1/8 IN. = 1 FT.");

        const imgGrid = createSVGElement("image", {
            href: IMAGE_SOURCES.grid,
            x: 10, y: 10, width: 780, height: 580,
            opacity: "0.3",
            preserveAspectRatio: "none",
            style: "mix-blend-mode: overlay;",
        });
        const imgTexture = createSVGElement("image", {
            href: IMAGE_SOURCES.texture,
            x: 100, y: 350, width: 600, height: 220,
            opacity: "0.35",
            preserveAspectRatio: "none",
            style: "mix-blend-mode: overlay;",
        });
        const imgStroke = createSVGElement("image", {
            href: IMAGE_SOURCES.stroke3,
            x: 400, y: 120, width: 350, height: 240,
            opacity: "0.35",
            preserveAspectRatio: "xMidYMid meet",
            style: "mix-blend-mode: screen;",
        });
        g.append(imgGrid, imgTexture, imgStroke);

        const dimGroup = createSVGElement("g", { class: "tech-cantilever-dim", id: "tech-cantilever-dim" });
        const dimLine = createSVGElement("line", { x1: 380, y1: 110, x2: 720, y2: 110, stroke: "#ffffff", "stroke-width": "1.5" });
        const tickL = createSVGElement("line", { x1: 375, y1: 115, x2: 385, y2: 105, stroke: "#ffffff", "stroke-width": "2" });
        const tickR = createSVGElement("line", { x1: 715, y1: 115, x2: 725, y2: 105, stroke: "#ffffff", "stroke-width": "2", class: "dim-tick-right" });
        const dimText = createSVGElement("text", { x: 550, y: 102, fill: "#ffffff", "font-family": '"Courier New", monospace', "font-size": "11", "font-weight": "bold", "text-anchor": "middle", class: "dim-text-label" });
        dimText.textContent = "24'-0'' CANTILEVER SPAN";
        dimGroup.append(dimLine, tickL, tickR, dimText);
        g.appendChild(dimGroup);

        addSVGStressArrow(g, 380, 360, 380, 260, "SUPPORT REACTION: 45 KIPS", "tech-reaction-arrow");
        addSVGStressArrow(g, 720, 140, 720, 230, "LIVE LOAD: 100 LBS/SQ FT", "tech-tip-load");

        const momentCurve = createSVGElement("path", {
            d: "M 380 160 Q 550 100 720 160",
            fill: "none",
            stroke: "rgba(255, 255, 255, 0.6)",
            "stroke-width": "1.5",
            "stroke-dasharray": "5, 5",
            id: "tech-moment-curve",
        });
        g.appendChild(momentCurve);

        addSVGCallout(g, 520, 70, 550, 160, "CANTILEVERED BLACK STEEL I-BEAM", "W18x86 / STRUCTURAL TENSION FLANGE", "tech-beam-callout");
        addSVGCallout(g, 520, 340, 600, 240, "FRAMELESS STRUCTURAL GLASS WALL", "CURTAIN WALL / MINIMALIST PROFILE", "tech-glass-callout");
        addSVGCallout(g, 160, 180, 200, 260, "RESTORED 1780 FIELDSTONE HEARTH", "TACTILE HISTORIC MASONRY MONUMENT", "tech-hearth-callout");
        addSVGCallout(g, 180, 360, 380, 320, "FIN. FLOOR ELEV. +424'-6'' DATUM", "HIGH-CONTRAST JUNCTION", "tech-floor-callout");
        addSVGCallout(g, 500, 480, 520, 440, "CURATED RIPARIAN WETLAND", "NATIVE MEADOW GRASSES & ECOLOGY", "tech-meadow-callout");
    }
}

export function updateGraphics(stageIndex, progress = 0) {
    const idx = Math.max(0, Math.min(STAGES.length - 1, stageIndex));
    const prog = Math.max(0, Math.min(1, progress));

    for (let i = 0; i < stageGraphics.length; i++) {
        const item = stageGraphics[i];
        if (!item || !item.g || !item.ctx || !item.canvas) continue;

        const stageProg = (i === idx) ? prog : (i < idx ? 1.0 : 0.0);

        if (i === idx || item.lastProg !== stageProg) {
            const scale = 0.98 + stageProg * 0.04;
            item.g.setAttribute("transform", `scale(${scale.toFixed(4)})`);

            const path = item.g.querySelector(".dynamic-path");
            if (path) {
                const dashOffset = Math.round((1 - stageProg) * 1000);
                path.setAttribute("stroke-dashoffset", String(dashOffset));
                if (!path.getAttribute("stroke-dasharray") || path.getAttribute("stroke-dasharray") === "8, 4") {
                    path.setAttribute("stroke-dasharray", "1000");
                }
            }

            const nodes = item.g.querySelectorAll(".dynamic-node");
            nodes.forEach((node, nIdx) => {
                const cyBase = 150 + (nIdx % 2) * 50;
                const offset = Math.sin(stageProg * Math.PI * 2 + nIdx) * 15;
                node.setAttribute("cy", (cyBase + offset).toFixed(2));
                node.setAttribute("r", (3 + stageProg * 3).toFixed(2));
            });

            if (i >= 4) {
                updateTechnicalStageSVG(item.g, i, stageProg);
            }

            item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
            drawProceduralCanvas(item.ctx, i, stageProg, item.canvas.width, item.canvas.height);

            item.lastProg = stageProg;
        }
    }
}

function updateTechnicalStageSVG(g, stageIndex, prog) {
    if (stageIndex === 4) {
        const defLabel = g.querySelector(".tech-deflection-label text");
        if (defLabel) {
            const sag = (2.0 + prog * 6.5).toFixed(1);
            defLabel.textContent = `ROOF RAFTER DEFLECTION`;
        }
        const defSub = g.querySelector(".tech-deflection-label text:last-of-type");
        if (defSub) {
            const sag = (2.0 + prog * 6.5).toFixed(1);
            defSub.textContent = `MAX SAG ${sag}'' (STRUCTURAL FAILURE)`;
        }

        const arrow3 = g.querySelector("#tech-arrow-5-3 line");
        const head3 = g.querySelector("#tech-arrow-5-3 polygon");
        if (arrow3 && head3) {
            const newY2 = 180 + prog * 25;
            arrow3.setAttribute("y2", String(newY2));
            const hx1 = 480 - 12 * Math.cos(-Math.PI / 6);
            const hy1 = newY2 - 12 * Math.sin(-Math.PI / 6);
            const hx2 = 480 - 12 * Math.cos(Math.PI / 6);
            const hy2 = newY2 - 12 * Math.sin(Math.PI / 6);
            head3.setAttribute("points", `480,${newY2} ${hx1},${hy1} ${hx2},${hy2}`);
        }
    } else if (stageIndex === 5) {
        const lift1 = g.querySelector("#tech-lift-1 line");
        const lift2 = g.querySelector("#tech-lift-2 line");
        if (lift1 && lift2) {
            const offset = Math.sin(prog * Math.PI * 4) * 5;
            lift1.setAttribute("y2", String(430 + offset));
            lift2.setAttribute("y2", String(430 + offset));
        }
    } else if (stageIndex === 6) {
        const flows = g.querySelectorAll(".tech-flow-arrow");
        flows.forEach((flow, idx) => {
            const dashOffset = Math.round((idx === 0 ? -1 : 1) * prog * 100);
            flow.setAttribute("stroke-dashoffset", String(dashOffset));
        });
    } else if (stageIndex === 7) {
        const tipX = 380 + 340 * prog;
        const dimLine = g.querySelector("#tech-cantilever-dim line:first-of-type");
        const tickR = g.querySelector(".dim-tick-right");
        const dimText = g.querySelector(".dim-text-label");
        if (dimLine && tickR && dimText) {
            dimLine.setAttribute("x2", String(tipX));
            tickR.setAttribute("x1", String(tipX - 5));
            tickR.setAttribute("y1", "115");
            tickR.setAttribute("x2", String(tipX + 5));
            tickR.setAttribute("y2", "105");
            dimText.setAttribute("x", String((380 + tipX) / 2));
            const spanFt = (24 * prog).toFixed(1);
            dimText.textContent = `${spanFt}'-0'' CANTILEVER SPAN`;
        }

        const tipLoadLine = g.querySelector("#tech-tip-load line");
        const tipLoadHead = g.querySelector("#tech-tip-load polygon");
        const tipLoadText = g.querySelector("#tech-tip-load text");
        if (tipLoadLine && tipLoadHead && tipLoadText) {
            tipLoadLine.setAttribute("x1", String(tipX));
            tipLoadLine.setAttribute("x2", String(tipX));
            const hx1 = tipX - 12 * Math.cos(-Math.PI / 6);
            const hy1 = 230 - 12 * Math.sin(-Math.PI / 6);
            const hx2 = tipX - 12 * Math.cos(Math.PI / 6);
            const hy2 = 230 - 12 * Math.sin(Math.PI / 6);
            tipLoadHead.setAttribute("points", `${tipX},230 ${hx1},${hy1} ${hx2},${hy2}`);
            tipLoadText.setAttribute("x", String(tipX + 10));
        }

        const momentCurve = g.querySelector("#tech-moment-curve");
        if (momentCurve) {
            const midX = (380 + tipX) / 2;
            const midY = 160 - 50 * prog;
            momentCurve.setAttribute("d", `M 380 160 Q ${midX} ${midY} ${tipX} 160`);
        }

        const beamLeader = g.querySelector("#tech-beam-callout polyline");
        const beamDot = g.querySelector("#tech-beam-callout circle");
        if (beamLeader && beamDot) {
            const targetX = Math.min(tipX - 20, 550);
            beamDot.setAttribute("cx", String(targetX));
            beamLeader.setAttribute("points", `${targetX},160 500,70 520,70`);
        }
    }
}

function drawSketchLine(ctx, x1, y1, x2, y2, overshoot = 4, passes = 1) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    ctx.beginPath();
    ctx.moveTo(x1 - ux * overshoot, y1 - uy * overshoot);
    ctx.lineTo(x2 + ux * overshoot, y2 + uy * overshoot);
    ctx.stroke();

    if (passes > 1) {
        ctx.save();
        ctx.globalAlpha *= 0.5;
        ctx.beginPath();
        ctx.moveTo(x1 - ux * overshoot + 0.5, y1 - uy * overshoot + 0.5);
        ctx.lineTo(x2 + ux * overshoot + 0.5, y2 + uy * overshoot + 0.5);
        ctx.stroke();
        ctx.restore();
    }
}

function drawSketchRect(ctx, x, y, w, h, overshoot = 4) {
    drawSketchLine(ctx, x, y, x + w, y, overshoot);
    drawSketchLine(ctx, x + w, y, x + w, y + h, overshoot);
    drawSketchLine(ctx, x + w, y + h, x, y + h, overshoot);
    drawSketchLine(ctx, x, y + h, x, y, overshoot);
}

function drawBlueprintGrid(ctx, width, height, prog, stageIndex) {
    ctx.save();
    ctx.lineWidth = 1;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.setLineDash([2, 4]);
    for (let x = 20; x < width - 20; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, height - 20); ctx.stroke();
    }
    for (let y = 20; y < height - 20; y += 20) {
        ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(width - 20, y); ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.setLineDash([]);
    for (let x = 100; x < width - 20; x += 100) {
        ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, height - 20); ctx.stroke();
    }
    for (let y = 100; y < height - 20; y += 100) {
        ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(width - 20, y); ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    const crosses = [
        [60, 60], [width - 60, 60],
        [60, height - 60], [width - 60, height - 60],
        [width / 2, 60], [width / 2, height - 60]
    ];
    ctx.lineWidth = 1.5;
    for (const [cx, cy] of crosses) {
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy);
        ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10);
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
    const spacing = 12;
    for (let d = -h; d < w + h; d += spacing) {
        if (weathered && Math.sin(d) > 0.3) continue;
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

    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    for (let d = -h; d < w + h; d += 16) {
        ctx.beginPath();
        ctx.moveTo(x + d, y);
        ctx.lineTo(x + d - h, y + h);
        ctx.moveTo(x + d + 3, y);
        ctx.lineTo(x + d + 3 - h, y + h);
        ctx.stroke();
    }
    ctx.restore();
}

function drawInsulationHatch(ctx, x, y, w, h, prog) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 1.5;
    const loopW = 12;
    const loops = Math.ceil(w / loopW);
    const midY = y + h / 2;
    const amp = (h / 2 - 2) * (0.9 + prog * 0.1);

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

function drawEarthHatch(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    for (let d = -h; d < w + h; d += 20) {
        ctx.beginPath();
        ctx.moveTo(x + d, y);
        ctx.lineTo(x + d - h, y + h);
        ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    for (let ty = y + 15; ty < y + h; ty += 25) {
        for (let tx = x + 10; tx < x + w; tx += 40) {
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + 12, ty);
            ctx.stroke();
        }
    }
    ctx.restore();
}
