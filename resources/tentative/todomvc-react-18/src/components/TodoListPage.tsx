import { Paper } from "@mui/material";
import { TodoTestActions } from "./TodoTestActions";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";
import { TodoNav } from "./TodoNav";
import { TodoExtraActions } from "./TodoExtraActions";

export function TodoListPage() {
    return (
        <>
            <TodoTestActions />
            <Paper elevation={1}>
                <TodoInput />
                <TodoList />
                <TodoExtraActions />
                <TodoNav />
            </Paper>
        </>
    );
}
