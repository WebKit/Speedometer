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
                    type: "reject",
                },
                {
                    name: "Accept",
                    priority: "primary",
                    type: "accept",
                },
            ],
        },
        sections: [
            {
                id: "content-frontpage-breaking-news",
                name: "Breaking News",
                articles: [
                    {
                        id: "8a6ed5ec-89f3-42ad-b948-189d36f278c9",
                        class: "columns-3-narrow",
                        header: "Uncensored",
                        url: "#",
                        image: {
                            src: "assets/images/isai-ramos-Sp70YIWtuM8-unsplash_1280x720.webp",
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
                        id: "d204d10c-879e-4991-802c-25020077e0de",
                        class: "columns-3-wide",
                        header: "More top stories",
                        url: "#",
                        image: {
                            src: "assets/images/nasa-dCgbRAQmTQA-unsplash_1280x737.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: {
                                type: "breaking",
                                label: "breaking",
                            },
                        },
                        title: "Justo eget magna fermentum iaculis eu non diam phasellus vestibulum.",
                        type: "text",
                        content:
                            "Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere. Arcu bibendum at varius vel pharetra vel turpis nunc. Eget dolor morbi non arcu risus quis varius. Ac odio tempor orci dapibus ultrices in.\n\nAmet tellus cras adipiscing enim eu turpis. Tortor pretium viverra suspendisse potenti nullam. Condimentum vitae sapien pellentesque habitant morbi. Ultrices in iaculis nunc sed augue lacus viverra vitae.",
                    },
                    {
                        id: "e02d07e1-32e3-4ad1-b57c-b945f89d12d3",
                        class: "columns-3-narrow",
                        header: "Crime & justice",
                        url: "#",
                        image: {
                            src: "assets/images/jordhan-madec-AD5ylD2T0UY-unsplash_1280x720.webp",
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
                            "Volutpat commodo sed egestas egestas. Eget lorem dolor sed viverra ipsum nunc aliquet bibendum enim. Felis eget velit aliquet sagittis id consectetur purus. Lorem ipsum dolor sit amet. Ut diam quam nulla porttitor. Id volutpat lacus laoreet non.\n\n Odio morbi quis commodo odio aenean sed adipiscing diam donec. Quis eleifend quam adipiscing vitae proin sagittis nisl. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus.",
                    },
                ],
            },
            {
                id: "content-frontpage-latest-news",
                name: "Latest News",
                articles: [
                    {
                        id: "7af9e63d-d803-477b-ba8f-539f5d7ed1fe",
                        class: "columns-3-balanced",
                        header: "Happening Now",
                        type: "articles-list",
                        content: [
                            {
                                id: "45114281-a2ad-4ed8-bb47-80526e802eb1",
                                title: "Lorem ipsum dolor sit amet.",
                                content:
                                    "Molestie nunc non blandit massa enim nec. Ornare suspendisse sed nisi lacus sed viverra tellus in. Id consectetur purus ut faucibus. At auctor urna nunc id cursus metus. Eget aliquet nibh praesent tristique magna. Morbi tristique senectus et netus et malesuada fames.",
                            },
                            {
                                id: "ee8b2a9f-a08b-495e-a4ba-21b3b42bf07d",
                                title: "Consectetur adipiscing elit.",
                                content:
                                    "Sit amet consectetur adipiscing elit ut aliquam purus sit. Consequat nisl vel pretium lectus quam. Sagittis id consectetur purus ut faucibus pulvinar elementum integer enim. Nec sagittis aliquam malesuada bibendum arcu.",
                            },
                            {
                                id: "4a9d6914-983d-48ab-a7ed-d7ed1d877a6b",
                                title: "Sed do eiusmod tempor incididunt.",
                                content: "Pulvinar neque laoreet suspendisse interdum consectetur libero id faucibus nisl. Pulvinar elementum integer enim neque volutpat ac. Lorem donec massa sapien faucibus.",
                            },
                        ],
                    },
                    {
                        id: "cb7942ac-5ac8-40d1-90fd-7853a0a10d16",
                        class: "columns-3-balanced",
                        header: "Noteworthy",
                        image: {
                            src: "assets/images/peter-lawrence-rXZa4ufjoGw-unsplash_1280x720.webp",
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
                                id: "b5f94d51-7e7c-4e1f-b55d-e99ba9e2398d",
                                content: "Odio morbi quis commodo odio aenean sed adipiscing diam donec.",
                            },
                            {
                                id: "6ce7f58f-429c-4835-a7fc-8f8bd1f3a12e",
                                content: "Consequat semper viverra nam libero justo laoreet sit.",
                            },
                            {
                                id: "021f9b0b-1666-4d15-a32b-42a464475cc0",
                                content: "Risus ultricies tristique nulla aliquet enim tortor at auctor.",
                            },
                            {
                                id: "bf40e93f-eea6-4f0a-8ad5-1e25cd3b69ab",
                                content: "Diam vulputate ut pharetra sit amet aliquam id diam maecenas.",
                            },
                        ],
                    },
                    {
                        id: "cd53f511-0251-4fb0-ae85-9ad228551dd6",
                        class: "columns-3-balanced",
                        header: "Around the Globe",
                        image: {
                            src: "assets/images/rufinochka-XonjCOZZN_w-unsplash_1280x720.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Nunc felis tellus, ultrices eget massa ac, lobortis laoreet lorem.",
                        type: "list",
                        content: [
                            {
                                id: "7e405fe8-7abd-43b7-bbca-2ea2e7b0ac76",
                                content: "Nibh mauris cursus mattis molestie. Varius vel pharetra vel turpis nunc eget lorem dolor.",
                            },
                            {
                                id: "b9dad22b-d7b9-4ca2-9585-c8762a15de9c",
                                content: "Turpis egestas maecenas pharetra convallis posuere morbi leo urna molestie.",
                            },
                            {
                                id: "b87bd7d4-03b1-4107-accc-de86415f1de0",
                                content: "Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat.",
                            },
                            {
                                id: "6c8c8717-7069-4f37-865a-e69c8c01a6ba",
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
                        id: "b419e5f0-1707-4c0e-85b3-48f26a70f91b",
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                id: "a2ef309b-d8af-4621-9a33-883269394a96",
                                image: {
                                    src: "assets/images/steven-van-bTPP3jBnOb8-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "fb3262b1-6618-4d3d-998b-6072104beefa",
                                image: {
                                    src: "assets/images/markus-spiske-WUehAgqO5hE-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "ed0edcac-b8f1-43d4-a0a3-fdee2812122e",
                                image: {
                                    src: "assets/images/david-everett-strickler-igCBFrMd11I-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "0b55ff73-13ca-43ae-9980-d02d01abd921",
                                image: {
                                    src: "assets/images/marco-oriolesi-wqLGlhjr6Og-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
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
                        id: "1519cdfe-bb32-4f0a-aad1-2f4bb87096a4",
                        class: "columns-wrap",
                        header: "Domestic Highlights",
                        type: "excerpt",
                        content: [
                            {
                                id: "ff2abe6a-3418-473e-80c1-b262188e5554",
                                image: {
                                    src: "assets/images/samuel-schroth-hyPt63Df3Dw-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "At urna condimentum mattis pellentesque id nibh tortor id. Urna cursus eget nunc scelerisque viverra mauris in. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu.",
                            },
                            {
                                id: "7ea12782-cf94-459d-b7ec-3be5d43175cf",
                                image: {
                                    src: "assets/images/denys-nevozhai-7nrsVjvALnA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Enim lobortis scelerisque fermentum dui faucibus in. Vitae semper quis lectus nulla at volutpat. In nisl nisi scelerisque eu ultrices vitae auctor.",
                            },
                            {
                                id: "0af1cd6a-a044-43b4-8ec8-26b71a0a9ca4",
                                image: {
                                    src: "assets/images/mattia-bericchia-xkD79yf4tb8-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Lorem donec massa sapien faucibus et molestie ac feugiat. Quis varius quam quisque id diam vel. Ut tristique et egestas quis ipsum suspendisse. Fermentum posuere urna nec tincidunt praesent semper feugiat.",
                            },
                        ],
                    },
                    {
                        id: "0b9b6f8c-0dde-4c2f-82dd-b777fa84881d",
                        class: "columns-wrap",
                        header: "Global Highlights",
                        type: "excerpt",
                        content: [
                            {
                                id: "c69ff80d-44cf-463a-b3db-bc2f22e8993c",
                                image: {
                                    src: "assets/images/maximilian-bungart-nwqfl_HtJjk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Augue eget arcu dictum varius duis at consectetur. Ornare arcu dui vivamus arcu felis bibendum ut. Magna eget est lorem ipsum dolor sit amet. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada proin.",
                            },
                            {
                                id: "24cfa9e5-9a6c-4e00-980a-05a5d583e718",
                                image: {
                                    src: "assets/images/gaku-suyama-VyiLZUcdJv0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Leo urna molestie at elementum eu facilisis sed. Est lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque.",
                            },
                            {
                                id: "3bf00e72-8821-446d-8096-1d5d3ea5c8c9",
                                image: {
                                    src: "assets/images/paul-bill-HLuPjCa6IYw-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nisi scelerisque eu ultrices vitae auctor. Quis risus sed vulputate odio. Pellentesque sit amet porttitor eget dolor morbi non. Nullam eget felis eget nunc lobortis mattis aliquam.",
                            },
                        ],
                    },
                    {
                        id: "8eed7659-370e-4a45-8977-b21eb88ab793",
                        class: "columns-wrap",
                        header: "Local Highlights",
                        type: "excerpt",
                        content: [
                            {
                                id: "72522d42-30bf-42f0-ba21-5dbc080dfab1",
                                image: {
                                    src: "assets/images/maarten-van-den-heuvel-gZXx8lKAb7Y-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Mattis ullamcorper velit sed ullamcorper. Orci ac auctor augue mauris augue neque. Condimentum mattis pellentesque id nibh tortor.",
                            },
                            {
                                id: "bab8b49c-4e37-4cf8-8c52-714cb53daf5d",
                                image: {
                                    src: "assets/images/quino-al-KydWCDJe9s0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Fermentum odio eu feugiat pretium. Urna nec tincidunt praesent semper feugiat nibh sed. Adipiscing elit ut aliquam purus sit.",
                            },
                            {
                                id: "eb3516e6-ad00-4d39-822c-acc4eab9befa",
                                image: {
                                    src: "assets/images/mathurin-napoly-matnapo-pIJ34ZrZEEw-unsplash_1280x720.webp",
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
                        id: "4e01d65b-b4f0-4b43-8d28-2fb8f918071c",
                        class: "columns-1",
                        type: "grid",
                        display: "grid-wrap",
                        content: [
                            {
                                id: "2923bc4a-fceb-45e7-bf92-f9e8f9d826ec",
                                image: {
                                    src: "assets/images/andrew-solok-LbckXdUVOlY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Ut venenatis tellus in metus vulputate eu scelerisque. In nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Mattis nunc sed blandit libero volutpat sed cras ornare arcu. Scelerisque eu ultrices vitae auctor eu augue. Libero justo laoreet sit amet cursus sit amet.",
                                url: "#",
                            },
                            {
                                id: "9268157a-12cb-442f-9401-0d88d1846662",
                                image: {
                                    src: "assets/images/hassan-kibwana-fmXLB_uHIh4-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Non consectetur a erat nam. Blandit massa enim nec dui nunc mattis enim ut. Tempor orci eu lobortis elementum nibh tellus molestie nunc. Facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui.",
                                url: "#",
                            },
                            {
                                id: "5113935d-4ed6-4897-a49a-d730de47a973",
                                image: {
                                    src: "assets/images/craig-manners-LvJCFOW3Ma8-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Eget est lorem ipsum dolor sit amet. Vivamus at augue eget arcu dictum varius duis at consectetur. Scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis. Vitae sapien pellentesque habitant morbi tristique senectus et.",
                                url: "#",
                            },
                            {
                                id: "8dbd8d34-edb4-4583-9468-0009d55745c9",
                                image: {
                                    src: "assets/images/albert-stoynov-fEdf0fig3os-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Diam in arcu cursus euismod quis viverra nibh cras pulvinar. Est velit egestas dui id ornare arcu odio ut sem. A cras semper auctor neque. Ipsum suspendisse ultrices gravida dictum fusce ut.",
                                url: "#",
                            },
                            {
                                id: "ec4d93f4-83f7-4427-81fc-b6420d590718",
                                image: {
                                    src: "assets/images/ehimetalor-akhere-unuabona-yS0uBoF4xDo-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Tellus integer feugiat scelerisque varius morbi enim. Diam donec adipiscing tristique risus nec feugiat in fermentum. Volutpat odio facilisis mauris sit amet massa vitae. Tempor orci dapibus ultrices in iaculis nunc sed. Aenean vel elit scelerisque mauris pellentesque pulvinar.",
                                url: "#",
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
                        id: "c5deda28-5da7-4641-80dd-e9859088c95d",
                        class: "columns-3-balanced",
                        header: "Europe",
                        type: "articles-list",
                        content: [
                            {
                                id: "6a93436c-6c5b-44a7-938e-ebb1f2ee3c15",
                                title: "Commodo elit at imperdiet dui accumsan sit amet. Habitasse platea dictumst vestibulum rhoncus.",
                                content:
                                    "Orci ac auctor augue mauris augue neque gravida. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Sagittis aliquam malesuada bibendum arcu vitae. Pellentesque habitant morbi tristique senectus et netus. Etiam erat velit scelerisque in dictum non consectetur a.",
                            },
                            {
                                id: "283ea033-d01a-48a9-b584-635b0b3c8c30",
                                title: "Suspendisse convallis efficitur felis ac mattis. Cras faucibus ultrices condimentum.",
                                content:
                                    "Facilisis leo vel fringilla est. Turpis tincidunt id aliquet risus feugiat in ante metus. Viverra ipsum nunc aliquet bibendum enim facilisis. Tristique et egestas quis ipsum suspendisse ultrices gravida dictum. Tristique senectus et netus et malesuada fames ac turpis egestas.",
                            },
                            {
                                id: "5670b9e0-4b99-48d5-8b31-525ae350de32",
                                title: "Ornare suspendisse sed nisi lacus sed viverra tellus in.",
                                content: "Dui vivamus arcu felis bibendum. Purus ut faucibus pulvinar elementum integer enim neque volutpat ac. Auctor eu augue ut lectus arcu bibendum. Diam volutpat commodo sed egestas egestas fringilla phasellus.",
                            },
                        ],
                    },
                    {
                        id: "387033b0-e832-48b3-a3fe-f104075cf93a",
                        class: "columns-3-balanced",
                        header: "South America",
                        type: "articles-list",
                        content: [
                            {
                                id: "ace185f1-1e8a-4db5-9266-95412f7b06ff",
                                title: "Augue eget arcu dictum varius duis.",
                                content: "Commodo ullamcorper a lacus vestibulum sed arcu non. Nullam ac tortor vitae purus faucibus ornare suspendisse sed. Id interdum velit laoreet id donec ultrices tincidunt arcu non.",
                            },
                            {
                                id: "3a4170ea-bd6f-4de9-94e9-7f487d68e1eb",
                                title: "Fringilla ut morbi tincidunt augue interdum velit euismod in pellentesque.",
                                content:
                                    "Turpis egestas maecenas pharetra convallis posuere morbi leo. Odio pellentesque diam volutpat commodo. Ornare massa eget egestas purus viverra accumsan in nisl nisi. Tellus integer feugiat scelerisque varius morbi enim nunc. Erat velit scelerisque in dictum non consectetur.",
                            },
                            {
                                id: "b5b51051-9b1c-496b-8390-432802b4e1e7",
                                title: "Mi bibendum neque egestas congue quisque.",
                                content: "Sapien eget mi proin sed libero. Adipiscing elit duis tristique sollicitudin nibh sit. Faucibus scelerisque eleifend donec pretium. Ac tortor dignissim convallis aenean et tortor at risus.",
                            },
                        ],
                    },
                    {
                        id: "06fa8c40-6678-483b-bbb5-a8f73822d1e1",
                        class: "columns-3-balanced",
                        header: "Asia",
                        type: "articles-list",
                        content: [
                            {
                                id: "3654e18a-e633-4774-899a-7517b2ff28c7",
                                title: "Sodales ut etiam sit amet nisl purus in. Enim sed faucibus turpis in eu mi bibendum neque.",
                                content: "Tortor id aliquet lectus proin. Pulvinar elementum integer enim neque volutpat ac tincidunt. Auctor eu augue ut lectus arcu bibendum at varius. Congue mauris rhoncus aenean vel elit scelerisque mauris.",
                            },
                            {
                                id: "3461de32-20f7-4787-b31c-4c1b08b9e02b",
                                title: "haretra convallis posuere morbi leo urna.",
                                content:
                                    "Egestas diam in arcu cursus euismod quis. Ac turpis egestas integer eget aliquet nibh praesent tristique magna. Molestie at elementum eu facilisis sed odio morbi quis. Lectus arcu bibendum at varius. Eros in cursus turpis massa tincidunt dui.",
                            },
                            {
                                id: "3fe9e8db-160b-4a2d-b586-33cce8f4c3fa",
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
                        id: "f0704a5e-cf35-4c2b-afc1-c07325577554",
                        class: "columns-3-balanced",
                        header: "Washington",
                        image: {
                            src: "assets/images/heidi-kaden-L_U4jhwZ6hY-unsplash_1280x720.webp",
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
                                id: "e82d88ff-6406-4f82-8d8a-3c0939cda3ba",
                                content: "Vulputate dignissim suspendisse in est ante.",
                                url: "#",
                            },
                            {
                                id: "0dc64ba7-dc5b-4cb4-b729-fbee531ae382",
                                content: "Blandit turpis cursus in hac habitasse platea dictumst.",
                                url: "#",
                            },
                            {
                                id: "8a54f7e2-3aec-4e91-a029-9b9fe2a9bf07",
                                content: "Sed nisi lacus sed viverra tellus in hac.",
                                url: "#",
                            },
                            {
                                id: "337cf7d7-0cbf-4a6f-ba8d-f5ab56f542af",
                                content: "Euismod in pellentesque massa placerat duis ultricies lacus sed.",
                                url: "#",
                            },
                            {
                                id: "b93dfad8-0ad4-4825-bdf2-b9a6c77ed21a",
                                content: "Quam lacus suspendisse faucibus interdum posuere.",
                                url: "#",
                            },
                            {
                                id: "28b3b72d-55c5-4f42-b51b-c6c5fffc506d",
                                content: "Sit amet mattis vulputate enim nulla aliquet porttitor lacus.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "9f57970b-05f9-45c2-9e3c-ab0f66ce47f3",
                        class: "columns-3-balanced",
                        header: "New York",
                        image: {
                            src: "assets/images/hannah-busing-0V6DmTuJaIk-unsplash_1280x720.webp",
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
                                id: "36576fce-6f70-4b2f-b635-d586a51b3a9b",
                                content: "Id semper risus in hendrerit gravida rutrum quisque non.",
                                url: "#",
                            },
                            {
                                id: "efd66d67-6a81-46be-b682-6dfa7b5895df",
                                content: "Sit amet est placerat in egestas erat imperdiet sed euismod.",
                                url: "#",
                            },
                            {
                                id: "1390fee3-5d9b-468c-8d95-9c04943a3561",
                                content: "Aliquam malesuada bibendum arcu vitae elementum curabitur vitae nunc.",
                                url: "#",
                            },
                            {
                                id: "a2f63129-54de-4003-8070-42dbba2c1bfd",
                                content: "get gravida cum sociis natoque. Bibendum ut tristique et egestas.",
                                url: "#",
                            },
                            {
                                id: "9eec6eb8-c67e-4b57-8e7e-fe4a71dbae2b",
                                content: "Mauris cursus mattis molestie a iaculis at erat.",
                                url: "#",
                            },
                            {
                                id: "677e1086-aef8-4561-8ecb-af75a7c82f6f",
                                content: "Sit amet massa vitae tortor condimentum lacinia.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "bda30bf1-8032-4bfa-b17d-07571a7251f7",
                        class: "columns-3-balanced",
                        header: "Los Angeles",
                        image: {
                            src: "assets/images/martin-jernberg-jVNWCFwdjZU-unsplash_1280x720.webp",
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
                                id: "51427dca-f312-4cc7-b7b2-719bf4c5cd8a",
                                content: "Mattis enim ut tellus elementum sagittis.",
                                url: "#",
                            },
                            {
                                id: "6f3ae21d-312b-4065-8af1-04719f6d3160",
                                content: "Sit amet venenatis urna cursus eget nunc scelerisque viverra mauris.",
                                url: "#",
                            },
                            {
                                id: "352dec10-0863-4244-a60b-002e40022c94",
                                content: "Mi bibendum neque egestas congue quisque egestas.",
                                url: "#",
                            },
                            {
                                id: "e31c2cc9-5f99-4a01-84cf-587dcf47be7e",
                                content: "Nunc scelerisque viverra mauris in aliquam.",
                                url: "#",
                            },
                            {
                                id: "9c041d54-ea0b-4a63-877b-a793f1b84297",
                                content: "Egestas erat imperdiet sed euismod nisi porta lorem mollis aliquam.",
                                url: "#",
                            },
                            {
                                id: "a31a24a9-708a-4227-9038-bd14a0a7c7b1",
                                content: "Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt tortor aliquam.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-underscored",
                name: "Underscored",
                articles: [
                    {
                        id: "affd2923-97de-4410-9258-bce3e4a19b87",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "92946ccb-022d-4319-be94-49e476c31077",
                                image: {
                                    src: "assets/images/kevin-wang-t7vEVxwGGm0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Rhoncus urna neque viverra justo nec. Dis parturient montes nascetur ridiculus mus mauris vitae ultricies leo. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Enim nunc faucibus a pellentesque sit amet. Est ullamcorper eget nulla facilisi.",
                                url: "#",
                            },
                            {
                                id: "419ea32d-d12e-4c2b-9a14-fee91ba7ee7f",
                                image: {
                                    src: "assets/images/claudio-schwarz-3cWxxW2ggKE-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Enim lobortis scelerisque fermentum dui faucibus in ornare quam. Iaculis urna id volutpat lacus laoreet non curabitur gravida. Non quam lacus suspendisse faucibus. Elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at. Bibendum est ultricies integer quis auctor elit.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "a196957d-d9fa-400a-a94c-dca3f6815700",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "4e31cef9-8787-437c-ae06-9e5654f540d9",
                                image: {
                                    src: "assets/images/braden-collum-9HI8UJMSdZA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Faucibus scelerisque eleifend donec pretium vulputate. Lacus luctus accumsan tortor posuere. Nulla facilisi nullam vehicula ipsum a arcu cursus vitae. Viverra aliquet eget sit amet tellus cras adipiscing. Congue quisque egestas diam in arcu cursus.",
                                url: "#",
                            },
                            {
                                id: "292cc517-c2d8-4941-acf3-bfe9a33cea58",
                                image: {
                                    src: "assets/images/geoff-scott-8lUTnkZXZSA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Cum sociis natoque penatibus et magnis dis parturient montes. Ut eu sem integer vitae justo eget magna fermentum iaculis. Amet venenatis urna cursus eget nunc scelerisque viverra. Quisque id diam vel quam elementum. Nulla facilisi cras fermentum odio eu feugiat pretium nibh.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-happening-now",
                name: "Happening Now",
                articles: [
                    {
                        id: "f07e6f59-5962-4410-b1a1-493770fa85c6",
                        class: "columns-wrap",
                        header: "Political",
                        type: "excerpt",
                        content: [
                            {
                                id: "501331da-4f36-4a63-8e37-78fbc84d7485",
                                image: {
                                    src: "assets/images/jonathan-simcoe-S9J1HqoL9ns-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Cras semper auctor neque vitae tempus quam pellentesque. Consequat ac felis donec et odio pellentesque. Eu consequat ac felis donec et odio pellentesque diam volutpat. Suscipit tellus mauris a diam maecenas sed enim ut sem.",
                            },
                            {
                                id: "72c9a293-beba-4604-8a5b-ae6ec5dbdcf0",
                                image: {
                                    src: "assets/images/markus-spiske-p2Xor4Lbrrk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Sed faucibus turpis in eu mi bibendum neque. Condimentum id venenatis a condimentum vitae sapien pellentesque habitant morbi. In iaculis nunc sed augue lacus viverra. Pellentesque nec nam aliquam sem et. Tellus mauris a diam maecenas sed.",
                            },
                            {
                                id: "505495bc-4141-4277-aba5-08cecdb0f52c",
                                image: {
                                    src: "assets/images/marius-oprea-ySA9uj7zSmw-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Mattis vulputate enim nulla aliquet. Ac tortor dignissim convallis aenean. Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Consequat ac felis donec et odio pellentesque diam. Lorem ipsum dolor sit amet consectetur adipiscing.",
                            },
                        ],
                    },
                    {
                        id: "3c3b206d-1b03-4fcc-9469-25b2caa64622",
                        class: "columns-wrap",
                        header: "Health",
                        type: "excerpt",
                        content: [
                            {
                                id: "ce276359-8308-4af0-8d6f-c9141503f972",
                                image: {
                                    src: "assets/images/jannis-brandt-mmsQUgMLqUo-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Vitae tortor condimentum lacinia quis. Nisl nisi scelerisque eu ultrices vitae. Id velit ut tortor pretium viverra suspendisse potenti nullam. Viverra accumsan in nisl nisi scelerisque eu ultrices vitae.",
                            },
                            {
                                id: "e3a10fed-2a09-4821-aad0-b8af9f906769",
                                image: {
                                    src: "assets/images/martha-dominguez-de-gouveia-k-NnVZ-z26w-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ullamcorper malesuada proin libero nunc consequat. Imperdiet sed euismod nisi porta. Arcu cursus vitae congue mauris rhoncus aenean vel. Enim nunc faucibus a pellentesque. Gravida in fermentum et sollicitudin ac orci phasellus.",
                            },
                            {
                                id: "3676e79b-88d4-454c-ae72-32e3f38b869f",
                                image: {
                                    src: "assets/images/freestocks-nss2eRzQwgw-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Morbi tristique senectus et netus et malesuada fames. Sit amet cursus sit amet dictum sit. Sagittis vitae et leo duis ut diam quam. Non consectetur a erat nam at lectus. Massa massa ultricies mi quis hendrerit dolor magna eget est.",
                            },
                        ],
                    },
                    {
                        id: "19a7a320-69b7-4ac6-b2b1-17206ccc8e67",
                        class: "columns-wrap",
                        header: "Business",
                        type: "excerpt",
                        content: [
                            {
                                id: "8431d24b-4967-4434-b165-18af09cbfe81",
                                image: {
                                    src: "assets/images/little-plant-TZw891-oMio-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Integer enim neque volutpat ac. Feugiat sed lectus vestibulum mattis. Ullamcorper malesuada proin libero nunc consequat interdum varius sit amet. Mattis molestie a iaculis at erat pellentesque. Adipiscing elit duis tristique sollicitudin.",
                            },
                            {
                                id: "50fa2776-bff8-42c7-a0ea-883cf40e66cf",
                                image: {
                                    src: "assets/images/allan-wadsworth-Lp78NT-mf9o-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Dignissim sodales ut eu sem integer. Mauris cursus mattis molestie a iaculis at erat. Tempus quam pellentesque nec nam aliquam sem et tortor. Id diam vel quam elementum pulvinar etiam non quam.",
                            },
                            {
                                id: "f9099723-cd63-4158-906e-d9bf33904156",
                                image: {
                                    src: "assets/images/ant-rozetsky-SLIFI67jv5k-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Massa vitae tortor condimentum lacinia quis vel eros. Platea dictumst vestibulum rhoncus est pellentesque. Sollicitudin tempor id eu nisl nunc mi ipsum faucibus vitae. Sed risus ultricies tristique nulla aliquet. Magna sit amet purus gravida quis blandit turpis cursus in.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-frontpage-hot-topics",
                name: "Hot Topics",
                articles: [
                    {
                        id: "514e6188-22a4-4d01-ac19-342df74680e7",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "79d06fe0-30a7-41b8-b318-1aca53454296",
                                image: {
                                    src: "assets/images/alexandre-debieve-FO7JIlwjOtU-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Amet nisl suscipit adipiscing bibendum. Elit ullamcorper dignissim cras tincidunt lobortis feugiat. Non odio euismod lacinia at. Risus viverra adipiscing at in tellus integer feugiat scelerisque.",
                                url: "#",
                            },
                            {
                                id: "6c9f3533-ab33-4099-a38c-f2841d7ca278",
                                image: {
                                    src: "assets/images/thisisengineering-ZPeXrWxOjRQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Viverra suspendisse potenti nullam ac tortor. Tellus id interdum velit laoreet id donec. Dui nunc mattis enim ut tellus. Nec ullamcorper sit amet risus nullam eget felis eget. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "df35d241-7b4e-41af-b4a8-aa5ac86a2625",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "16d97cdf-e13a-4470-8d7b-70ef8a0d6542",
                                image: {
                                    src: "assets/images/isaw-company-Oqv_bQbZgS8-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Commodo ullamcorper a lacus vestibulum sed arcu non odio euismod. Etiam non quam lacus suspendisse. Hac habitasse platea dictumst vestibulum rhoncus est.",
                                url: "#",
                            },
                            {
                                id: "26c3b788-742a-4b7a-824e-91db371e5083",
                                image: {
                                    src: "assets/images/aditya-chinchure-ZhQCZjr9fHo-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Mi eget mauris pharetra et ultrices neque ornare aenean euismod. Egestas congue quisque egestas diam in arcu cursus euismod quis. Tincidunt id aliquet risus feugiat. Viverra nibh cras pulvinar mattis nunc sed.",
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
                        id: "694bbfce-f1c9-4e10-95bc-a89023d5e1ea",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "39a82f01-b2fc-4740-a5ca-f1ada041100a",
                                image: {
                                    src: "assets/images/tamara-bellis-IwVRO3TLjLc-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                            },
                            {
                                id: "8a50960e-fbde-4705-bc6a-76865f78ec50",
                                image: {
                                    src: "assets/images/david-lezcano-NfZiOJzZgcg-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim.",
                            },
                        ],
                    },
                    {
                        id: "6e110ab5-5d43-411b-a64e-3dae38960a60",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "9728082f-7e27-4366-8bf4-dbd74f13daf8",
                                image: {
                                    src: "assets/images/heidi-fin-2TLREZi7BUg-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Quam lacus suspendisse faucibus interdum. In pellentesque massa placerat duis ultricies lacus sed. Convallis a cras semper auctor neque vitae tempus quam. Ut pharetra sit amet aliquam id diam.",
                            },
                            {
                                id: "216eaa21-8a0f-4baf-8dc3-103391d77002",
                                image: {
                                    src: "assets/images/joshua-rawson-harris-YNaSz-E7Qss-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Eu feugiat pretium nibh ipsum consequat.",
                            },
                        ],
                    },
                    {
                        id: "e72adfa5-f82e-42b3-a0c6-c43f0c3f9393",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "848a8767-90da-4ff1-a2b1-293def11434f",
                                image: {
                                    src: "assets/images/arturo-rey-5yP83RhaFGA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Non tellus orci ac auctor augue mauris augue neque gravida. Nulla facilisi nullam vehicula ipsum a arcu cursus vitae. Quam nulla porttitor massa id neque aliquam vestibulum morbi. Diam quis enim lobortis scelerisque.",
                            },
                            {
                                id: "f9c3995e-c12d-47ef-89e6-efb535d7678a",
                                image: {
                                    src: "assets/images/clem-onojeghuo-RLJnH4Mt9A0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Haretra diam sit amet nisl suscipit adipiscing bibendum est ultricies. Senectus et netus et malesuada fames.",
                            },
                        ],
                    },
                    {
                        id: "96bc6b53-c533-4970-adb7-8dae30da76cc",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "15d8615d-52c0-4aa5-a0d0-2eb20c6c0675",
                                image: {
                                    src: "assets/images/ashim-d-silva-ZmgJiztRHXE-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "It amet porttitor eget dolor morbi non. Sed lectus vestibulum mattis ullamcorper. Laoreet id donec ultrices tincidunt arcu non. Quam adipiscing vitae proin sagittis.",
                            },
                            {
                                id: "75a08ef8-8177-4047-bb40-3448c0169cd9",
                                image: {
                                    src: "assets/images/toa-heftiba--abWByT3yg4-unsplash_1280x720.webp",
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
            description: "Something important happened and you should watch it!",
        },
        sections: [
            {
                id: "content-us-world-news",
                name: "World News",
                articles: [
                    {
                        id: "31b24534-29f6-469f-8ce3-ff774997ef8a",
                        class: "columns-3-wide",
                        header: "Happening Today",
                        url: "#",
                        image: {
                            src: "assets/images/todd-trapani-vS54KomBEJU-unsplash_1280x720.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: {
                                type: "breaking",
                                label: "breaking",
                            },
                        },
                        title: "Sed egestas egestas fringilla phasellus faucibus scelerisque eleifend.",
                        type: "text",
                        content:
                            "Iaculis urna id volutpat lacus. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Dictum varius duis at consectetur lorem donec. At tellus at urna condimentum mattis pellentesque id. Consectetur lorem donec massa sapien faucibus et molestie ac. Risus at ultrices mi tempus.",
                    },
                    {
                        id: "06f7b876-6120-4273-8850-f60f817940f0",
                        class: "columns-3-narrow",
                        header: "Trending",
                        url: "#",
                        image: {
                            src: "assets/images/mufid-majnun-tJJIGh703I4-unsplash_1280x720.webp",
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
                        id: "e9f3877f-a2a6-41fb-898b-9acb0fdedc19",
                        class: "columns-3-narrow",
                        header: "Weather",
                        url: "#",
                        image: {
                            src: "assets/images/noaa--urO88VoCRE-unsplash_1280x720.webp",
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
                                id: "2ed5ca3f-6fca-4061-b055-d79058547e93",
                                content: "Pellentesque habitant morbi tristique senectus et. Vel eros donec ac odio tempor orci dapibus ultrices in.",
                            },
                            {
                                id: "afcab89c-38d8-4d5e-9b52-cd560cb92d96",
                                content: "Et odio pellentesque diam volutpat commodo sed egestas egestas fringilla.",
                            },
                            {
                                id: "e9c96309-74a2-4ceb-b0de-8b1a6be4fbdc",
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
                        id: "4e19c383-aff6-45de-b874-008c58a9667f",
                        class: "columns-3-balanced",
                        header: "Latest",
                        image: {
                            src: "assets/images/fons-heijnsbroek-vBfEZdpEr-E-unsplash_1280x720.webp",
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
                                id: "f3197d93-1041-423d-b648-f7b717f7ea9d",
                                content: "Nibh ipsum consequat nisl vel. Senectus et netus et malesuada fames.",
                            },
                            {
                                id: "aa2cfed6-54e2-468d-9a03-dd4db4cab1b4",
                                content: "Lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi.",
                            },
                            {
                                id: "37a7a6b1-710f-45da-a481-2a23c0d90a31",
                                content: "Blandit volutpat maecenas volutpat blandit aliquam etiam erat.",
                            },
                            {
                                id: "48103727-1181-4b8c-b536-062e8a868106",
                                content: "Non curabitur gravida arcu ac. Est sit amet facilisis magna etiam tempor orci eu lobortis.",
                            },
                        ],
                    },
                    {
                        id: "53c3567d-6073-41e8-87ca-f76a282c38f9",
                        class: "columns-3-balanced",
                        header: "Business",
                        image: {
                            src: "assets/images/bram-naus-oqnVnI5ixHg-unsplash_1280x720.webp",
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
                                id: "2f03cb48-b182-46e7-a651-3bd04ee622bb",
                                content: "Sapien pellentesque habitant morbi tristique senectus et.",
                            },
                            {
                                id: "4cf064fc-6ad2-4ef4-9bca-ac6607da0912",
                                content: "Aliquet eget sit amet tellus cras adipiscing.",
                            },
                            {
                                id: "5fad11d7-ba53-487f-af21-e86b68a98d21",
                                content: "Tellus mauris a diam maecenas sed enim ut sem viverra.",
                            },
                        ],
                    },
                    {
                        id: "79344d21-3a1f-4531-87b7-971d0a01e959",
                        class: "columns-3-balanced",
                        header: "Politics",
                        image: {
                            src: "assets/images/hansjorg-keller-CQqyv5uldW4-unsplash_1280x720.webp",
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
                                id: "68ad5e3b-68ae-41da-ab0d-a073c78a4ca7",
                                content: "Euismod elementum nisi quis eleifend quam adipiscing vitae proin sagittis.",
                            },
                            {
                                id: "c48f6f5f-6be3-41ec-a067-c1dc072c0beb",
                                content: "Ac tincidunt vitae semper quis lectus nulla at volutpat diam.",
                            },
                            {
                                id: "1917cf48-ce4b-4e80-8828-3b104fbacff7",
                                content: "In mollis nunc sed id semper risus in hendrerit. Turpis massa sed elementum tempus egestas sed sed risus. Imperdiet proin fermentum leo vel orci.",
                            },
                            {
                                id: "13fb8e39-13c9-4f97-a15f-95bde9351960",
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
                        id: "660d5f2a-0977-423b-a585-dbd0f58695e4",
                        class: "columns-wrap",
                        header: "Washington",
                        type: "excerpt",
                        content: [
                            {
                                id: "bd34fb90-27ff-4e57-b29b-1cec6c56b423",
                                image: {
                                    src: "assets/images/unseen-histories-4kYkKW8v8rY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nisl nisi scelerisque eu ultrices vitae. Consectetur adipiscing elit duis tristique sollicitudin. Ornare suspendisse sed nisi lacus. Justo eget magna fermentum iaculis.",
                            },
                            {
                                id: "30a4e957-4170-4613-8d9a-5b417b999568",
                                image: {
                                    src: "assets/images/ian-hutchinson-P8rgDtEFn7s-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Tellus integer feugiat scelerisque varius morbi enim. Ut tristique et egestas quis.",
                            },
                            {
                                id: "ffc520db-68a5-451e-89df-86be7e126c10",
                                image: {
                                    src: "assets/images/koshu-kunii-ADLj1cyFfV8-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nulla malesuada pellentesque elit eget gravida cum sociis natoque penatibus.",
                            },
                        ],
                    },
                    {
                        id: "c88e0e0d-e323-4d4e-a0fb-b72c3fda9df8",
                        class: "columns-wrap",
                        header: "East Coast",
                        type: "excerpt",
                        content: [
                            {
                                id: "f93e2af2-f8ff-4706-8290-11a2cec073eb",
                                image: {
                                    src: "assets/images/matthew-landers-v8UgmRa6UDg-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Pharetra et ultrices neque ornare aenean euismod elementum nisi. Ipsum dolor sit amet consectetur adipiscing elit ut.",
                            },
                            {
                                id: "1298a3c4-6638-4afd-a34c-56ab2eaf281d",
                                image: {
                                    src: "assets/images/c-j-1GHqOftzYo0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Quam vulputate dignissim suspendisse in est. Vestibulum mattis ullamcorper velit sed.",
                            },
                            {
                                id: "5e765702-4e99-4cc5-b958-aad34be0b826",
                                image: {
                                    src: "assets/images/jacob-licht-8nA_iHrxHIo-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Habitant morbi tristique senectus et netus et. Ullamcorper sit amet risus nullam eget felis.",
                            },
                        ],
                    },
                    {
                        id: "a2267128-dd86-4a98-8903-0a887d49104e",
                        class: "columns-wrap",
                        header: "West Coast",
                        type: "excerpt",
                        content: [
                            {
                                id: "9c59f003-1eb3-4a86-9a00-9012470c2549",
                                image: {
                                    src: "assets/images/maria-lysenko-tZvkSuBleso-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Bibendum enim facilisis gravida neque convallis a cras. Semper feugiat nibh sed pulvinar proin gravida hendrerit.",
                            },
                            {
                                id: "951ecd15-5add-4f8a-8eaf-053be96c923b",
                                image: {
                                    src: "assets/images/peter-thomas-17EJD0QdKFI-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Vel facilisis volutpat est velit. Odio ut sem nulla pharetra diam sit amet nisl.",
                            },
                            {
                                id: "450f1f73-9d36-497a-bab0-6ca7c28c4f68",
                                image: {
                                    src: "assets/images/xan-griffin-QxNkzEjB180-unsplash_1280x720.webp",
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
                        id: "bc92acd8-0cbb-42e6-88dc-7589e92eb218",
                        class: "columns-3-balanced",
                        header: "Supreme Court",
                        type: "articles-list",
                        content: [
                            {
                                id: "a795ce54-f3f2-4a32-b59d-2a88530638dd",
                                title: "Vel risus commodo viverra maecenas.",
                                content:
                                    "Vitae tempus quam pellentesque nec nam aliquam sem. Mi in nulla posuere sollicitudin aliquam ultrices sagittis. Leo integer malesuada nunc vel. Ultricies integer quis auctor elit sed vulputate. Sit amet justo donec enim diam vulputate. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar.",
                            },
                            {
                                id: "7add8464-9b82-428a-a8ec-6489b6c4f830",
                                title: "Sit amet mattis vulputate enim.",
                                content:
                                    "Urna porttitor rhoncus dolor purus non. Tristique senectus et netus et malesuada fames ac turpis egestas. Suscipit tellus mauris a diam maecenas. Risus ultricies tristique nulla aliquet enim. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper.",
                            },
                            {
                                id: "45aa7276-1a3a-4be7-bd1c-c4885dd7e9e0",
                                title: "Mauris in aliquam sem fringilla ut morbi tincidunt.",
                                content:
                                    "A erat nam at lectus. Orci sagittis eu volutpat odio facilisis mauris sit. Faucibus nisl tincidunt eget nullam non. Nisl condimentum id venenatis a. Suscipit tellus mauris a diam maecenas sed enim. Orci nulla pellentesque dignissim enim sit amet venenatis. Est ultricies integer quis auctor.",
                            },
                        ],
                    },
                    {
                        id: "190711e5-6bc8-4b26-920a-b6edd74a0847",
                        class: "columns-3-balanced",
                        header: "Local Law",
                        type: "articles-list",
                        content: [
                            {
                                id: "a126bcfa-9915-4cd4-8a7f-db36ba5e426e",
                                title: "Sit amet justo donec enim diam vulputate ut.",
                                content:
                                    "Tincidunt dui ut ornare lectus sit amet est. Risus sed vulputate odio ut enim blandit volutpat maecenas volutpat. Posuere urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Euismod in pellentesque massa placerat duis.",
                            },
                            {
                                id: "de6f2266-ab8b-4312-b11c-78258500035b",
                                title: "Aliquam ultrices sagittis orci a scelerisque purus semper eget duis.",
                                content:
                                    "Lobortis feugiat vivamus at augue eget arcu. Id ornare arcu odio ut sem nulla pharetra diam. Mauris in aliquam sem fringilla ut morbi tincidunt augue interdum. Congue quisque egestas diam in arcu cursus euismod quis viverra.",
                            },
                            {
                                id: "2bac47f6-54c2-4c57-87cc-3a3f202ab290",
                                title: "In metus vulputate eu scelerisque felis imperdiet proin.",
                                content: "Elementum pulvinar etiam non quam. Id nibh tortor id aliquet lectus proin nibh. Elementum facilisis leo vel fringilla est ullamcorper eget. Dictum sit amet justo donec enim diam vulputate.",
                            },
                        ],
                    },
                    {
                        id: "0233b0b6-69f1-4c51-81cd-b849e435f2c1",
                        class: "columns-3-balanced",
                        header: "Opinion",
                        type: "articles-list",
                        content: [
                            {
                                id: "ad0f3eb3-42eb-43f5-bd8d-9a3b62ec5433",
                                title: "Magna ac placerat vestibulum lectus.",
                                content:
                                    "enenatis urna cursus eget nunc scelerisque viverra mauris. Convallis posuere morbi leo urna molestie at elementum. Eu lobortis elementum nibh tellus. Vitae purus faucibus ornare suspendisse sed nisi lacus sed viverra.",
                            },
                            {
                                id: "b49fe19d-4bcc-42bb-9b85-8348cc64d4ca",
                                title: "Nisl rhoncus mattis rhoncus urna neque viverra justo.",
                                content:
                                    "Tristique sollicitudin nibh sit amet. Aliquam purus sit amet luctus venenatis. Vitae nunc sed velit dignissim sodales ut. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus. Sit amet risus nullam eget.",
                            },
                            {
                                id: "65ca4cde-546a-496a-b731-71140adfb651",
                                title: "Sed felis eget velit aliquet sagittis id consectetur purus ut.",
                                content:
                                    "Egestas erat imperdiet sed euismod nisi porta. Vel orci porta non pulvinar neque laoreet. Urna condimentum mattis pellentesque id nibh. Arcu non sodales neque sodales ut etiam sit amet. Elementum curabitur vitae nunc sed velit dignissim.",
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
                        id: "90e08554-f9b4-4606-8e36-55de40b39f9f",
                        class: "columns-3-balanced",
                        header: "Latest",
                        image: {
                            src: "assets/images/chloe-taranto-x2zyAOmVNtM-unsplash_1280x720.webp",
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
                                id: "572e5a00-1754-4fcd-bf5b-b13d781bea45",
                                content: "Erat pellentesque adipiscing commodo elit at. Ornare lectus sit amet est placerat in.",
                            },
                            {
                                id: "8b1304be-2622-432e-944c-341a9e4fd69d",
                                content: "Dui ut ornare lectus sit amet est placerat in egestas. Commodo sed egestas egestas fringilla phasellus.",
                            },
                            {
                                id: "d70f1cd5-2f57-4f85-b967-f15ac4c942cc",
                                content: "Mi quis hendrerit dolor magna eget est lorem ipsum. Urna molestie at elementum eu facilisis sed odio morbi.",
                            },
                            {
                                id: "d9482395-2aef-4e39-9a5c-8d64c4b31b03",
                                content: "Mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar.",
                            },
                        ],
                    },
                    {
                        id: "9c6014cf-a577-4611-a2ce-97f2b4afc322",
                        class: "columns-3-balanced",
                        header: "Business",
                        image: {
                            src: "assets/images/razvan-chisu-Ua-agENjmI4-unsplash_1280x720.webp",
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
                                id: "815c097a-ae5e-417e-824f-5dc3f370cd4f",
                                content: "Nunc faucibus a pellentesque sit amet. Id velit ut tortor pretium viverra suspendisse potenti nullam ac.",
                            },
                            {
                                id: "a3b76c87-a288-400e-aeba-c89e97fb82a4",
                                content: "Eget mi proin sed libero enim sed. A scelerisque purus semper eget duis at tellus.",
                            },
                            {
                                id: "2a4b261c-f04f-4a4f-9d66-5e2d3eca79a3",
                                content: "Praesent tristique magna sit amet purus. Eros in cursus turpis massa.",
                            },
                        ],
                    },
                    {
                        id: "48cabfe4-6408-488f-b942-8d59d35163f7",
                        class: "columns-3-balanced",
                        header: "Politics",
                        image: {
                            src: "assets/images/colin-lloyd-2ULmNrj44QY-unsplash_1280x720.webp",
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
                                id: "7e69389e-794f-4e8b-9dc6-824214437fe6",
                                content: "Tincidunt ornare massa eget egestas purus viverra accumsan in nisl. Amet mattis vulputate enim nulla.",
                            },
                            {
                                id: "c72d48b6-a53c-4a86-ac7b-c720d5a63630",
                                content: "Pellentesque massa placerat duis ultricies. Tortor at auctor urna nunc id cursus.",
                            },
                            {
                                id: "4fa57fa6-0d49-4c2a-bc0e-fd9b3e21f1bf",
                                content: "Venenatis urna cursus eget nunc scelerisque viverra mauris.",
                            },
                            {
                                id: "7c33aa39-8819-49e8-abd0-53a3dbf8464b",
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
                        id: "92371ddb-b2cf-43e2-8590-bda1440c7025",
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                id: "f40d1399-24e7-4dcd-bcd1-663540bd5eae",
                                image: {
                                    src: "assets/images/dominic-hampton-_8aRumOixtI-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "15a36d2e-797d-4b0f-8321-c439763fe201",
                                image: {
                                    src: "assets/images/sam-mcghee-4siwRamtFAk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "c46ee0db-4d30-46fc-8a52-c1007bf21cbf",
                                image: {
                                    src: "assets/images/adam-whitlock-I9j8Rk-JYFM-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "c3d34280-d796-4039-9d5c-626b09e9b2d9",
                                image: {
                                    src: "assets/images/leah-hetteberg-kTVN2l0ZUv8-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
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
                        id: "8e2a8c79-f1dc-4e6c-8542-04684ae08bce",
                        class: "columns-3-balanced",
                        header: "Local",
                        type: "articles-list",
                        content: [
                            {
                                id: "f6e0b4f7-77c8-4b14-9454-f20d797b727d",
                                title: "Sed viverra tellus in hac habitasse platea dictumst vestibulum.",
                                content:
                                    "Maecenas volutpat blandit aliquam etiam. Diam volutpat commodo sed egestas egestas fringilla phasellus faucibus scelerisque. Est ullamcorper eget nulla facilisi etiam dignissim diam quis. Tincidunt praesent semper feugiat nibh sed pulvinar proin gravida hendrerit. Varius vel pharetra vel turpis nunc eget. Enim ut tellus elementum sagittis vitae et leo duis.",
                            },
                            {
                                id: "82838c69-f2a6-47cd-b6df-dee1909d2019",
                                title: "Porttitor leo a diam sollicitudin tempor id eu nisl.",
                                content:
                                    "Ut diam quam nulla porttitor massa id neque. Nulla facilisi etiam dignissim diam quis enim lobortis. Quam nulla porttitor massa id. Neque ornare aenean euismod elementum nisi quis eleifend quam adipiscing. Justo nec ultrices dui sapien eget mi. Volutpat diam ut venenatis tellus in. Mi in nulla posuere sollicitudin aliquam ultrices.",
                            },
                            {
                                id: "1a65f23a-485a-4646-a65d-cab6fd1e4603",
                                title: "Leo vel orci porta non pulvinar neque laoreet.",
                                content:
                                    "Placerat duis ultricies lacus sed. Pellentesque adipiscing commodo elit at imperdiet dui. Accumsan lacus vel facilisis volutpat. Condimentum lacinia quis vel eros donec ac. Pellentesque habitant morbi tristique senectus. Ultrices eros in cursus turpis massa tincidunt dui ut ornare. Rhoncus urna neque viverra justo nec ultrices dui sapien. Amet venenatis urna cursus eget.",
                            },
                        ],
                    },
                    {
                        id: "5acb5684-4b99-44ff-9668-2e5daec9133c",
                        class: "columns-3-balanced",
                        header: "Global",
                        type: "articles-list",
                        content: [
                            {
                                id: "a96310f4-89cb-4ea7-a10a-9e03ebbd013e",
                                title: "Platea dictumst quisque sagittis purus sit amet volutpat consequat mauris.",
                                content:
                                    "Eu lobortis elementum nibh tellus molestie nunc. Vel turpis nunc eget lorem dolor sed viverra. Massa sapien faucibus et molestie ac feugiat sed. Sed egestas egestas fringilla phasellus faucibus. At erat pellentesque adipiscing commodo elit at imperdiet dui accumsan",
                            },
                            {
                                id: "870d65da-27ab-45f8-9b03-4d5c71e1b31e",
                                title: "Ultrices gravida dictum fusce ut placerat orci nulla pellentesque.",
                                content:
                                    "Velit ut tortor pretium viverra suspendisse potenti nullam ac tortor. Feugiat nibh sed pulvinar proin gravida. Feugiat in fermentum posuere urna nec tincidunt praesent. Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. A scelerisque purus semper eget.",
                            },
                            {
                                id: "e6bc4824-319b-4f0e-a3ef-408cc24219eb",
                                title: "Est ullamcorper eget nulla facilisi etiam.",
                                content:
                                    "Augue mauris augue neque gravida in fermentum et. Ornare arcu odio ut sem nulla pharetra diam. Tristique et egestas quis ipsum suspendisse ultrices gravida. Aliquam vestibulum morbi blandit cursus risus at ultrices mi. Non blandit massa enim nec dui nunc mattis.",
                            },
                        ],
                    },
                    {
                        id: "fd9fce73-e286-450f-8fcf-7b988b968f3b",
                        class: "columns-3-balanced",
                        header: "Quarterly",
                        type: "articles-list",
                        content: [
                            {
                                id: "90fc8d03-c410-46f6-ad57-d90f25e199e3",
                                title: "Non curabitur gravida arcu ac tortor dignissim.",
                                content:
                                    "Dui nunc mattis enim ut. Non consectetur a erat nam. Arcu vitae elementum curabitur vitae nunc sed velit dignissim. Congue quisque egestas diam in arcu cursus euismod quis viverra. Consequat semper viverra nam libero justo laoreet sit amet.",
                            },
                            {
                                id: "88c3b366-32e0-4e8b-9735-5dc2194b5e42",
                                title: "Velit egestas dui id ornare arcu odio ut.",
                                content:
                                    "At ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Aenean et tortor at risus viverra. Lectus magna fringilla urna porttitor rhoncus dolor. Posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Euismod in pellentesque massa placerat duis ultricies lacus sed turpis.",
                            },
                            {
                                id: "fb087f5c-84d0-4a1a-a9f6-96af0914527d",
                                title: "Malesuada nunc vel risus commodo viverra maecenas accumsan lacus vel.",
                                content:
                                    "Nunc eget lorem dolor sed. Amet aliquam id diam maecenas ultricies mi. Sodales ut etiam sit amet nisl purus. Consectetur adipiscing elit ut aliquam purus sit amet luctus venenatis. Fusce ut placerat orci nulla pellentesque dignissim enim sit.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-underscored",
                name: "Underscored",
                articles: [
                    {
                        id: "f7640582-e9b6-4d47-b396-95515aa0a840",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "2f3a3748-60b2-45b3-b697-2cb4e0a6414d",
                                image: {
                                    src: "assets/images/dillon-kydd-2keCPb73aQY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Netus et malesuada fames ac turpis egestas. Habitasse platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim. Morbi tempus iaculis urna id volutpat lacus laoreet non curabitur. Sed enim ut sem viverra. Tellus integer feugiat scelerisque varius morbi enim.",
                                url: "#",
                            },
                            {
                                id: "fc5ca351-9505-4cf7-82cc-b176bf9421d3",
                                image: {
                                    src: "assets/images/aaron-huber-G7sE2S4Lab4-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Aenean vel elit scelerisque mauris. Et ligula ullamcorper malesuada proin libero nunc. Mi sit amet mauris commodo quis imperdiet. Elit ullamcorper dignissim cras tincidunt lobortis feugiat. Erat velit scelerisque in dictum non consectetur a erat nam. Orci porta non pulvinar neque.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "3f4c33ce-8628-46d1-b416-37b0fc218c74",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "f7961c4a-df0b-4d2e-b699-edce14aef7a2",
                                image: {
                                    src: "assets/images/mesut-kaya-eOcyhe5-9sQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Eget gravida cum sociis natoque penatibus et. Malesuada pellentesque elit eget gravida cum. Curabitur vitae nunc sed velit dignissim sodales ut. Curabitur vitae nunc sed velit dignissim. Vel pretium lectus quam id leo in. Aliquet lectus proin nibh nisl condimentum id venenatis a.",
                                url: "#",
                            },
                            {
                                id: "09287d46-2d4c-4043-a878-086b705da83e",
                                image: {
                                    src: "assets/images/diego-jimenez-A-NVHPka9Rk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Tristique senectus et netus et malesuada fames ac turpis. Semper risus in hendrerit gravida rutrum. Urna cursus eget nunc scelerisque viverra. Amet mauris commodo quis imperdiet massa. Erat nam at lectus urna duis convallis convallis tellus id.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-state-by-state",
                name: "State by state",
                articles: [
                    {
                        id: "88c59d52-03e2-47cc-82a0-f0d9df4a88db",
                        class: "columns-wrap",
                        header: "California",
                        type: "excerpt",
                        content: [
                            {
                                id: "1f94b398-03e0-46c4-b3db-f89f1076fb8c",
                                image: {
                                    src: "assets/images/craig-melville-_JKymnZ1Uc4-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Et tortor at risus viverra adipiscing at. Leo urna molestie at elementum eu facilisis sed. Adipiscing tristique risus nec feugiat in fermentum posuere urna.",
                            },
                            {
                                id: "6e02b59a-38fb-40f8-9b95-aa0c9eb0bdf4",
                                image: {
                                    src: "assets/images/robert-bye-EILw-nEK46k-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Luctus venenatis lectus magna fringilla. Condimentum mattis pellentesque id nibh tortor id. Rhoncus aenean vel elit scelerisque mauris pellentesque.",
                            },
                            {
                                id: "10c89ad8-d9be-4d73-9002-122e504f317c",
                                image: {
                                    src: "assets/images/sapan-patel-gmgWd0CgWQI-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Feugiat scelerisque varius morbi enim nunc. Amet consectetur adipiscing elit ut aliquam purus sit amet luctus. Orci a scelerisque purus semper eget duis at tellus at.",
                            },
                        ],
                    },
                    {
                        id: "f28c0060-72db-4588-8b38-9f1b2a01a3ac",
                        class: "columns-wrap",
                        header: "New York",
                        type: "excerpt",
                        content: [
                            {
                                id: "11a4ac22-47c5-4a55-acc0-fd8ca15a84d8",
                                image: {
                                    src: "assets/images/prince-abban-0OUHhvNIbYc-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Vitae sapien pellentesque habitant morbi tristique. Quisque id diam vel quam elementum pulvinar etiam non. Hendrerit gravida rutrum quisque non tellus orci.",
                            },
                            {
                                id: "77850587-f7e1-4b3c-83c2-f1e705a4eed0",
                                image: {
                                    src: "assets/images/quick-ps-sW41y3lETZk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Rhoncus dolor purus non enim praesent. Massa enim nec dui nunc mattis. Odio eu feugiat pretium nibh ipsum consequat. Bibendum enim facilisis gravida neque convallis a cras.",
                            },
                            {
                                id: "f407272d-1e0e-4782-9031-aa90f33a5604",
                                image: {
                                    src: "assets/images/lorenzo-moschi-N7ypjB7HKIk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Cursus euismod quis viverra nibh. Facilisis mauris sit amet massa. Eget mauris pharetra et ultrices. Vitae turpis massa sed elementum tempus egestas sed. Semper viverra nam libero justo.",
                            },
                        ],
                    },
                    {
                        id: "bc567ef4-d017-4679-8d7b-c822dd49a3dc",
                        class: "columns-wrap",
                        header: "Washington",
                        type: "excerpt",
                        content: [
                            {
                                id: "86afb098-dd8b-453b-9e90-68275a4457fc",
                                image: {
                                    src: "assets/images/koshu-kunii-v9ferChkC9A-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Iaculis nunc sed augue lacus viverra. Sed libero enim sed faucibus turpis in. Massa tincidunt dui ut ornare. Adipiscing bibendum est ultricies integer quis auctor elit.",
                            },
                            {
                                id: "f653d697-a6ce-4e98-b76e-fa9b84bf5546",
                                image: {
                                    src: "assets/images/angela-loria-hFc0JEKD4Cc-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Aliquet nec ullamcorper sit amet risus nullam eget felis eget. Tortor dignissim convallis aenean et tortor at risus. Dolor sed viverra ipsum nunc.",
                            },
                            {
                                id: "05e813bd-c4ab-4c30-9922-d90b6d3925a4",
                                image: {
                                    src: "assets/images/harold-mendoza-6xafY_AE1LM-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "In cursus turpis massa tincidunt dui ut ornare. Lacus vestibulum sed arcu non odio euismod lacinia at. Mi ipsum faucibus vitae aliquet nec. Commodo sed egestas egestas fringilla phasellus faucibus scelerisque eleifend.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-us-hot-topics",
                name: "Hot Topics",
                articles: [
                    {
                        id: "4a2d747f-a853-4452-82bf-504b5f79a7fe",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "5763aa2d-06a9-4c17-bd6f-c8b9ebb99f18",
                                image: {
                                    src: "assets/images/libre-leung-9O0Sp22DF0I-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Magna ac placerat vestibulum lectus mauris ultrices eros. Risus nullam eget felis eget nunc. Orci porta non pulvinar neque. Aliquam purus sit amet luctus venenatis lectus magna fringilla urna. In arcu cursus euismod quis viverra nibh.",
                                url: "#",
                            },
                            {
                                id: "71d069ec-a854-41ba-8e68-7d236a2f7810",
                                image: {
                                    src: "assets/images/pascal-bullan-M8sQPAfhPdk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Id venenatis a condimentum vitae sapien. Dui vivamus arcu felis bibendum ut tristique. Laoreet sit amet cursus sit amet dictum sit amet justo. Id semper risus in hendrerit gravida rutrum quisque non. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "c897ed90-26b7-4f9d-9c2c-7eb37270a317",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "e1509eb7-5e49-40fb-8581-4cd2d07a697d",
                                image: {
                                    src: "assets/images/brooke-lark-HjWzkqW1dgI-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Nulla porttitor massa id neque aliquam. Amet massa vitae tortor condimentum lacinia quis vel. Semper quis lectus nulla at volutpat diam ut venenatis. In nulla posuere sollicitudin aliquam ultrices.",
                                url: "#",
                            },
                            {
                                id: "8107bf22-c893-44e3-a359-2c5d1dcd96f7",
                                image: {
                                    src: "assets/images/matthias-heil-lDOEwat_MPs-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Egestas congue quisque egestas diam in arcu cursus. Vitae tempus quam pellentesque nec nam aliquam. Proin nibh nisl condimentum id. Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Egestas integer eget aliquet nibh praesent tristique.",
                                url: "#",
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
                        id: "3acc4e4e-2720-4d9a-aa3e-ec820f6b4f00",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "01e18bfc-4a30-4c5c-bdc1-c7dd8f89a550",
                                image: {
                                    src: "assets/images/tadeusz-lakota-Tb38UzCvKCY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Mi tempus imperdiet nulla malesuada pellentesque elit eget gravida cum. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin.",
                            },
                        ],
                    },
                    {
                        id: "ca777be8-b675-4dc0-817f-972a72129394",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "2ece17ee-a3fc-4400-96e1-4a7571f1a77f",
                                image: {
                                    src: "assets/images/leisara-studio-EzzW1oNek-I-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Sed cras ornare arcu dui vivamus arcu. Blandit aliquam etiam erat velit scelerisque in. Nisl rhoncus mattis rhoncus urna neque viverra.",
                            },
                        ],
                    },
                    {
                        id: "cb0c2767-4955-4cc6-ae13-5c44a958b36f",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "3677b20d-aba5-44b4-b0f7-a286d138305e",
                                image: {
                                    src: "assets/images/tamanna-rumee-lpGm415q9JA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc sed id semper risus in hendrerit gravida rutrum. Ac felis donec et odio pellentesque diam volutpat commodo sed.",
                            },
                        ],
                    },
                    {
                        id: "efe39446-2154-4279-9d1d-66d27db034ac",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "5f1ef3f2-81ea-48e2-8efa-648cc85b4f3d",
                                image: {
                                    src: "assets/images/clark-street-mercantile-P3pI6xzovu0-unsplash_1280x720.webp",
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
                        id: "4da73fa5-c64a-43d8-873f-af7024fbae8c",
                        class: "columns-3-balanced",
                        header: "Africa",
                        url: "#",
                        image: {
                            src: "assets/images/will-shirley-xRKcHoCOA4Y-unsplash_1280x720.webp",
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
                        id: "44d8807b-f06e-480f-8410-c5573127b527",
                        class: "columns-3-balanced",
                        header: "China",
                        url: "#",
                        image: {
                            src: "assets/images/nuno-alberto-MykFFC5zolE-unsplash_1280x720.webp",
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
                        id: "56478e74-f501-45a5-b9db-5a41b049f32b",
                        class: "columns-3-balanced",
                        header: "Russia",
                        url: "#",
                        image: {
                            src: "assets/images/nikita-karimov-lvJZhHOIJJ4-unsplash_1280x720.webp",
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
                                id: "8dd3d941-6b3f-4b3d-afd9-d7f8da8ead2b",
                                content: "Luctus venenatis lectus magna fringilla urna porttitor rhoncus.",
                            },
                            {
                                id: "139a317d-b2f2-433c-99ac-8d36df99d10e",
                                content: "Placerat orci nulla pellentesque dignissim enim sit amet venenatis.",
                            },
                            {
                                id: "74a84609-8f96-4ca3-8b1c-9e747ec9f260",
                                content: "Pellentesque nec nam aliquam sem et.",
                            },
                            {
                                id: "fba9be69-f42f-43dd-b930-1634edf7d79f",
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
                        id: "22156cfb-5b44-4c70-adcc-8c560bb88bba",
                        class: "columns-3-balanced",
                        header: "Europe",
                        image: {
                            src: "assets/images/azhar-j-t2hgHV1R7_g-unsplash_1280x720.webp",
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
                        id: "0e6692ed-3268-4442-a52d-16c37c16c5e2",
                        class: "columns-3-balanced",
                        header: "Middle East",
                        image: {
                            src: "assets/images/adrian-dascal-myAz-buELXs-unsplash_1280x720.webp",
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
                        id: "c9cd0674-b0de-4f53-9015-a97b57cf91d6",
                        class: "columns-3-balanced",
                        header: "Asia",
                        image: {
                            src: "assets/images/mike-enerio-7ryPpZK1qV8-unsplash_1280x720.webp",
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
                                id: "66e54612-a270-42eb-bbb0-139a318c45e9",
                                content: "Id faucibus nisl tincidunt eget nullam non nisi.",
                            },
                            {
                                id: "49682ded-80c4-4d15-a70d-051cf27b4657",
                                content: "Lectus quam id leo in vitae turpis massa.",
                            },
                            {
                                id: "e9c31e3a-6bfb-4c15-a2a2-a06ac315ac39",
                                content: "Urna nec tincidunt praesent semper feugiat nibh sed. Sed turpis tincidunt id aliquet risus.",
                            },
                            {
                                id: "3bdd19a2-3e3d-462e-a2f2-e65b1a78a0d3",
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
                        id: "2c78e953-89f7-4a41-a852-6937b647674a",
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                id: "7a8ccd28-8a4d-44b4-aad4-b38b3f1ad734",
                                image: {
                                    src: "assets/images/greg-rakozy-oMpAz-DN-9I-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "a571f7c4-c14f-420c-82fd-a90eea994817",
                                image: {
                                    src: "assets/images/annie-spratt-KiOHnBkLQQU-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "8f35ff15-b931-4495-b4fa-784a7ac5f610",
                                image: {
                                    src: "assets/images/noaa-Led9c1SSNFo-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "8c15911e-5185-4c46-9d66-3d7085226ce3",
                                image: {
                                    src: "assets/images/paul-hanaoka-s0XabTAKvak-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
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
                        id: "b4f53c23-c475-4359-9b73-84b5f193695e",
                        class: "columns-3-wide",
                        header: "Unrest",
                        url: "#",
                        image: {
                            src: "assets/images/venti-views-KElJx4R4Py8-unsplash_1280x720.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: {
                                type: "breaking",
                                label: "breaking",
                            },
                        },
                        title: "Viverra aliquet eget sit amet. In fermentum posuere urna nec.",
                        type: "list",
                        content: [
                            {
                                id: "7fb951cd-7360-4b0b-8eba-acc5682a72e2",
                                content: "Massa enim nec dui nunc mattis. Ornare lectus sit amet est placerat in.",
                            },
                            {
                                id: "cfc8cfb9-8775-4228-862d-3a4e974c8774",
                                content: "Morbi tristique senectus et netus et malesuada fames ac turpis.",
                            },
                            {
                                id: "3579af12-da1a-4126-90b1-fcdf15f13651",
                                content: "Fed vulputate mi sit amet mauris commodo quis imperdiet massa.",
                            },
                            {
                                id: "6da4806a-b188-4b7d-8bf1-7c73f2b192c1",
                                content: "In egestas erat imperdiet sed euismod nisi porta lorem mollis. Scelerisque eu ultrices vitae auctor eu augue ut lectus arcu.",
                            },
                        ],
                    },
                    {
                        id: "8e24c654-824d-4b80-add0-e6a69926e2e1",
                        class: "columns-3-narrow",
                        header: "Happening now",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                id: "a9304ab1-83a0-4fd5-9ce7-1f09d5ed3ee3",
                                image: {
                                    src: "assets/images/koshu-kunii-cWEGNQqcImk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Semper auctor neque vitae tempus quam pellentesque nec nam aliquam.",
                            },
                            {
                                id: "0be2248d-d867-4676-8c29-2f7e9f44ef3d",
                                image: {
                                    src: "assets/images/kenny-K72n3BHgHCg-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Viverra maecenas accumsan lacus vel facilisis volutpat.",
                            },
                            {
                                id: "0b0979bd-a6b6-4999-b981-e94e1af3e53d",
                                image: {
                                    src: "assets/images/kitthitorn-chaiyuthapoom-TOH_gw5dd20-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Orci sagittis eu volutpat odio facilisis mauris sit.",
                            },
                        ],
                    },
                    {
                        id: "b838d62e-fc9b-4c7f-808b-dfe42ba8207b",
                        class: "columns-3-narrow",
                        header: "Noteworthy",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                id: "4eca4918-9f65-467a-936a-2e3b70397d81",
                                image: {
                                    src: "assets/images/olga-guryanova-tMFeatBSS4s-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc aliquet bibendum enim facilisis gravida neque convallis a.",
                            },
                            {
                                id: "92108745-e25b-4ee4-a725-81298d1aee29",
                                image: {
                                    src: "assets/images/jed-owen-ajZibDGpPew-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Ut diam quam nulla porttitor massa id neque aliquam vestibulum.",
                            },
                            {
                                id: "0f037b8a-f7ee-4b05-a8b2-4801469f11d4",
                                image: {
                                    src: "assets/images/noaa-FY3vXNBl1v4-unsplash_1280x720.webp",
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
                        id: "333174c6-e4f4-4376-b0ff-38d31161b9db",
                        class: "columns-3-balanced",
                        header: "European Union",
                        image: {
                            src: "assets/images/christian-lue-8Yw6tsB8tnc-unsplash_1280x720.webp",
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
                                id: "53bc47b0-879f-41c5-90d2-f17ecd997277",
                                content: "Nulla facilisi cras fermentum odio eu. Porttitor lacus luctus accumsan tortor posuere ac ut.",
                            },
                            {
                                id: "560c1c79-adfe-4dc3-9481-3f6eeee479e2",
                                content: "Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Leo vel orci porta non. Sem nulla pharetra diam sit amet nisl.",
                            },
                            {
                                id: "7356169a-a957-4212-a4d0-de79817fad66",
                                content: "Justo donec enim diam vulputate ut pharetra sit amet aliquam. Eu consequat ac felis donec et.",
                            },
                        ],
                    },
                    {
                        id: "28fd8202-0588-42a2-bb92-54c534521b23",
                        class: "columns-3-balanced",
                        header: "Britain",
                        image: {
                            src: "assets/images/ian-taylor-kAWTCt7p7rs-unsplash_1280x720.webp",
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
                        id: "bcb67523-c31c-44ae-b9a1-a2b3b0cc5793",
                        class: "columns-3-balanced",
                        header: "Latin America",
                        image: {
                            src: "assets/images/axp-photography-v6pAkO31d50-unsplash_1280x720.webp",
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
                                id: "bd2b0d68-f13e-4e22-83e9-e930ca8aa68b",
                                content: "Ut venenatis tellus in metus vulputate.",
                                url: "#",
                            },
                            {
                                id: "616a45c1-6d95-41f0-b1c1-d64dc56c0eb5",
                                content: "Vitae aliquet nec ullamcorper sit amet risus nullam.",
                                url: "#",
                            },
                            {
                                id: "064361e4-4ba5-4113-8276-bd34ac0fd180",
                                content: "Ellus in hac habitasse platea dictumst.",
                                url: "#",
                            },
                            {
                                id: "3f865ca0-fc2b-48c2-aaf0-9804d375d97c",
                                content: "In nisl nisi scelerisque eu ultrices vitae.",
                                url: "#",
                            },
                            {
                                id: "20cd0523-4256-4950-b934-e6bb73423246",
                                content: "Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim.",
                                url: "#",
                            },
                            {
                                id: "a823ac1f-f1d0-4a52-a5ca-d02edeba7156",
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
                        id: "bcdb2555-6ea9-48cc-b99e-7c496e95b54a",
                        class: "columns-wrap",
                        header: "United Nations",
                        type: "excerpt",
                        content: [
                            {
                                id: "99ce4c22-46fb-4137-81fd-567ebea802d2",
                                image: {
                                    src: "assets/images/ilyass-seddoug-06w8RxgSzF0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Morbi quis commodo odio aenean sed adipiscing diam. Congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque. Justo nec ultrices dui sapien.",
                            },
                            {
                                id: "abb17f65-6190-4f97-805b-8bf8f7adb5aa",
                                image: {
                                    src: "assets/images/mathias-reding-yfXhqAW5X0c-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nibh nisl condimentum id venenatis a condimentum. Id diam maecenas ultricies mi eget mauris pharetra et ultrices. Faucibus turpis in eu mi bibendum neque egestas. Et malesuada fames ac turpis egestas sed tempus urna et.",
                            },
                            {
                                id: "21309be8-782a-4417-b312-c8e110643d57",
                                image: {
                                    src: "assets/images/matthew-tenbruggencate-0HJWobhGhJs-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ut etiam sit amet nisl purus in mollis nunc sed. Pellentesque adipiscing commodo elit at imperdiet dui. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Enim facilisis gravida neque convallis.",
                            },
                        ],
                    },
                    {
                        id: "db9bc4e6-b7d8-4cbd-b9a6-17bc5c50b8b1",
                        class: "columns-wrap",
                        header: "European Union",
                        type: "excerpt",
                        content: [
                            {
                                id: "79697e7e-9dae-4f38-b49d-42d95177873f",
                                image: {
                                    src: "assets/images/markus-spiske-wIUxLHndcLw-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Donec massa sapien faucibus et molestie. Fermentum iaculis eu non diam. Donec pretium vulputate sapien nec sagittis. Placerat duis ultricies lacus sed. Pretium lectus quam id leo in vitae turpis massa.",
                            },
                            {
                                id: "94ebd599-031c-4a39-8ee8-e0e6bfefcb3a",
                                image: {
                                    src: "assets/images/jakub-zerdzicki-VnTR3XFwxWs-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Luctus accumsan tortor posuere ac ut. Convallis posuere morbi leo urna molestie at elementum. Nisi est sit amet facilisis magna etiam tempor orci eu.",
                            },
                            {
                                id: "01420c0f-c015-46b3-8a3d-1d189ca449ba",
                                image: {
                                    src: "assets/images/guillaume-perigois-HL4LEIyGEYU-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Purus in massa tempor nec feugiat nisl pretium fusce. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl vel. Vestibulum sed arcu non odio euismod lacinia at quis.",
                            },
                        ],
                    },
                    {
                        id: "a4208fe3-e9b4-46f6-af7e-ff04522ccc9c",
                        class: "columns-wrap",
                        header: "Global Crisis",
                        type: "excerpt",
                        content: [
                            {
                                id: "9c0c4297-c959-4b66-b691-14227aa9ff6c",
                                image: {
                                    src: "assets/images/mika-baumeister-jXPQY1em3Ew-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "ristique senectus et netus et malesuada. Orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Varius quam quisque id diam vel quam elementum pulvinar. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula.",
                            },
                            {
                                id: "aa8c49f6-2479-48a9-b0f4-ab66d088335b",
                                image: {
                                    src: "assets/images/chris-leboutillier-c7RWVGL8lPA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Cras ornare arcu dui vivamus arcu felis bibendum ut. Volutpat blandit aliquam etiam erat velit scelerisque in dictum. Pharetra magna ac placerat vestibulum lectus.",
                            },
                            {
                                id: "fc48d069-7cb3-4a59-9a33-76a8baecbfcc",
                                image: {
                                    src: "assets/images/mulyadi-JeCNRxGLSp4-unsplash_1280x720.webp",
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
                        id: "48ae1b0c-4f0c-47f8-ab31-4ec18aaaf24c",
                        class: "columns-3-balanced",
                        header: "Weather",
                        image: {
                            src: "assets/images/noaa-I323ZqSkkn8-unsplash_1280x720.webp",
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
                                id: "435c2c23-3643-4494-bc44-0d6f83c5fd9f",
                                content: "Enim tortor at auctor urna nunc id cursus metus. Nisi est sit amet facilisis magna etiam.",
                            },
                            {
                                id: "9544aa73-f54a-4983-8e7f-71fd06dbb9d8",
                                content: "Neque volutpat ac tincidunt vitae. Metus aliquam eleifend mi in.",
                            },
                            {
                                id: "160354ef-50d3-40ed-a9c7-7eac7e9c08ce",
                                content: "Aliquam malesuada bibendum arcu vitae elementum curabitur vitae.",
                            },
                            {
                                id: "08f7738e-72c2-48e5-9f38-bbf2990a7134",
                                content: "Turpis cursus in hac habitasse platea dictumst.",
                            },
                        ],
                    },
                    {
                        id: "71a55a05-6c7a-432e-8d8f-dc55746911e6",
                        class: "columns-3-balanced",
                        header: "Business",
                        image: {
                            src: "assets/images/david-vives-Nzbkev7SQTg-unsplash_1280x720.webp",
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
                                id: "e194840d-555d-4a68-be98-25550267e1d9",
                                content: "Eget nulla facilisi etiam dignissim diam quis enim.",
                            },
                            {
                                id: "35ddcd29-6018-422a-b7c9-0b365fef1a4a",
                                content: "Risus viverra adipiscing at in tellus integer feugiat scelerisque.",
                            },
                            {
                                id: "0efb298b-269b-4ef0-8933-6a9270d394f0",
                                content: "Cursus turpis massa tincidunt dui.",
                            },
                            {
                                id: "8b25917a-5242-4266-a57b-ef73e6b31164",
                                content: "Nascetur ridiculus mus mauris vitae ultricies leo integer.",
                            },
                        ],
                    },
                    {
                        id: "f44f022b-f57e-4d6d-84bc-904dfad9686a",
                        class: "columns-3-balanced",
                        header: "Politics",
                        image: {
                            src: "assets/images/kelli-dougal-vbiQ_7vwfrs-unsplash_1280x720.webp",
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
                                id: "8d525dd3-f1e0-4f5a-9c7a-87bd07fea873",
                                content: "Nisi scelerisque eu ultrices vitae auctor.",
                            },
                            {
                                id: "7189799f-3051-4db0-990b-4473999e7450",
                                content: "Urna porttitor rhoncus dolor purus non enim praesent elementum.",
                            },
                            {
                                id: "a7ecada6-4c11-4c8e-bf88-b43f20be9a56",
                                content: "Ac turpis egestas integer eget aliquet.",
                            },
                            {
                                id: "0db12cd0-cbb1-47eb-8cae-2962fdcb3f40",
                                content: "Nisl tincidunt eget nullam non nisi est.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-underscored",
                name: "Underscored",
                articles: [
                    {
                        id: "060bbae5-655f-4ed6-ae0f-8afdb2056ecf",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "60ba264f-7a61-46eb-b3de-d49fa763c764",
                                image: {
                                    src: "assets/images/luis-cortes-QrPDA15pRkM-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Risus sed vulputate odio ut enim blandit volutpat. Tempus egestas sed sed risus pretium quam vulputate. Ultrices mi tempus imperdiet nulla malesuada. Pellentesque diam volutpat commodo sed egestas. Scelerisque eleifend donec pretium vulputate sapien nec sagittis aliquam.",
                                url: "#",
                            },
                            {
                                id: "d373cfad-4871-4de4-9a92-c075975c08e6",
                                image: {
                                    src: "assets/images/juli-kosolapova-4PE3X9eKsu4-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Nunc mi ipsum faucibus vitae aliquet nec. Felis eget nunc lobortis mattis aliquam faucibus. Amet est placerat in egestas. Vitae proin sagittis nisl rhoncus mattis rhoncus. Mauris in aliquam sem fringilla ut. Pellentesque habitant morbi tristique senectus et netus et.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "b4ef9c47-027a-4870-8413-b83366e1ce21",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "cc15c9f6-f311-4cfb-b303-d89d07821c57",
                                image: {
                                    src: "assets/images/olga-guryanova-ft7vJxwl2RY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Egestas diam in arcu cursus euismod quis viverra nibh cras. Scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Risus in hendrerit gravida rutrum.",
                                url: "#",
                            },
                            {
                                id: "afe1b73f-e6a1-4efd-94f7-2df513a47e33",
                                image: {
                                    src: "assets/images/christian-tenguan-P3gfVKhz8d0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Integer malesuada nunc vel risus commodo viverra maecenas accumsan. Nec feugiat nisl pretium fusce id. Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. At tempor commodo ullamcorper a lacus vestibulum sed arcu. Suspendisse faucibus interdum posuere lorem ipsum dolor.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-global-issues",
                name: "Global Issues",
                articles: [
                    {
                        id: "f189aeb3-f002-4cf4-929e-1957c1e049a9",
                        class: "columns-wrap",
                        header: "Rising Crime",
                        type: "excerpt",
                        content: [
                            {
                                id: "4b6aab59-4f86-48df-ae8b-be102859aa43",
                                image: {
                                    src: "assets/images/martin-podsiad-wrdtA9lew9E-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Phasellus faucibus scelerisque eleifend donec pretium. Tellus molestie nunc non blandit. Sed sed risus pretium quam vulputate dignissim suspendisse.",
                            },
                            {
                                id: "4d133373-3f3e-4747-a6c0-62c0435659a4",
                                image: {
                                    src: "assets/images/valtteri-laukkanen-9u9Pc0t9vKM-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "In vitae turpis massa sed. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit. Egestas pretium aenean pharetra magna ac placerat vestibulum.",
                            },
                            {
                                id: "f409ea51-7607-4654-883e-26c93eaab5f0",
                                image: {
                                    src: "assets/images/alec-favale-dLctr-PqFys-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Morbi tempus iaculis urna id volutpat lacus laoreet non. Dignissim convallis aenean et tortor at risus viverra adipiscing at. Nibh tortor id aliquet lectus proin nibh nisl.",
                            },
                        ],
                    },
                    {
                        id: "ddf4293b-3356-4ec4-b349-75d29690623e",
                        class: "columns-wrap",
                        header: "Health concerns",
                        type: "excerpt",
                        content: [
                            {
                                id: "6cb27761-d3d4-4641-9fc6-e6cab0b10f78",
                                image: {
                                    src: "assets/images/ani-kolleshi-7jjnJ-QA9fY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Id diam maecenas ultricies mi eget mauris pharetra. Aliquam sem fringilla ut morbi tincidunt augue interdum. Accumsan sit amet nulla facilisi morbi tempus iaculis.",
                            },
                            {
                                id: "43fc66f4-5f79-499d-80e0-a57f9ed08623",
                                image: {
                                    src: "assets/images/piron-guillaume-U4FyCp3-KzY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "In fermentum posuere urna nec tincidunt praesent semper feugiat nibh. Dolor sit amet consectetur adipiscing elit pellentesque habitant. Eget dolor morbi non arcu risus quis varius quam quisque.",
                            },
                            {
                                id: "6d0f9b0c-a0b8-4f2a-8797-49525361253f",
                                image: {
                                    src: "assets/images/hush-naidoo-jade-photography-ZCO_5Y29s8k-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Commodo sed egestas egestas fringilla phasellus faucibus. Lectus urna duis convallis convallis. Sit amet tellus cras adipiscing enim eu turpis egestas.",
                            },
                        ],
                    },
                    {
                        id: "9b501227-b127-49b2-80d6-33945e5ea16c",
                        class: "columns-wrap",
                        header: "Economy",
                        type: "excerpt",
                        content: [
                            {
                                id: "f8e005ef-0704-4406-86c0-4a9bd6a15850",
                                image: {
                                    src: "assets/images/ibrahim-rifath-OApHds2yEGQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ante in nibh mauris cursus mattis molestie. Vestibulum sed arcu non odio euismod lacinia at quis. Consequat semper viverra nam libero justo laoreet.",
                            },
                            {
                                id: "56d43b99-481c-4194-a822-cf9d9973eef9",
                                image: {
                                    src: "assets/images/mika-baumeister-bGZZBDvh8s4-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nunc non blandit massa enim nec dui nunc. Lobortis feugiat vivamus at augue eget arcu. Tempor commodo ullamcorper a lacus. Malesuada bibendum arcu vitae elementum curabitur vitae.",
                            },
                            {
                                id: "9a1e8128-7d8e-4eb2-a285-e15c1b7c302c",
                                image: {
                                    src: "assets/images/shubham-dhage-tT6GNIFkZv4-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "In nulla posuere sollicitudin aliquam ultrices sagittis orci a. Sem fringilla ut morbi tincidunt augue interdum. Arcu felis bibendum ut tristique et egestas. Praesent elementum facilisis leo vel fringilla est ullamcorper.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-world-hot-topics",
                name: "Hot Topics",
                articles: [
                    {
                        id: "2ecc66a8-422a-4ec1-8523-b2b3b6bd95d1",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "0d4def92-1511-4113-892c-53a8432447f2",
                                image: {
                                    src: "assets/images/dino-reichmuth-A5rCN8626Ck-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Leo vel fringilla est ullamcorper eget nulla facilisi etiam dignissim. Aliquam nulla facilisi cras fermentum odio. In est ante in nibh. Vulputate ut pharetra sit amet aliquam. Vitae congue eu consequat ac felis. Semper auctor neque vitae tempus quam pellentesque nec nam aliquam.",
                                url: "#",
                            },
                            {
                                id: "af24d79c-6907-48b6-90a7-beb337072c56",
                                image: {
                                    src: "assets/images/ross-parmly-rf6ywHVkrlY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Vitae sapien pellentesque habitant morbi tristique senectus. Faucibus interdum posuere lorem ipsum dolor sit. Urna id volutpat lacus laoreet non curabitur. Tristique et egestas quis ipsum suspendisse ultrices gravida dictum.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "e97c9e59-bce0-408e-8151-644b4c51fa24",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "e6e33328-8fdd-4e03-8226-32b43f3d9523",
                                image: {
                                    src: "assets/images/caglar-oskay-d0Be8Vs9XRk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Donec ultrices tincidunt arcu non sodales neque sodales ut. Consequat mauris nunc congue nisi vitae suscipit tellus mauris. Dictum sit amet justo donec enim diam vulputate. Ultrices vitae auctor eu augue ut lectus arcu bibendum at.",
                                url: "#",
                            },
                            {
                                id: "32013b56-f744-46f7-b608-5081c4917db9",
                                image: {
                                    src: "assets/images/oguzhan-edman-ZWPkHLRu3_4-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et. Adipiscing at in tellus integer feugiat scelerisque varius. Faucibus ornare suspendisse sed nisi lacus sed viverra tellus in. Eget velit aliquet sagittis id consectetur purus ut faucibus pulvinar.",
                                url: "#",
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
                        id: "6f02bb8e-b794-403e-8417-6efaf23f7d4f",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "22d0366d-8577-4f16-93ec-8058cab99d5f",
                                image: {
                                    src: "assets/images/jakub-zerdzicki-qcRGVZNZ5js-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Et sollicitudin ac orci phasellus. Massa placerat duis ultricies lacus sed turpis tincidunt id.",
                            },
                        ],
                    },
                    {
                        id: "c1ab91c2-8a27-4b86-b862-f2cb98d99636",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "db656467-45dd-49c2-9761-97bf666b6c4f",
                                image: {
                                    src: "assets/images/arnel-hasanovic-MNd-Rka1o0Q-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Neque volutpat ac tincidunt vitae semper. Nunc pulvinar sapien et ligula. Quam pellentesque nec nam aliquam sem et tortor consequat.",
                            },
                        ],
                    },
                    {
                        id: "ea11fca8-afd0-4aab-b106-047aab8ca678",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "d888984a-bf15-4c07-a3d7-28fb93496d06",
                                image: {
                                    src: "assets/images/ilaria-de-bona-RuFfpBsaRY0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Velit euismod in pellentesque massa placerat duis ultricies. Nulla aliquet enim tortor at auctor. Vitae et leo duis ut diam quam nulla porttitor massa.",
                            },
                        ],
                    },
                    {
                        id: "44a282f4-379a-41bd-bccb-5d7a16aa8d98",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "4a073a92-8e03-4dec-9c8f-47f1f5c72ef9",
                                image: {
                                    src: "assets/images/k8-uYf_C34PAao-unsplash_1280x720.webp",
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
                        id: "5fed924d-8356-4d2e-bf06-ba58866f4cd0",
                        class: "columns-1",
                        type: "grid",
                        display: "grid-wrap",
                        content: [
                            {
                                id: "0e4a3d8c-a290-4921-9067-0c6f06f318f6",
                                image: {
                                    src: "assets/images/emmanuel-ikwuegbu-ceawFbpA-14-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Libero justo laoreet sit amet. Et egestas quis ipsum suspendisse ultrices gravida dictum fusce. Eget aliquet nibh praesent tristique magna. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus.",
                                url: "#",
                            },
                            {
                                id: "b5487ca6-95b7-4dc9-a96b-127ba70c1601",
                                image: {
                                    src: "assets/images/mr-cup-fabien-barral-Mwuod2cm8g4-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Arcu cursus euismod quis viverra nibh. Cras ornare arcu dui vivamus arcu. At lectus urna duis convallis convallis tellus id.",
                                url: "#",
                            },
                            {
                                id: "6eb4edcf-6a84-4997-b053-f63bf6757f24",
                                image: {
                                    src: "assets/images/colin-lloyd-uaM_Ijy_joY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Urna et pharetra pharetra massa massa ultricies mi quis hendrerit. Risus sed vulputate odio ut enim blandit volutpat maecenas volutpat. Quis ipsum suspendisse ultrices gravida dictum fusce ut.",
                                url: "#",
                            },
                            {
                                id: "a0fd29d4-8eaa-470b-9f6e-5ee20680cba9",
                                image: {
                                    src: "assets/images/sara-cottle-bGjtWs8sXT0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Velit aliquet sagittis id consectetur purus ut faucibus. Tellus mauris a diam maecenas sed. Urna neque viverra justo nec. Odio eu feugiat pretium nibh ipsum.",
                                url: "#",
                            },
                            {
                                id: "c46c8374-58d9-4e4d-b67c-2722031478d8",
                                image: {
                                    src: "assets/images/elimende-inagella-7OxV_qDiGRI-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Amet nulla facilisi morbi tempus iaculis urna id. Scelerisque eleifend donec pretium vulputate sapien nec sagittis. Id leo in vitae turpis massa.",
                                url: "#",
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
                        id: "88787560-ed1b-43d5-a57c-bac38c8af902",
                        class: "columns-3-wide",
                        header: "Campaign News",
                        url: "#",
                        image: {
                            src: "assets/images/alexander-grey-8lnbXtxFGZw-unsplash_1280x720.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                            tag: {
                                type: "breaking",
                                label: "breaking",
                            },
                        },
                        title: "Adipiscing at in tellus integer feugiat scelerisque varius morbi enim.",
                        type: "list",
                        content: [
                            {
                                id: "b1c84fd6-18ac-4043-83c6-d17da3be2838",
                                content: "Sem fringilla ut morbi tincidunt augue interdum velit euismod.",
                            },
                            {
                                id: "f817229a-1567-4892-955f-076d736c2e40",
                                content: "Quisque sagittis purus sit amet. Ornare lectus sit amet est.",
                            },
                            {
                                id: "44719b28-a2bb-49d1-8391-cd79e8cd74cf",
                                content: "Placerat orci nulla pellentesque dignissim enim sit amet.",
                            },
                            {
                                id: "9d4e196a-50a8-45b1-9d13-0594b4728ce9",
                                content: "In fermentum et sollicitudin ac orci phasellus egestas tellus.",
                            },
                        ],
                    },
                    {
                        id: "8eeaee25-a813-430f-9f1e-00ac72d6e0f9",
                        class: "columns-3-narrow",
                        header: "Elections",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                id: "ca84a215-8a32-4591-bb30-18935c91d919",
                                image: {
                                    src: "assets/images/red-dot-Q98X_JVRGS0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                            },
                            {
                                id: "6016d07f-159b-4bc2-91a1-0009502693e8",
                                image: {
                                    src: "assets/images/parker-johnson-v0OWc_skg0g-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim.",
                            },
                        ],
                    },
                    {
                        id: "f56f95e8-6db3-4fb3-9797-be9e6e8713d1",
                        class: "columns-3-narrow",
                        header: "Local Government",
                        url: "#",
                        image: {
                            src: "assets/images/valery-tenevoy-c0VbjkPEfmM-unsplash_1280x720.webp",
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
                                id: "fad4a569-d337-4885-af2e-3da36e7444b3",
                                content: "Molestie at elementum eu facilisis sed odio morbi.",
                            },
                            {
                                id: "64208fee-49d3-4536-863c-7a03741acd62",
                                content: "Sit amet nisl suscipit adipiscing bibendum est ultricies integer quis.",
                            },
                            {
                                id: "f28139dc-e8b6-4d3b-86ad-8ef8ed5f6828",
                                content: "Bibendum neque egestas congue quisque egestas diam in arcu.",
                            },
                            {
                                id: "9e7e7929-ac40-4a14-bf41-467af7bc2bbc",
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
                        id: "a497dc76-3124-4e34-a562-393b3ed0a2d0",
                        class: "columns-3-balanced",
                        header: "Analysis",
                        image: {
                            src: "assets/images/scott-graham-OQMZwNd3ThU-unsplash_1280x720.webp",
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
                                id: "9709aba3-dea5-4634-af0d-a0272373fc91",
                                content: "Arcu vitae elementum curabitur vitae nunc sed velit.",
                            },
                            {
                                id: "56b038d5-ae4d-4eb0-a24f-eadd6e933311",
                                content: "Ornare suspendisse sed nisi lacus sed viverra tellus in.",
                            },
                            {
                                id: "74f5f5fa-d5cf-4854-a52b-7d267ba01da6",
                                content: "Vel fringilla est ullamcorper eget nulla.",
                            },
                            {
                                id: "585db761-3e2b-4789-9e7f-3e8a3ab70aae",
                                content: "Risus commodo viverra maecenas accumsan lacus vel facilisis volutpat est.",
                            },
                        ],
                    },
                    {
                        id: "3b2ff2f5-1aa4-471d-afe4-4134e7239b3a",
                        class: "columns-3-balanced",
                        header: "Facts First",
                        image: {
                            src: "assets/images/campaign-creators-pypeCEaJeZY-unsplash_1280x720.webp",
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
                                id: "b6d3d1d2-9ef8-48a2-8463-07eb4cd0757c",
                                content: "Consectetur purus ut faucibus pulvinar elementum integer enim.",
                            },
                            {
                                id: "53572fab-f3f1-4c47-ab93-b2896352265a",
                                content: "Purus semper eget duis at. Tincidunt ornare massa eget egestas purus viverra accumsan.",
                            },
                            {
                                id: "528626d6-5909-42a3-a4a1-b406ac06c673",
                                content: "Amet massa vitae tortor condimentum lacinia quis vel.",
                            },
                            {
                                id: "6d3ce580-c7a6-4bf7-b93a-e012e21f6037",
                                content: "Tristique senectus et netus et malesuada.",
                            },
                        ],
                    },
                    {
                        id: "d3f0d391-b7ad-4421-a6d2-7d004a21d6d9",
                        class: "columns-3-balanced",
                        header: "More Politics News",
                        image: {
                            src: "assets/images/priscilla-du-preez-GgtxccOjIXE-unsplash_1280x720.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Vitae auctor eu augue ut lectus arcu bibendum at varius.",
                        type: "text",
                        content:
                            "Pharetra diam sit amet nisl suscipit adipiscing bibendum est. Id aliquet lectus proin nibh. Porta lorem mollis aliquam ut porttitor leo a. Congue eu consequat ac felis donec et odio pellentesque.\n\nMi ipsum faucibus vitae aliquet nec ullamcorper. Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper.",
                    },
                ],
            },
            {
                id: "content-politics-latest-media",
                name: "Latest Media",
                articles: [
                    {
                        id: "db2737cd-27a6-479d-a387-ad8009ede603",
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                id: "8879d7ec-ecde-4a40-b463-eaf0beb033db",
                                image: {
                                    src: "assets/images/ruben-valenzuela-JEp9cl5jfZA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "ff8f1fca-f830-4450-a946-075f95f37569",
                                image: {
                                    src: "assets/images/gregory-hayes-h5cd51KXmRQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "ea8500ef-7130-40ef-bb35-a9e5fc6506b6",
                                image: {
                                    src: "assets/images/alan-rodriguez-qrD-g7oc9is-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "6481e63a-f2ab-42d3-9c99-cc22cebb3207",
                                image: {
                                    src: "assets/images/redd-f-N9CYH-H_gBE-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
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
                        id: "29de4b05-b033-4382-9b05-cd4ad886f497",
                        class: "columns-wrap",
                        header: "Democrats",
                        type: "excerpt",
                        content: [
                            {
                                id: "c691231f-64bb-4710-bfbf-f4e60fc71457",
                                image: {
                                    src: "assets/images/dyana-wing-so-Og16Foo-pd8-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Est ullamcorper eget nulla facilisi etiam dignissim. Est pellentesque elit ullamcorper dignissim cras. Velit euismod in pellentesque massa placerat duis ultricies.",
                            },
                            {
                                id: "0c01ee2b-971a-427d-aa7c-02090f28b5d2",
                                image: {
                                    src: "assets/images/colin-lloyd-NKS5gg7rWGw-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Vitae suscipit tellus mauris a diam maecenas sed enim. Aenean sed adipiscing diam donec. Laoreet suspendisse interdum consectetur libero id faucibus nisl tincidunt.",
                            },
                            {
                                id: "3917e92e-a5db-4c9f-8c2a-42c0bc8f39fe",
                                image: {
                                    src: "assets/images/jon-tyson-0BLE1xp5HBQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Mattis enim ut tellus elementum sagittis vitae et. Massa sapien faucibus et molestie.",
                            },
                        ],
                    },
                    {
                        id: "54a12e98-d00c-455d-b806-98594181ce1e",
                        class: "columns-wrap",
                        header: "Republicans",
                        type: "excerpt",
                        content: [
                            {
                                id: "7ef5a8ae-55ba-4c4e-b80d-ed02cc2a51db",
                                image: {
                                    src: "assets/images/clay-banks-BY-R0UNRE7w-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Platea dictumst quisque sagittis purus sit amet volutpat. Ante in nibh mauris cursus mattis molestie a iaculis.",
                            },
                            {
                                id: "57870f0d-6a22-4648-b1fa-66bed5b14f51",
                                image: {
                                    src: "assets/images/kelly-sikkema-A-lovieAmjA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Quis hendrerit dolor magna eget est. Pellentesque pulvinar pellentesque habitant morbi tristique. Adipiscing commodo elit at imperdiet dui.",
                            },
                            {
                                id: "7c362a1f-12d0-4aa4-9bf9-490ea6d0ff10",
                                image: {
                                    src: "assets/images/chad-stembridge-sEHrIPpkKQY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Donec pretium vulputate sapien nec sagittis aliquam. Cras adipiscing enim eu turpis egestas pretium aenean.",
                            },
                        ],
                    },
                    {
                        id: "8ad5e658-cfe7-42d1-8e28-764010c5b34f",
                        class: "columns-wrap",
                        header: "Liberals",
                        type: "excerpt",
                        content: [
                            {
                                id: "3c3f4a8c-3b1c-4095-8030-cf45219e5032",
                                image: {
                                    src: "assets/images/derick-mckinney-muhK4oeYJiU-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Cursus sit amet dictum sit amet justo donec enim. Tempor id eu nisl nunc. Amet cursus sit amet dictum sit amet justo donec.",
                            },
                            {
                                id: "2b882425-c070-46ec-87b8-4fbd5afdf105",
                                image: {
                                    src: "assets/images/marek-studzinski-9U9I-eVx9nI-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Enim diam vulputate ut pharetra sit amet aliquam. Tristique senectus et netus et malesuada.",
                            },
                            {
                                id: "5ff98d91-9d27-4638-b093-35118ec4c4f0",
                                image: {
                                    src: "assets/images/2h-media-lPcQhLP-b4I-unsplash_1280x720.webp",
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
                        id: "ba31d7b5-0a2b-421d-880b-83cbf0503a45",
                        class: "columns-3-wide",
                        header: "More News",
                        url: "#",
                        type: "list",
                        content: [
                            {
                                id: "db6b9420-b409-4cc8-8301-aebdd4a61546",
                                content: "Eros donec ac odio tempor. Tortor pretium viverra suspendisse potenti nullam.",
                            },
                            {
                                id: "8b43439d-58be-46b1-9e80-4ed4509ecb55",
                                content: "Ut venenatis tellus in metus vulputate eu scelerisque.",
                            },
                            {
                                id: "f20bc1e5-8744-4750-ac7f-8f8ad64a8726",
                                content: "Id diam maecenas ultricies mi eget. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit.",
                            },
                            {
                                id: "82ed67d9-e0d8-471b-8f7d-2d23d7122593",
                                content: "Consectetur lorem donec massa sapien. Sed cras ornare arcu dui vivamus arcu felis.",
                            },
                            {
                                id: "7b58754b-9115-4005-a4b5-3d0841f6918a",
                                content: "Fames ac turpis egestas maecenas pharetra convallis posuere morbi.",
                            },
                            {
                                id: "75ad2be4-2ae6-40b7-b99f-7760277897a3",
                                content: "Consequat nisl vel pretium lectus quam id.",
                            },
                            {
                                id: "d18452c7-823c-499e-b67e-490398fa1f54",
                                content: "Tincidunt ornare massa eget egestas purus viverra accumsan in nisl.",
                            },
                            {
                                id: "7e56b434-d474-4cc3-ac87-becc642e351c",
                                content: "Sed euismod nisi porta lorem mollis aliquam ut.",
                            },
                            {
                                id: "b0c333a5-7eb4-4142-9141-28cf317adaba",
                                content: "Suspendisse sed nisi lacus sed viverra tellus in hac.",
                            },
                            {
                                id: "1895e527-3dda-4280-8158-62f2214d30ec",
                                content: "Aliquet risus feugiat in ante metus dictum at tempor.",
                            },
                            {
                                id: "0198d35a-5253-4a93-9af8-22d2169b88d7",
                                content: "Velit aliquet sagittis id consectetur purus ut faucibus.",
                            },
                            {
                                id: "e4143447-b828-4b32-8d96-df8fd84763c0",
                                content: "Libero volutpat sed cras ornare. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet.",
                            },
                            {
                                id: "89e179d9-7127-4937-a022-f20b81357679",
                                content: "Nibh nisl condimentum id venenatis a condimentum vitae. Fames ac turpis egestas maecenas pharetra.",
                            },
                            {
                                id: "aff19a6f-a89e-4e4f-bd2c-5291dd95dc9b",
                                content: "Massa sapien faucibus et molestie. Ac turpis egestas maecenas pharetra convallis posuere morbi leo urna.",
                            },
                            {
                                id: "a9ce2ec0-2235-46ab-ade2-7fd808ca3de9",
                                content: "Est pellentesque elit ullamcorper dignissim cras. Mi proin sed libero enim sed.",
                            },
                        ],
                    },
                    {
                        id: "1900eb3e-e44a-481b-abe7-d82aafb5a4ed",
                        class: "columns-3-narrow",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                id: "cf0c05c6-a132-40af-b462-1928ed5299b1",
                                image: {
                                    src: "assets/images/vanilla-bear-films-JEwNQerg3Hs-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                            },
                            {
                                id: "e1d1d173-a259-4091-baea-60c3366fd879",
                                image: {
                                    src: "assets/images/dani-navarro-6CnGzrLwM28-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim.",
                            },
                            {
                                id: "fbfdf20e-f6e3-404b-b7be-8d9c64d5f0cc",
                                image: {
                                    src: "assets/images/wan-san-yip-ID1yWa1Wpx0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim.",
                            },
                        ],
                    },
                    {
                        id: "212ae8c8-9689-4c4c-b75c-6af97924c561",
                        class: "columns-3-narrow",
                        url: "#",
                        type: "preview",
                        content: [
                            {
                                id: "5e31f22f-30d5-4d88-97ce-9584a378911e",
                                image: {
                                    src: "assets/images/david-beale--lQR8yeDzek-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Tellus in metus vulputate eu scelerisque felis imperdiet proin fermentum.",
                            },
                            {
                                id: "55c34060-7e3d-40a8-9a31-20a15bbed649",
                                image: {
                                    src: "assets/images/arnaud-jaegers-IBWJsMObnnU-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Adipiscing tristique risus nec feugiat in fermentum posuere vulputate eu scelerisque.",
                            },
                            {
                                id: "8b96fd4c-1648-4a3c-96a5-c0ac52d02b60",
                                image: {
                                    src: "assets/images/kevin-rajaram-qhixFFO8EWQ-unsplash_1280x720.webp",
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
                id: "content-politics-underscored",
                name: "Underscored",
                articles: [
                    {
                        id: "78fb02c4-4a19-4c24-a504-fb029810730e",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "c3bd82d1-a2d7-4f10-ac62-e3c6f8812b55",
                                image: {
                                    src: "assets/images/kyle-glenn-gcw_WWu_uBQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Ut aliquam purus sit amet luctus venenatis lectus magna fringilla. Urna neque viverra justo nec ultrices dui sapien. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Risus viverra adipiscing at in tellus integer feugiat scelerisque. Pretium nibh ipsum consequat nisl vel.",
                                url: "#",
                            },
                            {
                                id: "1405735c-c7e6-4531-ad8c-d4c158960c2e",
                                image: {
                                    src: "assets/images/toa-heftiba-4xe-yVFJCvw-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Nunc id cursus metus aliquam eleifend. Sit amet est placerat in egestas erat. Vitae tortor condimentum lacinia quis vel eros donec ac. Maecenas pharetra convallis posuere morbi leo urna molestie at. Lectus proin nibh nisl condimentum id venenatis. Ut enim blandit volutpat maecenas volutpat blandit.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "c215acac-4b82-4696-a5d7-a33f322c45f3",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "d7f4ffb0-9dfe-45c5-85cf-bed1b25741bd",
                                image: {
                                    src: "assets/images/harri-kuokkanen-SEtUeWL8bIQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Vestibulum sed arcu non odio euismod lacinia. Ipsum dolor sit amet consectetur. Nisi scelerisque eu ultrices vitae. Eu consequat ac felis donec. Viverra orci sagittis eu volutpat odio facilisis mauris sit amet. Purus semper eget duis at tellus at urna. Nulla aliquet porttitor lacus luctus accumsan tortor posuere ac.",
                                url: "#",
                            },
                            {
                                id: "4ba86b88-39b7-44fd-bf9f-fc2bfc225281",
                                image: {
                                    src: "assets/images/ednilson-cardoso-dos-santos-haiooWA_weo-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Elementum eu facilisis sed odio morbi. Scelerisque viverra mauris in aliquam sem fringilla ut. Enim ut sem viverra aliquet. Massa sed elementum tempus egestas. Nam at lectus urna duis convallis convallis tellus. Sem integer vitae justo eget magna. In mollis nunc sed id.",
                                url: "#",
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
                        id: "40fc21b9-2db4-47e2-96ef-2d95e79a9df3",
                        class: "columns-wrap",
                        header: "New Legislations",
                        type: "excerpt",
                        content: [
                            {
                                id: "75d1b551-a1cc-4548-aa28-f1d493c5925f",
                                image: {
                                    src: "assets/images/markus-spiske-7PMGUqYQpYc-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Consequat ac felis donec et. Libero nunc consequat interdum varius sit amet mattis vulputate enim. Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Nisi lacus sed viverra tellus in hac. Aliquam malesuada bibendum arcu vitae elementum curabitur.",
                            },
                            {
                                id: "2d4876f9-45be-4aa9-8ac7-56232b55d649",
                                image: {
                                    src: "assets/images/viktor-talashuk-05HLFQu8bFw-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Neque gravida in fermentum et sollicitudin ac orci. Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Fermentum leo vel orci porta non pulvinar neque laoreet.",
                            },
                            {
                                id: "a1e61b50-4106-4f68-9f35-822452c473bd",
                                image: {
                                    src: "assets/images/anastassia-anufrieva-ecHGTPfjNfA-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Egestas diam in arcu cursus. Aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis. Augue ut lectus arcu bibendum at varius vel pharetra.",
                            },
                        ],
                    },
                    {
                        id: "9f10b36d-0666-479c-a234-a7ab95f9737d",
                        class: "columns-wrap",
                        header: "Latest Polls",
                        type: "excerpt",
                        content: [
                            {
                                id: "174f4a54-5f05-499b-8255-9dce7caccff3",
                                image: {
                                    src: "assets/images/bianca-ackermann-qr0-lKAOZSk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Aliquam eleifend mi in nulla posuere sollicitudin. Tempor nec feugiat nisl pretium fusce. Fermentum iaculis eu non diam phasellus vestibulum lorem. Scelerisque eleifend donec pretium vulputate sapien nec. Sit amet aliquam id diam maecenas ultricies mi.",
                            },
                            {
                                id: "b5b69901-c646-4034-9f11-d54357ea745b",
                                image: {
                                    src: "assets/images/phil-hearing-bu27Y0xg7dk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Morbi leo urna molestie at elementum eu. Phasellus vestibulum lorem sed risus. Aliquet bibendum enim facilisis gravida neque. Aliquam sem et tortor consequat id porta. Interdum varius sit amet mattis vulputate enim nulla aliquet. Enim nulla aliquet porttitor lacus luctus accumsan tortor.",
                            },
                            {
                                id: "9cd2a3f7-3723-4295-af72-fbbfa4a232d2",
                                image: {
                                    src: "assets/images/mika-baumeister-Hm4zYX-BDxk-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Molestie nunc non blandit massa. Adipiscing diam donec adipiscing tristique risus nec feugiat in. Odio morbi quis commodo odio aenean sed adipiscing diam donec. Felis eget velit aliquet sagittis id consectetur purus ut. Odio ut enim blandit volutpat maecenas.",
                            },
                        ],
                    },
                    {
                        id: "d86ca00e-4e84-48ac-8c95-118d7c9a2e44",
                        class: "columns-wrap",
                        header: "Who's gaining votes",
                        type: "excerpt",
                        content: [
                            {
                                id: "6c3745c6-3dc4-435f-b81a-8d2b06cc1ad2",
                                image: {
                                    src: "assets/images/wesley-tingey-7BkCRNwh_V0-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Risus viverra adipiscing at in tellus integer feugiat scelerisque. Porttitor eget dolor morbi non arcu risus quis varius quam. Consectetur adipiscing elit ut aliquam purus sit. Pulvinar mattis nunc sed blandit.",
                            },
                            {
                                id: "32de17cf-8c35-4ad0-99e2-3328c80c296e",
                                image: {
                                    src: "assets/images/miguel-bruna-TzVN0xQhWaQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Non curabitur gravida arcu ac tortor dignissim. Purus in mollis nunc sed id semper risus in hendrerit. Vestibulum morbi blandit cursus risus. Pellentesque nec nam aliquam sem et tortor. Ac tortor dignissim convallis aenean et.",
                            },
                            {
                                id: "bb64bf13-a35b-4dad-99bf-810f67772471",
                                image: {
                                    src: "assets/images/clay-banks-cisdc-344vo-unsplash_1280x720.webp",
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
                id: "content-politics-around-the-world",
                name: "Around the World",
                articles: [
                    {
                        id: "d7923d94-7cd8-418a-865e-2b90faf6f830",
                        class: "columns-3-balanced",
                        header: "Britain",
                        image: {
                            src: "assets/images/marc-olivier-jodoin-_eclsGKsUdo-unsplash_1280x720.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Sed blandit libero volutpat sed cras ornare arcu dui. Id ornare arcu odio ut sem.",
                        type: "list",
                        content: [
                            {
                                id: "a2341f46-19cf-4723-9568-d77b410ba8c4",
                                content: "Dolor sed viverra ipsum nunc aliquet bibendum enim. Hendrerit dolor magna eget est lorem ipsum dolor.",
                            },
                            {
                                id: "73423726-07db-4616-8c7d-17f68481245f",
                                content: "At elementum eu facilisis sed odio morbi quis commodo odio. In massa tempor nec feugiat nisl.",
                            },
                            {
                                id: "f897bb1f-53b8-4e47-a367-d78562e9ee93",
                                content: "Est sit amet facilisis magna etiam tempor orci eu. Vulputate dignissim suspendisse in est ante in.",
                            },
                            {
                                id: "bc5de5a0-d46c-43ce-bdec-5ef55c6cdeb2",
                                content: "Tempor nec feugiat nisl pretium. Id velit ut tortor pretium viverra suspendisse potenti nullam.",
                            },
                        ],
                    },
                    {
                        id: "f87a7154-8143-4c09-8afe-96f965e00089",
                        class: "columns-3-balanced",
                        header: "Italy",
                        image: {
                            src: "assets/images/sandip-roy-4hgTlYb9jzg-unsplash_1280x720.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Vitae congue mauris rhoncus aenean vel elit.",
                        type: "list",
                        content: [
                            {
                                id: "ffcb5b5e-a2c1-4066-b807-a62699df06b7",
                                content: "Aliquam sem fringilla ut morbi tincidunt augue interdum. Enim eu turpis egestas pretium aenean pharetra magna ac.",
                            },
                            {
                                id: "bd5a8aa1-fc84-4882-afdb-efa33d02fc12",
                                content: "Amet porttitor eget dolor morbi non arcu risus quis varius. Ultricies tristique nulla aliquet enim tortor at auctor.",
                            },
                            {
                                id: "f5badbd1-d614-44a0-85c9-7f1e6a5f1bcf",
                                content: "Nisi lacus sed viverra tellus in hac habitasse platea. Interdum velit euismod in pellentesque.",
                            },
                            {
                                id: "420e0800-ef7e-45ee-9bba-d7b44cef4b69",
                                content: "Mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare. Eu non diam phasellus vestibulum lorem sed risus.",
                            },
                        ],
                    },
                    {
                        id: "14d07dfb-3587-4411-b4ce-33ba171152f4",
                        class: "columns-3-balanced",
                        header: "Poland",
                        image: {
                            src: "assets/images/maksym-harbar-okn8ZIjPMxI-unsplash_1280x720.webp",
                            alt: "Placeholder",
                            width: "1280",
                            height: "720",
                        },
                        meta: {
                            captions: "Photo taken by someone.",
                        },
                        title: "Sed id semper risus in hendrerit gravida rutrum quisque.",
                        type: "list",
                        content: [
                            {
                                id: "4611e3bf-0274-408d-a019-c6688e600dd8",
                                content: "Viverra justo nec ultrices dui sapien eget. A scelerisque purus semper eget duis at tellus at.",
                            },
                            {
                                id: "cfe0b6d6-ec48-4571-9bf2-97f26027f80f",
                                content: "Non diam phasellus vestibulum lorem sed risus ultricies tristique. Ornare arcu dui vivamus arcu felis bibendum ut tristique et.",
                            },
                            {
                                id: "a2415445-ab69-445b-9f27-b7b01e432302",
                                content: "Quisque non tellus orci ac. At augue eget arcu dictum varius.",
                            },
                            {
                                id: "08228c09-8678-4e3e-a256-8f528237c9d8",
                                content: "Aenean sed adipiscing diam donec adipiscing tristique. Sagittis eu volutpat odio facilisis mauris.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-politics-hot-topics",
                name: "Hot Topics",
                articles: [
                    {
                        id: "df191197-ddb0-4c59-978c-560e60e62e0a",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "e9d797f7-36d7-4dbe-8d2a-d6eb8f15bc07",
                                image: {
                                    src: "assets/images/ronda-darby-HbMLSB-uhQY-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Suspendisse sed nisi lacus sed viverra tellus in hac habitasse. Tincidunt id aliquet risus feugiat in. Eget aliquet nibh praesent tristique magna sit amet. Enim lobortis scelerisque fermentum dui faucibus. Molestie ac feugiat sed lectus. Facilisis sed odio morbi quis commodo.",
                                url: "#",
                            },
                            {
                                id: "6b9a85a6-120d-47d6-bc5d-e6d487aedf31",
                                image: {
                                    src: "assets/images/dominic-bieri-vXRt4rFr4hI-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Vitae ultricies leo integer malesuada nunc. Convallis aenean et tortor at risus viverra adipiscing at. Vitae sapien pellentesque habitant morbi tristique senectus. Pellentesque nec nam aliquam sem et tortor consequat id. Fames ac turpis egestas integer.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "2ba63655-af94-4da2-a4da-e7464aa070e8",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "9cb71ead-889b-492f-9b47-297ac6d97d96",
                                image: {
                                    src: "assets/images/inaki-del-olmo-NIJuEQw0RKg-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in. Euismod quis viverra nibh cras. Non sodales neque sodales ut etiam sit. Curabitur vitae nunc sed velit dignissim sodales ut eu. Id leo in vitae turpis massa sed elementum tempus egestas.",
                                url: "#",
                            },
                            {
                                id: "7564b782-691e-494e-9ad1-5de2a2330b17",
                                image: {
                                    src: "assets/images/matt-popovich-7mqsZsE6FaU-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Morbi tristique senectus et netus et malesuada fames. Placerat duis ultricies lacus sed turpis tincidunt id aliquet. Habitant morbi tristique senectus et netus et. Laoreet sit amet cursus sit amet dictum sit. Pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                url: "#",
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
                        id: "a97faeaa-1309-44ec-a9a8-dda2db1ad5f3",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "25841bbd-93a3-472b-860f-0b0af2fc8169",
                                image: {
                                    src: "assets/images/maksim-larin-tecILYzVAzg-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Duis at consectetur lorem donec massa.",
                            },
                        ],
                    },
                    {
                        id: "52472e25-5e61-4bef-9aca-ac86f936d811",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "69c42fe8-a06e-4891-ae22-491f04d0a971",
                                image: {
                                    src: "assets/images/evie-calder-97CO-A4P0GQ-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Eget mi proin sed libero enim sed. Proin libero nunc consequat interdum varius.",
                            },
                        ],
                    },
                    {
                        id: "a16c0da8-7dea-4cb3-af0e-0c0123bf20d3",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "2342acef-0339-444d-a23c-a33654c91665",
                                image: {
                                    src: "assets/images/domino-studio-164_6wVEHfI-unsplash_1280x720.webp",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Porta nibh venenatis cras sed felisDolor sit amet consectetur adipiscing elit ut aliquam purus sit.",
                            },
                        ],
                    },
                    {
                        id: "3e7d37b7-af0e-4f69-a0fd-8d0f64d2e0ba",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "3b57cdb4-8635-4be8-872e-f939538c9e56",
                                image: {
                                    src: "assets/images/pat-taylor-12V36G17IbQ-unsplash_1280x720.webp",
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
                        id: "addec243-95e5-4aae-8261-c6b82b928293",
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
                            tag: {
                                type: "breaking",
                                label: "breaking",
                            },
                        },
                        title: "Enim lobortis scelerisque fermentum dui faucibus in ornare. Ante metus dictum at tempor.",
                        type: "text",
                        content:
                            "Consequat mauris nunc congue nisi vitae. Felis imperdiet proin fermentum leo vel orci porta. Facilisis gravida neque convallis a cras semper. Risus quis varius quam quisque id diam vel quam. Egestas quis ipsum suspendisse ultrices gravida. Nisl nisi scelerisque eu ultrices vitae auctor.\n\nViverra vitae congue eu consequat ac felis. Vestibulum rhoncus est pellentesque elit ullamcorper. Donec massa sapien faucibus et. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus. Quis ipsum suspendisse ultrices gravida. Vel facilisis volutpat est velit egestas dui id ornare arcu. Commodo ullamcorper a lacus vestibulum.",
                    },
                    {
                        id: "4d5bbeee-9e05-4f95-b6bf-af41b145e4e3",
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
                        id: "a788ad50-9e3a-461e-be18-828fbce1dbd9",
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
                        id: "ed902471-e96d-462b-bc88-01c7e22d5fa0",
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
                        id: "31a8663a-d035-4b62-adeb-195a1c60e831",
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
                        id: "bf9491d2-ffcc-4ed3-a3a4-2cfda792f06b",
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
                        id: "95d5859b-44d0-452b-adba-52af428c9b8e",
                        class: "columns-wrap",
                        header: "Global Impact",
                        type: "excerpt",
                        content: [
                            {
                                id: "1f074185-0c72-47cc-b889-2b0d5be855eb",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Bibendum arcu vitae elementum curabitur vitae nunc sed. Ipsum faucibus vitae aliquet nec ullamcorper sit. Blandit libero volutpat sed cras ornare arcu dui. Maecenas sed enim ut sem viverra aliquet.",
                            },
                            {
                                id: "5ba10ec7-2031-4e61-98c4-4fa2e681c0e2",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Arcu risus quis varius quam quisque id diam vel quam. Sed risus pretium quam vulputate dignissim suspendisse in. Amet aliquam id diam maecenas ultricies mi. Egestas dui id ornare arcu odio.",
                            },
                            {
                                id: "8534ba50-7daa-43da-ab5e-929b06ee127f",
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
                        id: "f89eb533-713d-4ece-9998-c29672199357",
                        class: "columns-wrap",
                        header: "Outlook",
                        type: "excerpt",
                        content: [
                            {
                                id: "c9e71431-0407-4329-bbb3-61a820dc636a",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ut etiam sit amet nisl purus in mollis nunc sed. Eget mauris pharetra et ultrices neque ornare aenean. Magna sit amet purus gravida quis blandit turpis.",
                            },
                            {
                                id: "d0c42c8e-e4a5-46b7-a7a7-9e3e8dfb34a3",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Eu nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Viverra aliquet eget sit amet tellus cras. Consequat id porta nibh venenatis. Ac felis donec et odio pellentesque diam volutpat commodo sed.",
                            },
                            {
                                id: "c3bbf9c0-e133-405b-8a1b-e24da3258980",
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
                        id: "eb628ced-8e49-4cc7-a4b6-2531bc5f7b30",
                        class: "columns-wrap",
                        header: "Financial Freedom",
                        type: "excerpt",
                        content: [
                            {
                                id: "bc0da085-5ade-493d-8784-78ae2607cf29",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Bibendum arcu vitae elementum curabitur vitae nunc sed. Facilisis mauris sit amet massa vitae tortor condimentum lacinia.",
                            },
                            {
                                id: "9ae84ec2-229d-4969-870a-23e8561146ef",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. At in tellus integer feugiat scelerisque varius morbi enim. Nisi vitae suscipit tellus mauris a.",
                            },
                            {
                                id: "8b9e5c03-b566-4e78-9df3-768698a17713",
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
                        id: "b77172cc-4e49-40ca-9235-eb2f5f865804",
                        class: "columns-1",
                        type: "grid",
                        display: "grid-wrap",
                        content: [
                            {
                                id: "75dba799-f4f1-43d7-909c-81e107a61281",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                url: "#",
                            },
                            {
                                id: "7d882247-3db1-4882-a609-ee5eed6dc6df",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                url: "#",
                            },
                            {
                                id: "de04fa72-d96e-4eb7-bbf7-d587e31a5f6b",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Nisl tincidunt eget nullam non nisi est sit. At consectetur lorem donec massa sapien faucibus et molestie ac. Semper risus in hendrerit gravida rutrum. Eget aliquet nibh praesent tristique magna sit. Mi quis hendrerit dolor magna eget.",
                                url: "#",
                            },
                            {
                                id: "d6275634-2236-4a3c-b787-a71d33ae5bdf",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Pulvinar proin gravida hendrerit lectus a. At volutpat diam ut venenatis tellus in metus vulputate eu. Maecenas accumsan lacus vel facilisis volutpat. Enim eu turpis egestas pretium aenean pharetra magna. Orci eu lobortis elementum nibh tellus molestie nunc.",
                                url: "#",
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
                        id: "4187d9c9-e176-4b0a-8bee-03f4f3be418a",
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
                        id: "c519abd4-bb39-4b35-b3fb-130713f8f27b",
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
                        id: "a7b41785-e2d9-4afa-a161-5edcffce77a8",
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
                        id: "4e229873-04c6-410a-a433-18178fa4aad5",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "a623eb53-c205-4ba7-88cc-7d28a402fbe7",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                url: "#",
                            },
                            {
                                id: "5a406442-2994-47c1-9e9c-51ccb2c12dbc",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "1760d2cf-9530-4c27-9943-ec0525b5dd4f",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "12d94ea1-157a-4f3d-87bf-28c305b52aea",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                url: "#",
                            },
                            {
                                id: "8f623500-fbd4-4bc0-9a72-31b7c18749a8",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-business-investing-101",
                name: "Investing 101",
                articles: [
                    {
                        id: "d3b35a69-8fa6-49b6-a86f-a451e15430f0",
                        class: "columns-3-balanced",
                        header: "Manage your assets",
                        type: "articles-list",
                        content: [
                            {
                                id: "d7e4b0d6-79f6-4ee0-9a25-07948eb0f199",
                                title: "Ic turpis egestas maecenas pharetra convallis. Dui accumsan sit amet nulla facilisi morbi tempus.",
                                content:
                                    "A scelerisque purus semper eget duis at. Condimentum lacinia quis vel eros donec ac odio. Pretium fusce id velit ut tortor pretium viverra suspendisse. Blandit aliquam etiam erat velit scelerisque in. Est placerat in egestas erat imperdiet sed euismod nisi. Suspendisse potenti nullam ac tortor vitae purus faucibus.",
                            },
                            {
                                id: "e1c56eba-491c-461f-85dd-a3df520dfbfc",
                                title: "Risus commodo viverra maecenas accumsan lacus vel.",
                                content:
                                    "Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Iaculis eu non diam phasellus. Odio aenean sed adipiscing diam donec. Eleifend donec pretium vulputate sapien nec sagittis aliquam malesuada bibendum.",
                            },
                            {
                                id: "3b46da4b-dd8e-49fd-b53f-64effe759dea",
                                title: "Vitae ultricies leo integer malesuada nunc vel risus commodo.",
                                content:
                                    "Donec et odio pellentesque diam volutpat. Sed libero enim sed faucibus turpis in eu. Aliquam nulla facilisi cras fermentum odio eu feugiat pretium. Tristique risus nec feugiat in fermentum. Turpis egestas maecenas pharetra convallis posuere morbi leo urna.",
                            },
                        ],
                    },
                    {
                        id: "27a697e9-74a9-459c-9cd2-d479d65ac2f7",
                        class: "columns-3-balanced",
                        header: "What to watch",
                        type: "articles-list",
                        content: [
                            {
                                id: "c1d78742-406a-4123-86cd-bc4fad85f28b",
                                title: "Elementum integer enim neque volutpat.",
                                content:
                                    "Dignissim diam quis enim lobortis scelerisque. Lacus vestibulum sed arcu non odio euismod lacinia at quis. Mi bibendum neque egestas congue quisque. Arcu dui vivamus arcu felis bibendum ut tristique. Consectetur adipiscing elit ut aliquam purus sit amet luctus venenatis.",
                            },
                            {
                                id: "01ca72c3-7112-4a57-9173-a527977755ae",
                                title: "Vitae turpis massa sed elementum tempus egestas sed.",
                                content:
                                    "Eu lobortis elementum nibh tellus molestie. Egestas congue quisque egestas diam in arcu cursus euismod quis. Purus non enim praesent elementum facilisis. Suscipit tellus mauris a diam maecenas sed enim ut sem. Sed elementum tempus egestas sed sed risus pretium quam.",
                            },
                            {
                                id: "7734f54b-5b1b-4a6f-b81a-b15b0f0d52cb",
                                title: "Consequat ac felis donec et odio pellentesque diam.",
                                content:
                                    "Pharetra diam sit amet nisl suscipit adipiscing bibendum. Mi eget mauris pharetra et ultrices neque ornare. Habitant morbi tristique senectus et netus et. Quis eleifend quam adipiscing vitae. Fames ac turpis egestas maecenas pharetra convallis posuere morbi.",
                            },
                        ],
                    },
                    {
                        id: "cff3dc12-6773-4f70-a22d-ff1bc100c818",
                        class: "columns-3-balanced",
                        header: "Did you know?",
                        type: "articles-list",
                        content: [
                            {
                                id: "379fa367-cf87-4b0a-8ab6-1a0b1a8d7943",
                                title: "Lacus sed viverra tellus in. Eget mi proin sed libero enim sed.",
                                content:
                                    "A diam maecenas sed enim. Platea dictumst vestibulum rhoncus est pellentesque elit. Metus dictum at tempor commodo ullamcorper. Est ullamcorper eget nulla facilisi etiam dignissim diam. Felis eget velit aliquet sagittis id consectetur purus.",
                            },
                            {
                                id: "508c1266-d70f-4e9d-ae5f-fab87fccc1a0",
                                title: "Est lorem ipsum dolor sit amet. Duis ultricies lacus sed turpis tincidunt.",
                                content:
                                    "Mattis pellentesque id nibh tortor id aliquet lectus. Odio aenean sed adipiscing diam donec adipiscing. Mi in nulla posuere sollicitudin aliquam ultrices sagittis. Dictum varius duis at consectetur lorem donec massa sapien faucibus.",
                            },
                            {
                                id: "b3fa7b41-ed86-4ab1-a86a-21283741d1a0",
                                title: "Duis ut diam quam nulla porttitor massa id.",
                                content:
                                    "Id aliquet lectus proin nibh nisl condimentum id venenatis. Ultrices in iaculis nunc sed augue lacus viverra vitae congue. Lectus urna duis convallis convallis tellus id interdum velit. Duis convallis convallis tellus id interdum. Et malesuada fames ac turpis egestas sed.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-business-stock-market",
                name: "Stock market",
                articles: [
                    {
                        id: "49e01dcc-39fd-482d-b0c1-31918f791041",
                        class: "columns-wrap",
                        header: "Dow Jones",
                        type: "excerpt",
                        content: [
                            {
                                id: "a9ae906b-e98d-412d-89a1-baba39c0be01",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Pretium fusce id velit ut tortor pretium viverra suspendisse potenti. Nisi scelerisque eu ultrices vitae auctor eu. Amet massa vitae tortor condimentum lacinia quis vel. In arcu cursus euismod quis.",
                            },
                            {
                                id: "217c58fc-0edf-417d-9305-4abc0615eef8",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Tempus urna et pharetra pharetra massa massa ultricies mi. Vestibulum lorem sed risus ultricies tristique nulla aliquet enim. Sit amet luctus venenatis lectus magna fringilla urna.",
                            },
                            {
                                id: "82606dff-6bc4-4b84-b0d8-c7557f6482e4",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Viverra adipiscing at in tellus integer feugiat scelerisque varius morbi. Massa tempor nec feugiat nisl pretium fusce id. Elit ut aliquam purus sit amet luctus.",
                            },
                        ],
                    },
                    {
                        id: "084674ba-b34b-4841-8674-e29bfd3633fa",
                        class: "columns-wrap",
                        header: "S&P 500",
                        type: "excerpt",
                        content: [
                            {
                                id: "2c06041f-b0b4-47f3-a1c4-ab3fb25f0803",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Risus quis varius quam quisque id diam vel quam. Risus at ultrices mi tempus imperdiet nulla malesuada. Aliquet enim tortor at auctor urna. Sapien et ligula ullamcorper malesuada proin libero. Nunc sed augue lacus viverra vitae congue.",
                            },
                            {
                                id: "b408a578-0fda-4423-9635-cbf1c2aa675d",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Quisque id diam vel quam elementum pulvinar etiam non. Lacus laoreet non curabitur gravida arcu ac tortor dignissim convallis. Ac ut consequat semper viverra nam libero justo.",
                            },
                            {
                                id: "635b4368-112d-4062-8e8c-e95171cffa6f",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere lorem. Enim facilisis gravida neque convallis. Quis blandit turpis cursus in hac habitasse platea.",
                            },
                        ],
                    },
                    {
                        id: "d287a7b5-305f-4e6f-81c7-3a6f1e833a5a",
                        class: "columns-wrap",
                        header: "Day Trading",
                        type: "excerpt",
                        content: [
                            {
                                id: "5a5482c2-f4ef-4cca-98b4-1e6cdca39ec5",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et. Sed enim ut sem viverra aliquet eget. Porttitor lacus luctus accumsan tortor. Sit amet justo donec enim diam.",
                            },
                            {
                                id: "f6fa61d0-5086-445c-8192-9f78ce2c3a63",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nibh sit amet commodo nulla facilisi nullam vehicula. Lectus mauris ultrices eros in cursus turpis massa. Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in.",
                            },
                            {
                                id: "f3f5f6b2-cdcf-49b6-b650-bb80c9459dde",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Consectetur lorem donec massa sapien faucibus. Aliquet porttitor lacus luctus accumsan tortor. Pharetra pharetra massa massa ultricies mi. Aliquam id diam maecenas ultricies mi eget mauris pharetra. Rhoncus urna neque viverra justo nec ultrices dui sapien eget.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-business-impact",
                name: "Impact",
                articles: [
                    {
                        id: "f87f6f06-2480-48b1-abf0-17c97fa92d27",
                        class: "columns-3-balanced",
                        header: "Oil crisis",
                        type: "articles-list",
                        content: [
                            {
                                id: "f452479c-6084-4b57-925d-a7851a0a1211",
                                title: "Eleifend donec pretium vulputate sapien nec sagittis.",
                                content:
                                    "Adipiscing bibendum est ultricies integer quis. Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque. Suspendisse in est ante in. Semper auctor neque vitae tempus quam pellentesque. Et tortor at risus viverra adipiscing at in tellus integer.",
                            },
                            {
                                id: "1caebfb3-912b-485d-a4b7-4500adb5066a",
                                title: "Ornare aenean euismod elementum nisi quis eleifend quam.",
                                content:
                                    "Pretium aenean pharetra magna ac. Sem nulla pharetra diam sit amet nisl suscipit adipiscing bibendum. Neque vitae tempus quam pellentesque nec nam aliquam sem. Potenti nullam ac tortor vitae purus faucibus ornare suspendisse. Ipsum nunc aliquet bibendum enim facilisis gravida neque.",
                            },
                            {
                                id: "341d9b4b-d3eb-4728-922e-222d745665c1",
                                title: "Ultrices sagittis orci a scelerisque purus semper. Porttitor massa id neque aliquam vestibulum morbi blandit.",
                                content:
                                    "Augue eget arcu dictum varius. Aliquet nibh praesent tristique magna sit amet purus gravida. Mattis enim ut tellus elementum. A diam sollicitudin tempor id eu nisl nunc mi. Justo nec ultrices dui sapien eget mi proin. Euismod lacinia at quis risus sed vulputate odio.",
                            },
                        ],
                    },
                    {
                        id: "8d0c8045-a260-47ec-9f28-1098d994da86",
                        class: "columns-3-balanced",
                        header: "Tech Markets",
                        type: "articles-list",
                        content: [
                            {
                                id: "40e13034-8351-4f8a-8e1d-3d6f068e6709",
                                title: "Dictum sit amet justo donec. Justo donec enim diam vulputate ut pharetra sit.",
                                content:
                                    "Bibendum enim facilisis gravida neque. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at augue. Auctor neque vitae tempus quam pellentesque nec. Justo donec enim diam vulputate ut pharetra sit amet. Aliquam sem fringilla ut morbi tincidunt augue interdum velit.",
                            },
                            {
                                id: "2b763d78-1424-4a2e-a5a2-79fe02253600",
                                title: "Massa massa ultricies mi quis hendrerit dolor magna eget.",
                                content:
                                    "Ornare massa eget egestas purus viverra accumsan in nisl nisi. A arcu cursus vitae congue mauris rhoncus. Gravida arcu ac tortor dignissim convallis aenean et tortor. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant. Volutpat diam ut venenatis tellus in metus.",
                            },
                            {
                                id: "3d29bcd8-9d18-4dac-8f98-197c968f90bd",
                                title: "Duis at consectetur lorem donec massa sapien faucibus.",
                                content:
                                    "acilisis gravida neque convallis a cras semper auctor neque. Non nisi est sit amet facilisis magna etiam tempor. Posuere morbi leo urna molestie at elementum eu. Tellus in hac habitasse platea dictumst vestibulum rhoncus est pellentesque.",
                            },
                        ],
                    },
                    {
                        id: "9144e1b3-46b1-4c71-b26d-6f4cf74e7444",
                        class: "columns-3-balanced",
                        header: "Declining Markets",
                        type: "articles-list",
                        content: [
                            {
                                id: "4887a57f-dee5-4023-a173-bcb2a691f6ca",
                                title: "Odio aenean sed adipiscing diam donec adipiscing tristique risus nec.",
                                content: "Pharetra vel turpis nunc eget. Non arcu risus quis varius quam quisque id. Augue ut lectus arcu bibendum at varius vel pharetra vel. Rhoncus dolor purus non enim praesent elementum.",
                            },
                            {
                                id: "73bd8127-50e4-44e7-836d-07e330226717",
                                title: "Quis enim lobortis scelerisque fermentum. Nisl rhoncus mattis rhoncus urna. Felis eget velit aliquet sagittis id consectetur purus ut.",
                                content:
                                    "Enim nec dui nunc mattis enim ut. Amet luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor. Sed vulputate mi sit amet mauris commodo. Ultricies lacus sed turpis tincidunt id aliquet risus feugiat. In hac habitasse platea dictumst vestibulum rhoncus est.",
                            },
                            {
                                id: "a585ea07-caf5-44b9-88d2-f8f5f8ae6f02",
                                title: "landit cursus risus at ultrices mi tempus imperdiet nulla malesuada.",
                                content:
                                    "Vitae justo eget magna fermentum iaculis eu non diam phasellus. Et netus et malesuada fames ac turpis. In eu mi bibendum neque egestas congue. Justo eget magna fermentum iaculis eu non diam. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-business-hot-topics",
                name: "Hot Topics",
                articles: [
                    {
                        id: "1e60235c-0198-4448-9267-f3f86542d7dc",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "7498eaec-d8dc-442f-b939-2bff86ed2c6e",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "In massa tempor nec feugiat nisl. Mattis vulputate enim nulla aliquet porttitor lacus luctus. Et sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque. Nec sagittis aliquam malesuada bibendum.",
                                url: "#",
                            },
                            {
                                id: "cce7d8eb-b0d7-40a6-bc7d-932ac420fd43",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Euismod quis viverra nibh cras pulvinar mattis nunc. Mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus. Malesuada bibendum arcu vitae elementum curabitur vitae. Fusce id velit ut tortor.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "46e89da3-b39c-43a7-9178-efeeb91e973d",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "40389294-8c93-4c5a-8a63-57ffefdd8f89",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Scelerisque felis imperdiet proin fermentum leo vel orci. Tortor vitae purus faucibus ornare suspendisse sed nisi. Molestie at elementum eu facilisis sed odio. Pellentesque sit amet porttitor eget. Vitae auctor eu augue ut lectus arcu bibendum at varius.",
                                url: "#",
                            },
                            {
                                id: "bb50d294-0aaa-40c1-aebd-f727bc270b17",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Potenti nullam ac tortor vitae purus faucibus ornare. Nunc mattis enim ut tellus elementum sagittis vitae et leo. Pellentesque pulvinar pellentesque habitant morbi tristique senectus.",
                                url: "#",
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
                        id: "d6c99f00-e45b-4da3-abb8-2a0a3bd27cc7",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "d9326d57-6280-4f00-a047-12be65eb3ca2",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Facilisis magna etiam tempor orci eu lobortis elementum nibh tellus. Morbi enim nunc faucibus a pellentesque sit amet porttitor eget.",
                            },
                            {
                                id: "bbe374d2-6058-4800-8ecb-2101785ba463",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Cursus vitae congue mauris rhoncus aenean vel elit. Ultrices neque ornare aenean euismod elementum nisi. Aliquet risus feugiat in ante metus dictum at tempor commodo.",
                            },
                        ],
                    },
                    {
                        id: "2b905eee-c666-4704-9658-1e0757b02253",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "e84ec76b-e0ec-4477-adcd-3a7f49516895",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Sit amet aliquam id diam maecenas ultricies. Magna sit amet purus gravida quis blandit. Risus nullam eget felis eget nunc. Ac felis donec et odio pellentesque diam volutpat commodo sed.",
                            },
                            {
                                id: "f5cddda2-e658-4f4f-b245-33228dad3eb3",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Purus faucibus ornare suspendisse sed nisi lacus. Malesuada nunc vel risus commodo. Pretium fusce id velit ut tortor pretium viverra suspendisse potenti.",
                            },
                        ],
                    },
                    {
                        id: "1acc8fc3-74bb-46b0-8d67-bee9bfb7667a",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "41f2e683-c165-4573-a50d-27aad4deae11",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Aliquam malesuada bibendum arcu vitae elementum curabitur. A pellentesque sit amet porttitor eget dolor morbi non.",
                            },
                            {
                                id: "8249c70b-245f-44e4-829e-d08a273522c7",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Tortor at auctor urna nunc id cursus metus aliquam. Facilisis magna etiam tempor orci. Eu nisl nunc mi ipsum faucibus vitae aliquet.",
                            },
                        ],
                    },
                    {
                        id: "a005c941-9e4b-4219-88df-d6a553b3c237",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "1d5eee05-b406-4853-b5ba-f37728062b2e",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "Cursus mattis molestie a iaculis at. Nullam eget felis eget nunc. Tortor id aliquet lectus proin nibh nisl condimentum id.",
                            },
                            {
                                id: "66f72ca0-97b1-48f1-9aa5-ad53f4d040d5",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                title: "arius morbi enim nunc faucibus a pellentesque sit amet porttitor. Blandit libero volutpat sed cras. Sed viverra ipsum nunc aliquet bibendum.",
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
                        id: "7c4b6a7e-1f91-4e43-b099-a72aea0fa6c7",
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
                            tag: {
                                type: "breaking",
                                label: "breaking",
                            },
                        },
                        title: "Senectus et netus et malesuada fames ac turpis egestas. Odio facilisis mauris sit amet massa. Ornare quam viverra orci sagittis eu volutpat odio.",
                        type: "text",
                        content:
                            "Lorem ipsum dolor sit amet consectetur. Ridiculus mus mauris vitae ultricies leo. Volutpat ac tincidunt vitae semper quis. In est ante in nibh. Fringilla phasellus faucibus scelerisque eleifend donec pretium. Scelerisque eu ultrices vitae auctor eu augue.",
                    },
                    {
                        id: "0d292bbd-e6da-499b-8008-652d51e3b26d",
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
                        id: "75c1fa44-8c39-48a0-9db7-b30c0ffc6606",
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
                        id: "68c63699-7843-4f2c-8893-3cd0043ce6c7",
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
                                id: "240604e5-bec1-4618-96b2-0779e444bbd6",
                                content: "Tortor consequat id porta nibh venenatis cras sed.",
                            },
                            {
                                id: "0c00a629-e255-4378-8a83-c03f7931c4ad",
                                content: "Suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur.",
                            },
                            {
                                id: "1c1c8def-c6a4-46e1-abc3-41f5047fac43",
                                content: "Adipiscing diam donec adipiscing tristique risus nec feugiat in.",
                            },
                            {
                                id: "58d833c6-a8c8-407a-9f19-beca0f8c162f",
                                content: "Ultrices neque ornare aenean euismod elementum nisi quis.",
                            },
                        ],
                    },
                    {
                        id: "f293245c-cbdc-4538-8ca8-0181ba5709a0",
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
                                id: "92224182-af6a-4b62-88cb-570784a44f48",
                                content: "Nisi porta lorem mollis aliquam ut porttitor leo a diam.",
                            },
                            {
                                id: "a6afd1c2-8601-44c0-b0f4-1ce53c49c18e",
                                content: "Purus ut faucibus pulvinar elementum integer enim neque volutpat ac.",
                            },
                            {
                                id: "a50daa85-285a-4352-95f0-110d84a29bfe",
                                content: "Suspendisse in est ante in nibh mauris cursus.",
                            },
                            {
                                id: "81b0cb6e-a5d2-4520-9760-91dd4b87b416",
                                content: "Aliquam vestibulum morbi blandit cursus. Leo integer malesuada nunc vel risus commodo viverra maecenas.",
                            },
                        ],
                    },
                    {
                        id: "0f38830e-3f1d-43ee-9f24-dc3f1422e9d7",
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
                        id: "7ca7daac-f4d0-4a57-a396-b8bb485796b4",
                        class: "columns-wrap",
                        header: "Around the world",
                        type: "excerpt",
                        content: [
                            {
                                id: "8b9fef9b-1387-432b-9f0a-a4fbe8525c39",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Egestas congue quisque egestas diam in arcu. Sollicitudin tempor id eu nisl nunc mi.",
                            },
                            {
                                id: "dbbbe43b-354b-458e-832a-1a1de4e4a68c",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "A condimentum vitae sapien pellentesque habitant morbi tristique senectus. Neque laoreet suspendisse interdum consectetur.",
                            },
                            {
                                id: "4d5f3465-3649-40d0-a15e-28b4c6c7a333",
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
                        id: "89639a03-5c46-45c1-ad54-ba8548521eea",
                        class: "columns-wrap",
                        header: "Support",
                        type: "excerpt",
                        content: [
                            {
                                id: "ac384e2a-611f-4910-8c89-2922238dff84",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Malesuada fames ac turpis egestas integer eget. Ante metus dictum at tempor commodo ullamcorper. Ipsum dolor sit amet consectetur.",
                            },
                            {
                                id: "c5622af2-af36-4d93-9fab-5fed3226f48c",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Dictumst quisque sagittis purus sit amet. Cras fermentum odio eu feugiat pretium. Pretium aenean pharetra magna ac placerat vestibulum lectus.",
                            },
                            {
                                id: "1e5314da-3b79-4da7-a845-d3c27c37ba70",
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
                        id: "b4c36ecf-7d2f-4715-842c-a1fe99c0475e",
                        class: "columns-wrap",
                        header: "Know More",
                        type: "excerpt",
                        content: [
                            {
                                id: "af1969b9-e8de-4e1f-84b5-353ea124a6b0",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nullam eget felis eget nunc. Fames ac turpis egestas integer eget aliquet nibh praesent tristique.",
                            },
                            {
                                id: "ba3d22b7-a6e8-4f6e-a97a-ac179e4c44de",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Massa ultricies mi quis hendrerit dolor magna eget est.",
                            },
                            {
                                id: "3724b29a-64a3-4426-9354-7f6026d5ce30",
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
                        id: "a1034d17-1add-49f8-b258-27de86bea9e4",
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
                                id: "66f18c80-0f84-4713-ba04-ec7aa1f3441a",
                                content: "Et tortor consequat id porta nibh venenatis cras sed felis. Neque aliquam vestibulum morbi blandit cursus risus at ultrices mi.",
                                url: "#",
                            },
                            {
                                id: "a446329a-425a-4599-81c7-a867ab764af9",
                                content: "Commodo quis imperdiet massa tincidunt nunc. Diam maecenas sed enim ut sem viverra aliquet eget sit.",
                                url: "#",
                            },
                            {
                                id: "273c6981-6b94-4b79-9017-5a8ee610450f",
                                content: "Aliquam malesuada bibendum arcu vitae elementum curabitur. Quis ipsum suspendisse ultrices gravida dictum fusce ut placerat.",
                                url: "#",
                            },
                            {
                                id: "142b6b03-0141-443f-bb2f-06310fc3ff76",
                                content: "Quis enim lobortis scelerisque fermentum. Nibh venenatis cras sed felis eget velit aliquet.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "c344dac6-35bf-44af-9c55-ae5ca7ab7f41",
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
                                id: "434b9a09-048a-4389-963d-f1a9e28a2e0b",
                                content: "In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit. At lectus urna duis convallis convallis tellus id interdum.",
                                url: "#",
                            },
                            {
                                id: "5d479d71-0510-46c7-a97e-96dfaac89f33",
                                content: "Ultrices eros in cursus turpis massa tincidunt dui. Mi tempus imperdiet nulla malesuada pellentesque.",
                                url: "#",
                            },
                            {
                                id: "c237c9c4-d382-4e70-8888-32fe5b57153b",
                                content: "Ipsum faucibus vitae aliquet nec ullamcorper sit. Eleifend donec pretium vulputate sapien nec sagittis aliquam.",
                                url: "#",
                            },
                            {
                                id: "1747a7d7-a717-4dc1-b972-aea76168bd6e",
                                content: "In hac habitasse platea dictumst. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "a1724b6d-085c-4467-b413-e3332a4a4af6",
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
                                id: "17e825fc-4471-405d-8134-3105d0d5c419",
                                content: "Urna porttitor rhoncus dolor purus. Eget sit amet tellus cras adipiscing enim.",
                                url: "#",
                            },
                            {
                                id: "dffa8c9a-0f03-4a0c-a1cb-fb26e0a74a49",
                                content: "Leo urna molestie at elementum eu facilisis sed. Metus dictum at tempor commodo ullamcorper a.",
                                url: "#",
                            },
                            {
                                id: "1c5c95cc-41e8-418b-9caa-f3e743b53fbf",
                                content: "Non odio euismod lacinia at quis risus sed vulputate.",
                                url: "#",
                            },
                            {
                                id: "5be13fa0-0e42-47f1-8d7b-e24c24f78972",
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
                        id: "c3ed8428-cf45-4f9d-86d1-391bd9e9ad80",
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                id: "ce8185af-104d-4d9c-910b-8b96bcd6cf26",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "e3af13d9-da0e-4068-9e92-ca09bb0d9eea",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "2c4f8f8c-cbe4-4a3f-9306-5142eea5a43d",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "de921ec9-3c73-4008-a124-d30477ffc0b7",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
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
                        id: "9ecce31e-6d76-44c4-a518-b881b6877724",
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
                                id: "048f3e7e-882e-474b-a0eb-8cc82d599336",
                                content: "Eget felis eget nunc lobortis mattis aliquam faucibus purus in.",
                            },
                            {
                                id: "f736ae42-3fe7-4fab-85dc-2922e272f2b5",
                                content: "Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus.",
                            },
                            {
                                id: "54266d53-a192-4922-936f-144431407990",
                                content: "Eu volutpat odio facilisis mauris sit amet massa.",
                            },
                            {
                                id: "268294f4-0cec-4074-9cc4-07a93fbe8b66",
                                content: "Vitae tortor condimentum lacinia quis vel eros donec ac.",
                            },
                        ],
                    },
                    {
                        id: "f80bc40c-0c9c-4567-8b79-fd29ef77659b",
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
                                id: "9ef95ded-e833-44ee-8cb4-6538078e97d4",
                                content: "Enim facilisis gravida neque convallis a.",
                            },
                            {
                                id: "915b97eb-9f89-4f5a-aeee-32a17b6f45da",
                                content: "Ridiculus mus mauris vitae ultricies leo integer malesuada.",
                            },
                            {
                                id: "2f17a946-0402-4d3b-bce7-e8fdaedc7fbe",
                                content: "Elementum nisi quis eleifend quam. Sed elementum tempus egestas sed sed.",
                            },
                            {
                                id: "733ff090-3c8c-47fb-895e-f5d63e9d0f3a",
                                content: "Ut tellus elementum sagittis vitae et leo duis ut diam. Ultrices gravida dictum fusce ut placerat orci nulla pellentesque dignissim.",
                            },
                        ],
                    },
                    {
                        id: "1bb6984e-a18f-47b7-9bbb-6888b74b58da",
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
                                id: "8ff75479-7c53-4fb2-a720-475a1974f64f",
                                content: "Metus dictum at tempor commodo ullamcorper a lacus vestibulum.",
                            },
                            {
                                id: "92c8590a-8431-4007-9a35-518f9a3b0095",
                                content: "In nisl nisi scelerisque eu ultrices. In fermentum et sollicitudin ac orci phasellus egestas.",
                            },
                            {
                                id: "5d805677-408b-4317-a93b-8a0de95b313a",
                                content: "Ut aliquam purus sit amet luctus venenatis lectus magna fringilla.",
                            },
                            {
                                id: "b51989a3-ffbe-40b4-9cfb-e52db8c1e48c",
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
                        id: "d55b5489-7ed3-4215-9e45-ef5ae8072210",
                        class: "columns-3-balanced",
                        header: "Global Warming",
                        type: "articles-list",
                        content: [
                            {
                                id: "d2cc2f04-fc60-4314-b1bd-aacee5b80eed",
                                title: "Dis parturient montes nascetur ridiculus mus mauris vitae.",
                                content:
                                    "Justo donec enim diam vulputate ut pharetra sit amet aliquam. Curabitur vitae nunc sed velit dignissim sodales. Varius vel pharetra vel turpis nunc eget lorem. Sed viverra ipsum nunc aliquet bibendum. Ultrices in iaculis nunc sed augue.",
                            },
                            {
                                id: "fe657d1b-916c-4f59-b6f9-54d21ba90f07",
                                title: "Vitae turpis massa sed elementum tempus egestas sed sed risus.",
                                content:
                                    "Nascetur ridiculus mus mauris vitae ultricies leo integer. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Gravida arcu ac tortor dignissim convallis aenean. Urna duis convallis convallis tellus id interdum.",
                            },
                            {
                                id: "48fa5839-11d9-4721-a8e2-f734734904a2",
                                title: "Rutrum tellus pellentesque eu tincidunt tortor. Volutpat sed cras ornare arcu.",
                                content:
                                    "estibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt. Urna porttitor rhoncus dolor purus. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Ultrices in iaculis nunc sed augue lacus. Nunc pulvinar sapien et ligula ullamcorper.",
                            },
                        ],
                    },
                    {
                        id: "dcb3d636-542f-49ea-aaa0-e829fc87ab3d",
                        class: "columns-3-balanced",
                        header: "Recycling",
                        type: "articles-list",
                        content: [
                            {
                                id: "bd091840-fde1-44f6-8830-9b165cfa0b66",
                                title: "Tellus id interdum velit laoreet id donec ultrices tincidunt arcu.",
                                content:
                                    "Eget est lorem ipsum dolor sit amet. Faucibus scelerisque eleifend donec pretium vulputate sapien. Quam adipiscing vitae proin sagittis. Quisque id diam vel quam elementum pulvinar etiam non. Laoreet non curabitur gravida arcu ac tortor dignissim convallis aenean.",
                            },
                            {
                                id: "7d052a73-7477-41d4-9b46-82f33e09fb2f",
                                title: "Scelerisque viverra mauris in aliquam sem fringilla ut.",
                                content: "Amet mauris commodo quis imperdiet. Eu consequat ac felis donec et odio pellentesque. Hendrerit gravida rutrum quisque non tellus orci ac. Amet cursus sit amet dictum.",
                            },
                            {
                                id: "1d6f6db3-f9d9-4fc2-ad08-0edcf39d5fd3",
                                title: "Vulputate eu scelerisque felis imperdiet. Non quam lacus suspendisse faucibus interdum posuere.",
                                content:
                                    "Luctus venenatis lectus magna fringilla urna porttitor. Hac habitasse platea dictumst vestibulum rhoncus. Orci a scelerisque purus semper eget duis at tellus. Risus nec feugiat in fermentum posuere urna nec tincidunt praesent.",
                            },
                        ],
                    },
                    {
                        id: "500a214a-8186-49bf-96f0-38e42014460b",
                        class: "columns-3-balanced",
                        header: "New researches",
                        type: "articles-list",
                        content: [
                            {
                                id: "23fe0c63-75fb-498d-a7f2-4e91b29530b7",
                                title: "Non quam lacus suspendisse faucibus.",
                                content:
                                    "Nisi quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus. Odio euismod lacinia at quis. Molestie a iaculis at erat. Id cursus metus aliquam eleifend mi in nulla posuere sollicitudin. Donec ac odio tempor orci dapibus.",
                            },
                            {
                                id: "c14a8fd5-1a01-4e2e-8ca3-2b3f951dd211",
                                title: "Sit amet consectetur adipiscing elit. Lorem sed risus ultricies tristique nulla aliquet.",
                                content:
                                    "Neque aliquam vestibulum morbi blandit cursus risus at. Habitant morbi tristique senectus et netus et. Quis blandit turpis cursus in. Adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus urna. Vel risus commodo viverra maecenas. Tortor dignissim convallis aenean et tortor at.",
                            },
                            {
                                id: "f8abd77a-596c-4df7-9fa9-38d08f8b6516",
                                title: "Ullamcorper sit amet risus nullam eget.",
                                content:
                                    "urpis nunc eget lorem dolor sed viverra ipsum nunc aliquet. Mollis aliquam ut porttitor leo a diam. Posuere morbi leo urna molestie. Suscipit tellus mauris a diam maecenas sed. Ultrices dui sapien eget mi proin sed libero enim sed.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-opinion-underscored",
                name: "Underscored",
                articles: [
                    {
                        id: "8096212a-bfab-494b-b4d9-a04c2bd80b17",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "05d58548-eec8-4806-8935-a50a72d863cb",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Faucibus interdum posuere lorem ipsum. Aliquam nulla facilisi cras fermentum odio. Odio facilisis mauris sit amet massa vitae. Et tortor at risus viverra adipiscing. Luctus accumsan tortor posuere ac ut consequat semper viverra nam.",
                                url: "#",
                            },
                            {
                                id: "d825b148-633e-46f6-9f25-5d2b1b42d926",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Montes nascetur ridiculus mus mauris vitae. Amet porttitor eget dolor morbi non arcu risus quis varius. Rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar. A lacus vestibulum sed arcu non odio euismod lacinia.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "8945566e-82d2-419c-8ec5-750294e2aaf4",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "35ef50c4-f574-484f-bf93-0f9eb004b18b",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Volutpat consequat mauris nunc congue. Arcu dui vivamus arcu felis bibendum ut tristique. Fringilla ut morbi tincidunt augue. Libero enim sed faucibus turpis in eu mi bibendum. Posuere ac ut consequat semper viverra.",
                                url: "#",
                            },
                            {
                                id: "3d2cb1ef-f74b-4eac-b237-c9ac0a0e94d4",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Nec nam aliquam sem et. Maecenas ultricies mi eget mauris pharetra. Nibh nisl condimentum id venenatis a condimentum vitae sapien. Tellus pellentesque eu tincidunt tortor aliquam nulla facilisi cras fermentum.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-opinon-what-matters-most",
                name: "What matters most",
                articles: [
                    {
                        id: "2fe9dc69-e459-46d6-8b9b-8bce7c60f694",
                        class: "columns-wrap",
                        header: "Discussion",
                        type: "excerpt",
                        content: [
                            {
                                id: "e015fd9b-c112-4aec-895b-463080039812",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nibh sed pulvinar proin gravida hendrerit lectus. Habitasse platea dictumst quisque sagittis purus sit amet. Mi sit amet mauris commodo quis.",
                            },
                            {
                                id: "e3910d58-0e1f-4ee1-872b-8bd39ec70833",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nascetur ridiculus mus mauris vitae ultricies leo integer malesuada. Arcu non odio euismod lacinia. Ac turpis egestas sed tempus urna.",
                            },
                            {
                                id: "89525746-2a5c-426b-950f-8b8e7a0e77eb",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Lectus sit amet est placerat in. Auctor augue mauris augue neque gravida in fermentum. Duis convallis convallis tellus id interdum.",
                            },
                        ],
                    },
                    {
                        id: "fa068dc1-0a5c-459a-9e38-7fb8cd9d5fa5",
                        class: "columns-wrap",
                        header: "Is it worth it?",
                        type: "excerpt",
                        content: [
                            {
                                id: "91eb5eba-6ce6-4376-b8a9-874a8e759285",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Venenatis tellus in metus vulputate eu scelerisque felis. Orci phasellus egestas tellus rutrum tellus pellentesque eu. Id leo in vitae turpis massa sed elementum.",
                            },
                            {
                                id: "daedcebf-d529-4dc6-9215-ca7b83bc288f",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Feugiat vivamus at augue eget arcu dictum varius duis at. Ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget.",
                            },
                            {
                                id: "1bd419c1-0664-4b54-963b-fda397fecbf0",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Eget sit amet tellus cras adipiscing enim eu. Dictum at tempor commodo ullamcorper a lacus. Lectus proin nibh nisl condimentum id venenatis a condimentum vitae.",
                            },
                        ],
                    },
                    {
                        id: "31082ef2-8a41-4ea5-9c40-3d87ff73ad5f",
                        class: "columns-wrap",
                        header: "Just do it",
                        type: "excerpt",
                        content: [
                            {
                                id: "90217b1a-7e75-4b34-aed5-6be1b2b8c016",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Mattis rhoncus urna neque viverra. Hendrerit gravida rutrum quisque non tellus orci ac. Ut venenatis tellus in metus.",
                            },
                            {
                                id: "61b9356e-2ea7-4770-81b5-a6af21721fec",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Enim ut tellus elementum sagittis vitae et leo duis. Dictumst quisque sagittis purus sit amet volutpat consequat.",
                            },
                            {
                                id: "401e246d-ffda-4c74-897f-1889de7ffeb1",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "urus ut faucibus pulvinar elementum integer enim neque. Commodo sed egestas egestas fringilla phasellus faucibus scelerisque.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-opinion-hot-topics",
                name: "Hot Topics",
                articles: [
                    {
                        id: "20b1f11f-8da5-4614-82b9-80c15aed568c",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "106eea44-16f1-403d-b075-4baa5e5998e0",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Feugiat in ante metus dictum at tempor. Faucibus scelerisque eleifend donec pretium. Turpis egestas integer eget aliquet nibh praesent. In metus vulputate eu scelerisque felis imperdiet. Diam maecenas sed enim ut sem. Quis imperdiet massa tincidunt nunc pulvinar sapien et.",
                                url: "#",
                            },
                            {
                                id: "952c96cc-a882-4100-b9c5-21572c70abef",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Massa eget egestas purus viverra accumsan in nisl nisi. Sodales ut eu sem integer. Ac tortor dignissim convallis aenean et tortor. Erat velit scelerisque in dictum non consectetur. Id venenatis a condimentum vitae sapien pellentesque habitant.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "662f09bf-45ab-445f-a096-cede68c5dab8",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "406e421a-7044-4256-964b-9decfcf6958d",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Nisl rhoncus mattis rhoncus urna. Ligula ullamcorper malesuada proin libero nunc consequat interdum. Nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Pellentesque nec nam aliquam sem et tortor consequat. Consequat interdum varius sit amet mattis. Diam sit amet nisl suscipit adipiscing bibendum est ultricies.",
                                url: "#",
                            },
                            {
                                id: "f16fc9bc-ac9e-492b-b9fa-9512181bd45e",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Non enim praesent elementum facilisis leo vel fringilla est ullamcorper. Nulla aliquet enim tortor at auctor urna. In arcu cursus euismod quis viverra nibh cras pulvinar mattis.",
                                url: "#",
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
                        id: "c7f1b2e8-3e7e-4cea-b8fd-97da6aaa217a",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "1f2b0751-1d26-420c-a4ab-dfe8189afa55",
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
                        id: "f047187b-7651-45f5-8e13-362d82b59e91",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "61856b32-0a27-4767-a624-9292b797d463",
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
                        id: "fc748387-cfdb-4659-bf00-14984869c3f4",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "64853755-7212-46ff-b036-eb078a15e975",
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
                        id: "ad88b542-6ac0-4525-b6be-581cb2b67762",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "809a6cab-ccb0-4270-9555-948eff9e7291",
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
                        id: "b5d84dfb-d80f-4ba1-ab4e-c33e255b3157",
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
                                id: "ee44b675-85c6-4aa7-9ce5-5b37311297bb",
                                content: "Eu turpis egestas pretium aenean pharetra. Nisl condimentum id venenatis a condimentum vitae sapien pellentesque habitant.",
                            },
                            {
                                id: "a40135ff-bc16-4a53-b6b1-d25835703af4",
                                content: "Bibendum arcu vitae elementum curabitur vitae nunc sed velit dignissim.",
                            },
                            {
                                id: "d143d9d9-7c3f-4b36-ad47-f591783f1595",
                                content: "Eu non diam phasellus vestibulum lorem. Fermentum dui faucibus in ornare quam viverra orci sagittis.",
                            },
                            {
                                id: "e89bebb4-484b-45f2-a87b-409a941436da",
                                content: "Et malesuada fames ac turpis. Ornare massa eget egestas purus viverra accumsan.",
                            },
                        ],
                    },
                    {
                        id: "a1822776-68b2-4d24-95e2-917756de0c12",
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
                                id: "d71c34e3-6c8e-4097-92a4-efd8042a192e",
                                content: "Metus vulputate eu scelerisque felis.",
                            },
                            {
                                id: "e0ab9000-9eea-4f64-b6d2-9f5e1250c0f9",
                                content: "Aliquam sem et tortor consequat id. Feugiat nibh sed pulvinar proin.",
                            },
                            {
                                id: "66f25618-e649-4814-a546-6edcc036dcfe",
                                content: "Quisque non tellus orci ac auctor augue.",
                            },
                            {
                                id: "7b68e99a-151f-4452-99c9-49be9b399c2a",
                                content: "Sed risus pretium quam vulputate dignissim. Vitae tortor condimentum lacinia quis vel eros.",
                            },
                        ],
                    },
                    {
                        id: "0a522480-9f37-43e3-bbf2-c5398450a921",
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
                                id: "1cb48e86-99fd-44f8-9ce6-016778eb35d2",
                                content: "Odio euismod lacinia at quis risus sed vulputate odio. Ullamcorper eget nulla facilisi etiam.",
                            },
                            {
                                id: "fa57210c-bd31-4f4a-a601-9f3546196b4f",
                                content: "Ipsum consequat nisl vel pretium. Nisi vitae suscipit tellus mauris a diam.",
                            },
                            {
                                id: "e6e75564-56e0-4f87-9169-89f2820f7221",
                                content: "Laoreet id donec ultrices tincidunt arcu non sodales neque sodales.",
                            },
                            {
                                id: "243d7680-08ba-41d8-bff5-b544667064e5",
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
                        id: "db2abfd6-b4d4-4237-850a-7f34de938739",
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
                                id: "92f15b5f-f191-4636-b197-b65b2fead08f",
                                content: "Pharetra vel turpis nunc eget. Eu feugiat pretium nibh ipsum consequat.",
                            },
                            {
                                id: "fe2aad93-2770-4068-aec3-ed5d630e47ec",
                                content: "Velit dignissim sodales ut eu sem. Viverra accumsan in nisl nisi scelerisque eu ultrices.",
                            },
                            {
                                id: "0f098b80-ec85-4de3-b0d4-4288947febaa",
                                content: "Arcu dictum varius duis at consectetur lorem donec massa sapien.",
                            },
                        ],
                    },
                    {
                        id: "8cfeff8c-94cb-4eca-b5e2-b4214b761705",
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
                        id: "ae3f3c45-b7fe-4729-8374-f3ba8d11eeff",
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
                                id: "31fa8504-b3e7-4f33-bce6-d5e63c0e5c36",
                                content: "Semper eget duis at tellus at urna condimentum.",
                                url: "#",
                            },
                            {
                                id: "c86d479a-2603-4b7e-9f8e-c6c2482f1600",
                                content: "Aliquet lectus proin nibh nisl condimentum id. Velit scelerisque in dictum non.",
                                url: "#",
                            },
                            {
                                id: "3793f895-bcf1-4213-91a9-8efb79395dbc",
                                content: "Nulla posuere sollicitudin aliquam ultrices sagittis orci.",
                                url: "#",
                            },
                            {
                                id: "8da08881-849b-4a8c-8890-89c56028c6cd",
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
                        id: "2afaf4ee-4d1c-4f54-a970-bc8222cc3090",
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
                            tag: {
                                type: "breaking",
                                label: "breaking",
                            },
                        },
                        title: "Nisi est sit amet facilisis magna etiam tempor. Cursus eget nunc scelerisque viverra mauris in aliquam sem fringilla.",
                        type: "text",
                        content:
                            "Ut eu sem integer vitae justo eget. Ut aliquam purus sit amet luctus. Sit amet mauris commodo quis imperdiet massa tincidunt. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam nulla facilisi. Turpis nunc eget lorem dolor sed. Ultrices in iaculis nunc sed augue lacus. Quam elementum pulvinar etiam non. Urna cursus eget nunc scelerisque. Nisl purus in mollis nunc sed.",
                    },
                    {
                        id: "7213a42c-c2eb-486a-bb2e-b59f6667fb4a",
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
                        id: "9323f56f-d3b3-4b86-bd4c-014392b62272",
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
                        id: "c1f811ca-284b-4e7b-9bfb-bb5a7c72211d",
                        class: "columns-1",
                        type: "grid",
                        content: [
                            {
                                id: "f0e9befa-3d54-4a26-8267-0e38bb0eaa49",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "e301a866-edd4-47a4-a4a6-ce4035c2ab74",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "329f6075-3a95-4a20-b3e1-ade5734544b4",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
                                },
                            },
                            {
                                id: "50b6d145-34da-4a7a-8f3f-bb1674a7692b",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "watch",
                                        label: "watch",
                                    },
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
                        id: "c2dc8f88-8a0a-4a3f-aadd-a5f83e291081",
                        class: "columns-1",
                        type: "grid",
                        display: "grid-wrap",
                        content: [
                            {
                                id: "994fb978-2024-4c58-a1e8-f19e8493c703",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Orci phasellus egestas tellus rutrum tellus pellentesque eu. Pulvinar neque laoreet suspendisse interdum consectetur. Viverra maecenas accumsan lacus vel facilisis volutpat. Nibh ipsum consequat nisl vel pretium lectus quam id. Leo integer malesuada nunc vel risus commodo viverra.",
                                url: "#",
                            },
                            {
                                id: "4c2254af-2e9a-4249-a467-112211c41698",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Proin libero nunc consequat interdum varius sit amet. Convallis posuere morbi leo urna molestie at. Consectetur lorem donec massa sapien faucibus et molestie ac feugiat. Egestas diam in arcu cursus euismod quis viverra nibh.",
                                url: "#",
                            },
                            {
                                id: "a49d65ba-d42c-4b35-8926-479a8988d232",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Elit sed vulputate mi sit. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Magna eget est lorem ipsum dolor sit amet consectetur. In tellus integer feugiat scelerisque varius morbi enim nunc faucibus. Nam libero justo laoreet sit.",
                                url: "#",
                            },
                            {
                                id: "c6f55f29-6b48-433d-85d1-0c952a01fa00",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Nam aliquam sem et tortor consequat. Non sodales neque sodales ut etiam sit amet nisl purus. Viverra mauris in aliquam sem. Leo vel fringilla est ullamcorper. Tellus at urna condimentum mattis pellentesque id nibh tortor. Lacus laoreet non curabitur gravida. Ut morbi tincidunt augue interdum velit euismod in pellentesque.",
                                url: "#",
                            },
                            {
                                id: "720a4102-5a8f-4825-ae68-e1d21a69d71a",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Egestas integer eget aliquet nibh praesent tristique magna sit. Id consectetur purus ut faucibus. Molestie a iaculis at erat pellentesque adipiscing commodo elit at. Nulla facilisi etiam dignissim diam quis enim lobortis scelerisque. Lectus proin nibh nisl condimentum id. Ornare quam viverra orci sagittis eu volutpat odio facilisis mauris.",
                                url: "#",
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
                        id: "4e6716eb-0430-49b0-9d95-352333d760a0",
                        class: "columns-wrap",
                        header: "Burn your calories",
                        type: "excerpt",
                        content: [
                            {
                                id: "930209e6-9f95-49c2-b5e7-1b4b8024fc8b",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Dictumst quisque sagittis purus sit amet volutpat consequat. At imperdiet dui accumsan sit amet nulla facilisi. Felis bibendum ut tristique et egestas. Mus mauris vitae ultricies leo integer malesuada. Adipiscing at in tellus integer feugiat.",
                            },
                            {
                                id: "85789d48-e369-43a0-998c-5cc9af9256eb",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Morbi non arcu risus quis varius quam quisque id. Enim nulla aliquet porttitor lacus luctus. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper. Tempor id eu nisl nunc mi ipsum faucibus vitae aliquet. Consequat semper viverra nam libero justo laoreet sit.",
                            },
                            {
                                id: "a8c8607f-8178-4b37-954a-d1578ae6624a",
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
                        id: "056698a8-0ac8-4342-9e67-25993d574866",
                        class: "columns-wrap",
                        header: "Gym favorites",
                        type: "excerpt",
                        content: [
                            {
                                id: "a43f2dd1-ac0d-4ba1-81ef-3fcaf359b5fc",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nulla facilisi nullam vehicula ipsum a arcu cursus. Et ultrices neque ornare aenean euismod elementum nisi quis. Velit euismod in pellentesque massa. In fermentum posuere urna nec tincidunt praesent semper.",
                            },
                            {
                                id: "67b4bee9-5248-45b5-98ed-aeadc2a33466",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Sit amet consectetur adipiscing elit duis tristique sollicitudin. Ante metus dictum at tempor commodo ullamcorper. Tincidunt eget nullam non nisi est sit. Platea dictumst quisque sagittis purus sit amet volutpat consequat.",
                            },
                            {
                                id: "e182116f-dff8-4fcf-acb8-b7743e2cbdd2",
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
                        id: "389c5495-b37c-423f-8950-a1845317e41c",
                        class: "columns-wrap",
                        header: "Pilates",
                        type: "excerpt",
                        content: [
                            {
                                id: "7bd49e3d-06fc-4195-99bc-3f604de242b3",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Massa massa ultricies mi quis hendrerit dolor magna. Cursus vitae congue mauris rhoncus aenean vel elit scelerisque. Vestibulum lorem sed risus ultricies tristique. Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate.",
                            },
                            {
                                id: "f41e3b74-a33d-4169-b604-099da64e24fb",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Massa enim nec dui nunc mattis enim ut tellus elementum. Eros in cursus turpis massa tincidunt dui. Sit amet consectetur adipiscing elit ut aliquam purus sit amet. Eget nullam non nisi est sit amet facilisis magna.",
                            },
                            {
                                id: "5bc866c7-7d7e-44ef-bc98-4c68739be329",
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
                id: "content-health-guides",
                name: "Guides",
                articles: [
                    {
                        id: "9a1282a2-e227-4d96-8f3e-99c580f2939a",
                        class: "columns-3-balanced",
                        header: "Health after 50",
                        type: "articles-list",
                        content: [
                            {
                                id: "efcabc5f-f52d-47c4-9f94-8bd780882b7a",
                                title: "Ac ut consequat semper viverra nam libero justo.",
                                content:
                                    "A lacus vestibulum sed arcu non odio euismod lacinia at. Viverra mauris in aliquam sem fringilla ut morbi tincidunt augue. Enim nec dui nunc mattis enim ut tellus. Congue eu consequat ac felis donec et odio. Vitae sapien pellentesque habitant morbi tristique senectus.",
                            },
                            {
                                id: "2a62c03f-5073-424f-aab5-c0b7e25ae988",
                                title: "Sit amet porttitor eget dolor morbi non arcu risus quis.",
                                content:
                                    "Gravida in fermentum et sollicitudin. Diam sollicitudin tempor id eu nisl. Proin libero nunc consequat interdum varius sit amet. Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Lacinia quis vel eros donec ac.",
                            },
                            {
                                id: "c8886351-2d3f-422c-a24e-85a3ac682673",
                                title: "Faucibus nisl tincidunt eget nullam non nisi.",
                                content:
                                    "Diam ut venenatis tellus in metus. Luctus accumsan tortor posuere ac. Eget aliquet nibh praesent tristique magna. Diam donec adipiscing tristique risus nec feugiat in fermentum posuere. Dolor morbi non arcu risus quis varius quam quisque.",
                            },
                        ],
                    },
                    {
                        id: "7b268ec3-8ac2-42fc-ab0f-ac650d2493f1",
                        class: "columns-3-balanced",
                        header: "Healthy Heart",
                        type: "articles-list",
                        content: [
                            {
                                id: "ee5dd7b7-30a1-48a9-92c4-9f605ec1d156",
                                title: "Gravida cum sociis natoque penatibus et magnis dis parturient montes.",
                                content:
                                    "Nulla porttitor massa id neque aliquam vestibulum morbi. Nullam non nisi est sit amet facilisis. Vitae turpis massa sed elementum tempus. Varius duis at consectetur lorem. Consequat semper viverra nam libero justo laoreet sit.",
                            },
                            {
                                id: "74b09799-d0be-4e52-9bb9-748cde4af833",
                                title: "Non nisi est sit amet facilisis magna etiam tempor orci.",
                                content:
                                    "At augue eget arcu dictum varius duis at. Arcu felis bibendum ut tristique et egestas. Elementum tempus egestas sed sed risus pretium quam vulputate. Cursus euismod quis viverra nibh cras pulvinar. Praesent tristique magna sit amet purus gravida quis.",
                            },
                            {
                                id: "9e31db8f-9fba-4a1f-99f8-101e357802b4",
                                title: "Sit amet justo donec enim diam vulputate ut pharetra.",
                                content:
                                    "Nulla at volutpat diam ut venenatis tellus. Pulvinar mattis nunc sed blandit libero volutpat. Sit amet justo donec enim diam vulputate. Condimentum id venenatis a condimentum vitae sapien pellentesque habitant.",
                            },
                        ],
                    },
                    {
                        id: "f3907983-9885-4211-8878-0f85750bbaa7",
                        class: "columns-3-balanced",
                        header: "Healthy Digestive",
                        type: "articles-list",
                        content: [
                            {
                                id: "d70c020f-dec2-4903-bba0-3b20bed16068",
                                title: "Metus aliquam eleifend mi in nulla posuere sollicitudin.",
                                content:
                                    "Sodales ut etiam sit amet nisl purus in. Lorem ipsum dolor sit amet consectetur. Tincidunt ornare massa eget egestas purus viverra accumsan in. Orci eu lobortis elementum nibh tellus molestie nunc non. Ut faucibus pulvinar elementum integer enim neque.",
                            },
                            {
                                id: "b80ef050-df82-4ecb-ab98-d5311cae7a2a",
                                title: "Placerat duis ultricies lacus sed. Donec enim diam vulputate ut.",
                                content:
                                    "Condimentum id venenatis a condimentum vitae sapien. Eu ultrices vitae auctor eu augue ut lectus. Fermentum iaculis eu non diam phasellus. Urna nunc id cursus metus aliquam eleifend mi. Venenatis cras sed felis eget velit aliquet sagittis.",
                            },
                            {
                                id: "bde5fc93-1779-4cf8-9d54-6ee9abfeb3c4",
                                title: "Rhoncus dolor purus non enim praesent elementum facilisis.",
                                content:
                                    "Nunc consequat interdum varius sit. Non diam phasellus vestibulum lorem sed risus ultricies. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Eget egestas purus viverra accumsan in nisl nisi scelerisque.",
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
                        id: "851b619c-0d4b-478a-8991-d39394660b96",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "fcf0478b-f9e9-4e2c-abbf-0d02de98e891",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Lectus arcu bibendum at varius. Sed id semper risus in hendrerit gravida rutrum. Bibendum ut tristique et egestas quis ipsum suspendisse ultrices gravida. Euismod nisi porta lorem mollis. At varius vel pharetra vel turpis.",
                                url: "#",
                            },
                            {
                                id: "ae54f79f-a7d7-4887-99eb-0e52720a5529",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Lacus sed turpis tincidunt id. Eget nunc scelerisque viverra mauris in aliquam sem fringilla ut. Dapibus ultrices in iaculis nunc sed.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "1080c9e5-4d40-4b28-9398-c03c9f94c74e",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "4bfb8bd6-9380-454d-9eae-17b6e6d311c8",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Tempus iaculis urna id volutpat lacus laoreet non. Elementum nisi quis eleifend quam adipiscing vitae proin. Vel pretium lectus quam id leo. Eget sit amet tellus cras adipiscing enim eu turpis.",
                                url: "#",
                            },
                            {
                                id: "53270566-3767-47b9-8a1e-da8ccef49491",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Adipiscing vitae proin sagittis nisl rhoncus. Euismod in pellentesque massa placerat duis. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin. Quam nulla porttitor massa id neque.",
                                url: "#",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-health-what-to-eat",
                name: "What to eat",
                articles: [
                    {
                        id: "8ed51654-db6a-4826-bd1c-25213bc4200b",
                        class: "columns-wrap",
                        header: "Low carbs",
                        type: "excerpt",
                        content: [
                            {
                                id: "342206b9-9843-477a-b4d0-48cd160b56b2",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Nec feugiat in fermentum posuere urna. Odio ut sem nulla pharetra. Est ultricies integer quis auctor elit sed. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget.",
                            },
                            {
                                id: "61be9558-b680-4a9c-b9fe-f17a3f58ff53",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Egestas sed tempus urna et. Lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant.",
                            },
                            {
                                id: "91414131-2202-462c-84b3-cbf6bf66fb34",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Sapien pellentesque habitant morbi tristique senectus et netus et malesuada. Dictum non consectetur a erat. Duis ut diam quam nulla porttitor.",
                            },
                        ],
                    },
                    {
                        id: "692a6213-1024-4d3e-8e6d-34aed2bb3616",
                        class: "columns-wrap",
                        header: "Vegetarian",
                        type: "excerpt",
                        content: [
                            {
                                id: "67db8a8e-9a39-4e2e-ba5a-7d57b0337fb0",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Sed viverra tellus in hac habitasse platea dictumst vestibulum. Nisi est sit amet facilisis magna etiam.",
                            },
                            {
                                id: "f045c26c-eaf6-4192-b022-f4c00014caa8",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Convallis a cras semper auctor neque vitae tempus. Cursus risus at ultrices mi tempus imperdiet nulla.",
                            },
                            {
                                id: "02cbeb30-a5f2-4465-9a85-ae00007fd71a",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Ut faucibus pulvinar elementum integer enim neque volutpat. Netus et malesuada fames ac turpis egestas sed tempus urna.",
                            },
                        ],
                    },
                    {
                        id: "f264a46c-4e7e-4c9f-bf04-d4ed1fa6639a",
                        class: "columns-wrap",
                        header: "Breakfast",
                        type: "excerpt",
                        content: [
                            {
                                id: "719bbe3e-7a4b-4084-9bdd-8597a64d2c1c",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Eget mauris pharetra et ultrices. In ante metus dictum at tempor commodo ullamcorper a. Ut sem nulla pharetra diam sit.",
                            },
                            {
                                id: "05d98dcf-d7e5-4819-b22d-8a289eec2b61",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Lacus sed turpis tincidunt id aliquet risus. Nulla facilisi etiam dignissim diam quis enim. Non curabitur gravida arcu ac tortor dignissim convallis aenean.",
                            },
                            {
                                id: "55d1073a-c733-4ca4-9ff1-e9ab2266ec84",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                text: "Aliquam etiam erat velit scelerisque in dictum non. Pretium fusce id velit ut tortor pretium viverra.",
                            },
                        ],
                    },
                ],
            },
            {
                id: "content-health-hot-topics",
                name: "Hot Topics",
                articles: [
                    {
                        id: "dde55759-06c6-46bc-9f16-bed37ae3d77f",
                        class: "columns-2-balanced",
                        header: "This First",
                        type: "grid",
                        content: [
                            {
                                id: "5e8ae348-e705-4be4-8e84-f09c3b2196dc",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Augue ut lectus arcu bibendum at varius. Cursus turpis massa tincidunt dui. Feugiat scelerisque varius morbi enim. Vel orci porta non pulvinar. Est velit egestas dui id ornare arcu odio. Amet porttitor eget dolor morbi non arcu risus quis. Turpis in eu mi bibendum neque egestas.",
                                url: "#",
                            },
                            {
                                id: "3ed555d2-4eb9-4263-84f8-8c7f973eae91",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "new",
                                        label: "new",
                                    },
                                },
                                text: "Et pharetra pharetra massa massa. Commodo odio aenean sed adipiscing diam donec adipiscing. In mollis nunc sed id semper risus in hendrerit. A diam sollicitudin tempor id eu nisl nunc. Sit amet consectetur adipiscing elit duis tristique.",
                                url: "#",
                            },
                        ],
                    },
                    {
                        id: "17f26d05-24ef-4a12-80b0-611a43449aae",
                        class: "columns-2-balanced",
                        header: "This Second",
                        type: "grid",
                        content: [
                            {
                                id: "60c6fd49-f5af-4313-af21-a83cea3ce371",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Ac tincidunt vitae semper quis lectus nulla. Porttitor massa id neque aliquam. Sed faucibus turpis in eu mi bibendum neque egestas congue. Tincidunt id aliquet risus feugiat in ante metus. Hendrerit gravida rutrum quisque non tellus orci ac auctor augue. Augue eget arcu dictum varius duis at.",
                                url: "#",
                            },
                            {
                                id: "f4873b14-4600-429e-b239-708aac5872d5",
                                image: {
                                    src: "placeholder_light.jpg",
                                    alt: "Placeholder",
                                    width: "1280",
                                    height: "720",
                                },
                                meta: {
                                    tag: {
                                        type: "breaking",
                                        label: "breaking",
                                    },
                                },
                                text: "Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Ipsum dolor sit amet consectetur. Non diam phasellus vestibulum lorem sed risus. Porttitor lacus luctus accumsan tortor. Morbi enim nunc faucibus a pellentesque sit amet porttitor. Vel turpis nunc eget lorem. Ligula ullamcorper malesuada proin libero.",
                                url: "#",
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
                        id: "cbaac182-d046-43ee-b6d7-41a382e959ad",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "c195937b-25a2-484b-8b0c-febfbae811b2",
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
                        id: "ae883d3e-ef62-4f6e-ac2d-5555ca35f11a",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "c5808643-c726-4249-9b1d-270e18dcc84b",
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
                        id: "d8f20994-0098-4367-bc3a-131faa8f768d",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "c27fac75-6c7c-4c26-9ac4-4f92c54e7308",
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
                        id: "51f4b351-5916-4422-b661-61b65b911ee5",
                        class: "columns-4-balanced",
                        type: "preview",
                        content: [
                            {
                                id: "05b1ce25-c066-4b9e-8a44-7a25dac28759",
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
