import { useCallback, useRef, useEffect } from "preact/hooks";

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

    useEffect(() => {
        if (inputRef.current) {
            const end = inputRef.current.value.length;
            inputRef.current.setSelectionRange(end, end);
            inputRef.current.focus();
        }
    }, [inputRef.current])

    const handleBlur = useCallback(() => {
        if (onBlur)
            onBlur();
    }, [onBlur]);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.keyCode === 13) {
                const value = e.target.value.trim();
                if (!hasValidMin(value, 2))
                    return;

                onSubmit(sanitize(value));
                e.target.value = "";
            }
        },
        [onSubmit]
    );

    return (
        <div class="input-container">
            <input class="new-todo" id="todo-input" type="text" data-testid="text-input" ref={inputRef} placeholder={placeholder} defaultValue={defaultValue} onBlur={handleBlur} onKeyDown={handleKeyDown} />
            <label class="visually-hidden" htmlFor="todo-input">
                {label}
            </label>
        </div>
    );
}
