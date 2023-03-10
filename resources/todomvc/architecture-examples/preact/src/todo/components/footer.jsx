import { useCallback, useMemo } from "preact/hooks";
// import { useLocation } from "react-router-dom";
import classs from "classs";

export function Footer({ todos, dispatch }) {
    // const { pathname: route } = useLocation();
    const route = "";

    const activeTodos = useMemo(() => todos.filter((todo) => !todo.completed), [todos]);

    const removeCompleted = useCallback(() => dispatch({ type: "REMOVE_COMPLETED_ITEMS" }), [dispatch]);

    if (todos.length === 0)
        return null;

    return (
        <footer class="footer" data-testid="footer">
            <span class="todo-count">{`${activeTodos.length} ${activeTodos.length === 1 ? "item" : "items"} left!`}</span>
            <ul class="filters" data-testid="footer-navigation">
                <li>
                    <a class={classs({ selected: route === "/" })} href="#/">
                        All
                    </a>
                </li>
                <li>
                    <a class={classs({ selected: route === "/active" })} href="#/active">
                        Active
                    </a>
                </li>
                <li>
                    <a class={classs({ selected: route === "/completed" })} href="#/completed">
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
