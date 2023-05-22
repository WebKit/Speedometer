function uuid() {
    let uuid = "";
    for (let i = 0; i < 32; i++) {
        const random = (Math.random() * 16) | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20)
            uuid += "-";

        let currentNumber = random;
        if (i === 12)
            currentNumber = 4;
        else if (i === 16)
            currentNumber = 8 | (random & 3);
        uuid += currentNumber.toString(16);
    }
    return uuid;
}

export const todoReducer = (state, action) => {
    switch (action.type) {
        case "ADD_ITEM":
            return state.concat({ id: uuid(), title: action.payload.title, completed: false });
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
