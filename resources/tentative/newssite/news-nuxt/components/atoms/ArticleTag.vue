<script lang="js">
import styles from "news-site-css/dist/article.module.css";

export default {
    props: {
        tag: String,
    },
    data() {
        return {
            styles
        }
    }
}
</script>

<template>
    <div v-if="tag" :class="[
        styles['article-image-tag'],
        styles[tag]
    ]">
        <LightningIcon v-if="tag === 'breaking'" />
        <PlayIcon v-if="tag === 'watch'" />
        <FireIcon v-if="tag === 'new'" />
        <ArticleText :text="tag" />
    </div>
</template>
