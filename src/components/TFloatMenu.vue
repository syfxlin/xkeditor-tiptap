<template>
  <editor-floating-menu :editor="editor" v-slot="{ commands, isActive, menu }">
    <div
      class="editor__floating-menu"
      :class="{ 'is-active': menu.isActive }"
      :style="{ top: menu.top + 'px' }"
    >
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
  </editor-floating-menu>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import { Editor, EditorFloatingMenu } from "tiptap";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "t-menu-bubble",
  components: {
    EditorFloatingMenu,
    Icon
  },
  props: {
    editor: Editor,
    menus: Array
  }
});
</script>
