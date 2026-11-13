/**
 * @fileoverview Polymer watch shell components built on
 * `@polymer/polymer` (`PolymerElement`, `html`, `dom-repeat`).
 */
import { PolymerElement, html } from "@polymer/polymer/polymer_bundled.js";
import { appStore, ActionTypes, sharedElementPool, PooledSubtreeStamper, adoptComponentStyles } from "./store.js";
import { registerLockupElements } from "./lockup-elements.js";
import { generateWatchResponse } from "./data.js";

const SESSION_CONFIG = {
    cachedCardCount: 104,
    runtimeModuleCount: 110,
    warmupNavigations: 15,
    navigationsPerStep: 186,
    warmupBindingCount: 600,
};

const NAVIGATION_CONFIG = {
    recommendationCount: 11,
    commentCount: 8,
    playlistCount: 8,
    entityMutationCount: 24,
    chipContinuationCount: 8,
    transcriptCueCount: 16,
    visibleTranscriptCues: 8,
    bindingCount: 790,
    retainDomQueryCount: 12,
    maxRetainedDomSteps: 6,
    retainedCueGroups: 2,
    maxHistoryEntries: 4,
    routeCacheWindow: 6,
};

const PANEL_DOM_QUERIES = [
    { component: "watchMetadata", attr: "data-active-chapter", panelSelector: ".chapter-pill", hostSelector: ".vw-chapter-scope" },
    { component: "playlistPanel", attr: "data-active-row", panelSelector: ".pl-row", hostSelector: ".vw-playlist-scope" },
    { component: "transcriptPanel", attr: "data-active-cue", panelSelector: ".ytd-transcript-segment", hostSelector: ".vw-cue-scope" },
    { component: "commentsSection", attr: "data-active-thread", panelSelector: "ytd-comment-thread-renderer", hostSelector: ".vw-thread-scope" },
    { component: "secondaryResults", attr: "data-active-lockup", panelSelector: "yt-lockup-view-model", hostSelector: ".vw-lockup-scope" },
    { component: "transcriptPanel", attr: "data-token-sync", panelSelector: ".segment-word-token", hostSelector: ".vw-token-scope" },
    { component: "transcriptPanel", attr: "data-phoneme-sync", panelSelector: ".tok-phoneme", hostSelector: ".vw-phoneme-scope" },
    { component: "transcriptPanel", attr: "data-surface-sync", panelSelector: ".tok-surface", hostSelector: ".vw-surface-scope" },
    { component: "watchMetadata", attr: "data-control-focus", panelSelector: "button", hostSelector: ".vw-control-scope" },
    { component: "secondaryResults", attr: "data-chip-sync", panelSelector: ".chip-pill", hostSelector: ".vw-chip-scope" },
    { component: "transcriptPanel", attr: "data-svg-sync", panelSelector: "svg", hostSelector: ".vw-svg-scope" },
    { component: "watchMetadata", attr: "data-path-sync", panelSelector: "path", hostSelector: ".vw-path-scope" },
    { component: "transcriptPanel", attr: "data-timestamp-sync", panelSelector: ".segment-timestamp", hostSelector: ".vw-time-scope" },
    { component: "commentsSection", attr: "data-header-sync", panelSelector: ".comments-title", hostSelector: ".vw-header-scope" },
    { component: "playlistPanel", attr: "data-title-sync", panelSelector: ".pl-item-title", hostSelector: ".vw-title-scope" },
];

const HOST_SCOPE_CLASS_STRING = PANEL_DOM_QUERIES.map((q) => q.hostSelector.slice(1)).join(" ");

const TRANSCRIPT_SEGMENT_TEMPLATE = (() => {
    const tpl = document.createElement("template");
    tpl.innerHTML = `
        <div class="ytd-transcript-segment" role="button" tabindex="0">
            <div class="segment-start-offset">
                <svg class="segment-cue-icon" viewBox="0 0 24 24" width="14" height="14">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"></circle>
                    <path d="M10 8l6 4-6 4V8z" fill="currentColor"></path>
                </svg>
                <span class="segment-timestamp"></span>
            </div>
            <div class="segment-body">
                <div class="segment-text"></div>
                <div class="segment-tokens">
                    <span class="segment-word-token" data-slot="0"><em class="tok-phoneme"></em><b class="tok-surface"></b></span>
                    <span class="segment-word-token" data-slot="1"><em class="tok-phoneme"></em><b class="tok-surface"></b></span>
                    <span class="segment-word-token" data-slot="2"><em class="tok-phoneme"></em><b class="tok-surface"></b></span>
                    <span class="segment-word-token" data-slot="3"><em class="tok-phoneme"></em><b class="tok-surface"></b></span>
                    <span class="segment-word-token" data-slot="4"><em class="tok-phoneme"></em><b class="tok-surface"></b></span>
                    <span class="segment-word-token" data-slot="5"><em class="tok-phoneme"></em><b class="tok-surface"></b></span>
                </div>
                <div class="segment-confidence-bar">
                    <svg class="segment-wave-svg" viewBox="0 0 120 12" preserveAspectRatio="none">
                        <defs>
                            <linearGradient class="seg-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#3ea6ff" stop-opacity="0.8"></stop>
                                <stop offset="100%" stop-color="#f00" stop-opacity="0.5"></stop>
                            </linearGradient>
                        </defs>
                        <rect x="0" y="2" width="120" height="8" rx="2" fill="rgba(62, 166, 255, 0.45)"></rect>
                        <path class="segment-wave-path" d="M 0 6 Q 30 1 60 6 T 120 6" fill="none" stroke="#fff" stroke-width="1"></path>
                    </svg>
                </div>
            </div>
        </div>
    `;
    return tpl;
})();

