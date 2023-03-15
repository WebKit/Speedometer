import cx from "classnames";
// eslint-disable-next-line no-unused-vars
import { h } from "preact";

function pluralize(count, word) {
    return count === 1 ? word : `${word}s`;
}
export default function TodoFooter({ nowShowing, count, completedCount, onClearCompleted }) {
    return (
        <footer class="footer">
            <span class="todo-count">
                <strong>{count}</strong> {pluralize(count, "item")} left
            </span>
            <ul class="filters">
                <li>
                    <a href="#/" class={cx({ selected: nowShowing === "all" })}>
                        All
                    </a>
                </li>{" "}
                <li>
                    <a href="#/active" class={cx({ selected: nowShowing === "active" })}>
                        Active
                    </a>
                </li>{" "}
                <li>
                    <a href="#/completed" class={cx({ selected: nowShowing === "completed" })}>
                        Completed
                    </a>
                </li>
            </ul>
            {completedCount > 0 && (
                <button class="clear-completed" onClick={onClearCompleted}>
                    Clear completed
                </button>
            )}
        </footer>
    );
}
