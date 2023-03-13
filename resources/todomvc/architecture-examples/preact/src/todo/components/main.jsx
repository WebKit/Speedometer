import { getCurrentUrl } from "preact-router";

import { Item } from "./item";

export function Main({ todos, dispatch }) {
    const route = getCurrentUrl();

    const visibleTodos = todos.filter((todo) => {
            if (route === "/active") return !todo.completed;
            if (route === "/completed") return todo.completed;
            return todo;
        });

    const toggleAll =(e) => dispatch({ type: "TOGGLE_ALL", payload: { completed: e.target.checked } });

    return (
        <main class="main" data-testid="main">
            {visibleTodos.length > 0 ? (
                <div class="toggle-all-container">
                    <input class="toggle-all" type="checkbox" data-testid="toggle-all" checked={visibleTodos.every((todo) => todo.completed)} onChange={toggleAll} />
                    <label class="toggle-all-label" htmlFor="toggle-all">
                        Toggle All Input
                    </label>
                </div>
            ) : null}
            <ul class="todo-list" data-testid="todo-list">
                {visibleTodos.map((todo) => (
                    <Item todo={todo} key={todo.id} dispatch={dispatch} />
                ))}
            </ul>
        </main>
    );
}
