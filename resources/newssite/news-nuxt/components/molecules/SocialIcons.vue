<script lang="js">
import { social } from "~/data/links";
import styles from "news-site-css/dist/icons-group.module.css";
export default {
  props: {
      callback: Function,
      id: String
  },
  data () {
    return {
      social,
      styles
    }
  }
}
</script>

<template>
    <div :class="styles['icons-group']">
        <ul :class="styles['icons-group-list']">
            <li :class="styles['icons-group-item']">
                <a :id="`${id}-facebook`" :href="social.facebook.href">
                    <div :class="styles['group-icon']">
                        <FacebookIcon />
                    </div>
                </a>
            </li>
            <li :class="styles['icons-group-item']">
                <a :id="`${id}-instagram`" :href="social.instagram.href">
                    <div :class="styles['group-icon']">
                        <InstagramIcon />
                    </div>
                </a>
            </li>
            <li :class="styles['icons-group-item']">
                <a :id="`${id}-twitter`" :href="social.twitter.href">
                    <div :class="styles['group-icon']">
                        <TwitterIcon />
                    </div>
                </a>
            </li>
        </ul>
    </div>
</template>
