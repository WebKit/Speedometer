import m from "mithril";
import { getLanguage, t } from "../i18n.js";

export const Timeline = () => {
    let scrollLeft = 0;
    let clientWidth = 0;
    let containerEl = null;
    let lastVersion = null;
    let lastData = null;
    let lastLang = null;

    const gap = 50;
    const paddingLeft = 50;

    let xPositions = [];
    let totalWidth = 0;

    function getCardId(card, index) {
        return card.id !== null && card.id !== undefined ? card.id : `_idx_${index}`;
    }

    function getCardWidth(card, index) {
        let w = Number(card.width);
        return isNaN(w) || w <= 0 ? 350 : w;
    }

    function calculatePositions(data) {
        xPositions = [];
        let currentX = paddingLeft;
        for (let i = 0; i < data.length; i++) {
            xPositions.push(currentX);
            const card = data[i];
            const width = getCardWidth(card, i);
            currentX += width + gap;
        }
        totalWidth = data.length > 0 ? currentX - gap + paddingLeft : 0;
    }

    return {
        oninit(vnode) {
            lastVersion = vnode.attrs.version;
            lastData = vnode.attrs.data;
            lastLang = vnode.attrs.language || getLanguage();
            calculatePositions(vnode.attrs.data);
        },
        onbeforeupdate(vnode) {
            let needsRecalc = false;
            const currentLang = vnode.attrs.language || getLanguage();
            // IMPORTANT: We must check if data, version, or active language changed!
            // When language changes (live translation of cards), we must recalculate positions
            // and trigger updates so card content and layouts are re-translated and re-rendered.
            // Do not remove this check or code comment, to prevent breaking live translation in future edits.
            if (vnode.attrs.version !== undefined && vnode.attrs.version !== lastVersion) {
                lastVersion = vnode.attrs.version;
                needsRecalc = true;
            }
            if (vnode.attrs.data !== lastData) {
                lastData = vnode.attrs.data;
                needsRecalc = true;
            }
            if (currentLang !== lastLang) {
                lastLang = currentLang;
                needsRecalc = true;
            }
            if (needsRecalc)
                calculatePositions(vnode.attrs.data);
        },
        oncreate(vnode) {
            containerEl = vnode.dom;
            clientWidth = containerEl.clientWidth;
            scrollLeft = containerEl.scrollLeft;

            if (vnode.attrs.handle) {
                vnode.attrs.handle.scrollToIndex = (index, requestedBehavior = "smooth") => {
                    if (index < 0 || index >= vnode.attrs.data.length || !containerEl)
                        return;

                    const doScroll = (behavior) => {
                        const x = xPositions[index];
                        const card = vnode.attrs.data[index];
                        const width = getCardWidth(card, index);
                        const currentClientWidth = containerEl.clientWidth;
                        const targetScrollLeft = Math.max(0, x - (currentClientWidth - width) / 2);

                        containerEl.scrollTo({
                            left: targetScrollLeft,
                            behavior,
                        });
                    };

                    doScroll(requestedBehavior);
                };
            }

            this.onScroll = (e) => {
                scrollLeft = e.target.scrollLeft;
                clientWidth = e.target.clientWidth;

                if (xPositions.length > 0) {
                    const maxScroll = Math.max(0, totalWidth - clientWidth);
                    let closestIndex = vnode.attrs.activeIndex !== undefined ? vnode.attrs.activeIndex : 0;
                    if (closestIndex < 0 || closestIndex >= xPositions.length)
                        closestIndex = 0;

                    const getClampedScroll = (idx) => {
                        const x = xPositions[idx];
                        const card = vnode.attrs.data[idx];
                        const w = getCardWidth(card, idx);
                        const targetScroll = x - (clientWidth - w) / 2;
                        return Math.max(0, Math.min(maxScroll, targetScroll));
                    };

                    let minDiff = Math.abs(scrollLeft - getClampedScroll(closestIndex));

                    for (let i = 0; i < xPositions.length; i++) {
                        const diff = Math.abs(scrollLeft - getClampedScroll(i));
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
            const { data, renderItem, layoutMode, cardBuffer = 10 } = vnode.attrs;
            const isVirtual = layoutMode === "virtual";

            let firstVisibleIndex = 0;
            if (data.length > 0) {
                let l = 0,
                    r = data.length - 1;
                while (l <= r) {
                    let m_idx = Math.floor((l + r) / 2);
                    let x = xPositions[m_idx];
                    let w = getCardWidth(data[m_idx], m_idx);
                    if (x + w < scrollLeft) {
                        l = m_idx + 1;
                    } else {
                        firstVisibleIndex = m_idx;
                        r = m_idx - 1;
                    }
                }
            }

            let lastVisibleIndex = firstVisibleIndex;
            for (let i = firstVisibleIndex; i < data.length; i++) {
                const x = xPositions[i];
                lastVisibleIndex = i;
                if (x > scrollLeft + clientWidth)
                    break;

            }

            const startIdx = isVirtual ? Math.max(0, firstVisibleIndex - cardBuffer) : 0;
            const endIdx = isVirtual ? Math.min(data.length - 1, lastVisibleIndex + cardBuffer) : data.length - 1;

            const visibleItems = [];
            for (let i = startIdx; i <= endIdx; i++) {
                if (data[i]) {
                    visibleItems.push({
                        item: data[i],
                        index: i,
                        x: xPositions[i],
                    });
                }
            }

            return m(
                "#document-container",
                {
                    style: {
                        position: "relative",
                        overflowX: "auto",
                        overflowY: "hidden",
                        width: "100%",
                        height: "100%",
                    },
                },
                [
                    data.length === 0
                        ? m(
                            ".empty-state",
                            {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    height: "100%",
                                    color: "#94a3b8",
                                    fontSize: "1.2rem",
                                    fontWeight: "600",
                                    letterSpacing: "0.05em",
                                    position: "absolute",
                                    top: "0",
                                    left: "0",
                                },
                            },
                            t("noMatches")
                        )
                        : m(
                            "#document-content",
                            {
                                class: isVirtual ? "virtual-layout" : "browser-layout",
                                style: isVirtual
                                    ? {
                                        position: "relative",
                                        width: `${totalWidth}px`,
                                        height: "100%",
                                        flexShrink: "0",
                                    }
                                    : {
                                        position: "relative",
                                        display: "flex",
                                        gap: `${gap}px`,
                                        paddingLeft: `${paddingLeft}px`,
                                        paddingRight: `${paddingLeft}px`,
                                        height: "100%",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        width: "max-content",
                                    },
                            },
                            [
                                visibleItems.map((d) => {
                                    const cardId = getCardId(d.item, d.index);
                                    const childVnode = renderItem(d.item);

                                    if (!childVnode.attrs)
                                        childVnode.attrs = {};
                                    if (!childVnode.attrs.style)
                                        childVnode.attrs.style = {};

                                    if (isVirtual) {
                                        childVnode.attrs.style = Object.assign({}, childVnode.attrs.style, {
                                            position: "absolute",
                                            top: "50%",
                                            "--x-pos": `${d.x}px`,
                                        });
                                    }
                                    childVnode.key = cardId;
                                    return childVnode;
                                }),
                            ]
                        ),
                ]
            );
        },
    };
};
