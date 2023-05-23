import { useState, useEffect } from "react";
import Toggle from "../toggle/toggle";

export default function Dialog({ onClose }) {
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        setIsChecked(document.body.classList.contains("reduced-motion"));
    }, []);

    function handleClick() {
        onClose();
    }

    function handleChange(e) {
        if (e.target.checked)
            document.body.classList.add("reduced-motion");
        else
            document.body.classList.remove("reduced-motion");
    }

    return (
        <div id="settings" className="dialog open">
            <button id="close-dialog-link" className="close-button" onClick={handleClick}>
                <div className="animated-icon close-icon hover" title="Close Icon">
                    <span className="animated-icon-inner">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </button>
            <header className="dialog-header">
                <h2>Settings</h2>
            </header>
            <section className="dialog-body">
                <div className="dialog-item">
                    <Toggle label="Reduced Motion" onChange={handleChange} checked={isChecked} />
                </div>
            </section>
        </div>
    );
}
