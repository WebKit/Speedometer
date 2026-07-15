# Timeline Experimental Workload (`suites-experimental/timeline`)

Interactive scrollytelling benchmark tracking computing milestones from 1900 to the present across five localized languages: German (`DE`), French (`FR`), Italian (`IT`), Traditional Chinese (`TW`), and Japanese (`JP`).

## Licensing & Attribution

This experimental workload separates software code from external factual datasets, governed by distinct open-source licenses:

### 1. Software Harness & UI Code (BSD 2-Clause)

All software source code, TypeScript/JavaScript runners, Mithril.js UI components (`src/components/*`, `src/main.ts`, `src/i18n.ts`), test suites (`tests/*`), and build utilities (`generate-index.js`) are licensed under the **BSD 2-Clause License** (see the root [`LICENSE`](../../LICENSE) file).

### 2. Historical Benchmark Data & Translations (CC BY-SA 4.0)

The historical event summaries, descriptions, titles, and localized translations contained within `src/data/*.js` (`1900.js` through `2026.js`) are adapted, condensed, and translated by gemini from articles on **[Wikipedia, The Free Encyclopedia](https://www.wikipedia.org/)**, authored by Wikipedia contributors.

-   **License**: All textual content and data structures within `src/data/*.js` are licensed under the **Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)** (or compatible earlier CC BY-SA 3.0 / GFDL terms where applicable). Full license text: https://creativecommons.org/licenses/by-sa/4.0/
-   **Modifications & Translations**: Original Wikipedia article text has been condensed into structured JSON/JS data arrays and translated across German (`DE`), French (`FR`), Italian (`IT`), Traditional Chinese (`TW`), and Japanese (`JP`) using gemini.
