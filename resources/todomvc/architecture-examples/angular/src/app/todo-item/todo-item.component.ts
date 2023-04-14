import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Todo } from '../todo';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoItemComponent implements AfterViewChecked{
  @Input() todo:Todo = new Todo("", "", false);

  @Output() toggleEvent = new EventEmitter<Todo>();
  @Output() deleteEvent = new EventEmitter<Todo>();
  @Output() updateEvent = new EventEmitter<{todo: Todo, title: string}>();

  @ViewChild('todoInputRef') inputRef: ElementRef | undefined; 

  titleFormControl = new FormControl("");

  isEditing:boolean = false;

  toggleTodo():void {
    this.toggleEvent.emit(this.todo);
  }

  removeTodo():void {
    this.deleteEvent.emit(this.todo);
  }

  startEdit() {
    this.isEditing = true;
  }

  handleBlur(e:Event) {
    this.isEditing = false;
  }

  handleFocus(e:Event) {
    this.titleFormControl.setValue(this.todo.title);
  }

  updateTodo() {
    const title = this.titleFormControl.getRawValue()?.trimEnd();
    console.log("title", title);
    if (!title)
      this.deleteEvent.emit(this.todo);
    else 
      this.updateEvent.emit({todo: this.todo, title});

    this.isEditing = false;
  }

  ngAfterViewChecked(): void {
    if (this.isEditing) {
      this.inputRef?.nativeElement.focus();
    }
  }
}
