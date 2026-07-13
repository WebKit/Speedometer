/**
 * 1950s Black & White Blueprint / Planning Design
 * Style reference: STYLE_CONFIG in src/graphics.js
 * Mandates pure black background (#000000), crisp B&W geometry, slanted borders,
 * independent drop shadow angles, and gradual organic watercolor animation reveals.
 */
import { STAGES } from "./content.js";
import { initGraphics, updateGraphics } from "./graphics.js";
import { initScrollamaEngine } from "./engine-scrollama.js";
import { initVanillaEngine } from "./engine-vanilla.js";

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
                .map(
                    (p, pIdx) => `
                <p class="step-paragraph-item step-description" data-p-index="${pIdx}">${p}</p>`
                )
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

    tocList.innerHTML = `<div id="toc-active-indicator" class="toc-active-indicator"></div>${
        STAGES.map((stage, idx) => `
            <li class="toc-item-wrapper">
                <button class="toc-item ${idx === 0 ? "is-active" : ""}" data-index="${idx}">
                    <span class="toc-num">0${idx + 1}</span>
                    <span class="toc-label">${stage.title}</span>
                </button>
            </li>
        `).join("")}`;

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

    const urlParams = new URLSearchParams(window.location.search);
    const engine = urlParams.get("engine") || "scrollama";

    if (engine === "vanilla" || engine === "observer" || engine === "css") {
        if (engine === "css")
            console.warn("CSS scroll timelines are disabled for main-thread benchmarking. Falling back to Vanilla JS engine.");

        initVanillaEngine(updateGraphics);
    } else {
        initScrollamaEngine(updateGraphics);
    }

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
