<script>
    // Renders the structured bodies from data/rooms.js the way a real client
    // walks a parsed representation: a block switch outside, an inline span
    // switch inside.
    import { getActions } from "../actions.js";

    let { blocks } = $props();
    const { selectRoom } = getActions();

    // No navigation in a timed step, so hrefs are data only.
    const preventDefault = (event) => event.preventDefault();
</script>

{#snippet spans(items)}
    {#each items as span}
        {#if span.type === "code"}
            <code class="rich-code">{span.text}</code>
        {:else if span.type === "link"}
            <a class="rich-link" href={span.href} onclick={preventDefault}>{span.text}</a>
        {:else if span.type === "mention"}
            <span class="rich-pill rich-pill-mention">@{span.name}</span>
        {:else if span.type === "room"}
            <button class="rich-pill rich-pill-room" type="button" onclick={() => selectRoom(span.roomId)}>#{span.name}</button>
        {:else}
            {span.text}
        {/if}
    {/each}
{/snippet}

{#each blocks as block}
    {#if block.type === "code"}
        <pre class="rich-code-block" data-lang={block.lang}><code>{block.lines.join("\n")}</code></pre>
    {:else if block.type === "quote"}
        <blockquote class="rich-quote">{@render spans(block.spans)}</blockquote>
    {:else if block.type === "image"}
        <!-- Intrinsic width/height so the row reserves its space before the image
             decodes. Without them the height would change after layout,
             invalidating the timeline's height cache. -->
        <img class="rich-image" src={block.src} width={block.width} height={block.height} alt={block.alt} decoding="sync" />
    {:else if block.type === "unfurl"}
        <a class="rich-unfurl" href={block.href} onclick={preventDefault}>
            <img class="rich-unfurl-thumb" src={block.thumbSrc} width={block.thumbWidth} height={block.thumbHeight} alt="" decoding="sync" />
            <span class="rich-unfurl-body">
                <span class="rich-unfurl-site">{block.site}</span>
                <span class="rich-unfurl-title">{block.title}</span>
                <span class="rich-unfurl-description">{block.description}</span>
            </span>
        </a>
    {:else if block.type === "list"}
        <ul class="rich-list">
            {#each block.items as item}
                <li>{@render spans(item)}</li>
            {/each}
        </ul>
    {:else}
        <p class="rich-paragraph">{@render spans(block.spans)}</p>
    {/if}
{/each}
