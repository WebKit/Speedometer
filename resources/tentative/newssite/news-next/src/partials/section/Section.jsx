import Article from "@/components/article/Article";

export default function Section({ section }) {
    return (
        <>
            <div id={section.id} className="row-header">
                <h2>{section.name}</h2>
            </div>
            <section className="row">
                {section.articles.map((article, index) =>
                    <Article key={`${section.id}-${index}`} article={article} />
                )}
            </section>
        </>
    );
}
