import { NavLink } from "react-router-dom";

export default function NavItem({ id, label, url }) {
    return (
        <li className="navbar-item">
            <NavLink to={url} id={id}>
                {label}
            </NavLink>
        </li>
    );
}
