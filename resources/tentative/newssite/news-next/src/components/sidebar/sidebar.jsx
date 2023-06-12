import classNames from "classnames";
import { HashLink } from "react-router-hash-link";

import { sitemap } from "@/data/sidebar";
import { content } from "@/data/content";

import styles from "news-site-css/dist/sidebar.module.css";

export default function Sidebar({ onClose }) {
    const keys = Object.keys(content);
    const navItems = keys.reduce(
        (result, key) => {
            result.push(key);
            return result;
        },
        []
    );

    return (
        <div id="sitemap" className={classNames( styles.sidebar, styles.open )}>
            <button id="close-sitemap-link" className={styles["sidebar-close-button"]} onClick={onClose} title="Close Button">
                <div className={classNames(
                    styles["sidebar-close-button-icon"],
                    "animated-icon",
                    "close-icon",
                    "hover"
                )} title="Close Icon">
                    <span className="animated-icon-inner">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </button>
            <header className={styles["sidebar-header"]}>
                <h2>{ sitemap.header }</h2>
            </header>
            <section className={styles["sidebar-body"]}>
                {
                    navItems.map(key => <details className={styles["sidebar-group"]} id={`sidebar-${content[key].name}-details`} key={`sidebar-${content[key].name}-details`}>
                        <summary>{content[key].name}</summary>
                        <ul className={styles["sidebar-list"]}>
                            {
                                content[key].sections.map(
                                    section => <li className={styles["sidebar-list-item"]} key={`sidebar-section${section.id}`}>
                                        <HashLink to={`${content[key].url}#${section.id}`}>{section.name}</HashLink>
                                    </li>
                                )
                            }
                        </ul>
                    </details>)
                }
            </section>
        </div>
    );
}
