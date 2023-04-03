import Service from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class TodoDataService extends Service {
    @tracked todos = [];

    get allItems() {
        return this.todos;
    }

    get completedItems() {
        return this.todos.filterBy("completed", true);
    }

    get incompleteItems() {
        return this.todos.filterBy("completed", false);
    }

    @action
    addItem(title) {
        const item = new Item(title);
        this.todos.pushObject(item);
    }

    @action
    toggleItem(todo) {
        todo.completed = !todo.completed;
    }

    @action
    removeItem(todo) {
        this.todos.removeObject(todo);
    }

    @action
    updateItem(todo, title) {
        todo.title = title;
    }

    @action
    clearCompleted() {
        this.todos = this.incompleteItems;
    }
}

class Item {
    @tracked title = "";
    @tracked completed = false;

    constructor(title) {
        this.title = title;
    }
}
