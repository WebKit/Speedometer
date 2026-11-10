// Viewability: a unit counts as seen once half of it is inside its scroller and its
// center is not covered by anything else, which is what ad and feed ranking need.

import { log } from "./logger.js";

const VISIBLE_RATIO = 0.5;
const seen = new Set();

export function checkImpressions(scroller, units) {
    const viewport = scroller.getBoundingClientRect();
    for (const element of units) {
        const id = element.getAttribute("data-story-id");
        if (!id || seen.has(id))
            continue;
        const rect = element.getBoundingClientRect();
        if (!rect.height)
            continue;
        const visible = Math.max(0, Math.min(rect.bottom, viewport.bottom) - Math.max(rect.top, viewport.top));
        const ratio = visible / Math.min(rect.height, viewport.height);
        if (ratio < VISIBLE_RATIO)
            continue;
        const x = rect.left + rect.width / 2;
        const y = Math.max(rect.top, viewport.top) + visible / 2;
        const hit = document.elementFromPoint(x, y);
        if (!hit || !element.contains(hit))
            continue;
        seen.add(id);
        const sponsored = element.hasAttribute("data-sponsored");
        log(sponsored ? "ad_viewable" : "story_impression", { story: id, position: Number(element.getAttribute("data-position")), ratio: Math.round(ratio * 100) / 100, height: Math.round(rect.height) });
    }
}
