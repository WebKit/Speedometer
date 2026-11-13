import { Activity, useCallback, useRef, useState } from "react";
import { fragment, useFragment } from "../store/fragment.js";
import { VIEWER_ID } from "../data/server.js";
import { useRoute } from "../router.jsx";
import Header, { scrollerHandle } from "./header.jsx";
import HomePage from "./home-page.jsx";
import PostDialog from "./post-dialog.jsx";
import ProfilePage from "./profile-page.jsx";
import { LeftRail, RightRail } from "./rails.jsx";
import { BackgroundedContext } from "./measure.js";

const AppViewer = fragment("AppViewer", { id: true, avatar_seed: true });

export default function App() {
    const { page, overlay } = useRoute();
    const viewer = useFragment(AppViewer, VIEWER_ID);
    const scrollerRef = useRef(null);
    const [hasScroller, setHasScroller] = useState(false);
    // Stable, so React never detaches the scroller between renders.
    const attachScroller = useCallback((element) => {
        scrollerRef.current = element;
        scrollerHandle.current = element;
        if (element)
            setHasScroller(true);
    }, []);
    const home = page === "/";
    const profileId = page.startsWith("/profile/") ? page.slice("/profile/".length) : null;
    // Once visited, the home page and its rails stay mounted, hidden while another page
    // is shown, so going back reveals them instead of rebuilding them.
    const [homeMounted, setHomeMounted] = useState(home);
    if (home && !homeMounted)
        setHomeMounted(true);
    const homeMode = home ? "visible" : "hidden";
    // A hidden page is as inert as one under a modal layer.
    const homeBackgrounded = !!overlay || !home;

    return (
        <div className="bg-canvas text-primary flex h-screen flex-col font-sans">
            <BackgroundedContext.Provider value={!!overlay}>
                <Header viewerSeed={viewer ? viewer.avatar_seed : 0} />
                <div className="flex min-h-0 flex-1">
                    {homeMounted
                        && <Activity mode={homeMode}>
                            <BackgroundedContext.Provider value={homeBackgrounded}>
                                <LeftRail />
                            </BackgroundedContext.Provider>
                        </Activity>
                    }
                    <main ref={attachScroller} id="main-scroller" className={`min-w-0 flex-1 ${overlay ? "overflow-hidden" : "overflow-y-auto"} [overflow-anchor:none]`} aria-hidden={overlay ? true : undefined}>
                        {/* Pages mount only once the scroller exists: React attaches <main>'s ref after its
                            children's layout effects, which is where a feed first measures it. A feed can
                            mount in the same commit as <main> whenever the first page of stories beats the
                            first render. */}
                        {hasScroller && homeMounted
                            && <Activity mode={homeMode}>
                                <BackgroundedContext.Provider value={homeBackgrounded}>
                                    <HomePage scrollerRef={scrollerRef} />
                                </BackgroundedContext.Provider>
                            </Activity>
                        }
                        {hasScroller && profileId && <ProfilePage key={profileId} userId={profileId} scrollerRef={scrollerRef} />}
                    </main>
                    {homeMounted
                        && <Activity mode={homeMode}>
                            <BackgroundedContext.Provider value={homeBackgrounded}>
                                <RightRail />
                            </BackgroundedContext.Provider>
                        </Activity>
                    }
                </div>
            </BackgroundedContext.Provider>
            {overlay && <PostDialog key={overlay} storyId={overlay} />}
        </div>
    );
}
