/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */

const App = (function ($) {
    $(function () {
        const store = Store("jquery");
        const model = Model(store);
        const template = Template();
        const view = View(template);
        const controller = Controller(model, view);

        $(window).on("hashchange", function () {
            controller.setView(document.location.hash);
        });

        controller.init();
        controller.setView(document.location.hash);

        /**
         * Speedometer specific:
         * Adding a dom node after todo app is done initializing.
         * Speedometer waits for this dom note to be present in the dom.
         */
        const dummyNodeToNotifyAppIsReady = document.createElement("div");
        dummyNodeToNotifyAppIsReady.id = "appIsReady";
        document.body.appendChild(dummyNodeToNotifyAppIsReady);
    });
})(jQuery);
