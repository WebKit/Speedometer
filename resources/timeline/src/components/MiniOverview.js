import m from "mithril";

export const MiniOverview = () => {
    let hoverState = { active: false, x: 0, y: 0, clientX: 0, year: 0 };
    let dataHoverState = null;
    let containerRect = { width: 1, left: 0 };

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

    const cpuPath = generatePath(1938, endYear, y => (y - 1938) * 0.15);
    const gpuPath = generatePath(1995, endYear, y => 7 + (y - 1999) * 0.28);
    const tpuPath = generatePath(2015, endYear, y => 13 + (y - 2015) * 0.36);

    const ticks = [1900, 1920, 1940, 1960, 1980, 2000, 2020, 2026];

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
                m(".date-slider-row", {
                    onclick: (e) => {
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
                        style: { left: `${((activeYear - startYear) / totalYears) * 100}%` }
                    }, activeYear.toString())
                ]),

                m(".computation-graph-row", {
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
                            boundW: rect.width
                        };
                    },
                    onmouseleave: () => { hoverState.active = false; }
                }, [
                    // Data point markers
                    data.map((item, index) => {
                        const py = getPreciseYear(item.date);
                        if (!py) return null;
                        const xPos = getX(py);
                        return m(".data-marker", {
                            key: item.id || index,
                            style: { left: `${xPos}%` },
                            onmouseenter: (e) => {
                                e.stopPropagation();
                                dataHoverState = {
                                    active: true,
                                    title: item.title,
                                    date: item.date,
                                    x: xPos
                                };
                            },
                            onmouseleave: () => {
                                dataHoverState = null;
                            },
                            onclick: (e) => {
                                e.stopPropagation();
                                onJumpToIndex(index);
                            }
                        });
                    }),
                    
                    m("svg", {
                        viewBox: "0 0 100 100",
                        preserveAspectRatio: "none",
                        class: "graph-svg"
                    }, [
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
                    })(),
                    
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
            ]);
        }
    };
};
