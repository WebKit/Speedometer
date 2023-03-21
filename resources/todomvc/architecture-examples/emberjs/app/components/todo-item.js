import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class TodoItemComponent extends Component {
  @service('todo-data') todos;
}
