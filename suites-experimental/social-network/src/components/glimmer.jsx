export function GlimmerLine({ width = "100%", height = 10 }) {
    return <span className="bg-glimmer block animate-pulse rounded-full" style={{ width, height }} />;
}

export function GlimmerRow({ avatarSize = 40, lines = 2 }) {
    const widths = ["70%", "45%", "60%"];
    return (
        <div className="flex items-center gap-3 px-3 py-2" aria-hidden="true">
            <span className="bg-glimmer block shrink-0 animate-pulse rounded-full" style={{ width: avatarSize, height: avatarSize }} />
            <div className="flex flex-1 flex-col gap-2">
                {widths.slice(0, lines).map((width) =>
                    <GlimmerLine key={width} width={width} />
                )}
            </div>
        </div>
    );
}

export function GlimmerStory() {
    return (
        <div className="bg-surface shadow-card rounded-lg p-4" aria-busy="true" aria-label="Loading post">
            <GlimmerRow />
            <div className="mt-3 flex flex-col gap-2">
                <GlimmerLine width="92%" />
                <GlimmerLine width="80%" />
                <GlimmerLine width="40%" />
            </div>
            <div className="bg-glimmer mt-4 h-48 animate-pulse rounded-md" />
        </div>
    );
}
