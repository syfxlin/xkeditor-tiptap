<template>
  <splitpanes class="md-editor splitpanes-default" @resized="resized">
    <pane :min-size="20" contenteditable="false">
      <div ref="editor"></div>
    </pane>
    <pane :min-size="20">
      <div class="md-preview" v-html="htmlContent"></div>
    </pane>
  </splitpanes>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue-demi";
import { Pane, Splitpanes } from "splitpanes";
import { Actions, State, useAction, useState } from "@/store";
import { Ace } from "ace-builds";
import { useDebounceFn } from "@vueuse/core";
import Editor = Ace.Editor;

export default defineComponent({
  name: "md-editor",
  components: {
    Splitpanes,
    Pane
  },
  setup() {
    const ace = ref<Editor>();
    const editor = ref<HTMLElement>();
    const actions = useAction<Actions>();
    const state = useState<State>();
    const htmlContent = ref<string>();
    const updateHtml = useDebounceFn(() => {
      htmlContent.value = actions.convertMarkdownToHtml(
        ace.value ? ace.value.getValue() : ""
      );
    }, 500);
    onMounted(() => {
      ace.value = actions.createAce(
        editor.value as HTMLElement,
        state.value.config.ace
      );
      ace.value.on("change", updateHtml);
    });
    const resized = () => {
      ace.value?.resize();
    };
    return { editor, htmlContent, resized };
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
