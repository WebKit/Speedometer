import ReducedMotion from "@/assets/reduced-motion-icon";

export default function SettingsIcons({ onClick }) {
    return (
        <div className="icons-group">
            <ul className="icons-group-list">
                <li className="icons-group-item">
                    <button onClick={onClick}>
                        <div className="group-icon">
                            <ReducedMotion />
                        </div>
                    </button>
                </li>
            </ul>
        </div>
    );
}
