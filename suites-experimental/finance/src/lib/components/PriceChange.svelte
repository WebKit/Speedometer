<script>
    import { trend } from "../format.js";

    // Shows one live field of a quote and flashes when the stream moves it.
    let { quote, field = "price", format, colored = false } = $props();
</script>

{#key quote.revision}
    <span class={["live-value", colored && trend(quote.change), quote.revision && quote.direction > 0 && "flash-up", quote.revision && quote.direction < 0 && "flash-down"]}>{format(quote[field])}</span>
{/key}
