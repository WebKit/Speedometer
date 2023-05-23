import Article from "@/components/article/article";

export default function Section({ section }) {
    return (
        <>
            { section.name ? <div id={section.id} className="row-header">
                <h2>{section.name}</h2>
            </div> : null }
            <section className="row">
                {section.articles.map((article, index) =>
                    <Article key={`${section.id}-${index}`} article={article} />
                )}
            </section>
        </>
    );
}
