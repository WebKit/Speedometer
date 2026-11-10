import { useEffect, useMemo, useState } from "react";
import { queryKey } from "../store/network.js";
import { useLinkedRecord, useQueryStatus } from "../store/hooks.js";
import { CREATE_ITEMS, MENU_SECTIONS } from "../data/corpus.js";
import { relativeTime } from "../format.js";
import { gate } from "../analytics/experiments.js";
import { guarded } from "../analytics/guard.js";
import { navigate } from "../router.jsx";
import { signal } from "../signals.js";
import Avatar from "./avatar.jsx";
import Icon from "./icon.jsx";
import { GlimmerRow } from "./glimmer.jsx";

function useReadySignal(ready) {
    useEffect(() => {
        if (ready)
            signal("menu-ready");
    }, [ready]);
}

function MenuHeader({ title, children }) {
    return (
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <h2 className="text-primary text-2xl font-bold">{title}</h2>
            <div className="flex gap-1">{children}</div>
        </div>
    );
}

function RoundButton({ icon, label }) {
    return (
        <button type="button" className="text-secondary hover:bg-hover rounded-full p-2" aria-label={label}>
            <Icon name={icon} size={18} />
        </button>
    );
}

export function MainMenu() {
    const [filter, setFilter] = useState("");
    const sections = useMemo(() => {
        const needle = filter.trim().toLowerCase();
        if (!needle)
            return MENU_SECTIONS;
        return MENU_SECTIONS.map((section) => ({ ...section, items: section.items.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(needle)) })).filter((section) => section.items.length);
    }, [filter]);
    useReadySignal(true);
    return (
        <div className="w-[560px]">
            <MenuHeader title="Explore" />
            <div className="bg-canvas flex max-h-[480px] gap-3 overflow-y-auto p-3">
                <div className="bg-surface shadow-card flex-1 rounded-lg p-3">
                    <label className="bg-surface-alt text-secondary flex items-center gap-2 rounded-full px-3 py-2">
                        <Icon name="search" size={16} />
                        <input
                            className="text-primary placeholder:text-secondary w-full bg-transparent text-[15px] outline-none"
                            placeholder="Find a destination"
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                            data-log="menu_search"
                        />
                    </label>
                    {sections.map((section) =>
                        <section key={section.title} className="border-divider border-b py-2 last:border-0">
                            <h3 className="text-primary px-2 py-1 text-[17px] font-semibold">{section.title}</h3>
                            <ul>
                                {section.items.map((item) =>
                                    <li key={item.label}>
                                        <a className="hover:bg-hover flex items-start gap-3 rounded-md p-2" href={`#/${item.label.toLowerCase().replace(/\s+/g, "-")}`} data-log="menu_item" onClick={(event) => event.preventDefault()}>
                                            <span className="bg-accent-soft text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                                <Icon name={item.icon} size={20} />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="text-primary block text-[15px] font-medium">{item.label}</span>
                                                <span className="text-secondary block text-[13px] leading-4">{item.description}</span>
                                            </span>
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </section>
                    )}
                </div>
                <div className="bg-surface shadow-card w-[180px] shrink-0 self-start rounded-lg p-2">
                    <h3 className="text-primary px-2 py-1 text-[17px] font-semibold">Start something</h3>
                    {CREATE_ITEMS.map((item) =>
                        <button key={item.label} type="button" className="text-primary hover:bg-hover flex w-full items-center gap-3 rounded-md p-2 text-left text-[15px] font-medium" data-log="menu_create">
                            <span className="bg-surface-alt flex h-8 w-8 items-center justify-center rounded-full">
                                <Icon name={item.icon} size={18} />
                            </span>
                            {item.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ThreadRow({ thread, previews }) {
    const participant = useLinkedRecord(thread.participant);
    return (
        <li>
            <a className="hover:bg-hover flex items-center gap-3 rounded-lg p-2" href={`#/messages/${thread.id}`} data-log="messages_thread" onClick={(event) => event.preventDefault()}>
                <Avatar seed={participant.avatar_seed} size={56} online={thread.online} label={participant.name} />
                <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[15px] ${thread.unread ? "font-semibold" : ""} text-primary`}>{participant.name}</span>
                    {previews
                        && <span className={`flex gap-1 text-[13px] ${thread.unread ? "text-primary font-semibold" : "text-secondary"}`}>
                            <span className="truncate">
                                {thread.from_viewer ? "You: " : ""}
                                {thread.snippet}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="shrink-0">{relativeTime(thread.updated_time)}</span>
                        </span>
                    }
                </span>
                {thread.unread && <span className="bg-accent h-3 w-3 shrink-0 rounded-full" aria-label="Unread" />}
            </a>
        </li>
    );
}

export function MessagesMenu() {
    const status = useQueryStatus(queryKey("Threads"));
    const ready = status && status.status === "ready";
    const [tab, setTab] = useState("all");
    const previews = gate("menu_message_previews");
    useReadySignal(ready);
    return (
        <div className="w-[360px]">
            <MenuHeader title="Messages">
                <RoundButton icon="edit" label="Write a message" />
            </MenuHeader>
            <div className="px-4 pb-2">
                <label className="bg-surface-alt text-secondary flex items-center gap-2 rounded-full px-3 py-2">
                    <Icon name="search" size={16} />
                    <input className="placeholder:text-secondary w-full bg-transparent text-[15px] outline-none" placeholder="Search messages" data-log="messages_search" />
                </label>
                <div className="mt-2 flex gap-1" role="tablist">
                    {["all", "unread", "requests"].map((name) =>
                        <button
                            key={name}
                            type="button"
                            role="tab"
                            aria-selected={tab === name}
                            className={`rounded-full px-3 py-1.5 text-[15px] font-semibold capitalize ${tab === name ? "bg-accent-soft text-accent" : "text-primary hover:bg-hover"}`}
                            onClick={() => setTab(name)}
                        >
                            {name}
                        </button>
                    )}
                </div>
            </div>
            <ul className="max-h-[420px] overflow-y-auto px-2 pb-2">
                {ready ? status.root.threads.map((ref) => <ThreadRowLoader key={ref.__ref} threadRef={ref} previews={previews} />) : [0, 1, 2, 3, 4].map((i) => <GlimmerRow key={i} avatarSize={56} />)}
            </ul>
            <a className="border-divider text-accent hover:bg-hover block border-t py-3 text-center text-[15px] font-semibold" href="#/messages">
                Open messages
            </a>
        </div>
    );
}

function ThreadRowLoader({ threadRef, previews }) {
    const thread = useLinkedRecord(threadRef);
    return <ThreadRow thread={thread} previews={previews} />;
}

const NOTIFICATION_BADGES = {
    comment: ["comment", "bg-badge-green"],
    reaction: ["like", "bg-accent"],
    group: ["groups", "bg-badge-blue"],
    birthday: ["calendar", "bg-badge-pink"],
    friend: ["friends", "bg-accent"],
    memory: ["memories", "bg-badge-purple"],
    event: ["calendar", "bg-badge-red"],
    mention: ["chat", "bg-badge-green"],
};

function BoldMarkup({ text }) {
    const parts = text.split("**");
    return parts.map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : <span key={index}>{part}</span>);
}

function NotificationRow({ notificationRef }) {
    const notification = useLinkedRecord(notificationRef);
    const actor = useLinkedRecord(notification.actor);
    const [icon, color] = NOTIFICATION_BADGES[notification.kind];
    return (
        <li>
            <a className="hover:bg-hover flex items-start gap-3 rounded-lg p-2" href={`#/notifications/${notification.id}`} data-log="notification" onClick={(event) => event.preventDefault()}>
                <span className="relative shrink-0">
                    <Avatar seed={actor.avatar_seed} size={56} label={actor.name} />
                    <span className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-white ${color}`}>
                        <Icon name={icon} size={14} />
                    </span>
                </span>
                <span className="min-w-0 flex-1">
                    <span className={`line-clamp-3 text-[15px] leading-5 ${notification.unread ? "text-primary" : "text-secondary"}`}>
                        <BoldMarkup text={notification.text} />
                    </span>
                    <span className={`text-[13px] ${notification.unread ? "text-accent font-semibold" : "text-secondary"}`}>{relativeTime(notification.created_time)}</span>
                    {notification.has_action
                        && <span className="mt-2 flex gap-2">
                            <button type="button" className="bg-accent flex-1 rounded-md py-1.5 text-sm font-semibold text-white">
                                Accept
                            </button>
                            <button type="button" className="bg-surface-alt text-primary flex-1 rounded-md py-1.5 text-sm font-semibold">
                                Ignore
                            </button>
                        </span>
                    }
                </span>
                {notification.unread && <span className="bg-accent mt-6 h-3 w-3 shrink-0 rounded-full" aria-label="Unread" />}
            </a>
        </li>
    );
}

export function NotificationsMenu() {
    const status = useQueryStatus(queryKey("Notifications"));
    const ready = status && status.status === "ready";
    const [tab, setTab] = useState("everything");
    useReadySignal(ready);
    const sections = useMemo(() => {
        if (!ready)
            return [];
        const edges = status.root.notifications.edges;
        return [
            { title: "Today", items: edges.slice(0, 5) },
            { title: "Before that", items: edges.slice(5) },
        ];
    }, [ready, status]);
    return (
        <div className="w-[360px]">
            <MenuHeader title="Activity">
                <RoundButton icon="settings" label="Activity settings" />
            </MenuHeader>
            <div className="flex gap-1 px-4 pb-2" role="tablist">
                {["everything", "mentions"].map((name) =>
                    <button
                        key={name}
                        type="button"
                        role="tab"
                        aria-selected={tab === name}
                        className={`rounded-full px-3 py-1.5 text-[15px] font-semibold capitalize ${tab === name ? "bg-accent-soft text-accent" : "text-primary hover:bg-hover"}`}
                        onClick={() => setTab(name)}
                    >
                        {name}
                    </button>
                )}
            </div>
            <div className="max-h-[460px] overflow-y-auto px-2 pb-2">
                {ready
                    ? sections.map((section) =>
                        <section key={section.title}>
                            <div className="flex items-center justify-between px-2 py-1">
                                <h3 className="text-primary text-[17px] font-semibold">{section.title}</h3>
                                {section.title === "Today"
                                      && <a className="text-accent text-[15px] hover:underline" href="#/notifications">
                                          Mark all read
                                      </a>
                                }
                            </div>
                            <ul>
                                {section.items.map((ref) =>
                                    <NotificationRow key={ref.__ref} notificationRef={ref} />
                                )}
                            </ul>
                        </section>
                    )
                    : [0, 1, 2, 3, 4].map((i) => <GlimmerRow key={i} avatarSize={56} lines={3} />)}
            </div>
        </div>
    );
}

const openOwnProfile = guarded("menu.profile", (event, id) => {
    event.preventDefault();
    navigate(`/profile/${id}`);
});

function ProfileSwitchRow({ profileRef }) {
    const profile = useLinkedRecord(profileRef);
    return (
        <button type="button" className="hover:bg-hover flex w-full items-center gap-3 rounded-md p-2 text-left">
            <Avatar seed={profile.avatar_seed} size={36} square label={profile.name} />
            <span className="text-primary text-[15px] font-medium">{profile.name}</span>
        </button>
    );
}

export function AccountMenu() {
    const status = useQueryStatus(queryKey("Account"));
    const ready = status && status.status === "ready";
    useReadySignal(ready);
    const account = ready ? status.root.account : null;
    const viewer = useLinkedRecord(account ? account.viewer : null);
    return (
        <div className="w-[360px] p-3">
            {ready
                ? <>
                    <div className="shadow-card rounded-lg p-1">
                        <a className="hover:bg-hover flex items-center gap-3 rounded-md p-2" href={`#/profile/${viewer.id}`} onClick={(event) => openOwnProfile(event, viewer.id)} data-log="account_profile">
                            <Avatar seed={viewer.avatar_seed} size={40} label={viewer.name} />
                            <span className="text-primary text-[17px] font-semibold">{viewer.name}</span>
                        </a>
                        <div className="border-divider mx-2 border-t" />
                        {account.profiles.map((ref) =>
                            <ProfileSwitchRow key={ref.__ref} profileRef={ref} />
                        )}
                        <button type="button" className="bg-surface-alt text-primary hover:bg-hover m-1 w-[calc(100%-8px)] rounded-md py-2 text-[15px] font-semibold">
                            Switch profile
                        </button>
                    </div>
                    <ul className="mt-2">
                        {account.rows.map((row) =>
                            <li key={row.label}>
                                <button type="button" className="hover:bg-hover flex w-full items-center gap-3 rounded-md p-2 text-left" data-log="account_row">
                                    <span className="bg-surface-alt text-primary flex h-9 w-9 items-center justify-center rounded-full">
                                        <Icon name={row.icon} size={20} />
                                    </span>
                                    <span className="text-primary flex-1 text-[15px] font-medium">{row.label}</span>
                                    {row.shortcut && <span className="text-secondary text-xs">{row.shortcut}</span>}
                                    {row.chevron && <Icon name="chevronRight" size={20} className="text-secondary" />}
                                </button>
                            </li>
                        )}
                    </ul>
                    <p className="text-secondary px-2 pt-2 text-xs">About · Privacy · Terms · Accessibility · Commons © 2026</p>
                </>
                : <GlimmerRow lines={2} />
            }
        </div>
    );
}
