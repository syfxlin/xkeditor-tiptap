<template>
  <div id="app">
    <xk-editor :init="init" />
  </div>
</template>

<script>
import XkEditor from "@/XkEditor";
import { defineComponent } from "vue-demi";

export default defineComponent({
  name: "app",
  components: {
    XkEditor
  },
  setup() {
    const init = {
      tiptap: {
        content: `<h1>Title</h1>`
      }
    };
    return { init };
  }
});
</script>

<style lang="scss" src="./assets/scss/app.scss"></style>
