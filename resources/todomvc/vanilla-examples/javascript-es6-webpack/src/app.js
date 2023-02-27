import "todomvc-app-css/index.css";
import "./app.css";

import { updateTodo } from "./todo";

export function onLoad() {
    updateTodo();
}
