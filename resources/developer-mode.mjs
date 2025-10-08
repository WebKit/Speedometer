import { params, LAYOUT_MODES } from "./shared/params.mjs";
import { benchmarkConfigurator } from "./benchmark-configurator.mjs";

const { suites, tags } = benchmarkConfigurator;

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

    const settings = document.createElement("div");
    settings.className = "settings";
    settings.append(createUIForIterationCount());
    settings.append(createUIForMeasurePrepare());
    settings.append(createUIForWarmupSuite());
    settings.append(createUIForWarmupBeforeSync());
    settings.append(createUIForSyncStepDelay());
    settings.append(createUIForAsyncSteps());
    settings.append(createUIForLayoutMode());

    content.append(document.createElement("hr"));
    content.append(settings);

    content.append(document.createElement("hr"));
    content.append(createUIForRun());

    details.append(content);
    container.append(details);
    return container;
}

function span(text) {
    const span = document.createElement("span");
    span.textContent = text;
    return span;
}

function createUIForWarmupSuite() {
    return createCheckboxUI("Use Warmup Suite", params.useWarmupSuite, (isChecked) => {
        params.useWarmupSuite = isChecked;
    });
}

function createUIForMeasurePrepare() {
    return createCheckboxUI("Measure Prepare", params.measurePrepare, (isChecked) => {
        params.measurePrepare = isChecked;
    });
}

function createUIForAsyncSteps() {
    return createCheckboxUI("Use Async Steps", params.useAsyncSteps, (isChecked) => {
        params.useAsyncSteps = isChecked;
    });
}

function createCheckboxUI(labelValue, initialValue, paramsUpdateCallback) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!initialValue;
    checkbox.onchange = () => {
        paramsUpdateCallback(checkbox.checked);
        updateURL();
    };

    const label = document.createElement("label");
    label.append(checkbox, " ", span(labelValue));

    return label;
}

function createUIForIterationCount() {
    return createTimeRangeUI("Iterations: ", "iterationCount", "#", 1, 200);
}

function createUIForWarmupBeforeSync() {
    return createTimeRangeUI("Warmup time: ", "warmupBeforeSync");
}

function createUIForSyncStepDelay() {
    return createTimeRangeUI("Sync step delay: ", "waitBeforeSync");
}

function createTimeRangeUI(labelText, paramKey, unit = "ms", min = 0, max = 1000) {
    const range = document.createElement("input");
    range.type = "range";
    range.min = min;
    range.max = max;
    range.value = params[paramKey];

    const rangeValueAndUnit = document.createElement("span");
    rangeValueAndUnit.className = "range-label-data";

    const rangeValue = document.createElement("span");
    rangeValue.textContent = params[paramKey];
    rangeValueAndUnit.append(rangeValue, " ", unit);

    const label = document.createElement("label");
    label.append(span(labelText), range, rangeValueAndUnit);

    range.oninput = () => {
        rangeValue.textContent = range.value;
    };
    range.onchange = () => {
        params[paramKey] = parseInt(range.value);
        updateURL();
    };

    return label;
}

function createUIForLayoutMode() {
    return createSelectUI("Force layout mode", params.layoutMode, LAYOUT_MODES, (value) => {
        params.layoutMode = value;
    });
}

function createSelectUI(labelValue, initialValue, choices, paramsUpdateCallback) {
    const select = document.createElement("select");
    select.onchange = () => {
        paramsUpdateCallback(select.value);
        updateURL();
    };

    choices.forEach((choice) => {
        const option = new Option(choice, choice);
        select.add(option);
    });
    select.value = initialValue;

    const label = document.createElement("label");
    label.append(span(labelValue), select);

    return label;
}

function createUIForSuites() {
    const control = document.createElement("nav");
    control.className = "suites";
    const checkboxes = [];
    const setSuiteEnabled = (suiteIndex, enabled) => {
        suites[suiteIndex].enabled = enabled;
        checkboxes[suiteIndex].checked = enabled;
    };

    control.appendChild(createSuitesGlobalSelectButtons(setSuiteEnabled));

    const ol = document.createElement("ol");
    for (const suite of suites) {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.id = suite.name;
        checkbox.type = "checkbox";
        checkbox.checked = suite.enabled;
        checkbox.onchange = () => {
            suite.enabled = checkbox.checked;
            updateURL();
        };
        checkboxes.push(checkbox);

        const label = document.createElement("label");
        label.append(checkbox, " ", suite.name);
        li.appendChild(label);
        label.onclick = (event) => {
            if (event?.ctrlKey || event?.metaKey) {
                for (let suiteIndex = 0; suiteIndex < suites.length; suiteIndex++) {
                    if (suites[suiteIndex] !== suite)
                        setSuiteEnabled(suiteIndex, false);
                    else
                        setSuiteEnabled(suiteIndex, true);
                }
            }
        };

        ol.appendChild(li);
    }
    control.appendChild(ol);
    control.appendChild(createSuitesTagsButton(setSuiteEnabled));
    return control;
}

