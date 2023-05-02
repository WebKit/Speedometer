import { TreeArea } from "./tree-area";
import { SearchArea } from './search-area';
import { ActionGroup } from './action-group';
import { Ribbon } from './Ribbon';

import MoreIcon from './../assets/Smock_MoreCircle_18_N.svg';

const TopBar = () => {
  return (
    <div className="ui top-bar">
      <h1 className="ui spectrum-Heading spectrum-Heading--sizeXXXL">Company</h1>
      <h2 className="ui spectrum-Heading spectrum-Heading--sizeXXL">TODO App</h2>
      <div className="ui search-area">
        <SearchArea/>
      </div>
      <div className="ui top-bar-right">
        <ActionGroup/>
      </div>
    </div>
  );
}

const ShowMore = () => {
  return (
    <div className="ui show-more">
      <button className="ui show-more spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet">
        <MoreIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true"/>
      </button>
    </div>
  );
}

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



