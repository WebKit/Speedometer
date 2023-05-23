import { useNavigate } from "react-router-dom";

import Navbar from "../../components/navbar/navbar";

export default function Navigation() {
    const navigate = useNavigate();

    function openSitemap() {
        navigate("/");
    }

    function logIn() {
        console.log("logIn()");
    }

    return (
        <>
            <nav className="page-navigation" aria-label="main menu">
                <div className="page-navigation-row">
                    <div className="page-navigation-column-left">
                        <Navbar openSitemap={openSitemap} />
                    </div>
                    <div className="page-navigation-column-right">
                        <button id="login-button" className="button secondary-button nav-button" onClick={logIn}>
                        Log In
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}
