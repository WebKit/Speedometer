/**
 * @fileoverview Kevlar Polymer watch shell components built on real
 * `@polymer/polymer` (`PolymerElement`, `html`, `dom-repeat`).
 */
import { PolymerElement, html } from "@polymer/polymer/polymer_bundled.js";
import { appStore, ActionTypes, sharedElementPool, DeferredDetachStamper, adoptComponentStyles } from "./store.js";
import { registerCoWElements } from "./cow-lockup.js";
import { generateWatchResponse } from "./data.js";

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
                            <linearGradient id="segWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#3ea6ff" stop-opacity="0.8"></stop>
                                <stop offset="100%" stop-color="#f00" stop-opacity="0.5"></stop>
                            </linearGradient>
                        </defs>
                        <rect x="0" y="2" width="120" height="8" rx="2" fill="url(#segWaveGrad)"></rect>
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
                        <clipPath id="avatarClip"><circle cx="12" cy="12" r="10"></circle></clipPath>
                    </defs>
                    <g clip-path="url(#avatarClip)">
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

class KevlarPolymerElement extends PolymerElement {
    ready() {
        super.ready();
        adoptComponentStyles(this.shadowRoot);
    }
}

export class YtdWatchMetadata extends KevlarPolymerElement {
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
        const details = playerResponse?.videoDetails || {};
        this.titleText = details.title || "";
        this.channelName = details.author || "";
        this.channelSubs = details.subscriberCountText || "";
        this.viewCountText = details.viewCount || "";
        this.publishDateText = details.publishDate || "";
        this.likeCountText = details.likeCountText || "0";
        this.descriptionText = details.shortDescription || "";
        this.cueRanges = (playerResponse?.playerCueRangeSet || []).slice();
        this._retainedNextSummary = watchNextResponse?.contents?.twoColumnWatchNextResults?.results || null;
    }
}

export class YtdPlaylistPanelRenderer extends KevlarPolymerElement {
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
        if (!playlistData) {
            this.items = [];
            return;
        }
        this.playlistTitle = playlistData.title || "";
        this.ownerName = playlistData.ownerName || "";
        this.items = [];
        const contents = playlistData.contents || [];
        const chunkSize = 12;
        for (let i = 0; i < contents.length; i += chunkSize) {
            const slice = contents.slice(i, i + chunkSize);
            this.push("items", ...slice);
        }
    }
}

export class YtdCommentThreadRenderer extends KevlarPolymerElement {
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
            replies: { type: Array, value: () => [] },
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
        if (this.$ && this.$.repliesBox && !this._hasDelegatedReplies) {
            this._hasDelegatedReplies = true;
            this.$.repliesBox.addEventListener("click", (ev) => {
                const btn = ev.target && ev.target.closest ? ev.target.closest(".reply-like-btn") : null;
                if (btn) {
                    const itemEl = btn.closest(".reply-item");
                    if (itemEl)
                        itemEl.setAttribute("data-liked", "true");
                }
            });
        }
    }

    bindThreadData(threadRenderer) {
        if (!this.$)
            this.ready();

        const cmt = threadRenderer?.comment?.commentRenderer || {};
        const repRenderer = threadRenderer?.replies?.commentRepliesRenderer || {};
        this.authorText = cmt.authorText || "";
        this.publishedTimeText = cmt.publishedTimeText || "";
        this.contentText = cmt.contentText || "";
        this.voteCount = cmt.voteCount || "0";
        this.viewRepliesText = repRenderer.viewRepliesText || "";
        const replies = (repRenderer.contents || []).slice();
        this.replies = replies;
        this._boundThreadModel = threadRenderer;

        const repliesBox = this.$.repliesBox;
        if (repliesBox) {
            repliesBox.replaceChildren();
            const frag = document.createDocumentFragment();
            for (let i = 0; i < replies.length; i++) {
                const rep = replies[i]?.commentRenderer || {};
                const clone = COMMENT_REPLY_TEMPLATE.content.cloneNode(true);
                const itemEl = clone.firstElementChild;
                itemEl.setAttribute("data-comment-id", rep.commentId || "");
                const authorEl = itemEl.querySelector(".reply-author");
                const textEl = itemEl.querySelector(".reply-text");
                const voteLabel = itemEl.querySelector(".reply-vote-label");
                if (authorEl)
                    authorEl.textContent = `${rep.authorText || ""}: `;

                if (textEl)
                    textEl.textContent = rep.contentText || "";

                if (voteLabel)
                    voteLabel.textContent = rep.voteCount || "0";

                frag.appendChild(itemEl);
            }
            repliesBox.appendChild(frag);
        }
    }

    resetPooledElement() {
        this._boundThreadModel = null;
        this.replies = [];
    }
}

