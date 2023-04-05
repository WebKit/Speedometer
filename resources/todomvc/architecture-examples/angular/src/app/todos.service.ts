import { Injectable } from '@angular/core';
import { Todo } from './todo';

const uuid = () => crypto.randomUUID();

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  todos: Todo[] = [];

  addItem(title: string): void {
    this.todos = this.todos.concat(new Todo(
      uuid(),
      title,
      false,
    ));
  }

  toggleItem(todoToToggle: Todo):void {
    this.todos = this.todos.map((todo) => todo !== todoToToggle ? todo : { ...todo, completed: !todo.completed });
  }

  removeItem(todo: Todo):void {
    this.todos = this.todos.filter((t) => t !== todo);
  }

  updateItem(todoToSave: Todo, title: string) {
    this.todos = this.todos.map((todo) => todo !== todoToSave ? todo : { ...todo, title });
  }

  clearCompleted():void {
    this.todos = this.todos.filter((todo) => !todo.completed);
  }

  toggleAll(completed: boolean):void {
    this.todos = this.todos.map((todo) => ({ ...todo, completed }));
  }

  getItems(type="all"): Todo[] {
    switch(type) {
      case "active":
        return this.todos.filter(todo => !todo.completed);
      case "completed":
        return this.todos.filter(todo => todo.completed);
    }

    return [...this.todos];
  }
}
