<template>
  <div class="md-editor">
    <code-mirror :content.sync="content" :options.sync="options" />
    <div v-html="htmlContent"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue-demi";
import CodeMirror from "@/components/CodeMirror.vue";
import { Editor } from "tiptap";
import MdParser from "@/marked/MdParser";
import { extParsers, extTokenizers } from "@/marked/rules";
import { MdLexer } from "@/marked/MdLexer";

export default defineComponent({
  name: "md-editor",
  components: {
    CodeMirror
  },
  props: {
    editor: Editor
  },
  setup(props) {
    const editor = props.editor as Editor;
    const content = ref("# Markdown");
    const htmlContent = computed(() =>
      new MdParser(editor.extensions, extParsers).parse(
        new MdLexer(extTokenizers).lex(content.value)
      )
    );
    const options = ref({
      lineNumbers: true
    });
    return { content, options, htmlContent };
  }
});
</script>
