/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint prefer-template: 0 */

function router(onChange) {
    let route = "all";

    function handleChange() {
        switch (window.location.hash) {
            case "#/active":
                route = "active";
                break;
            case "#/completed":
                route = "completed";
                break;
            default:
                route = "all";
        }

        onChange(route);
    }

    function init() {
        window.addEventListener("hashchange", handleChange);
    }

    return {
        init,
    };
}
