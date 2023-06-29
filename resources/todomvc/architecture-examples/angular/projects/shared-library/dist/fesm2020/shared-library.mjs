import * as i0 from '@angular/core';
import { Injectable, Component, EventEmitter, ChangeDetectionStrategy, Input, Output, ViewChild, NgModule } from '@angular/core';
import * as i2 from '@angular/forms';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import * as i3 from '@angular/router';
import { RouterModule } from '@angular/router';
import * as i2$1 from '@angular/common';

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
class TodosService {
    constructor() {
        this.todos = [];
    }
    addItem(title) {
        const todo = {
            id: uuid(),
            title,
            completed: false,
        };
        this.todos.push(todo);
    }
    removeItem(todo) {
        const index = this.todos.indexOf(todo);
        this.todos.splice(index, 1);
    }
    clearCompleted() {
        this.todos = this.todos.filter((todo) => !todo.completed);
    }
    toggleAll(completed) {
        this.todos = this.todos.map((todo) => ({ ...todo, completed }));
    }
    getItems(type = "all") {
        switch (type) {
            case "active":
                return this.todos.filter((todo) => !todo.completed);
            case "completed":
                return this.todos.filter((todo) => todo.completed);
        }
        return this.todos;
    }
}
TodosService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodosService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
TodosService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodosService, providedIn: "root" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodosService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: "root",
                }]
        }] });

class TodoHeaderComponent {
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
TodoHeaderComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoHeaderComponent, deps: [{ token: TodosService }], target: i0.ɵɵFactoryTarget.Component });
TodoHeaderComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: TodoHeaderComponent, selector: "app-todo-header", ngImport: i0, template: "<header class=\"header\">\n    <h1>todos</h1>\n    <input class=\"new-todo\" placeholder=\"What needs to be done?\" autofocus=\"\" [formControl]=\"titleFormControl\" (keyup.enter)=\"addTodo()\" />\n</header>\n", dependencies: [{ kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-todo-header", template: "<header class=\"header\">\n    <h1>todos</h1>\n    <input class=\"new-todo\" placeholder=\"What needs to be done?\" autofocus=\"\" [formControl]=\"titleFormControl\" (keyup.enter)=\"addTodo()\" />\n</header>\n" }]
        }], ctorParameters: function () { return [{ type: TodosService }]; } });

class TodoItemComponent {
    constructor() {
        this.todo = {
            id: "",
            title: "",
            completed: false,
        };
        this.index = 0;
        this.deleteEvent = new EventEmitter();
        this.titleFormControl = new FormControl("");
        this.isEditing = false;
    }
    toggleTodo() {
        this.todo.completed = !this.todo.completed;
    }
    removeTodo() {
        this.deleteEvent.emit(this.todo);
    }
    startEdit() {
        this.isEditing = true;
    }
    handleBlur(e) {
        this.isEditing = false;
    }
    handleFocus(e) {
        this.titleFormControl.setValue(this.todo.title);
    }
    updateTodo() {
        const title = this.titleFormControl.getRawValue()?.trimEnd();
        if (!title)
            this.deleteEvent.emit(this.todo);
        else
            this.todo.title = title;
        this.isEditing = false;
    }
    ngAfterViewChecked() {
        if (this.isEditing)
            this.inputRef?.nativeElement.focus();
    }
}
TodoItemComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoItemComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
TodoItemComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: TodoItemComponent, selector: "app-todo-item", inputs: { todo: "todo", index: "index" }, outputs: { deleteEvent: "deleteEvent" }, viewQueries: [{ propertyName: "inputRef", first: true, predicate: ["todoInputRef"], descendants: true }], ngImport: i0, template: "<li [ngClass]=\"'targeted li-' + index + (todo.completed ? ' completed' : '') + (isEditing ? ' editing' : '')\">\n    <div [ngClass]=\"'targeted view-' + index\">\n        <input class=\"toggle\" type=\"checkbox\" (click)=\"toggleTodo()\" [checked]=\"todo.completed\" />\n        <label (dblclick)=\"startEdit()\">{{ todo.title }}</label>\n        <button class=\"destroy\" (click)=\"removeTodo()\"></button>\n    </div>\n    <div *ngIf=\"isEditing\" class=\"input-container\">\n        <input #todoInputRef class=\"edit\" id=\"edit-todo-input\" (focus)=\"handleFocus($event)\" (blur)=\"handleBlur($event)\" (keyup.enter)=\"updateTodo()\" [formControl]=\"titleFormControl\" />\n        <label class=\"visually-hidden\" htmlFor=\"edit-todo-input\"> Edit Todo Input </label>\n    </div>\n</li>\n", dependencies: [{ kind: "directive", type: i2$1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoItemComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-todo-item", changeDetection: ChangeDetectionStrategy.OnPush, template: "<li [ngClass]=\"'targeted li-' + index + (todo.completed ? ' completed' : '') + (isEditing ? ' editing' : '')\">\n    <div [ngClass]=\"'targeted view-' + index\">\n        <input class=\"toggle\" type=\"checkbox\" (click)=\"toggleTodo()\" [checked]=\"todo.completed\" />\n        <label (dblclick)=\"startEdit()\">{{ todo.title }}</label>\n        <button class=\"destroy\" (click)=\"removeTodo()\"></button>\n    </div>\n    <div *ngIf=\"isEditing\" class=\"input-container\">\n        <input #todoInputRef class=\"edit\" id=\"edit-todo-input\" (focus)=\"handleFocus($event)\" (blur)=\"handleBlur($event)\" (keyup.enter)=\"updateTodo()\" [formControl]=\"titleFormControl\" />\n        <label class=\"visually-hidden\" htmlFor=\"edit-todo-input\"> Edit Todo Input </label>\n    </div>\n</li>\n" }]
        }], propDecorators: { todo: [{
                type: Input
            }], index: [{
                type: Input
            }], deleteEvent: [{
                type: Output
            }], inputRef: [{
                type: ViewChild,
                args: ["todoInputRef"]
            }] } });

