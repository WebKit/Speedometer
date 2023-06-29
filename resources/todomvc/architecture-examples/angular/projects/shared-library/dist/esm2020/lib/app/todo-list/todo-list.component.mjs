import { Component } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "../todos.service";
import * as i2 from "@angular/common";
import * as i3 from "../todo-item/todo-item.component";
export class TodoListComponent {
    constructor(todosService, location) {
        this.todosService = todosService;
        this.location = location;
    }
    get todos() {
        const filter = this.location.path().split("/")[1] || "all";
        return this.todosService.getItems(filter);
    }
    get activeTodos() {
        return this.todosService.getItems("active");
    }
    removeTodo(todo) {
        this.todosService.removeItem(todo);
    }
    toggleAll(e) {
        const input = e.target;
        this.todosService.toggleAll(input.checked);
    }
    trackByItem(index, todo) {
        return todo.id;
    }
}
TodoListComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoListComponent, deps: [{ token: i1.TodosService }, { token: i2.Location }], target: i0.ɵɵFactoryTarget.Component });
TodoListComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: TodoListComponent, selector: "app-todo-list", ngImport: i0, template: "<main class=\"main\" *ngIf=\"todos.length > 0\">\n    <div class=\"toggle-all-container\">\n        <input class=\"toggle-all\" type=\"checkbox\" (change)=\"toggleAll($event)\" [checked]=\"!activeTodos.length\" />\n        <label class=\"toggle-all-label\" htmlFor=\"toggle-all\"> Toggle All Input </label>\n    </div>\n    <ul class=\"todo-list\">\n        <app-todo-item *ngFor=\"let todo of todos; let i = index; trackBy: trackByItem\" [todo]=\"todo\" [index]=\"i\" (deleteEvent)=\"removeTodo($event)\"></app-todo-item>\n    </ul>\n</main>\n", dependencies: [{ kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i3.TodoItemComponent, selector: "app-todo-item", inputs: ["todo", "index"], outputs: ["deleteEvent"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoListComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-todo-list", template: "<main class=\"main\" *ngIf=\"todos.length > 0\">\n    <div class=\"toggle-all-container\">\n        <input class=\"toggle-all\" type=\"checkbox\" (change)=\"toggleAll($event)\" [checked]=\"!activeTodos.length\" />\n        <label class=\"toggle-all-label\" htmlFor=\"toggle-all\"> Toggle All Input </label>\n    </div>\n    <ul class=\"todo-list\">\n        <app-todo-item *ngFor=\"let todo of todos; let i = index; trackBy: trackByItem\" [todo]=\"todo\" [index]=\"i\" (deleteEvent)=\"removeTodo($event)\"></app-todo-item>\n    </ul>\n</main>\n" }]
        }], ctorParameters: function () { return [{ type: i1.TodosService }, { type: i2.Location }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1saXN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvYXBwL3RvZG8tbGlzdC90b2RvLWxpc3QuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9hcHAvdG9kby1saXN0L3RvZG8tbGlzdC5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7OztBQVMxQyxNQUFNLE9BQU8saUJBQWlCO0lBQzFCLFlBQW9CLFlBQTBCLEVBQVUsUUFBa0I7UUFBdEQsaUJBQVksR0FBWixZQUFZLENBQWM7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFVO0lBQUcsQ0FBQztJQUU5RSxJQUFJLEtBQUs7UUFDTCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7UUFDM0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVU7UUFDakIsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELFNBQVMsQ0FBQyxDQUFRO1FBQ2QsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQTBCLENBQUM7UUFDM0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBYSxFQUFFLElBQVU7UUFDakMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ25CLENBQUM7OzhHQXZCUSxpQkFBaUI7a0dBQWpCLGlCQUFpQixxRENUOUIsa2lCQVNBOzJGREFhLGlCQUFpQjtrQkFKN0IsU0FBUzsrQkFDSSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vblwiO1xuaW1wb3J0IHsgVG9kbyB9IGZyb20gXCIuLi90b2RvXCI7XG5pbXBvcnQgeyBUb2Rvc1NlcnZpY2UgfSBmcm9tIFwiLi4vdG9kb3Muc2VydmljZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogXCJhcHAtdG9kby1saXN0XCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiLi90b2RvLWxpc3QuY29tcG9uZW50Lmh0bWxcIixcbn0pXG5leHBvcnQgY2xhc3MgVG9kb0xpc3RDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdG9kb3NTZXJ2aWNlOiBUb2Rvc1NlcnZpY2UsIHByaXZhdGUgbG9jYXRpb246IExvY2F0aW9uKSB7fVxuXG4gICAgZ2V0IHRvZG9zKCk6IFRvZG9bXSB7XG4gICAgICAgIGNvbnN0IGZpbHRlciA9IHRoaXMubG9jYXRpb24ucGF0aCgpLnNwbGl0KFwiL1wiKVsxXSB8fCBcImFsbFwiO1xuICAgICAgICByZXR1cm4gdGhpcy50b2Rvc1NlcnZpY2UuZ2V0SXRlbXMoZmlsdGVyKTtcbiAgICB9XG5cbiAgICBnZXQgYWN0aXZlVG9kb3MoKTogVG9kb1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9kb3NTZXJ2aWNlLmdldEl0ZW1zKFwiYWN0aXZlXCIpO1xuICAgIH1cblxuICAgIHJlbW92ZVRvZG8odG9kbzogVG9kbyk6IHZvaWQge1xuICAgICAgICB0aGlzLnRvZG9zU2VydmljZS5yZW1vdmVJdGVtKHRvZG8pO1xuICAgIH1cblxuICAgIHRvZ2dsZUFsbChlOiBFdmVudCkge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIHRoaXMudG9kb3NTZXJ2aWNlLnRvZ2dsZUFsbChpbnB1dC5jaGVja2VkKTtcbiAgICB9XG5cbiAgICB0cmFja0J5SXRlbShpbmRleDogbnVtYmVyLCB0b2RvOiBUb2RvKSB7XG4gICAgICAgIHJldHVybiB0b2RvLmlkO1xuICAgIH1cbn1cbiIsIjxtYWluIGNsYXNzPVwibWFpblwiICpuZ0lmPVwidG9kb3MubGVuZ3RoID4gMFwiPlxuICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGUtYWxsLWNvbnRhaW5lclwiPlxuICAgICAgICA8aW5wdXQgY2xhc3M9XCJ0b2dnbGUtYWxsXCIgdHlwZT1cImNoZWNrYm94XCIgKGNoYW5nZSk9XCJ0b2dnbGVBbGwoJGV2ZW50KVwiIFtjaGVja2VkXT1cIiFhY3RpdmVUb2Rvcy5sZW5ndGhcIiAvPlxuICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0b2dnbGUtYWxsLWxhYmVsXCIgaHRtbEZvcj1cInRvZ2dsZS1hbGxcIj4gVG9nZ2xlIEFsbCBJbnB1dCA8L2xhYmVsPlxuICAgIDwvZGl2PlxuICAgIDx1bCBjbGFzcz1cInRvZG8tbGlzdFwiPlxuICAgICAgICA8YXBwLXRvZG8taXRlbSAqbmdGb3I9XCJsZXQgdG9kbyBvZiB0b2RvczsgbGV0IGkgPSBpbmRleDsgdHJhY2tCeTogdHJhY2tCeUl0ZW1cIiBbdG9kb109XCJ0b2RvXCIgW2luZGV4XT1cImlcIiAoZGVsZXRlRXZlbnQpPVwicmVtb3ZlVG9kbygkZXZlbnQpXCI+PC9hcHAtdG9kby1pdGVtPlxuICAgIDwvdWw+XG48L21haW4+XG4iXX0=