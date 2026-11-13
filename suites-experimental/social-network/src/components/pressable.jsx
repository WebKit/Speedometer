import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { BackgroundedContext } from "./measure.js";
import { SurfaceContext, useInteractable } from "./ui.jsx";

/**
 * The design system's interactive surface: a focusable role=button that tracks its own
 * hover, press and focus-visible states and draws them with overlays, so every control
 * looks and behaves the same. It leaves the tab order under a modal layer and registers
 * with the interaction tracker under its logging surface.
 */
export default function Pressable({ className = "", children, onPress, label, disabled = false, ...rest }) {
    const ref = useRef(null);
    const backgrounded = useContext(BackgroundedContext);
    const surface = useContext(SurfaceContext);
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const inert = disabled || backgrounded;
    useInteractable(ref, rest["data-log"] ?? label ?? "pressable", surface);

    const onPointerEnter = useCallback(() => {
        if (!inert)
            setHovered(true);
    }, [inert]);
    const onPointerLeave = useCallback(() => {
        setHovered(false);
        setPressed(false);
    }, []);
    const onPointerDown = useCallback(() => {
        if (!inert)
            setPressed(true);
    }, [inert]);
    const onPointerUp = useCallback(() => setPressed(false), []);
    const onFocus = useCallback((event) => setFocusVisible(event.currentTarget.matches(":focus-visible")), []);
    const onBlur = useCallback(() => setFocusVisible(false), []);
    const onKeyDown = useCallback(
        (event) => {
            if (inert || !onPress || (event.key !== "Enter" && event.key !== " "))
                return;
            event.preventDefault();
            onPress(event);
        },
        [inert, onPress]
    );

    const overlay = useMemo(() => {
        if (pressed)
            return "opacity-10";
        return hovered ? "opacity-5" : "opacity-0";
    }, [hovered, pressed]);

    return (
        <div
            ref={ref}
            role="button"
            tabIndex={inert ? -1 : 0}
            aria-label={label}
            aria-disabled={disabled || undefined}
            className={`relative cursor-pointer select-none outline-none ${className}`}
            onClick={disabled ? undefined : onPress}
            onKeyDown={onKeyDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onFocus={onFocus}
            onBlur={onBlur}
            {...rest}
        >
            <span className="contents">{children}</span>
            <span className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-black transition-opacity ${overlay}`} aria-hidden="true" />
            <span className={`ring-accent pointer-events-none absolute -inset-0.5 rounded-[inherit] ring-2 ${focusVisible ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
        </div>
    );
}
