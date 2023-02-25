import { EditorView, basicSetup } from "codemirror";
import { StateEffect } from "@codemirror/state";
// https://codemirror.net/examples/bundle/
import { javascript } from "@codemirror/lang-javascript";

let lang = javascript();
let extensions = [basicSetup, EditorView.lineWrapping];

export default async function (element, value) {
    let view = new EditorView({
        extensions,
        parent: element,
        doc: value,
        wordWrapColumn: 80,
    });

    // First we configured with javascript, then switch back to
    // plaintext.
    // extensions.pop();
    // view.dispatch({
    //   effects: StateEffect.reconfigure.of(extensions),
    // });

    return {
        editor: view,
        ready: Promise.resolve(),
        getScrollHeight() {
            return element.scrollHeight;
        },
        getScrollTop() {
            return element.scrollTop;
        },
        setScrollTop(value) {
            element.scrollTop = value;
        },
        setValue: (value) =>
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: value },
            }),
        format(on) {
            if (on && extensions.length == 2) {
                extensions.push(lang);
            } else if (!on && extensions.length == 3) {
                extensions.pop();
            }
            // https://codemirror.net/examples/config/
            // https://discuss.codemirror.net/t/cm6-dynamically-switching-syntax-theme-w-reconfigure/2858/6
            view.dispatch({
                effects: StateEffect.reconfigure.of(extensions),
            });
        },
    };
}
