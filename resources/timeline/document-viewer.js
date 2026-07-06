import { Virtualizer } from "./virtualizer.js";
import { generateTimelineData } from "./data-generator.js";

// State
let originalData = [];
let filteredData = [];
let enabledCategories = new Set(["travel", "schools", "medical", "federal", "public-health"]);
let currentSearchQuery = "";
let virtualizer = null;

// DOM Elements
const container = document.getElementById("document-container");
const content = document.getElementById("document-content");
const searchInput = document.getElementById("search-query");
const replaceInput = document.getElementById("replace-value");

// Renderer callback
function renderBlock(block, node) {
    node.innerHTML = "";
    node.dataset.blockId = block.id;

    if (block.type === "header") {
        node.className = "timeline-block block-header";

        const dateDiv = document.createElement("div");
        dateDiv.className = "header-date";
        dateDiv.textContent = block.date;

        const title = document.createElement("h2");
        title.innerHTML = highlightText(block.title, currentSearchQuery);

        const text = document.createElement("p");
        text.innerHTML = highlightText(block.text, currentSearchQuery);

        node.appendChild(dateDiv);
        node.appendChild(title);
        node.appendChild(text);
    } else if (block.type === "milestone") {
        node.className = `timeline-block block-milestone severity-${block.severity}`;

        const badge = document.createElement("span");
        badge.className = "milestone-badge";
        badge.textContent = "MILESTONE";

        const dateDiv = document.createElement("div");
        dateDiv.className = "event-date";
        dateDiv.textContent = block.date;

        const title = document.createElement("h3");
        title.innerHTML = highlightText(block.title, currentSearchQuery);

        const text = document.createElement("p");
        text.innerHTML = highlightText(block.text, currentSearchQuery);

        node.appendChild(badge);
        node.appendChild(dateDiv);
        node.appendChild(title);
        node.appendChild(text);
    } else if (block.type === "event") {
        node.className = `timeline-block block-event category-${block.category} severity-${block.severity}`;

        const catBadge = document.createElement("span");
        catBadge.className = `category-badge cat-${block.category}`;
        catBadge.textContent = block.category.toUpperCase();

        const dateDiv = document.createElement("div");
        dateDiv.className = "event-date";
        dateDiv.textContent = block.date;

        const title = document.createElement("h3");
        title.innerHTML = highlightText(block.title, currentSearchQuery);

        const text = document.createElement("p");
        text.innerHTML = highlightText(block.text, currentSearchQuery);

        node.appendChild(catBadge);
        node.appendChild(dateDiv);
        node.appendChild(title);
        node.appendChild(text);
    }
}

function escapeHTML(str) {
    return str.replace(
        /[&<>'"]/g,
        (tag) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            }[tag] || tag)
    );
}

// Helper for highlighting
function highlightText(text, query) {
    const escapedText = escapeHTML(text);
    if (!query)
        return escapedText;
    const escapedQuery = escapeHTML(query);
    const regex = new RegExp(`(${escapeRegExp(escapedQuery)})`, "gi");
    return escapedText.replace(regex, '<mark class="highlight">$1</mark>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Filtering logic
function filterData(data) {
    return data.filter((block) => {
        if (block.type === "header")
            return true;
        // Milestones might have category too, filter if it exists
        if (block.category && !enabledCategories.has(block.category))
            return false;

        if (block.type === "event" && !enabledCategories.has(block.category))
            return false;

        return true;
    });
}

function updateView() {
    filteredData = filterData(originalData);
    virtualizer.updateData(filteredData);
    renderTOC();
}

// TOC Renderer (now renders Month headers for quick jump)
function renderTOC() {
    const tocContainer = document.getElementById("toc-container");
    if (!tocContainer)
        return;

    tocContainer.innerHTML = "";
    const ul = document.createElement("ul");

    originalData.forEach((block) => {
        if (block.type === "header") {
            const li = document.createElement("li");
            li.className = "toc-item toc-header";

            const link = document.createElement("span");
            link.className = "toc-link";
            link.textContent = block.title;
            link.onclick = (e) => {
                e.preventDefault();
                // Find index in filtered data
                const index = filteredData.findIndex((b) => b.id === block.id);
                if (index !== -1)
                    virtualizer.scrollToIndex(index);
            };

            li.appendChild(link);
            ul.appendChild(li);
        }
    });

    tocContainer.appendChild(ul);
}

// Search and Replace
function performSearchAndReplace(query, replacement) {
    currentSearchQuery = query;
    if (!query)
        return;

    originalData.forEach((block) => {
        if (block.type === "event" || block.type === "milestone" || block.type === "header") {
            const regex = new RegExp(escapeRegExp(query), "gi");
            if (block.title)
                block.title = block.title.replace(regex, replacement);
            if (block.text)
                block.text = block.text.replace(regex, replacement);
        }
    });

    currentSearchQuery = replacement; // Highlight the replacement
    virtualizer.forceRehydration();
    renderTOC();
}

// Action handlers for buttons
function setupEventHandlers() {
    document.getElementById("ScrollToMiddle").addEventListener("click", () => {
        const middleIndex = Math.floor(filteredData.length / 2);
        virtualizer.scrollToIndex(middleIndex);
    });

    document.getElementById("ScrollToBottom").addEventListener("click", () => {
        virtualizer.scrollToIndex(filteredData.length - 1);
    });

    // Toggle TOC Sections (in horizontal timeline, maybe collapse all categories?)
    // "Collapsing/filtering categories of events ... should filter matching timeline items"
    // We have individual checkboxes, but the ToggleTOCSections button can toggle all categories.
    let allEnabled = true;
    document.getElementById("ToggleTOCSections").addEventListener("click", () => {
        const categories = ["travel", "schools", "medical", "federal", "public-health"];
        if (allEnabled) {
            enabledCategories.clear();
            allEnabled = false;
        } else {
            categories.forEach((c) => enabledCategories.add(c));
            allEnabled = true;
        }
        // Update checkboxes in UI
        categories.forEach((c) => {
            const cb = document.getElementById(`cb-${c}`);
            if (cb)
                cb.checked = allEnabled;
        });
        updateView();
    });

    document.getElementById("SearchAndReplace").addEventListener("click", () => {
        const query = searchInput.value;
        const replacement = replaceInput.value;
        performSearchAndReplace(query, replacement);
    });

    // Setup category checkbox handlers
    const categories = ["travel", "schools", "medical", "federal", "public-health"];
    categories.forEach((c) => {
        const cb = document.getElementById(`cb-${c}`);
        if (cb) {
            cb.addEventListener("change", (e) => {
                if (e.target.checked)
                    enabledCategories.add(c);
                else
                    enabledCategories.delete(c);

                updateView();
            });
        }
    });
}

// Initialization
function init() {
    originalData = generateTimelineData(1000);
    filteredData = [...originalData];

    virtualizer = new Virtualizer(container, content, filteredData, renderBlock);

    renderTOC();
    setupEventHandlers();
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
else
    init();