const COMMENT_REPLY_TEMPLATE = (() => {
    const tpl = document.createElement("template");
    tpl.innerHTML = `
        <div class="reply-item">
            <span class="reply-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <defs>
                        <clipPath class="avatar-clip"><circle cx="12" cy="12" r="10"></circle></clipPath>
                    </defs>
                    <g>
                        <rect x="0" y="0" width="24" height="24" fill="rgba(255,255,255,0.12)"></rect>
                        <circle cx="12" cy="9" r="4" fill="currentColor"></circle>
                        <path d="M5 21c1.8-4 12.2-4 14 0" fill="currentColor"></path>
                    </g>
                </svg>
            </span>
            <strong class="reply-author"></strong>
            <span class="reply-text"></span>
            <span class="reply-actions">
                <button class="reply-like-btn" type="button">
                    <svg viewBox="0 0 16 16" width="12" height="12">
                        <path d="M9.5 2.5L6 7v7h6.8c.6 0 1.1-.4 1.2-1l1-5.5c.1-.7-.4-1.5-1.2-1.5H10l.5-2.5c.1-.6-.4-1-.9-1zM3 7h2v7H3V7z" fill="currentColor"></path>
                    </svg>
                    <span class="reply-vote-label"></span>
                </button>
                <button class="reply-dislike-btn" type="button">
                    <svg viewBox="0 0 16 16" width="12" height="12">
                        <path d="M6.5 13.5L10 9V2H3.2c-.6 0-1.1.4-1.2 1L1 8.5c-.1.7.4 1.5 1.2 1.5H6l-.5 2.5c-.1.6.4 1 .9 1zM11 2h2v7h-2V2z" fill="currentColor"></path>
                    </svg>
                </button>
            </span>
        </div>
    `;
    return tpl;
})();

const HEATMAP_CHAPTER_TEMPLATE = (() => {
    const tpl = document.createElement("template");
    tpl.innerHTML = `
        <div class="ytp-heat-map-chapter">
            <svg class="ytp-heat-map-svg" viewBox="0 0 100 32" preserveAspectRatio="none">
                <defs>
                    <linearGradient class="ytp-heat-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="rgba(255,255,255,0.75)"></stop>
                        <stop offset="100%" stop-color="rgba(255,0,51,0.25)"></stop>
                    </linearGradient>
                    <clipPath class="ytp-heat-clip">
                        <rect x="0" y="0" width="100" height="32" rx="2"></rect>
                    </clipPath>
                </defs>
                <g class="ytp-heat-layer">
                    <path class="ytp-heat-map-path" d=""></path>
                    <path class="ytp-heat-map-baseline" d="M 0 32 L 100 32" stroke="rgba(255,255,255,0.3)" stroke-width="1"></path>
                    <circle class="ytp-heat-peak-dot" cx="50" cy="8" r="2.5"></circle>
                </g>
            </svg>
            <span class="ytp-chapter-marker"></span>
            <span class="ytp-chapter-hover-time"></span>
        </div>
    `;
    return tpl;
})();

class VideoWatchPolymerElement extends PolymerElement {
    ready() {
        super.ready();
        adoptComponentStyles(this.shadowRoot);
    }
}

export class YtdWatchMetadata extends VideoWatchPolymerElement {
    static get is() {
        return "ytd-watch-metadata";
    }

    static get properties() {
        return {
            titleText: String,
            channelName: String,
            channelSubs: String,
            viewCountText: String,
            publishDateText: String,
            likeCountText: String,
            descriptionText: String,
            cueRanges: { type: Array, value: () => [] },
        };
    }

    static get template() {
        return html`
            <h1 class="watch-title">[[titleText]]</h1>
            <div class="top-row">
                <div class="owner-box">
                    <span class="owner-name">[[channelName]]</span>
                    <span class="owner-subs">[[channelSubs]]</span>
                </div>
                <div class="actions-bar">
                    <button class="pill-btn">👍 [[likeCountText]]</button>
                    <button class="pill-btn">Share</button>
                    <button class="pill-btn">Download</button>
                    <button class="pill-btn">Clip</button>
                </div>
            </div>
            <div class="desc-box">
                <div class="desc-stats">[[viewCountText]] • [[publishDateText]]</div>
                <div class="desc-body">[[descriptionText]]</div>
                <div class="chapters-strip">
                    <template is="dom-repeat" items="[[cueRanges]]" as="cue">
                        <span class="chapter-pill" data-heat$="[[cue.heatmapIntensity]]"> [[cue.chapterTitle]] </span>
                    </template>
                </div>
            </div>
        `;
    }

