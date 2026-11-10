// The design system's interactive surface: a focusable role=button with its own hover
// and focus-ring overlays, so every control draws its states the same way.
export default function Pressable({ className = "", children, onPress, label, disabled = false, ...rest }) {
    const onKeyDown = (event) => {
        if (disabled || !onPress || (event.key !== "Enter" && event.key !== " "))
            return;
        event.preventDefault();
        onPress(event);
    };
    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-disabled={disabled || undefined}
            className={`group relative cursor-pointer select-none outline-none ${className}`}
            onClick={disabled ? undefined : onPress}
            onKeyDown={onKeyDown}
            {...rest}
        >
            <span className="contents">{children}</span>
            <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black opacity-0 transition-opacity group-hover:opacity-5 group-active:opacity-10" aria-hidden="true" />
            <span className="ring-accent pointer-events-none absolute -inset-0.5 rounded-[inherit] opacity-0 ring-2 group-focus-visible:opacity-100" aria-hidden="true" />
        </div>
    );
}
