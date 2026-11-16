// The chrome Firefox puts around an embedded pdf.js, rebuilt here rather than taken
// from pdf.js' web/ viewer, which is a whole application and would drag in the render
// queue and the scroll, scale and find debounces the workload avoids.
//
// The buttons are inert: wiring zoom would mean rebuilding canvases mid-step.

const TOOLBAR_GROUPS = [
    ["views-manager", "separator", "page-number"],
    ["zoom-out", "zoom-level", "zoom-in"],
    ["search", "separator", "highlight", "free-text", "ink", "separator", "download", "print", "secondary"],
];

const SIDEBAR_TABS = ["thumbnails", "outline", "attachments", "layers"];

function button(icon, label) {
    const element = document.createElement("button");
    element.className = "pdf-toolbar-button";
    element.dataset.icon = icon;
    element.type = "button";
    element.title = label;
    element.setAttribute("aria-label", label);
    return element;
}

function separator() {
    const element = document.createElement("span");
    element.className = "pdf-toolbar-separator";
    return element;
}

function pageNumberField(pageCount) {
    const wrapper = document.createElement("span");
    wrapper.className = "pdf-page-field";

    const input = document.createElement("input");
    input.className = "pdf-page-input";
    input.type = "text";
    input.value = "1";
    input.readOnly = true;
    input.setAttribute("aria-label", "Page");

    const total = document.createElement("span");
    total.className = "pdf-page-total";
    total.textContent = `of ${pageCount}`;

    wrapper.append(input, total);
    return wrapper;
}

function zoomLevel(scale) {
    const element = document.createElement("span");
    element.className = "pdf-zoom-level";
    element.textContent = `${Math.round(scale * 100)}%`;
    return element;
}

const TOOLBAR_LABELS = {
    "views-manager": "Toggle sidebar",
    "zoom-out": "Zoom out",
    "zoom-in": "Zoom in",
    search: "Find in document",
    highlight: "Highlight",
    "free-text": "Add text",
    ink: "Draw",
    download: "Save",
    print: "Print",
    secondary: "Tools",
};

export function buildToolbar(element, { pageCount, scale }) {
    const groups = TOOLBAR_GROUPS.map((items, index) => {
        const group = document.createElement("div");
        group.className = index === TOOLBAR_GROUPS.length - 1 ? "pdf-toolbar-group pdf-toolbar-group-end" : "pdf-toolbar-group";
        for (const item of items) {
            if (item === "separator")
                group.append(separator());
            else if (item === "page-number")
                group.append(pageNumberField(pageCount));
            else if (item === "zoom-level")
                group.append(zoomLevel(scale));
            else
                group.append(button(item, TOOLBAR_LABELS[item]));
        }
        return group;
    });
    element.replaceChildren(...groups);
}

/**
 * Returns the panel the thumbnails go into. Only the active tab's panel is populated,
 * as in pdf.js' viewer, which builds the others the first time their tab is opened.
 */
export function buildSidebar(element) {
    const strip = document.createElement("div");
    strip.className = "pdf-sidebar-tabs";
    for (const tab of SIDEBAR_TABS) {
        const control = button(`view-${tab}`, `Show ${tab}`);
        control.classList.add("pdf-sidebar-tab");
        control.classList.toggle("pdf-sidebar-tab-active", tab === "thumbnails");
        strip.append(control);
    }

    const panel = document.createElement("div");
    panel.className = "pdf-thumbnails";

    element.replaceChildren(strip, panel);
    return panel;
}
