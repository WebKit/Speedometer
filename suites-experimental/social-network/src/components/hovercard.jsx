import { useContext } from "react";
import { guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { BackgroundedContext } from "./measure.js";

const HOVER_INTENT = new Map();

const onEnter = guarded("hovercard.enter", (kind, id) => {
    HOVER_INTENT.set(id, kind);
});

const onLeave = guarded("hovercard.leave", (kind, id) => {
    if (HOVER_INTENT.delete(id))
        log("hovercard_intent", { kind, id });
});

// Names and avatars of people, pages and groups open a preview card on hover.
export default function HovercardTrigger({ kind, id, children }) {
    const backgrounded = useContext(BackgroundedContext);
    return (
        <span className="inline-flex min-w-0" data-hovercard={`${kind}:${id}`} onPointerEnter={backgrounded ? undefined : () => onEnter(kind, id)} onPointerLeave={backgrounded ? undefined : () => onLeave(kind, id)}>
            {children}
        </span>
    );
}
