<script lang="js">
import styles from "news-site-css/dist/modal.module.css";

import { login } from "~/data/form";

export default {
    props: {
        onClose: Function,
    },
    data() {
        return {
            styles,
            login
        }
    },
    methods: {
        handleSubmit(e) {
            const { elements } = e.target;
            console.log(elements.username.value, elements.password.value);
            this.onClose();
        },
    }
}
</script>

<template>
  <div
    id="login"
    :class="[styles.modal, styles.open]"
  >
    <div :class="styles['modal-content']">
      <button
        id="modal-dialog-link"
        :class="styles['modal-close-button']"
        title="Close Button"
        @click="onClose"
      >
        <div
          :class="[styles['modal-close-button-icon'], 'animated-icon', 'close-icon', 'hover']"
          title="Close Icon"
        >
          <span class="animated-icon-inner">
            <span />
            <span />
          </span>
        </div>
      </button>
      <header :class="styles['modal-header']">
        <h2>{{ login.header }}</h2>
      </header>
      <section :class="styles['modal-body']">
        <Form
          :on-cancel="onClose"
          :on-submit="handleSubmit"
        />
      </section>
    </div>
  </div>
</template>