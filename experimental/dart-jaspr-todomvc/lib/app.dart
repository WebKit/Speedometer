import 'package:jaspr/jaspr.dart';
import 'components/todomvc.dart';

class App extends StatelessComponent {
  const App({super.key});

  @override
  Iterable<Component> build(BuildContext context) => [
        TodoMVC(),
        footer(classes: 'info', [
          p([text('Double-click to edit a todo')]),
          p([text('Created by the Dart team')]),
          p([
            text('Part of '),
            a(href: 'http://todomvc.com', [text('TodoMVC')])
          ]),
        ]),
      ];
}
