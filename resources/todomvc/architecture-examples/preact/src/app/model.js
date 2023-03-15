function uuid() {
    let uuid = "";
    for (let i = 0; i < 32; i++) {
        let random = (Math.random() * 16) | 0;
        // prettier-ignore
        if (i === 8 || i === 12 || i === 16 || i === 20)
            uuid += "-";

        uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
    }
    return uuid;
}
export default class TodoModel {
    constructor(key, sub) {
        this.key = key;
        this.todos = [];
        this.onChanges = [sub];
    }

    inform() {
        this.onChanges.forEach((cb) => cb());
    }

    addTodo(title) {
        this.todos = this.todos.concat({
            id: uuid(),
            title,
            completed: false,
        });
        this.inform();
    }

    toggleAll(completed) {
        this.todos = this.todos.map((todo) => ({ ...todo, completed }));
        this.inform();
    }

    toggle(todoToToggle) {
        this.todos = this.todos.map((todo) => (todo !== todoToToggle ? todo : { ...todo, completed: !todo.completed }));
        this.inform();
    }

    destroy(todo) {
        this.todos = this.todos.filter((t) => t !== todo);
        this.inform();
    }

    save(todoToSave, title) {
        this.todos = this.todos.map((todo) => (todo !== todoToSave ? todo : { ...todo, title }));
        this.inform();
    }

    clearCompleted() {
        this.todos = this.todos.filter((todo) => !todo.completed);
        this.inform();
    }
}
