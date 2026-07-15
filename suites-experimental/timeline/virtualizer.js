// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

export class Virtualizer {
    constructor(container, content, data, renderCallback) {
        this.container = container;
        this.content = content;
        this.data = data;
        this.renderCallback = renderCallback;

        this.widthCache = new Map(); // block.id -> width
        this.xPositions = []; // index -> x
        this.totalWidth = 0;

        this.visibleIndices = new Set();
        this.renderedElements = new Map(); // index -> DOMNode

        this.pool = {
            event: [],
            milestone: [],
            header: [],
        };

        this.defaultWidths = {
            event: 300,
            milestone: 200,
            header: 150,
        };

        this.buffer = 400; // pixels of buffer left/right viewport

        this.init();
    }

    init() {
        this.calculatePositions();
        this.container.addEventListener("scroll", () => this.handleScroll());
        this.handleScroll();
    }

    calculatePositions() {
        let currentX = 0;
        this.xPositions = [];
        for (let i = 0; i < this.data.length; i++) {
            this.xPositions.push(currentX);
            const block = this.data[i];
            const width = this.widthCache.get(block.id) || this.defaultWidths[block.type] || 250;
            currentX += width;
        }
        this.totalWidth = currentX;
        this.content.style.width = `${this.totalWidth}px`;
        this.content.style.height = "100%";
    }

    handleScroll() {
        const scrollLeft = this.container.scrollLeft;
        const containerWidth = this.container.clientWidth;

        const viewportStart = scrollLeft - this.buffer;
        const viewportEnd = scrollLeft + containerWidth + this.buffer;

        const newVisibleIndices = new Set();
        for (let i = 0; i < this.data.length; i++) {
            const block = this.data[i];
            const x = this.xPositions[i];
            const width = this.widthCache.get(block.id) || this.defaultWidths[block.type] || 250;
            if (x + width >= viewportStart && x <= viewportEnd) newVisibleIndices.add(i);
        }

        for (const index of this.visibleIndices) {
            if (!newVisibleIndices.has(index)) this.recycleElement(index);
        }

        let cacheDirty = false;
        for (const index of newVisibleIndices) {
            if (!this.visibleIndices.has(index) || !this.renderedElements.has(index)) {
                const widthChanged = this.renderElement(index);
                if (widthChanged) cacheDirty = true;
            }
        }

        this.visibleIndices = newVisibleIndices;

        if (cacheDirty) {
            this.calculatePositions();
            this.repositionVisibleElements();
        }
    }

    renderElement(index) {
        const block = this.data[index];
        const type = block.type;
        let node = this.getRecycledNode(type);

        if (!node) node = this.createNewNode(type);

        this.renderCallback(block, node);
        this.content.appendChild(node);

        const x = this.xPositions[index];
        node.style.transform = `translate3d(${x}px, 0, 0)`;
        node.style.position = "absolute";
        node.style.top = "0";
        node.style.bottom = "0";

        this.renderedElements.set(index, node);

        const measuredWidth = node.offsetWidth;
        const cachedWidth = this.widthCache.get(block.id);

        if (measuredWidth !== cachedWidth) {
            this.widthCache.set(block.id, measuredWidth);
            return true; // Width changed
        }
        return false;
    }

    repositionVisibleElements() {
        for (const index of this.visibleIndices) {
            const node = this.renderedElements.get(index);
            if (node) {
                const x = this.xPositions[index];
                node.style.transform = `translate3d(${x}px, 0, 0)`;
            }
        }
    }

    recycleElement(index) {
        const node = this.renderedElements.get(index);
        if (node) {
            this.renderedElements.delete(index);
            node.remove();
            const type = this.data[index].type;
            if (!this.pool[type]) this.pool[type] = [];

            this.pool[type].push(node);
        }
    }

    getRecycledNode(type) {
        if (this.pool[type] && this.pool[type].length > 0) return this.pool[type].pop();

        return null;
    }

    createNewNode(type) {
        const div = document.createElement("div");
        div.className = `timeline-block block-${type}`;
        return div;
    }

    scrollToIndex(index) {
        if (index < 0 || index >= this.data.length) return;
        this.calculatePositions();
        const x = this.xPositions[index];
        this.container.scrollLeft = x;
        this.handleScroll();
    }

    scrollToOffset(offset) {
        this.container.scrollLeft = offset;
        this.handleScroll();
    }

    updateData(newData) {
        for (const index of this.visibleIndices) this.recycleElement(index);

        this.visibleIndices.clear();
        this.renderedElements.clear();

        this.data = newData;
        this.calculatePositions();
        this.handleScroll();
    }

    forceRehydration() {
        for (const index of this.visibleIndices) {
            const node = this.renderedElements.get(index);
            if (node) {
                const block = this.data[index];
                this.renderCallback(block, node);
                const measuredWidth = node.offsetWidth;
                const cachedWidth = this.widthCache.get(block.id);
                if (measuredWidth !== cachedWidth) {
                    this.widthCache.set(block.id, measuredWidth);
                    this.calculatePositions();
                    this.repositionVisibleElements();
                }
            }
        }
    }
}
