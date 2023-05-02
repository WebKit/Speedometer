import { TreeArea } from "./tree-area";
import { SearchArea } from './search-area';
import { ActionGroup } from './action-group';
import { Ribbon } from './Ribbon';

import MoreIcon from './../assets/Smock_MoreCircle_18_N.svg';

const TopBar = () => {
  return (
    <div className="top-bar">
      <h1 className="spectrum-Heading spectrum-Heading--sizeXXXL">Company</h1>
      <h2 className="spectrum-Heading spectrum-Heading--sizeXXL">TODO App</h2>
      <div className={`search-area`}>
        <SearchArea/>
      </div>
      <div className={`top-bar-right`}>
        <ActionGroup/>
      </div>
    </div>
  );
}

const ShowMore = () => {
  return (
    <div className="show-more">
      <button className="show-more spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet">
        <MoreIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true"/>
      </button>
    </div>
  );
}

const TodoArea = () => {
  return (
    <div className={`todo-area`}>
    </div>
  );
}

export const App = () => {
  return (
    <div className={`main-ui`} dir="ltr">
      <ShowMore/>
      <Ribbon/>
      <TopBar/>
      <TreeArea/>
      <TodoArea/>
    </div>
  );
}



