import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { scheduleOnce } from "@ember/runloop";

export default class TodoItemComponent extends Component {
    @service("todo-data") todos;

    @tracked isEditing = false;

    @action startEdit() {
        this.originalTitle = this.args.todo.title;
        this.isEditing = true;
        scheduleOnce("afterRender", this, "focus");
    }

    @action finishEdit(e) {
        if (!this.isEditing) return;

        const { todo } = this.args;
        const pendingTitle = e.target.value;

        if (!pendingTitle) {
            this.todos.removeItem(todo);
            return;
        }

        this.todos.updateItem(todo, pendingTitle);

        this.isEditing = false;
    }

    @action toggleItem() {
        const { todo } = this.args;
        this.todos.toggleItem(todo);
    }

    @action removeItem() {
        const { todo } = this.args;
        this.todos.removeItem(todo);
    }

    @action onKeyDown(e) {
        if (e.key === "Enter") {
            event.target.blur();
        } else if (e.key === "Escape") {
            this.isEditing = false;
        }
    }

    @action createRef(inputElement) {
        this.inputElement = inputElement;
    }

    focus() {
        if (!this.inputElement) return;
        this.inputElement.focus();
    }
}

//editing
