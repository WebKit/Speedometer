<script lang="js">
import styles from "news-site-css/dist/navbar.module.css";
import { content } from "../../data/content";

const navItems = [];
const dropdownItems = [];

Object.keys(content).forEach(key => {
    if (content[key].priority === 1)
        navItems.push(key);
    else if (content[key].priority === 2)
        dropdownItems.push(key);
});

export default {
    props: {
        callback: Function,
        id: String,
    },
    data() {
        return {
            styles,
            navItems,
            dropdownItems,
            content
        }
    }
}
</script>

<template>
    <ul :class="styles['navbar-list']">
        <li v-for="key in navItems" :key="key" :class="styles['navbar-item']">
            <NavlistItem :id="`${id}-${key}-link`" :label="content[key].name" :url="content[key].url" :callback="callback" />
        </li>
        <li v-if="dropdownItems.length > 0" :class="styles['navbar-item']">
            <Dropdown :animated-icon-class="styles['navbar-label-icon']">
                <li v-for="key in dropdownItems" :key="key" :class="[styles['navbar-item'], styles['navbar-dropdown-item']]">
                    <NavlistItem :id="`${id}-${key}-link`" :label="content[key].name" :url="content[key].url" :callback="callback" />
                </li>
            </Dropdown>
        </li>
    </ul>
</template>
