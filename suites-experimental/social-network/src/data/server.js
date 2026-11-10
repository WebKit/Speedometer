// An in-page stand-in for the backend. Entities are generated once at module load from
// fixed seeds, and each query answers with GraphQL-shaped JSON split into chunks, the
// way a streamed response with deferred fragments arrives.

import { createRandom, hashString } from "./rng.js";
import { FIRST_NAMES, LAST_NAMES, PAGE_NAMES, GROUP_NAMES, PLACES, WORKPLACES, SCHOOLS, EMOJI, HASHTAGS, LINK_SITES, TOPICS, COMMENT_LINES, REPLY_LINES, SEARCH_KEYWORDS } from "./corpus.js";

// Fixed "now", so relative timestamps never depend on the wall clock.
export const NOW = Date.UTC(2026, 3, 18, 15, 30) / 1000;

export const VIEWER_ID = "u0";

const USER_COUNT = 240;
const STORY_POOL = 120;
const FEED_PAGE_SIZE = 5;
const COMMENT_PAGE_SIZE = 10;
const REPLY_PAGE_SIZE = 8;
const REACTIONS = ["like", "love", "thanks", "laugh", "celebrate", "wow"];

const users = [];
const pages = [];
const groups = [];

function buildEntities() {
    const random = createRandom(7);
    users.push({ __typename: "User", id: VIEWER_ID, name: "Sam Okafor", short_name: "Sam", avatar_seed: 17, is_verified: false, mutual_friends: 0, online: true });
    for (let i = 1; i < USER_COUNT; i++) {
        const first = FIRST_NAMES[(i * 7 + (i >>> 3)) % FIRST_NAMES.length];
        const last = LAST_NAMES[(i * 13 + (i >>> 2)) % LAST_NAMES.length];
        users.push({
            __typename: "User",
            id: `u${i}`,
            name: `${first} ${last}`,
            short_name: first,
            avatar_seed: i * 5 + 3,
            is_verified: random.chance(0.04),
            mutual_friends: random.int(0, 85),
            online: random.chance(0.35),
        });
    }
    PAGE_NAMES.forEach((name, i) => {
        pages.push({ __typename: "Page", id: `p${i}`, name, category: random.pick(["Local business", "Community", "Shop", "Club", "Café", "Arts"]), followers: random.int(300, 48000), avatar_seed: 200 + i * 11, is_verified: random.chance(0.2) });
    });
    GROUP_NAMES.forEach((name, i) => {
        groups.push({ __typename: "Group", id: `g${i}`, name, member_count: random.int(150, 92000), privacy: random.chance(0.6) ? "public" : "private", cover_seed: 400 + i * 7, viewer_is_member: i < 8 });
    });
}

buildEntities();

const userById = new Map(users.map((user) => [user.id, user]));

function actorRef(actor) {
    return { __typename: actor.__typename, id: actor.id, name: actor.name, avatar_seed: actor.avatar_seed, is_verified: actor.is_verified };
}

function friendOf(random) {
    return users[random.int(1, USER_COUNT - 1)];
}

