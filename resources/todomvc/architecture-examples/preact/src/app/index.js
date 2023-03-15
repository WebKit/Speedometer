// eslint-disable-next-line no-unused-vars
import { h, Component } from "preact";
import linkState from "linkstate";

import TodoModel from "./model";
import TodoFooter from "./footer";
import TodoItem from "./item";

const ENTER_KEY = 13;

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
        if (e.keyCode !== ENTER_KEY)
            return;

        e.preventDefault();

        let val = e.target.value.trim();

        if (val) {
            this.model.addTodo(val);
            this.setState({ newTodo: "" });
        }
    };

    toggleAll = (event) => {
        let checked = event.target.checked;
        this.model.toggleAll(checked);
    };

    toggle = (todo) => {
        this.model.toggle(todo);
    };

    destroy = (todo) => {
        this.model.destroy(todo);
    };

    edit = (todo) => {
        this.setState({ editing: todo.id });
    };

    save = (todoToSave, text) => {
        this.model.save(todoToSave, text);
        this.setState({ editing: null });
    };

    cancel = () => {
        this.setState({ editing: null });
    };

    clearCompleted = () => {
        this.model.clearCompleted();
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
                                <TodoItem key={todo.id} todo={todo} onToggle={this.toggle} onDestroy={this.destroy} onEdit={this.edit} editing={editing === todo.id} onSave={this.save} onCancel={this.cancel} />
                            ))}
                        </ul>
                    </section>
                ) : null}

                {activeTodoCount || completedCount ? <TodoFooter count={activeTodoCount} completedCount={completedCount} nowShowing={nowShowing} onClearCompleted={this.clearCompleted} /> : null}
            </div>
        );
    }
}
