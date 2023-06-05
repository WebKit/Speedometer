// Borrowed from https://github.com/ai/nanoid/blob/3.0.2/non-secure/index.js
// This alphabet uses `A-Za-z0-9_-` symbols. A genetic algorithm helped
// optimize the gzip compression for this alphabet.
const urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";

/**
 *
 * @public
 */
function nanoid(size = 21) {
    let id = "";
    // A compact alternative for `for (var i = 0; i < step; i++)`.
    let i = size;
    while (i--) {
        // `| 0` is more compact and faster than `Math.floor()`.
        id += urlAlphabet[(Math.random() * 64) | 0];
    }
    return id;
}
let todos = [];

export default function TodoModel(sub) {
    const onChanges = [sub];

    function inform() {
        onChanges.forEach((cb) => cb());
    }

    function addItem(title) {
        todos = todos.concat({
            id: nanoid(),
            title,
            completed: false,
        });
        inform();
    }

    function toggleItem(todoToToggle) {
        todos = todos.map((todo) => todo !== todoToToggle ? todo : { ...todo, completed: !todo.completed });
        inform();
    }

    function removeItem(todo) {
        todos = todos.filter((t) => t !== todo);
        inform();
    }

    function updateItem(todoToSave, title) {
        todos = todos.map((todo) => todo !== todoToSave ? todo : { ...todo, title });
        inform();
    }

    function toggleAll(completed) {
        todos = todos.map((todo) => ({ ...todo, completed }));
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
        addItem,
        toggleAll,
        toggleItem,
        removeItem,
        updateItem,
        clearCompleted,
        getTodos,
    };
}
