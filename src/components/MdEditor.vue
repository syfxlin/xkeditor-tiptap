<template>
  <splitpanes class="md-editor">
    <pane>
      <ace :content.sync="content" :options.sync="options" />
    </pane>
    <pane>
      <div class="md-preview" v-html="htmlContent"></div>
    </pane>
  </splitpanes>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue-demi";
import Ace from "@/components/Ace.vue";
import { Editor } from "tiptap";
import MdParser from "@/marked/MdParser";
import { extParsers, extTokenizers } from "@/marked/rules";
import { MdLexer } from "@/marked/MdLexer";
import { Pane, Splitpanes } from "splitpanes";

export default defineComponent({
  name: "md-editor",
  components: {
    Ace,
    Splitpanes,
    Pane
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
      fontSize: "17px",
      theme: "ace/theme/solarized_light",
      mode: "ace/mode/markdown",
      tabSize: 4,
      wrap: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      enableBasicAutocompletion: true
    });
    return { content, options, htmlContent };
  }
});
</script>

<style lang="scss">
.md-editor {
  display: flex;
  width: 100%;
  height: 100%;

  .md-preview {
    overflow: auto;
  }
}

.splitpanes--vertical > .splitpanes__splitter {
  width: 5px;
}
</style>
