// Prefixed utilities next to component-scoped styles, the mix the profiled site
// renders (class names like `tw-w-6/12` alongside per-component hashes).
export default {
    prefix: "tw-",
    content: ["./src/**/*.{html,svelte,js}"],
    theme: {
        extend: {
            colors: {
                ink: "#16191f",
                muted: "#5a6270",
                line: "#e2e5ea",
                accent: "#0b7a75",
                up: "#0a8a5f",
                down: "#d1344b",
            },
        },
    },
};
