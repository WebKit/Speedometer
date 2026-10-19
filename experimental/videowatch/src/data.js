/**
 * @fileoverview Watch and continuation payload generator for VideoWatch-SPA.
 * Produces structured video watch payloads:
 * - Video player details, storyboard cue-ranges, adaptive format segment tables,
 *   and timed-text transcript engagement panel cues
 * - Compact video lockups (`lockupViewModel`) for the recommendation feed
 * - Comment thread renderers (`commentThreadRenderer`) for `ElementPool`
 * - Playlist panel items (`playlistPanelVideoRenderer`)
 * - Entity mutation batch (`entityBatchUpdate`) for Redux normalized store
 */

export class SeededRandom {
    constructor(seed = 0x5eedcafe) {
        this.state = seed >>> 0;
    }

    nextUint32() {
        let x = this.state;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.state = x >>> 0;
        return this.state;
    }

    nextInt(min, max) {
        return min + (this.nextUint32() % (max - min + 1));
    }

    pick(arr) {
        return arr[this.nextUint32() % arr.length];
    }

    hexString(length) {
        const idx = this.nextUint32() % (HEX_POOL.length - length);
        return HEX_POOL.slice(idx, idx + length);
    }
}

const HEX_POOL = (() => {
    const chars = "0123456789abcdefABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
    let s = "";
    let x = 0x5eedcafe;
    for (let i = 0; i < 4096; i++) {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        s += chars[(x >>> 0) % chars.length];
    }
    return s;
})();

const TOPICS = [
    "Alpine Glaciers",
    "Coastal Wildlife",
    "Sourdough Baking",
    "Acoustic Guitar",
    "Modernist Timber",
    "Deep Sea Reefs",
    "Astro Photography",
    "Nordic Railways",
    "Botanical Gardens",
    "Ceramic Glazing",
    "Desert Canyons",
    "Classical Piano",
    "Urban Skylines",
    "Artisan Roasting",
    "Volcanic Islands",
    "Marine Biology",
    "Historic Bridges",
    "Forest Canopy",
];

const ADJECTIVES = ["Exploring", "Field Guide:", "Journey Through", "Inside", "Documenting", "Discovering", "Portrait of", "Seasons in", "Hidden", "Wild"];

const CHANNELS = [
    { name: "Horizon Expeditions", handle: "@horizon-exp", subs: "418K subscribers" },
    { name: "Studio Craft & Kitchen", handle: "@studio-craft", subs: "295K subscribers" },
    { name: "Acoustic Sessions", handle: "@acoustic-sessions", subs: "184K subscribers" },
    { name: "Terra Nature Films", handle: "@terra-nature", subs: "512K subscribers" },
    { name: "Civic Architecture", handle: "@civic-arch", subs: "640K subscribers" },
    { name: "Observatory Notes", handle: "@observatory-notes", subs: "310K subscribers" },
];

const CHIP_LABELS = ["All", "From this channel", "Nature", "Travel", "Cooking", "Music", "Science", "Recently uploaded"];

const COMMENT_TEMPLATES = [
    "The morning light across the valley ridge during the second chapter was captured with remarkable clarity.",
    "We visited this exact coastal trail last autumn and saw the same migratory seabirds along the cliffs.",
    "Could you share which focal length and neutral density filter were used for the waterfall sequence?",
    "Stepping through the chapter markers makes it really easy to compare the seasonal changes across the glacier.",
    "The acoustic arrangement in the middle section blends naturally with the ambient soundscape of the forest.",
    "Detailed timestamps and synchronized transcript segments make following along with each step of the recipe effortless!",
];

