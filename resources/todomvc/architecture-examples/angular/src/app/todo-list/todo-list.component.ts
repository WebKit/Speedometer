import { Component } from '@angular/core';
import { Todo } from '../todo';
import { TodosService } from '../todos.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent {
  constructor(private todosService: TodosService) {}

  get todos(): Todo[] {
    return this.todosService.getItems();
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
}
