import { useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";

import { Item } from "./Item";

export function Main({ todos, onToggle, onDelete, onUpdate, onToggleAll }) {
    const { pathname: route } = useLocation();

    const visibleTodos = useMemo(
        () =>
            todos.filter((todo) => {
                if (route === "/active") {
                    return !todo.completed;
                }
                if (route === "/completed") {
                    return todo.completed;
                }

                return todo;
            }),
        [todos, route]
    );

    const handleChange = useCallback(
        (e) => {
            onToggleAll(e.target.checked);
        },
        [onToggleAll]
    );

    return (
        <main className="main" data-testid="main">
            {visibleTodos.length > 0 ? (
                <div className="toggle-all-container">
                    <input className="toggle-all" type="checkbox" data-testid="toggle-all" checked={visibleTodos.length > 0 && visibleTodos.every((todo) => todo.completed)} onChange={handleChange} />
                    <label className="toggle-all-label" htmlFor="toggle-all">
                        Toggle All Input
                    </label>
                </div>
            ) : null}
            <ul className="todo-list" data-testid="todo-list">
                {visibleTodos.map((todo) => (
                    <Item todo={todo} key={todo.id} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
                ))}
            </ul>
        </main>
    );
}
