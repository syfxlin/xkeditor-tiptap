<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <tip-tap />
    <code-mirror :content.sync="value" :options="{ lineNumbers: true }" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue-demi";
import TipTap from "@/components/TipTap.vue";
import CodeMirror from "@/components/CodeMirror.vue";

export default defineComponent({
  name: "App",
  components: {
    TipTap,
    CodeMirror
  },
  setup() {
    const value = ref("value");

    return { value };
  }
});
</script>

<style lang="scss"></style>
