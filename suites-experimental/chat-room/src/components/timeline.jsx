import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionsContext } from "../actions.js";
import { createOutgoingMessage } from "../data/rooms.js";
import Composer from "./composer.jsx";
import Message from "./message.jsx";

export default function Timeline({ room, onSelectRoom }) {
    const scrollerRef = useRef(null);
    const [highlightedId, setHighlightedId] = useState(null);

    // Messages the local user sent, kept here rather than pushed into the
    // fixtures, so the generated data stays immutable and a room switch (which
    // remounts this component) restores the original timeline. Otherwise rooms
    // would grow across repeated benchmark iterations.
    const [sent, setSent] = useState([]);

    // Chat clients open a room at its newest message, and jump back to the
    // bottom after sending. Reading scrollHeight forces layout and the
    // assignment jumps without animation, which is the work a real client does.
    //
    // Done by hand rather than with flex-direction: column-reverse, because
    // column-reverse inverts scrollTop and later steps drive scrollTop
    // explicitly.
    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        scroller.scrollTop = scroller.scrollHeight;
    }, [room.id, sent.length]);

    // Clicking a reply quote jumps to the message it quotes and leaves it
    // highlighted. The offset is computed from rects and assigned to scrollTop
    // directly: no smooth behavior and no scrollIntoView, so a timed step stays
    // deterministic. The highlight holds until the next jump rather than
    // clearing on a timer, for the same reason, and only changes background
    // colour, so committing it asynchronously cannot move the offset computed
    // here.
    const jumpToMessage = useCallback((messageId) => {
        const scroller = scrollerRef.current;
        const row = scroller.querySelector(`[data-message-id="${messageId}"]`);
        if (!row)
            return;
        setHighlightedId(messageId);
        const rowRect = row.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const centeringOffset = (scroller.clientHeight - rowRect.height) / 2;
        scroller.scrollTop += rowRect.top - scrollerRect.top - centeringOffset;
    }, []);

    const actions = useMemo(() => ({ selectRoom: onSelectRoom, jumpToMessage }), [onSelectRoom, jumpToMessage]);

    const handleSend = useCallback((text) => setSent((previous) => [...previous, createOutgoingMessage(room, previous.length, text)]), [room]);

    return (
        <ActionsContext.Provider value={actions}>
            <ol id="timeline" className="timeline" ref={scrollerRef}>
                {room.messages.map((message) =>
                    <Message key={message.id} message={message} highlighted={message.id === highlightedId} />
                )}
                {sent.map((message) =>
                    <Message key={message.id} message={message} highlighted={message.id === highlightedId} />
                )}
            </ol>
            <Composer roomName={room.name} onSend={handleSend} />
        </ActionsContext.Provider>
    );
}
