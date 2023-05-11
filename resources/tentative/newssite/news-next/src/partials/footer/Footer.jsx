import { useState } from "react";
import { createPortal } from "react-dom";
import Dialog from "@/components/dialog/dialog";
import ReducedMotion from "@/assets/reduced-motion-icon";
import FacebookIcon from "@/assets/facebook-icon";
import InstagramIcon from "@/assets/instagram-icon";
import TwitterIcon from "@/assets/twitter-icon";

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
                                    <button onClick={openPortal}>
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
            {showPortal ? createPortal(<Dialog onClose={closePortal} />, document.getElementById("settings-container")) : null}
        </>
    );
}
