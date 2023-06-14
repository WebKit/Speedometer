import { useState } from "react";
import classNames from "classnames";

import { more } from "@/data/buttons";

import styles from "news-site-css/dist/dropdown.module.css";

export default function Dropdown({ children, animatedIconClass }) {
    const [isOpen, setIsOpen] = useState(false);

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
                <span className={styles["dropdown-label-text"]}>{more.label}</span>
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
