import scrollama from "scrollama";

export function initScrollamaEngine(onUpdateCallback) {
    const scroller = scrollama();

    scroller
        .setup({
            step: ".step",
            offset: 0.5,
            progress: true,
        })
        .onStepEnter((res) => {
            onUpdateCallback(res.index, 0.0);
        })
        .onStepProgress((res) => {
            onUpdateCallback(res.index, res.progress);
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
