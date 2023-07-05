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
            reduceMotion: false,
            highContrast: false,
        }
    },
    mounted() {
        this.reduceMotion = document.documentElement.classList.contains("reduced-motion");
        this.highContrast = document.documentElement.classList.contains("forced-colors");
    },
    methods: {
        toggleMotion(e) {
            this.reduceMotion = e.target.checked;

            if (e.target.checked)
                document.documentElement.classList.add("reduced-motion");
            else
                document.documentElement.classList.remove("reduced-motion");
        },
        toggleContrast(e) {
            this.reduceMotion = e.target.checked;

            if (e.target.checked)
                document.documentElement.classList.add("forced-colors");
            else
                document.documentElement.classList.remove("forced-colors");
        },
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
                <Toggle id="motion" :label="settings.items.motion.label" :on-change="toggleMotion" :checked="reduceMotion" />
            </div>
            <div :class="styles['dialog-item']">
                <Toggle id="contrast" :label="settings.items.contrast.label" :on-change="toggleContrast" :checked="highContrast" />
            </div>
        </section>
    </div>
</template>
