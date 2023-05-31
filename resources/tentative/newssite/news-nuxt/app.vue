<script setup>
useHead({
  title: "The Daily Broadcast",
  htmlAttrs: {
    lang: "en"
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      hid: 'description',
      name: 'description',
      content: 'A news site developed with Nuxt.'
    }
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <div id="settings-container"></div>
  <div id="notifications-container"></div>
</template>
