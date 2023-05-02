import { ShowMore } from './components/show-more.jsx';
import { Ribbon } from './components/ribbon.jsx';
import { TopBar } from './components/top-bar.jsx';
import { TreeArea } from './components/tree-area.jsx';

const TodoArea = () => {
  return (
    <div className="ui todo-area">
    </div>
  );
}

export const App = () => {
  return (
    <div className="ui main-ui" dir="ltr">
      <ShowMore/>
      <Ribbon/>
      <TopBar/>
      <TreeArea/>
      <TodoArea/>
    </div>
  );
}
