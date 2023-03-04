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
    });
})(jQuery);
