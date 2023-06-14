<script>
if (process.client) {
    // "Fixes" an issue with calling history.replaceState too often in certain browsers during testing.
    // Note: This should NOT be used in a production application.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    history.replaceState = function (state) {
        return null;
    };

    // This hack allows to capture the work normally happening in a rAF. We
    // may be able to remove it if the runner improves.
    window.requestAnimationFrame = (cb) => window.setTimeout(cb, 0);
    window.cancelAnimationFrame = window.clearTimeout;
}
</script>

<script setup>
import { nextTick, watch } from "#imports";
import styles from "news-site-css/dist/layout.module.css";
import { content } from "./data/content";

const showMessage = ref(false);
const route = useRoute();

onMounted(() => {
    showMessage.value = content[route.name].message;
});

const closeMessage = () => {
    showMessage.value = false;
};

if (process.client) {
    watch(
        route,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (value) => {
            if (document.getElementById("page")) {
                if (!route.hash) {
                    document.getElementById("page").scrollTo(0, 0);
                } else {
                    const elementId = route.hash.split("#")[1];
                    nextTick(() => {
                        document.getElementById(elementId).scrollIntoView();
                    });
                }
            }
        },
        { deep: true, immediate: true }
    );
}
</script>

<template>
    <div id="page" :class="styles.page">
        <Header />
        <Navigation />
        <Message v-if="content[route.name].message" v-show="showMessage" :on-close="closeMessage" :message="content[route.name].message" />
        <Main>
            <NuxtPage />
        </Main>
        <Footer />
    </div>
</template>
