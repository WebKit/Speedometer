// eslint-disable-next-line no-unused-vars
import { h, Component } from "preact";

import TodoModel from "./model";
import TodoHeader from "./header";
import TodoFooter from "./footer";
import TodoItem from "./item";

const FILTERS = {
    all: (todo) => true,
    active: (todo) => !todo.completed,
    completed: (todo) => todo.completed,
};

const getRoute = () => {
    let route = String(location.hash || "")
        .split("/")
        .pop();

    // prettier-ignore
    if (!FILTERS[route])
        route = "all";

    return route;
};

export default class App extends Component {
    constructor() {
        super();
        this.model = TodoModel(() => this.setState({}));
        addEventListener("hashchange", this.handleRoute.bind(this));
        this.handleRoute();
    }

    handleRoute() {
        this.setState({ route: getRoute() });
    }

    handleKeyDown = (e) => {
        // prettier-ignore
        if (e.key !== "Enter" && e.key !== "ENTER")
            return;

        e.preventDefault();

        let val = e.target.value.trim();

        if (val) {
            this.model.addItem(val);
            e.target.value = "";
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
    };

    // eslint-disable-next-line no-empty-pattern
    render({}, { route }) {
        const todos = this.model.getTodos();
        const visibleTodos = todos.filter(FILTERS[route]);
        const activeTodoCount = todos.filter(FILTERS["active"]).length;
        const completedTodoCount = todos.length - activeTodoCount;

        return (
            <div>
                <TodoHeader onKeyDown={this.handleKeyDown} />

                {todos.length ? (
                    <section class="main">
                        <input class="toggle-all" type="checkbox" onChange={this.toggleAll} checked={activeTodoCount === 0} />
                        <ul class="todo-list">
                            {visibleTodos.map((todo) => (
                                <TodoItem key={todo.id} todo={todo} onToggle={this.toggleItem} onRemove={this.removeItem} onSave={this.updateItem} />
                            ))}
                        </ul>
                    </section>
                ) : null}

                {todos.length > 0 ? <TodoFooter activeTodoCount={activeTodoCount} completedTodoCount={completedTodoCount} route={route} onClearCompleted={this.clearCompleted} /> : null}
            </div>
        );
    }
}
