import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { guard } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { BackgroundedContext } from "./measure.js";
import { SurfaceContext } from "./ui.jsx";

const HOVER_INTENT_MS = 500;

// Names and avatars of people, pages and groups open a preview card once the pointer
// rests on them.
export default function HovercardTrigger({ kind, id, children }) {
    const backgrounded = useContext(BackgroundedContext);
    const surface = useContext(SurfaceContext);
    const timer = useRef(null);
    const [intent, setIntent] = useState(false);

    const onEnter = useCallback(() => {
        if (backgrounded)
            return;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => guard("hovercard.intent", setIntent, true), HOVER_INTENT_MS);
    }, [backgrounded]);

    const onLeave = useCallback(() => {
        clearTimeout(timer.current);
        setIntent(false);
    }, []);

    useEffect(() => {
        if (intent)
            log("hovercard_intent", { kind, id, surface });
    }, [intent, kind, id, surface]);

    useEffect(() => () => clearTimeout(timer.current), []);

    return (
        <span className="inline-flex min-w-0" data-hovercard={`${kind}:${id}`} onPointerEnter={onEnter} onPointerLeave={onLeave}>
            {children}
        </span>
    );
}
