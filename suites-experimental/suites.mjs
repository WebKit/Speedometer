import { BenchmarkTestStep } from "../resources/benchmark-runner.mjs";
import { getTodoText } from "../resources/shared/translations.mjs";
import { getNumberOfItemsToAdd } from "../resources/shared/todomvc-utils.mjs";
import { freezeSuites } from "../resources/suites-helper.mjs";

function reportRecipeCarouselResizeEvents(stepName, resizeEvents) {
    const count = resizeEvents.stop();
    if (count)
        console.warn(`${stepName}: recipe-carousel ResizeObserver reported ${count} width change(s).`);
    else
        console.warn(`${stepName}: recipe-carousel ResizeObserver reported 0 width changes; expected width changes during iframe resize.`);
}

// Yield a task so React's concurrent scheduler lands the pending update before
// the next interaction. A MessageChannel round-trip rather than setTimeout(0):
// an async step is awaited inside the measured window (see
// resources/shared/step-runner.mjs), so the timer clamp would be reported as
// workload time.
//
// One channel for the whole run, so the measured window doesn't pay for
// creating and tearing down a channel per yield. Created on first use: an
// open port with a listener would keep Node alive when the unittests import
// this module.
let yieldChannel = null;
const pendingYields = [];
function yieldTask() {
    if (!yieldChannel) {
        yieldChannel = new MessageChannel();
        yieldChannel.port1.onmessage = () => pendingYields.shift()();
    }
    return new Promise((resolve) => {
        pendingYields.push(resolve);
        yieldChannel.port2.postMessage(0);
    });
}

// Lets React commit an interaction before the next one.
async function stormboxSettle() {
    await yieldTask();
}

// The message list is virtualized: only rendered rows can be targeted, and
// the rendered window depends on where earlier steps left the scroll.
function stormboxRow(page, n) {
    return page.querySelectorAll(".msg-list__items li")[n];
}

// Resolves on the next `name` event from the workload, which it fires once the result
// of an interaction has committed. Register before triggering the interaction.
function waitForAppEvent(page, name) {
    return new Promise((resolve) => page.addEventListener(name, resolve, { once: true }));
}

// React commits an update made in a discrete event from a microtask. When the step
// dispatches the event itself, that microtask only runs once the step yields.
function commitPendingUpdates() {
    return new Promise((resolve) => queueMicrotask(resolve));
}

// Types `text` one key at a time, starting after the first `typed` characters. Each
// key commits before the next, as it does when a person types.
async function typeInto(field, text, typed = 0) {
    for (let i = typed + 1; i <= text.length; i++) {
        const key = text[i - 1];
        field.dispatchKeyEvent("keydown", key.charCodeAt(0), key);
        field.setValue(text.slice(0, i));
        field.dispatchEvent("input");
        field.dispatchKeyEvent("keyup", key.charCodeAt(0), key);
        await commitPendingUpdates();
    }
}

// Pages of five stories and of ten comments, scaled with the complexity param.
function getNumberOfFeedPages() {
    return Math.max(1, Math.round(getNumberOfItemsToAdd() / 25));
}

function getNumberOfCommentPages() {
    return Math.max(1, Math.round(getNumberOfItemsToAdd() / 34));
}

