import Layout from "@/partials/layout/Layout";
import Section from "../section/Section";
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
