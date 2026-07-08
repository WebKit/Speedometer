import m from "mithril";
import { flopsData } from "../data/processing-speed.js";
import { t } from "../i18n.js";
import { TAGS, calculateDensityCurve, getDensityAtYear } from "../data/tags.js";

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
        if (!dateStr)
            return null;
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
        if (val >= 1e18)
            return `${(val / 1e18).toFixed(1)} EFLOPS`;
        if (val >= 1e15)
            return `${(val / 1e15).toFixed(1)} PFLOPS`;
        if (val >= 1e12)
            return `${(val / 1e12).toFixed(1)} TFLOPS`;
        if (val >= 1e9)
            return `${(val / 1e9).toFixed(1)} GFLOPS`;
        if (val >= 1e6)
            return `${(val / 1e6).toFixed(1)} MFLOPS`;
        if (val >= 1e3)
            return `${(val / 1e3).toFixed(1)} KFLOPS`;
        return `${val.toFixed(1)} FLOPS`;
    };

    const minLog = -4;
    const maxLog = 19;
    const logRange = maxLog - minLog;

    const getX = (year: number) => ((year - startYear) / totalYears) * 100;
    const getY = (logVal: number) => 100 - ((logVal - minLog) / logRange) * 100;

    const getCatBounds = (type: string, defaultMin: number, defaultMax: number) => {
        const items = flopsData.filter((p) => p.type === type);
        if (items.length === 0)
            return { min: defaultMin, max: defaultMax };
        let min = Infinity;
        let max = -Infinity;
        items.forEach((p) => {
            const logVal = Math.log10(p.flops);
            if (logVal < min)
                min = logVal;
            if (logVal > max)
                max = logVal;
        });
        return { min: min === Infinity ? defaultMin : min, max: max === -Infinity ? defaultMax : max };
    };

    const cpuBounds = getCatBounds("cpu", 0, 18.5);
    const gpuBounds = getCatBounds("gpu", 6, 14.5);
    const tpuBounds = getCatBounds("tpu", 13.5, 15.0);

    const getYForType = (logVal: number, type?: string) => {
        if (!type)
            return getY(logVal);
        const bottomY = 94;
        let topY = 8;
        let bounds = cpuBounds;
        if (type === "tpu") {
            topY = 16;
            bounds = tpuBounds;
        } else if (type === "gpu") {
            topY = 24;
            bounds = gpuBounds;
        }
        const range = bounds.max - bounds.min || 1;
        const normalized = Math.max(0, Math.min(1, (logVal - bounds.min) / range));
        return bottomY - normalized * (bottomY - topY);
    };

    const processedFlops = flopsData.map((p) => {
        const py = getPreciseYear(p.date) || 1900;
        const logVal = Math.log10(p.flops);
        return {
            name: p.name,
            type: p.type,
            preciseYear: py,
            logVal: logVal,
            x: getX(py),
            y: getYForType(logVal, p.type),
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

    const getStartYear = (points: typeof processedFlops, fallback: number) => {
        if (points.length === 0)
            return fallback;
        return Math.floor(points[0].preciseYear);
    };

    const cpuStartYear = getStartYear(cpuPoints, 1941);
    const gpuStartYear = getStartYear(gpuPoints, 1982);
    const tpuStartYear = getStartYear(tpuPoints, 2015);

    const getTrendPoints = (start: number, end: number, points: typeof processedFlops, type: string) => {
        const map = new Map<number, number>();
        for (let y = start; y <= end; y++) {
            const avg = getMovingAverageLog(y, points);
            if (avg !== null)
                map.set(y, getYForType(avg, type));
        }
        return map;
    };

    const cpuMap = getTrendPoints(cpuStartYear, endYear, cpuPoints, "cpu");
    const gpuMap = getTrendPoints(gpuStartYear, endYear, gpuPoints, "gpu");
    const tpuMap = getTrendPoints(tpuStartYear, endYear, tpuPoints, "tpu");

    const mapToPath = (map: Map<number, number>) => {
        const pts: string[] = [];
        map.forEach((val, yr) => {
            pts.push(`${getX(yr).toFixed(3)},${val.toFixed(3)}`);
        });
        return pts.join(" ");
    };

    const cpuPath = mapToPath(cpuMap);
    const gpuPath = mapToPath(gpuMap);
    const tpuPath = mapToPath(tpuMap);

    const ticks = [1900, 1920, 1940, 1960, 1980, 2000, 2020, 2026];

    const decades = [];
    for (let y = 1900; y <= 2020; y += 10)
        decades.push(y);

    function updateMarkersCache(data: any) {
        markersCache = [];
        if (!data)
            return;
        data.forEach((item: any, index: number) => {
            const py = getPreciseYear(item.date);
            if (!py)
                return;
            const xPos = getX(py);
            const primaryTag = item.tags && item.tags.length > 0 ? item.tags[0] : "default";
            const yOffset = ((index * 17) % 44) + 8;
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
            const { data, activeIndex, onJumpToIndex, searchQuery, matchingCards, allData } = vnode.attrs;
            if (!data || data.length === 0)
                return null;
            const sourceData = allData || data;

            // Compute actual active year from the active index item
            let activeYear = startYear;
            if (data[activeIndex] && data[activeIndex].date) {
                const match = data[activeIndex].date.match(/^(\d{4})/);
                if (match)
                    activeYear = parseInt(match[1], 10);
            }

            const displayYear = hoverState.active ? hoverState.year : activeYear;
            const hoverCPU = displayYear >= cpuStartYear ? getMovingAverageLog(displayYear, cpuPoints) : null;
            const hoverGPU = displayYear >= gpuStartYear ? getMovingAverageLog(displayYear, gpuPoints) : null;
            const hoverTPU = displayYear >= tpuStartYear ? getMovingAverageLog(displayYear, tpuPoints) : null;

            // 1. On-the-fly search matching cards density curve
            let searchDensity: { path: string; areaPath: string; maxVal: number } | null = null;
            if (searchQuery && typeof searchQuery === "string" && searchQuery.trim().length > 0 && matchingCards && matchingCards.length > 0)
                searchDensity = calculateDensityCurve(matchingCards, { startYear, endYear, windowYears: 6, maxHeight: 85 });

            // 2. Find closest marker across entire chart (responsive hover detection)
            let closestMarker: any = null;
            let closestMarkerDist = Infinity;
            markersCache.forEach((marker) => {
                const dist = Math.abs(marker.preciseYear - displayYear);
                if (dist < closestMarkerDist) {
                    closestMarkerDist = dist;
                    closestMarker = marker;
                }
            });

            // 3. On-the-fly category hover density curves
            let hoveredTags: string[] = [];
            if (dataHoverState && dataHoverState.active && dataHoverState.index !== undefined && sourceData[dataHoverState.index])
                hoveredTags = sourceData[dataHoverState.index].tags || [];
            else if (hoverState.active && closestMarker)
                hoveredTags = sourceData[closestMarker.index]?.tags || [closestMarker.primaryTag];

            const hoverDensities = hoveredTags
                .map((category) => {
                    const categoryCards = sourceData.filter((c: any) => c && c.tags && c.tags.includes(category));
                    const density = calculateDensityCurve(categoryCards, { startYear, endYear, windowYears: 6, maxHeight: 85 });
                    const tagInfo = (TAGS as any)[category] || (TAGS as any).default;
                    const color = tagInfo ? tagInfo.color : "#38bdf8";
                    const label = tagInfo && tagInfo.label ? tagInfo.label[vnode.attrs.language || "DE"] || tagInfo.label.DE || category : category;
                    return { category, density, color, label };
                })
                .filter((item) => item.density && item.density.maxVal > 0);

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

            let targetY: number | null = null;
            let targetType: "cpu" | "gpu" | "tpu" = "cpu";
            let targetColor = "#00f0ff";

            const pointsAtYear = [
                hoverCPU !== null ? { y: getYForType(hoverCPU, "cpu"), type: "cpu" as const, color: "#00f0ff" } : null,
                hoverGPU !== null ? { y: getYForType(hoverGPU, "gpu"), type: "gpu" as const, color: "#39ff14" } : null,
                hoverTPU !== null ? { y: getYForType(hoverTPU, "tpu"), type: "tpu" as const, color: "#ff00ff" } : null,
            ].filter(Boolean) as Array<{ y: number; type: "cpu" | "gpu" | "tpu"; color: string }>;

            if (pointsAtYear.length > 0) {
                if (hoverState.active && hoverState.boundW) {
                    const mouseYPct = (hoverState.y / 150) * 100;
                    let minDist = Infinity;
                    pointsAtYear.forEach((pt) => {
                        const dist = Math.abs(pt.y - mouseYPct);
                        if (dist < minDist) {
                            minDist = dist;
                            targetY = pt.y;
                            targetType = pt.type;
                            targetColor = pt.color;
                        }
                    });
                } else {
                    const pt = pointsAtYear[0];
                    targetY = pt.y;
                    targetType = pt.type;
                    targetColor = pt.color;
                }
            }

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
                                if (dataHoverState && dataHoverState.active && dataHoverState.index !== undefined)
                                    onJumpToIndex(dataHoverState.index);
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
                                                m("feMerge", [m("feMergeNode", { in: "blur" }), m("feMergeNode", { in: "SourceGraphic" })]),
                                            ]),
                                            m("marker#arrow-cpu", { viewBox: "0 0 10 10", refX: "5", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse" }, [m("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#00f0ff" })]),
                                            m("marker#arrow-gpu", { viewBox: "0 0 10 10", refX: "5", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse" }, [m("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#39ff14" })]),
                                            m("marker#arrow-tpu", { viewBox: "0 0 10 10", refX: "5", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse" }, [m("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#ff00ff" })]),
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

                                        // Moving average smooth window highlight band on hover
                                        hoverState.active
                                            && m("rect.hover-window-band", {
                                                x: `${getX(Math.max(startYear, displayYear - 6))}%`,
                                                y: 0,
                                                width: `${Math.max(0.5, getX(Math.min(endYear, displayYear + 6)) - getX(Math.max(startYear, displayYear - 6)))}%`,
                                                height: "100%",
                                            }),

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
                                                strokeDasharray: hoverState.active ? "none" : "2 2",
                                            },
                                        }),

                                        targetY !== null
                                            && m("line.tooltip-connector", {
                                                x1: getX(displayYear),
                                                y1: -8,
                                                x2: getX(displayYear),
                                                y2: targetY,
                                                style: {
                                                    stroke: targetColor,
                                                    strokeWidth: "1.5px",
                                                    strokeDasharray: "3 3",
                                                    markerEnd: `url(#arrow-${targetType})`,
                                                    filter: "url(#glow)",
                                                    transition: "all 0.15s ease",
                                                },
                                            }),
                                    ]
                                ),
                                m(
                                    ".flops-dots-container",
                                    {
                                        style: {
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            pointerEvents: "none",
                                            zIndex: 15,
                                        },
                                    },
                                    processedFlops.map((p) =>
                                        m("div.flops-data-dot", {
                                            key: `${p.name}-${p.preciseYear}`,
                                            style: {
                                                left: `${p.x}%`,
                                                top: `${p.y}%`,
                                                backgroundColor: p.type === "cpu" ? "#00f0ff" : p.type === "gpu" ? "#39ff14" : "#ff00ff",
                                                boxShadow: p.type === "cpu" ? "0 0 6px rgba(0, 240, 255, 0.4)" : p.type === "gpu" ? "0 0 6px rgba(57, 255, 20, 0.4)" : "0 0 6px rgba(255, 0, 255, 0.4)",
                                            },
                                        })
                                    )
                                ),
                                [
                                    hoverCPU !== null
                                        && m("div.hover-point.cpu-point", {
                                            style: {
                                                left: `${getX(displayYear)}%`,
                                                top: `${getYForType(hoverCPU, "cpu")}%`,
                                            },
                                        }),
                                    hoverGPU !== null
                                        && m("div.hover-point.gpu-point", {
                                            style: {
                                                left: `${getX(displayYear)}%`,
                                                top: `${getYForType(hoverGPU, "gpu")}%`,
                                            },
                                        }),
                                    hoverTPU !== null
                                        && m("div.hover-point.tpu-point", {
                                            style: {
                                                left: `${getX(displayYear)}%`,
                                                top: `${getYForType(hoverTPU, "tpu")}%`,
                                            },
                                        }),
                                ],
                                m(
                                    ".flops-hover-tooltip.glass-panel",
                                    {
                                        style: {
                                            left: getX(displayYear) > 85 ? "auto" : `${getX(displayYear)}%`,
                                            right: getX(displayYear) > 85 ? "0%" : "auto",
                                            transform: getX(displayYear) > 85 ? "none" : "translateX(-50%)",
                                        },
                                    },
                                    [
                                        m(".tooltip-header", `${t("year")} ${Math.round(displayYear)}`),
                                        hoverCPU !== null
                                            && m(".tooltip-row", [
                                                m("span.tooltip-dot.cpu-dot"),
                                                m("span.tooltip-label", t("cpu")),
                                                m(
                                                    "span.tooltip-val",
                                                    `${formatFlops(hoverCPU)}${closestCpu && closestCpuDist <= 2.5 ? ` (${closestCpu.name})` : ""}${
                                                        closestCpu && closestCpuDist <= 2.5 && closestCpu.mips ? ` / ${closestCpu.mips >= 1000 ? `${(closestCpu.mips / 1000).toFixed(1) } GIPS` : `${closestCpu.mips.toFixed(2) } MIPS`}` : ""}`
                                                ),
                                            ]),
                                        hoverGPU !== null
                                            && m(".tooltip-row", [m("span.tooltip-dot.gpu-dot"), m("span.tooltip-label", t("gpu")), m("span.tooltip-val", `${formatFlops(hoverGPU)}${closestGpu && closestGpuDist <= 2.5 ? ` (${closestGpu.name})` : ""}`)]),
                                        hoverTPU !== null
                                            && m(".tooltip-row", [m("span.tooltip-dot.tpu-dot"), m("span.tooltip-label", t("tpu")), m("span.tooltip-val", `${formatFlops(hoverTPU)}${closestTpu && closestTpuDist <= 2.5 ? ` (${closestTpu.name})` : ""}`)]),
                                    ]
                                ),
                            ]),

                            m(
                                ".date-slider-row",
                                {
                                    onclick: (e) => {
                                        if (isDraggingSlider)
                                            return;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                        const targetYear = startYear + percentage * totalYears;
                                        let tIdx = data.findIndex((item) => {
                                            const m = item.date && item.date.match(/^(\d{4})/);
                                            return m && parseInt(m[1], 10) >= Math.round(targetYear);
                                        });
                                        if (tIdx === -1)
                                            tIdx = data.length - 1;
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
                                                transition: isDraggingSlider ? "none" : "",
                                            },
                                            onpointerdown: (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                isDraggingSlider = true;
                                                const container = document.getElementById("document-container");
                                                if (container)
                                                    container.style.scrollBehavior = "auto";
                                                e.target.setPointerCapture(e.pointerId);

                                                const row = document.querySelector(".date-slider-row");
                                                if (!row)
                                                    return;
                                                const rect = row.getBoundingClientRect();

                                                let animationFrameId = null;

                                                const handlePointerMove = (moveEvent) => {
                                                    if (!isDraggingSlider)
                                                        return;
                                                    const percentage = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                                                    dragPercentage = percentage;

                                                    if (animationFrameId !== null)
                                                        return;

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
                                                    const container = document.getElementById("document-container");
                                                    if (container)
                                                        container.style.scrollBehavior = "";
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
                                m(
                                    "svg",
                                    {
                                        viewBox: "0 0 100 100",
                                        preserveAspectRatio: "none",
                                        class: "density-graph-svg",
                                        style: {
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            pointerEvents: "none",
                                            zIndex: 8,
                                            overflow: "visible",
                                        },
                                    },
                                    [
                                        searchDensity && searchDensity.maxVal > 0
                                            ? [
                                                m("path.search-density-area", {
                                                    d: searchDensity.areaPath,
                                                    style: { fill: "#fbbf24", opacity: 0.45, transition: "all 0.3s ease" },
                                                }),
                                                m("path.search-density-line", {
                                                    d: searchDensity.path,
                                                    style: { stroke: "#fcd34d", strokeWidth: "3.5px", strokeDasharray: "4 4", fill: "none", filter: "url(#glow)", opacity: 1.0, transition: "all 0.3s ease" },
                                                }),
                                            ]
                                            : null,
                                        hoverDensities.map((hd) => [
                                            m("path.hover-density-area", {
                                                key: `area-${hd.category}`,
                                                d: hd.density.areaPath,
                                                style: { fill: hd.color, opacity: 0.45, transition: "all 0.3s ease" },
                                            }),
                                            m("path.hover-density-line", {
                                                key: `line-${hd.category}`,
                                                d: hd.density.path,
                                                style: { stroke: hd.color, strokeWidth: "3.5px", strokeDasharray: "4 4", fill: "none", filter: "url(#glow)", opacity: 1.0, transition: "all 0.3s ease" },
                                            }),
                                        ]),
                                    ]
                                ),

                                m(
                                    ".data-markers-container",
                                    {
                                        style: {
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            pointerEvents: "none",
                                        },
                                    },
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
                                                pointerEvents: "auto",
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
                                    })
                                ),

                                dataHoverState
                                    && dataHoverState.active
                                    && m(
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
