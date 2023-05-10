import ArticleImage from "./article-image";
import ArticleText from "./article-text";

export default function ArticleContent({ type, content }) {
    if (type === "text") {
        return (
            <div className="article-content">
                <ArticleText text={content} />
            </div>
        );
    }

    if (type === "list") {
        return (
            <div className="article-content">
                <ul className="article-list">
                    {content.map((item, index) =>
                        <li key={`article-list-item-${index}`} className="article-list-item">
                            <ArticleText text={item} />
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    if (type === "excerpt") {
        return (
            <ul className="article-list">
                {content.map((item, index) =>
                    <li key={`article-list-item-${index}`} className="article-list-item">
                        <ArticleImage className="article-hero" image={item.image} />
                        <div className="article-content">
                            <ArticleText className="truncate-multiline truncate-multiline-3" text={item.text} type="div" />
                        </div>
                    </li>
                )}
            </ul>
        );
    }

    if (type === "grid") {
        return (
            <div className="grid-container">
                {content.map((item, index) =>
                    <div key={`article-grid-item-${index}`} className="grid-item">
                        <ArticleImage className="article-image-container" image={item.image} />
                    </div>
                )}
            </div>
        );
    }

    if (type === "preview") {
        return (
            <ul className="article-list">
                {content.map((item, index) =>
                    <li key={`article-list-item-${index}`} className="article-list-item article-list-vertical">
                        <ArticleImage className="article-image-container" image={item.image} />
                        <ArticleText className="article-title truncate-multiline truncate-multiline-3" text={item.title} type="h3"/>
                    </li>
                )}
            </ul>
        );
    }

    return null;
}