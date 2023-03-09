import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import classnames from "classnames";

export function Footer({ todos, onClear }) {
    const { pathname: route } = useLocation();

    const activeTodos = todos.filter((todo) => !todo.completed);

    const handleOnClear = useCallback(() => {
        onClear();
    }, [onClear]);

    if (todos.length === 0) {
        return null;
    }

    return (
        <footer className="footer" data-testid="footer">
            <span className="todo-count">{`${activeTodos.length} ${activeTodos.length === 1 ? "item" : "items"} left!`}</span>
            <ul className="filters" data-testid="footer-navigation">
                <li>
                    <a className={classnames({ selected: route === "/" })} href="#/">
                        All
                    </a>
                </li>
                <li>
                    <a className={classnames({ selected: route === "/active" })} href="#/active">
                        Active
                    </a>
                </li>
                <li>
                    <a className={classnames({ selected: route === "/completed" })} href="#/completed">
                        Completed
                    </a>
                </li>
            </ul>
            <button className="clear-completed" disabled={activeTodos.length === todos.length} onClick={handleOnClear}>
                Clear completed
            </button>
        </footer>
    );
}
