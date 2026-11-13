// Page-view instrumentation in the style finance portals ship: on every view it
// collects module impressions (visibility, computed style, geometry), audits
// outgoing links, and serializes a beacon payload. Nothing is sent anywhere.

const AUDITED_PATTERNS = ["utm_", "affiliate", "/sponsored/", "doubleclick", "partner=", "/promo/", "tracking", "redirect?", "ref=", "campaign"];
const beacons = [];
let pendingImpressions = 0;
let observer = null;

export function observeModules(root) {
    observer?.disconnect();
    observer = new MutationObserver((records) => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute("data-module"))
                    pendingImpressions++;
            }

        }
    });
    observer.observe(root, { childList: true, subtree: true });
}

function auditLinks(root) {
    const flagged = [];
    const anchors = root.querySelectorAll("a[href]");
    for (const anchor of anchors) {
        const href = anchor.href;
        for (const pattern of AUDITED_PATTERNS) {
            if (href.indexOf(pattern) !== -1) {
                flagged.push(pattern);
                break;
            }
        }
    }
    return { count: anchors.length, flagged };
}

function collectImpressions(root) {
    const viewportHeight = root.ownerDocument.documentElement.clientHeight;
    const impressions = [];
    for (const module of root.querySelectorAll("[data-module]")) {
        if (!module.checkVisibility({ opacityProperty: true, visibilityProperty: true }))
            continue;
        const style = getComputedStyle(module);
        const rect = module.getBoundingClientRect();
        impressions.push({
            module: module.dataset.module,
            sticky: style.position === "sticky" || style.position === "fixed",
            display: style.display,
            top: Math.round(rect.top),
            height: Math.round(rect.height),
            inView: rect.top < viewportHeight && rect.bottom > 0,
        });
    }
    return impressions;
}

export function trackPageView(root, page) {
    const payload = {
        page,
        url: root.ownerDocument.location.hash,
        mutations: pendingImpressions,
        impressions: collectImpressions(root),
        links: auditLinks(root),
    };
    pendingImpressions = 0;
    beacons.push(JSON.stringify(payload));
    if (beacons.length > 20)
        beacons.shift();
}

export function pageReady(page) {
    trackPageView(document.body, page);
    document.documentElement.dataset.readyPage = page;
    window.dispatchEvent(new CustomEvent("finance-page-ready", { detail: page }));
}
