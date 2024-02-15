import { TextField, IconButton, Box } from "@mui/material";

// Note: we're importing the icons using a deep import to work around an issue
// with Firefox devtools in development mode.
import AddIcon from "@mui/icons-material/Add";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

import { useFetcher, useLoaderData } from "react-router-dom";
import type { LoaderReturnValue } from "../logic/todo-loader";

export function TodoInput() {
    const { allTodos } = useLoaderData() as LoaderReturnValue;
    const hasTodos = allTodos.length > 0;
    const areAllCompleted = allTodos.every((todo) => todo.done);
    const fetcher = useFetcher();
    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            {hasTodos ? (
                <fetcher.Form action="/api/todos/toggleAll" method="post">
                    <IconButton type="submit" aria-label={areAllCompleted ? "Reset all entries" : "Mark all entries as completed"} sx={areAllCompleted ? { color: "black" } : null} name="value" value={String(!areAllCompleted)}>
                        <KeyboardDoubleArrowDownIcon />
                    </IconButton>
                </fetcher.Form>
            ) : null}
            <fetcher.Form
                method="POST"
                action="/api/todos/new"
                style={{ display: "flex", alignItems: "center", flex: "auto" }}
                onSubmit={(e) => {
                    const form = e.currentTarget;
                    const { todoText } = form.elements as unknown as { todoText: HTMLInputElement };

                    setTimeout(() => {
                        todoText.value = "";
                    });
                }}
            >
                <TextField name="todoText" placeholder="What needs to be done?" sx={{ flex: "auto" }} />
                <IconButton aria-label="add" type="submit">
                    <AddIcon />
                </IconButton>
            </fetcher.Form>
        </Box>
    );
}
