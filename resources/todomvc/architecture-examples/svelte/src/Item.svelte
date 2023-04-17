<script>
    import { createEventDispatcher, tick } from 'svelte';

    const dispatch = createEventDispatcher();

    function removeItem() {
        dispatch('removeItem', { index });
    }

    function startEdit() {
        dispatch('startEdit', { index })
    }

    function handleEdit(event) {
        if (event.key === "Enter")
            return event.target.blur();
        else if (event.key === "Escape") 
            return dispatch('cancelEdit');
    }

    function updateItem(event) {
        if (editing === null) return;

        const text = event.target.value.trim();

        if (text.length === 0) {
            removeItem();
        } else {
            dispatch('updateItem', { text: event.target.value })
        }
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
        <label on:dblclick={() => startEdit()}>{item.description}</label>
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
