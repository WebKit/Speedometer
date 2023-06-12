import classNames from "classnames";

import styles from "news-site-css/dist/input.module.css";

export default function Input({ id = "input", placeholder = "Enter Something", label = "Enter Something", containerClass, type, onChange }) {
    function handleChange(e) {
        onChange?.(e);
    }

    return (
        <div className={classNames(styles["input-container"], containerClass)}>
            <label className={classNames(styles.label, "visually-hidden")} htmlFor={id}>
                {label}
            </label>
            <input className={classNames(styles.input, styles["input-type-text"])} type={type} autoComplete="off" id={id} placeholder={placeholder} onChange={handleChange} />
        </div>
    );
}
