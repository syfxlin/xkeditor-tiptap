<template>
  <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
    <div class="menubar">
      <button
        v-for="menu in menus"
        :key="menu.id"
        class="menubar__button"
        :class="{ 'is-active': isActive[menu.name](menu.options) }"
        @click="commands[menu.name](menu.options)"
      >
        <icon :name="menu.icon" />
      </button>
    </div>
  </editor-menu-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import { Editor, EditorMenuBar } from "tiptap";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "t-menu-bar",
  components: {
    EditorMenuBar,
    Icon
  },
  props: {
    editor: Editor,
    menus: Array
  }
});
</script>
