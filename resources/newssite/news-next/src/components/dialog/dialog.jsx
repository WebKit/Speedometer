import { useState, useEffect } from "react";
import classNames from "classnames";

import Toggle from "../toggle/toggle";
import { useDataContext } from "@/context/data-context";

import styles from "news-site-css/dist/dialog.module.css";

export default function Dialog({ onClose }) {
    const [reduceMotion, setReduceMotion] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const { settings } = useDataContext();

    useEffect(() => {
        setReduceMotion(document.documentElement.classList.contains("reduced-motion"));
        setHighContrast(document.documentElement.classList.contains("forced-colors"));
    }, []);

    function toggleMotion(e) {
        setReduceMotion(e.target.checked);

        if (e.target.checked)
            document.documentElement.classList.add("reduced-motion");
        else
            document.documentElement.classList.remove("reduced-motion");
    }

    function toggleContrast(e) {
        setHighContrast(e.target.checked);

        if (e.target.checked)
            document.documentElement.classList.add("forced-colors");
        else
            document.documentElement.classList.remove("forced-colors");
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
                <h2>{settings.header}</h2>
            </header>
            <section className={styles["dialog-body"]}>
                <div className={styles["dialog-item"]}>
                    <Toggle id="motion" label={settings.items.motion.label} onChange={toggleMotion} checked={reduceMotion} />
                </div>
                <div className={styles["dialog-item"]}>
                    <Toggle id="contrast" label={settings.items.contrast.label} onChange={toggleContrast} checked={highContrast} />
                </div>
            </section>
        </div>
    );
}
