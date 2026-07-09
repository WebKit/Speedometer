export function initVanillaEngine(onUpdateCallback) {
    const sections = Array.from(document.querySelectorAll(".stage-section"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && typeof window.forceScrollytellingUpdate === "function")
                    window.forceScrollytellingUpdate();

            });
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    sections.forEach((secEl) => observer.observe(secEl));

    const handleScroll = () => {
        if (typeof window.forceScrollytellingUpdate === "function")
            window.forceScrollytellingUpdate();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return observer;
}
