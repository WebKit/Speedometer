import { useState, useEffect } from "react";
import classNames from "classnames";

import Toggle from "../toggle/toggle";
import { settings as settingsEn } from "@/data/en/dialog";
import { settings as settingsJp } from "@/data/jp/dialog";

import styles from "news-site-css/dist/dialog.module.css";

export default function Dialog({ onClose }) {
    const [isChecked, setIsChecked] = useState(false);

    // language-switch
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    let currentSettings = lang === "jp" ? settingsJp : settingsEn;

    useEffect(() => {
        setIsChecked(document.body.classList.contains("reduced-motion"));
    }, []);

    function handleChange(e) {
        setIsChecked(e.target.checked);

        if (e.target.checked)
            document.body.classList.add("reduced-motion");
        else
            document.body.classList.remove("reduced-motion");
    }

    return (
        <div id="settings" className={classNames(styles.dialog, styles.open)}>
            <button id="close-dialog-link" className={styles["dialog-close-button"]} onClick={onClose} title="Close Button">
                <div className={classNames(styles["dialog-close-button-icon"], "animated-icon", "close-icon", "hover")} title="Close Icon">
                    <span className="animated-icon-inner">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </button>
            <header className={styles["dialog-header"]}>
                <h2>{currentSettings.header}</h2>
            </header>
            <section className={styles["dialog-body"]}>
                <div className={styles["dialog-item"]}>
                    <Toggle label={currentSettings.items.motion.label} onChange={handleChange} checked={isChecked} />
                </div>
            </section>
        </div>
    );
}
