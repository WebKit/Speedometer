import cx from "classnames";
// eslint-disable-next-line no-unused-vars
import { h } from "preact";
import { useState } from "preact/hooks";
export default function TodoItem({ onSave, onRemove, onToggle, todo }) {
    const [editing, setEditing] = useState(false);

    function handleSubmit(e) {
        const val = e.target.value.trim();
        if (val) {
            onSave(todo, val);
            setEditing(false);
        } else {
            onRemove(todo);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Escape" || e.key === "ESCAPE") setEditing(false);
        else if (e.key === "Enter" || e.key === "ENTER") handleSubmit(e);
    }

    function handleDoubleClick() {
        setEditing(true);
    }

    function handleToggle(e) {
        onToggle(todo);
        e.preventDefault();
    }

    function handleRemove() {
        onRemove(todo);
    }

    return (
        <li class={cx({ completed: todo.completed, editing })}>
            <div class="view">
                <input class="toggle" type="checkbox" checked={todo.completed} onChange={handleToggle} />
                <label onDblClick={handleDoubleClick}>{todo.title}</label>
                <button class="destroy" onClick={handleRemove} />
            </div>
            {editing && <input class="edit" onBlur={handleSubmit} onKeyDown={handleKeyDown} autoFocus defaultValue={todo.title} />}
        </li>
    );
}
