import { useNavigate } from "react-router-dom";

import Navbar from "../../components/navbar/Navbar";

export default function Navigation() {
    const navigate = useNavigate();

    function openSitemap() {
        navigate("/");
    }

    return (
        <>
            <nav className="page-navigation" aria-label="main menu">
                <div className="page-navigation-row">
                    <div className="page-navigation-column-left">
                        <Navbar openSitemap={openSitemap} />
                    </div>
                    <div className="page-navigation-column-right"></div>
                </div>
            </nav>
        </>
    );
}
