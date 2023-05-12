import { content } from "@/data/content";
import { NavLink } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

export default function Sitemap() {
    const keys = Object.keys(content);
    const navItems = keys.reduce(
        (result, key) => {
            // priority 0 does not show up in nav
            /* if (content[key].priority === 0)
                return result; */

            // push all other nav items and dropdown items
            result.push(key);
            return result;
        },
        []
    );

    return (
        <div className="sitemap">
            <ul className="sitemap-list">
                {
                    navItems.map(key => <li className="sitemap-item" key={`sitemap-page-${content[key].name}`}>
                        <NavLink to={content[key].url}><h4 className="sitemap-header">{content[key].name}</h4></NavLink>
                        <ul className="sitemap-sublist">
                            {
                                content[key].sections.map(
                                    section => <li className="sitemap-subitem" key={`sitemap-section${section.id}`}>
                                        <HashLink to={`${content[key].url}#${section.id}`}>{section.name}</HashLink>
                                    </li>
                                )
                            }
                        </ul>
                    </li>)
                }
            </ul>
        </div>
    );
}
