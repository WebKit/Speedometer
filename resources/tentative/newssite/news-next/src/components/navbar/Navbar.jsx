import { useEffect, useState } from "react";
import NavList from "../navlist/NavList";
import Logo from "@/assets/Logo";

export default function Navbar({ openSitemap }) {
    const [isOpen, setIsOpen] = useState(false);

    function handleChange(e) {
        setIsOpen(e.target.checked);
    }

    function closeMenu() {
        setIsOpen(false);
    }

    function calculateViewportHeight() {
        // Since the navbar is supposed to appear below the menu, we can't use position: fixed, height: 100%.
        // Therefore we are using 100vh for the height. This function fixes the challenge on mobile, where
        // 100vh might include the addressbar, ect.

        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    useEffect(() => {
        calculateViewportHeight();
        window.addEventListener("resize", calculateViewportHeight);
        return () => {
            window.removeEventListener("resize", calculateViewportHeight);
        };
    }, []);

    return (
        <div className="navbar">
            <input type="checkbox" id="navbar-toggle" onChange={handleChange} checked={isOpen} />
            <label htmlFor="navbar-toggle" className="navbar-label">
                <div className="animated-icon hamburger-icon" title="Hamburger Icon">
                    <span className="animated-icon-inner">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </label>
            <button className="page-navigation-logo" id="sitemap-link" onClick={openSitemap}>
                <Logo />
            </button>
            <div className="navbar-content">
                <NavList id="navbar-navlist" callback={closeMenu} />
            </div>
        </div>
    );
}