export class YtdEngagementPanelSectionListRenderer extends KevlarPolymerElement {
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
        if (this.$ && this.$.segmentsContainer && !this._hasDelegatedClick) {
            this._hasDelegatedClick = true;
            this.$.segmentsContainer.addEventListener("click", (ev) => {
                const segEl = ev.target && ev.target.closest ? ev.target.closest(".ytd-transcript-segment") : null;
                if (segEl) {
                    this.activeCueId = segEl.getAttribute("data-cue-id") || "";
                    segEl.setAttribute("data-selected", "true");
                }
            });
        }
    }

    stampTranscriptCues(cueGroups, panelLabel = "Transcript") {
        this.panelTitle = panelLabel;
        const groups = cueGroups || [];
        this.cueCount = groups.length;
        const container = this.$.segmentsContainer;
        if (!container)
            return;

        container.replaceChildren();
        const frag = document.createDocumentFragment();
        for (let idx = 0; idx < groups.length; idx++) {
            const groupEntry = groups[idx];
            const group = groupEntry.transcriptCueGroupRenderer || {};
            const cue = group.cues?.[0]?.transcriptCueRenderer || {};
            const clone = TRANSCRIPT_SEGMENT_TEMPLATE.content.cloneNode(true);
            const segEl = clone.firstElementChild;
            const cueId = cue.cueId || `cue_${idx}`;
            segEl.setAttribute("data-cue-id", cueId);

            const tsEl = segEl.querySelector(".segment-timestamp");
            if (tsEl)
                tsEl.textContent = group.formattedStartOffset || "0:00";

            const textEl = segEl.querySelector(".segment-text");
            if (textEl)
                textEl.textContent = cue.text || "";

            const tokensEl = segEl.querySelector(".segment-tokens");
            const words = cue.wordTimings || [];
            if (tokensEl && words.length > 0) {
                const slotNodes = tokensEl.children;
                const count = Math.min(slotNodes.length, words.length);
                for (let w = 0; w < count; w++)
                    slotNodes[w].textContent = words[w].word;
            }
            frag.appendChild(segEl);
        }
        container.appendChild(frag);
    }
}

export class YtdComments extends KevlarPolymerElement {
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
        this._stamper = new DeferredDetachStamper(sharedElementPool);
    }

    stampCommentSection(itemSectionRenderer) {
        this.headerText = itemSectionRenderer?.headerText || "Comments";
        const threads = itemSectionRenderer?.contents || [];
        const container = this.$.threadsContainer;
        this._stamper.stampSubtree(container, threads, (item) => {
            const el = sharedElementPool.acquire("ytd-comment-thread-renderer");
            el.bindThreadData(item.commentThreadRenderer);
            return el;
        });
    }
}