function buildText(random, { minSentences, maxSentences }) {
    const topic = random.pick(TOPICS);
    const count = random.int(minSentences, maxSentences);
    const sentences = random.sample(topic.sentences, Math.min(count, topic.sentences.length));
    let text = sentences.join(" ");
    if (random.chance(0.3))
        text += ` With @[${friendOf(random).id}]`;
    if (random.chance(0.55))
        text += ` ${random.pick(EMOJI)}${random.chance(0.4) ? random.pick(EMOJI) : ""}`;
    const tags = random.int(0, 3);
    if (tags) {
        text += `\n\n${random
            .sample(HASHTAGS, tags)
            .map((tag) => `#${tag}`)
            .join(" ")}`;
    }
    return { text, topic: topic.name };
}

// Mentions are authored as @[id] and shipped as plain text plus entity ranges, the
// way an API keeps markup out of user content.
function richText(raw) {
    const ranges = [];
    let text = "";
    let last = 0;
    for (const match of raw.matchAll(/@\[(u\d+)\]/g)) {
        text += raw.slice(last, match.index);
        const user = userById.get(match[1]);
        ranges.push({ offset: text.length, length: user.name.length, entity: { __typename: "User", id: user.id, name: user.name } });
        text += user.name;
        last = match.index + match[0].length;
    }
    text += raw.slice(last);
    return { text, ranges };
}

function reactionSummary(random, total) {
    const kinds = random.sample(REACTIONS, random.int(1, 3));
    let remaining = total;
    return kinds.map((key, index) => {
        const count = index === kinds.length - 1 ? remaining : Math.floor(remaining * (0.5 + random.next() * 0.3));
        remaining -= count;
        return { key, count };
    });
}

// Hot threads carry most of the conversation, the way a feed mixes quiet posts with
// a few very busy ones.
function commentCountFor(random, hasMedia) {
    if (hasMedia && random.chance(0.6))
        return random.int(28, 140);
    return random.int(0, 14);
}

function buildStory(index) {
    const random = createRandom(hashString(`story:${index % STORY_POOL}`));
    const id = `s${index}`;
    const sponsored = index % 6 === 4;
    let actor;
    let group = null;
    if (sponsored || random.chance(0.18))
        actor = pages[random.int(0, pages.length - 1)];
    else
        actor = friendOf(random);
    if (!sponsored && actor.__typename === "User" && random.chance(0.25))
        group = groups[random.int(0, groups.length - 1)];

    const long = random.chance(0.4);
    const { text, topic } = buildText(random, long ? { minSentences: 5, maxSentences: 8 } : { minSentences: 1, maxSentences: 3 });

    const attachments = [];
    const photoRoll = random.next();
    let link = null;
    if (photoRoll < 0.62) {
        const photos = photoRoll < 0.3 ? 1 : random.int(2, 5);
        for (let i = 0; i < photos; i++)
            attachments.push({ __typename: "Photo", id: `${id}-ph${i}`, seed: hashString(`${id}:${i}`), width: 600, height: random.pick([400, 450, 600, 750]), alt: `Photo shared by ${actor.name}` });
    } else if (photoRoll < 0.8 || sponsored) {
        const site = random.pick(LINK_SITES);
        link = { __typename: "ExternalLink", id: `${id}-link`, url: `https://${site.domain}/${topic}/${index}`, domain: site.domain.toUpperCase(), title: site.title, description: site.description, image_seed: hashString(`${id}:link`) };
    }

    const reactionCount = random.chance(0.15) ? random.int(200, 4200) : random.int(0, 180);
    const commentCount = commentCountFor(random, attachments.length > 0);
    const story = {
        __typename: "Story",
        id,
        actor: actorRef(actor),
        to_group: group ? { __typename: "Group", id: group.id, name: group.name, privacy: group.privacy } : null,
        sponsored,
        created_time: NOW - (index * 2711 + random.int(60, 2400)),
        privacy: group ? group.privacy : random.pick(["public", "friends", "friends", "public"]),
        message: richText(text),
        attachments,
        link,
        url: `#/post/${id}`,
        feedback: {
            __typename: "Feedback",
            id: `fb-${id}`,
            reaction_count: reactionCount,
            top_reactions: reactionSummary(random, reactionCount),
            comment_count: commentCount,
            share_count: random.int(0, Math.max(1, reactionCount >> 3)),
            viewer_reaction: null,
            can_comment: true,
        },
    };
    return story;
}

const storyCache = new Map();

function story(index) {
    let node = storyCache.get(index);
    if (!node) {
        node = buildStory(index);
        storyCache.set(index, node);
    }
    return node;
}

function storyIndex(id) {
    return Number(id.slice(1));
}

