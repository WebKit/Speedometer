import { content as contentEn } from "@/data/en/content";
import { content as contentJp } from "@/data/jp/content";
import Dropdown from "../dropdown/dropdown";
import NavListItem from "./navlist-item";

import styles from "news-site-css/dist/navbar.module.css";

export default function NavList({ callback, id }) {
    // language-switch
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    let currentContent = lang === "jp" ? contentJp : contentEn;

    const navItems = [];
    const dropdownItems = [];

    Object.keys(currentContent).forEach((key) => {
        if (currentContent[key].priority === 1)
            navItems.push(key);
        else if (currentContent[key].priority === 2)
            dropdownItems.push(key);
    });

    return (
        <ul className={styles["navbar-list"]}>
            {navItems.map((key) =>
                <NavListItem id={`${id}-${key}-link`} key={key} label={currentContent[key].name} url={currentContent[key].url} callback={callback} />
            )}
            {dropdownItems.length > 0
                ? <li className={styles["navbar-item"]}>
                    <Dropdown animatedIconClass={styles["navbar-label-icon"]}>
                        {dropdownItems.map((key) =>
                            <NavListItem id={`${id}-${key}-link`} key={key} label={currentContent[key].name} url={currentContent[key].url} callback={callback} itemClass={styles["navbar-dropdown-item"]} />
                        )}
                    </Dropdown>
                </li>
                : null}
        </ul>
    );
}
