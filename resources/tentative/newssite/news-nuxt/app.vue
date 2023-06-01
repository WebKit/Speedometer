<script setup>
useHead({
    title: "The Daily Broadcast",
    htmlAttrs: {
        lang: "en",
    },
    meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
            hid: "description",
            name: "description",
            content: "A news site developed with Nuxt.",
        },
    ],
});
</script>

<script>
  // "Fixes" an issue with calling history.replaceState too often in certain browsers during testing.
  // Note: This should NOT be used in a production application.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  history.replaceState = function(state) {
    return null;
  }
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <div id="settings-container" />
  <div id="notifications-container" />
</template>
