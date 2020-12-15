<template>
  <ace-vue
    :value="code"
    @update:value="updateContent"
    :options.sync="options"
    :ace.sync="ace"
    @blur="blur"
  />
</template>

<script lang="ts">
import AceVue from "@/components/Ace.vue";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { Editor as TipTapEditor } from "tiptap";
import { defineComponent, ref, watch } from "vue-demi";
import { Ace } from "ace-builds";
import { EditorView, Selection, undo } from "@/utils/prosemirror";
import { aceRef, dirFocus, isAce } from "@/utils/ace";
import { redo } from "prosemirror-history";
import { convertToAce } from "@/utils/languages";
import Editor = Ace.Editor;
import CommandManager = Ace.CommandManager;

export default defineComponent({
  name: "ace-component",
  components: {
    AceVue
  },
  props: {
    code: String,
    node: ProsemirrorNode,
    view: Object,
    getPos: Function,
    updateAttrs: Function,
    editor: TipTapEditor
  },
  setup(props, ctx) {
    const maybeEscape = (unit: string, dir: 1 | -1) => {
      const view = props.view as EditorView;
      const editor = ace.value as Editor;
      const pos = editor.getCursorPosition();
      if (
        !editor.selection.isEmpty() ||
        pos.row != (dir < 0 ? 0 : editor.session.getLength() - 1) ||
        (unit == "col" &&
          pos.column != (dir < 0 ? 0 : editor.session.getLine(pos.row).length))
      ) {
        editor.commands.exec(
          unit === "row"
            ? dir === -1
              ? "golineup"
              : "golinedown"
            : dir === -1
            ? "gotoleft"
            : "gotoright",
          editor,
          undefined
        );
        return;
      }
      const targetPos =
        (props.getPos ? props.getPos() : 0) +
        (dir < 0 ? 0 : props.node?.nodeSize);
      const selection = Selection.near(view.state.doc.resolve(targetPos), dir);
      if (isAce(selection)) {
        dirFocus(aceRef(selection), dir);
      } else {
        view.dispatch(view.state.tr.setSelection(selection).scrollIntoView());
        view.focus();
      }
    };
    const maybeDelete = (command: "backspace" | "del") => {
      const view = props.view as EditorView;
      const editor = ace.value as Editor;
      if (props.code === "") {
        view.dispatch(
          view.state.tr.delete(
            view.state.selection.from - 1,
            view.state.selection.to + 1
          )
        );
        view.focus();
        return;
      }
      editor.commands.exec(command, editor, undefined);
    };

    const options = ref({
      fontSize: "17px",
      theme: "ace/theme/solarized_light",
      mode: `ace/mode/${convertToAce(props.node?.attrs.language)}`,
      tabSize: 4,
      wrap: true
    });
    const ace = ref<Editor>();

    watch(
      () => props.node?.attrs.language,
      v => {
        if (ace.value) {
          ace.value?.setOption("mode", `ace/mode/${convertToAce(v)}`);
        }
      }
    );

    // 将 editor 实例变量设置到 tiptap node 实例中
    watch(ace, () => {
      if (props.updateAttrs) {
        props.updateAttrs({
          aceRef: ace.value
        });
      }
      const manager = ace.value?.commands as CommandManager;
      const view = props.view as EditorView;
      manager.addCommand({
        name: "overwrite-up",
        bindKey: {
          win: "Up",
          mac: "Up"
        },
        exec: () => maybeEscape("row", -1)
      });
      manager.addCommand({
        name: "overwrite-down",
        bindKey: {
          win: "Down",
          mac: "Down"
        },
        exec: () => maybeEscape("row", 1)
      });
      manager.addCommand({
        name: "overwrite-left",
        bindKey: {
          win: "Left",
          mac: "Left"
        },
        exec: () => maybeEscape("col", -1)
      });
      manager.addCommand({
        name: "overwrite-right",
        bindKey: {
          win: "Right",
          mac: "Right"
        },
        exec: () => maybeEscape("col", 1)
      });
      manager.addCommand({
        name: "overwrite-undo",
        bindKey: {
          win: "Ctrl-Z",
          mac: "Command-Z"
        },
        exec: () => undo(view.state, view.dispatch)
      });
      manager.addCommand({
        name: "overwrite-undo",
        bindKey: {
          win: "Ctrl-Y",
          mac: "Command-Y"
        },
        exec: () => redo(view.state, view.dispatch)
      });
      manager.addCommand({
        name: "overwrite-backspace",
        bindKey: {
          win: "Backspace",
          mac: "Backspace"
        },
        exec: () => maybeDelete("backspace")
      });
      manager.addCommand({
        name: "overwrite-delete",
        bindKey: {
          win: "Delete",
          mac: "Delete"
        },
        exec: () => maybeDelete("del")
      });
    });

    const blur = () => {
      ctx.emit("blur", ace.value);
    };

    const updateContent = (v: string) => {
      ctx.emit("update:code", v);
    };

    return { options, ace, blur, updateContent };
  }
});
</script>
