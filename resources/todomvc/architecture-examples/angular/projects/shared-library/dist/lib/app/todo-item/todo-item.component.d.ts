import { EventEmitter, ElementRef, AfterViewChecked } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Todo } from "../todo";
import * as i0 from "@angular/core";
export declare class TodoItemComponent implements AfterViewChecked {
    todo: Todo;
    index: number;
    deleteEvent: EventEmitter<Todo>;
    inputRef: ElementRef | undefined;
    titleFormControl: FormControl<string | null>;
    isEditing: boolean;
    toggleTodo(): void;
    removeTodo(): void;
    startEdit(): void;
    handleBlur(e: Event): void;
    handleFocus(e: Event): void;
    updateTodo(): void;
    ngAfterViewChecked(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TodoItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TodoItemComponent, "app-todo-item", never, { "todo": "todo"; "index": "index"; }, { "deleteEvent": "deleteEvent"; }, never, never, false>;
}
