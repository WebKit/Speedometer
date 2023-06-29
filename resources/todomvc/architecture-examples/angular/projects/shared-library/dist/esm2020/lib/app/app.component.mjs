import { Component } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "./todo-header/todo-header.component";
import * as i2 from "./todo-list/todo-list.component";
import * as i3 from "./todo-footer/todo-footer.component";
export class AppComponent {
    constructor() {
        this.title = "angular";
    }
}
AppComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
AppComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: AppComponent, selector: "app-root", ngImport: i0, template: "<section class=\"todoapp\">\n    <app-todo-header></app-todo-header>\n    <app-todo-list></app-todo-list>\n    <app-todo-footer></app-todo-footer>\n</section>\n", dependencies: [{ kind: "component", type: i1.TodoHeaderComponent, selector: "app-todo-header" }, { kind: "component", type: i2.TodoListComponent, selector: "app-todo-list" }, { kind: "component", type: i3.TodoFooterComponent, selector: "app-todo-footer" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-root", template: "<section class=\"todoapp\">\n    <app-todo-header></app-todo-header>\n    <app-todo-list></app-todo-list>\n    <app-todo-footer></app-todo-footer>\n</section>\n" }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvYXBwL2FwcC5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi9zcmMvbGliL2FwcC9hcHAuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7QUFNMUMsTUFBTSxPQUFPLFlBQVk7SUFKekI7UUFLSSxVQUFLLEdBQUcsU0FBUyxDQUFDO0tBQ3JCOzt5R0FGWSxZQUFZOzZGQUFaLFlBQVksZ0RDTnpCLGtLQUtBOzJGRENhLFlBQVk7a0JBSnhCLFNBQVM7K0JBQ0ksVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiBcImFwcC1yb290XCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiLi9hcHAuY29tcG9uZW50Lmh0bWxcIixcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAgICB0aXRsZSA9IFwiYW5ndWxhclwiO1xufVxuIiwiPHNlY3Rpb24gY2xhc3M9XCJ0b2RvYXBwXCI+XG4gICAgPGFwcC10b2RvLWhlYWRlcj48L2FwcC10b2RvLWhlYWRlcj5cbiAgICA8YXBwLXRvZG8tbGlzdD48L2FwcC10b2RvLWxpc3Q+XG4gICAgPGFwcC10b2RvLWZvb3Rlcj48L2FwcC10b2RvLWZvb3Rlcj5cbjwvc2VjdGlvbj5cbiJdfQ==