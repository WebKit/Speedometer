<script>
    import StoryItem from "./StoryItem.svelte";

    let { stories, title = "Latest news", module = "news-stream" } = $props();
</script>

<section class="stream" data-module={module}>
    <h2 class="section-title">{title}</h2>
    {#each stories as story (story.id)}
        <StoryItem {story} />
    {/each}
</section>

<style>
    .stream {
        display: grid;
        gap: 2px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 16px;
    }
</style>
