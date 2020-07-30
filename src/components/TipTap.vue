<template>
  <div class="editor">
    <t-menu-bar :editor="editor" :menus="menus" />
    <t-menu-bubble :editor="editor" :menus="menus" />
    <t-float-menu :editor="editor" :menus="menus" />

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, reactive } from "vue-demi";
import Icon from "@/components/Icon.vue";
import { Editor, EditorContent } from "tiptap";
import { useExtensions } from "@/utils/tiptap";
import TMenuBar from "@/components/TMenuBar.vue";
import TMenuBubble from "@/components/TMenuBubble.vue";
import TFloatMenu from "@/components/TFloatMenu.vue";

export default defineComponent({
  name: "TipTap",
  components: {
    EditorContent,
    TMenuBar,
    TMenuBubble,
    TFloatMenu,
    Icon
  },
  setup() {
    const menus = [
      {
        name: "bold",
        icon: "bold"
      },
      {
        name: "italic",
        icon: "italic"
      },
      {
        name: "color",
        icon: "italic",
        options: {
          color: "blue"
        }
      }
    ];
    const extensions = useExtensions();
    const editor = reactive(
      new Editor({
        extensions: extensions,
        content: `
          <h1>Yay Headlines!</h1>
          <p>All these <strong>cool tags</strong> are working now.</p>
          <pre data-language="javascript">
          function max(a, b) {
            return a > b ? a : b
          }</pre>
          <span style="color: #aaddff">color</span>
        `
      })
    );
    onBeforeUnmount(() => {
      editor.destroy();
    });
    // TODO: remove
    // @ts-ignore
    window.editor = editor;
    return { editor, menus };
  }
});
</script>

<style lang="scss" src="../assets/scss/main.scss"></style>