    applyPlayerAndWatchNext(playerResponse, watchNextResponse) {
        const details = playerResponse.videoDetails;
        this.titleText = details.title;
        this.channelName = details.author;
        this.channelSubs = details.subscriberCountText;
        this.viewCountText = details.viewCount;
        this.publishDateText = details.publishDate;
        this.likeCountText = details.likeCountText;
        this.descriptionText = details.shortDescription;
        this.cueRanges = playerResponse.playerCueRangeSet.slice();
        this._retainedNextSummary = watchNextResponse.contents.twoColumnWatchNextResults.results;
    }
}

export class YtdPlaylistPanelRenderer extends VideoWatchPolymerElement {
    static get is() {
        return "ytd-playlist-panel-renderer";
    }

    static get properties() {
        return {
            playlistTitle: String,
            ownerName: String,
            items: { type: Array, value: () => [] },
        };
    }

    static get template() {
        return html`
            <div class="pl-header">
                <div class="pl-title">[[playlistTitle]]</div>
                <div class="pl-owner">[[ownerName]]</div>
            </div>
            <div class="pl-items">
                <template is="dom-repeat" items="[[items]]" as="entry">
                    <div class="pl-row" data-vid$="[[entry.playlistPanelVideoRenderer.videoId]]">
                        <span class="pl-idx">[[entry.playlistPanelVideoRenderer.indexText]]</span>
                        <span class="pl-item-title">[[entry.playlistPanelVideoRenderer.title]]</span>
                        <span class="pl-len">[[entry.playlistPanelVideoRenderer.lengthText]]</span>
                    </div>
                </template>
            </div>
        `;
    }

    updatePlaylist(playlistData) {
        this.playlistTitle = playlistData.title;
        this.ownerName = playlistData.ownerName;
        this.items = playlistData.contents.slice();
    }
}

export class YtdCommentThreadRenderer extends VideoWatchPolymerElement {
    static get is() {
        return "ytd-comment-thread-renderer";
    }

    static get properties() {
        return {
            authorText: String,
            publishedTimeText: String,
            contentText: String,
            voteCount: String,
            viewRepliesText: String,
        };
    }

    static get template() {
        return html`
            <div class="cmt-head">
                <span class="cmt-author">[[authorText]]</span>
                <span class="cmt-time">[[publishedTimeText]]</span>
            </div>
            <div class="cmt-body">[[contentText]]</div>
            <div class="cmt-bar">
                <span>👍 [[voteCount]]</span>
                <span>Reply</span>
                <span>[[viewRepliesText]]</span>
            </div>
            <div id="repliesBox" class="replies-box"></div>
        `;
    }

    ready() {
        super.ready();
        this.$.repliesBox.addEventListener("click", (ev) => {
            const btn = ev.target && ev.target.closest ? ev.target.closest(".reply-like-btn") : null;
            if (btn) {
                const itemEl = btn.closest(".reply-item");
                if (itemEl)
                    itemEl.setAttribute("data-liked", "true");
            }
        });
        if (this._pendingReplies) {
            const pending = this._pendingReplies;
            this._pendingReplies = null;
            this._renderReplies(pending);
        }
    }

    bindThreadData(threadRenderer) {
        const cmt = threadRenderer.comment.commentRenderer;
        const repRenderer = threadRenderer.replies.commentRepliesRenderer;
        this.authorText = cmt.authorText;
        this.publishedTimeText = cmt.publishedTimeText;
        this.contentText = cmt.contentText;
        this.voteCount = cmt.voteCount;
        this.viewRepliesText = repRenderer.viewRepliesText;
        const replies = repRenderer.contents;
        this._boundThreadModel = threadRenderer;

        if (this.$)
            this._renderReplies(replies);
        else
            this._pendingReplies = replies;
    }

    _renderReplies(replies) {
        const repliesBox = this.$.repliesBox;
        repliesBox.replaceChildren();
        const frag = document.createDocumentFragment();
        for (let i = 0; i < replies.length; i++) {
            const rep = replies[i].commentRenderer;
            const clone = COMMENT_REPLY_TEMPLATE.content.cloneNode(true);
            const itemEl = clone.firstElementChild;
            itemEl.setAttribute("data-comment-id", rep.commentId);
            itemEl.querySelector(".reply-author").textContent = `${rep.authorText}: `;
            itemEl.querySelector(".reply-text").textContent = rep.contentText;
            itemEl.querySelector(".reply-vote-label").textContent = rep.voteCount;
            frag.appendChild(itemEl);
        }
        repliesBox.appendChild(frag);
    }

    resetPooledElement() {
        this._boundThreadModel = null;
        this._pendingReplies = null;
    }
}

export class YtdEngagementPanelSectionListRenderer extends VideoWatchPolymerElement {
    static get is() {
        return "ytd-engagement-panel-section-list-renderer";
    }

