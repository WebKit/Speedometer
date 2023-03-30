import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default class HeaderComponent extends Component {
    @service("todo-data") todos;

    @action
    onKeyDown({ target, key }) {
        const title = target.value.trim();
        const hasValue = Boolean(title);

        if (key === "Enter" && hasValue) {
            this.todos.addItem(title);
            target.value = "";
        }
    }
}
