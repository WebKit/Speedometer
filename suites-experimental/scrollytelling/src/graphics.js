import { STAGES } from "./content.js";

let stageGraphics = [];

export function initGraphics() {
    stageGraphics = [];

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

function buildSVGContentForStage(g, stageIndex) {
    const ns = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(ns, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#ffffff");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("class", "dynamic-path");

    if (stageIndex === 0) {
        path.setAttribute("d", "M 300 400 L 300 300 L 400 220 L 500 300 L 500 400 Z M 360 400 L 360 330 L 440 330 L 440 400 Z M 150 400 L 200 260 L 250 400 Z M 550 400 L 600 280 L 650 400 Z");
    } else if (stageIndex === 1) {
        path.setAttribute("d", "M 100 420 Q 250 400 400 420 T 700 410 M 120 470 Q 280 440 420 460 T 680 450 M 140 520 Q 300 490 450 510 T 660 500 M 300 420 L 300 320 L 500 320 L 500 420 Z");
    } else if (stageIndex === 2) {
        path.setAttribute("d", "M 260 420 L 260 240 L 400 140 L 540 240 L 540 420 Z M 260 330 L 540 330 M 350 420 L 350 240 M 450 420 L 450 240 M 260 240 L 540 240 M 400 140 L 400 420 M 600 420 L 600 200 L 640 200 L 640 420 Z");
    } else if (stageIndex === 3) {
        path.setAttribute("d", "M 150 420 L 150 280 L 300 180 L 450 280 L 450 420 Z M 500 420 L 500 320 L 700 320 L 700 420 Z M 100 450 L 700 450 M 100 480 L 700 480 M 100 510 L 700 510 M 100 450 L 150 510 M 300 450 L 350 510 M 500 450 L 550 510");
    } else if (stageIndex === 4) {
        path.setAttribute("d", "M 150 420 L 160 300 Q 300 240 440 300 L 450 420 Z M 200 300 L 180 420 M 380 300 L 400 420 M 250 420 C 240 350 270 320 280 260 M 350 420 C 360 360 330 310 320 250");
    } else if (stageIndex === 5) {
        path.setAttribute("d", "M 150 420 L 150 200 L 550 200 L 550 420 Z M 150 310 L 550 310 M 350 200 L 350 420 M 100 200 L 600 200 M 100 420 L 600 420 M 150 150 L 150 470 M 550 150 L 550 470");
        path.setAttribute("stroke-dasharray", "8, 4");
    } else if (stageIndex === 6) {
        path.setAttribute("d", "M 200 400 L 200 220 L 400 120 L 600 220 L 600 400 Z M 220 380 L 220 235 L 400 145 L 580 235 L 580 380 Z M 320 400 L 320 550 C 320 580 360 580 360 550 L 360 400 M 440 400 L 440 550 C 440 580 480 580 480 550 L 480 400");
    } else {
        path.setAttribute("d", "M 180 420 L 180 250 L 450 250 L 450 420 Z M 350 320 L 680 320 L 680 180 L 350 180 Z M 350 320 L 350 420 M 500 180 L 500 320 M 600 180 L 600 320 M 100 420 L 700 420");
        path.setAttribute("stroke-width", "3");
    }

    g.appendChild(path);

    for (let j = 0; j < 5; j++) {
        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute("cx", String(200 + j * 100));
        circle.setAttribute("cy", String(150 + (j % 2) * 50));
        circle.setAttribute("r", "4");
        circle.setAttribute("fill", "#ffffff");
        circle.setAttribute("class", "dynamic-node");
        g.appendChild(circle);
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

            item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
            drawProceduralCanvas(item.ctx, i, stageProg, item.canvas.width, item.canvas.height);

            item.lastProg = stageProg;
        }
    }
}

function drawProceduralCanvas(ctx, stageIndex, prog, width, height) {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    const gridSize = 40;
    const offset = (prog * 20) % gridSize;
    for (let x = offset; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = offset; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    if (stageIndex === 0) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 20, 50 + prog * 70, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();

        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2 + prog * 2;
            const dist = 70 + prog * 90 + (i % 5) * 10;
            const px = width / 2 + Math.cos(angle) * dist;
            const py = height / 2 - 20 + Math.sin(angle) * dist;
            ctx.fillRect(px - 2, py - 2, 4, 4);
        }

        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(30, height - 30);
        ctx.lineTo(width - 30, height - 30);
        ctx.stroke();

        const treeCount = 6;
        for (let i = 0; i < treeCount; i++) {
            const x = 70 + i * 110;
            const threshold = i / treeCount;
            if (prog > threshold) {
                ctx.strokeRect(x - 20, height - 45, 60, 15);
                ctx.beginPath();
                ctx.moveTo(x + 10, height - 45);
                ctx.lineTo(x + 15, height - 30);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(x, height - 30);
                ctx.lineTo(x - 25, height - 90);
                ctx.lineTo(x + 25, height - 90);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, height - 80);
                ctx.lineTo(x - 20, height - 130);
                ctx.lineTo(x + 20, height - 130);
                ctx.closePath();
                ctx.stroke();
            }
        }
    } else if (stageIndex === 1) {
        ctx.beginPath();
        for (let y = 380; y < height - 30; y += 20) {
            const shift = Math.sin(y * 0.05 + prog * 5) * 12;
            ctx.moveTo(80 + shift, y);
            ctx.lineTo(720 + shift, y);
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        const arrows = [200, 400, 600];
        arrows.forEach((ax, aIdx) => {
            const ay = 100 + prog * 150 + aIdx * 20;
            ctx.beginPath();
            ctx.moveTo(ax, 60);
            ctx.lineTo(ax, ay);
            ctx.lineTo(ax - 10, ay - 15);
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax + 10, ay - 15);
            ctx.stroke();
        });
    } else if (stageIndex === 2) {
        drawGear(ctx, width / 2 - 120, height / 2 - 50, 65, 12, prog * Math.PI * 2);
        drawGear(ctx, width / 2 + 10, height / 2 - 20, 75, 14, -prog * Math.PI * 2 + 0.2);
        drawGear(ctx, width / 2 - 40, height / 2 + 100, 55, 10, prog * Math.PI * 2 - 0.5);

        ctx.lineWidth = 3;
        ctx.strokeRect(520, 80, 180 * prog, 40);
    } else if (stageIndex === 3) {
        const cols = 8;
        const rows = 4;
        const cellW = (width - 160) / cols;
        const cellH = 160 / rows;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = 80 + c * cellW;
                const y = 380 + r * cellH;
                ctx.strokeRect(x, y, cellW - 6, cellH - 6);
                const cellThreshold = (r * cols + c) / (rows * cols);
                if (prog > cellThreshold) ctx.fillRect(x + 4, y + 4, cellW - 14, cellH - 14);
            }
        }

        for (let r = 0; r < 5; r++) {
            const yPos = 180 + r * 30;
            ctx.beginPath();
            ctx.moveTo(100, yPos);
            ctx.lineTo(700, yPos);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
            ctx.stroke();

            const xPos = 100 + ((prog * 600 + r * 100) % 600);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(xPos, yPos - 4, 16, 8);
        }
    } else if (stageIndex === 4) {
        ctx.strokeRect(100, 60, width - 200, 240);
        ctx.beginPath();
        for (let x = 120; x < width - 120; x += 40) {
            ctx.moveTo(x, 60);
            ctx.lineTo(x + Math.sin(x) * 15, 300);
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        const maxVines = 6;
        for (let v = 0; v < maxVines; v++) {
            const startY = 350 + v * 35;
            const endX = 80 + prog * (width - 160);
            ctx.beginPath();
            ctx.moveTo(80, startY);
            ctx.bezierCurveTo(80 + endX * 0.3, startY - 40, 80 + endX * 0.6, startY + 50, 80 + endX, startY);
            ctx.lineWidth = 3;
            ctx.stroke();
            if (prog > 0.35) {
                ctx.beginPath();
                ctx.arc(80 + endX * 0.5, startY + 5, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (stageIndex === 5) {
        ctx.lineWidth = 1;
        for (let x = 40; x < width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 40; y < height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        const targetX = 150 + prog * (width - 300);
        const targetY = height / 2;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(targetX - 65, targetY);
        ctx.lineTo(targetX + 65, targetY);
        ctx.moveTo(targetX, targetY - 65);
        ctx.lineTo(targetX, targetY + 65);
        ctx.stroke();

        ctx.strokeRect(targetX + 55, targetY - 35, 160, 35);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px monospace";
        ctx.fillText("DATUM REALIGN", targetX + 65, targetY - 12);
    } else if (stageIndex === 6) {
        const loopCount = 4;
        const loopSpacing = (width - 200) / loopCount;
        for (let l = 0; l < loopCount; l++) {
            const lx = 100 + l * loopSpacing;
            const depth = 80 + prog * 380;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(lx, 40);
            ctx.lineTo(lx, depth);
            ctx.arc(lx + 25, depth, 25, Math.PI, 0, true);
            ctx.lineTo(lx + 50, 40);
            ctx.stroke();

            const py = 50 + ((prog * 300 + l * 60) % 350);
            ctx.fillRect(lx - 4, py, 8, 16);
            ctx.fillRect(lx + 46, 420 - py, 8, 16);
        }
    } else {
        for (let i = 0; i < 80; i++) {
            const sx = 150 + ((i * 43) % 500);
            const sy = 380 + ((i * 29) % 180);
            const size = (i % 3) + 1;
            ctx.fillRect(sx, sy, size, size);
        }

        ctx.lineWidth = 3;
        ctx.strokeRect(80, 220, 320, 100);
        const cantileverW = 220 + prog * 340;
        ctx.strokeRect(200, 120, cantileverW, 100);

        for (let gx = 240; gx < 200 + cantileverW; gx += 50) {
            ctx.beginPath();
            ctx.moveTo(gx, 120);
            ctx.lineTo(gx, 220);
            ctx.stroke();
        }

        if (prog > 0.45) {
            const figX = 190 + cantileverW - 40;
            ctx.beginPath();
            ctx.arc(figX, 95, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(figX, 101);
            ctx.lineTo(figX, 118);
            ctx.moveTo(figX - 10, 107);
            ctx.lineTo(figX + 10, 107);
            ctx.stroke();
        }
    }

    ctx.restore();
}

function drawGear(ctx, x, y, radius, teeth, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
    for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2;
        const x1 = Math.cos(angle) * (radius - 8);
        const y1 = Math.sin(angle) * (radius - 8);
        const x2 = Math.cos(angle) * radius;
        const y2 = Math.sin(angle) * radius;
        const x3 = Math.cos(nextAngle) * radius;
        const y3 = Math.sin(nextAngle) * radius;
        const x4 = Math.cos(nextAngle) * (radius - 8);
        const y4 = Math.sin(nextAngle) * (radius - 8);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
    }
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
