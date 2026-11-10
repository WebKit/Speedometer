import { useEffect, useState } from "react";
import { queryKey } from "../store/network.js";
import { useLinkedRecord, useQueryStatus, useRecord } from "../store/hooks.js";
import { photo } from "../data/graphics.js";
import { VIEWER_ID } from "../data/server.js";
import { gate } from "../analytics/experiments.js";
import { loadProfile } from "../queries.js";
import { signal } from "../signals.js";
import { compactNumber } from "../format.js";
import Avatar from "./avatar.jsx";
import Feed from "./feed.jsx";
import Icon from "./icon.jsx";
import { GlimmerLine, GlimmerStory } from "./glimmer.jsx";

const TABS = ["Activity", "About", "Connections", "Albums", "Events"];

function Card({ title, action, children }) {
    return (
        <section className="bg-surface shadow-card rounded-lg p-4">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-primary text-xl font-bold">{title}</h2>
                {action
                    && <a className="text-accent hover:bg-hover rounded-md px-2 py-1 text-[15px]" href="#/" onClick={(event) => event.preventDefault()}>
                        {action}
                    </a>
                }
            </div>
            {children}
        </section>
    );
}

function Intro({ user, own }) {
    const v3 = gate("profile_intro_card_v3");
    return (
        <Card title="About">
            <p className="text-primary mb-3 text-center text-[15px]">{user.bio}</p>
            {own
                && <button type="button" className="bg-surface-alt text-primary hover:bg-hover mb-3 w-full rounded-md py-2 text-[15px] font-semibold">
                    Update bio
                </button>
            }
            <ul className="flex flex-col gap-3">
                {(user.intro ?? []).map((item) =>
                    <li key={item.text} className="text-primary flex items-center gap-3 text-[15px]">
                        <Icon name={item.icon} size={20} className="text-secondary" />
                        <span>{item.text}</span>
                    </li>
                )}
            </ul>
            {own
                && <div className={`mt-3 flex ${v3 ? "flex-row" : "flex-col"} gap-2`}>
                    {["Edit details", "Add interests"].map((label) =>
                        <button key={label} type="button" className="bg-surface-alt text-primary hover:bg-hover flex-1 rounded-md py-2 text-[15px] font-semibold">
                            {label}
                        </button>
                    )}
                </div>
            }
        </Card>
    );
}

function PhotoCell({ photoRef }) {
    const item = useLinkedRecord(photoRef);
    return (
        <a href={`#/photo/${item.id}`} className="block aspect-square overflow-hidden" onClick={(event) => event.preventDefault()}>
            <img className="h-full w-full object-cover" src={photo(item.seed, 200, 200)} width="200" height="200" alt={item.alt} />
        </a>
    );
}

function FriendCell({ friendRef }) {
    const friend = useLinkedRecord(friendRef);
    return (
        <a href={`#/profile/${friend.id}`} className="block" onClick={(event) => event.preventDefault()}>
            <img className="aspect-square w-full rounded-lg object-cover" src={`${photo(friend.avatar_seed * 3, 200, 200)}`} width="200" height="200" alt="" />
            <span className="text-primary mt-1 block truncate text-[13px] font-semibold">{friend.name}</span>
        </a>
    );
}

function FriendStack({ friends }) {
    return (
        <div className="flex -space-x-2">
            {friends.map((ref) =>
                <StackAvatar key={ref.__ref} friendRef={ref} />
            )}
        </div>
    );
}

function StackAvatar({ friendRef }) {
    const friend = useLinkedRecord(friendRef);
    return (
        <span className="border-surface rounded-full border-2">
            <Avatar seed={friend.avatar_seed} size={32} label={friend.name} />
        </span>
    );
}

