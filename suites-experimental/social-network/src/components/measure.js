import { createContext } from "react";

// Lets a unit's content ask the feed to re-measure it after it changes size.
export const MeasureContext = createContext(() => {});

// True for the page underneath a modal layer: its controls leave the tab order, hover
// previews stay closed and viewability tracking pauses until the layer closes.
export const BackgroundedContext = createContext(false);
