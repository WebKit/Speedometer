import FacebookIcon from "@/assets/facebook-icon";
import InstagramIcon from "@/assets/instagram-icon";
import TwitterIcon from "@/assets/twitter-icon";

import { social as socialEn } from "@/data/en/links";
import { social as socialJp } from "@/data/jp/links";

import styles from "news-site-css/dist/icons-group.module.css";

export default function SocialIcons({ id }) {
    // language-switch
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    let currentSocial = lang === "jp" ? socialJp : socialEn;

    return (
        <div className={styles["icons-group"]}>
            <ul className={styles["icons-group-list"]}>
                <li className={styles["icons-group-item"]}>
                    <a href={currentSocial.facebook.href} id={`${id}-facebook`}>
                        <div className={styles["group-icon"]}>
                            <FacebookIcon />
                        </div>
                    </a>
                </li>
                <li className={styles["icons-group-item"]}>
                    <a href={currentSocial.instagram.href} id={`${id}-instagram`}>
                        <div className={styles["group-icon"]}>
                            <InstagramIcon />
                        </div>
                    </a>
                </li>
                <li className={styles["icons-group-item"]}>
                    <a href={currentSocial.twitter.href} id={`${id}-twitter`}>
                        <div className={styles["group-icon"]}>
                            <TwitterIcon />
                        </div>
                    </a>
                </li>
            </ul>
        </div>
    );
}
