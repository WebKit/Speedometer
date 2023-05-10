import ArticleText from "./article-text";
import LightningIcon from "@/assets/lightning-icon";
import PlayIcon from "@/assets/play-icon";
import FireIcon from "@/assets/fire-icon";

export default function ArticleTag({ tag }) {
    if (!tag)
        return null;

    return (
        <div className={`article-image-tag ${tag}`}>
            { tag === "breaking" ? <LightningIcon /> : null }
            { tag === "watch" ? <PlayIcon /> : null }
            { tag === "new" ? <FireIcon /> : null }
            <ArticleText text={tag} />
        </div>
    );
}
