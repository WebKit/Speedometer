import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";

export default class CompletedRoute extends Route {
    @service("todo-data") todos;

    model() {
        const todos = this.todos;

        return {
            get completedItems() {
                return todos.completedItems;
            },
        };
    }
}
