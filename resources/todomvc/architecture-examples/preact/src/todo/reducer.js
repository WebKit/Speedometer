const uuid = () => crypto.randomUUID();

export const todoReducer = (state, action) => {
    switch (action.type) {
        case "ADD_ITEM":
            return [{ id: uuid(), title: action.payload.title, completed: false }, ...state];
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
        default:
            return [...state];
    }
};
