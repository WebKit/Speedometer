import { AsyncBenchmarkStep, AsyncBenchmarkSuite } from "speedometer-utils/benchmark.mjs";
import { params } from "speedometer-utils/params.mjs";

export const appName = "pdf-viewer";
export const appVersion = "1.0.0";

// Six is the smallest run that reaches one page of each of the document's four
// layouts, which start after the front page and the table of contents.
const DEFAULT_PAGES_TO_RENDER = 6;

export function getNumberOfPagesToRender(pageCount) {
    return Math.max(1, Math.min(pageCount, Math.round(DEFAULT_PAGES_TO_RENDER * params.complexity)));
}

/**
 * pdf.js chunks every display-intent render on requestAnimationFrame, capped at 15ms of
 * operator-list work per chunk, so without this a 60ms page waits for four real frames
 * and the suite scores differently on a 60Hz and a 120Hz display.
 *
 * Scoped to the step, not installed at page load: the step scheduler runs in this same
 * frame for a remote suite, and a global shim would rewrite its frame scheduling too.
 * It registers both of its frame callbacks before the step body runs, so this only ever
 * reaches pdf.js.
 */
async function withoutAnimationFrames(render) {
    const { requestAnimationFrame, cancelAnimationFrame } = window;
    window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(performance.now()), 0);
    window.cancelAnimationFrame = (handle) => window.clearTimeout(handle);
    try {
        await render();
    } finally {
        window.requestAnimationFrame = requestAnimationFrame;
        window.cancelAnimationFrame = cancelAnimationFrame;
    }
}

export default function createSuites(viewer) {
    return {
        default: new AsyncBenchmarkSuite("PDFViewer-PDFjs", [new AsyncBenchmarkStep("RenderPages", () => withoutAnimationFrames(() => viewer.renderPages(0, getNumberOfPagesToRender(viewer.pageCount))))]),
    };
}
