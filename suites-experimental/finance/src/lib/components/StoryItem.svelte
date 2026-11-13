<script>
    import { NOW } from "../data/market.js";
    import { formatRelative } from "../format.js";
    import Icon from "./Icon.svelte";
    import IconButton from "./IconButton.svelte";
    import TickerChip from "./TickerChip.svelte";

    let { story, lead = false } = $props();
    const initials = $derived(
        story.source
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
    );
</script>

<article class={["story", lead && "lead"]} data-module={lead ? "lead-story" : "stream-item"}>
    <a class="story-figure-link" href="#/" tabindex="-1" aria-hidden="true">
        <figure class="story-figure" style:--hue={story.hue}>
            <div class="story-image"></div>
            {#if story.video}
                <span class="badge tw-inline-flex tw-items-center tw-gap-1"><Icon name="play" size={12} />Video</span>
            {/if}
        </figure>
    </a>
    <div class="tw-grid tw-content-start tw-gap-1.5">
        <div class="tw-flex tw-flex-wrap tw-gap-1.5">
            {#each story.tickers as quote (quote.symbol)}
                <TickerChip {quote} />
            {/each}
        </div>
        <h3 class="story-title"><a class="hover:tw-underline" href="#/">{story.title}</a></h3>
        <p class="story-summary">{story.summary}</p>
        <div class="tw-flex tw-items-center tw-justify-between tw-gap-2">
            <div class="tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-text-muted">
                <span class="publisher-logo" style:--hue={story.hue}>{initials}</span>
                <span class="tw-font-semibold">{story.source}</span>
                <span aria-hidden="true">•</span>
                <time datetime={new Date(story.publishedAt).toISOString()}>{formatRelative(story.publishedAt, NOW)}</time>
                {#if story.premium}<span class="premium-tag">Plus</span>{/if}
            </div>
            <div class="tw-flex tw-items-center">
                <IconButton icon="share" label="Share" />
                <IconButton icon="bookmark" label="Save for later" toggles />
                <IconButton icon="more" label="More options" />
            </div>
        </div>
    </div>
</article>

<style>
    .story {
        display: grid;
        grid-template-columns: 160px minmax(0, 1fr);
        gap: 16px;
        padding: 14px 0;
        border-bottom: 1px solid var(--line);
    }

    .story:last-child {
        border-bottom: none;
    }

    .story.lead {
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 16px;
    }

    .story-figure {
        position: relative;
        margin: 0;
        border-radius: 8px;
        overflow: hidden;
        content-visibility: auto;
        contain-intrinsic-size: auto 100px;
    }

    .story-image {
        aspect-ratio: 16 / 10;
        background: linear-gradient(135deg, hsl(var(--hue) 55% 62%), hsl(calc(var(--hue) + 50) 60% 38%));
    }

    .badge {
        position: absolute;
        left: 8px;
        bottom: 8px;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 11px;
        font-weight: 600;
    }

    .story-title {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.3;
    }

    .lead .story-title {
        font-size: 24px;
        line-height: 1.2;
    }

    .story-summary {
        margin: 0;
        color: var(--muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .publisher-logo {
        display: inline-grid;
        place-items: center;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: hsl(var(--hue) 30% 90%);
        color: hsl(var(--hue) 40% 30%);
        font-size: 9px;
        font-weight: 800;
    }

    .premium-tag {
        padding: 0 6px;
        border-radius: 4px;
        background: #1f2a44;
        color: white;
        font-size: 11px;
    }

    @media (max-width: 760px) {
        .story,
        .story.lead {
            grid-template-columns: 96px minmax(0, 1fr);
        }

        .story-summary {
            display: none;
        }
    }
</style>
