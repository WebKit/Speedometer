import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import { FormControl } from "@angular/forms";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
export class TodoItemComponent {
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
TodoItemComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: TodoItemComponent, selector: "app-todo-item", inputs: { todo: "todo", index: "index" }, outputs: { deleteEvent: "deleteEvent" }, viewQueries: [{ propertyName: "inputRef", first: true, predicate: ["todoInputRef"], descendants: true }], ngImport: i0, template: "<li [ngClass]=\"'targeted li-' + index + (todo.completed ? ' completed' : '') + (isEditing ? ' editing' : '')\">\n    <div [ngClass]=\"'targeted view-' + index\">\n        <input class=\"toggle\" type=\"checkbox\" (click)=\"toggleTodo()\" [checked]=\"todo.completed\" />\n        <label (dblclick)=\"startEdit()\">{{ todo.title }}</label>\n        <button class=\"destroy\" (click)=\"removeTodo()\"></button>\n    </div>\n    <div *ngIf=\"isEditing\" class=\"input-container\">\n        <input #todoInputRef class=\"edit\" id=\"edit-todo-input\" (focus)=\"handleFocus($event)\" (blur)=\"handleBlur($event)\" (keyup.enter)=\"updateTodo()\" [formControl]=\"titleFormControl\" />\n        <label class=\"visually-hidden\" htmlFor=\"edit-todo-input\"> Edit Todo Input </label>\n    </div>\n</li>\n", dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1pdGVtLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvYXBwL3RvZG8taXRlbS90b2RvLWl0ZW0uY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9hcHAvdG9kby1pdGVtL3RvZG8taXRlbS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBZ0MsdUJBQXVCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekksT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7O0FBUzdDLE1BQU0sT0FBTyxpQkFBaUI7SUFOOUI7UUFPYSxTQUFJLEdBQVM7WUFDbEIsRUFBRSxFQUFFLEVBQUU7WUFDTixLQUFLLEVBQUUsRUFBRTtZQUNULFNBQVMsRUFBRSxLQUFLO1NBQ25CLENBQUM7UUFFTyxVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBRWpCLGdCQUFXLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztRQUlqRCxxQkFBZ0IsR0FBRyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV2QyxjQUFTLEdBQUcsS0FBSyxDQUFDO0tBb0NyQjtJQWxDRyxVQUFVO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsVUFBVTtRQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsU0FBUztRQUNMLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRCxVQUFVLENBQUMsQ0FBUTtRQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFFRCxXQUFXLENBQUMsQ0FBUTtRQUNoQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELFVBQVU7UUFDTixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDN0QsSUFBSSxDQUFDLEtBQUs7WUFDTixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O1lBRWpDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUU1QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUMzQixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsSUFBSSxJQUFJLENBQUMsU0FBUztZQUNkLElBQUksQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzdDLENBQUM7OzhHQWxEUSxpQkFBaUI7a0dBQWpCLGlCQUFpQixrUENWOUIsMnhCQVdBOzJGRERhLGlCQUFpQjtrQkFON0IsU0FBUzsrQkFDSSxlQUFlLG1CQUdSLHVCQUF1QixDQUFDLE1BQU07OEJBR3RDLElBQUk7c0JBQVosS0FBSztnQkFNRyxLQUFLO3NCQUFiLEtBQUs7Z0JBRUksV0FBVztzQkFBcEIsTUFBTTtnQkFFb0IsUUFBUTtzQkFBbEMsU0FBUzt1QkFBQyxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdDaGlsZCwgRWxlbWVudFJlZiwgQWZ0ZXJWaWV3Q2hlY2tlZCwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgRm9ybUNvbnRyb2wgfSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcbmltcG9ydCB7IFRvZG8gfSBmcm9tIFwiLi4vdG9kb1wiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogXCJhcHAtdG9kby1pdGVtXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiLi90b2RvLWl0ZW0uY29tcG9uZW50Lmh0bWxcIixcbiAgICAvLyBUaGlzIHN0cmF0ZWd5IGVuc3VyZXMgdGhhdCB0aGUgaXRlbSB3aWxsIG9ubHkgcmUtcmVuZGVyIHdoZW4gdGhlIHRvZG8gZGF0YSBjaGFuZ2VzLlxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxufSlcbmV4cG9ydCBjbGFzcyBUb2RvSXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0NoZWNrZWQge1xuICAgIEBJbnB1dCgpIHRvZG86IFRvZG8gPSB7XG4gICAgICAgIGlkOiBcIlwiLFxuICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgY29tcGxldGVkOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgQElucHV0KCkgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgICBAT3V0cHV0KCkgZGVsZXRlRXZlbnQgPSBuZXcgRXZlbnRFbWl0dGVyPFRvZG8+KCk7XG5cbiAgICBAVmlld0NoaWxkKFwidG9kb0lucHV0UmVmXCIpIGlucHV0UmVmOiBFbGVtZW50UmVmIHwgdW5kZWZpbmVkO1xuXG4gICAgdGl0bGVGb3JtQ29udHJvbCA9IG5ldyBGb3JtQ29udHJvbChcIlwiKTtcblxuICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuXG4gICAgdG9nZ2xlVG9kbygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b2RvLmNvbXBsZXRlZCA9ICF0aGlzLnRvZG8uY29tcGxldGVkO1xuICAgIH1cblxuICAgIHJlbW92ZVRvZG8oKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGVsZXRlRXZlbnQuZW1pdCh0aGlzLnRvZG8pO1xuICAgIH1cblxuICAgIHN0YXJ0RWRpdCgpIHtcbiAgICAgICAgdGhpcy5pc0VkaXRpbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIGhhbmRsZUJsdXIoZTogRXZlbnQpIHtcbiAgICAgICAgdGhpcy5pc0VkaXRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBoYW5kbGVGb2N1cyhlOiBFdmVudCkge1xuICAgICAgICB0aGlzLnRpdGxlRm9ybUNvbnRyb2wuc2V0VmFsdWUodGhpcy50b2RvLnRpdGxlKTtcbiAgICB9XG5cbiAgICB1cGRhdGVUb2RvKCkge1xuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMudGl0bGVGb3JtQ29udHJvbC5nZXRSYXdWYWx1ZSgpPy50cmltRW5kKCk7XG4gICAgICAgIGlmICghdGl0bGUpXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUV2ZW50LmVtaXQodGhpcy50b2RvKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy50b2RvLnRpdGxlID0gdGl0bGU7XG5cbiAgICAgICAgdGhpcy5pc0VkaXRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmlzRWRpdGluZylcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZWY/Lm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG59XG4iLCI8bGkgW25nQ2xhc3NdPVwiJ3RhcmdldGVkIGxpLScgKyBpbmRleCArICh0b2RvLmNvbXBsZXRlZCA/ICcgY29tcGxldGVkJyA6ICcnKSArIChpc0VkaXRpbmcgPyAnIGVkaXRpbmcnIDogJycpXCI+XG4gICAgPGRpdiBbbmdDbGFzc109XCIndGFyZ2V0ZWQgdmlldy0nICsgaW5kZXhcIj5cbiAgICAgICAgPGlucHV0IGNsYXNzPVwidG9nZ2xlXCIgdHlwZT1cImNoZWNrYm94XCIgKGNsaWNrKT1cInRvZ2dsZVRvZG8oKVwiIFtjaGVja2VkXT1cInRvZG8uY29tcGxldGVkXCIgLz5cbiAgICAgICAgPGxhYmVsIChkYmxjbGljayk9XCJzdGFydEVkaXQoKVwiPnt7IHRvZG8udGl0bGUgfX08L2xhYmVsPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZGVzdHJveVwiIChjbGljayk9XCJyZW1vdmVUb2RvKClcIj48L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2ICpuZ0lmPVwiaXNFZGl0aW5nXCIgY2xhc3M9XCJpbnB1dC1jb250YWluZXJcIj5cbiAgICAgICAgPGlucHV0ICN0b2RvSW5wdXRSZWYgY2xhc3M9XCJlZGl0XCIgaWQ9XCJlZGl0LXRvZG8taW5wdXRcIiAoZm9jdXMpPVwiaGFuZGxlRm9jdXMoJGV2ZW50KVwiIChibHVyKT1cImhhbmRsZUJsdXIoJGV2ZW50KVwiIChrZXl1cC5lbnRlcik9XCJ1cGRhdGVUb2RvKClcIiBbZm9ybUNvbnRyb2xdPVwidGl0bGVGb3JtQ29udHJvbFwiIC8+XG4gICAgICAgIDxsYWJlbCBjbGFzcz1cInZpc3VhbGx5LWhpZGRlblwiIGh0bWxGb3I9XCJlZGl0LXRvZG8taW5wdXRcIj4gRWRpdCBUb2RvIElucHV0IDwvbGFiZWw+XG4gICAgPC9kaXY+XG48L2xpPlxuIl19