<script>
    // Enter is handled explicitly rather than through the form's implicit
    // submission, because a dispatched keydown does not trigger default actions,
    // and a timed step would have to drive this through the harness.
    let { roomName, onSend } = $props();
    let draft = $state("");

    function send(event) {
        event.preventDefault();
        const text = draft.trim();
        if (!text)
            return;
        onSend(text);
        draft = "";
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey)
            send(event);
    }
</script>

<form class="composer" onsubmit={send}>
    <input
        id="composer-input"
        class="composer-input"
        type="text"
        autocomplete="off"
        aria-label="Message {roomName}"
        placeholder="Message #{roomName.toLowerCase().replace(/ /g, '-')}"
        bind:value={draft}
        onkeydown={handleKeyDown}
    />
    <button id="composer-send" class="composer-send" type="submit" disabled={draft.trim().length === 0}>Send</button>
</form>
