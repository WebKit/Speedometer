import { useRef, useEffect } from "preact/hooks";

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

const hasValidMin = (value, min) => {
    return value.length >= min;
};

export function Input({ onSubmit, placeholder, label, defaultValue, onBlur }) {
    const inputRef = useRef(null);

    /**
     * UseEffect will set focus on the current input element in the dom.
     * setSelectionRange ensures that the cursor appears after the last character.
     * 
     * Attempting to set the autofocus attribute on the native input element doesn't
     * seem to work when setting focus programmatically.
     */
    useEffect(() => {
        if (inputRef.current) {
            const end = inputRef.current.value.length;
            inputRef.current.setSelectionRange(end, end);
            inputRef.current.focus();
        }
    }, [inputRef.current]);

    const handleBlur = () => {
        if (onBlur) onBlur();
    };

    const handleKeyDown = (e) => {
        if (e.key.match(/Enter/i)) {
            const value = e.target.value.trim();
            if (!hasValidMin(value, 2)) return;

            onSubmit(sanitize(value));
            e.target.value = "";
        }
    };

    return (
        <div class="input-container">
            <input class="new-todo" id="todo-input" type="text" data-testid="text-input" ref={inputRef} placeholder={placeholder} defaultValue={defaultValue} onBlur={handleBlur} onKeyDown={handleKeyDown} />
            <label class="visually-hidden" htmlFor="todo-input">
                {label}
            </label>
        </div>
    );
}
