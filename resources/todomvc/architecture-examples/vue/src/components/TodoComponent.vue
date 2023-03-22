<template>
    <section class="todoapp">
        <header class="header">
            <h1>Todos</h1>
            <input type="text" class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?"
                v-model="newTodo" @keyup.enter="addTodo" />
        </header>
        <section class="main" v-show="todos.length" v-cloak>
            <div class="toggle-all-container">
                <input type="checkbox" id="toggle-all-input" class="toggle-all" v-model="allDone" />
                <label class="toggle-all-label" htmlFor="toggle-all-input">
                    Toggle All Input
                </label>
            </div>
            <ul class="todo-list">
                <li class="todo" :key="todo.id" v-for="todo in filteredTodos"
                    :class="{ completed: todo.completed, editing: todo === editing }">
                    <div class="view">
                        <input type="checkbox" v-model="todo.completed" class="toggle">
                        <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
                        <button class="destroy" @click.prevent="deleteTodo(todo)"></button>
                    </div>
                    <input type="text" class="edit" v-model="todo.title" @keyup.enter="doneEdit" @blur="doneEdit"
                        v-todoFocus="todo === editing" />
                </li>
            </ul>
        </section>
        <footer class="footer" v-show="todos.length > 0">
            <span class="todo-count">
                <strong>{{ remaining }}</strong> {{ pluralizedWord }} left
            </span>
            <ul class="filters">
                <li><router-link to="/" :class="{ selected: route == 'all' }">All</router-link></li>
                <li><router-link to="/active" :class="{ selected: route == 'active' }">Active</router-link></li>
                <li><router-link to="/completed" :class="{ selected: route == 'completed' }">Completed</router-link></li>
            </ul>
            <button class="clear-completed" v-show="completed" @click.prevent="deleteCompleted">Clear Completed</button>
        </footer>
    </section>
</template>

<script>
import { nextTick } from 'vue';

export default {
    data() {
        return {
            todos: [],
            newTodo: '',
            editing: null
        }
    },
    directives: {
        todoFocus(el, value) {
            if (value) {
                // eslint-disable-next-line no-unused-vars
                nextTick(_ => {
                    el.focus()
                })
            }
        }
    },
    methods: {
        addTodo() {
            this.todos.push({
                completed: false,
                title: this.newTodo
            })
            this.newTodo = ''
        },
        deleteTodo(todo) {
            this.todos = this.todos.filter(t => t !== todo)
        },
        deleteCompleted() {
            this.todos = this.todos.filter(todo => !todo.completed)
        },
        editTodo(todo) {
            this.editing = todo
        },
        doneEdit() {
            this.editing = null
        }
    },
    computed: {
        remaining() {
            return this.todos.filter(todo => !todo.completed).length
        },
        pluralizedWord() {
            return this.remaining === 1 ? 'item' : 'items'
        },
        completed() {
            return this.todos.filter(todo => todo.completed).length
        },
        filteredTodos() {
            if (this.$route.name === 'active') {
                return this.todos.filter(todo => !todo.completed)
            } else if (this.$route.name === 'completed') {
                return this.todos.filter(todo => todo.completed)
            }
            return this.todos
        },
        route() {
            return this.$route.name;
        },
        allDone: {
            get() {
                return this.remaining === 0
            },
            set(value) {
                this.todos.forEach(todo => {
                    todo.completed = value
                });
            }
        }
    }
}
</script>

<style src="./todo-component.css"></style>
<style src="../../node_modules/todomvc-common/base.css"></style>
<style src="../../node_modules/todomvc-app-css/index.css"></style>