function createSuitesGlobalSelectButtons(setSuiteEnabled) {
    const buttons = document.createElement("div");
    buttons.className = "button-bar";

    let button = document.createElement("button");
    button.className = "select-all";
    button.textContent = "Select all";
    button.onclick = () => {
        for (let suiteIndex = 0; suiteIndex < suites.length; suiteIndex++)
            setSuiteEnabled(suiteIndex, true);

        updateURL();
    };
    buttons.appendChild(button);

    button = document.createElement("button");
    button.textContent = "Unselect all";
    button.className = "unselect-all";
    button.onclick = () => {
        for (let suiteIndex = 0; suiteIndex < suites.length; suiteIndex++)
            setSuiteEnabled(suiteIndex, false);

        updateURL();
    };
    buttons.appendChild(button);
    return buttons;
}

function createSuitesTagsButton(setSuiteEnabled) {
    let container = document.createElement("div");
    let buttons = container.appendChild(document.createElement("div"));
    buttons.className = "button-bar";
    let i = 0;
    const kTagsPerLine = 3;
    for (const tag of tags) {
        if (tag === "all")
            continue;
        if (!(i % kTagsPerLine)) {
            buttons = container.appendChild(document.createElement("div"));
            buttons.className = "button-bar";
        }
        i++;
        const button = document.createElement("button");
        button.className = "tag";
        button.textContent = `#${tag}`;
        button.dataTag = tag;
        button.onclick = (event) => {
            const extendSelection = event?.shiftKey;
            const invertSelection = event?.ctrlKey || event?.metaKey;
            const selectedTag = event.target.dataTag;
            for (let suiteIndex = 0; suiteIndex < suites.length; suiteIndex++) {
                let enabled = suites[suiteIndex].tags.includes(selectedTag);
                if (invertSelection)
                    enabled = !enabled;
                if (extendSelection && !enabled)
                    continue;
                setSuiteEnabled(suiteIndex, enabled);
            }
            updateURL();
        };
        buttons.appendChild(button);
    }
    return container;
}

function createUIForRun() {
    const stepTestButton = document.createElement("button");
    stepTestButton.className = "step-button";
    stepTestButton.innerHTML = "Step Test<span>\u23EF</span>";
    stepTestButton.onclick = (event) => {
        globalThis.benchmarkClient.step();
    };
    const startTestButton = document.createElement("button");
    startTestButton.innerHTML = "Start Test<span>\u23F5</span>";
    startTestButton.onclick = (event) => {
        globalThis.benchmarkClient.start();
    };
    const buttons = document.createElement("div");
    buttons.className = "button-bar";
    buttons.appendChild(stepTestButton);
    buttons.appendChild(startTestButton);
    return buttons;
}

function updateParamsSuitesAndTags() {
    params.suites = [];
    params.tags = [];

    // If less than all suites are selected then change the URL "Suites" GET parameter
    // to comma separate only the selected
    const selectedSuites = suites.filter((suite) => suite.enabled);
    if (!selectedSuites.length)
        return;

    // Try finding common tags that would result in the current suite selection.
    let commonTags = new Set(selectedSuites[0].tags);
    for (const suite of suites) {
        if (suite.enabled)
            commonTags = new Set(suite.tags.filter((tag) => commonTags.has(tag)));
        else
            suite.tags.forEach((tag) => commonTags.delete(tag));
    }
    if (selectedSuites.length > 1 && commonTags.size)
        params.tags = [...commonTags];
    else
        params.suites = selectedSuites.map((suite) => suite.name);
}

function updateURL() {
    updateParamsSuitesAndTags();

    const url = new URL(window.location.href);
    url.search = params.toSearchParams();
    // Only push state if changed
    if (url.href !== window.location.href)
        window.history.pushState({}, "", url);
}
