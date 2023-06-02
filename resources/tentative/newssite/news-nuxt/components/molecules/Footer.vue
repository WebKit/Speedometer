<script lang="js">
import styles from "news-site-css/dist/footer.module.css";
export default {
  data() {
    return {
      styles,
      showPortal: false,
    }
  },
  methods: {
    openPortal() {
      this.showPortal = true;
    },
    closePortal() {
      this.showPortal = false;
    }
  }
}
</script>

<template>
  <footer :class="styles['page-footer']">
    <div :class="styles['footer-row']">
      <div :class="styles['footer-column-center']">
        <Sitemap />
      </div>
    </div>
    <div :class="styles['footer-row']">
      <div :class="styles['footer-column-center']">
        <div :class="styles['footer-links']">
          <ul :class="styles['footer-links-list']">
            <li :class="styles['footer-links-item']">
              <a
                id="footer-link-terms"
                href="#"
                :class="styles['footer-link']"
              > Terms of Use </a>
            </li>
            <li :class="styles['footer-links-item']">
              <a
                id="footer-link-privacy"
                href="#"
                :class="styles['footer-link']"
              > Privacy Policy </a>
            </li>
            <li :class="styles['footer-links-item']">
              <a
                id="footer-link-sell"
                href="#"
                :class="styles['footer-link']"
              > Do Not Sell Or Share My Personal Information </a>
            </li>
            <li :class="styles['footer-links-item']">
              <a
                id="footer-link-adchoices"
                href="#"
                :class="styles['footer-link']"
              > Ad Choices </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div :class="styles['footer-row']">
      <div :class="styles['footer-column-left']">
        <SocialIcons id="footer-social-icons" />
      </div>
      <div :class="styles['footer-column-center']">
        © {{ new Date().getFullYear() }} No Rights Reserved
      </div>
      <div :class="styles['footer-column-right']">
        <SettingsIcons
          id="footer-settings-icons"
          :callback="openPortal"
        />
      </div>
    </div>
  </footer>
  <Teleport to="body">
    <Dialog
      v-show="showPortal"
      :on-close="closePortal"
    />
  </Teleport>
</template>
