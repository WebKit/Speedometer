import { useState } from "react";
import { createPortal } from "react-dom";
import Dialog from "@/components/dialog/dialog";
import SettingsIcons from "../icons/settings-icons";
import SocialIcons from "../icons/social-icons";
import Sitemap from "@/components/sitemap/sitemap";

import styles from "news-site-css/dist/footer.module.css";

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
            <footer className={styles["page-footer"]}>
                <div className={styles["footer-row"]}>
                    <div className={styles["footer-column-center"]}>
                        <Sitemap />
                    </div>
                </div>
                <div className={styles["footer-row"]}>
                    <div className={styles["footer-column-center"]}>
                        <div className={styles["footer-links"]}>
                            <ul className={styles["footer-links-list"]}>
                                <li className={styles["footer-links-item"]}>
                                    <a href="#" id="footer-link-terms" className={styles["footer-link"]}>
                                        Terms of Use
                                    </a>
                                </li>
                                <li className={styles["footer-links-item"]}>
                                    <a href="#" id="footer-link-privacy" className={styles["footer-link"]}>
                                        Privacy Policy
                                    </a>
                                </li>
                                <li className={styles["footer-links-item"]}>
                                    <a href="#" id="footer-link-sell" className={styles["footer-link"]}>
                                        Do Not Sell Or Share My Personal Information
                                    </a>
                                </li>
                                <li className={styles["footer-links-item"]}>
                                    <a href="#" id="footer-link-adchoices" className={styles["footer-link"]}>
                                        Ad Choices
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={styles["footer-row"]}>
                    <div className={styles["footer-column-left"]}>
                        <SocialIcons id="footer-social-icons"/>
                    </div>
                    <div className={styles["footer-column-center"]}>© {new Date().getFullYear()} No Rights Reserved</div>
                    <div className={styles["footer-column-right"]}>
                        <SettingsIcons onClick={openPortal} id="footer-settings-icons" />
                    </div>
                </div>
            </footer>
            {showPortal ? createPortal(<Dialog onClose={closePortal} />, document.getElementById("settings-container")) : null}
        </>
    );
}
