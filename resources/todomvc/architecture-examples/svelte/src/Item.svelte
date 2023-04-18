<script>
    import { createEventDispatcher, tick } from 'svelte';

    const dispatch = createEventDispatcher();

    function removeItem() {
        dispatch('removeItem', { index });
    }

    function startEdit() {
        dispatch('startEdit', { index });
    }

    function handleEdit(event) {
        dispatch('handleEdit', { key: event.key, target: event.target})
    }

    function updateItem(event) {
        dispatch('updateItem', { text: event.target.value, index });
    }

    function toggleItem(event) {
        dispatch('toggleItem', { index, checked: event.target.checked });
    }

    async function focusInput(element) {
		await tick();
		element.focus();
	}

    export let item;
    export let editing;
    export let index;
</script>

<li class="{item.completed ? 'completed' : ''} {editing === index ? 'editing' : ''}">
    <div class="view">
        <input class="toggle" type="checkbox" on:change={toggleItem} checked={item.completed} />
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label on:dblclick={startEdit}>{item.description}</label>
        <button on:click={removeItem} class="destroy" />
    </div>

    {#if editing === index}
        <div class="input-container">
            <input value={item.description} id="edit-todo-input" class="edit" on:keydown={handleEdit} on:blur={updateItem} use:focusInput />
            <label class="visually-hidden" for="edit-todo-input">Edit Todo Input</label>
        </div>
    {/if}
</li>
