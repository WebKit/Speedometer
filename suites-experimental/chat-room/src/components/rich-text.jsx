import { useActions } from "../actions.js";

// Renders the structured bodies from data/rooms.js the way a real client walks a
// parsed representation: a block switch outside, an inline span switch inside.

function RoomPill({ span }) {
    const { selectRoom } = useActions();
    return (
        <button className="rich-pill rich-pill-room" type="button" onClick={() => selectRoom(span.roomId)}>
            #{span.name}
        </button>
    );
}

function Span({ span }) {
    switch (span.type) {
        case "code":
            return <code className="rich-code">{span.text}</code>;
        case "link":
            // No navigation in a timed step, so the href is data only.
            return (
                <a className="rich-link" href={span.href} onClick={(event) => event.preventDefault()}>
                    {span.text}
                </a>
            );
        case "mention":
            return <span className="rich-pill rich-pill-mention">@{span.name}</span>;
        case "room":
            return <RoomPill span={span} />;
        default:
            return span.text;
    }
}

function Spans({ spans }) {
    return spans.map((span, index) => <Span key={index} span={span} />);
}

function Block({ block }) {
    switch (block.type) {
        case "code":
            return (
                <pre className="rich-code-block" data-lang={block.lang}>
                    <code>{block.lines.join("\n")}</code>
                </pre>
            );
        case "quote":
            return (
                <blockquote className="rich-quote">
                    <Spans spans={block.spans} />
                </blockquote>
            );
        case "list":
            return (
                <ul className="rich-list">
                    {block.items.map((item, index) =>
                        <li key={index}>
                            <Spans spans={item} />
                        </li>
                    )}
                </ul>
            );
        default:
            return (
                <p className="rich-paragraph">
                    <Spans spans={block.spans} />
                </p>
            );
    }
}

export default function RichText({ blocks }) {
    return blocks.map((block, index) => <Block key={index} block={block} />);
}