export const WATCH_SEQUENCE = [
    { videoId: "vw_alpine_glacier_01", category: "Nature", chipIndex: 1 },
    { videoId: "vw_coastal_trail_02", category: "Travel", chipIndex: 2 },
    { videoId: "vw_artisan_bread_03", category: "Cooking", chipIndex: 3 },
    { videoId: "vw_acoustic_stage_04", category: "Music", chipIndex: 4 },
    { videoId: "vw_timber_design_05", category: "From this channel", chipIndex: 5 },
    { videoId: "vw_coral_lagoon_06", category: "Recently uploaded", chipIndex: 6 },
    { videoId: "vw_night_sky_07", category: "Science", chipIndex: 1 },
    { videoId: "vw_nordic_fjord_08", category: "Travel", chipIndex: 3 },
    { videoId: "vw_botanic_house_09", category: "Nature", chipIndex: 2 },
    { videoId: "vw_canyon_overlook_10", category: "Travel", chipIndex: 4 },
];

// Shared response envelope builders
const textPart = (content) => ({ text: { content } });
const metadataRow = (...parts) => ({ metadataParts: parts.map(textPart) });
const watchCommand = (videoId, params, playerParams) => ({
    onTap: { navigationCommand: { watchEndpoint: { videoId, params, playerParams } } },
});
const continuationEndpoint = (token, chipFilterParams) => ({
    continuationCommand: { token, command: { navigationCommand: { chipFilterParams } } },
});
const reloadContinuationCommand = (targetId, continuationItems) => ({
    reloadContinuationItemsCommand: { targetId, continuationItems },
});
const thumbnailBadgeOverlay = (text) => ({
    thumbnailOverlayBadgeViewModel: {
        thumbnailBadges: [{ thumbnailBadgeViewModel: { text, badgeStyle: "THUMBNAIL_OVERLAY_BADGE_STYLE_DEFAULT" } }],
    },
});
const resumePlaybackOverlay = (progressPercentage) => ({
    thumbnailOverlayResumePlaybackViewModel: { progressPercentage },
});
const commentNode = (commentId, authorText, contentText, publishedTimeText, voteCount, extra = {}) => ({
    commentRenderer: { commentId, authorText, contentText, publishedTimeText, voteCount, ...extra },
});

export function buildLockupItem(rng, index, navStep, tagPrefix = "rec") {
    const channel = rng.pick(CHANNELS);
    const topic = rng.pick(TOPICS);
    const adj = rng.pick(ADJECTIVES);
    const videoId = `${tagPrefix}_${navStep}_${index}_${rng.hexString(6)}`;
    const views = rng.nextInt(12, 980);
    const hoursAgo = rng.nextInt(1, 48);
    const mins = rng.nextInt(4, 58);
    const secs = String(rng.nextInt(0, 59)).padStart(2, "0");
    const progressPct = rng.nextInt(0, 100);
    const hue = (index * 37 + navStep * 53) % 360;
    const svgThumb = `linear-gradient(135deg, hsl(${hue},45%,22%), hsl(${(hue + 40) % 360},55%,14%))`;

    return {
        lockupViewModel: {
            contentId: videoId,
            contentType: "LOCKUP_CONTENT_TYPE_VIDEO",
            trackingParams: `gt_${rng.hexString(28)}_${navStep}_${index}`,
            rendererContext: {
                loggingContext: { vssLoggingData: { serializedContextData: `vss_${rng.hexString(36)}` } },
                commandContext: watchCommand(videoId, `wg_${rng.hexString(20)}`, `pp_${rng.hexString(20)}`),
            },
            contentImage: {
                thumbnailViewModel: {
                    image: {
                        sources: [
                            { url: svgThumb, width: 168, height: 94 },
                            { url: `https://cdn.videowatch.example/vi/${videoId}/hqdefault.jpg`, width: 336, height: 188 },
                        ],
                    },
                    overlays: [thumbnailBadgeOverlay(`${mins}:${secs}`), resumePlaybackOverlay(progressPct)],
                },
            },
            metadata: {
                lockupMetadataViewModel: {
                    title: { content: `${adj} ${topic} (#${navStep}.${index})` },
                    metadata: {
                        contentMetadataViewModel: {
                            metadataRows: [metadataRow(channel.name), metadataRow(`${views}K views`, `${hoursAgo} hours ago`)],
                        },
                    },
                    menuButton: {
                        buttonViewModel: {
                            iconName: "MORE_VERT",
                            accessibilityText: `More actions for ${topic}`,
                            trackingParams: `btn_${rng.hexString(20)}`,
                        },
                    },
                },
            },
        },
    };
}

