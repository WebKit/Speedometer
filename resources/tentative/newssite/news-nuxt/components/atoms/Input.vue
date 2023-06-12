<script lang="js">
import styles from "news-site-css/dist/input.module.css";

export default {
    props: {
        id: String,
        placeholder: String,
        label: String,
        containerClass: String,
        type: String,
        onChange: Function
    },
    data() {
        return {
            styles,
        }
    },
    methods: {
        handleChange(e) {
           this.onChange(e);
        }
    }
}
</script>

<template>
  <div :class="[styles['input-container'], containerClass]">
    <label
      :class="[styles.label, 'visually-hidden']"
      :v-for="id"
    >{{ label }}</label>
    <input
      :id="id"
      :class="[styles.input, styles['input-type-text']]"
      :type="type"
      autocomplete="off"
      :placeholder="placeholder"
      :onInput="handleChange"
    >
  </div>
</template>
