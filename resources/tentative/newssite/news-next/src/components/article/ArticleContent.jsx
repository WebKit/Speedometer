import Image from "next/image";

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

    if (type === "grid") {
        return (
            <div className="grid-container">
                {content.map((item, index) =>
                    <div key={`article-grid-item-${index}`} className="grid-item">
                        <Image className="article-image" src={item.image.src} width={item.image.width} height={item.image.height} alt={item.image.alt} />
                    </div>
                )}
            </div>
        );
    }

    return null;
}
