import { v4 as uuidv4 } from "uuid";

import ArticleImage from "./article-image";
import ArticleText from "./article-text";

export default function ArticleContent({ type, content, display }) {
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
                <ul className={`article-list vertical ${display ?? ""}`}>
                    {content.map((item) =>
                        <li key={uuidv4()} className="article-list-item">
                            {item.url && !item.title ? <a href={item.url}>
                                <ArticleText text={item.content} />
                            </a> : <ArticleText text={item.content} />}
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    if (type === "articles-list") {
        return (
            <div className="article-list-content">
                <ul className="article-list vertical">
                    {content.map((item) =>
                        <li key={uuidv4()} className="article-list-item">
                            <ArticleText className="article-title truncate-multiline truncate-multiline-3" text={item.title} type="h3"/>
                            {item.url && !item.title ? <a href={item.url}>
                                <ArticleText text={item.content} />
                            </a> : <ArticleText text={item.content} />}
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    if (type === "excerpt") {
        return (
            <ul className="article-list horizontal">
                {content.map((item) =>
                    <li key={uuidv4()} className="article-list-item">
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
            <div className={`grid-container ${display ?? ""}`}>
                {content.map((item) =>
                    <div key={uuidv4()} className="grid-item">
                        <ArticleImage className="article-image-container" image={item.image} meta={item.meta} />

                        {item.url ? <a href={item.url}>
                            <ArticleText className="article-content truncate-multiline truncate-multiline-3" text={item.text} type="h3"/></a>
                            : <ArticleText className="article-content truncate-multiline truncate-multiline-3" text={item.text} type="h3"/>}
                    </div>
                )}
            </div>
        );
    }

    if (type === "preview") {
        return (
            <ul className="article-list vertical">
                {content.map((item) =>
                    <li key={uuidv4()} className="article-list-item">
                        <ArticleImage className="article-image-container" image={item.image} />
                        <ArticleText className="article-title truncate-multiline truncate-multiline-3" text={item.title} type="h3"/>
                    </li>
                )}
            </ul>
        );
    }

    return null;
}
