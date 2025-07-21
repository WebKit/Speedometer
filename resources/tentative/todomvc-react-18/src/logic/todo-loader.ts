import type { Params } from "react-router-dom";
import { getTodos } from "./todo-model";

export function loader({ params }: { params: Params<"filter"> }) {
    const filter = params.filter ?? "all";
    if (!["all", "active", "completed"].includes(filter)) {
        throw new Error(`Invalid filter ${filter}, should be one of all, done or pending`);
    }

    return {
        filter,
        filteredTodos: getTodos(filter as "all" | "active" | "completed"),
        allTodos: getTodos(),
    };
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
