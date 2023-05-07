import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import Header from "../header/Header";
import Navigation from "../navigation/Navigation";
import Main from "../main/Main";
import Footer from "../footer/Footer";

export default function Layout({ children }) {
    const pageRef = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => {
        pageRef?.current?.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });
    }, [pathname]);

    return (
        <>
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
