import ProfileIcon from './../assets/Smock_RealTimeCustomerProfile_18_N.svg';
import SettingsIcon from './../assets/Smock_Settings_18_N.svg';
import BellIcon from './../assets/Smock_Bell_18_N.svg';

export const ActionButton = ({ Icon, label, quiet}) => {
  return (
      <button className={`spectrum-ActionButton spectrum-ActionButton--sizeM ${quiet ? "spectrum-ActionButton--quiet" : ""} spectrum-ActionGroup-item`}>
          <Icon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
          <span className="spectrum-ActionButton-label">{label}</span>
      </button>
  );
};

export const ActionGroup = ( { children } ) => {
  return (
    <div className="ui spectrum-ActionGroup spectrum-ActionGroup--compact spectrum-ActionGroup--sizeM">
      {children}
    </div>
  );
}

