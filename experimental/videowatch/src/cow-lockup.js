/**
 * @fileoverview Reactive Web Component lockup elements built on `lit-html`
 * (`html`, `render`, `nothing`) and `@preact/signals-core`
 * (`signal`, `computed`, `effect`, `batch`).
 *
 * Each lockup component renders into an open `ShadowRoot` driven by reactive
 * signals and disposes its active effect subscription when detached.
 */
import { html, render, nothing } from "lit-html";
import { signal, computed, effect, batch } from "@preact/signals-core";
import { adoptComponentStyles } from "./store.js";

class CoWBaseElement extends HTMLElement {
    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        adoptComponentStyles(root);
        this._modelSignal = signal(undefined);
        this._interactionSignal = signal(0);
        this._disposeEffect = null;
        this._deferTeardown = false;
        this._retainedProjection = null;
    }

    set rootModel(value) {
        batch(() => {
            this._modelSignal.value = value;
            this._interactionSignal.value = this._interactionSignal.peek() + 1;
        });
        this._retainedProjection = value ? this._buildProjection(value) : null;
        this._ensureEffect();
    }

    get rootModel() {
        return this._modelSignal.peek();
    }

    connectedCallback() {
        if (this._modelSignal.peek() !== undefined)
            this._ensureEffect();
    }

    disconnectedCallback() {
        if (this._deferTeardown)
            return;

        this.finalizeCoWDetach();
    }

    finalizeCoWDetach() {
        this._deferTeardown = false;
        if (this._disposeEffect) {
            this._disposeEffect();
            this._disposeEffect = null;
        }
        this._modelSignal.value = undefined;
        this._retainedProjection = null;
    }

    resetPooledElement() {
        this.finalizeCoWDetach();
    }

    _ensureEffect() {
        if (this._disposeEffect)
            return;

        this._disposeEffect = effect(() => {
            const model = this._modelSignal.value;
            const rev = this._interactionSignal.value;
            if (!model)
                return;

            render(this.renderTemplate(model, rev), this.shadowRoot);
        });
    }

    _buildProjection(model) {
        return {
            raw: model,
            reactiveNodes: [signal(model.trackingParams || ""), signal(this._interactionSignal.peek())],
        };
    }

    renderTemplate(_model, _rev) {
        return nothing;
    }
}

export class YtLockupViewModel extends CoWBaseElement {
    constructor() {
        super();
        this._contentId = computed(() => this._modelSignal.value?.contentId || "");
        this._watchUrl = computed(() => {
            const vid = this._modelSignal.value?.contentId || "";
            return `/watch?v=${vid}`;
        });
        this._badgeText = computed(() => {
            const thumb = this._modelSignal.value?.contentImage?.thumbnailViewModel;
            const badges = thumb?.overlays?.[0]?.thumbnailOverlayBadgeViewModel?.thumbnailBadges;
            return badges?.[0]?.thumbnailBadgeViewModel?.text || "00:00";
        });
        this._progressWidth = computed(() => {
            const thumb = this._modelSignal.value?.contentImage?.thumbnailViewModel;
            return thumb?.overlays?.[1]?.thumbnailOverlayResumePlaybackViewModel?.progressPercentage ?? 0;
        });
        this._primarySrc = computed(() => {
            const thumb = this._modelSignal.value?.contentImage?.thumbnailViewModel;
            return thumb?.image?.sources?.[0]?.url || "";
        });
        this._titleText = computed(() => this._modelSignal.value?.metadata?.lockupMetadataViewModel?.title?.content || "");
        this._rows = computed(() => this._modelSignal.value?.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || []);
        this.shadowRoot.addEventListener("click", (ev) => {
            if (ev.target && ev.target.closest) {
                if (ev.target.closest(".menu-btn")) {
                    ev.stopPropagation();
                    this._interactionSignal.value = this._interactionSignal.peek() + 1;
                } else if (ev.target.closest(".yt-lockup-thumb-link")) {
                    ev.preventDefault();
                    this._interactionSignal.value = this._interactionSignal.peek() + 1;
                }
            }
        });
    }

