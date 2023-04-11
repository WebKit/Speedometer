<script>
	import { tick } from 'svelte';
    import { router } from './router.js';
    import { uuid } from './utils.js';

    import "./app.css";
    import "todomvc-app-css/index.css";
    import "todomvc-common/base/css";

    let currentFilter = "all";
    let items = [];
    let editing = null;

    function addItem(event) {
        const text = event.target.value.trim();

        if (event.key === "Enter") {
            items = items.concat({
                id: uuid(),
                description: text,
                completed: false,
            });
            event.target.value = "";
        }
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
        items = items.map((item) => ({
        ...item,
        completed: event.target.checked,
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

<header class="header">
    <h1>todos</h1>
    <!-- svelte-ignore a11y-autofocus -->
    <input class="new-todo" on:keydown={addItem} placeholder="What needs to be done?" autofocus />
</header>

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

        <footer class="footer">
            <span class="todo-count">
                <strong>{numActive}</strong>
                {numActive === 1 ? "item" : "items"} left
            </span>

            <ul class="filters">
                <li><a class={currentFilter === "all" ? "selected" : ""} href="#/">All</a></li>
                <li><a class={currentFilter === "active" ? "selected" : ""} href="#/active">Active</a></li>
                <li><a class={currentFilter === "completed" ? "selected" : ""} href="#/completed">Completed</a></li>
            </ul>

            {#if numCompleted}
                <button class="clear-completed" on:click={removeCompletedItems}> Clear completed </button>
            {/if}
        </footer>
    </section>
{/if}
