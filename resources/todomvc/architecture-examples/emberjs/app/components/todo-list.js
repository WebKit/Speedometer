import Component from "@glimmer/component";
import { action } from "@ember/object";

export default class TodoListComponent extends Component {
    get allItemsCompleted() {
        const { todos } = this.args;

        return todos.every((todo) => {
            return todo.completed;
        });
    }

    @action toggleAll(e) {
        const { todos } = this.args;
        todos.forEach((todo) => (todo.completed = e.target.checked));
    }
}
