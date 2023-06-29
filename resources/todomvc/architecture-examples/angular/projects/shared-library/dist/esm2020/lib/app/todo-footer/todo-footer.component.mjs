import { Component } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "../todos.service";
import * as i2 from "@angular/common";
import * as i3 from "@angular/router";
export class TodoFooterComponent {
    constructor(todosService, location) {
        this.todosService = todosService;
        this.location = location;
    }
    get todos() {
        return this.todosService.getItems();
    }
    get activeTodos() {
        return this.todosService.getItems("active");
    }
    get completedTodos() {
        return this.todosService.getItems("completed");
    }
    get filter() {
        return this.location.path().split("/")[1] || "all";
    }
    clearCompleted() {
        this.todosService.clearCompleted();
    }
}
TodoFooterComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoFooterComponent, deps: [{ token: i1.TodosService }, { token: i2.Location }], target: i0.ɵɵFactoryTarget.Component });
TodoFooterComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: TodoFooterComponent, selector: "app-todo-footer", ngImport: i0, template: "<footer class=\"footer\" *ngIf=\"todos.length > 0\">\n    <span class=\"todo-count\"\n        ><strong>{{ activeTodos.length }}</strong> {{ activeTodos.length == 1 ? \"item\" : \"items\" }} left</span\n    >\n    <ul class=\"filters\">\n        <li>\n            <a routerLink=\"/\" [class.selected]=\"filter === 'all'\"> All </a>\n        </li>\n        <li>\n            <a routerLink=\"/active\" [class.selected]=\"filter === 'active'\"> Active </a>\n        </li>\n        <li>\n            <a routerLink=\"/completed\" [class.selected]=\"filter === 'completed'\"> Completed </a>\n        </li>\n    </ul>\n    <button *ngIf=\"completedTodos.length\" type=\"button\" class=\"clear-completed\" (click)=\"clearCompleted()\">Clear Completed</button>\n</footer>\n", dependencies: [{ kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.RouterLinkWithHref, selector: "a[routerLink],area[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoFooterComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-todo-footer", template: "<footer class=\"footer\" *ngIf=\"todos.length > 0\">\n    <span class=\"todo-count\"\n        ><strong>{{ activeTodos.length }}</strong> {{ activeTodos.length == 1 ? \"item\" : \"items\" }} left</span\n    >\n    <ul class=\"filters\">\n        <li>\n            <a routerLink=\"/\" [class.selected]=\"filter === 'all'\"> All </a>\n        </li>\n        <li>\n            <a routerLink=\"/active\" [class.selected]=\"filter === 'active'\"> Active </a>\n        </li>\n        <li>\n            <a routerLink=\"/completed\" [class.selected]=\"filter === 'completed'\"> Completed </a>\n        </li>\n    </ul>\n    <button *ngIf=\"completedTodos.length\" type=\"button\" class=\"clear-completed\" (click)=\"clearCompleted()\">Clear Completed</button>\n</footer>\n" }]
        }], ctorParameters: function () { return [{ type: i1.TodosService }, { type: i2.Location }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1mb290ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9hcHAvdG9kby1mb290ZXIvdG9kby1mb290ZXIuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9hcHAvdG9kby1mb290ZXIvdG9kby1mb290ZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7QUFTMUMsTUFBTSxPQUFPLG1CQUFtQjtJQUM1QixZQUFvQixZQUEwQixFQUFVLFFBQWtCO1FBQXRELGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtJQUFHLENBQUM7SUFFOUUsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxJQUFJLGNBQWM7UUFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQztJQUN2RCxDQUFDO0lBRUQsY0FBYztRQUNWLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsQ0FBQzs7Z0hBckJRLG1CQUFtQjtvR0FBbkIsbUJBQW1CLHVEQ1RoQyw2dkJBaUJBOzJGRFJhLG1CQUFtQjtrQkFKL0IsU0FBUzsrQkFDSSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCI7XG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4uL3RvZG9cIjtcbmltcG9ydCB7IFRvZG9zU2VydmljZSB9IGZyb20gXCIuLi90b2Rvcy5zZXJ2aWNlXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiBcImFwcC10b2RvLWZvb3RlclwiLFxuICAgIHRlbXBsYXRlVXJsOiBcIi4vdG9kby1mb290ZXIuY29tcG9uZW50Lmh0bWxcIixcbn0pXG5leHBvcnQgY2xhc3MgVG9kb0Zvb3RlckNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0b2Rvc1NlcnZpY2U6IFRvZG9zU2VydmljZSwgcHJpdmF0ZSBsb2NhdGlvbjogTG9jYXRpb24pIHt9XG5cbiAgICBnZXQgdG9kb3MoKTogVG9kb1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9kb3NTZXJ2aWNlLmdldEl0ZW1zKCk7XG4gICAgfVxuXG4gICAgZ2V0IGFjdGl2ZVRvZG9zKCk6IFRvZG9bXSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvZG9zU2VydmljZS5nZXRJdGVtcyhcImFjdGl2ZVwiKTtcbiAgICB9XG5cbiAgICBnZXQgY29tcGxldGVkVG9kb3MoKTogVG9kb1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9kb3NTZXJ2aWNlLmdldEl0ZW1zKFwiY29tcGxldGVkXCIpO1xuICAgIH1cblxuICAgIGdldCBmaWx0ZXIoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYXRpb24ucGF0aCgpLnNwbGl0KFwiL1wiKVsxXSB8fCBcImFsbFwiO1xuICAgIH1cblxuICAgIGNsZWFyQ29tcGxldGVkKCkge1xuICAgICAgICB0aGlzLnRvZG9zU2VydmljZS5jbGVhckNvbXBsZXRlZCgpO1xuICAgIH1cbn1cbiIsIjxmb290ZXIgY2xhc3M9XCJmb290ZXJcIiAqbmdJZj1cInRvZG9zLmxlbmd0aCA+IDBcIj5cbiAgICA8c3BhbiBjbGFzcz1cInRvZG8tY291bnRcIlxuICAgICAgICA+PHN0cm9uZz57eyBhY3RpdmVUb2Rvcy5sZW5ndGggfX08L3N0cm9uZz4ge3sgYWN0aXZlVG9kb3MubGVuZ3RoID09IDEgPyBcIml0ZW1cIiA6IFwiaXRlbXNcIiB9fSBsZWZ0PC9zcGFuXG4gICAgPlxuICAgIDx1bCBjbGFzcz1cImZpbHRlcnNcIj5cbiAgICAgICAgPGxpPlxuICAgICAgICAgICAgPGEgcm91dGVyTGluaz1cIi9cIiBbY2xhc3Muc2VsZWN0ZWRdPVwiZmlsdGVyID09PSAnYWxsJ1wiPiBBbGwgPC9hPlxuICAgICAgICA8L2xpPlxuICAgICAgICA8bGk+XG4gICAgICAgICAgICA8YSByb3V0ZXJMaW5rPVwiL2FjdGl2ZVwiIFtjbGFzcy5zZWxlY3RlZF09XCJmaWx0ZXIgPT09ICdhY3RpdmUnXCI+IEFjdGl2ZSA8L2E+XG4gICAgICAgIDwvbGk+XG4gICAgICAgIDxsaT5cbiAgICAgICAgICAgIDxhIHJvdXRlckxpbms9XCIvY29tcGxldGVkXCIgW2NsYXNzLnNlbGVjdGVkXT1cImZpbHRlciA9PT0gJ2NvbXBsZXRlZCdcIj4gQ29tcGxldGVkIDwvYT5cbiAgICAgICAgPC9saT5cbiAgICA8L3VsPlxuICAgIDxidXR0b24gKm5nSWY9XCJjb21wbGV0ZWRUb2Rvcy5sZW5ndGhcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbGVhci1jb21wbGV0ZWRcIiAoY2xpY2spPVwiY2xlYXJDb21wbGV0ZWQoKVwiPkNsZWFyIENvbXBsZXRlZDwvYnV0dG9uPlxuPC9mb290ZXI+XG4iXX0=