import { useState, useEffect } from "react";
import classNames from "classnames";

import Toggle from "../toggle/toggle";
import { useDataContext } from "@/context/data-context";

import styles from "news-site-css/dist/dialog.module.css";

export default function Dialog({ onClose }) {
    const [isChecked, setIsChecked] = useState(false);
    const { settings } = useDataContext();

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
                <h2>{settings.header}</h2>
            </header>
            <section className={styles["dialog-body"]}>
                <div className={styles["dialog-item"]}>
                    <Toggle label={settings.items.motion.label} onChange={handleChange} checked={isChecked} />
                </div>
            </section>
        </div>
    );
}
