<template>
    <section class="todoapp">
        <TodoHeader @add-todo="addTodo" />
        <section class="main" v-show="todos.length" v-cloak>
            <div class="toggle-all-container">
                <input type="checkbox" id="toggle-all-input" class="toggle-all" v-model="toggleAllModel" />
                <label class="toggle-all-label" htmlFor="toggle-all-input"> Toggle All Input </label>
            </div>
            <ul class="todo-list">
                <li class="todo" :key="todo.id" v-for="todo in filteredTodos" :class="{ completed: todo.completed, editing: todo === editing }">
                    <div class="view">
                        <input type="checkbox" v-model="todo.completed" class="toggle" />
                        <label @dblclick="startEdit(todo)">{{ todo.title }}</label>
                        <button class="destroy" @click.prevent="deleteTodo(todo)"></button>
                    </div>
                    <input type="text" class="edit" v-model="todo.title" @keyup.enter="finishEdit" @blur="finishEdit" v-todoFocus="todo === editing" />
                </li>
            </ul>
        </section>
        <TodoFooter :todos="todos" @delete-completed="deleteCompleted" :remaining="activeTodos.length" :completed="completedTodos.length" :route="route" />
    </section>
</template>

<script>
import { nextTick } from "vue";
import TodoHeader from "./TodoHeader.vue";
import TodoFooter from "./TodoFooter.vue";

function uuid() {
    let uuid = "";
    for (let i = 0; i < 32; i++) {
        let random = (Math.random() * 16) | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-";

        uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
    }
    return uuid;
}

const filters = {
    all: (todos) => todos,
    active: (todos) => todos.filter((todo) => !todo.completed),
    completed: (todos) => todos.filter((todo) => todo.completed),
};

export default {
    components: {
        TodoHeader,
        TodoFooter,
    },
    data() {
        return {
            todos: [],
            editing: null,
        };
    },
    directives: {
        todoFocus(el, value) {
            if (value) {
                // eslint-disable-next-line no-unused-vars
                nextTick((_) => {
                    el.focus();
                });
            }
        },
    },
    methods: {
        addTodo(value) {
            this.todos.push({
                completed: false,
                title: value,
                id: uuid(),
            });
        },
        deleteTodo(todo) {
            this.todos = this.todos.filter((t) => t !== todo);
        },
        deleteCompleted() {
            this.todos = this.activeTodos;
        },
        startEdit(todo) {
            this.editing = todo;
        },
        finishEdit() {
            this.editing = null;
        },
    },
    computed: {
        activeTodos() {
            return filters.active(this.todos);
        },
        completedTodos() {
            return filters.completed(this.todos);
        },
        filteredTodos() {
            switch (this.$route.name) {
                case "active":
                    return this.activeTodos;
                case "completed":
                    return this.completedTodos;
            }
            return this.todos;
        },
        route() {
            return this.$route.name;
        },
        toggleAllModel: {
            get() {
                return this.activeTodos.length === 0;
            },
            set(value) {
                this.todos.forEach((todo) => {
                    todo.completed = value;
                });
            },
        },
    },
};
</script>

<style src="./todos-component.css"></style>
<style src="../../node_modules/todomvc-common/base.css"></style>
<style src="../../node_modules/todomvc-app-css/index.css"></style>
