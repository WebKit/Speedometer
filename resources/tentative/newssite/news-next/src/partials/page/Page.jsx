import Layout from "@/partials/layout/layout";
import Section from "../section/section";
import { content } from "@/data/content";

export default function Page({ id }) {
    return (
        <Layout>
            {content[id].sections.map((section) =>
                <Section key={section.id} section={section} />
            )}
        </Layout>
    );
}