function buildComment(storyId, index, parentId) {
    const random = createRandom(hashString(`${storyId}:${parentId ?? "root"}:${index}`));
    const author = friendOf(random);
    const isReply = parentId !== null;
    let text = isReply ? random.pick(REPLY_LINES) : random.pick(COMMENT_LINES);
    if (!isReply && random.chance(0.35))
        text += ` ${random.pick(COMMENT_LINES)}`;
    if (isReply && random.chance(0.5))
        text = `@[${friendOf(random).id}] ${text}`;
    if (random.chance(0.12))
        text += ` #${random.pick(HASHTAGS)}`;
    const attachmentRoll = random.next();
    let attachment = null;
    if (attachmentRoll < 0.08)
        attachment = { __typename: "Sticker", id: `st-${storyId}-${parentId ?? "r"}-${index}`, seed: hashString(`sticker:${index % 9}`), label: random.pick(["Applause sticker", "Heart sticker", "Thumbs up sticker"]) };
    else if (attachmentRoll < 0.13)
        attachment = { __typename: "Photo", id: `cph-${storyId}-${parentId ?? "r"}-${index}`, seed: hashString(`${storyId}:c:${index}`), width: 400, height: 300, alt: "Photo in comment" };
    const likes = random.chance(0.4) ? random.int(1, 90) : 0;
    return {
        __typename: "Comment",
        id: `c-${storyId}-${parentId ? `${parentId.split("-").pop()}r` : ""}${index}`,
        author: actorRef(author),
        body: richText(text),
        attachment,
        created_time: NOW - random.int(120, 86400 * 3),
        reaction_count: likes,
        top_reactions: likes ? reactionSummary(random, likes) : [],
        reply_count: 0,
        is_spam: !isReply && random.chance(0.08),
        score: likes * 3 + text.length / 20 + random.next() * 4,
        depth: isReply ? 1 : 0,
    };
}

const threadCache = new Map();

function thread(storyId) {
    let comments = threadCache.get(storyId);
    if (comments)
        return comments;
    const feedback = story(storyIndex(storyId)).feedback;
    const random = createRandom(hashString(`thread:${storyId}`));
    const topLevel = Math.max(0, Math.ceil(feedback.comment_count * 0.55));
    let repliesLeft = feedback.comment_count - topLevel;
    comments = [];
    for (let i = 0; i < topLevel; i++) {
        const comment = buildComment(storyId, i, null);
        // Spread the replies over the whole thread instead of the first few comments.
        const odds = Math.min(0.8, repliesLeft / ((topLevel - i) * 3));
        if (repliesLeft > 0 && random.chance(odds)) {
            const replies = Math.min(repliesLeft, random.int(1, 7));
            comment.reply_count = replies;
            repliesLeft -= replies;
        }
        comment.score += comment.reply_count * 25;
        comments.push(comment);
    }
    threadCache.set(storyId, comments);
    return comments;
}

function orderedThread(storyId, order) {
    const comments = thread(storyId);
    if (order === "newest")
        return comments.filter((c) => !c.is_spam).sort((a, b) => b.created_time - a.created_time);
    if (order === "all")
        return comments.slice().sort((a, b) => a.created_time - b.created_time);
    return comments.filter((c) => !c.is_spam).sort((a, b) => b.score - a.score);
}

function publicComment(comment) {
    // Ranking signals stay on the server.
    const result = { ...comment };
    delete result.score;
    delete result.is_spam;
    return result;
}

function topCommentFor(node) {
    if (!node.feedback.comment_count)
        return null;
    return publicComment(orderedThread(node.id, "relevant")[0]);
}

function storyShell(node) {
    const { feedback, ...rest } = node;
    return { ...rest, feedback: { __typename: "Feedback", id: feedback.id, comment_count: feedback.comment_count } };
}

function deferredFeedback(node) {
    return { __typename: "Story", id: node.id, feedback: { ...node.feedback, top_comment: topCommentFor(node) } };
}

function page(items, cursor, hasNext) {
    return { edges: items, page_info: { end_cursor: String(cursor), has_next_page: hasNext } };
}

