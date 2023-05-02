import SearchIcon from './../assets/Smock_Search_18_N.svg';
import CrossIcon from './../assets/CrossSize100.svg';

export const SearchArea = () => {
  return (
    <form className="ui spectrum-Search">
      <div className="ui spectrum-Textfield spectrum-Search-textfield">
        <SearchIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-Textfield-icon spectrum-Search-icon" focusable="false" aria-hidden="true" id="spectrum-icon-18-Magnify"/>
        <input type="search" placeholder="Search" name="search" defaultValue="" className="ui spectrum-Textfield-input spectrum-Search-input" autoComplete="off"/>
      </div>
      <button type="reset" className="ui spectrum-ClearButton spectrum-ClearButton--sizeM spectrum-Search-clearButton">
        <div className="ui spectrum-ClearButton-fill">
          <CrossIcon className="ui spectrum-Icon spectrum-ClearButton-icon spectrum-UIIcon-Cross100" focusable="false"/>
        </div>
      </button>
    </form>
  );
}