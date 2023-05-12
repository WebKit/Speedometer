import { useState } from "react";
import { createPortal } from "react-dom";
import Dialog from "@/components/dialog/dialog";
import SettingsIcons from "../icons/settings-icons";
import SocialIcons from "../icons/social-icons";
import Sitemap from "@/components/sitemap/sitemap";

export default function Footer() {
    const [showPortal, setShowPortal] = useState(false);

    function openPortal() {
        setShowPortal(true);
    }

    function closePortal() {
        setShowPortal(false);
    }

    return (
        <>
            <footer className="page-footer">
                <div className="footer-row">
                    <div className="footer-column-center">
                        <Sitemap />
                    </div>
                </div>
                <div className="footer-row">
                    <div className="footer-column-center">
                        <div className="footer-links">
                            <ul className="footer-links-list">
                                <li className="footer-links-item">
                                    <a href="#" id="footer-link-terms" className="footer-link">
                                        Terms of Use
                                    </a>
                                </li>
                                <li className="footer-links-item">
                                    <a href="#" id="footer-link-privacy" className="footer-link">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li className="footer-links-item">
                                    <a href="#" id="footer-link-sell" className="footer-link">
                                        Do Not Sell Or Share My Personal Information
                                    </a>
                                </li>
                                <li className="footer-links-item">
                                    <a href="#" id="footer-link-adchoices" className="footer-link">
                                        Ad Choices
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-row">
                    <div className="footer-column-left">
                        <SocialIcons />
                    </div>
                    <div className="footer-column-center">© {new Date().getFullYear()} No Rights Reserved</div>
                    <div className="footer-column-right">
                        <SettingsIcons onClick={openPortal} />
                    </div>
                </div>
            </footer>
            {showPortal ? createPortal(<Dialog onClose={closePortal} />, document.getElementById("settings-container")) : null}
        </>
    );
}
