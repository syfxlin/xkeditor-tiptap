<template>
  <resize-panel class="tiptap__container splitpanes-default">
    <pane class="tiptap__pane">
      <editor-floating-menu
        :editor="editor"
        v-slot="{ commands, isActive, menu }"
      >
        <menu-bar
          :menus="menus"
          class="menu-floating"
          :class="{ 'is-active': menu.isActive }"
          :style="{ top: menu.top + 'px' }"
        />
      </editor-floating-menu>

      <editor-content class="tiptap__content" :editor="editor" />
    </pane>
  </resize-panel>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import { EditorContent, EditorFloatingMenu } from "tiptap";
import ResizePanel from "@/components/ResizePanel.vue";
import { Pane } from "splitpanes";
import MenuBar from "@/components/MenuBar.vue";
import { Actions, State, useAction, useState } from "@/store";

export default defineComponent({
  name: "tip-tip",
  components: {
    EditorContent,
    EditorFloatingMenu,
    MenuBar,
    ResizePanel,
    Pane
  },
  setup() {
    const state = useState<State>();
    const actions = useAction<Actions>();
    const editor = actions.createTiptap(state.value.config.tiptap);

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

    return { menus, editor };
  }
});
</script>

<style lang="scss" src="../assets/scss/tiptap.scss"></style>
