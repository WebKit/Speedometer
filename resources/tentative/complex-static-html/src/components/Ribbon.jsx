import EmailIcon from "../assets/Smock_Email_18_N.svg";
import ChevronDown from '../assets/Smock_ChevronDown_18_N.svg';
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
            <EmailIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--sizeS spectrum-ActionButton--quiet">
            <ChevronDown className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
        <span className="spectrum-ActionButton-label">New Mail</span>
        </button>
    </div>
);
}

const RibbonGroupTwo = () => {
return (<>
    <div className="spectrum-ActionGroup spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--sizeS spectrum-ActionButton--quiet">
            <SpamIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            <span className="spectrum-ActionButton-label">Spam</span>
        </button>
    </div>
    <div className="spectrum-ActionGroup spectrum-ActionGroup--vertical spectrum-ActionGroup--compact spectrum-ActionGroup--quiet spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <ArchiveIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            <span className="spectrum-ActionButton-label">Archive</span>
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <DeleteIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
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
            <ReplyIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            <span className="spectrum-ActionButton-label">reply</span>
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <ReplyAllIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            <span className="spectrum-ActionButton-label">Reply All</span>
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <ForwardIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            <span className="spectrum-ActionButton-label">Forward</span>
        </button>
    </div>
    );
}

const RibbonGroupFour = () => {
    return (<>
        <div className="spectrum-ActionGroup spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--sizeS spectrum-ActionButton--quiet">
            <FlagIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            <span className="spectrum-ActionButton-label">Flag</span>
        </button>
    </div>
    <div className="spectrum-ActionGroup spectrum-ActionGroup--quiet spectrum-ActionGroup--vertical spectrum-ActionGroup--compact spectrum-ActionGroup--sizeS">
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <PrintIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            <span className="spectrum-ActionButton-label">Print</span>
        </button>
        <button className="spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeS spectrum-ActionGroup-item">
            <SaveToIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            <span className="spectrum-ActionButton-label">Save</span>
        </button>
    </div>
    </>
    );
}

export const Ribbon = () => {
    const numChildren = 4;
    const children = [
    <RibbonGroupOne key={0} />,
    <Divider key={1}/>,
    <RibbonGroupTwo key={2}/>, 
    <Divider key={3}/>, 
    <RibbonGroupThree key={4}/>, 
    <Divider key={5}/>, 
    <RibbonGroupFour key={6}/>
  ];
    return (
      <div className={`ribbon`}>
        {children}
      </div>
    );
  }