function stringify(chunks) {
    return chunks.map((chunk) => JSON.stringify(chunk));
}

function feedQuery({ cursor = 0, count = FEED_PAGE_SIZE, seed = 0 }) {
    const start = Number(cursor);
    const nodes = [];
    for (let i = 0; i < count; i++)
        nodes.push(story(seed * 1000 + start + i));
    const edges = nodes.map((node, i) => ({ cursor: String(start + i + 1), node: storyShell(node) }));
    const head = { data: { home_feed: page(edges, start + count, true) }, extensions: { is_final: false } };
    // Engagement arrives after the story shells, one deferred fragment per story.
    const deferred = nodes.map((node, i) => ({ incremental: [{ label: "StoryFeedback", path: ["home_feed", "edges", i, "node"], data: deferredFeedback(node) }], extensions: { is_final: i === nodes.length - 1 } }));
    return stringify([head, ...deferred]);
}

function storyQuery({ storyId }) {
    const node = story(storyIndex(storyId));
    return stringify([{ data: { node: storyShell(node) } }, { incremental: [{ data: deferredFeedback(node) }] }]);
}

function commentsQuery({ storyId, order = "relevant", cursor = 0 }) {
    const all = orderedThread(storyId, order);
    const start = Number(cursor);
    const slice = all.slice(start, start + COMMENT_PAGE_SIZE).map(publicComment);
    const total = all.length;
    return stringify([
        {
            data: {
                node: {
                    __typename: "Feedback",
                    id: `fb-${storyId}`,
                    comments: {
                        order,
                        total_count: total,
                        ...page(
                            slice.map((node, i) => ({ cursor: String(start + i + 1), node })),
                            start + slice.length,
                            start + slice.length < total
                        ),
                    },
                },
            },
        },
    ]);
}

function repliesQuery({ commentId, storyId, cursor = 0 }) {
    const parent = thread(storyId).find((comment) => comment.id === commentId);
    const total = parent ? parent.reply_count : 0;
    const start = Number(cursor);
    const replies = [];
    for (let i = start; i < Math.min(total, start + REPLY_PAGE_SIZE); i++)
        replies.push(publicComment(buildComment(storyId, i, commentId)));
    return stringify([
        {
            data: {
                node: {
                    __typename: "Comment",
                    id: commentId,
                    replies: {
                        total_count: total,
                        ...page(
                            replies.map((node, i) => ({ cursor: String(start + i + 1), node })),
                            start + replies.length,
                            start + replies.length < total
                        ),
                    },
                },
            },
        },
    ]);
}

function profileQuery({ userId }) {
    const user = userById.get(userId);
    const random = createRandom(hashString(`profile:${userId}`));
    const friends = random.sample(users.slice(1), 9).map(actorRef);
    const photos = [];
    for (let i = 0; i < 9; i++)
        photos.push({ __typename: "Photo", id: `${userId}-pp${i}`, seed: hashString(`${userId}:photo:${i}`), width: 300, height: 300, alt: `Photo ${i + 1}` });
    const header = {
        data: {
            node: {
                ...user,
                cover_seed: hashString(`${userId}:cover`),
                bio: "Weekend baker, amateur photographer and permanently on the lookout for a good trail. 🌿📸",
                friend_count: 412 + random.int(0, 400),
                follower_count: 120 + random.int(0, 900),
                friends_preview: friends.slice(0, 8),
            },
        },
    };
    const intro = {
        incremental: [
            {
                label: "ProfileIntro",
                data: {
                    __typename: "User",
                    id: userId,
                    intro: [
                        { icon: "work", text: `Works at ${random.pick(WORKPLACES)}` },
                        { icon: "school", text: `Studied at ${random.pick(SCHOOLS)}` },
                        { icon: "home", text: `Lives in ${random.pick(PLACES)}` },
                        { icon: "location", text: `From ${random.pick(PLACES)}` },
                        { icon: "heart", text: "In a relationship" },
                        { icon: "clock", text: "Joined March 2014" },
                    ],
                    photos,
                    friends,
                },
            },
        ],
    };
    const timeline = [];
    for (let i = 0; i < 4; i++) {
        const node = story(500 + i * 7);
        timeline.push({ ...storyShell(node), actor: actorRef(user), to_group: null, sponsored: false });
    }
    const posts = {
        incremental: [
            {
                label: "ProfileTimeline",
                data: {
                    __typename: "User",
                    id: userId,
                    timeline: page(
                        timeline.map((node, i) => ({ cursor: String(i + 1), node })),
                        4,
                        true
                    ),
                },
            },
        ],
    };
    const engagement = timeline.map((node) => ({ incremental: [{ data: deferredFeedback(story(storyIndex(node.id))) }] }));
    return stringify([header, intro, posts, ...engagement]);
}

