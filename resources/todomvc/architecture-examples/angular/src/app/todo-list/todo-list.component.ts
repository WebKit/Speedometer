import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Todo } from '../todo';
import { TodosService } from '../todos.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  constructor(
    private todosService: TodosService,
    private location: Location
  ) {}

  get todos(): Todo[] {
    const filter = this.location.path().split('/')[1] || "all";
    return this.todosService.getItems(filter);
  }

  get activeTodos(): Todo[] {
    return this.todosService.getItems("active");
  }

  toggleTodo(todo:Todo):void {
    this.todosService.toggleItem(todo);
  }

  removeTodo(todo:Todo):void {
    this.todosService.removeItem(todo);
  }

  updateTodo({todo, title}: {todo: Todo, title: string}):void {
    this.todosService.updateItem(todo, title);
  }

  toggleAll(e: Event) {
    const input = e.target as HTMLInputElement;
    this.todosService.toggleAll(input.checked);
  }

  trackByItem(index: number, todo: Todo) {
    return todo.id;
  }
}
