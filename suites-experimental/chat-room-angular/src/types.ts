// The shapes data/rooms.js builds. That file is shared verbatim with the other
// ChatRoom ports, so it stays JavaScript and the types live here.

export type Span = { type: "text"; text: string } | { type: "code"; text: string } | { type: "link"; text: string; href: string } | { type: "mention"; name: string } | { type: "room"; name: string; roomId: string };

export type Block =
    | { type: "p"; spans: Span[] }
    | { type: "quote"; spans: Span[] }
    | { type: "code"; lang: string; lines: string[] }
    | { type: "list"; items: Span[][] }
    | { type: "image"; src: string; width: number; height: number; alt: string }
    | { type: "unfurl"; href: string; site: string; title: string; description: string; thumbSrc: string; thumbWidth: number; thumbHeight: number };

export interface ChatReaction {
    emoji: string;
    count: number;
}

export interface ChatMessage {
    id: string;
    sender: string;
    senderInitials: string;
    colorIndex: number;
    time: string;
    dayIndex: number;
    blocks: Block[];
    replyTo: { id: string; sender: string; excerpt: string } | null;
    grouped: boolean;
    reactions: ChatReaction[];
}

export interface Room {
    id: string;
    name: string;
    colorIndex: number;
    initials: string;
    topic: string;
    lastMessage: string;
    readUpToIndex: number;
    messages: ChatMessage[];
}
