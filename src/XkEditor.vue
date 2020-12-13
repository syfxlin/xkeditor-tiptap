<template>
  <div class="xkeditor">
    <div class="xkeditor__menu">
      <menu-bar
        v-for="menu in menus"
        :key="menu.id"
        :menus="menu"
        class="menu-bar"
      />
    </div>
    <div class="xkeditor__content">
      <tip-tap v-show="mode === XkEditorMode.RichText" />
      <md-editor v-show="mode === XkEditorMode.Markdown" />
    </div>
    <popover />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue-demi";
import TipTap from "@/components/TipTap.vue";
import MdEditor from "@/components/MdEditor.vue";
import { Actions, useAction, useState, useStore } from "@/store";
import { XkEditorMode } from "@/store/state";
import MenuBar from "@/components/MenuBar.vue";
import Popover from "@/components/Popover.vue";

export default defineComponent({
  name: "xkeditor",
  components: {
    MenuBar,
    TipTap,
    MdEditor,
    Popover
  },
  props: {
    init: Object
  },
  setup(props) {
    const mode = useState<XkEditorMode>("mode");
    const actions = useAction<Actions>();
    actions.initConfig(props.init);

    window.store = useStore();

    const fontSize = ref("14px");

    const styleCommand = actions.getCommand("style");
    const headingCommand = actions.getCommand("heading");

    const menus = [
      [
        {
          type: "button",
          name: "bold",
          icon: "bold",
          tooltip: "粗体\nCtrl+B",
          command: actions.getCommand("bold")
        },
        {
          type: "button",
          name: "italic",
          icon: "italic",
          tooltip: "斜体\nCtrl+I",
          command: actions.getCommand("italic")
        },
        {
          type: "button",
          name: "code",
          icon: "code",
          tooltip: "行内代码\nCtrl+`",
          command: actions.getCommand("code")
        },
        {
          type: "select",
          name: "title",
          value: computed({
            get: () => {
              for (let i = 1; i <= 6; i++) {
                if (headingCommand.isActive({ level: i }).value) {
                  return `heading${i}`;
                }
              }
              return "paragraph";
            },
            set: (value: string) => {
              if (value === "paragraph") {
                headingCommand.handler();
              } else {
                headingCommand.handler({ level: parseInt(value.substring(7)) });
              }
            }
          }),
          options: [
            {
              label: "正文",
              value: "paragraph"
            },
            {
              label: "标题一",
              value: "heading1"
            },
            {
              label: "标题二",
              value: "heading2"
            },
            {
              label: "标题三",
              value: "heading3"
            },
            {
              label: "标题四",
              value: "heading4"
            },
            {
              label: "标题五",
              value: "heading5"
            },
            {
              label: "标题六",
              value: "heading6"
            }
          ]
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
          ]
        },
        {
          type: "dropdown",
          name: "font-size",
          label: "下拉",
          click: () => {
            console.log("Click");
          },
          command: {
            handler: (command: string) => {
              console.log(command);
            }
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
          command: {
            handler: (color: string) => {
              styleCommand.handler({
                color: color
              });
            },
            isActive: () => ref(false)
          },
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
        },
        {
          type: "color",
          name: "background",
          icon: "bold",
          value: ref(),
          command: {
            handler: (color: string) => {
              styleCommand.handler({
                background: color
              });
            },
            isActive: () => ref(false)
          },
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

    return { mode, XkEditorMode, menus, fontSize };
  }
});
</script>

<style lang="scss" src="./assets/scss/xkeditor.scss"></style>
