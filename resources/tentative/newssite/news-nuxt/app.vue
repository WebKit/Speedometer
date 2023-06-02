<script>
// "Fixes" an issue with calling history.replaceState too often in certain browsers during testing.
// Note: This should NOT be used in a production application.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
history.replaceState = function (state) {
    return null;
};

// This hack allows to capture the work normally happening in a rAF. We
// may be able to remove it if the runner improves.
window.requestAnimationFrame = (cb) => window.setTimeout(cb, 0);
window.cancelAnimationFrame = window.clearTimeout;
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <div id="settings-container" />
  <div id="notifications-container" />
</template>
