<template>
  <div class="editor-container">
    <vue-draggable-resizable
      :class-name="'editor'"
      :handles="['mr']"
      :draggable="false"
      :min-width="200"
      :w="550"
      :h="'auto'"
      :axis="'x'"
      :scale="0.5"
    >
      <t-menu-bar :editor="editor" :menus="menus" />
      <t-menu-bubble :editor="editor" :menus="menus" />
      <t-float-menu :editor="editor" :menus="menus" />

      <editor-content class="editor__content" :editor="editor" />
    </vue-draggable-resizable>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import Icon from "@/components/Icon.vue";
import { Editor, EditorContent } from "tiptap";
import TMenuBar from "@/components/TMenuBar.vue";
import TMenuBubble from "@/components/TMenuBubble.vue";
import TFloatMenu from "@/components/TFloatMenu.vue";
import VueDraggableResizable from "vue-draggable-resizable";

export default defineComponent({
  name: "tip-tip",
  components: {
    EditorContent,
    TMenuBar,
    TMenuBubble,
    TFloatMenu,
    Icon,
    VueDraggableResizable
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

<style lang="scss" src="../assets/scss/main.scss"></style>
