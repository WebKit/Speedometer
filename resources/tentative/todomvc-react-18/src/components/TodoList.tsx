import { useCallback } from "react";
import { useLoaderData, useFetcher } from "react-router-dom";
import { LoaderReturnValue } from "../logic/todo-loader";
import { TodoItem } from "./TodoItem";
import { List } from "@mui/material";

export function TodoList() {
    const { filteredTodos } = useLoaderData() as LoaderReturnValue;
    const fetcher = useFetcher();
    /* The eslint rule doesn't seem to support this case. */
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const onTodoToggle = useCallback((todoId: number) => fetcher.submit(null, { action: `/api/todos/${todoId}/toggle`, method: "POST" }), [fetcher.submit]);
    return (
        <List>
            {filteredTodos.map((todo) => (
                <fetcher.Form key={todo.id} action={`/api/todos/${todo.id}/setText`} method="POST">
                    {/* This submit button is present first, so that it's the default submit button for this form for the purpose of the
                        implicit submission algorithm. */}
                    <input type="submit" style={{ display: "none" }} />
                    {/* We use todo.text as key, so that the element is remounted when the text is changed, and the edit box is hidden.
                        The alternative would have been to listen for the Enter key inside ListItem, and hide the input in a setTimeout, but I thought this was more fragile. */}
                    <TodoItem key={todo.text} todoId={todo.id} todoText={todo.text} todoDone={todo.done} onToggle={onTodoToggle} />
                </fetcher.Form>
            ))}
        </List>
    );
}
