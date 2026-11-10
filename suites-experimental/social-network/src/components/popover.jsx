import { useEffect, useLayoutEffect, useRef } from "react";
import { guard } from "../analytics/guard.js";

const FOCUSABLE = "a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex='-1'])";

/**
 * An anchored, dismissable surface: focuses its first control when it opens (unless the
 * anchor keeps focus, like a combobox), keeps Tab inside itself, and closes on Escape or
 * on a press outside it and its anchor.
 */
export default function Popover({ label, anchorRef, onClose, className = "", children, role = "dialog", autoFocus = true }) {
    const ref = useRef(null);

    useLayoutEffect(() => {
        if (!autoFocus)
            return;
        const first = ref.current.querySelector(FOCUSABLE);
        (first ?? ref.current).focus({ preventScroll: true });
    }, [autoFocus]);

    useEffect(() => {
        const surface = ref.current;
        const onPointerDown = (event) =>
            guard("popover.outside", () => {
                if (!surface.contains(event.target) && !(anchorRef && anchorRef.current && anchorRef.current.contains(event.target)))
                    onClose("outside");
            });
        const onKeyDown = (event) =>
            guard("popover.keys", () => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    onClose("escape");
                    if (anchorRef && anchorRef.current)
                        anchorRef.current.focus();
                    return;
                }
                if (event.key !== "Tab")
                    return;
                const focusable = surface.querySelectorAll(FOCUSABLE);
                if (!focusable.length)
                    return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            });
        document.addEventListener("mousedown", onPointerDown, true);
        surface.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown, true);
            surface.removeEventListener("keydown", onKeyDown);
        };
    }, [anchorRef, onClose]);

    return (
        <div ref={ref} role={role} aria-label={label} tabIndex={-1} className={`bg-surface shadow-popover absolute z-40 overflow-hidden rounded-lg outline-none ${className}`}>
            {children}
        </div>
    );
}
