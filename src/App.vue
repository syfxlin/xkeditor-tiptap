<template>
  <div id="app">
    <tip-tap />
    <md-editor />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import TipTap from "@/components/TipTap.vue";
import MdEditor from "@/components/MdEditor.vue";

export default defineComponent({
  name: "App",
  components: {
    TipTap,
    MdEditor
  },
  setup() {
    //
  }
});
</script>

<style lang="scss"></style>
