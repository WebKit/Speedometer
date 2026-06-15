import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

import 'components/todomvc.dart';

class App extends StatelessComponent {
  const App({super.key});

  @override
  Component build(BuildContext context) => Component.fragment([
    TodoMVC(),
    footer(classes: 'info', [
      p([Component.text('Double-click to edit a todo')]),
      p([Component.text('Created by the Dart team')]),
      p([
        Component.text('Part of '),
        a(href: 'http://todomvc.com', [Component.text('TodoMVC')]),
      ]),
    ]),
  ]);
}