    static get properties() {
        return {
            panelTitle: { type: String, value: "Transcript" },
            cueCount: { type: Number, value: 0 },
            activeCueId: { type: String, value: "" },
        };
    }

    static get template() {
        return html`
            <div class="ep-header">
                <span class="ep-title">[[panelTitle]]</span>
                <span class="ep-count">[[cueCount]] segments</span>
            </div>
            <div id="segmentsContainer" class="ep-segments"></div>
        `;
    }

    ready() {
        super.ready();
        this.$.segmentsContainer.addEventListener("click", (ev) => {
            const segEl = ev.target && ev.target.closest ? ev.target.closest(".ytd-transcript-segment") : null;
            if (segEl) {
                this.activeCueId = segEl.getAttribute("data-cue-id") || "";
                segEl.setAttribute("data-selected", "true");
            }
        });
    }

    stampTranscriptCues(cueGroups, panelLabel = "Transcript") {
        this.panelTitle = panelLabel;
        this.cueCount = cueGroups.length;
        const container = this.$.segmentsContainer;
        container.replaceChildren();
        const frag = document.createDocumentFragment();
        for (let idx = 0; idx < cueGroups.length; idx++) {
            const group = cueGroups[idx].transcriptCueGroupRenderer;
            const cue = group.cues[0].transcriptCueRenderer;
            const clone = TRANSCRIPT_SEGMENT_TEMPLATE.content.cloneNode(true);
            const segEl = clone.firstElementChild;
            segEl.setAttribute("data-cue-id", cue.cueId);
            segEl.querySelector(".segment-timestamp").textContent = group.formattedStartOffset;
            segEl.querySelector(".segment-text").textContent = cue.text;

            const slotNodes = segEl.querySelector(".segment-tokens").children;
            const words = cue.wordTimings;
            const count = Math.min(slotNodes.length, words.length);
            for (let w = 0; w < count; w++)
                slotNodes[w].textContent = words[w].word;

            frag.appendChild(segEl);
        }
        container.appendChild(frag);
    }
}

export class YtdComments extends VideoWatchPolymerElement {
    static get is() {
        return "ytd-comments";
    }

    static get properties() {
        return {
            headerText: { type: String, value: "Comments" },
        };
    }

    static get template() {
        return html`
            <div class="comments-title">[[headerText]]</div>
            <div id="threadsContainer"></div>
        `;
    }

    constructor() {
        super();
        this._stamper = new PooledSubtreeStamper(sharedElementPool);
    }

    stampCommentSection(itemSectionRenderer) {
        this.headerText = itemSectionRenderer.headerText;
        const threads = itemSectionRenderer.contents;
        const container = this.$.threadsContainer;
        this._stamper.stampSubtree(container, threads, (item) => {
            const el = sharedElementPool.acquire("ytd-comment-thread-renderer");
            el.bindThreadData(item.commentThreadRenderer);
            return el;
        });
    }
}

export class YtdWatchNextSecondaryResultsRenderer extends VideoWatchPolymerElement {
    static get is() {
        return "ytd-watch-next-secondary-results-renderer";
    }

    static get properties() {
        return {
            chips: { type: Array, value: () => [] },
            selectedChipIndex: { type: Number, value: 0 },
        };
    }

    static get template() {
        return html`
            <div class="chips-bar">
                <template is="dom-repeat" items="[[chips]]" as="chip">
                    <button class="chip-pill" data-active$="[[chip.chipCloudChipRenderer.isSelected]]">[[chip.chipCloudChipRenderer.text.simpleText]]</button>
                </template>
            </div>
            <div id="lockupContainer"></div>
        `;
    }

    constructor() {
        super();
        this._stamper = new PooledSubtreeStamper(sharedElementPool);
        this._currentData = null;
        this._chipContinuations = null;
    }

    applySecondaryResults(secondaryResults, chipContinuations) {
        this._currentData = secondaryResults;
        this._chipContinuations = chipContinuations;
        const rawChips = secondaryResults.chipCloud.chipCloudRenderer.chips;
        this.chips = rawChips.slice();
        this.selectedChipIndex = 0;
        this._stampLockupList(secondaryResults.results);
    }

    selectFilterChip(chipIdx) {
        const rawChips = this._currentData.chipCloud.chipCloudRenderer.chips;
        const targetChip = rawChips[chipIdx].chipCloudChipRenderer;
        for (let i = 0; i < rawChips.length; i++)
            rawChips[i].chipCloudChipRenderer.isSelected = i === chipIdx;

        this.chips = rawChips.slice();
        this.selectedChipIndex = chipIdx;

        const contCommand = targetChip.navigationEndpoint.continuationCommand;
        const continuationPayload = this._chipContinuations[chipIdx];
        contCommand.contents = continuationPayload;
        appStore.dispatch({
            type: ActionTypes.PATCH_CHIP_CONTINUATION,
            chipIndex: chipIdx,
            continuationResponse: continuationPayload,
        });
        const items = continuationPayload.onResponseReceivedEndpoints[0].reloadContinuationItemsCommand.continuationItems;
        this._stampLockupList(items);
    }

