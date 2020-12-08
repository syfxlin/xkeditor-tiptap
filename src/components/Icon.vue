<template>
  <span
    class="icon"
    :class="[`icon--${name}`, `icon--${size}`, { 'has-align-fix': fixAlign }]"
  >
    <fa-icon :icon="name" class="icon__svg" />
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default defineComponent({
  components: {
    "fa-icon": FontAwesomeIcon
  },
  props: {
    name: {},
    size: {
      default: "normal"
    },
    modifier: {
      default: null
    },
    fixAlign: {
      default: true
    }
  }
});
</script>

<style lang="scss" scoped src="../assets/scss/icon.scss"></style>
