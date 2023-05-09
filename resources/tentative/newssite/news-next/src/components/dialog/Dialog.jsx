import Toggle from "../toggle/Toggle";

export default function Dialog({ onClose }) {
    function handleClick() {
        onClose();
    }

    function handleChange(e) {
        console.log("handleChange()", e.target.checked);
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
                    <Toggle label="Reduced Motion" onChange={handleChange} />
                </div>
            </section>
        </div>
    );
}
