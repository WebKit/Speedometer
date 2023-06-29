import { FormControl } from "@angular/forms";
import { TodosService } from "../todos.service";
import * as i0 from "@angular/core";
export declare class TodoHeaderComponent {
    private todosService;
    constructor(todosService: TodosService);
    titleFormControl: FormControl<string | null>;
    addTodo(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TodoHeaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TodoHeaderComponent, "app-todo-header", never, {}, {}, never, never, false>;
}
