export const content = {
    home: {
        name: "Front Page",
        url: "/",
        priority: 0,
        notification: {
            name: "cookies",
            title: "This website uses cookies 🍪",
            description: "We use cookies to improve your experience on our site and to show you the most relevant content possible. To find out more, please read our privacy policy and our cookie policy.",
            actions: [
                {
                    name: "Cancel",
                    priority: "secondary",
                    type: "reject"
                },
                {
                    name: "Accept",
                    priority: "primary",
                    type: "accept"
                }
            ]
        },
        sections: [
            {
                id: "content-frontpage-breaking-news",
                name: "Breaking News",
                articles: [
                    {
                        class: "columns-3-narrow",
                        header: "Uncensored",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Nisl nunc mi ipsum faucibus vitae aliquet.",
                        type: "text",
                        content:
                            "Velit dignissim sodales ut eu. Sed tempus urna et pharetra. Porttitor rhoncus dolor purus non. Elementum curabitur vitae nunc sed velit dignissim sodales.\n\nPretium fusce id velit ut tortor pretium viverra suspendisse potenti. In nulla posuere sollicitudin aliquam ultrices sagittis orci. Aliquam sem fringilla ut morbi tincidunt augue interdum velit. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Nunc mi ipsum faucibus vitae aliquet.",
                    },
                    {
                        class: "columns-3-wide",
                        header: "More top stories",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: "breaking",
                        },
                        title: "Justo eget magna fermentum iaculis eu non diam phasellus vestibulum.",
                        type: "text",
                        content:
                            "Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere. Arcu bibendum at varius vel pharetra vel turpis nunc. Eget dolor morbi non arcu risus quis varius. Ac odio tempor orci dapibus ultrices in.\n\nAmet tellus cras adipiscing enim eu turpis. Tortor pretium viverra suspendisse potenti nullam. Condimentum vitae sapien pellentesque habitant morbi. Ultrices in iaculis nunc sed augue lacus viverra vitae.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Crime & justice",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Eu sem integer vitae justo eget magna fermentum iaculis.",
                        type: "text",
                        content:
                            "Volutpat commodo sed egestas egestas. Eget lorem dolor sed viverra ipsum nunc aliquet bibendum enim. Felis eget velit aliquet sagittis id consectetur purus. Lorem ipsum dolor sit amet. Ut diam quam nulla porttitor. Id volutpat lacus laoreet non.",
                    },
                ],
            },
            {
                id: "content-frontpage-latest-news",
                name: "Latest News",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Happening Now",
                        type: "articles-list",
                        content: [
                            {
                                title: "Lorem ipsum dolor sit amet.",
                                content: "Molestie nunc non blandit massa enim nec. Ornare suspendisse sed nisi lacus sed viverra tellus in. Id consectetur purus ut faucibus. At auctor urna nunc id cursus metus. Eget aliquet nibh praesent tristique magna. Morbi tristique senectus et netus et malesuada fames.",
                            },
                            {
                                title: "Consectetur adipiscing elit.",
                                content: "Sit amet consectetur adipiscing elit ut aliquam purus sit. Consequat nisl vel pretium lectus quam. Sagittis id consectetur purus ut faucibus pulvinar elementum integer enim. Nec sagittis aliquam malesuada bibendum arcu.",
                            },
                            {
                                title: "Sed do eiusmod tempor incididunt.",
                                content: "Pulvinar neque laoreet suspendisse interdum consectetur libero id faucibus nisl. Pulvinar elementum integer enim neque volutpat ac. Lorem donec massa sapien faucibus.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Noteworthy",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Augue neque gravida in fermentum et sollicitudin ac orci.",
                        type: "list",
                        content: [
                            {
                                content: "Odio morbi quis commodo odio aenean sed adipiscing diam donec.",
                            },
                            {
                                content: "Consequat semper viverra nam libero justo laoreet sit.",
                            },
                            {
                                content: "Risus ultricies tristique nulla aliquet enim tortor at auctor.",
                            },
                            {
                                content: "Diam vulputate ut pharetra sit amet aliquam id diam maecenas.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Around the Globe",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Volutpat est velit egestas dui id ornare arcu.",
                        type: "list",
                        content: [
                            {
                                content: "Nibh mauris cursus mattis molestie. Varius vel pharetra vel turpis nunc eget lorem dolor.",
                            },
                            {
                                content: "Turpis egestas maecenas pharetra convallis posuere morbi leo urna molestie.",
                            },
                            {
                                content: "Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat.",
                            },
                            {
                                content: "Fermentum dui faucibus in ornare. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-latest-media",
                name: "Latest Media",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-highlights",
                name: "Highlights",
                articles: [
                    {
                        class: "columns-wrap",
                        header: "Domestic Highlights",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "At urna condimentum mattis pellentesque id nibh tortor id. Urna cursus eget nunc scelerisque viverra mauris in. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Enim lobortis scelerisque fermentum dui faucibus in. Vitae semper quis lectus nulla at volutpat. In nisl nisi scelerisque eu ultrices vitae auctor.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Lorem donec massa sapien faucibus et molestie ac feugiat. Quis varius quam quisque id diam vel. Ut tristique et egestas quis ipsum suspendisse. Fermentum posuere urna nec tincidunt praesent semper feugiat.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Global Highlights",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Augue eget arcu dictum varius duis at consectetur. Ornare arcu dui vivamus arcu felis bibendum ut. Magna eget est lorem ipsum dolor sit amet. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada proin.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Leo urna molestie at elementum eu facilisis sed. Est lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nisi scelerisque eu ultrices vitae auctor. Quis risus sed vulputate odio. Pellentesque sit amet porttitor eget dolor morbi non. Nullam eget felis eget nunc lobortis mattis aliquam.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Local Highlights",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Mattis ullamcorper velit sed ullamcorper. Orci ac auctor augue mauris augue neque. Condimentum mattis pellentesque id nibh tortor.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Fermentum odio eu feugiat pretium. Urna nec tincidunt praesent semper feugiat nibh sed. Adipiscing elit ut aliquam purus sit.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Vitae tempus quam pellentesque nec nam aliquam sem et. Fringilla urna porttitor rhoncus dolor purus non enim praesent elementum. Congue nisi vitae suscipit tellus mauris a diam maecenas. Quis varius quam quisque id diam.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-top-stories",
                name: "Top Stories",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        display: "grid-wrap",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Ut venenatis tellus in metus vulputate eu scelerisque. In nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Mattis nunc sed blandit libero volutpat sed cras ornare arcu. Scelerisque eu ultrices vitae auctor eu augue. Libero justo laoreet sit amet cursus sit amet.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Non consectetur a erat nam. Blandit massa enim nec dui nunc mattis enim ut. Tempor orci eu lobortis elementum nibh tellus molestie nunc. Facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Eget est lorem ipsum dolor sit amet. Vivamus at augue eget arcu dictum varius duis at consectetur. Scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis. Vitae sapien pellentesque habitant morbi tristique senectus et.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Diam in arcu cursus euismod quis viverra nibh cras pulvinar. Est velit egestas dui id ornare arcu odio ut sem. A cras semper auctor neque. Ipsum suspendisse ultrices gravida dictum fusce ut.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Tellus integer feugiat scelerisque varius morbi enim. Diam donec adipiscing tristique risus nec feugiat in fermentum. Volutpat odio facilisis mauris sit amet massa vitae. Tempor orci dapibus ultrices in iaculis nunc sed. Aenean vel elit scelerisque mauris pellentesque pulvinar.",
                                url: "#"
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-international",
                name: "International",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Europe",
                        type: "articles-list",
                        content: [
                            {
                                title: "Commodo elit at imperdiet dui accumsan sit amet. Habitasse platea dictumst vestibulum rhoncus.",
                                content: "Orci ac auctor augue mauris augue neque gravida. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Sagittis aliquam malesuada bibendum arcu vitae. Pellentesque habitant morbi tristique senectus et netus. Etiam erat velit scelerisque in dictum non consectetur a.",
                            },
                            {
                                title: "Netus et malesuada fames ac turpis egestas maecenas pharetra.",
                                content: "Facilisis leo vel fringilla est. Turpis tincidunt id aliquet risus feugiat in ante metus. Viverra ipsum nunc aliquet bibendum enim facilisis. Tristique et egestas quis ipsum suspendisse ultrices gravida dictum. Tristique senectus et netus et malesuada fames ac turpis egestas.",
                            },
                            {
                                title: "Ornare suspendisse sed nisi lacus sed viverra tellus in.",
                                content: "Dui vivamus arcu felis bibendum. Purus ut faucibus pulvinar elementum integer enim neque volutpat ac. Auctor eu augue ut lectus arcu bibendum. Diam volutpat commodo sed egestas egestas fringilla phasellus.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "South America",
                        type: "articles-list",
                        content: [
                            {
                                title: "Augue eget arcu dictum varius duis.",
                                content: "Commodo ullamcorper a lacus vestibulum sed arcu non. Nullam ac tortor vitae purus faucibus ornare suspendisse sed. Id interdum velit laoreet id donec ultrices tincidunt arcu non.",
                            },
                            {
                                title: "Fringilla ut morbi tincidunt augue interdum velit euismod in pellentesque.",
                                content: "Turpis egestas maecenas pharetra convallis posuere morbi leo. Odio pellentesque diam volutpat commodo. Ornare massa eget egestas purus viverra accumsan in nisl nisi. Tellus integer feugiat scelerisque varius morbi enim nunc. Erat velit scelerisque in dictum non consectetur.",
                            },
                            {
                                title: "Mi bibendum neque egestas congue quisque.",
                                content: "Sapien eget mi proin sed libero. Adipiscing elit duis tristique sollicitudin nibh sit. Faucibus scelerisque eleifend donec pretium. Ac tortor dignissim convallis aenean et tortor at risus.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Asia",
                        type: "articles-list",
                        content: [
                            {
                                title: "Sodales ut etiam sit amet nisl purus in. Enim sed faucibus turpis in eu mi bibendum neque.",
                                content: "Tortor id aliquet lectus proin. Pulvinar elementum integer enim neque volutpat ac tincidunt. Auctor eu augue ut lectus arcu bibendum at varius. Congue mauris rhoncus aenean vel elit scelerisque mauris.",
                            },
                            {
                                title: "haretra convallis posuere morbi leo urna.",
                                content: "Egestas diam in arcu cursus euismod quis. Ac turpis egestas integer eget aliquet nibh praesent tristique magna. Molestie at elementum eu facilisis sed odio morbi quis. Lectus arcu bibendum at varius. Eros in cursus turpis massa tincidunt dui.",
                            },
                            {
                                title: "At varius vel pharetra vel turpis nunc eget lorem dolor. ",
                                content: "Proin sagittis nisl rhoncus mattis rhoncus urna neque viverra. Lacus sed viverra tellus in. Sed nisi lacus sed viverra tellus in. Venenatis cras sed felis eget velit aliquet sagittis id consectetur.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-featured",
                name: "Featured",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Washington",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Et netus et malesuada fames ac.",
                        type: "list",
                        display: "bullets",
                        content: [
                            {
                                content: "Vulputate dignissim suspendisse in est ante.",
                                url: "#",
                            },
                            {
                                content: "Blandit turpis cursus in hac habitasse platea dictumst.",
                                url: "#",
                            },
                            {
                                content: "Sed nisi lacus sed viverra tellus in hac.",
                                url: "#",
                            },
                            {
                                content: "Euismod in pellentesque massa placerat duis ultricies lacus sed.",
                                url: "#",
                            },
                            {
                                content: "Quam lacus suspendisse faucibus interdum posuere.",
                                url: "#",
                            },
                            {
                                content: "Sit amet mattis vulputate enim nulla aliquet porttitor lacus.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "New York",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Commodo quis imperdiet massa tincidunt nunc pulvinar sapien et ligula.",
                        type: "list",
                        display: "bullets",
                        content: [
                            {
                                content: "Id semper risus in hendrerit gravida rutrum quisque non.",
                                url: "#",
                            },
                            {
                                content: "Sit amet est placerat in egestas erat imperdiet sed euismod.",
                                url: "#",
                            },
                            {
                                content: "Aliquam malesuada bibendum arcu vitae elementum curabitur vitae nunc.",
                                url: "#",
                            },
                            {
                                content: "get gravida cum sociis natoque. Bibendum ut tristique et egestas.",
                                url: "#",
                            },
                            {
                                content: "Mauris cursus mattis molestie a iaculis at erat.",
                                url: "#",
                            },
                            {
                                content: "Sit amet massa vitae tortor condimentum lacinia.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Los Angeles",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Parturient montes nascetur ridiculus mus mauris.",
                        type: "list",
                        display: "bullets",
                        content: [
                            {
                                content: "Mattis enim ut tellus elementum sagittis.",
                                url: "#",
                            },
                            {
                                content: "Sit amet venenatis urna cursus eget nunc scelerisque viverra mauris.",
                                url: "#",
                            },
                            {
                                content: "Mi bibendum neque egestas congue quisque egestas.",
                                url: "#",
                            },
                            {
                                content: "Nunc scelerisque viverra mauris in aliquam.",
                                url: "#",
                            },
                            {
                                content: "Egestas erat imperdiet sed euismod nisi porta lorem mollis aliquam.",
                                url: "#",
                            },
                            {
                                content: "Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt tortor aliquam.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-paid-content",
                name: "Paid Content",
                articles: [
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Quam lacus suspendisse faucibus interdum. In pellentesque massa placerat duis ultricies lacus sed. Convallis a cras semper auctor neque vitae tempus quam. Ut pharetra sit amet aliquam id diam.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Eu feugiat pretium nibh ipsum consequat.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Non tellus orci ac auctor augue mauris augue neque gravida. Nulla facilisi nullam vehicula ipsum a arcu cursus vitae. Quam nulla porttitor massa id neque aliquam vestibulum morbi. Diam quis enim lobortis scelerisque.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Haretra diam sit amet nisl suscipit adipiscing bibendum est ultricies. Senectus et netus et malesuada fames.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "It amet porttitor eget dolor morbi non. Sed lectus vestibulum mattis ullamcorper. Laoreet id donec ultrices tincidunt arcu non. Quam adipiscing vitae proin sagittis.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Mollis aliquam ut porttitor leo a diam. Nunc aliquet bibendum enim facilisis gravida neque convallis.",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    us: {
        name: "US",
        url: "/us",
        priority: 1,
        message: {
            title: "Watch breaking news!",
            description: "Something important happened and you should watch it!"
        },
        sections: [
            {
                id: "content-us-world-news",
                name: "World News",
                articles: [
                    {
                        class: "columns-3-wide",
                        header: "Happening Today",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: "breaking",
                        },
                        title: "Sed egestas egestas fringilla phasellus faucibus scelerisque eleifend.",
                        type: "text",
                        content:
                            "Iaculis urna id volutpat lacus. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Dictum varius duis at consectetur lorem donec. At tellus at urna condimentum mattis pellentesque id. Consectetur lorem donec massa sapien faucibus et molestie ac. Risus at ultrices mi tempus.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Trending",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Ut eu sem integer vitae justo eget magna.",
                        type: "text",
                        content:
                            "Id neque aliquam vestibulum morbi blandit cursus risus at ultrices. Arcu dui vivamus arcu felis bibendum ut tristique et. Justo donec enim diam vulputate ut.\n\nPellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at. Ipsum suspendisse ultrices gravida dictum fusce ut placerat. Convallis tellus id interdum velit laoreet id.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Weather",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Id consectetur purus ut faucibus pulvinar elementum integer enim.",
                        type: "list",
                        content: [
                            {
                                content: "Pellentesque habitant morbi tristique senectus et. Vel eros donec ac odio tempor orci dapibus ultrices in.",
                            },
                            {
                                content: "Et odio pellentesque diam volutpat commodo sed egestas egestas fringilla.",
                            },
                            {
                                content: "Et netus et malesuada fames ac turpis egestas. Maecenas ultricies mi eget mauris pharetra et ultrices.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-around-the-nation",
                name: "Around the Nation",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Latest",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Nullam eget felis eget nunc lobortis mattis aliquam.",
                        type: "list",
                        content: [
                            {
                                content: "Nibh ipsum consequat nisl vel. Senectus et netus et malesuada fames.",
                            },
                            {
                                content: "Lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi.",
                            },
                            {
                                content: "Blandit volutpat maecenas volutpat blandit aliquam etiam erat.",
                            },
                            {
                                content: "Non curabitur gravida arcu ac. Est sit amet facilisis magna etiam tempor orci eu lobortis.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Business",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Vestibulum rhoncus est pellentesque elit. Enim lobortis scelerisque fermentum dui faucibus.",
                        type: "list",
                        content: [
                            {
                                content: "Sapien pellentesque habitant morbi tristique senectus et.",
                            },
                            {
                                content: "Aliquet eget sit amet tellus cras adipiscing.",
                            },
                            {
                                content: "Tellus mauris a diam maecenas sed enim ut sem viverra.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Politics",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Hendrerit dolor magna eget est. Nec dui nunc mattis enim ut tellus elementum sagittis.",
                        type: "list",
                        content: [
                            {
                                content: "Euismod elementum nisi quis eleifend quam adipiscing vitae proin sagittis.",
                            },
                            {
                                content: "Ac tincidunt vitae semper quis lectus nulla at volutpat diam.",
                            },
                            {
                                content: "In mollis nunc sed id semper risus in hendrerit. Turpis massa sed elementum tempus egestas sed sed risus. Imperdiet proin fermentum leo vel orci.",
                            },
                            {
                                content: "Nisl purus in mollis nunc sed id semper. Pretium lectus quam id leo in vitae.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-roundup",
                name: "Roundup",
                articles: [
                    {
                        class: "columns-wrap",
                        header: "Washington",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nisl nisi scelerisque eu ultrices vitae. Consectetur adipiscing elit duis tristique sollicitudin. Ornare suspendisse sed nisi lacus. Justo eget magna fermentum iaculis.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Tellus integer feugiat scelerisque varius morbi enim. Ut tristique et egestas quis.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nulla malesuada pellentesque elit eget gravida cum sociis natoque penatibus.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "East Coast",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Pharetra et ultrices neque ornare aenean euismod elementum nisi. Ipsum dolor sit amet consectetur adipiscing elit ut.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Quam vulputate dignissim suspendisse in est. Vestibulum mattis ullamcorper velit sed.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Habitant morbi tristique senectus et netus et. Ullamcorper sit amet risus nullam eget felis.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "West Coast",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Bibendum enim facilisis gravida neque convallis a cras. Semper feugiat nibh sed pulvinar proin gravida hendrerit.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Vel facilisis volutpat est velit. Odio ut sem nulla pharetra diam sit amet nisl.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Risus nec feugiat in fermentum posuere urna nec. Massa tincidunt nunc pulvinar sapien.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-crime+justice",
                name: "Crime & Justice",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Supreme Court",
                        type: "articles-list",
                        content: [
                            {
                                title: "Vel risus commodo viverra maecenas.",
                                content: "Vitae tempus quam pellentesque nec nam aliquam sem. Mi in nulla posuere sollicitudin aliquam ultrices sagittis. Leo integer malesuada nunc vel. Ultricies integer quis auctor elit sed vulputate. Sit amet justo donec enim diam vulputate. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar.",
                            },
                            {
                                title: "Sit amet mattis vulputate enim.",
                                content: "Urna porttitor rhoncus dolor purus non. Tristique senectus et netus et malesuada fames ac turpis egestas. Suscipit tellus mauris a diam maecenas. Risus ultricies tristique nulla aliquet enim. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper.",
                            },
                            {
                                title: "Mauris in aliquam sem fringilla ut morbi tincidunt.",
                                content: "A erat nam at lectus. Orci sagittis eu volutpat odio facilisis mauris sit. Faucibus nisl tincidunt eget nullam non. Nisl condimentum id venenatis a. Suscipit tellus mauris a diam maecenas sed enim. Orci nulla pellentesque dignissim enim sit amet venenatis. Est ultricies integer quis auctor.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Local Law",
                        type: "articles-list",
                        content: [
                            {
                                title: "Sit amet justo donec enim diam vulputate ut.",
                                content: "Tincidunt dui ut ornare lectus sit amet est. Risus sed vulputate odio ut enim blandit volutpat maecenas volutpat. Posuere urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Euismod in pellentesque massa placerat duis.",
                            },
                            {
                                title: "Aliquam ultrices sagittis orci a scelerisque purus semper eget duis.",
                                content: "Lobortis feugiat vivamus at augue eget arcu. Id ornare arcu odio ut sem nulla pharetra diam. Mauris in aliquam sem fringilla ut morbi tincidunt augue interdum. Congue quisque egestas diam in arcu cursus euismod quis viverra.",
                            },
                            {
                                title: "In metus vulputate eu scelerisque felis imperdiet proin.",
                                content: "Elementum pulvinar etiam non quam. Id nibh tortor id aliquet lectus proin nibh. Elementum facilisis leo vel fringilla est ullamcorper eget. Dictum sit amet justo donec enim diam vulputate.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Opinion",
                        type: "articles-list",
                        content: [
                            {
                                title: "Magna ac placerat vestibulum lectus.",
                                content: "enenatis urna cursus eget nunc scelerisque viverra mauris. Convallis posuere morbi leo urna molestie at elementum. Eu lobortis elementum nibh tellus. Vitae purus faucibus ornare suspendisse sed nisi lacus sed viverra.",
                            },
                            {
                                title: "Nisl rhoncus mattis rhoncus urna neque viverra justo.",
                                content: "Tristique sollicitudin nibh sit amet. Aliquam purus sit amet luctus venenatis. Vitae nunc sed velit dignissim sodales ut. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus. Sit amet risus nullam eget.",
                            },
                            {
                                title: "Sed felis eget velit aliquet sagittis id consectetur purus ut.",
                                content: "Egestas erat imperdiet sed euismod nisi porta. Vel orci porta non pulvinar neque laoreet. Urna condimentum mattis pellentesque id nibh. Arcu non sodales neque sodales ut etiam sit amet. Elementum curabitur vitae nunc sed velit dignissim.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-around-the-us",
                name: "Around the US",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Latest",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Ut tortor pretium viverra suspendisse potenti nullam ac tortor.",
                        type: "list",
                        content: [
                            {
                                content: "Erat pellentesque adipiscing commodo elit at. Ornare lectus sit amet est placerat in."
                            },
                            {
                                content: "Dui ut ornare lectus sit amet est placerat in egestas. Commodo sed egestas egestas fringilla phasellus.",
                            },
                            {
                                content: "Mi quis hendrerit dolor magna eget est lorem ipsum. Urna molestie at elementum eu facilisis sed odio morbi.",
                            },
                            {
                                content: "Mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Business",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Nam at lectus urna duis convallis convallis tellus id. Sem nulla pharetra diam sit amet nisl.",
                        type: "list",
                        content: [
                            {
                                content: "Nunc faucibus a pellentesque sit amet. Id velit ut tortor pretium viverra suspendisse potenti nullam ac.",
                            },
                            {
                                content: "Eget mi proin sed libero enim sed. A scelerisque purus semper eget duis at tellus.",
                            },
                            {
                                content: "Praesent tristique magna sit amet purus. Eros in cursus turpis massa.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Politics",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Tristique nulla aliquet enim tortor at auctor urna nunc.",
                        type: "list",
                        content: [
                            {
                                content: "Tincidunt ornare massa eget egestas purus viverra accumsan in nisl. Amet mattis vulputate enim nulla.",
                            },
                            {
                                content: "Pellentesque massa placerat duis ultricies. Tortor at auctor urna nunc id cursus.",
                            },
                            {
                                content: "Venenatis urna cursus eget nunc scelerisque viverra mauris.",
                            },
                            {
                                content: "Dolor morbi non arcu risus quis varius quam quisque id.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-latest-media",
                name: "Latest Media",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-business",
                name: "Business",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Local",
                        type: "articles-list",
                        content: [
                            {
                                title: "Sed viverra tellus in hac habitasse platea dictumst vestibulum.",
                                content: "Maecenas volutpat blandit aliquam etiam. Diam volutpat commodo sed egestas egestas fringilla phasellus faucibus scelerisque. Est ullamcorper eget nulla facilisi etiam dignissim diam quis. Tincidunt praesent semper feugiat nibh sed pulvinar proin gravida hendrerit. Varius vel pharetra vel turpis nunc eget. Enim ut tellus elementum sagittis vitae et leo duis.",
                            },
                            {
                                title: "Porttitor leo a diam sollicitudin tempor id eu nisl.",
                                content: "Ut diam quam nulla porttitor massa id neque. Nulla facilisi etiam dignissim diam quis enim lobortis. Quam nulla porttitor massa id. Neque ornare aenean euismod elementum nisi quis eleifend quam adipiscing. Justo nec ultrices dui sapien eget mi. Volutpat diam ut venenatis tellus in. Mi in nulla posuere sollicitudin aliquam ultrices.",
                            },
                            {
                                title: "Leo vel orci porta non pulvinar neque laoreet.",
                                content: "Placerat duis ultricies lacus sed. Pellentesque adipiscing commodo elit at imperdiet dui. Accumsan lacus vel facilisis volutpat. Condimentum lacinia quis vel eros donec ac. Pellentesque habitant morbi tristique senectus. Ultrices eros in cursus turpis massa tincidunt dui ut ornare. Rhoncus urna neque viverra justo nec ultrices dui sapien. Amet venenatis urna cursus eget.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Global",
                        type: "articles-list",
                        content: [
                            {
                                title: "Platea dictumst quisque sagittis purus sit amet volutpat consequat mauris.",
                                content: "Eu lobortis elementum nibh tellus molestie nunc. Vel turpis nunc eget lorem dolor sed viverra. Massa sapien faucibus et molestie ac feugiat sed. Sed egestas egestas fringilla phasellus faucibus. At erat pellentesque adipiscing commodo elit at imperdiet dui accumsan",
                            },
                            {
                                title: "Ultrices gravida dictum fusce ut placerat orci nulla pellentesque.",
                                content: "Velit ut tortor pretium viverra suspendisse potenti nullam ac tortor. Feugiat nibh sed pulvinar proin gravida. Feugiat in fermentum posuere urna nec tincidunt praesent. Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. A scelerisque purus semper eget.",
                            },
                            {
                                title: "Est ullamcorper eget nulla facilisi etiam.",
                                content: "Augue mauris augue neque gravida in fermentum et. Ornare arcu odio ut sem nulla pharetra diam. Tristique et egestas quis ipsum suspendisse ultrices gravida. Aliquam vestibulum morbi blandit cursus risus at ultrices mi. Non blandit massa enim nec dui nunc mattis.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Quarterly",
                        type: "articles-list",
                        content: [
                            {
                                title: "Non curabitur gravida arcu ac tortor dignissim.",
                                content: "Dui nunc mattis enim ut. Non consectetur a erat nam. Arcu vitae elementum curabitur vitae nunc sed velit dignissim. Congue quisque egestas diam in arcu cursus euismod quis viverra. Consequat semper viverra nam libero justo laoreet sit amet.",
                            },
                            {
                                title: "Velit egestas dui id ornare arcu odio ut.",
                                content: "At ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Aenean et tortor at risus viverra. Lectus magna fringilla urna porttitor rhoncus dolor. Posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Euismod in pellentesque massa placerat duis ultricies lacus sed turpis.",
                            },
                            {
                                title: "Malesuada nunc vel risus commodo viverra maecenas accumsan lacus vel.",
                                content: "Nunc eget lorem dolor sed. Amet aliquam id diam maecenas ultricies mi. Sodales ut etiam sit amet nisl purus. Consectetur adipiscing elit ut aliquam purus sit amet luctus venenatis. Fusce ut placerat orci nulla pellentesque dignissim enim sit.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-paid-content",
                name: "Paid Content",
                articles: [
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Mi tempus imperdiet nulla malesuada pellentesque elit eget gravida cum. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Sed cras ornare arcu dui vivamus arcu. Blandit aliquam etiam erat velit scelerisque in. Nisl rhoncus mattis rhoncus urna neque viverra.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc sed id semper risus in hendrerit gravida rutrum. Ac felis donec et odio pellentesque diam volutpat commodo sed.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Semper quis lectus nulla at volutpat diam ut venenatis tellus. Felis eget nunc lobortis mattis aliquam faucibus purus in massa. Et malesuada fames ac turpis.",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    world: {
        name: "World",
        url: "/world",
        priority: 1,
        sections: [
            {
                id: "content-world-global-trends",
                name: "Global trends",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Africa",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Sed id semper risus in hendrerit gravida. Sagittis orci a scelerisque purus semper eget duis at tellus.",
                        type: "text",
                        content:
                            "Quam viverra orci sagittis eu volutpat odio facilisis mauris sit. Magna fringilla urna porttitor rhoncus dolor purus non enim praesent. Pellentesque sit amet porttitor eget dolor morbi non arcu risus. Dictum varius duis at consectetur. Ut porttitor leo a diam sollicitudin tempor id eu nisl.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "China",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Convallis aenean et tortor at risus. Pellentesque elit eget gravida cum sociis natoque penatibus.",
                        type: "text",
                        content:
                            "Auctor urna nunc id cursus metus aliquam. Amet commodo nulla facilisi nullam. Blandit massa enim nec dui nunc mattis enim ut. Et netus et malesuada fames ac turpis. Pellentesque habitant morbi tristique senectus et netus et malesuada. Habitant morbi tristique senectus et netus et malesuada fames ace.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Russia",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Pharetra magna ac placerat vestibulum lectus mauris ultrices eros.",
                        type: "list",
                        content: [
                            {
                                content: "Luctus venenatis lectus magna fringilla urna porttitor rhoncus.",
                            },
                            {
                                content: "Placerat orci nulla pellentesque dignissim enim sit amet venenatis.",
                            },
                            {
                                content: "Pellentesque nec nam aliquam sem et.",
                            },
                            {
                                content: "In hendrerit gravida rutrum quisque non tellus.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-around-the-world",
                name: "Around the world",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Europe",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Porttitor massa id neque aliquam vestibulum. Semper auctor neque vitae tempus quam.",
                        type: "text",
                        content:
                            "Metus vulputate eu scelerisque felis imperdiet proin fermentum leo vel. Nisi scelerisque eu ultrices vitae auctor eu. Risus pretium quam vulputate dignissim suspendisse. Pulvinar neque laoreet suspendisse interdum. Mauris cursus mattis molestie a iaculis at erat.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Middle East",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Et molestie ac feugiat sed lectus vestibulum mattis.",
                        type: "text",
                        content:
                            "Suspendisse interdum consectetur libero id faucibus nisl tincidunt eget nullam. Cursus vitae congue mauris rhoncus aenean vel elit scelerisque mauris. Quam vulputate dignissim suspendisse in est ante in nibh mauris.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Asia",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Metus dictum at tempor commodo.",
                        type: "list",
                        content: [
                            {
                                content: "Id faucibus nisl tincidunt eget nullam non nisi.",
                            },
                            {
                                content: "Lectus quam id leo in vitae turpis massa.",
                            },
                            {
                                content: "Urna nec tincidunt praesent semper feugiat nibh sed. Sed turpis tincidunt id aliquet risus.",
                            },
                            {
                                content: "Eu ultrices vitae auctor eu augue ut lectus.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-latest-media",
                name: "Latest Media",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-today",
                name: "Today",
                articles: [
                    {
                        class: "columns-3-wide",
                        header: "Unrest",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: "breaking",
                        },
                        title: "Viverra aliquet eget sit amet. In fermentum posuere urna nec.",
                        type: "list",
                        content: [
                            {
                                content: "Massa enim nec dui nunc mattis. Ornare lectus sit amet est placerat in.",
                            },
                            {
                                content: "Morbi tristique senectus et netus et malesuada fames ac turpis.",
                            },
                            {
                                content: "Fed vulputate mi sit amet mauris commodo quis imperdiet massa.",
                            },
                            {
                                content: "In egestas erat imperdiet sed euismod nisi porta lorem mollis. Scelerisque eu ultrices vitae auctor eu augue ut lectus arcu.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Happening now",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Semper auctor neque vitae tempus quam pellentesque nec nam aliquam.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Viverra maecenas accumsan lacus vel facilisis volutpat.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Orci sagittis eu volutpat odio facilisis mauris sit.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Noteworthy",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc aliquet bibendum enim facilisis gravida neque convallis a.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Ut diam quam nulla porttitor massa id neque aliquam vestibulum.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Magna fermentum iaculis eu non diam phasellus vestibulum lorem.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-featured",
                name: "Featured",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "European Union",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Luctus venenatis lectus magna fringilla urna.",
                        type: "list",
                        content: [
                            {
                                content: "Nulla facilisi cras fermentum odio eu. Porttitor lacus luctus accumsan tortor posuere ac ut.",
                            },
                            {
                                content: "Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Leo vel orci porta non. Sem nulla pharetra diam sit amet nisl.",
                            },
                            {
                                content: "Justo donec enim diam vulputate ut pharetra sit amet aliquam. Eu consequat ac felis donec et.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Britain",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Orci a scelerisque purus semper eget duis.",
                        type: "text",
                        content:
                            "Gravida rutrum quisque non tellus orci ac auctor augue mauris. Enim ut sem viverra aliquet eget. Sit amet volutpat consequat mauris nunc congue nisi vitae.\n\nPraesent tristique magna sit amet purus gravida quis blandit turpis. Commodo odio aenean sed adipiscing diam donec adipiscing tristique risus. Quam quisque id diam vel quam elementum.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Latin America",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Congue nisi vitae suscipit tellus.",
                        type: "list",
                        display: "bullets",
                        content: [
                            {
                                content: "Ut venenatis tellus in metus vulputate.",
                                url: "#",
                            },
                            {
                                content: "Vitae aliquet nec ullamcorper sit amet risus nullam.",
                                url: "#",
                            },
                            {
                                content: "Ellus in hac habitasse platea dictumst.",
                                url: "#",
                            },
                            {
                                content: "In nisl nisi scelerisque eu ultrices vitae.",
                                url: "#",
                            },
                            {
                                content: "Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim.",
                                url: "#",
                            },
                            {
                                content: "It volutpat diam ut venenatis tellus.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-international",
                name: "International",
                articles: [
                    {
                        class: "columns-wrap",
                        header: "United Nations",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Morbi quis commodo odio aenean sed adipiscing diam. Congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque. Justo nec ultrices dui sapien.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nibh nisl condimentum id venenatis a condimentum. Id diam maecenas ultricies mi eget mauris pharetra et ultrices. Faucibus turpis in eu mi bibendum neque egestas. Et malesuada fames ac turpis egestas sed tempus urna et.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ut etiam sit amet nisl purus in mollis nunc sed. Pellentesque adipiscing commodo elit at imperdiet dui. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Enim facilisis gravida neque convallis.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "European Union",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Donec massa sapien faucibus et molestie. Fermentum iaculis eu non diam. Donec pretium vulputate sapien nec sagittis. Placerat duis ultricies lacus sed. Pretium lectus quam id leo in vitae turpis massa.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Luctus accumsan tortor posuere ac ut. Convallis posuere morbi leo urna molestie at elementum. Nisi est sit amet facilisis magna etiam tempor orci eu.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Purus in massa tempor nec feugiat nisl pretium fusce. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl vel. Vestibulum sed arcu non odio euismod lacinia at quis.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Global Crisis",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "ristique senectus et netus et malesuada. Orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Varius quam quisque id diam vel quam elementum pulvinar. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Cras ornare arcu dui vivamus arcu felis bibendum ut. Volutpat blandit aliquam etiam erat velit scelerisque in dictum. Pharetra magna ac placerat vestibulum lectus.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Leo integer malesuada nunc vel. Porttitor lacus luctus accumsan tortor posuere ac ut consequat. Ultrices eros in cursus turpis massa tincidunt dui ut. Eleifend mi in nulla posuere sollicitudin.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-global-impact",
                name: "Global Impact",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Weather",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Euismod elementum nisi quis eleifend.",
                        type: "list",
                        content: [
                            {
                                content: "Enim tortor at auctor urna nunc id cursus metus. Nisi est sit amet facilisis magna etiam.",
                            },
                            {
                                content: "Neque volutpat ac tincidunt vitae. Metus aliquam eleifend mi in.",
                            },
                            {
                                content: "Aliquam malesuada bibendum arcu vitae elementum curabitur vitae.",
                            },
                            {
                                content: "Turpis cursus in hac habitasse platea dictumst.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Business",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Nunc mi ipsum faucibus vitae aliquet nec ullamcorper.",
                        type: "list",
                        content: [
                            {
                                content: "Eget nulla facilisi etiam dignissim diam quis enim.",
                            },
                            {
                                content: "Risus viverra adipiscing at in tellus integer feugiat scelerisque.",
                            },
                            {
                                content: "Cursus turpis massa tincidunt dui.",
                            },
                            {
                                content: "Nascetur ridiculus mus mauris vitae ultricies leo integer."
                            }
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Politics",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Vulputate sapien nec sagittis aliquam malesuada.",
                        type: "list",
                        content: [
                            {
                                content: "Nisi scelerisque eu ultrices vitae auctor.",
                            },
                            {
                                content: "Urna porttitor rhoncus dolor purus non enim praesent elementum.",
                            },
                            {
                                content: "Ac turpis egestas integer eget aliquet.",
                            },
                            {
                                content: "Nisl tincidunt eget nullam non nisi est.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-paid-content",
                name: "Paid Content",
                articles: [
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Et sollicitudin ac orci phasellus. Massa placerat duis ultricies lacus sed turpis tincidunt id.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Neque volutpat ac tincidunt vitae semper. Nunc pulvinar sapien et ligula. Quam pellentesque nec nam aliquam sem et tortor consequat.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Velit euismod in pellentesque massa placerat duis ultricies. Nulla aliquet enim tortor at auctor. Vitae et leo duis ut diam quam nulla porttitor massa.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eros in cursus turpis massa tincidunt dui ut ornare lectus. Pulvinar neque laoreet suspendisse interdum consectetur libero id faucibus nisl.",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    politics: {
        name: "Politics",
        url: "/politics",
        priority: 1,
        sections: [
            {
                id: "content-politics-what-really-matters",
                name: "What Really Matters",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        display: "grid-wrap",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Libero justo laoreet sit amet. Et egestas quis ipsum suspendisse ultrices gravida dictum fusce. Eget aliquet nibh praesent tristique magna. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Arcu cursus euismod quis viverra nibh. Cras ornare arcu dui vivamus arcu. At lectus urna duis convallis convallis tellus id.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Urna et pharetra pharetra massa massa ultricies mi quis hendrerit. Risus sed vulputate odio ut enim blandit volutpat maecenas volutpat. Quis ipsum suspendisse ultrices gravida dictum fusce ut.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Velit aliquet sagittis id consectetur purus ut faucibus. Tellus mauris a diam maecenas sed. Urna neque viverra justo nec. Odio eu feugiat pretium nibh ipsum.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Amet nulla facilisi morbi tempus iaculis urna id. Scelerisque eleifend donec pretium vulputate sapien nec sagittis. Id leo in vitae turpis massa.",
                                url: "#"
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-politics-today",
                name: "Today",
                articles: [
                    {
                        class: "columns-3-wide",
                        header: "Campaign News",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: "breaking",
                        },
                        title: "Adipiscing at in tellus integer feugiat scelerisque varius morbi enim.",
                        type: "list",
                        content: [
                            {
                                content: "Sem fringilla ut morbi tincidunt augue interdum velit euismod.",
                            },
                            {
                                content: "Quisque sagittis purus sit amet. Ornare lectus sit amet est.",
                            },
                            {
                                content: "Placerat orci nulla pellentesque dignissim enim sit amet.",
                            },
                            {
                                content: "In fermentum et sollicitudin ac orci phasellus egestas tellus.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Elections",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Local Government",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Nunc vel risus commodo viverra maecenas accumsan lacus.",
                        type: "list",
                        content: [
                            {
                                content: "Molestie at elementum eu facilisis sed odio morbi.",
                            },
                            {
                                content: "Sit amet nisl suscipit adipiscing bibendum est ultricies integer quis.",
                            },
                            {
                                content: "Bibendum neque egestas congue quisque egestas diam in arcu.",
                            },
                            {
                                content: "Tellus molestie nunc non blandit massa enim nec.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-politics-latest-headlines",
                name: "Latest Headlines",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Analysis",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et.",
                        type: "list",
                        content: [
                            {
                                content: "Arcu vitae elementum curabitur vitae nunc sed velit.",
                            },
                            {
                                content: "Ornare suspendisse sed nisi lacus sed viverra tellus in.",
                            },
                            {
                                content: "Vel fringilla est ullamcorper eget nulla.",
                            },
                            {
                                content: "Risus commodo viverra maecenas accumsan lacus vel facilisis volutpat est.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Facts First",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "At varius vel pharetra vel turpis nunc eget lorem dolor.",
                        type: "list",
                        content: [
                            {
                                content: "Consectetur purus ut faucibus pulvinar elementum integer enim.",
                            },
                            {
                                content: "Purus semper eget duis at. Tincidunt ornare massa eget egestas purus viverra accumsan.",
                            },
                            {
                                content: "Amet massa vitae tortor condimentum lacinia quis vel.",
                            },
                            {
                                content: "Tristique senectus et netus et malesuada.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "More Politics News",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Vitae auctor eu augue ut lectus arcu bibendum at varius.",
                        type: "text",
                        content: "Pharetra diam sit amet nisl suscipit adipiscing bibendum est. Id aliquet lectus proin nibh. Porta lorem mollis aliquam ut porttitor leo a. Congue eu consequat ac felis donec et odio pellentesque.\n\nMi ipsum faucibus vitae aliquet nec ullamcorper. Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper.",
                    },
                ],
            },
            {
                id: "content-politics-latest-media",
                name: "Latest Media",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-politics-election",
                name: "Election",
                articles: [
                    {
                        class: "columns-wrap",
                        header: "Democrats",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Est ullamcorper eget nulla facilisi etiam dignissim. Est pellentesque elit ullamcorper dignissim cras. Velit euismod in pellentesque massa placerat duis ultricies.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Vitae suscipit tellus mauris a diam maecenas sed enim. Aenean sed adipiscing diam donec. Laoreet suspendisse interdum consectetur libero id faucibus nisl tincidunt.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Mattis enim ut tellus elementum sagittis vitae et. Massa sapien faucibus et molestie.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Republicans",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Platea dictumst quisque sagittis purus sit amet volutpat. Ante in nibh mauris cursus mattis molestie a iaculis.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Quis hendrerit dolor magna eget est. Pellentesque pulvinar pellentesque habitant morbi tristique. Adipiscing commodo elit at imperdiet dui.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Donec pretium vulputate sapien nec sagittis aliquam. Cras adipiscing enim eu turpis egestas pretium aenean."
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Liberals",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Cursus sit amet dictum sit amet justo donec enim. Tempor id eu nisl nunc. Amet cursus sit amet dictum sit amet justo donec.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Enim diam vulputate ut pharetra sit amet aliquam. Tristique senectus et netus et malesuada.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Eu turpis egestas pretium aenean. Auctor elit sed vulputate mi sit amet. In nibh mauris cursus mattis molestie.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-politics-more-political-news",
                name: "More political News",
                articles: [
                    {
                        class: "columns-3-wide",
                        header: "More News",
                        url: "#",
                        type: "list",
                        content: [
                            {
                                content: "Eros donec ac odio tempor. Tortor pretium viverra suspendisse potenti nullam.",
                            },
                            {
                                content: "Ut venenatis tellus in metus vulputate eu scelerisque.",
                            },
                            {
                                content: "Id diam maecenas ultricies mi eget. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit.",
                            },
                            {
                                content: "Consectetur lorem donec massa sapien. Sed cras ornare arcu dui vivamus arcu felis.",
                            },
                            {
                                content: "Fames ac turpis egestas maecenas pharetra convallis posuere morbi.",
                            },
                            {
                                content: "Consequat nisl vel pretium lectus quam id.",
                            },
                            {
                                content: "Tincidunt ornare massa eget egestas purus viverra accumsan in nisl.",
                            },
                            {
                                content: "Sed euismod nisi porta lorem mollis aliquam ut.",
                            },
                            {
                                content: "Suspendisse sed nisi lacus sed viverra tellus in hac.",
                            },
                            {
                                content: "Aliquet risus feugiat in ante metus dictum at tempor.",
                            },
                            {
                                content: "Velit aliquet sagittis id consectetur purus ut faucibus.",
                            },
                            {
                                content: "Libero volutpat sed cras ornare. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet."
                            },
                            {
                                content: "Nibh nisl condimentum id venenatis a condimentum vitae. Fames ac turpis egestas maecenas pharetra."
                            },
                            {
                                content: "Massa sapien faucibus et molestie. Ac turpis egestas maecenas pharetra convallis posuere morbi leo urna."
                            },
                            {
                                content: "Est pellentesque elit ullamcorper dignissim cras. Mi proin sed libero enim sed."
                            }
                        ],
                    },
                    {
                        class: "columns-3-narrow",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-narrow",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Tellus in metus vulputate eu scelerisque felis imperdiet proin fermentum.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Adipiscing tristique risus nec feugiat in fermentum posuere vulputate eu scelerisque.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Potenti nullam ac tortor vitae purus. Adipiscing diam donec adipiscing tristique risus nec feugiat in fermentum.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-politics-trending",
                name: "Trending",
                articles: [
                    {
                        class: "columns-wrap",
                        header: "New Legislations",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Consequat ac felis donec et. Libero nunc consequat interdum varius sit amet mattis vulputate enim. Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Nisi lacus sed viverra tellus in hac. Aliquam malesuada bibendum arcu vitae elementum curabitur.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Neque gravida in fermentum et sollicitudin ac orci. Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Fermentum leo vel orci porta non pulvinar neque laoreet.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Egestas diam in arcu cursus. Aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis. Augue ut lectus arcu bibendum at varius vel pharetra.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Latest Polls",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Aliquam eleifend mi in nulla posuere sollicitudin. Tempor nec feugiat nisl pretium fusce. Fermentum iaculis eu non diam phasellus vestibulum lorem. Scelerisque eleifend donec pretium vulputate sapien nec. Sit amet aliquam id diam maecenas ultricies mi.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Morbi leo urna molestie at elementum eu. Phasellus vestibulum lorem sed risus. Aliquet bibendum enim facilisis gravida neque. Aliquam sem et tortor consequat id porta. Interdum varius sit amet mattis vulputate enim nulla aliquet. Enim nulla aliquet porttitor lacus luctus accumsan tortor.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Molestie nunc non blandit massa. Adipiscing diam donec adipiscing tristique risus nec feugiat in. Odio morbi quis commodo odio aenean sed adipiscing diam donec. Felis eget velit aliquet sagittis id consectetur purus ut. Odio ut enim blandit volutpat maecenas."
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Who's gaining votes",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Risus viverra adipiscing at in tellus integer feugiat scelerisque. Porttitor eget dolor morbi non arcu risus quis varius quam. Consectetur adipiscing elit ut aliquam purus sit. Pulvinar mattis nunc sed blandit.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Non curabitur gravida arcu ac tortor dignissim. Purus in mollis nunc sed id semper risus in hendrerit. Vestibulum morbi blandit cursus risus. Pellentesque nec nam aliquam sem et tortor. Ac tortor dignissim convallis aenean et.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ullamcorper a lacus vestibulum sed arcu non. Pharetra sit amet aliquam id diam. Viverra vitae congue eu consequat ac felis donec. Amet massa vitae tortor condimentum lacinia quis vel eros.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-politics-paid-content",
                name: "Paid Content",
                articles: [
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Duis at consectetur lorem donec massa.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget mi proin sed libero enim sed. Proin libero nunc consequat interdum varius.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Porta nibh venenatis cras sed felisDolor sit amet consectetur adipiscing elit ut aliquam purus sit.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nisl vel pretium lectus quam id leo in vitae. Ultrices neque ornare aenean euismod elementum nisi quis eleifend quam. Eget nullam non nisi est sit. Aliquet enim tortor at auctor urna.",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    business: {
        name: "Business",
        url: "/business",
        priority: 1,
        sections: [
            {
                id: "content-business-latest-trends",
                name: "Latest trends",
                articles: [
                    {
                        class: "columns-3-wide",
                        header: "Investing",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: "breaking",
                        },
                        title: "Enim lobortis scelerisque fermentum dui faucibus in ornare. Ante metus dictum at tempor.",
                        type: "text",
                        content:
                            "Consequat mauris nunc congue nisi vitae. Felis imperdiet proin fermentum leo vel orci porta. Facilisis gravida neque convallis a cras semper. Risus quis varius quam quisque id diam vel quam. Egestas quis ipsum suspendisse ultrices gravida. Nisl nisi scelerisque eu ultrices vitae auctor.\n\nViverra vitae congue eu consequat ac felis. Vestibulum rhoncus est pellentesque elit ullamcorper. Donec massa sapien faucibus et. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus. Quis ipsum suspendisse ultrices gravida. Vel facilisis volutpat est velit egestas dui id ornare arcu. Commodo ullamcorper a lacus vestibulum.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Media",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Gravida in fermentum et sollicitudin ac. Varius duis at consectetur lorem donec massa sapien faucibus.",
                        type: "text",
                        content:
                            "Nisi quis eleifend quam adipiscing vitae proin. Nunc sed velit dignissim sodales ut. Turpis nunc eget lorem dolor sed. Enim nulla aliquet porttitor lacus. Consequat ac felis donec et. Aliquam sem fringilla ut morbi tincidunt augue interdum velit. Arcu vitae elementum curabitur vitae nunc sed velit dignissim.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Insights",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Venenatis urna cursus eget nunc. Adipiscing elit duis tristique sollicitudin.",
                        type: "text",
                        content:
                            "Donec adipiscing tristique risus nec. Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim. Vitae et leo duis ut diam quam. Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere lorem.\n\nAc odio tempor orci dapibus ultrices in iaculis nunc. A diam maecenas sed enim ut sem. At quis risus sed vulputate.",
                    },
                ],
            },
            {
                id: "content-business-market-watch",
                name: "Market Watch",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Trending",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Dictumst quisque sagittis purus sit amet.",
                        type: "text",
                        content:
                            "Dolor magna eget est lorem. Nibh sit amet commodo nulla facilisi nullam. Etiam non quam lacus suspendisse faucibus interdum. Posuere sollicitudin aliquam ultrices sagittis orci. Massa enim nec dui nunc mattis enim ut tellus. Congue mauris rhoncus aenean vel. Egestas integer eget aliquet nibh praesent tristique.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Tech",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Posuere sollicitudin aliquam ultrices sagittis orci a.",
                        type: "text",
                        content:
                            "Praesent elementum facilisis leo vel fringilla est ullamcorper. Scelerisque viverra mauris in aliquam sem fringilla. Donec ac odio tempor orci. Eu augue ut lectus arcu. Diam sollicitudin tempor id eu nisl nunc mi ipsum.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Success",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Scelerisque fermentum dui faucibus in.",
                        type: "text",
                        content:
                            "landit volutpat maecenas volutpat blandit. Pulvinar pellentesque habitant morbi tristique senectus et. Facilisis magna etiam tempor orci. Sit amet commodo nulla facilisi nullam vehicula. Tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed. Mus mauris vitae ultricies leo.",
                    },
                ],
            },
            {
                id: "content-business-economy-today",
                name: "Economy Today",
                articles: [
                    {
                        class: "columns-wrap",
                        header: "Global Impact",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Bibendum arcu vitae elementum curabitur vitae nunc sed. Ipsum faucibus vitae aliquet nec ullamcorper sit. Blandit libero volutpat sed cras ornare arcu dui. Maecenas sed enim ut sem viverra aliquet.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Arcu risus quis varius quam quisque id diam vel quam. Sed risus pretium quam vulputate dignissim suspendisse in. Amet aliquam id diam maecenas ultricies mi. Egestas dui id ornare arcu odio.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "At risus viverra adipiscing at in tellus. Morbi tempus iaculis urna id volutpat lacus laoreet non. Eu volutpat odio facilisis mauris sit amet. Leo urna molestie at elementum eu facilisis sed.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Outlook",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ut etiam sit amet nisl purus in mollis nunc sed. Eget mauris pharetra et ultrices neque ornare aenean. Magna sit amet purus gravida quis blandit turpis.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Eu nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Viverra aliquet eget sit amet tellus cras. Consequat id porta nibh venenatis. Ac felis donec et odio pellentesque diam volutpat commodo sed.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Montes nascetur ridiculus mus mauris vitae ultricies leo integer. Habitasse platea dictumst vestibulum rhoncus est pellentesque elit.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Financial Freedom",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Bibendum arcu vitae elementum curabitur vitae nunc sed. Facilisis mauris sit amet massa vitae tortor condimentum lacinia.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. At in tellus integer feugiat scelerisque varius morbi enim. Nisi vitae suscipit tellus mauris a.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Diam sollicitudin tempor id eu nisl nunc mi ipsum faucibus. In pellentesque massa placerat duis ultricies lacus sed.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-business-must-read",
                name: "Must Read",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        display: "grid-wrap",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Nisl tincidunt eget nullam non nisi est sit. At consectetur lorem donec massa sapien faucibus et molestie ac. Semper risus in hendrerit gravida rutrum. Eget aliquet nibh praesent tristique magna sit. Mi quis hendrerit dolor magna eget.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Pulvinar proin gravida hendrerit lectus a. At volutpat diam ut venenatis tellus in metus vulputate eu. Maecenas accumsan lacus vel facilisis volutpat. Enim eu turpis egestas pretium aenean pharetra magna. Orci eu lobortis elementum nibh tellus molestie nunc.",
                                url: "#"
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-business-educational",
                name: "Educational",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Business 101",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Dictumst quisque sagittis purus sit amet.",
                        type: "text",
                        content:
                            "incidunt dui ut ornare lectus sit. Quis varius quam quisque id diam. Adipiscing diam donec adipiscing tristique risus nec feugiat in. Cursus sit amet dictum sit. Lacinia quis vel eros donec ac odio. Accumsan tortor posuere ac ut consequat semper. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. Integer malesuada nunc vel risus commodo viverra. Arcu risus quis varius quam quisque id diam vel quam.\n\nEnim neque volutpat ac tincidunt vitae semper quis lectus nulla. Eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque. Sed tempus urna et pharetra pharetra massa.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Startup",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Posuere sollicitudin aliquam ultrices sagittis orci a.",
                        type: "text",
                        content:
                            "Potenti nullam ac tortor vitae purus faucibus. Vulputate mi sit amet mauris. Elit pellentesque habitant morbi tristique senectus. In pellentesque massa placerat duis ultricies. Cras fermentum odio eu feugiat pretium nibh ipsum. Ornare quam viverra orci sagittis eu. Commodo sed egestas egestas fringilla phasellus faucibus scelerisque eleifend. Non diam phasellus vestibulum lorem sed risus. Metus vulputate eu scelerisque felis imperdiet.\n\nMagna ac placerat vestibulum lectus mauris. Lobortis feugiat vivamus at augue eget. Facilisis volutpat est velit egestas dui id ornare arcu odio.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Make profit",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Scelerisque fermentum dui faucibus in.",
                        type: "text",
                        content:
                            "Ornare aenean euismod elementum nisi quis. Tellus in hac habitasse platea dictumst vestibulum rhoncus est. Nisl nunc mi ipsum faucibus vitae aliquet nec. Eget egestas purus viverra accumsan in nisl nisi scelerisque. Urna duis convallis convallis tellus id interdum velit laoreet. Ultrices sagittis orci a scelerisque purus. Feugiat vivamus at augue eget. Ultricies tristique nulla aliquet enim. Nibh mauris cursus mattis molestie a iaculis at erat pellentesque.\n\nElementum eu facilisis sed odio morbi. Ac turpis egestas integer eget aliquet nibh praesent tristique magna. Tortor at risus viverra adipiscing at in tellus.",
                    },
                ],
            },
            {
                id: "content-business-underscored",
                name: "Underscored",
                articles: [
                    {
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                url: "#"
                            }
                        ]
                    },
                    {
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "breaking"
                                },
                                text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "breaking"
                                },
                                text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                url: "#"
                            }
                        ]
                    }
                ]
            },
            {
                id: "content-frontpage-investing-101",
                name: "Investing 101",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Manage your assets",
                        type: "articles-list",
                        content: [
                            {
                                title: "Ic turpis egestas maecenas pharetra convallis. Dui accumsan sit amet nulla facilisi morbi tempus.",
                                content: "A scelerisque purus semper eget duis at. Condimentum lacinia quis vel eros donec ac odio. Pretium fusce id velit ut tortor pretium viverra suspendisse. Blandit aliquam etiam erat velit scelerisque in. Est placerat in egestas erat imperdiet sed euismod nisi. Suspendisse potenti nullam ac tortor vitae purus faucibus.",
                            },
                            {
                                title: "Risus commodo viverra maecenas accumsan lacus vel.",
                                content: "Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Iaculis eu non diam phasellus. Odio aenean sed adipiscing diam donec. Eleifend donec pretium vulputate sapien nec sagittis aliquam malesuada bibendum.",
                            },
                            {
                                title: "Vitae ultricies leo integer malesuada nunc vel risus commodo.",
                                content: "Donec et odio pellentesque diam volutpat. Sed libero enim sed faucibus turpis in eu. Aliquam nulla facilisi cras fermentum odio eu feugiat pretium. Tristique risus nec feugiat in fermentum. Turpis egestas maecenas pharetra convallis posuere morbi leo urna.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "What to watch",
                        type: "articles-list",
                        content: [
                            {
                                title: "Elementum integer enim neque volutpat.",
                                content: "Dignissim diam quis enim lobortis scelerisque. Lacus vestibulum sed arcu non odio euismod lacinia at quis. Mi bibendum neque egestas congue quisque. Arcu dui vivamus arcu felis bibendum ut tristique. Consectetur adipiscing elit ut aliquam purus sit amet luctus venenatis.",
                            },
                            {
                                title: "Vitae turpis massa sed elementum tempus egestas sed.",
                                content: "Eu lobortis elementum nibh tellus molestie. Egestas congue quisque egestas diam in arcu cursus euismod quis. Purus non enim praesent elementum facilisis. Suscipit tellus mauris a diam maecenas sed enim ut sem. Sed elementum tempus egestas sed sed risus pretium quam.",
                            },
                            {
                                title: "Consequat ac felis donec et odio pellentesque diam.",
                                content: "Pharetra diam sit amet nisl suscipit adipiscing bibendum. Mi eget mauris pharetra et ultrices neque ornare. Habitant morbi tristique senectus et netus et. Quis eleifend quam adipiscing vitae. Fames ac turpis egestas maecenas pharetra convallis posuere morbi.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Did you know?",
                        type: "articles-list",
                        content: [
                            {
                                title: "Lacus sed viverra tellus in. Eget mi proin sed libero enim sed.",
                                content: "A diam maecenas sed enim. Platea dictumst vestibulum rhoncus est pellentesque elit. Metus dictum at tempor commodo ullamcorper. Est ullamcorper eget nulla facilisi etiam dignissim diam. Felis eget velit aliquet sagittis id consectetur purus.",
                            },
                            {
                                title: "Est lorem ipsum dolor sit amet. Duis ultricies lacus sed turpis tincidunt.",
                                content: "Mattis pellentesque id nibh tortor id aliquet lectus. Odio aenean sed adipiscing diam donec adipiscing. Mi in nulla posuere sollicitudin aliquam ultrices sagittis. Dictum varius duis at consectetur lorem donec massa sapien faucibus.",
                            },
                            {
                                title: "Duis ut diam quam nulla porttitor massa id.",
                                content: "Id aliquet lectus proin nibh nisl condimentum id venenatis. Ultrices in iaculis nunc sed augue lacus viverra vitae congue. Lectus urna duis convallis convallis tellus id interdum velit. Duis convallis convallis tellus id interdum. Et malesuada fames ac turpis egestas sed.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-business-paid-content",
                name: "Paid Content",
                articles: [
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Facilisis magna etiam tempor orci eu lobortis elementum nibh tellus. Morbi enim nunc faucibus a pellentesque sit amet porttitor eget.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc scelerisque viverra mauris in aliquam sem fringilla.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Aliquam malesuada bibendum arcu vitae elementum curabitur. A pellentesque sit amet porttitor eget dolor morbi non.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Cursus mattis molestie a iaculis at. Nullam eget felis eget nunc. Tortor id aliquet lectus proin nibh nisl condimentum id.",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    opinion: {
        name: "Opinion",
        url: "/opinion",
        priority: 2,
        sections: [
            {
                id: "content-opinion-a-deeper-look",
                name: "A deeper look",
                articles: [
                    {
                        class: "columns-3-wide",
                        header: "Latest Facts",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            tag: "breaking",
                        },
                        title: "Senectus et netus et malesuada fames ac turpis egestas. Odio facilisis mauris sit amet massa. Ornare quam viverra orci sagittis eu volutpat odio.",
                        type: "text",
                        content:
                            "Lorem ipsum dolor sit amet consectetur. Ridiculus mus mauris vitae ultricies leo. Volutpat ac tincidunt vitae semper quis. In est ante in nibh. Fringilla phasellus faucibus scelerisque eleifend donec pretium. Scelerisque eu ultrices vitae auctor eu augue.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Top of our mind",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Nisl pretium fusce id velit ut tortor pretium. Arcu cursus vitae congue mauris rhoncus aenean.",
                        type: "text",
                        content: "Aenean euismod elementum nisi quis eleifend quam adipiscing vitae proin. Pharetra vel turpis nunc eget lorem. Morbi tincidunt augue interdum velit euismod in pellentesque massa placerat.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Editor Report",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Dignissim enim sit amet venenatis urna cursus.",
                        type: "text",
                        content:
                            "Aenean pharetra magna ac placerat vestibulum lectus mauris. Massa sapien faucibus et molestie ac feugiat sed lectus vestibulum.\n\nVitae congue mauris rhoncus aenean vel elit scelerisque. Faucibus turpis in eu mi bibendum neque egestas congue quisque.",
                    },
                ],
            },
            {
                id: "content-opinion-top-issues",
                name: "Top Issues",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Thoughts",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Morbi tincidunt ornare massa eget.",
                        type: "list",
                        content: [
                            {
                                content: "Tortor consequat id porta nibh venenatis cras sed.",
                            },
                            {
                                content: "Suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur.",
                            },
                            {
                                content: "Adipiscing diam donec adipiscing tristique risus nec feugiat in.",
                            },
                            {
                                content: "Ultrices neque ornare aenean euismod elementum nisi quis.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Social commentary",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Sagittis aliquam malesuada bibendum arcu vitae.",
                        type: "list",
                        content: [
                            {
                                content: "Nisi porta lorem mollis aliquam ut porttitor leo a diam.",
                            },
                            {
                                content: "Purus ut faucibus pulvinar elementum integer enim neque volutpat ac.",
                            },
                            {
                                content: "Suspendisse in est ante in nibh mauris cursus.",
                            },
                            {
                                content: "Aliquam vestibulum morbi blandit cursus. Leo integer malesuada nunc vel risus commodo viverra maecenas.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Special Projects",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Nulla aliquet enim tortor at auctor urna nunc id.",
                        type: "text",
                        content:
                            "Platea dictumst quisque sagittis purus sit amet volutpat. Vulputate ut pharetra sit amet aliquam id. Tellus integer feugiat scelerisque varius morbi enim nunc faucibus. Est ante in nibh mauris. Libero volutpat sed cras ornare arcu dui vivamus.",
                    },
                ],
            },
            {
                id: "content-opinon-trending",
                name: "Trending",
                articles: [
                    {
                        class: "columns-wrap",
                        header: "Around the world",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Egestas congue quisque egestas diam in arcu. Sollicitudin tempor id eu nisl nunc mi.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "A condimentum vitae sapien pellentesque habitant morbi tristique senectus. Neque laoreet suspendisse interdum consectetur.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Dui vivamus arcu felis bibendum. Sit amet purus gravida quis blandit turpis cursus in.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Support",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Malesuada fames ac turpis egestas integer eget. Ante metus dictum at tempor commodo ullamcorper. Ipsum dolor sit amet consectetur.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Dictumst quisque sagittis purus sit amet. Cras fermentum odio eu feugiat pretium. Pretium aenean pharetra magna ac placerat vestibulum lectus.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Et odio pellentesque diam volutpat commodo sed egestas egestas. Sagittis aliquam malesuada bibendum arcu vitae elementum curabitur.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Know More",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nullam eget felis eget nunc. Fames ac turpis egestas integer eget aliquet nibh praesent tristique.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Massa ultricies mi quis hendrerit dolor magna eget est.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ut tellus elementum sagittis vitae et leo duis ut. Purus ut faucibus pulvinar elementum integer enim.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-opinion-think-about-it",
                name: "Think about it",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Mental Health",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "olutpat ac tincidunt vitae semper quis lectus nulla at. Non quam lacus suspendisse faucibus interdum posuere lorem..",
                        type: "list",
                        display: "bullets",
                        content: [
                            {
                                content: "Et tortor consequat id porta nibh venenatis cras sed felis. Neque aliquam vestibulum morbi blandit cursus risus at ultrices mi.",
                                url: "#",
                            },
                            {
                                content: "Commodo quis imperdiet massa tincidunt nunc. Diam maecenas sed enim ut sem viverra aliquet eget sit.",
                                url: "#",
                            },
                            {
                                content: "Aliquam malesuada bibendum arcu vitae elementum curabitur. Quis ipsum suspendisse ultrices gravida dictum fusce ut placerat.",
                                url: "#",
                            },
                            {
                                content: "Quis enim lobortis scelerisque fermentum. Nibh venenatis cras sed felis eget velit aliquet.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Better life",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Placerat vestibulum lectus mauris ultrices. Eros in cursus turpis massa.",
                        type: "list",
                        display: "bullets",
                        content: [
                            {
                                content: "In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit. At lectus urna duis convallis convallis tellus id interdum.",
                                url: "#",
                            },
                            {
                                content: "Ultrices eros in cursus turpis massa tincidunt dui. Mi tempus imperdiet nulla malesuada pellentesque.",
                                url: "#",
                            },
                            {
                                content: "Ipsum faucibus vitae aliquet nec ullamcorper sit. Eleifend donec pretium vulputate sapien nec sagittis aliquam.",
                                url: "#",
                            },
                            {
                                content: "In hac habitasse platea dictumst. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "The right choice",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Faucibus et molestie ac feugiat. Enim sit amet venenatis urna cursus eget nunc scelerisque viverra.",
                        type: "list",
                        display: "bullets",
                        content: [
                            {
                                content: "Urna porttitor rhoncus dolor purus. Eget sit amet tellus cras adipiscing enim.",
                                url: "#",
                            },
                            {
                                content: "Leo urna molestie at elementum eu facilisis sed. Metus dictum at tempor commodo ullamcorper a.",
                                url: "#",
                            },
                            {
                                content: "Non odio euismod lacinia at quis risus sed vulputate.",
                                url: "#",
                            },
                            {
                                content: "Justo donec enim diam vulputate ut. Euismod elementum nisi quis eleifend.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-opinion-latest-media",
                name: "Latest Media",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-opinion-in-case-you-missed-it",
                name: "In case you missed it",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Critical thoughts",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Facilisi morbi tempus iaculis urna id. Nibh cras pulvinar mattis nunc sed.",
                        type: "list",
                        content: [
                            {
                                content: "Eget felis eget nunc lobortis mattis aliquam faucibus purus in."
                            },
                            {
                                content: "Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus.",
                            },
                            {
                                content: "Eu volutpat odio facilisis mauris sit amet massa.",
                            },
                            {
                                content: "Vitae tortor condimentum lacinia quis vel eros donec ac.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Critical Thinking",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Euismod nisi porta lorem mollis aliquam ut porttitor leo a.",
                        type: "list",
                        content: [
                            {
                                content: "Enim facilisis gravida neque convallis a.",
                            },
                            {
                                content: "Ridiculus mus mauris vitae ultricies leo integer malesuada.",
                            },
                            {
                                content: "Elementum nisi quis eleifend quam. Sed elementum tempus egestas sed sed.",
                            },
                            {
                                content: "Ut tellus elementum sagittis vitae et leo duis ut diam. Ultrices gravida dictum fusce ut placerat orci nulla pellentesque dignissim.",
                            }
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Critical Actions",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Amet dictum sit amet justo donec enim diam.",
                        type: "list",
                        content: [
                            {
                                content: "Metus dictum at tempor commodo ullamcorper a lacus vestibulum.",
                            },
                            {
                                content: "In nisl nisi scelerisque eu ultrices. In fermentum et sollicitudin ac orci phasellus egestas.",
                            },
                            {
                                content: "Ut aliquam purus sit amet luctus venenatis lectus magna fringilla.",
                            },
                            {
                                content: "Morbi enim nunc faucibus a pellentesque. Mi ipsum faucibus vitae aliquet nec ullamcorper.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-opinion-environmental-issues",
                name: "Environmental Issues",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Global Warming",
                        type: "articles-list",
                        content: [
                            {
                                title: "Dis parturient montes nascetur ridiculus mus mauris vitae.",
                                content: "Justo donec enim diam vulputate ut pharetra sit amet aliquam. Curabitur vitae nunc sed velit dignissim sodales. Varius vel pharetra vel turpis nunc eget lorem. Sed viverra ipsum nunc aliquet bibendum. Ultrices in iaculis nunc sed augue.",
                            },
                            {
                                title: "Vitae turpis massa sed elementum tempus egestas sed sed risus.",
                                content: "Nascetur ridiculus mus mauris vitae ultricies leo integer. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Gravida arcu ac tortor dignissim convallis aenean. Urna duis convallis convallis tellus id interdum.",
                            },
                            {
                                title: "Rutrum tellus pellentesque eu tincidunt tortor. Volutpat sed cras ornare arcu.",
                                content: "estibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt. Urna porttitor rhoncus dolor purus. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Ultrices in iaculis nunc sed augue lacus. Nunc pulvinar sapien et ligula ullamcorper.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Recycling",
                        type: "articles-list",
                        content: [
                            {
                                title: "Tellus id interdum velit laoreet id donec ultrices tincidunt arcu.",
                                content: "Eget est lorem ipsum dolor sit amet. Faucibus scelerisque eleifend donec pretium vulputate sapien. Quam adipiscing vitae proin sagittis. Quisque id diam vel quam elementum pulvinar etiam non. Laoreet non curabitur gravida arcu ac tortor dignissim convallis aenean.",
                            },
                            {
                                title: "Scelerisque viverra mauris in aliquam sem fringilla ut.",
                                content: "Amet mauris commodo quis imperdiet. Eu consequat ac felis donec et odio pellentesque. Hendrerit gravida rutrum quisque non tellus orci ac. Amet cursus sit amet dictum.",
                            },
                            {
                                title: "Vulputate eu scelerisque felis imperdiet. Non quam lacus suspendisse faucibus interdum posuere.",
                                content: "Luctus venenatis lectus magna fringilla urna porttitor. Hac habitasse platea dictumst vestibulum rhoncus. Orci a scelerisque purus semper eget duis at tellus. Risus nec feugiat in fermentum posuere urna nec tincidunt praesent.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "New researches",
                        type: "articles-list",
                        content: [
                            {
                                title: "Non quam lacus suspendisse faucibus.",
                                content: "Nisi quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus. Odio euismod lacinia at quis. Molestie a iaculis at erat. Id cursus metus aliquam eleifend mi in nulla posuere sollicitudin. Donec ac odio tempor orci dapibus.",
                            },
                            {
                                title: "Sit amet consectetur adipiscing elit. Lorem sed risus ultricies tristique nulla aliquet.",
                                content: "Neque aliquam vestibulum morbi blandit cursus risus at. Habitant morbi tristique senectus et netus et. Quis blandit turpis cursus in. Adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus urna. Vel risus commodo viverra maecenas. Tortor dignissim convallis aenean et tortor at.",
                            },
                            {
                                title: "Ullamcorper sit amet risus nullam eget.",
                                content: "urpis nunc eget lorem dolor sed viverra ipsum nunc aliquet. Mollis aliquam ut porttitor leo a diam. Posuere morbi leo urna molestie. Suscipit tellus mauris a diam maecenas sed. Ultrices dui sapien eget mi proin sed libero enim sed.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-opinion-paid-content",
                name: "Paid Content",
                articles: [
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nulla facilisi nullam vehicula ipsum. Sit amet tellus cras adipiscing enim eu turpis egestas pretium. Diam phasellus vestibulum lorem sed risus ultricies.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Dictum fusce ut placerat orci nulla. Quis ipsum suspendisse ultrices gravida dictum fusce ut placerat.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Sed cras ornare arcu dui vivamus. Eget nunc lobortis mattis aliquam faucibus purus in. Nulla facilisi nullam vehicula ipsum a. Sed faucibus turpis in eu mi bibendum.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Mauris nunc congue nisi vitae suscipit tellus. Auctor augue mauris augue neque gravida in. Phasellus vestibulum lorem sed risus ultricies.",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    health: {
        name: "Health",
        url: "/health",
        priority: 2,
        sections: [
            {
                id: "content-health-trending",
                name: "Trending",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "Mindfulness",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Consectetur lorem donec massa sapien faucibus et.",
                        type: "list",
                        content: [
                            {
                                content: "Eu turpis egestas pretium aenean pharetra. Nisl condimentum id venenatis a condimentum vitae sapien pellentesque habitant.",
                            },
                            {
                                content: "Bibendum arcu vitae elementum curabitur vitae nunc sed velit dignissim.",
                            },
                            {
                                content: "Eu non diam phasellus vestibulum lorem. Fermentum dui faucibus in ornare quam viverra orci sagittis.",
                            },
                            {
                                content: "Et malesuada fames ac turpis. Ornare massa eget egestas purus viverra accumsan.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Latest research",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Sed velit dignissim sodales ut eu sem integer vitae.",
                        type: "list",
                        content: [
                            {
                                content: "Metus vulputate eu scelerisque felis.",
                            },
                            {
                                content: "Aliquam sem et tortor consequat id. Feugiat nibh sed pulvinar proin.",
                            },
                            {
                                content: "Quisque non tellus orci ac auctor augue.",
                            },
                            {
                                content: "Sed risus pretium quam vulputate dignissim. Vitae tortor condimentum lacinia quis vel eros.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Healthy Senior",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Scelerisque in dictum non consectetur a.",
                        type: "list",
                        content: [
                            {
                                content: "Odio euismod lacinia at quis risus sed vulputate odio. Ullamcorper eget nulla facilisi etiam.",
                            },
                            {
                                content: "Ipsum consequat nisl vel pretium. Nisi vitae suscipit tellus mauris a diam.",
                            },
                            {
                                content: "Laoreet id donec ultrices tincidunt arcu non sodales neque sodales.",
                            },
                            {
                                content: "At volutpat diam ut venenatis tellus in metus vulputate eu.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-health-latest-facts",
                name: "Latest Facts",
                articles: [
                    {
                        class: "columns-3-balanced",
                        header: "More Life, But Better",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Sed tempus urna et pharetra pharetra massa massa ultricies mi.",
                        type: "list",
                        content: [
                            {
                                content: "Pharetra vel turpis nunc eget. Eu feugiat pretium nibh ipsum consequat.",
                            },
                            {
                                content: "Velit dignissim sodales ut eu sem. Viverra accumsan in nisl nisi scelerisque eu ultrices.",
                            },
                            {
                                content: "Arcu dictum varius duis at consectetur lorem donec massa sapien.",
                            },
                        ],
                    },
                    {
                        class: "columns-3-balanced",
                        header: "In case you missed it",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Egestas pretium aenean pharetra magna ac.",
                        type: "text",
                        content:
                            "Lectus proin nibh nisl condimentum id venenatis a condimentum vitae. Tincidunt praesent semper feugiat nibh sed pulvinar proin.\n\nQuis ipsum suspendisse ultrices gravida dictum fusce. Id donec ultrices tincidunt arcu non. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.",
                    },
                    {
                        class: "columns-3-balanced",
                        header: "Space and science",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Vitae ultricies leo integer malesuada nunc vel risus.",
                        type: "list",
                        display: "bullets",
                        content: [
                            {
                                content: "Semper eget duis at tellus at urna condimentum.",
                                url: "#",
                            },
                            {
                                content: "Aliquet lectus proin nibh nisl condimentum id. Velit scelerisque in dictum non.",
                                url: "#",
                            },
                            {
                                content: "Nulla posuere sollicitudin aliquam ultrices sagittis orci.",
                                url: "#",
                            },
                            {
                                content: "Condimentum vitae sapien pellentesque habitant. Iaculis at erat pellentesque adipiscing commodo elit at imperdiet.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-health-medical-breakthroughs",
                name: "Medical Breakthroughs",
                articles: [
                    {
                        class: "columns-3-wide",
                        header: "Surgical Inventions",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: "breaking",
                        },
                        title: "Nisi est sit amet facilisis magna etiam tempor. Cursus eget nunc scelerisque viverra mauris in aliquam sem fringilla.",
                        type: "text",
                        content:
                            "Ut eu sem integer vitae justo eget. Ut aliquam purus sit amet luctus. Sit amet mauris commodo quis imperdiet massa tincidunt. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam nulla facilisi. Turpis nunc eget lorem dolor sed. Ultrices in iaculis nunc sed augue lacus. Quam elementum pulvinar etiam non. Urna cursus eget nunc scelerisque. Nisl purus in mollis nunc sed.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Medicare",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Cras semper auctor neque vitae. Vel turpis nunc eget lorem dolor sed viverra ipsum nunc.",
                        type: "text",
                        content:
                            "Lacus sed viverra tellus in hac habitasse. Sapien faucibus et molestie ac feugiat sed lectus. Pretium aenean pharetra magna ac. Volutpat odio facilisis mauris sit amet massa vitae tortor condimentum. Pellentesque massa placerat duis ultricies lacus sed turpis tincidunt id.\n\nParturient montes nascetur ridiculus mus mauris. Ultrices eros in cursus turpis. Bibendum at varius vel pharetra vel turpis. Luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor.",
                    },
                    {
                        class: "columns-3-narrow",
                        header: "Medication",
                        url: "#",
                        image: {
                            src: "placeholder_light.jpg",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Ipsum dolor sit amet consectetur adipiscing elit. Velit scelerisque in dictum non consectetur a erat nam.",
                        type: "text",
                        content:
                            "Mattis molestie a iaculis at erat pellentesque adipiscing. Sed augue lacus viverra vitae congue. Volutpat consequat mauris nunc congue nisi vitae suscipit tellus. Lacus laoreet non curabitur gravida arcu. Nisl nisi scelerisque eu ultrices vitae auctor.\n\nInteger vitae justo eget magna fermentum iaculis eu non. Sollicitudin ac orci phasellus egestas. Ligula ullamcorper malesuada proin libero nunc consequat interdum.",
                    },
                ],
            },
            {
                id: "content-health-latest-videos",
                name: "Latest Videos",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "watch",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-health-educational",
                name: "Educational",
                articles: [
                    {
                        class: "columns-1",
                        type: "grid",
                        display: "grid-wrap",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Orci phasellus egestas tellus rutrum tellus pellentesque eu. Pulvinar neque laoreet suspendisse interdum consectetur. Viverra maecenas accumsan lacus vel facilisis volutpat. Nibh ipsum consequat nisl vel pretium lectus quam id. Leo integer malesuada nunc vel risus commodo viverra.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Proin libero nunc consequat interdum varius sit amet. Convallis posuere morbi leo urna molestie at. Consectetur lorem donec massa sapien faucibus et molestie ac feugiat. Egestas diam in arcu cursus euismod quis viverra nibh.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Elit sed vulputate mi sit. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Magna eget est lorem ipsum dolor sit amet consectetur. In tellus integer feugiat scelerisque varius morbi enim nunc faucibus. Nam libero justo laoreet sit.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Nam aliquam sem et tortor consequat. Non sodales neque sodales ut etiam sit amet nisl purus. Viverra mauris in aliquam sem. Leo vel fringilla est ullamcorper. Tellus at urna condimentum mattis pellentesque id nibh tortor. Lacus laoreet non curabitur gravida. Ut morbi tincidunt augue interdum velit euismod in pellentesque.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Egestas integer eget aliquet nibh praesent tristique magna sit. Id consectetur purus ut faucibus. Molestie a iaculis at erat pellentesque adipiscing commodo elit at. Nulla facilisi etiam dignissim diam quis enim lobortis scelerisque. Lectus proin nibh nisl condimentum id. Ornare quam viverra orci sagittis eu volutpat odio facilisis mauris.",
                                url: "#"
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-health-fitness",
                name: "Fitness",
                articles: [
                    {
                        class: "columns-wrap",
                        header: "Burn your calories",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Dictumst quisque sagittis purus sit amet volutpat consequat. At imperdiet dui accumsan sit amet nulla facilisi. Felis bibendum ut tristique et egestas. Mus mauris vitae ultricies leo integer malesuada. Adipiscing at in tellus integer feugiat.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Morbi non arcu risus quis varius quam quisque id. Enim nulla aliquet porttitor lacus luctus. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper. Tempor id eu nisl nunc mi ipsum faucibus vitae aliquet. Consequat semper viverra nam libero justo laoreet sit.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Suscipit adipiscing bibendum est ultricies integer quis auctor elit. Gravida quis blandit turpis cursus in hac habitasse platea. Maecenas ultricies mi eget mauris pharetra et ultrices. Massa sed elementum tempus egestas sed.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Gym favorites",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nulla facilisi nullam vehicula ipsum a arcu cursus. Et ultrices neque ornare aenean euismod elementum nisi quis. Velit euismod in pellentesque massa. In fermentum posuere urna nec tincidunt praesent semper.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Sit amet consectetur adipiscing elit duis tristique sollicitudin. Ante metus dictum at tempor commodo ullamcorper. Tincidunt eget nullam non nisi est sit. Platea dictumst quisque sagittis purus sit amet volutpat consequat.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Sed vulputate odio ut enim blandit volutpat maecenas. Risus viverra adipiscing at in. Fusce id velit ut tortor pretium viverra. Sem nulla pharetra diam sit amet nisl. Posuere urna nec tincidunt praesent semper feugiat nibh.",
                            },
                        ],
                    },
                    {
                        class: "columns-wrap",
                        header: "Pilates",
                        type: "excerpt",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Massa massa ultricies mi quis hendrerit dolor magna. Cursus vitae congue mauris rhoncus aenean vel elit scelerisque. Vestibulum lorem sed risus ultricies tristique. Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Massa enim nec dui nunc mattis enim ut tellus elementum. Eros in cursus turpis massa tincidunt dui. Sit amet consectetur adipiscing elit ut aliquam purus sit amet. Eget nullam non nisi est sit amet facilisis magna.",
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "enenatis tellus in metus vulputate eu scelerisque felis imperdiet proin. In eu mi bibendum neque egestas congue quisque egestas. Bibendum est ultricies integer quis auctor elit. Ipsum nunc aliquet bibendum enim facilisis. Magna fringilla urna porttitor rhoncus dolor purus non enim praesent.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-health-underscored",
                name: "Underscored",
                articles: [
                    {
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Lectus arcu bibendum at varius. Sed id semper risus in hendrerit gravida rutrum. Bibendum ut tristique et egestas quis ipsum suspendisse ultrices gravida. Euismod nisi porta lorem mollis. At varius vel pharetra vel turpis.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "new"
                                },
                                text: "Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Lacus sed turpis tincidunt id. Eget nunc scelerisque viverra mauris in aliquam sem fringilla ut. Dapibus ultrices in iaculis nunc sed.",
                                url: "#"
                            }
                        ]
                    },
                    {
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "breaking"
                                },
                                text: "Tempus iaculis urna id volutpat lacus laoreet non. Elementum nisi quis eleifend quam adipiscing vitae proin. Vel pretium lectus quam id leo. Eget sit amet tellus cras adipiscing enim eu turpis.",
                                url: "#"
                            },
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: "breaking"
                                },
                                text: "Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Adipiscing vitae proin sagittis nisl rhoncus. Euismod in pellentesque massa placerat duis. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin. Quam nulla porttitor massa id neque.",
                                url: "#"
                            }
                        ]
                    }
                ]
            },
            {
                id: "content-health-paid-content",
                name: "Paid Content",
                articles: [
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eu sem integer vitae justo eget magna fermentum iaculis. Aenean pharetra magna ac placerat vestibulum lectus. Amet commodo nulla facilisi nullam.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nullam vehicula ipsum a arcu cursus vitae congue. Enim ut tellus elementum sagittis vitae et leo duis. Nulla malesuada pellentesque elit eget.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Est velit egestas dui id ornare arcu odio. Urna nunc id cursus metus. Pellentesque adipiscing commodo elit at imperdiet dui accumsan sit. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit.",
                            },
                        ],
                    },
                    {
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Erat imperdiet sed euismod nisi porta. Nullam ac tortor vitae purus faucibus ornare. Feugiat nisl pretium fusce id. Massa enim nec dui nunc mattis enim ut tellus elementum.",
                            },
                        ],
                    },
                ],
            },
        ],
    },
};
