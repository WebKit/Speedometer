import { useState } from "react";
import classNames from "classnames";

import { more as moreEn } from "@/data/en/buttons";
import { more as moreJp } from "@/data/jp/buttons";

import styles from "news-site-css/dist/dropdown.module.css";

export default function Dropdown({ children, animatedIconClass }) {
    const [isOpen, setIsOpen] = useState(false);

    // language-switch
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    let currentMore = lang === "jp" ? moreJp : moreEn;

    function handleChange(e) {
        setIsOpen(e.target.checked);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    return (
        <div className={styles.dropdown}>
            <input type="checkbox" id="navbar-dropdown-toggle" className={styles["dropdown-toggle"]} onChange={handleChange} checked={isOpen} />
            <label htmlFor="navbar-dropdown-toggle" className={styles["dropdown-label"]}>
                <span className={styles["dropdown-label-text"]}>{currentMore.label}</span>
                <div className={classNames("animated-icon", "arrow-icon", "arrow", animatedIconClass)}>
                    <span className="animated-icon-inner" title="Arrow Icon">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </label>
            <ul className={styles["dropdown-content"]} onClick={closeDropdown}>
                {children}
            </ul>
        </div>
    );
}
