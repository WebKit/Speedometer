import ProfileIcon from './../assets/Smock_RealTimeCustomerProfile_18_N.svg';
import SettingsIcon from './../assets/Smock_Settings_18_N.svg';
import BellIcon from './../assets/Smock_Bell_18_N.svg';

export const ActionGroup = () => {
  return (
    <div className="ui spectrum-ActionGroup spectrum-ActionGroup--compact spectrum-ActionGroup--sizeM">
      <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionGroup-item">
        <BellIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" aria-label="Edit"/>
      </button>
      <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionGroup-item">
        <SettingsIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" aria-label="Copy"/>
      </button>
      <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionGroup-item is-selected">
        <ProfileIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" aria-label="Delete"/>
      </button>
    </div>
  );
}