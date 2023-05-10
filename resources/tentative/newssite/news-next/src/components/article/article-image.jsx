/* eslint-disable @next/next/no-img-element */
// import Image from "next/image";

export default function ArticleImage({ image, className }) {
    if (!image)
        return null;

    return (
        <div className={className}>
            {/* <Image className={className} src={image.src} width={image.width} height={image.height} alt={image.alt} /> */}
            <img className="article-image" src={image.src} width={image.width} height={image.height} alt={image.alt} />
        </div>
    );
}
