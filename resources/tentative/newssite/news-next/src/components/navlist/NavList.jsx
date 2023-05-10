import { content } from "@/data/content";
import Dropdown from "../dropdown/dropdown";
import NavListItem from "./navlist-item";

export default function NavList({ callback, id }) {
    const keys = Object.keys(content);
    const [navItems, dropdownItems] = keys.reduce(
        (result, key) => {
            // priority 0 does not show up in nav
            if (content[key].priority === 0)
                return result;

            // priority 1 shows up in nav list
            // priority 2 shows up in nav dropdown
            result[content[key].priority === 1 ? 0 : 1].push(key);
            return result;
        },
        [[], []]
    );

    return (
        <ul className="navbar-list">
            {navItems.map((key) =>
                <NavListItem id={`${id}-${key}-link`} key={key} label={content[key].name} url={content[key].url} callback={callback} />
            )}
            {dropdownItems.length > 0
                ? <li className="navbar-item">
                    <Dropdown>
                        {dropdownItems.map((key) =>
                            <NavListItem id={`${id}-${key}-link`} key={key} label={content[key].name} url={content[key].url} callback={callback} />
                        )}
                    </Dropdown>
                </li> : null}
        </ul>
    );
}
