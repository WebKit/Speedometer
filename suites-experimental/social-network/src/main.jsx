import { createRoot } from "react-dom/client";
import { VIEWER_ID, lookupUser } from "./data/server.js";
import { hashString } from "./data/rng.js";
import { initLogger } from "./analytics/logger.js";
import { installAutotrack } from "./analytics/autotrack.js";
import { setExperimentViewer } from "./analytics/experiments.js";
import { loadAppChrome, refreshHomeFeed } from "./queries.js";
import { normalize, publish } from "./store/store.js";
import { RouterProvider } from "./router.jsx";
import App from "./components/app.jsx";
import "./styles.css";

initLogger({ userId: VIEWER_ID, sessionSeed: hashString(`session:${VIEWER_ID}`) });
setExperimentViewer(VIEWER_ID);
installAutotrack(document);

// The viewer record ships with the page, the way a server-rendered bootstrap does.
normalize(lookupUser(VIEWER_ID));
publish();

loadAppChrome();
refreshHomeFeed();

createRoot(document.getElementById("root")).render(
    <RouterProvider>
        <App />
    </RouterProvider>
);
