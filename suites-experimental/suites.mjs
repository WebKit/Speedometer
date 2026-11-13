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

// ChatStream-Octane: the streaming chat app in chat-stream/. Its steps follow
// run.mjs in the Octane repository's chat-stream benchmark: event handlers
// only set state, and window.__benchFlush commits it after every interaction.
// No step yields to the event loop before it ends, so every browser paints the
// same number of times.
function chatStreamTests() {
    const flush = async (page) => {
        page.call("__benchFlush");
        await null;
    };
    const typeInto = (element, text) => {
        element.setValue(text);
        element.dispatchEvent("input");
    };
    const sendPrompt = async (page, text) => {
        typeInto(page.querySelector(".prompt"), text);
        await flush(page);
        page.querySelector(".send").click();
        await flush(page);
    };
    // Calls window.deliverChunk until the reply is complete. run.mjs loops
    // while window.__pump(batch) returns a positive remaining count.
    // page.call drops return values, so this checks the DOM instead: the reply
    // loses .streaming in the synchronous commit of its last chunk.
    const drain = async (page) => {
        let guard = 0;
        for (;;) {
            page.call("deliverChunk");
            if (!page.querySelector(".streaming"))
                break;
            await flush(page);
            if (++guard > 10000)
                throw new Error("drain never settled");
        }
        await flush(page);
    };
    const prompts = ["How do I stream a response and render it as it arrives?", "Can you show the same thing with cancellation?", "What should I watch out for with long replies?"];
    return [
        // Sends each prompt in the first conversation in turn and streams its
        // reply to completion.
        new BenchmarkTestStep("StreamReplies", async (page) => {
            for (const text of prompts) {
                await sendPrompt(page, text);
                await drain(page);
            }
        }),
        // Every conversation in turn, then back to the first: each switch
        // unmounts one conversation and mounts and parses the next, up to the
        // 200-message one.
        new BenchmarkTestStep("SwitchConversations", async (page) => {
            const items = page.querySelectorAll(".conversation-item");
            for (let i = 1; i <= items.length; i++) {
                items[i % items.length].click();
                await flush(page);
            }
        }),
        // A reply streamed at the end of the 200-message conversation.
        new BenchmarkTestStep("StreamIntoLongConversation", async (page) => {
            page.querySelector('.conversation-item[data-conversation="3"]').click();
            await flush(page);
            await sendPrompt(page, "Summarize this conversation.");
            await drain(page);
        }),
        // Types a prompt into the controlled composer a character at a time.
        new BenchmarkTestStep("TypePrompt", async (page) => {
            const prompt = page.querySelector(".prompt");
            const text = "Write a function that splits streamed text into Markdown blocks and memoizes each block by its source, then explain how it behaves when a code fence is still open.";
            for (let i = 1; i <= text.length; i++) {
                typeInto(prompt, text.slice(0, i));
                await flush(page);
            }
        }),
    ];
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
        name: "ChatStream-Octane",
        url: "suites-experimental/chat-stream/dist/octane/index.html",
        resources: "suites-experimental/chat-stream/dist/octane/resources.txt",
        tags: ["experimental", "octane", "chat-stream"],
        type: "async",
        async prepare(page) {
            await page.waitForElement(".conversation-item");
        },
        tests: chatStreamTests(),
    },
]);
