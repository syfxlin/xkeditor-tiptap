<template>
  <editor-menu-bubble
    :editor="editor"
    :keep-in-bounds="true"
    v-slot="{ commands, isActive, menu }"
  >
    <div
      class="menu-bubble"
      :class="{ 'is-active': menu.isActive }"
      :style="{ left: menu.left + 'px', bottom: menu.bottom + 'px' }"
    >
      <button
        v-for="menu in menus"
        :key="menu.id"
        class="menu-bubble__button"
        :class="{ 'is-active': isActive[menu.name](menu.options) }"
        @click="commands[menu.name](menu.options)"
      >
        <icon :name="menu.icon" />
      </button>
    </div>
  </editor-menu-bubble>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import { Editor, EditorMenuBubble } from "tiptap";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "t-menu-bubble",
  components: {
    EditorMenuBubble,
    Icon
  },
  props: {
    editor: Editor,
    menus: Array
  }
});
</script>
