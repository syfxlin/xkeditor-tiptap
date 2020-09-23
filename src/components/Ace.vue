<template>
  <div class="ace-editor" contenteditable="false">
    <div ref="editor"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue-demi";
import { Ace, config as aceConfig, edit as aceEdit } from "ace-builds";
import Editor = Ace.Editor;

const ACE_EVENT = [
  "blur",
  "change",
  "changeSelectionStyle",
  "changeSession",
  "copy",
  "focus",
  "paste"
];

export default defineComponent({
  name: "node_ace",
  props: {
    content: String,
    options: Object,
    ace: Object
  },
  setup(props, ctx) {
    const editor = ref<HTMLElement>();
    const ace = ref<Editor>();
    const value = ref(props.content);
    aceConfig.set(
      "basePath",
      "https://cdn.jsdelivr.net/npm/ace-builds@1.4.4/src-noconflict/"
    );

    watch(
      () => props.content,
      val => {
        if (value.value === val) return;
        ace.value?.setValue(val === undefined ? "" : val);
      }
    );
    watch(
      () => props.options,
      options => {
        if (options) {
          ace.value?.setOptions(options);
        }
      },
      { deep: true }
    );

    onMounted(() => {
      ace.value = aceEdit(editor.value as HTMLElement, {
        value: props.content,
        minLines: 10,
        ...props.options
      });
      ace.value.on("change", () => {
        value.value = ace.value?.getValue();
        ctx.emit("update:content", value.value);
      });
      for (const event of ACE_EVENT) {
        // @ts-ignore
        ace.value.on(event, (...args) => {
          ctx.emit(event.replace(/([A-Z])/g, "-$1").toLowerCase(), ...args);
        });
      }
      ctx.emit("ready", ace.value);
      ctx.emit("update:ace", ace.value);
    });

    return { editor };
  }
});
</script>

<style lang="scss">
.ace-editor,
.ace_editor {
  min-height: 300px;
}
</style>
