<<<<<<< HEAD
import { Suites, Tags, handleComplexityChange } from "./tests.mjs";
import { params, defaultParams } from "./shared/params.mjs";
||||||| d6b5ffea
import { Suites, Tags } from "./tests.mjs";
import { params, defaultParams } from "./shared/params.mjs";
=======
import { Suites, Tags } from "./tests.mjs";
import { params } from "./shared/params.mjs";
>>>>>>> bb9e3e1ba62e93480643a9d5c515d725e4618562

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
    settings.append(createUIForWarmupSuite());
    settings.append(createUIForWarmupBeforeSync());
    settings.append(createUIForSyncStepDelay());
<<<<<<< HEAD
    settings.append(createUIForComplexity());
||||||| d6b5ffea
=======
    settings.append(createUIForAsyncSteps());
>>>>>>> bb9e3e1ba62e93480643a9d5c515d725e4618562

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
        handleParamsChange();
    };

    const label = document.createElement("label");
    label.append(checkbox, " ", span(labelValue));

    return label;
}

function createUIForIterationCount() {
    return createLinearRangeUI("Iterations: ", "iterationCount", "#", 1, 200);
}

function createUIForWarmupBeforeSync() {
    return createLinearRangeUI("Warmup time: ", "warmupBeforeSync");
}

function createUIForSyncStepDelay() {
    return createLinearRangeUI("Sync step delay: ", "waitBeforeSync");
}

function createUIForComplexity() {
    return createExpRangeUI("Relative complexity: ", "complexity", "x", 0.01, 100, 0.01);
}

function createLinearRangeUI(labelText, paramKey, unit = "ms", min = 0, max = 1000, step = 1) {
    const linearMap = (value) => value;
    const { range, label } = createTimeRangeUI(labelText, paramKey, unit, linearMap, 0);
    range.min = min;
    range.max = max;
    range.step = step;
    range.value = params[paramKey];
    return label;
}

function createExpRangeUI(labelText, paramKey, unit = "ms", min = 0, max = 1000, step = 1) {
    const defaultValue = defaultParams[paramKey];
    const initialValue = params[paramKey];
    const b = defaultValue - 1;
    const a = -Math.log(min - b);
    const logMap = (value) => Math.round((Math.exp(value * a) + b) / step) * step;
    const { range, label } = createTimeRangeUI(labelText, paramKey, unit, logMap, 2);
    range.min = -1;
    range.max = Math.log(max - b) / a;
    range.step = 0.01;
    range.value = Math.log(initialValue - b) / a;
    return label;
}

function createTimeRangeUI(labelText, paramKey, unit = "ms", map, decimals) {
    const range = document.createElement("input");
    range.type = "range";

    const rangeValueAndUnit = document.createElement("span");
    rangeValueAndUnit.className = "range-label-data";

    const rangeValue = document.createElement("span");
    rangeValue.textContent = params[paramKey];
    rangeValueAndUnit.append(rangeValue, " ", unit);

    const label = document.createElement("label");
    label.append(span(labelText), range, rangeValueAndUnit);

    range.oninput = () => {
        rangeValue.textContent = map(Number(range.value)).toFixed(decimals);
    };
    range.onchange = () => {
        params[paramKey] = map(Number(range.value));
        handleParamsChange();
    };

    return { range, label };
}

function createUIForSuites() {
    const control = document.createElement("nav");
    control.className = "suites";
    const checkboxes = [];
    const setSuiteEnabled = (suiteIndex, enabled) => {
        Suites[suiteIndex].disabled = !enabled;
        checkboxes[suiteIndex].checked = enabled;
    };

    control.appendChild(createSuitesGlobalSelectButtons(setSuiteEnabled));

    const ol = document.createElement("ol");
    for (const suite of Suites) {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.id = suite.name;
        checkbox.type = "checkbox";
        checkbox.checked = !suite.disabled;
        checkbox.onchange = () => {
            suite.disabled = !checkbox.checked;
            handleParamsChange();
        };
        checkboxes.push(checkbox);

        const label = document.createElement("label");
        label.append(checkbox, " ", suite.name);
        li.appendChild(label);
        label.onclick = (event) => {
            if (event?.ctrlKey || event?.metaKey) {
                for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++) {
                    if (Suites[suiteIndex] !== suite)
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
        for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++)
            setSuiteEnabled(suiteIndex, true);

        handleParamsChange();
    };
    buttons.appendChild(button);

    button = document.createElement("button");
    button.textContent = "Unselect all";
    button.className = "unselect-all";
    button.onclick = () => {
        for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++)
            setSuiteEnabled(suiteIndex, false);

        handleParamsChange();
    };
    buttons.appendChild(button);
    return buttons;
}

function createSuitesTagsButton(setSuiteEnabled) {
    let tags = document.createElement("div");
    let buttons = tags.appendChild(document.createElement("div"));
    buttons.className = "button-bar";
    let i = 0;
    const kTagsPerLine = 3;
    for (const tag of Tags) {
        if (tag === "all")
            continue;
        if (!(i % kTagsPerLine)) {
            buttons = tags.appendChild(document.createElement("div"));
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
            for (let suiteIndex = 0; suiteIndex < Suites.length; suiteIndex++) {
                let enabled = Suites[suiteIndex].tags.includes(selectedTag);
                if (invertSelection)
                    enabled = !enabled;
                if (extendSelection && !enabled)
                    continue;
                setSuiteEnabled(suiteIndex, enabled);
            }
            handleParamsChange();
        };
        buttons.appendChild(button);
    }
    return tags;
}

function createUIForRun() {
    const stepTestButton = document.createElement("button");
    stepTestButton.textContent = "Step Test \u23EF";
    stepTestButton.onclick = (event) => {
        globalThis.benchmarkClient.step();
    };
    const startTestButton = document.createElement("button");
    startTestButton.textContent = "Start Test \u23F5";
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
    const selectedSuites = Suites.filter((suite) => !suite.disabled);
    if (!selectedSuites.length)
        return;

    // Try finding common tags that would result in the current suite selection.
    let commonTags = new Set(selectedSuites[0].tags);
    for (const suite of Suites) {
        if (suite.disabled)
            suite.tags.forEach((tag) => commonTags.delete(tag));
        else
            commonTags = new Set(suite.tags.filter((tag) => commonTags.has(tag)));
    }
    if (selectedSuites.length > 1 && commonTags.size)
        params.tags = [...commonTags];
    else
        params.suites = selectedSuites.map((suite) => suite.name);
}

function updateURL() {
    updateParamsSuitesAndTags();
    handleComplexityChange();

    const url = new URL(window.location.href);
    url.search = params.toSearchParams();
    // Only push state if changed
    if (url.href !== window.location.href)
        window.history.pushState({}, "", url);
}
