import ProfileIcon from './../assets/Smock_RealTimeCustomerProfile_18_N.svg';
import SettingsIcon from './../assets/Smock_Settings_18_N.svg';
import BellIcon from './../assets/Smock_Bell_18_N.svg';

export const ActionButton = ({ Icon, label, quiet}) => {
  const text = label ? <span className="ui spectrum-ActionButton-label">{label}</span> : null;
  return (
      <button className={`ui spectrum-ActionButton spectrum-ActionButton--sizeM ${quiet ? "spectrum-ActionButton--quiet" : ""} spectrum-ActionGroup-item`}>
          <Icon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
          {text}
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

