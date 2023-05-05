import { Link } from "react-router-dom";
import NavList from "../navlist/NavList";
import Title from "@/assets/Title";

export default function Menu({ closeMenu }) {
    return (
        <div id="menu" className="mobile-menu open" onClick={closeMenu}>
            <button id="close-menu-link" className="close-button">
                <div className="animated-icon close-icon hover" title="Close Icon">
                    <span className="animated-icon-inner">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </button>
            <header className="mobile-menu-header">
                <Link to="/" className="mobile-menu-title">
                    <Title />
                </Link>
            </header>
            <section className="mobile-menu-body">
                <nav className="mobile-menu-nav">
                    <NavList />
                </nav>
            </section>
        </div>
    );
}
