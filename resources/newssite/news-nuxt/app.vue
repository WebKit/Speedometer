<script src="../../sanitize.js"></script>
<script>
if (process.client) {
    // "Fixes" an issue with calling history.replaceState too often in certain browsers during testing.
    // Note: This should NOT be used in a production application.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    history.replaceState = function (state) {
        return null;
    };
}
</script>

<script setup>
import { provideLocale } from "./composables/provide-locale";
import { scrollOnNavigation } from "./composables/scroll-behavior";

provideLocale();
scrollOnNavigation();
</script>

<template>
    <Layout>
        <NuxtPage />
    </Layout>
</template>
