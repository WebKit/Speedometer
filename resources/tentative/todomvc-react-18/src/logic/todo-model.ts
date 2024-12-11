export type Todo = {
    id: number;
    text: string;
    done: boolean;
};

let todos: Todo[] = [];
let todoIdCounter: number = 0;

// Returns the todos list, filtered according to the filter.
// If the filter is "all" it returns the model directly without slicing it.
// Typescript should prevent the caller from doing any mutation.
export function getTodos(filter: "all" | "completed" | "active" = "all"): ReadonlyArray<Readonly<Todo>> {
    if (filter === "all") return todos;

    const keepDone = filter === "completed";
    return todos.filter(({ done }) => done === keepDone);
}

// Returns the new id.
export function pushTodo(todoText: string): number {
    todos.push({
        id: ++todoIdCounter,
        text: todoText,
        done: false,
    });
    return todoIdCounter;
}

// Returns true if todoId is a valid id, false otherwise.
export function toggleTodo(todoId: number) {
    const todo = todos.find(({ id }) => id === todoId);
    if (!todo) return false;
    todo.done = !todo.done;
    return true;
}

export function toggleAll(value: boolean) {
    for (const todo of todos) {
        todo.done = value;
    }
}

// Returns true if todoId is a valid id, false otherwise.
export function removeTodo(todoId: number) {
    const todoIndex = todos.findIndex(({ id }) => id === todoId);
    if (todoIndex < 0) {
        return false;
    }
    todos.splice(todoIndex, 1);
    return true;
}

export function removeCompleted() {
    todos = todos.filter((todo) => !todo.done);
}

// Returns true if todoId is a valid id, false otherwise.
export function setText(todoId: number, text: string) {
    const todo = todos.find(({ id }) => id === todoId);
    if (!todo) return false;
    todo.text = text;
    return true;
}

// The final value will be the concatenation of a words picked in all these 3 arrays.
// They have a item count that's a prime number, so that it's less likely we get
// the same values.
// 23 items
const words1 = [
    "Electronic",
    "Bespoke",
    "Ergonomic",
    "Luxurious",
    "Gorgeous",
    "Rustic",
    "Modern",
    "Small",
    "Awesome",
    "Practical",
    "Incredible",
    "Elegant",
    "Tasty",
    "Sleek",
    "Licensed",
    "Handmade",
    "Handcrafted",
    "Unbranded",
    "Generic",
    "Recycled",
    "Intelligent",
    "Refined",
    "Organic",
];
// 11 items
const words2 = ["Granite", "Soft", "Fresh", "Wooden", "Rubber", "Bronze", "Steel", "Plastic", "Metal", "Frozen", "Concrete"];
// 17 items
const words3 = ["Hat", "Table", "Bike", "Cheese", "Pizza", "Shirt", "Soap", "Ball", "Shoes", "Chair", "Bacon", "Keyboard", "Sausages", "Gloves", "Car", "Salad", "Towels"];
// 5 items
const emojis = ["❤️", "🙈", "👋🏻", "😋", "👇🏿"];

// This inserts a lot of todo elements to the todos array. It's useful for the
// benchmark.
export function populate() {
    const NB_ITEMS = 150;
    for (let i = 0; i < NB_ITEMS; i++) {
        const todoText = emojis[i % emojis.length] + " " + words1[i % words1.length] + " " + words2[i % words2.length] + " " + words3[i % words3.length];
        pushTodo(todoText);
    }
}
