import { t } from "../i18n.js";

export const REACTION_GLYPHS = { like: "👍", love: "❤️", thanks: "🙏", laugh: "😂", celebrate: "🎉", wow: "🤩" };
const REACTION_COLORS = { like: "bg-reaction-like", love: "bg-reaction-love", thanks: "bg-reaction-care", laugh: "bg-reaction-warm", celebrate: "bg-reaction-care", wow: "bg-reaction-warm" };

export function ReactionStack({ reactions, size = 18 }) {
    return (
        <span className="flex -space-x-1">
            {reactions.map((reaction) =>
                <span
                    key={reaction.key}
                    className={`border-surface flex items-center justify-center rounded-full border-2 ${REACTION_COLORS[reaction.key]}`}
                    style={{ width: size, height: size, fontSize: size * 0.55 }}
                    aria-label={t("{kind}: {count, plural, one {# reaction} other {# reactions}}", { kind: reaction.key, count: reaction.count })}
                >
                    {REACTION_GLYPHS[reaction.key]}
                </span>
            )}
        </span>
    );
}