export function buildTranscriptCues(rng, navStep, cueCount) {
    const cues = new Array(cueCount);
    for (let i = 0; i < cueCount; i++) {
        const startMs = i * 2000;
        const tp = rng.pick(TOPICS);
        const words = new Array(6);
        for (let w = 0; w < 6; w++) {
            words[w] = {
                word: w % 2 === 0 ? tp : CHANNELS[(i + w) % CHANNELS.length].handle,
                tokenIndex: i * 6 + w,
                offsetMs: startMs + w * 320,
                confidence: 0.94,
            };
        }
        cues[i] = {
            transcriptCueGroupRenderer: {
                cueGroupStartOffsetMs: startMs,
                formattedStartOffset: `${Math.floor(startMs / 60000)}:${String(Math.floor(startMs / 1000) % 60).padStart(2, "0")}`,
                cues: [
                    {
                        transcriptCueRenderer: {
                            cueId: `cue_${navStep}_${i}`,
                            durationMs: 2000,
                            text: COMMENT_TEMPLATES[i % COMMENT_TEMPLATES.length],
                            wordTimings: words,
                        },
                    },
                ],
            },
        };
    }
    return cues;
}

function buildCommentThread(rng, navStep, i) {
    const author = rng.pick(CHANNELS);
    const body = rng.pick(COMMENT_TEMPLATES);
    const commentId = `cmt_${navStep}_${i}_${rng.hexString(8)}`;
    const likeCount = rng.nextInt(3, 840);
    const replyCount = rng.nextInt(1, 3);
    const replies = Array.from({ length: replyCount }, (_, r) =>
        commentNode(`${commentId}_r${r}`, `@viewer_${rng.nextInt(10, 99)}`, `${rng.pick(COMMENT_TEMPLATES)} [ref:${rng.hexString(12)}]`, `${rng.nextInt(1, 12)} hours ago`, String(rng.nextInt(1, 55)))
    );
    return {
        commentThreadRenderer: {
            commentId,
            trackingParams: `ct_${rng.hexString(24)}`,
            comment: commentNode(commentId, `${author.handle}_${i}`, `${body} (nav #${navStep}, thread #${i}, trace=${rng.hexString(14)})`, `${rng.nextInt(1, 23)} hours ago`, String(likeCount), { authorChannelName: author.name, replyCount }),
            replies: { commentRepliesRenderer: { contents: replies, viewRepliesText: `View ${replyCount} replies` } },
        },
    };
}

function buildEntityMutation(rng, stepSpec, navStep, i) {
    const entityKey = `E_${(navStep * 35 + i) % 160}`;
    return {
        entityKey,
        type: "ENTITY_MUTATION_TYPE_REPLACE",
        payload: {
            videoMetadataEntity: {
                key: entityKey,
                videoId: `${stepSpec.videoId}_${i}`,
                viewCountText: `${rng.nextInt(100, 999)},${rng.nextInt(100, 999)} views`,
                likeCount: rng.nextInt(1000, 95000),
                subscriptionState: (i + navStep) % 2 === 0 ? "SUBSCRIBED" : "UNSUBSCRIBED",
                playbackPositionSeconds: rng.nextInt(0, 1800),
                storyboardSpec: `sb_${rng.hexString(44)}|${rng.hexString(44)}`,
                markersList: [
                    { startMs: 0, durationMs: 30000, label: `Intro ${rng.hexString(8)}` },
                    { startMs: 30000, durationMs: 90000, label: `Part 1 ${rng.hexString(8)}` },
                    { startMs: 120000, durationMs: 60000, label: `Summary ${rng.hexString(8)}` },
                ],
            },
        },
    };
}