class TodoListComponent {
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
TodoListComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoListComponent, deps: [{ token: TodosService }, { token: i2$1.Location }], target: i0.ɵɵFactoryTarget.Component });
TodoListComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: TodoListComponent, selector: "app-todo-list", ngImport: i0, template: "<main class=\"main\" *ngIf=\"todos.length > 0\">\n    <div class=\"toggle-all-container\">\n        <input class=\"toggle-all\" type=\"checkbox\" (change)=\"toggleAll($event)\" [checked]=\"!activeTodos.length\" />\n        <label class=\"toggle-all-label\" htmlFor=\"toggle-all\"> Toggle All Input </label>\n    </div>\n    <ul class=\"todo-list\">\n        <app-todo-item *ngFor=\"let todo of todos; let i = index; trackBy: trackByItem\" [todo]=\"todo\" [index]=\"i\" (deleteEvent)=\"removeTodo($event)\"></app-todo-item>\n    </ul>\n</main>\n", dependencies: [{ kind: "directive", type: i2$1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: TodoItemComponent, selector: "app-todo-item", inputs: ["todo", "index"], outputs: ["deleteEvent"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoListComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-todo-list", template: "<main class=\"main\" *ngIf=\"todos.length > 0\">\n    <div class=\"toggle-all-container\">\n        <input class=\"toggle-all\" type=\"checkbox\" (change)=\"toggleAll($event)\" [checked]=\"!activeTodos.length\" />\n        <label class=\"toggle-all-label\" htmlFor=\"toggle-all\"> Toggle All Input </label>\n    </div>\n    <ul class=\"todo-list\">\n        <app-todo-item *ngFor=\"let todo of todos; let i = index; trackBy: trackByItem\" [todo]=\"todo\" [index]=\"i\" (deleteEvent)=\"removeTodo($event)\"></app-todo-item>\n    </ul>\n</main>\n" }]
        }], ctorParameters: function () { return [{ type: TodosService }, { type: i2$1.Location }]; } });

