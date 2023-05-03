import DeleteIcon from "../assets/Smock_Delete_18_N.svg";
import CutIcon from "../assets/Smock_Cut_18_N.svg";
import AddIcon from "../assets/Smock_Add_18_N.svg";
import FilterIcon from "../assets/Smock_Filter_18_N.svg";
import ViewListIcon from "../assets/Smock_ViewList_18_N.svg";
import GraphTrendIcon from "../assets/Smock_GraphTrend_18_N.svg";
import CalendarIcon from "../assets/Smock_Calendar_18_N.svg";
import GraphGanttIcon from "../assets/Smock_GraphGantt_18_N.svg";
import ClockIcon from "../assets/Smock_Clock_18_N.svg";
import { ActionButton, ActionGroup } from "./action-group";

const Divider = () => {
    return <div className="ui divider spectrum-Divider spectrum-Divider--sizeS spectrum-Divider--vertical" />;
};

export const Ribbon = () => {
    return (
        <div className="ui ribbon">
            <ActionGroup>
                <ActionButton Icon={ClockIcon} label={"Send Reminder"} quiet />
                <ActionButton Icon={ViewListIcon} label={"Backlog"} quiet />
                <ActionButton Icon={GraphTrendIcon} label={"Analytics"} quiet />
            </ActionGroup>
            <Divider />
            <ActionGroup>
                <ActionButton Icon={CutIcon} quiet />
                <ActionButton Icon={DeleteIcon} quiet />
            </ActionGroup>
            <Divider />
            <ActionGroup>
                <ActionButton Icon={CalendarIcon} label={"Calendar"} quiet />
                <ActionButton Icon={GraphGanttIcon} label={"Timeline"} quiet />
                <ActionButton Icon={FilterIcon} quiet />
            </ActionGroup>
            <Divider />
            <ActionGroup>
                <ActionButton Icon={AddIcon} label={"New Sprint"} />
            </ActionGroup>
        </div>);
};
