// eslint-disable-next-line no-unused-vars
import { h } from "preact";

import TodoItem from "./item";
import { FILTERS } from "./utils";

export default function TodoMain({ onChange, onToggle, onRemove, onSave, todos, route }) {
    const visibleTodos = todos.filter(FILTERS[route]);
    const activeTodoCount = todos.filter(FILTERS["active"]).length;

    return (
        <section class="main">
            <input class="toggle-all" type="checkbox" onChange={onChange} checked={activeTodoCount === 0} />
            <ul class="todo-list">
                {visibleTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onRemove={onRemove} onSave={onSave} />
                ))}
            </ul>
        </section>
    );
}
