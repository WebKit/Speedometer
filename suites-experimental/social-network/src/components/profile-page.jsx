import { useEffect, useState } from "react";
import { queryKey, queryStatusId } from "../store/network.js";
import { fragment, scalars, spread, useFragment, useRetain } from "../store/fragment.js";
import { photo } from "../data/graphics.js";
import { VIEWER_ID } from "../data/server.js";
import { gate } from "../analytics/experiments.js";
import { loadProfile } from "../queries.js";
import { signal } from "../signals.js";
import { compactNumber } from "../format.js";
import Avatar from "./avatar.jsx";
import Feed, { FeedEdge } from "./feed.jsx";
import Icon from "./icon.jsx";
import { GlimmerLine, GlimmerStory } from "./glimmer.jsx";
import { UIBox, UIImage, UILink, UIText } from "./ui.jsx";

const TABS = ["Activity", "About", "Connections", "Albums", "Events"];

function Card({ title, action, children }) {
    return (
        <UIBox as="section" className="bg-surface shadow-card rounded-lg p-4">
            <UIBox className="mb-3 flex items-center justify-between">
                <UIText as="h2" className="text-primary text-xl font-bold">
                    {title}
                </UIText>
                {action
                    && <UILink className="text-accent hover:bg-hover rounded-md px-2 py-1 text-[15px]" href="#/" onClick={(event) => event.preventDefault()}>
                        {action}
                    </UILink>
                }
            </UIBox>
            {children}
        </UIBox>
    );
}

function Intro({ user, own }) {
    const v3 = gate("profile_intro_card_v3");
    return (
        <Card title="About">
            <UIText as="p" className="text-primary mb-3 text-center text-[15px]">
                {user.bio}
            </UIText>
            {own
                && <button type="button" className="bg-surface-alt text-primary hover:bg-hover mb-3 w-full rounded-md py-2 text-[15px] font-semibold">
                    Update bio
                </button>
            }
            <UIBox as="ul" className="flex flex-col gap-3">
                {(user.intro ?? []).map((item) =>
                    <UIBox as="li" key={item.text} className="text-primary flex items-center gap-3 text-[15px]">
                        <Icon name={item.icon} size={20} className="text-secondary" />
                        <UIText>{item.text}</UIText>
                    </UIBox>
                )}
            </UIBox>
            {own
                && <UIBox className={`mt-3 flex ${v3 ? "flex-row" : "flex-col"} gap-2`}>
                    {["Edit details", "Add interests"].map((label) =>
                        <button key={label} type="button" className="bg-surface-alt text-primary hover:bg-hover flex-1 rounded-md py-2 text-[15px] font-semibold">
                            {label}
                        </button>
                    )}
                </UIBox>
            }
        </Card>
    );
}

const PhotoCell_photo = fragment("PhotoCell_photo", scalars("id seed alt"));
const FriendCell_user = fragment("FriendCell_user", scalars("id name avatar_seed"));

const ProfilePage_user = fragment("ProfilePage_user", {
    ...scalars("id name avatar_seed cover_seed bio friend_count follower_count intro"),
    friends_preview: spread(FriendCell_user),
    photos: spread(PhotoCell_photo),
    friends: spread(FriendCell_user),
    timeline: { page_info: true, edges: FeedEdge },
});

const ProfileQueryStatus = fragment("ProfileQueryStatus", { status: true });

function PhotoCell({ photoRef }) {
    const item = useFragment(PhotoCell_photo, photoRef);
    return (
        <UILink href={`#/photo/${item.id}`} className="block aspect-square overflow-hidden" onClick={(event) => event.preventDefault()}>
            <UIImage className="h-full w-full object-cover" src={photo(item.seed, 200, 200)} width="200" height="200" alt={item.alt} />
        </UILink>
    );
}

function FriendCell({ friendRef }) {
    const friend = useFragment(FriendCell_user, friendRef);
    return (
        <UILink href={`#/profile/${friend.id}`} className="block" onClick={(event) => event.preventDefault()}>
            <UIImage className="aspect-square w-full rounded-lg object-cover" src={`${photo(friend.avatar_seed * 3, 200, 200)}`} width="200" height="200" alt="" />
            <UIText className="text-primary mt-1 block truncate text-[13px] font-semibold">{friend.name}</UIText>
        </UILink>
    );
}

function FriendStack({ friends }) {
    return (
        <UIBox className="flex -space-x-2">
            {friends.map((ref) =>
                <StackAvatar key={ref.__id} friendRef={ref} />
            )}
        </UIBox>
    );
}

function StackAvatar({ friendRef }) {
    const friend = useFragment(FriendCell_user, friendRef);
    return (
        <UIText className="border-surface rounded-full border-2">
            <Avatar seed={friend.avatar_seed} size={32} label={friend.name} />
        </UIText>
    );
}

