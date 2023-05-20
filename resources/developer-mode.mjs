import { Suites } from "./tests.mjs";

export function createDeveloperModeContainer() {
    const container = document.createElement("div");
    container.className = "developer-mode";

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Developer Mode";
    details.append(summary);

    const content = document.createElement("div");
    content.className = "developer-mode-content";
    content.append(createUIForSuites());
    details.append(content);

    container.append(details);
    return container;
}

export function createUIForSuites() {
    const control = document.createElement("nav");
    const ol = document.createElement("ol");
    const checkboxes = [];

    const setSuiteEnabled = (suiteIndex, enabled) => {
        Suites[suiteIndex].disabled = !enabled;
        checkboxes[suiteIndex].checked = enabled;
    };

    for (const suite of Suites) {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.id = suite.name;
        checkbox.type = "checkbox";
        checkbox.checked = !suite.disabled;
        checkbox.onclick = (event) => {
            suite.disabled = !checkbox.checked;
            if (event?.ctrlKey || event?.metaKey) {
                for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++) {
                    if (Suites[suiteIndex] !== suite)
                        setSuiteEnabled(suiteIndex, false);
                    else
                        setSuiteEnabled(suiteIndex, true);

                }
            }
            fixupURL();
        };
        checkboxes.push(checkbox);

        li.appendChild(checkbox);
        const label = document.createElement("label");
        label.appendChild(document.createTextNode(suite.name));
        li.appendChild(label);
        label.htmlFor = checkbox.id;

        ol.appendChild(li);
    }

    control.appendChild(ol);

    let button = document.createElement("button");
    button.textContent = "Select all";
    button.onclick = () => {
        for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++)
            setSuiteEnabled(suiteIndex, true);

        fixupURL(Suites);
    };
    control.appendChild(button);

    button = document.createElement("button");
    button.textContent = "Unselect all";
    button.onclick = () => {
        for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++)
            setSuiteEnabled(suiteIndex, false);

        fixupURL();
    };
    control.appendChild(button);

    return control;
}

function fixupURL() {
    // If less than all suites are selected then change the URL "Suites" GET parameter
    // to comma separate only the selected
    const selectedSuites = [];
    for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++) {
        if (!Suites[suiteIndex].disabled)
            selectedSuites.push(Suites[suiteIndex].name);
    }
    if (!selectedSuites.length || selectedSuites.length === Suites.length) {
        const url = new URL(window.location.href);
        url.searchParams.delete("suites");
        url.searchParams.delete("suite");
        url.search = decodeURIComponent(url.search);

        // Only push state if changed
        if (url.href !== window.location.href)
            window.history.pushState({}, "", url);

    } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("suite");
        url.searchParams.set("suites", selectedSuites.join(","));
        url.search = decodeURIComponent(url.search);
        window.history.pushState({}, "", url);
    }
}
