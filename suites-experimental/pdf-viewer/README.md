# PDFViewer-PDFjs

## Description

A document viewer built on [pdf.js](https://mozilla.github.io/pdf.js/), the way sites
embed it for inline previews. It exercises work no other suite covers: canvas 2D drawing,
rasterising glyphs from embedded fonts, and JPEG decoding.

The viewer uses the pdf.js core API directly rather than `pdf_viewer.mjs`, whose render
queue and scroll handling schedule work with timers we don't want inside a measured step.
It has a toolbar and a thumbnail sidebar similar to Firefox's built-in viewer, and lays
pages out in a wrapping grid. The toolbar buttons are inert.

### Benchmark steps

`RenderPages` renders `6 * complexity` pages, each into its main canvas and its sidebar
thumbnail, and waits for all of them. The pages render concurrently, since awaiting them
one by one would leave the step idle waiting on the worker.

Worker startup, fetching the document, `getDocument` and `getPage` all happen before the
app signals `app-ready`, so they are not measured. Nothing is rendered ahead of the step:
pdf.js caches a page's operator list, so rendering early would leave the step with a warm
cache.

The suite is `remote`. The steps await pdf.js promises, so they run inside the workload's
frame through `BenchmarkConnector`.

### The requestAnimationFrame shim

pdf.js splits a render into 15ms chunks and continues each one on the next animation
frame. That ties the step's duration to the display's refresh rate, so for the duration
of the step `requestAnimationFrame` is replaced with a zero-delay timer. The shim is
scoped to the step because the harness's step scheduler also uses animation frames.

## The document

`document.pdf` is a 24-page report generated at build time by `scripts/generate-pdf.mjs`
with [PDFKit](https://pdfkit.org/), so what it contains is reviewable as code. The output
is byte-identical between builds. Each page is one of four layouts: text, photos, charts
and a mixed page with a table. Between them they cover three embedded subset fonts, four
JPEG photos, an image soft mask, axial and radial shadings, a tiling pattern, clipping,
dash patterns, blend modes, link annotations, an outline and a tagged structure tree.

Everything stays inside pdf.js' free tier: no CMaps, no standard fonts and no wasm image
decoders. `npm run analyze:pdf` checks that and exits non-zero if it stops being true.

## Params

-   `complexity` scales the number of pages rendered.
-   `pdfPixelRatio` sets canvas backing-store pixels per CSS pixel. It is pinned to `2`
    instead of following `devicePixelRatio`, so every machine rasterises the same number of
    pixels. The harness only forwards params it knows, so to override it add it to the
    suite's `url` in `suites-experimental/suites.mjs`.

## Build

```sh
npm install
npm run build
```

`prebuild` regenerates `public/document.pdf`; `public/` is gitignored and `dist/` is
committed. Format sources before building so the committed source map stays in sync.

## Requirements

```
* Node (min version: 24.0.0)
```

## Local preview

Run the dev server from the repo root and load the suite through the harness:

```
http://127.0.0.1:8080/?developerMode&iterationCount=1&suites=PDFViewer-PDFjs
```

`npm run dev` inside this directory serves the viewer on its own, which is useful for
layout work but does not run the steps.

## Dev tools

```sh
npm run generate:pdf   # rebuild public/document.pdf
npm run analyze:pdf    # report what the document contains
```

## Third-party assets

The photos are NASA and National Park Service works in the public domain; see
[`assets/README.md`](assets/README.md) for sources.

The toolbar and sidebar icons come from `pdfjs-dist/web/images/` (Apache-2.0) and are
inlined into the built stylesheet.

The fonts are read from `node_modules` at build time and embedded as subsets:

| Role     | Font                                                              | License     |
| -------- | ----------------------------------------------------------------- | ----------- |
| Body     | [Source Serif 4](https://github.com/adobe-fonts/source-serif)     | SIL OFL 1.1 |
| Headings | [Inter](https://github.com/rsms/inter)                            | SIL OFL 1.1 |
| Code     | [Source Code Pro](https://github.com/adobe-fonts/source-code-pro) | SIL OFL 1.1 |
