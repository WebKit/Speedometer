import { getCurrentUrl } from "preact-router";

export function Footer({ todos, dispatch }) {
    const route = getCurrentUrl();

    const activeTodos = todos.filter((todo) => !todo.completed);

    const removeCompleted = () => dispatch({ type: "REMOVE_COMPLETED_ITEMS" });

    if (todos.length === 0)
        return null;

    return (
        <footer class="footer" data-testid="footer">
            <span class="todo-count">{`${activeTodos.length} ${activeTodos.length === 1 ? "item" : "items"} left!`}</span>
            <ul class="filters" data-testid="footer-navigation">
                <li>
                    <a class={ route === "/" ? "selected" : "" } href="#/">
                        All
                    </a>
                </li>
                <li>
                    <a class={ route === "/active" ? "selected" : "" } href="#/active">
                        Active
                    </a>
                </li>
                <li>
                    <a class={ route === "/completed" ? "selected" : "" } href="#/completed">
                        Completed
                    </a>
                </li>
            </ul>
            <button class="clear-completed" disabled={activeTodos.length === todos.length} onClick={removeCompleted}>
                Clear completed
            </button>
        </footer>
    );
}