function storiesTrayQuery() {
    const random = createRandom(11);
    const cards = random.sample(users.slice(1), 9).map((user, i) => ({ __typename: "StoryCard", id: `card${i}`, owner: actorRef(user), seed: hashString(`card:${i}`), seen: i > 5 }));
    return stringify([{ data: { stories_tray: cards } }]);
}

function rightRailQuery() {
    const random = createRandom(12);
    const contacts = users.slice(1, 25).map((user) => ({ ...actorRef(user), online: user.online }));
    const ads = [
        ["Handmade ceramic mugs", "claystudio.example"],
        ["Weekend bike tune-up", "spokeshop.example"],
        ["Fresh roasted beans delivered", "beanbox.example"],
        ["Learn to sail this summer", "sailschool.example"],
    ];
    const sponsored = random.sample(ads, 2).map(([title, domain], i) => ({ __typename: "Ad", id: `ad${i}`, title, domain, seed: hashString(`ad:${i}`) }));
    const birthdays = [actorRef(users[37])];
    const group_chats = groups.slice(0, 4).map((group) => ({ __typename: "Group", id: group.id, name: group.name, cover_seed: group.cover_seed }));
    return stringify([{ data: { right_rail: { sponsored, birthdays, contacts, group_chats } } }]);
}

function shortcutsQuery() {
    return stringify([{ data: { shortcuts: groups.slice(0, 8).map((group) => ({ __typename: "Group", id: group.id, name: group.name, cover_seed: group.cover_seed })), badges: { notifications: 7, messages: 3 } } }]);
}

function notificationsQuery() {
    const random = createRandom(13);
    const kinds = [
        ["comment", (a, b) => `**${a}** replied in your discussion: "${random.pick(COMMENT_LINES)}"`],
        ["reaction", (a, b) => `**${a}** and **${b}** appreciated your update.`],
        ["group", (a) => `New in **${random.pick(GROUP_NAMES)}**: a post from **${a}**.`],
        ["birthday", (a) => `**${a}** is celebrating a birthday today 🎂`],
        ["friend", (a) => `**${a}** would like to connect.`],
        ["memory", () => "A photo you shared on this day three years ago is waiting for you."],
        ["event", (a) => `**${a}** invited you to **${random.pick(["Harbor Night Market", "Spring Seed Swap", "Open Studio Day", "Trail Clean-up"])}**.`],
        ["mention", (a) => `**${a}** mentioned you in a comment.`],
    ];
    const items = [];
    for (let i = 0; i < 30; i++) {
        const [kind, build] = random.pick(kinds);
        const a = friendOf(random);
        const b = friendOf(random);
        items.push({ __typename: "Notification", id: `n${i}`, kind, actor: actorRef(a), text: build(a.name, b.name), created_time: NOW - (i * 3600 + random.int(0, 3000)), unread: i < 7 || random.chance(0.1), has_action: kind === "friend" });
    }
    return stringify([{ data: { notifications: { unread_count: items.filter((n) => n.unread).length, edges: items } } }]);
}

