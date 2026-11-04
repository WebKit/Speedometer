import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";

// Enter is handled explicitly rather than through the form's implicit submission,
// because a dispatched keydown does not trigger default actions, and a timed step
// would have to drive this through the harness.
@Component({
    selector: "form[chat-composer]",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "composer", "(submit)": "submit($event)" },
    template: `
        <input
            #input
            id="composer-input"
            class="composer-input"
            type="text"
            autocomplete="off"
            [attr.aria-label]="'Message ' + roomName()"
            [placeholder]="placeholder()"
            [value]="draft()"
            (input)="draft.set(input.value)"
            (keydown)="handleKeyDown($event)"
        />
        <button id="composer-send" class="composer-send" type="submit" [disabled]="draft().trim().length === 0">Send</button>
    `,
})
export class Composer {
    readonly roomName = input.required<string>();
    readonly send = output<string>();

    protected readonly draft = signal("");
    protected readonly placeholder = computed(() => `Message #${this.roomName().toLowerCase().replace(/ /g, "-")}`);

    protected submit(event: Event) {
        event.preventDefault();
        const text = this.draft().trim();
        if (!text)
            return;
        this.send.emit(text);
        this.draft.set("");
    }

    protected handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && !event.shiftKey)
            this.submit(event);
    }
}
