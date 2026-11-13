import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { AVATAR_COLORS } from "../data";
import type { Room } from "../types";

@Component({
    selector: "button[chat-room-list-item]",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        "[id]": "'room-list-item-' + index()",
        class: "room-list-item",
        "[class.room-list-item-selected]": "selected()",
        type: "button",
    },
    template: `
        <span class="avatar" [style.background-color]="avatarColors[room().colorIndex]">{{ room().initials }}</span>
        <span class="room-list-item-text">
            <span class="room-list-item-name">{{ room().name }}</span>
            <span class="room-list-item-preview">{{ room().lastMessage }}</span>
        </span>
    `,
})
export class RoomListItem {
    readonly index = input.required<number>();
    readonly room = input.required<Room>();
    readonly selected = input.required<boolean>();
    protected readonly avatarColors = AVATAR_COLORS;
}
