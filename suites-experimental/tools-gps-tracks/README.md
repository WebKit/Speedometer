# Tools-GPS-Tracks Workload (Angular)

## Description

This workload simulates an offline-capable GPS track analyzer and activity dashboard (`weg-strasse`) built with Angular 19 standalone `@Component`s (`AppComponent`, `GraphsTabComponent`, `InsightsTabComponent`, `DetailsTabComponent`, `CombinedTabComponent`, `EvolutionTabComponent`, `CoursesTabComponent`) and `TrackStateService`. It parses binary and XML activity tracks (`.fit`, `.gpx`, `.tcx`, `.kml`) compressed with `gzip`, persists activity data in IndexedDB, and computes physiological and geospatial analytics rendered via Angular templates (`*ngIf`, `*ngFor`, `ChangeDetectorRef.detectChanges()`) and `uPlot` Canvas charts.

## Benchmark Steps

1. **LoadAndParseFiles**: Fetches, decompresses (`DecompressionStream`), and parses 6 synthetic GPS activity tracks (`.gpx.gz`, `.tcx.gz`, `.fit.gz`), computes track statistics and power/heart-rate duration curves, persists tracks in IndexedDB, and renders the map and metric charts.
2. **DisplayAnalysisMetrics**: Simulates brush selection and hover interactions across telemetry charts, updating track statistics and map segments over the selected range.
3. **DisplayInsights**: Renders the Insights view with power and heart-rate duration curves, physiological training zones, aerobic decoupling / W' balance analytics, and kilometer split tables.
4. **DisplayDetails**: Renders the Details view with device/sensor metadata, lap and gear-shift breakdowns, and editing interactions.
5. **DisplayAggregateMetrics**: Renders the Aggregate view, computing multi-track sliding-window cross-correlations, comparative telemetry tables, and overlaid multi-track charts.
6. **DisplayEvolutionMetrics**: Renders the Evolution and Accumulated views, modeling acute/chronic training load (ATL/CTL/TSB) and plotting multi-metric progression and cumulative timelines.
7. **DisplayCourses**: Creates a multi-waypoint course, matches candidate tracks passing through geospatial gates, and renders course segment leaderboards and corridor comparisons.

## Requirements

Please always compile inside the latest `node` LTS requirement (`>=24.0.0`).

## Building

Run `npm install` inside `/suites-experimental/tools-gps-tracks`, then run `npm run build` to typecheck, generate deterministic compressed test tracks in `test-data/`, bundle the application and sourcemaps into `dist/`, and generate `dist/resources.txt`.

## Develop & Run Locally

1. Run `npm install` inside `/suites-experimental/tools-gps-tracks`.
2. Run `npm run dev` to watch, rebuild on source changes, and start a local development server for `dist/`.
