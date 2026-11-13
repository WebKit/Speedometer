<script>
    import { drawSparkline, observeSize } from "../charts.js";

    let { quote } = $props();
    let canvas;
    let size = $state.raw(null);

    $effect(() => observeSize(canvas, (measured) => (size = measured)));

    $effect(() => {
        if (size)
            drawSparkline(canvas, size, quote.series, quote.previousClose);
    });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
    canvas {
        display: block;
        width: 100%;
        height: 32px;
    }
</style>
