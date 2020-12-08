<template>
  <div class="xkeditor">
    <div class="xkeditor__menu">
      <menu-bar
        v-for="menu in menus"
        :key="menu.id"
        :menus="menu"
        :commands="commands"
        class="menu-bar"
      />
    </div>
    <div class="xkeditor__content">
      <tip-tap :editor="editor" v-show="mode === XkEditorMode.RichText" />
      <md-editor v-show="mode === XkEditorMode.Markdown" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue-demi";
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

    const fontSize = ref("14px");

    const menus = [
      [
        {
          type: "button",
          name: "bold",
          icon: "bold",
          tooltip: "粗体\nCtrl+B",
          handler: editor.commands["bold"],
          isActive: attrs => computed(() => editor.isActive["bold"](attrs))
        }
      ],
      [
        {
          type: "select",
          name: "font-size",
          value: fontSize,
          allowCreate: true,
          options: [
            {
              label: "14px",
              value: "14px"
            },
            {
              label: "15px",
              value: "15px"
            }
          ],
          handler: (size: string) => {
            console.log(size);
          }
        },
        {
          type: "dropdown",
          name: "font-size",
          label: "下拉",
          click: () => {
            console.log("Click");
          },
          handler: (command: string) => {
            console.log(command);
          },
          options: [
            {
              label: "op1",
              command: "op1"
            }
          ]
        },
        {
          type: "color",
          name: "color",
          icon: "bold",
          value: ref(),
          handler: (color: string) => {
            console.log(color);
          },
          isActive: attrs => ref(true),
          predefine: [
            "#ff4500",
            "#ff8c00",
            "#ffd700",
            "#90ee90",
            "#00ced1",
            "#1e90ff",
            "#c71585",
            "rgba(255, 69, 0, 0.68)",
            "rgb(255, 120, 0)",
            "hsv(51, 100, 98)",
            "hsva(120, 40, 94, 0.5)",
            "hsl(181, 100%, 37%)",
            "hsla(209, 100%, 56%, 0.73)",
            "#c7158577"
          ]
        }
      ]
    ];

    const commands = computed(() => {
      if (mode.value === XkEditorMode.RichText) {
        return convertCommands(editor.commands, editor.isActive);
      } else {
        return useCommands(ace);
      }
    });

    return { editor, mode, XkEditorMode, menus, commands, fontSize };
  }
});
</script>

<style lang="scss" src="./assets/scss/xkeditor.scss"></style>
