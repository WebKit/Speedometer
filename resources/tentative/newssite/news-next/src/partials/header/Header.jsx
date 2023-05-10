import { Link } from "react-router-dom";
import TitleIcon from "@/assets/title-icon";

export default function Header() {
    return (
        <header className="page-header">
            <Link to="/" className="page-header-title">
                <TitleIcon />
            </Link>
        </header>
    );
}
