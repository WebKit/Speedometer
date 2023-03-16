import cx from "classnames";
// eslint-disable-next-line no-unused-vars
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
export default function TodoItem({ onSave, onRemove, onToggle, todo }) {
    const [editing, setEditing] = useState(false);


    /**
     * useEffect keeps track of the 'editing' state change.
     * If the input field is present, we set focus programmatically.
     */
    useEffect(() => {
        const input = document.querySelector(".editing");
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }, [editing])

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
        // prettier-ignore
        if (e.key === "Escape" || e.key === "ESCAPE")
            setEditing(false);
        else if (e.key === "Enter" || e.key === "ENTER")
            handleSubmit(e);
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
            {editing && <input class="edit" onBlur={handleSubmit} onKeyDown={handleKeyDown} defaultValue={todo.title} />}
        </li>
    );
}
