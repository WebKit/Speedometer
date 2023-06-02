<script setup>
  import { nextTick, watch } from '#imports';
  import styles from "news-site-css/dist/layout.module.css";
  import { content } from "../data/content";

  const showMessage = ref(false);
  const route = useRoute();

  onMounted(() => {
    showMessage.value = content[route.name].message;
  })

  const closeMessage = () => { showMessage.value = false };

  watch(route, value => {
      if (document.getElementById('page')){
        if (!route.hash) {
          document.getElementById('page').scrollTo(0, 0);
        } else {
          const elementId = route.hash.split("#")[1];
          nextTick(() => {
            document.getElementById(elementId).scrollIntoView()
          })
        }
      }
  }, {deep: true, immediate: true})
</script>

<template>
  <div
    id="page"
    :class="styles.page"
  >
    <Header />
    <Navigation />
    <Message
      v-if="content[route.name].message"
      v-show="showMessage"
      :on-close="closeMessage"
      :message="content[route.name].message"
    />
    <Main>
      <slot />
    </Main>
    <Footer />
  </div>
</template>
