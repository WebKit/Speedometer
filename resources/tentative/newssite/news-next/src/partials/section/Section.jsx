import TextArticle from "@/components/article/TextArticle";

export default function Section({ section }) {
    return (
        <>
            { section.name ? <div id={section.id} className="row-header">
                <h2>{section.name}</h2>
            </div> : null }
            <section className="row">
                {section.articles.map((article, index) =>
                    <TextArticle key={`${section.id}-${index}`} article={article} />
                )}
            </section>
        </>
    );
}
