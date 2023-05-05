import Layout from "@/partials/layout/Layout";
import { content } from "@/data/content";

export default function Page({ id }) {
    return (
        <Layout>
            <div className="row-header">
                <h2>{content[id].name}</h2>
            </div>
        </Layout>
    );
}
