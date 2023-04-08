<template>
    <header class="header">
        <h1>Todos</h1>
        <input type="text" class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?"
            v-model="addModel" @keyup.enter="$emit('add-todo', this.addText); this.addText = ''"  />
    </header>
</template>

<script>
export default {
    name: 'TodoHeader',
    data() {
        return {
            addText: '',
        }
    },
    computed: {
        addModel: {
            get() { return this.addText },
            set(value) {
                this.addText = value;
            },
        }
    },
    emits: ['add-todo']
}
</script>
