import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { ChatActions } from "../actions";
import type { Block } from "../types";

// Renders the structured bodies from data/rooms.js the way a real client walks a
// parsed representation: a block switch outside, an inline span switch inside.
// Plain text goes through an <ng-container> so the template's own whitespace
// does not end up in the text node.
@Component({
    selector: "div[chat-rich-text]",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet],
    template: `
        <ng-template #spans let-items>
            @for (span of items; track $index) {
                @switch (span.type) {
                    @case ("code") {
                        <code class="rich-code">{{ span.text }}</code>
                    }
                    @case ("link") {
                        <a class="rich-link" [href]="span.href" (click)="$event.preventDefault()">{{ span.text }}</a>
                    }
                    @case ("mention") {
                        <span class="rich-pill rich-pill-mention">&#64;{{ span.name }}</span>
                    }
                    @case ("room") {
                        <button class="rich-pill rich-pill-room" type="button" (click)="actions.selectRoom(span.roomId)">#{{ span.name }}</button>
                    }
                    @default {
                        <ng-container>{{ span.text }}</ng-container>
                    }
                }
            }
        </ng-template>
        @for (block of blocks(); track $index) {
            @switch (block.type) {
                @case ("code") {
                    <pre class="rich-code-block" [attr.data-lang]="block.lang"><code>{{ block.lines.join("\\n") }}</code></pre>
                }
                @case ("quote") {
                    <blockquote class="rich-quote"><ng-container *ngTemplateOutlet="spans; context: { $implicit: block.spans }" /></blockquote>
                }
                @case ("image") {
                    <!-- Intrinsic width/height so the row reserves its space before
                         the image decodes. Without them the height would change after
                         layout, invalidating the timeline's height cache. -->
                    <img class="rich-image" [src]="block.src" [width]="block.width" [height]="block.height" [alt]="block.alt" decoding="sync" />
                }
                @case ("unfurl") {
                    <a class="rich-unfurl" [href]="block.href" (click)="$event.preventDefault()">
                        <img class="rich-unfurl-thumb" [src]="block.thumbSrc" [width]="block.thumbWidth" [height]="block.thumbHeight" alt="" decoding="sync" />
                        <span class="rich-unfurl-body">
                            <span class="rich-unfurl-site">{{ block.site }}</span>
                            <span class="rich-unfurl-title">{{ block.title }}</span>
                            <span class="rich-unfurl-description">{{ block.description }}</span>
                        </span>
                    </a>
                }
                @case ("list") {
                    <ul class="rich-list">
                        @for (item of block.items; track $index) {
                            <li><ng-container *ngTemplateOutlet="spans; context: { $implicit: item }" /></li>
                        }
                    </ul>
                }
                @default {
                    <p class="rich-paragraph"><ng-container *ngTemplateOutlet="spans; context: { $implicit: block.spans }" /></p>
                }
            }
        }
    `,
})
export class RichText {
    readonly blocks = input.required<Block[]>();
    protected readonly actions = inject(ChatActions);
}
