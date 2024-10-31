import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import Header from "../header/header";
import Navigation from "../navigation/navigation";
import Main from "../main/main";
import Footer from "../footer/footer";
import { Message } from "@/components/message/message";

import { useDataContext } from "@/context/data-context";

import styles from "news-site-css/dist/layout.module.css";

export default function Layout({ children, id }) {
    const [showMessage, setShowMessage] = useState(false);
    const { content, links } = useDataContext();

    useEffect(() => {
        // polyfill
        const requestIdleCallback = window.requestIdleCallback
            = window.requestIdleCallback
            || function (cb) {
                const start = Date.now();
                const timeoutId = window.setTimeout(function () {
                    cb({
                        didTimeout: false,
                        timeRemaining() {
                            return Math.max(0, 50 - (Date.now() - start));
                        }
                    });
                }, 1);

                return timeoutId;
            };

        const url = location.hash;
        requestIdleCallback(() => {
            window.dispatchEvent(new CustomEvent("route-change-complete", { detail: { url } }));
        });
    }, [location.hash]);

    useEffect(() => {
        setShowMessage(content[id].message);
    }, [id]);

    const pageRef = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => {
        pageRef?.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    function closeMessage() {
        setShowMessage(false);
    }

    return (
        <>
            <HashLink to={`${pathname}#content`} className="skip-link">
                {links.a11y.skip.label}
            </HashLink>
            <div className={styles.page} ref={pageRef}>
                <Header />
                <Navigation />
                {showMessage ? <Message message={content[id].message} onClose={closeMessage} /> : null}
                <Main>{children}</Main>
                <Footer />
            </div>
        </>
    );
}
