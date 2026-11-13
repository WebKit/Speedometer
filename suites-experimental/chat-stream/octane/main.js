import { createRoot, flushSync } from "octane";
import { App } from "./App.tsrx";
import "../shared/styles.css";

createRoot(document.getElementById("root")).render(App);

// Like the Octane fixture of the chat-stream benchmark in the Octane
// repository: the steps call this after every interaction to commit it.
window.__benchFlush = () => flushSync(() => {});
