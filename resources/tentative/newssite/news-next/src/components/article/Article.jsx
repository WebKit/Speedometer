import ArticleHeader from "./ArticleHeader";
import ArticleImage from "./ArticleImage";
import ArticleText from "./ArticleText";
import ArticleContent from "./ArticleContent";

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