class TodoFooterComponent {
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
TodoFooterComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoFooterComponent, deps: [{ token: TodosService }, { token: i2$1.Location }], target: i0.ɵɵFactoryTarget.Component });
TodoFooterComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: TodoFooterComponent, selector: "app-todo-footer", ngImport: i0, template: "<footer class=\"footer\" *ngIf=\"todos.length > 0\">\n    <span class=\"todo-count\"\n        ><strong>{{ activeTodos.length }}</strong> {{ activeTodos.length == 1 ? \"item\" : \"items\" }} left</span\n    >\n    <ul class=\"filters\">\n        <li>\n            <a routerLink=\"/\" [class.selected]=\"filter === 'all'\"> All </a>\n        </li>\n        <li>\n            <a routerLink=\"/active\" [class.selected]=\"filter === 'active'\"> Active </a>\n        </li>\n        <li>\n            <a routerLink=\"/completed\" [class.selected]=\"filter === 'completed'\"> Completed </a>\n        </li>\n    </ul>\n    <button *ngIf=\"completedTodos.length\" type=\"button\" class=\"clear-completed\" (click)=\"clearCompleted()\">Clear Completed</button>\n</footer>\n", dependencies: [{ kind: "directive", type: i2$1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.RouterLinkWithHref, selector: "a[routerLink],area[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: TodoFooterComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-todo-footer", template: "<footer class=\"footer\" *ngIf=\"todos.length > 0\">\n    <span class=\"todo-count\"\n        ><strong>{{ activeTodos.length }}</strong> {{ activeTodos.length == 1 ? \"item\" : \"items\" }} left</span\n    >\n    <ul class=\"filters\">\n        <li>\n            <a routerLink=\"/\" [class.selected]=\"filter === 'all'\"> All </a>\n        </li>\n        <li>\n            <a routerLink=\"/active\" [class.selected]=\"filter === 'active'\"> Active </a>\n        </li>\n        <li>\n            <a routerLink=\"/completed\" [class.selected]=\"filter === 'completed'\"> Completed </a>\n        </li>\n    </ul>\n    <button *ngIf=\"completedTodos.length\" type=\"button\" class=\"clear-completed\" (click)=\"clearCompleted()\">Clear Completed</button>\n</footer>\n" }]
        }], ctorParameters: function () { return [{ type: TodosService }, { type: i2$1.Location }]; } });

class AppComponent {
    constructor() {
        this.title = "angular";
    }
}
AppComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
AppComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: AppComponent, selector: "app-root", ngImport: i0, template: "<section class=\"todoapp\">\n    <app-todo-header></app-todo-header>\n    <app-todo-list></app-todo-list>\n    <app-todo-footer></app-todo-footer>\n</section>\n", dependencies: [{ kind: "component", type: TodoHeaderComponent, selector: "app-todo-header" }, { kind: "component", type: TodoListComponent, selector: "app-todo-list" }, { kind: "component", type: TodoFooterComponent, selector: "app-todo-footer" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-root", template: "<section class=\"todoapp\">\n    <app-todo-header></app-todo-header>\n    <app-todo-list></app-todo-list>\n    <app-todo-footer></app-todo-footer>\n</section>\n" }]
        }] });

const routes = [
    { path: "all", component: AppComponent },
    { path: "active", component: AppComponent },
    { path: "completed", component: AppComponent },
    { path: "", redirectTo: "/all", pathMatch: "full" },
];
class AppRoutingModule {
}
AppRoutingModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppRoutingModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AppRoutingModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.3.0", ngImport: i0, type: AppRoutingModule, imports: [i3.RouterModule], exports: [RouterModule] });
AppRoutingModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppRoutingModule, imports: [RouterModule.forRoot(routes, { useHash: true }), RouterModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppRoutingModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [RouterModule.forRoot(routes, { useHash: true })],
                    exports: [RouterModule],
                }]
        }] });

class AppModule {
}
AppModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AppModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.3.0", ngImport: i0, type: AppModule, bootstrap: [AppComponent], declarations: [AppComponent, TodoHeaderComponent, TodoListComponent, TodoFooterComponent, TodoItemComponent], imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule] });
AppModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppModule, imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AppModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [AppComponent, TodoHeaderComponent, TodoListComponent, TodoFooterComponent, TodoItemComponent],
                    imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
                    providers: [],
                    bootstrap: [AppComponent],
                }]
        }] });

/*
 * Public API Surface of shared-library
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AppModule };
//# sourceMappingURL=shared-library.mjs.map
