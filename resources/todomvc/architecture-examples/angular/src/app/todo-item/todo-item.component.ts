import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Todo } from '../todo';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css']
})
export class TodoItemComponent implements AfterViewChecked{
  @Input() todo:Todo = new Todo("", "", false);

  @Output() toggleEvent = new EventEmitter<Todo>();
  @Output() deleteEvent = new EventEmitter<Todo>();
  @Output() updateEvent = new EventEmitter<{todo: Todo, title: string}>();

  @ViewChild('todoInputRef') inputRef: ElementRef | undefined; 

  isEditing:boolean = false;

  toggleTodo(todo:Todo):void {
    this.toggleEvent.emit(todo);
  }

  removeTodo(todo:Todo):void {
    this.deleteEvent.emit(todo);
  }

  startEdit() {
    this.isEditing = true;
  }

  handleBlur(e:Event) {
    this.isEditing = false;
  }

  updateTodo(todo: Todo, title: string) {
    const todoTitle = title.trim();
    if (todoTitle.length <= 0)
      this.deleteEvent.emit(todo);
    else 
      this.updateEvent.emit({todo, title});
  }

  ngAfterViewChecked(): void {
    if (this.isEditing) {
      if (this.inputRef) this.inputRef.nativeElement.focus();
    }
  }
}
