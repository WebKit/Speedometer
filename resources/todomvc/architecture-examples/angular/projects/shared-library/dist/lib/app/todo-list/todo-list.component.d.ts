import { Location } from "@angular/common";
import { Todo } from "../todo";
import { TodosService } from "../todos.service";
import * as i0 from "@angular/core";
export declare class TodoListComponent {
    private todosService;
    private location;
    constructor(todosService: TodosService, location: Location);
    get todos(): Todo[];
    get activeTodos(): Todo[];
    removeTodo(todo: Todo): void;
    toggleAll(e: Event): void;
    trackByItem(index: number, todo: Todo): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TodoListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TodoListComponent, "app-todo-list", never, {}, {}, never, never, false>;
}
