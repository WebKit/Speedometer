<script>
    // Consecutive messages from the same sender collapse into the one above, the
    // way a chat client renders a burst: no repeated avatar or name, and the
    // gutter carries the timestamp on hover.
    // The index is the row's position in the whole room, not in the mounted
    // window, so the timeline can file the measured height against the right
    // message.
    //
    // The date separator and the unread divider are drawn inside the row they
    // belong to rather than as rows of their own, because the height cache, the
    // spacers and the offset search are all indexed by message.
    import { getActions } from "../actions.js";
    import { AVATAR_COLORS } from "../data/rooms.js";
    import Reaction from "./reaction.svelte";
    import RichText from "./rich-text.svelte";

    let { index, message, highlighted, dateLabel, unreadBelow } = $props();
    const { jumpToMessage } = getActions();
</script>

<li class={["timeline-message", message.grouped && "timeline-message-grouped", highlighted && "timeline-message-highlighted"]} data-message-id={message.id} data-index={index}>
    {#if dateLabel !== null}
        <div class="timeline-date-separator">
            <span class="timeline-date-separator-label">{dateLabel}</span>
        </div>
    {/if}
    {#if unreadBelow}
        <div class="timeline-unread-divider" aria-label="Unread messages">
            <span class="timeline-unread-divider-label">New</span>
        </div>
    {/if}
    <div class="timeline-message-row">
        {#if message.grouped}
            <span class="timeline-message-gutter">{message.time}</span>
        {:else}
            <span class="avatar" style:background-color={AVATAR_COLORS[message.colorIndex]}>{message.senderInitials}</span>
        {/if}
        <div class="timeline-message-body">
            {#if message.replyTo}
                <button class="timeline-message-reply" type="button" onclick={() => jumpToMessage(message.replyTo.id)}>
                    <span class="timeline-message-reply-sender">{message.replyTo.sender}</span>
                    <span class="timeline-message-reply-excerpt">{message.replyTo.excerpt}</span>
                </button>
            {/if}
            {#if !message.grouped}
                <div class="timeline-message-meta">
                    <span class="timeline-message-sender">{message.sender}</span>
                    <span class="timeline-message-time">{message.time}</span>
                </div>
            {/if}
            <div class="timeline-message-text">
                <RichText blocks={message.blocks} />
            </div>
            {#if message.reactions.length > 0}
                <div class="timeline-message-reactions">
                    {#each message.reactions as reaction (reaction.emoji)}
                        <Reaction {reaction} />
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</li>
