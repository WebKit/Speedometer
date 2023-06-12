<script lang="js">
import styles from "news-site-css/dist/sitemap.module.css";
import { content } from "../../data/content";

const keys = Object.keys(content);
const navItems = keys.reduce(
    (result, key) => {
        result.push(key);
        return result;
    },
    []
);

export default {
    props: {
        onClick: Function
    },
    data() {
        return {
            styles,
            content,
            navItems
        }
    }
}
</script>

<template>
    <div :class="styles.sitemap">
        <ul :class="styles['sitemap-list']">
            <li v-for="key in navItems" :key="`sitemap-page-${content[key].name}`" :class="styles['sitemap-item']">
                <NuxtLink :to="content[key].url" :active-class="styles['active']">
                    <h4 :class="styles['sitemap-header']">
                        {{ content[key].name }}
                    </h4>
                </NuxtLink>
                <ul :class="styles['sitemap-sublist']">
                    <li v-for="section in content[key].sections" :key="`sitemap-section${section.id}`" :class="styles['sitemap-subitem']">
                        <NuxtLink :to="`${content[key].url}#${section.id}`">
                            {{ section.name }}
                        </NuxtLink>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>
