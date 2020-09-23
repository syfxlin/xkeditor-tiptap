<template>
  <code-mirror-vue
    :content.sync="code"
    :options.sync="options"
    :cm.sync="cm"
    @blur="blur"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue-demi";
import {
  EditorView,
  exitCode,
  Node as ProsemirrorNode,
  redo,
  Selection,
  undo
} from "@/utils/prosemirror";
import CodeMirrorVue from "@/components/CodeMirror.vue";
import "codemirror/mode/javascript/javascript";
import CodeMirror, { Editor } from "codemirror";
import { Editor as TipTapEditor } from "tiptap";
import { cmRef, dirFocus, isCm } from "@/utils/codemirror";

export default defineComponent({
  name: "code-mirror-component",
  components: {
    CodeMirrorVue
  },
  props: {
    node: ProsemirrorNode,
    view: Object,
    getPos: Function,
    updateAttrs: Function,
    editor: TipTapEditor,
    contentRef: HTMLElement
  },
  setup(props, ctx) {
    const maybeEscape = (unit: string, dir: 1 | -1) => {
      const view = props.view as EditorView;
      const codemirror = cm.value as Editor;
      const pos = codemirror.getCursor();
      if (
        codemirror.somethingSelected() ||
        pos.line !=
          (dir < 0 ? codemirror.firstLine() : codemirror.lastLine()) ||
        (unit == "char" &&
          pos.ch != (dir < 0 ? 0 : codemirror.getLine(pos.line).length))
      ) {
        return CodeMirror.Pass;
      }
      const targetPos =
        (props.getPos ? props.getPos() : 0) +
        (dir < 0 ? 0 : props.node?.nodeSize);
      const selection = Selection.near(view.state.doc.resolve(targetPos), dir);
      if (isCm(selection)) {
        dirFocus(cmRef(selection), dir);
      } else {
        view.dispatch(view.state.tr.setSelection(selection).scrollIntoView());
        view.focus();
      }
    };

    const maybeDelete = () => {
      const view = props.view as EditorView;
      if (code.value === "") {
        view.dispatch(
          view.state.tr.delete(
            view.state.selection.from - 1,
            view.state.selection.to + 1
          )
        );
        view.focus();
      }
      return CodeMirror.Pass;
    };

    const codeMirrorKeymap = () => {
      const view = props.view as EditorView;
      const mod = /Mac/.test(navigator.platform) ? "Cmd" : "Ctrl";
      return CodeMirror.normalizeKeyMap({
        Up: () => maybeEscape("line", -1),
        Left: () => maybeEscape("char", -1),
        Down: () => maybeEscape("line", 1),
        Right: () => maybeEscape("char", 1),
        [`${mod}-Z`]: () => undo(view.state, view.dispatch),
        [`Shift-${mod}-Z`]: () => redo(view.state, view.dispatch),
        [`${mod}-Y`]: () => redo(view.state, view.dispatch),
        [`${mod}-Enter`]: () => {
          if (exitCode(view.state, view.dispatch)) view.focus();
        },
        Backspace: maybeDelete,
        Delete: maybeDelete
      });
    };

    const code = computed({
      get: () => props.node?.textContent,
      set: v => {
        if (props.contentRef !== undefined) {
          props.contentRef.textContent = v === undefined ? "" : v;
        }
      }
    });
    const options = ref({
      lineNumbers: true,
      extraKeys: codeMirrorKeymap()
    });
    const cm = ref<Editor>();

    // 将 editor 实例变量设置到 tiptap node 实例中
    watch(cm, () => {
      if (props.updateAttrs) {
        props.updateAttrs({
          cmRef: cm.value
        });
      }
    });

    const blur = () => {
      ctx.emit("blur", cm.value);
    };

    return { options, cm, code, blur };
  }
});
</script>

<style lang="scss">
.CodeMirror {
  height: 100%;
  min-height: 100px;
}
</style>
