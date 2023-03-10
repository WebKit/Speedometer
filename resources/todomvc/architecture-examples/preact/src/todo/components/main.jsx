import { useMemo, useCallback } from "preact/hooks";
// import { useLocation } from "react-router-dom";

import { Item } from "./item";

export function Main({ todos, dispatch }) {
    // const { pathname: route } = useLocation();
    const route = "";

    const visibleTodos = useMemo(
        () =>
            todos.filter((todo) => {
                if (route === "/active")
                    return !todo.completed;

                if (route === "/completed")
                    return todo.completed;

                return todo;
            }),
        [todos, route]
    );

    const toggleAll = useCallback((e) => dispatch({ type: "TOGGLE_ALL", payload: { completed: e.target.checked } }), [dispatch]);

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
