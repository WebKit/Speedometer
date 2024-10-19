import { BottomNavigation, BottomNavigationAction, Paper, Badge } from "@mui/material";

// Note: we're importing the icons using a deep import to work around an issue
// with Firefox devtools in development mode.
import DoneIcon from "@mui/icons-material/Done";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AlarmIcon from "@mui/icons-material/Alarm";

import { Link as RouterLink, useLoaderData } from "react-router-dom";
import type { LoaderReturnValue } from "../logic/todo-loader";

export function TodoNav() {
    const { filter, allTodos } = useLoaderData() as LoaderReturnValue;
    if (!allTodos.length) {
        return null;
    }

    let completedCount = 0;
    let pendingCount = 0;
    for (const todo of allTodos) {
        if (todo.done) {
            completedCount++;
        } else {
            pendingCount++;
        }
    }

    return (
        <Paper elevation={1}>
            <BottomNavigation showLabels value={filter}>
                <BottomNavigationAction value="all" label="All" icon={<FormatListBulletedIcon />} component={RouterLink} to="/" />
                <BottomNavigationAction
                    value="active"
                    label="Active"
                    icon={
                        <Badge badgeContent={pendingCount} color="primary">
                            <AlarmIcon aria-label={`${pendingCount} pending items`} />
                        </Badge>
                    }
                    component={RouterLink}
                    to="/active"
                />
                <BottomNavigationAction
                    value="completed"
                    label="Completed"
                    icon={
                        <Badge badgeContent={completedCount} color="success">
                            <DoneIcon aria-label={`${completedCount} completed items`} />
                        </Badge>
                    }
                    component={RouterLink}
                    to="/completed"
                />
            </BottomNavigation>
        </Paper>
    );
}
