import { useState } from "react";

// Enter is handled explicitly rather than through the form's implicit submission,
// because a dispatched keydown does not trigger default actions, and a timed step
// would have to drive this through the harness.
export default function Composer({ roomName, onSend }) {
    const [draft, setDraft] = useState("");

    const send = (event) => {
        event.preventDefault();
        const text = draft.trim();
        if (!text)
            return;
        onSend(text);
        setDraft("");
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey)
            send(event);
    };

    return (
        <form className="composer" onSubmit={send}>
            <input
                id="composer-input"
                className="composer-input"
                type="text"
                autoComplete="off"
                aria-label={`Message ${roomName}`}
                placeholder={`Message #${roomName.toLowerCase().replace(/ /g, "-")}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button id="composer-send" className="composer-send" type="submit" disabled={draft.trim().length === 0}>
                Send
            </button>
        </form>
    );
}
