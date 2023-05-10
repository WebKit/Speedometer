import ArticleHeader from "./article-header";
import ArticleImage from "./article-image";
import ArticleText from "./article-text";
import ArticleContent from "./article-content";

export default function Article({ article }) {

    return (
        <article className={`column ${article.class ?? ""} article`}>
            <ArticleHeader className="article-header" text={article.header} link={article.url} />
            <section className="article-body">
                <ArticleImage className="article-image-container" image={article.image} meta={article.meta} />
                <ArticleText className="article-title truncate-singleline" text={article.title} type="h3"/>
                <ArticleContent type={article.type} content={article.content} display={article.display} />
            </section>
        </article>
    );
}