export class YtdWatchNextSecondaryResultsRenderer extends KevlarPolymerElement {
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
        this._stamper = new DeferredDetachStamper({
            release(node) {
                if (node && typeof node.finalizeCoWDetach === "function")
                    node.finalizeCoWDetach();

                return sharedElementPool.release(node);
            },
        });
        this._currentData = null;
        this._chipContinuations = null;
    }

    applySecondaryResults(secondaryResults, chipContinuations) {
        this._currentData = secondaryResults;
        this._chipContinuations = chipContinuations || {};
        const rawChips = secondaryResults?.chipCloud?.chipCloudRenderer?.chips || [];
        this.chips = rawChips.slice();
        this.selectedChipIndex = 0;

        const initialCommand = rawChips[0]?.chipCloudChipRenderer?.navigationEndpoint?.continuationCommand;
        if (initialCommand) {
            initialCommand.contents = {
                cachedAt: performance.now(),
                continuationItems: (secondaryResults?.results || []).slice(),
            };
        }

        this._stampLockupList(secondaryResults?.results || []);
    }

    selectFilterChip(chipIdx) {
        if (!this._currentData)
            return;

        const rawChips = this._currentData.chipCloud?.chipCloudRenderer?.chips || [];
        const targetChip = rawChips[chipIdx]?.chipCloudChipRenderer;
        if (!targetChip)
            return;

        for (let i = 0; i < rawChips.length; i++)
            rawChips[i].chipCloudChipRenderer.isSelected = i === chipIdx;

        this.chips = rawChips.slice();
        this.selectedChipIndex = chipIdx;

        const contCommand = targetChip.navigationEndpoint?.continuationCommand;
        let items = [];
        if (chipIdx === 0) {
            const allItems = contCommand?.contents?.continuationItems || this._currentData.results || [];
            items = allItems.slice(0, 8);
        } else {
            const continuationPayload = this._chipContinuations[chipIdx];
            if (contCommand && continuationPayload) {
                contCommand.contents = continuationPayload;
                appStore.dispatch({
                    type: ActionTypes.PATCH_CHIP_CONTINUATION,
                    chipIndex: chipIdx,
                    continuationResponse: continuationPayload,
                });
                items = continuationPayload.onResponseReceivedEndpoints?.[0]?.reloadContinuationItemsCommand?.continuationItems || [];
            }
        }
        this._stampLockupList(items);
    }

    _stampLockupList(items) {
        const container = this.$.lockupContainer;
        const existing = container.children;
        for (let i = 0; i < existing.length; i++)
            existing[i]._deferTeardown = true;

        this._stamper.stampSubtree(container, items, (item) => {
            const el = sharedElementPool.acquire("yt-lockup-view-model");
            el.rootModel = item.lockupViewModel;
            return el;
        });
    }
}

export class YtdWatchFlexy extends KevlarPolymerElement {
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

    bootstrapSessionAppShell(cachedCardCount = 32, runtimeModuleCount = 220) {
        const poolHost = this.$.pagePoolHost;
        if (!poolHost || poolHost.childElementCount > 0)
            return;

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

        const routes = ["home", "subscriptions", "channels", "guide"];
        const perRoute = Math.floor(cachedCardCount / routes.length);
        const outerFrag = document.createDocumentFragment();
        for (let r = 0; r < routes.length; r++) {
            const routeEl = document.createElement("section");
            routeEl.className = `ytd-browse-cached ytd-route-${routes[r]}`;
            routeEl.setAttribute("data-page-subtype", routes[r]);
            for (let i = 0; i < perRoute; i++) {
                const idx = r * perRoute + i;
                const segClone = TRANSCRIPT_SEGMENT_TEMPLATE.content.cloneNode(true);
                const segEl = segClone.firstElementChild;
                segEl.setAttribute("data-cached-card", `${routes[r]}_${idx}`);
                segEl.style.setProperty("--yt-card-order", String(idx));
                const repClone = COMMENT_REPLY_TEMPLATE.content.cloneNode(true);
                const repEl = repClone.firstElementChild;
                repEl.setAttribute("data-cached-meta", `${routes[r]}_meta_${idx}`);
                repEl.style.setProperty("--yt-meta-slot", String(i));
                segEl.appendChild(repEl);
                routeEl.appendChild(segEl);
            }
            outerFrag.appendChild(routeEl);
        }
        poolHost.appendChild(outerFrag);
        this._bootstrapKevlarRuntimeRegistry(runtimeModuleCount);
    }

