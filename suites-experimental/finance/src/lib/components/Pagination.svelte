<script>
    import Icon from "./Icon.svelte";

    let { total, pageIndex = $bindable(), pageSize = $bindable() } = $props();
    const pageCount = $derived(Math.ceil(total / pageSize));
    const first = $derived(pageIndex * pageSize + 1);
    const last = $derived(Math.min(total, (pageIndex + 1) * pageSize));

    function setPageSize(event) {
        pageSize = Number(event.currentTarget.value);
        pageIndex = 0;
    }
</script>

<div class="tw-flex tw-items-center tw-justify-end tw-gap-4" data-module="pagination">
    <label class="tw-flex tw-items-center tw-gap-1.5">
        Rows per page
        <select id="page-size" class="tw-rounded tw-border tw-border-line tw-px-1.5 tw-py-0.5" value={pageSize} onchange={setPageSize}>
            {#each [25, 50, 100] as size (size)}
                <option value={size}>{size}</option>
            {/each}
        </select>
    </label>
    <span class="tw-text-muted">{first}-{last} of {total} results</span>
    <div class="tw-flex tw-gap-1">
        <button id="page-previous" type="button" disabled={pageIndex === 0} onclick={() => pageIndex--} aria-label="Previous page"><Icon name="chevronLeft" /></button>
        {#each { length: pageCount }, index (index)}
            <button class={[index === pageIndex && "active"]} type="button" onclick={() => (pageIndex = index)}>{index + 1}</button>
        {/each}
        <button id="page-next" type="button" disabled={pageIndex >= pageCount - 1} onclick={() => pageIndex++} aria-label="Next page"><Icon name="chevronRight" /></button>
    </div>
</div>

<style>
    button {
        display: grid;
        place-items: center;
        min-width: 30px;
        height: 30px;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: var(--surface);
    }

    button.active {
        background: var(--ink);
        color: white;
    }

    button:disabled {
        opacity: 0.4;
    }
</style>