    renderTemplate(model) {
        const contentId = this._contentId.value;
        const href = this._watchUrl.value;
        const tp = model?.trackingParams || "";
        const vss = model?.rendererContext?.loggingContext?.vssLoggingData?.serializedContextData || "";
        const thumb = model?.contentImage?.thumbnailViewModel || {};
        const src = this._primarySrc.value;
        const badgeText = this._badgeText.value;
        const progress = this._progressWidth.value;
        const hiResUrl = thumb?.image?.sources?.[1]?.url || "";
        const meta = model?.metadata?.lockupMetadataViewModel || {};
        const title = this._titleText.value;
        const rows = this._rows.value;
        const channelName = rows[0]?.metadataParts?.[0]?.text?.content || "";
        const statsParts = rows[1]?.metadataParts || [];
        const viewsText = statsParts[0]?.text?.content || "";
        const timeText = statsParts[1]?.text?.content || "";
        const a11y = meta?.menuButton?.buttonViewModel?.accessibilityText || "More actions";
        const metaTp = meta?.menuButton?.buttonViewModel?.trackingParams || "meta";

        return html`
            <div class="yt-lockup-view-model-wiz" data-content-id="${contentId}" data-tp="${tp}" data-vss="${vss}">
                <a class="yt-lockup-thumb-link" href="${href}">
                    <div class="yt-thumbnail-view-model" data-hires="${hiResUrl}">
                        <div class="thumb-art" data-src="${src}"></div>
                        <div class="yt-thumbnail-hover-overlay">
                            <button class="thumb-action-btn" type="button" aria-label="Watch later">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"></circle>
                                    <path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2"></path>
                                </svg>
                            </button>
                            <button class="thumb-action-btn" type="button" aria-label="Add to queue">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M4 6h16M4 12h12M4 18h12M19 15v6M16 18h6" fill="none" stroke="currentColor" stroke-width="2"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="badge"><span>${badgeText}</span></div>
                        <div class="resume-bar">
                            <div class="resume-fill" data-progress="${progress}"></div>
                        </div>
                        <div class="yt-spec-touch-feedback-shape" data-ripple="thumbnail-rounded:${hiResUrl}" data-tp="${hiResUrl}">
                            <div class="yt-spec-touch-feedback-shape__stroke"></div>
                            <div class="yt-spec-touch-feedback-shape__fill"></div>
                        </div>
                    </div>
                </a>
                <div class="meta-root">
                    <div class="meta-header-row">
                        <div class="yt-avatar-chip" aria-hidden="true">
                            <svg viewBox="0 0 28 28" width="24" height="24">
                                <circle cx="14" cy="14" r="12" fill="rgba(255,255,255,0.12)"></circle>
                                <circle cx="14" cy="11" r="4" fill="currentColor"></circle>
                                <path d="M7 22c1.5-3.5 12.5-3.5 14 0" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h3 class="title" title="${title}"><span>${title}</span></h3>
                    </div>
                    <div class="row channel-row">
                        <span class="byline">${channelName}</span>
                        <span class="badge-verified" aria-hidden="true">
                            <svg viewBox="0 0 16 16" width="12" height="12">
                                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.2 5.3l-3.8 4a.7.7 0 01-1 0L4.8 8.7a.7.7 0 111-1l1.1 1.1 3.3-3.5a.7.7 0 111 1z" fill="currentColor"></path>
                            </svg>
                        </span>
                    </div>
                    <div class="row stats-row">
                        <span>${viewsText}</span>
                        <span>•</span>
                        <span>${timeText}</span>
                        <span class="meta-quality-chip">4K</span>
                        <span class="meta-quality-chip">CC</span>
                    </div>
                    <button class="menu-btn" aria-label="${a11y}">⋮</button>
                    <div class="yt-spec-touch-feedback-shape" data-ripple="metadata-action:${metaTp}" data-tp="${metaTp}">
                        <div class="yt-spec-touch-feedback-shape__stroke"></div>
                        <div class="yt-spec-touch-feedback-shape__fill"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

export function registerCoWElements() {
    if (!customElements.get("yt-lockup-view-model"))
        customElements.define("yt-lockup-view-model", YtLockupViewModel);
}
