import m from "mithril";

export const MiniOverview = () => {
    let hoverState = { active: false, x: 0, y: 0, clientX: 0, year: 0 };
    let dataHoverState = null;
    let containerRect = { width: 1, left: 0 };
    let isDraggingSlider = false;

    const getPreciseYear = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parts.length > 1 ? parseInt(parts[1], 10) : 1;
        return year + (month - 1) / 12;
    };

    const startYear = 1900;
    const endYear = 2026;
    const totalYears = endYear - startYear;

    // Helper: format FLOPS values
    const formatFlops = (logVal) => {
        const val = Math.pow(10, logVal);
        if (val >= 1e18) return `${(val / 1e18).toFixed(1)} EFLOPS`;
        if (val >= 1e15) return `${(val / 1e15).toFixed(1)} PFLOPS`;
        if (val >= 1e12) return `${(val / 1e12).toFixed(1)} TFLOPS`;
        if (val >= 1e9) return `${(val / 1e9).toFixed(1)} GFLOPS`;
        if (val >= 1e6) return `${(val / 1e6).toFixed(1)} MFLOPS`;
        if (val >= 1e3) return `${(val / 1e3).toFixed(1)} KFLOPS`;
        return `${val.toFixed(1)} FLOPS`;
    };

    const calcFlops = (year) => {
        const cpu = year >= 1938 ? (year - 1938) * 0.15 : null;
        const gpu = year >= 1995 ? 7 + (year - 1999) * 0.28 : null;
        const tpu = year >= 2015 ? 13 + (year - 2015) * 0.36 : null;
        return { cpu, gpu, tpu };
    };

    const minLog = -3;
    const maxLog = 18;
    const logRange = maxLog - minLog;

    const getX = (year) => ((year - startYear) / totalYears) * 100;
    const getY = (logVal) => 100 - (((logVal - minLog) / logRange) * 100);

    const generatePath = (start, end, getLogFlops) => {
        const points = [];
        for (let y = start; y <= end; y++) {
            points.push(`${getX(y).toFixed(3)},${getY(getLogFlops(y)).toFixed(3)}`);
        }
        return points.join(" ");
    };

    const getFlopPoints = (start, end, getLogFlops) => {
        const pts = [];
        for (let y = start; y <= end; y++) {
            pts.push({ x: getX(y), y: getY(getLogFlops(y)) });
        }
        return pts;
    };

    const cpuPath = generatePath(1938, endYear, y => (y - 1938) * 0.15);
    const gpuPath = generatePath(1995, endYear, y => 7 + (y - 1999) * 0.28);
    const tpuPath = generatePath(2015, endYear, y => 13 + (y - 2015) * 0.36);

    const cpuPts = getFlopPoints(1938, endYear, y => (y - 1938) * 0.15);
    const gpuPts = getFlopPoints(1995, endYear, y => 7 + (y - 1999) * 0.28);
    const tpuPts = getFlopPoints(2015, endYear, y => 13 + (y - 2015) * 0.36);

    const ticks = [1900, 1920, 1940, 1960, 1980, 2000, 2020, 2026];
    const centuries = [1900, 2000];

    const decades = [];
    for (let y = 1900; y <= 2020; y += 10) decades.push(y);

    return {
        view(vnode) {
            const { data, activeIndex, onJumpToIndex } = vnode.attrs;
            if (!data || data.length === 0) return null;

            // Compute actual active year from the active index item
            let activeYear = startYear;
            if (data[activeIndex] && data[activeIndex].date) {
                const match = data[activeIndex].date.match(/^(\d{4})/);
                if (match) activeYear = parseInt(match[1], 10);
            }

            const { cpu: hoverCPU, gpu: hoverGPU, tpu: hoverTPU } = calcFlops(hoverState.year);

            // Compute Tooltip bounds
            const screenWidth = window.innerWidth;
            let tooltipTransform = "translateX(-50%)";
            if (hoverState.clientX < 120) tooltipTransform = "translateX(-10%)";
            else if (hoverState.clientX > screenWidth - 120) tooltipTransform = "translateX(-90%)";

            return m("#mini-overview-container", {
                onwheel: (e) => {
                    const delta = e.deltaY || e.deltaX;
                    const container = document.getElementById("document-container");
                    if (container) {
                        e.preventDefault();
                        container.scrollLeft += delta;
                    }
                }
            }, [
                m(".interactive-area", {
                    style: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', cursor: 'crosshair', position: 'relative' },
                    oncreate: (vnode) => {
                        containerRect = vnode.dom.getBoundingClientRect();
                        window.addEventListener('resize', () => {
                            containerRect = vnode.dom.getBoundingClientRect();
                        });
                    },
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
                            clientX: e.clientX
                        };
                        
                        let closestDist = Infinity;
                        let closestItem = null;
                        let closestIndex = -1;
                        let closestXPos = 0;
                        
                        data.forEach((item, index) => {
                            const py = getPreciseYear(item.date);
                            if (!py) return;
                            const xPos = getX(py);
                            const pxPos = (xPos / 100) * rect.width;
                            const dist = Math.abs(pxPos - mouseX);
                            if (dist < closestDist && dist < 100) {
                                closestDist = dist;
                                closestItem = item;
                                closestIndex = index;
                                closestXPos = xPos;
                            }
                        });
                        
                        if (closestItem) {
                            dataHoverState = {
                                active: true,
                                title: closestItem.title,
                                date: closestItem.date,
                                x: closestXPos,
                                index: closestIndex
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
                        if (dataHoverState && dataHoverState.active && dataHoverState.index !== undefined) {
                            onJumpToIndex(dataHoverState.index);
                        }
                    }
                }, [
                    m(".computation-graph-row", [
                        m("svg", {
                            viewBox: "0 0 100 100",
                            preserveAspectRatio: "none",
                            class: "graph-svg"
                        }, [
                            // Century lines
                            centuries.map(century => m("line.century-line", {
                                key: `c${century}`,
                                x1: getX(century), y1: 0,
                                x2: getX(century), y2: 100
                            })),

                            // Decade lines
                            decades.map(decade => m("line.decade-line", {
                                key: decade,
                                x1: getX(decade), y1: 0,
                                x2: getX(decade), y2: 100
                            })),

                            // Filters for visually stunning glow
                            m("defs", [
                                m("filter#glow", { x: "-20%", y: "-20%", width: "140%", height: "140%" }, [
                                    m("feGaussianBlur", { stdDeviation: "1.5", result: "blur" }),
                                    m("feComposite", { in: "SourceGraphic", in2: "blur", operator: "over" })
                                ])
                            ]),
                            m("polyline.cpu-line", { points: cpuPath }),
                            m("polyline.gpu-line", { points: gpuPath }),
                            m("polyline.tpu-line", { points: tpuPath }),
                            
                            cpuPts.map(pt => m("circle.graph-point.cpu-graph-point", { cx: pt.x, cy: pt.y, r: 0.5, key: `cpu${pt.x}` })),
                            gpuPts.map(pt => m("circle.graph-point.gpu-graph-point", { cx: pt.x, cy: pt.y, r: 0.5, key: `gpu${pt.x}` })),
                            tpuPts.map(pt => m("circle.graph-point.tpu-graph-point", { cx: pt.x, cy: pt.y, r: 0.5, key: `tpu${pt.x}` })),

                            hoverState.active && [
                                m("line.hover-guide", {
                                    x1: getX(hoverState.year), y1: 0,
                                    x2: getX(hoverState.year), y2: 100
                                }),
                                hoverCPU !== null && m("circle.hover-point.cpu-point", {
                                    cx: getX(hoverState.year), cy: getY(hoverCPU)
                                }),
                                hoverGPU !== null && m("circle.hover-point.gpu-point", {
                                    cx: getX(hoverState.year), cy: getY(hoverGPU)
                                }),
                                hoverTPU !== null && m("circle.hover-point.tpu-point", {
                                    cx: getX(hoverState.year), cy: getY(hoverTPU)
                                })
                            ]
                        ]),
                        hoverState.active && (() => {
                            let tx = hoverState.x;
                            const wHalf = 85;
                            if (tx < wHalf) tx = wHalf;
                            if (hoverState.boundW && tx > hoverState.boundW - wHalf) tx = hoverState.boundW - wHalf;

                            return m(".flops-hover-tooltip.glass-panel", {
                                style: {
                                    left: `${tx}px`,
                                    transform: "translateX(-50%)"
                                }
                            }, [
                                m(".tooltip-header", `Jahr ${hoverState.year}`),
                                hoverCPU !== null && m(".tooltip-row", [m("span.tooltip-dot.cpu-dot"), m("span.tooltip-label", "CPU:"), m("span.tooltip-val", formatFlops(hoverCPU))]),
                                hoverGPU !== null && m(".tooltip-row", [m("span.tooltip-dot.gpu-dot"), m("span.tooltip-label", "GPU:"), m("span.tooltip-val", formatFlops(hoverGPU))]),
                                hoverTPU !== null && m(".tooltip-row", [m("span.tooltip-dot.tpu-dot"), m("span.tooltip-label", "TPU:"), m("span.tooltip-val", formatFlops(hoverTPU))])
                            ]);
                        })()
                    ]),

                    m(".date-slider-row", {
                        onclick: (e) => {
                            if (isDraggingSlider) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            const targetYear = startYear + percentage * totalYears;
                            let tIdx = data.findIndex(item => {
                                const m = item.date && item.date.match(/^(\d{4})/);
                                return m && parseInt(m[1], 10) >= Math.round(targetYear);
                            });
                            if (tIdx === -1) tIdx = data.length - 1;
                            onJumpToIndex(tIdx);
                        }
                    }, [
                        m(".date-slider-track"),
                        ticks.map(yr => m("span.tick-label", {
                            key: yr,
                            style: { left: `${((yr - startYear) / totalYears) * 100}%` }
                        }, yr.toString())),
                        m(".active-slider-pill", {
                            style: { 
                                left: `${((activeYear - startYear) / totalYears) * 100}%`,
                                cursor: isDraggingSlider ? 'grabbing' : 'grab'
                            },
                            onpointerdown: (e) => {
                                e.stopPropagation();
                                isDraggingSlider = true;
                                e.target.setPointerCapture(e.pointerId);
                                
                                const handlePointerMove = (moveEvent) => {
                                    if (!isDraggingSlider) return;
                                    const row = document.querySelector(".date-slider-row");
                                    if (!row) return;
                                    const rect = row.getBoundingClientRect();
                                    const percentage = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                                    const targetYear = startYear + percentage * totalYears;
                                    let tIdx = data.findIndex(item => {
                                        const m = item.date && item.date.match(/^(\d{4})/);
                                        return m && parseInt(m[1], 10) >= Math.round(targetYear);
                                    });
                                    if (tIdx === -1) tIdx = data.length - 1;
                                    onJumpToIndex(tIdx, 'auto');
                                    m.redraw();
                                };
                                
                                const handlePointerUp = (upEvent) => {
                                    isDraggingSlider = false;
                                    upEvent.target.releasePointerCapture(upEvent.pointerId);
                                    upEvent.target.removeEventListener('pointermove', handlePointerMove);
                                    upEvent.target.removeEventListener('pointerup', handlePointerUp);
                                    upEvent.target.removeEventListener('pointercancel', handlePointerUp);
                                    m.redraw();
                                };
                                
                                e.target.addEventListener('pointermove', handlePointerMove);
                                e.target.addEventListener('pointerup', handlePointerUp);
                                e.target.addEventListener('pointercancel', handlePointerUp);
                            }
                        }, activeYear.toString())
                    ]),

                    m(".data-marker-row", [
                        data.map((item, index) => {
                            const py = getPreciseYear(item.date);
                            if (!py) return null;
                            const xPos = getX(py);
                            const primaryTag = item.tags && item.tags.length > 0 ? item.tags[0] : 'default';
                            const yOffset = ((index * 13) % 20); // Pseudo-random vertical offset to avoid overlap
                            const isHovered = dataHoverState && dataHoverState.index === index;
                            const hoverClass = isHovered ? ' marker-hovered' : '';
                            
                            return m(`.data-marker.marker-${primaryTag}${hoverClass}`, {
                                key: item.id || index,
                                style: { 
                                    left: `${xPos}%`,
                                    top: `${yOffset}px`
                                },
                                onmouseenter: (e) => {
                                    e.stopPropagation();
                                    dataHoverState = {
                                        active: true,
                                        title: item.title,
                                        date: item.date,
                                        x: xPos,
                                        index: index
                                    };
                                },
                                onmouseleave: () => {
                                    // Container onmousemove handles clearing naturally, but keeping for precision
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    onJumpToIndex(index);
                                }
                            });
                        }),
                        
                        dataHoverState && dataHoverState.active && m(".data-hover-tooltip.glass-panel", {
                            style: {
                                left: `${dataHoverState.x}%`,
                                transform: "translateX(-50%)"
                            }
                        }, [
                            m(".tooltip-header", dataHoverState.date),
                            m(".tooltip-title", dataHoverState.title)
                        ])
                    ])
                ])
            ]);
        }
    };
};
