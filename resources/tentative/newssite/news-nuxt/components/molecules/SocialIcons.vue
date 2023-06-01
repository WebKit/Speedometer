<script lang="js">
import styles from "news-site-css/dist/icons-group.module.css";
export default {
  props: {
      onClick: Function,
      id: String
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
        <a
          :id="`${id}-facebook`"
          href="#"
        >
          <div :class="styles['group-icon']">
            <FacebookIcon />
          </div>
        </a>
      </li>
      <li :class="styles['icons-group-item']">
        <a
          :id="`${id}-instagram`"
          href="#"
        >
          <div :class="styles['group-icon']">
            <InstagramIcon />
          </div>
        </a>
      </li>
      <li :class="styles['icons-group-item']">
        <a
          :id="`${id}-twitter`"
          href="#"
        >
          <div :class="styles['group-icon']">
            <TwitterIcon />
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>
