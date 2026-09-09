/**
 * A viewer on the pdf.js core API rather than pdf_viewer.mjs, whose render queue,
 * scroll and scale handlers and find controller all schedule work with setTimeout -
 * any of those timers firing inside a measured step would charge browser scheduling to
 * the score.
 */
export class PdfViewer {
    #pageContainer;
    #thumbnailContainer;
    #document;
    #scale;
    #outputScale;
    #thumbnailWidth;
    #pages = [];

    constructor({ pages, thumbnails }, pdfDocument, { scale, outputScale, thumbnailWidth }) {
        this.#pageContainer = pages;
        this.#thumbnailContainer = thumbnails;
        this.#document = pdfDocument;
        this.#scale = scale;
        this.#outputScale = outputScale;
        this.#thumbnailWidth = thumbnailWidth;
    }

    get pageCount() {
        return this.#pages.length;
    }

    /**
     * Nothing is rendered here on purpose: pdf.js caches the operator list on the
     * PDFPageProxy, so rendering a page ahead of the step - including as a thumbnail -
     * would hand that step a warm cache and measure almost nothing.
     */
    async layout() {
        const pageNumbers = Array.from({ length: this.#document.numPages }, (_, index) => index + 1);
        const proxies = await Promise.all(pageNumbers.map((pageNumber) => this.#document.getPage(pageNumber)));

        const pageFragment = document.createDocumentFragment();
        const thumbnailFragment = document.createDocumentFragment();

        this.#pages = proxies.map((proxy, index) => {
            const unscaled = proxy.getViewport({ scale: 1 });
            const viewport = proxy.getViewport({ scale: this.#scale });
            const element = document.createElement("div");
            element.className = "pdf-page";
            element.style.width = `${Math.floor(viewport.width)}px`;
            element.style.height = `${Math.floor(viewport.height)}px`;
            pageFragment.append(element);

            const thumbnailViewport = proxy.getViewport({ scale: this.#thumbnailWidth / unscaled.width });
            const thumbnail = document.createElement("div");
            thumbnail.className = "pdf-thumbnail";
            const thumbnailBox = document.createElement("div");
            thumbnailBox.className = "pdf-thumbnail-box";
            thumbnailBox.style.width = `${Math.floor(thumbnailViewport.width)}px`;
            thumbnailBox.style.height = `${Math.floor(thumbnailViewport.height)}px`;
            const label = document.createElement("span");
            label.className = "pdf-thumbnail-label";
            label.textContent = String(index + 1);
            thumbnail.append(thumbnailBox, label);
            thumbnailFragment.append(thumbnail);

            return { proxy, viewport, element, thumbnailViewport, thumbnailBox, canvas: null };
        });

        this.#pageContainer.replaceChildren(pageFragment);
        this.#thumbnailContainer.replaceChildren(thumbnailFragment);
    }

    /**
     * The pages overlap rather than running one after another: awaiting each in turn
     * would leave the step mostly idle, waiting on the worker to parse the next page's
     * operator list.
     */
    async renderPages(startIndex, count) {
        const end = Math.min(startIndex + count, this.#pages.length);
        const renders = [];
        for (let index = startIndex; index < end; index++)
            renders.push(this.#renderPage(this.#pages[index]));
        await Promise.all(renders);
    }

    #createCanvas(viewport, className) {
        const canvas = document.createElement("canvas");
        canvas.className = className;
        canvas.width = Math.floor(viewport.width * this.#outputScale);
        canvas.height = Math.floor(viewport.height * this.#outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        return canvas;
    }

    async #renderPage(page) {
        const { proxy, viewport, element, thumbnailViewport, thumbnailBox } = page;
        const transform = this.#outputScale === 1 ? null : [this.#outputScale, 0, 0, this.#outputScale, 0, 0];

        const canvas = this.#createCanvas(viewport, "pdf-page-canvas");
        element.replaceChildren(canvas);
        page.canvas = canvas;

        const thumbnailCanvas = this.#createCanvas(thumbnailViewport, "pdf-thumbnail-canvas");
        thumbnailBox.replaceChildren(thumbnailCanvas);

        await proxy.render({ canvas, viewport, transform }).promise;
        await proxy.render({ canvas: thumbnailCanvas, viewport: thumbnailViewport, transform }).promise;
    }
}
