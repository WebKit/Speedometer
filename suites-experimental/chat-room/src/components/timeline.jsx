import { useLayoutEffect, useRef } from "react";
import Message from "./message.jsx";

export default function Timeline({ room }) {
    const scrollerRef = useRef(null);

    // Chat clients open a room at its newest message. Reading scrollHeight
    // forces layout and the assignment jumps without animation, which is the
    // work a real client does on every room switch.
    //
    // Done by hand rather than with flex-direction: column-reverse, because
    // column-reverse inverts scrollTop and later steps drive scrollTop
    // explicitly.
    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        scroller.scrollTop = scroller.scrollHeight;
    }, [room.id]);

    return (
        <ol id="timeline" className="timeline" ref={scrollerRef}>
            {room.messages.map((message) =>
                <Message key={message.id} message={message} />
            )}
        </ol>
    );
}
