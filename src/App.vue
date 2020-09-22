<template>
  <div id="app">
    <tip-tap :editor="editor" />
    <md-editor :editor="editor" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, reactive } from "vue-demi";
import TipTap from "@/components/TipTap.vue";
import MdEditor from "@/components/MdEditor.vue";
import { useExtensions } from "@/utils/tiptap";
import { Editor } from "tiptap";
import { NodeMdParser } from "@/marked/NodeMdParser";
import { extParsers, extTokenizers } from "@/marked/rules";
import { NodeMdSerializer } from "@/marked/NodeMdSerializer";
import marked from "marked";
import MdParser from "@/marked/MdParser";
import { MdLexer } from "@/marked/MdLexer";

export default defineComponent({
  name: "App",
  components: {
    TipTap,
    MdEditor
  },
  setup() {
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
          <span style="color: #aaddff;font-size: 22px">color</span>
        `
      })
    );
    onBeforeUnmount(() => {
      editor.destroy();
    });

    // @ts-ignore
    window.editor = editor;
    // @ts-ignore
    window.parser = new NodeMdParser(editor.extensions, extTokenizers);
    // @ts-ignore
    window.serializer = new NodeMdSerializer(editor.extensions);
    // @ts-ignore
    window.marked = marked;
    // @ts-ignore
    window.mdparser = new MdParser(editor.extensions, extParsers);
    // @ts-ignore
    window.lexer = new MdLexer(extTokenizers);

    return { editor };
  }
});
</script>

<style lang="scss"></style>
