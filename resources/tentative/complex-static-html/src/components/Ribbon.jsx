import EmailIcon from "../assets/Smock_Email_18_N.svg";
import ChevronDown from '../assets/Smock_ChevronDown_18_N.svg';
import ViewWeekIcon from '../assets/Smock_ViewWeek_18_N.svg';
import UserGroupIcon from '../assets/Smock_UserGroup_18_N.svg';
import SpamIcon from '../assets/Smock_Spam_18_N.svg';
import ArchiveIcon from '../assets/Smock_Archive_18_N.svg';
import DeleteIcon from '../assets/Smock_Delete_18_N.svg';
import ReplyIcon from '../assets/Smock_Reply_18_N.svg';
import ReplyAllIcon from '../assets/Smock_ReplyAll_18_N.svg';
import ForwardIcon from '../assets/Smock_Forward_18_N.svg';
import FlagIcon from '../assets/Smock_Flag_18_N.svg';
import PrintIcon from '../assets/Smock_Print_18_N.svg';
import SaveToIcon from '../assets/Smock_SaveTo_18_N.svg';

const Divider = () => {
    return (
      <div className="divider spectrum-Divider spectrum-Divider--sizeS spectrum-Divider--vertical"/>
    );
}

const RibbonGroupOne = () => {
return (
    <div className="spectrum-ActionGroup spectrum-ActionGroup--vertical spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <EmailIcon />
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--sizeS spectrum-ActionButton--quiet">
            <ChevronDown />
        <span className="spectrum-ActionButton-label">New Mail</span>
        </button>
        <div className="spectrum-Popover spectrum-Popover--bottom">
            <ul className="spectrum-Menu" role="menu">
                <li className="spectrum-Menu-item" role="menuitem" tabIndex="0">
                    <EmailIcon />
                <span className="spectrum-Menu-itemLabel">Mail</span>
                </li>
                <li className="spectrum-Menu-item" role="menuitem" tabIndex="0">
                    <ViewWeekIcon />
                <span className="spectrum-Menu-itemLabel">Event</span>
                </li>
                <li className="spectrum-Menu-item" role="menuitem" tabIndex="0">
                    <UserGroupIcon />
                <span className="spectrum-Menu-itemLabel">Group</span>
                </li>
            </ul>
        </div>
    </div>
);
}

const RibbonGroupTwo = () => {
return (<>
    <div className="spectrum-ActionGroup spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--sizeS spectrum-ActionButton--quiet">
            <SpamIcon />
            <span className="spectrum-ActionButton-label">Spam</span>
        </button>
    </div>
    <div className="spectrum-ActionGroup spectrum-ActionGroup--vertical spectrum-ActionGroup--compact spectrum-ActionGroup--quiet spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <ArchiveIcon />
            <span className="spectrum-ActionButton-label">Archive</span>
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <DeleteIcon />
            <span className="spectrum-ActionButton-label">Delete</span>
        </button>
    </div>
    </>
    );
}

const RibbonGroupThree = () => {
    return (
        <div className="spectrum-ActionGroup spectrum-ActionGroup--vertical spectrum-ActionGroup--compact spectrum-ActionGroup--quiet spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <ReplyIcon />
            <span className="spectrum-ActionButton-label">reply</span>
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <ReplyAllIcon />
            <span className="spectrum-ActionButton-label">Reply All</span>
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <ForwardIcon />
            <span className="spectrum-ActionButton-label">Forward</span>
        </button>
    </div>
    );
}

const RibbonGroupFour = () => {
    return (<>
        <div className="spectrum-ActionGroup spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--sizeS spectrum-ActionButton--quiet">
            <FlagIcon />
            <span className="spectrum-ActionButton-label">Flag</span>
        </button>
    </div>
    <div className="spectrum-ActionGroup spectrum-ActionGroup--quiet spectrum-ActionGroup--vertical spectrum-ActionGroup--compact spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <PrintIcon />
            <span className="spectrum-ActionButton-label">Print</span>
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <SaveToIcon />
            <span className="spectrum-ActionButton-label">Save</span>
        </button>
    </div>
    </>
    );
}

export const Ribbon = () => {
    const numChildren = 4;
    const children = [
    <RibbonGroupOne key={1} />,
    <Divider key={2}/>,
    <RibbonGroupTwo key={3}/>, 
    <Divider key={4}/>, 
    <RibbonGroupThree key={5}/>, 
    <Divider key={6}/>, 
    <RibbonGroupFour key={7}/>
  ];
    return (
      <div className={`ribbon`}>
        {children}
      </div>
    );
  }