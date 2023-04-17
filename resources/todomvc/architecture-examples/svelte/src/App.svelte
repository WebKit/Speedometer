<script>
	import { tick } from 'svelte';
    import { router } from './router.js';
    import { uuid } from './utils.js';

    import Header from './Header.svelte';
    import Footer from './Footer.svelte';

    import "./app.css";
    import "todomvc-app-css/index.css";
    import "todomvc-common/base/css";

    let currentFilter = "all";
    let items = [];
    let editing = null;

    function addItem(event) {
        items = items.concat({
            id: uuid(),
            description: event.detail.text,
            completed: false,
        });
    }

    function removeItem(index) {
        items = items.slice(0, index).concat(items.slice(index + 1));
    }

    function updateItem(event) {
        const text = event.target.value.trim();

        if (text.length === 0) {
            removeItem(event.target.getAttribute('data-index'));
        } else {
            items[editing].description = text;
        }

        editing = null;
    }

    function toggleAllItems(event) {
        const checked = event.target.checked;
        items = items.map((item) => ({
        ...item,
        completed: checked,
        }));
    }

    function removeCompletedItems() {
        items = items.filter((item) => !item.completed);
    }

    function handleEdit(event) {
        if (event.key === "Enter") event.target.blur();
        else if (event.key === "Escape") editing = null;
    }

	async function focusInput(element) {
		await tick();
		element.focus();
	}
    
    router(route => currentFilter = route).init();

    $: filtered = currentFilter === "all" ? items : currentFilter === "completed" ? items.filter((item) => item.completed) : items.filter((item) => !item.completed);
    $: numActive = items.filter((item) => !item.completed).length;
    $: numCompleted = items.filter((item) => item.completed).length;
</script>

<Header on:addItem={addItem} />

{#if items.length > 0}
    <section class="main">
        <input id="toggle-all" class="toggle-all" type="checkbox" on:change={toggleAllItems} checked={numCompleted === items.length} />
        <label for="toggle-all">Mark all as complete</label>

        <ul class="todo-list">
            {#each filtered as item, index (item.id)}
                <li class="{item.completed ? 'completed' : ''} {editing === index ? 'editing' : ''}">
                    <div class="view">
                        <input class="toggle" type="checkbox" bind:checked={item.completed} />
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label on:dblclick={() => (editing = index)}>{item.description}</label>
                        <button on:click={() => removeItem(index)} class="destroy" />
                    </div>

                    {#if editing === index}
                        <div class="input-container">
                            <!-- svelte-ignore a11y-autofocus -->
                            <input value={item.description} data-index={index} id="edit-todo-input" class="edit" on:keydown={handleEdit} on:blur={updateItem} use:focusInput />
                            <label class="visually-hidden" for="edit-todo-input">Edit Todo Input</label>
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>

        <Footer numActive={numActive} currentFilter={currentFilter}, numCompleted={numCompleted} on:removeCompletedItems={removeCompletedItems} />
    </section>
{/if}
