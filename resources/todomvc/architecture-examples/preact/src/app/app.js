// eslint-disable-next-line no-unused-vars
import { h, Component } from "preact";
import linkState from "linkstate";

import TodoModel from "./model";
import TodoFooter from "./footer";
import TodoItem from "./item";

const FILTERS = {
    all: (todo) => true,
    active: (todo) => !todo.completed,
    completed: (todo) => todo.completed,
};

export default class App extends Component {
    constructor() {
        super();
        this.model = TodoModel(() => this.setState({}));
        addEventListener("hashchange", this.handleRoute.bind(this));
        this.handleRoute();
    }

    handleRoute() {
        let nowShowing = String(location.hash || "")
            .split("/")
            .pop();

        // prettier-ignore
        if (!FILTERS[nowShowing])
            nowShowing = "all";

        this.setState({ nowShowing });
    }

    handleNewTodoKeyDown = (e) => {
        // prettier-ignore
        if (e.key !== "Enter" && e.key !== "ENTER")
            return;

        e.preventDefault();

        let val = e.target.value.trim();

        if (val) {
            this.model.addItem(val);
            this.setState({ newTodo: "" });
        }
    };

    toggleAll = (event) => {
        let checked = event.target.checked;
        this.model.toggleAll(checked);
    };

    clearCompleted = () => {
        this.model.clearCompleted();
    };

    toggleItem = (todo) => {
        this.model.toggleItem(todo);
    };

    removeItem = (todo) => {
        this.model.removeItem(todo);
    };

    updateItem = (todoToSave, text) => {
        this.model.updateItem(todoToSave, text);
        this.stopEdit();
    };

    startEdit = (todo) => {
        this.setState({ editing: todo.id });
    };

    stopEdit = () => {
        this.setState({ editing: null });
    };

    // eslint-disable-next-line no-empty-pattern
    render({}, { nowShowing, newTodo, editing }) {
        let todos = this.model.getTodos(),
            shownTodos = todos.filter(FILTERS[nowShowing]),
            activeTodoCount = todos.reduce((a, todo) => a + (todo.completed ? 0 : 1), 0),
            completedCount = todos.length - activeTodoCount;

        return (
            <div>
                <header class="header">
                    <h1>todos</h1>
                    <input class="new-todo" placeholder="What needs to be done?" value={newTodo} onKeyDown={this.handleNewTodoKeyDown} onInput={linkState(this, "newTodo")} autoFocus={true} />
                </header>

                {todos.length ? (
                    <section class="main">
                        <input class="toggle-all" type="checkbox" onChange={this.toggleAll} checked={activeTodoCount === 0} />
                        <ul class="todo-list">
                            {shownTodos.map((todo) => (
                                <TodoItem key={todo.id} todo={todo} onToggle={this.toggleItem} onRemove={this.removeItem} onEdit={this.startEdit} editing={editing === todo.id} onSave={this.updateItem} onCancel={this.stopEdit} />
                            ))}
                        </ul>
                    </section>
                ) : null}

                {activeTodoCount || completedCount ? <TodoFooter count={activeTodoCount} completedCount={completedCount} nowShowing={nowShowing} onClearCompleted={this.clearCompleted} /> : null}
            </div>
        );
    }
}
