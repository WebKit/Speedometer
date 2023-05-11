import { ActionButton } from "./action-group";
import { OptionsPopOver } from "./pop-over";

import MoreIcon from "./../assets/Smock_MoreCircle_18_N.svg";

export const ShowMore = () => {
    return (
        <div className="ui show-more">
            <ActionButton Icon={MoreIcon} quiet />
            <OptionsPopOver numOptions={10} />
        </div>
    );
};
