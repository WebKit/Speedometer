import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TodosService } from '../todos.service';
import { Todo } from '../todo';

@Component({
  selector: 'app-todo-header',
  templateUrl: './todo-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoHeaderComponent {
  constructor(private todosService: TodosService) {}

  newTodo: Todo = new Todo("", "", false);

  addTodo() {
    const todoTitle = this.newTodo.title.trim();
    if (todoTitle.length <= 0)
      return;

    this.todosService.addItem(todoTitle);
    this.newTodo.title = "";
  }
}
