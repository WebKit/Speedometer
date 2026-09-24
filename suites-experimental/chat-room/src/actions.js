import { createContext, useContext } from "react";

// Timeline content is nested deep (Message -> RichText -> Span) and the
// innermost pills act on the app, so keep that out of the intermediate props.
export const ActionsContext = createContext({
    selectRoom: () => {},
    jumpToMessage: () => {},
});

export function useActions() {
    return useContext(ActionsContext);
}
