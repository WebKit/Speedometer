<script>
    import { createEventDispatcher, tick } from 'svelte';

    let editing = false;

    const dispatch = createEventDispatcher();

    function removeItem() {
        dispatch('removeItem');
    }

    function startEdit() {
       editing = true;
    }

    function handleEdit(event) {
        if (event.key === "Enter")
            event.target.blur();
        else if (event.key === "Escape") 
            editing = false;
    }

    function updateItem(event) {
        if (!editing) return;
        dispatch('updateItem', { text: event.target.value });
        editing = false;
    }

    function toggleItem(event) {
        dispatch('toggleItem', { checked: event.target.checked });
    }

    async function focusInput(element) {
		await tick();
		element.focus();
	}

    export let item;
</script>

<li class="{item.completed ? 'completed' : ''} {editing ? 'editing' : ''}">
    <div class="view">
        <input class="toggle" type="checkbox" on:change={toggleItem} checked={item.completed} />
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label on:dblclick={startEdit}>{item.description}</label>
        <button on:click={removeItem} class="destroy" />
    </div>

    {#if editing}
        <div class="input-container">
            <input value={item.description} id="edit-todo-input" class="edit" on:keydown={handleEdit} on:blur={updateItem} use:focusInput />
            <label class="visually-hidden" for="edit-todo-input">Edit Todo Input</label>
        </div>
    {/if}
</li>
