// Deterministic, server-free chat fixtures.
//
// Everything here is generated once at module load using a plain counter, with
// no Math.random() or Date.now(), so the workload renders identical content on
// every run. The data shape is the one a chat client works with -- rooms in a
// sidebar, a timeline of messages per room -- but the content is entirely
// original, with no third-party assets.

const ROOM_COUNT = 40;
const MESSAGES_PER_ROOM = 150;

const ROOM_NAMES = [
    "General",
    "Random",
    "Announcements",
    "Engineering",
    "Design",
    "Product",
    "Support",
    "Off Topic",
    "Releases",
    "Incidents",
    "Frontend",
    "Backend",
    "Infra",
    "Mobile",
    "Performance",
    "Security",
    "Docs",
    "Hiring",
    "Watercooler",
    "Standup",
];

const SENDERS = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Linus Pauling", "Marie Curie", "Nikola Tesla", "Rosalind Franklin", "Carl Sagan", "Katherine Johnson", "Tim Berners-Lee"];

export const AVATAR_COLORS = ["#368bd6", "#ac3ba8", "#03b381", "#e64f7a", "#ff812d", "#2dc2c5", "#5c56f5", "#74d12c"];

const AVATAR_COLOR_COUNT = AVATAR_COLORS.length;

const WORDS = [
    "the",
    "benchmark",
    "switching",
    "between",
    "rooms",
    "should",
    "feel",
    "instant",
    "even",
    "when",
    "the",
    "timeline",
    "is",
    "long",
    "and",
    "full",
    "of",
    "rich",
    "messages",
    "with",
    "avatars",
    "and",
    "timestamps",
    "rendering",
    "performance",
    "matters",
    "a",
    "lot",
    "here",
    "lets",
    "measure",
    "it",
    "carefully",
    "and",
    "compare",
    "across",
    "browsers",
    "over",
    "time",
];

function initials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

// Build a message body of a deterministic, varied length from the word pool.
function buildBody(seed) {
    const wordCount = 6 + (seed % 22);
    const words = [];
    for (let i = 0; i < wordCount; i++)
        words.push(WORDS[(seed + i) % WORDS.length]);
    const sentence = words.join(" ");
    return `${sentence.charAt(0).toUpperCase() + sentence.slice(1)}.`;
}

// Format a deterministic HH:MM timestamp without touching the real clock.
function buildTime(seed) {
    const minutesInDay = seed % (24 * 60);
    const hours = Math.floor(minutesInDay / 60);
    const minutes = minutesInDay % 60;
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}`;
}

function buildMessages(roomIndex) {
    const messages = [];
    for (let i = 0; i < MESSAGES_PER_ROOM; i++) {
        const seed = roomIndex * MESSAGES_PER_ROOM + i;
        const sender = SENDERS[seed % SENDERS.length];
        messages.push({
            id: `room-${roomIndex}-msg-${i}`,
            sender,
            senderInitials: initials(sender),
            colorIndex: seed % AVATAR_COLOR_COUNT,
            time: buildTime(seed),
            body: buildBody(seed),
        });
    }
    return messages;
}

function buildRooms() {
    const rooms = [];
    for (let i = 0; i < ROOM_COUNT; i++) {
        const baseName = ROOM_NAMES[i % ROOM_NAMES.length];
        const name = i < ROOM_NAMES.length ? baseName : `${baseName} ${Math.floor(i / ROOM_NAMES.length) + 1}`;
        const messages = buildMessages(i);
        rooms.push({
            id: `room-${i}`,
            name,
            colorIndex: i % AVATAR_COLOR_COUNT,
            initials: initials(name),
            topic: `Discussion about ${name.toLowerCase()}`,
            lastMessage: messages[messages.length - 1].body,
            messages,
        });
    }
    return rooms;
}

export const rooms = buildRooms();
