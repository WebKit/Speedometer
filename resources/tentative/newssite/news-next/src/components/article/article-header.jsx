export default function ArticleHeader({ text, className }) {
    if (!text)
        return null;

    return (
        <header className={className}>
            <h2>{text}</h2>
        </header>
    );
}
