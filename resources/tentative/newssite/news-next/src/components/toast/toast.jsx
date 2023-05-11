export default function Toast({ onClose, notification, onAccept, onReject }) {
    const { title, description, actions } = notification;
    return (
        <div className="toast open">
            <button id="close-toast-link" className="close-button" onClick={onClose}>
                <div className="animated-icon close-icon hover" title="Close Icon">
                    <span className="animated-icon-inner">
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </button>
            {title
                ? <header className="toast-header">
                    <h2>{title}</h2>
                </header>
                : null}
            <section className="toast-body">
                <div className="toast-description">{description}</div>
                <div className="toast-actions">
                    {actions.map((action) => {
                        const id = `toast-${action.type}-button`;
                        return (
                            <button key={id} id={id} className={`button ${action.priority}-button`} onClick={action.type === "accept" ? onAccept : onReject}>
                                {action.name}
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
