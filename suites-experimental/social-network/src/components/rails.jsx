import { queryKey } from "../store/network.js";
import { useLinkedRecord, useQueryStatus, useRecord } from "../store/hooks.js";
import { photo } from "../data/graphics.js";
import { VIEWER_ID } from "../data/server.js";
import { guarded } from "../analytics/guard.js";
import { beginInteraction } from "../analytics/perf.js";
import { navigate } from "../router.jsx";
import { loadProfile } from "../queries.js";
import Avatar from "./avatar.jsx";
import Icon from "./icon.jsx";
import { GlimmerRow } from "./glimmer.jsx";

const NAV = [
    { icon: "friends", label: "Connections" },
    { icon: "communities", label: "Communities" },
    { icon: "calendar", label: "Events" },
    { icon: "map", label: "Local guide" },
    { icon: "saved", label: "Bookmarks" },
    { icon: "album", label: "Albums" },
    { icon: "store", label: "Swap shop" },
];

const openProfile = guarded("rail.profile", (event) => {
    event.preventDefault();
    beginInteraction("profile-ready", { source: "left_rail" });
    // Fetch from the click, so the request is in flight while the route renders.
    loadProfile(VIEWER_ID);
    navigate(`/profile/${VIEWER_ID}`);
});

function Shortcut({ groupRef }) {
    const group = useLinkedRecord(groupRef);
    return (
        <a className="hover:bg-hover flex h-11 w-11 items-center justify-center rounded-lg" href={`#/groups/${group.id}`} title={group.name} aria-label={group.name} data-log="rail_shortcut" onClick={(event) => event.preventDefault()}>
            <img className="h-9 w-9 rounded-lg object-cover" src={photo(group.cover_seed, 72, 72)} width="36" height="36" alt="" />
        </a>
    );
}

export function LeftRail() {
    const viewer = useRecord(VIEWER_ID);
    const shortcuts = useQueryStatus(queryKey("Shortcuts"));
    return (
        <nav className="flex w-14 shrink-0 flex-col items-center gap-1 overflow-y-auto py-3" aria-label="Shortcuts" data-log-scope="left_rail">
            <a id="rail-profile" className="hover:bg-hover flex h-11 w-11 items-center justify-center rounded-lg" href={`#/profile/${VIEWER_ID}`} aria-label={viewer ? viewer.name : "Your profile"} onClick={openProfile} data-log="rail_profile">
                {viewer ? <Avatar seed={viewer.avatar_seed} size={36} label="" /> : <span className="bg-glimmer h-9 w-9 rounded-full" />}
            </a>
            {NAV.map((item) =>
                <a
                    key={item.label}
                    className="text-accent hover:bg-hover flex h-11 w-11 items-center justify-center rounded-lg"
                    href={`#/${item.label.toLowerCase()}`}
                    aria-label={item.label}
                    title={item.label}
                    data-log="rail_nav"
                    onClick={(event) => event.preventDefault()}
                >
                    <Icon name={item.icon} size={24} />
                </a>
            )}
            <div className="border-divider my-2 w-8 border-t" />
            {shortcuts && shortcuts.root && shortcuts.root.shortcuts.map((ref) => <Shortcut key={ref.__ref} groupRef={ref} />)}
        </nav>
    );
}

function Contact({ contactRef }) {
    const contact = useLinkedRecord(contactRef);
    return (
        <li>
            <a className="hover:bg-hover flex items-center gap-3 rounded-md px-2 py-1.5" href={`#/messages/${contact.id}`} data-log="rail_contact" onClick={(event) => event.preventDefault()}>
                <Avatar seed={contact.avatar_seed} size={32} online={contact.online} label="" />
                <span className="text-primary truncate text-[15px] font-medium">{contact.name}</span>
            </a>
        </li>
    );
}

function PromotedCard({ ad }) {
    return (
        <a className="hover:bg-hover flex items-center gap-3 rounded-md p-2" href={`https://${ad.domain}`} target="_blank" rel="noreferrer" data-log="rail_ad">
            <img className="h-[90px] w-[90px] shrink-0 rounded-lg object-cover" src={photo(ad.seed, 180, 180)} width="90" height="90" alt="" />
            <span className="min-w-0">
                <span className="text-primary line-clamp-2 block text-[15px] font-medium leading-5">{ad.title}</span>
                <span className="text-secondary block truncate text-[13px]">{ad.domain}</span>
            </span>
        </a>
    );
}

function Birthday({ userRef }) {
    const user = useLinkedRecord(userRef);
    return (
        <div className="text-primary flex items-center gap-3 px-2 py-1.5 text-[15px]">
            <span className="bg-accent-soft text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <Icon name="gift" size={18} />
            </span>
            <span>
                <strong>{user.name}</strong> turns a year older today
            </span>
        </div>
    );
}

function GroupChat({ groupRef }) {
    const group = useLinkedRecord(groupRef);
    return (
        <li>
            <a className="hover:bg-hover flex items-center gap-3 rounded-md px-2 py-1.5" href={`#/groups/${group.id}/chat`} onClick={(event) => event.preventDefault()}>
                <img className="h-8 w-8 rounded-full object-cover" src={photo(group.cover_seed, 64, 64)} width="32" height="32" alt="" />
                <span className="text-primary truncate text-[15px] font-medium">{group.name}</span>
            </a>
        </li>
    );
}

export function RightRail() {
    const status = useQueryStatus(queryKey("RightRail"));
    const rail = status && status.root ? status.root.right_rail : null;
    return (
        <aside className="w-[232px] shrink-0 overflow-y-auto px-2 py-3" aria-label="Promoted and people online" data-log-scope="right_rail">
            {rail
                ? <>
                    <h2 className="text-secondary px-2 pb-1 text-[17px] font-semibold">Promoted</h2>
                    {rail.sponsored.map((ref) =>
                        <PromotedRef key={ref.__ref} adRef={ref} />
                    )}
                    <div className="border-divider mx-2 my-2 border-t" />
                    <h2 className="text-secondary px-2 pb-1 text-[17px] font-semibold">Celebrations</h2>
                    {rail.birthdays.map((ref) =>
                        <Birthday key={ref.__ref} userRef={ref} />
                    )}
                    <div className="border-divider mx-2 my-2 border-t" />
                    <div className="flex items-center justify-between px-2 pb-1">
                        <h2 className="text-secondary text-[17px] font-semibold">Online now</h2>
                        <span className="text-secondary flex gap-1">
                            <Icon name="search" size={16} />
                            <Icon name="dots" size={16} strokeWidth={3} />
                        </span>
                    </div>
                    <ul>
                        {rail.contacts.map((ref) =>
                            <Contact key={ref.__ref} contactRef={ref} />
                        )}
                    </ul>
                    <div className="border-divider mx-2 my-2 border-t" />
                    <h2 className="text-secondary px-2 pb-1 text-[17px] font-semibold">Community chats</h2>
                    <ul>
                        {rail.group_chats.map((ref) =>
                            <GroupChat key={ref.__ref} groupRef={ref} />
                        )}
                    </ul>
                </>
                : [0, 1, 2, 3].map((i) => <GlimmerRow key={i} avatarSize={32} lines={1} />)
            }
        </aside>
    );
}

function PromotedRef({ adRef }) {
    const ad = useLinkedRecord(adRef);
    return <PromotedCard ad={ad} />;
}
