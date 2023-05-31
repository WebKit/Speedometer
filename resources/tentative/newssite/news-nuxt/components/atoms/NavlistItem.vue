<script lang="js">
  import styles from "news-site-css/dist/navbar.module.css";
  export default {
    props: {
      label: String,
      url: String,
      callback: Function,
    },
    data () {
      return {
        styles,
      }
    }
  }
</script>

<template>
    <NuxtLink :activeClass="styles['active']" :to="url" @click="callback"> {{ label }} </NuxtLink>
</template>
