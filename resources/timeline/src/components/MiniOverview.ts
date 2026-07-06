import m from "mithril";
import { flopsData } from "../data/processing-speed.js";
import { t } from "../i18n.js";

export const MiniOverview = () => {
    let hoverState: { active: boolean; x: number; y: number; clientX: number; year: number; boundW?: number } = { active: false, x: 0, y: 0, clientX: 0, year: 0 };
    let dataHoverState: { active: boolean; title: string; date: string; x: number; index: number } | null = null;
    let isDraggingSlider = false;
    let dragPercentage: number | null = null;
    let markersCache: Array<{
        index: number;
        id: string | number;
        xPos: number;
        yOffset: number;
        primaryTag: string;
        title: string;
        date: string;
        preciseYear: number;
    }> = [];
    let lastData: any = null;

    const getPreciseYear = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split("-");
        const year = parseInt(parts[0], 10);
        const month = parts.length > 1 ? parseInt(parts[1], 10) : 1;
        return year + (month - 1) / 12;
    };

    const startYear = 1900;
    const endYear = 2026;
    const totalYears = endYear - startYear;

    // Helper: format FLOPS values
    const formatFlops = (logVal: number) => {
        const val = Math.pow(10, logVal);
        if (val >= 1e18) return `${(val / 1e18).toFixed(1)} EFLOPS`;
        if (val >= 1e15) return `${(val / 1e15).toFixed(1)} PFLOPS`;
        if (val >= 1e12) return `${(val / 1e12).toFixed(1)} TFLOPS`;
        if (val >= 1e9) return `${(val / 1e9).toFixed(1)} GFLOPS`;
        if (val >= 1e6) return `${(val / 1e6).toFixed(1)} MFLOPS`;
        if (val >= 1e3) return `${(val / 1e3).toFixed(1)} KFLOPS`;
        return `${val.toFixed(1)} FLOPS`;
    };

    const minLog = -3;
    const maxLog = 18;
    const logRange = maxLog - minLog;

    const getX = (year: number) => ((year - startYear) / totalYears) * 100;
    const getY = (logVal: number) => 100 - ((logVal - minLog) / logRange) * 100;

    const processedFlops = flopsData.map((p) => {
        const py = getPreciseYear(p.date) || 1900;
        const logVal = Math.log10(p.flops);
        return {
            name: p.name,
            type: p.type,
            preciseYear: py,
            logVal: logVal,
            x: getX(py),
            y: getY(logVal),
        };
    });

    const cpuPoints = processedFlops.filter((p) => p.type === "cpu");
    const gpuPoints = processedFlops.filter((p) => p.type === "gpu");
    const tpuPoints = processedFlops.filter((p) => p.type === "tpu");

    const getMovingAverageLog = (targetYear: number, points: typeof processedFlops, windowYears = 8) => {
        const nearby = points.filter((p) => Math.abs(p.preciseYear - targetYear) <= windowYears);
        if (nearby.length === 0) {
            let closest = null;
            let minDist = Infinity;
            points.forEach((p) => {
                const dist = Math.abs(p.preciseYear - targetYear);
                if (dist < minDist) {
                    minDist = dist;
                    closest = p;
                }
            });
            return closest ? closest.logVal : null;
        }
        const sum = nearby.reduce((acc, p) => acc + p.logVal, 0);
        return sum / nearby.length;
    };

    const generateTrendPath = (start: number, end: number, points: typeof processedFlops) => {
        const pts = [];
        for (let y = start; y <= end; y++) {
            const avg = getMovingAverageLog(y, points);
            if (avg !== null) {
                pts.push(`${getX(y).toFixed(3)},${getY(avg).toFixed(3)}`);
            }
        }
        return pts.join(" ");
    };

    const cpuPath = generateTrendPath(1941, endYear, cpuPoints);
    const gpuPath = generateTrendPath(1995, endYear, gpuPoints);
    const tpuPath = generateTrendPath(2015, endYear, tpuPoints);

    const ticks = [1900, 1920, 1940, 1960, 1980, 2000, 2020, 2026];

    const decades = [];
    for (let y = 1900; y <= 2020; y += 10) decades.push(y);

    function updateMarkersCache(data: any) {
        markersCache = [];
        if (!data) return;
        data.forEach((item: any, index: number) => {
            const py = getPreciseYear(item.date);
            if (!py) return;
            const xPos = getX(py);
            const primaryTag = item.tags && item.tags.length > 0 ? item.tags[0] : "default";
            const yOffset = (index * 13) % 20;
            markersCache.push({
                index,
                id: item.id || index,
                xPos,
                yOffset,
                primaryTag,
                title: item.title,
                date: item.date,
                preciseYear: py,
            });
        });
    }

    return {
        oninit(vnode) {
            lastData = vnode.attrs.data;
            updateMarkersCache(vnode.attrs.data);
        },
        onbeforeupdate(vnode) {
            if (vnode.attrs.data !== lastData) {
                lastData = vnode.attrs.data;
                updateMarkersCache(vnode.attrs.data);
            }
        },
        view(vnode) {
            const { data, activeIndex, onJumpToIndex } = vnode.attrs;
            if (!data || data.length === 0) return null;

            // Compute actual active year from the active index item
            let activeYear = startYear;
            if (data[activeIndex] && data[activeIndex].date) {
                const match = data[activeIndex].date.match(/^(\d{4})/);
                if (match) activeYear = parseInt(match[1], 10);
            }

            const displayYear = hoverState.active ? hoverState.year : activeYear;
            const hoverCPU = getMovingAverageLog(displayYear, cpuPoints);
            const hoverGPU = displayYear >= 1995 ? getMovingAverageLog(displayYear, gpuPoints) : null;
            const hoverTPU = displayYear >= 2015 ? getMovingAverageLog(displayYear, tpuPoints) : null;

            // Find closest CPU point
            let closestCpu = null;
            let closestCpuDist = Infinity;
            cpuPoints.forEach((p) => {
                const dist = Math.abs(p.preciseYear - displayYear);
                if (dist < closestCpuDist) {
                    closestCpuDist = dist;
                    closestCpu = p;
                }
            });

            // Find closest GPU point
            let closestGpu = null;
            let closestGpuDist = Infinity;
            gpuPoints.forEach((p) => {
                const dist = Math.abs(p.preciseYear - displayYear);
                if (dist < closestGpuDist) {
                    closestGpuDist = dist;
                    closestGpu = p;
                }
            });

            // Find closest TPU point
            let closestTpu = null;
            let closestTpuDist = Infinity;
            tpuPoints.forEach((p) => {
                const dist = Math.abs(p.preciseYear - displayYear);
                if (dist < closestTpuDist) {
                    closestTpuDist = dist;
                    closestTpu = p;
                }
            });

            return m(
                "#mini-overview-container",
                {
                    onwheel: (e) => {
                        const delta = e.deltaY || e.deltaX;
                        const container = document.getElementById("document-container");
                        if (container) {
                            e.preventDefault();
                            container.scrollLeft += delta;
                        }
                    },
                },
                [
                    m(
                        ".interactive-area",
                        {
                            style: { display: "flex", flexDirection: "column", width: "100%", height: "100%", minHeight: "0", cursor: "crosshair", position: "relative" },

                            onmousemove: (e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const mouseX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                                const percentage = mouseX / rect.width;
                                const hoverYear = Math.round(startYear + percentage * totalYears);

                                hoverState = {
                                    active: true,
                                    x: e.clientX - rect.left,
                                    y: e.clientY - rect.top,
                                    year: Math.max(startYear, Math.min(endYear, hoverYear)),
                                    boundW: rect.width,
                                    clientX: e.clientX,
                                };

                                let closestDist = Infinity;
                                let closestItem = null;
                                let closestIndex = -1;
                                let closestXPos = 0;

                                const mouseY = e.clientY - rect.top;
                                const isInDataRow = mouseY >= rect.height - 30;

                                if (isInDataRow) {
                                    markersCache.forEach((marker) => {
                                        const pxPos = (marker.xPos / 100) * rect.width;
                                        const dist = Math.abs(pxPos - mouseX);
                                        if (dist < closestDist && dist < 20) {
                                            closestDist = dist;
                                            closestItem = marker;
                                            closestIndex = marker.index;
                                            closestXPos = marker.xPos;
                                        }
                                    });
                                }

                                if (closestItem) {
                                    dataHoverState = {
                                        active: true,
                                        title: closestItem.title,
                                        date: closestItem.date,
                                        x: closestXPos,
                                        index: closestIndex,
                                    };
                                } else {
                                    dataHoverState = null;
                                }
                            },
                            onmouseleave: () => {
                                hoverState.active = false;
                                dataHoverState = null;
                            },
                            onclick: (e) => {
                                if (dataHoverState && dataHoverState.active && dataHoverState.index !== undefined) onJumpToIndex(dataHoverState.index);
                            },
                        },
                        [
                            m(".computation-graph-row", [
                                m(
                                    "svg",
                                    {
                                        viewBox: "0 0 100 100",
                                        preserveAspectRatio: "none",
                                        class: "graph-svg",
                                    },
                                    [
                                        m("defs", [
                                            m("filter", { id: "glow", x: "-20%", y: "-20%", width: "140%", height: "140%" }, [
                                                m("feGaussianBlur", { stdDeviation: "0.8", result: "blur" }),
                                                m("feMerge", [
                                                    m("feMergeNode", { in: "blur" }),
                                                    m("feMergeNode", { in: "SourceGraphic" })
                                                ])
                                            ])
                                        ]),

                                        // Decade lines
                                        decades.map((decade) =>
                                            m("line.decade-line", {
                                                key: decade,
                                                x1: getX(decade),
                                                y1: 0,
                                                x2: getX(decade),
                                                y2: 100,
                                            })
                                        ),

                                        m("polyline.cpu-line", { points: cpuPath }),
                                        m("polyline.gpu-line", { points: gpuPath }),
                                        m("polyline.tpu-line", { points: tpuPath }),

                                        m("line.hover-guide", {
                                            x1: getX(displayYear),
                                            y1: 0,
                                            x2: getX(displayYear),
                                            y2: 100,
                                            style: {
                                                stroke: hoverState.active ? "rgba(56, 189, 248, 0.45)" : "rgba(255, 255, 255, 0.12)",
                                                strokeWidth: hoverState.active ? "1.5px" : "1px",
                                                strokeDasharray: hoverState.active ? "none" : "2 2"
                                            }
                                        }),
                                    ]
                                ),
                                // Individual data points rendered as HTML dots to avoid SVG stretching/oval distortion
                                processedFlops.map((p) =>
                                    m("div.flops-data-dot", {
                                        key: `${p.name}-${p.preciseYear}`,
                                        style: {
                                            left: `${p.x}%`,
                                            top: `${p.y}%`,
                                            backgroundColor: p.type === "cpu" ? "#00f0ff" : p.type === "gpu" ? "#39ff14" : "#ff00ff",
                                            boxShadow: p.type === "cpu" 
                                                ? "0 0 6px rgba(0, 240, 255, 0.4)" 
                                                : p.type === "gpu" 
                                                    ? "0 0 6px rgba(57, 255, 20, 0.4)" 
                                                    : "0 0 6px rgba(255, 0, 255, 0.4)"
                                        }
                                    })
                                ),
                                [
                                    hoverCPU !== null &&
                                        m("div.hover-point.cpu-point", {
                                            style: {
                                                left: `${getX(displayYear)}%`,
                                                top: `${getY(hoverCPU)}%`,
                                            },
                                        }),
                                    hoverGPU !== null &&
                                        m("div.hover-point.gpu-point", {
                                            style: {
                                                left: `${getX(displayYear)}%`,
                                                top: `${getY(hoverGPU)}%`,
                                            },
                                        }),
                                    hoverTPU !== null &&
                                        m("div.hover-point.tpu-point", {
                                            style: {
                                                left: `${getX(displayYear)}%`,
                                                top: `${getY(hoverTPU)}%`,
                                            },
                                        }),
                                ],
                                m(
                                    ".flops-hover-tooltip.glass-panel",
                                    {
                                        style: {
                                            left: `${getX(displayYear)}%`,
                                            transform: "translateX(-50%)",
                                        },
                                    },
                                    [
                                        m(".tooltip-header", `${t("year")} ${Math.round(displayYear)}`),
                                        hoverCPU !== null && m(".tooltip-row", [
                                            m("span.tooltip-dot.cpu-dot"),
                                            m("span.tooltip-label", t("cpu")),
                                            m("span.tooltip-val", `${formatFlops(hoverCPU)}${closestCpu && closestCpuDist <= 2.5 ? ` (${closestCpu.name})` : ""}` + (closestCpu && closestCpuDist <= 2.5 && closestCpu.mips ? ` / ${closestCpu.mips >= 1000 ? (closestCpu.mips / 1000).toFixed(1) + " GIPS" : closestCpu.mips.toFixed(2) + " MIPS"}` : ""))
                                        ]),
                                        hoverGPU !== null && m(".tooltip-row", [
                                            m("span.tooltip-dot.gpu-dot"),
                                            m("span.tooltip-label", t("gpu")),
                                            m("span.tooltip-val", `${formatFlops(hoverGPU)}${closestGpu && closestGpuDist <= 2.5 ? ` (${closestGpu.name})` : ""}`)
                                        ]),
                                        hoverTPU !== null && m(".tooltip-row", [
                                            m("span.tooltip-dot.tpu-dot"),
                                            m("span.tooltip-label", t("tpu")),
                                            m("span.tooltip-val", `${formatFlops(hoverTPU)}${closestTpu && closestTpuDist <= 2.5 ? ` (${closestTpu.name})` : ""}`)
                                        ]),
                                    ]
                                ),
                            ]),

                            m(
                                ".date-slider-row",
                                {
                                    onclick: (e) => {
                                        if (isDraggingSlider) return;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                        const targetYear = startYear + percentage * totalYears;
                                        let tIdx = data.findIndex((item) => {
                                            const m = item.date && item.date.match(/^(\d{4})/);
                                            return m && parseInt(m[1], 10) >= Math.round(targetYear);
                                        });
                                        if (tIdx === -1) tIdx = data.length - 1;
                                        onJumpToIndex(tIdx);
                                    },
                                },
                                [
                                    m(".date-slider-track"),
                                    ticks.map((yr) =>
                                        m(
                                            "span.tick-label",
                                            {
                                                key: yr,
                                                style: { left: `${((yr - startYear) / totalYears) * 100}%` },
                                            },
                                            yr.toString()
                                        )
                                    ),
                                    m(
                                        ".active-slider-pill",
                                        {
                                            style: {
                                                left: dragPercentage !== null ? `${dragPercentage * 100}%` : `${((activeYear - startYear) / totalYears) * 100}%`,
                                                cursor: isDraggingSlider ? "grabbing" : "grab",
                                                pointerEvents: "auto",
                                            },
                                            onpointerdown: (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                isDraggingSlider = true;
                                                e.target.setPointerCapture(e.pointerId);

                                                const row = document.querySelector(".date-slider-row");
                                                if (!row) return;
                                                const rect = row.getBoundingClientRect();

                                                let animationFrameId = null;

                                                const handlePointerMove = (moveEvent) => {
                                                    if (!isDraggingSlider) return;
                                                    const percentage = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                                                    dragPercentage = percentage;

                                                    if (animationFrameId !== null) return;

                                                    animationFrameId = requestAnimationFrame(() => {
                                                        animationFrameId = null;
                                                        const targetYear = startYear + dragPercentage * totalYears;
                                                        
                                                        // Binary search for closest index
                                                        let l = 0,
                                                            r = markersCache.length - 1;
                                                        let tIdx = data.length - 1;
                                                        while (l <= r) {
                                                            const mid = Math.floor((l + r) / 2);
                                                            if (markersCache[mid].preciseYear >= targetYear) {
                                                                tIdx = markersCache[mid].index;
                                                                r = mid - 1;
                                                            } else {
                                                                l = mid + 1;
                                                            }
                                                        }
                                                        
                                                        onJumpToIndex(tIdx, "auto");
                                                        m.redraw();
                                                    });
                                                };

                                                const handlePointerUp = (upEvent) => {
                                                    isDraggingSlider = false;
                                                    dragPercentage = null;
                                                    if (animationFrameId !== null) {
                                                        cancelAnimationFrame(animationFrameId);
                                                        animationFrameId = null;
                                                    }
                                                    upEvent.target.releasePointerCapture(upEvent.pointerId);
                                                    upEvent.target.removeEventListener("pointermove", handlePointerMove);
                                                    upEvent.target.removeEventListener("pointerup", handlePointerUp);
                                                    upEvent.target.removeEventListener("pointercancel", handlePointerUp);
                                                    m.redraw();
                                                };

                                                e.target.addEventListener("pointermove", handlePointerMove);
                                                e.target.addEventListener("pointerup", handlePointerUp);
                                                e.target.addEventListener("pointercancel", handlePointerUp);
                                            },
                                        },
                                        (dragPercentage !== null ? Math.round(startYear + dragPercentage * totalYears) : activeYear).toString()
                                    ),
                                ]
                            ),

                            m(".data-marker-row", [
                                markersCache.map((marker) => {
                                    const isHovered = dataHoverState && dataHoverState.index === marker.index;
                                    const isActive = marker.index === activeIndex;
                                    const hoverClass = isHovered ? " marker-hovered" : "";
                                    const activeClass = isActive ? " marker-active" : "";

                                    return m(`.data-marker.marker-${marker.primaryTag}${hoverClass}${activeClass}`, {
                                        key: marker.id,
                                        style: {
                                            left: `${marker.xPos}%`,
                                            top: `${marker.yOffset}px`,
                                        },
                                        onmouseenter: (e) => {
                                            e.stopPropagation();
                                            dataHoverState = {
                                                active: true,
                                                title: marker.title,
                                                date: marker.date,
                                                x: marker.xPos,
                                                index: marker.index,
                                            };
                                        },
                                        onmouseleave: () => {
                                            // Container onmousemove handles clearing naturally, but keeping for precision
                                        },
                                        onclick: (e) => {
                                            e.stopPropagation();
                                            onJumpToIndex(marker.index);
                                        },
                                    });
                                }),

                                dataHoverState &&
                                    dataHoverState.active &&
                                    m(
                                        ".data-hover-tooltip.glass-panel",
                                        {
                                            style: {
                                                left: `${dataHoverState.x}%`,
                                                transform: "translateX(-50%)",
                                            },
                                        },
                                        [m(".tooltip-header", dataHoverState.date), m(".tooltip-title", dataHoverState.title)]
                                    ),
                            ]),
                        ]
                    ),
                ]
            );
        },
    };
};
