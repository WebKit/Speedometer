export default function ArticleTitle({ text, className }) {
    if (!text)
        return null;

    return <h3 className={className}>{text}</h3>;
}
