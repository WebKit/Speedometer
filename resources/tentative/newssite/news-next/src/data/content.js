export const content = {
    home: {
        name: "Home",
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
                id: "content-frontpage-world-media",
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
                id: "content-politics-latest",
                name: "latest",
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
                        content: "Pharetra diam sit amet nisl suscipit adipiscing bibendum est. Id aliquet lectus proin nibh. Porta lorem mollis aliquam ut porttitor leo a. Congue eu consequat ac felis donec et odio pellentesque.",
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
                                title: "A arcu cursus vitae congue mauris. Neque viverra justo nec ultrices dui sapien eget mi proin. In nisl nisi scelerisque eu ultrices.",
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
                                title: "Eget mi proin sed libero enim sed. Proin libero nunc consequat interdum varius. Porta nibh venenatis cras sed felis.",
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
                                title: "Nibh cras pulvinar mattis nunc sed. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Ultricies mi quis hendrerit dolor magna eget est lorem.",
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
                id: "content-health-latest-media",
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
