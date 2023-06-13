import classNames from "classnames";

import Input from "../input/input";
import { login } from "@/data/form";

import formStyles from "news-site-css/dist/form.module.css";
import buttonStyles from "news-site-css/dist/button.module.css";

export default function Form({ onCancel, onSubmit }) {
    function handleSubmit(e) {
        onSubmit(e);
        e.preventDefault();
    }

    function handleChange(e) {
        console.log(e.target.value);
    }

    return (
        <div className={formStyles["form-container"]}>
            <div className={formStyles["form-content"]}>
                <form id="form" onSubmit={handleSubmit}>
                    <Input id="username" placeholder={login.items.username.placeholder} label={login.items.username.label} type={login.items.username.type} containerClass={formStyles["form-item"]} onChange={handleChange} />
                    <Input id="password" placeholder={login.items.password.placeholder} label={login.items.password.label} type={login.items.password.type} containerClass={formStyles["form-item"]} onChange={handleChange} />
                    <div className={classNames(formStyles["form-actions"], formStyles["form-item"])}>
                        <Input id="submit" placeholder={login.submit.placeholder} label={login.submit.label} type={login.submit.type} containerClass={formStyles["form-actions-item"]} onChange={handleSubmit} />
                        <button id="form-reject-button" className={classNames(buttonStyles.button, buttonStyles["secondary-button"], buttonStyles.dark, formStyles["form-actions-item"])} onClick={onCancel}>
                            {login.cancel.label}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
