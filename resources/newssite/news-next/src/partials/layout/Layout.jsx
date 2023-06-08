import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import Header from "../header/header";
import Navigation from "../navigation/navigation";
import Main from "../main/main";
import Footer from "../footer/footer";

import { content } from "@/data/content";
import { Message } from "@/components/message/message";

import styles from "news-site-css/dist/layout.module.css";

export default function Layout({ children, id }) {
    const [showMessage, setShowMessage] = useState(false);

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
                Skip to content
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
