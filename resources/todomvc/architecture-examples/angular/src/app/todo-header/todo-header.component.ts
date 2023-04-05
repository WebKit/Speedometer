import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TodosService } from '../todos.service';

@Component({
  selector: 'app-todo-header',
  templateUrl: './todo-header.component.html',
  styleUrls: ['./todo-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoHeaderComponent {
  constructor(private todosService: TodosService) {}

  addTodo(title: string) {
    const todoTitle = title.trim();
    if (todoTitle.length <= 0)
      return;

    this.todosService.addItem(todoTitle);
  }
}