export const ExperimentalSuites = freezeSuites([
    {
        name: "TodoMVC-LocalStorage",
        url: "suites-experimental/todomvc-localstorage/dist/index.html",
        resources: "suites-experimental/todomvc-localstorage/dist/resources.txt",
        tags: ["todomvc", "experimental"],
        async prepare(page) {
            (await page.waitForElement(".new-todo")).focus();
            page.getLocalStorage().getItem("javascript-es5");
        },
        tests: [
            new BenchmarkTestStep(`Adding${getNumberOfItemsToAdd()}Items`, (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText("ja", i));
                    newTodo.dispatchEvent("change");
                    newTodo.enter("keypress");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const checkboxes = page.querySelectorAll(".toggle");
                for (let i = 0; i < numberOfItemsToAdd; i++)
                    checkboxes[i].click();
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const deleteButtons = page.querySelectorAll(".destroy");
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                    deleteButtons[i].click();
            }),
        ],
    },
    {
        name: "TodoMVC-Emoji",
        url: "suites/todomvc/vanilla-examples/javascript-web-components/dist/index.html",
        resources: "suites/todomvc/vanilla-examples/javascript-web-components/dist/resources.txt",
        tags: ["todomvc", "experimental"],
        async prepare(page) {
            await page.waitForElement("todo-app");
        },
        tests: [
            new BenchmarkTestStep(`Adding${getNumberOfItemsToAdd()}Items`, (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const input = page.querySelector(".new-todo-input", ["todo-app", "todo-topbar"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    input.setValue(getTodoText("emoji", i));
                    input.dispatchEvent("input");
                    input.enter("keyup");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const items = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    const item = items[i].querySelectorInShadowRoot(".toggle-todo-input");
                    item.click();
                }
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const items = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--) {
                    const item = items[i].querySelectorInShadowRoot(".remove-todo-button");
                    item.click();
                }
            }),
        ],
    },
    {
        name: "TodoMVC-WebComponents-PostMessage",
        url: "suites/todomvc/vanilla-examples/javascript-web-components/dist/index.html",
        resources: "suites/todomvc/vanilla-examples/javascript-web-components/dist/resources.txt",
        tags: ["experimental", "todomvc", "webcomponents"],
        async prepare() {},
        type: "remote",
        /* config: {
            name: "default", // optional param to target non-default tests locally
        }, */
    },
    {
        name: "TodoMVC-Jaspr-Dart2JS-O4",
        url: "suites-experimental/todomvc-dart-jaspr/dist/out-dart2js-O4/index.html",
        resources: "suites-experimental/todomvc-dart-jaspr/dist/out-dart2js-O4/resources.txt",
        tags: ["todomvc", "experimental"],
        async prepare(page) {
            (await page.waitForElement(".new-todo")).focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${getNumberOfItemsToAdd()}Items`, (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText("ja", i));
                    newTodo.dispatchEvent("change");
                    newTodo.enter("keypress");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const checkboxes = page.querySelectorAll(".toggle");
                for (let i = 0; i < numberOfItemsToAdd; i++)
                    checkboxes[i].click();
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const deleteButtons = page.querySelectorAll(".destroy");
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                    deleteButtons[i].click();
            }),
        ],
    },
    {
        name: "TodoMVC-Jaspr-Dart2Wasm-O2",
        url: "suites-experimental/todomvc-dart-jaspr/dist/out-dart2wasm-O2/index.html",
        resources: "suites-experimental/todomvc-dart-jaspr/dist/out-dart2wasm-O2/resources.txt",
        tags: ["todomvc", "experimental"],
        disabled: true,
        async prepare(page) {
            (await page.waitForElement(".new-todo")).focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${getNumberOfItemsToAdd()}Items`, (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText("ja", i));
                    newTodo.dispatchEvent("change");
                    newTodo.enter("keypress");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const checkboxes = page.querySelectorAll(".toggle");
                for (let i = 0; i < numberOfItemsToAdd; i++)
                    checkboxes[i].click();
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const numberOfItemsToAdd = getNumberOfItemsToAdd();
                const deleteButtons = page.querySelectorAll(".destroy");
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                    deleteButtons[i].click();
            }),
        ],
    },
    {
        name: "NewsSite-PostMessage",
        url: "suites/newssite/news-next/dist/index.html",
        resources: "suites/newssite/news-next/dist/resources.txt",
        tags: ["experimental", "newssite", "language"],
        async prepare() {},
        type: "remote",
        /* config: {
          name: "default", // optional param to target non-default tests locally
        }, */
    },
    {
        name: "TodoMVC-WebComponents-IndexedDB",
        url: "suites-experimental/javascript-wc-indexeddb/dist/index.html?useAsyncSteps=true&storageType=vanilla",
        resources: "suites-experimental/javascript-wc-indexeddb/dist/resources.txt",
        tags: ["todomvc", "webcomponents", "experimental"],
        async prepare() {},
        type: "remote",
        /* config: {
          name: "default", // optional param to target non-default tests locally
        }, */
    },
    {
        name: "TodoMVC-WebComponents-DexieJS",
        url: "suites-experimental/javascript-wc-indexeddb/dist/index.html?useAsyncSteps=true&storageType=dexie",
        resources: "suites-experimental/javascript-wc-indexeddb/dist/resources.txt",
        tags: ["todomvc", "webcomponents", "experimental"],
        async prepare() {},
        type: "remote",
        /* config: {
          name: "default", // optional param to target non-default tests locally
        }, */
    },
    {
        name: "Responsive-Design",
        url: "suites-experimental/responsive-design/dist/index.html",
        resources: "suites-experimental/responsive-design/dist/resources.txt",
        tags: ["responsive-design", "webcomponents", "experimental"],
        type: "async",
        async prepare(page) {
            await page.waitForElement("cooking-app");
        },
        tests: [
            new BenchmarkTestStep("LoadChatAndExpandRecipes", async (page) => {
                const resumePreviousChatBtn = page.querySelector("#resume-previous-chat-btn", ["cooking-app", "chat-window"]);
                resumePreviousChatBtn.click();
                page.layout();

                const nextRestaurantBtn = page.querySelector("#next-restaurant-btn", ["cooking-app", "information-window"]);
                const restaurantCards = page.querySelectorAll("restaurant-card", ["cooking-app", "information-window"]);
                const numOfRestaurantCards = restaurantCards.length - 1;
                for (let i = 0; i < numOfRestaurantCards; i++) {
                    nextRestaurantBtn.click();
                    page.layout();
                }

                const showMoreBtn = page.querySelectorAll(".show-more-btn", ["cooking-app", "main-content", "recipe-grid"]);
                for (const btn of showMoreBtn) {
                    btn.click();
                    page.layout();
                }
            }),
            new BenchmarkTestStep("ReduceWidthIn5Steps", async (page) => {
                const widths = [768, 704, 640, 560, 480];
                const MATCH_MEDIA_QUERY_BREAKPOINT = 640;
                const carouselResizeEvents = await page.querySelector(".carousel", ["cooking-app", "main-content", "recipe-carousel"]).observeResizeEvents();

                // The matchMedia query is "(max-width: 640px)"
                // Starting from a width > 640px, we'll only get 1 event when crossing to <= 640px
                // This happens when the width changes from 704px to 640px
                const resizeWorkPromise = new Promise((resolve) => {
                    page.addEventListener("resize-work-complete", resolve, { once: true });
                });

                for (const width of widths) {
                    page.setWidth(width);
                    page.layout();
                    if (width === MATCH_MEDIA_QUERY_BREAKPOINT)
                        await resizeWorkPromise;
                }

                await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                reportRecipeCarouselResizeEvents("ReduceWidthIn5Steps", carouselResizeEvents);
            }),
            new BenchmarkTestStep("ScrollToChatAndSendMessages", async (page) => {
                const cvWorkComplete = new Promise((resolve) => {
                    page.addEventListener("video-grid-content-visibility-complete", resolve, { once: true });
                });

                const nextItemBtn = page.querySelector("#next-item-carousel-btn", ["cooking-app", "main-content", "recipe-carousel"]);
                const recipeCarouselItems = page.querySelectorAll(".carousel-item", ["cooking-app", "main-content", "recipe-carousel"]);
                const numOfCarouselItems = recipeCarouselItems.length - 3;
                for (let i = 0; i < numOfCarouselItems; i++) {
                    nextItemBtn.click();
                    page.layout();
                }

                // Collapse recipes
                const showMoreBtnCollapse = page.querySelectorAll(".show-more-btn", ["cooking-app", "main-content", "recipe-grid"]);
                for (const btn of showMoreBtnCollapse) {
                    btn.click();
                    page.layout();
                }

                const chatWindow = page.querySelector("#chat-window", ["cooking-app", "chat-window"]);
                chatWindow.scrollIntoView({ behavior: "instant" });
                page.layout();

                const messagesToBeSent = ["Please generate an image of Tomato Soup.", "Try again, but make the soup look thicker.", "Try again, but make the soup served in a rustic bowl and include a sprinkle of fresh herbs on top."];
                const chatInput = page.querySelector("#chat-input", ["cooking-app", "chat-window"]);
                for (const message of messagesToBeSent) {
                    chatInput.setValue(message);
                    chatInput.dispatchEvent("input");
                    chatInput.enter("keydown");
                    page.layout();
                }

                // Safari can overscroll the chat element here and never send the
                // video grid's contentvisibilityautostatechange event. See
                // https://github.com/WebKit/Speedometer/issues/525. Remove this
                // fallback once Speedometer CI runs a Safari with that WebKit fix.
                await Promise.race([cvWorkComplete, new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))]);
            }),
            new BenchmarkTestStep("IncreaseWidthIn5Steps", async (page) => {
                const widths = [560, 640, 704, 768, 800];
                const MATCH_MEDIA_QUERY_BREAKPOINT = 704;
                const carouselResizeEvents = await page.querySelector(".carousel", ["cooking-app", "main-content", "recipe-carousel"]).observeResizeEvents();

                // The matchMedia query is "(max-width: 640px)"
                // Starting from a width <= 640px, we'll get 1 event when crossing back to > 640px.
                // This happens when the width changes from 640px to 704px.
                const resizeWorkPromise = new Promise((resolve) => {
                    page.addEventListener("resize-work-complete", resolve, { once: true });
                });

                for (const width of widths) {
                    page.setWidth(width);
                    page.layout();
                    if (width === MATCH_MEDIA_QUERY_BREAKPOINT)
                        await resizeWorkPromise;
                }

                await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                reportRecipeCarouselResizeEvents("IncreaseWidthIn5Steps", carouselResizeEvents);
            }),
        ],
    },
    {
        name: "ChatRoom-React",
        url: "suites-experimental/chat-room/dist/index.html",
        resources: "suites-experimental/chat-room/dist/resources.txt",
        tags: ["chat-room", "experimental"],
        type: "async",
        async prepare(page) {
            await page.waitForElement(".room-list-item");
        },
        tests: [
            // Each offset mounts a fresh set of rows, measures them, and corrects
            // the scroll position against what they measured. The scroll event is
            // dispatched by hand because waiting for the browser's would put a
            // frame inside the measured window.
            new BenchmarkTestStep("ScrollTimeline", async (page) => {
                const timeline = page.querySelector("#timeline");
                const viewportHeight = timeline.clientHeight;

                const scrollTo = async (offset) => {
                    timeline.scrollTop = offset;
                    timeline.dispatchEvent("scroll");
                    await yieldTask();
                    page.layout();
                };

                // A viewport at a time, from the newest message: the windows
                // overlap, so rows are recycled and measured heights reused.
                // Relative to the current offset rather than to scrollHeight,
                // because the total height moves as rows are measured.
                const pages = 10;
                for (let i = 0; i < pages; i++)
                    await scrollTo(timeline.scrollTop - viewportHeight);

                // Then long strides, the way dragging the scrollbar does: every
                // stride lands on rows that have only ever been estimated, so the
                // window is replaced outright. Stops one stride short of the top,
                // so it does not trip the prefetch LoadOlderMessages measures.
                const strides = 10;
                for (let i = strides - 1; i >= 1; i--)
                    await scrollTo(((timeline.scrollHeight - viewportHeight) * i) / (strides - 1));

                // Back to the newest message, where the next step expects to start.
                await scrollTo(timeline.scrollHeight);
            }),
            new BenchmarkTestStep("SwitchRooms", async (page) => {
                const rooms = page.querySelectorAll(".room-list-item");
                const iterations = 20;
                // Starts past room 0, which is already open: clicking it commits nothing.
                for (let i = 1; i <= iterations; i++) {
                    rooms[i % rooms.length].click();
                    await yieldTask();
                    page.layout();
                }
            }),
            // Reading past the start of the loaded history inserts a page *above*
            // the viewport, the case browsers ship scroll anchoring for. The
            // timeline anchors by hand instead, so overflow-anchor is off. Each
            // iteration also crosses the page the previous one prepended.
            new BenchmarkTestStep("LoadOlderMessages", async (page) => {
                const timeline = page.querySelector("#timeline");
                const pages = 5;
                for (let i = 0; i < pages; i++) {
                    timeline.scrollTop = 0;
                    timeline.dispatchEvent("scroll");
                    await yieldTask();
                    page.layout();
                }
            }),
        ],
    },
    {
        name: "Timeline-Mithril",
        url: "suites-experimental/timeline/dist/index.html",
        tags: ["experimental", "timeline", "mithril"],
        async prepare(page) {
            await page.waitForElement("#app-container");
        },
        tests: [
            new BenchmarkTestStep("Start", (page) => {
                const btn = page.querySelector("#btn-explore");
                if (btn) {
                    btn.click();
                    page.layout();
                }
            }),
            new BenchmarkTestStep("SearchTimeline", (page) => {
                const btn = page.querySelector("#btn-explore");
                if (btn) {
                    btn.click();
                    page.layout();
                }
                const searchInput = page.querySelector("input.search-input");
                if (!searchInput)
                    return;
                const queries = ["", "I", "Int", "Inte", "Intel", "", "A", "App", "Appl", "Apple", "", "C", "Comp", "Comput", "Computer"];
                for (let round = 0; round < 2; round++) {
                    for (const q of queries) {
                        searchInput.setValue(q);
                        searchInput.dispatchEvent("input");
                        page.layout();
                    }
                }
            }),
            new BenchmarkTestStep("FilterByCategory", (page) => {
                const btn = page.querySelector("#btn-explore");
                if (btn) {
                    btn.click();
                    page.layout();
                }
                const filterPills = page.querySelectorAll(".filter-pill");
                if (!filterPills || filterPills.length === 0)
                    return;
                const count = Math.min(filterPills.length, 7);
                for (let round = 0; round < 4; round++) {
                    for (let i = 0; i < count; i++) {
                        filterPills[i].click();
                        page.layout();
                    }
                }
            }),
            new BenchmarkTestStep("SwitchLanguage", (page) => {
                const btn = page.querySelector("#btn-explore");
                if (btn) {
                    btn.click();
                    page.layout();
                }
                const langButtons = page.querySelectorAll(".lang-selector button.lang-btn");
                if (langButtons && langButtons.length > 2) {
                    for (let round = 0; round < 7; round++) {
                        langButtons[1].click();
                        page.layout();
                        langButtons[2].click();
                        page.layout();
                        langButtons[0].click();
                        page.layout();
                    }
                }
            }),
            new BenchmarkTestStep("ScrollTimeline", (page) => {
                const btn = page.querySelector("#btn-explore");
                if (btn) {
                    btn.click();
                    page.layout();
                }
                for (let i = 0; i < 2; i++) {
                    page.call("stepScrollTimeline");
                    page.layout();
                }
            }),
        ],
    },
    {
        name: "Stormbox-React",
        // animations=off drops CSS transitions and the reading pane's wait for
        // the folder list to slide away (both 360ms), so they cannot spill into
        // a later measurement. Layout still follows the 800px viewport: opening
        // a message hides the folder list, closing it brings it back.
        url: "suites-experimental/stormbox-react/dist/index.html?animations=off",
        resources: "suites-experimental/stormbox-react/dist/resources.txt",
        tags: ["experimental", "react", "webmail"],
        type: "async",
        async prepare(page) {
            await page.waitForElement(".msg-list__items li");
        },
        tests: [
            new BenchmarkTestStep("SwitchFolders", async (page) => {
                const folder = (id) => page.querySelector(`.folder-node[data-folder-id="${id}"] .folder-node__button`);
                const toggle = (id) => page.querySelector(`.folder-node[data-folder-id="${id}"] .folder-node__toggle`);
                // Archive and Newsletters are the large folders; Projects and
                // Open source expand to reach their subfolders; Starred is a tag
                // view built by scanning every message.
                const clicks = [
                    () => folder(5),
                    () => folder(20),
                    () => folder(4),
                    () => toggle(10),
                    () => folder(11),
                    () => toggle(26),
                    () => folder(27),
                    () => toggle(26),
                    () => toggle(10),
                    () => page.querySelector('[data-tag-view="$flagged"] button'),
                    () => folder(21),
                    () => folder(1),
                ];
                for (const target of clicks) {
                    target().click();
                    await stormboxSettle();
                }
            }),
            // The list is virtualized at a fixed row height, so every offset
            // replaces the rendered rows. The scroll event is dispatched by hand,
            // as in ChatRoom-React, to keep a frame out of the measured window.
            new BenchmarkTestStep("ScrollMessageList", async (page) => {
                const scroller = page.querySelector(".msg-list__scroller");
                const viewportHeight = scroller.clientHeight;
                const scrollTo = async (offset) => {
                    scroller.scrollTop = offset;
                    scroller.dispatchEvent("scroll");
                    await stormboxSettle();
                };
                for (let i = 1; i <= 10; i++)
                    await scrollTo(i * viewportHeight);
                const strides = 10;
                for (let i = 1; i <= strides; i++)
                    await scrollTo(((scroller.scrollHeight - viewportHeight) * i) / strides);
                await scrollTo(0);
            }),
            // The first message is opened by click, the next 15 with J (next
            // message). Plain text renders inline; HTML goes through DOMPurify,
            // dark-mode adaptation and a sandboxed srcdoc iframe.
            //
            // The cursor follow (TanStack Virtual's scrollToIndex) re-applies its
            // target on later frames until it settles, even across other
            // scrolls; Back changes the row heights and so the target. Home makes
            // row 0 the last target, whose offset stays 0, so the list is at the
            // top for the next step and a late re-application changes nothing.
            new BenchmarkTestStep("ReadMessages", async (page) => {
                const J_KEY = 74;
                const HOME_KEY = 36;
                stormboxRow(page, 0).querySelector(".msg-list__open").click();
                await stormboxSettle();
                const scroller = page.querySelector(".msg-list__scroller");
                for (let i = 0; i < 5; i++) {
                    scroller.dispatchKeyEvent("keydown", J_KEY, "j");
                    await stormboxSettle();
                }
                scroller.dispatchKeyEvent("keydown", HOME_KEY, "Home");
                await stormboxSettle();
                page.querySelector(".message-view__action--back").click();
                await stormboxSettle();
            }),
            // The row overlay's star and tag buttons; the tag button opens the
            // tag menu as a popover, toggles Work, and closes it again.
            new BenchmarkTestStep("StarAndTagMessages", async (page) => {
                const row = (index) => page.querySelector(`.msg-list__items li[data-index="${index}"]`);
                for (let i = 0; i < 5; i++) {
                    row(i).querySelector(".msg-list__action--star").click();
                    await stormboxSettle();
                }
                for (let i = 0; i < 3; i++) {
                    row(i).querySelector(".msg-list__action--tag").click();
                    await stormboxSettle();
                    page.querySelector('[data-tag-picker-popover] [data-tag-keyword="$label2"]').click();
                    await stormboxSettle();
                    row(i).querySelector(".msg-list__action--tag").click();
                    await stormboxSettle();
                }
            }),
            // Select all checks every Inbox message, so each bulk action
            // rewrites the whole folder.
            new BenchmarkTestStep("BulkActions", async (page) => {
                const clicks = [
                    ".msg-list__select-all input",
                    '[data-bulk-action="mark-read"]',
                    '[data-bulk-action="toggle-star"]',
                    '[data-bulk-action="toggle-star"]',
                    ".msg-list__bulk-action--tag",
                    '.tag-picker-dropdown__menu [data-tag-keyword="$label4"]',
                    ".msg-list__bulk-action--tag",
                    ".selectable-list-header__clear",
                ];
                for (const selector of clicks) {
                    page.querySelector(selector).click();
                    await stormboxSettle();
                }
            }),
            new BenchmarkTestStep("QuickFilter", async (page) => {
                const input = page.querySelector(".quick-filter__input");
                const query = "renderer";
                for (let i = 1; i <= query.length; i++) {
                    input.setValue(query.slice(0, i));
                    input.dispatchEvent("input");
                    await stormboxSettle();
                }
                for (let i = query.length - 1; i >= 0; i--) {
                    input.setValue(query.slice(0, i));
                    input.dispatchEvent("input");
                    await stormboxSettle();
                }
            }),
            // Removing checked rows opens their neighbour, as Stormbox does,
            // and the next checkbox closes it again.
            new BenchmarkTestStep("ArchiveAndDelete", async (page) => {
                const selectRows = async (count) => {
                    for (let i = 0; i < count; i++) {
                        stormboxRow(page, i).querySelector(".msg-list__check input").click();
                        await stormboxSettle();
                    }
                };
                const clicks = async (...selectors) => {
                    for (const selector of selectors) {
                        page.querySelector(selector).click();
                        await stormboxSettle();
                    }
                };
                await selectRows(5);
                await clicks('[data-bulk-action="archive"]');
                await selectRows(5);
                await clicks('[data-bulk-action="delete"]', ".message-view__action--back");
                // Trash now holds the deleted rows; emptying it removes them for good.
                await clicks('.folder-node[data-folder-id="7"] .folder-node__button', ".msg-list__select-all input", '[data-bulk-action="delete"]');
                await clicks('.folder-node[data-folder-id="1"] .folder-node__button');
            }),
            // Reply loads the quoted message into the Squire editor; a new
            // message (the C shortcut: the open message hides the sidebar)
            // commits a typed recipient as a pill. Both are sent.
            new BenchmarkTestStep("ComposeAndSend", async (page) => {
                const ENTER_KEY = 13;
                const C_KEY = 67;
                for (let i = 0; i < 2; i++) {
                    stormboxRow(page, i).querySelector(".msg-list__open").click();
                    await stormboxSettle();
                    page.querySelector('.message-view__action[aria-label="Reply"]').click();
                    await stormboxSettle();
                    page.querySelector(".compose-dialog--expanded .compose-send").click();
                    await stormboxSettle();

                    page.querySelector(".msg-list__scroller").dispatchKeyEvent("keydown", C_KEY, "c");
                    await stormboxSettle();
                    const to = page.querySelector("#compose-to");
                    to.setValue(`Priya García <pgarcia${i}@tailspin.example>`);
                    to.dispatchEvent("input");
                    to.dispatchKeyEvent("keydown", ENTER_KEY, "Enter");
                    await stormboxSettle();
                    const subject = page.querySelector("#compose-subject");
                    subject.setValue(`Quarterly numbers, part ${i + 1}`);
                    subject.dispatchEvent("input");
                    await stormboxSettle();
                    page.querySelector(".compose-dialog--expanded .compose-send").click();
                    await stormboxSettle();
                }
                page.querySelector(".message-view__action--back").click();
                await stormboxSettle();
            }),
            // Each theme switch restyles the page and re-adapts the open HTML
            // newsletter for the new color scheme.
            new BenchmarkTestStep("ToggleTheme", async (page) => {
                page.querySelector('.folder-node[data-folder-id="20"] .folder-node__button').click();
                await stormboxSettle();
                stormboxRow(page, 0).querySelector(".msg-list__open").click();
                await stormboxSettle();
                for (let i = 0; i < 2; i++) {
                    page.querySelector(".theme-toggle").click();
                    await stormboxSettle();
                }
                page.querySelector(".message-view__action--back").click();
                await stormboxSettle();
            }),
        ],
    },
    {
        name: "Terminal-Xterm",
        url: "suites-experimental/terminal-xterm/dist/index.html",
        resources: "suites-experimental/terminal-xterm/dist/resources.txt",
        tags: ["terminal", "xterm", "experimental"],
        type: "async",
        async prepare(page) {
            await page.waitForElement('#terminal-container[data-fonts-ready="true"]');
        },
        tests: [
            new BenchmarkTestStep("InitTerminals", async (page) => {
                const stepComplete = new Promise((resolve) => {
                    page.addEventListener("step-complete", resolve, { once: true });
                });
                page.querySelector("#btn-init").click();
                await stepComplete;
            }),
            new BenchmarkTestStep("DumpAndScrollOutput", async (page) => {
                const stepComplete = new Promise((resolve) => {
                    page.addEventListener("step-complete", resolve, { once: true });
                });
                page.querySelector("#btn-dump-scroll").click();
                await stepComplete;
            }),
            new BenchmarkTestStep("ParseAndHoverInlineLinks", async (page) => {
                const stepComplete = new Promise((resolve) => {
                    page.addEventListener("step-complete", resolve, { once: true });
                });
                page.querySelector("#btn-hover-links").click();
                await stepComplete;
            }),
            new BenchmarkTestStep("NcursesColorUI", async (page) => {
                const stepComplete = new Promise((resolve) => {
                    page.addEventListener("step-complete", resolve, { once: true });
                });
                page.querySelector("#btn-ncurses").click();
                await stepComplete;
            }),
            new BenchmarkTestStep("SwitchTabsAndResize", async (page) => {
                const stepComplete = new Promise((resolve) => {
                    page.addEventListener("step-complete", resolve, { once: true });
                });
                page.querySelector("#btn-switch-tabs").click();
                await stepComplete;
            }),
        ],
    },
    {
        name: "Tools-GPS-Tracks-Angular",
        url: "suites-experimental/tools-gps-tracks-angular/dist/index.html",
        resources: "suites-experimental/tools-gps-tracks-angular/dist/resources.txt",
        tags: ["experimental", "charts", "gpx"],
        type: "async",
        async prepare(page) {
            await page.waitForElement("#app-is-ready");
        },
        tests: [
            new BenchmarkTestStep("LoadAndParseFiles", async (page) => {
                const complete = new Promise((resolve) => {
                    page.addEventListener("load-and-parse-complete", resolve, { once: true });
                });
                page.querySelector("#btn-step-load").click();
                await complete;
                page.layout();
            }),
            new BenchmarkTestStep("DisplayAnalysisMetrics", async (page) => {
                const complete = new Promise((resolve) => {
                    page.addEventListener("analysis-complete", resolve, { once: true });
                });
                page.querySelector("#btn-step-analysis").click();
                await complete;
                page.layout();
            }),
            new BenchmarkTestStep("DisplayInsights", async (page) => {
                const complete = new Promise((resolve) => {
                    page.addEventListener("insights-complete", resolve, { once: true });
                });
                page.querySelector("#btn-step-insights").click();
                await complete;
                page.layout();
            }),
            new BenchmarkTestStep("DisplayDetails", async (page) => {
                const complete = new Promise((resolve) => {
                    page.addEventListener("details-complete", resolve, { once: true });
                });
                page.querySelector("#btn-step-details").click();
                await complete;
                page.layout();
            }),
            new BenchmarkTestStep("DisplayAggregateMetrics", async (page) => {
                const complete = new Promise((resolve) => {
                    page.addEventListener("aggregate-complete", resolve, { once: true });
                });
                page.querySelector("#btn-step-aggregate").click();
                await complete;
                page.layout();
            }),
            new BenchmarkTestStep("DisplayEvolutionMetrics", async (page) => {
                const complete = new Promise((resolve) => {
                    page.addEventListener("evolution-complete", resolve, { once: true });
                });
                page.querySelector("#btn-step-evolution").click();
                await complete;
                page.layout();
            }),
            new BenchmarkTestStep("DisplayCourses", async (page) => {
                const complete = new Promise((resolve) => {
                    page.addEventListener("courses-complete", resolve, { once: true });
                });
                page.querySelector("#btn-step-courses").click();
                await complete;
                page.layout();
            }),
        ],
    },
    {
        name: "SocialNetwork-React",
        url: "suites-experimental/social-network/dist/index.html",
        resources: "suites-experimental/social-network/dist/resources.txt",
        tags: ["social-network", "experimental"],
        type: "async",
        async prepare(page) {
            await page.waitForElement('.home[data-feed-status="ready"]');
        },
        tests: [
            new BenchmarkTestStep("RefreshHomeFeed", async (page) => {
                const refreshed = waitForAppEvent(page, "home-feed-refreshed");
                page.querySelector("#tab-home").click();
                await refreshed;
            }),
            // Reads down the feed one story at a time, the way a reader scrolls: each
            // offset mounts the story it lands on and collapses the ones left behind.
            // Reaching the end asks for the next page. The scroll event is dispatched by
            // hand, so no frame lands inside the measured window.
            new BenchmarkTestStep("LoadMoreStories", async (page) => {
                const scroller = page.querySelector("#main-scroller");
                let index = 0;
                for (let i = 0; i < getNumberOfFeedPages(); i++) {
                    const loaded = waitForAppEvent(page, "feed-page-loaded");
                    const units = page.querySelectorAll(".feed-unit");
                    for (; index < units.length; index++) {
                        units[index].scrollIntoView({ block: "start", behavior: "instant" });
                        scroller.dispatchEvent("scroll");
                        page.layout();
                    }
                    await loaded;
                }
            }),
            // Scrolls back up to the top, expanding every truncated story on the way.
            new BenchmarkTestStep("ExpandStoryTexts", async (page) => {
                const scroller = page.querySelector("#main-scroller");
                const units = page.querySelectorAll(".feed-unit");
                for (let i = units.length - 1; i >= 0; i--) {
                    units[i].scrollIntoView({ block: "start", behavior: "instant" });
                    scroller.dispatchEvent("scroll");
                    const readMore = units[i].querySelector(".read-more");
                    if (readMore) {
                        readMore.click();
                        await commitPendingUpdates();
                        page.layout();
                    }
                }
            }),
            new BenchmarkTestStep("OpenPostDialog", async (page) => {
                const ready = waitForAppEvent(page, "post-dialog-ready");
                page.querySelector('[data-unit-live] .story-comments-button[data-thread="busy"]').click();
                await ready;
            }),
            new BenchmarkTestStep("ExpandCommentReplies", async (page) => {
                const buttons = page.querySelectorAll("#post-dialog .view-replies");
                for (const button of buttons) {
                    const loaded = waitForAppEvent(page, "replies-loaded");
                    button.click();
                    await loaded;
                    page.layout();
                }
            }),
            new BenchmarkTestStep("ChangeCommentOrder", async (page) => {
                page.querySelector("#comment-order").click();
                await commitPendingUpdates();
                page.layout();
                const reordered = waitForAppEvent(page, "comments-reordered");
                page.querySelector('.comment-order-option[data-order="all"]').click();
                await reordered;
            }),
            new BenchmarkTestStep("LoadMoreComments", async (page) => {
                const body = page.querySelector("#post-dialog-body");
                for (let i = 0; i < getNumberOfCommentPages(); i++) {
                    if (page.querySelector("#post-dialog .comments-end"))
                        break;
                    const loaded = waitForAppEvent(page, "comments-page-loaded");
                    const comments = page.querySelectorAll("#post-dialog-body .comment");
                    comments[comments.length - 1].scrollIntoView({ block: "end", behavior: "instant" });
                    body.dispatchEvent("scroll");
                    await loaded;
                    page.layout();
                }
            }),
            new BenchmarkTestStep("TypeComment", async (page) => {
                const composer = page.querySelector("#comment-composer");
                composer.focus();
                await typeInto(composer, "This brings back so many memories, @an the harbour one is my favourite :) #goldenhour");
                page.layout();
            }),
            new BenchmarkTestStep("ClosePostDialog", async (page) => {
                page.querySelector("#post-dialog-close").click();
                await commitPendingUpdates();
                page.layout();
            }),
            new BenchmarkTestStep("OpenOwnProfile", async (page) => {
                const ready = waitForAppEvent(page, "profile-ready");
                page.querySelector("#rail-profile").click();
                await ready;
                const scroller = page.querySelector("#main-scroller");
                for (const unit of page.querySelectorAll(".feed-unit")) {
                    unit.scrollIntoView({ block: "start", behavior: "instant" });
                    scroller.dispatchEvent("scroll");
                    page.layout();
                }
            }),
            new BenchmarkTestStep("BackToHomeFeed", async (page) => {
                const ready = waitForAppEvent(page, "home-ready");
                page.querySelector("#tab-home").click();
                await ready;
            }),
            // Every keystroke filters the local index and asks the server; the step
            // waits for each answer, the way a typeahead keeps up with typing.
            new BenchmarkTestStep("SearchTypeahead", async (page) => {
                const input = page.querySelector("#search-input");
                const opened = waitForAppEvent(page, "search-ready");
                input.focus();
                input.click();
                await opened;
                const query = "maren quill";
                for (let i = 1; i <= query.length; i++) {
                    const results = waitForAppEvent(page, "search-results");
                    await typeInto(input, query.slice(0, i), i - 1);
                    await results;
                }
                input.dispatchKeyEvent("keydown", 27, "Escape");
                await commitPendingUpdates();
                page.layout();
            }),
            new BenchmarkTestStep("OpenHeaderMenus", async (page) => {
                for (const menu of ["explore", "messages", "notifications", "account"]) {
                    const button = page.querySelector(`#header-${menu}`);
                    const ready = waitForAppEvent(page, "menu-ready");
                    button.click();
                    await ready;
                    page.layout();
                    button.click();
                    await commitPendingUpdates();
                }
            }),
        ],
    },
]);
