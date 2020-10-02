<template>
  <div id="app">
    <tip-tap :editor="editor" v-show="mode === XkEditorMode.RichText" />
    <md-editor v-show="mode === XkEditorMode.Markdown" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import TipTap from "@/components/TipTap.vue";
import MdEditor from "@/components/MdEditor.vue";
import { Actions, useAction, useState, useStore } from "@/store";
import { XkEditorMode } from "@/store/state";

export default defineComponent({
  name: "App",
  components: {
    TipTap,
    MdEditor
  },
  setup() {
    const mode = useState<XkEditorMode>("mode");
    const actions = useAction<Actions>();
    const config = actions.initConfig({
      tiptap: {
        content: `<h1>Title</h1>`
      }
    });
    const editor = actions.createTiptap(config.tiptap);

    window.store = useStore();

    return { editor, mode, XkEditorMode };
  }
});
</script>

<style lang="scss">
#app {
  width: 100vw;
  height: 100vh;
}
</style>
