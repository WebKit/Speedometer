/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                canvas: "var(--canvas)",
                surface: "var(--surface)",
                "surface-alt": "var(--surface-alt)",
                primary: "var(--text-primary)",
                secondary: "var(--text-secondary)",
                divider: "var(--divider)",
                hover: "var(--hover)",
                accent: "var(--accent)",
                "accent-soft": "var(--accent-soft)",
                link: "var(--link)",
                glimmer: "var(--glimmer)",
                online: "var(--online)",
                scrim: "var(--scrim)",
                "badge-red": "var(--badge-red)",
                "badge-green": "var(--badge-green)",
                "badge-blue": "var(--badge-blue)",
                "badge-pink": "var(--badge-pink)",
                "badge-purple": "var(--badge-purple)",
                "reaction-like": "var(--reaction-like)",
                "reaction-love": "var(--reaction-love)",
                "reaction-care": "var(--reaction-care)",
                "reaction-warm": "var(--reaction-warm)",
            },
            boxShadow: {
                card: "0 1px 2px var(--shadow)",
                popover: "0 12px 28px 0 var(--shadow-strong), 0 2px 4px 0 var(--shadow)",
                header: "0 1px 2px var(--shadow)",
            },
            fontFamily: {
                sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
            },
        },
    },
    plugins: [],
};
