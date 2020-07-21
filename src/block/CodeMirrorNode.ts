import { Command } from "prosemirror-commands";
import { NodeSpec } from "prosemirror-model";
import { Selection } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { Node } from "tiptap";
import CodeMirrorComponent from "@/block/CodeMirrorComponent.vue";

function computeChange(oldVal: string, newVal: string) {
  if (oldVal == newVal) return null;
  let start = 0,
    oldEnd = oldVal.length,
    newEnd = newVal.length;
  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start))
    ++start;
  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--;
    newEnd--;
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}

function arrowHandler(dir: "left" | "right" | "down" | "up"): Command {
  return (state, dispatch, view) => {
    if (state.selection.empty && view?.endOfTextblock(dir)) {
      const side = dir == "left" || dir == "up" ? -1 : 1,
        $head = state.selection.$head;
      const nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      );
      if (nextPos.$head && nextPos.$head.parent.type.name == "code_block") {
        dispatch?.(state.tr.setSelection(nextPos));
        return true;
      }
    }
    return false;
  };
}

const arrowHandlers = keymap({
  ArrowLeft: arrowHandler("left"),
  ArrowRight: arrowHandler("right"),
  ArrowUp: arrowHandler("up"),
  ArrowDown: arrowHandler("down")
});

export default class CodeMirrorNode extends Node {
  get name() {
    return "code_mirror";
  }

  get schema(): NodeSpec {
    return {
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      isolating: true,
      attrs: {
        content: {
          default: ""
        }
      },
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          getAttrs: dom => ({
            content: (dom as HTMLElement).textContent
          })
        }
      ],
      toDOM(node) {
        return ["pre", node.attrs.content];
      }
    };
  }

  // get view() {
  //   return defineComponent({
  //     props: {
  //       node: ProsemirrorNode,
  //       view: {},
  //       getPos: {}
  //     },
  //     setup(props) {
  //       const view = props.view as EditorView;
  //       const maybeEscape = (unit: string, dir: number) => {
  //         if (props.view === undefined || cm.value === undefined) {
  //           return;
  //         }
  //         const pos = cm.value.getCursor();
  //         if (
  //           cm.value.somethingSelected() ||
  //           pos.line !=
  //             (dir < 0 ? cm.value.firstLine() : cm.value.lastLine()) ||
  //           (unit == "char" &&
  //             pos.ch != (dir < 0 ? 0 : cm.value.getLine(pos.line).length))
  //         )
  //           return CodeMirror.Pass;
  //         view.focus();
  //         const targetPos =
  //           // @ts-ignore
  //           props.getPos() + (dir < 0 ? 0 : props.node?.nodeSize);
  //         const selection = Selection.near(
  //           view.state.doc.resolve(targetPos),
  //           dir
  //         );
  //         view.dispatch(view.state.tr.setSelection(selection).scrollIntoView());
  //         view.focus();
  //       };
  //       const codeMirrorKeymap = () => {
  //         const mod = /Mac/.test(navigator.platform) ? "Cmd" : "Ctrl";
  //         return CodeMirror.normalizeKeyMap({
  //           Up: () => maybeEscape("line", -1),
  //           Left: () => maybeEscape("char", -1),
  //           Down: () => maybeEscape("line", 1),
  //           Right: () => maybeEscape("char", 1),
  //           [`${mod}-Z`]: () => undo(view.state, view.dispatch),
  //           [`Shift-${mod}-Z`]: () => redo(view.state, view.dispatch),
  //           [`${mod}-Y`]: () => redo(view.state, view.dispatch),
  //           "Ctrl-Enter": () => {
  //             if (exitCode(view.state, view.dispatch)) view.focus();
  //           }
  //         });
  //       };
  //       const forwardSelection = () => {
  //         if (
  //           cm.value === undefined ||
  //           !cm.value.hasFocus() ||
  //           view === undefined
  //         )
  //           return;
  //         const state = view.state;
  //         const selection = asProseMirrorSelection(state.doc);
  //         if (!selection.eq(state?.selection))
  //           view.dispatch(state.tr.setSelection(selection));
  //       };
  //       const asProseMirrorSelection = (doc: ProsemirrorNode) => {
  //         // @ts-ignore
  //         const offset = props.getPos() + 1;
  //         const anchor =
  //           cm.value?.indexFromPos(cm.value.getCursor("anchor")) + offset;
  //         const head =
  //           cm.value?.indexFromPos(cm.value.getCursor("head")) + offset;
  //         return TextSelection.create(doc, anchor, head);
  //       };
  //       const valueChanged = () => {
  //         if (
  //           props.node === undefined ||
  //           view === undefined ||
  //           cm.value === undefined
  //         )
  //           return;
  //         const change = computeChange(
  //           props.node.textContent,
  //           cm.value.getValue()
  //         );
  //         if (change) {
  //           // @ts-ignore
  //           const start = props.getPos() + 1;
  //           const tr = view.state.tr.replaceWith(
  //             start + change.from,
  //             start + change.to,
  //             // TODO: change
  //             // change.text ? schema.text(change.text) : null
  //             // @ts-ignore
  //             null
  //           );
  //           view.dispatch(tr);
  //         }
  //       };
  //
  //       const incomingChanges = ref(true);
  //       const options: EditorConfiguration = {
  //         value: props.node?.textContent,
  //         lineNumbers: true,
  //         extraKeys: codeMirrorKeymap()
  //       };
  //       // @ts-ignore
  //       const cm = ref<Editor>();
  //       const dom = ref<HTMLElement>();
  //       const updating = ref(false);
  //
  //       onMounted(() => {
  //         // @ts-ignore
  //         cm.value = new CodeMirror(dom.value, options);
  //         if (cm.value === undefined) return;
  //         setTimeout(() => cm.value?.refresh(), 20);
  //         cm.value.on("beforeChange", () => (incomingChanges.value = true));
  //         // Propagate updates from the code editor to ProseMirror
  //         cm.value.on("cursorActivity", () => {
  //           if (!updating.value && !incomingChanges.value) forwardSelection();
  //         });
  //         cm.value.on("changes", () => {
  //           if (!updating.value) {
  //             valueChanged();
  //             forwardSelection();
  //           }
  //           incomingChanges.value = false;
  //         });
  //         cm.value.on("focus", () => forwardSelection());
  //       });
  //
  //       return { dom };
  //     },
  //     template: `<div ref="dom"></div>`
  //   });
  // }

  get view() {
    return CodeMirrorComponent;
  }
}
