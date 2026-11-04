import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { Room } from "../types";
import { RoomListItem } from "./room-list-item";

@Component({
    selector: "nav[chat-room-list]",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RoomListItem],
    host: { class: "room-list", "aria-label": "Rooms" },
    template: `
        @for (room of rooms(); track room.id; let index = $index) {
            <button chat-room-list-item [index]="index" [room]="room" [selected]="room.id === selectedRoomId()" (click)="roomSelected.emit(room.id)"></button>
        }
    `,
})
export class RoomList {
    readonly rooms = input.required<readonly Room[]>();
    readonly selectedRoomId = input.required<string>();
    readonly roomSelected = output<string>();
}