    _stampLockupList(items) {
        const container = this.$.lockupContainer;
        this._stamper.stampSubtree(container, items, (item) => {
            const el = sharedElementPool.acquire("yt-lockup-view-model");
            el.rootModel = item.lockupViewModel;
            return el;
        });
    }
}

export class YtdWatchFlexy extends VideoWatchPolymerElement {
    static get is() {
        return "ytd-watch-flexy";
    }

    static get properties() {
        return {
            videoId: String,
            navStep: { type: Number, value: 0 },
        };
    }

    static get template() {
        return html`
            <div class="columns">
                <div class="primary-col">
                    <div class="player-box" data-video-id$="[[videoId]]">
                        <div class="player-status">Playing [[videoId]] • Navigation Step #[[navStep]]</div>
                        <div id="playerHeatmap" class="ytp-heat-map-container"></div>
                    </div>
                    <ytd-watch-metadata id="watchMetadata"></ytd-watch-metadata>
                    <ytd-comments id="commentsSection"></ytd-comments>
                </div>
                <div class="secondary-col">
                    <ytd-engagement-panel-section-list-renderer id="transcriptPanel"></ytd-engagement-panel-section-list-renderer>
                    <ytd-playlist-panel-renderer id="playlistPanel"></ytd-playlist-panel-renderer>
                    <ytd-watch-next-secondary-results-renderer id="secondaryResults"></ytd-watch-next-secondary-results-renderer>
                </div>
            </div>
            <div id="pagePoolHost" class="ytd-page-pool-host" style="display:none" aria-hidden="true"></div>
        `;
    }

    bootstrapSessionAppShell(cachedCardCount = SESSION_CONFIG.cachedCardCount, runtimeModuleCount = SESSION_CONFIG.runtimeModuleCount) {
        const poolHost = this.$.pagePoolHost;
        const prewarmedThreads = [];
        const prewarmedLockups = [];
        for (let i = 0; i < 16; i++) {
            prewarmedThreads.push(sharedElementPool.acquire("ytd-comment-thread-renderer"));
            prewarmedLockups.push(sharedElementPool.acquire("yt-lockup-view-model"));
        }
        for (let i = 0; i < 16; i++) {
            sharedElementPool.release(prewarmedThreads[i]);
            sharedElementPool.release(prewarmedLockups[i]);
        }

        const cachedSegTemplate = TRANSCRIPT_SEGMENT_TEMPLATE.content.cloneNode(true);
        const cachedRepTemplate = COMMENT_REPLY_TEMPLATE.content.cloneNode(true);
        for (const el of cachedSegTemplate.querySelectorAll("*")) {
            const cur = el.getAttribute("class");
            el.setAttribute("class", cur ? `${cur} ${HOST_SCOPE_CLASS_STRING}` : HOST_SCOPE_CLASS_STRING);
        }
        for (const el of cachedRepTemplate.querySelectorAll("*")) {
            const cur = el.getAttribute("class");
            el.setAttribute("class", cur ? `${cur} ${HOST_SCOPE_CLASS_STRING}` : HOST_SCOPE_CLASS_STRING);
        }

        const routes = ["home", "subscriptions", "channels", "guide"];
        const perRoute = Math.floor(cachedCardCount / routes.length);
        const outerFrag = document.createDocumentFragment();
        for (let r = 0; r < routes.length; r++) {
            const routeEl = document.createElement("section");
            routeEl.className = `ytd-browse-cached ytd-route-${routes[r]}`;
            routeEl.setAttribute("data-page-subtype", routes[r]);
            for (let i = 0; i < perRoute; i++) {
                const idx = r * perRoute + i;
                const segClone = cachedSegTemplate.cloneNode(true);
                const segEl = segClone.firstElementChild;
                segEl.setAttribute("data-cached-card", `${routes[r]}_${idx}`);
                segEl.style.setProperty("--yt-card-order", String(idx));
                const repClone = cachedRepTemplate.cloneNode(true);
                const repEl = repClone.firstElementChild;
                repEl.setAttribute("data-cached-meta", `${routes[r]}_meta_${idx}`);
                repEl.style.setProperty("--yt-meta-slot", String(i));
                segEl.appendChild(repEl);
                routeEl.appendChild(segEl);
            }
            outerFrag.appendChild(routeEl);
        }
        poolHost.appendChild(outerFrag);
        this._bootstrapComponentRegistry(runtimeModuleCount);
    }

