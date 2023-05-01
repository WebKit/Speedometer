import { TreeArea } from "./tree-area";
import { SearchArea } from './search-area';

const TopBar = () => {
  return (
    <div className={`top-bar`}>
      <div className={`top-bar-left`}>
        <div className={`company`}/>
          <SearchArea/>
      </div>
      <div className={`top-bar-right`}>
      </div>
    </div>
  );
}

const Divider = () => {
  return (
    <div className={`divider`}/>
  );
}

const Ribbon = () => {
  const numChildren = 4;
  const children = [<div/>, <Divider/>, <div/>, <Divider/>, <div/>, <Divider/>, <div/>];
  return (
    <div className={`ribbon`}>
      {children}
    </div>
  );
}

const TodoArea = () => {
  return (
    <div className={`todo-area`}>
    </div>
  );
}

const MainArea = () => {
  return (
    <div className={`main-area`}>
      <Ribbon/>
      <TreeArea/>
      <TodoArea/>
    </div>
  );
}

export const App = () => {
  return (
    <div className={`main-ui`} dir="ltr">
      <TopBar/>
      <MainArea/>
    </div>
  );
}