    _bootstrapKevlarRuntimeRegistry(moduleCount = 220) {
        if (this._kevlarRuntimeRegistry)
            return;

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
                namespace: `yt.kevlar.wiz.module_${m}`,
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
        this._kevlarRuntimeRegistry = {
            modules,
            endpointIndex,
            activeCursor: 0,
        };
    }

    _stampPlayerHeatmap(cueRanges) {
        const container = this.$.playerHeatmap;
        if (!container)
            return;

        container.replaceChildren();
        const frag = document.createDocumentFragment();
        const ranges = cueRanges || [];
        for (let i = 0; i < ranges.length; i++) {
            const cue = ranges[i];
            const clone = HEATMAP_CHAPTER_TEMPLATE.content.cloneNode(true);
            const chEl = clone.firstElementChild;
            chEl.setAttribute("data-start-ms", String(cue.startTimeMs));
            chEl.setAttribute("data-end-ms", String(cue.endTimeMs));
            const pathEl = chEl.querySelector(".ytp-heat-map-path");
            if (pathEl && cue.heatmapPath)
                pathEl.setAttribute("d", cue.heatmapPath);

            const markerEl = chEl.querySelector(".ytp-chapter-marker");
            if (markerEl)
                markerEl.textContent = cue.chapterTitle;

            frag.appendChild(chEl);
        }
        container.appendChild(frag);
    }

    _runKevlarDomQueries(passes = 42, retainCount = 0, maxRetainedSteps = 0) {
        const root = this.shadowRoot;
        if (!root)
            return 0;

        let matched = 0;
        const stepSnapshots = retainCount > 0 ? [] : null;
        for (let p = 0; p < passes; p++) {
            const list = root.querySelectorAll("*");
            matched += list.length;
            if (stepSnapshots && p < retainCount)
                stepSnapshots.push(list);
        }
        if (stepSnapshots && maxRetainedSteps > 0) {
            if (!this._retainedDomSnapshots)
                this._retainedDomSnapshots = [];

            this._retainedDomSnapshots.push(stepSnapshots);
            while (this._retainedDomSnapshots.length > maxRetainedSteps) {
                const evicted = this._retainedDomSnapshots.shift();
                evicted.length = 0;
            }
        }
        return matched;
    }

