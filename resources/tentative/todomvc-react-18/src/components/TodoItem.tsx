import { Input, ListItem, ListItemIcon, ListItemButton, ListItemText, Checkbox, IconButton } from "@mui/material";

// Note: we're importing the icons using a deep import to work around an issue
// with Firefox devtools in development mode.
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useState, memo } from "react";

interface TodoItemProps {
    todoId: number;
    todoText: string;
    todoDone: boolean;
    onToggle: (todoId: number) => unknown;
}

export const TodoItem = memo(function ({ todoId, todoText, todoDone, onToggle }: TodoItemProps) {
    const [edit, setEdit] = useState(false);
    const labelId = `checkbox-list-label-${todoId}`;

    return (
        <ListItem
            secondaryAction={
                <>
                    <IconButton edge="end" aria-label="edit" onClick={() => setEdit(!edit)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="remove" type="submit" formAction={`/api/todos/${todoId}/remove`}>
                        <DeleteIcon />
                    </IconButton>
                </>
            }
            disablePadding
        >
            {edit ? (
                <Input
                    defaultValue={todoText}
                    autoFocus={true}
                    onKeyDown={(e) => {
                        if (e.code === "Escape") setEdit(false);
                    }}
                    sx={{ marginLeft: "72px", height: "58px" }}
                    name="text"
                />
            ) : (
                <ListItemButton role={undefined} sx={{ marginRight: "40px" /* The margin compensates for the 2 icons in secondaryAction */ }} onClick={() => onToggle(todoId)}>
                    <ListItemIcon>
                        <Checkbox edge="start" checked={todoDone} tabIndex={-1} inputProps={{ "aria-labelledby": labelId }} />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={todoText} />
                </ListItemButton>
            )}
        </ListItem>
    );
});
