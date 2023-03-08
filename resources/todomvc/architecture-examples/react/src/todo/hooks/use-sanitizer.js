export const useSanitizer = () => {
    const sanitize = (string) => {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "/": "&#x2F;",
        };
        const reg = /[&<>"'/]/gi;
        return string.replace(reg, (match) => map[match]);
    };

    return { sanitize };
};
