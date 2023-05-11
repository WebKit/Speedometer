import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import Header from "../header/header";
import Navigation from "../navigation/navigation";
import Main from "../main/main";
import Footer from "../footer/footer";

export default function Layout({ children }) {
    const pageRef = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => {
        pageRef?.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return (
        <>
            <HashLink to={`${pathname}#content`} className="skip-link">Skip to content</HashLink>
            <div className="page" ref={pageRef}>
                <Header />
                <Navigation />
                <Main>
                    {children}
                </Main>
                <Footer />
            </div>
        </>
    );
}
