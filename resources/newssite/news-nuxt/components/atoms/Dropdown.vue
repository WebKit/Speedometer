<script lang="js">
import { more } from "~/data/buttons";
import styles from "news-site-css/dist/dropdown.module.css";
export default {
    props: {
        animatedIconClass: String,
    },
    data() {
        return {
            more,
            styles,
            isOpen: false,
        }
    },
    methods: {
        closeDropdown() {
            this.isOpen = false;
        },
        handleChange(e) {
            this.isOpen = e.target.checked;
        }
    }
}
</script>

<template>
    <div :class="styles.dropdown">
        <input id="navbar-dropdown-toggle" type="checkbox" :class="styles['dropdown-toggle']" :checked="isOpen" @change="handleChange" />
        <label for="navbar-dropdown-toggle" :class="styles['dropdown-label']">
            <span :class="styles['dropdown-label-text']">{{ more.label }}</span>
            <div :class="['animated-icon', 'arrow-icon', 'arrow', animatedIconClass]">
                <span class="animated-icon-inner" title="Arrow Icon">
                    <span />
                    <span />
                </span>
            </div>
        </label>
        <ul :class="styles['dropdown-content']" @click="closeDropdown">
            <slot />
        </ul>
    </div>
</template>
