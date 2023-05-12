import FacebookIcon from "@/assets/facebook-icon";
import InstagramIcon from "@/assets/instagram-icon";
import TwitterIcon from "@/assets/twitter-icon";

export default function SocialIcons() {
    return (
        <div className="icons-group">
            <ul className="icons-group-list">
                <li className="icons-group-item">
                    <a href="#" id="footer-link-social-facebook">
                        <div className="group-icon">
                            <FacebookIcon />
                        </div>
                    </a>
                </li>
                <li className="icons-group-item">
                    <a href="#" id="footer-link-social-instagram">
                        <div className="group-icon">
                            <InstagramIcon />
                        </div>
                    </a>
                </li>
                <li className="icons-group-item">
                    <a href="#" id="footer-link-social-twitter">
                        <div className="group-icon">
                            <TwitterIcon />
                        </div>
                    </a>
                </li>
            </ul>
        </div>
    );
}