function threadsQuery() {
    const random = createRandom(14);
    const threads = [];
    for (let i = 0; i < 20; i++) {
        const other = friendOf(random);
        threads.push({
            __typename: "Thread",
            id: `t${i}`,
            participant: actorRef(other),
            snippet: random.pick(REPLY_LINES.concat(COMMENT_LINES)),
            from_viewer: random.chance(0.4),
            updated_time: NOW - (i * 5400 + random.int(0, 4000)),
            unread: i < 3,
            online: other.online,
        });
    }
    return stringify([{ data: { threads } }]);
}

function accountQuery() {
    const viewer = userById.get(VIEWER_ID);
    return stringify([
        {
            data: {
                account: {
                    viewer: actorRef(viewer),
                    profiles: pages.slice(0, 2).map(actorRef),
                    rows: [
                        { icon: "settings", label: "Preferences", chevron: true },
                        { icon: "lock", label: "Who can see what", chevron: true },
                        { icon: "moon", label: "Theme and text size", chevron: true },
                        { icon: "help", label: "Questions and answers", chevron: true },
                        { icon: "feedback", label: "Tell us what you think", shortcut: "Ctrl B" },
                        { icon: "logout", label: "Sign out" },
                    ],
                },
            },
        },
    ]);
}

// The typeahead's local index, shipped once so most keystrokes never wait on the network.
function searchBootstrapQuery() {
    const entries = [];
    for (const user of users.slice(1))
        entries.push({ id: user.id, type: "user", name: user.name, subtitle: user.mutual_friends ? `${user.mutual_friends} shared connections` : "Connection", avatar_seed: user.avatar_seed });
    for (const p of pages)
        entries.push({ id: p.id, type: "page", name: p.name, subtitle: `${p.category} · ${p.followers.toLocaleString("en-US")} followers`, avatar_seed: p.avatar_seed });
    for (const g of groups)
        entries.push({ id: g.id, type: "group", name: g.name, subtitle: `${g.privacy === "public" ? "Public" : "Private"} group · ${g.member_count.toLocaleString("en-US")} members`, avatar_seed: g.cover_seed });
    for (const [i, keyword] of SEARCH_KEYWORDS.entries())
        entries.push({ id: `k${i}`, type: "keyword", name: keyword, subtitle: "", avatar_seed: 0 });
    const recent = [entries[3], entries[250], entries[241], entries[270]].filter(Boolean);
    return stringify([{ data: { search_bootstrap: { entries, recent } } }]);
}

function searchQuery({ text }) {
    const needle = text.trim().toLowerCase();
    const results = [];
    const random = createRandom(hashString(`search:${needle}`));
    for (const keyword of SEARCH_KEYWORDS) {
        if (keyword.includes(needle))
            results.push({ id: `kw-${keyword}`, type: "keyword", name: keyword, subtitle: "", avatar_seed: 0 });
    }

    for (let i = 0; i < 3; i++)
        results.push({ id: `post-${needle}-${i}`, type: "post", name: `${needle} ${random.pick(["near me", "tips", "this weekend", "group", "for beginners"])}`, subtitle: `${random.int(2, 90)} new posts`, avatar_seed: 0 });
    return stringify([{ data: { search: { query: text, results } } }]);
}

const HANDLERS = {
    HomeFeed: feedQuery,
    Story: storyQuery,
    StoryComments: commentsQuery,
    CommentReplies: repliesQuery,
    Profile: profileQuery,
    StoriesTray: storiesTrayQuery,
    RightRail: rightRailQuery,
    Shortcuts: shortcutsQuery,
    Notifications: notificationsQuery,
    Threads: threadsQuery,
    Account: accountQuery,
    SearchBootstrap: searchBootstrapQuery,
    Search: searchQuery,
};

export function respond(name, variables) {
    const handler = HANDLERS[name];
    if (!handler)
        throw new Error(`Unknown query ${name}`);
    return handler(variables ?? {});
}

export function lookupUser(id) {
    return userById.get(id);
}
