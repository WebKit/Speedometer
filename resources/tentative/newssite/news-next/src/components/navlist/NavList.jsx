import { content } from "@/data/content";
import NavItem from "./NavItem";

export default function NavList({ onClickCallback, id }) {
    const keys = Object.keys(content);

    return (
        <ul className="navbar-list" onClick={onClickCallback}>
            {keys.map((key) =>
                <NavItem id={`${id}-${key}-link`} key={key} label={content[key].name} url={content[key].url} />
            )}
        </ul>
    );
}
