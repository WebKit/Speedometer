import ReducedMotion from "@/assets/reduced-motion-icon";

import styles from "news-site-css/dist/icons-group.module.css";

export default function SettingsIcons({ onClick, id }) {
    return (
        <div className={styles["icons-group"]}>
            <ul className={styles["icons-group-list"]}>
                <li className={styles["icons-group-item"]}>
                    <button onClick={onClick} id={`${id}-reduce-motion`}>
                        <div className={styles["group-icon"]}>
                            <ReducedMotion />
                        </div>
                    </button>
                </li>
            </ul>
        </div>
    );
}
