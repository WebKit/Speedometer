import { useState, useCallback } from "preact/hooks";
import { memo } from "preact/compat";

import { Input } from "./input";

export const Item = memo(function Item({ todo, dispatch }) {
    const [isWritable, setIsWritable] = useState(false);
    const { title, completed, id } = todo;

    const toggleItem = useCallback(() => dispatch({ type: "TOGGLE_ITEM", payload: { id } }), [dispatch]);
    const removeItem = useCallback(() => dispatch({ type: "REMOVE_ITEM", payload: { id } }), [dispatch]);
    const updateItem = useCallback((id, title) => dispatch({ type: "UPDATE_ITEM", payload: { id, title } }), [dispatch]);

    const handleDoubleClick = useCallback(() => {
        setIsWritable(true);
    });

    const handleBlur = useCallback(() => {
        setIsWritable(false);
    });

    const handleUpdate = useCallback(
        (title) => {
            if (title.length === 0)
                removeItem(id);
            else
                updateItem(id, title);

            setIsWritable(false);
        },
        [id, removeItem, updateItem]
    );

    return (
        <li class={todo.completed ? "completed" : "" } data-testid="todo-item">
            <div class="view">
                {isWritable ? (
                    <Input onSubmit={handleUpdate} label="Edit Todo Input" defaultValue={title} onBlur={handleBlur} />
                ) : (
                    <>
                        <input class="toggle" type="checkbox" data-testid="todo-item-toggle" checked={completed} onChange={toggleItem} />
                        <label data-testid="todo-item-label" onDoubleClick={handleDoubleClick}>
                            {title}
                        </label>
                        <button class="destroy" data-testid="todo-item-button" onClick={removeItem} />
                    </>
                )}
            </div>
        </li>
    );
});