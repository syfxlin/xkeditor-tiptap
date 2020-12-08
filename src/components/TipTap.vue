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
import { Editor, EditorContent, EditorFloatingMenu } from "tiptap";
import ResizePanel from "@/components/ResizePanel.vue";
import { Pane } from "splitpanes";
import MenuBar from "@/components/MenuBar.vue";

export default defineComponent({
  name: "tip-tip",
  components: {
    EditorContent,
    EditorFloatingMenu,
    MenuBar,
    ResizePanel,
    Pane
  },
  props: {
    editor: Editor
  },
  setup() {
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

    // TODO: 分页 Demo，解决节点过多导致卡顿问题
    // const index = ref<number>(0);
    // const tempNodes = ref<Node[]>([]);
    //
    // watch(
    //   () => editor.state.doc.childCount,
    //   val => {
    //     if (val > 20) {
    //       let size = 0;
    //       for (let i = 0; i < 10; i++) {
    //         const node = editor.state.doc.child(i);
    //         size += node.nodeSize;
    //         tempNodes.value.push(node);
    //       }
    //       editor.dispatchTransaction(editor.state.tr.delete(0, size + 1));
    //       index.value += size;
    //     } else if (val === 1) {
    //       const nodes = tempNodes.value.splice(tempNodes.value.length - 10, 10);
    //       editor.dispatchTransaction(editor.state.tr.insert(0, nodes));
    //     }
    //     console.log(val);
    //   }
    // );

    return { menus };
  }
});
</script>

<style lang="scss" src="../assets/scss/tiptap.scss"></style>
