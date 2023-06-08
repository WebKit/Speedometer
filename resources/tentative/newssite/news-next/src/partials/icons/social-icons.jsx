import FacebookIcon from "@/assets/facebook-icon";
import InstagramIcon from "@/assets/instagram-icon";
import TwitterIcon from "@/assets/twitter-icon";

import { social } from "@/data/links";

import styles from "news-site-css/dist/icons-group.module.css";

export default function SocialIcons({ id }) {
    return (
        <div className={styles["icons-group"]}>
            <ul className={styles["icons-group-list"]}>
                <li className={styles["icons-group-item"]}>
                    <a href={social.facebook.href} id={`${id}-facebook`}>
                        <div className={styles["group-icon"]}>
                            <FacebookIcon />
                        </div>
                    </a>
                </li>
                <li className={styles["icons-group-item"]}>
                    <a href={social.instagram.href} id={`${id}-instagram`}>
                        <div className={styles["group-icon"]}>
                            <InstagramIcon />
                        </div>
                    </a>
                </li>
                <li className={styles["icons-group-item"]}>
                    <a href={social.twitter.href} id={`${id}-twitter`}>
                        <div className={styles["group-icon"]}>
                            <TwitterIcon />
                        </div>
                    </a>
                </li>
            </ul>
        </div>
    );
}
