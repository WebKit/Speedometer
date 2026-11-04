import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";
import type { ChatReaction } from "../types";

// The "mine" flag is local state, so the generated fixtures stay immutable and a
// room switch remounts back to the same counts instead of letting them drift
// upward across benchmark iterations.
@Component({
    selector: "button[chat-reaction]",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "reaction",
        "[class.reaction-mine]": "mine()",
        type: "button",
        "[attr.aria-pressed]": "mine()",
        "(click)": "mine.set(!mine())",
    },
    template: `
        <span class="reaction-emoji">{{ reaction().emoji }}</span>
        <span class="reaction-count">{{ reaction().count + (mine() ? 1 : 0) }}</span>
    `,
})
export class Reaction {
    readonly reaction = input.required<ChatReaction>();
    protected readonly mine = signal(false);
}
