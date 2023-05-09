import { useState } from "react";

export default function Dropdown({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    function handleChange(e) {
        setIsOpen(e.target.checked);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    return (
        <div className="dropdown">
            <input type="checkbox" id="navbar-dropdown-toggle" className="dropdown-toggle" onChange={handleChange} checked={isOpen} />
            <label htmlFor="navbar-dropdown-toggle" className="dropdown-label">
                More
                <div className="animated-icon arrow-icon arrow">
                    <span className="animated-icon-inner" title="Arrow Icon">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </label>
            <ul className="dropdown-content" onClick={closeDropdown}>{children}</ul>
        </div>
    );
}
