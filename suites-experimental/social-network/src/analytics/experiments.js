// Feature gates bucket the viewer by hashing their id with the gate name, and log a
// single exposure the first time each gate is checked.

import { hashString } from "../data/rng.js";
import { log } from "./logger.js";

const ROLLOUT = {
    feed_deferred_feedback: 1,
    feed_prefetch_next_page: 1,
    story_reaction_summary_v2: 0.5,
    comments_inline_composer: 1,
    comments_mentions_typeahead: 1,
    search_remote_typeahead: 1,
    menu_message_previews: 0.8,
    profile_intro_card_v3: 0.4,
};

let viewerId = "anonymous";
const decisions = new Map();

export function setExperimentViewer(id) {
    viewerId = id;
}

export function gate(name) {
    let decision = decisions.get(name);
    if (decision === undefined) {
        const bucket = (hashString(`${viewerId}:${name}`) % 10000) / 10000;
        decision = bucket < (ROLLOUT[name] ?? 0);
        decisions.set(name, decision);
        log("gate_exposure", { gate: name, pass: decision, bucket: Math.round(bucket * 10000) });
    }
    return decision;
}