    /**
     * Builds the session-resident component descriptor and command-routing
     * registry (`videowatch.module_*`).
     *
     * In a large-scale video streaming SPA shell, component template metadata,
     * property-effect chains, and navigation command endpoints remain registered
     * in a long-lived application table across watch navigations. As each
     * navigation resolves active cues and route endpoints against this registry,
     * descriptors update their active effect links and step cursors, modeling
     * cross-generational references between session-resident metadata and
     * per-navigation state.
     */
    _bootstrapComponentRegistry(moduleCount = SESSION_CONFIG.runtimeModuleCount) {
        const modules = new Array(moduleCount);
        const endpointIndex = new Map();
        for (let m = 0; m < moduleCount; m++) {
            const descriptors = new Array(32);
            for (let d = 0; d < 32; d++) {
                const globalIdx = m * 32 + d;
                const propEffects = {
                    titleEffect: { path: "videoDetails.title", slot: d, flags: globalIdx & 7, source: null },
                    metaEffect: { path: "videoDetails.viewCount", slot: d + 1, flags: (globalIdx >> 1) & 7, source: null },
                    badgeEffect: { path: "badges.0.metadataBadgeRenderer", slot: d + 2, flags: (globalIdx >> 2) & 7, source: null },
                    endpointEffect: { path: "navigationEndpoint.watchEndpoint", slot: d + 3, flags: (globalIdx >> 3) & 7, source: null },
                };
                const commandEndpoints = [
                    { clickTrackingParams: `ct_${m}_${d}_0`, commandType: "WATCH", videoId: `v_${globalIdx}`, parent: propEffects },
                    { clickTrackingParams: `ct_${m}_${d}_1`, commandType: "BROWSE", browseId: `FE_${m}`, parent: propEffects },
                    { clickTrackingParams: `ct_${m}_${d}_2`, commandType: "CONTINUATION", token: `tok_${globalIdx}`, parent: propEffects },
                    { clickTrackingParams: `ct_${m}_${d}_3`, commandType: "ENGAGEMENT", panelId: `ep_${d}`, parent: propEffects },
                ];
                const formatRepresentations = [
                    { itag: 137, codecs: "avc1.640028", bitrate: 4200000 + d * 1000, initRange: { start: 0, end: 740 }, indexRange: { start: 741, end: 2480 } },
                    { itag: 248, codecs: "vp09.00.40.08", bitrate: 2800000 + d * 800, initRange: { start: 0, end: 680 }, indexRange: { start: 681, end: 2190 } },
                    { itag: 251, codecs: "opus", bitrate: 160000 + d * 100, initRange: { start: 0, end: 320 }, indexRange: { start: 321, end: 1120 } },
                ];
                const effectLen = m < 28 ? 20 : 0;
                const effectChain = effectLen > 0 ? new Array(effectLen) : null;
                for (let e = 0; e < effectLen; e++) {
                    effectChain[e] = {
                        slot: e,
                        prevEffect: e > 0 ? effectChain[e - 1] : null,
                        nextEffect: null,
                        owner: null,
                    };
                    if (e > 0)
                        effectChain[e - 1].nextEffect = effectChain[e];
                }
                const desc = {
                    moduleId: m,
                    descriptorId: globalIdx,
                    componentTag: d & 1 ? "yt-lockup-view-model" : "ytd-comment-thread-renderer",
                    propEffects,
                    commandEndpoints,
                    formatRepresentations,
                    effectChain,
                    prevDescriptor: d > 0 ? descriptors[d - 1] : null,
                    nextDescriptor: null,
                    moduleRef: null,
                    lastResolvedStep: 0,
                };
                for (let e = 0; e < effectLen; e++)
                    effectChain[e].owner = desc;

                propEffects.titleEffect.source = desc;
                propEffects.metaEffect.source = desc;
                if (d > 0)
                    descriptors[d - 1].nextDescriptor = desc;

                descriptors[d] = desc;
            }
            descriptors[0].prevDescriptor = descriptors[31];
            descriptors[31].nextDescriptor = descriptors[0];
            const modEntry = {
                moduleId: m,
                namespace: `videowatch.module_${m}`,
                descriptors,
                prevModule: m > 0 ? modules[m - 1] : null,
                nextModule: null,
            };
            for (let d = 0; d < 32; d++)
                descriptors[d].moduleRef = modEntry;

            if (m > 0)
                modules[m - 1].nextModule = modEntry;

            modules[m] = modEntry;
            if ((m & 3) === 0)
                endpointIndex.set(`route_${m}`, descriptors[0]);
        }
        this._componentRegistry = {
            modules,
            endpointIndex,
            activeCursor: 0,
        };
    }

    _stampPlayerHeatmap(cueRanges) {
        const container = this.$.playerHeatmap;
        container.replaceChildren();
        const frag = document.createDocumentFragment();
        for (let i = 0; i < cueRanges.length; i++) {
            const cue = cueRanges[i];
            const clone = HEATMAP_CHAPTER_TEMPLATE.content.cloneNode(true);
            const chEl = clone.firstElementChild;
            chEl.setAttribute("data-start-ms", String(cue.startTimeMs));
            chEl.setAttribute("data-end-ms", String(cue.endTimeMs));
            chEl.querySelector(".ytp-heat-map-path").setAttribute("d", cue.heatmapPath);
            chEl.querySelector(".ytp-chapter-marker").textContent = cue.chapterTitle;
            frag.appendChild(chEl);
        }
        container.appendChild(frag);
    }

