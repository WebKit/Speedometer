import { SearchArea } from './search-area';
import { ActionButton, ActionGroup } from './action-group';

import ProfileIcon from './../assets/Smock_RealTimeCustomerProfile_18_N.svg';
import SettingsIcon from './../assets/Smock_Settings_18_N.svg';
import BellIcon from './../assets/Smock_Bell_18_N.svg';

import SpeedometerLogo from './../assets/speedometer_logo.png';

// const ActionGroup = () => {
//   return (
//     <div className="ui spectrum-ActionGroup spectrum-ActionGroup--compact spectrum-ActionGroup--sizeM">
//       <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionGroup-item">
//         <BellIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" aria-label="Edit"/>
//       </button>
//       <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionGroup-item">
//         <SettingsIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" aria-label="Copy"/>
//       </button>
//       <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionGroup-item is-selected">
//         <ProfileIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" aria-label="Delete"/>
//       </button>
//     </div>
//   );
// }

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
          <ActionButton Icon={BellIcon} label="Bell" quite={false}/>
          <ActionButton Icon={SettingsIcon} label="Settings" quite={false}/>
          <ActionButton Icon={ProfileIcon} label="Profile" quite={true}/>
        </ActionGroup>
      </div>
    </div>
  );
}