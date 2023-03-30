import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";

export default class IndexRoute extends Route {
    @service("todo-data") todos;

    model() {
        const todos = this.todos;

        return {
            get allItems() {
                return todos.allItems;
            },
        };
    }
}
