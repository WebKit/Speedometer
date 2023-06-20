import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import Layout from "@/partials/layout/layout";
import Section from "../section/section";
import Toast from "@/components/toast/toast";

import { content as contentEn } from "@/data/en/content";
import { content as contentJp } from "@/data/jp/content";

export default function Page({ id }) {
    const [showPortal, setShowPortal] = useState(false);

    // language-switch
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    let currentContent = lang === "jp" ? contentJp : contentEn;

    useEffect(() => {
        setShowPortal(currentContent[id].notification);
    }, [id]);

    function closePortal() {
        setShowPortal(false);
    }

    function onAccept() {
        closePortal();
    }

    function onReject() {
        closePortal();
    }

    return (
        <>
            <Layout id={id}>
                {currentContent[id].sections.map((section) =>
                    <Section key={section.id} section={section} />
                )}
            </Layout>
            {showPortal && currentContent[id].notification ? createPortal(<Toast notification={currentContent[id].notification} onAccept={onAccept} onReject={onReject} onClose={onReject} />, document.getElementById("notifications-container")) : null}
        </>
    );
}
