import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Todo } from '../todo';
import { TodosService } from '../todos.service';

@Component({
  selector: 'app-todo-footer',
  templateUrl: './todo-footer.component.html',
  styleUrls: ['./todo-footer.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TodoFooterComponent {
  constructor(private todosService: TodosService) {}

  get todos(): Todo[] {
    return this.todosService.getItems();
  }

  get activeTodos(): Todo[] {
    return this.todosService.getItems("active");
  }

  get completedTodos(): Todo[] {
    return this.todosService.getItems("completed");
  }

  clearCompleted() {
    this.todosService.clearCompleted();
  }
}
