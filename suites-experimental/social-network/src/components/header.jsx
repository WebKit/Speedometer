import { useCallback, useRef, useState } from "react";
import { loadQuery, queryKey } from "../store/network.js";
import { useQueryStatus } from "../store/hooks.js";
import { guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { beginInteraction } from "../analytics/perf.js";
import { navigate, useRoute } from "../router.jsx";
import { refreshHomeFeed } from "../queries.js";
import Icon from "./icon.jsx";
import Avatar from "./avatar.jsx";
import Popover from "./popover.jsx";
import SearchBox from "./search-box.jsx";
import { AccountMenu, MainMenu, MessagesMenu, NotificationsMenu } from "./header-menus.jsx";

const TABS = [
    { id: "home", label: "Home" },
    { id: "communities", label: "Communities" },
    { id: "events", label: "Events" },
];

const MENUS = {
    explore: { label: "Explore", icon: "compass", query: null, Component: MainMenu },
    messages: { label: "Messages", icon: "chat", query: "Threads", badge: "messages", Component: MessagesMenu },
    notifications: { label: "Notifications", icon: "bell", query: "Notifications", badge: "notifications", Component: NotificationsMenu },
    account: { label: "Account", icon: null, query: "Account", Component: AccountMenu },
};

export const scrollerHandle = { current: null };

const goHome = guarded("header.home", (page) => {
    if (page === "/") {
        // Home while already home re-ranks the feed and starts from the top.
        beginInteraction("home-feed-refreshed");
        if (scrollerHandle.current)
            scrollerHandle.current.scrollTop = 0;
        refreshHomeFeed();
        return;
    }
    beginInteraction("home-ready");
    navigate("/");
});

function MenuButton({ id, open, onToggle, badge, viewerSeed }) {
    const ref = useRef(null);
    const menu = MENUS[id];
    const close = useCallback(() => onToggle(null), [onToggle]);
    return (
        <div className="relative">
            <button
                ref={ref}
                type="button"
                id={`header-${id}`}
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${open ? "bg-accent-soft text-accent" : "bg-surface-alt text-primary hover:bg-hover"}`}
                aria-label={badge ? `${menu.label}, ${badge} unread` : menu.label}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => onToggle(open ? null : id)}
                data-log={`header_${id}`}
            >
                {menu.icon ? <Icon name={menu.icon} size={20} /> : <Avatar seed={viewerSeed} size={40} label="" />}
                {badge > 0 && <span className="bg-badge-red absolute -right-1 -top-1 min-w-[19px] rounded-full px-1 text-center text-xs font-semibold leading-[19px] text-white">{badge}</span>}
            </button>
            {open
                && <Popover label={menu.label} anchorRef={ref} onClose={close} className="right-0 top-12">
                    <menu.Component />
                </Popover>
            }
        </div>
    );
}

export default function Header({ viewerSeed }) {
    const { page } = useRoute();
    const [openMenu, setOpenMenu] = useState(null);
    const badges = useQueryStatus(queryKey("Shortcuts"));
    const counts = badges && badges.root ? badges.root.badges : { notifications: 0, messages: 0 };

    const toggle = useCallback(
        guarded("header.menu", (id) => {
            if (id) {
                beginInteraction("menu-ready", { menu: id });
                // Start the menu's query from the click, so it is in flight while the
                // popover mounts.
                if (MENUS[id].query)
                    loadQuery(MENUS[id].query);
                log("menu_open", { menu: id });
            }
            setOpenMenu(id);
        }),
        []
    );

    return (
        <header className="bg-surface shadow-header relative z-30 flex h-14 shrink-0 items-center justify-between px-3">
            <div className="flex items-center gap-2">
                <a className="bg-accent flex h-10 w-10 items-center justify-center rounded-xl text-white" href="#/" aria-label="Commons home" onClick={(event) => event.preventDefault()}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                        <circle cx="9.5" cy="10" r="5.5" />
                        <circle cx="16.5" cy="10" r="5.5" />
                        <circle cx="13" cy="16" r="5.5" />
                    </svg>
                </a>
                <SearchBox />
            </div>
            <nav className="flex items-center gap-1" aria-label="Primary">
                {TABS.map((tab) => {
                    const active = tab.id === "home" && page === "/";
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            id={`tab-${tab.id}`}
                            className={`rounded-lg px-3 py-2 text-[15px] font-semibold ${active ? "bg-accent-soft text-accent" : "text-secondary hover:bg-hover"}`}
                            aria-current={active ? "page" : undefined}
                            onClick={tab.id === "home" ? () => goHome(page) : undefined}
                            data-log={`tab_${tab.id}`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
            <nav className="flex items-center gap-2" aria-label="Account controls and settings">
                {Object.keys(MENUS).map((id) =>
                    <MenuButton key={id} id={id} open={openMenu === id} onToggle={toggle} badge={counts[MENUS[id].badge] ?? 0} viewerSeed={viewerSeed} />
                )}
            </nav>
        </header>
    );
}
