import { useState, useEffect } from "react";

export default function Toggle({ label, onChange, checked }) {
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        setIsSelected(checked);
    }, [checked]);

    function handleChange(e) {
        setIsSelected(e.target.checked);
        onChange(e);
    }

    return (
        <div className="toggle-outer">
            <div className="toggle-description">{ label }</div>
            <div className="toggle-container">
                <label className="label" htmlFor="reduced-motion-toggle">
                    <input type="checkbox" id="reduced-motion-toggle" checked={isSelected} onChange={handleChange} />
                    <span className="switch"></span>
                    <div className="visually-hidden">selected: {isSelected ? "true" : "false"}</div>
                </label>
            </div>
        </div>
    );
}
