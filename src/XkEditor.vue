<template>
  <div class="xkeditor">
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
  name: "xkeditor",
  components: {
    TipTap,
    MdEditor
  },
  props: {
    init: Object
  },
  setup(props) {
    const mode = useState<XkEditorMode>("mode");
    const actions = useAction<Actions>();
    const config = actions.initConfig(props.init);
    const editor = actions.createTiptap(config.tiptap);

    window.store = useStore();

    return { editor, mode, XkEditorMode };
  }
});
</script>

<style lang="scss">
.xkeditor {
  height: 100%;
  width: 100%;
}
</style>
