import m from "mithril";

export const Timeline = () => {
    let scrollLeft = 0;
    let clientWidth = 0;
    let containerEl = null;
    let lastVersion = null;
    let lastData = null;

    const buffer = 400; // px buffer left/right of viewport
    const gap = 50;
    const paddingLeft = 50;

    const widthCache = new Map();
    let xPositions = [];
    let totalWidth = 0;

    function calculatePositions(data) {
        xPositions = [];
        let currentX = paddingLeft;
        for (let i = 0; i < data.length; i++) {
            xPositions.push(currentX);
            const card = data[i];
            const width = widthCache.get(card.id) || card.width || 350;
            currentX += width + gap;
        }
        totalWidth = data.length > 0 ? currentX - gap + paddingLeft : 0;
    }

    return {
        oninit(vnode) {
            lastVersion = vnode.attrs.version;
            lastData = vnode.attrs.data;
            calculatePositions(vnode.attrs.data);
        },
        onbeforeupdate(vnode) {
            let needsRecalc = false;
            if (vnode.attrs.version !== undefined && vnode.attrs.version !== lastVersion) {
                widthCache.clear();
                lastVersion = vnode.attrs.version;
                needsRecalc = true;
            }
            if (vnode.attrs.data !== lastData) {
                lastData = vnode.attrs.data;
                needsRecalc = true;
            }
            if (needsRecalc) {
                calculatePositions(vnode.attrs.data);
            }
        },
        oncreate(vnode) {
            containerEl = vnode.dom;
            clientWidth = containerEl.clientWidth;
            scrollLeft = containerEl.scrollLeft;

            if (vnode.attrs.handle) {
                vnode.attrs.handle.scrollToIndex = (index) => {
                    if (index < 0 || index >= vnode.attrs.data.length || !containerEl)
                        return;
                    
                    const doScroll = (behavior) => {
                        const x = xPositions[index];
                        const card = vnode.attrs.data[index];
                        const width = widthCache.get(card.id) || card.width || 350;
                        const currentClientWidth = containerEl.clientWidth;
                        const targetScrollLeft = Math.max(0, x - (currentClientWidth - width) / 2);
                        containerEl.scrollTo({
                            left: targetScrollLeft,
                            behavior: behavior
                        });
                    };

                    doScroll("smooth");
                    
                    // Double check after animation to ensure precise alignment
                    setTimeout(() => {
                        if (containerEl) doScroll("auto");
                    }, 600);
                };
            }

            this.onScroll = (e) => {
                scrollLeft = e.target.scrollLeft;
                clientWidth = e.target.clientWidth;

                const viewportMiddle = scrollLeft + clientWidth / 2;
                
                if (xPositions.length > 0) {
                    let l = 0, r = xPositions.length - 1;
                    while (l <= r) {
                        let m_idx = Math.floor((l + r) / 2);
                        let x = xPositions[m_idx];
                        let card = vnode.attrs.data[m_idx];
                        let w = widthCache.get(card.id) || card.width || 350;
                        let middle = x + w / 2;
                        
                        if (middle === viewportMiddle) {
                            l = m_idx;
                            break;
                        } else if (middle < viewportMiddle) {
                            l = m_idx + 1;
                        } else {
                            r = m_idx - 1;
                        }
                    }
                    
                    let closestIndex = 0;
                    let minDiff = Infinity;
                    let searchCenter = Math.min(xPositions.length - 1, l);
                    for (let i = Math.max(0, searchCenter - 1); i <= Math.min(xPositions.length - 1, searchCenter + 1); i++) {
                        let x = xPositions[i];
                        let card = vnode.attrs.data[i];
                        let w = widthCache.get(card.id) || card.width || 350;
                        let diff = Math.abs(viewportMiddle - (x + w / 2));
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestIndex = i;
                        }
                    }

                    if (vnode.attrs.onActiveIndexChange)
                        vnode.attrs.onActiveIndexChange(closestIndex);
                }

                m.redraw();
            };
            containerEl.addEventListener("scroll", this.onScroll);

            this.onResize = () => {
                clientWidth = containerEl.clientWidth;
                m.redraw();
            };
            window.addEventListener("resize", this.onResize);

            // Initial measure
            m.redraw();
        },
        onremove(vnode) {
            if (vnode.dom && this.onScroll)
                vnode.dom.removeEventListener("scroll", this.onScroll);

            if (this.onResize)
                window.removeEventListener("resize", this.onResize);
        },
        view(vnode) {
            const { data, renderItem } = vnode.attrs;

            const viewportStart = scrollLeft - buffer;
            const viewportEnd = scrollLeft + clientWidth + buffer;

            let startIndex = 0;
            if (data.length > 0) {
                let l = 0, r = data.length - 1;
                while (l <= r) {
                    let m_idx = Math.floor((l + r) / 2);
                    let x = xPositions[m_idx];
                    let w = widthCache.get(data[m_idx].id) || data[m_idx].width || 350;
                    if (x + w < viewportStart) {
                        l = m_idx + 1;
                    } else {
                        startIndex = m_idx;
                        r = m_idx - 1;
                    }
                }
            }

            const visibleItems = [];
            for (let i = startIndex; i < data.length; i++) {
                const x = xPositions[i];
                const card = data[i];
                const width = widthCache.get(card.id) || card.width || 350;
                
                if (x > viewportEnd) {
                    break;
                }
                
                if (x + width >= viewportStart && x <= viewportEnd) {
                    visibleItems.push({
                        item: card,
                        index: i,
                        x: x
                    });
                }
            }

            return m("#document-container", {
                style: {
                    position: "relative",
                    overflowX: "auto",
                    overflowY: "hidden",
                    width: "100%",
                    height: "100%"
                }
            }, [
                m("#document-content", {
                    style: {
                        position: "relative",
                        width: `${totalWidth}px`,
                        height: "100%"
                    }
                }, [
                    visibleItems.map(d => {
                        // Pass width callback to let cards report measured width
                        const childVnode = renderItem(d.item, (width) => {
                            const cached = widthCache.get(d.item.id);
                            if (cached !== width) {
                                widthCache.set(d.item.id, width);
                                // Recalculate positions immediately and redraw
                                calculatePositions(data);
                                m.redraw();
                            }
                        });

                        if (!childVnode.attrs)
                            childVnode.attrs = {};
                        if (!childVnode.attrs.style)
                            childVnode.attrs.style = {};

                        childVnode.attrs.style = Object.assign({}, childVnode.attrs.style, {
                            position: "absolute",
                            top: "50%",
                            transform: `translate3d(${d.x}px, -50%, 0)`
                        });
                        childVnode.key = d.item.id;
                        return childVnode;
                    })
                ])
            ]);
        }
    };
};
