import { Todo } from "./todo";
import * as i0 from "@angular/core";
export declare class TodosService {
    todos: Todo[];
    addItem(title: string): void;
    removeItem(todo: Todo): void;
    clearCompleted(): void;
    toggleAll(completed: boolean): void;
    getItems(type?: string): Todo[];
    static ɵfac: i0.ɵɵFactoryDeclaration<TodosService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TodosService>;
}
