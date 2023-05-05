import { content } from "@/data/content";
import NavItem from "../navitem/NavItem";

export default function NavList() {
    const keys = Object.keys(content);

    return (
        <ul className="navbar-list">
            {keys.map((key) =>
                <NavItem id={`nav-page-${key}-link`} key={key} label={content[key].name} url={content[key].url} />
            )}
        </ul>
    );
}
