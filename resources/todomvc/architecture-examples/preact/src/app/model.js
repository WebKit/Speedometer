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
export default function TodoModel(sub) {
    let todos = [];
    const onChanges = [sub];

    function inform() {
        onChanges.forEach((cb) => cb());
    }

    function addTodo(title) {
        todos = todos.concat({
            id: uuid(),
            title,
            completed: false,
        });
        inform();
    }

    function toggleAll(completed) {
        todos = todos.map((todo) => ({ ...todo, completed }));
        inform();
    }

    function toggle(todoToToggle) {
        todos = todos.map((todo) => (todo !== todoToToggle ? todo : { ...todo, completed: !todo.completed }));
        inform();
    }

    function destroy(todo) {
        todos = todos.filter((t) => t !== todo);
        inform();
    }

    function save(todoToSave, title) {
        todos = todos.map((todo) => (todo !== todoToSave ? todo : { ...todo, title }));
        inform();
    }

    function clearCompleted() {
        todos = todos.filter((todo) => !todo.completed);
        inform();
    }

    function getTodos() {
        return [...todos];
    }

    return {
        addTodo,
        toggleAll,
        toggle,
        destroy,
        save,
        clearCompleted,
        getTodos
    };
}
