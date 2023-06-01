<script lang="js">
import styles from "news-site-css/dist/icons-group.module.css";
export default {
  props: {
      onClick: Function,
      id: String,
  },
  data () {
    return {
      styles
    }
  }
}
</script>

<template>
  <div :class="styles['icons-group']">
    <ul :class="styles['icons-group-list']">
      <li :class="styles['icons-group-item']">
        <button
          :id="`${id}-reduce-motion`"
          @click="onClick"
        >
          <div :class="styles['group-icon']">
            <ReducedMotionIcon />
          </div>
        </button>
      </li>
    </ul>
  </div>
</template>
