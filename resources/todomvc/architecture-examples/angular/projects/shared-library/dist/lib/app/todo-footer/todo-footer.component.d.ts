import { Location } from "@angular/common";
import { Todo } from "../todo";
import { TodosService } from "../todos.service";
import * as i0 from "@angular/core";
export declare class TodoFooterComponent {
    private todosService;
    private location;
    constructor(todosService: TodosService, location: Location);
    get todos(): Todo[];
    get activeTodos(): Todo[];
    get completedTodos(): Todo[];
    get filter(): string;
    clearCompleted(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TodoFooterComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TodoFooterComponent, "app-todo-footer", never, {}, {}, never, never, false>;
}
