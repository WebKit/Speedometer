import { NavLink } from "react-router-dom";

export default function NavItem({ id, label, url, callback }) {
    return (
        <li className="navbar-item" onClick={callback}>
            <NavLink to={url} id={id}>
                {label}
            </NavLink>
        </li>
    );
}
