import { SearchArea } from './search-area';
import { ActionButton, ActionGroup } from './action-group';

import ProfileIcon from './../assets/Smock_RealTimeCustomerProfile_18_N.svg';
import SettingsIcon from './../assets/Smock_Settings_18_N.svg';
import BellIcon from './../assets/Smock_Bell_18_N.svg';

import SpeedometerLogo from './../assets/logo.png';

export const TopBar = () => {
  return (
    <div className="ui top-bar">
      <img className="ui" src={SpeedometerLogo} alt="Speedometer Logo" height={40} />
      <h2 className="ui spectrum-Heading spectrum-Heading--sizeXXL">TODO App</h2>
      <div className={`ui search-area`}>
        <SearchArea/>
      </div>
      <div className="ui top-bar-right">
        <ActionGroup>
          <ActionButton Icon={BellIcon} quite={false}/>
          <ActionButton Icon={SettingsIcon} quite={false}/>
          <ActionButton Icon={ProfileIcon} quite={false}/>
        </ActionGroup>
      </div>
    </div>
  );
}