import ArticleImage from "./ArticleImage";

export default function ArticleContent({ type, content }) {
    if (type === "text") {
        return (
            <div className="article-content">{ content } </div>
        );
    }

    if (type === "list") {
        return (
            <div className="article-content">
                <ul className="article-list">
                    {content.map((item, index) =>
                        <li key={`article-list-item-${index}`} className="article-list-item">{item}</li>
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
                            <div className="truncate-multiline truncate-multiline-3">{item.text}</div>
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
            <>
                <ArticleImage className="article-image-container" image={content.image} />
                <h3 className="article-title truncate-multiline truncate-multiline-3">{content.title}</h3>
            </>
        );
    }

    return null;
}