    /**
     * Runs post-navigation subsystem DOM scans across the component shadow roots
     * (`watchMetadata`, `playlistPanel`, `transcriptPanel`, `commentsSection`,
     * `secondaryResults`) and the host shadow root, marking active cursor
     * elements for the current navigation step and retaining a bounded FIFO
     * window of recent `NodeList` snapshots to clear expired navigation markers.
     */
    _collectNavigationDomSnapshots(navStep, retainCount = NAVIGATION_CONFIG.retainDomQueryCount, maxRetainedSteps = NAVIGATION_CONFIG.maxRetainedDomSteps) {
        const root = this.shadowRoot;
        const stepLabel = String(navStep);
        const stepSnapshots = retainCount > 0 ? [] : null;

        for (let i = 0; i < PANEL_DOM_QUERIES.length; i++) {
            const sub = PANEL_DOM_QUERIES[i];
            const compNodes = this.$[sub.component].shadowRoot.querySelectorAll(sub.panelSelector);
            if (compNodes.length > 0)
                compNodes[(navStep + i) % compNodes.length].setAttribute(sub.attr, stepLabel);

            const hostNodes = root.querySelectorAll(sub.hostSelector);
            if (hostNodes.length > 0) {
                const activeIndex = (navStep + i) % hostNodes.length;
                hostNodes[activeIndex].setAttribute(sub.attr, stepLabel);
                if (stepSnapshots && i < retainCount)
                    stepSnapshots.push({ list: hostNodes, activeIndex, attr: sub.attr });
            }
        }

        if (stepSnapshots && maxRetainedSteps > 0) {
            if (!this._retainedDomSnapshots)
                this._retainedDomSnapshots = [];

            this._retainedDomSnapshots.push(stepSnapshots);
            while (this._retainedDomSnapshots.length > maxRetainedSteps) {
                const evicted = this._retainedDomSnapshots.shift();
                for (let j = 0; j < evicted.length; j++) {
                    const entry = evicted[j];
                    entry.list[entry.activeIndex].removeAttribute(entry.attr);
                }
                evicted.length = 0;
            }
        }
    }

    /**
     * Indexes timed-text transcript cues against the player's adaptive streaming
     * timeline and scrub-bar storyboard grid.
     *
     * When a watch response arrives, the searchable transcript engagement panel
     * and player scrub-bar pre-compute word-level token bigrams, fine-grained
     * frame timing windows, and caption overlay layout boxes across the video
     * timeline, linking each cue's active descriptors into the component registry.
     */
    _buildTranscriptAndStoryboardIndex(cueGroups, navStep, frameSlotsPerCue = NAVIGATION_CONFIG.bindingCount) {
        const tokenIndex = [];
        const reg = this._componentRegistry;
        const regMods = reg ? reg.modules : null;
        for (let i = 0; i < cueGroups.length; i++) {
            const group = cueGroups[i].transcriptCueGroupRenderer;
            const cue = group?.cues?.[0]?.transcriptCueRenderer;
            if (cue) {
                const terms = cue.text.toLowerCase().split(" ");
                const modEntry = regMods ? regMods[(navStep * 13 + i) % regMods.length] : null;
                const desc = modEntry ? modEntry.descriptors[i & 31] : null;
                if (desc) {
                    desc.lastResolvedStep = navStep;
                    if (desc.effectChain && desc.nextDescriptor?.effectChain) {
                        const ecIdx = (navStep + i) % desc.effectChain.length;
                        desc.effectChain[ecIdx].nextEffect = desc.nextDescriptor.effectChain[ecIdx];
                    }
                }
                const resolvedBindings = new Array(frameSlotsPerCue);
                const tLen = terms.length;
                const t0 = terms[0] || "";
                const t1 = terms[1 % tLen] || "";
                const t2 = terms[2 % tLen] || "";
                const t3 = terms[3 % tLen] || "";
                for (let b = 0; b < frameSlotsPerCue; b++) {
                    const baseMs = i * 2000 + b * 250;
                    resolvedBindings[b] = {
                        cueId: cue.cueId,
                        slotIndex: b,
                        descriptorId: desc ? desc.descriptorId : i,
                        termSlice: [t0, t1, t2, t3, t0, t1, terms[b % tLen], terms[(b + 1) % tLen]],
                        timingWindow: { startMs: baseMs, endMs: baseMs + 250, durationMs: 250, cueIndex: i },
                        layoutBox: { x: (b & 15) * 12, y: (b >> 4) * 24, w: 120 + (b & 7), h: 20 },
                        boundsBox: { left: (b & 15) * 12, top: (b >> 4) * 24, right: 140 + (b & 7), bottom: 44 },
                        metricsBox: { minW: 80, maxW: 320, aspect: 16, pad: b & 7, step: navStep, slot: b },
                        styleTokens: [cue.cueId, t0, t1, t2, t3, b, navStep, i, t0, t1, t2, t3],
                    };
                }
                tokenIndex.push({
                    cueId: cue.cueId,
                    formattedOffset: group.formattedStartOffset,
                    normalizedText: cue.text.toLowerCase(),
                    terms,
                    bigrams: terms.map((t, idx) => idx + 1 < terms.length ? `${t}_${terms[idx + 1]}` : t),
                    words: cue.wordTimings.slice(),
                    resolvedBindings,
                });
            }
        }
        return tokenIndex;
    }

