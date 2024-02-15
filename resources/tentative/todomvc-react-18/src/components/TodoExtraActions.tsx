import { Box, Button } from "@mui/material";
import { useLoaderData, Form } from "react-router-dom";
import type { LoaderReturnValue } from "../logic/todo-loader";
export function TodoExtraActions() {
    const { allTodos } = useLoaderData() as LoaderReturnValue;
    const hasCompletedItems = allTodos.some((todo) => todo.done);

    return hasCompletedItems ? (
        <Box sx={{ width: "100%", textAlign: "right" }}>
            <Form method="post" action="/api/todos/removeCompleted" navigate={false}>
                <Button type="submit">Clear completed items</Button>
            </Form>
        </Box>
    ) : null;
}
