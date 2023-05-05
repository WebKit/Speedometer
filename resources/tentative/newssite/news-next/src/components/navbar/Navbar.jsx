import NavList from "../navlist/NavList";
import Logo from "@/assets/Logo";

export default function Navbar({ openMenu, openSitemap }) {
    return (
        <div className="navbar">
            <button id="menu-link" className="navbar-label" onClick={openMenu}>
                <div className="animated-icon hamburger-icon" title="Hamburger Icon">
                    <span className="animated-icon-inner">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </button>
            <button className="page-navigation-logo" id="sitemap-link" onClick={openSitemap}>
                <Logo />
            </button>
            <div className="navbar-content">
                <NavList />
            </div>
        </div>
    );
}
