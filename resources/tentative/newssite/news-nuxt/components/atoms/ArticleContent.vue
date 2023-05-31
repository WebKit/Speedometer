<script lang="js">
import styles from "news-site-css/dist/article.module.css";
import layoutStyles from "news-site-css/dist/layout.module.css";

export default {
    props: {
        type: String,
        content: [String, Array],
        display: String,
    },
    data() {
        return {
            styles,
            layoutStyles
        }
    }
}
</script>

<template>
    <!-- type === text -->
    <div v-if="type === 'text'" :class="styles['article-content']">
        <ArticleText :text="content" />
    </div>

    <!-- type === list -->
    <div v-if="type === 'list'" :class="styles['article-content']">
        <ul :class="[
            styles['article-list'],
            styles.vertical,
            { [styles[display]]: display }
        ]">
            <li v-for="item in content" :class="styles['article-list-item']">
                <a v-if="item.url && !item.title" :href="item.url">
                    <ArticleText :text="item.content" />
                </a>
                <ArticleText v-else :text="item.content" />
            </li>
        </ul>
    </div>

    <!-- type === articles-list -->
    <div v-if="type === 'articles-list'" :class="styles['article-list-content']">
        <ul :class="[
            styles['article-list'],
            styles.vertical
        ]">
            <li v-for="item in content" :class="styles['article-list-item']">
                <ArticleText :textClass="[
                    styles['article-title'],
                    'truncate-multiline',
                    'truncate-multiline-3'
                ]" :text="item.title" type="h3" />
                <a v-if="item.url && !item.title" :href="item.url">
                    <ArticleText :text="item.content" />
                </a>
                <ArticleText v-else :text="item.content" />
            </li>
        </ul>
    </div>

    <!-- type === excerpt -->
    <ul v-if="type === 'excerpt'" :class="[
        styles['article-list'],
        styles.horizontal
    ]">
        <li v-for="item in content" :class="styles['article-list-item']">
            <ArticleImage :imageClass="styles['article-hero']" :image="item.image" />
            <div :class="styles['article-content']">
                <ArticleText :textClass="['truncate-multiline', 'truncate-multiline-3']" :text="item.text" type="div" />
            </div>
        </li>
    </ul>

    <!-- type === grid -->
    <div v-if="type === 'grid'" :class="[
        layoutStyles['grid-container'],
        { [layoutStyles[display]]: display }
    ]">
        <div v-for="item in content" :class="layoutStyles['grid-item']">
            <ArticleImage :imageClass="styles['article-image-container']" :image="item.image" :meta="item.meta" />
            <a v-if="item.url" :href="item.url">
                <ArticleText :textClass="[styles['article-content'], 'truncate-multiline', 'truncate-multiline-3']"
                    :text="item.text" type="h3" />
            </a>
            <ArticleText v-else :textClass="[styles['article-content'], 'truncate-multiline', 'truncate-multiline-3']"
                :text="item.text" type="h3" />
        </div>
    </div>

    <!-- type === preview -->
    <ul v-if="type === 'preview'" :class="[styles['article-list'], styles.vertical]">
        <li v-for="item in content" :class="styles['article-list-item']">
            <ArticleImage :imageClass="styles['article-image-container']" :image="item.image" />
            <ArticleText :textClass="[styles['article-title'], 'truncate-multiline', 'truncate-multiline-3']"
                :text="item.title" type="h3" />
        </li>
    </ul>
</template>
