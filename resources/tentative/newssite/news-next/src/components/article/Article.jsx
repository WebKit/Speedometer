import Image from "next/image";

export default function Article({ article }) {
    return (
        <article className={`column ${article.type} article`}>
            <header className="article-header">
                <h2>{article.header}</h2>
            </header>
            <section className="article-body">
                <Image className="article-image" src={article.image.src} width={article.image.width} height={article.image.height} alt={article.image.alt} />
                <h3 className="article-title truncate-singleline">{article.title}</h3>
                <div className="article-content">
                    {Array.isArray(article.content)
                        ? <ul className="article-list">
                            {article.content.map((item, index) =>
                                <li key={`article-list-item-${index}`} className="article-list-item">{item}</li>
                            )}
                        </ul>
                        : article.content
                    }
                </div>
            </section>
        </article>
    );
}
