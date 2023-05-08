export default function Dropdown({ children }) {
    return (
        <div className="dropdown">
            <input type="checkbox" id="navbar-dropdown-toggle" className="dropdown-toggle" />
            <label htmlFor="navbar-dropdown-toggle" className="dropdown-label">
                More
                <div className="animated-icon arrow-icon arrow">
                    <span className="animated-icon-inner" title="Arrow Icon">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </label>
            <ul className="dropdown-content">{children}</ul>
        </div>
    );
}
