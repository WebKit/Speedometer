import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import * as i0 from "@angular/core";
import * as i1 from "../todos.service";
import * as i2 from "@angular/forms";
export class TodoHeaderComponent {
    constructor(todosService) {
        this.todosService = todosService;
        this.titleFormControl = new FormControl("");
    }
    addTodo() {
        const title = this.titleFormControl.getRawValue()?.trim();
        if (!title)
            return;
        this.todosService.addItem(title);
        this.titleFormControl.setValue("");
    }
}
TodoHeaderComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoHeaderComponent, deps: [{ token: i1.TodosService }], target: i0.ɵɵFactoryTarget.Component });
TodoHeaderComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: TodoHeaderComponent, selector: "app-todo-header", ngImport: i0, template: "<header class=\"header\">\n    <h1>todos</h1>\n    <input class=\"new-todo\" placeholder=\"What needs to be done?\" autofocus=\"\" [formControl]=\"titleFormControl\" (keyup.enter)=\"addTodo()\" />\n</header>\n", dependencies: [{ kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-todo-header", template: "<header class=\"header\">\n    <h1>todos</h1>\n    <input class=\"new-todo\" placeholder=\"What needs to be done?\" autofocus=\"\" [formControl]=\"titleFormControl\" (keyup.enter)=\"addTodo()\" />\n</header>\n" }]
        }], ctorParameters: function () { return [{ type: i1.TodosService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1oZWFkZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9hcHAvdG9kby1oZWFkZXIvdG9kby1oZWFkZXIuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9hcHAvdG9kby1oZWFkZXIvdG9kby1oZWFkZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7QUFPN0MsTUFBTSxPQUFPLG1CQUFtQjtJQUM1QixZQUFvQixZQUEwQjtRQUExQixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUU5QyxxQkFBZ0IsR0FBRyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUZVLENBQUM7SUFJbEQsT0FBTztRQUNILE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUUxRCxJQUFJLENBQUMsS0FBSztZQUNOLE9BQU87UUFFWCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7O2dIQWJRLG1CQUFtQjtvR0FBbkIsbUJBQW1CLHVEQ1JoQyxtTkFJQTsyRkRJYSxtQkFBbUI7a0JBSi9CLFNBQVM7K0JBQ0ksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEZvcm1Db250cm9sIH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBUb2Rvc1NlcnZpY2UgfSBmcm9tIFwiLi4vdG9kb3Muc2VydmljZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogXCJhcHAtdG9kby1oZWFkZXJcIixcbiAgICB0ZW1wbGF0ZVVybDogXCIuL3RvZG8taGVhZGVyLmNvbXBvbmVudC5odG1sXCIsXG59KVxuZXhwb3J0IGNsYXNzIFRvZG9IZWFkZXJDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdG9kb3NTZXJ2aWNlOiBUb2Rvc1NlcnZpY2UpIHt9XG5cbiAgICB0aXRsZUZvcm1Db250cm9sID0gbmV3IEZvcm1Db250cm9sKFwiXCIpO1xuXG4gICAgYWRkVG9kbygpIHtcbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLnRpdGxlRm9ybUNvbnRyb2wuZ2V0UmF3VmFsdWUoKT8udHJpbSgpO1xuXG4gICAgICAgIGlmICghdGl0bGUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy50b2Rvc1NlcnZpY2UuYWRkSXRlbSh0aXRsZSk7XG4gICAgICAgIHRoaXMudGl0bGVGb3JtQ29udHJvbC5zZXRWYWx1ZShcIlwiKTtcbiAgICB9XG59XG4iLCI8aGVhZGVyIGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgPGgxPnRvZG9zPC9oMT5cbiAgICA8aW5wdXQgY2xhc3M9XCJuZXctdG9kb1wiIHBsYWNlaG9sZGVyPVwiV2hhdCBuZWVkcyB0byBiZSBkb25lP1wiIGF1dG9mb2N1cz1cIlwiIFtmb3JtQ29udHJvbF09XCJ0aXRsZUZvcm1Db250cm9sXCIgKGtleXVwLmVudGVyKT1cImFkZFRvZG8oKVwiIC8+XG48L2hlYWRlcj5cbiJdfQ==