import { SearchArea } from "./search-area";
import { ActionButton, ActionGroup } from "./action-group";
import { OptionsPopOver, VerticalPopOver } from "./pop-over";

import ProfileIcon from "./../assets/Smock_RealTimeCustomerProfile_18_N.svg";
import SettingsIcon from "./../assets/Smock_Settings_18_N.svg";
import BellIcon from "./../assets/Smock_Bell_18_N.svg";
import HelpIcon from "../assets/Smock_Help_18_N.svg";
import CheckmarkIcon from "../assets/Smock_Checkmark_18_N.svg";

import SpeedometerLogo from "./../assets/logo.png";

const ContextualHelp = () => {
    return (
        <>
            <ActionButton Icon={HelpIcon} quiet={false} />
            <div role="presentation" className="ui spectrum-Popover spectrum-Popover--sizeM spectrum-Popover--bottom-start spectrum-ContextualHelp-popover">
                <div className="ui context-help-popover-body">
                    <h2 className="ui spectrum-ContextualHelp-heading">Todo help</h2>
                    <p className="ui spectrum-ContextualHelp-body">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>
            </div>
        </>
    );
};

const ProfileCardPopOver = () => {
    return (
        <div className="ui spectrum-Popover spectrum-Popover--bottom-start profile-card-popover" role="dialog">
            <div className="ui spectrum-Card spectrum-Card--sizeS" tabIndex="0" role="figure">
                <div className="ui spectrum-Card-coverPhoto"></div>
                <div className="ui spectrum-Card-body">
                    <div className="ui spectrum-Card-header">
                        <div className="ui spectrum-Card-title spectrum-Heading spectrum-Heading--sizeXS">John Doe</div>
                    </div>
                    <div className="ui spectrum-Card-content">
                        <div className="ui spectrum-Card-subtitle spectrum-Detail spectrum-Detail--sizeXS">
                            <p>jdoe</p>
                        </div>
                    </div>
                </div>
                <a className="ui spectrum-Card-footer">Sign in with a different account</a>
            </div>
        </div>
    );
};

const Notifications = () => {
    return (
        <div className="ui spectrum-FieldGroup spectrum-FieldGroup--toplabel spectrum-FieldGroup--vertical" role="group" aria-labelledby="checkboxgroup-label-1">
            <div className="ui spectrum-FieldLabel spectrum-FieldLabel--sizeM" id="checkboxgroup-label-1">
                Notifications
            </div>

            <div className="ui spectrum-FieldGroupInputLayout" aria-describedby="helptext-checkbox-1">
                <label className="ui spectrum-Checkbox spectrum-Checkbox--sizeM spectrum-FieldGroup-item">
                    <input type="checkbox" className="ui spectrum-Checkbox-input" id="checkbox-0" />
                    <span className="ui spectrum-Checkbox-box">
                        <CheckmarkIcon className="ui spectrum-Icon spectrum-UIIcon-Checkmark100 spectrum-Checkbox-checkmark" />
                    </span>
                    <span className="ui spectrum-Checkbox-label">Checkbox</span>
                </label>

                <label className="ui spectrum-Checkbox spectrum-Checkbox--sizeM spectrum-FieldGroup-item">
                    <input type="checkbox" className="ui spectrum-Checkbox-input" id="checkbox-2" />
                    <span className="ui spectrum-Checkbox-box">
                        <CheckmarkIcon className="ui spectrum-Icon spectrum-UIIcon-Checkmark100 spectrum-Checkbox-checkmark" />
                    </span>
                    <span className="ui spectrum-Checkbox-label">Checkbox</span>
                </label>

                <label className="ui spectrum-Checkbox spectrum-Checkbox--sizeM spectrum-FieldGroup-item">
                    <input type="checkbox" className="ui spectrum-Checkbox-input" id="checkbox-3" defaultChecked={true} />
                    <span className="ui spectrum-Checkbox-box">
                        <CheckmarkIcon className="ui spectrum-Icon spectrum-UIIcon-Checkmark100 spectrum-Checkbox-checkmark" />
                    </span>
                    <span className="ui spectrum-Checkbox-label">Checkbox</span>
                </label>
            </div>
        </div>
    );
};

export const TopBar = () => {
    const numSettings = 5;
    return (
        <div className="ui top-bar">
            <img className="ui" src={SpeedometerLogo} alt="Speedometer Logo for TODO App" height={40} />
            <div className={`ui search-area`}>
                <SearchArea />
            </div>
            <div className="ui top-bar-right">
                <ActionGroup>
                    <ContextualHelp />
                    <ActionButton Icon={BellIcon} quiet={false} />
                    <VerticalPopOver>
                        <Notifications />
                    </VerticalPopOver>
                    <ActionButton Icon={SettingsIcon} quiet={false} />
                    <OptionsPopOver numOptions={numSettings} />
                    <ActionButton Icon={ProfileIcon} quiet={false} />
                    <ProfileCardPopOver />
                </ActionGroup>
            </div>
        </div>
    );
};
