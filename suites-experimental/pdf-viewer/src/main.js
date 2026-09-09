import { getDocument, GlobalWorkerOptions, VerbosityLevel } from "pdfjs-dist/build/pdf.mjs";
import PdfWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";
import { BenchmarkConnector } from "speedometer-utils/benchmark.mjs";
import { buildSidebar, buildToolbar } from "./chrome.js";
import { PdfViewer } from "./viewer.js";
import createSuites, { appName, appVersion } from "./workload-test.mjs";

const DOCUMENT_URL = "document.pdf";

// Pages wrap into a grid, so this constant alone decides how many fit per row. 0.67 is
// the tallest a US Letter page can be in the area the toolbar and sidebar leave over.
const PAGE_SCALE = 0.67;
const THUMBNAIL_WIDTH = 130;
const DEFAULT_OUTPUT_SCALE = 2;

/**
 * Pinned rather than read from devicePixelRatio, so the workload rasterises the same
 * number of pixels everywhere. The harness only forwards params it knows about, so
 * `pdfPixelRatio` has to be set on the suite's own url, not the harness url.
 */
function readOutputScale() {
    const raw = new URLSearchParams(window.location.search).get("pdfPixelRatio");
    if (raw === null)
        return DEFAULT_OUTPUT_SCALE;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
        console.error(`Invalid pdfPixelRatio param: '${raw}', expected a positive number.`);
        return DEFAULT_OUTPUT_SCALE;
    }
    return value;
}

// Everything that is not rendering happens before the app-ready message, and so
// outside every measured window: worker boot, the fetch, getDocument and every getPage.
async function main() {
    GlobalWorkerOptions.workerPort = new PdfWorker();

    const response = await fetch(new URL(DOCUMENT_URL, document.baseURI));
    if (!response.ok)
        throw new Error(`Could not load ${DOCUMENT_URL}: ${response.status} ${response.statusText}`);

    const pdfDocument = await getDocument({
        data: await response.arrayBuffer(),
        // Everything the document needs is embedded, so never substitute a local face.
        useSystemFonts: false,
        verbosity: VerbosityLevel.ERRORS,
    }).promise;

    buildToolbar(document.getElementById("toolbar"), { pageCount: pdfDocument.numPages, scale: PAGE_SCALE });
    const thumbnails = buildSidebar(document.getElementById("sidebar"));

    const viewer = new PdfViewer({ pages: document.getElementById("viewer"), thumbnails }, pdfDocument, {
        scale: PAGE_SCALE,
        outputScale: readOutputScale(),
        thumbnailWidth: THUMBNAIL_WIDTH,
    });
    await viewer.layout();

    new BenchmarkConnector(createSuites(viewer), appName, appVersion).connect();
}

main().catch((error) => {
    console.error(error);
    document.getElementById("viewer").textContent = `Failed to load the document: ${error.message}`;
});
