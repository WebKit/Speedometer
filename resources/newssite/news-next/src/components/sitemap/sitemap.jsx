import classNames from "classnames";

import { content as contentEn } from "@/data/en/content";
import { content as contentJp } from "@/data/jp/content";

import { NavLink } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import styles from "news-site-css/dist/sitemap.module.css";

export default function Sitemap() {
    // language-switch
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    let currentContent = lang === "jp" ? contentJp : contentEn;

    const keys = Object.keys(currentContent);
    const navItems = keys.reduce((result, key) => {
        result.push(key);
        return result;
    }, []);

    return (
        <div className={styles.sitemap}>
            <ul className={styles["sitemap-list"]}>
                {navItems.map((key) =>
                    <li className={styles["sitemap-item"]} key={`sitemap-page-${currentContent[key].name}`}>
                        <NavLink to={currentContent[key].url} className={({ isActive }) => classNames({ [styles.active]: isActive })}>
                            <h4 className={styles["sitemap-header"]}>{currentContent[key].name}</h4>
                        </NavLink>
                        <ul className={styles["sitemap-sublist"]}>
                            {currentContent[key].sections.map((section) =>
                                <li className={styles["sitemap-subitem"]} key={`sitemap-section${section.id}`}>
                                    <HashLink to={`${currentContent[key].url}#${section.id}`}>{section.name}</HashLink>
                                </li>
                            )}
                        </ul>
                    </li>
                )}
            </ul>
        </div>
    );
}