    executeWatchNavigation(navStep, config = NAVIGATION_CONFIG) {
        const payload = generateWatchResponse(navStep, config);
        this.videoId = payload.videoId;
        this.navStep = navStep + 1;

        const cueGroups = payload.watchNextResponse.engagementPanels[0].engagementPanelSectionListRenderer.content.transcriptRenderer.cueGroups;
        const tokenIndex = this._buildTranscriptAndStoryboardIndex(cueGroups, navStep, config.bindingCount);
        const tokenCount = tokenIndex.length;
        const reg = this._componentRegistry;
        const mutations = payload.watchNextResponse.frameworkUpdates.entityBatchUpdate.mutations;
        appStore.dispatch({
            type: ActionTypes.APPLY_ENTITY_BATCH,
            mutations,
            navStep,
        });
        const maxHistoryEntries = config.maxHistoryEntries;
        const retainedCueGroups = config.retainedCueGroups;
        if (config.routeCacheWindow && reg && tokenCount > 0 && (navStep & 1) === 0) {
            const slot = (navStep >> 1) % config.routeCacheWindow;
            reg.endpointIndex.set(`active_route_${slot}`, tokenIndex[0]);
        }
        const retainedTokens = retainedCueGroups > 0 ? tokenIndex.slice(0, retainedCueGroups) : null;
        tokenIndex.length = 0;
        appStore.dispatch({
            type: ActionTypes.RECORD_WATCH_RESPONSE,
            videoId: payload.videoId,
            navStep,
            playerResponse: payload.playerResponse.videoDetails,
            watchNextResponse: {
                responseContext: payload.watchNextResponse.responseContext,
                tokenCount,
                retainedTokens,
            },
            maxEntries: maxHistoryEntries,
        });

        this._stampPlayerHeatmap(payload.playerResponse.playerCueRangeSet);

        const twoCol = payload.watchNextResponse.contents.twoColumnWatchNextResults;
        this.$.watchMetadata.applyPlayerAndWatchNext(payload.playerResponse, payload.watchNextResponse);
        this.$.playlistPanel.updatePlaylist(twoCol.playlist.playlist);

        const secondaryResults = twoCol.secondaryResults.secondaryResults;
        this.$.secondaryResults.applySecondaryResults(secondaryResults, payload.chipContinuations);

        const primaryContents = twoCol.results.results.contents;
        const commentSection = primaryContents.find((c) => c.itemSectionRenderer?.sectionIdentifier === "comment-item-section");
        this.$.commentsSection.stampCommentSection(commentSection.itemSectionRenderer);

        const chipKeys = Object.keys(payload.chipContinuations).map(Number);
        this.$.secondaryResults.selectFilterChip(chipKeys[0]);

        this.$.transcriptPanel.stampTranscriptCues(cueGroups.slice(0, config.visibleTranscriptCues), `Transcript • ${payload.videoId} (${tokenCount} cues)`);
        this._collectNavigationDomSnapshots(navStep, config.retainDomQueryCount, config.maxRetainedDomSteps);
    }
}

export class YtdApp extends VideoWatchPolymerElement {
    static get is() {
        return "ytd-app";
    }

    static get properties() {
        return {
            navCounter: { type: Number, value: 0 },
            statusLabel: { type: String, value: "Ready" },
        };
    }

    static get template() {
        return html`
            <header class="masthead">
                <div class="brand">▶ VideoWatch SPA</div>
                <div class="nav-controls">
                    <span class="status-pill" id="watch-status-text">[[statusLabel]]</span>
                </div>
            </header>
            <ytd-watch-flexy id="watchFlexy"></ytd-watch-flexy>
        `;
    }

    ready() {
        super.ready();
        this.$.watchFlexy.bootstrapSessionAppShell();
        const warmupConfig = { ...NAVIGATION_CONFIG, bindingCount: SESSION_CONFIG.warmupBindingCount };
        for (let w = 0; w < SESSION_CONFIG.warmupNavigations; w++)
            this.$.watchFlexy.executeWatchNavigation(w, warmupConfig);
    }

    handleRunWatchSession() {
        for (let i = 0; i < SESSION_CONFIG.navigationsPerStep; i++) {
            this.navCounter += 1;
            const stepIndex = this.navCounter;
            this.$.watchFlexy.executeWatchNavigation(stepIndex, NAVIGATION_CONFIG);
        }
        const st = appStore.getState();
        this.statusLabel = `Step #${this.navCounter} | Entities: ${Object.keys(st.entities.byKey).length} | Pooled: ${sharedElementPool.stats.reused} reused`;
    }
}

export function registerPolymerShell() {
    registerLockupElements();
    const classes = [YtdWatchMetadata, YtdPlaylistPanelRenderer, YtdCommentThreadRenderer, YtdEngagementPanelSectionListRenderer, YtdComments, YtdWatchNextSecondaryResultsRenderer, YtdWatchFlexy, YtdApp];
    for (const ctor of classes)
        customElements.define(ctor.is, ctor);
}
