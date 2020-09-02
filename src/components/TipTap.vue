<template>
  <div class="editor">
    <t-menu-bar :editor="editor" :menus="menus" />
    <t-menu-bubble :editor="editor" :menus="menus" />
    <t-float-menu :editor="editor" :menus="menus" />

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, reactive } from "vue-demi";
import Icon from "@/components/Icon.vue";
import { Editor, EditorContent } from "tiptap";
import { useExtensions } from "@/utils/tiptap";
import TMenuBar from "@/components/TMenuBar.vue";
import TMenuBubble from "@/components/TMenuBubble.vue";
import TFloatMenu from "@/components/TFloatMenu.vue";
import { MarkdownParser } from "@/block/MdSpec";
import marked from "marked";

export default defineComponent({
  name: "TipTap",
  components: {
    EditorContent,
    TMenuBar,
    TMenuBubble,
    TFloatMenu,
    Icon
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
    const extensions = useExtensions();
    const editor = reactive(
      new Editor({
        extensions: extensions,
        content: `
          <h1>Yay Headlines!</h1>
          <p>All these <strong>cool tags</strong> are working now.</p>
          <pre data-language="javascript">
          function max(a, b) {
            return a > b ? a : b
          }</pre>
          <span style="color: #aaddff;font-size: 22px">color</span>
        `
      })
    );
    onBeforeUnmount(() => {
      editor.destroy();
    });

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

    // TODO: remove
    // @ts-ignore
    window.editor = editor;
    // @ts-ignore
    window.parser = new MarkdownParser(editor.schema);
    // @ts-ignore
    window.marked = marked;
    // applyDevTools(editor.view);

    return { editor, menus };
  }
});
</script>

<style lang="scss" src="../assets/scss/main.scss"></style>
