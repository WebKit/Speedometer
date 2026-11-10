import { useId } from "react";
import { avatar } from "../data/graphics.js";

// Drawn as a masked SVG image, so the online badge can cut a notch out of the photo
// and the outline stays crisp at any size.
export default function Avatar({ seed, size = 40, online = false, ring = false, square = false, label = "" }) {
    const maskId = useId();
    const radius = size / 2;
    const badge = Math.max(8, size * 0.24);
    const total = ring ? size + 8 : size;
    const offset = ring ? 4 : 0;
    return (
        <svg className="block shrink-0 overflow-visible" width={total} height={total} viewBox={`0 0 ${total} ${total}`} role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true}>
            <mask id={maskId}>
                {square ? <rect x={offset} y={offset} width={size} height={size} rx={size * 0.2} fill="white" /> : <circle cx={offset + radius} cy={offset + radius} r={radius} fill="white" />}
                {online && <circle cx={offset + size - badge / 2} cy={offset + size - badge / 2} r={badge / 2 + 2} fill="black" />}
            </mask>
            <g mask={`url(#${maskId})`}>
                <image x={offset} y={offset} width={size} height={size} href={avatar(seed)} preserveAspectRatio="xMidYMid slice" />
                {square
                    ? <rect className="fill-none stroke-black/10" x={offset + 0.5} y={offset + 0.5} width={size - 1} height={size - 1} rx={size * 0.2} />
                    : <circle className="fill-none stroke-black/10" cx={offset + radius} cy={offset + radius} r={radius - 0.5} />
                }
            </g>
            {ring && <circle className="stroke-accent fill-none" cx={total / 2} cy={total / 2} r={total / 2 - 1.5} strokeWidth="3" />}
            {online && <circle className="fill-online" cx={offset + size - badge / 2} cy={offset + size - badge / 2} r={badge / 2} />}
        </svg>
    );
}
