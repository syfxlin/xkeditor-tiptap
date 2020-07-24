<template>
  <div>
    <code-mirror-vue
      :content.sync="con"
      :options.sync="options"
      :cm.sync="cm"
      @ready="ready"
    />
    <textarea ref="content" hidden></textarea>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue-demi";
import { Node as ProsemirrorNode } from "prosemirror-model";
import CodeMirrorVue from "@/components/CodeMirror.vue";
import "codemirror/mode/javascript/javascript";
import CodeMirror, { Editor } from "codemirror";
import { EditorView } from "prosemirror-view";
import { Selection } from "prosemirror-state";
import { redo, undo } from "prosemirror-history";
import { exitCode } from "prosemirror-commands";
import { cmRef } from "@/block/CodeMirrorNode";
import { Editor as TipTapEditor } from "tiptap";

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
    editor: TipTapEditor
  },
  setup(props) {
    const maybeEscape = (unit: string, dir: number) => {
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
      view.focus();
      const targetPos =
        (props.getPos ? props.getPos() : 0) +
        (dir < 0 ? 0 : props.node?.nodeSize);
      const selection = Selection.near(view.state.doc.resolve(targetPos), dir);
      view.dispatch(view.state.tr.setSelection(selection).scrollIntoView());
      view.focus();
    };

    const maybeDelete = () => {
      const view = props.view as EditorView;
      if (content.value === "") {
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

    const content = computed({
      get: () => props.node?.textContent,
      set: v => {
        if (contentRef.value !== undefined) {
          contentRef.value.textContent = v === undefined ? "" : v;
        }
      }
    });
    const options = ref({
      lineNumbers: true,
      extraKeys: codeMirrorKeymap()
    });
    const cm = ref<Editor>();
    const contentRef = ref<HTMLTextAreaElement>();

    // 将 editor 实例变量设置到 tiptap node 实例中
    const ready = (c: Editor) => {
      cmRef.value = c;
    };

    return { options, cm, con: content, content: contentRef, ready };
  }
});
</script>