export function generateWatchResponse(navStep, config = {}) {
    const { recommendationCount = 11, commentCount = 8, playlistCount = 8, entityMutationCount = 24, chipContinuationCount = 8, transcriptCueCount = 16 } = config;

    const rng = new SeededRandom(0x13572468 + navStep * 10007);
    const stepSpec = WATCH_SEQUENCE[navStep % WATCH_SEQUENCE.length];
    const primaryChannel = rng.pick(CHANNELS);
    const primaryTopic = rng.pick(TOPICS);

    const recommendations = Array.from({ length: recommendationCount }, (_, i) => buildLockupItem(rng, i, navStep, "rec"));

    const chipCloudChips = CHIP_LABELS.map((label, idx) => ({
        chipCloudChipRenderer: {
            text: { simpleText: label },
            isSelected: idx === 0,
            chipIndex: idx,
            navigationEndpoint: continuationEndpoint(`chip_cont_${navStep}_${idx}_${rng.hexString(24)}`, `cfp_${rng.hexString(20)}`),
            trackingParams: `chip_${rng.hexString(20)}`,
        },
    }));

    const chipContinuationTabs = config.chipContinuationTabs || 1;
    const chipContinuations = {};
    for (let c = 1; c <= chipContinuationTabs; c++) {
        const cIdx = ((stepSpec.chipIndex + c - 1) % (CHIP_LABELS.length - 1)) + 1;
        const items = Array.from({ length: chipContinuationCount }, (_, i) => buildLockupItem(rng, i, navStep * 10 + cIdx, `chip${cIdx}`));
        chipContinuations[cIdx] = {
            onResponseReceivedEndpoints: [reloadContinuationCommand("watch-next-feed", items)],
            responseContext: {
                visitorData: `vd_chip_${rng.hexString(32)}`,
                serviceTrackingParams: [
                    {
                        service: "FEED_RECOMMENDATIONS",
                        params: [
                            { key: "chip_filter", value: CHIP_LABELS[cIdx] },
                            { key: "browse_id", value: `related_feed_${navStep}_${cIdx}` },
                        ],
                    },
                ],
            },
        };
    }

    const commentThreads = Array.from({ length: commentCount }, (_, i) => buildCommentThread(rng, navStep, i));

    const playlistItems = Array.from({ length: playlistCount }, (_, i) => {
        const ch = rng.pick(CHANNELS);
        const tp = rng.pick(TOPICS);
        return {
            playlistPanelVideoRenderer: {
                videoId: `pl_${navStep}_${i}_${rng.hexString(6)}`,
                title: `${i + 1}. ${tp} — Session #${navStep}.${i}`,
                shortBylineText: ch.name,
                lengthText: `${rng.nextInt(5, 42)}:${String(rng.nextInt(0, 59)).padStart(2, "0")}`,
                selected: i === navStep % playlistCount,
                indexText: String(i + 1),
                trackingParams: `plv_${rng.hexString(20)}`,
            },
        };
    });

    const mutations = Array.from({ length: entityMutationCount }, (_, i) => buildEntityMutation(rng, stepSpec, navStep, i));

    const cueRanges = Array.from({ length: 28 }, (_, i) => {
        const h1 = rng.nextInt(4, 28);
        const h2 = rng.nextInt(6, 30);
        const h3 = rng.nextInt(4, 26);
        return {
            startTimeMs: i * 15000,
            endTimeMs: (i + 1) * 15000,
            chapterTitle: `Chapter ${i + 1}: ${rng.pick(TOPICS)} (${rng.hexString(8)})`,
            heatmapIntensity: (rng.nextInt(10, 100) / 100).toFixed(2),
            heatmapPath: `M0,32 L25,${32 - h1} L55,${32 - h2} L80,${32 - h3} L100,32 Z`,
        };
    });

    const transcriptCues = buildTranscriptCues(rng, navStep, transcriptCueCount);

    return {
        videoId: stepSpec.videoId,
        navStep,
        playerResponse: {
            videoDetails: {
                videoId: stepSpec.videoId,
                title: `${rng.pick(ADJECTIVES)} ${primaryTopic} — Episode ${navStep + 1}`,
                shortDescription:
                    `Field notes and episode overview covering ${primaryTopic} across changing seasons `
                    + `(episode=${navStep + 1}, ref=${rng.hexString(36)}).\n`
                    + "00:00 Introduction & Location\n03:45 Field Equipment & Setup\n"
                    + "08:20 Main Documentary Sequence\n14:10 Closing Notes & Credits",
                channelId: `UC_${rng.hexString(16)}`,
                author: primaryChannel.name,
                subscriberCountText: primaryChannel.subs,
                viewCount: `${rng.nextInt(120, 950)},${rng.nextInt(100, 999)} views`,
                publishDate: `Oct ${rng.nextInt(1, 28)}, 2025`,
                likeCountText: `${rng.nextInt(12, 89)}K`,
            },
            streamingData: {
                adaptiveFormats: Array.from({ length: 16 }, (_, idx) => ({
                    itag: 240 + idx,
                    mimeType: idx < 10 ? 'video/webm; codecs="vp9"' : 'audio/webm; codecs="opus"',
                    bitrate: 250000 * (idx + 1),
                    initRange: { start: "0", end: String(700 + idx * 15) },
                    indexRange: { start: String(701 + idx * 15), end: String(2400 + idx * 50) },
                    cipher: `s=${rng.hexString(48)}&sp=sig&url=https://edge${idx}.cdn.videowatch.example/videoplayback`,
                    segmentTimeline: Array.from({ length: 24 }, (__, sIdx) => ({
                        segIdx: sIdx,
                        byteStart: sIdx * 65536,
                        byteEnd: (sIdx + 1) * 65536 - 1,
                        checksum: rng.hexString(12),
                    })),
                })),
            },
            playerCueRangeSet: cueRanges,
        },
        watchNextResponse: {
            responseContext: { visitorData: `vd_${rng.hexString(36)}`, trackingParams: `wn_${rng.hexString(36)}` },
            engagementPanels: [
                {
                    engagementPanelSectionListRenderer: {
                        panelIdentifier: "engagement-panel-searchable-transcript",
                        content: { transcriptRenderer: { cueGroups: transcriptCues } },
                    },
                },
            ],
            contents: {
                twoColumnWatchNextResults: {
                    results: {
                        results: {
                            contents: [
                                {
                                    videoPrimaryInfoRenderer: {
                                        title: `${rng.pick(ADJECTIVES)} ${primaryTopic} — Episode ${navStep + 1}`,
                                        viewCountText: `${rng.nextInt(120, 950)},${rng.nextInt(100, 999)} views`,
                                        dateText: `Oct ${rng.nextInt(1, 28)}, 2025`,
                                        tags: [`#${stepSpec.category.replace(/\s+/g, "")}`, "#Documentary", "#4KVideo", "#Series"],
                                    },
                                },
                                {
                                    videoSecondaryInfoRenderer: {
                                        owner: {
                                            title: primaryChannel.name,
                                            handle: primaryChannel.handle,
                                            subscriberCountText: primaryChannel.subs,
                                        },
                                        descriptionText: `Documentary feature exploring ${primaryTopic}. Episode ID: ${rng.hexString(24)}.`,
                                    },
                                },
                                {
                                    itemSectionRenderer: {
                                        sectionIdentifier: "comment-item-section",
                                        headerText: `${commentCount * 14} Comments`,
                                        contents: commentThreads,
                                    },
                                },
                            ],
                        },
                    },
                    secondaryResults: {
                        secondaryResults: {
                            results: recommendations,
                            chipCloud: { chipCloudRenderer: { chips: chipCloudChips } },
                        },
                    },
                    playlist: {
                        playlist: {
                            title: `${stepSpec.category} — Featured Playlist (Mix #${navStep + 1})`,
                            ownerName: primaryChannel.name,
                            currentIndex: navStep % playlistCount,
                            totalVideos: playlistCount,
                            contents: playlistItems,
                        },
                    },
                },
            },
            frameworkUpdates: {
                entityBatchUpdate: {
                    mutations,
                    timestamp: { seconds: String(1700000000 + navStep * 60), nanos: 0 },
                },
            },
        },
        chipContinuations,
    };
}
