import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/navbar/Navbar";
import Menu from "../../components/menu/Menu";

export default function Navigation() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    function openMenu() {
        setMenuOpen(true);
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    function openSitemap() {
        navigate("/");
    }

    return (
        <>
            <nav className="page-navigation" aria-label="main menu">
                <div className="page-navigation-row">
                    <div className="page-navigation-column-left">
                        <Navbar openMenu={openMenu} openSitemap={openSitemap} />
                    </div>
                    <div className="page-navigation-column-right"></div>
                </div>
            </nav>
            { menuOpen ? createPortal(
                <Menu closeMenu={closeMenu} />, document.getElementById("menu-container")
            ) : null }
        </>
    );
}
