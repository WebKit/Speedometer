import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { ChatActions } from "../actions";
import { AVATAR_COLORS } from "../data";
import type { ChatMessage } from "../types";
import { Reaction } from "./reaction";
import { RichText } from "./rich-text";

// Consecutive messages from the same sender collapse into the one above, the way
// a chat client renders a burst: no repeated avatar or name, and the gutter
// carries the timestamp on hover.
// The index is the row's position in the whole room, not in the mounted window,
// so the timeline can file the measured height against the right message.
//
// The date separator and the unread divider are drawn inside the row they belong
// to rather than as rows of their own, because the height cache, the spacers and
// the offset search are all indexed by message.
@Component({
    selector: "li[chat-message]",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Reaction, RichText],
    host: {
        class: "timeline-message",
        "[class.timeline-message-grouped]": "message().grouped",
        "[class.timeline-message-highlighted]": "highlighted()",
        "[attr.data-message-id]": "message().id",
        "[attr.data-index]": "index()",
    },
    template: `
        @if (dateLabel() !== null) {
            <div class="timeline-date-separator">
                <span class="timeline-date-separator-label">{{ dateLabel() }}</span>
            </div>
        }
        @if (unreadBelow()) {
            <div class="timeline-unread-divider" aria-label="Unread messages">
                <span class="timeline-unread-divider-label">New</span>
            </div>
        }
        <div class="timeline-message-row">
            @if (message().grouped) {
                <span class="timeline-message-gutter">{{ message().time }}</span>
            } @else {
                <span class="avatar" [style.background-color]="avatarColors[message().colorIndex]">{{ message().senderInitials }}</span>
            }
            <div class="timeline-message-body">
                @if (message().replyTo; as replyTo) {
                    <button class="timeline-message-reply" type="button" (click)="actions.jumpToMessage(replyTo.id)">
                        <span class="timeline-message-reply-sender">{{ replyTo.sender }}</span>
                        <span class="timeline-message-reply-excerpt">{{ replyTo.excerpt }}</span>
                    </button>
                }
                @if (!message().grouped) {
                    <div class="timeline-message-meta">
                        <span class="timeline-message-sender">{{ message().sender }}</span>
                        <span class="timeline-message-time">{{ message().time }}</span>
                    </div>
                }
                <div chat-rich-text class="timeline-message-text" [blocks]="message().blocks"></div>
                @if (message().reactions.length > 0) {
                    <div class="timeline-message-reactions">
                        @for (reaction of message().reactions; track reaction.emoji) {
                            <button chat-reaction [reaction]="reaction"></button>
                        }
                    </div>
                }
            </div>
        </div>
    `,
})
export class Message {
    readonly index = input.required<number>();
    readonly message = input.required<ChatMessage>();
    readonly highlighted = input.required<boolean>();
    readonly dateLabel = input.required<string | null>();
    readonly unreadBelow = input.required<boolean>();

    protected readonly actions = inject(ChatActions);
    protected readonly avatarColors = AVATAR_COLORS;
}
