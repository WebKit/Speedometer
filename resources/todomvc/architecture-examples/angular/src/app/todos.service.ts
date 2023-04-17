import { Injectable } from "@angular/core";
import { Todo } from "./todo";

function uuid() {
    let uuid = "";
    for (let i = 0; i < 32; i++) {
        const random = (Math.random() * 16) | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20)
            uuid += "-";

        uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
    }
    return uuid;
}

@Injectable({
    providedIn: "root",
})
export class TodosService {
    todos: Todo[] = [];

    addItem(title: string): void {
        const todo: Todo = {
            id: uuid(),
            title,
            completed: false,
        };

        this.todos = this.todos.concat(todo);
    }

    toggleItem(todoToToggle: Todo): void {
        this.todos = this.todos.map((todo) => todo !== todoToToggle ? todo : { ...todo, completed: !todo.completed });
    }

    removeItem(todo: Todo): void {
        this.todos = this.todos.filter((t) => t !== todo);
    }

    updateItem(todoToSave: Todo, title: string) {
        this.todos = this.todos.map((todo) => todo !== todoToSave ? todo : { ...todo, title });
    }

    clearCompleted(): void {
        this.todos = this.todos.filter((todo) => !todo.completed);
    }

    toggleAll(completed: boolean): void {
        this.todos = this.todos.map((todo) => ({ ...todo, completed }));
    }

    getItems(type = "all"): Todo[] {
        switch (type) {
            case "active":
                return this.todos.filter((todo) => !todo.completed);
            case "completed":
                return this.todos.filter((todo) => todo.completed);
        }

        return [...this.todos];
    }
}
