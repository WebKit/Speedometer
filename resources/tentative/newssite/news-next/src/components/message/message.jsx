export function Message({ message, onClose }) {
    if (!message)
        return null;

    const { title, description } = message;
    return (
        <div className="message open">
            <button id="close-message-link" className="close-button" onClick={onClose}>
                <div className="animated-icon close-icon hover" title="Close Icon">
                    <span className="animated-icon-inner">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </button>
            {title
                ? <header className="message-header">
                    <h2>{title}</h2>
                </header>
                : null}
            <section className="message-body">
                <div className="message-description">{description}</div>
            </section>
        </div>
    );
}
