// A stand-in for a streaming fetch. A reply is split into whitespace-led
// tokens, and each window.deliverChunk() call hands the open stream its next
// TOKENS_PER_CHUNK of them, the way a server-sent-events response delivers
// a few tokens per event. The benchmark calls deliverChunk() itself, so chunk
// arrival is deterministic and timer-free.

const TOKENS_PER_CHUNK = 4;

let current = null;

// Opens a stream for `text`. onChunk receives each chunk's text and whether
// it is the last one. Returns a function that cancels the stream.
export function streamReply(text, onChunk) {
    const stream = { tokens: text.match(/\s*\S+/g) ?? [], position: 0, onChunk };
    current = stream;
    return () => {
        if (current === stream)
            current = null;
    };
}

window.deliverChunk = () => {
    const stream = current;
    if (stream === null)
        return;
    const end = Math.min(stream.tokens.length, stream.position + TOKENS_PER_CHUNK);
    let chunk = "";
    for (let i = stream.position; i < end; i++)
        chunk += stream.tokens[i];
    stream.position = end;
    const done = end === stream.tokens.length;
    if (done)
        current = null;
    stream.onChunk(chunk, done);
};
