<template>
  <splitpanes class="md-editor splitpanes-default" @resized="resized">
    <pane :min-size="20">
      <ace :content.sync="content" :options.sync="options" :ace.sync="ace" />
    </pane>
    <pane :min-size="20">
      <div class="md-preview" v-html="htmlContent"></div>
    </pane>
  </splitpanes>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue-demi";
import Ace from "@/components/Ace.vue";
import { Editor } from "tiptap";
import MdParser from "@/marked/MdParser";
import { extParsers, extTokenizers } from "@/marked/rules";
import { MdLexer } from "@/marked/MdLexer";
import { Pane, Splitpanes } from "splitpanes";
import { Ace as AceBuilds } from "ace-builds";
import { useCommands } from "@/marked/commands";
import AceEditor = AceBuilds.Editor;

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

    const ace = ref<AceEditor>();
    const resized = () => {
      if (ace.value) {
        ace.value.resize();
      }
    };

    watch(ace, value => {
      if (value !== undefined) {
        window.commands = useCommands(value);
      }
    });
    return { content, options, htmlContent, resized, ace };
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
