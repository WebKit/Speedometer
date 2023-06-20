import { useState } from "react";
import { createPortal } from "react-dom";
import Dialog from "@/components/dialog/dialog";
import SettingsIcons from "../icons/settings-icons";
import SocialIcons from "../icons/social-icons";
import Sitemap from "@/components/sitemap/sitemap";
import { legal as legalEn } from "@/data/en/links";
import { legal as legalJp } from "@/data/jp/links";
import { footer as footerEn } from "@/data/en/footer";
import { footer as footerJp } from "@/data/jp/footer";

import styles from "news-site-css/dist/footer.module.css";

export default function Footer() {
    const [showPortal, setShowPortal] = useState(false);

    // language-switch
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    let currentLegal = lang === "jp" ? legalJp : legalEn;
    let currentFooter = lang === "jp" ? footerJp : footerEn;

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
                                {Object.keys(currentLegal).map((key) => {
                                    const item = currentLegal[key];
                                    return (
                                        <li className={styles["footer-links-item"]} key={`footer-links-item-${key}`}>
                                            <a href={item.href} id={`footer-link-${key}`} className={styles["footer-link"]}>
                                                {item.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={styles["footer-row"]}>
                    <div className={styles["footer-column-left"]}>
                        <SocialIcons id="footer-social-icons" />
                    </div>
                    <div className={styles["footer-column-center"]}>
                        © {new Date().getFullYear()} {currentFooter.copyright.label}
                    </div>
                    <div className={styles["footer-column-right"]}>
                        <SettingsIcons onClick={openPortal} id="footer-settings-icons" />
                    </div>
                </div>
            </footer>
            {showPortal ? createPortal(<Dialog onClose={closePortal} />, document.getElementById("settings-container")) : null}
        </>
    );
}
