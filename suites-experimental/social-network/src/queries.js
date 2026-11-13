import { fetchQuery, loadQuery, queryKey } from "./store/network.js";
import { getRecord, publish, retain, setClientRecord } from "./store/store.js";
import { VIEWER_ID } from "./data/server.js";

export const HOME_FEED = "client:home_feed";

export function commentsConnectionId(storyId, order) {
    return `client:comments:${storyId}:${order}`;
}

export function repliesConnectionId(commentId) {
    return `client:replies:${commentId}`;
}

// An unsent comment outlives its composer, so the post shows it until it is sent.
export function draftId(storyId) {
    return `client:draft:${storyId}`;
}

// Paginated lists live on client records: a page's edges are appended to the
// connection, and `status` says whether a page is in flight.
function runConnection(connectionId, name, variables, pick, append) {
    const dispose = retain(connectionId);
    const { promise } = fetchQuery(name, variables, {
        key: `${connectionId}:${variables.cursor ?? 0}`,
        apply(root, last) {
            if (root) {
                const page = pick(root);
                const existing = getRecord(connectionId);
                setClientRecord(connectionId, {
                    edges: append ? existing.edges.concat(page.edges) : page.edges,
                    page_info: page.page_info,
                    total_count: page.total_count ?? existing.total_count,
                });
            }
            if (last)
                setClientRecord(connectionId, { status: "ready" });
        },
    });
    promise.then(dispose);
    return promise;
}

function startConnection(connectionId, name, variables, pick, fields = {}) {
    setClientRecord(connectionId, { edges: [], page_info: null, status: "loading", ...fields });
    publish();
    return runConnection(connectionId, name, variables, pick, false);
}

function continueConnection(connectionId, name, variables, pick) {
    const connection = getRecord(connectionId);
    if (!connection || connection.status !== "ready" || !connection.page_info || !connection.page_info.has_next_page)
        return null;
    setClientRecord(connectionId, { status: "loading-more" });
    publish();
    return runConnection(connectionId, name, { ...variables, cursor: connection.page_info.end_cursor }, pick, true);
}

const pickFeed = (root) => root.home_feed;
const pickComments = (root) => getRecord(root.node.__ref).comments;
const pickReplies = (root) => getRecord(root.node.__ref).replies;

let feedGeneration = -1;
// The app shell owns the home feed, so going back to it never refetches.
let feedRetained = false;

// A refresh asks for a new ranking, so it starts a fresh generation of stories.
export function refreshHomeFeed() {
    if (!feedRetained) {
        retain(HOME_FEED);
        feedRetained = true;
    }
    feedGeneration++;
    return startConnection(HOME_FEED, "HomeFeed", { cursor: 0, seed: feedGeneration }, pickFeed, { generation: feedGeneration });
}

export function loadMoreHomeFeed() {
    return continueConnection(HOME_FEED, "HomeFeed", { seed: feedGeneration }, pickFeed);
}

export function loadComments(storyId, order) {
    const id = commentsConnectionId(storyId, order);
    const existing = getRecord(id);
    if (existing && existing.status !== "error")
        return Promise.resolve();
    return startConnection(id, "StoryComments", { storyId, order, cursor: 0 }, pickComments, { order });
}

export function loadMoreComments(storyId, order) {
    return continueConnection(commentsConnectionId(storyId, order), "StoryComments", { storyId, order }, pickComments);
}

export function loadReplies(storyId, commentId) {
    const id = repliesConnectionId(commentId);
    if (getRecord(id))
        return continueConnection(id, "CommentReplies", { storyId, commentId }, pickReplies);
    return startConnection(id, "CommentReplies", { storyId, commentId, cursor: 0 }, pickReplies);
}

export function loadProfile(userId) {
    return loadQuery("Profile", { userId });
}

const CHROME_QUERIES = ["StoriesTray", "RightRail", "Shortcuts"];

export function loadAppChrome() {
    return Promise.all(CHROME_QUERIES.map((name) => loadQuery(name)));
}

let chromeRefreshes = 0;

// Refetches the page around the feed into the same query records it was first loaded into.
export function refreshAppChrome() {
    chromeRefreshes++;
    return Promise.all(CHROME_QUERIES.map((name) => loadQuery(name, { refresh: chromeRefreshes }, { key: queryKey(name), force: true })));
}

export { VIEWER_ID };
