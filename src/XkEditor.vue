<template>
  <div class="xkeditor">
    <div class="xkeditor__menu">
      <menu-bar
        :menus="menus"
        :commands="commands"
        class="menu-bar"
        item-class="menu-bar__button"
      />
    </div>
    <div class="xkeditor__content">
      <tip-tap :editor="editor" v-show="mode === XkEditorMode.RichText" />
      <md-editor v-show="mode === XkEditorMode.Markdown" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue-demi";
import TipTap from "@/components/TipTap.vue";
import MdEditor from "@/components/MdEditor.vue";
import { Actions, useAction, useState, useStore } from "@/store";
import { XkEditorMode } from "@/store/state";
import MenuBar from "@/components/MenuBar.vue";
import { convertCommands } from "@/utils/tiptap";
import { useCommands } from "@/marked/commands";
import { Ace } from "ace-builds";

export default defineComponent({
  name: "xkeditor",
  components: {
    MenuBar,
    TipTap,
    MdEditor
  },
  props: {
    init: Object
  },
  setup(props) {
    const mode = useState<XkEditorMode>("mode");
    const ace = useState<Ace.Editor>("ace");
    const actions = useAction<Actions>();
    const config = actions.initConfig(props.init);
    const editor = actions.createTiptap(config.tiptap);

    window.store = useStore();

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

    const commands = computed(() => {
      if (mode.value === XkEditorMode.RichText) {
        return convertCommands(editor.commands, editor.isActive);
      } else {
        return useCommands(ace);
      }
    });

    return { editor, mode, XkEditorMode, menus, commands };
  }
});
</script>

<style lang="scss" src="./assets/scss/xkeditor.scss"></style>
