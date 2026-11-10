import { useCallback, useRef, useState } from "react";
import { useRecord } from "../store/hooks.js";
import { VIEWER_ID } from "../data/server.js";
import { useRoute } from "../router.jsx";
import Header, { scrollerHandle } from "./header.jsx";
import HomePage from "./home-page.jsx";
import PostDialog from "./post-dialog.jsx";
import ProfilePage from "./profile-page.jsx";
import { LeftRail, RightRail } from "./rails.jsx";

export default function App() {
    const { page, overlay } = useRoute();
    const viewer = useRecord(VIEWER_ID);
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

    return (
        <div className="bg-canvas text-primary flex h-screen flex-col font-sans">
            <Header viewerSeed={viewer ? viewer.avatar_seed : 0} />
            <div className="flex min-h-0 flex-1">
                {home && <LeftRail />}
                <main ref={attachScroller} id="main-scroller" className={`min-w-0 flex-1 ${overlay ? "overflow-hidden" : "overflow-y-auto"} [overflow-anchor:none]`} aria-hidden={overlay ? true : undefined}>
                    {/* Pages mount only once the scroller exists: React attaches <main>'s ref after its
                        children's layout effects, which is where a feed first measures it. A feed can
                        mount in the same commit as <main> whenever the first page of stories beats the
                        first render. */}
                    {hasScroller && home && <HomePage scrollerRef={scrollerRef} />}
                    {hasScroller && profileId && <ProfilePage key={profileId} userId={profileId} scrollerRef={scrollerRef} />}
                </main>
                {home && <RightRail />}
            </div>
            {overlay && <PostDialog key={overlay} storyId={overlay} />}
        </div>
    );
}
