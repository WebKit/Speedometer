import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

@client
class TodoMVC extends StatefulComponent {
  @override
  State<StatefulComponent> createState() => TodoMVCState();
}

enum DisplayState { all, active, completed }

// Todo string, active pair
typedef Todo = ({bool isActive, String todo});

class TodoMVCState extends State<TodoMVC> {
  var todos = <int, Todo>{};
  var dataIdCount = 0;
  var activeCount = 0;
  var displayState = DisplayState.all;

  void addTodo(String todo) {
    setState(() {
      todos[++dataIdCount] = (todo: todo, isActive: true);
      activeCount++;
    });
  }

  void toggle(int i) {
    setState(() {
      var (:isActive, :todo) = todos[i]!;
      todos[i] = (todo: todo, isActive: !isActive);
      if (isActive) {
        activeCount--;
      } else {
        activeCount++;
      }
    });
  }

  void toggleAll() {
    setState(() {
      for (var i in todos.keys) {
        var (isActive: _, :todo) = todos[i]!;
        todos[i] = (todo: todo, isActive: activeCount == 0);
      }
      activeCount = (activeCount == 0) ? allCount : 0;
    });
  }

  void destroy(int i) {
    setState(() {
      var (:isActive, :todo) = todos.remove(i)!;
      if (isActive) {
        activeCount--;
      }
    });
  }

  void clearCompleted() {
    setState(() {
      todos.removeWhere((dataId, todo) => !todo.isActive);
    });
  }

  void setDisplayState(DisplayState state) {
    setState(() {
      displayState = state;
    });
  }

  int get allCount => todos.length;

  int get completedCount => allCount - activeCount;

  @override
  Component build(BuildContext context) =>
      section(id: 'root', classes: 'todoapp', [
        header(
          classes: 'header',
          attributes: {'data-testid': 'header'},
          [
            h1([Component.text('todos')]),
            div(classes: 'input-container', [NewTodo(addTodo)]),
          ],
        ),
        main_(
          classes: 'main',
          styles: Styles(display: todos.isEmpty ? Display.none : Display.block),
          [
            div(classes: 'toggle-all-container', [
              input(
                classes: 'toggle-all',
                id: 'toggle-all',
                type: InputType.checkbox,
                attributes: activeCount > 0 ? null : {'checked': ''},
                onChange: (_) => toggleAll(),
              ),
              label(
                classes: 'toggle-all-label',
                attributes: {'for': 'toggle-all'},
                [Component.text('Mark all as complete')],
              ),
            ]),
            ul(classes: 'todo-list', [
              for (var (dataId, (:isActive, :todo)) in todos.keyValues)
                if (isActive && displayState != DisplayState.completed ||
                    !isActive && displayState != DisplayState.active)
                  li(
                    classes: isActive ? '' : 'completed',
                    attributes: {'data-id': '$dataId'},
                    [
                      div(classes: 'view', [
                        input(
                          classes: 'toggle',
                          key: Key('$dataId-$isActive'),
                          type: InputType.checkbox,
                          attributes: isActive ? null : {'checked': ''},
                          onChange: (_) => toggle(dataId),
                        ),
                        label([Component.text(todo)]),
                        button(
                          classes: 'destroy',
                          onClick: () => destroy(dataId),
                          [],
                        ),
                      ]),
                    ],
                  ),
            ]),
          ],
        ),
        footer(
          classes: 'footer',
          styles: Styles(display: todos.isEmpty ? Display.none : Display.block),
          [
            span(classes: 'todo-count', [
              strong([Component.text('$activeCount')]),
              Component.text(' item${activeCount == 1 ? '' : 's'} left'),
            ]),
            ul(classes: 'filters', [
              for (var (name, state) in [
                ('All', DisplayState.all),
                ('Active', DisplayState.active),
                ('Completed', DisplayState.completed),
              ])
                li([
                  span(
                    classes: displayState == state ? 'selected' : '',
                    events: {'click': (_) => setDisplayState(state)},
                    [Component.text(name)],
                  ),
                ]),
            ]),
            button(
              classes: 'clear-completed',
              styles: Styles(
                display: completedCount == 0 ? Display.none : Display.block,
              ),
              onClick: clearCompleted,
              [Component.text('Clear completed')],
            ),
          ],
        ),
      ]);
}

class NewTodo extends StatelessComponent {
  final void Function(String) handler;

  NewTodo(this.handler);

  @override
  Component build(BuildContext context) => input(
    classes: 'new-todo',
    value: '',
    onChange: (str) => handler(str as String),
    attributes: {'placeholder': 'What needs to be done?'},
  );
}

extension MapExtensions<K, V> on Map<K, V> {
  Iterable<(K, V)> get keyValues =>
      entries.map((entry) => (entry.key, entry.value));
}
