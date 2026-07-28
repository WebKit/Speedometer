import { useState } from "react";

// The "mine" flag is local state, so the generated fixtures stay immutable and a
// room switch remounts back to the same counts instead of letting them drift
// upward across benchmark iterations.
export default function Reaction({ reaction }) {
    const [mine, setMine] = useState(false);
    const className = mine ? "reaction reaction-mine" : "reaction";
    return (
        <button className={className} type="button" aria-pressed={mine} onClick={() => setMine(!mine)}>
            <span className="reaction-emoji">{reaction.emoji}</span>
            <span className="reaction-count">{reaction.count + (mine ? 1 : 0)}</span>
        </button>
    );
}
