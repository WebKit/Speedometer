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

export const todoReducer = (state, action) => {
    switch (action.type) {
        case "ADD_ITEM":
            return state.concat({ id: nanoid(), title: action.payload.title, completed: false });
        case "UPDATE_ITEM":
            return state.map((todo) => (todo.id === action.payload.id ? { ...todo, title: action.payload.title } : todo));
        case "REMOVE_ITEM":
            return state.filter((todo) => todo.id !== action.payload.id);
        case "TOGGLE_ITEM":
            return state.map((todo) => (todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo));
        case "REMOVE_ALL_ITEMS":
            return [];
        case "TOGGLE_ALL":
            return state.map((todo) => (todo.completed !== action.payload.completed ? { ...todo, completed: action.payload.completed } : todo));
        case "REMOVE_COMPLETED_ITEMS":
            return state.filter((todo) => !todo.completed);
    }

    throw Error(`Unknown action: ${action.type}`);
};
