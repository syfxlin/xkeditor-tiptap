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
    const linkCommand = actions.getCommand("link");
    const cardLinkCommand = actions.getCommand("card_link");
    const imageCommand = actions.getCommand("image");
    const popover = actions.popover;

    const menus = [
      [
        {
          type: "button",
          name: "bold",
          icon: "bold",
          tooltip: "粗体 Ctrl+B",
          command: actions.getCommand("bold")
        },
        {
          type: "button",
          name: "italic",
          icon: "italic",
          tooltip: "斜体 Ctrl+I",
          command: actions.getCommand("italic")
        },
        {
          type: "button",
          name: "code",
          icon: "code",
          tooltip: "行内代码 Ctrl+`",
          command: actions.getCommand("code")
        },
        {
          type: "button",
          name: "link",
          icon: "link",
          tooltip: "链接",
          command: {
            isActive: linkCommand.isActive,
            handler: () => {
              if (linkCommand.isActive().value) {
                linkCommand.handler({ href: null });
              } else {
                popover.show({
                  ref: document.querySelector("#menu-item__link"),
                  command: "link",
                  data: {
                    href: ""
                  },
                  buttons: [
                    {
                      label: "确定",
                      handler: p => {
                        linkCommand.handler(p.data);
                        popover.hide();
                      },
                      type: "primary"
                    }
                  ]
                });
              }
            }
          }
        },
        {
          type: "button",
          name: "card_link",
          icon: "link",
          tooltip: "链接",
          command: {
            isActive: cardLinkCommand.isActive,
            handler: () => {
              if (cardLinkCommand.isActive().value) {
                cardLinkCommand.handler({ href: null });
              } else {
                popover.show({
                  ref: document.querySelector("#menu-item__card_link"),
                  command: "link",
                  data: {
                    href: ""
                  },
                  buttons: [
                    {
                      label: "确定",
                      handler: p => {
                        cardLinkCommand.handler(p.data);
                        popover.hide();
                      },
                      type: "primary"
                    }
                  ]
                });
              }
            }
          }
        },
        {
          type: "button",
          name: "strike",
          icon: "strikethrough",
          tooltip: "删除线 Ctrl+D",
          command: actions.getCommand("strike")
        },
        {
          type: "button",
          name: "sup",
          icon: "superscript",
          tooltip: "上标 Ctrl+Shift+P",
          command: actions.getCommand("sup")
        },
        {
          type: "button",
          name: "sub",
          icon: "subscript",
          tooltip: "下标 Ctrl+Shift+B",
          command: actions.getCommand("sub")
        },
        {
          type: "button",
          name: "underline",
          icon: "underline",
          tooltip: "下划线 Ctrl+U",
          command: actions.getCommand("underline")
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
      ],
      [
        {
          type: "button",
          name: "blockquote",
          icon: "quote-left",
          tooltip: "引用 Ctrl+>",
          command: actions.getCommand("blockquote")
        },
        {
          type: "button",
          name: "bullet_list",
          icon: "list-ul",
          tooltip: "无序列表 Shift-Ctrl-8",
          command: actions.getCommand("bullet_list")
        },
        {
          type: "button",
          name: "ordered_list",
          icon: "list-ol",
          tooltip: "有序列表 Shift-Ctrl-9",
          command: actions.getCommand("ordered_list")
        },
        {
          type: "button",
          name: "code_block",
          icon: "terminal",
          tooltip: "代码块 Ctrl+Shift+\\",
          command: actions.getCommand("code_block")
        },
        {
          type: "button",
          name: "horizontal_rule",
          icon: "minus",
          tooltip: "分割线",
          command: actions.getCommand("horizontal_rule")
        },
        {
          type: "button",
          name: "image",
          icon: "image",
          tooltip: "图片",
          command: {
            isActive: imageCommand.isActive,
            handler: () => {
              if (imageCommand.isActive().value) {
                imageCommand.handler();
              } else {
                popover.show({
                  ref: document.querySelector("#menu-item__image"),
                  command: "image",
                  data: {
                    src: ""
                  },
                  buttons: [
                    {
                      label: "确定",
                      handler: p => {
                        imageCommand.handler(p.data);
                        popover.hide();
                      },
                      type: "primary"
                    }
                  ]
                });
              }
            }
          }
        }
      ]
    ];

    return { mode, XkEditorMode, menus, fontSize };
  }
});
</script>

<style lang="scss" src="./assets/scss/xkeditor.scss"></style>
