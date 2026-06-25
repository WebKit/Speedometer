import Message from "./message.jsx";

export default function Timeline({ room }) {
    return (
        <ol id="timeline" className="timeline">
            {room.messages.map((message) =>
                <Message key={message.id} message={message} />
            )}
        </ol>
    );
}
