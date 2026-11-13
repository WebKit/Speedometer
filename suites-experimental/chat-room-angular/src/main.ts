import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app";

// Zone-based change detection, without event coalescing, so an update renders
// synchronously when the event handler that caused it returns, as it does for
// a click in React and in Svelte's microtask. Zoneless Angular renders in a
// setTimeout/rAF race instead, which the suite's MessageChannel yield between
// interactions does not wait for in every browser, so interactions would
// coalesce and the suite would measure less work than the other ports do.
bootstrapApplication(App, { providers: [provideZoneChangeDetection()] }).catch((error) => console.error(error));
