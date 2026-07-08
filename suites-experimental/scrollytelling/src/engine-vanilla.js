export function initVanillaEngine(onUpdateCallback) {
    const steps = Array.from(document.querySelectorAll(".step"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const idx = steps.indexOf(entry.target);
                    if (idx !== -1) onUpdateCallback(idx, 0.0);
                }
            });
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    steps.forEach((stepEl) => observer.observe(stepEl));

    const handleScroll = () => {
        if (typeof window.forceScrollytellingUpdate === "function") window.forceScrollytellingUpdate();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return observer;
}
