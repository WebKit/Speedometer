import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import Layout from "@/partials/layout/layout";
import Section from "../section/section";
import { content } from "@/data/content";
import Toast from "@/components/toast/toast";

export default function Page({ id }) {
    const [showPortal, setShowPortal] = useState(false);

    useEffect(() => {
        setShowPortal(content[id].notification);
    }, [id]);

    function closePortal() {
        setShowPortal(false);
    }

    function onAccept() {
        console.log("accept");
        closePortal();
    }

    function onReject() {
        console.log("reject");
        closePortal();
    }

    return (
        <>
            <Layout>
                {content[id].sections.map((section) =>
                    <Section key={section.id} section={section} />
                )}
            </Layout>
            {showPortal && content[id].notification ? createPortal(
                <Toast notification={content[id].notification} onAccept={onAccept} onReject={onReject} onClose={onReject} />,
                document.getElementById("notifications-container")
            ) : null}
        </>
    );
}
