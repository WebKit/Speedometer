import { useNavigate } from "react-router-dom";
import classNames from "classnames";

import Navbar from "../../components/navbar/navbar";

import { login as loginEn } from "@/data/en/buttons";
import { login as loginJp } from "@/data/jp/buttons";

import navStyles from "news-site-css/dist/nav.module.css";
import buttonStyles from "news-site-css/dist/button.module.css";

export default function Navigation() {
    const navigate = useNavigate();

    // language-switch
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    let currentLogin = lang === "jp" ? loginJp : loginEn;

    function callback() {
        navigate("/");
    }

    function logIn() {
        console.log("logIn()");
    }

    return (
        <>
            <nav className={navStyles["page-navigation"]} aria-label="main menu">
                <div className={navStyles["page-navigation-row"]}>
                    <div className={navStyles["page-navigation-column-left"]}>
                        <Navbar callback={callback} />
                    </div>
                    <div className={navStyles["page-navigation-column-right"]}>
                        <button id="login-button" className={classNames(buttonStyles.button, buttonStyles["secondary-button"], navStyles["nav-button"])} onClick={logIn}>
                            {currentLogin.label}
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}