    executeWatchNavigation(navStep, config = {}) {
        const payload = generateWatchResponse(navStep, config);
        this.videoId = payload.videoId;
        this.navStep = navStep + 1;

        const cueGroups = payload.watchNextResponse?.engagementPanels?.[0]?.engagementPanelSectionListRenderer?.content?.transcriptRenderer?.cueGroups || [];
        const tokenIndex = [];
        const reg = this._kevlarRuntimeRegistry;
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
                const bindingCount = config.bindingCount || 480;
                const resolvedBindings = new Array(bindingCount);
                const tLen = terms.length;
                const t0 = terms[0] || "";
                const t1 = terms[1 % tLen] || "";
                const t2 = terms[2 % tLen] || "";
                const t3 = terms[3 % tLen] || "";
                for (let b = 0; b < bindingCount; b++) {
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
        const mutations = payload.watchNextResponse?.frameworkUpdates?.entityBatchUpdate?.mutations || [];
        appStore.dispatch({
            type: ActionTypes.APPLY_ENTITY_BATCH,
            mutations,
            navStep,
        });
        const maxHistoryEntries = config.maxHistoryEntries || 2;
        const retainedCueGroups = config.retainedCueGroups || 0;
        if (config.routeCacheWindow && reg && tokenIndex.length > 0 && (navStep & 1) === 0) {
            const slot = (navStep >> 1) % config.routeCacheWindow;
            reg.endpointIndex.set(`active_route_${slot}`, tokenIndex[0]);
        }
        appStore.dispatch({
            type: ActionTypes.RECORD_WATCH_RESPONSE,
            videoId: payload.videoId,
            navStep,
            playerResponse: payload.playerResponse.videoDetails,
            watchNextResponse: {
                responseContext: payload.watchNextResponse.responseContext,
                tokenCount: tokenIndex.length,
                retainedTokens: retainedCueGroups > 0 ? tokenIndex.slice(0, retainedCueGroups) : null,
            },
            maxEntries: maxHistoryEntries,
        });

        this._stampPlayerHeatmap(payload.playerResponse?.playerCueRangeSet);

        const twoCol = payload.watchNextResponse.contents.twoColumnWatchNextResults;
        this.$.watchMetadata.applyPlayerAndWatchNext(payload.playerResponse, payload.watchNextResponse);
        this.$.playlistPanel.updatePlaylist(twoCol.playlist?.playlist);

        const secondaryResults = twoCol.secondaryResults?.secondaryResults;
        this.$.secondaryResults.applySecondaryResults(secondaryResults, payload.chipContinuations);

        const primaryContents = twoCol.results?.results?.contents || [];
        const commentSection = primaryContents.find((c) => c.itemSectionRenderer?.sectionIdentifier === "comment-item-section");
        if (commentSection)
            this.$.commentsSection.stampCommentSection(commentSection.itemSectionRenderer);

        const chipKeys = Object.keys(payload.chipContinuations).map(Number);
        if (chipKeys.length > 0)
            this.$.secondaryResults.selectFilterChip(chipKeys[0]);

        this.$.transcriptPanel.stampTranscriptCues(cueGroups.slice(0, 8), `Transcript • ${payload.videoId}`);
        this._runKevlarDomQueries(config.domQueryPasses || 42, config.retainDomQueryCount || 0, config.maxRetainedDomSteps || 0);
    }
}

const BASE_NAVIGATION_CONFIG = {
    recommendationCount: 11,
    commentCount: 8,
    playlistCount: 8,
    entityMutationCount: 24,
    chipContinuationCount: 8,
    transcriptCueCount: 16,
    domQueryPasses: 42,
    retainDomQueryCount: 13,
    maxRetainedDomSteps: 12,
    retainedCueGroups: 2,
    maxHistoryEntries: 7,
    routeCacheWindow: 12,
};

export class YtdApp extends KevlarPolymerElement {
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
                <div class="brand">▶ VideoWatch SPA (Polymer + Lit/Signals CoW)</div>
                <div class="nav-controls">
                    <span class="status-pill" id="watch-status-text">[[statusLabel]]</span>
                    <button id="embrace-watch-nav-btn" on-click="handleRunWatchSession">Run Watch Session</button>
                </div>
            </header>
            <ytd-watch-flexy id="watchFlexy"></ytd-watch-flexy>
        `;
    }

    ready() {
        super.ready();
        this.$.watchFlexy.bootstrapSessionAppShell(32, 220);
        for (let w = 0; w < 22; w++)
            this.$.watchFlexy.executeWatchNavigation(w, { ...BASE_NAVIGATION_CONFIG, bindingCount: 730 });
    }

    handleRunWatchSession() {
        const navigationsPerStep = 192;
        for (let i = 0; i < navigationsPerStep; i++) {
            this.navCounter += 1;
            const stepIndex = this.navCounter;
            this.$.watchFlexy.executeWatchNavigation(stepIndex, { ...BASE_NAVIGATION_CONFIG, bindingCount: 790 });
        }
        const st = appStore.getState();
        this.statusLabel = `Step #${this.navCounter} | Entities: ${Object.keys(st.entities.byKey).length} | Pooled: ${sharedElementPool.stats.reused} reused`;
    }
}

export function registerPolymerShell() {
    registerCoWElements();
    const classes = [YtdWatchMetadata, YtdPlaylistPanelRenderer, YtdCommentThreadRenderer, YtdEngagementPanelSectionListRenderer, YtdComments, YtdWatchNextSecondaryResultsRenderer, YtdWatchFlexy, YtdApp];
    for (const ctor of classes) {
        if (!customElements.get(ctor.is))
            customElements.define(ctor.is, ctor);
    }

}
