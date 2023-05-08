import { content } from "@/data/content";
import Dropdown from "../dropdown/Dropdown";
import NavItem from "./NavItem";

export default function NavList({ callback, id }) {
    const keys = Object.keys(content);
    const [navItems, dropdownItems] = keys.reduce(
        (result, key) => {
            result[content[key].priority === 1 ? 0 : 1].push(key);
            return result;
        },
        [[], []]
    );

    return (
        <ul className="navbar-list">
            {navItems.map((key) =>
                <NavItem id={`${id}-${key}-link`} key={key} label={content[key].name} url={content[key].url} callback={callback} />
            )}
            {dropdownItems.length > 0
                ? <li className="navbar-item">
                    <Dropdown>
                        {dropdownItems.map((key) =>
                            <NavItem id={`${id}-${key}-link`} key={key} label={content[key].name} url={content[key].url} callback={callback} />
                        )}
                    </Dropdown>
                </li> : null}
        </ul>
    );
}
