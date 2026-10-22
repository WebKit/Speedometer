import { createContext } from "svelte";

// Timeline content is nested deep (Message -> RichText -> Span) and the
// innermost pills act on the app, so keep that out of the intermediate props.
export const [getActions, setActions] = createContext();
