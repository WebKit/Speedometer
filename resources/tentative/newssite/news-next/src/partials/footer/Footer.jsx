import { useState } from "react";
import { createPortal } from "react-dom";
import Dialog from "@/components/dialog/dialog";
import ReducedMotion from "@/assets/reduced-motion-icon";
import FacebookIcon from "@/assets/facebook-icon";
import InstagramIcon from "@/assets/instagram-icon";
import TwitterIcon from "@/assets/twitter-icon";

export default function Footer() {
    const [showSettings, setShowSettings] = useState(false);

    function openDialog() {
        setShowSettings(true);
    }

    function closeDialog() {
        setShowSettings(false);
    }

    return (
        <>
            <footer className="page-footer">
                <div className="footer-row">
                    <div className="footer-column-left">
                        <div className="footer-icons">
                            <ul className="footer-icons-list">
                                <li className="footer-icons-item">
                                    <a href="#" id="footer-link-social-facebook">
                                        <div className="footer-icon">
                                            <FacebookIcon />
                                        </div>
                                    </a>
                                </li>
                                <li className="footer-icons-item">
                                    <a href="#" id="footer-link-social-instagram">
                                        <div className="footer-icon">
                                            <InstagramIcon />
                                        </div>
                                    </a>
                                </li>
                                <li className="footer-icons-item">
                                    <a href="#" id="footer-link-social-twitter">
                                        <div className="footer-icon">
                                            <TwitterIcon />
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-column-center">© {new Date().getFullYear()} No Rights Reserved</div>
                    <div className="footer-column-right">
                        <div className="footer-icons">
                            <ul className="footer-icons-list">
                                <li className="footer-icons-item">
                                    <button onClick={openDialog}>
                                        <div className="footer-icon">
                                            <ReducedMotion />
                                        </div>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
            {showSettings ? createPortal(<Dialog onClose={closeDialog} />, document.getElementById("settings-container")) : null}
        </>
    );
}
