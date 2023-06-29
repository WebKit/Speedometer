<script lang="js">
import { inject } from "vue";
import styles from "news-site-css/dist/dialog.module.css";

export default {
    props: {
        onClose: Function
    },
    setup() {
        const { settings } = inject("data");
        return { settings };
    },
    data() {
        return {
            styles,
            isChecked: false,
        }
    },
    mounted() {
        this.isChecked = document.body.classList.contains("reduced-motion");
    },
    methods: {
        handleChange(e) {
            this.isChecked = e.target.checked;

            if (e.target.checked)
                document.body.classList.add("reduced-motion");
            else
                document.body.classList.remove("reduced-motion");
        }
    }
}
</script>

<template>
    <div id="settings" :class="[styles.dialog, styles.open]">
        <button id="close-dialog-link" :class="styles['dialog-close-button']" title="Close Button" @click="onClose">
            <div :class="[styles['dialog-close-button-icon'], 'animated-icon', 'close-icon', 'hover']" title="Close Icon">
                <span class="animated-icon-inner">
                    <span />
                    <span />
                </span>
            </div>
        </button>
        <header :class="styles['dialog-header']">
            <h2>{{ settings.header }}</h2>
        </header>
        <section :class="styles['dialog-body']">
            <div :class="styles['dialog-item']">
                <Toggle :label="settings.items.motion.label" :on-change="handleChange" :checked="isChecked" />
            </div>
        </section>
    </div>
</template>
