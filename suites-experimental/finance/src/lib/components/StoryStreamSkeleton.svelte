<script>
    let { count } = $props();
</script>

<div class="stream" aria-busy="true">
    {#each { length: count }, index (index)}
        <div class="skeleton">
            <div class="loader tw-aspect-[16/10]"></div>
            <div class="tw-grid tw-content-start tw-gap-2">
                <div class="loader tw-h-3.5 tw-w-3/12"></div>
                <div class="loader tw-h-3.5"></div>
                <div class="loader tw-h-3.5"></div>
                <div class="loader tw-h-3.5 tw-w-6/12"></div>
            </div>
        </div>
    {/each}
</div>

<style>
    .stream {
        display: grid;
        gap: 2px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 16px;
    }

    .skeleton {
        display: grid;
        grid-template-columns: 160px minmax(0, 1fr);
        gap: 16px;
        padding: 14px 0;
    }
</style>
