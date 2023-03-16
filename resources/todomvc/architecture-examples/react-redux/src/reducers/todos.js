import { ADD_TODO, DELETE_TODO, EDIT_TODO, TOGGLE_TODO, TOGGLE_ALL, CLEAR_COMPLETED } from "../constants/action-types";

const initialState = [];
const uuid = () => crypto.randomUUID();

export default function todos(state = initialState, action) {
    switch (action.type) {
        case ADD_TODO:
            return state.concat({ id: uuid(), text: action.text, completed: false });
        case DELETE_TODO:
            return state.filter((todo) => todo.id !== action.id);
        case EDIT_TODO:
            return state.map((todo) => (todo.id === action.id ? { ...todo, text: action.text } : todo));
        case TOGGLE_TODO:
            return state.map((todo) => (todo.id === action.id ? { ...todo, completed: !todo.completed } : todo));
        case TOGGLE_ALL:
            // eslint-disable-next-line no-case-declarations
            const areAllMarked = state.every((todo) => todo.completed);
            return state.map((todo) => (todo.completed === areAllMarked ? { ...todo, completed: !areAllMarked } : todo));
        case CLEAR_COMPLETED:
            return state.filter((todo) => !todo.completed);
        default:
            return state.slice();
    }
}
