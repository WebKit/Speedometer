import { Link } from "react-router-dom";
import Title from "@/assets/Title";

export default function Header() {
    return (
        <header className="page-header">
            <Link to="/" className="page-header-title">
                <Title />
            </Link>
        </header>
    );
}