export default function ProfilePage({ userId, scrollerRef }) {
    const user = useRecord(userId);
    const status = useQueryStatus(queryKey("Profile", { userId }));
    const [tab, setTab] = useState("Activity");
    const ready = status && status.status === "ready";
    const own = userId === VIEWER_ID;

    useEffect(() => {
        loadProfile(userId);
    }, [userId]);

    useEffect(() => {
        if (ready)
            signal("profile-ready");
    }, [ready]);

    const headerLoaded = user && user.cover_seed !== undefined;
    return (
        <div className="pb-6" data-log-scope="profile">
            <div className="bg-surface shadow-card">
                <div className="mx-auto max-w-[740px]">
                    <div className="bg-surface-alt relative h-[220px] overflow-hidden rounded-b-lg">
                        {headerLoaded && <img className="h-full w-full object-cover" src={photo(user.cover_seed, 740, 220)} width="740" height="220" alt="Cover photo" />}
                        {own
                            && <button type="button" className="bg-surface text-primary absolute bottom-3 right-3 flex items-center gap-2 rounded-md px-3 py-1.5 text-[15px] font-semibold">
                                <Icon name="camera" size={16} />
                                Change cover
                            </button>
                        }
                    </div>
                    <div className="flex items-end gap-4 px-6 pb-4">
                        <span className="border-surface bg-surface -mt-12 rounded-[36px] border-4">
                            {user ? <Avatar seed={user.avatar_seed} size={150} square label={user.name} /> : <span className="bg-glimmer block h-[150px] w-[150px] rounded-[30px]" />}
                        </span>
                        <div className="flex-1 pb-2">
                            {headerLoaded
                                ? <>
                                    <h1 id="profile-name" className="text-primary text-[28px] font-bold leading-8">
                                        {user.name}
                                    </h1>
                                    <p className="text-secondary text-[15px] font-semibold">
                                        {compactNumber(user.friend_count)} connections · {compactNumber(user.follower_count)} followers
                                    </p>
                                    <FriendStack friends={user.friends_preview} />
                                </>
                                : <div className="flex flex-col gap-2">
                                    <GlimmerLine width="50%" height={24} />
                                    <GlimmerLine width="30%" />
                                </div>
                            }
                        </div>
                        <div className="flex gap-2 pb-2">
                            <button type="button" className="bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-[15px] font-semibold text-white">
                                <Icon name="share" size={16} />
                                {own ? "Share profile" : "Connect"}
                            </button>
                            <button type="button" className="bg-surface-alt text-primary flex items-center gap-2 rounded-md px-3 py-2 text-[15px] font-semibold">
                                <Icon name="pencil" size={16} />
                                {own ? "Edit" : "Message"}
                            </button>
                        </div>
                    </div>
                    <nav className="border-divider flex gap-1 border-t px-4" role="tablist" aria-label="Profile sections">
                        {TABS.map((name) =>
                            <button
                                key={name}
                                type="button"
                                role="tab"
                                aria-selected={tab === name}
                                className={`my-2 rounded-lg px-3 py-1.5 text-[15px] font-semibold ${tab === name ? "bg-accent-soft text-accent" : "text-secondary hover:bg-hover"}`}
                                onClick={() => setTab(name)}
                                data-log="profile_tab"
                            >
                                {name}
                            </button>
                        )}
                    </nav>
                </div>
            </div>
            <div className="mx-auto mt-4 grid max-w-[740px] grid-cols-[300px_1fr] gap-4 px-2">
                <div className="flex flex-col gap-4">
                    {user && user.intro ? <Intro user={user} own={own} /> : <GlimmerStory />}
                    {user && user.photos
                        && <Card title="Albums" action="Browse">
                            <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
                                {user.photos.map((ref) =>
                                    <PhotoCell key={ref.__ref} photoRef={ref} />
                                )}
                            </div>
                        </Card>
                    }
                    {user && user.friends
                        && <Card title="Connections" action="Browse">
                            <p className="text-secondary -mt-2 mb-2 text-[15px]">{compactNumber(user.friend_count)} connections</p>
                            <div className="grid grid-cols-3 gap-2">
                                {user.friends.map((ref) =>
                                    <FriendCell key={ref.__ref} friendRef={ref} />
                                )}
                            </div>
                        </Card>
                    }
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                    <div className="bg-surface shadow-card flex items-center justify-between rounded-lg px-4 py-3">
                        <h2 className="text-primary text-xl font-bold">Activity</h2>
                        <button type="button" className="bg-surface-alt text-primary flex items-center gap-2 rounded-md px-3 py-1.5 text-[15px] font-semibold">
                            <Icon name="filter" size={16} />
                            Sort
                        </button>
                    </div>
                    {user && user.timeline ? <Feed edges={user.timeline.edges} scrollerRef={scrollerRef} label={`${user.name}'s posts`} /> : <GlimmerStory />}
                </div>
            </div>
        </div>
    );
}
