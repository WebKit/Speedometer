/* eslint-disable @next/next/no-img-element */
// import Image from "next/image";
import ArticleText from "./article-text";
import ArticleTag from "./article-tag";

export default function ArticleImage({ image, className, meta }) {
    if (!image)
        return null;

    return (
        <>
            <div className={className}>
                {/* <Image className={className} src={image.src} width={image.width} height={image.height} alt={image.alt} /> */}
                <img className="article-image" src={image.src} width={image.width} height={image.height} alt={image.alt} />
                <ArticleTag tag={meta?.tag} />
            </div>
            <ArticleText className="article-image-captions" text={meta?.captions} />
        </>
    );
}
