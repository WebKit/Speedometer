import { useState } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";

import Sidebar from "@/components/sidebar/sidebar";
import Modal from "@/components/modal/modal";
import Navbar from "@/components/navbar/navbar";

import { login } from "@/data/buttons";

import navStyles from "news-site-css/dist/nav.module.css";
import buttonStyles from "news-site-css/dist/button.module.css";

export default function Navigation() {
    const [showSidebar, setShowSidebar] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    function openSidebar() {
        setShowSidebar(true);
    }

    function closeSidebar() {
        setShowSidebar(false);
    }

    function openLogin() {
        setShowLogin(true);
    }

    function closeLogin() {
        setShowLogin(false);
    }

    return (
        <>
            <nav className={navStyles["page-navigation"]} aria-label="main menu">
                <div className={navStyles["page-navigation-row"]}>
                    <div className={navStyles["page-navigation-column-left"]}>
                        <Navbar callback={openSidebar} />
                    </div>
                    <div className={navStyles["page-navigation-column-right"]}>
                        <button id="login-button" className={classNames(
                            buttonStyles.button,
                            buttonStyles["secondary-button"],
                            navStyles["nav-button"]
                        )} onClick={openLogin}>
                            {login.label}
                        </button>
                    </div>
                </div>
            </nav>
            {showSidebar
                ? createPortal(
                    <Sidebar onClose={closeSidebar} />,
                    document.getElementById("sitemap-container")
                )
                : null}
            {showLogin
                ? createPortal(
                    <Modal onClose={closeLogin} />,
                    document.getElementById("login-container")
                )
                : null}
        </>
    );
}
