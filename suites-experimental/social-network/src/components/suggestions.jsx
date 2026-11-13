import { memo, useState } from "react";
import { fragment, scalars, spread, useFragment } from "../store/fragment.js";
import { photo } from "../data/graphics.js";
import { t } from "../i18n.js";
import { guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import Avatar from "./avatar.jsx";
import HovercardTrigger from "./hovercard.jsx";
import Icon from "./icon.jsx";
import Pressable from "./pressable.jsx";

const connect = guarded("suggestions.connect", (suggestionId, userId) => {
    log("connect_request", { user: userId, surface: "feed_suggestions", suggestion: suggestionId });
});

const dismiss = guarded("suggestions.dismiss", (suggestionId) => {
    log("suggestion_dismiss", { suggestion: suggestionId });
});

const SuggestionCard_suggestion = fragment("SuggestionCard_suggestion", {
    ...scalars("id mutual_count tracking"),
    user: scalars("id name avatar_seed is_verified"),
    mutual_friends: scalars("id name avatar_seed"),
});

const SuggestionCard = memo(function SuggestionCard({ suggestionRef }) {
    const suggestion = useFragment(SuggestionCard_suggestion, suggestionRef);
    const { user } = suggestion;
    return (
        <li className="border-divider bg-surface relative w-[180px] shrink-0 overflow-hidden rounded-lg border">
            <a href={`#/profile/${user.id}`} onClick={(event) => event.preventDefault()} tabIndex={-1}>
                <img className="aspect-square w-full object-cover" src={photo(user.avatar_seed * 3, 360, 360)} width="180" height="180" alt="" />
            </a>
            <span className="absolute right-2 top-2">
                <Pressable className="rounded-full bg-black/50 p-1 text-white" label={t("Remove {name} from suggestions", { name: user.name })} onPress={() => dismiss(suggestion.id)} data-log="suggestion_dismiss">
                    <Icon name="close" size={14} />
                </Pressable>
            </span>
            <div className="flex flex-col gap-1 p-3">
                <HovercardTrigger kind="user" id={user.id}>
                    <a className="text-primary truncate text-[15px] font-semibold hover:underline" href={`#/profile/${user.id}`} onClick={(event) => event.preventDefault()}>
                        <span>{user.name}</span>
                    </a>
                </HovercardTrigger>
                <div className="text-secondary flex h-5 items-center gap-1 text-[13px]">
                    {suggestion.mutual_count > 0
                        && <>
                            <span className="flex -space-x-1.5">
                                {suggestion.mutual_friends.map((friend) =>
                                    <span key={friend.id} className="border-surface rounded-full border">
                                        <Avatar seed={friend.avatar_seed} size={16} label={friend.name} />
                                    </span>
                                )}
                            </span>
                            <span className="truncate">{t("{count, plural, one {# shared connection} other {# shared connections}}", { count: suggestion.mutual_count })}</span>
                        </>
                    }
                </div>
                <Pressable className="bg-accent-soft text-accent mt-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[15px] font-semibold" onPress={() => connect(suggestion.id, user.id)} data-log="suggestion_connect">
                    <Icon name="userPlus" size={16} />
                    {t("Connect")}
                </Pressable>
            </div>
        </li>
    );
});

export const SuggestionsUnit_unit = fragment("SuggestionsUnit_unit", {
    ...scalars("id title"),
    suggestions: spread(SuggestionCard_suggestion),
});

const VISIBLE = 2;

export default function SuggestionsUnit({ id, position }) {
    const unit = useFragment(SuggestionsUnit_unit, id);
    const [offset, setOffset] = useState(0);
    const page = guarded("suggestions.page", (delta) => setOffset((value) => Math.max(0, Math.min(unit.suggestions.length - VISIBLE, value + delta))));
    return (
        <section className="bg-surface shadow-card overflow-hidden rounded-lg py-3" aria-label={t("Post {position, number}: {title}", { position: position + 1, title: unit.title })} data-log-scope="suggestions">
            <div className="flex items-center justify-between px-4 pb-3">
                <h3 className="text-primary text-[17px] font-semibold">{t(unit.title)}</h3>
                <Pressable className="text-secondary hover:bg-hover rounded-full p-2" label={t("More options for suggestions")} aria-haspopup="menu" data-log="suggestions_menu">
                    <Icon name="dots" size={20} strokeWidth={3} />
                </Pressable>
            </div>
            <div className="relative">
                <ul className="flex gap-2 px-4 transition-transform" style={{ transform: `translateX(-${offset * 188}px)` }}>
                    {unit.suggestions.map((ref) =>
                        <SuggestionCard key={ref.__id} suggestionRef={ref} />
                    )}
                </ul>
                {offset > 0
                    && <span className="absolute left-2 top-[80px]">
                        <Pressable className="bg-surface shadow-popover rounded-full p-2" label={t("Previous suggestions")} onPress={() => page(-VISIBLE)}>
                            <Icon name="chevronLeft" size={20} />
                        </Pressable>
                    </span>
                }
                <span className="absolute right-2 top-[80px]">
                    <Pressable className="bg-surface shadow-popover rounded-full p-2" label={t("Next suggestions")} onPress={() => page(VISIBLE)}>
                        <Icon name="chevronRight" size={20} />
                    </Pressable>
                </span>
            </div>
            <a className="text-accent mt-3 block px-4 text-[15px] font-semibold hover:underline" href="#/connections/suggestions" onClick={(event) => event.preventDefault()}>
                {t("See all")}
            </a>
        </section>
    );
}