export default function ProfilePage({ userId, scrollerRef }) {
    const user = useFragment(ProfilePage_user, userId);
    const status = useFragment(ProfileQueryStatus, queryStatusId(queryKey("Profile", { userId })));
    useRetain(queryStatusId(queryKey("Profile", { userId })));
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
        <UIBox className="pb-6" data-log-scope="profile">
            <UIBox className="bg-surface shadow-card">
                <UIBox className="mx-auto max-w-[740px]">
                    <UIBox className="bg-surface-alt relative h-[220px] overflow-hidden rounded-b-lg">
                        {headerLoaded && <UIImage className="h-full w-full object-cover" src={photo(user.cover_seed, 740, 220)} width="740" height="220" alt="Cover photo" />}
                        {own
                            && <button type="button" className="bg-surface text-primary absolute bottom-3 right-3 flex items-center gap-2 rounded-md px-3 py-1.5 text-[15px] font-semibold">
                                <Icon name="camera" size={16} />
                                Change cover
                            </button>
                        }
                    </UIBox>
                    <UIBox className="flex items-end gap-4 px-6 pb-4">
                        <UIText className="border-surface bg-surface -mt-12 rounded-[36px] border-4">
                            {user ? <Avatar seed={user.avatar_seed} size={150} square label={user.name} /> : <UIText className="bg-glimmer block h-[150px] w-[150px] rounded-[30px]" />}
                        </UIText>
                        <UIBox className="flex-1 pb-2">
                            {headerLoaded
                                ? <>
                                    <UIText as="h1" id="profile-name" className="text-primary text-[28px] font-bold leading-8">
                                        {user.name}
                                    </UIText>
                                    <UIText as="p" className="text-secondary text-[15px] font-semibold">
                                        {compactNumber(user.friend_count)} connections · {compactNumber(user.follower_count)} followers
                                    </UIText>
                                    <FriendStack friends={user.friends_preview} />
                                </>
                                : <UIBox className="flex flex-col gap-2">
                                    <GlimmerLine width="50%" height={24} />
                                    <GlimmerLine width="30%" />
                                </UIBox>
                            }
                        </UIBox>
                        <UIBox className="flex gap-2 pb-2">
                            <button type="button" className="bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-[15px] font-semibold text-white">
                                <Icon name="share" size={16} />
                                {own ? "Share profile" : "Connect"}
                            </button>
                            <button type="button" className="bg-surface-alt text-primary flex items-center gap-2 rounded-md px-3 py-2 text-[15px] font-semibold">
                                <Icon name="pencil" size={16} />
                                {own ? "Edit" : "Message"}
                            </button>
                        </UIBox>
                    </UIBox>
                    <UIBox as="nav" className="border-divider flex gap-1 border-t px-4" role="tablist" aria-label="Profile sections">
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
                    </UIBox>
                </UIBox>
            </UIBox>
            <UIBox className="mx-auto mt-4 grid max-w-[740px] grid-cols-[300px_1fr] gap-4 px-2">
                <UIBox className="flex flex-col gap-4">
                    {user && user.intro ? <Intro user={user} own={own} /> : <GlimmerStory />}
                    {user && user.photos
                        && <Card title="Albums" action="Browse">
                            <UIBox className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
                                {user.photos.map((ref) =>
                                    <PhotoCell key={ref.__id} photoRef={ref} />
                                )}
                            </UIBox>
                        </Card>
                    }
                    {user && user.friends
                        && <Card title="Connections" action="Browse">
                            <UIText as="p" className="text-secondary -mt-2 mb-2 text-[15px]">
                                {compactNumber(user.friend_count)} connections
                            </UIText>
                            <UIBox className="grid grid-cols-3 gap-2">
                                {user.friends.map((ref) =>
                                    <FriendCell key={ref.__id} friendRef={ref} />
                                )}
                            </UIBox>
                        </Card>
                    }
                </UIBox>
                <UIBox className="flex min-w-0 flex-col gap-4">
                    <UIBox className="bg-surface shadow-card flex items-center justify-between rounded-lg px-4 py-3">
                        <UIText as="h2" className="text-primary text-xl font-bold">
                            Activity
                        </UIText>
                        <button type="button" className="bg-surface-alt text-primary flex items-center gap-2 rounded-md px-3 py-1.5 text-[15px] font-semibold">
                            <Icon name="filter" size={16} />
                            Sort
                        </button>
                    </UIBox>
                    {user && user.timeline ? <Feed edges={user.timeline.edges} scrollerRef={scrollerRef} label={`${user.name}'s posts`} /> : <GlimmerStory />}
                </UIBox>
            </UIBox>
        </UIBox>
    );
}
