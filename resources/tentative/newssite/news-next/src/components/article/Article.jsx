import ArticleHeader from "./article-header";
import ArticleImage from "./article-image";
import ArticleText from "./article-text";
import ArticleContent from "./article-content";

export default function Article({ article }) {

    return (
        <article className={`column ${article.class ?? ""} article`}>
            <ArticleHeader className="article-header" text={article.header} />
            <section className="article-body">
                <ArticleImage className="article-image-container" image={article.image} />
                <ArticleText className="article-title truncate-singleline" text={article.title} type="h3"/>
                <ArticleContent type={article.type} content={article.content} />
            </section>
        </article>
    );
}
