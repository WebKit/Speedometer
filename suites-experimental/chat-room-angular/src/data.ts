import { createOutgoingMessage as createOutgoingMessageUntyped, rooms as roomsUntyped } from "./data/rooms.js";
import type { ChatMessage, Room } from "./types";

export { AVATAR_COLORS, dateLabelFor } from "./data/rooms.js";

export const rooms = roomsUntyped as readonly Room[];

export const createOutgoingMessage = createOutgoingMessageUntyped as (room: Room, sequence: number, text: string) => ChatMessage;
