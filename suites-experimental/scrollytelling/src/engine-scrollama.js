import scrollama from "scrollama";

export function initScrollamaEngine(onUpdateCallback) {
    const scroller = scrollama();

    scroller
        .setup({
            step: ".stage-section",
            offset: 0.5,
            progress: true,
        })
        .onStepEnter((res) => {
            onUpdateCallback(res.index, 0.0);
            if (typeof window.forceScrollytellingUpdate === "function")
                window.forceScrollytellingUpdate();
        })
        .onStepProgress((res) => {
            onUpdateCallback(res.index, res.progress);
            if (typeof window.forceScrollytellingUpdate === "function")
                window.forceScrollytellingUpdate();
        });

    window.addEventListener(
        "resize",
        () => {
            scroller.resize();
        },
        { passive: true }
    );

    return scroller;
}
