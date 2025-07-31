import { RouterProvider, createHashRouter } from "react-router-dom";
import { TodoListPage } from "./TodoListPage";
import { loader } from "../logic/todo-loader";
import { pushTodo, toggleTodo, toggleAll, removeTodo, removeCompleted, setText, populate } from "../logic/todo-model";

const router = createHashRouter([
    {
        path: "/:filter?",
        element: <TodoListPage />,
        loader,
    },
    {
        path: "/api/todos",
        children: [
            {
                path: "new",
                action: async ({ request }) => {
                    const formData = await request.formData();
                    const todoText = formData.get("todoText");
                    if (todoText) {
                        return pushTodo(todoText as string);
                    }
                    return null;
                },
            },
            {
                path: "benchmark/populate",
                action: async () => {
                    populate();
                    return null;
                },
            },
            {
                path: "toggleAll",
                action: async ({ request }) => {
                    const formData = await request.formData();
                    const value = formData.get("value") as string;
                    if (!["true", "false"].includes(value!)) {
                        throw new Error(`Invalid parameter "${value}", it must be "true" or "false".`);
                    }
                    toggleAll(value === "true");
                    return null;
                },
            },
            {
                path: "resetAll",
                action: async () => {
                    toggleAll(false);
                    return null;
                },
            },
            {
                path: "removeCompleted",
                action: async () => {
                    removeCompleted();
                    return null;
                },
            },
            {
                path: ":todoId/toggle",
                action: async ({ params: { todoId } }) => {
                    toggleTodo(+todoId!);
                    return null;
                },
            },
            {
                path: ":todoId/remove",
                action: async ({ params: { todoId } }) => {
                    removeTodo(+todoId!);
                    return null;
                },
            },
            {
                path: ":todoId/setText",
                action: async ({ params: { todoId }, request }) => {
                    const formData = await request.formData();
                    const text = formData.get("text") as string;

                    setText(+todoId!, text);
                    return null;
                },
            },
        ],
    },
]);

export function App() {
    return (
        <>
            <h1>todos</h1>
            <RouterProvider router={router} />
        </>
    );
}
