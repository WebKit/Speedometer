<script>
    // The "mine" flag is local state, so the generated fixtures stay immutable and
    // a room switch remounts back to the same counts instead of letting them drift
    // upward across benchmark iterations.
    let { reaction } = $props();
    let mine = $state(false);
</script>

<button class={["reaction", mine && "reaction-mine"]} type="button" aria-pressed={mine} onclick={() => (mine = !mine)}>
    <span class="reaction-emoji">{reaction.emoji}</span>
    <span class="reaction-count">{reaction.count + (mine ? 1 : 0)}</span>
</button>
