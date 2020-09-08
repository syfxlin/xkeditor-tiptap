<template>
  <div class="codemirror" ref="editor" contenteditable="false"></div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, watch } from "vue-demi";
import CodeMirror, { Editor } from "codemirror";
import "codemirror/lib/codemirror.css";

const CM_EVENTS = [
  "changes",
  "beforeChange",
  "cursorActivity",
  "keyHandled",
  "inputRead",
  "electricInput",
  "beforeSelectionChange",
  "viewportChange",
  "swapDoc",
  "gutterClick",
  "gutterContextMenu",
  "focus",
  "blur",
  "scroll",
  "refresh",
  "optionChange",
  "scrollCursorIntoView",
  "update",
  "renderLine",
  "mousedown",
  "dblclick",
  "touchstart",
  "contextmenu",
  "keydown",
  "keypress",
  "keyup",
  "cut",
  "copy",
  "paste",
  "dragstart",
  "dragenter",
  "dragover",
  "dragleave",
  "drop",
  "change",
  "beforeChange",
  "cursorActivity",
  "beforeSelectionChange",
  "delete",
  "change",
  "beforeCursorEnter",
  "clear",
  "hide",
  "unhide",
  "redraw"
];

export default defineComponent({
  name: "node_code_mirror",
  props: {
    content: String,
    options: Object,
    cm: Object
  },
  setup(props, ctx) {
    const editor = ref<HTMLElement>();
    const codemirror = ref<Editor>();
    const value = ref(props.content);
    const refresh = () => {
      nextTick(() => {
        codemirror.value?.refresh();
      });
    };

    watch(
      () => props.content,
      val => {
        if (value.value === val) return;
        codemirror.value?.setValue(val === undefined ? "" : val);
        refresh();
      }
    );
    watch(
      () => props.options,
      val => {
        for (const key in val) {
          // @ts-ignore
          codemirror.value?.setOption(key, props.options[key]);
        }
        refresh();
      },
      { deep: true }
    );

    onMounted(() => {
      // @ts-ignore
      codemirror.value = new CodeMirror(editor.value as HTMLElement, {
        value: props.content,
        ...props.options
      });
      codemirror.value?.on("change", cm => {
        value.value = cm.getValue();
        ctx.emit("update:content", value.value);
      });
      CM_EVENTS.forEach(eventName => {
        codemirror.value?.on(eventName, (...args) => {
          ctx.emit(eventName.replace(/([A-Z])/g, "-$1").toLowerCase(), ...args);
        });
      });

      refresh();

      ctx.emit("ready", codemirror.value);
      ctx.emit("update:cm", codemirror.value);
    });

    return { editor };
  }
});
</script>
