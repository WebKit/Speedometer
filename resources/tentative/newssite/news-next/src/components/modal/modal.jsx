import classNames from "classnames";

import Form from "../form/form";
import { login } from "@/data/form";

import styles from "news-site-css/dist/modal.module.css";

export default function Modal({ onClose }) {
    function handleSubmit(e) {
        const { elements } = e.target;
        console.log(elements.username.value, elements.password.value);
        onClose();
    }

    return (
        <div id="login" className={classNames( styles.modal, styles.open )}>
            <div className={styles["modal-content"]}>
                <button id="close-modal-link" className={styles["modal-close-button"]} onClick={onClose} title="Close Button">
                    <div className={classNames(
                        styles["modal-close-button-icon"],
                        "animated-icon",
                        "close-icon",
                        "hover"
                    )} title="Close Icon">
                        <span className="animated-icon-inner">
                            <span></span>
                            <span></span>
                        </span>
                    </div>
                </button>
                <header className={styles["modal-header"]}>
                    <h2>{ login.header }</h2>
                </header>
                <section className={styles["modal-body"]}>
                    <Form onCancel={onClose} onSubmit={handleSubmit}/>
                </section>
            </div>
        </div>
    );
}
