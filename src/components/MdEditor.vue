<template>
  <div class="md-editor-container">
    <menu-bar
      :menus="menus"
      :commands="commands"
      class="menubar"
      item-class="menubar__button"
    />
    <splitpanes class="md-editor splitpanes-default" @resized="resized">
      <pane :min-size="20" contenteditable="false">
        <div ref="editor"></div>
      </pane>
      <pane :min-size="20">
        <div class="md-preview" v-html="htmlContent"></div>
      </pane>
    </splitpanes>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue-demi";
import { Pane, Splitpanes } from "splitpanes";
import { Actions, State, useAction, useState } from "@/store";
import { Ace } from "ace-builds";
import { useDebounceFn } from "@vueuse/core";
import { useCommands } from "@/marked/commands";
import MenuBar from "@/components/MenuBar.vue";
import Editor = Ace.Editor;

export default defineComponent({
  name: "md-editor",
  components: {
    Splitpanes,
    Pane,
    MenuBar
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

    const commands = useCommands(ace);
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
        name: "style",
        icon: "italic",
        options: {
          color: "blue"
        }
      }
    ];
    return { editor, htmlContent, commands, menus, resized };
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
