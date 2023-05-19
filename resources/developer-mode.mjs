import { Suites } from "./tests.mjs";

export function createDeveloperModeContainer() {
    let container = document.createElement("div");
    container.className = "developer-mode";

    let details = document.createElement("details");
    let summary = document.createElement("summary");
    summary.textContent = "Developer Mode";
    details.append(summary);

    let content = document.createElement("div");
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

    for (let suite of Suites) {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.id = suite.name;
        checkbox.type = "checkbox";
        checkbox.checked = !suite.disabled;
        checkbox.onclick = (e) => {
            suite.disabled = !checkbox.checked;
            if (e?.ctrlKey || e?.metaKey) {
                for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++) {
                    if (Suites[suiteIndex] !== suite) {
                        Suites[suiteIndex].disabled = true;
                        checkboxes[suiteIndex].checked = false;
                    } else {
                        Suites[suiteIndex].disabled = false;
                        checkboxes[suiteIndex].checked = true;
                    }
                }
            }
            fixupURL();
        };
        checkboxes.push(checkbox);

        li.appendChild(checkbox);
        var label = document.createElement("label");
        label.appendChild(document.createTextNode(suite.name));
        li.appendChild(label);
        label.htmlFor = checkbox.id;

        ol.appendChild(li);
    }

    control.appendChild(ol);

    let button = document.createElement("button");
    button.textContent = "Select all";
    button.onclick = () => {
        for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++) {
            Suites[suiteIndex].disabled = false;
            checkboxes[suiteIndex].checked = true;
        }
        fixupURL(Suites);
    };
    control.appendChild(button);

    button = document.createElement("button");
    button.textContent = "Unselect all";
    button.onclick = () => {
        for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++) {
            Suites[suiteIndex].disabled = true;
            checkboxes[suiteIndex].checked = false;
        }
        fixupURL();
    };
    control.appendChild(button);

    return control;
}

function fixupURL() {
    // If less than all suites are selected then change the URL "Suites" GET parameter
    // to comma separate only the selected
    let selectedSuites = [];
    for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++) {
        if (!Suites[suiteIndex].disabled)
            selectedSuites.push(Suites[suiteIndex].name);

    }
    if (selectedSuites.length === 0 || selectedSuites.length === Suites.length) {
        let url = new URL(window.location.href);
        url.searchParams.delete("suites");
        url.searchParams.delete("suite");
        url.search = decodeURIComponent(url.search);

        // Only push state if changed
        if (url.href !== window.location.href)
            window.history.pushState({}, "", url);

    } else {
        let url = new URL(window.location.href);
        url.searchParams.delete("suite");
        url.searchParams.set("suites", selectedSuites.join(","));
        url.search = decodeURIComponent(url.search);
        window.history.pushState({}, "", url);
    }
}
