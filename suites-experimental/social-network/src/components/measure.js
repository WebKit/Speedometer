import { createContext } from "react";

// Lets a unit's content ask the feed to re-measure it after it changes size.
export const MeasureContext = createContext(() => {});
