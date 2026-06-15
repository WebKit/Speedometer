/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js}", "!./src/lib/components/chat-window.js", "!./src/lib/components/information-window.js", "!./src/lib/components/restaurant-card.js"],
    theme: {
        extend: {
            screens: {
                "3xl": "1720px",
            },
        },
    },
    plugins: [],
};
