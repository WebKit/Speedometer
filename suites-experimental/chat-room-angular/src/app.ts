import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import { Composer } from "./components/composer";
import { RoomList } from "./components/room-list";
import { Timeline } from "./components/timeline";
import { rooms } from "./data";

@Component({
    selector: "div[chat-app]",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Composer, RoomList, Timeline],
    host: { class: "app" },
    template: `
        <nav chat-room-list [rooms]="rooms" [selectedRoomId]="selectedRoomId()" (roomSelected)="select($event)"></nav>
        <main class="room">
            <header class="room-header">
                <h1 id="room-header-name" class="room-header-name">{{ selectedRoom().name }}</h1>
                <p class="room-header-topic">{{ selectedRoom().topic }}</p>
            </header>
            <!-- A one-item @for tracked by room id, so switching rooms fully tears
                 down the old timeline and mounts the new one, which is the work we
                 profile. Angular has no key directive; this is the idiom for one. -->
            @for (room of [selectedRoom()]; track room.id) {
                <ol chat-timeline #timeline [room]="room" (roomSelected)="select($event)"></ol>
                <form chat-composer [roomName]="room.name" (send)="timeline.send($event)"></form>
            }
        </main>
    `,
})
export class App {
    protected readonly rooms = rooms;
    protected readonly selectedRoomId = signal(rooms[0].id);
    protected readonly selectedRoom = computed(() => rooms.find((room) => room.id === this.selectedRoomId())!);

    protected select(roomId: string) {
        this.selectedRoomId.set(roomId);
    }
}
