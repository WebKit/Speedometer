import DeleteIcon from "../assets/Smock_Delete_18_N.svg";
import CutIcon from "../assets/Smock_Cut_18_N.svg";
import AddIcon from "../assets/Smock_Add_18_N.svg";
import FilterIcon from "../assets/Smock_Filter_18_N.svg";
import ViewListIcon from "../assets/Smock_ViewList_18_N.svg";
import GraphTrendIcon from "../assets/Smock_GraphTrend_18_N.svg";
import CalendarIcon from "../assets/Smock_Calendar_18_N.svg";
import GraphGanttIcon from "../assets/Smock_GraphGantt_18_N.svg";
import ClockIcon from "../assets/Smock_Clock_18_N.svg";

const Divider = () => {
    return <div className="ui divider spectrum-Divider spectrum-Divider--sizeS spectrum-Divider--vertical" />;
};

const RibbonGroupOne = () => {
    return (
        <div className="ui spectrum-ActionGroup spectrum-ActionGroup--sizeS">
            <button className="spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet">
                <ClockIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
                <span className="spectrum-ActionButton-label">Send Reminder</span>
            </button>
            <button className="spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet">
                <ViewListIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
                <span className="spectrum-ActionButton-label">Backlog</span>
            </button>
            <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet">
                <GraphTrendIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
                <span className="ui spectrum-ActionButton-label">Analytics</span>
            </button>
        </div>
    );
};

const RibbonGroupTwo = () => {
    return (
        <>
            <div className="ui spectrum-ActionGroup spectrum-ActionGroup--sizeM">
                <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet">
                    <CutIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
                    <span className="ui spectrum-ActionButton-label">Cut</span>
                </button>
                <button className="ui spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeM spectrum-ActionGroup-item">
                    <DeleteIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
                    <span className="ui spectrum-ActionButton-label">Delete</span>
                </button>
            </div>
        </>
    );
};

const RibbonGroupThree = () => {
    return (
        <div className="ui ribbon-group-flex-end ui spectrum-ActionGroup spectrum-ActionGroup--compact spectrum-ActionGroup--quiet spectrum-ActionGroup--sizeS">
            <button className="ui spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeM spectrum-ActionGroup-item">
                <CalendarIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
                <span className="ui spectrum-ActionButton-label">Calendar</span>
            </button>
            <button className="ui spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeM spectrum-ActionGroup-item">
                <GraphGanttIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
                <span className="ui spectrum-ActionButton-label">Timeline</span>
            </button>
            <button className="ui spectrum-ActionButton spectrum-ActionButton--quiet spectrum-ActionButton--sizeM spectrum-ActionGroup-item">
                <FilterIcon className="spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
            </button>
        </div>
    );
};

const RibbonGroupFour = () => {
    return (
        <div className="ui spectrum-ActionGroup spectrum-ActionGroup--quiet spectrum-ActionGroup--sizeS">
            <button className="ui spectrum-ActionButton spectrum-ActionButton--sizeL spectrum-ActionGroup-item">
                <AddIcon className="ui spectrum-Icon spectrum-Icon--sizeM spectrum-ActionButton-icon" focusable="false" aria-hidden="true" />
                <span className="ui spectrum-ActionButton-label">New Sprint</span>
            </button>
        </div>
    );
};

export const Ribbon = () => {
    const children = [<RibbonGroupOne key={0} />, <Divider key={1} />, <RibbonGroupTwo key={2} />, <RibbonGroupThree key={3} />, <RibbonGroupFour key={4} />];
    return <div className="ui ribbon">{children}</div>;
};
