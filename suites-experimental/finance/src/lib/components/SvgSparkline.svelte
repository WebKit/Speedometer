<script>
    import { svgSparklinePath } from "../charts.js";
    import { trend } from "../format.js";

    let { quote, width = 96, height = 32 } = $props();
    const shape = $derived(svgSparklinePath(quote.series, quote.previousClose, width, height));
</script>

<div class="sparkline-frame" style:width="{width}px" style:height="{height}px">
    <svg class={trend(quote.change)} viewBox="0 0 {width} {height}" {width} {height} aria-hidden="true">
        <line x1="0" x2={width} y1={shape.baselineY} y2={shape.baselineY} />
        <path d={shape.path} />
    </svg>
</div>

<style>
    .sparkline-frame {
        flex: none;
    }

    svg {
        display: block;
        overflow: visible;
    }

    line {
        stroke: var(--muted);
        stroke-dasharray: 2 3;
        stroke-width: 1;
        opacity: 0.6;
    }

    path {
        fill: none;
        stroke-width: 1.5;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
    }

    .up path {
        stroke: var(--up);
    }

    .down path {
        stroke: var(--down);
    }
</style>
