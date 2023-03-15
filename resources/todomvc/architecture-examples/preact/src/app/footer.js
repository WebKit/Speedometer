import cx from "classnames";
// eslint-disable-next-line no-unused-vars
import { h } from "preact";

function pluralize(count, word) {
    return count === 1 ? word : `${word}s`;
}

export default function TodoFooter({ route, activeTodoCount, completedTodoCount, onClearCompleted }) {
    return (
        <footer class="footer">
            <span class="todo-count">
                <strong>{activeTodoCount}</strong> {pluralize(activeTodoCount, "item")} left
            </span>
            <ul class="filters">
                <li>
                    <a href="#/" class={cx({ selected: route === "all" })}>
                        All
                    </a>
                </li>{" "}
                <li>
                    <a href="#/active" class={cx({ selected: route === "active" })}>
                        Active
                    </a>
                </li>{" "}
                <li>
                    <a href="#/completed" class={cx({ selected: route === "completed" })}>
                        Completed
                    </a>
                </li>
            </ul>
            {completedTodoCount > 0 && (
                <button class="clear-completed" onClick={onClearCompleted}>
                    Clear completed
                </button>
            )}
        </footer>
    );
}
