export default function ArticleText({ text, className, type = "p" }) {
    if (!text)
        return null;

    const Tag = type;
    return <Tag className={className}>{text}</Tag>;
}
