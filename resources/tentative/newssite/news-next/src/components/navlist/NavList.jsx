import { content } from "@/data/content";
import Dropdown from "../dropdown/dropdown";
import NavListItem from "./navlist-item";

export default function NavList({ callback, id }) {
    const navItems = [];
    const dropdownItems = [];

    Object.keys(content).forEach(key => {
        if (content[key].priority === 1)
            navItems.push(key);
        else if (content[key].priority === 2)
            dropdownItems.push(key);
    });

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
