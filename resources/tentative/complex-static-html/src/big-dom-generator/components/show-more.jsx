import { ActionButton } from './action-group';

import MoreIcon from './../assets/Smock_MoreCircle_18_N.svg';

export const ShowMore = () => {
  return (
    <div className="ui show-more">
      <ActionButton Icon={MoreIcon} label="" quiet/>
    </div>
  );
}
